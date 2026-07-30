import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { combatConfig } from '../src/combat-config.js';
import type { SimEvent } from '../src/events.js';
import { updateMorale } from '../src/morale.js';
import { initializeState, type EngagementDescriptor, type UnitRuntime } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function fixture(): {
  synthetic: Scenario;
  state: ReturnType<typeof initializeState>;
  pursuer: UnitRuntime;
  target: UnitRuntime;
  events: SimEvent[];
  update: () => void;
} {
  const synthetic = cloneScenario(scenario);
  const ids = new Set(['hunkpapa-pool', 'co-a']);
  synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
  synthetic.leaders = [];
  synthetic.orders = [];
  synthetic.checkpoints = [];
  synthetic.observationEvents = [];
  synthetic.variants = [];
  synthetic.coverFeatures = [];
  const terrain = new FlatTerrain();
  const state = initializeState(synthetic, terrain, 1);
  const pursuer = state.units.find((unit) => unit.id === 'hunkpapa-pool');
  const target = state.units.find((unit) => unit.id === 'co-a');
  if (!pursuer || !target) throw new Error('D106 fixture units missing');
  pursuer.position = { x: 0, y: 0 };
  pursuer.morale = 100;
  pursuer.moraleState = 'STEADY';
  pursuer.cohesion = 100;
  target.position = { x: 100, y: 0 };
  target.morale = 0;
  target.moraleState = 'ROUTED';
  target.cohesion = 100;
  const engagement: EngagementDescriptor = {
    id: [pursuer.id, target.id].sort().join('\0'),
    unitIds: [pursuer.id, target.id],
    state: 'WITHDRAWAL',
    rangeMeters: 100,
    rangeBand: 'CLOSE',
    intensity: 0,
    active: true,
    startedTick: 0,
    updatedTick: 0,
  };
  state.engagements = [engagement];
  state.engagementActive = true;
  const events: SimEvent[] = [];
  const update = (): void => {
    updateMorale(synthetic, state, terrain, combatConfig(), events);
  };
  return { synthetic, state, pursuer, target, events, update };
}

function holdCampDefense(pursuer: UnitRuntime, target: UnitRuntime): void {
  pursuer.campDefense = {
    campUnitId: 'hunkpapa-camp',
    threatUnitId: target.id,
    featureId: 'scenario-reno-bench',
    goal: { x: 50, y: 0 },
    lastPathAttemptTick: 0,
  };
}

describe('WO-D106 camp-defence pursuit gate', () => {
  it('gate-blocks-combat-pursuit-on-holder', () => {
    const item = fixture();
    holdCampDefense(item.pursuer, item.target);
    item.pursuer.path = [{ x: 0, y: 0 }, { x: 50, y: 0 }];
    item.pursuer.pathIndex = 1;

    item.update();

    expect(item.pursuer.pursuit).toBeUndefined();
    expect(item.pursuer.path).toEqual([{ x: 0, y: 0 }, { x: 50, y: 0 }]);
    expect(item.events.some((event) => event.type === 'pursuit-started')).toBe(false);
  });

  it('gate-blocks-initiative-on-holder', () => {
    const item = fixture();
    item.state.engagements = [];
    item.state.engagementActive = false;
    item.target.moraleState = 'STEADY';
    holdCampDefense(item.pursuer, item.target);
    item.pursuer.initiativeRetargetPending = true;
    item.state.believedPictures['lakota-cheyenne-coalition'] = {
      [item.target.id]: {
        status: 'spotted',
        lastSeenTick: 0,
        lastSeenPos: { ...item.target.position },
      },
    };

    item.update();

    expect(item.pursuer.pursuit).toBeUndefined();
    expect(item.events.some((event) => event.type === 'initiative-retargeted')).toBe(false);
  });

  it('gate-inert-for-ordered-units', () => {
    const item = fixture();
    item.pursuer.activeOrderId = 'standing-authority';

    item.update();

    expect(item.pursuer.pursuit).toMatchObject({
      kind: 'COMBAT',
      targetUnitId: item.target.id,
    });
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'pursuit-started',
      unitId: item.pursuer.id,
      targetUnitId: item.target.id,
    }));
  });

  it('release-restores-eligibility', () => {
    const item = fixture();
    holdCampDefense(item.pursuer, item.target);

    item.update();
    expect(item.pursuer.pursuit).toBeUndefined();

    item.pursuer.campDefense = undefined;
    item.state.tick += 1;
    item.update();

    expect(item.pursuer.pursuit).toMatchObject({
      kind: 'COMBAT',
      targetUnitId: item.target.id,
    });
    expect(item.events).toContainEqual(expect.objectContaining({
      type: 'pursuit-started',
      unitId: item.pursuer.id,
      targetUnitId: item.target.id,
    }));
  });
});
