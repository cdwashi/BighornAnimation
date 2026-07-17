import type { Scenario } from '../../src/schema/scenario-schema.js';
import { emitEvent, type SimEvent } from './events.js';
import { pursuitNeedsRepath, repathPursuit, type PathCache } from './objectives.js';
import type { EngineTerrain } from './pathfind.js';
import type { Formation, SimState, SpeedClass, UnitRuntime } from './state.js';

/** [CAL] D32 movement rates in meters per simulated second. */
export const SPEED_METERS_PER_SECOND: Readonly<Record<SpeedClass, number>> = {
  CAVALRY_WALK: 1.8,
  CAVALRY_TROT: 3.6,
  CAVALRY_GALLOP: 5.4,
  DISMOUNTED_SKIRMISH: 1.1,
  PACK_TRAIN: 1.2,
  ON_FOOT: 1.3,
};

/** [CAL] D32 formation multipliers. CAMP is inert and retained for state fidelity. */
export const FORMATION_MODIFIER: Readonly<Record<Formation, number>> = {
  COLUMN: 1,
  LINE: 0.8,
  SKIRMISH: 0.7,
  DISPERSED: 0.9,
  CAMP: 0,
};

const SCREEN_POSTURE_MODIFIER = 0.8;
const PURSUIT_STANDOFF_METERS = 150;

export function effectiveSpeedMetersPerSecond(
  speedClass: SpeedClass,
  formation: Formation,
  movementFactor = 1,
  screen = false,
): number {
  return SPEED_METERS_PER_SECOND[speedClass] * FORMATION_MODIFIER[formation] *
    movementFactor * (screen ? SCREEN_POSTURE_MODIFIER : 1);
}

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

function completeTransition(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  events: SimEvent[],
): boolean {
  const transition = unit.transition;
  if (!transition) return false;
  transition.remainingTicks -= 1;
  if (transition.remainingTicks > 0) return true;
  if (transition.kind === 'DISMOUNT') {
    const source = scenario.units[unit.unitIndex];
    const profile = scenario.tacticsProfiles[source.tacticsProfileId];
    const holderFraction = profile?.dismountHolderFraction ?? 0.25;
    unit.mounted = false;
    unit.formation = 'SKIRMISH';
    unit.speedClass = 'DISMOUNTED_SKIRMISH';
    unit.horseHolderStrength = unit.strengthTotal * holderFraction;
    unit.strengthAvailable = unit.strengthTotal - unit.horseHolderStrength;
    appendEvent(state, events, {
      tick: state.tick,
      type: 'dismounted',
      unitId: unit.id,
      orderId: unit.activeOrderId,
    });
  } else {
    unit.mounted = true;
    unit.formation = 'COLUMN';
    unit.speedClass = 'CAVALRY_WALK';
    unit.horseHolderStrength = 0;
    unit.strengthAvailable = unit.strengthTotal;
    appendEvent(state, events, {
      tick: state.tick,
      type: 'mounted',
      unitId: unit.id,
      orderId: unit.activeOrderId,
    });
  }
  unit.transition = undefined;
  return true;
}

function markBlocked(state: SimState, unit: UnitRuntime, events: SimEvent[], reason: string): void {
  if (unit.blockedReason === reason) return;
  unit.blockedReason = reason;
  appendEvent(state, events, {
    tick: state.tick,
    type: 'move-blocked',
    unitId: unit.id,
    orderId: unit.activeOrderId,
    reason,
  });
}

