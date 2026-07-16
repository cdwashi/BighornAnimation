import type {
  CalibrationTargets,
  Checkpoint,
  Leader,
  Order,
  Scenario,
  TacticsProfile,
  Unit,
} from '../schema/scenario-schema.js';

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function replaceById<T extends { id: string }>(
  records: T[],
  id: string,
  changes: Partial<T>,
  kind: string,
): void {
  const index = records.findIndex((record) => record.id === id);
  if (index < 0) throw new Error(`Variant patch references missing ${kind} ${id}`);
  records[index] = { ...records[index], ...clone(changes) };
}

function addUnique<T extends { id: string }>(records: T[], additions: T[], kind: string): void {
  for (const addition of additions) {
    if (records.some((record) => record.id === addition.id)) {
      throw new Error(`Variant patch adds duplicate ${kind} ${addition.id}`);
    }
    records.push(clone(addition));
  }
}

function removeIds<T extends { id: string }>(records: T[], ids: string[], kind: string): T[] {
  for (const id of ids) {
    if (!records.some((record) => record.id === id)) {
      throw new Error(`Variant patch removes missing ${kind} ${id}`);
    }
  }
  const removed = new Set(ids);
  return records.filter((record) => !removed.has(record.id));
}

/** Apply enabled v0.2 overlays in their declared scenario order to an isolated copy. */
export function applyVariants(scenario: Scenario, enabledVariantIds: readonly string[]): Scenario {
  const enabled = new Set(enabledVariantIds);
  if (enabled.size !== enabledVariantIds.length) throw new Error('A variant was enabled more than once');

  for (const id of enabledVariantIds) {
    if (!scenario.variants.some((variant) => variant.id === id)) {
      throw new Error(`Unknown variant ${id}`);
    }
  }
  for (const variant of scenario.variants) {
    if (!enabled.has(variant.id)) continue;
    for (const excludedId of variant.excludesVariantIds) {
      if (enabled.has(excludedId)) {
        throw new Error(`Conflicting variants enabled: ${variant.id} and ${excludedId}`);
      }
    }
  }

  const result = clone(scenario);
  for (const variant of scenario.variants) {
    if (!enabled.has(variant.id)) continue;
    const patch = variant.patch;
    addUnique<Order>(result.orders, patch.addOrders ?? [], 'order');
    result.orders = removeIds(result.orders, patch.removeOrderIds ?? [], 'order');
    for (const change of patch.modifyOrders ?? []) {
      replaceById(result.orders, change.id, change.changes, 'order');
    }

    addUnique<Checkpoint>(result.checkpoints, patch.addCheckpoints ?? [], 'checkpoint');
    result.checkpoints = removeIds(
      result.checkpoints,
      patch.removeCheckpointIds ?? [],
      'checkpoint',
    );
    addUnique<Unit>(result.units, patch.addUnits ?? [], 'unit');
    for (const change of patch.modifyUnits ?? []) {
      replaceById(result.units, change.id, change.changes, 'unit');
    }
    for (const change of patch.modifyLeaders ?? []) {
      replaceById<Leader>(result.leaders, change.id, change.changes, 'leader');
    }
    for (const profile of patch.addTacticsProfiles ?? []) {
      if (result.tacticsProfiles[profile.id]) {
        throw new Error(`Variant patch adds duplicate tactics profile ${profile.id}`);
      }
      result.tacticsProfiles[profile.id] = clone<TacticsProfile>(profile);
    }
    for (const change of patch.modifyEndStates ?? []) {
      const states = result.calibration.endState;
      const index = states.findIndex((state) => state.unitId === change.unitId);
      if (index < 0) {
        throw new Error(`Variant patch references missing end state for ${change.unitId}`);
      }
      states[index] = {
        ...states[index],
        ...clone<Partial<CalibrationTargets['endState'][number]>>(change.changes),
      };
    }
  }
  return result;
}
