// Nineteenth measurement: why is a ROUTED band immobile at one coordinate
// for 64 minutes, and what share of its destruction does the immobility
// carry? Code suspect (named pre-instrumentation): routeToSafety's
// routSafetyPath is a ONE-SHOT latch - set true on failure as well as
// success (morale.ts:108,139), so a rout that once finds every corridor
// interdicted freezes with path=[] and never re-attempts; the BROKEN+
// discipline branch (morale.ts:183) sets WITHDRAW with no path at all.
// Mode A gate (one-authority) to reproduce the eighteenth's state; stop
// seed; dist restored byte-identical afterward.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__d17mode = 'A';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const ID = 'hunkpapa-pool';
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760625, terrain });
const marks = [];
let prev = {};
let cAt876 = null, cPreDest = null, kPreDest = null, lastAlive = null;
for (let tick = 0; tick <= 1960; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const u = st.units.find((x) => x.id === ID);
  if (!u) continue;
  if (m(tick) === 876) cAt876 = u.casualties;
  if (!u.endState) { cPreDest = u.casualties; kPreDest = u.killed; lastAlive = m(tick); }
  const cur = {
    posture: u.posture, morale: u.moraleState,
    latch: u.routSafetyPath ?? false,
    blocked: u.blockedReason ?? null,
    pathLen: u.path.length, pathIdx: u.pathIndex,
    end: u.endState ?? null,
  };
  if (JSON.stringify(cur) !== JSON.stringify(prev) && m(tick) >= 860) {
    marks.push({ min: m(tick), ...cur, c: u.casualties, k: u.killed,
      pos: `${Math.round(u.position.x)},${Math.round(u.position.y)}` });
    prev = cur;
  }
}
console.log('hunkpapa-pool state change-points from 860 (mode A):');
for (const t of marks) {
  console.log(`  ${t.min}: ${t.posture} ${t.morale}${t.end ? ' ' + t.end : ''} latch=${t.latch} blocked=${JSON.stringify(t.blocked)} path=${t.pathIdx}/${t.pathLen} c${t.c} k${t.k} @${t.pos}`);
}
console.log(`\ncasualty accounting: c at immobility start (876) = ${cAt876};` +
  ` c last-alive (${lastAlive}) = ${cPreDest} (k${kPreDest});` +
  ` absorbed while immobile pre-destruction = ${cPreDest - cAt876}`);
console.error('done');
