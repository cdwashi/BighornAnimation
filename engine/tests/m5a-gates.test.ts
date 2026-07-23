import { describe, expect, it } from 'vitest';

import criteriaData from '../../data/calibration/baseline-seed-criteria.json';
import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { BaselineSeedCriteria, SeedEnvelopeOutcome } from '../src/baseline-selection.js';
import { infiltrationOutputMultipliers, splitCasualties } from '../src/combat.js';
import { DEFAULT_COMBAT_CONFIG, KILLED_TO_WOUNDED_RATIO_RANGES } from '../src/combat-config.js';
import { formatSeedEnvelope } from '../src/envelope.js';
import type { ObservationExamRow } from '../src/exam.js';
import { createSim } from '../src/index.js';
import {
  scoreCasualtyComponent,
  scoreCheckpointComponent,
  scoreEndStateComponent,
  scoreObservationComponent,
  counterfactualExcludedUnitIds,
  variantReviewMetadata,
  weightedComposite,
  type CheckpointScore,
  type ComponentScore,
} from '../src/score.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

function checkpointScores(hits: Set<string>): CheckpointScore[] {
  return scenario.checkpoints.map((checkpoint) => ({
    checkpointId: checkpoint.id,
    unitId: checkpoint.unitId,
    targetMinute: checkpoint.minute,
    nearestMinute: checkpoint.minute,
    distanceMeters: hits.has(checkpoint.id) ? 0 : checkpoint.toleranceMeters + 1,
    timeDeltaMinutes: 0,
    toleranceMeters: checkpoint.toleranceMeters,
    toleranceMinutes: checkpoint.toleranceMinutes,
    hit: hits.has(checkpoint.id),
  }));
}

function observationRows(matchedCount: number): ObservationExamRow[] {
  let gateableIndex = 0;
  return scenario.observationEvents.map((event) => {
    const gateable = event.provenance.confidence === 'HIGH' || event.provenance.confidence === 'MEDIUM';
    const matched = !gateable || gateableIndex++ < matchedCount;
    return {
      eventId: event.id,
      minute: event.minute,
      confidence: event.provenance.confidence,
      scope: gateable ? 'gateable' : 'excluded-confidence',
      expectedObserved: event.observed,
      predictedObserved: matched ? event.observed : !event.observed,
      matched,
      threshold: 1,
    };
  });
}

function component(id: ComponentScore['id'], score: number, weight: number, passed = true): ComponentScore {
  return { id, label: id, score, weight, passed, gate: 'synthetic', items: [] };
}

