import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import { findPath, findStraightPath, type EngineTerrain } from './pathfind.js';
import type { PathCache } from './objectives.js';
import type { MoraleState, SimState, UnitRuntime } from './state.js';

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

function ammoFraction(unit: UnitRuntime): number {
  const initial = Object.values(unit.initialAmmunition).reduce((sum, value) => sum + value, 0);
  const current = Object.values(unit.ammunition).reduce((sum, value) => sum + value, 0);
  return initial > 0 ? current / initial : 1;
}

function nearbyFriendlies(scenario: Scenario, state: SimState, unit: UnitRuntime, radius: number): UnitRuntime[] {
  const sideId = scenario.units[unit.unitIndex].sideId;
  return state.units.filter((other) => other.id !== unit.id && other.endState !== 'DESTROYED' &&
    scenario.units[other.unitIndex].sideId === sideId && Math.hypot(
      other.position.x - unit.position.x,
      other.position.y - unit.position.y,
    ) <= radius);
}

function leaderRally(scenario: Scenario, state: SimState, unit: UnitRuntime, config: CombatConfig): number {
  let rally = 0;
  for (const leader of scenario.leaders) {
    if (!state.leaders.find((item) => item.id === leader.id)?.alive) continue;
    const attached = state.units.find((item) => item.id === leader.attachedToUnitId);
    if (!attached || scenario.units[attached.unitIndex].sideId !== scenario.units[unit.unitIndex].sideId) continue;
    if (Math.hypot(attached.position.x - unit.position.x, attached.position.y - unit.position.y) <=
      config.leaderInfluenceRadiusMeters) rally = Math.max(rally, leader.ratings.rally);
  }
  return rally * config.moraleLeaderRallyScale;
}

function moraleState(morale: number, config: CombatConfig): MoraleState {
  if (morale >= config.moraleSteadyThreshold) return 'STEADY';
  if (morale >= config.moraleShakenThreshold) return 'SHAKEN';
  if (morale >= config.moraleBrokenThreshold) return 'BROKEN';
  return 'ROUTED';
}

const SCOUT_WITHDRAWAL_EXCLUDED_IDS = new Set(['civilians-interpreters']);

/** D75: doctrine-scoped scouts leave by a real, exposed route to the field edge. */
export function startScoutWithdrawals(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  events: SimEvent[],
): void {
  for (const unit of state.units) {
    const source = scenario.units[unit.unitIndex];
    if (source.tacticsProfileId !== 'irregular-scout' ||
      SCOUT_WITHDRAWAL_EXCLUDED_IDS.has(unit.id) || unit.scoutWithdrawal ||
      unit.withdrawnOffField || unit.endState === 'DESTROYED') continue;
    const pressure = state.units.filter((enemy) =>
      scenario.units[enemy.unitIndex].kind === 'WARRIOR_BAND' &&
      scenario.units[enemy.unitIndex].sideId !== source.sideId &&
      (state.engagements.some((engagement) => engagement.active &&
        engagement.unitIds.includes(unit.id) && engagement.unitIds.includes(enemy.id)) ||
       enemy.pursuit?.targetUnitId === unit.id));
    if (pressure.length === 0) continue;
    const grid = terrain.gridForPath(unit.position, unit.position);
    const maxX = grid.minX + (grid.width - 1) * grid.resolutionMeters;
    const maxY = grid.minY + (grid.height - 1) * grid.resolutionMeters;
    const center = pressure.reduce((sum, enemy) => ({
      x: sum.x + enemy.position.x / pressure.length,
      y: sum.y + enemy.position.y / pressure.length,
    }), { x: 0, y: 0 });
    const away = { x: unit.position.x - center.x, y: unit.position.y - center.y };
    const candidates = [
      { x: grid.minX, y: Math.max(grid.minY, Math.min(maxY, unit.position.y)) },
      { x: maxX, y: Math.max(grid.minY, Math.min(maxY, unit.position.y)) },
      { x: Math.max(grid.minX, Math.min(maxX, unit.position.x)), y: grid.minY },
      { x: Math.max(grid.minX, Math.min(maxX, unit.position.x)), y: maxY },
    ].sort((left, right) => {
      const leftScore = (left.x - unit.position.x) * away.x + (left.y - unit.position.y) * away.y;
      const rightScore = (right.x - unit.position.x) * away.x + (right.y - unit.position.y) * away.y;
      return rightScore - leftScore || left.x - right.x || left.y - right.y;
    });
    for (const goal of candidates) {
      const result = findPath(terrain.gridForPath(unit.position, goal), unit.position, goal);
      if (result.status !== 'reachable') continue;
      unit.path = result.path;
      unit.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
      unit.pathProgressMeters = 0;
      unit.posture = 'WITHDRAW';
      unit.speedClass = unit.mounted ? 'CAVALRY_GALLOP' : 'ON_FOOT';
      unit.blockedReason = undefined;
      unit.scoutWithdrawal = true;
      appendEvent(state, events, { tick: state.tick, type: 'scout-withdrawal-started', unitId: unit.id });
      break;
    }
  }
}

