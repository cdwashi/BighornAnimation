// Q3 (Fable, investigation only): pre-phase baseline — the range at which each
// valley band opens against Reno on the halted tree (2f479e2), across the 50
// registered seeds. Records engagement-open range and first-fire range
// (first tick with intensity > 0). Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WARRIOR = new Set(scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id));
const seeds = Array.from({ length: 50 }, (_, i) => 18760600 + i);
const END_TICK = 1600; // minute 800 — the valley fight is decided long before

const openRanges = new Map();  // band -> number[]
const fireRanges = new Map();  // band -> number[]
const openMinutes = [];
const push = (m, k, v) => { const a = m.get(k) ?? []; a.push(v); m.set(k, a); };

for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  const seenOpen = new Set();
  const seenFire = new Set();
  for (let tick = 0; tick <= END_TICK; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    for (const e of st.engagements) {
      const band = e.unitIds.find((i) => WARRIOR.has(i));
      const reno = e.unitIds.find((i) => RENO.has(i));
      if (!band || !reno) continue;
      if (!seenOpen.has(e.id) && e.startedTick === tick) {
        seenOpen.add(e.id);
        push(openRanges, band, e.rangeMeters);
        openMinutes.push(tick / 2);
      }
      if (!seenFire.has(e.id) && e.active && (e.intensity ?? 0) > 0) {
        seenFire.add(e.id);
        push(fireRanges, band, e.rangeMeters);
      }
    }
  }
  console.error(`seed ${seed} done`);
}

const stats = (a) => {
  if (!a || a.length === 0) return null;
  const v = [...a].sort((x, y) => x - y);
  const q = (p) => v[Math.floor(p * (v.length - 1))];
  return { n: v.length, min: v[0], p25: q(0.25), med: q(0.5), p75: q(0.75), max: v[v.length - 1] };
};
const row = (k, s) => s ? `| ${k} | ${s.n} | ${Math.round(s.min)} | ${Math.round(s.p25)} | ${Math.round(s.med)} | ${Math.round(s.p75)} | ${Math.round(s.max)} |` : `| ${k} | 0 | — | — | — | — | — |`;

console.log('Q3 — valley engagement-range baseline, halted tree, seeds 18760600-18760649, ticks 0-1600');
console.log('\nENGAGEMENT-OPEN range (m), per band vs Reno A/G/M (pooled across seeds and companies):');
console.log('| band | n | min | p25 | median | p75 | max |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const k of [...openRanges.keys()].sort()) console.log(row(k, stats(openRanges.get(k))));
console.log('\nFIRST-FIRE range (m) — first tick with intensity > 0:');
console.log('| band | n | min | p25 | median | p75 | max |');
console.log('|---|---:|---:|---:|---:|---:|---:|');
for (const k of [...fireRanges.keys()].sort()) console.log(row(k, stats(fireRanges.get(k))));
const all = [...fireRanges.values()].flat();
console.log('\nALL-BANDS first-fire pooled: ' + JSON.stringify(stats(all)));
const om = stats(openMinutes);
console.log('engagement-open minutes pooled: ' + JSON.stringify(om));
