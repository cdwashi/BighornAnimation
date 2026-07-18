import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { runObservationExam, type ObservationExamResult } from '../src/exam.js';
import { createSim } from '../src/index.js';
import { formatCheckpointTable, scoreCheckpoints } from '../src/score.js';
import { hashState } from '../src/serialize.js';
import {
  evaluateDetectability,
  coverPathTransmittance,
  pathLengthThroughPolygon,
  serializedBelievedPicture,
  STARTING_SPOTTING_CONFIG,
  spottingConfig,
  type ObserverSignature,
  type SpottingRuntime,
  type SpottingSignature,
} from '../src/spotting.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function smallSpottingScenario(): Scenario {
  const result = cloneScenario(scenario);
  const ids = new Set(['co-a', 'hunkpapa-pool', 'hunkpapa-camp']);
  result.units = result.units.filter((unit) => ids.has(unit.id));
  result.leaders = result.leaders.filter((leader) => ids.has(leader.attachedToUnitId));
  result.orders = [];
  result.checkpoints = [];
  result.observationEvents = [];
  result.variants = [];
  result.terrain.cover = [];
  return result;
}

function flatRuntime(): SpottingRuntime {
  return {
    config: spottingConfig(),
    projectedCover: [],
    blockedRays: new Map(),
    memoizationEnabled: true,
  };
}

