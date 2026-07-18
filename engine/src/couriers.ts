import type { Scenario } from '../../src/schema/scenario-schema.js';
import { emitEvent, type SimEvent } from './events.js';
import { SPEED_METERS_PER_SECOND } from './movement.js';
import { findPath, type EngineTerrain } from './pathfind.js';
import type { SimState } from './state.js';

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

function moveAlongPath(
  position: { x: number; y: number },
  path: Array<{ x: number; y: number }>,
  pathIndex: number,
  meters: number,
): number {
  while (meters > 0 && pathIndex < path.length) {
    const target = path[pathIndex];
    const dx = target.x - position.x;
    const dy = target.y - position.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= 1e-9) {
      pathIndex += 1;
      continue;
    }
    const step = Math.min(meters, distance);
    position.x += dx / distance * step;
    position.y += dy / distance * step;
    meters -= step;
    if (step + 1e-9 >= distance) pathIndex += 1;
  }
  return pathIndex;
}

/** D70: couriers depart on the issuer's live position and ride a real gallop path. */
export function updateCouriers(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  events: SimEvent[],
): void {
  for (const courier of state.couriers) {
    if (!courier.alive || courier.delivered) continue;
    if (!courier.active) {
      if (state.tick < courier.departureTick) continue;
      const order = scenario.orders[courier.orderIndex];
      const issuer = scenario.leaders.find((leader) => leader.id === order.issuerLeaderId);
      const issuerUnit = issuer ? state.units.find((unit) => unit.id === issuer.attachedToUnitId) : undefined;
      const delivery = state.deliveryQueue.find((item) => item.orderIndex === courier.orderIndex);
      const recipient = delivery
        ? state.units.find((unit) => unit.id === delivery.recipientUnitId)
        : undefined;
      if (!issuerUnit || !recipient) continue;
      courier.position = { ...issuerUnit.position };
      const result = findPath(
        terrain.gridForPath(courier.position, recipient.position),
        courier.position,
        recipient.position,
      );
      if (result.status === 'unreachable') continue;
      courier.path = result.path;
      courier.pathIndex = Math.min(1, Math.max(0, result.path.length - 1));
      courier.active = true;
      appendEvent(state, events, {
        tick: state.tick,
        type: 'courier-departed',
        unitId: courier.id,
        courierId: courier.id,
        orderId: order.id,
      });
    }
    courier.pathIndex = moveAlongPath(
      courier.position,
      courier.path,
      courier.pathIndex,
      SPEED_METERS_PER_SECOND.CAVALRY_GALLOP * scenario.clock.tickSeconds,
    );
    if (courier.pathIndex >= courier.path.length) {
      courier.delivered = true;
      courier.deliveredTick = state.tick;
      courier.active = false;
      appendEvent(state, events, {
        tick: state.tick,
        type: 'courier-delivered',
        unitId: courier.id,
        courierId: courier.id,
        orderId: scenario.orders[courier.orderIndex].id,
      });
    }
  }
}
