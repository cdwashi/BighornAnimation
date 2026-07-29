import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { combatConfig } from '../src/combat-config.js';
import type { SimEvent } from '../src/events.js';
import { updateMorale } from '../src/morale.js';
import { getPathfindMetrics, resetPathfindMetrics } from '../src/pathfind.js';
import { initializeState, type UnitRuntime } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function fixture(): {
  synthetic: Scenario;
  state: ReturnType<typeof initializeState>;
  terrain: FlatTerrain;
  routed: UnitRuntime;
  friend: UnitRuntime;
  enemy: UnitRuntime;
  update: (tick: number) => void;
} {
  const synthetic = cloneScenario(scenario);
  const ids = new Set(['co-c', 'co-d', 'hunkpapa-pool']);
  synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
  synthetic.leaders = [];
  synthetic.orders = [];
  synthetic.checkpoints = [];
  synthetic.observationEvents = [];
  synthetic.variants = [];
  const terrain = new FlatTerrain();
  const state = initializeState(synthetic, terrain, 1);
  const routed = state.units.find((unit) => unit.id === 'co-c');
  const friend = state.units.find((unit) => unit.id === 'co-d');
  const enemy = state.units.find((unit) => unit.id === 'hunkpapa-pool');
  if (!routed || !friend || !enemy) throw new Error('synthetic units missing');

  routed.position = { x: 100, y: 100 };
  routed.morale = 0;
  routed.moraleState = 'ROUTED';
  routed.posture = 'WITHDRAW';
  friend.position = { x: 1_000, y: 100 };
  friend.morale = 100;
  friend.moraleState = 'STEADY';
  enemy.position = { x: 1_000, y: 100 };
  enemy.morale = 100;
  enemy.moraleState = 'STEADY';
  const events: SimEvent[] = [];
  const update = (tick: number): void => {
    state.tick = tick;
    updateMorale(synthetic, state, terrain, combatConfig(), events);
  };
  return { synthetic, state, terrain, routed, friend, enemy, update };
}

describe('D104 rout pathing gates', () => {
  it('rout-keeps-live-path', () => {
    const { routed, update } = fixture();
    routed.path = [{ x: 100, y: 100 }, { x: 200, y: 100 }];
    routed.pathIndex = 1;

    update(0);

    expect(routed.path).toEqual([{ x: 100, y: 100 }, { x: 200, y: 100 }]);
    expect(routed.pathIndex).toBe(1);
    expect(routed.blockedReason).toBeUndefined();
    expect(routed.routSafetyPath).not.toBe(true);
  });

  it('rout-origin-exemption', () => {
    const { routed, friend, enemy, update } = fixture();
    friend.position = { x: 300, y: 100 };
    enemy.position = { ...routed.position };

    update(0);

    expect(routed.routSafetyPath).toBe(true);
    expect(routed.path.length).toBeGreaterThan(1);
    expect(routed.path.at(-1)).toMatchObject(friend.position);
    expect(routed.blockedReason).toBeUndefined();
  });

  it('rout-retry-cadence', () => {
    const { routed, update } = fixture();
    resetPathfindMetrics();

    update(5);
    expect(getPathfindMetrics().calls).toBe(1);
    expect(routed.routLastPathAttemptTick).toBe(5);
    for (let tick = 6; tick < 15; tick += 1) update(tick);
    expect(getPathfindMetrics().calls).toBe(1);

    update(15);
    expect(getPathfindMetrics().calls).toBe(2);
    expect(routed.routLastPathAttemptTick).toBe(15);
    expect(routed.routSafetyPath).not.toBe(true);
  });

  it('success-latch-preserved', () => {
    const { routed, friend, enemy, update } = fixture();
    friend.position = { x: 300, y: 100 };
    enemy.position = { ...routed.position };
    resetPathfindMetrics();

    update(0);
    const successfulPath = [...routed.path];
    expect(routed.routSafetyPath).toBe(true);
    expect(getPathfindMetrics().calls).toBe(1);

    enemy.position = { ...friend.position };
    update(10);
    expect(getPathfindMetrics().calls).toBe(1);
    expect(routed.path).toEqual(successfulPath);
    expect(routed.routSafetyPath).toBe(true);
  });
});
