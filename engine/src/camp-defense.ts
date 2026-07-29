import type { Scenario } from '../../src/schema/scenario-schema.js';
import { minuteToTick } from './clock.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import {
  findPath,
  type ChannelSide,
  type EngineTerrain,
  type PathCellBlocked,
  type PathResult,
  type PointMeters,
  type TerrainCoverFeature,
} from './pathfind.js';
import type { SpottingConfig } from './spotting.js';
import type { SimState, UnitRuntime } from './state.js';

/** D92(b): structural reuse of D34's displacement threshold, not a [CAL] value. */
export const CAMP_THREAT_SWITCH_MARGIN_METERS = 250;

interface CampThreat {
  camp: UnitRuntime;
  threat: UnitRuntime;
  threatPosition: PointMeters;
  distanceMeters: number;
}

interface DefenseFeature {
  id: string;
  points: readonly PointMeters[];
}

interface ThreatCommitment {
  campUnitId: string;
  threatUnitId: string;
}

const constrainedPathCache = new WeakMap<SimState, Map<string, PathResult>>();

function isCampThreat(scenario: Scenario, threat: UnitRuntime, sideId: string): boolean {
  const source = scenario.units[threat.unitIndex];
  return source.sideId !== sideId &&
    source.kind !== 'NONCOMBATANT_CAMP' &&
    source.tacticsProfileId !== 'irregular-scout';
}

function campsForSide(scenario: Scenario, state: SimState, sideId: string): UnitRuntime[] {
  return state.units.filter((unit) => {
    const source = scenario.units[unit.unitIndex];
    return source.sideId === sideId && source.kind === 'NONCOMBATANT_CAMP' &&
      unit.id !== 'pony-herd';
  });
}

function spottedCampThreats(
  scenario: Scenario,
  state: SimState,
  sideId: string,
  radiusMeters: number,
): CampThreat[] {
  const picture = state.believedPictures[sideId] ?? {};
  const camps = campsForSide(scenario, state, sideId);
  const result: CampThreat[] = [];
  for (const [targetUnitId, belief] of Object.entries(picture)) {
    if (belief.status !== 'spotted') continue;
    const threat = state.units.find((unit) => unit.id === targetUnitId);
    if (!threat || threat.endState === 'DESTROYED' || threat.withdrawnOffField) continue;
    if (!isCampThreat(scenario, threat, sideId)) continue;
    for (const camp of camps) {
      const distanceMeters = Math.hypot(
        belief.lastSeenPos.x - camp.position.x,
        belief.lastSeenPos.y - camp.position.y,
      );
      if (distanceMeters <= radiusMeters) {
        result.push({
          camp,
          threat,
          threatPosition: { ...belief.lastSeenPos },
          distanceMeters,
        });
      }
    }
  }
  return result.sort((left, right) =>
    left.distanceMeters - right.distanceMeters ||
    left.threat.id.localeCompare(right.threat.id) ||
    left.camp.id.localeCompare(right.camp.id));
}

/**
 * D91/D92 threat commitment: retain the current threat until a spotted
 * alternative is at least 250 m nearer, or the current unit is gone.
 */
function nearestCampThreat(
  scenario: Scenario,
  state: SimState,
  sideId: string,
  radiusMeters: number,
  commitment?: ThreatCommitment,
): CampThreat | undefined {
  const candidates = spottedCampThreats(scenario, state, sideId, radiusMeters);
  if (!commitment) return candidates[0];
  const threat = state.units.find((unit) => unit.id === commitment.threatUnitId);
  if (!threat || threat.endState === 'DESTROYED' || threat.withdrawnOffField ||
    !isCampThreat(scenario, threat, sideId)) {
    return candidates[0];
  }
  const camp = state.units.find((unit) => unit.id === commitment.campUnitId);
  const belief = state.believedPictures[sideId]?.[threat.id];
  if (!camp || !belief) return candidates[0];
  const current: CampThreat = {
    camp,
    threat,
    threatPosition: { ...belief.lastSeenPos },
    distanceMeters: Math.hypot(
      belief.lastSeenPos.x - camp.position.x,
      belief.lastSeenPos.y - camp.position.y,
    ),
  };
  const alternative = candidates.find((candidate) =>
    candidate.threat.id !== threat.id &&
    candidate.distanceMeters + CAMP_THREAT_SWITCH_MARGIN_METERS < current.distanceMeters);
  return alternative ?? current;
}

