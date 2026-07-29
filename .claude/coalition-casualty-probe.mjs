// Eighteenth measurement: total coalition casualties under both ownership
// dispositions, ordered trio included - the half PR-6 actually grades. O5's
// rebuilt coalition killed band: low 36 / best ~60 / high 136 (300
// discredited); wounded reference Red Horse 160. The seventeenth measured
// only the idle pools (0/0/0 casualties under one-authority); if the TOTAL
// collapses alongside them, the ruling trades an over-lethal grind for an
// under-lethal fight and that gets named before dispatch, not after.
// Modes: BASE (gate inert - candidate as committed), A (D96-wins), B
// (pursuit-informs-commitment). Same dist gate as the seventeenth, restored
// byte-identical afterward. Stop seed only; read-only w.r.t. the repo.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const mode = process.argv[2] ?? 'BASE';
if (mode === 'A' || mode === 'B') globalThis.__d17mode = mode;
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const RENO = ['co-a', 'co-g', 'co-m'];

const sim = createSim(scenario, { seed: 18760625, terrain });
sim.run(2160);
const st = sim.state();
const rows = [];
let killed = 0, wounded = 0, casualties = 0;
for (const u of st.units) {
  const src = scenario.units[u.unitIndex];
  if (src.sideId !== SIDE || src.kind === 'NONCOMBATANT_CAMP') continue;
  killed += u.killed; wounded += u.wounded; casualties += u.casualties;
  if (u.casualties > 0 || u.killed > 0) rows.push(`  ${u.id}: killed ${u.killed} wounded ${u.wounded} casualties ${u.casualties}${u.endState ? ' ' + u.endState : ''}`);
}
const renoKilled = RENO.reduce((s, id) => s + st.units.find((u) => u.id === id).killed, 0);
console.log(`===== mode ${mode} — seed 18760625 =====`);
console.log(`coalition TOTAL: killed ${killed} | wounded ${wounded} | casualties ${casualties}  (O5 killed band 36 / ~60 / 136; Red Horse wounded 160)`);
console.log(`coalition units with losses:`);
for (const r of rows) console.log(r);
if (!rows.length) console.log('  (none)');
console.log(`context: Reno A/G/M killed total ${renoKilled}`);
console.error('done ' + mode);
