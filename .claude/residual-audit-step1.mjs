// RESIDUAL AUDIT — STEP 1 (frozen 2caa699): term-by-term re-derivation of the D112
// decomposition from COMMITTED ARTIFACTS, zero probes, both chains printed at full
// precision. Terms: anchor 56.7179 (D111 mean), flips 1.3333 (24/50 × per-flip), C4
// identity 0.989, killed three-flip 0.1667, observed 52.5409; the per-flip weight
// 2.7778 derived from the committed scoring weights, never assumed.
import { readFileSync } from 'node:fs';

const j = (p) => JSON.parse(readFileSync(p, 'utf8'));
const d111 = j('reports/d111-campaign-results.json');
const d112 = j('reports/d112-campaign-results.json');
const scoring = j('data/scenarios/little-bighorn-1876/scenario.json').calibration.scoring;

const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const pp = (x) => (100 * x).toFixed(6);

// ---- Weights (committed scenario bytes) ----
const wSum = scoring.checkpointWeight + scoring.casualtyWeight + scoring.endStateWeight + scoring.observationWeight;
console.log(`weights: C1=${scoring.checkpointWeight} C2=${scoring.casualtyWeight} C3=${scoring.endStateWeight} C4=${scoring.observationWeight} (sum ${wSum})`);

// ---- TERM: anchor (D111-stream mean) ----
const a111 = d111.rows.map((r) => r.composite);
console.log(`\nANCHOR: d111 rows=${a111.length}, complete=${d111.rows.every((r) => r.complete)}, hash=${[...new Set(d111.rows.map((r) => r.scenarioHash))]}`);
const anchor = mean(a111);
console.log(`  anchor mean = ${pp(anchor)} pp   [row printed 56.7179]`);

// ---- TERM: observed (D112-stream mean) ----
const a112 = d112.rows.map((r) => r.composite);
console.log(`OBSERVED: d112 rows=${a112.length}, complete=${d112.rows.every((r) => r.complete)}, hash=${[...new Set(d112.rows.map((r) => r.scenarioHash))]}`);
const observed = mean(a112);
console.log(`  observed mean = ${pp(observed)} pp   [row printed 52.5409]`);

// ---- TERM: per-flip weight (casualty share over the leg count, leg count VERIFIED) ----
const c2Ninths = d112.rows.every((r) => Math.abs(r.components.C2 * 9 - Math.round(r.components.C2 * 9)) < 1e-9);
console.log(`\nPER-FLIP: every d112 C2 value sits on the /9 lattice: ${c2Ninths}`);
const perFlip = (scoring.casualtyWeight / wSum) / 9;
console.log(`  per-leg price = (${scoring.casualtyWeight}/${wSum})/9 = ${pp(perFlip)} pp   [row used 2.7778]`);

// ---- TERM: flips (wounded-leg flips, per-seed field in the committed artifact) ----
const flips = d112.rows.filter((r) => r.woundedFlip === true).length;
const flipsTerm = (flips / 50) * perFlip;
console.log(`FLIPS: woundedFlip=true in ${flips}/50 rows   [row printed 24/50 observed]`);
console.log(`  flips term = ${flips}/50 x per-leg = ${pp(flipsTerm)} pp   [row used 1.3333]`);

// ---- TERM: killed three-flip. The band's committed identity settles the field and
// window: D112 raised the COALITION killed low 31 -> 36 (scenario sideCasualties note:
// "the encoded 31 was a modern name-reconciliation and never the lowest cited figure"),
// so the flip window is coalitionKilled in [31,35]; the row's "33-35" was the observed
// draws. DISCLOSED NEAR-MISS: this audit's first pass tried renoKilled in [33,35] and
// found 5 seeds - the wrong side's field, killed by the band's provenance, recorded so
// the false candidate is on the page rather than silently corrected.
const nearMiss = d112.rows.filter((r) => r.renoKilled >= 33 && r.renoKilled <= 35);
console.log(`KILLED near-miss (renoKilled [33,35], WRONG FIELD): ${nearMiss.length} seeds — refuted by the band identity`);
const inWindow = d112.rows.filter((r) => r.coalitionKilled >= 31 && r.coalitionKilled <= 35);
console.log(`KILLED window (coalitionKilled [31,35], the raised low 31->36): ${inWindow.length} seeds (${inWindow.map((r) => `${r.seed % 1000}:${r.coalitionKilled}`).join(', ')})`);
const killed3Term = (inWindow.length / 50) * perFlip;
console.log(`  killed term = ${inWindow.length}/50 x per-leg = ${pp(killed3Term)} pp   [row used 0.1667]`);

// ---- TERM: the C4 identity (both denominators live in the artifact, per seed) ----
const pure = (12 / 13 - 12 / 14) * (scoring.observationWeight / wSum);
const perSeed = d112.rows.map((r) => (r.c4Lineage.score - r.c4Current.score) * (scoring.observationWeight / wSum));
const c4Term = mean(perSeed);
const passedCounts = [...new Set(d112.rows.map((r) => `${r.c4Current.passed}/${r.c4Current.total}|${r.c4Lineage.passed}/${r.c4Lineage.total}`))];
console.log(`C4 IDENTITY: pure lattice (12/13-12/14)x${scoring.observationWeight} = ${pp(pure)} pp   [row used 0.989]`);
console.log(`  per-seed realized mean = ${pp(c4Term)} pp; passed/total variants in artifact: ${passedCounts.join(' ')}`);

// ---- THE TWO CHAINS ----
console.log('\n=== THE ROW\'S CHAIN (as printed at D112) ===');
console.log('  56.7179 - 1.3333 - 0.989 - 0.1667 = 54.2256 (printed; components give 54.2289 - the 48th catch)');
console.log('  52.5409 - 54.2289 = -1.6880 (carried as -1.6879)');
console.log('\n=== THE AUDITED CHAIN (full precision, committed artifacts only) ===');
const expected = anchor - flipsTerm - c4Term - killed3Term;
console.log(`  expected = ${pp(anchor)} - ${pp(flipsTerm)} - ${pp(c4Term)} - ${pp(killed3Term)} = ${pp(expected)} pp`);
console.log(`  observed = ${pp(observed)} pp`);
console.log(`  AUDITED RESIDUAL = ${pp(observed - expected)} pp   [carried: -1.6879]`);
