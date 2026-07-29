import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { DEFAULT_COMBAT_CONFIG } from '../src/combat-config.js';
import { effectiveFireRangeMeters, isFlanking } from '../src/combat.js';
import { updateEngagements } from '../src/engagement.js';
import { frontageMeters } from '../src/frontage.js';
import { initializeState, type UnitRuntime } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function isolatedScenario(): { scenario: Scenario; cavalry: UnitRuntime; warrior: UnitRuntime } {
  const synthetic = cloneScenario(scenario);
  const ids = new Set(['co-a', 'hunkpapa-pool']);
  synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
  synthetic.leaders = [];
  synthetic.orders = [];
  synthetic.checkpoints = [];
  synthetic.observationEvents = [];
  synthetic.variants = [];
  synthetic.terrain.cover = [];
  const state = initializeState(synthetic, new FlatTerrain(), 1);
  const cavalry = state.units.find((unit) => unit.id === 'co-a');
  const warrior = state.units.find((unit) => unit.id === 'hunkpapa-pool');
  if (!cavalry || !warrior) throw new Error('D102 fixture units missing');
  return { scenario: synthetic, cavalry, warrior };
}

describe('WO-D102 asymmetric unit frontage', () => {
  it('D102 frontage derivation scopes nonzero extent to dismounted SKIRMISH cavalry; mounted and warrior frontage stay zero', () => {
    const fixture = isolatedScenario();
    fixture.cavalry.mounted = false;
    fixture.cavalry.formation = 'SKIRMISH';
    fixture.cavalry.strengthAvailable = 34;
    expect(frontageMeters(fixture.cavalry, fixture.scenario)).toBeCloseTo(155.38, 10);

    fixture.cavalry.mounted = true;
    expect(frontageMeters(fixture.cavalry, fixture.scenario)).toBe(0);

    fixture.warrior.mounted = false;
    fixture.warrior.formation = 'SKIRMISH';
    expect(frontageMeters(fixture.warrior, fixture.scenario)).toBe(0);
  });

  it('D102 centroid opening invariant keeps the 700 m engagement gate centroid-based', () => {
    const fixture = isolatedScenario();
    const state = initializeState(fixture.scenario, new FlatTerrain(), 1);
    const cavalry = state.units.find((unit) => unit.id === 'co-a');
    const warrior = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    if (!cavalry || !warrior) throw new Error('D102 fixture units missing');
    cavalry.position = { x: 0, y: 0 };
    cavalry.mounted = false;
    cavalry.formation = 'SKIRMISH';
    cavalry.strengthAvailable = 200;
    warrior.position = { x: 701, y: 0 };
    state.believedPictures['us-7th-cavalry'][warrior.id] = {
      status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...warrior.position },
    };

    updateEngagements(fixture.scenario, state, DEFAULT_COMBAT_CONFIG, []);
    expect(state.engagements).toHaveLength(0);

    warrior.position.x = 700;
    updateEngagements(fixture.scenario, state, DEFAULT_COMBAT_CONFIG, []);
    expect(state.engagements).toHaveLength(1);
    expect(state.engagements[0].rangeMeters).toBe(700);
  });

  it('D102 effective fire range subtracts both frontage half-widths without changing centroid range', () => {
    const fixture = isolatedScenario();
    fixture.cavalry.mounted = false;
    fixture.cavalry.formation = 'SKIRMISH';
    fixture.cavalry.strengthAvailable = 34;
    const attacker = structuredClone(fixture.cavalry);
    attacker.id = 'attacker';
    attacker.strengthAvailable = 10;
    const centroidRange = 216;

    expect(effectiveFireRangeMeters(
      attacker,
      fixture.cavalry,
      fixture.scenario,
      DEFAULT_COMBAT_CONFIG,
      centroidRange,
    )).toBeCloseTo(115.46, 10);
    expect(centroidRange).toBe(216);
  });

  it('D102 endpoint flank flags a beyond-endpoint attacker but not one abeam within the segment', () => {
    const fixture = isolatedScenario();
    fixture.cavalry.position = { x: 0, y: 0 };
    fixture.cavalry.facingRadians = 0;
    fixture.cavalry.mounted = false;
    fixture.cavalry.formation = 'SKIRMISH';
    fixture.cavalry.strengthAvailable = 10;

    fixture.warrior.position = { x: 1_000, y: 30 };
    expect(isFlanking(
      fixture.warrior, fixture.cavalry, fixture.scenario, DEFAULT_COMBAT_CONFIG,
    )).toEqual({ angular: false, endpoint: true, flanked: true });

    fixture.warrior.position = { x: 0, y: 20 };
    expect(isFlanking(
      fixture.warrior, fixture.cavalry, fixture.scenario, DEFAULT_COMBAT_CONFIG,
    )).toEqual({ angular: false, endpoint: false, flanked: false });
  });
});
