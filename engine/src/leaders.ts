import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { CombatConfig } from './combat-config.js';
import { minuteToTick } from './clock.js';
import { emitEvent, type SimEvent } from './events.js';
import { nextRandom } from './rng.js';
import type { SimState } from './state.js';

function appendEvent(state: SimState, events: SimEvent[], event: Omit<SimEvent, 'sequence'>): void {
  state.emittedEventCursor = emitEvent(events, event, state.emittedEventCursor);
}

/** D67 leader exposure is emergent and only rolled when the attached unit takes hits. */
export function resolveLeaderExposure(
  scenario: Scenario,
  state: SimState,
  config: CombatConfig,
  userSeed: number,
  events: SimEvent[],
): void {
  for (const leader of scenario.leaders) {
    const runtime = state.leaders.find((item) => item.id === leader.id);
    const attached = state.units.find((unit) => unit.id === leader.attachedToUnitId);
    if (!runtime?.alive || !attached || attached.casualtiesThisTick <= 0) continue;
    const engagement = state.engagements.find((item) => item.active && item.unitIds.includes(attached.id));
    let probability = attached.casualtiesThisTick * config.leaderExposurePerHit;
    if (engagement?.state === 'MELEE' || engagement?.state === 'CHARGE') {
      probability *= config.leaderMeleeExposureMultiplier;
    }
    if (leader.traits.includes('leads-by-example') || leader.traits.includes('decisive-charge')) {
      probability *= config.leaderTraitExposureMultiplier;
    }
    const [roll, next] = nextRandom(state.rng, userSeed);
    state.rng = next;
    if (roll >= Math.min(1, probability)) continue;
    runtime.alive = false;
    runtime.killedTick = state.tick;
    runtime.position = { ...attached.position };
    attached.morale = Math.max(0, attached.morale - config.moraleLeaderLossDrain);
    for (const nearby of state.units) {
      if (scenario.units[nearby.unitIndex].sideId !== leader.sideId) continue;
      if (Math.hypot(nearby.position.x - attached.position.x, nearby.position.y - attached.position.y) <=
        config.leaderInfluenceRadiusMeters) {
        nearby.morale = Math.max(0, nearby.morale - config.moraleLeaderLossDrain / 2);
      }
    }
    const bumpTicks = minuteToTick(config.leaderOrderDelayBumpMinutes, scenario.clock.tickSeconds);
    for (const delivery of state.deliveryQueue) {
      const order = scenario.orders[delivery.orderIndex];
      if (order.issuerLeaderId === leader.id && delivery.issueTick > state.tick) {
        delivery.arrivalTick += bumpTicks;
        const courier = delivery.courierId
          ? state.couriers.find((item) => item.id === delivery.courierId)
          : undefined;
        if (courier) courier.departureTick += bumpTicks;
      }
    }
    appendEvent(state, events, {
      tick: state.tick, type: 'leader-killed', unitId: attached.id, leaderId: leader.id,
      casualties: 1, position: { ...attached.position },
    });
  }
}
