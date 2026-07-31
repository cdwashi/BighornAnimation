// Which-one-specifically supplement to the 42nd: WHY is timber-0003
// unreachable for the pools? Captures PathResult.reason at each pool's
// first bench-assignment tick, seed 18760600 only. Same replicated
// enumeration as overflow-eligibility-check.mjs.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { findCampDefensePath, campDefensePathBlocker } = await import(pathToFileURL(join(REPO, 'dist/engine/src/camp-defense.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const POOLS = new Set(['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool', 'cheyenne-pool', 'hunkpapa-pool']);
const side = (p) => terrain.channelSideAtMeters?.(p.x, p.y);
const t3 = terrain.coverFeatures().find((f) => f.id === 'substrate-timber-0003');

const sim = createSim(scenario, { seed: 18760600, terrain });
const done = new Set();
for (let tick = 0; tick <= 2160 && done.size < 5; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  for (const u of st.units) {
    if (!POOLS.has(u.id) || done.has(u.id) || u.endState) continue;
    const cd = u.campDefense;
    if (!cd || cd.featureId !== 'scenario-bench' || !cd.campUnitId || !cd.threatUnitId) continue;
    done.add(u.id);
    const camp = byId.get(cd.campUnitId);
    const threat = byId.get(cd.threatUnitId);
    const campS = side(camp.position);
    const pts = t3.points.filter((p) => side(p) === campS);
    const goal = pts.reduce((best, p) => {
      const d = Math.hypot(p.x - threat.position.x, p.y - threat.position.y);
      return !best || d < best.d ? { p, d } : best;
    }, null);
    const r = findCampDefensePath(st, u, terrain, goal.p);
    const blocker = campDefensePathBlocker(st, u, terrain);
    console.log(`${u.id} @min ${tick / 2}: pos(${Math.round(u.position.x)},${Math.round(u.position.y)}) side ${side(u.position)} | camp side ${campS} | goal(${Math.round(goal.p.x)},${Math.round(goal.p.y)}) side ${side(goal.p)} | t3 camp-side pts ${pts.length}/${t3.points.length} | result ${r.status}${r.status === 'unreachable' ? ' reason: ' + r.reason : ' pathLen ' + r.path.length} | blockerActive ${blocker ? 'yes' : 'no'}${blocker ? ' goalBlocked ' + blocker(goal.p) : ''}`);
  }
}
console.error('done');
