export interface BaselineSeedCriteria {
  version: number;
  seedList: number[];
  medianCompositePercentileBand: [number, number];
  rareCategoricalFrequencyMaximum: number;
  numericTypicalBand: 'interquartile';
  numericOutcomes: Array<'arikaraLosses' | 'wingDestructionTick'>;
  categoricalOutcomes: Array<'leaderDeaths' | 'routComposition' | 'fordChokeComposition'>;
  tieBreak: string[];
  historicalEnvelope: Record<string, unknown>;
}

export interface SeedEnvelopeOutcome {
  seed: number;
  composite: number;
  componentScores: Record<'C1' | 'C2' | 'C3' | 'C4', number>;
  leaderDeaths: string[];
  arikaraKilled: number;
  arikaraWounded: number;
  arikaraLosses: number;
  routComposition: string[];
  wingDestructionTick?: number;
  fordChoke: Array<{ unitId: string; killed: number; wounded: number }>;
}

export interface BaselineSelection {
  selected?: SeedEnvelopeOutcome;
  medianComposite: number;
  candidates: number[];
  rejected: Array<{ seed: number; reasons: string[] }>;
}

function quantile(sorted: readonly number[], fraction: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function categoricalTokens(outcome: SeedEnvelopeOutcome, key: BaselineSeedCriteria['categoricalOutcomes'][number]): string[] {
  if (key === 'leaderDeaths') return outcome.leaderDeaths.map((id) => `leader:${id}`);
  if (key === 'routComposition') return outcome.routComposition.map((id) => `rout:${id}`);
  return outcome.fordChoke.filter((item) => item.killed + item.wounded > 0)
    .map((item) => `ford:${item.unitId}`);
}

/** D80 mechanical typical-member selection; no result-specific exceptions. */
export function selectBaselineSeed(
  outcomes: readonly SeedEnvelopeOutcome[],
  criteria: BaselineSeedCriteria,
): BaselineSelection {
  if (outcomes.length === 0) {
    return { selected: undefined, medianComposite: Number.NaN, candidates: [], rejected: [] };
  }
  const composites = outcomes.map((item) => item.composite).sort((a, b) => a - b);
  const medianComposite = quantile(composites, 0.5);
  const [lowPercentile, highPercentile] = criteria.medianCompositePercentileBand;
  const compositeLow = quantile(composites, lowPercentile);
  const compositeHigh = quantile(composites, highPercentile);
  const numericBands = new Map<string, [number, number]>();
  for (const key of criteria.numericOutcomes) {
    const values = outcomes.map((item) => item[key]).filter((value): value is number =>
      typeof value === 'number' && Number.isFinite(value)).sort((a, b) => a - b);
    numericBands.set(key, [quantile(values, 0.25), quantile(values, 0.75)]);
  }
  const tokenCounts = new Map<string, number>();
  for (const outcome of outcomes) {
    const tokens = new Set(criteria.categoricalOutcomes.flatMap((key) => categoricalTokens(outcome, key)));
    for (const token of tokens) tokenCounts.set(token, (tokenCounts.get(token) ?? 0) + 1);
  }
  const rejected: BaselineSelection['rejected'] = [];
  const eligible: SeedEnvelopeOutcome[] = [];
  for (const outcome of outcomes) {
    const reasons: string[] = [];
    if (outcome.composite < compositeLow || outcome.composite > compositeHigh) {
      reasons.push('outside median composite percentile band');
    }
    for (const key of criteria.numericOutcomes) {
      const value = outcome[key];
      const band = numericBands.get(key);
      if (typeof value !== 'number' || !Number.isFinite(value) || !band || value < band[0] || value > band[1]) {
        reasons.push(`${key} outside interquartile band`);
      }
    }
    const rareTokens = criteria.categoricalOutcomes.flatMap((key) => categoricalTokens(outcome, key))
      .filter((token) => (tokenCounts.get(token) ?? 0) / outcomes.length <=
        criteria.rareCategoricalFrequencyMaximum);
    if (rareTokens.length > 0) reasons.push(`rare categorical events: ${rareTokens.sort().join(',')}`);
    if (reasons.length === 0) eligible.push(outcome);
    else rejected.push({ seed: outcome.seed, reasons });
  }
  eligible.sort((left, right) =>
    Math.abs(left.composite - medianComposite) - Math.abs(right.composite - medianComposite) ||
    left.seed - right.seed);
  return {
    selected: eligible[0],
    medianComposite,
    candidates: eligible.map((item) => item.seed),
    rejected,
  };
}

export function percentile(sortedValues: readonly number[], fraction: number): number {
  return quantile([...sortedValues].sort((a, b) => a - b), fraction);
}