function routeToSafety(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  config: CombatConfig,
): void {
  if (unit.routSafetyPath) return;
  const friends = nearbyFriendlies(scenario, state, unit, Number.POSITIVE_INFINITY)
    .filter((friend) => friend.moraleState === 'STEADY')
    .filter((friend) => !state.engagements.some((engagement) =>
      engagement.active && engagement.unitIds.includes(friend.id)))
    .sort((left, right) => {
      const leftDistance = Math.hypot(left.position.x - unit.position.x, left.position.y - unit.position.y);
      const rightDistance = Math.hypot(right.position.x - unit.position.x, right.position.y - unit.position.y);
      return leftDistance - rightDistance || right.strengthCurrent - left.strengthCurrent;
    });
  const sourceSide = scenario.units[unit.unitIndex].sideId;
  // D74 uses actual positions: interdiction represents physical denial of a
  // corridor, not what the routed unit or its command believes about one.
  const enemies = state.units.filter((enemy) => enemy.endState !== 'DESTROYED' &&
    !enemy.withdrawnOffField && enemy.moraleState !== 'ROUTED' &&
    scenario.units[enemy.unitIndex].sideId !== sourceSide &&
    scenario.units[enemy.unitIndex].kind !== 'NONCOMBATANT_CAMP');
  let path: ReturnType<typeof findPath> | undefined;
  for (const safety of friends) {
    const result = findPath(
      terrain.gridForPath(unit.position, safety.position), unit.position, safety.position,
      (point) => enemies.some((enemy) => Math.hypot(
        enemy.position.x - point.x, enemy.position.y - point.y,
      ) <= config.enemyInterdictionRadiusMeters),
    );
    if (result.status === 'reachable') { path = result; break; }
  }
  if (!path || path.status !== 'reachable') {
    unit.path = [];
    unit.pathIndex = 0;
    unit.blockedReason = 'no non-interdicted corridor to steady friendly mass';
    unit.routSafetyPath = true;
    return;
  }
  unit.path = path.path;
  unit.pathIndex = Math.min(1, Math.max(0, path.path.length - 1));
  unit.pathProgressMeters = 0;
  unit.posture = 'WITHDRAW';
  unit.speedClass = unit.mounted ? 'CAVALRY_GALLOP' : 'ON_FOOT';
  unit.blockedReason = undefined;
  unit.routSafetyPath = true;
}

/** D66 continuous morale, break shaping, rout pathing/rally, and mechanical destruction. */
export function updateMorale(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  config: CombatConfig,
  events: SimEvent[],
  pathCache?: PathCache,
): void {
  for (const unit of state.units) {
    if (scenario.units[unit.unitIndex].kind === 'NONCOMBATANT_CAMP' || unit.endState === 'DESTROYED') continue;
    const previous = unit.moraleState;
    const casualtyRate = unit.casualtiesThisTick / Math.max(1, unit.strengthCurrent + unit.casualtiesThisTick);
    let delta = -casualtyRate * config.moraleCasualtyDrain;
    if (unit.flankedThisTick) delta -= config.moraleFlankedDrain;
    if (nearbyFriendlies(scenario, state, unit, config.isolationRadiusMeters).length === 0) {
      delta -= config.moraleIsolationDrain;
    } else {
      delta += config.moraleFriendlyRecovery;
    }
    if (ammoFraction(unit) < config.lowAmmoFraction) delta -= config.moraleLowAmmoDrain;
    delta -= Math.min(1, unit.suppression / Math.max(1, unit.strengthCurrent * 10)) *
      config.moraleSuppressionDrain;
    if (unit.suppression === 0 && unit.casualtiesThisTick === 0) delta += config.moraleLullRecovery;
    if (previous !== 'ROUTED') delta += leaderRally(scenario, state, unit, config);
    unit.morale = Math.max(0, Math.min(100, unit.morale + delta));
    unit.suppression = 0;
    unit.moraleState = moraleState(unit.morale, config);
    const profile = scenario.tacticsProfiles[scenario.units[unit.unitIndex].tacticsProfileId];
    if (unit.moraleState === 'ROUTED' && profile.weights.withdrawalDiscipline >=
      config.withdrawalDisciplineThreshold && unit.morale > 0) {
      unit.moraleState = 'BROKEN';
      unit.posture = 'WITHDRAW';
    } else if (unit.moraleState === 'ROUTED') {
      unit.cohesion = Math.max(0, unit.cohesion - config.routCohesionDrain);
      routeToSafety(scenario, state, unit, terrain, config);
    }
    if (previous === 'ROUTED' && unit.morale >= config.routRallyMorale) {
      unit.moraleState = 'BROKEN';
      unit.posture = 'HOLD';
      unit.path = [];
      unit.pathIndex = 0;
      unit.routSafetyPath = false;
    }
    if (unit.moraleState !== previous) appendEvent(state, events, {
      tick: state.tick, type: 'morale-state', unitId: unit.id, moraleState: unit.moraleState,
    });
    if (unit.strengthCurrent <= config.destructionStrengthFloor ||
      unit.cohesion <= config.destructionCohesionFloor) {
      unit.endState = 'DESTROYED';
      // D81 terminal accounting: remaining effective troops become killed;
      // previously wounded troops remain wounded and are never relabeled dead.
      const terminalKilled = unit.strengthCurrent;
      unit.killed += terminalKilled;
      unit.strengthCurrent = 0;
      unit.strengthAvailable = 0;
      unit.horseHolderStrength = 0;
      unit.casualties = unit.strengthTotal;
      unit.path = [];
      unit.pathIndex = 0;
      appendEvent(state, events, {
        tick: state.tick, type: 'unit-destroyed', unitId: unit.id,
        killed: terminalKilled, position: { ...unit.position },
      });
    }
  }
  updatePursuitAndInitiative(scenario, state, terrain, config, events, pathCache);
}

