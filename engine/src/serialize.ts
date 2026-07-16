import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { SimState } from './state.js';

export interface SimKeyframe {
  tick: number;
  state: SimState;
}

export interface SaveFile {
  formatVersion: 1;
  scenarioId: string;
  scenarioHash: string;
  enabledVariantIds: string[];
  parameterOverrides: Record<string, number>;
  seed: string | number;
  targetTick: number;
  keyframes?: SimKeyframe[];
}

function stableValue(value: unknown): string | undefined {
  if (value === null) return 'null';
  if (typeof value === 'string' || typeof value === 'boolean') return JSON.stringify(value);
  if (typeof value === 'number') {
    if (Number.isNaN(value)) return '"NaN"';
    if (value === Number.POSITIVE_INFINITY) return '"Infinity"';
    if (value === Number.NEGATIVE_INFINITY) return '"-Infinity"';
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableValue(item) ?? 'null').join(',')}]`;
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const entries: string[] = [];
    for (const key of Object.keys(record).sort()) {
      const encoded = stableValue(record[key]);
      if (encoded !== undefined) entries.push(`${JSON.stringify(key)}:${encoded}`);
    }
    return `{${entries.join(',')}}`;
  }
  return undefined;
}

export function stableStringify(value: unknown): string {
  return stableValue(value) ?? 'null';
}

export function fnv1a(value: string): string {
  let hash = 0x811c9dc5;
  const bytes = new TextEncoder().encode(value);
  for (const byte of bytes) {
    hash ^= byte;
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

export function hashScenario(scenario: Scenario): string {
  return fnv1a(stableStringify(scenario));
}

export function hashState(state: SimState): string {
  return fnv1a(stableStringify(state));
}

export function cloneState(state: SimState): SimState {
  return JSON.parse(JSON.stringify(state)) as SimState;
}
