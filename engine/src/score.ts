import type { Provenance, Scenario } from '../../src/schema/scenario-schema.js';
import type { ObservationExamRow } from './exam.js';
import type { SimEvent } from './events.js';
import type { EngineTerrain } from './pathfind.js';
import type { SimState } from './state.js';

export interface TrackSample {
  tick: number;
  x: number;
  y: number;
}

export interface CheckpointScore {
  checkpointId: string;
  unitId: string;
  targetMinute: number;
  nearestMinute: number;
  distanceMeters: number;
  timeDeltaMinutes: number;
  toleranceMeters: number;
  toleranceMinutes: number;
  hit: boolean;
}

function checkpointPosition(
  scenario: Scenario,
  checkpointIndex: number,
  terrain: EngineTerrain,
): [number, number] {
  const position = scenario.checkpoints[checkpointIndex].position;
  if (!('ring' in position)) return terrain.toLocal(position.lat, position.lon);
  const projected = position.ring.map((point) => terrain.toLocal(point.lat, point.lon));
  const total = projected.reduce((sum, [x, y]) => ({ x: sum.x + x, y: sum.y + y }), { x: 0, y: 0 });
  return [total.x / projected.length, total.y / projected.length];
}

export function scoreCheckpoints(
  scenario: Scenario,
  terrain: EngineTerrain,
  tracks: readonly (readonly TrackSample[])[],
): CheckpointScore[] {
  return scenario.checkpoints.map((checkpoint, checkpointIndex) => {
    const unitIndex = scenario.units.findIndex((unit) => unit.id === checkpoint.unitId);
    if (unitIndex < 0) throw new Error(`Checkpoint ${checkpoint.id} references missing unit`);
    const samples = tracks[unitIndex];
    if (!samples || samples.length === 0) throw new Error(`No track for unit ${checkpoint.unitId}`);
    const [targetX, targetY] = checkpointPosition(scenario, checkpointIndex, terrain);
    let nearest = samples[0];
    let distanceMeters = Math.hypot(nearest.x - targetX, nearest.y - targetY);
    for (let index = 1; index < samples.length; index += 1) {
      const sample = samples[index];
      const distance = Math.hypot(sample.x - targetX, sample.y - targetY);
      if (distance < distanceMeters) {
        nearest = sample;
        distanceMeters = distance;
      }
    }
    const nearestMinute = nearest.tick * scenario.clock.tickSeconds / 60;
    const timeDeltaMinutes = nearestMinute - checkpoint.minute;
    return {
      checkpointId: checkpoint.id,
      unitId: checkpoint.unitId,
      targetMinute: checkpoint.minute,
      nearestMinute,
      distanceMeters,
      timeDeltaMinutes,
      toleranceMeters: checkpoint.toleranceMeters,
      toleranceMinutes: checkpoint.toleranceMinutes,
      hit: distanceMeters <= checkpoint.toleranceMeters &&
        Math.abs(timeDeltaMinutes) <= checkpoint.toleranceMinutes,
    };
  });
}

export function formatCheckpointTable(scores: readonly CheckpointScore[]): string {
  const lines = [
    '| Checkpoint | Unit | Target min | Nearest min | Distance m | Delta min | Result |',
    '|---|---|---:|---:|---:|---:|---|',
  ];
  for (const score of scores) {
    lines.push(
      `| ${score.checkpointId} | ${score.unitId} | ${score.targetMinute.toFixed(1)} | ` +
      `${score.nearestMinute.toFixed(1)} | ${score.distanceMeters.toFixed(1)} | ` +
      `${score.timeDeltaMinutes.toFixed(1)} | ${score.hit ? 'HIT' : 'MISS'} |`,
    );
  }
  return lines.join('\n');
}

export const END_STATE_HOLDING_RADIUS_METERS = 250;
export const CALIBRATION_EXCLUSION_FLAG = 'counterfactual: excluded from calibration scoring';

export type ScoreScope = 'included' | 'excluded-provenance' | 'excluded-confidence';

export interface CalibrationItemScore {
  id: string;
  label: string;
  confidence: string;
  scope: ScoreScope;
  passed: boolean;
  expected: string;
  actual: string;
}

export interface ComponentScore {
  id: 'C1' | 'C2' | 'C3' | 'C4';
  label: string;
  weight: number;
  score: number;
  passed: boolean;
  gate: string;
  items: CalibrationItemScore[];
}

export interface CalibrationScorecard {
  scenarioId: string;
  seed: string | number;
  variantIds: string[];
  reviewTier: 'baseline' | 'deep' | 'sanity';
  counterfactual: boolean;
  components: [ComponentScore, ComponentScore, ComponentScore, ComponentScore];
  composite: number;
  passed: boolean;
  report: string;
}

