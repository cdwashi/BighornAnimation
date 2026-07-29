// Sixteenth measurement: why do WEST-bank passing shouldClose inputs never
// produce an observable CHARGE? Hypotheses: (a) subsystem ordering -
// updateCampDefense runs before updateMorale in the tick (index.ts), so a
// D96 CHARGE can be overwritten to ATTACK by D72 beginPursuit the same tick;
// (b) commitment thrash skips the closing branch. Instrumented via
// dist-only diagnostic log at both posture write-sites (camp-defense
// startClosing CHARGE; morale beginPursuit ATTACK), restored by rebuild
// afterward. Stop seed only; read-only w.r.t. the repository.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__d96log = [];
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const POOLS = new Set(['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool']);
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760625, terrain });
sim.run(1700);

const log = globalThis.__d96log.filter((e) => POOLS.has(e.unit));
const d96 = log.filter((e) => e.src === 'D96-startClosing');
const d72 = log.filter((e) => e.src === 'D72-beginPursuit');
console.log(`D96 startClosing CHARGE writes (pools): ${d96.length}`);
console.log(`D72 beginPursuit ATTACK writes (pools): ${d72.length}`);
console.log(`D72 writes with prior=CHARGE (direct overwrite evidence): ${d72.filter((e) => e.prior === 'CHARGE').length}`);

// Interleave analysis: for each D96 CHARGE, was there a D72 ATTACK write for
// the same unit at the same tick (same-tick overwrite) or the next tick?
let sameTick = 0, nextTick = 0, uncovered = 0;
for (const c of d96) {
  if (d72.some((a) => a.unit === c.unit && a.tick === c.tick)) sameTick += 1;
  else if (d72.some((a) => a.unit === c.unit && a.tick === c.tick + 1)) nextTick += 1;
  else uncovered += 1;
}
console.log(`D96 CHARGEs overwritten same tick: ${sameTick} | next tick: ${nextTick} | never overwritten: ${uncovered}`);

if (d96.length) {
  const first = d96[0], last = d96[d96.length - 1];
  console.log(`first D96 CHARGE: min ${m(first.tick)} ${first.unit} -> ${first.target}`);
  console.log(`last  D96 CHARGE: min ${m(last.tick)} ${last.unit} -> ${last.target}`);
  const w = d96.filter((e) => m(e.tick) >= 765 && m(e.tick) <= 825);
  console.log(`D96 CHARGE writes in 765-825 window: ${w.length}`);
}
const sample = log.filter((e) => m(e.tick) >= 769 && m(e.tick) <= 771);
console.log('\nraw interleave sample, minutes 769-771:');
for (const e of sample) console.log(`  ${m(e.tick)} ${e.src} ${e.unit} -> ${e.target}${e.kind ? ' kind=' + e.kind : ''}${e.prior ? ' prior=' + e.prior : ''}`);
console.error('done');
