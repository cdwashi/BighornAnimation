// WO-D106 independent verification: reproduce one unseen seed digit-exact.
// 18760634 - the seed that fired D105's stop at killed 102 - reported by
// the D106 campaign as Reno 31, coalition 84, all three east, no complete
// wing, 10 bouts. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

const sim = createSim(scenario, { seed: 18760634, terrain });
sim.run(2160);
const st = sim.state();
const events = sim.events();
const byId = new Map(st.units.map((u) => [u.id, u]));
const reno = RENO.reduce((s, id) => s + byId.get(id).killed, 0);
let coalition = 0;
for (const u of st.units) {
  const src = scenario.units[u.unitIndex];
  if (src.sideId === SIDE && src.kind !== 'NONCOMBATANT_CAMP') coalition += u.killed;
}
const east = RENO.filter((id) => { const u = byId.get(id); return !u.endState && sideOf(u.position) === 'EAST'; }).length;
const wing = WING.every((id) => byId.get(id).endState === 'DESTROYED');
const bouts = events.filter((e) => e.type === 'melee-bout').length;
console.log(`18760634: Reno ${reno} (expect 31) | coalition ${coalition} (expect 84) | east ${east} (expect 3) | complete wing ${wing} (expect false) | bouts ${bouts} (expect 10)`);
console.log(`per company: ${RENO.map((id) => `${id} k${byId.get(id).killed}`).join(' ')} (expect 8/4/19)`);
console.error('done');
