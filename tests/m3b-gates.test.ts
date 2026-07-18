import { performance } from 'node:perf_hooks';
import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import { buildDecisionIndex } from '../app/lib/decision-index.js';
import { createSim } from '../engine/src/index.js';
import {
  createSpottingRuntime,
  evaluateDetectability,
  observerSignature,
  type ObserverSignature,
  type SpottingRuntime,
  type SpottingSignature,
} from '../engine/src/spotting.js';
import type { SimEvent } from '../engine/src/events.js';
import type { Scenario } from '../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../src/terrain/movement-loader.js';
import {
  computeViewshedRaster,
  prepareViewshedCover,
  rendererVisibility,
} from '../src/terrain/viewshed.js';

const scenario = scenarioData as unknown as Scenario;

describe('M3-B exit gates', () => {
  let terrain: TerrainMovementLoader;
  let runtime: SpottingRuntime;
  let fullEvents: SimEvent[];
  let viewshedMilliseconds = 0;
  let spottingOverheadPercent = 0;
  let baselineMilliseconds = 0;
  let sweepMilliseconds = 0;

  beforeAll(async () => {
    terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    runtime = createSpottingRuntime(scenario, terrain);

    // V4 hardening (Chuck, 07-18): single-shot wall-clock ratios wobble on loaded
    // machines (37.8% observed on a sandbox re-run of the same commit). Measure the
    // overhead ratio per paired run and take the median of three.
    const overheadRatios: number[] = [];
    for (let trial = 0; trial < 3; trial += 1) {
      const withoutSweeps = createSim(scenario, {
        terrain,
        parameterOverrides: { K: 0, sweepCadenceTicks: 100_000 },
      });
      const baselineStart = performance.now();
      withoutSweeps.run(2160);
      const trialBaseline = performance.now() - baselineStart;

      const withSweeps = createSim(scenario, { terrain, parameterOverrides: { K: 0 } });
      const sweepStart = performance.now();
      withSweeps.run(2160);
      const trialSweep = performance.now() - sweepStart;
      overheadRatios.push(trialSweep / trialBaseline);
      if (trial === 0) {
        baselineMilliseconds = trialBaseline;
        sweepMilliseconds = trialSweep;
      }
    }
    const medianRatio = [...overheadRatios].sort((a, b) => a - b)[1];
    spottingOverheadPercent = (medianRatio - 1) * 100;
    const production = createSim(scenario, { terrain });
    production.run(2160);
    fullEvents = [...production.events()];
    const save = production.save(true);
    production.load(save, { useKeyframes: true, targetTick: 1520 });
    const custer = scenario.leaders.find((leader) => leader.id === 'custer');
    const attached = production.state().units.find((unit) => unit.id === custer?.attachedToUnitId);
    if (!attached) throw new Error('Custer attached unit missing');
    const observer = observerSignature(scenario, attached, runtime.config);
    prepareViewshedCover(runtime, terrain.fullBounds(), 30);
    const viewshedStart = performance.now();
    const raster = computeViewshedRaster(terrain, runtime, {
      bounds: terrain.fullBounds(),
      resolutionMeters: 30,
      observer: attached.position,
      observerHeightMeters: observer.heightMeters,
      targetHeightMeters: runtime.config.heightStanding,
      atmosphericFactor: 1,
    });
    viewshedMilliseconds = performance.now() - viewshedStart;
    const fullGrid = terrain.viewshedElevationGrid();
    expect(raster.width).toBe(fullGrid.width);
    expect(raster.height).toBe(fullGrid.height);
  }, 180_000);

  it('V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings', () => {
    console.info(`[gate] V4 viewshed=${viewshedMilliseconds.toFixed(2)}ms ` +
      `baseline=${baselineMilliseconds.toFixed(2)}ms sweep=${sweepMilliseconds.toFixed(2)}ms ` +
      `spottingOverhead=${spottingOverheadPercent.toFixed(2)}%`);
    expect(viewshedMilliseconds).toBeLessThan(750);
    expect(spottingOverheadPercent).toBeLessThan(35);
  });

  it('V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts', () => {
    const bounds = terrain.fullBounds();
    let state = 0x18760625;
    const random = (): number => {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
      return state / 0x1_0000_0000;
    };
    for (let sample = 0; sample < 200; sample += 1) {
      const point = (): { x: number; y: number } => ({
        x: bounds.minX + (bounds.maxX - bounds.minX) * random(),
        y: bounds.minY + (bounds.maxY - bounds.minY) * random(),
      });
      const observer: ObserverSignature = {
        id: `observer-${sample}`,
        position: point(),
        heightMeters: runtime.config.heightStanding,
        perceptionFactor: 1,
      };
      const target: SpottingSignature = {
        id: `target-${sample}`,
        position: point(),
        effectiveStrength: 50,
        formation: 'LINE',
        mounted: false,
        moving: false,
        kind: 'CAVALRY_COMPANY',
      };
      const engine = evaluateDetectability(terrain, runtime, observer, target);
      const renderer = rendererVisibility(
        terrain,
        runtime,
        observer.position,
        target.position,
        observer.heightMeters,
        runtime.config.heightStanding,
      );
      expect(renderer).toBe(engine.factors.transmittance > 0);
    }
    console.info('[gate] V5 PASS exact=200/200');
  }, 60_000);

  it('V6 decision index — one entry per 23 orders plus each camp-defense activation', () => {
    const activations = fullEvents.filter((event) => event.type === 'camp-defense-activated');
    const index = buildDecisionIndex(scenario, fullEvents);
    expect(scenario.orders).toHaveLength(23);
    expect(index.filter((entry) => entry.kind === 'order')).toHaveLength(23);
    expect(index.filter((entry) => entry.kind === 'emergent')).toHaveLength(activations.length);
    expect(index).toHaveLength(23 + activations.length);
    expect(index.filter((entry) => entry.orderId === 'martini-msg')).toHaveLength(1);
    console.info(`[gate] V6 PASS entries=${index.length} orders=23 activations=${activations.length}`);
  });
});
