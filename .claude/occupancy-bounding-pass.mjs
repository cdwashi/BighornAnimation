// FORTIETH MEASUREMENT: the occupancy bounding pass, ordered by Fable at
// the bundle design's opening ("Go on the bounding pass. The fork ruling
// waits on what it returns."). Question: does feature capacity
// (area / ground-per-man) ever BIND - across the whole sweep of candidate
// densities - against the warrior mass that actually seeks each feature
// in the accepted D107 world?
//
// Sweep design note (Fable's addition, adopted as a RANGE change not just
// disclosure): candidate exclusion rules carry IMPLIED densities - one
// man per 10 m cell = 100 m2/man - which lie on the MORE-binding side of
// the memo's 0.17-21 m2 construct (larger denominator -> smaller
// capacity). A never-binds verdict must therefore cover the implied
// densities of the candidate rules, or it does not cover the mechanism
// actually proposed. Sweep: 0.17 (close-order footprint) / 1 / 2.4
// (mounted minimum, Q2a) / 4.57 (Upton interval, linear-as-area floor) /
// 9 / 21 (interval-squared) / 100 (one-man-per-cell). Per feature we also
// report the BINDING THRESHOLD t = area / peak-demand: capacity binds
// exactly when density > t, so t locates the fork's answer without
// privileging any sweep point.
//
// Demand is measured two ways, 50 seeds, full day, D107 tree (53d003a):
//   ASSIGNED peak - max simultaneous strengthAvailable of warrior bands
//     with campDefense.featureId = f (demand, whether or not they arrive);
//   HOLDING peak - assigned AND position within ~30 m of a feature cell
//     (occupancy the ground would actually have to carry).
// scenario-bench is a POINT feature (no cells, no area) - its demand is
// reported as data for the bundle's Bench-extent choice; capacity is
// undefined until the data commit gives it ground. D100 foothills do not
// exist in current terrain; disclosed, not represented here.
// Read-only. No engine change. No prediction judged.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const WARRIOR = new Set(scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id));
const SWEEP = [0.17, 1, 2.4, 4.57, 9, 21, 100];

const features = new Map(); // id -> {cells, area, hash:Set}
for (const f of terrain.coverFeatures()) {
  const hash = new Set(f.points.map((p) => `${Math.round(p.x / 10)},${Math.round(p.y / 10)}`));
  features.set(f.id, { cells: f.points.length, area: f.points.length * 100, hash });
}
const nearCell = (feat, pos) => {
  const cx = Math.round(pos.x / 10), cy = Math.round(pos.y / 10);
  for (let dx = -3; dx <= 3; dx += 1) for (let dy = -3; dy <= 3; dy += 1) {
    if (feat.hash.has(`${cx + dx},${cy + dy}`)) return true;
  }
  return false;
};

const peaks = new Map(); // featureId -> {assigned, holding, assignedBands:Set, seedsAssigned:Set}
const peak = (id) => {
  const p = peaks.get(id) ?? { assigned: 0, holding: 0, assignedBands: new Set(), seedsAssigned: new Set() };
  peaks.set(id, p);
  return p;
};
for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const assignedNow = new Map(); // featureId -> strength
    const holdingNow = new Map();
    for (const u of st.units) {
      if (!WARRIOR.has(u.id) || u.endState === 'DESTROYED') continue;
      const fid = u.campDefense?.featureId;
      if (!fid) continue;
      assignedNow.set(fid, (assignedNow.get(fid) ?? 0) + u.strengthAvailable);
      const p = peak(fid);
      p.assignedBands.add(u.id);
      p.seedsAssigned.add(seed);
      const feat = features.get(fid);
      if (feat && nearCell(feat, u.position)) {
        holdingNow.set(fid, (holdingNow.get(fid) ?? 0) + u.strengthAvailable);
      }
    }
    for (const [fid, s] of assignedNow) { const p = peak(fid); if (s > p.assigned) p.assigned = s; }
    for (const [fid, s] of holdingNow) { const p = peak(fid); if (s > p.holding) p.holding = s; }
  }
  console.error(`seed ${seed} done`);
}

console.log('===== FORTIETH MEASUREMENT: occupancy bounding pass, 50 seeds, D107 world =====');
console.log('\nCapacity binds iff density > t (t = area / peak demand, m2/man). Sweep: ' + SWEEP.join(' / ') + ' m2/man.');
console.log('\n| feature | cells | area m2 | peak ASSIGNED | peak HOLDING | bands | seeds | t(assigned) | t(holding) | binds within sweep? |');
console.log('|---|---:|---:|---:|---:|---:|---:|---:|---:|---|');
let anyBind = false;
for (const [fid, p] of [...peaks.entries()].sort((l, r) => r[1].assigned - l[1].assigned)) {
  const feat = features.get(fid);
  if (!feat) {
    console.log(`| ${fid} | POINT | none | ${p.assigned} | n/a | ${p.assignedBands.size} | ${p.seedsAssigned.size} | UNDEFINED | UNDEFINED | capacity undefined until extent exists |`);
    continue;
  }
  const tA = p.assigned ? feat.area / p.assigned : Infinity;
  const tH = p.holding ? feat.area / p.holding : Infinity;
  const binds = SWEEP.filter((d) => d > tA);
  if (binds.length) anyBind = true;
  console.log(`| ${fid} | ${feat.cells} | ${feat.area} | ${p.assigned} | ${p.holding} | ${p.assignedBands.size} | ${p.seedsAssigned.size} | ${tA === Infinity ? 'inf' : tA.toFixed(1)} | ${tH === Infinity ? 'inf' : tH.toFixed(1)} | ${binds.length ? 'BINDS at ' + binds.join(',') : 'never'} |`);
}
console.log('\nFeatures never sought by any band (zero demand all 50 seeds):');
const sought = new Set(peaks.keys());
const unsought = [...features.keys()].filter((id) => !sought.has(id));
console.log('  ' + (unsought.length ? unsought.join(', ') : '(none)'));
console.log(`\nVERDICT INPUT: ${anyBind ? 'capacity BINDS somewhere in the sweep - the fork is LIVE' : 'capacity NEVER binds at any swept density on any represented feature - the denominator is irrelevant on current ground'}`);
console.log('Disclosures: scenario-bench has no ground (demand reported, capacity undefined until the data commit); D100 foothills absent from current terrain; implied-density coverage per Fable: sweep includes 100 m2/man = one-man-per-cell.');
console.error('done');
