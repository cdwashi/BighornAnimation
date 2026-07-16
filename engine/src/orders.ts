import type { Order, Scenario } from '../../src/schema/scenario-schema.js';
import { emitEvent, type SimEvent } from './events.js';
import { resolveObjective, type PathCache } from './objectives.js';
import type { EngineTerrain } from './pathfind.js';
import type { Posture, SimState, SpeedClass, UnitRuntime } from './state.js';

const MOVEMENT_TYPES = new Set<Order['type']>([
  'MOVE', 'SCREEN', 'WITHDRAW', 'ATTACK', 'CHARGE', 'HOLD', 'RESUPPLY',
  'DISMOUNT_SKIRMISH',
]);

function postureFor(order: Order): Posture {
  switch (order.type) {
    case 'ATTACK': return 'ATTACK';
    case 'CHARGE': return 'CHARGE';
    case 'SCREEN': return 'SCREEN';
    case 'WITHDRAW': return 'WITHDRAW';
    case 'DEFEND_CAMP': return 'INERT';
    case 'HOLD': return 'HOLD';
    default: return 'MARCH';
  }
}

function speedFor(order: Order, unit: UnitRuntime, scenario: Scenario): SpeedClass {
  const source = scenario.units[unit.unitIndex];
  if (source.kind === 'PACK_TRAIN') return 'PACK_TRAIN';
  if (!unit.mounted) return order.type === 'DISMOUNT_SKIRMISH' ? 'DISMOUNTED_SKIRMISH' : 'ON_FOOT';
  if (order.type === 'ATTACK') return 'CAVALRY_TROT';
  if (order.type === 'CHARGE') return 'CAVALRY_GALLOP';
  return 'CAVALRY_WALK';
}

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

function activateOrder(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  order: Order,
  orderIndex: number,
  terrain: EngineTerrain,
  events: SimEvent[],
  cache: PathCache,
): void {
  appendEvent(state, events, {
    tick: state.tick,
    type: 'order-received',
    unitId: unit.id,
    orderId: order.id,
  });
  if (unit.activeOrderId) {
    appendEvent(state, events, {
      tick: state.tick,
      type: 'order-superseded',
      unitId: unit.id,
      orderId: order.id,
      supersededOrderId: unit.activeOrderId,
    });
  }
  unit.activeOrderId = order.id;
  unit.activeOrderIndex = orderIndex;
  unit.activeOrderReceivedTick = state.tick;
  unit.posture = postureFor(order);
  unit.speedClass = speedFor(order, unit, scenario);
  unit.path = [];
  unit.pathIndex = 0;
  unit.pathProgressMeters = 0;
  unit.blockedReason = undefined;
  unit.distanceMovedOnActiveOrder = 0;
  unit.pursuit = undefined;
  unit.transition = order.type === 'DISMOUNT_SKIRMISH'
    ? { kind: 'DISMOUNT', remainingTicks: 2 }
    : order.type === 'MOUNT'
      ? { kind: 'MOUNT', remainingTicks: 2 }
      : undefined;

  if (!MOVEMENT_TYPES.has(order.type) || (order.type === 'HOLD' && !order.objective)) return;
  const result = resolveObjective(scenario, state, unit, order, terrain, cache);
  if (result.status === 'unreachable') {
    unit.blockedReason = result.reason;
    appendEvent(state, events, {
      tick: state.tick,
      type: 'move-blocked',
      unitId: unit.id,
      orderId: order.id,
      reason: result.reason,
    });
    return;
  }
  const pathDistance = result.path.reduce((distance, point, index) => {
    if (index === 0) return distance;
    const previous = result.path[index - 1];
    return distance + Math.hypot(point.x - previous.x, point.y - previous.y);
  }, 0);
  // D38: an objective HOLD only enters its proceed phase when the objective is
  // not already satisfied. Otherwise it remains exactly stationary.
  if (order.type === 'HOLD' && pathDistance <= 0.01) return;
  unit.path = result.path;
  unit.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
  if (result.targetUnitId) {
    const target = state.units.find((item) => item.id === result.targetUnitId);
    if (target) {
      unit.pursuit = {
        targetUnitId: result.targetUnitId,
        lastRepathTick: state.tick,
        lastTargetPosition: { ...target.position },
        contactEmitted: false,
      };
    }
  }
  appendEvent(state, events, {
    tick: state.tick,
    type: 'move-started',
    unitId: unit.id,
    orderId: order.id,
  });
}

export function deliverOrders(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  events: SimEvent[],
  cache: PathCache,
): void {
  const remaining = [];
  for (const delivery of state.deliveryQueue) {
    if (delivery.arrivalTick !== state.tick) {
      remaining.push(delivery);
      continue;
    }
    const order = scenario.orders[delivery.orderIndex];
    const unit = state.units[delivery.recipientUnitIndex];
    activateOrder(scenario, state, unit, order, delivery.orderIndex, terrain, events, cache);
    state.deliveredOrders.push({ ...delivery, deliveredTick: state.tick });
  }
  state.deliveryQueue = remaining;
}
