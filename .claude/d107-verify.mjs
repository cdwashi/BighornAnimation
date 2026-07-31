// WO-D107 independent verification: reproduce seed 18760632 digit-exact -
// the disclosed expected-behaviour seed (Reno 68; co-a annihilated @773.5
// west, terminal 28; complete wing yes; 10 bouts, 3 annihilations) - and
// the baseline seed 18760625 (Reno 30, all three east, complete wing, 11
// bouts, 4 annihilations). Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

for (const [seed, expect] of [[18760632, 'Reno 68, wing yes, bouts 10, annih 3, co-a annihilated @773.5 t28'], [18760625, 'Reno 30, wing yes, bouts 11, annih 4']]) {
  const sim = createSim(scenario, { seed, terrain });
  sim.run(2160);
  const st = sim.state();
  const events = sim.events();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  const reno = RENO.reduce((s, id) => s + byId.get(id).killed, 0);
  const wing = WING.every((id) => byId.get(id).endState === 'DESTROYED') && !byId.get('co-d').endState;
  const bouts = events.filter((e) => e.type === 'melee-bout');
  const annih = bouts.filter((e) => e.outcome === 'annihilation');
  const east = RENO.filter((id) => { const u = byId.get(id); return !u.endState && sideOf(u.position) === 'EAST'; }).length;
  console.log(`${seed}: Reno ${reno} | east ${east} | complete wing ${wing} | bouts ${bouts.length} | annihilations ${annih.length}`);
  for (const a of annih.filter((e) => RENO.includes(e.targetUnitId))) {
    console.log(`  RENO annihilation: ${e => 0}${a.targetUnitId} @${m(a.tick)} by ${a.unitId} terminal ${a.terminalConverted}`);
  }
  console.log(`  [expected: ${expect}]`);
}
console.error('done');
