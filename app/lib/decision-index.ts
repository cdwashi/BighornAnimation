import type { Scenario } from '../../src/schema/scenario-schema';
import { minuteToTick, tickToWallClock } from '../../engine/src/clock';
import type { SimEvent } from '../../engine/src/events';

export interface DecisionEntry {
  id: string;
  tick: number;
  wallClock: string;
  issuerLeaderId: string;
  label: string;
  recipients: string[];
  kind: 'order' | 'emergent';
  orderId?: string;
}

export function decisionKindLabel(kind: DecisionEntry['kind']): 'ORDER' | 'EMERGENT' {
  return kind === 'order' ? 'ORDER' : 'EMERGENT';
}

function orderLabel(order: Scenario['orders'][number]): string {
  if (order.id === 'martini-msg') return 'Cooke note: come on — be quick — bring packs';
  if (order.historicalText && !order.historicalText.startsWith('BASELINE')) {
    return order.historicalText.length > 66
      ? `${order.historicalText.slice(0, 63)}…`
      : order.historicalText;
  }
  return `${order.type.replaceAll('_', ' ').toLowerCase()} · ${order.id.replaceAll('-', ' ')}`;
}

export function buildDecisionIndex(
  scenario: Scenario,
  events: readonly SimEvent[],
): DecisionEntry[] {
  const orders = scenario.orders.map((order): DecisionEntry => {
    const tick = minuteToTick(order.issuedAtMinute, scenario.clock.tickSeconds);
    return {
      id: `order:${order.id}`,
      orderId: order.id,
      tick,
      wallClock: tickToWallClock(scenario.clock.start, tick, scenario.clock.tickSeconds),
      issuerLeaderId: order.issuerLeaderId,
      label: orderLabel(order),
      recipients: [...order.recipientUnitIds],
      kind: 'order',
    };
  });
  const campActivations = events
    .filter((event) => event.type === 'camp-defense-activated')
    .map((event): DecisionEntry => ({
      id: `camp:${event.sequence}`,
      tick: event.tick,
      wallClock: tickToWallClock(scenario.clock.start, event.tick, scenario.clock.tickSeconds),
      issuerLeaderId: scenario.leaders.find(
        (leader) => leader.attachedToUnitId === event.unitId,
      )?.id ?? 'sitting-bull',
      label: `Camp defense activates · ${event.unitId}`,
      recipients: [event.unitId],
      kind: 'emergent',
    }));
  const leaderDeaths = events
    .filter((event) => event.type === 'leader-killed' && event.leaderId)
    .map((event): DecisionEntry => {
      const leader = scenario.leaders.find((candidate) => candidate.id === event.leaderId);
      return {
        id: `leader-death:${event.sequence}`,
        tick: event.tick,
        wallClock: tickToWallClock(scenario.clock.start, event.tick, scenario.clock.tickSeconds),
        issuerLeaderId: event.leaderId as string,
        label: `Leader killed · ${leader?.name ?? event.leaderId}`,
        recipients: [event.unitId],
        kind: 'emergent',
      };
    });
  return [...orders, ...campActivations, ...leaderDeaths].sort((left, right) =>
    left.tick - right.tick || (left.kind === 'order' ? -1 : 1) || left.id.localeCompare(right.id));
}