export interface ScoreRunInput {
  scenario: Scenario;
  terrain: EngineTerrain;
  state: SimState;
  tracks: readonly (readonly TrackSample[])[];
  events: readonly SimEvent[];
  observationRows: readonly ObservationExamRow[];
  seed: string | number;
  variantIds?: readonly string[];
}

function exclusionReason(provenance: Provenance): string | undefined {
  return provenance.note?.toLowerCase().includes(CALIBRATION_EXCLUSION_FLAG)
    ? CALIBRATION_EXCLUSION_FLAG
    : undefined;
}

export function isCalibrationExcluded(provenance: Provenance): boolean {
  return exclusionReason(provenance) !== undefined;
}

function rate(passed: number, total: number): number {
  return total === 0 ? 1 : passed / total;
}

function included(items: readonly CalibrationItemScore[]): CalibrationItemScore[] {
  return items.filter((item) => item.scope === 'included');
}

function componentRate(items: readonly CalibrationItemScore[]): number {
  const scored = included(items);
  return rate(scored.filter((item) => item.passed).length, scored.length);
}

export function scoreCheckpointComponent(
  scenario: Scenario,
  scores: readonly CheckpointScore[],
  excludedUnitIds: ReadonlySet<string> = new Set(),
): ComponentScore {
  const byId = new Map(scores.map((score) => [score.checkpointId, score]));
  const items = scenario.checkpoints.map((checkpoint): CalibrationItemScore => {
    const score = byId.get(checkpoint.id);
    if (!score) throw new Error(`Missing checkpoint result ${checkpoint.id}`);
    return {
      id: checkpoint.id,
      label: `${checkpoint.unitId} at minute ${checkpoint.minute}`,
      confidence: checkpoint.provenance.confidence,
      scope: isCalibrationExcluded(checkpoint.provenance) || excludedUnitIds.has(checkpoint.unitId)
        ? 'excluded-provenance' : 'included',
      passed: score.hit,
      expected: `≤${checkpoint.toleranceMeters} m and ±${checkpoint.toleranceMinutes} min`,
      actual: `${score.distanceMeters.toFixed(1)} m, ${score.timeDeltaMinutes.toFixed(1)} min`,
    };
  });
  const scored = included(items);
  const high = scored.filter((item) => item.confidence === 'HIGH');
  const highRate = rate(high.filter((item) => item.passed).length, high.length);
  const overallRate = rate(scored.filter((item) => item.passed).length, scored.length);
  return {
    id: 'C1', label: 'Checkpoints', weight: scenario.calibration.scoring.checkpointWeight,
    score: overallRate,
    passed: highRate >= 0.7 && overallRate >= 0.5,
    gate: `HIGH ${(highRate * 100).toFixed(1)}% ≥ 70%; overall ${(overallRate * 100).toFixed(1)}% ≥ 50%`,
    items,
  };
}

interface CasualtyBand { low: number; high: number; confidence: string; excluded: boolean }

function sideBand(
  scenario: Scenario,
  sideId: string,
  column: 'killed' | 'wounded',
  excludedUnitIds: ReadonlySet<string>,
): CasualtyBand | undefined {
  const sideTarget = scenario.calibration.sideCasualties?.[sideId]?.[column];
  if (sideTarget) {
    return {
      low: sideTarget.low,
      high: sideTarget.high,
      confidence: sideTarget.provenance.confidence,
      excluded: isCalibrationExcluded(sideTarget.provenance),
    };
  }
  const targets = Object.entries(scenario.calibration.casualties)
    .filter(([unitId]) => !excludedUnitIds.has(unitId) &&
      scenario.units.find((unit) => unit.id === unitId)?.sideId === sideId)
    .map(([, target]) => target[column]);
  if (targets.length === 0) return undefined;
  const active = targets.filter((target) => !isCalibrationExcluded(target.provenance));
  return {
    low: active.reduce((sum, target) => sum + target.low, 0),
    high: active.reduce((sum, target) => sum + target.high, 0),
    confidence: targets.every((target) => target.provenance.confidence === 'HIGH') ? 'HIGH' : 'MIXED',
    excluded: active.length === 0,
  };
}