describe('M3-A exit gates', () => {
  let terrain: TerrainMovementLoader;
  let exam: ObservationExamResult;
  let currentE5Table: string;
  let baselineE5Table: string;

  beforeAll(async () => {
    terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    exam = runObservationExam(scenario, terrain);
    const movement = createSim(scenario, { seed: 18760625, terrain });
    movement.run(2160);
    currentE5Table = formatCheckpointTable(scoreCheckpoints(
      movement.scenario,
      terrain,
      movement.tracks(),
    ));
    const baseline = await readFile(join(process.cwd(), 'reports', 'e5-baseline.md'), 'utf8');
    baselineE5Table = baseline.slice(baseline.indexOf('| Checkpoint |')).trim();
  }, 120_000);

  it('V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG', () => {
    const small = smallSpottingScenario();
    const flat = new FlatTerrain();
    const sameA = createSim(small, { seed: 18760625, terrain: flat });
    const sameB = createSim(small, { seed: 18760625, terrain: flat });
    const different = createSim(small, { seed: 42, terrain: flat });
    sameA.run(2160);
    sameB.run(2160);
    different.run(2160);
    expect(hashState(sameB.state())).toBe(hashState(sameA.state()));
    expect(hashState(different.state())).toBe(hashState(sameA.state()));
    expect(sameA.spottingEvents()).toEqual(sameB.spottingEvents());
    expect(different.spottingEvents()).toEqual(sameA.spottingEvents());
    expect(sameA.state().rng.draws).toBe(0);
    expect(different.state().rng.draws).toBe(0);
    expect(sameA.events().some((event) => event.type === 'camp-defense-activated')).toBe(true);
    console.info('[gate] V1 PASS same/different seeds identical; rng.draws=0');
  });

  it('V2 C4 exam — one global table reproduces at least 80% of gateable events', () => {
    expect(exam.gateableCount).toBe(13);
    expect(exam.reproducedCount).toBe(12);
    expect(exam.rows.every((row) => row.factors?.quantizedTerrainRay !== true)).toBe(true);
    expect(exam.reproductionRate).toBeGreaterThanOrEqual(0.8);
    expect(exam.passed).toBe(true);
    console.info(`[gate] V2 PASS ${exam.reproducedCount}/${exam.gateableCount} ` +
      `(${(exam.reproductionRate * 100).toFixed(1)}%)`);
  });

  it('V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization', () => {
    const small = smallSpottingScenario();
    const sim = createSim(small, {
      seed: 18760625,
      terrain: new FlatTerrain(),
      parameterOverrides: { K: 0 },
    });
    sim.run(20);
    const usPicture = sim.state().believedPictures['us-7th-cavalry'];
    const coalitionPicture = sim.state().believedPictures['lakota-cheyenne-coalition'];
    expect(usPicture['hunkpapa-camp']).toBeUndefined();
    expect(usPicture['hunkpapa-pool']).toBeUndefined();
    expect(coalitionPicture['co-a']).toBeUndefined();
    const usSerialized = serializedBelievedPicture(sim.state(), 'us-7th-cavalry');
    const coalitionSerialized = serializedBelievedPicture(
      sim.state(),
      'lakota-cheyenne-coalition',
    );
    expect(usSerialized).not.toContain('hunkpapa-camp');
    expect(usSerialized).not.toContain('hunkpapa-pool');
    expect(coalitionSerialized).not.toContain('co-a');
    console.info('[gate] V3 PASS no never-spotted target ids in belief or serialized belief');
  });

  it('V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline', () => {
    expect(currentE5Table).toBe(baselineE5Table);
    console.info('[gate] V7 PASS E5 table diff=none');
  });

  it('owner sanity anchors are already coherent before C4 threshold tuning', () => {
    class OverlookTerrain extends FlatTerrain {
      override elevationAtMeters(x: number): number {
        return x === 0 ? 100 : 0;
      }
    }
    const terrain = new OverlookTerrain();
    const runtime = flatRuntime();
    const observer: ObserverSignature = {
      id: 'observer',
      position: { x: 0, y: 0 },
      heightMeters: STARTING_SPOTTING_CONFIG.heightStanding,
      perceptionFactor: 1,
    };
    const signature = (changes: Partial<SpottingSignature>): SpottingSignature => ({
      id: 'target',
      position: { x: 1_000, y: 0 },
      effectiveStrength: 50,
      formation: 'SKIRMISH',
      mounted: false,
      moving: false,
      kind: 'CAVALRY_COMPANY',
      ...changes,
    });
    const regiment = evaluateDetectability(terrain, runtime, observer, signature({
      id: 'regiment',
      position: { x: 15_000, y: 0 },
      effectiveStrength: 600,
      formation: 'COLUMN',
      mounted: true,
      moving: true,
    }));
    const skirmish = evaluateDetectability(terrain, runtime, observer, signature({}));
    const village = evaluateDetectability(terrain, runtime, observer, signature({
      id: 'village',
      position: { x: 9_000, y: 0 },
      effectiveStrength: 5_000,
      formation: 'CAMP',
      mounted: false,
      moving: false,
      kind: 'NONCOMBATANT_CAMP',
    }));
    const company = evaluateDetectability(terrain, runtime, observer, signature({
      id: 'company',
      position: { x: 3_000, y: 0 },
      formation: 'COLUMN',
      mounted: true,
    }));
    expect(regiment.score).toBeGreaterThanOrEqual(STARTING_SPOTTING_CONFIG.spotThreshold);
    expect(skirmish.score).toBeGreaterThanOrEqual(STARTING_SPOTTING_CONFIG.spotThreshold);
    expect(village.score).toBeGreaterThan(company.score);

    const square = [
      { x: 0, y: -10 }, { x: 100, y: -10 },
      { x: 100, y: 10 }, { x: 0, y: 10 },
    ];
    expect(pathLengthThroughPolygon({ x: -50, y: 0 }, { x: 150, y: 0 }, square))
      .toBeCloseTo(100, 10);
    const attenuation = coverPathTransmittance({
      config: spottingConfig({ attenuationUnitMeters: 100 }),
      projectedCover: [{ id: 'test-cover', opacity: 0.5, ring: square }],
      blockedRays: new Map(),
      memoizationEnabled: true,
    }, { x: -50, y: 0 }, { x: 150, y: 0 });
    expect(attenuation.transmittance).toBeCloseTo(0.5, 10);
  });

  it('D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run', async () => {
    const terrain = await TerrainMovementLoader.fromDirectory(
      join(process.cwd(), 'data', 'terrain', 'little-bighorn-1876'),
    );
    const cached = createSim(scenario, { seed: 18760625, terrain });
    const uncached = createSim(scenario, { seed: 18760625, terrain, disableSpottingCache: true });
    cached.run(2160);
    uncached.run(2160);
    expect(hashState(uncached.state())).toBe(hashState(cached.state()));
  }, 240_000);
});
