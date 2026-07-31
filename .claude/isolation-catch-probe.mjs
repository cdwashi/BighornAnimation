// Thirty-seventh measurement: classify all caught-while-routed break-bouts
// by ISOLATION at the catch - is any STEADY friendly combat unit within
// isolationRadiusMeters (650, the existing [CAL] morale-isolation radius,
// structural reuse)? Candidate scope refinement for the wing-finisher,
// registered before this data: annihilation-on-catch resolves only for
// ISOLATED fragments. Expresses the record's own distinction - caught
// alone is finished (Deep Ravine, Keogh's compact mass); caught near your
// rallying mass is mauled but not erased (Reno's crossers under the
// hilltop garrison) - with no new number and rally-on-junction's geometry
// arriving as scope instead of mechanism. The test, pre-stated: the 5
// east-side Reno breach catches (seeds 18760618/647) should classify
// NON-ISOLATED (near the garrison) and the wing's 203 should classify
// overwhelmingly ISOLATED; anything else and this refinement dies like
// the other thirteen. 50 seeds, committed D106 tree, read-only.
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
const ISO = 650;
const m = (t) => t / 2;

const catches = [];
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
      const sideId = scenario.units[d.unitIndex].sideId;
      let isolated = true;
      for (const f of st.units) {
        if (f.id === d.id || f.endState || f.withdrawnOffField) continue;
        const src = scenario.units[f.unitIndex];
        if (src.sideId !== sideId || src.kind === 'NONCOMBATANT_CAMP') continue;
        if (f.moraleState !== 'STEADY') continue;
        if (Math.hypot(f.position.x - d.position.x, f.position.y - d.position.y) <= ISO) { isolated = false; break; }
      }
      const cls = RENO.has(e.targetUnitId) ? 'RENO' : WING.has(e.targetUnitId) ? 'WING' : 'other';
      catches.push({ seed, target: e.targetUnitId, min: m(e.tick), cls, isolated });
    }
    prevRouted = new Set(st.units.filter((u) => u.moraleState === 'ROUTED' && !u.endState).map((u) => u.id));
  }
  if (seed % 10 === 9) console.log(`through ${seed}`);
}
console.log(`\n===== isolation classification of ${catches.length} catches =====`);
for (const cls of ['WING', 'RENO', 'other']) {
  const set = catches.filter((c) => c.cls === cls);
  if (!set.length) { console.log(`${cls}: none`); continue; }
  const iso = set.filter((c) => c.isolated).length;
  console.log(`${cls}: ${set.length} catches | ISOLATED ${iso} (${(100 * iso / set.length).toFixed(1)}%) | non-isolated ${set.length - iso}`);
}
console.log(`\nthe 9 Reno catches, individually:`);
for (const c of catches.filter((x) => x.cls === 'RENO')) console.log(`  ${c.seed} ${c.target} @${c.min}: ${c.isolated ? 'ISOLATED' : 'non-isolated'}`);
console.log(`\nWING non-isolated detail (the refinement's blind spot if populated):`);
const wni = catches.filter((c) => c.cls === 'WING' && !c.isolated);
const byUnit = new Map();
for (const c of wni) byUnit.set(c.target, (byUnit.get(c.target) ?? 0) + 1);
console.log(`  ${wni.length} catches: ${[...byUnit.entries()].map(([u, n]) => `${u}:${n}`).join(' ') || 'none'}`);
console.error('done');
