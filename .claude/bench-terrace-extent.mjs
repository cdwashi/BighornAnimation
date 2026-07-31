// FORTY-THIRD MEASUREMENT (static, DEM-only): the Bench's terrace extent
// derived from the terrain itself. Correction that motivates it: D90's
// "~60 m neighbourhood" is the TERRACE-SEARCH CRITERION (<=3.5 m relief
// across a 60 m window), not a sourced statement of the Bench's size -
// the 2,827 m2 carried through the 40th/41st arithmetic derives from a
// search parameter, not from Michno p.105 (which sources existence and
// location only). The honest extent under Fable's own principle (extent
// = sourced datum, never a capacity knob; terrain-as-source, like
// D102's derived frontage) is: the contiguous terrace the DEM actually
// contains around the D90 point, membership by D90's own relief
// tolerance, area falling where it falls.
//
// Method: flood-fill on 10 m cells, 4-connected, seeded at the bench
// local position (7364, 10517); membership |elev - elev(seed)| <= tol;
// tol 3.5 m = D90's relief bound (primary), 2.5 / 4.5 m sensitivity
// fills. The bench sits +5.5 m above the local valley floor, so the
// floor lies outside every tolerance and the downhill break bounds the
// fill - the terrace's own edge, not a drawn radius. Channel-side
// composition reported per cell; fill capped at a 6 km box (cap hit =
// criterion leak, reported not hidden). Capacity arithmetic restated
// against the 41st's true peak 708. Read-only; no sim run; no engine
// change; no prediction judged.
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
console.log(`bench local (${Math.round(bx)}, ${Math.round(by)}), elevation ${e0.toFixed(2)} m`);
const CELL = 10, CAP = 300; // 300 cells from seed in each direction = 6 km box

for (const tol of [2.5, 3.5, 4.5]) {
  const seen = new Set();
  const cells = [];
  const queue = [[Math.round(bx / CELL), Math.round(by / CELL)]];
  seen.add(queue[0].join(','));
  let capHit = false;
  const sides = new Map();
  while (queue.length) {
    const [cx, cy] = queue.pop();
    const x = cx * CELL, y = cy * CELL;
    const e = terrain.elevationAtMeters(x, y);
    if (!Number.isFinite(e) || Math.abs(e - e0) > tol) continue;
    cells.push([cx, cy]);
    const side = terrain.channelSideAtMeters?.(x, y) ?? 'UNKNOWN';
    sides.set(side, (sides.get(side) ?? 0) + 1);
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = cx + dx, ny = cy + dy;
      if (Math.abs(nx - Math.round(bx / CELL)) > CAP || Math.abs(ny - Math.round(by / CELL)) > CAP) { capHit = true; continue; }
      const key = `${nx},${ny}`;
      if (!seen.has(key)) { seen.add(key); queue.push([nx, ny]); }
    }
  }
  const area = cells.length * CELL * CELL;
  const xs = cells.map((c) => c[0]), ys = cells.map((c) => c[1]);
  const bbox = cells.length
    ? `${(Math.max(...xs) - Math.min(...xs) + 1) * CELL} x ${(Math.max(...ys) - Math.min(...ys) + 1) * CELL} m`
    : 'empty';
  const diam = Math.round(2 * Math.sqrt(area / Math.PI));
  console.log(`\ntol ${tol} m${tol === 3.5 ? ' (D90 relief bound, PRIMARY)' : ' (sensitivity)'}: ${cells.length} cells = ${area} m2 | equiv-circle diameter ${diam} m | bbox ${bbox} | sides ${[...sides.entries()].map(([s, n]) => `${s}:${n}`).join(' ')}${capHit ? ' | CAP HIT - criterion leaks, fill truncated' : ''}`);
  if (tol === 3.5) {
    console.log('  capacity vs true peak 708 (41st):');
    for (const d of [2.4, 4.57, 21, 100]) {
      const cap = Math.floor(area / d);
      console.log(`    ${d} m2/man -> capacity ${cap} ${cap >= 708 ? '- does not bind' : `- BINDS by ${708 - cap} (${Math.round(100 * (708 - cap) / 708)}% excess)`}`);
    }
  }
}
console.error('done');
