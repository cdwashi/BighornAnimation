import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { combatConfig } from '../src/combat-config.js';
import { createCombatRuntime, resolveCombat } from '../src/combat.js';
import { updateEngagements } from '../src/engagement.js';
import type { SimEvent } from '../src/events.js';
import { updateMorale } from '../src/morale.js';
import { moveUnits } from '../src/movement.js';
import { initializeState, type EngagementDescriptor, type UnitRuntime } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function fixture(): {
  scenario: Scenario;
  state: ReturnType<typeof initializeState>;
  terrain: FlatTerrain;
  attacker: UnitRuntime;
  defender: UnitRuntime;
  engagement: EngagementDescriptor;
  events: SimEvent[];
  resolve: () => void;
} {
  const synthetic = cloneScenario(scenario);
  const ids = new Set(['hunkpapa-pool', 'co-a']);
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
  if (!attacker || !defender) throw new Error('D105 fixture units missing');
  attacker.position = { x: 100, y: 100 };
  defender.position = { x: 120, y: 100 };
  attacker.morale = 100;
  attacker.moraleState = 'STEADY';
  attacker.strengthCurrent = 50;
  attacker.strengthAvailable = 50;
  attacker.ammunition = {};
  defender.morale = 100;
  defender.moraleState = 'STEADY';
  defender.strengthCurrent = 100;
  defender.strengthAvailable = 100;
  defender.ammunition = {};
  attacker.pursuit = {
    kind: 'COMBAT',
    targetUnitId: defender.id,
    lastRepathTick: 0,
    lastTargetPosition: { ...defender.position },
    contactEmitted: true,
  };
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
  return { scenario: synthetic, state, terrain, attacker, defender, engagement, events, resolve };
}

