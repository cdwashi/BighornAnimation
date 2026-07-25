import type { Scenario } from '../../src/schema/scenario-schema.js';
import { minuteToTick } from './clock.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import { findPath, type EngineTerrain, type PointMeters, type TerrainCoverFeature } from './pathfind.js';
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
    const threatSource = scenario.units[threat.unitIndex];
    if (threatSource.sideId === sideId || threatSource.kind === 'NONCOMBATANT_CAMP') continue;
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
  if (!threat || threat.endState === 'DESTROYED' || threat.withdrawnOffField) {
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

function hasScheduledOrActiveOrder(state: SimState, unit: UnitRuntime): boolean {
  return unit.activeOrderId !== undefined ||
    state.deliveryQueue.some((delivery) => delivery.recipientUnitId === unit.id);
}

function release(unit: UnitRuntime): void {
  unit.campDefense = undefined;
  unit.campDefenseAlert = undefined;
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

function eligibleFeatures(
  features: readonly DefenseFeature[],
  camp: PointMeters,
  threat: PointMeters,
  radiusMeters: number,
): Array<{ feature: DefenseFeature; goal: PointMeters; threatDistanceMeters: number }> {
  return features.flatMap((feature) => {
    if (nearestPoint(feature.points, camp).distanceMeters > radiusMeters) return [];
    const nearest = nearestPoint(feature.points, threat);
    return [{
      feature,
      goal: nearest.point,
      threatDistanceMeters: nearest.distanceMeters,
    }];
  }).sort((left, right) =>
    left.threatDistanceMeters - right.threatDistanceMeters ||
    left.feature.id.localeCompare(right.feature.id));
}

function setPath(
  unit: UnitRuntime,
  terrain: EngineTerrain,
  goal: PointMeters,
): boolean {
  const result = findPath(terrain.gridForPath(unit.position, goal), unit.position, goal);
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
  )) {
    if (candidate.feature.id === excludedFeatureId) continue;
    if (!setPath(unit, terrain, candidate.goal)) continue;
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
  unit.speedClass = unit.mounted ? 'CAVALRY_WALK' : 'ON_FOOT';
  unit.distanceMovedOnActiveOrder = 0;
  selectReachableFeature(unit, threat, terrain, features, radiusMeters);
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
  unit.campDefense.campUnitId = threat.camp.id;
  unit.campDefense.threatUnitId = threat.threat.id;
  unit.campDefense.lastPathAttemptTick = state.tick;
  unit.campDefense.featureId = undefined;
  unit.campDefense.goal = undefined;
  selectReachableFeature(unit, threat, terrain, features, radiusMeters);
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
        const spotted = nearestCampThreat(
          scenario,
          state,
          source.sideId,
          config.campDefenseRadiusMeters,
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
    if (!unit.blockedReason ||
      state.tick - unit.campDefense.lastPathAttemptTick < combat.pursuitRepathCadenceTicks) {
      continue;
    }

    // D92(a): D34/D70's 10-tick cadence is reused for blocked retry only.
    unit.campDefense.lastPathAttemptTick = state.tick;
    const heldFeatureId = unit.campDefense.featureId;
    const heldGoal = unit.campDefense.goal;
    if (heldFeatureId && heldGoal && setPath(unit, terrain, heldGoal)) continue;
    selectReachableFeature(
      unit,
      threat,
      terrain,
      features,
      config.campDefenseRadiusMeters,
      heldFeatureId,
    );
  }
}
