// RESIDUAL AUDIT — STEP 2a (re-frozen 93abf80): the COMPONENT-WISE DELTA CENSUS.
// Committed artifacts only, zero probes. For each component: the weighted D111->D112
// mean delta in pp. Consistency checks: the deltas must sum to observed - anchor
// (-4.177045), and C2/C4's deltas must reproduce their PRICED movements before the
// census reveals anything new. The unpriced share per component attributes the
// verified -1.688034 across C1/C3 (the components the expectation treated as
// constants) plus any C2/C4 noise beyond their priced terms.
import { readFileSync } from 'node:fs';

const j = (p) => JSON.parse(readFileSync(p, 'utf8'));
const d111 = j('reports/d111-campaign-results.json');
const d112 = j('reports/d112-campaign-results.json');
const scoring = j('data/scenarios/little-bighorn-1876/scenario.json').calibration.scoring;
const W = { C1: scoring.checkpointWeight, C2: scoring.casualtyWeight, C3: scoring.endStateWeight, C4: scoring.observationWeight };
const wSum = Object.values(W).reduce((a, b) => a + b, 0);

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pp = (x) => (100 * x).toFixed(6);

// Priced terms from step 1 (frozen, verified):
const PRICED = { C1: 0, C2: -(24 / 50 + 3 / 50) * (0.25 / 9), C3: 0, C4: -(12 / 13 - 12 / 14) * 0.15 };

const anchor = mean(d111.rows.map((r) => r.composite));
const observed = mean(d112.rows.map((r) => r.composite));
console.log(`anchor ${pp(anchor)}  observed ${pp(observed)}  total delta ${pp(observed - anchor)} pp`);
console.log(`verified residual (step 1): -1.688034 pp\n`);

let sumWeighted = 0;
let sumUnpriced = 0;
console.log('comp | mean(d111) | mean(d112) | weighted delta pp | priced pp | UNPRICED pp');
for (const k of ['C1', 'C2', 'C3', 'C4']) {
  const m111 = mean(d111.rows.map((r) => r.components[k]));
  const m112 = mean(d112.rows.map((r) => r.components[k]));
  const delta = (m112 - m111) * (W[k] / wSum);
  const unpriced = delta - PRICED[k];
  sumWeighted += delta;
  sumUnpriced += unpriced;
  console.log(`${k}   | ${(100 * m111).toFixed(4)} | ${(100 * m112).toFixed(4)} | ${pp(delta)} | ${pp(PRICED[k])} | ${pp(unpriced)}`);
}
console.log(`\nCONSISTENCY: weighted deltas sum ${pp(sumWeighted)} vs total ${pp(observed - anchor)} (must match)`);
console.log(`ATTRIBUTION: unpriced shares sum ${pp(sumUnpriced)} vs verified residual -1.688034 (must match)`);
