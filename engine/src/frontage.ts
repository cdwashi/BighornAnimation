import type { Scenario } from '../../src/schema/scenario-schema.js';
import { DEFAULT_COMBAT_CONFIG } from './combat-config.js';
import type { UnitRuntime } from './state.js';

/**
 * D102's reusable cavalry occupancy primitive. Warriors remain point entities
 * until their ground/feature extents arrive with the separately ruled bundle.
 */
export function frontageMeters(
  unit: UnitRuntime,
  scenario: Scenario,
  metersPerFiringMan = DEFAULT_COMBAT_CONFIG.metersPerFiringMan,
): number {
  const source = scenario.units[unit.unitIndex];
  if (!source || source.kind === 'WARRIOR_BAND' || unit.mounted || unit.formation !== 'SKIRMISH') return 0;
  return unit.strengthAvailable * metersPerFiringMan;
}