function moveOneUnit(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  events: SimEvent[],
  cache: PathCache,
): void {
  const startingPosition = { ...unit.position };
  if (completeTransition(scenario, state, unit, events)) return;
  if (unit.path.length === 0 || unit.pathIndex >= unit.path.length || unit.blockedReason) return;

  if (pursuitNeedsRepath(state, unit)) {
    const result = repathPursuit(scenario, state, unit, terrain, cache);
    if (result.status === 'unreachable') {
      markBlocked(state, unit, events, result.reason);
      return;
    }
    unit.path = result.path;
    unit.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
  }

  if (unit.pursuit) {
    const target = state.units.find((item) => item.id === unit.pursuit?.targetUnitId);
    if (target) {
      const distance = Math.hypot(
        target.position.x - unit.position.x,
        target.position.y - unit.position.y,
      );
      if (distance <= PURSUIT_STANDOFF_METERS) {
        if (!unit.pursuit.contactEmitted) {
          appendEvent(state, events, {
            tick: state.tick,
            type: 'contact-pending',
            unitId: unit.id,
            orderId: unit.activeOrderId,
          });
          unit.pursuit.contactEmitted = true;
        }
        return;
      }
    }
  }

  const sample = terrain.movementAtMeters(unit.position.x, unit.position.y);
  if (sample.crossingPenaltyMinutes !== undefined) {
    if (!unit.insideFord) {
      unit.insideFord = true;
      unit.fordHoldTicks = sample.crossingPenaltyMinutes * 2;
      appendEvent(state, events, {
        tick: state.tick,
        type: 'ford-crossing',
        unitId: unit.id,
        orderId: unit.activeOrderId,
      });
    }
  } else {
    unit.insideFord = false;
  }
  if (unit.fordHoldTicks > 0) {
    unit.fordHoldTicks -= 1;
    return;
  }
  if (!(sample.movementFactor > 0)) {
    markBlocked(state, unit, events, 'current terrain cell is impassable');
    return;
  }

  let remaining = effectiveSpeedMetersPerSecond(
    unit.speedClass,
    unit.formation,
    sample.movementFactor,
    unit.posture === 'SCREEN',
  ) * scenario.clock.tickSeconds;
  if (unit.pursuit) {
    const target = state.units.find((item) => item.id === unit.pursuit?.targetUnitId);
    if (target) {
      remaining = Math.min(
        remaining,
        Math.max(0, Math.hypot(
          target.position.x - unit.position.x,
          target.position.y - unit.position.y,
        ) - PURSUIT_STANDOFF_METERS),
      );
    }
  }

  while (remaining > 0 && unit.pathIndex < unit.path.length) {
    const target = unit.path[unit.pathIndex];
    const dx = target.x - unit.position.x;
    const dy = target.y - unit.position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 1e-9) {
      appendEvent(state, events, {
        tick: state.tick,
        type: 'waypoint-reached',
        unitId: unit.id,
        orderId: unit.activeOrderId,
        waypointIndex: unit.pathIndex,
      });
      unit.pathIndex += 1;
      continue;
    }
    const step = Math.min(remaining, distance);
    const heading = Math.atan2(dy, dx);
    unit.position.x += dx / distance * step;
    unit.position.y += dy / distance * step;
    unit.facingRadians = unit.posture === 'WITHDRAW'
      ? (heading + Math.PI) % (Math.PI * 2)
      : heading;
    unit.pathProgressMeters += step;
    unit.distanceMovedOnActiveOrder += step;
    remaining -= step;
    if (step + 1e-9 >= distance) {
      appendEvent(state, events, {
        tick: state.tick,
        type: 'waypoint-reached',
        unitId: unit.id,
        orderId: unit.activeOrderId,
        waypointIndex: unit.pathIndex,
      });
      unit.pathIndex += 1;
    }
    // Stop on a ford waypoint so the next tick observes and pays its hold.
    if (target.crossingPenaltyMinutes !== undefined && step + 1e-9 >= distance) break;
  }

  if (unit.pathIndex >= unit.path.length && !unit.pursuit) {
    appendEvent(state, events, {
      tick: state.tick,
      type: unit.activeOrderId && scenario.orders[unit.activeOrderIndex ?? -1]?.type === 'RESUPPLY'
        ? 'resupply-proximity'
        : 'arrived',
      unitId: unit.id,
      orderId: unit.activeOrderId,
    });
  }
  if (unit.position.x !== startingPosition.x || unit.position.y !== startingPosition.y) {
    unit.lastMovedTick = state.tick;
  }
}

export function moveUnits(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  events: SimEvent[],
  cache: PathCache,
): void {
  // Declared unit order is a determinism contract (D30).
  for (const unit of state.units) moveOneUnit(scenario, state, unit, terrain, events, cache);
}