describe('M5-A scorer, split, envelope, and variant gates', () => {
  it('C1 enforces both HIGH-confidence and overall checkpoint thresholds', () => {
    const highIds = scenario.checkpoints.filter((item) => item.provenance.confidence === 'HIGH')
      .map((item) => item.id);
    const passing = new Set([...highIds.slice(0, 3), ...scenario.checkpoints.slice(0, 5).map((item) => item.id)]);
    expect(scoreCheckpointComponent(scenario, checkpointScores(passing)).passed).toBe(true);
    expect(scoreCheckpointComponent(scenario, checkpointScores(new Set(highIds.slice(0, 2)))).passed).toBe(false);
  });

  it('C2 scores both side-level columns and exact flagship destruction', () => {
    const state = createSim(scenario, { terrain: new FlatTerrain(), seed: 1 }).state();
    const us = state.units.find((unit) => scenario.units[unit.unitIndex].sideId === 'us-7th-cavalry');
    const coalition = state.units.find((unit) =>
      scenario.units[unit.unitIndex].sideId === 'lakota-cheyenne-coalition');
    if (!us || !coalition) throw new Error('synthetic side unit missing');
    us.killed = 253;
    us.wounded = 52;
    coalition.killed = 60;
    coalition.wounded = 160;
    for (const id of ['co-c', 'co-e', 'co-f', 'co-i', 'co-l']) {
      const unit = state.units.find((item) => item.id === id);
      if (unit) unit.endState = 'DESTROYED';
    }
    const result = scoreCasualtyComponent(scenario, state);
    expect(result.items.filter((item) => item.id.endsWith(':killed'))).toHaveLength(2);
    expect(result.items.filter((item) => item.id.endsWith(':wounded'))).toHaveLength(2);
    expect(result.passed).toBe(true);
    us.wounded = 0;
    expect(scoreCasualtyComponent(scenario, state).passed).toBe(false);
  });

  it('C3 requires every HIGH assertion by its deadline', () => {
    const synthetic = cloneScenario(scenario);
    synthetic.calibration.endState = [scenario.calibration.endState[0]];
    const sim = createSim(synthetic, { terrain: new FlatTerrain(), seed: 1 });
    const deadlineTick = synthetic.calibration.endState[0].byMinute * 2;
    const onTime = scoreEndStateComponent(synthetic, new FlatTerrain(), sim.state(), sim.tracks(), [{
      sequence: 0, tick: deadlineTick, type: 'unit-destroyed', unitId: 'co-c',
    }]);
    const late = scoreEndStateComponent(synthetic, new FlatTerrain(), sim.state(), sim.tracks(), [{
      sequence: 0, tick: deadlineTick + 1, type: 'unit-destroyed', unitId: 'co-c',
    }]);
    expect(onTime.passed).toBe(true);
    expect(late.passed).toBe(false);
  });

  it('C4 uses the 80% HIGH/MEDIUM observation rule', () => {
    expect(scoreObservationComponent(scenario, observationRows(11)).passed).toBe(true);
    expect(scoreObservationComponent(scenario, observationRows(10)).passed).toBe(false);
  });

  it('weights synthetic perfect and failing cards exactly', () => {
    const perfect = [component('C1', 1, 0.35), component('C2', 1, 0.25),
      component('C3', 1, 0.25), component('C4', 1, 0.15)];
    const failing = [component('C1', 0, 0.35, false), component('C2', 0, 0.25, false),
      component('C3', 0, 0.25, false), component('C4', 0, 0.15, false)];
    expect(weightedComposite(perfect)).toBe(1);
    expect(weightedComposite(failing)).toBe(0);
    expect(weightedComposite([component('C1', 1, 0.35), component('C2', 0, 0.25),
      component('C3', 0, 0.25), component('C4', 0, 0.15)])).toBeCloseTo(0.35);
  });

  it('D81 sourced ratio ranges are ordered and split rounding consumes exactly one seeded draw', () => {
    for (const range of Object.values(KILLED_TO_WOUNDED_RATIO_RANGES)) {
      expect(range.low).toBeLessThanOrEqual(range.best);
      expect(range.best).toBeLessThanOrEqual(range.high);
    }
    const state = createSim(scenario, { terrain: new FlatTerrain(), seed: 1 }).state();
    const before = state.rng.draws;
    const split = splitCasualties(state, 5, 1, 1);
    expect(split.killed + split.wounded).toBe(5);
    expect(state.rng.draws).toBe(before + 1);
  });

  it('same seed-outcome list produces a byte-identical envelope report with ordered G-M5-2 evidence', () => {
    const criteria = { ...(criteriaData as unknown as BaselineSeedCriteria), seedList: [1, 2, 3] };
    const outcomes: SeedEnvelopeOutcome[] = [1, 2, 3].map((seed) => ({
      seed,
      composite: seed / 10,
      componentScores: { C1: seed / 10, C2: 1, C3: 1, C4: 1 },
      leaderDeaths: ['custer'],
      arikaraKilled: seed,
      arikaraWounded: 0,
      arikaraLosses: seed,
      routComposition: ['co-a'],
      wingDestructionTick: 1600 + seed,
      fordChoke: [{ unitId: 'co-a', killed: seed, wounded: 0 }],
    }));
    const left = formatSeedEnvelope({ scenario, criteria, criteriaHash: 'abc', outcomes }).report;
    const right = formatSeedEnvelope({ scenario, criteria, criteriaHash: 'abc', outcomes }).report;
    expect(left).toBe(right);
    expect(left.indexOf('| 1 | Criteria bytes read and hashed')).toBeLessThan(
      left.indexOf('| 2 | Per-seed report generation began'));
  });

  it('all seven variants receive Q3 tiers and counterfactual status comes from provenance flags', () => {
    const tags = Object.fromEntries(scenario.variants.map((variant) =>
      [variant.id, variantReviewMetadata(scenario, [variant.id])]));
    expect(Object.keys(tags)).toHaveLength(7);
    expect(tags['v-mtc-crossing'].reviewTier).toBe('deep');
    expect(tags['v-organized-last-stand'].reviewTier).toBe('deep');
    expect(tags['v-reno-holds-timber']).toMatchObject({ reviewTier: 'deep', counterfactual: true });
    expect(tags['v-benteen-prompt']).toMatchObject({ reviewTier: 'deep', counterfactual: true });
    expect(Object.values(tags).filter((tag) => tag.reviewTier === 'sanity')).toHaveLength(3);
    expect([...counterfactualExcludedUnitIds(scenario, ['v-reno-holds-timber'])].sort())
      .toEqual(['co-a', 'co-g', 'co-m']);
    expect([...counterfactualExcludedUnitIds(scenario, ['v-benteen-prompt'])].sort())
      .toEqual(['co-d', 'co-h', 'co-k']);
  });

  it('D87 infiltration requires real cover occupancy and a formed enemy', () => {
    expect(infiltrationOutputMultipliers(
      'CONSENSUS_INITIATIVE', 90, 1, 'LINE', DEFAULT_COMBAT_CONFIG,
    )).toEqual({ kill: 1, suppression: 1 });
    expect(infiltrationOutputMultipliers(
      'CONSENSUS_INITIATIVE', 90, 0.6, 'DISPERSED', DEFAULT_COMBAT_CONFIG,
    )).toEqual({ kill: 1, suppression: 1 });
    expect(infiltrationOutputMultipliers(
      'CONSENSUS_INITIATIVE', 90, 0.6, 'LINE', DEFAULT_COMBAT_CONFIG,
    )).toEqual({
      kill: DEFAULT_COMBAT_CONFIG.infiltrationKillMultiplier,
      suppression: DEFAULT_COMBAT_CONFIG.infiltrationSuppressionMultiplier,
    });
  });
});
