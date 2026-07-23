import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { CalibrationScorecard } from './score.js';
import type { SimEvent } from './events.js';
import type { EngineTerrain } from './pathfind.js';
import type { SimState } from './state.js';
import {
  percentile,
  selectBaselineSeed,
  type BaselineSeedCriteria,
  type BaselineSelection,
  type SeedEnvelopeOutcome,
} from './baseline-selection.js';

const CUSTER_WING_UNIT_IDS = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];

export function extractEmergentOutcomes(
  scenario: Scenario,
  terrain: EngineTerrain,
  state: SimState,
  events: readonly SimEvent[],
  scorecard: CalibrationScorecard,
): SeedEnvelopeOutcome {
  const leaders = [...new Set(events.filter((event) => event.type === 'leader-killed' && event.leaderId)
    .map((event) => event.leaderId as string))].sort();
  const routed = [...new Set(events.filter((event) => event.type === 'morale-state' &&
    event.moraleState === 'ROUTED').map((event) => event.unitId))].sort();
  const destructions = CUSTER_WING_UNIT_IDS.map((unitId) => events.find((event) =>
    event.type === 'unit-destroyed' && event.unitId === unitId)?.tick);
  const wingDestructionTick = destructions.every((tick) => tick !== undefined)
    ? Math.max(...destructions as number[])
    : undefined;
  const arikara = state.units.find((unit) => unit.id === 'arikara-scouts');
  const ford = scenario.terrain.landmarks.find((landmark) => landmark.id === 'ford-a');
  const fordPosition = ford ? terrain.toLocal(ford.position.lat, ford.position.lon) : undefined;
  const fordByUnit = new Map<string, { killed: number; wounded: number }>();
  if (fordPosition) {
    for (const event of events) {
      if (event.type !== 'casualty-resolution' || !event.targetUnitId || !event.position ||
        Math.hypot(event.position.x - fordPosition[0], event.position.y - fordPosition[1]) > 250) continue;
      const current = fordByUnit.get(event.targetUnitId) ?? { killed: 0, wounded: 0 };
      current.killed += event.killed ?? 0;
      current.wounded += event.wounded ?? 0;
      fordByUnit.set(event.targetUnitId, current);
    }
  }
  return {
    seed: Number(scorecard.seed),
    composite: scorecard.composite,
    componentScores: Object.fromEntries(scorecard.components.map((component) =>
      [component.id, component.score])) as SeedEnvelopeOutcome['componentScores'],
    leaderDeaths: leaders,
    arikaraKilled: arikara?.killed ?? 0,
    arikaraWounded: arikara?.wounded ?? 0,
    arikaraLosses: arikara?.casualties ?? 0,
    routComposition: routed,
    wingDestructionTick,
    fordChoke: [...fordByUnit.entries()].map(([unitId, value]) => ({ unitId, ...value }))
      .sort((left, right) => left.unitId.localeCompare(right.unitId)),
  };
}

function distribution(values: readonly number[]): { min: number; p25: number; median: number; p75: number; max: number; mean: number } {
  const sorted = [...values].sort((a, b) => a - b);
  return {
    min: sorted[0] ?? Number.NaN,
    p25: percentile(sorted, 0.25),
    median: percentile(sorted, 0.5),
    p75: percentile(sorted, 0.75),
    max: sorted.at(-1) ?? Number.NaN,
    mean: values.length === 0 ? Number.NaN : values.reduce((sum, value) => sum + value, 0) / values.length,
  };
}

function distributionRow(label: string, values: readonly number[], format = (value: number) => value.toFixed(2)): string {
  const item = distribution(values);
  return `| ${label} | ${format(item.min)} | ${format(item.p25)} | ${format(item.median)} | ` +
    `${format(item.p75)} | ${format(item.max)} | ${format(item.mean)} |`;
}

function frequencyRows(outcomes: readonly SeedEnvelopeOutcome[], values: (item: SeedEnvelopeOutcome) => readonly string[]): string[] {
  const counts = new Map<string, number>();
  for (const outcome of outcomes) {
    for (const value of new Set(values(outcome))) counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()].sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .map(([value, count]) => `| ${value} | ${count} | ${(count / outcomes.length * 100).toFixed(1)}% |`);
}

function list(value: readonly string[]): string {
  return value.length === 0 ? 'none' : value.join(', ');
}