function isCampWardFordCommitment(
  threat: CampThreat,
  terrain: EngineTerrain,
): boolean {
  const believedTerrain = terrain.movementAtMeters(
    threat.threatPosition.x,
    threat.threatPosition.y,
  );
  if (!threat.threat.insideFord &&
    believedTerrain.crossingPenaltyMinutes === undefined) return false;
  const nextWaypoint = threat.threat.path[threat.threat.pathIndex];
  if (!nextWaypoint) return false;
  return Math.hypot(
    nextWaypoint.x - threat.camp.position.x,
    nextWaypoint.y - threat.camp.position.y,
  ) < Math.hypot(
    threat.threatPosition.x - threat.camp.position.x,
    threat.threatPosition.y - threat.camp.position.y,
  );
}

/**
 * D103 T3 alarm: awareness inside the eligibility radius is not itself an
 * alarm. The first alert requires ford occupancy and a path continuing toward
 * the defended camp. Direction comes from movement machinery, never the
 * channel-side classifier whose southern-terminus artifact is recorded.
 */
function nearestCampWardFordThreat(
  scenario: Scenario,
  state: SimState,
  sideId: string,
  radiusMeters: number,
  terrain: EngineTerrain,
): CampThreat | undefined {
  return spottedCampThreats(scenario, state, sideId, radiusMeters)
    .find((threat) => isCampWardFordCommitment(threat, terrain));
}

function hasScheduledOrActiveOrder(state: SimState, unit: UnitRuntime): boolean {
  return unit.activeOrderId !== undefined ||
    state.deliveryQueue.some((delivery) => delivery.recipientUnitId === unit.id);
}

function release(unit: UnitRuntime): void {
  unit.campDefense = undefined;
  unit.campDefenseAlert = undefined;
  unit.pursuit = undefined;
  unit.path = [];
  unit.pathIndex = 0;
  unit.pathProgressMeters = 0;
  unit.blockedReason = undefined;
  unit.posture = 'HOLD';
}

function defenseFeatures(scenario: Scenario, terrain: EngineTerrain): DefenseFeature[] {
  const scenarioFeatures: DefenseFeature[] = (scenario.coverFeatures ?? []).map((feature) => {
    const [x, y] = terrain.toLocal(feature.position.lat, feature.position.lon);
    return { id: `scenario-${feature.id}`, points: [{ x, y }] };
  });
  const substrateFeatures: readonly TerrainCoverFeature[] = terrain.coverFeatures?.() ?? [];
  return [...substrateFeatures, ...scenarioFeatures].sort((left, right) =>
    left.id.localeCompare(right.id));
}

function nearestPoint(points: readonly PointMeters[], target: PointMeters): {
  point: PointMeters;
  distanceMeters: number;
} {
  let selected = points[0];
  let distanceMeters = Number.POSITIVE_INFINITY;
  for (const point of points) {
    const distance = Math.hypot(point.x - target.x, point.y - target.y);
    if (distance < distanceMeters) {
      selected = point;
      distanceMeters = distance;
    }
  }
  return { point: { ...selected }, distanceMeters };
}

function classifiedSide(
  terrain: EngineTerrain,
  point: PointMeters,
): ChannelSide | undefined {
  return terrain.channelSideAtMeters?.(point.x, point.y);
}

function campSide(
  terrain: EngineTerrain,
  camp: PointMeters,
): Exclude<ChannelSide, 'ON_CHANNEL'> | undefined {
  const side = classifiedSide(terrain, camp);
  return side === 'WEST' || side === 'EAST' ? side : undefined;
}

