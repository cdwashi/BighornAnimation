// Companion to bench-terrace-extent.mjs (same measurement): the global
// flood-fill LEAKED (3.8-6.4 km2, cap hit, east-bank cells) because an
// absolute elevation band follows the valley's along-axis gradient -
// D90's relief bound is local-window relief, not absolute. This pass
// finds the terrace's PHYSICAL edges directionally: elevation profiles
// along 16 rays from the bench point, recording where the surface first
// drops >3.5 m BELOW the bench elevation (downhill break - D90's own
// edge signal) and where it first rises >3.5 m ABOVE it (uphill bound),
// out to 1,500 m at 5 m steps. The terrace's real dimensions are the
// break distances; directions with no break within range are reported
// as unbounded (the along-valley shelf). Read-only, DEM-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const bench = (scenario.coverFeatures ?? []).find((f) => f.id === 'bench');
const [bx, by] = terrain.toLocal(bench.position.lat, bench.position.lon);
const e0 = terrain.elevationAtMeters(bx, by);
console.log(`bench local (${Math.round(bx)}, ${Math.round(by)}), elevation ${e0.toFixed(2)} m, tolerance 3.5 m`);
console.log('\n| bearing (deg, 0=N=+y) | downhill break (m) | uphill bound (m) | first bound (m) | note |');
console.log('|---:|---:|---:|---:|---|');
const bounds = [];
for (let i = 0; i < 16; i += 1) {
  const theta = (i * 2 * Math.PI) / 16;
  const dx = Math.sin(theta), dy = Math.cos(theta);
  let down = null, up = null;
  for (let r = 5; r <= 1500; r += 5) {
    const e = terrain.elevationAtMeters(bx + dx * r, by + dy * r);
    if (!Number.isFinite(e)) break;
    if (down === null && e < e0 - 3.5) down = r;
    if (up === null && e > e0 + 3.5) up = r;
    if (down !== null && up !== null) break;
  }
  const first = Math.min(down ?? Infinity, up ?? Infinity);
  bounds.push(first);
  const deg = Math.round((i * 360) / 16);
  console.log(`| ${deg} | ${down ?? '>1500'} | ${up ?? '>1500'} | ${first === Infinity ? 'UNBOUNDED' : first} | ${first === Infinity ? 'open shelf' : first <= 60 ? 'edge inside D90 window' : ''} |`);
}
const finite = bounds.filter((b) => b !== Infinity);
console.log(`\nbounded directions: ${finite.length}/16 | min ${finite.length ? Math.min(...finite) : 'n/a'} m | median ${finite.length ? finite.sort((a, b) => a - b)[Math.floor(finite.length / 2)] : 'n/a'} m | max ${finite.length ? Math.max(...finite) : 'n/a'} m`);
console.log('Ellipse-order area estimate from bounded rays only (pi * r_med^2) is indicative, not a delineation.');
console.error('done');
