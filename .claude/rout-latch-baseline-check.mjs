// Nineteenth measurement, part two: does the same routSafetyPath latch fire
// for co-a/co-g in the BASELINE candidate (mode unset), during the 800-820
// valley annihilation? If yes, the immobile-rout latch is a SHARED root
// cause under both the valley excess and the hilltop excess. Stop seed.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const IDS = ['co-a', 'co-g'];
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760625, terrain });
const marks = new Map(IDS.map((id) => [id, []]));
const prev = new Map();
for (let tick = 1500; tick <= 1700; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  for (const id of IDS) {
    const u = st.units.find((x) => x.id === id);
    if (!u) continue;
    const cur = {
      posture: u.posture, morale: u.moraleState,
      latch: u.routSafetyPath ?? false,
      blocked: u.blockedReason ?? null,
      pathLen: u.path.length, pathIdx: u.pathIndex,
      end: u.endState ?? null,
    };
    if (JSON.stringify(cur) !== JSON.stringify(prev.get(id))) {
      marks.get(id).push({ min: m(tick), ...cur, k: u.killed,
        pos: `${Math.round(u.position.x)},${Math.round(u.position.y)}` });
      prev.set(id, cur);
    }
  }
}
for (const id of IDS) {
  console.log(`${id} state change-points, minutes 750-850 (BASELINE):`);
  for (const t of marks.get(id)) {
    console.log(`  ${t.min}: ${t.posture} ${t.morale}${t.end ? ' ' + t.end : ''} latch=${t.latch} blocked=${JSON.stringify(t.blocked)} path=${t.pathIdx}/${t.pathLen} k${t.k} @${t.pos}`);
  }
}
console.error('done');
