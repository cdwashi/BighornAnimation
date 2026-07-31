import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { combatConfig } from '../src/combat-config.js';
import { createCombatRuntime, resolveCombat } from '../src/combat.js';
import type { SimEvent } from '../src/events.js';
import { initializeState, type EngagementDescriptor, type UnitRuntime } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function fixture(): {
  scenario: Scenario;
  state: ReturnType<typeof initializeState>;
  attacker: UnitRuntime;
  defender: UnitRuntime;
  shelter: UnitRuntime;
  events: SimEvent[];
  resolve: () => void;
} {
  const synthetic = cloneScenario(scenario);
  const ids = new Set(['hunkpapa-pool', 'co-a', 'co-g']);
  synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
  synthetic.leaders = [];
  synthetic.orders = [];
  synthetic.checkpoints = [];
  synthetic.observationEvents = [];
  synthetic.variants = [];
  synthetic.terrain.cover = [];
  const terrain = new FlatTerrain();
  const state = initializeState(synthetic, terrain, 1);
  const attacker = state.units.find((unit) => unit.id === 'hunkpapa-pool');
  const defender = state.units.find((unit) => unit.id === 'co-a');
  const shelter = state.units.find((unit) => unit.id === 'co-g');
  if (!attacker || !defender || !shelter) throw new Error('D107 fixture units missing');

  attacker.position = { x: 100, y: 100 };
  attacker.morale = 100;
  attacker.moraleState = 'STEADY';
  attacker.strengthCurrent = 70;
  attacker.strengthAvailable = 70;
  attacker.ammunition = {};
  attacker.pursuit = {
    kind: 'COMBAT',
    targetUnitId: defender.id,
    lastRepathTick: 0,
    lastTargetPosition: { ...defender.position },
    contactEmitted: true,
  };

  defender.position = { x: 120, y: 100 };
  defender.morale = 0;
  defender.moraleState = 'ROUTED';
  defender.strengthTotal = 20;
  defender.killed = 3;
  defender.wounded = 5;
  defender.casualties = 8;
  defender.strengthCurrent = 12;
  defender.strengthAvailable = 10;
  defender.horseHolderStrength = 2;
  defender.path = [{ x: 120, y: 100 }, { x: 500, y: 100 }];
  defender.pathIndex = 1;
  defender.ammunition = {};

  shelter.position = { x: 2_000, y: 100 };
  shelter.morale = 100;
  shelter.moraleState = 'STEADY';
  shelter.strengthCurrent = 29;
  shelter.strengthAvailable = 29;

  const engagement: EngagementDescriptor = {
    id: [attacker.id, defender.id].sort().join('\0'),
    unitIds: [attacker.id, defender.id],
    state: 'MELEE',
    rangeMeters: 20,
    rangeBand: 'MELEE',
    intensity: 0,
    active: true,
    startedTick: 0,
    updatedTick: 0,
  };
  state.engagements = [engagement];
  state.engagementActive = true;
  const events: SimEvent[] = [];
  const runtime = createCombatRuntime(synthetic, terrain, combatConfig());
  const resolve = (): void => {
    resolveCombat(synthetic, state, terrain, runtime, 1, events);
  };
  return { scenario: synthetic, state, attacker, defender, shelter, events, resolve };
}

describe('WO-D107 close-action annihilation', () => {
  it('annihilation-on-isolated-catch', () => {
    const item = fixture();

    item.resolve();

    expect(item.defender.endState).toBe('DESTROYED');
    expect(item.defender.killed).toBe(20);
    expect(item.defender.wounded).toBe(0);
    expect(item.defender.strengthCurrent).toBe(0);
    expect(item.defender.strengthAvailable).toBe(0);
    expect(item.defender.horseHolderStrength).toBe(0);
    expect(item.defender.casualties).toBe(item.defender.strengthTotal);
    expect(item.defender.path).toEqual([]);
    expect(item.defender.pathIndex).toBe(0);
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'unit-destroyed',
      unitId: item.defender.id,
      killed: 12,
    }));
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      targetUnitId: item.defender.id,
      outcome: 'annihilation',
      convertedWounded: 5,
      terminalConverted: 12,
    }));

    const eventCount = item.events.length;
    item.state.engagements[0].meleeBoutResolved = false;
    item.resolve();
    expect(item.events).toHaveLength(eventCount);
  });

  it('no-annihilation-on-first-break', () => {
    const item = fixture();
    item.defender.morale = 100;
    item.defender.moraleState = 'STEADY';
    item.attacker.strengthCurrent = 1_000;
    item.attacker.strengthAvailable = 1_000;

    item.resolve();

    expect(item.defender.endState).toBeUndefined();
    expect(item.defender.moraleState).toBe('ROUTED');
    expect(item.defender.strengthCurrent).toBe(12);
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      outcome: 'break',
      convertedWounded: 5,
    }));
    const bout = item.events.find((event) => event.type === 'melee-bout');
    expect(bout?.terminalConverted).toBeUndefined();
    expect(bout?.shelteredBy).toBeUndefined();
  });

  it('no-annihilation-when-sheltered', () => {
    const item = fixture();
    item.shelter.position = { x: 300, y: 100 };

    item.resolve();

    expect(item.defender.endState).toBeUndefined();
    expect(item.defender.strengthCurrent).toBe(12);
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      outcome: 'break',
      shelteredBy: {
        id: item.shelter.id,
        distanceMeters: 180,
        strengthCurrent: 29,
      },
    }));
  });

  it('withdrawn-does-not-shelter', () => {
    const item = fixture();
    item.shelter.position = { x: 300, y: 100 };
    item.shelter.withdrawnOffField = true;

    item.resolve();

    expect(item.defender.endState).toBe('DESTROYED');
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      outcome: 'annihilation',
      terminalConverted: 12,
    }));
  });

  it('accounting-terminal-conversion', () => {
    const item = fixture();
    const fireKilled = item.defender.killed;

    item.resolve();

    const bout = item.events.find((event) => event.type === 'melee-bout');
    expect(item.defender.killed - fireKilled - (bout?.convertedWounded ?? 0) -
      (bout?.terminalConverted ?? 0)).toBe(0);
  });
});
