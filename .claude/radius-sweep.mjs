// Tenth measure-before-ruling: campDefenseRadiusMeters swept across O6's
// sourced first-alarm band ("a mile or two" = 1,600-3,200 m). Spotting is
// deterministic (D46), so alarm/turnout timing is seed-independent; one seed
// per radius, stated. Reports alarm, turnout completion, warrior posture at
// Reno's Ford A crossing (min 675), and whether a skirmish line ever exists.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const RENO = ['co-a', 'co-g', 'co-m'];
const RADII = [1600, 1800, 2000, 2200, 2400, 2600, 2800, 3000, 3200];

console.log('| radius m | first alert (min) | first turnout complete (min) | bands at features @675 | line formed? | A/G/M @740: formation / killed / state |');
console.log('|---:|---:|---:|---|---|---|');
for (const r of RADII) {
  const sim = createSim(scenario, { seed: 18760625, terrain, parameterOverrides: { campDefenseRadiusMeters: r } });
  let firstAlert = null, firstActive = null;
  let atFeatures675 = '';
  let lineFormed = false;
  let lineMin = null;
  for (let tick = 0; tick <= 1480; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    for (const id of POOLS) {
      const u = st.units.find((x) => x.id === id);
      if (!u) continue;
      if (firstAlert === null && u.campDefenseAlert) firstAlert = tick / 2;
      if (firstActive === null && u.campDefense) firstActive = tick / 2;
    }
    if (tick === 1350) {
      atFeatures675 = POOLS.map((id) => {
        const u = st.units.find((x) => x.id === id);
        return u?.campDefense?.featureId ? 'at-' + u.campDefense.featureId.replace('scenario-', '').replace('substrate-', '') : (u?.campDefenseAlert ? 'turning-out' : 'idle');
      }).join('/');
    }
    if (!lineFormed) {
      for (const id of RENO) {
        const u = st.units.find((x) => x.id === id);
        if (u && !u.mounted && u.formation === 'SKIRMISH' && u.endState !== 'DESTROYED') { lineFormed = true; lineMin = tick / 2; }
      }
    }
  }
  sim.run(1480);
  const st = sim.state();
  const agm = RENO.map((id) => {
    const u = st.units.find((x) => x.id === id);
    return `${(u.mounted ? 'MTD-' : 'dis-') + u.formation} k${u.killed}${u.endState ? '/' + u.endState : ''}`;
  }).join(' | ');
  console.log(`| ${r} | ${firstAlert ?? '—'} | ${firstActive ?? '—'} | ${atFeatures675} | ${lineFormed ? 'YES @' + lineMin : 'no'} | ${agm} |`);
  console.error(`radius ${r} done`);
}
