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
  | 'move-blocked';

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
}

export function emitEvent(
  events: SimEvent[],
  event: Omit<SimEvent, 'sequence'>,
  sequence: number,
): number {
  events.push({ ...event, sequence });
  return sequence + 1;
}