function eligibleFeatures(
  features: readonly DefenseFeature[],
  camp: PointMeters,
  threat: PointMeters,
  radiusMeters: number,
  terrain: EngineTerrain,
): Array<{ feature: DefenseFeature; goal: PointMeters; threatDistanceMeters: number }> {
  const defendedSide = campSide(terrain, camp);
  return features.flatMap((feature) => {
    const points = defendedSide
      ? feature.points.filter((point) => classifiedSide(terrain, point) === defendedSide)
      : feature.points;
    if (points.length === 0 || nearestPoint(points, camp).distanceMeters > radiusMeters) return [];
    const nearest = nearestPoint(points, threat);
    return [{
      feature,
      goal: nearest.point,
      threatDistanceMeters: nearest.distanceMeters,
    }];
  }).sort((left, right) =>
    left.threatDistanceMeters - right.threatDistanceMeters ||
    left.feature.id.localeCompare(right.feature.id));
}

/**
 * D98 path constraint. A band already on its camp's side cannot path onto the
 * channel or the opposite bank. A band starting away from home receives no
 * blocker, preserving the ruling that movement toward its camp side is always
 * permitted.
 */
export function campDefensePathBlocker(
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
): PathCellBlocked | undefined {
  if (!unit.campDefense || !terrain.channelSideAtMeters) return undefined;
  const camp = state.units.find((candidate) => candidate.id === unit.campDefense?.campUnitId);
  if (!camp) return undefined;
  const defendedSide = campSide(terrain, camp.position);
  if (!defendedSide || classifiedSide(terrain, unit.position) !== defendedSide) return undefined;
  return (point): boolean => classifiedSide(terrain, point) !== defendedSide;
}

export function findCampDefensePath(
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  goal: PointMeters,
): PathResult {
  let cache = constrainedPathCache.get(state);
  if (!cache) {
    cache = new Map();
    constrainedPathCache.set(state, cache);
  }
  const grid = terrain.gridForPath(unit.position, goal);
  const key = `${unit.campDefense?.campUnitId ?? 'none'}:${grid.id}:` +
    `${unit.position.x},${unit.position.y}:${goal.x},${goal.y}`;
  const cached = cache.get(key);
  if (cached) {
    if (cached.status === 'unreachable') return { ...cached };
    const path = cached.path.map((point) => ({ ...point }));
    path[0] = { ...path[0], ...unit.position };
    path[path.length - 1] = { ...path[path.length - 1], ...goal };
    return { ...cached, path };
  }
  const blocked = campDefensePathBlocker(state, unit, terrain);
  const result = findPath(
    grid,
    unit.position,
    goal,
    blocked,
  );
  cache.set(key, result.status === 'reachable'
    ? { ...result, path: result.path.map((point) => ({ ...point })) }
    : { ...result });
  return result;
}

function setPath(
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  goal: PointMeters,
): boolean {
  const result = findCampDefensePath(state, unit, terrain, goal);
  unit.pathProgressMeters = 0;
  if (result.status === 'unreachable') {
    unit.path = [];
    unit.pathIndex = 0;
    unit.blockedReason = result.reason;
    return false;
  }
  unit.path = result.path;
  unit.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
  unit.blockedReason = undefined;
  return true;
}

function selectReachableFeature(
  state: SimState,
  unit: UnitRuntime,
  threat: CampThreat,
  terrain: EngineTerrain,
  features: readonly DefenseFeature[],
  radiusMeters: number,
  excludedFeatureId?: string,
): boolean {
  for (const candidate of eligibleFeatures(
    features,
    threat.camp.position,
    threat.threatPosition,
    radiusMeters,
    terrain,
  )) {
    if (candidate.feature.id === excludedFeatureId) continue;
    if (!setPath(state, unit, terrain, candidate.goal)) continue;
    if (!unit.campDefense) return false;
    unit.campDefense.featureId = candidate.feature.id;
    unit.campDefense.goal = candidate.goal;
    return true;
  }
  if (unit.campDefense) {
    unit.campDefense.featureId = undefined;
    unit.campDefense.goal = undefined;
  }
  unit.path = [];
  unit.pathIndex = 0;
  unit.blockedReason = 'no reachable camp-defense feature';
  return false;
}

