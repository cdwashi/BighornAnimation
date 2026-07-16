import type { Order, Scenario, Unit } from '../../src/schema/scenario-schema.js';
import { minuteToTick } from './clock.js';
import type { PathPoint } from './pathfind.js';
import type { EngineTerrain } from './pathfind.js';
import { createRngState, type RngState } from './rng.js';

export type Formation = Unit['startFormation'];
export type Posture = 'MARCH' | 'ATTACK' | 'CHARGE' | 'SCREEN' | 'WITHDRAW' | 'HOLD' | 'INERT';
export type SpeedClass = 'CAVALRY_WALK' | 'CAVALRY_TROT' | 'CAVALRY_GALLOP' |
  'DISMOUNTED_SKIRMISH' | 'PACK_TRAIN' | 'ON_FOOT';

export interface PositionMeters { x: number; y: number }

export interface UnitRuntime {
  id: string;
  unitIndex: number;
  position: PositionMeters;
  facingRadians: number;
  formation: Formation;
  mounted: boolean;
  posture: Posture;
  activeOrderId?: string;
  activeOrderIndex?: number;
  activeOrderReceivedTick?: number;
  path: PathPoint[];
  pathIndex: number;
  pathProgressMeters: number;
  speedClass: SpeedClass;
  blockedReason?: string;
  distanceMovedOnActiveOrder: number;
  fordHoldTicks: number;
  insideFord: boolean;
  transition?: { kind: 'DISMOUNT' | 'MOUNT'; remainingTicks: number };
  strengthTotal: number;
  strengthAvailable: number;
  horseHolderStrength: number;
  pursuit?: {
    targetUnitId: string;
    lastRepathTick: number;
    lastTargetPosition: PositionMeters;
    contactEmitted: boolean;
  };
}

export interface OrderDelivery {
  orderId: string;
  orderIndex: number;
  recipientUnitId: string;
  recipientUnitIndex: number;
  issueTick: number;
  arrivalTick: number;
  issuerPosition: PositionMeters;
  recipientPosition: PositionMeters;
}

export interface DeliveredOrder extends OrderDelivery {
  deliveredTick: number;
}

export interface SimState {
  tick: number;
  rng: RngState;
  units: UnitRuntime[];
  deliveryQueue: OrderDelivery[];
  deliveredOrders: DeliveredOrder[];
  emittedEventCursor: number;
}

function polygonCentroid(unit: Unit, terrain: EngineTerrain): PositionMeters {
  if (!('ring' in unit.startPosition)) {
    const [x, y] = terrain.toLocal(unit.startPosition.lat, unit.startPosition.lon);
    return { x, y };
  }
  const points = unit.startPosition.ring.map((point) => terrain.toLocal(point.lat, point.lon));
  let twiceArea = 0;
  let xMoment = 0;
  let yMoment = 0;
  for (let index = 0; index < points.length; index += 1) {
    const [x, y] = points[index];
    const [nextX, nextY] = points[(index + 1) % points.length];
    const cross = x * nextY - nextX * y;
    twiceArea += cross;
    xMoment += (x + nextX) * cross;
    yMoment += (y + nextY) * cross;
  }
  if (Math.abs(twiceArea) > 1e-9) {
    return { x: xMoment / (3 * twiceArea), y: yMoment / (3 * twiceArea) };
  }
  const sum = points.reduce((accumulator, [x, y]) => ({
    x: accumulator.x + x,
    y: accumulator.y + y,
  }), { x: 0, y: 0 });
  return { x: sum.x / points.length, y: sum.y / points.length };
}

function initialSpeedClass(unit: Unit): SpeedClass {
  if (unit.kind === 'PACK_TRAIN') return 'PACK_TRAIN';
  if (!unit.mounted) return 'ON_FOOT';
  return 'CAVALRY_WALK';
}

function issuerPosition(
  scenario: Scenario,
  units: UnitRuntime[],
  order: Order,
): PositionMeters {
  const leader = scenario.leaders.find((item) => item.id === order.issuerLeaderId);
  const attached = leader ? units.find((unit) => unit.id === leader.attachedToUnitId) : undefined;
  return attached ? { ...attached.position } : { x: 0, y: 0 };
}

export function initializeState(
  scenario: Scenario,
  terrain: EngineTerrain,
  scenarioSeed: number,
): SimState {
  const units: UnitRuntime[] = scenario.units.map((unit, unitIndex) => {
    const position = polygonCentroid(unit, terrain);
    return {
      id: unit.id,
      unitIndex,
      position,
      facingRadians: 0,
      formation: unit.startFormation,
      mounted: unit.mounted,
      posture: 'HOLD',
      path: [],
      pathIndex: 0,
      pathProgressMeters: 0,
      speedClass: initialSpeedClass(unit),
      distanceMovedOnActiveOrder: 0,
      fordHoldTicks: 0,
      insideFord: false,
      strengthTotal: unit.strength.best,
      strengthAvailable: unit.strength.best,
      horseHolderStrength: 0,
    };
  });
  const deliveries: OrderDelivery[] = [];
  scenario.orders.forEach((order, orderIndex) => {
    const leader = scenario.leaders.find((item) => item.id === order.issuerLeaderId);
    if (!leader) throw new Error(`Order ${order.id} has no issuer leader`);
    const side = scenario.sides.find((item) => item.id === leader.sideId);
    if (!side) throw new Error(`Leader ${leader.id} has no side`);
    const delayMinutes = side.commandModel === 'CONSENSUS_INITIATIVE'
      ? 0
      : order.transmissionMinutes + leader.ratings.orderDelayMinutes;
    const issueTick = minuteToTick(order.issuedAtMinute, scenario.clock.tickSeconds);
    const arrivalTick = issueTick + minuteToTick(delayMinutes, scenario.clock.tickSeconds);
    order.recipientUnitIds.forEach((recipientUnitId) => {
      const recipientUnitIndex = units.findIndex((unit) => unit.id === recipientUnitId);
      if (recipientUnitIndex < 0) throw new Error(`Order ${order.id} has no recipient ${recipientUnitId}`);
      deliveries.push({
        orderId: order.id,
        orderIndex,
        recipientUnitId,
        recipientUnitIndex,
        issueTick,
        arrivalTick,
        issuerPosition: issuerPosition(scenario, units, order),
        recipientPosition: { ...units[recipientUnitIndex].position },
      });
    });
  });
  return {
    tick: 0,
    rng: createRngState(scenarioSeed),
    units,
    deliveryQueue: deliveries,
    deliveredOrders: [],
    emittedEventCursor: 0,
  };
}
