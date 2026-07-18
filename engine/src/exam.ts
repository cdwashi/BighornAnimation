import type { ObservationEvent, Scenario } from '../../src/schema/scenario-schema.js';
import { minuteToTick } from './clock.js';
import { createSim } from './index.js';
import type { EngineTerrain } from './pathfind.js';
import {
  createSpottingRuntime,
  evaluateDetectability,
  observerSignature,
  spottingConfig,
  targetSignature,
  D52_SPOTTING_CONFIG,
  DEFAULT_SPOTTING_CONFIG,
  type DetectabilityFactors,
  type ObserverSignature,
  type SpottingConfig,
  type SpottingSignature,
} from './spotting.js';
import type { SimState, UnitRuntime } from './state.js';

export type ExamScope = 'gateable' | 'excluded-confidence';

export interface ObservationExamRow {
  eventId: string;
  minute: number;
  confidence: string;
  scope: ExamScope;
  expectedObserved: boolean;
  predictedObserved?: boolean;
  matched: boolean;
  score?: number;
  threshold: number;
  margin?: number;
  observerId?: string;
  targetId?: string;
  factors?: DetectabilityFactors;
  failingFactor?: string;
  resolutionNote?: string;
}

export interface ObservationExamResult {
  rows: ObservationExamRow[];
  gateableCount: number;
  reproducedCount: number;
  reproductionRate: number;
  passed: boolean;
  config: SpottingConfig;
  report: string;
}

function scopeFor(event: ObservationEvent): ExamScope {
  return event.provenance.confidence === 'HIGH' || event.provenance.confidence === 'MEDIUM'
    ? 'gateable'
    : 'excluded-confidence';
}

function runtimeUnit(state: SimState, id: string | undefined): UnitRuntime | undefined {
  return id === undefined ? undefined : state.units.find((unit) => unit.id === id);
}

function resolveObserver(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  event: ObservationEvent,
  config: SpottingConfig,
): { signature?: ObserverSignature; note?: string } {
  const leader = event.observerLeaderId === undefined
    ? undefined
    : scenario.leaders.find((item) => item.id === event.observerLeaderId);
  const unit = runtimeUnit(state, event.observerUnitId ?? leader?.attachedToUnitId);
  const recordedPosition = event.observerPosition === undefined
    ? undefined
    : terrain.toLocal(event.observerPosition.lat, event.observerPosition.lon);
  if (unit) {
    const position = recordedPosition === undefined
      ? unit.position
      : { x: recordedPosition[0], y: recordedPosition[1] };
    return {
      signature: observerSignature(scenario, unit, config, position),
      note: recordedPosition === undefined
        ? 'movement-only unit position'
        : 'event-recorded observer position',
    };
  }
  if (recordedPosition) {
    return {
      signature: {
        id: `${event.id}:observer`,
        position: { x: recordedPosition[0], y: recordedPosition[1] },
        heightMeters: config.heightStanding,
        perceptionFactor: 1,
      },
      note: 'event-recorded observer position; no unit/leader, doctrine-average perception',
    };
  }
  return { note: 'unresolved observer: event has no usable leader, unit, or position' };
}

function nearestUnitToPoint(state: SimState, point: { x: number; y: number }): UnitRuntime | undefined {
  let nearest: UnitRuntime | undefined;
  let nearestDistance = Number.POSITIVE_INFINITY;
  for (const unit of state.units) {
    const distance = Math.hypot(unit.position.x - point.x, unit.position.y - point.y);
    if (distance < nearestDistance) {
      nearest = unit;
      nearestDistance = distance;
    }
  }
  return nearest;
}

