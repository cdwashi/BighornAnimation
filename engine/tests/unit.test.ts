import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { createSim } from '../src/index.js';
import { findPath, type MovementGrid } from '../src/pathfind.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

describe('engine unit contracts', () => {
  it('pathfind reports a grid wall without a ford as unreachable', () => {
    const width = 7;
    const costs = new Float32Array(width * width);
    costs.fill(1);
    for (let row = 0; row < width; row += 1) costs[row * width + 3] = Number.POSITIVE_INFINITY;
    const grid: MovementGrid = {
      id: 'wall', width, height: width, resolutionMeters: 10, minX: 0, minY: 0,
      costs, minimumCost: 1,
    };
    expect(findPath(grid, { x: 10, y: 30 }, { x: 50, y: 30 }).status).toBe('unreachable');
  });

  it('supersedes an active order on receipt and emits its audit event', () => {
    const synthetic = cloneScenario(scenario);
    synthetic.orders = [
      { ...synthetic.orders[0], id: 'first', recipientUnitIds: ['co-a'], objective: { landmarkId: 'divide' } },
      { ...synthetic.orders[1], id: 'second', issuedAtMinute: 0, recipientUnitIds: ['co-a'], type: 'HOLD' },
    ];
    const sim = createSim(synthetic, { seed: 1, terrain: new FlatTerrain() });
    const supersede = sim.events().find((event) => event.type === 'order-superseded');
    expect(supersede).toMatchObject({
      tick: 0,
      unitId: 'co-a',
      orderId: 'second',
      supersededOrderId: 'first',
    });
  });

  it('refuses a save whose scenario content hash does not match', () => {
    const sim = createSim(scenario, { seed: 1, terrain: new FlatTerrain() });
    const save = sim.save(false);
    save.scenarioHash = '00000000';
    expect(() => sim.load(save)).toThrow(/scenario hash mismatch/);
  });
});
