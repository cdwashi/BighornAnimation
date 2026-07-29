// Seventh measure-before-freezing: ASYMMETRIC effective-range distribution.
// O7 gives cavalry a doctrinal interval and leaves warrior spacing UNRESOLVED,
// so extent applies to the cavalry side only (warrior extent 0 pending the
// cover-occupancy design). Computed against halted-tree valley fire samples
// at O7's three Q1 bounds. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { combatConfig } = await import(pathToFileURL(join(REPO, 'dist/engine/src/combat-config.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const config = combatConfig();
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WARRIOR = new Set(scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id));
const seeds = Array.from({ length: 20 }, (_, i) => 18760600 + i);
const BOUNDS = [['low 1.52', 1.52], ['best 2.74', 2.74], ['high 4.57', 4.57]];

const samples = [];
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  for (let tick = 1400; tick <= 1560; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
    for (const e of st.engagements) {
      if (!e.active || e.state === 'APPROACH') continue;
      const band = e.unitIds.find((i) => WARRIOR.has(i));
      const reno = e.unitIds.find((i) => RENO.has(i));
      if (!band || !reno) continue;
      const ru = byId[reno];
      if (!ru) continue;
      samples.push({ range: e.rangeMeters, renoAvail: ru.strengthAvailable });
    }
  }
  console.error(`seed ${seed} done`);
}

const stats = (a) => {
  const v = [...a].sort((x, y) => x - y);
  const q = (p) => v[Math.floor(p * (v.length - 1))];
  return { n: v.length, min: Math.round(v[0]), p25: Math.round(q(0.25)), med: Math.round(q(0.5)), p75: Math.round(q(0.75)), max: Math.round(v[v.length - 1]) };
};
console.log(`ASYMMETRIC effective range: eff = max(0, centroidRange - (0 + renoAvail x m)/2), valley fire ticks, 20 seeds`);
console.log('centroid baseline: ' + JSON.stringify(stats(samples.map((s) => s.range))));
console.log('Reno avail at fire ticks: ' + JSON.stringify(stats(samples.map((s) => s.renoAvail))));
for (const [label, m] of BOUNDS) {
  const eff = samples.map((s) => Math.max(0, s.range - (s.renoAvail * m) / 2));
  const st = stats(eff);
  const z = (100 * eff.filter((v) => v === 0).length / eff.length).toFixed(1);
  const melee = (100 * eff.filter((v) => v <= config.meleeRangeMeters).length / eff.length).toFixed(1);
  const charge = (100 * eff.filter((v) => v <= config.chargeRangeMeters).length / eff.length).toFixed(1);
  console.log(`Q1 ${label} m/man: ${JSON.stringify(st)} | collapsed-to-0 ${z}% | <=melee(${config.meleeRangeMeters}) ${melee}% | <=charge(${config.chargeRangeMeters}) ${charge}%`);
}