function resolveTarget(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  event: ObservationEvent,
): { signature?: SpottingSignature; note?: string } {
  const direct = runtimeUnit(state, event.target.unitId);
  if (direct) return { signature: targetSignature(scenario, direct), note: 'target unit' };
  if (event.target.landmarkId) {
    const landmark = scenario.terrain.landmarks.find((item) => item.id === event.target.landmarkId);
    if (!landmark) return { note: `unresolved target: missing landmark ${event.target.landmarkId}` };
    const [x, y] = terrain.toLocal(landmark.position.lat, landmark.position.lon);
    // TODO-AMBIGUOUS(M3-A): landmark-only observations have position but no
    // detectability signature. Use the nearest movement-only unit as the
    // generic representative; do not add an event-id-specific mapping.
    const representative = nearestUnitToPoint(state, { x, y });
    if (!representative) return { note: `unresolved target: no unit near landmark ${landmark.id}` };
    return {
      signature: targetSignature(scenario, representative),
      note: `nearest unit to target landmark ${landmark.id}`,
    };
  }
  // TODO-AMBIGUOUS(M3-A): two inherited rows describe a collective target but
  // provide no unit or landmark. Treating either as a chosen unit would be a
  // per-event special case, so the exam records an explicit mismatch instead.
  return { note: 'unresolved target: description-only event has no unitId or landmarkId' };
}

function mismatchFactor(
  expected: boolean,
  score: number,
  threshold: number,
  factors: DetectabilityFactors,
): string | undefined {
  const predicted = score >= threshold;
  if (predicted === expected) return undefined;
  if (expected && !factors.terrainVisible) return 'terrain-blocked (transmittance 0)';
  if (expected) return `score below T_spot by ${(threshold - score).toExponential(3)}`;
  return `unexpected visibility: score exceeds T_spot by ${(score - threshold).toExponential(3)}`;
}

function evaluateEvent(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  event: ObservationEvent,
  runtime: ReturnType<typeof createSpottingRuntime>,
): ObservationExamRow {
  const scope = scopeFor(event);
  const observer = resolveObserver(scenario, terrain, state, event, runtime.config);
  const target = resolveTarget(scenario, terrain, state, event);
  const base = {
    eventId: event.id,
    minute: event.minute,
    confidence: event.provenance.confidence,
    scope,
    expectedObserved: event.observed,
    threshold: runtime.config.spotThreshold,
    observerId: observer.signature?.id,
    targetId: target.signature?.id,
    resolutionNote: [observer.note, target.note].filter(Boolean).join('; '),
  };
  if (!observer.signature || !target.signature) {
    return {
      ...base,
      matched: false,
      failingFactor: !observer.signature ? observer.note : target.note,
    };
  }
  const result = evaluateDetectability(
    terrain,
    runtime,
    observer.signature,
    target.signature,
    event.atmosphericFactor ?? 1,
    { quantizeTerrainRay: false },
  );
  const predictedObserved = result.score >= runtime.config.spotThreshold;
  return {
    ...base,
    predictedObserved,
    matched: predictedObserved === event.observed,
    score: result.score,
    margin: event.observed
      ? result.score - runtime.config.spotThreshold
      : runtime.config.spotThreshold - result.score,
    factors: result.factors,
    failingFactor: mismatchFactor(
      event.observed,
      result.score,
      runtime.config.spotThreshold,
      result.factors,
    ),
  };
}

function number(value: number | undefined): string {
  if (value === undefined) return 'n/a';
  if (!Number.isFinite(value)) return String(value);
  return value.toExponential(4);
}

function verdict(row: ObservationExamRow): string {
  return row.matched ? 'PASS' : 'FAIL';
}

function eventTable(rows: readonly ObservationExamRow[]): string {
  const lines = [
    '| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |',
    '|---|---:|---|---|---:|---:|---:|---|',
  ];
  for (const row of rows) {
    lines.push(
      `| ${row.eventId} | ${row.minute} | ${row.expectedObserved ? 'seen' : 'unseen'} | ` +
      `${row.predictedObserved === undefined ? 'unresolved' : row.predictedObserved ? 'seen' : 'unseen'} | ` +
      `${number(row.score)} | ${number(row.threshold)} | ${number(row.margin)} | ${verdict(row)} |`,
    );
  }
  return lines.join('\n');
}

function factorDetails(rows: readonly ObservationExamRow[]): string {
  return rows.map((row) => {
    const factors = row.factors;
    const details = factors === undefined
      ? 'factors unavailable'
      : `distance=${factors.distanceMeters.toFixed(1)}m; angular=${number(factors.angularSize)}; ` +
        `terrain=${factors.terrainVisible ? 'visible' : 'blocked'}; cover=${number(factors.coverTransmittance)}; ` +
        `coverPath=${factors.coverPathMeters.toFixed(1)}m; ` +
        `atmosphere=${number(factors.atmosphericFactor)}; transmittance=${number(factors.transmittance)}; ` +
        `motion=${number(factors.motionFactor)}; perception=${number(factors.perceptionFactor)}`;
    return `- **${row.eventId} (${verdict(row)}):** ${details}. ` +
      `Resolution: ${row.resolutionNote ?? 'n/a'}.` +
      (row.failingFactor ? ` Failing factor: ${row.failingFactor}.` : '');
  }).join('\n');
}