export function scoreCasualtyComponent(
  scenario: Scenario,
  state: SimState,
  excludedUnitIds: ReadonlySet<string> = new Set(),
): ComponentScore {
  const items: CalibrationItemScore[] = [];
  for (const side of scenario.sides) {
    const units = state.units.filter((unit) => !excludedUnitIds.has(unit.id) &&
      scenario.units[unit.unitIndex].sideId === side.id);
    for (const column of ['killed', 'wounded'] as const) {
      const band = sideBand(scenario, side.id, column, excludedUnitIds);
      if (!band) continue;
      const actual = units.reduce((sum, unit) => sum + unit[column], 0);
      items.push({
        id: `${side.id}:${column}`,
        label: `${side.name} ${column}`,
        confidence: band.confidence,
        scope: band.excluded ? 'excluded-provenance' : 'included',
        passed: actual >= band.low && actual <= band.high,
        expected: `${band.low.toFixed(1)}–${band.high.toFixed(1)}`,
        actual: String(actual),
      });
    }
  }
  // C2's flagship clause is exact terminal state, separately from C3's deadline.
  for (const assertion of scenario.calibration.endState.filter((item) => item.condition === 'DESTROYED')) {
    const unit = state.units.find((item) => item.id === assertion.unitId);
    items.push({
      id: `flagship:${assertion.unitId}`,
      label: `${assertion.unitId} flagship end-state`,
      confidence: assertion.provenance.confidence,
      scope: isCalibrationExcluded(assertion.provenance) || excludedUnitIds.has(assertion.unitId)
        ? 'excluded-provenance' : 'included',
      passed: unit?.endState === 'DESTROYED',
      expected: 'DESTROYED exactly',
      actual: unit?.endState ?? unit?.moraleState ?? 'missing',
    });
  }
  return {
    id: 'C2', label: 'Casualties', weight: scenario.calibration.scoring.casualtyWeight,
    score: componentRate(items),
    passed: included(items).every((item) => item.passed),
    gate: 'both killed/wounded side bands and every flagship end-state exact',
    items,
  };
}

function sampleAtTick(samples: readonly TrackSample[], tick: number): TrackSample | undefined {
  let result: TrackSample | undefined;
  for (const sample of samples) {
    if (sample.tick > tick) break;
    result = sample;
  }
  return result;
}

function endStateActual(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  tracks: readonly (readonly TrackSample[])[],
  events: readonly SimEvent[],
  assertion: Scenario['calibration']['endState'][number],
): { passed: boolean; actual: string } {
  const byTick = assertion.byMinute * 60 / scenario.clock.tickSeconds;
  const unit = state.units.find((item) => item.id === assertion.unitId);
  if (!unit) return { passed: false, actual: 'missing unit' };
  if (assertion.condition === 'DESTROYED') {
    const event = events.find((item) => item.type === 'unit-destroyed' &&
      item.unitId === assertion.unitId && item.tick <= byTick);
    return event
      ? { passed: true, actual: `DESTROYED at minute ${(event.tick * scenario.clock.tickSeconds / 60).toFixed(1)}` }
      : { passed: false, actual: 'not destroyed by deadline' };
  }
  if (assertion.condition === 'ROUTED') {
    const event = events.find((item) => item.type === 'morale-state' && item.unitId === assertion.unitId &&
      item.moraleState === 'ROUTED' && item.tick <= byTick);
    return event
      ? { passed: true, actual: `ROUTED at minute ${(event.tick * scenario.clock.tickSeconds / 60).toFixed(1)}` }
      : { passed: false, actual: 'not routed by deadline' };
  }
  if (assertion.condition === 'WITHDRAWN') {
    const event = events.find((item) => item.type === 'scout-withdrew-off-field' &&
      item.unitId === assertion.unitId && item.tick <= byTick);
    return event
      ? { passed: true, actual: `WITHDRAWN at minute ${(event.tick * scenario.clock.tickSeconds / 60).toFixed(1)}` }
      : { passed: false, actual: 'not withdrawn by deadline' };
  }
  if (!assertion.landmarkId) return { passed: false, actual: 'HOLDING_AT missing landmark' };
  const landmark = scenario.terrain.landmarks.find((item) => item.id === assertion.landmarkId);
  const unitIndex = scenario.units.findIndex((item) => item.id === assertion.unitId);
  const sample = sampleAtTick(tracks[unitIndex] ?? [], byTick);
  if (!landmark || !sample) return { passed: false, actual: 'missing landmark or track' };
  const [x, y] = terrain.toLocal(landmark.position.lat, landmark.position.lon);
  const distance = Math.hypot(sample.x - x, sample.y - y);
  const destroyed = events.some((item) => item.type === 'unit-destroyed' &&
    item.unitId === assertion.unitId && item.tick <= byTick);
  return {
    passed: !destroyed && distance <= END_STATE_HOLDING_RADIUS_METERS,
    actual: `${distance.toFixed(1)} m from ${assertion.landmarkId}${destroyed ? '; destroyed' : ''}`,
  };
}

