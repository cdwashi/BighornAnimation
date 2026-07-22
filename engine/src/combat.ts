import type { Scenario, WeaponSpec } from '../../src/schema/scenario-schema.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import type { EngineTerrain } from './pathfind.js';
import { nextRandom } from './rng.js';
import type { EngagementDescriptor, Formation, SimState, UnitRuntime } from './state.js';

interface ProjectedCombatCover {
  factor: number;
  ring: Array<{ x: number; y: number }>;
}

export interface CombatRuntime {
  config: CombatConfig;
  projectedCover: ProjectedCombatCover[];
}

export function createCombatRuntime(
  scenario: Scenario,
  terrain: EngineTerrain,
  config: CombatConfig,
): CombatRuntime {
  return {
    config,
    projectedCover: scenario.terrain.cover.map((cover) => ({
      factor: cover.coverFactor,
      ring: cover.area.ring.map((point) => {
        const [x, y] = terrain.toLocal(point.lat, point.lon);
        return { x, y };
      }),
    })),
  };
}

interface FireResult {
  attacker: UnitRuntime;
  targetId: string;
  casualties: number;
  expectedHits: number;
  rounds: number;
  flanked: boolean;
  position: { x: number; y: number };
}

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

function draw(state: SimState, userSeed: number): number {
  const [value, next] = nextRandom(state.rng, userSeed);
  state.rng = next;
  return value;
}

function stochasticInteger(state: SimState, expectation: number, userSeed: number): number {
  const whole = Math.floor(Math.max(0, expectation));
  const remainder = Math.max(0, expectation) - whole;
  return whole + (draw(state, userSeed) < remainder ? 1 : 0);
}

export function splitCasualties(
  state: SimState,
  casualties: number,
  killedToWoundedRatio: number,
  userSeed: number,
): { killed: number; wounded: number } {
  if (!Number.isInteger(casualties) || casualties < 0 || !(killedToWoundedRatio >= 0)) {
    throw new RangeError('Casualty split requires integer casualties and a non-negative ratio');
  }
  const killedExpectation = casualties * killedToWoundedRatio / (killedToWoundedRatio + 1);
  // D26/D81: floor plus exactly one seeded roll on the fractional remainder.
  const killed = Math.min(casualties, stochasticInteger(state, killedExpectation, userSeed));
  return { killed, wounded: casualties - killed };
}

function exposure(formation: Formation, config: CombatConfig): number {
  switch (formation) {
    case 'COLUMN': return config.exposureColumn;
    case 'LINE': return config.exposureLine;
    case 'SKIRMISH': return config.exposureSkirmish;
    case 'DISPERSED': return config.exposureDispersed;
    case 'CAMP': return 0;
  }
}

function rangeProbability(weapon: WeaponSpec, range: number): number {
  return weapon.rangeBands.find((item) => range <= item.maxRangeMeters)?.hitProbability ?? 0;
}

