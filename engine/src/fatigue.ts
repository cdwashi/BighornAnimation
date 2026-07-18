import type { CombatConfig } from './combat-config.js';
import type { SimState } from './state.js';

/** D69 fatigue-lite: gallop/melee spend, halt recovery, serialized 0..100 pool. */
export function updateFatigue(state: SimState, config: CombatConfig): void {
  for (const unit of state.units) {
    if (unit.endState === 'DESTROYED') continue;
    const inMelee = state.engagements.some((engagement) =>
      engagement.active && engagement.state === 'MELEE' && engagement.unitIds.includes(unit.id));
    const moved = unit.lastMovedTick === state.tick;
    let delta = 0;
    if (moved && unit.speedClass === 'CAVALRY_GALLOP') delta += config.fatigueGallopPerTick;
    if (inMelee) delta += config.fatigueMeleePerTick;
    if (!moved && !inMelee) delta -= config.fatigueHaltRecoveryPerTick;
    unit.fatigue = Math.max(0, Math.min(100, unit.fatigue + delta));
    if (unit.fatigue >= config.fatigueSpeedCapThreshold &&
      unit.speedClass === 'CAVALRY_GALLOP') unit.speedClass = 'CAVALRY_TROT';
  }
}
