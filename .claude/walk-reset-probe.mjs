// Fourteenth measurement: what does the switchThreat() CAVALRY_WALK reset do
// to the post-800 window on the stop seed? Run once against the candidate
// dist as-is (variant WALK), once after patching ONLY the compiled dist's
// switchThreat to CAVALRY_GALLOP (variant GALLOP; dist is gitignored build
// output, restored by rebuild afterward — the candidate source tree is never
// touched). Question ruled in advance of any fix freeze: dropping to walk at
// 23 m may be REDUCING the grind; removing it could make the excess worse.
// Read-only w.r.t. the repository; stop honored (stop seed only).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const variant = process.argv[2] ?? 'WALK';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760625, terrain });
const checkpoints = [740, 800, 820, 840, 860, 880, 900, 950, 1000, 1080];
const killedAt = {};
const speedChanges = new Map(POOLS.map((id) => [id, []]));
const prevSpeed = new Map();
let next = 0;
for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  if (next < checkpoints.length && m(tick) >= checkpoints[next]) {
    killedAt[checkpoints[next]] = RENO.reduce((s, id) => s + (byId.get(id)?.killed ?? 0), 0);
    next += 1;
  }
  for (const id of POOLS) {
    const u = byId.get(id);
    if (!u || m(tick) < 800) continue;
    const cur = `${u.speedClass}/${u.posture}`;
    if (prevSpeed.get(id) !== cur) {
      speedChanges.get(id).push(`${m(tick)}:${cur}`);
      prevSpeed.set(id, cur);
    }
  }
}
const st = sim.state();
const byId = new Map(st.units.map((u) => [u.id, u]));
const killedEnd = RENO.reduce((s, id) => s + (byId.get(id)?.killed ?? 0), 0);
console.log(`===== variant ${variant} — seed 18760625 =====`);
console.log('Reno A/G/M killed at checkpoints:', JSON.stringify(killedAt), '| end:', killedEnd);
console.log('per company end:', RENO.map((id) => { const u = byId.get(id); return `${id} k${u.killed}${u.endState ? '/' + u.endState : ''}@${u.endState ? '' : 'alive'}`; }).join(' | '));
console.log('wing end:', WING.map((id) => { const u = byId.get(id); return `${id}:${u.endState ?? 'alive'}`; }).join(' | '));
console.log('pools end pos:', POOLS.map((id) => { const u = byId.get(id); return `${id}(${Math.round(u.position.x)},${Math.round(u.position.y)})c${u.casualties}`; }).join(' | '));
for (const id of POOLS) console.log(`post-800 speed/posture change-points ${id}: ${speedChanges.get(id).slice(0, 14).join(' ')}`);
console.error('done ' + variant);
