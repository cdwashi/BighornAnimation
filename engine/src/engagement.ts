import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import type { EngagementDescriptor, EngagementState, RangeBand, SimState } from './state.js';

interface ContactEntity {
  id: string;
  sideId: string;
  position: { x: number; y: number };
  destroyed: boolean;
  courier: boolean;
}

function entities(scenario: Scenario, state: SimState): ContactEntity[] {
  return [
    ...state.units.filter((unit) => !unit.withdrawnOffField &&
      scenario.units[unit.unitIndex].kind !== 'NONCOMBATANT_CAMP').map((unit) => ({
      id: unit.id,
      sideId: scenario.units[unit.unitIndex].sideId,
      position: unit.position,
      destroyed: unit.endState === 'DESTROYED',
      courier: false,
    })),
    ...state.couriers.filter((courier) => courier.active).map((courier) => ({
      id: courier.id,
      sideId: courier.sideId,
      position: courier.position,
      destroyed: !courier.alive,
      courier: true,
    })),
  ];
}

function band(range: number, config: CombatConfig): RangeBand {
  if (range <= config.meleeRangeMeters) return 'MELEE';
  if (range <= 100) return 'CLOSE';
  if (range <= 350) return 'MEDIUM';
  if (range <= config.engagementRangeMeters) return 'LONG';
  return 'OUT_OF_RANGE';
}

function pairId(left: string, right: string): string {
  return left < right ? `${left}\u0000${right}` : `${right}\u0000${left}`;
}

function isSpotted(state: SimState, observerSideId: string, targetId: string): boolean {
  return state.believedPictures[observerSideId]?.[targetId]?.status === 'spotted';
}

function desiredState(
  state: SimState,
  left: ContactEntity,
  right: ContactEntity,
  range: number,
  config: CombatConfig,
): EngagementState {
  if (left.destroyed || right.destroyed) return 'DESTRUCTION';
  if (range <= config.meleeRangeMeters) return 'MELEE';
  const leftUnit = state.units.find((unit) => unit.id === left.id);
  const rightUnit = state.units.find((unit) => unit.id === right.id);
  const combatPursuit = leftUnit?.pursuit?.kind === 'COMBAT' &&
    leftUnit.pursuit.targetUnitId === right.id || rightUnit?.pursuit?.kind === 'COMBAT' &&
    rightUnit.pursuit.targetUnitId === left.id;
  if (combatPursuit) return 'PURSUIT';
  if (range > config.disengageRangeMeters) return 'DISENGAGE';
  if (range <= config.chargeRangeMeters &&
    (leftUnit?.posture === 'CHARGE' || rightUnit?.posture === 'CHARGE')) return 'CHARGE';
  if (leftUnit?.moraleState === 'ROUTED' || rightUnit?.moraleState === 'ROUTED') return 'ROUT';
  if (leftUnit?.posture === 'WITHDRAW' || rightUnit?.posture === 'WITHDRAW') return 'WITHDRAWAL';
  return 'FIREFIGHT';
}

function emitState(state: SimState, events: SimEvent[], engagement: EngagementDescriptor): void {
  state.emittedEventCursor = emitEvent(events, {
    tick: state.tick,
    type: 'engagement-state',
    unitId: engagement.unitIds[0],
    targetUnitId: engagement.unitIds[1],
    engagementId: engagement.id,
    engagementState: engagement.state,
    position: undefined,
  }, state.emittedEventCursor);
}

/** D63 contact state machine and the serialized descriptors consumed by M4-B. */
export function updateEngagements(
  scenario: Scenario,
  state: SimState,
  config: CombatConfig,
  events: SimEvent[],
): void {
  const all = entities(scenario, state);
  const existingById = new Map(state.engagements.map((engagement) => [engagement.id, engagement]));
  const seen = new Set<string>();
  for (let leftIndex = 0; leftIndex < all.length; leftIndex += 1) {
    const left = all[leftIndex];
    if (left.destroyed) continue;
    for (let rightIndex = leftIndex + 1; rightIndex < all.length; rightIndex += 1) {
      const right = all[rightIndex];
      if (right.destroyed || left.sideId === right.sideId || left.courier && right.courier) continue;
      const range = Math.hypot(right.position.x - left.position.x, right.position.y - left.position.y);
      const id = pairId(left.id, right.id);
      const existing = existingById.get(id);
      const contact = isSpotted(state, left.sideId, right.id) || isSpotted(state, right.sideId, left.id) ||
        state.units.some((unit) => unit.pursuit?.targetUnitId === (unit.id === left.id ? right.id : left.id) &&
          unit.pursuit.contactEmitted);
      if (!existing && (!contact || range > config.engagementRangeMeters)) continue;
      if (!existing) {
        const descriptor: EngagementDescriptor = {
          id,
          unitIds: [left.id, right.id],
          state: 'APPROACH',
          rangeMeters: range,
          rangeBand: band(range, config),
          intensity: 0,
          active: true,
          startedTick: state.tick,
          updatedTick: state.tick,
        };
        state.engagements.push(descriptor);
        emitState(state, events, descriptor);
        seen.add(id);
        continue;
      }
      seen.add(id);
      const next = desiredState(state, left, right, range, config);
      const changed = existing.state !== next;
      existing.state = next;
      existing.rangeMeters = range;
      existing.rangeBand = band(range, config);
      existing.active = !['DESTRUCTION', 'DISENGAGE'].includes(next);
      existing.updatedTick = state.tick;
      if (changed) emitState(state, events, existing);
    }
  }
  for (const engagement of state.engagements) {
    if (seen.has(engagement.id)) continue;
    if (engagement.active) {
      engagement.active = false;
      engagement.state = 'DISENGAGE';
      engagement.updatedTick = state.tick;
      emitState(state, events, engagement);
    }
  }
  state.engagementActive = state.engagements.some((engagement) => engagement.active);
}
