import type { Scenario } from '../../src/schema/scenario-schema.js';
import { emitEvent, type SimEvent } from './events.js';
import { findPath, type EngineTerrain } from './pathfind.js';
import type { SpottingConfig } from './spotting.js';
import type { SimState, UnitRuntime } from './state.js';

interface CampThreat {
  camp: UnitRuntime;
  threat: UnitRuntime;
  distanceMeters: number;
}

function nearestCampThreat(
  scenario: Scenario,
  state: SimState,
  sideId: string,
  radiusMeters: number,
): CampThreat | undefined {
  const picture = state.believedPictures[sideId] ?? {};
  const camps = state.units.filter((unit) => {
    const source = scenario.units[unit.unitIndex];
    return source.sideId === sideId && source.kind === 'NONCOMBATANT_CAMP' && unit.id !== 'pony-herd';
  });
  let nearest: CampThreat | undefined;
  for (const [targetUnitId, belief] of Object.entries(picture)) {
    // TODO-AMBIGUOUS(M3-A): D47 says the trigger clears, but last-known contacts
    // have no decay rule. Only currently spotted contacts keep the trigger live.
    if (belief.status !== 'spotted') continue;
    const threat = state.units.find((unit) => unit.id === targetUnitId);
    if (!threat) continue;
    const threatSource = scenario.units[threat.unitIndex];
    if (threatSource.sideId === sideId || threatSource.kind === 'NONCOMBATANT_CAMP') continue;
    for (const camp of camps) {
      const distanceMeters = Math.hypot(
        belief.lastSeenPos.x - camp.position.x,
        belief.lastSeenPos.y - camp.position.y,
      );
      if (distanceMeters > radiusMeters || nearest && distanceMeters >= nearest.distanceMeters) continue;
      nearest = { camp, threat, distanceMeters };
    }
  }
  return nearest;
}

function hasScheduledOrActiveOrder(state: SimState, unit: UnitRuntime): boolean {
  return unit.activeOrderId !== undefined ||
    state.deliveryQueue.some((delivery) => delivery.recipientUnitId === unit.id);
}

function release(unit: UnitRuntime): void {
  unit.campDefense = undefined;
  unit.path = [];
  unit.pathIndex = 0;
  unit.pathProgressMeters = 0;
  unit.blockedReason = undefined;
  unit.posture = 'HOLD';
}

function activate(
  state: SimState,
  unit: UnitRuntime,
  threat: CampThreat,
  terrain: EngineTerrain,
  events: SimEvent[],
): void {
  // TODO-AMBIGUOUS(M3-A): D47 specifies "between" threat and camp but no
  // standoff. The neutral geometric midpoint is used as the interpose point.
  const goal = {
    x: (threat.camp.position.x + threat.threat.position.x) / 2,
    y: (threat.camp.position.y + threat.threat.position.y) / 2,
  };
  const result = findPath(terrain.gridForPath(unit.position, goal), unit.position, goal);
  unit.campDefense = { campUnitId: threat.camp.id, threatUnitId: threat.threat.id };
  unit.posture = 'MARCH';
  unit.speedClass = unit.mounted ? 'CAVALRY_WALK' : 'ON_FOOT';
  unit.pathProgressMeters = 0;
  unit.distanceMovedOnActiveOrder = 0;
  if (result.status === 'unreachable') {
    unit.path = [];
    unit.pathIndex = 0;
    unit.blockedReason = result.reason;
  } else {
    unit.path = result.path;
    unit.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
    unit.blockedReason = undefined;
  }
  state.emittedEventCursor = emitEvent(events, {
    tick: state.tick,
    type: 'camp-defense-activated',
    unitId: unit.id,
    campUnitId: threat.camp.id,
    threatUnitId: threat.threat.id,
  }, state.emittedEventCursor);
}

export function updateCampDefense(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  config: SpottingConfig,
  events: SimEvent[],
): void {
  for (const unit of state.units) {
    if (unit.defaultBehavior !== 'DEFEND_CAMP') continue;
    const source = scenario.units[unit.unitIndex];
    if (hasScheduledOrActiveOrder(state, unit)) {
      if (unit.campDefense) release(unit);
      continue;
    }
    const threat = nearestCampThreat(
      scenario,
      state,
      source.sideId,
      config.campDefenseRadiusMeters,
    );
    if (!threat) {
      if (unit.campDefense) release(unit);
      continue;
    }
    if (!unit.campDefense) activate(state, unit, threat, terrain, events);
  }
}
