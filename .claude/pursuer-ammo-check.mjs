// Twenty-fifth measurement, stage 2: are the pursuers dry? Seed 18760644,
// sampled through co-m's pursued flight: each pursuer's per-weapon
// ammunition, strengthAvailable, fatigue, jams. If ammunition is zero
// across weapons, combat.ts:258 silently skips every weapon and pursuit
// cannot convert - the one-line locus Fable anticipated. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const PURSUERS = ['hunkpapa-pool', 'gall-band', 'crow-king-band', 'sans-arc-pool', 'blackfeet-santee-pool', 'minneconjou-pool'];
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760644, terrain });
for (const stop of [1400, 1440, 1530, 1560, 1590]) {
  sim.run(stop);
  const st = sim.state();
  console.log(`--- minute ${m(stop)} ---`);
  for (const id of PURSUERS) {
    const u = st.units.find((x) => x.id === id);
    if (!u) continue;
    const ammo = Object.entries(u.ammunition ?? {}).map(([w, n]) => `${w}:${n}`).join(' ');
    const jams = Object.entries(u.jammedWeapons ?? {}).map(([w, l]) => `${w}:${l.length}`).filter((s) => !s.endsWith(':0')).join(' ');
    console.log(`  ${id}: sa${u.strengthAvailable} fat${Math.round(u.fatigue)} ammo[${ammo}]${jams ? ' jams[' + jams + ']' : ''}`);
  }
}
// Also: total ammo-resupplied events for pursuers all day
sim.run(2160);
const events = sim.events();
for (const id of PURSUERS) {
  const res = events.filter((e) => e.type === 'ammo-resupplied' && e.unitId === id).length;
  console.log(`${id}: ammo-resupplied events all day: ${res}`);
}
console.error('done');
