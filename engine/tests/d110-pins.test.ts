import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { KILLED_TO_WOUNDED_RATIO_RANGES } from '../src/combat-config.js';
import { extractEmergentOutcomes } from '../src/envelope.js';
import { runObservationExam } from '../src/exam.js';
import { createSim } from '../src/index.js';
import { extractBenchLip } from '../src/lip.js';
import type { EngineTerrain, PointMeters } from '../src/pathfind.js';
import { CALIBRATION_EXCLUSION_FLAG, scoreCalibrationRun } from '../src/score.js';

const scenario = scenarioData as unknown as Scenario;

type EstimateBounds = 'low' | 'best' | 'high';
type Landmark = Scenario['terrain']['landmarks'][number];

interface DefenseFeature {
  id: string;
  points: readonly PointMeters[];
  lipPoints?: readonly PointMeters[];
}

function constructDefenseFeatures(
  source: Scenario,
  terrain: EngineTerrain,
): DefenseFeature[] {
  const scenarioFeatures: DefenseFeature[] = (source.coverFeatures ?? []).map((feature) => {
    const [x, y] = terrain.toLocal(feature.position.lat, feature.position.lon);
    const point = { x, y };
    return {
      id: `scenario-${feature.id}`,
      points: [point],
      lipPoints: feature.id === 'bench' ? extractBenchLip(terrain, point) : undefined,
    };
  });
  const substrateFeatures = terrain.coverFeatures?.() ?? [];
  return [...substrateFeatures, ...scenarioFeatures].sort((left, right) =>
    left.id.localeCompare(right.id));
}

function referencedLandmarkIds(source: Scenario): Set<string> {
  const referenced = new Set<string>();
  for (const order of source.orders) {
    if (order.objective?.landmarkId) referenced.add(order.objective.landmarkId);
  }
  for (const checkpoint of source.checkpoints) {
    const landmarkId = (checkpoint as typeof checkpoint & { landmarkId?: string }).landmarkId;
    if (landmarkId) referenced.add(landmarkId);
  }
  for (const endState of source.calibration.endState) {
    if (endState.landmarkId) referenced.add(endState.landmarkId);
  }
  for (const event of source.observationEvents) {
    if (event.target.landmarkId) referenced.add(event.target.landmarkId);
  }
  // envelope.ts directly looks up Ford A when extracting emergent outcomes.
  referenced.add('ford-a');
  return referenced;
}

function trackLandmarkConsumption(
  landmarks: Landmark[],
  consumed: Set<string>,
): Landmark[] {
  return new Proxy(landmarks, {
    get(target, property, receiver) {
      if (property === 'find') {
        return ((predicate: (value: Landmark, index: number, array: Landmark[]) => unknown,
          thisArg?: unknown): Landmark | undefined => {
          const found = target.find(predicate, thisArg);
          if (found) consumed.add(found.id);
          return found;
        }) as typeof target.find;
      }
      // hashScenario's stable serializer maps arrays; cloning uses JSON serialization.
      // Keep those byte-survey operations invisible to the consumption instrument.
      if (property === 'map') return target.map.bind(target);
      if (property === 'toJSON') return (): Landmark[] => target;
      const value = Reflect.get(target, property, receiver) as unknown;
      if (typeof property === 'string' && /^(0|[1-9]\d*)$/.test(property)) {
        consumed.add((value as Landmark).id);
      }
      return value;
    },
  });
}

function calibrationExclusionNotePaths(value: unknown): string[] {
  const paths: string[] = [];
  function visit(current: unknown, path: string): void {
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!current || typeof current !== 'object') return;
    for (const [key, item] of Object.entries(current)) {
      const itemPath = path ? `${path}.${key}` : key;
      if (key === 'note' && typeof item === 'string' &&
          item.toLowerCase().includes(CALIBRATION_EXCLUSION_FLAG)) {
        paths.push(itemPath);
      }
      visit(item, itemPath);
    }
  }
  visit(value, '');
  return paths.sort();
}

function disputedConfidencePaths(value: unknown): string[] {
  const paths: string[] = [];
  function visit(current: unknown, path: string): void {
    if (Array.isArray(current)) {
      current.forEach((item, index) => visit(item, `${path}[${index}]`));
      return;
    }
    if (!current || typeof current !== 'object') return;
    if ((current as { confidence?: unknown }).confidence === 'DISPUTED') {
      paths.push(path);
    }
    for (const [key, item] of Object.entries(current)) {
      const itemPath = path ? `${path}.${key}` : key;
      visit(item, itemPath);
    }
  }
  visit(value, '');
  return paths.sort();
}

