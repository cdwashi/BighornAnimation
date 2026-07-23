import { describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import type { Order, Scenario, Unit } from '../src/schema/scenario-schema.js';
import { validateScenario } from '../src/validate.js';

const scenario = scenarioData as unknown as Scenario;
const remainingTodoAmbiguities = (JSON.stringify(scenarioData).match(/TODO-AMBIGUOUS/g) ?? []).length;

console.info(`[metric] remaining TODO-AMBIGUOUS count: ${remainingTodoAmbiguities}`);

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
    expect(scenario.meta.schemaVersion).toBe('0.2');
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

    const assertUnitReferences = (
      unit: Unit,
      path: string,
      availableTacticsIds = tacticsIds,
    ): void => {
      expect(sideIds.has(unit.sideId), `${unit.id}.sideId`).toBe(true);
      expect(availableTacticsIds.has(unit.tacticsProfileId), `${path}.tacticsProfileId`).toBe(true);
      if (unit.commandingLeaderId) {
        expect(leaderIds.has(unit.commandingLeaderId), `${path}.commandingLeaderId`).toBe(true);
      }
      Object.keys(unit.weaponMix).forEach((id) => expect(weaponIds.has(id), `${path}.weaponMix.${id}`).toBe(true));
      Object.keys(unit.ammunition).forEach((id) => expect(weaponIds.has(id), `${path}.ammunition.${id}`).toBe(true));
    };
    scenario.units.forEach((unit) => assertUnitReferences(unit, `units.${unit.id}`));

    const assertOrderReferences = (order: Order, path: string, availableUnitIds = unitIds): void => {
      expect(leaderIds.has(order.issuerLeaderId), `${path}.issuerLeaderId`).toBe(true);
      order.recipientUnitIds.forEach((id) => expect(availableUnitIds.has(id), `${path}.recipientUnitIds.${id}`).toBe(true));
      if (order.objective?.landmarkId) expect(landmarkIds.has(order.objective.landmarkId), `${path}.landmarkId`).toBe(true);
      if (order.objective?.targetUnitId) expect(availableUnitIds.has(order.objective.targetUnitId), `${path}.targetUnitId`).toBe(true);
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
      const addedUnitIds = variant.patch.addUnits?.map(({ id }) => id) ?? [];
      const addedTacticsIds = variant.patch.addTacticsProfiles?.map(({ id }) => id) ?? [];
      const variantUnitIds = new Set([...unitIds, ...addedUnitIds]);
      const variantTacticsIds = new Set([...tacticsIds, ...addedTacticsIds]);
      expectUnique(addedUnitIds);
      expectUnique(addedTacticsIds);
      addedUnitIds.forEach((id) => expect(unitIds.has(id), `${variant.id}.addUnits.${id}.collision`).toBe(false));
      addedTacticsIds.forEach((id) => expect(tacticsIds.has(id), `${variant.id}.addTacticsProfiles.${id}.collision`).toBe(false));
      variant.patch.addUnits?.forEach((unit) => assertUnitReferences(unit, `${variant.id}.addUnits.${unit.id}`, variantTacticsIds));
      variant.excludesVariantIds.forEach((id) => expect(variantIds.has(id), `${variant.id}.excludes.${id}`).toBe(true));
      variant.patch.removeOrderIds?.forEach((id) => expect(orderIds.has(id), `${variant.id}.removeOrderIds.${id}`).toBe(true));
      variant.patch.removeCheckpointIds?.forEach((id) => expect(checkpointIds.has(id), `${variant.id}.removeCheckpointIds.${id}`).toBe(true));
      variant.patch.modifyOrders?.forEach(({ id, changes }) => {
        expect(orderIds.has(id), `${variant.id}.modifyOrders.${id}`).toBe(true);
        if (changes.issuerLeaderId) expect(leaderIds.has(changes.issuerLeaderId), `${variant.id}.${id}.issuerLeaderId`).toBe(true);
        changes.recipientUnitIds?.forEach((unitId) => expect(variantUnitIds.has(unitId), `${variant.id}.${id}.recipientUnitIds.${unitId}`).toBe(true));
        if (changes.objective?.landmarkId) expect(landmarkIds.has(changes.objective.landmarkId), `${variant.id}.${id}.landmarkId`).toBe(true);
        if (changes.objective?.targetUnitId) expect(variantUnitIds.has(changes.objective.targetUnitId), `${variant.id}.${id}.targetUnitId`).toBe(true);
      });
      variant.patch.modifyUnits?.forEach(({ id, changes }) => {
        expect(unitIds.has(id), `${variant.id}.modifyUnits.${id}`).toBe(true);
        if (changes.tacticsProfileId) expect(variantTacticsIds.has(changes.tacticsProfileId), `${variant.id}.${id}.tacticsProfileId`).toBe(true);
        if (changes.commandingLeaderId) expect(leaderIds.has(changes.commandingLeaderId), `${variant.id}.${id}.commandingLeaderId`).toBe(true);
        Object.keys(changes.weaponMix ?? {}).forEach((weaponId) => expect(weaponIds.has(weaponId), `${variant.id}.${id}.weaponMix.${weaponId}`).toBe(true));
        Object.keys(changes.ammunition ?? {}).forEach((weaponId) => expect(weaponIds.has(weaponId), `${variant.id}.${id}.ammunition.${weaponId}`).toBe(true));
      });
      variant.patch.modifyLeaders?.forEach(({ id, changes }) => {
        expect(leaderIds.has(id), `${variant.id}.modifyLeaders.${id}`).toBe(true);
        if (changes.attachedToUnitId) expect(variantUnitIds.has(changes.attachedToUnitId), `${variant.id}.${id}.attachedToUnitId`).toBe(true);
      });
      variant.patch.modifyEndStates?.forEach(({ unitId, changes }) => {
        expect(scenario.calibration.endState.some((state) => state.unitId === unitId), `${variant.id}.modifyEndStates.${unitId}`).toBe(true);
        if (changes.landmarkId) expect(landmarkIds.has(changes.landmarkId), `${variant.id}.${unitId}.landmarkId`).toBe(true);
      });
      variant.patch.addOrders?.forEach((order) => assertOrderReferences(order, `${variant.id}.addOrders.${order.id}`, variantUnitIds));
      variant.patch.addCheckpoints?.forEach((checkpoint) => expect(variantUnitIds.has(checkpoint.unitId), `${variant.id}.addCheckpoints.${checkpoint.id}`).toBe(true));
    });

    Object.keys(scenario.calibration.casualties).forEach((id) => expect(unitIds.has(id), `calibration.casualties.${id}`).toBe(true));
    Object.keys(scenario.calibration.sideCasualties ?? {}).forEach((id) => expect(sideIds.has(id), `calibration.sideCasualties.${id}`).toBe(true));
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
    expect(scenario.leaders).toHaveLength(19);
    expect(Object.keys(scenario.weapons)).toHaveLength(6);
    expect(Object.keys(scenario.tacticsProfiles)).toHaveLength(3);
    expect(scenario.orders).toHaveLength(26);
    expect(scenario.checkpoints).toHaveLength(10);
    expect(scenario.observationEvents).toHaveLength(14);
    expect(scenario.variants).toHaveLength(7);
    expect(scenario.terrain.landmarks.length).toBeGreaterThanOrEqual(20);
  });

  it('11. counterfactual variants carry the calibration-exclusion note', () => {
    ['v-reno-holds-timber', 'v-benteen-prompt'].forEach((id) => {
      const variant = scenario.variants.find((item) => item.id === id);
      expect(variant?.provenance.note, id).toContain('counterfactual: excluded from calibration scoring');
    });
  });

  it('12. D19 camp strengths are nonzero and preserve the 5,250 best-strength anchor', () => {
    const campIds = ['hunkpapa-camp', 'oglala-camp', 'minneconjou-camp', 'sans-arc-camp', 'mixed-north-camp', 'cheyenne-camp'];
    const camps = campIds.map((id) => scenario.units.find((unit) => unit.id === id));
    camps.forEach((camp, index) => expect(camp?.strength.best, campIds[index]).toBeGreaterThan(0));
    expect(camps.reduce((sum, camp) => sum + (camp?.strength.best ?? 0), 0)).toBe(5250);

    const village = scenario.terrain.cover.find((cover) => cover.id === 'village-strip');
    if (!village) throw new Error('D53 village strip missing');
    const insideVillage = (point: { lat: number; lon: number }): boolean => {
      let inside = false;
      const ring = village.area.ring;
      for (let index = 0, previous = ring.length - 1;
        index < ring.length; previous = index, index += 1) {
        const a = ring[index];
        const b = ring[previous];
        if ((a.lat > point.lat) !== (b.lat > point.lat) &&
          point.lon < (b.lon - a.lon) * (point.lat - a.lat) / (b.lat - a.lat) + a.lon) {
          inside = !inside;
        }
      }
      return inside;
    };
    const centers = camps.map((camp) => {
      if (!camp || !('ring' in camp.startPosition)) throw new Error('D53 camp center missing');
      expect(camp.provenance.confidence, camp.id).toBe('LOW');
      expect(camp.provenance.note, camp.id).toContain('D53');
      expect(insideVillage(camp.startPosition.ring[0]), camp.id).toBe(true);
      return camp.startPosition.ring[0];
    });
    centers.forEach((center, index) => {
      if (index > 0) expect(center.lat, campIds[index]).toBeGreaterThan(centers[index - 1].lat);
    });
    const dependentIds = [
      'hunkpapa-pool', 'gall-band', 'crow-king-band', 'oglala-pool',
      'crazy-horse-band', 'minneconjou-pool', 'sans-arc-pool',
      'blackfeet-santee-pool', 'cheyenne-pool', 'lwm-band',
    ];
    dependentIds.forEach((id) => {
      const unit = scenario.units.find((candidate) => candidate.id === id);
      if (!unit || 'ring' in unit.startPosition) throw new Error(`D53 dependent ${id} missing`);
      expect(insideVillage(unit.startPosition), id).toBe(true);
      expect(unit.provenance.note, id).toContain('D53');
    });
    expect(scenario.terrain.landmarks.find((landmark) => landmark.id === 'village-s-end'))
      .toMatchObject({ position: { lat: 45.51833, lon: -107.38873 }, provenance: { confidence: 'LOW' } });
    expect(scenario.terrain.landmarks.find((landmark) => landmark.id === 'village-n-end'))
      .toMatchObject({ position: { lat: 45.556, lon: -107.44657 }, provenance: { confidence: 'LOW' } });
  });

  it('13. every unit strength Estimate has integer low/best/high (D26)', () => {
    const assertIntegerStrength = (strength: { low: number; best: number; high: number } | undefined, label: string): void => {
      if (!strength) return;
      (['low', 'best', 'high'] as const).forEach((bound) => {
        expect(Number.isInteger(strength[bound]), `${label}.strength.${bound}`).toBe(true);
      });
    };
    scenario.units.forEach((unit) => assertIntegerStrength(unit.strength, `units.${unit.id}`));
    scenario.variants.forEach((variant) => {
      variant.patch.addUnits?.forEach((unit) => assertIntegerStrength(unit.strength, `${variant.id}.addUnits.${unit.id}`));
      variant.patch.modifyUnits?.forEach(({ id, changes }) => assertIntegerStrength(changes.strength, `${variant.id}.modifyUnits.${id}`));
    });
  });
});
