// FORTY-FIRST MEASUREMENT: ground-pressure census, all channels - the
// 40th's named gap closed before the joint fork/extent ruling freezes.
// The 40th measured demand on the campDefense channel only (peak 620 on
// scenario-bench); ordered bands occupy ground with no campDefense
// assignment and were not counted. Since the fork now turns on whether
// capacity binds and by how much, the undercount matters directly
// (Fable, pre-ruling). This probe counts by POSITION: peak simultaneous
// warrior strength standing on each feature's ground, split by channel
// (assigned-to-this-feature vs unassigned/ordered), 50 seeds, full day,
// D107 world (8781e9a).
//
// Ground definitions: scenario-bench is a point feature - pressure is
// counted within radius 30 m (D90's described ~60 m neighbourhood,
// ~2,827 m2 - the ruling's crux area) and radius 60 m (sensitivity,
// ~11,310 m2); timber features - position within ~1 cell (14 m) of any
// 10 m cell. Transience caveat: position-based counting includes bands
// passing through; per-seed peak distributions and nonzero-tick counts
// are reported so sustained pressure and transit spikes can be told
// apart. Read-only. No engine change. No prediction judged.
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

const benchSrc = (scenario.coverFeatures ?? []).find((f) => f.id === 'bench');
const [bx, by] = terrain.toLocal(benchSrc.position.lat, benchSrc.position.lon);
console.log(`bench local position: (${Math.round(bx)}, ${Math.round(by)})`);
const cellFeatures = new Map();
for (const f of terrain.coverFeatures()) {
  cellFeatures.set(f.id, new Set(f.points.map((p) => `${Math.round(p.x / 10)},${Math.round(p.y / 10)}`)));
}
const onCells = (hash, pos) => {
  const cx = Math.round(pos.x / 10), cy = Math.round(pos.y / 10);
  for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) {
    if (hash.has(`${cx + dx},${cy + dy}`)) return true;
  }
  return false;
};

// trackers: key -> {globalPeak, globalPeakUnassigned, seedPeaks:[], seedPeaksUnassigned:[], nonzeroTicks, bands:Map(id->peak contribution strength), seedsNonzero}
const KEYS = ['bench-r30', 'bench-r60', ...cellFeatures.keys()];
const track = new Map(KEYS.map((k) => [k, {
  globalPeak: 0, globalPeakUn: 0, seedPeaks: [], seedPeaksUn: [], nonzeroTicks: 0,
  bands: new Map(), seedsNonzero: 0,
}]));

for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const seedPeak = new Map(KEYS.map((k) => [k, 0]));
  const seedPeakUn = new Map(KEYS.map((k) => [k, 0]));
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const now = new Map(KEYS.map((k) => [k, 0]));
    const nowUn = new Map(KEYS.map((k) => [k, 0]));
    for (const u of st.units) {
      if (!WARRIOR.has(u.id) || u.endState === 'DESTROYED') continue;
      const hits = [];
      const dBench = Math.hypot(u.position.x - bx, u.position.y - by);
      if (dBench <= 30) hits.push(['bench-r30', 'scenario-bench']);
      if (dBench <= 60) hits.push(['bench-r60', 'scenario-bench']);
      for (const [fid, hash] of cellFeatures) {
        if (onCells(hash, u.position)) hits.push([fid, fid]);
      }
      for (const [key, featId] of hits) {
        now.set(key, now.get(key) + u.strengthAvailable);
        const t = track.get(key);
        t.bands.set(u.id, Math.max(t.bands.get(u.id) ?? 0, u.strengthAvailable));
        if (u.campDefense?.featureId !== featId) nowUn.set(key, nowUn.get(key) + u.strengthAvailable);
      }
    }
    for (const k of KEYS) {
      const t = track.get(k);
      if (now.get(k) > 0) t.nonzeroTicks += 1;
      if (now.get(k) > seedPeak.get(k)) seedPeak.set(k, now.get(k));
      if (nowUn.get(k) > seedPeakUn.get(k)) seedPeakUn.set(k, nowUn.get(k));
    }
  }
  for (const k of KEYS) {
    const t = track.get(k);
    t.seedPeaks.push(seedPeak.get(k));
    t.seedPeaksUn.push(seedPeakUn.get(k));
    if (seedPeak.get(k) > 0) t.seedsNonzero += 1;
    if (seedPeak.get(k) > t.globalPeak) t.globalPeak = seedPeak.get(k);
    if (seedPeakUn.get(k) > t.globalPeakUn) t.globalPeakUn = seedPeakUn.get(k);
  }
  console.error(`seed ${seed} done`);
}

const q = (l, p) => { const s = [...l].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
console.log('===== FORTY-FIRST MEASUREMENT: ground-pressure census (all channels, by position), 50 seeds =====');
console.log('\n| ground | global peak | peak UNASSIGNED-share | per-seed peak min/med/max | seeds>0 | nonzero ticks (sum) | top bands (peak contrib) |');
console.log('|---|---:|---:|---|---:|---:|---|');
for (const k of KEYS) {
  const t = track.get(k);
  const tops = [...t.bands.entries()].sort((l, r) => r[1] - l[1]).slice(0, 5).map(([id, s]) => `${id}:${s}`).join(' ');
  console.log(`| ${k} | ${t.globalPeak} | ${t.globalPeakUn} | ${q(t.seedPeaks, 0)}/${q(t.seedPeaks, 0.5)}/${q(t.seedPeaks, 1)} | ${t.seedsNonzero}/50 | ${t.nonzeroTicks} | ${tops || '(none)'} |`);
}
console.log('\nArithmetic anchor for the ruling: 40th assigned-channel peak on bench was 620.');
console.log('Capacity of D90 ground (2,827 m2) at candidate densities: 2.4 -> 1,178 men | 4.57 -> 619 men | 21 -> 135 men | 100 (one-man-per-cell) -> 28 men.');
console.error('done');