function startPursuit(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  pursuer: UnitRuntime,
  targetId: string,
  kind: 'COMBAT' | 'INITIATIVE',
  events: SimEvent[],
  complexUnitIds?: readonly string[],
  pathCache?: PathCache,
): boolean {
  const targetUnit = state.units.find((item) => item.id === targetId);
  const targetCourier = state.couriers.find((item) =>
    item.id === targetId && item.active && item.alive);
  const target = targetUnit?.position ?? targetCourier?.position;
  if (!target) return false;
  const grid = terrain.gridForPath(pursuer.position, target);
  const cell = (point: { x: number; y: number }): string => `${
    Math.round((point.x - grid.minX) / grid.resolutionMeters)},${
    Math.round((point.y - grid.minY) / grid.resolutionMeters)}`;
  const key = `combat:${grid.id}:${cell(pursuer.position)}:${cell(target)}`;
  const cached = pathCache?.get(key);
  const cachedPath = cached?.map((point) => ({ ...point }));
  if (cachedPath) {
    cachedPath[0] = { ...cachedPath[0], ...pursuer.position };
    cachedPath[cachedPath.length - 1] = { ...cachedPath[cachedPath.length - 1], ...target };
  }
  const result = cachedPath
    ? { status: 'reachable' as const, path: cachedPath }
    : findStraightPath(grid, pursuer.position, target) ?? findPath(grid, pursuer.position, target);
  if (result.status !== 'reachable') return false;
  if (pathCache && !cached) pathCache.set(key, result.path.map((point) => ({ ...point })));
  const range = Math.hypot(target.x - pursuer.position.x, target.y - pursuer.position.y);
  pursuer.pursuit = {
    kind,
    targetUnitId: targetId,
    lastRepathTick: state.tick,
    lastTargetPosition: { ...target },
    contactEmitted: range <= 150,
    lastRangeMeters: range,
    losingTicks: 0,
    complexUnitIds: complexUnitIds ? [...complexUnitIds] : undefined,
  };
  pursuer.path = result.path;
  pursuer.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
  pursuer.blockedReason = undefined;
  pursuer.posture = 'ATTACK';
  appendEvent(state, events, {
    tick: state.tick,
    type: kind === 'COMBAT' ? 'pursuit-started' : 'initiative-retargeted',
    unitId: pursuer.id,
    targetUnitId: targetId,
  });
  return true;
}

