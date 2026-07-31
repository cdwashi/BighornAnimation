// Thirty-seventh measurement, which-friendly supplement (Fable's caution:
// a STEADY friendly within 650 m is a state, not a fact about protection).
// For every NON-ISOLATED caught-while-routed break-bout: the identity and
// distance of every STEADY friendly within isolationRadiusMeters at the
// catch. Determines whether the five east-side Reno catches are sheltered
// by BENTEEN'S GARRISON (sound - right answer for the right reason) or by
// incidental fragments (the escape-availability failure again), and - the
// mirror CC added - who shelters the 61 non-isolated WING catches
// (sister companies mid-rout-cascade? co-d? the garrison?). 50 seeds,
// committed D106 tree, read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WING = new Set(['co-c', 'co-e', 'co-f', 'co-i', 'co-l']);
const BENTEEN = new Set(['co-h', 'co-d', 'co-k', 'pack-train']);
const ISO = 650;
const m = (t) => t / 2;

const shelterCounts = { RENO: new Map(), WING: new Map() };
const renoDetail = [];
let wingBySisters = 0, wingByGarrison = 0, wingByMixed = 0, wingNonIso = 0;
for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  let evCursor = 0;
  let prevRouted = new Set();
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type !== 'melee-bout' || e.outcome !== 'break') continue;
      if (!prevRouted.has(e.targetUnitId)) continue;
      const d = byId.get(e.targetUnitId);
      if (!d) continue;
      const cls = RENO.has(e.targetUnitId) ? 'RENO' : WING.has(e.targetUnitId) ? 'WING' : null;
      if (!cls) continue;
      const sideId = scenario.units[d.unitIndex].sideId;
      const shelters = [];
      for (const f of st.units) {
        if (f.id === d.id || f.endState || f.withdrawnOffField) continue;
        const src = scenario.units[f.unitIndex];
        if (src.sideId !== sideId || src.kind === 'NONCOMBATANT_CAMP') continue;
        if (f.moraleState !== 'STEADY') continue;
        const dist = Math.hypot(f.position.x - d.position.x, f.position.y - d.position.y);
        if (dist <= ISO) shelters.push({ id: f.id, dist: Math.round(dist) });
      }
      if (!shelters.length) continue; // isolated - not this pass's subject
      shelters.sort((l, r) => l.dist - r.dist);
      for (const s of shelters) shelterCounts[cls].set(s.id, (shelterCounts[cls].get(s.id) ?? 0) + 1);
      if (cls === 'RENO') renoDetail.push({ seed, target: e.targetUnitId, min: m(e.tick), shelters });
      else {
        wingNonIso += 1;
        const g = shelters.some((s) => BENTEEN.has(s.id));
        const w = shelters.some((s) => WING.has(s.id));
        if (g && w) wingByMixed += 1; else if (g) wingByGarrison += 1; else if (w) wingBySisters += 1;
      }
    }
    prevRouted = new Set(st.units.filter((u) => u.moraleState === 'ROUTED' && !u.endState).map((u) => u.id));
  }
  if (seed % 10 === 9) console.log(`through ${seed}`);
}
console.log(`\n===== which-friendly, non-isolated catches =====`);
console.log(`RENO non-isolated catches, individually:`);
for (const r of renoDetail) console.log(`  ${r.seed} ${r.target} @${r.min}: sheltered by ${r.shelters.map((s) => `${s.id}@${s.dist}m`).join(', ')}`);
console.log(`\nWING non-isolated ${wingNonIso}: by SISTER-WING only ${wingBySisters} | by GARRISON only ${wingByGarrison} | mixed ${wingByMixed}`);
console.log(`WING shelterer frequency: ${[...shelterCounts.WING.entries()].sort((l, r) => r[1] - l[1]).map(([u, n]) => `${u}:${n}`).join(' ')}`);
console.error('done');