export function scoreEndStateComponent(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  tracks: readonly (readonly TrackSample[])[],
  events: readonly SimEvent[],
  excludedUnitIds: ReadonlySet<string> = new Set(),
): ComponentScore {
  const items = scenario.calibration.endState.map((assertion): CalibrationItemScore => {
    const result = endStateActual(scenario, terrain, state, tracks, events, assertion);
    const confidenceIncluded = assertion.provenance.confidence === 'HIGH';
    return {
      id: `${assertion.unitId}:${assertion.condition}:${assertion.byMinute}`,
      label: assertion.description,
      confidence: assertion.provenance.confidence,
      scope: isCalibrationExcluded(assertion.provenance) || excludedUnitIds.has(assertion.unitId)
        ? 'excluded-provenance'
        : confidenceIncluded ? 'included' : 'excluded-confidence',
      passed: result.passed,
      expected: `${assertion.condition} by minute ${assertion.byMinute}`,
      actual: result.actual,
    };
  });
  return {
    id: 'C3', label: 'End states', weight: scenario.calibration.scoring.endStateWeight,
    score: componentRate(items),
    passed: included(items).every((item) => item.passed),
    gate: '100% of HIGH-confidence assertions by their minute',
    items,
  };
}

export function scoreObservationComponent(
  scenario: Scenario,
  rows: readonly ObservationExamRow[],
  excludedUnitIds: ReadonlySet<string> = new Set(),
): ComponentScore {
  const byId = new Map(scenario.observationEvents.map((event) => [event.id, event]));
  const items = rows.map((row): CalibrationItemScore => {
    const event = byId.get(row.eventId);
    if (!event) throw new Error(`Observation result references missing event ${row.eventId}`);
    const observerLeader = event.observerLeaderId
      ? scenario.leaders.find((leader) => leader.id === event.observerLeaderId)
      : undefined;
    const provenanceExcluded = isCalibrationExcluded(event.provenance) ||
      excludedUnitIds.has(event.observerUnitId ?? observerLeader?.attachedToUnitId ?? '') ||
      excludedUnitIds.has(event.target.unitId ?? '');
    return {
      id: row.eventId,
      label: event.target.description,
      confidence: event.provenance.confidence,
      scope: provenanceExcluded
        ? 'excluded-provenance'
        : row.scope === 'gateable' ? 'included' : 'excluded-confidence',
      passed: row.matched,
      expected: row.expectedObserved ? 'seen' : 'unseen',
      actual: row.predictedObserved === undefined ? 'unresolved' : row.predictedObserved ? 'seen' : 'unseen',
    };
  });
  const score = componentRate(items);
  return {
    id: 'C4', label: 'Observations', weight: scenario.calibration.scoring.observationWeight,
    score, passed: score >= 0.8,
    gate: `${(score * 100).toFixed(1)}% ≥ 80% of HIGH/MEDIUM events`,
    items,
  };
}

export function weightedComposite(components: readonly ComponentScore[]): number {
  const weight = components.reduce((sum, component) => sum + component.weight, 0);
  return weight === 0 ? 0 : components.reduce((sum, component) =>
    sum + component.score * component.weight, 0) / weight;
}

const FLAGSHIP_VARIANT_IDS = new Set(['v-mtc-crossing', 'v-organized-last-stand']);

export function variantReviewMetadata(
  scenario: Scenario,
  variantIds: readonly string[],
): { reviewTier: 'baseline' | 'deep' | 'sanity'; counterfactual: boolean } {
  if (variantIds.length === 0) return { reviewTier: 'baseline', counterfactual: false };
  const variants = variantIds.map((id) => {
    const variant = scenario.variants.find((item) => item.id === id);
    if (!variant) throw new Error(`Unknown scored variant ${id}`);
    return variant;
  });
  // Counterfactual status is provenance-driven, never an id list.
  const counterfactual = variants.some((variant) => isCalibrationExcluded(variant.provenance));
  const deep = counterfactual || variantIds.some((id) => FLAGSHIP_VARIANT_IDS.has(id));
  return { reviewTier: deep ? 'deep' : 'sanity', counterfactual };
}

/**
 * A counterfactual flag excludes only score items mechanically connected to
 * units touched by that patch. The flag, not a counterfactual id list, drives
 * this behavior; unrelated historical targets remain scoreable.
 */