function endPursuit(
  scenario: Scenario,
  state: SimState,
  pursuer: UnitRuntime,
  reason: string,
  events: SimEvent[],
): void {
  const targetId = pursuer.pursuit?.targetUnitId;
  const complexUnitIds = pursuer.pursuit?.complexUnitIds;
  const targetUnit = targetId ? state.units.find((unit) => unit.id === targetId) : undefined;
  if (targetUnit) targetUnit.pursuitTerminatedTick = state.tick;
  pursuer.pursuit = undefined;
  pursuer.path = [];
  pursuer.pathIndex = 0;
  pursuer.posture = 'HOLD';
  const side = scenario.sides.find((item) =>
    item.id === scenario.units[pursuer.unitIndex].sideId);
  pursuer.initiativeRetargetPending = side?.commandModel === 'CONSENSUS_INITIATIVE';
  pursuer.initiativeComplexUnitIds = complexUnitIds ? [...complexUnitIds] : undefined;
  appendEvent(state, events, {
    tick: state.tick, type: 'pursuit-ended', unitId: pursuer.id,
    targetUnitId: targetId, reason,
  });
}

function pursuerAccepts(scenario: Scenario, unit: UnitRuntime): boolean {
  if (unit.endState === 'DESTROYED' || unit.moraleState === 'BROKEN' ||
    unit.moraleState === 'ROUTED') return false;
  const profile = scenario.tacticsProfiles[scenario.units[unit.unitIndex].tacticsProfileId];
  return profile.weights.shockCharge >= profile.weights.standoffFire;
}

function steadyFriendlyMass(
  scenario: Scenario,
  state: SimState,
  target: UnitRuntime,
  config: CombatConfig,
): number {
  const sideId = scenario.units[target.unitIndex].sideId;
  return state.units.filter((unit) => unit.endState !== 'DESTROYED' &&
    (unit.moraleState === 'STEADY' || unit.moraleState === 'SHAKEN') &&
    scenario.units[unit.unitIndex].sideId === sideId && Math.hypot(
      unit.position.x - target.position.x,
      unit.position.y - target.position.y,
    ) <= config.friendlyRadiusMeters).reduce((sum, unit) => sum + unit.strengthCurrent, 0);
}

function engagementComplexMembers(
  state: SimState,
  seedId: string,
  config: CombatConfig,
): string[] {
  const adjacency = new Map<string, Set<string>>();
  for (const engagement of state.engagements) {
    if (!engagement.active && state.tick - engagement.updatedTick >
      config.engagementComplexAdjacencyTicks) continue;
    const [left, right] = engagement.unitIds;
    const leftEdges = adjacency.get(left) ?? new Set<string>();
    const rightEdges = adjacency.get(right) ?? new Set<string>();
    leftEdges.add(right);
    rightEdges.add(left);
    adjacency.set(left, leftEdges);
    adjacency.set(right, rightEdges);
  }
  const visited = new Set<string>();
  const queue = [seedId];
  while (queue.length > 0) {
    const current = queue.shift() as string;
    if (visited.has(current)) continue;
    visited.add(current);
    for (const neighbor of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) queue.push(neighbor);
    }
  }
  return [...visited].sort();
}

function reintegrateProtectedRouts(
  scenario: Scenario,
  state: SimState,
  config: CombatConfig,
  events: SimEvent[],
): void {
  for (const unit of state.units) {
    if (unit.moraleState !== 'ROUTED' || unit.pursuitTerminatedTick === undefined ||
      unit.endState === 'DESTROYED') continue;
    if (state.units.some((enemy) => enemy.pursuit?.kind === 'COMBAT' &&
      enemy.pursuit.targetUnitId === unit.id)) continue;
    const sideId = scenario.units[unit.unitIndex].sideId;
    const protector = state.units.find((friend) => friend.id !== unit.id &&
      friend.endState !== 'DESTROYED' && friend.moraleState === 'STEADY' &&
      scenario.units[friend.unitIndex].sideId === sideId && Math.hypot(
        friend.position.x - unit.position.x,
        friend.position.y - unit.position.y,
      ) <= config.friendlyRadiusMeters);
    if (!protector) continue;
    unit.moraleState = 'SHAKEN';
    unit.morale = Math.max(unit.morale, config.moraleShakenThreshold);
    unit.posture = 'HOLD';
    unit.path = [];
    unit.pathIndex = 0;
    unit.pursuitTerminatedTick = undefined;
    unit.routSafetyPath = false;
    appendEvent(state, events, {
      tick: state.tick, type: 'rout-reintegrated', unitId: unit.id,
      targetUnitId: protector.id,
    });
  }
}

