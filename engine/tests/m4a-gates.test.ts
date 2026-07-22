import { join } from 'node:path';
import { performance } from 'node:perf_hooks';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { createSim, type Simulator } from '../src/index.js';
import { hashState } from '../src/serialize.js';
import { getPathfindMetrics, resetPathfindMetrics } from '../src/pathfind.js';

const scenario = scenarioData as unknown as Scenario;

describe('M4-A F1-F6 closeout gates', () => {
  let terrain: TerrainMovementLoader;
  let baseline: Simulator;
  let elapsedMs = 0;
  let pathMetrics: ReturnType<typeof getPathfindMetrics>;

  beforeAll(async () => {
    terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    baseline = createSim(scenario, { seed: 18760625, terrain });
    resetPathfindMetrics();
    const started = performance.now();
    baseline.run(2160);
    elapsedMs = performance.now() - started;
    pathMetrics = getPathfindMetrics();
  }, 120_000);

  it('F1 seed flip — identical same-seed run; different seeds flip only at first contact', () => {
    const same = createSim(scenario, { seed: 18760625, terrain });
    same.run(2160);
    expect(hashState(same.state())).toBe(hashState(baseline.state()));
    expect(hashState(baseline.state())).toBe('7f00bd23');

    const left = createSim(scenario, { seed: 18760625, terrain });
    const right = createSim(scenario, { seed: 42, terrain });
    let beforeLeft = hashState(left.state());
    let beforeRight = hashState(right.state());
    while (left.state().rng.draws === 0 && left.state().tick < 2160) {
      beforeLeft = hashState(left.state());
      beforeRight = hashState(right.state());
      left.step();
      right.step();
    }
    expect(beforeRight).toBe(beforeLeft);
    expect(left.state().tick).toBe(right.state().tick);
    expect(hashState(right.state())).not.toBe(hashState(left.state()));
    expect(left.state().rng.draws).toBeGreaterThan(0);
  }, 120_000);

  it('F2 conservation — integer casualties/strength/ammo and conserved strength', () => {
    for (const unit of baseline.state().units) {
      expect(Number.isInteger(unit.strengthCurrent), unit.id).toBe(true);
      expect(Number.isInteger(unit.killed), unit.id).toBe(true);
      expect(Number.isInteger(unit.wounded), unit.id).toBe(true);
      expect(Number.isInteger(unit.casualties), unit.id).toBe(true);
      expect(unit.casualties).toBeLessThanOrEqual(unit.strengthTotal);
      expect(unit.killed + unit.wounded).toBe(unit.casualties);
      expect(unit.killed + unit.wounded + unit.strengthCurrent).toBe(unit.strengthTotal);
      for (const ammo of Object.values(unit.ammunition)) {
        expect(Number.isInteger(ammo), unit.id).toBe(true);
        expect(ammo).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it('F3 no-combat regression — legacy seeds remain byte-identical with zero draws', () => {
    const left = createSim(scenario, { seed: 18760625, terrain, combatEnabled: false });
    const right = createSim(scenario, { seed: 42, terrain, combatEnabled: false });
    left.run(2160);
    right.run(2160);
    expect(hashState(right.state())).toBe(hashState(left.state()));
    expect(left.state().rng.draws).toBe(0);
    expect(right.state().rng.draws).toBe(0);
  }, 120_000);

  it('F4 full-stack baseline — wing dies, hill and village hold, couriers deliver', () => {
    for (const id of ['co-c', 'co-e', 'co-f', 'co-i', 'co-l']) {
      expect(baseline.state().units.find((unit) => unit.id === id)?.endState, id).toBe('DESTROYED');
    }
    expect(baseline.state().units.find((unit) => unit.id === 'co-d')?.endState).toBeUndefined();
    expect(baseline.state().units.filter((unit) =>
      scenario.units[unit.unitIndex].kind === 'NONCOMBATANT_CAMP' && unit.casualties > 0)).toHaveLength(0);
    for (const courier of baseline.state().couriers) {
      expect(courier.alive, courier.id).toBe(true);
      expect(courier.delivered, courier.id).toBe(true);
    }
  });

  it('F5 informational scorecard is coherent — scout doctrine and D74 predictions hold', () => {
    const arikara = baseline.state().units.find((unit) => unit.id === 'arikara-scouts');
    expect(arikara?.withdrawnOffField).toBe(true);
    expect(arikara?.casualties).toBeLessThan(37);
    expect(baseline.events().some((event) => event.type === 'scout-withdrew-off-field')).toBe(true);
  });

  it('F6 pooled-A* work metrics are bounded; wall clock is informational', () => {
    const timings = [elapsedMs];
    for (let index = 0; index < 2; index += 1) {
      const sim = createSim(scenario, { seed: 18760625, terrain });
      const started = performance.now();
      sim.run(2160);
      timings.push(performance.now() - started);
      expect(hashState(sim.state())).toBe('7f00bd23');
    }
    timings.sort((left, right) => left - right);
    const median = timings[1];
    // M5-SPEC G-M5-5 ports this gate to deterministic work metrics so host
    // scheduling cannot make the quartet flaky. The historic 10 s target is
    // retained in the emitted timing, not as the primary assertion.
    expect(pathMetrics.calls).toBe(158);
    expect(pathMetrics.expandedNodes).toBeLessThanOrEqual(11_100_000);
    expect(pathMetrics.scratchAllocations).toBeLessThanOrEqual(3);
    console.info(`[gate] F6 median=${median.toFixed(1)}ms timings=${timings.map((value) =>
      value.toFixed(1)).join(',')} pathfind=${JSON.stringify(pathMetrics)}`);
  }, 120_000);
});
