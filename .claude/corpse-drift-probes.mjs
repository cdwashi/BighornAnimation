// Corpse-drift probes C1 + C2 (2026-08-04), per the FROZEN registration at
// docs/research/CORPSE-DRIFT-REGISTRATION.md (61db6f1). Read-only; no
// engine byte moves; current stream [68325eff] declared on every figure
// (D111's tick numbers were stream 8e28552c - the structural claim is what
// transfers). Reading order: C1, then C2a, then C2b.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

log('=== C1 - the trigger discriminator: seed 18760647, co-m, t1490-1560, stream [68325eff] ===');
{
  const seed = 18760647;
  const sim = createSim(scenario, { seed, terrain });
  let deathEventPos = null;
  const destroyedTicks = [];
  let prev = null;
  for (let t = 0; t <= 1560; t += 1) {
    sim.run(t);
    if (t < 1490) continue;
    const st = sim.state();
    for (const e of sim.events()) {
      if (e.type === 'unit-destroyed' && e.tick === t) {
        destroyedTicks.push(`${e.unitId}@t${t}`);
        if (e.unitId === 'co-m') deathEventPos = e.position;
      }
    }
    const u = st.units.find((x) => x.id === 'co-m');
    const cur = { t, x: u.position.x, y: u.position.y, order: u.activeOrderId ?? '-', path: u.path.length, posture: u.posture, end: u.endState ?? '-' };
    const moved = prev && Math.hypot(cur.x - prev.x, cur.y - prev.y) > 0.5;
    const changed = !prev || moved || cur.order !== prev.order || cur.path !== prev.path || cur.end !== prev.end;
    if (changed) log(`t${t}: pos(${cur.x.toFixed(2)},${cur.y.toFixed(2)})${moved ? ` MOVED ${Math.hypot(cur.x - prev.x, cur.y - prev.y).toFixed(1)}m` : ''} order=${cur.order} path=${cur.path} posture=${cur.posture} end=${cur.end}`);
    prev = cur;
  }
  log(`unit-destroyed events in window: ${destroyedTicks.join(' ')}`);
  if (deathEventPos && prev) log(`co-m death-event position (${deathEventPos.x.toFixed(2)},${deathEventPos.y.toFixed(2)}) vs end-of-death-tick sample - within-tick drift measured directly above.`);
}
log('');
log('=== C2a - the re-arm population: committed R1 event log, events on units AFTER their death tick ===');
{
  const deaths = new Map();
  for (const a of results.annihilations) {
    const k = `${a.seed}|${a.unit}`;
    if (!deaths.has(k) || a.tick < deaths.get(k)) deaths.set(k, a.tick);
  }
  const rows = (await readFile(join(REPO, '.claude/repath-event-log.out.txt'), 'utf8')).split('\n');
  const re = /^(\d+) t(\d+) (\S+) (ORDER-CHANGED|TERMINAL-MOVES|TERMINAL-APPEARS|TERMINAL-CLEARED) /;
  const hits = [];
  for (const l of rows) {
    const m = l.match(re);
    if (!m) continue;
    const k = `${m[1]}|${m[3]}`;
    const dt = deaths.get(k);
    if (dt !== undefined && Number(m[2]) > dt) hits.push(`${k} death@t${dt} -> ${m[4]}@t${m[2]}`);
  }
  log(`post-death events on the 120 committed annihilation units: ${hits.length}`);
  for (const h of hits.slice(0, 30)) log(`  ${h}`);
  if (hits.length > 30) log(`  ... ${hits.length - 30} more`);
  if (hits.length === 0) log('  NONE - no committed annihilation unit shows any event after its death tick in the R1 log.');
}
log('');
log('=== C2b - the instrument audit: when each committed probe reads positions relative to destruction ===');
log('(classifications from the probes\' own committed source, citable line by line)');
log('  steady-shelter-probes.mjs   AT-TICK  (post sim.run(t) at the death tick)');
log('  zero-distance-goal-check.mjs AT-TICK (same convention)');
log('  order-objective-check.mjs   INHERITED AT-TICK (offline over the committed pair table)');
log('  membership-rederivation.mjs AT-TICK  (post sim.run(t) at the death tick)');
log('  steady-fix-m1.mjs           PRE-DEATH (end t-1; corrected from AT-TICK mid-phase, documented)');
log('  steady-fix-m2.mjs           PRE-DEATH (end t-1)');
log('  ooe-x2.mjs                  PRE-DEATH (end t-1)');
log('  repath-event-log.mjs        ALL-TICKS BY DESIGN - the one instrument that reads past death;');
log('    its D1 tallies and family counts included any post-death events; C2a above sizes that');
log('    exposure against the 120 committed annihilation units.');
log('  m4/e3/e4/x3 workers         EVENT+SCORE reads (bouts are at-death events; composites read');
log('    end-of-day state).');
log('  UNANSWERABLE-IN-SCOPE, flagged rather than guessed: whether scoreCalibrationRun reads');
log('  DESTROYED units\' end-of-day positions in any leg - score.ts was imported by instruments and');
log('  never opened by ruling; if any committed leg reads corpse positions at t2160, drift between');
log('  death and day-end would contaminate it, and answering requires a dated read of score.ts.');
await writeFile(join(REPO, '.claude/corpse-drift-probes.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