function updatePursuitAndInitiative(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  config: CombatConfig,
  events: SimEvent[],
  pathCache?: PathCache,
): void {
  // D72(a): a break under live contact turns an eligible enemy into a pursuer.
  for (const engagement of state.engagements) {
    if (!engagement.active) continue;
    const [left, right] = engagement.unitIds.map((id) =>
      state.units.find((unit) => unit.id === id));
    if (!left || !right) continue;
    for (const [target, pursuer] of [[left, right], [right, left]] as const) {
      if (target.moraleState !== 'ROUTED' && target.moraleState !== 'BROKEN') continue;
      if (!pursuerAccepts(scenario, pursuer)) continue;
      if (pursuer.pursuit?.kind === 'COMBAT') continue;
      const complex = engagementComplexMembers(state, target.id, config);
      startPursuit(scenario, state, terrain, pursuer, target.id, 'COMBAT', events, complex, pathCache);
    }
  }

  for (const pursuer of state.units) {
    const pursuit = pursuer.pursuit;
    if (!pursuit) continue;
    const targetUnit = state.units.find((item) => item.id === pursuit.targetUnitId);
    const targetCourier = state.couriers.find((item) =>
      item.id === pursuit.targetUnitId && item.active && item.alive);
    const target = targetUnit?.position ?? targetCourier?.position;
    if (!target || targetUnit?.endState === 'DESTROYED') {
      endPursuit(scenario, state, pursuer, 'target-ended', events);
      continue;
    }
    if (pursuit.kind === 'COMBAT') {
      if (!pursuerAccepts(scenario, pursuer)) {
        endPursuit(scenario, state, pursuer, 'pursuer-morale', events);
        continue;
      }
      if (targetUnit &&
        steadyFriendlyMass(scenario, state, targetUnit, config) >= pursuer.strengthCurrent) {
        endPursuit(scenario, state, pursuer, 'steady-massed-fire', events);
        continue;
      }
      const range = Math.hypot(target.x - pursuer.position.x, target.y - pursuer.position.y);
      const previous = pursuit.lastRangeMeters ?? range;
      pursuit.losingTicks = range > previous + config.pursuitRangeLossToleranceMeters
        ? (pursuit.losingTicks ?? 0) + 1
        : 0;
      pursuit.lastRangeMeters = range;
      if ((pursuit.losingTicks ?? 0) >= config.pursuitBreakTicks) {
        endPursuit(scenario, state, pursuer, 'beyond-pursuit-reach', events);
        continue;
      }
    } else if (pursuit.kind === 'INITIATIVE') {
      const engagement = state.engagements.find((item) =>
        item.unitIds.includes(pursuer.id) && item.unitIds.includes(pursuit.targetUnitId));
      if (engagement && !engagement.active) {
        endPursuit(scenario, state, pursuer, 'initiative-contact-ended', events);
      }
    }
  }

  // D72(b): consensus bands exploit ended contacts within the believed picture.
  for (const unit of state.units) {
    if (!unit.initiativeRetargetPending) continue;
    unit.initiativeRetargetPending = false;
    const source = scenario.units[unit.unitIndex];
    const side = scenario.sides.find((item) => item.id === source.sideId);
    if (side?.commandModel !== 'CONSENSUS_INITIATIVE' || !pursuerAccepts(scenario, unit)) continue;
    const allCandidates = [
      ...state.units.filter((target) => target.endState !== 'DESTROYED' &&
        scenario.units[target.unitIndex].sideId !== source.sideId &&
        scenario.units[target.unitIndex].kind !== 'NONCOMBATANT_CAMP').map((target) => ({
        id: target.id, position: target.position,
      })),
      ...state.couriers.filter((target) => target.active && target.alive &&
        target.sideId !== source.sideId).map((target) => ({ id: target.id, position: target.position })),
    ];
    const complexIds = new Set(unit.initiativeComplexUnitIds ?? []);
    const complexCandidates = allCandidates.filter((target) => complexIds.has(target.id))
      .filter((target) => {
        const runtime = state.units.find((candidate) => candidate.id === target.id);
        return runtime && runtime.moraleState !== 'ROUTED';
      });
    const pool = complexCandidates.length > 0
      ? complexCandidates
      : allCandidates.filter((target) =>
        state.believedPictures[source.sideId]?.[target.id]?.status === 'spotted');
    const candidates = pool
      .map((target) => ({ ...target, range: Math.hypot(
        target.position.x - unit.position.x,
        target.position.y - unit.position.y,
      ) }))
      .filter((target) => complexCandidates.length > 0 || target.range <= config.initiativeRadiusMeters)
      .sort((left, right) => left.range - right.range || left.id.localeCompare(right.id));
    if (candidates[0]) startPursuit(
      scenario, state, terrain, unit, candidates[0].id, 'INITIATIVE', events,
      complexCandidates.length > 0 ? unit.initiativeComplexUnitIds : undefined,
      pathCache,
    );
    if (!candidates[0]) unit.initiativeComplexUnitIds = undefined;
  }
  reintegrateProtectedRouts(scenario, state, config, events);
}