describe('WO-D105 close-action bout', () => {
  it('bout-latch-one-resolution-per-contact', () => {
    const item = fixture();

    item.resolve();
    expect(item.events.filter((event) => event.type === 'melee-bout')).toHaveLength(1);
    expect(item.events.find((event) => event.type === 'melee-bout')?.outcome).toBe('held');
    expect(item.engagement.meleeBoutResolved).toBe(true);

    updateEngagements(item.scenario, item.state, combatConfig(), item.events);
    item.resolve();
    expect(item.events.filter((event) => event.type === 'melee-bout')).toHaveLength(1);

    item.defender.position.x = 126;
    updateEngagements(item.scenario, item.state, combatConfig(), item.events);
    expect(item.engagement.meleeBoutResolved).toBe(false);
    item.defender.position.x = 120;
    updateEngagements(item.scenario, item.state, combatConfig(), item.events);
    item.resolve();
    expect(item.events.filter((event) => event.type === 'melee-bout')).toHaveLength(2);
  });

  it('repulse-ends-pursuit', () => {
    const item = fixture();
    item.attacker.strengthCurrent = 40;
    item.attacker.strengthAvailable = 40;
    item.attacker.path = [{ x: 100, y: 100 }, { x: 120, y: 100 }];
    item.attacker.pathIndex = 1;

    item.resolve();

    expect(item.attacker.pursuit).toBeUndefined();
    expect(item.attacker.path).toEqual([]);
    expect(item.attacker.posture).toBe('WITHDRAW');
    expect(item.engagement.state).toBe('WITHDRAWAL');
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'pursuit-ended',
      unitId: item.attacker.id,
      targetUnitId: item.defender.id,
      reason: 'repulsed',
    }));
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      outcome: 'repel',
      convertedWounded: 0,
    }));
  });

  it('break-converts-wounded-in-bout-only', () => {
    const item = fixture();
    item.attacker.strengthCurrent = 70;
    item.attacker.strengthAvailable = 70;
    item.defender.killed = 3;
    item.defender.wounded = 7;
    item.defender.casualties = 10;
    item.defender.strengthCurrent = 90;
    item.defender.strengthAvailable = 90;

    item.resolve();

    expect(item.defender.moraleState).toBe('ROUTED');
    expect(item.defender.killed).toBe(10);
    expect(item.defender.wounded).toBe(0);
    expect(item.defender.casualties).toBe(10);
    expect(item.defender.strengthCurrent).toBe(90);
    expect(item.defender.strengthAvailable).toBe(90);
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'melee-bout',
      outcome: 'break',
      convertedWounded: 7,
    }));

    const killedAfterBout = item.defender.killed;
    item.state.tick += 1;
    updateMorale(item.scenario, item.state, item.terrain, combatConfig(), item.events);
    expect(item.defender.killed).toBe(killedAfterBout);
    expect(item.events.filter((event) =>
      event.type === 'melee-bout' && (event.convertedWounded ?? 0) > 0)).toHaveLength(1);

    const repel = fixture();
    repel.attacker.strengthCurrent = 40;
    repel.attacker.strengthAvailable = 40;
    repel.defender.wounded = 7;
    repel.defender.casualties = 7;
    repel.resolve();
    expect(repel.defender.wounded).toBe(7);
    expect(repel.events.find((event) => event.type === 'melee-bout')?.convertedWounded).toBe(0);

    const fire = fixture();
    fire.engagement.state = 'FIREFIGHT';
    fire.engagement.rangeMeters = 100;
    fire.engagement.rangeBand = 'CLOSE';
    fire.attacker.strengthCurrent = 1_000;
    fire.attacker.strengthAvailable = 1_000;
    fire.attacker.ammunition = Object.fromEntries(
      Object.keys(fire.scenario.units[fire.attacker.unitIndex].weaponMix).map((id) => [id, 10_000]),
    );
    fire.defender.wounded = 7;
    fire.defender.casualties = 7;
    fire.resolve();
    const fireEvent = fire.events.find((event) =>
      event.type === 'casualty-resolution' && event.targetUnitId === fire.defender.id);
    expect(fireEvent).toBeDefined();
    expect(fire.defender.wounded).toBe(7 + (fireEvent?.wounded ?? 0));
    expect(fire.events.some((event) => event.type === 'melee-bout')).toBe(false);
  });

  it('no-cohesion-floor-destruction', () => {
    const item = fixture();
    item.state.engagements = [];
    item.attacker.pursuit = undefined;
    item.defender.morale = 0;
    item.defender.moraleState = 'ROUTED';
    item.defender.cohesion = combatConfig().destructionCohesionFloor;
    item.defender.strengthCurrent = 10;
    item.defender.strengthAvailable = 10;
    const before = {
      killed: item.defender.killed,
      wounded: item.defender.wounded,
      casualties: item.defender.casualties,
    };

    updateMorale(item.scenario, item.state, item.terrain, combatConfig(), item.events);

    expect(item.defender.endState).toBeUndefined();
    expect(item.defender.strengthCurrent).toBe(10);
    expect({
      killed: item.defender.killed,
      wounded: item.defender.wounded,
      casualties: item.defender.casualties,
    }).toEqual(before);
  });

  it('standoff-closes-to-melee', () => {
    const item = fixture();
    item.state.engagements = [];
    item.attacker.position = { x: 100, y: 100 };
    item.defender.position = { x: 200, y: 100 };
    item.attacker.speedClass = 'CAVALRY_GALLOP';
    item.attacker.formation = 'COLUMN';
    item.attacker.path = [{ x: 100, y: 100 }, { x: 200, y: 100 }];
    item.attacker.pathIndex = 1;
    item.attacker.pursuit = {
      kind: 'COMBAT',
      targetUnitId: item.defender.id,
      lastRepathTick: item.state.tick,
      lastTargetPosition: { ...item.defender.position },
      contactEmitted: false,
    };

    moveUnits(item.scenario, item.state, item.terrain, item.events, new Map(), combatConfig());

    const range = Math.hypot(
      item.defender.position.x - item.attacker.position.x,
      item.defender.position.y - item.attacker.position.y,
    );
    expect(range).toBe(combatConfig().meleeRangeMeters);
  });
});
