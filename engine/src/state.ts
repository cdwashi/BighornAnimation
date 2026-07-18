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

export interface BelievedContact {
  status: 'spotted' | 'lastKnown' | 'never';
  lastSeenTick: number;
  lastSeenPos: PositionMeters;
}

export interface ObserverContact extends BelievedContact {
  observerUnitId: string;
  observerSideId: string;
  targetUnitId: string;
}

export type MoraleState = 'STEADY' | 'SHAKEN' | 'BROKEN' | 'ROUTED';
export type EngagementState = 'APPROACH' | 'FIREFIGHT' | 'CHARGE' | 'MELEE' |
  'PURSUIT' | 'WITHDRAWAL' | 'ROUT' | 'DESTRUCTION' | 'DISENGAGE';
export type RangeBand = 'MELEE' | 'CLOSE' | 'MEDIUM' | 'LONG' | 'OUT_OF_RANGE';

export interface EngagementDescriptor {
  id: string;
  unitIds: [string, string];
  state: EngagementState;
  rangeMeters: number;
  rangeBand: RangeBand;
  intensity: number;
  active: boolean;
  startedTick: number;
  updatedTick: number;
}

export interface LeaderRuntime {
  id: string;
  alive: boolean;
  killedTick?: number;
  position?: PositionMeters;
}

export interface CourierRuntime {
  id: string;
  name: string;
  sideId: string;
  orderIndex: number;
  departureTick: number;
  position: PositionMeters;
  path: PathPoint[];
  pathIndex: number;
  active: boolean;
  alive: boolean;
  delivered: boolean;
  deliveredTick?: number;
}

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
  strengthCurrent: number;
  casualties: number;
  strengthAvailable: number;
  horseHolderStrength: number;
  pursuit?: {
    kind?: 'ORDER' | 'COMBAT' | 'INITIATIVE';
    targetUnitId: string;
    lastRepathTick: number;
    lastTargetPosition: PositionMeters;
    contactEmitted: boolean;
    lastRangeMeters?: number;
    losingTicks?: number;
    complexUnitIds?: string[];
  };
  initiativeRetargetPending?: boolean;
  initiativeComplexUnitIds?: string[];
  pursuitTerminatedTick?: number;
  routSafetyPath?: boolean;
  scoutWithdrawal?: boolean;
  withdrawnOffField?: boolean;
  defaultBehavior?: 'DEFEND_CAMP';
  campDefense?: { campUnitId: string; threatUnitId: string };
  lastMovedTick?: number;
  lastSpottingSweepTick?: number;
  morale: number;
  moraleState: MoraleState;
  cohesion: number;
  fatigue: number;
  ammunition: Record<string, number>;
  initialAmmunition: Record<string, number>;
  jammedWeapons: Record<string, Array<number>>;
  suppression: number;
  flankedThisTick: boolean;
  casualtiesThisTick: number;
  endState?: 'DESTROYED';
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
  courierId?: string;
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
  observerContacts: Record<string, ObserverContact>;
  believedPictures: Record<string, Record<string, BelievedContact>>;
  engagements: EngagementDescriptor[];
  engagementActive: boolean;
  leaders: LeaderRuntime[];
  couriers: CourierRuntime[];
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
  combatEnabled = true,
): SimState {
  const scheduledUnitIds = new Set(
    scenario.orders.flatMap((order) => order.recipientUnitIds),
  );
  const units: UnitRuntime[] = scenario.units.map((unit, unitIndex) => {
    const position = polygonCentroid(unit, terrain);
    const ammunition = Object.fromEntries(Object.entries(unit.ammunition).map(([weaponId, estimate]) => [
      weaponId,
      unit.kind === 'PACK_TRAIN'
        ? Math.floor(estimate.best)
        : Math.floor(estimate.best * unit.strength.best * (unit.weaponMix[weaponId] ?? 0)),
    ]));
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
      strengthCurrent: unit.strength.best,
      casualties: 0,
      strengthAvailable: unit.strength.best,
      horseHolderStrength: 0,
      // TODO-AMBIGUOUS(M3-A): the schema has DEFEND_CAMP as an order type but
      // no explicit default-behavior field. Treat only otherwise-unscheduled
      // warrior bands as the idle defensive pools described by D47.
      defaultBehavior: unit.kind === 'WARRIOR_BAND' && !scheduledUnitIds.has(unit.id)
        ? 'DEFEND_CAMP'
        : undefined,
      morale: unit.baseMorale,
      moraleState: unit.baseMorale >= 70 ? 'STEADY' : unit.baseMorale >= 40 ? 'SHAKEN' : 'BROKEN',
      cohesion: 100,
      fatigue: 0,
      ammunition,
      initialAmmunition: { ...ammunition },
      jammedWeapons: {},
      suppression: 0,
      flankedThisTick: false,
      casualtiesThisTick: 0,
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
      const courierId = combatEnabled && side.commandModel === 'HIERARCHICAL' &&
        order.transmissionMinutes > 0 ? `courier:${order.id}` : undefined;
      deliveries.push({
        orderId: order.id,
        orderIndex,
        recipientUnitId,
        recipientUnitIndex,
        issueTick,
        arrivalTick,
        issuerPosition: issuerPosition(scenario, units, order),
        recipientPosition: { ...units[recipientUnitIndex].position },
        courierId,
      });
    });
  });
  const courierOrders = new Map<number, OrderDelivery>();
  for (const delivery of deliveries) {
    if (delivery.courierId && !courierOrders.has(delivery.orderIndex)) {
      courierOrders.set(delivery.orderIndex, delivery);
    }
  }
  const couriers: CourierRuntime[] = [...courierOrders.values()].map((delivery) => ({
    id: delivery.courierId as string,
    name: delivery.orderId === 'kanipe-msg' ? 'Sgt. Kanipe' :
      delivery.orderId === 'martini-msg' ? 'Trumpeter Martini' : `Courier (${delivery.orderId})`,
    sideId: scenario.leaders.find((leader) => leader.id === scenario.orders[delivery.orderIndex].issuerLeaderId)?.sideId ?? '',
    orderIndex: delivery.orderIndex,
    departureTick: delivery.issueTick + minuteToTick(
      scenario.leaders.find((leader) => leader.id === scenario.orders[delivery.orderIndex].issuerLeaderId)?.ratings.orderDelayMinutes ?? 0,
      scenario.clock.tickSeconds,
    ),
    position: { ...delivery.issuerPosition },
    path: [],
    pathIndex: 0,
    active: false,
    alive: true,
    delivered: false,
  }));
  return {
    tick: 0,
    rng: createRngState(scenarioSeed),
    units,
    deliveryQueue: deliveries,
    deliveredOrders: [],
    observerContacts: {},
    believedPictures: Object.fromEntries(scenario.sides.map((side) => [side.id, {}])),
    engagements: [],
    engagementActive: false,
    leaders: scenario.leaders.map((leader) => ({ id: leader.id, alive: true })),
    couriers,
    emittedEventCursor: 0,
  };
}