function activate(
  state: SimState,
  unit: UnitRuntime,
  threat: CampThreat,
  terrain: EngineTerrain,
  features: readonly DefenseFeature[],
  radiusMeters: number,
  events: SimEvent[],
): void {
  unit.campDefense = {
    campUnitId: threat.camp.id,
    threatUnitId: threat.threat.id,
    lastPathAttemptTick: state.tick,
  };
  unit.posture = 'MARCH';
  unit.speedClass = unit.mounted ? 'CAVALRY_GALLOP' : 'ON_FOOT';
  unit.distanceMovedOnActiveOrder = 0;
  selectReachableFeature(state, unit, threat, terrain, features, radiusMeters);
  state.emittedEventCursor = emitEvent(events, {
    tick: state.tick,
    type: 'camp-defense-activated',
    unitId: unit.id,
    campUnitId: threat.camp.id,
    threatUnitId: threat.threat.id,
  }, state.emittedEventCursor);
}

function switchThreat(
  state: SimState,
  unit: UnitRuntime,
  threat: CampThreat,
  terrain: EngineTerrain,
  features: readonly DefenseFeature[],
  radiusMeters: number,
): void {
  if (!unit.campDefense) return;
  unit.pursuit = undefined;
  unit.posture = 'MARCH';
  unit.speedClass = unit.mounted ? 'CAVALRY_WALK' : 'ON_FOOT';
  unit.campDefense.campUnitId = threat.camp.id;
  unit.campDefense.threatUnitId = threat.threat.id;
  unit.campDefense.lastPathAttemptTick = state.tick;
  unit.campDefense.featureId = undefined;
  unit.campDefense.goal = undefined;
  selectReachableFeature(state, unit, threat, terrain, features, radiusMeters);
}

function committedThreatOutsideRadius(
  state: SimState,
  sideId: string,
  commitment: ThreatCommitment,
  radiusMeters: number,
): boolean {
  const camp = state.units.find((unit) => unit.id === commitment.campUnitId);
  const belief = state.believedPictures[sideId]?.[commitment.threatUnitId];
  if (!camp || !belief) return false;
  return Math.hypot(
    belief.lastSeenPos.x - camp.position.x,
    belief.lastSeenPos.y - camp.position.y,
  ) > radiusMeters;
}

function localAvailableStrength(
  scenario: Scenario,
  state: SimState,
  sideId: string,
  center: PointMeters,
  radiusMeters: number,
  closingSide: boolean,
): number {
  return state.units.filter((candidate) => {
    const source = scenario.units[candidate.unitIndex];
    if (source.sideId !== sideId || source.kind === 'NONCOMBATANT_CAMP') return false;
    if (candidate.endState === 'DESTROYED') return false;
    if (closingSide && (candidate.moraleState === 'BROKEN' ||
      candidate.moraleState === 'ROUTED')) return false;
    return Math.hypot(
      candidate.position.x - center.x,
      candidate.position.y - center.y,
    ) <= radiusMeters;
  }).reduce((sum, candidate) => sum + candidate.strengthAvailable, 0);
}

function shouldClose(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  threat: UnitRuntime,
  radiusMeters: number,
): boolean {
  if (threat.moraleState === 'STEADY') return false;
  const closingSideId = scenario.units[unit.unitIndex].sideId;
  const threatSideId = scenario.units[threat.unitIndex].sideId;
  const closingStrength = localAvailableStrength(
    scenario,
    state,
    closingSideId,
    threat.position,
    radiusMeters,
    true,
  );
  const threatStrength = localAvailableStrength(
    scenario,
    state,
    threatSideId,
    threat.position,
    radiusMeters,
    false,
  );
  return closingStrength > threatStrength;
}

function startClosing(
  state: SimState,
  unit: UnitRuntime,
  threat: UnitRuntime,
  terrain: EngineTerrain,
): boolean {
  const camp = state.units.find((candidate) => candidate.id === unit.campDefense?.campUnitId);
  const defendedSide = camp && campSide(terrain, camp.position);
  if (defendedSide && classifiedSide(terrain, threat.position) !== defendedSide) return false;
  if (!setPath(state, unit, terrain, threat.position)) return false;
  unit.posture = 'CHARGE';
  unit.speedClass = unit.mounted ? 'CAVALRY_GALLOP' : 'ON_FOOT';
  unit.distanceMovedOnActiveOrder = 0;
  unit.pursuit = {
    targetUnitId: threat.id,
    lastRepathTick: state.tick,
    lastTargetPosition: { ...threat.position },
    contactEmitted: false,
  };
  return true;
}

