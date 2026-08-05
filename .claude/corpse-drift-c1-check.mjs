// Corpse-drift C2b completion (2026-08-04): quantify the C1 checkpoint
// exposure found by the score.ts dated read (f6bfce9). scoreCheckpoints
// (score.ts:38-73) scans the WHOLE track, nearest-by-distance, no endState
// filter. The one re-arm in the committed world is co-m, seed 18760647,
// dead at t1497 and mobile from t1510. This probe replicates the scan
// convention for every checkpoint referencing co-m, twice: over the full
// track, and over the track truncated at the death tick - the difference
// IS the drift's contamination of C1, measured. Read-only; current stream.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const seed = 18760647, DEATH = 1497;
const cps = scenario.checkpoints.map((c, i) => ({ ...c, index: i })).filter((c) => c.unitId === 'co-m');
log(`checkpoints referencing co-m: ${cps.length ? cps.map((c) => `${c.id}@min${c.minute} tol ${c.toleranceMeters}m/${c.toleranceMinutes}min`).join(' | ') : 'NONE'}`);
if (cps.length) {
  const sim = createSim(scenario, { seed, terrain });
  for (let t = 0; t <= 2160; t += 1) sim.run(t);
  const idx = scenario.units.findIndex((u) => u.id === 'co-m');
  const track = sim.tracks()[idx];
  const cpPos = (c) => {
    const p = c.position;
    if (!('ring' in p)) { const [x, y] = terrain.toLocal(p.lat, p.lon); return { x, y }; }
    const pts = p.ring.map((q) => terrain.toLocal(q.lat, q.lon));
    return { x: pts.reduce((s, [x]) => s + x, 0) / pts.length, y: pts.reduce((s, [, y]) => s + y, 0) / pts.length };
  };
  const scan = (samples, c) => {
    const target = cpPos(c);
    let best = null;
    for (const s of samples) {
      const d = Math.hypot(s.x - target.x, s.y - target.y);
      if (!best || d < best.d) best = { d, tick: s.tick };
    }
    if (!best) return null;
    const minute = best.tick * scenario.clock.tickSeconds / 60;
    return { d: best.d, minute, hit: best.d <= c.toleranceMeters && Math.abs(minute - c.minute) <= c.toleranceMinutes };
  };
  for (const c of cps) {
    const full = scan(track, c);
    const trunc = scan(track.filter((s) => s.tick <= DEATH), c);
    log(`${c.id}: FULL track -> ${full.d.toFixed(1)}m @min${full.minute.toFixed(1)} hit=${full.hit} | TRUNCATED at death -> ${trunc.d.toFixed(1)}m @min${trunc.minute.toFixed(1)} hit=${trunc.hit} ${full.hit !== trunc.hit ? '*** VERDICT DIFFERS - C1 CONTAMINATED ***' : full.d.toFixed(1) !== trunc.d.toFixed(1) ? '(distance differs, verdict same)' : '(identical)'}`);
  }
} else {
  log('co-m carries no checkpoints: the unfiltered C1 scan has NOTHING to read from the drift in the');
  log('committed world - the exposure is structural, not realized. The defect stands; the blast');
  log('radius on committed figures remains zero through C1 as well.');
}
await writeFile(join(REPO, '.claude/corpse-drift-c1-check.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
