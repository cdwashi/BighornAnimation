// Supplement: the corrected-candidate numbers for adjudication - the
// 44th's arc INTERSECTED with WEST classification (the far-bank cells
// removed). Span, continuity, min distance, per-cell count - the values
// a re-frozen pin would carry if Fable rules the convention amended.
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
  if (isEdge && terrain.channelSideAtMeters?.(x, y) === 'WEST') cells.push({ ix, iy });
}
const ys = cells.map((c) => c.iy * CELL).sort((a, b) => a - b);
const gaps = [];
const uniq = [...new Set(ys)];
for (let j = 1; j < uniq.length; j += 1) if (uniq[j] - uniq[j - 1] > 20) gaps.push(`${uniq[j - 1]}..${uniq[j]}`);
const dists = cells.map((c) => Math.hypot(c.ix * CELL, c.iy * CELL)).sort((a, b) => a - b);
console.log(`WEST-only arc: ${cells.length} cells | N-S span ${ys[0]} to ${ys[ys.length - 1]} m (${ys[ys.length - 1] - ys[0]} m) | gaps >20 m: ${gaps.length ? gaps.join(' ') : 'NONE - continuous'} | min dist ${Math.round(dists[0])} m | max dist ${Math.round(dists[dists.length - 1])} m`);
console.error('done');