export function updateCampDefense(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  config: SpottingConfig,
  combat: CombatConfig,
  events: SimEvent[],
): void {
  const features = defenseFeatures(scenario, terrain);
  // Absent doctrine data ⇒ zero turnout delay (activation on spotting).
  const turnoutTicks = minuteToTick(
    scenario.campDefense?.turnoutDelayMinutes.best ?? 0,
    scenario.clock.tickSeconds,
  );
  for (const unit of state.units) {
    if (unit.defaultBehavior !== 'DEFEND_CAMP') continue;
    const source = scenario.units[unit.unitIndex];
    if (hasScheduledOrActiveOrder(state, unit)) {
      if (unit.campDefense || unit.campDefenseAlert) release(unit);
      continue;
    }

    if (!unit.campDefense) {
      if (!unit.campDefenseAlert) {
        const spotted = nearestCampWardFordThreat(
          scenario,
          state,
          source.sideId,
          config.campDefenseRadiusMeters,
          terrain,
        );
        if (!spotted) continue;
        unit.campDefenseAlert = {
          tick: state.tick,
          campUnitId: spotted.camp.id,
          threatUnitId: spotted.threat.id,
        };
        continue;
      }
      const threat = nearestCampThreat(
        scenario,
        state,
        source.sideId,
        config.campDefenseRadiusMeters,
        unit.campDefenseAlert,
      );
      if (!threat) {
        unit.campDefenseAlert = undefined;
        continue;
      }
      unit.campDefenseAlert.campUnitId = threat.camp.id;
      unit.campDefenseAlert.threatUnitId = threat.threat.id;
      if (state.tick - unit.campDefenseAlert.tick < turnoutTicks) continue;
      activate(
        state,
        unit,
        threat,
        terrain,
        features,
        config.campDefenseRadiusMeters,
        events,
      );
      continue;
    }

    const previousThreatId = unit.campDefense.threatUnitId;
    // D93: release uses the same believed camp-to-threat radius as activation.
    if (committedThreatOutsideRadius(
      state,
      source.sideId,
      unit.campDefense,
      config.campDefenseRadiusMeters,
    )) {
      release(unit);
      continue;
    }
    const threat = nearestCampThreat(
      scenario,
      state,
      source.sideId,
      config.campDefenseRadiusMeters,
      unit.campDefense,
    );
    if (!threat) {
      release(unit);
      continue;
    }
    if (threat.threat.id !== previousThreatId) {
      switchThreat(
        state,
        unit,
        threat,
        terrain,
        features,
        config.campDefenseRadiusMeters,
      );
      continue;
    }
    // D96: the first passed trigger is held for this threat commitment. CHARGE
    // posture and target-following movement enter D65 shock resolution without
    // reusing either INITIATIVE or COMBAT pursuit.
    if (unit.posture === 'CHARGE' && unit.pursuit?.targetUnitId === threat.threat.id) {
      continue;
    }
    if (shouldClose(
      scenario,
      state,
      unit,
      threat.threat,
      combat.friendlyRadiusMeters,
    ) && startClosing(state, unit, threat.threat, terrain)) {
      continue;
    }
    if (!unit.blockedReason ||
      state.tick - unit.campDefense.lastPathAttemptTick < combat.pursuitRepathCadenceTicks) {
      continue;
    }

    // D92(a): D34/D70's 10-tick cadence is reused for blocked retry only.
    unit.campDefense.lastPathAttemptTick = state.tick;
    const heldFeatureId = unit.campDefense.featureId;
    const heldGoal = unit.campDefense.goal;
    if (heldFeatureId && heldGoal && setPath(state, unit, terrain, heldGoal)) continue;
    selectReachableFeature(
      state,
      unit,
      threat,
      terrain,
      features,
      config.campDefenseRadiusMeters,
      heldFeatureId,
    );
  }
}
