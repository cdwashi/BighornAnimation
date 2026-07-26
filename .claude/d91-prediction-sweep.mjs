// D91 pre-registered prediction re-derivation across the frozen 50 seeds,
// post schemaVersion-0.3 content-hash reseed. Read-only; no repo mutation.
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
const UNORDERED = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const WARRIOR = scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id);

const seeds = Array.from({ length: 50 }, (_, i) => 18760600 + i);
const rows = [];
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  let maxMassBefore750 = 0;
  let firstCross = null;
  let unorderedWingHandoff = false;
  const everBroken = new Set();
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
    const min = tick / 2;
    for (const id of RENO) {
      const u = byId[id];
      if (u && (u.moraleState === 'BROKEN' || u.moraleState === 'ROUTED')) everBroken.add(id);
    }
    for (const e of st.engagements) {
      if (e.unitIds.some((i) => UNORDERED.includes(i)) && e.unitIds.some((i) => WING.includes(i))) {
        unorderedWingHandoff = true;
      }
    }
    if (min < 750) {
      const renoUnits = RENO.map((i) => byId[i]).filter((u) => u && u.strengthCurrent > 0);
      if (renoUnits.length) {
        let mass = 0;
        for (const id of WARRIOR) {
          const u = byId[id];
          if (!u) continue;
          const d = Math.min(...renoUnits.map((r) =>
            Math.hypot(u.position.x - r.position.x, u.position.y - r.position.y)));
          if (d <= 500) mass += u.strengthAvailable;
        }
        if (mass > maxMassBefore750) maxMassBefore750 = mass;
        if (firstCross === null && mass > 800) firstCross = min;
      }
    }
  }
  const end = sim.state();
  const endBy = Object.fromEntries(end.units.map((u) => [u.id, u]));
  const killed = RENO.reduce((s, i) => s + (endBy[i]?.killed ?? 0), 0);
  const wounded = RENO.reduce((s, i) => s + (endBy[i]?.wounded ?? 0), 0);
  const destroyed = RENO.filter((i) => endBy[i]?.endState === 'DESTROYED');
  rows.push({
    seed,
    maxMassBefore750,
    firstCross,
    unorderedWingHandoff,
    broken: [...everBroken].join('+') || 'none',
    killed,
    wounded,
    renoDestroyed: destroyed.join('+') || 'none',
  });
  console.error(`seed ${seed} done: mass=${maxMassBefore750} cross=${firstCross} handoff=${unorderedWingHandoff} broken=${rows.at(-1).broken} K/W=${killed}/${wounded}`);
}

const p1Hits = rows.filter((r) => r.firstCross !== null).length;
const p2Hits = rows.filter((r) => r.unorderedWingHandoff).length;
const p3Hits = rows.filter((r) => r.broken !== 'none').length;
const inBand = rows.filter((r) => r.killed >= 19.24 && r.killed <= 26.09).length;
const annihilated = rows.filter((r) => r.renoDestroyed === 'co-a+co-g+co-m').length;

console.log('\n== D91 prediction sweep, schemaVersion 0.3 content, seeds 18760600-18760649 ==');
console.log(`P1 mass>800 before min 750: ${p1Hits}/50 | first-cross span: ${Math.min(...rows.filter(r=>r.firstCross!==null).map(r=>r.firstCross))}-${Math.max(...rows.filter(r=>r.firstCross!==null).map(r=>r.firstCross))} | max-mass span: ${Math.min(...rows.map(r=>r.maxMassBefore750))}-${Math.max(...rows.map(r=>r.maxMassBefore750))}`);
console.log(`P2 unordered->wing handoff: ${p2Hits}/50`);
console.log(`P3 any A/G/M BROKEN-or-worse: ${p3Hits}/50`);
console.log(`P4 Reno killed span: ${Math.min(...rows.map(r=>r.killed))}-${Math.max(...rows.map(r=>r.killed))} (band 19.24-26.09; in-band ${inBand}/50) | wounded span: ${Math.min(...rows.map(r=>r.wounded))}-${Math.max(...rows.map(r=>r.wounded))} | annihilated: ${annihilated}/50 | any Reno co DESTROYED: ${rows.filter(r=>r.renoDestroyed!=='none').length}/50`);
