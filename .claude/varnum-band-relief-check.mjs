// CC check for the D90 Varnum reconciliation (2026-08-02, Fable's pre-D100
// gate): does the DEM offer ANY alternative rise inside Varnum's stated band
// (800-1200 yd = 732-1097 m from Reno's line) that could be the "foot-hills"
// instead of D90's 1.6-2.4 km summits? If no candidate exists in-band, the
// misidentification reading is excluded and estimate-low is the only reading
// left standing. Static DEM, read-only.
//
// Method: rays from the D44-ruled line checkpoint (45.52577, -107.4064)
// toward each D90 foothill and across the western half-plane (bearings 180-
// 340 deg, 10 deg steps), sampled every 20 m to 1300 m. A candidate = local
// elevation maximum inside 400-1300 m with prominence >= 5 m over the
// preceding valley on the same ray (D90's own terrace-search floor was 3-18 m
// rise; 5 m is generous toward finding something).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));

const [lx, ly] = terrain.toLocal(45.52577, -107.4064);
const e0 = terrain.elevationAtMeters(lx, ly);
console.log(`line checkpoint local (${lx.toFixed(0)},${ly.toFixed(0)}) elev ${e0.toFixed(1)}`);

const FOOTHILLS = [
  { id: 'fh-1', lat: 45.50579, lon: -107.40259 },
  { id: 'fh-2', lat: 45.51317, lon: -107.41571 },
  { id: 'fh-3', lat: 45.50827, lon: -107.41294 },
];

function scanRay(label, dx, dy) {
  // dx,dy unit vector; sample 0..1300 m, find local maxima with prominence>=5
  const samples = [];
  for (let d = 0; d <= 1300; d += 20) {
    const e = terrain.elevationAtMeters(lx + dx * d, ly + dy * d);
    samples.push({ d, e: Number.isFinite(e) ? e : null });
  }
  const finds = [];
  let valley = samples[0]?.e ?? 0;
  for (let i = 1; i < samples.length - 1; i += 1) {
    const s = samples[i];
    if (s.e === null) continue;
    const prev = samples[i - 1].e, next = samples[i + 1].e;
    if (prev !== null && s.e < valley) valley = s.e;
    if (prev !== null && next !== null && s.e >= prev && s.e >= next) {
      const prominence = s.e - valley;
      if (prominence >= 5 && s.d >= 400 && s.d <= 1300) {
        finds.push(`${s.d}m elev ${s.e.toFixed(1)} (+${prominence.toFixed(1)} over valley)`);
      }
    }
  }
  const inBand = finds.filter((f) => {
    const d = Number(f.split('m')[0]);
    return d >= 732 && d <= 1097;
  });
  console.log(`${label}: candidates 400-1300 m [${finds.join(' | ') || 'NONE'}]` +
    ` | in Varnum band 732-1097 m: ${inBand.length ? inBand.join(' | ') : 'NONE'}`);
  return inBand.length;
}

let total = 0;
for (const fh of FOOTHILLS) {
  const [fx, fy] = terrain.toLocal(fh.lat, fh.lon);
  const dist = Math.hypot(fx - lx, fy - ly);
  total += scanRay(`ray to ${fh.id} (${dist.toFixed(0)} m)`, (fx - lx) / dist, (fy - ly) / dist);
}
for (let bearing = 180; bearing <= 340; bearing += 10) {
  const rad = bearing * Math.PI / 180;
  // bearing 0=grid north (+y), 90=east (+x): west half-plane
  total += scanRay(`bearing ${bearing}`, Math.sin(rad), Math.cos(rad));
}
console.log(`\nTOTAL in-band candidates across all rays: ${total}`);
console.error('done');
