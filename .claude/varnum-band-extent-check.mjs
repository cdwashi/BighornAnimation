// CC follow-up to varnum-band-relief-check (2026-08-02): characterize the
// in-band rising ground SW of Reno's line - connected extent, peak relief,
// and shape - so the D90 annotation can adjudicate between (A) estimate-low
// on the far summits, (B) misidentification (Varnum's foot-hills are the
// in-band rises), and (C) region-vs-point (the in-band ground is the toe of
// the same foothill mass D90 pinned at its summits). Static DEM, read-only.
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));

const [lx, ly] = terrain.toLocal(45.52577, -107.4064);
const e0 = terrain.elevationAtMeters(lx, ly); // valley floor at the line ~945.4
const CELL = 20;
const FLOOR = e0 + 5; // "rise" = >=5 m above the line's valley floor

// Grid: 1500 m west/south-west window covering the Varnum band and beyond.
// x in [-1500, 200], y in [-1500, 200] relative to line (west = -x? check:
// toLocal x grows east, y grows north; foothills are SSW => x smaller, y smaller).
const cells = new Map(); // "ix,iy" -> {x,y,e,d}
for (let ix = -75; ix <= 10; ix += 1) {
  for (let iy = -75; iy <= 10; iy += 1) {
    const x = lx + ix * CELL, y = ly + iy * CELL;
    const d = Math.hypot(ix * CELL, iy * CELL);
    if (d > 1500) continue;
    const e = terrain.elevationAtMeters(x, y);
    if (!Number.isFinite(e) || e < FLOOR) continue;
    cells.set(`${ix},${iy}`, { ix, iy, x, y, e, d });
  }
}

// Connected components (8-neighbour).
const seen = new Set();
const components = [];
for (const key of cells.keys()) {
  if (seen.has(key)) continue;
  const queue = [key];
  seen.add(key);
  const member = [];
  while (queue.length) {
    const k = queue.pop();
    member.push(cells.get(k));
    const [cx, cy] = k.split(',').map(Number);
    for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) {
      const nk = `${cx + dx},${cy + dy}`;
      if (!seen.has(nk) && cells.has(nk)) { seen.add(nk); queue.push(nk); }
    }
  }
  components.push(member);
}
components.sort((l, r) => r.length - l.length);

console.log(`line valley floor ${e0.toFixed(1)}; rise threshold ${FLOOR.toFixed(1)}; ` +
  `rise cells ${cells.size}; components ${components.length}`);
for (const comp of components.slice(0, 8)) {
  const dmin = Math.min(...comp.map((c) => c.d));
  const dmax = Math.max(...comp.map((c) => c.d));
  const emax = Math.max(...comp.map((c) => c.e));
  const peak = comp.find((c) => c.e === emax);
  const inBand = comp.filter((c) => c.d >= 732 && c.d <= 1097).length;
  const xs = comp.map((c) => c.ix * CELL), ys = comp.map((c) => c.iy * CELL);
  console.log(`component: ${comp.length} cells | distance ${dmin.toFixed(0)}-${dmax.toFixed(0)} m ` +
    `| in-band cells ${inBand} | peak ${emax.toFixed(1)} (+${(emax - e0).toFixed(1)}) at d=${peak.d.toFixed(0)} ` +
    `| extent x[${Math.min(...xs)},${Math.max(...xs)}] y[${Math.min(...ys)},${Math.max(...ys)}]`);
}
// Is the in-band ground connected to the far foothill mass? Check whether the
// largest component containing in-band cells also reaches beyond 1300 m.
const withBand = components.filter((comp) => comp.some((c) => c.d >= 732 && c.d <= 1097));
for (const comp of withBand.slice(0, 3)) {
  const reachesFar = comp.some((c) => c.d > 1300);
  console.log(`in-band component (${comp.length} cells): reaches beyond 1300 m -> ${reachesFar} ` +
    `(${reachesFar ? 'CONTIGUOUS with the far foothill mass - region reading (C) live' :
      'DETACHED low rise - separate-feature reading (B) live'})`);
}
console.error('done');