export function counterfactualExcludedUnitIds(
  scenario: Scenario,
  variantIds: readonly string[],
): Set<string> {
  const result = new Set<string>();
  for (const id of variantIds) {
    const variant = scenario.variants.find((item) => item.id === id);
    if (!variant || !isCalibrationExcluded(variant.provenance)) continue;
    for (const order of variant.patch.addOrders ?? []) {
      for (const unitId of order.recipientUnitIds) result.add(unitId);
    }
    for (const change of variant.patch.modifyOrders ?? []) {
      const order = scenario.orders.find((item) => item.id === change.id);
      for (const unitId of change.changes.recipientUnitIds ?? order?.recipientUnitIds ?? []) result.add(unitId);
    }
    for (const change of variant.patch.modifyUnits ?? []) result.add(change.id);
    for (const change of variant.patch.modifyLeaders ?? []) {
      const leader = scenario.leaders.find((item) => item.id === change.id);
      const unitId = change.changes.attachedToUnitId ?? leader?.attachedToUnitId;
      if (unitId) result.add(unitId);
    }
    for (const change of variant.patch.modifyEndStates ?? []) result.add(change.unitId);
  }
  return result;
}

function escapeCell(value: string): string {
  return value.replaceAll('|', '\\|').replaceAll('\n', ' ');
}

function itemTable(items: readonly CalibrationItemScore[]): string {
  const lines = [
    '| Item | Confidence | Scope | Expected | Actual | Result |',
    '|---|---|---|---|---|---|',
  ];
  for (const item of items) lines.push(
    `| ${escapeCell(item.id)} | ${item.confidence} | ${item.scope} | ${escapeCell(item.expected)} | ` +
    `${escapeCell(item.actual)} | ${item.passed ? 'PASS' : 'FAIL'} |`,
  );
  return lines.join('\n');
}

export function formatCalibrationScorecard(
  scorecard: Omit<CalibrationScorecard, 'report'>,
): string {
  const summary = [
    '| Component | Weight | Included score | Gate |',
    '|---|---:|---:|---|',
    ...scorecard.components.map((component) =>
      `| ${component.id} ${component.label} | ${component.weight.toFixed(2)} | ` +
      `${(component.score * 100).toFixed(2)}% | ${component.passed ? 'PASS' : 'FAIL'} — ${component.gate} |`),
  ].join('\n');
  return [
    '# Calibration Scorecard',
    '',
    `- Scenario: \`${scorecard.scenarioId}\``,
    `- Seed: \`${String(scorecard.seed)}\``,
    `- Variants: ${scorecard.variantIds.length === 0 ? '`baseline`' : scorecard.variantIds.map((id) => `\`${id}\``).join(', ')}`,
    `- Review tier: **${scorecard.reviewTier}**`,
    `- Counterfactual provenance flag: **${scorecard.counterfactual ? 'yes' : 'no'}**`,
    `- Composite: **${(scorecard.composite * 100).toFixed(2)}%**`,
    `- Composite gates: **${scorecard.passed ? 'PASS' : 'FAIL'}**`,
    '',
    summary,
    '',
    '> Composite gate status is the conjunction of C1–C4; no minimum weighted-number gate is invented.',
    '> TODO-AMBIGUOUS(M5-A): `HOLDING_AT` has no schema tolerance. One global proposed [CAL] radius of 250 m is used.',
    '',
    ...scorecard.components.flatMap((component) => [
      `## ${component.id} — ${component.label}`,
      '',
      `Gate: **${component.passed ? 'PASS' : 'FAIL'}** — ${component.gate}.`,
      '',
      itemTable(component.items),
      '',
    ]),
  ].join('\n');
}

export function scoreCalibrationRun(input: ScoreRunInput): CalibrationScorecard {
  const variantIds = [...(input.variantIds ?? [])];
  const excludedUnitIds = counterfactualExcludedUnitIds(input.scenario, variantIds);
  const components: CalibrationScorecard['components'] = [
    scoreCheckpointComponent(input.scenario,
      scoreCheckpoints(input.scenario, input.terrain, input.tracks), excludedUnitIds),
    scoreCasualtyComponent(input.scenario, input.state, excludedUnitIds),
    scoreEndStateComponent(input.scenario, input.terrain, input.state, input.tracks, input.events,
      excludedUnitIds),
    scoreObservationComponent(input.scenario, input.observationRows, excludedUnitIds),
  ];
  const metadata = variantReviewMetadata(input.scenario, variantIds);
  const withoutReport = {
    scenarioId: input.scenario.meta.id,
    seed: input.seed,
    variantIds,
    ...metadata,
    components,
    composite: weightedComposite(components),
    passed: components.every((component) => component.passed),
  };
  return { ...withoutReport, report: formatCalibrationScorecard(withoutReport) };
}
