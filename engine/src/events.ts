export type SimEventType =
  | 'order-received'
  | 'move-started'
  | 'waypoint-reached'
  | 'ford-crossing'
  | 'dismounted'
  | 'mounted'
  | 'order-superseded'
  | 'arrived'
  | 'contact-pending'
  | 'camp-defense-activated'
  | 'resupply-proximity'
  | 'move-blocked'
  | 'engagement-state'
  | 'casualty-resolution'
  | 'leader-killed'
  | 'unit-destroyed'
  | 'scout-withdrawal-started'
  | 'scout-withdrew-off-field'
  | 'morale-state'
  | 'weapon-malfunction'
  | 'weapon-cleared'
  | 'ammo-resupplied'
  | 'courier-departed'
  | 'courier-delivered'
  | 'courier-killed'
  | 'pursuit-started'
  | 'pursuit-ended'
  | 'initiative-retargeted'
  | 'rout-reintegrated';

export interface SimEvent {
  sequence: number;
  tick: number;
  type: SimEventType;
  unitId: string;
  orderId?: string;
  supersededOrderId?: string;
  waypointIndex?: number;
  reason?: string;
  campUnitId?: string;
  threatUnitId?: string;
  targetUnitId?: string;
  engagementId?: string;
  engagementState?: string;
  casualties?: number;
  /** D81 additive split; casualties remains killed + wounded for old consumers. */
  killed?: number;
  wounded?: number;
  position?: { x: number; y: number };
  leaderId?: string;
  moraleState?: string;
  weaponId?: string;
  rounds?: number;
  courierId?: string;
}

export function emitEvent(
  events: SimEvent[],
  event: Omit<SimEvent, 'sequence'>,
  sequence: number,
): number {
  events.push({ ...event, sequence });
  return sequence + 1;
}
