// FORTY-FOURTH MEASUREMENT: the lip, traced. Fable's gate on the
// reframe ("measure the lip first... If it's a clean 200-400 m arc
// facing Reno's line, extent-as-goal-geometry has a referent. If it's
// ragged or short, the reframe needs the same scrutiny the last one
// didn't get.") The 43rd found one physical edge - the eastward
// downhill break at 85-100 m - by 16-ray sampling; this pass extracts
// the edge as a SET OF CELLS and reports what a goal-geometry ruling
// would actually inherit: continuity, length, distance band, facing,
// and what lies below the drop.
//
// Method (static, DEM-only, D107 world 2e66baa): 10 m grid over a
// +/-800 m box around the bench point (7364, 10517). SHELF cell:
// |elev - e0| <= 3.5 m (D90's relief bound; absolute-vs-local gradient
// error over an 800 m box is small - disclosed, checked by reporting
// elevation drift across the shelf set). EDGE cell: shelf cell with
// any of 8 neighbors AT 30 M whose elevation sits > 3.5 m BELOW e0
// (the downhill break; 30 m outward reach matches the 43rd's break
// sharpness). Components by 8-connectivity on adjacent grid cells.
// Per component: cell count, distance-to-bench band, bearing span
// around the bench, facing (mean bearing of the dropping direction),
// channel side of the ground below the drop, and a chain-length
// estimate. Gaps along the eastward arc reported explicitly.
// Read-only. No sim. No engine change. No prediction judged.
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
const CELL = 10, HALF = 80; // +/-800 m box
const TOL = 3.5, REACH = 30;
const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]];

const shelf = new Set();
const elevs = [];
for (let ix = -HALF; ix <= HALF; ix += 1) for (let iy = -HALF; iy <= HALF; iy += 1) {
  const e = terrain.elevationAtMeters(bx + ix * CELL, by + iy * CELL);
  if (Number.isFinite(e) && Math.abs(e - e0) <= TOL) { shelf.add(`${ix},${iy}`); elevs.push(e); }
}
const edge = new Map(); // key -> {ix, iy, dropBearings: []}
for (const key of shelf) {
  const [ix, iy] = key.split(',').map(Number);
  const drops = [];
  for (const [dx, dy] of DIRS) {
    const e = terrain.elevationAtMeters(bx + ix * CELL + dx * REACH, by + iy * CELL + dy * REACH);
    if (Number.isFinite(e) && e < e0 - TOL) drops.push(Math.atan2(dx, dy));
  }
  if (drops.length) edge.set(key, { ix, iy, drops });
}
console.log(`bench (${Math.round(bx)}, ${Math.round(by)}) e0 ${e0.toFixed(2)} m | box +/-${HALF * CELL} m | shelf cells ${shelf.size} (elev drift min ${Math.min(...elevs).toFixed(1)} max ${Math.max(...elevs).toFixed(1)}) | edge cells ${edge.size}`);

// components
const seen = new Set();
const comps = [];
for (const key of edge.keys()) {
  if (seen.has(key)) continue;
  const comp = [];
  const stack = [key];
  seen.add(key);
  while (stack.length) {
    const k = stack.pop();
    comp.push(k);
    const [ix, iy] = k.split(',').map(Number);
    for (const [dx, dy] of DIRS) {
      const nk = `${ix + dx},${iy + dy}`;
      if (edge.has(nk) && !seen.has(nk)) { seen.add(nk); stack.push(nk); }
    }
  }
  comps.push(comp);
}
comps.sort((l, r) => r.length - l.length);
const deg = (rad) => ((rad * 180 / Math.PI) + 360) % 360;
console.log(`\ncomponents: ${comps.length}`);
console.log('| # | cells | length est (m) | dist-to-bench min/med/max (m) | bearing span from bench (deg) | facing (mean drop bearing, deg) | ground below drop: side |');
console.log('|---:|---:|---:|---|---|---:|---|');
comps.slice(0, 8).forEach((comp, i) => {
  const cells = comp.map((k) => k.split(',').map(Number));
  const dists = cells.map(([ix, iy]) => Math.hypot(ix * CELL, iy * CELL)).sort((a, b) => a - b);
  const bearings = cells.map(([ix, iy]) => deg(Math.atan2(ix, iy))).sort((a, b) => a - b);
  // bearing span via largest gap complement (circular)
  let maxGap = 360 - (bearings[bearings.length - 1] - bearings[0]);
  for (let j = 1; j < bearings.length; j += 1) maxGap = Math.max(maxGap, bearings[j] - bearings[j - 1]);
  const span = Math.round(360 - maxGap);
  const facing = [];
  const belowSides = new Map();
  for (const k of comp) {
    const c = edge.get(k);
    for (const b of c.drops) facing.push(b);
    const mean = Math.atan2(
      c.drops.reduce((a, b) => a + Math.sin(b), 0), c.drops.reduce((a, b) => a + Math.cos(b), 0));
    const lx = bx + c.ix * CELL + Math.sin(mean) * (REACH + 20), ly = by + c.iy * CELL + Math.cos(mean) * (REACH + 20);
    const s = terrain.channelSideAtMeters?.(lx, ly) ?? 'UNKNOWN';
    belowSides.set(s, (belowSides.get(s) ?? 0) + 1);
  }
  const meanFacing = deg(Math.atan2(
    facing.reduce((a, b) => a + Math.sin(b), 0), facing.reduce((a, b) => a + Math.cos(b), 0)));
  // chain length: cells arranged linearly -> ~count * 10 m upper; use bbox diagonal as second estimate
  const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
  const diag = Math.round(Math.hypot((Math.max(...xs) - Math.min(...xs)) * CELL, (Math.max(...ys) - Math.min(...ys)) * CELL));
  const q = (p) => Math.round(dists[Math.min(dists.length - 1, Math.floor(p * dists.length))]);
  console.log(`| ${i + 1} | ${comp.length} | ~${Math.min(comp.length * CELL, diag + CELL)}-${comp.length * CELL} | ${q(0)}/${q(0.5)}/${q(0.99)} | ${span} | ${Math.round(meanFacing)} | ${[...belowSides.entries()].sort((l, r) => r[1] - l[1]).map(([s, n]) => `${s}:${n}`).join(' ')} |`);
});

// the eastward arc specifically: edge cells with bearing 45-135 within 200 m
const eastArc = [...edge.values()].filter((c) => {
  const b = deg(Math.atan2(c.ix, c.iy));
  return b >= 45 && b <= 135 && Math.hypot(c.ix * CELL, c.iy * CELL) <= 200;
});
console.log(`\nEASTWARD ARC (bearing 45-135, within 200 m of bench): ${eastArc.length} edge cells`);
if (eastArc.length) {
  const ys2 = eastArc.map((c) => c.iy * CELL).sort((a, b) => a - b);
  const gaps = [];
  for (let j = 1; j < ys2.length; j += 1) if (ys2[j] - ys2[j - 1] > 20) gaps.push(`${ys2[j - 1]}..${ys2[j]}`);
  console.log(`  north-south extent ${ys2[0]} to ${ys2[ys2.length - 1]} m (span ${ys2[ys2.length - 1] - ys2[0]} m) | gaps >20 m along N-S: ${gaps.length ? gaps.join(' ') : 'NONE - continuous'}`);
}
console.error('done');
