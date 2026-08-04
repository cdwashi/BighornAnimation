// Zero-distance goal check (2026-08-02, ordered before the STEADY-shelter
// ruling drafts; read-only, no proposal). For every 0 m pair in the committed
// census (.claude/steady-shelter-probes.out.txt world): are the annihilated
// unit and its co-located broken companion at a SHARED goal/order endpoint
// (a modelling artifact of goal assignment) or did they converge
// independently? Records each unit's activeOrderId, path endpoint, and
// whether the shared coordinate coincides with a scenario landmark.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const census = (await readFile(join(REPO, '.claude/steady-shelter-probes.out.txt'), 'utf8')).split('\n');
// parse zero-pairs: "row <seed> t<tick> <unit>: ... within650=[id:STATE@0 ...]"
const pairs = [];
for (const l of census) {
  const m = l.match(/^row (\d+) t(\d+) (\S+): .*within650=\[([^\]]*)\]/);
  if (!m) continue;
  for (const e of m[4].split(' ').filter(Boolean)) {
    const [id, rest] = e.split(':');
    if (rest && rest.endsWith('@0')) pairs.push({ seed: Number(m[1]), tick: Number(m[2]), unit: m[3], companion: id });
  }
}
const landmarks = scenario.terrain.landmarks.map((l) => { const [x, y] = terrain.toLocal(l.position.lat, l.position.lon); return { id: l.id, x, y }; });
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`zero-distance pair-entries: ${pairs.length}`);
const bySeed = new Map();
for (const p of pairs) { if (!bySeed.has(p.seed)) bySeed.set(p.seed, []); bySeed.get(p.seed).push(p); }
let shared = 0, independent = 0;
for (const [seed, list] of [...bySeed.entries()].sort((a, b) => a[0] - b[0])) {
  const maxTick = Math.max(...list.map((p) => p.tick));
  const sim = createSim(scenario, { seed, terrain });
  let li = 0; const sorted = list.sort((a, b) => a.tick - b.tick);
  for (let t = 0; t <= maxTick; t += 1) {
    sim.run(t);
    while (li < sorted.length && sorted[li].tick === t) {
      const p = sorted[li]; li += 1;
      const st = sim.state();
      const a = st.units.find((u) => u.id === p.unit);
      const b = st.units.find((u) => u.id === p.companion);
      const end = (u) => u.path?.length ? u.path[u.path.length - 1] : null;
      const ea = end(a); const eb = end(b);
      const sameEnd = ea && eb && Math.hypot(ea.x - eb.x, ea.y - eb.y) < 10;
      const lm = landmarks.map((l) => ({ id: l.id, d: Math.hypot(l.x - a.position.x, l.y - a.position.y) })).sort((x, y) => x.d - y.d)[0];
      if (sameEnd) shared += 1; else independent += 1;
      log(`seed ${seed} t${t} ${p.unit}+${p.companion} @(${a.position.x.toFixed(0)},${a.position.y.toFixed(0)}): orders ${a.activeOrderId ?? '-'} / ${b.activeOrderId ?? '-'} | pathEnds ${ea ? `(${ea.x.toFixed(0)},${ea.y.toFixed(0)})` : '-'} / ${eb ? `(${eb.x.toFixed(0)},${eb.y.toFixed(0)})` : '-'} | sameEnd=${sameEnd ? 'YES' : 'no'} | nearest-landmark ${lm.id}@${lm.d.toFixed(0)}m`);
    }
  }
  console.log(`seed ${seed} done`);
}
log(`\nSHARED endpoint pairs: ${shared} | independent/none: ${independent}`);
await writeFile(join(REPO, '.claude/zero-distance-goal-check.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