describe('D110 pre-break pins', () => {
  let terrain: TerrainMovementLoader;

  beforeAll(async () => {
    terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
  });

  it('pin (a) — killed-to-wounded ratio ranges duplicate their declared source bounds', () => {
    const sideCasualties = scenario.calibration.sideCasualties ?? {};
    const coalition = sideCasualties['lakota-cheyenne-coalition'];
    if (!coalition) throw new Error('D110 pin (a): coalition side casualties are missing');
    const coalitionRange = KILLED_TO_WOUNDED_RATIO_RANGES['lakota-cheyenne-coalition'];
    // D112 cause: re-pinned to K 36/60/136 and flat W 160 conservative cross-products.
    expect(coalitionRange.low).toBe(coalition.killed.low / coalition.wounded.high);
    expect(coalitionRange.best).toBe(coalition.killed.best / coalition.wounded.best);
    expect(coalitionRange.high).toBe(coalition.killed.high / coalition.wounded.low);

    for (const sideId of Object.keys(sideCasualties)) {
      expect(Object.hasOwn(KILLED_TO_WOUNDED_RATIO_RANGES, sideId), sideId).toBe(true);
    }

    const usCasualties = Object.entries(scenario.calibration.casualties).filter(([unitId]) =>
      scenario.units.find((unit) => unit.id === unitId)?.sideId === 'us-7th-cavalry');
    expect(usCasualties.length).toBeGreaterThan(0);
    const sums = {
      killed: { low: 0, best: 0, high: 0 },
      wounded: { low: 0, best: 0, high: 0 },
    };
    for (const [, casualty] of usCasualties) {
      for (const kind of ['killed', 'wounded'] as const) {
        for (const bound of ['low', 'best', 'high'] as const) {
          sums[kind][bound] += casualty[kind][bound];
        }
      }
    }
    const recovered = {
      killed: { low: 0, best: 0, high: 0 },
      wounded: { low: 0, best: 0, high: 0 },
    };
    for (const kind of ['killed', 'wounded'] as const) {
      for (const bound of ['low', 'best', 'high'] as EstimateBounds[]) {
        expect(Math.abs(sums[kind][bound] - Math.round(sums[kind][bound])),
          `${kind}.${bound} integer residue`).toBeLessThan(1e-6);
        recovered[kind][bound] = Math.round(sums[kind][bound]);
      }
    }
    const usRange = KILLED_TO_WOUNDED_RATIO_RANGES['us-7th-cavalry'];
    expect(usRange.low).toBe(recovered.killed.low / recovered.wounded.high);
    expect(usRange.high).toBe(recovered.killed.high / recovered.wounded.low);

    // WO-D127 SOURCED VALUE: 253 is the per-company killed-best sum—the population the
    // engine casualties come from (99.9%, measured at D122). Former 268/52 mixed counting
    // frames (monument-plus-evacuees numerator over officers-and-troopers denominator;
    // Scott pairs 268 with 55); changed at D122/D127 on M-FLIP's measurement.
    expect(usRange.best).toBe(253 / 52);
  });

  it('pin (b) — committed scenario contributes exactly the ruled camp-defence candidate', () => {
    const scenarioFeatureIds = constructDefenseFeatures(scenario, terrain)
      .filter((feature) => feature.id.startsWith('scenario-'))
      .map((feature) => feature.id);
    expect(scenarioFeatureIds).toEqual(['scenario-bench']);
  });

  it('pin (c) — every engine-consumed landmark id is referenced by committed data', () => {
    const instrumentedScenario = JSON.parse(JSON.stringify(scenarioData)) as Scenario;
    const referenced = referencedLandmarkIds(instrumentedScenario);
    const declared = new Set(instrumentedScenario.terrain.landmarks.map((landmark) => landmark.id));
    for (const landmarkId of referenced) {
      expect(declared.has(landmarkId), landmarkId).toBe(true);
    }

    const consumed = new Set<string>();
    instrumentedScenario.terrain.landmarks = trackLandmarkConsumption(
      instrumentedScenario.terrain.landmarks,
      consumed,
    );
    const sim = createSim(instrumentedScenario, { seed: 18760625, terrain });
    sim.scenario.terrain.landmarks = trackLandmarkConsumption(
      sim.scenario.terrain.landmarks,
      consumed,
    );
    sim.run(360);
    const exam = runObservationExam(instrumentedScenario, terrain);
    const scorecard = scoreCalibrationRun({
      scenario: sim.scenario,
      terrain,
      state: sim.state(),
      tracks: sim.tracks(),
      events: sim.events(),
      observationRows: exam.rows,
      seed: sim.seed,
    });
    extractEmergentOutcomes(sim.scenario, terrain, sim.state(), sim.events(), scorecard);

    expect(consumed.size).toBeGreaterThan(0);
    expect([...consumed].filter((landmarkId) => !referenced.has(landmarkId)).sort()).toEqual([]);
  }, 120_000);

  it('pin (d) — calibration-exclusion note membership is exactly the ruled set', () => {
    expect(calibrationExclusionNotePaths(scenarioData)).toEqual([
      'variants[5].patch.addOrders[0].provenance.note',
      'variants[5].provenance.note',
      'variants[6].provenance.note',
    ]);
  });

  it('pin (e) — gated DISPUTED-confidence membership is exactly the D125 ruled set', () => {
    const gatedPrefixes = [
      'checkpoints[',
      'observationEvents[',
      'calibration.sideCasualties.',
      'calibration.endState[',
      'calibration.timing',
    ];
    const gated = disputedConfidencePaths(scenarioData)
      .filter((path) => gatedPrefixes.some((prefix) => path.startsWith(prefix)));
    expect(gated, 'D110 pin (e), D125: gated DISPUTED-confidence blocks').toEqual([
      'calibration.sideCasualties.lakota-cheyenne-coalition.killed.provenance',
    ]);
  });
});