function tuningTable(config: SpottingConfig): string {
  const lines = [
    '| Parameter [CAL] | Before | After | Changed |',
    '|---|---:|---:|---|',
  ];
  for (const key of Object.keys(DEFAULT_SPOTTING_CONFIG) as Array<keyof SpottingConfig>) {
    const before = D52_SPOTTING_CONFIG[key];
    const after = config[key];
    lines.push(`| ${key} | ${before} | ${after} | ${before === after ? 'no' : 'yes'} |`);
  }
  return lines.join('\n');
}

export function formatObservationExam(result: Omit<ObservationExamResult, 'report'>): string {
  const gateable = result.rows.filter((row) => row.scope === 'gateable');
  const excluded = result.rows.filter((row) => row.scope === 'excluded-confidence');
  const mismatches = gateable.filter((row) => !row.matched);
  return [
    '# C4 Observation-Event Exam',
    '',
    `- Gateable result: **${result.reproducedCount}/${result.gateableCount} ` +
      `(${(result.reproductionRate * 100).toFixed(1)}%) — ${result.passed ? 'PASS' : 'FAIL'}**`,
    '- Required: at least 80.0% of HIGH/MEDIUM events, including the two D60-promoted Crow\'s Nest rows.',
    '- Model: production deterministic spotting score; no RNG consumed; event-recorded atmosphericFactor only.',
    '',
    '## Global [CAL] tuning audit',
    '',
    tuningTable(result.config),
    '',
    '## Gateable events',
    '',
    eventTable(gateable),
    '',
    '### Gateable factor audit',
    '',
    factorDetails(gateable),
    '',
    '### Gateable mismatches',
    '',
    mismatches.length === 0
      ? 'None.'
      : mismatches.map((row) => `- ${row.eventId}: ${row.failingFactor ?? 'prediction mismatch'}`).join('\n'),
    '',
    '## Confidence-excluded events',
    '',
    excluded.length === 0 ? 'None.' : eventTable(excluded),
    '',
    excluded.length === 0 ? '' : factorDetails(excluded),
    '',
  ].join('\n');
}

export function runObservationExam(
  scenario: Scenario,
  terrain: EngineTerrain,
  parameterOverrides: Readonly<Record<string, number>> = {},
): ObservationExamResult {
  const config = spottingConfig(parameterOverrides);
  const runtime = createSpottingRuntime(scenario, terrain, parameterOverrides);
  // C4 is a pre-combat observation gate; F3 requires its legacy byte behavior.
  const sim = createSim(scenario, {
    seed: 18760625, terrain, parameterOverrides, combatEnabled: false,
  });
  const rows: ObservationExamRow[] = [];
  const indexed = scenario.observationEvents
    .map((event, index) => ({ event, index }))
    .sort((left, right) => left.event.minute - right.event.minute || left.index - right.index);
  for (const { event } of indexed) {
    sim.run(minuteToTick(event.minute, scenario.clock.tickSeconds));
    rows.push(evaluateEvent(scenario, terrain, sim.state(), event, runtime));
  }
  sim.run(minuteToTick(1080, scenario.clock.tickSeconds));
  rows.sort((left, right) => scenario.observationEvents.findIndex((event) => event.id === left.eventId) -
    scenario.observationEvents.findIndex((event) => event.id === right.eventId));
  const gateable = rows.filter((row) => row.scope === 'gateable');
  const reproducedCount = gateable.filter((row) => row.matched).length;
  const reproductionRate = gateable.length === 0 ? 0 : reproducedCount / gateable.length;
  const withoutReport = {
    rows,
    gateableCount: gateable.length,
    reproducedCount,
    reproductionRate,
    passed: reproductionRate >= 0.8,
    config,
  };
  return { ...withoutReport, report: formatObservationExam(withoutReport) };
}
