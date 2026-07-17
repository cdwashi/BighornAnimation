import { join } from 'node:path';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { runCli } from '../cli.js';
import type { SimEvent } from '../src/events.js';
import { createSim, type Simulator } from '../src/index.js';
import {
  effectiveSpeedMetersPerSecond,
  FORMATION_MODIFIER,
  moveUnits,
  SPEED_METERS_PER_SECOND,
} from '../src/movement.js';
import { findPath, type MovementGrid } from '../src/pathfind.js';
import { hashState } from '../src/serialize.js';
import type { SimState } from '../src/state.js';

const scenario = scenarioData as unknown as Scenario;
const checkpoints = [1, 360, 1080, 2160] as const;
const movementOrderTypes = new Set(['MOVE', 'SCREEN', 'WITHDRAW', 'ATTACK', 'CHARGE', 'RESUPPLY']);

function collectHashes(sim: Simulator): Record<number, string> {
  const result: Record<number, string> = {};
  for (const tick of checkpoints) {
    sim.run(tick);
    result[tick] = hashState(sim.state());
  }
  return result;
}

describe('M2 exit gates', () => {
  let terrain: TerrainMovementLoader;
  let sameA: Simulator;
  let sameB: Simulator;
  let different: Simulator;
  let hashesA: Record<number, string>;
  let hashesB: Record<number, string>;
  let hashesDifferent: Record<number, string>;

  beforeAll(async () => {
    terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    sameA = createSim(scenario, { seed: 18760625, terrain });
    sameB = createSim(scenario, { seed: 18760625, terrain });
    different = createSim(scenario, { seed: 42, terrain });
    hashesA = collectHashes(sameA);
    hashesB = collectHashes(sameB);
    hashesDifferent = collectHashes(different);
  }, 120_000);

  it('E1 Determinism — full-state hashes match at required ticks, including a different unused seed', () => {
    expect(hashesB).toEqual(hashesA);
    expect(hashesDifferent).toEqual(hashesA);
    console.info(`[gate] E1 hashes ${JSON.stringify({ sameA: hashesA, sameB: hashesB, different: hashesDifferent })}`);
  });

  it('E2 Speed truth — flat-terrain speed classes cover expected tick distance and factors bite', () => {
    const classes = Object.keys(SPEED_METERS_PER_SECOND) as Array<keyof typeof SPEED_METERS_PER_SECOND>;
    for (const speedClass of classes) {
      const expected = SPEED_METERS_PER_SECOND[speedClass] * 30;
      const actual = effectiveSpeedMetersPerSecond(speedClass, 'COLUMN') * 30;
      expect(Math.abs(actual - expected) / expected).toBeLessThanOrEqual(0.01);
    }
    expect(effectiveSpeedMetersPerSecond('CAVALRY_WALK', 'LINE', 0.6))
      .toBeCloseTo(1.8 * FORMATION_MODIFIER.LINE * 0.6, 10);
    expect(effectiveSpeedMetersPerSecond('CAVALRY_WALK', 'COLUMN', 0.5))
      .toBeLessThan(effectiveSpeedMetersPerSecond('CAVALRY_WALK', 'COLUMN', 1));
  });

  it('E3 Ford discipline — west-to-Reno-Hill path uses a ford, pays four minutes, and no-ford is unreachable', () => {
    const fordA = scenario.terrain.landmarks.find((landmark) => landmark.id === 'ford-a');
    if (!fordA) throw new Error('Ford A landmark missing');
    const [fordX, fordY] = terrain.toLocal(fordA.position.lat, fordA.position.lon);
    const renoHill = scenario.terrain.landmarks.find((landmark) => landmark.id === 'reno-hill');
    if (!renoHill) throw new Error('Reno Hill landmark missing');
    const [goalX, goalY] = terrain.toLocal(renoHill.position.lat, renoHill.position.lon);
    const grid = terrain.gridForPath({ x: fordX, y: fordY }, { x: goalX, y: goalY });
    let crossingCell = -1;
    let crossingDistance = Number.POSITIVE_INFINITY;
    grid.coverKinds?.forEach((kind, index) => {
      if (kind !== grid.fordCode) return;
      const column = index % grid.width;
      const row = Math.floor(index / grid.width);
      if (column < 1 || column >= grid.width - 1 || row < 1 || row >= grid.height - 1) return;
      const neighbors = [
        index - grid.width - 1, index - grid.width, index - grid.width + 1,
        index - 1, index + 1,
        index + grid.width - 1, index + grid.width, index + grid.width + 1,
      ];
      if (!neighbors.some((neighbor) => grid.coverKinds?.[neighbor] === grid.riverCode)) return;
      const x = grid.minX + column * grid.resolutionMeters;
      const y = grid.minY + row * grid.resolutionMeters;
      const distance = Math.hypot(x - fordX, y - fordY);
      if (distance < crossingDistance) {
        crossingCell = index;
        crossingDistance = distance;
      }
    });
    expect(crossingCell).toBeGreaterThanOrEqual(0);
    const crossingColumn = crossingCell % grid.width;
    const crossingRow = Math.floor(crossingCell / grid.width);
    const finiteNeighbors = [
      crossingCell - grid.width - 1, crossingCell - grid.width, crossingCell - grid.width + 1,
      crossingCell - 1, crossingCell + 1,
      crossingCell + grid.width - 1, crossingCell + grid.width, crossingCell + grid.width + 1,
    ].filter((index) => Number.isFinite(grid.costs[index]));
    const crossingX = grid.minX + crossingColumn * grid.resolutionMeters;
    const crossingY = grid.minY + crossingRow * grid.resolutionMeters;
    const towardGoalX = goalX - crossingX;
    const towardGoalY = goalY - crossingY;
    const westNeighbor = finiteNeighbors.reduce((best, index) => {
      const column = index % grid.width;
      const row = Math.floor(index / grid.width);
      const dot = (grid.minX + column * grid.resolutionMeters - crossingX) * towardGoalX +
        (grid.minY + row * grid.resolutionMeters - crossingY) * towardGoalY;
      const bestColumn = best % grid.width;
      const bestRow = Math.floor(best / grid.width);
      const bestDot = (grid.minX + bestColumn * grid.resolutionMeters - crossingX) * towardGoalX +
        (grid.minY + bestRow * grid.resolutionMeters - crossingY) * towardGoalY;
      return dot < bestDot ? index : best;
    });
    const startX = grid.minX + (westNeighbor % grid.width) * grid.resolutionMeters;
    const startY = grid.minY + Math.floor(westNeighbor / grid.width) * grid.resolutionMeters;
    const toFord = findPath(
      grid,
      { x: startX, y: startY },
      { x: crossingX, y: crossingY },
    );
    const toRenoHill = findPath(
      grid,
      { x: crossingX, y: crossingY },
      { x: goalX, y: goalY },
    );
    expect(toFord.status).toBe('reachable');
    expect(toRenoHill.status).toBe('reachable');
    if (toFord.status !== 'reachable' || toRenoHill.status !== 'reachable') return;
    const route = [...toFord.path, ...toRenoHill.path.slice(1)];
    const ford = route.find((point) => point.coverKind === grid.fordCode);
    expect(ford).toBeDefined();
    expect(ford?.crossingPenaltyMinutes).toBe(4);
    expect(route.some((point) => point.coverKind === grid.riverCode)).toBe(false);

    const sourceUnit = sameA.state().units.find((unit) => unit.id === 'co-a');
    if (!sourceUnit || !ford) throw new Error('E3 source unit or ford is missing');
    const heldUnit = JSON.parse(JSON.stringify(sourceUnit)) as typeof sourceUnit;
    heldUnit.position = { x: ford.x, y: ford.y };
    heldUnit.path = [{ x: ford.x, y: ford.y }, { x: ford.x + 100, y: ford.y }];
    heldUnit.pathIndex = 1;
    heldUnit.activeOrderId = 'approach-march';
    heldUnit.activeOrderIndex = scenario.orders.findIndex((order) => order.id === 'approach-march');
    heldUnit.blockedReason = undefined;
    heldUnit.speedClass = 'CAVALRY_WALK';
    heldUnit.formation = 'COLUMN';
    heldUnit.posture = 'MARCH';
    heldUnit.mounted = true;
    heldUnit.fordHoldTicks = 0;
    heldUnit.insideFord = false;
    const fordState: SimState = {
      tick: 0,
      rng: { ...sameA.state().rng },
      units: [heldUnit],
      deliveryQueue: [],
      deliveredOrders: [],
      observerContacts: {},
      believedPictures: Object.fromEntries(scenario.sides.map((side) => [side.id, {}])),
      emittedEventCursor: 0,
    };
    const heldAt = { ...heldUnit.position };
    const fordEvents: SimEvent[] = [];
    for (let tick = 1; tick <= 8; tick += 1) {
      fordState.tick = tick;
      moveUnits(scenario, fordState, terrain, fordEvents, new Map());
      expect(heldUnit.position).toEqual(heldAt);
    }
    fordState.tick = 9;
    moveUnits(scenario, fordState, terrain, fordEvents, new Map());
    expect(heldUnit.position).not.toEqual(heldAt);

    const width = 7;
    const costs = new Float32Array(width * width);
    costs.fill(1);
    for (let row = 0; row < width; row += 1) costs[row * width + 3] = Number.POSITIVE_INFINITY;
    const noFord: MovementGrid = {
      id: 'no-ford', width, height: width, resolutionMeters: 10, minX: 0, minY: 0,
      costs, minimumCost: 1,
    };
    expect(findPath(noFord, { x: 10, y: 30 }, { x: 50, y: 30 }).status).toBe('unreachable');
  });

  it('E4 Full-day historical run — completes cleanly with finite, unstuck units and exact delivery ticks', () => {
    const state = sameA.state();
    expect(state.tick).toBe(2160);
    expect(state.deliveryQueue).toHaveLength(0);
    const expectedDeliveries = scenario.orders.reduce((sum, order) => sum + order.recipientUnitIds.length, 0);
    expect(state.deliveredOrders).toHaveLength(expectedDeliveries);
    state.deliveredOrders.forEach((delivery) => expect(delivery.deliveredTick).toBe(delivery.arrivalTick));
    state.units.forEach((unit) => {
      expect(Number.isFinite(unit.position.x) && Number.isFinite(unit.position.y), unit.id).toBe(true);
      const order = unit.activeOrderIndex === undefined ? undefined : scenario.orders[unit.activeOrderIndex];
      if (order && movementOrderTypes.has(order.type)) {
        expect(
          unit.distanceMovedOnActiveOrder > 0 || Boolean(unit.blockedReason) ||
          unit.pathIndex >= unit.path.length || Boolean(unit.pursuit?.contactEmitted),
          `${unit.id}:${order.id}`,
        ).toBe(true);
      }
    });
    const divisionHalt = scenario.orders.find((order) => order.id === 'division-halt');
    if (!divisionHalt) throw new Error('division-halt missing');
    for (const unitId of divisionHalt.recipientUnitIds) {
      const unitIndex = scenario.units.findIndex((unit) => unit.id === unitId);
      const track = sameA.tracks()[unitIndex];
      const before = track.find((sample) => sample.tick === 1079);
      const arrival = track.find((sample) => sample.tick === 1080);
      const after = track.find((sample) => sample.tick === 1081);
      expect(arrival, `${unitId}:division-halt arrival`).toMatchObject({ x: before?.x, y: before?.y });
      expect(after, `${unitId}:division-halt after`).toMatchObject({ x: arrival?.x, y: arrival?.y });
    }
  });

  it('E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table', async () => {
    const result = await runCli([
      '--scenario', 'little-bighorn-1876', '--to-tick', '2160', '--seed', '18760625',
    ]);
    expect(result.report).toContain('# E5 Movement-only Checkpoint Baseline');
    expect(result.report).toContain(`Scenario FNV-1a: \`${sameA.scenarioHash}\``);
    expect(result.report).toContain('| Checkpoint | Unit |');
  }, 120_000);

  it('E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs', () => {
    const straight = createSim(scenario, { seed: 18760625, terrain });
    straight.run(1080);
    const halfwaySave = straight.save(true);
    straight.run(2157);
    const hashAt2157 = hashState(straight.state());
    straight.run(2160);
    const straightHash = hashState(straight.state());
    const fullSave = straight.save(true);

    const resumed = createSim(scenario, { seed: 18760625, terrain });
    resumed.load(halfwaySave);
    resumed.run(2160);
    expect(hashState(resumed.state())).toBe(straightHash);

    const scrubbed = createSim(scenario, { seed: 18760625, terrain });
    scrubbed.load(fullSave, { useKeyframes: true, targetTick: 2157 });
    expect(hashState(scrubbed.state())).toBe(hashAt2157);
  }, 120_000);
});
