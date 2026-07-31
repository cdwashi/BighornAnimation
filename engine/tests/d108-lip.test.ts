import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { partitionLipCells, updateCampDefense } from '../src/camp-defense.js';
import { combatConfig } from '../src/combat-config.js';
import type { SimEvent } from '../src/events.js';
import { extractBenchLip } from '../src/lip.js';
import type { TerrainCoverFeature } from '../src/pathfind.js';
import { spottingConfig } from '../src/spotting.js';
import { initializeState } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

async function currentLip(): Promise<{
  terrain: TerrainMovementLoader;
  benchPoint: { x: number; y: number };
  cells: ReturnType<typeof extractBenchLip>;
}> {
  const terrain = await TerrainMovementLoader.fromDirectory(join(
    process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
  ));
  const bench = scenario.coverFeatures?.find((feature) => feature.id === 'bench');
  if (!bench) throw new Error('scenario bench missing');
  const [x, y] = terrain.toLocal(bench.position.lat, bench.position.lon);
  const benchPoint = { x, y };
  return { terrain, benchPoint, cells: extractBenchLip(terrain, benchPoint) };
}

function linearCells(count: number): Array<{ x: number; y: number }> {
  return Array.from({ length: count }, (_, index) => ({ x: 100, y: index * 10 }));
}

class TimberTerrain extends FlatTerrain {
  constructor(private readonly features: readonly TerrainCoverFeature[]) {
    super();
  }

  coverFeatures(): readonly TerrainCoverFeature[] {
    return this.features;
  }
}

describe('D108 bench lip geometry', () => {
  it('lip-extraction-pinned', async () => {
    const { terrain, benchPoint, cells } = await currentLip();
    const northings = cells.map((cell) => cell.y).sort((left, right) => left - right);
    const gaps = northings.slice(1).map((northing, index) => northing - northings[index]);

    expect(cells).toHaveLength(85);
    expect(northings.at(-1)! - northings[0]).toBe(260);
    expect(Math.max(...gaps)).toBeLessThanOrEqual(20);
    expect(cells.every((cell) => Math.round(Math.hypot(
      cell.x - benchPoint.x,
      cell.y - benchPoint.y,
    )) >= 51)).toBe(true);
    expect(cells.every((cell) =>
      terrain.channelSideAtMeters(cell.x, cell.y) === 'WEST')).toBe(true);
    expect(cells).toEqual([...cells].sort((left, right) =>
      left.y - right.y || left.x - right.x));
  });

  it('partition-exact', () => {
    const cells = linearCells(12);
    const three = partitionLipCells(cells, ['band-c', 'band-a', 'band-b']);

    expect(three.map((slot) => slot.unitId)).toEqual(['band-a', 'band-b', 'band-c']);
    expect(three.map((slot) => slot.segment)).toEqual([
      cells.slice(0, 4),
      cells.slice(4, 8),
      cells.slice(8, 12),
    ]);
    expect(three.flatMap((slot) => slot.segment)).toEqual(cells);
    expect(new Set(three.flatMap((slot) => slot.segment.map((cell) => cell.y))).size)
      .toBe(cells.length);
    expect(three.map((slot) => slot.goal)).toEqual([cells[2], cells[6], cells[10]]);
    expect(new Set(three.map((slot) => `${slot.goal.x},${slot.goal.y}`)).size).toBe(3);

    const joined = partitionLipCells(cells, ['band-c', 'band-a', 'band-b', 'band-aa']);
    expect(joined.map((slot) => slot.unitId)).toEqual([
      'band-a', 'band-aa', 'band-b', 'band-c',
    ]);
    expect(joined.map((slot) => slot.goal)).toEqual([cells[1], cells[4], cells[7], cells[10]]);
    expect(partitionLipCells(cells, joined
      .map((slot) => slot.unitId)
      .filter((unitId) => unitId !== 'band-aa'))).toEqual(three);
  });

  it('single-occupant-centers', () => {
    const cells = linearCells(85);
    expect(partitionLipCells(cells, ['only-band'])).toEqual([{
      unitId: 'only-band',
      segment: cells,
      goal: cells[42],
    }]);
  });

  it('non-bench-unchanged', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'hunkpapa-camp', 'co-a']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const timberPoints = [{ x: 100, y: 0 }, { x: 300, y: 0 }];
    const terrain = new TimberTerrain([{
      id: 'substrate-timber-test',
      points: timberPoints,
    }]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 50, y: 0 };
    camp.position = { x: 0, y: 0 };
    threat.position = { x: 500, y: 0 };
    threat.insideFord = true;
    threat.path = [{ ...threat.position }, { x: 400, y: 0 }];
    threat.pathIndex = 1;
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];
    state.tick = 0;
    updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    state.tick = 1;
    updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);

    expect(band.campDefense).toMatchObject({
      featureId: 'substrate-timber-test',
      goal: timberPoints[1],
    });
    expect(band.path.at(-1)).toMatchObject(timberPoints[1]);
  });

  it('derivation-only', async () => {
    const before = JSON.stringify(scenarioData);
    const { cells } = await currentLip();

    expect(cells.length).toBeGreaterThan(0);
    expect(JSON.stringify(scenarioData)).toBe(before);
  });
});
