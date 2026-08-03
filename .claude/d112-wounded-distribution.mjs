// PR-66(c) pre-freeze measurement (2026-08-02): the full coalition-wounded
// distribution across the committed D111 stream (8e28552c), all 50 registered
// seeds, full days. Refines the two-seed anchor (121/122). The measured flip
// fraction is an ESTIMATE of a quantity break 2 itself re-rolls - registered
// as such in PR-66(c), source stream named. Cross-checks per-seed coalition
// killed against reports/d111-campaign-results.json. Read-only.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(
  join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(
  join(REPO, 'reports/d111-campaign-results.json'), 'utf8'));
const SIDE = 'lakota-cheyenne-coalition';
const srcById = new Map(scenario.units.map((u) => [u.id, u]));

const lines = [];
const log = (line) => { lines.push(line); console.log(line); };
const wounded = [];
let mismatches = 0;
for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  for (let t = 0; t <= 2160; t += 1) sim.run(t);
  const st = sim.state();
  let k = 0, w = 0;
  for (const u of st.units) {
    const src = srcById.get(u.id);
    if (src?.sideId !== SIDE || src?.kind === 'NONCOMBATANT_CAMP') continue;
    k += u.killed ?? 0; w += u.wounded ?? 0;
  }
  const row = results.rows.find((r) => r.seed === seed);
  const match = row && row.coalitionKilled === k;
  if (!match) mismatches += 1;
  wounded.push(w);
  log(`seed ${seed}: wounded ${w}, killed ${k} (campaign ${row?.coalitionKilled ?? '?'} ${match ? 'MATCH' : 'MISMATCH'})`);
}
const sorted = [...wounded].sort((a, b) => a - b);
const exactly160 = wounded.filter((w) => w === 160).length;
const inOldBand = wounded.filter((w) => w >= 100 && w <= 200).length;
log(`\n=== Distribution (n=50, stream 8e28552c) ===`);
log(`min ${sorted[0]} | p25 ${sorted[12]} | median ${sorted[25]} | p75 ${sorted[37]} | max ${sorted[49]}`);
log(`exactly 160 (would PASS the degenerate band): ${exactly160}/50`);
log(`inside old 100-200 band (currently passing): ${inOldBand}/50`);
log(`FLIP FRACTION (pass old, fail new): ${(inOldBand - exactly160)}/50`);
log(`killed cross-check mismatches: ${mismatches}`);
await writeFile(join(REPO, '.claude', 'd112-wounded-distribution.out.txt'),
  lines.join('\n') + '\n', 'utf8');
console.error('done');
