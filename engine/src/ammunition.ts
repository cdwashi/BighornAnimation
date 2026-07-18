import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { CombatConfig } from './combat-config.js';
import { emitEvent, type SimEvent } from './events.js';
import type { SimState } from './state.js';

/** D68 proximity resupply, deterministically capped by the pack reserve. */
export function updateResupply(
  scenario: Scenario,
  state: SimState,
  config: CombatConfig,
  events: SimEvent[],
): void {
  const packs = state.units.filter((unit) => scenario.units[unit.unitIndex].kind === 'PACK_TRAIN' &&
    unit.endState !== 'DESTROYED');
  for (const pack of packs) {
    const sideId = scenario.units[pack.unitIndex].sideId;
    for (const unit of state.units) {
      if (unit.id === pack.id || unit.endState === 'DESTROYED' ||
        unit.moraleState === 'ROUTED' ||
        scenario.units[unit.unitIndex].sideId !== sideId || Math.hypot(
          unit.position.x - pack.position.x,
          unit.position.y - pack.position.y,
        ) > config.resupplyRadiusMeters) continue;
      let budget = config.resupplyRoundsPerTick;
      for (const weaponId of Object.keys(unit.initialAmmunition).sort()) {
        const reserve = pack.ammunition[weaponId] ?? 0;
        const need = Math.max(0, unit.initialAmmunition[weaponId] - (unit.ammunition[weaponId] ?? 0));
        const transfer = Math.min(reserve, need, budget);
        if (transfer <= 0) continue;
        pack.ammunition[weaponId] -= transfer;
        unit.ammunition[weaponId] = (unit.ammunition[weaponId] ?? 0) + transfer;
        budget -= transfer;
        state.emittedEventCursor = emitEvent(events, {
          tick: state.tick, type: 'ammo-resupplied', unitId: unit.id,
          targetUnitId: pack.id, weaponId, rounds: transfer,
        }, state.emittedEventCursor);
        if (budget <= 0) break;
      }
    }
  }
}
