import { describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import type { Order, Scenario } from '../src/schema/scenario-schema.js';
import { validateScenario } from '../src/validate.js';

const scenario = scenarioData as unknown as Scenario;

type JsonRecord = Record<string, unknown>;

const isRecord = (value: unknown): value is JsonRecord =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function walk(value: unknown, visit: (record: JsonRecord, path: string) => void, path = '$'): void {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, visit, `${path}[${index}]`));
    return;
  }
  if (!isRecord(value)) return;
  visit(value, path);
  Object.entries(value).forEach(([key, child]) => walk(child, visit, `${path}.${key}`));
}

const expectUnique = (values: string[]): void => {
  expect(new Set(values).size).toBe(values.length);
};

describe('Little Bighorn scenario data integrity', () => {
  it('1. scenario.json parses and passes the structural validator against the schema', () => {
    const result = validateScenario(scenarioData);
    expect(result.errors).toEqual([]);
    expect(result.valid).toBe(true);
  });

  it('2. every ID reference resolves', () => {
    const sideIds = new Set(scenario.sides.map(({ id }) => id));
    const leaderIds = new Set(scenario.leaders.map(({ id }) => id));
    const unitIds = new Set(scenario.units.map(({ id }) => id));
    const weaponIds = new Set(Object.keys(scenario.weapons));
    const tacticsIds = new Set(Object.keys(scenario.tacticsProfiles));
    const orderIds = new Set(scenario.orders.map(({ id }) => id));
    const checkpointIds = new Set(scenario.checkpoints.map(({ id }) => id));
    const landmarkIds = new Set(scenario.terrain.landmarks.map(({ id }) => id));
    const riverIds = new Set(scenario.terrain.rivers.map(({ id }) => id));
    const variantIds = new Set(scenario.variants.map(({ id }) => id));
    const bibliographyKeys = new Set(Object.keys(scenario.meta.bibliography));

    expectUnique(scenario.sides.map(({ id }) => id));
    expectUnique(scenario.leaders.map(({ id }) => id));
    expectUnique(scenario.units.map(({ id }) => id));
    expectUnique(scenario.orders.map(({ id }) => id));
    expectUnique(scenario.checkpoints.map(({ id }) => id));
    expectUnique(scenario.variants.map(({ id }) => id));
    expectUnique(scenario.terrain.landmarks.map(({ id }) => id));

    scenario.leaders.forEach((leader) => {
      expect(sideIds.has(leader.sideId), `${leader.id}.sideId`).toBe(true);
      expect(unitIds.has(leader.attachedToUnitId), `${leader.id}.attachedToUnitId`).toBe(true);
    });

    scenario.units.forEach((unit) => {
      expect(sideIds.has(unit.sideId), `${unit.id}.sideId`).toBe(true);
      expect(tacticsIds.has(unit.tacticsProfileId), `${unit.id}.tacticsProfileId`).toBe(true);
      if (unit.commandingLeaderId) {
        expect(leaderIds.has(unit.commandingLeaderId), `${unit.id}.commandingLeaderId`).toBe(true);
      }
      Object.keys(unit.weaponMix).forEach((id) => expect(weaponIds.has(id), `${unit.id}.weaponMix.${id}`).toBe(true));
      Object.keys(unit.ammunition).forEach((id) => expect(weaponIds.has(id), `${unit.id}.ammunition.${id}`).toBe(true));
    });

    const assertOrderReferences = (order: Order, path: string): void => {
      expect(leaderIds.has(order.issuerLeaderId), `${path}.issuerLeaderId`).toBe(true);
      order.recipientUnitIds.forEach((id) => expect(unitIds.has(id), `${path}.recipientUnitIds.${id}`).toBe(true));
      if (order.objective?.landmarkId) expect(landmarkIds.has(order.objective.landmarkId), `${path}.landmarkId`).toBe(true);
      if (order.objective?.targetUnitId) expect(unitIds.has(order.objective.targetUnitId), `${path}.targetUnitId`).toBe(true);
    };
    scenario.orders.forEach((order) => assertOrderReferences(order, `orders.${order.id}`));

    scenario.checkpoints.forEach((checkpoint) => expect(unitIds.has(checkpoint.unitId), `${checkpoint.id}.unitId`).toBe(true));
    scenario.observationEvents.forEach((event) => {
      if (event.observerLeaderId) expect(leaderIds.has(event.observerLeaderId), `${event.id}.observerLeaderId`).toBe(true);
      if (event.observerUnitId) expect(unitIds.has(event.observerUnitId), `${event.id}.observerUnitId`).toBe(true);
      if (event.target.unitId) expect(unitIds.has(event.target.unitId), `${event.id}.target.unitId`).toBe(true);
      if (event.target.landmarkId) expect(landmarkIds.has(event.target.landmarkId), `${event.id}.target.landmarkId`).toBe(true);
    });

    scenario.terrain.historicalCorrections.forEach((correction) => {
      if (correction.replaces) expect(riverIds.has(correction.replaces), `${correction.id}.replaces`).toBe(true);
    });

    scenario.variants.forEach((variant) => {
      variant.excludesVariantIds.forEach((id) => expect(variantIds.has(id), `${variant.id}.excludes.${id}`).toBe(true));
      variant.patch.removeOrderIds?.forEach((id) => expect(orderIds.has(id), `${variant.id}.removeOrderIds.${id}`).toBe(true));
      variant.patch.removeCheckpointIds?.forEach((id) => expect(checkpointIds.has(id), `${variant.id}.removeCheckpointIds.${id}`).toBe(true));
      variant.patch.modifyOrders?.forEach(({ id, changes }) => {
        expect(orderIds.has(id), `${variant.id}.modifyOrders.${id}`).toBe(true);
        if (changes.issuerLeaderId) expect(leaderIds.has(changes.issuerLeaderId), `${variant.id}.${id}.issuerLeaderId`).toBe(true);
        changes.recipientUnitIds?.forEach((unitId) => expect(unitIds.has(unitId), `${variant.id}.${id}.recipientUnitIds.${unitId}`).toBe(true));
        if (changes.objective?.landmarkId) expect(landmarkIds.has(changes.objective.landmarkId), `${variant.id}.${id}.landmarkId`).toBe(true);
        if (changes.objective?.targetUnitId) expect(unitIds.has(changes.objective.targetUnitId), `${variant.id}.${id}.targetUnitId`).toBe(true);
      });
      variant.patch.modifyUnits?.forEach(({ id, changes }) => {
        expect(unitIds.has(id), `${variant.id}.modifyUnits.${id}`).toBe(true);
        if (changes.tacticsProfileId) expect(tacticsIds.has(changes.tacticsProfileId), `${variant.id}.${id}.tacticsProfileId`).toBe(true);
        if (changes.commandingLeaderId) expect(leaderIds.has(changes.commandingLeaderId), `${variant.id}.${id}.commandingLeaderId`).toBe(true);
        Object.keys(changes.weaponMix ?? {}).forEach((weaponId) => expect(weaponIds.has(weaponId), `${variant.id}.${id}.weaponMix.${weaponId}`).toBe(true));
        Object.keys(changes.ammunition ?? {}).forEach((weaponId) => expect(weaponIds.has(weaponId), `${variant.id}.${id}.ammunition.${weaponId}`).toBe(true));
      });
      variant.patch.addOrders?.forEach((order) => assertOrderReferences(order, `${variant.id}.addOrders.${order.id}`));
      variant.patch.addCheckpoints?.forEach((checkpoint) => expect(unitIds.has(checkpoint.unitId), `${variant.id}.addCheckpoints.${checkpoint.id}`).toBe(true));
    });

    Object.keys(scenario.calibration.casualties).forEach((id) => expect(unitIds.has(id), `calibration.casualties.${id}`).toBe(true));
    scenario.calibration.endState.forEach((state) => {
      expect(unitIds.has(state.unitId), `calibration.endState.${state.unitId}`).toBe(true);
      if (state.landmarkId) expect(landmarkIds.has(state.landmarkId), `calibration.endState.${state.landmarkId}`).toBe(true);
    });

    walk(scenarioData, (record, path) => {
      if (!Array.isArray(record.sources)) return;
      record.sources.forEach((source, index) => {
        expect(isRecord(source), `${path}.sources[${index}]`).toBe(true);
        if (isRecord(source)) expect(bibliographyKeys.has(String(source.key)), `${path}.sources[${index}].key`).toBe(true);
      });
    });
  });

  it('3. all minutes are within [0, 1080] and the 03:00–21:00 clock is consistent', () => {
    const minuteKeys = new Set([
      'minute',
      'issuedAtMinute',
      'byMinute',
      'transmissionMinutes',
      'orderDelayMinutes',
      'crossingPenaltyMinutes',
      'toleranceMinutes',
    ]);
    const toMinutes = (clock: string): number => {
      const [hours, minutes] = clock.split(':').map(Number);
      return hours * 60 + minutes;
    };
    expect(toMinutes(scenario.clock.end) - toMinutes(scenario.clock.start)).toBe(1080);
    walk(scenarioData, (record, path) => {
      Object.entries(record).forEach(([key, value]) => {
        if (minuteKeys.has(key)) {
          expect(typeof value, `${path}.${key}`).toBe('number');
          expect(value as number, `${path}.${key}`).toBeGreaterThanOrEqual(0);
          expect(value as number, `${path}.${key}`).toBeLessThanOrEqual(1080);
        }
      });
    });
  });

  it('4. every Estimate satisfies low <= best <= high', () => {
    walk(scenarioData, (record, path) => {
      if (typeof record.low !== 'number' || typeof record.best !== 'number' || typeof record.high !== 'number') return;
      expect(record.low, `${path}.low<=best`).toBeLessThanOrEqual(record.best);
      expect(record.best, `${path}.best<=high`).toBeLessThanOrEqual(record.high);
    });
  });

  it('5. weaponMix fractions are each within [0,1], without a sum constraint', () => {
    scenario.units.forEach((unit) => Object.entries(unit.weaponMix).forEach(([weaponId, fraction]) => {
      expect(fraction, `${unit.id}.weaponMix.${weaponId}`).toBeGreaterThanOrEqual(0);
      expect(fraction, `${unit.id}.weaponMix.${weaponId}`).toBeLessThanOrEqual(1);
    }));
    expect(Object.values(scenario.units.find(({ id }) => id === 'co-a')?.weaponMix ?? {}).reduce((sum, value) => sum + value, 0)).toBe(2);
  });

  it('6. all coordinates are within DEM bounds', () => {
    const { sw, ne } = scenario.terrain.dem.bounds;
    walk(scenarioData, (record, path) => {
      if (typeof record.lat !== 'number' || typeof record.lon !== 'number') return;
      expect(record.lat, `${path}.lat`).toBeGreaterThanOrEqual(sw.lat);
      expect(record.lat, `${path}.lat`).toBeLessThanOrEqual(ne.lat);
      expect(record.lon, `${path}.lon`).toBeGreaterThanOrEqual(sw.lon);
      expect(record.lon, `${path}.lon`).toBeLessThanOrEqual(ne.lon);
    });
  });

  it('7. rangeBands ascend strictly and hitProbability is within [0,1]', () => {
    Object.values(scenario.weapons).forEach((weapon) => {
      weapon.rangeBands.forEach((band, index) => {
        if (index > 0) expect(band.maxRangeMeters, `${weapon.id}.rangeBands[${index}]`).toBeGreaterThan(weapon.rangeBands[index - 1].maxRangeMeters);
        expect(band.hitProbability, `${weapon.id}.rangeBands[${index}].hitProbability`).toBeGreaterThanOrEqual(0);
        expect(band.hitProbability, `${weapon.id}.rangeBands[${index}].hitProbability`).toBeLessThanOrEqual(1);
      });
    });
  });

  it('8. every record with provenance has confidence and at least one source', () => {
    walk(scenarioData, (record, path) => {
      ['provenance', 'ratingsProvenance'].forEach((key) => {
        if (!(key in record)) return;
        const provenance = record[key];
        expect(isRecord(provenance), `${path}.${key}`).toBe(true);
        if (!isRecord(provenance)) return;
        expect(['HIGH', 'MEDIUM', 'LOW', 'DISPUTED']).toContain(provenance.confidence);
        expect(Array.isArray(provenance.sources), `${path}.${key}.sources`).toBe(true);
        expect((provenance.sources as unknown[]).length, `${path}.${key}.sources`).toBeGreaterThanOrEqual(1);
      });
    });
  });

  it('9. variant exclusion groups are symmetric', () => {
    const byId = new Map(scenario.variants.map((variant) => [variant.id, variant]));
    scenario.variants.forEach((variant) => variant.excludesVariantIds.forEach((excludedId) => {
      expect(byId.get(excludedId)?.excludesVariantIds).toContain(variant.id);
    }));
  });

  it('10. expected entity counts match exactly', () => {
    expect(scenario.units).toHaveLength(33);
    expect(scenario.leaders).toHaveLength(18);
    expect(Object.keys(scenario.weapons)).toHaveLength(6);
    expect(Object.keys(scenario.tacticsProfiles)).toHaveLength(3);
    expect(scenario.orders).toHaveLength(22);
    expect(scenario.checkpoints).toHaveLength(10);
    expect(scenario.observationEvents).toHaveLength(9);
    expect(scenario.variants).toHaveLength(7);
    expect(scenario.terrain.landmarks.length).toBeGreaterThanOrEqual(20);
  });

  it('11. counterfactual variants carry the calibration-exclusion note', () => {
    ['v-reno-holds-timber', 'v-benteen-prompt'].forEach((id) => {
      const variant = scenario.variants.find((item) => item.id === id);
      expect(variant?.provenance.note, id).toContain('counterfactual: excluded from calibration scoring');
    });
  });
});
