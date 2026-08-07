// RESIDUAL AUDIT — STEP 2b (frozen with the §2b amendment): H-NOISE's two registered
// legs, committed artifacts only, zero probes. Leg 1: the 2a census run on the
// D108→D111 break — a PURE RESEED with zero value payload (nothing to price; every
// component's delta is pure reseed movement). Leg 2: the SE/band arithmetic for both
// breaks, every figure computed from the artifacts at full precision. All numbers
// print before any verdict sentence.
import { readFileSync } from 'node:fs';

const j = (p) => JSON.parse(readFileSync(p, 'utf8'));
const d108 = j('reports/d108-campaign-results.json');
const d111 = j('reports/d111-campaign-results.json');
const d112 = j('reports/d112-campaign-results.json');
const scoring = j('data/scenarios/little-bighorn-1876/scenario.json').calibration.scoring;
const W = { C1: scoring.checkpointWeight, C2: scoring.casualtyWeight, C3: scoring.endStateWeight, C4: scoring.observationWeight };
const wSum = Object.values(W).reduce((a, b) => a + b, 0);

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const sd = (xs) => { const m = mean(xs); return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); };
const pp = (x) => (100 * x).toFixed(6);

// ---- LEG 1: component census, D108 -> D111 (pure reseed; PRICED = 0 everywhere) ----
console.log('=== LEG 1: D108 -> D111 (pure reseed, zero value payload) ===');
console.log(`d108 rows=${d108.rows.length} hash=${[...new Set(d108.rows.map((r) => r.scenarioHash))]}; d111 rows=${d111.rows.length} hash=${[...new Set(d111.rows.map((r) => r.scenarioHash))]}`);
const m108 = mean(d108.rows.map((r) => r.composite));
const m111 = mean(d111.rows.map((r) => r.composite));
console.log(`means: d108 ${pp(m108)}  d111 ${pp(m111)}  difference ${pp(m111 - m108)} pp`);
const legPrice = { C1: null, C2: (W.C2 / wSum) / 9, C3: (W.C3 / wSum) / 13, C4: null };
for (const k of ['C1', 'C2', 'C3', 'C4']) {
  const a = mean(d108.rows.map((r) => r.components[k]));
  const b = mean(d111.rows.map((r) => r.components[k]));
  const delta = (b - a) * (W[k] / wSum);
  let legNote = '';
  if (legPrice[k]) {
    const legs = delta / legPrice[k];
    legNote = `  = ${legs.toFixed(3)} net leg-flips x ${pp(legPrice[k])}/leg (x50 seeds: ${(legs * 50).toFixed(1)} flips)`;
  }
  console.log(`${k}: ${(100 * a).toFixed(4)} -> ${(100 * b).toFixed(4)}  weighted delta ${pp(delta)} pp${legNote}`);
}

// ---- LEG 2: SE/band arithmetic for BOTH breaks ----
console.log('\n=== LEG 2: difference-band arithmetic (all SEs from artifacts) ===');
const se = (rows) => sd(rows.map((r) => r.composite)) / Math.sqrt(rows.length);
const se108 = se(d108.rows), se111 = se(d111.rows), se112 = se(d112.rows);
console.log(`SEs: d108 ${pp(se108)}  d111 ${pp(se111)}  d112 ${pp(se112)} pp`);
const bandD112 = 2 * Math.sqrt(se111 ** 2 + se112 ** 2);
const bandD111 = 2 * Math.sqrt(se108 ** 2 + se111 ** 2);
const resid112 = mean(d112.rows.map((r) => r.composite)) - m111; // total delta, then minus priced:
const priced = -(24 / 50 + 3 / 50) * ((W.C2 / wSum) / 9) - (12 / 13 - 12 / 14) * (W.C4 / wSum);
const unpriced112 = resid112 - priced;
console.log(`D111->D112: unpriced residual ${pp(unpriced112)} pp; correct band ±${pp(bandD112)}; |z| = ${Math.abs(100 * unpriced112 / (100 * bandD112 / 2)).toFixed(2)} SE`);
console.log(`D108->D111 (pure reseed): difference ${pp(m111 - m108)} pp; own band ±${pp(bandD111)}; |z| = ${Math.abs(100 * (m111 - m108) / (100 * bandD111 / 2)).toFixed(2)} SE`);
console.log(`[the D112-row's ruled band ±1.1419 was 2 x SE of ONE mean — the 49th catch]`);
