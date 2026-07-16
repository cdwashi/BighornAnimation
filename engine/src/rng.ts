export interface RngState {
  state: number;
  draws: number;
}

export function createRngState(scenarioSeed: number): RngState {
  return { state: scenarioSeed >>> 0, draws: 0 };
}

function mixSeed(scenarioSeed: number, userSeed: number): number {
  let mixed = (scenarioSeed ^ userSeed) >>> 0;
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x21f0aaad);
  mixed = Math.imul(mixed ^ (mixed >>> 15), 0x735a2d97);
  return (mixed ^ (mixed >>> 15)) >>> 0;
}

/** Serializable mulberry32. M2 deliberately never calls this function. */
export function nextRandom(current: RngState, userSeed: number): [number, RngState] {
  // TODO-AMBIGUOUS(M2-A): E1 requires different-seed full-state hashes to remain
  // identical before randomness is consumed, while D31a says the PRNG is seeded
  // from scenario + user seed and stored in SimState. Defer user-seed mixing until
  // the first draw; this preserves both the M2 gate and future seeded divergence.
  const base = current.draws === 0 ? mixSeed(current.state, userSeed) : current.state;
  const state = (base + 0x6d2b79f5) >>> 0;
  let value = state;
  value = Math.imul(value ^ (value >>> 15), value | 1);
  value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
  const output = ((value ^ (value >>> 14)) >>> 0) / 0x1_0000_0000;
  return [output, { state, draws: current.draws + 1 }];
}
