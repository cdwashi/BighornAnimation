// CC independent verification of the WO-D108 halt (which-one-specifically):
// reproduce the 85 WEST / 18 EAST split on the 44th's exact extraction,
// locate the 18 EAST cells, and probe WHERE the D98 channel classifier's
// boundary runs relative to them - artifact vs meander is the adjudication
// question. Read-only, DEM + classifier only.
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
const CELL = 10, TOL = 3.5, REACH = 30;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];
const deg = (r) => ((r * 180 / Math.PI) + 360) % 360;

const cells = [];
for (let ix = -20; ix <= 20; ix += 1) for (let iy = -20; iy <= 20; iy += 1) {
  const x = bx + ix * CELL, y = by + iy * CELL;
  const d = Math.hypot(ix * CELL, iy * CELL);
  if (d > 200) continue;
  const b = deg(Math.atan2(ix, iy));
  if (b < 45 || b > 135) continue;
  const e = terrain.elevationAtMeters(x, y);
  if (!Number.isFinite(e) || Math.abs(e - e0) > TOL) continue;
  let isEdge = false;
  for (const [dx, dy] of DIRS) {
    const en = terrain.elevationAtMeters(x + dx * REACH, y + dy * REACH);
    if (Number.isFinite(en) && en < e0 - TOL) { isEdge = true; break; }
  }
  if (isEdge) cells.push({ ix, iy, x, y, e });
}
const side = (x, y) => terrain.channelSideAtMeters?.(x, y);
const west = cells.filter((c) => side(c.x, c.y) === 'WEST');
const east = cells.filter((c) => side(c.x, c.y) === 'EAST');
const other = cells.filter((c) => !['WEST', 'EAST'].includes(side(c.x, c.y)));
console.log(`arc cells ${cells.length} | WEST ${west.length} | EAST ${east.length} | other ${other.length} ${other.length ? '(' + [...new Set(other.map((c) => side(c.x, c.y)))].join(',') + ')' : ''}`);
console.log(`\nEAST cells (offsets from bench, elevation):`);
for (const c of east.sort((l, r) => l.iy - r.iy || l.ix - r.ix)) {
  console.log(`  (${c.ix * CELL},${c.iy * CELL}) e=${c.e.toFixed(1)} (${(c.e - e0).toFixed(1)} vs e0)`);
}
// transect: walk east from bench through the arc's latitude band to find the
// classifier boundary and (proxy for the river) the elevation minimum
console.log('\nWest-to-east transects (y-offset: side flips and elevation profile every 10 m from x-offset 0 to 400):');
for (const yOff of [-20, 20, 60, 100]) {
  const flips = [];
  let prev = side(bx, by + yOff);
  let minE = Infinity, minX = null;
  for (let xo = 10; xo <= 400; xo += 10) {
    const s = side(bx + xo, by + yOff);
    if (s !== prev) { flips.push(`${xo}:${prev}->${s}`); prev = s; }
    const e = terrain.elevationAtMeters(bx + xo, by + yOff);
    if (Number.isFinite(e) && e < minE) { minE = e; minX = xo; }
  }
  console.log(`  y=${yOff}: flips [${flips.join(' ')}] | elevation min ${minE.toFixed(1)} at x-offset ${minX} (e0 ${e0.toFixed(1)})`);
}
console.error('done');