function pointInRing(point: { x: number; y: number }, ring: Array<{ x: number; y: number }>): boolean {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const a = ring[index];
    const b = ring[previous];
    if ((a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}

function coverFactorAt(projectedCover: readonly ProjectedCombatCover[], position: { x: number; y: number }): number {
  let result = 1;
  for (const cover of projectedCover) {
    if (pointInRing(position, cover.ring)) result = cover.factor;
  }
  return result;
}

function bestLeaderSkill(scenario: Scenario, state: SimState, unit: UnitRuntime): number {
  const skills = scenario.leaders.filter((leader) =>
    leader.attachedToUnitId === unit.id && state.leaders.find((item) => item.id === leader.id)?.alive)
    .map((leader) => leader.ratings.tacticalSkill);
  return skills.length > 0 ? Math.max(...skills) : 50;
}

function ammoFraction(unit: UnitRuntime): number {
  const initial = Object.values(unit.initialAmmunition).reduce((sum, value) => sum + value, 0);
  const current = Object.values(unit.ammunition).reduce((sum, value) => sum + value, 0);
  return initial > 0 ? current / initial : 0;
}

function discipline(unit: UnitRuntime, config: CombatConfig): number {
  let result = unit.moraleState === 'STEADY' ? 1 :
    unit.moraleState === 'SHAKEN' ? config.shakenDiscipline : config.brokenDiscipline;
  if (ammoFraction(unit) < config.lowAmmoFraction) result *= config.lowAmmoDiscipline;
  return result;
}

function isFlanking(attacker: UnitRuntime, target: UnitRuntime, config: CombatConfig): boolean {
  const bearing = Math.atan2(attacker.position.y - target.position.y, attacker.position.x - target.position.x);
  const delta = Math.abs(Math.atan2(
    Math.sin(bearing - target.facingRadians),
    Math.cos(bearing - target.facingRadians),
  ));
  return delta > config.flankingAngleRadians;
}

function clearJams(state: SimState, unit: UnitRuntime, events: SimEvent[]): void {
  for (const [weaponId, clearTicks] of Object.entries(unit.jammedWeapons)) {
    const cleared = clearTicks.filter((tick) => tick <= state.tick).length;
    if (cleared > 0) appendEvent(state, events, {
      tick: state.tick, type: 'weapon-cleared', unitId: unit.id, weaponId, rounds: cleared,
    });
    unit.jammedWeapons[weaponId] = clearTicks.filter((tick) => tick > state.tick);
  }
}

function resolveFire(
  scenario: Scenario,
  state: SimState,
  attacker: UnitRuntime,
  target: UnitRuntime,
  range: number,
  config: CombatConfig,
  userSeed: number,
  events: SimEvent[],
  allocationFactor: number,
  projectedCover: readonly ProjectedCombatCover[],
): FireResult {
  let expectedHits = 0;
  let totalRounds = 0;
  const source = scenario.units[attacker.unitIndex];
  const targetSource = scenario.units[target.unitIndex];
  const profile = scenario.tacticsProfiles[source.tacticsProfileId];
  const targetCover = Math.max(config.coverFloor, coverFactorAt(projectedCover, target.position));
  const flanked = isFlanking(attacker, target, config);
  for (const [weaponId, mix] of Object.entries(source.weaponMix)) {
    const weapon = scenario.weapons[weaponId];
    const availableAmmo = attacker.ammunition[weaponId] ?? 0;
    if (!weapon || availableAmmo <= 0) continue;
    let hitProbability = rangeProbability(weapon, range);
    if (hitProbability <= 0) continue;
    const jammed = attacker.jammedWeapons[weaponId]?.length ?? 0;
    const shootersEffective = Math.max(0, (attacker.strengthAvailable * mix - jammed) * allocationFactor);
    if (shootersEffective <= 0) continue;
    const plannedRounds = Math.floor(
      shootersEffective * weapon.effectiveRoundsPerMinute.best * scenario.clock.tickSeconds / 60,
    );
    const rounds = Math.min(availableAmmo, plannedRounds);
    if (rounds <= 0) continue;
    attacker.ammunition[weaponId] = availableAmmo - rounds;
    totalRounds += rounds;
    const malfunctionExpectation = rounds * weapon.malfunctionPer100Rounds.best / 100;
    const malfunctions = Math.min(
      Math.floor(shootersEffective),
      stochasticInteger(state, malfunctionExpectation, userSeed),
    );
    if (malfunctions > 0) {
      const clearTicks = attacker.jammedWeapons[weaponId] ?? (attacker.jammedWeapons[weaponId] = []);
      for (let index = 0; index < malfunctions; index += 1) clearTicks.push(state.tick + config.clearJamTicks);
      appendEvent(state, events, {
        tick: state.tick, type: 'weapon-malfunction', unitId: attacker.id,
        weaponId, rounds: malfunctions,
      });
    }
    let coverFactor = targetCover;
    if (weapon.indirectCapable && coverFactor < 1) {
      coverFactor = 1;
      hitProbability *= config.bowIndirectHitProbabilityMultiplier;
    }
    const formationExposure = targetSource.kind === 'PACK_TRAIN'
      ? config.exposurePackTrain
      : exposure(target.formation, config);
    const tacticsModifier = config.tacticsBase + profile.weights.standoffFire / config.tacticsWeightScale;
    const fatigueModifier = 1 - config.fatigueCombatPenaltyMaximum * attacker.fatigue / 100;
    // D64 formula, term-for-term. rounds/shooters is rpm*tickFraction after ammo capping.
    expectedHits += shootersEffective * (rounds / Math.max(1, shootersEffective)) * hitProbability *
      formationExposure * coverFactor * (flanked ? config.flankingMultiplier : 1) *
      tacticsModifier * (bestLeaderSkill(scenario, state, attacker) / 50) *
      discipline(attacker, config) * fatigueModifier * config.combatFrictionFactor;
  }
  const casualties = stochasticInteger(state, expectedHits, userSeed);
  return {
    attacker,
    targetId: target.id,
    casualties,
    expectedHits,
    rounds: totalRounds,
    flanked,
    position: { ...target.position },
  };
}

function resolveCourierFire(
  scenario: Scenario,
  state: SimState,
  attacker: UnitRuntime,
  targetId: string,
  range: number,
  config: CombatConfig,
  userSeed: number,
): FireResult {
  const source = scenario.units[attacker.unitIndex];
  let expectation = 0;
  let roundsTotal = 0;
  for (const [weaponId, mix] of Object.entries(source.weaponMix)) {
    const weapon = scenario.weapons[weaponId];
    const probability = weapon ? rangeProbability(weapon, range) : 0;
    const ammo = attacker.ammunition[weaponId] ?? 0;
    if (!weapon || probability <= 0 || ammo <= 0) continue;
    const rounds = Math.min(ammo, Math.floor(attacker.strengthAvailable * mix *
      weapon.effectiveRoundsPerMinute.best * scenario.clock.tickSeconds / 60));
    attacker.ammunition[weaponId] -= rounds;
    roundsTotal += rounds;
    expectation += rounds * probability * config.courierTargetExposure;
  }
  const courier = state.couriers.find((item) => item.id === targetId);
  return {
    attacker, targetId, casualties: Math.min(1, stochasticInteger(state, expectation, userSeed)),
    expectedHits: expectation, rounds: roundsTotal, flanked: false,
    position: courier ? { ...courier.position } : { x: 0, y: 0 },
  };
}

function applyResult(
  scenario: Scenario,
  state: SimState,
  result: FireResult,
  config: CombatConfig,
  userSeed: number,
  events: SimEvent[],
): void {
  if (result.rounds <= 0) return;
  const target = state.units.find((unit) => unit.id === result.targetId);
  if (target) {
    target.suppression += result.rounds;
    target.flankedThisTick ||= result.flanked;
    const losses = Math.min(target.strengthCurrent, result.casualties);
    if (losses <= 0) return;
    const sideId = scenario.units[target.unitIndex].sideId;
    const ratio = config.killedToWoundedRatioBySide[sideId];
    if (!(ratio >= 0)) throw new Error(`Missing killed:wounded ratio for side ${sideId}`);
    const { killed, wounded } = splitCasualties(state, losses, ratio, userSeed);
    target.strengthCurrent -= losses;
    target.killed += killed;
    target.wounded += wounded;
    target.casualties += losses;
    target.casualtiesThisTick += losses;
    const holderFraction = target.strengthCurrent > 0 && !target.mounted
      ? target.horseHolderStrength / Math.max(1, target.strengthCurrent + losses)
      : 0;
    target.horseHolderStrength = Math.floor(target.strengthCurrent * holderFraction);
    target.strengthAvailable = target.strengthCurrent - target.horseHolderStrength;
    appendEvent(state, events, {
      tick: state.tick, type: 'casualty-resolution', unitId: result.attacker.id,
      targetUnitId: target.id, casualties: losses, killed, wounded, position: result.position,
    });
    return;
  }
  const courier = state.couriers.find((item) => item.id === result.targetId);
  if (courier && result.casualties > 0) {
    courier.alive = false;
    courier.active = false;
    appendEvent(state, events, {
      tick: state.tick, type: 'courier-killed', unitId: result.attacker.id,
      targetUnitId: courier.id, courierId: courier.id, casualties: 1, position: result.position,
    });
  }
}

function fireDirections(
  unitsById: ReadonlyMap<string, UnitRuntime>,
  engagement: EngagementDescriptor,
): Array<[UnitRuntime, string]> {
  const left = unitsById.get(engagement.unitIds[0]);
  const right = unitsById.get(engagement.unitIds[1]);
  const result: Array<[UnitRuntime, string]> = [];
  if (left && left.endState !== 'DESTROYED' && left.moraleState !== 'ROUTED') result.push([left, engagement.unitIds[1]]);
  if (right && right.endState !== 'DESTROYED' && right.moraleState !== 'ROUTED') result.push([right, engagement.unitIds[0]]);
  return result;
}

function resolveShock(
  scenario: Scenario,
  state: SimState,
  engagement: EngagementDescriptor,
  config: CombatConfig,
  unitsById: ReadonlyMap<string, UnitRuntime>,
): void {
  if (engagement.state !== 'MELEE') return;
  const units = engagement.unitIds.map((id) => unitsById.get(id));
  const attacker = units.find((unit) => unit?.posture === 'CHARGE');
  const defender = units.find((unit) => unit && unit !== attacker);
  if (!attacker || !defender) return;
  const source = scenario.units[attacker.unitIndex];
  const profile = scenario.tacticsProfiles[source.tacticsProfileId];
  const leader = scenario.leaders.filter((item) => item.attachedToUnitId === attacker.id &&
    state.leaders.find((runtime) => runtime.id === item.id)?.alive)
    .sort((left, right) => right.ratings.aggression - left.ratings.aggression)[0];
  const shock = attacker.strengthAvailable * config.chargeShockStrengthScale *
    config.chargeSpeedBonus * (leader?.ratings.aggression ?? 50) / 50 *
    profile.weights.shockCharge / 50;
  const defense = defender.strengthAvailable * Math.max(0.1, defender.morale / 100);
  if (shock > defense * config.chargeBreakMargin) {
    defender.morale = Math.min(defender.morale, config.moraleBrokenThreshold - 1);
    defender.moraleState = 'ROUTED';
    engagement.state = 'ROUT';
  } else if (shock < defense * config.chargeRepelMargin) {
    attacker.posture = 'WITHDRAW';
    engagement.state = 'WITHDRAWAL';
  } else {
    engagement.state = 'FIREFIGHT';
  }
}

/** D64 simultaneous fire resolution; casualty events preserve the fall position. */
export function resolveCombat(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  runtime: CombatRuntime,
  userSeed: number,
  events: SimEvent[],
): void {
  void terrain;
  const config = runtime.config;
  for (const unit of state.units) {
    unit.casualtiesThisTick = 0;
    unit.flankedThisTick = false;
    clearJams(state, unit, events);
  }
  const pending: FireResult[] = [];
  const unitsById = new Map(state.units.map((unit) => [unit.id, unit]));
  const directions = state.engagements.flatMap((engagement) =>
    !engagement.active || engagement.state === 'APPROACH' || engagement.state === 'ROUT'
      ? []
      : fireDirections(unitsById, engagement).map(([attacker, targetId]) => ({ engagement, attacker, targetId })));
  const directionsByEngagement = new Map<EngagementDescriptor, typeof directions>();
  const targetCounts = new Map<string, number>();
  for (const direction of directions) {
    targetCounts.set(direction.attacker.id, (targetCounts.get(direction.attacker.id) ?? 0) + 1);
    const group = directionsByEngagement.get(direction.engagement) ?? [];
    group.push(direction);
    directionsByEngagement.set(direction.engagement, group);
  }
  for (const engagement of state.engagements) {
    if (!engagement.active || engagement.state === 'APPROACH' || engagement.state === 'ROUT') continue;
    resolveShock(scenario, state, engagement, config, unitsById);
    let intensity = 0;
    for (const { attacker, targetId } of directionsByEngagement.get(engagement) ?? []) {
      const target = unitsById.get(targetId);
      const result = target
        ? resolveFire(
          scenario, state, attacker, target, engagement.rangeMeters, config,
          userSeed, events, 1 / (targetCounts.get(attacker.id) ?? 1), runtime.projectedCover,
        )
        : resolveCourierFire(scenario, state, attacker, targetId, engagement.rangeMeters, config, userSeed);
      pending.push(result);
      intensity += result.expectedHits;
    }
    engagement.intensity = Math.min(1, intensity / config.intensityExpectedHitsScale);
  }
  for (const result of pending) {
    applyResult(scenario, state, result, runtime.config, userSeed, events);
  }
}