export interface EnvelopeReportInput {
  scenario: Scenario;
  criteria: BaselineSeedCriteria;
  criteriaHash: string;
  outcomes: readonly SeedEnvelopeOutcome[];
}

export interface EnvelopeReportResult {
  report: string;
  selection: BaselineSelection;
}

export function formatSeedEnvelope(input: EnvelopeReportInput): EnvelopeReportResult {
  const { scenario, criteria, criteriaHash, outcomes } = input;
  const selection = selectBaselineSeed(outcomes, criteria);
  const componentRows = (['C1', 'C2', 'C3', 'C4'] as const).map((id) =>
    distributionRow(id, outcomes.map((item) => item.componentScores[id] * 100), (value) => `${value.toFixed(2)}%`));
  const leaderCountRows = [...new Set(outcomes.map((item) => item.leaderDeaths.length))].sort((a, b) => a - b)
    .map((count) => {
      const frequency = outcomes.filter((item) => item.leaderDeaths.length === count).length;
      return `| ${count} | ${frequency} | ${(frequency / outcomes.length * 100).toFixed(1)}% |`;
    });
  const fordTotals = new Map<string, { seeds: number; killed: number; wounded: number }>();
  for (const outcome of outcomes) for (const item of outcome.fordChoke) {
    const current = fordTotals.get(item.unitId) ?? { seeds: 0, killed: 0, wounded: 0 };
    current.seeds += 1;
    current.killed += item.killed;
    current.wounded += item.wounded;
    fordTotals.set(item.unitId, current);
  }
  const historical = criteria.historicalEnvelope as {
    leaderDeaths: { documentedModeledLeaderIds: string[]; source: string };
    arikaraKilled: { low: number; high: number; source: string };
    routComposition: { requiredUnitIds: string[]; source: string };
    wingDestructionMinute: { low: number; high: number; source: string };
    fordChokeComposition: { expectedUnitIds: string[]; radiusMeters: number; source: string };
  };
  const observedLeaders = new Set(outcomes.flatMap((item) => item.leaderDeaths));
  const observedRouted = new Set(outcomes.flatMap((item) => item.routComposition));
  const arikaraKills = outcomes.map((item) => item.arikaraKilled);
  const wingMinutes = outcomes.flatMap((item) => item.wingDestructionTick === undefined
    ? [] : [item.wingDestructionTick * scenario.clock.tickSeconds / 60]);
  const historyChecks = [
    ['Modeled documented leader identities', historical.leaderDeaths.documentedModeledLeaderIds.every((id) => observedLeaders.has(id)),
      `required=${list(historical.leaderDeaths.documentedModeledLeaderIds)}; observed=${list([...observedLeaders].sort())}`],
    ['Arikara killed', Math.min(...arikaraKills) <= historical.arikaraKilled.high &&
      Math.max(...arikaraKills) >= historical.arikaraKilled.low,
      `historical=${historical.arikaraKilled.low}–${historical.arikaraKilled.high}; observed=${Math.min(...arikaraKills)}–${Math.max(...arikaraKills)}`],
    ['Rout composition', historical.routComposition.requiredUnitIds.every((id) => observedRouted.has(id)),
      `required=${list(historical.routComposition.requiredUnitIds)}; observed=${list([...observedRouted].sort())}`],
    ['Wing destruction minute', wingMinutes.length > 0 && Math.min(...wingMinutes) <= historical.wingDestructionMinute.high &&
      Math.max(...wingMinutes) >= historical.wingDestructionMinute.low,
      `historical=${historical.wingDestructionMinute.low}–${historical.wingDestructionMinute.high}; observed=${wingMinutes.length ? `${Math.min(...wingMinutes).toFixed(1)}–${Math.max(...wingMinutes).toFixed(1)}` : 'none'}`],
    ['Ford-choke composition', historical.fordChokeComposition.expectedUnitIds.every((id) => fordTotals.has(id)),
      `expected=${list(historical.fordChokeComposition.expectedUnitIds)}; observed=${list([...fordTotals.keys()].sort())}`],
  ] as const;
  const perSeed = outcomes.map((item) => `| ${item.seed} | ${(item.composite * 100).toFixed(2)}% | ` +
    `${item.leaderDeaths.length}: ${list(item.leaderDeaths)} | ${item.arikaraKilled}/${item.arikaraWounded}/${item.arikaraLosses} | ` +
    `${list(item.routComposition)} | ${item.wingDestructionTick ?? 'not destroyed'} | ` +
    `${item.fordChoke.length === 0 ? 'none' : item.fordChoke.map((value) => `${value.unitId} ${value.killed}K/${value.wounded}W`).join(', ')} |`);
  const report = [
    '# D80 Seed Envelope',
    '',
    `- Scenario: \`${scenario.meta.id}\``,
    `- Seeds: **${outcomes.length}** (criteria-declared N=${criteria.seedList.length})`,
    `- Selected typical baseline seed: **${selection.selected?.seed ?? 'NONE — criteria produced no eligible member'}**`,
    '',
    '## G-M5-2 ordering evidence',
    '',
    '| Order | Event | Evidence |',
    '|---:|---|---|',
    `| 1 | Criteria bytes read and hashed | SHA-256 \`${criteriaHash}\` |`,
    `| 2 | Per-seed report generation began | declared seeds \`${criteria.seedList[0]}..${criteria.seedList.at(-1)}\` |`,
    '',
    'The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.',
    '',
    '## Selection result',
    '',
    `- Median composite: **${(selection.medianComposite * 100).toFixed(2)}%**`,
    `- Eligible no-rare-event candidates: **${selection.candidates.length}** (${selection.candidates.join(', ') || 'none'})`,
    `- Rule: composite percentile ${criteria.medianCompositePercentileBand[0]}–${criteria.medianCompositePercentileBand[1]}; ` +
      `${criteria.numericTypicalBand} numeric outcomes; categorical occurrence frequency must exceed ` +
      `${(criteria.rareCategoricalFrequencyMaximum * 100).toFixed(1)}%.`,
    '',
    '## Composite distribution',
    '',
    '| Metric | Min | P25 | Median | P75 | Max | Mean |',
    '|---|---:|---:|---:|---:|---:|---:|',
    distributionRow('Composite', outcomes.map((item) => item.composite * 100), (value) => `${value.toFixed(2)}%`),
    '',
    '## Component distributions',
    '',
    '| Component | Min | P25 | Median | P75 | Max | Mean |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...componentRows,
    '',
    '## Leader-death distribution',
    '',
    '| Death count | Seeds | Share |',
    '|---:|---:|---:|',
    ...leaderCountRows,
    '',
    '| Leader | Seeds killed | Share |',
    '|---|---:|---:|',
    ...frequencyRows(outcomes, (item) => item.leaderDeaths),
    '',
    '## Arikara loss distribution',
    '',
    '| Metric | Min | P25 | Median | P75 | Max | Mean |',
    '|---|---:|---:|---:|---:|---:|---:|',
    distributionRow('Killed', outcomes.map((item) => item.arikaraKilled)),
    distributionRow('Wounded', outcomes.map((item) => item.arikaraWounded)),
    distributionRow('Total losses', outcomes.map((item) => item.arikaraLosses)),
    '',
    '## Rout-composition frequency',
    '',
    '| Unit | Seeds routed | Share |',
    '|---|---:|---:|',
    ...frequencyRows(outcomes, (item) => item.routComposition),
    '',
    '## Wing-destruction distribution',
    '',
    `- Complete wing destruction: **${wingMinutes.length}/${outcomes.length} seeds**.`,
    '',
    '| Metric | Min | P25 | Median | P75 | Max | Mean |',
    '|---|---:|---:|---:|---:|---:|---:|',
    ...(wingMinutes.length > 0 ? [distributionRow('Simulation minute', wingMinutes)] : []),
    '',
    '## Ford-choke composition (within 250 m of Ford A)',
    '',
    '| Unit | Seeds present | Killed | Wounded |',
    '|---|---:|---:|---:|',
    ...[...fordTotals.entries()].sort((left, right) => left[0].localeCompare(right[0]))
      .map(([unitId, value]) => `| ${unitId} | ${value.seeds} | ${value.killed} | ${value.wounded} |`),
    '',
    '## Historical-envelope checks',
    '',
    '| Outcome | History inside observed envelope? | Comparison |',
    '|---|---|---|',
    ...historyChecks.map(([label, passed, comparison]) => `| ${label} | ${passed ? 'YES' : 'NO'} | ${comparison} |`),
    '',
    'These checks are adjudicated by D80/G-M5-2 during M5-B.',
    '',
    '> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.',
    '> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.',
    '',
    '## Per-seed outcomes',
    '',
    '| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |',
    '|---:|---:|---|---|---|---:|---|',
    ...perSeed,
    '',
  ].join('\n');
  return { report, selection };
}
