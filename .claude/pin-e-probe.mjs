// PIN (e) pre-freeze probe — READ-ONLY. Enumerates every confidence:'DISPUTED' block in
// the committed scenario (ANY key — the broad predicate; D125's scenario-wide check
// counted the thirteen 'provenance'-keyed blocks, and leaders[7].ratingsProvenance is
// the fourteenth, differently-keyed), classifies each path against the GATED-surface
// prefixes (the four confidence-gate call-site families: score.ts checkpoints /
// sideCasualties bands / calibration assertions+timing; exam.ts observation events),
// and prints the gated subset — the set pin (e) will assert equals the ruled set of one.
import { readFileSync } from 'node:fs';

const s = JSON.parse(readFileSync('data/scenarios/little-bighorn-1876/scenario.json', 'utf8'));
const hits = [];
function visit(cur, path) {
  if (Array.isArray(cur)) { cur.forEach((v, i) => visit(v, `${path}[${i}]`)); return; }
  if (!cur || typeof cur !== 'object') return;
  if (cur.confidence === 'DISPUTED') hits.push(path);
  for (const [k, v] of Object.entries(cur)) visit(v, path ? `${path}.${k}` : k);
}
visit(s, '');

// Gated = provenance reaches a confidence gate in the COMMITTED baseline world.
// Variant interiors are unscored until applied (D125: #137/#138 'unscored variant
// surfaces'); orders and leader ratings feed behavior, not scoring gates.
const GATED_PREFIXES = [
  /^checkpoints\[/,
  /^observationEvents\[/,
  /^calibration\.sideCasualties\./,
  /^calibration\.endState\[/,
  /^calibration\.timing/,
];
const gated = hits.filter((p) => GATED_PREFIXES.some((re) => re.test(p))).sort();
const ungated = hits.filter((p) => !GATED_PREFIXES.some((re) => re.test(p))).sort();

console.log(`DISPUTED blocks total: ${hits.length}`);
console.log(`GATED subset (${gated.length}):`);
gated.forEach((p) => console.log(`  ${p}`));
console.log(`ungated (${ungated.length}):`);
ungated.forEach((p) => console.log(`  ${p}`));
const RULED = ['calibration.sideCasualties.lakota-cheyenne-coalition.killed.provenance'];
console.log(`pin (e) predicate today: ${JSON.stringify(gated) === JSON.stringify(RULED) ? 'GREEN — gated set equals the ruled set of one' : 'RED — gated set differs from the ruled set'}`);
