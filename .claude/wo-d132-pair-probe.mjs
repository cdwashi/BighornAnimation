// WO-D132 pre-freeze dry-run — THE FIRST COMPLETED VARIANT RUNS IN THE REGISTER
// (D125's census: #137/#138 "unscored variant surfaces" — variants have only ever been
// load-tested). Read-only, throwaway, seed 18760600 (the app default, envelope median).
// Runs the two §11 pairs against baseline and measures the OPERATIONAL DEFINITION of
// "visibly different" ruled at the freeze: a difference a user can see without
// instruments — a named event firing or not, a different final roster, a visibly
// different bout sequence. NOT a composite delta (D119: the statistic that sits still
// through a rewritten battle).
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const SEED = 18760600, END = 2160;

const fordB = (() => {
  const l = scenario.terrain.landmarks.find((x) => x.id === 'ford-b');
  const [x, y] = terrain.toLocal(l.position.lat, l.position.lon);
  return { x, y };
})();

function runWorld(label, variants) {
  const sim = createSim(scenario, { seed: SEED, terrain, variants });
  const minFord = new Map([['co-e', Infinity], ['co-f', Infinity]]);
  for (let t = 0; t <= END; t += 1) {
    sim.run(t);
    for (const id of minFord.keys()) {
      const u = sim.state().units.find((x) => x.id === id);
      if (u && u.position) {
        const d = Math.hypot(u.position.x - fordB.x, u.position.y - fordB.y);
        if (d < minFord.get(id)) minFord.set(id, d);
      }
    }
  }
  const st = sim.state();
  const destroyed = st.units.filter((u) => u.endState === 'DESTROYED').map((u) => u.id).sort();
  const events = sim.events ? sim.events() : [];
  const evCounts = {};
  for (const e of events) evCounts[e.type] = (evCounts[e.type] ?? 0) + 1;
  const bouts = st.engagements ? st.engagements.length : (evCounts['engagement-start'] ?? 'n/a');
  log(`\n=== ${label} ===`);
  log(`destroyed roster (${destroyed.length}): ${destroyed.join(', ')}`);
  log(`min distance to ford-b: co-e ${minFord.get('co-e').toFixed(0)} m, co-f ${minFord.get('co-f').toFixed(0)} m`);
  log(`engagements: ${bouts}; event counts: ${Object.entries(evCounts).sort().map(([k, v]) => `${k}:${v}`).join(' ')}`);
  return { destroyed, minFord, evCounts, bouts };
}

log(`WO-D132 pair probe — seed ${SEED}, baseline vs the two §11 pairs`);
const base = runWorld('BASELINE (feint; disintegration)', []);
const mtc = runWorld('v-mtc-crossing (§11 pair 1: Medicine Tail serious crossing)', ['v-mtc-crossing']);
const ols = runWorld('v-organized-last-stand (§11 pair 2)', ['v-organized-last-stand']);

log('\n=== OPERATIONAL-DEFINITION OBSERVABLES ===');
log(`Pair 1 (ford-b approach, user-visible as units at the river): baseline co-e/f min-dist ${base.minFord.get('co-e').toFixed(0)}/${base.minFord.get('co-f').toFixed(0)} m vs crossing ${mtc.minFord.get('co-e').toFixed(0)}/${mtc.minFord.get('co-f').toFixed(0)} m`);
log(`Pair 1 roster delta: ${JSON.stringify(mtc.destroyed) === JSON.stringify(base.destroyed) ? 'IDENTICAL' : `differs — baseline ${base.destroyed.length} vs variant ${mtc.destroyed.length}`}`);
log(`Pair 2 roster delta: ${JSON.stringify(ols.destroyed) === JSON.stringify(base.destroyed) ? 'IDENTICAL' : `differs — baseline [${base.destroyed.join(',')}] vs variant [${ols.destroyed.join(',')}]`}`);
log(`Pair 2 engagement-count delta: ${base.bouts} -> ${ols.bouts}`);
await writeFile(join(REPO, '.claude/wo-d132-pair-probe.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
