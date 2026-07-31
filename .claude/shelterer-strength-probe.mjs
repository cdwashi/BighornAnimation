// Thirty-eighth measurement: the shelterer strength distribution, settling
// the formed-vs-merely-STEADY softness before the D107 freeze. For every
// non-isolated caught-while-routed break-bout (corrected filter: eligible
// shelterer = same-side combat unit, STEADY, not destroyed, not withdrawn),
// every shelterer's strengthCurrent, strengthTotal, and ratio. The
// question: are shelterers overwhelmingly near-full formed units (softness
// disclosed and harmless - STEADY is a sufficient proxy in practice) or is
// there a weak tail (a wing core spared by something that isn't rallying
// mass - known before dispatch, not after)? No threshold invented: raw
// per-case listing plus the distribution. 50 seeds, committed D106 tree,
// read-only.
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

const cases = [];
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
        if (dist <= ISO) shelters.push({
          id: f.id, dist: Math.round(dist),
          strength: f.strengthCurrent, total: f.strengthTotal,
          ratio: (f.strengthCurrent / f.strengthTotal),
        });
      }
      if (!shelters.length) continue;
      cases.push({ seed, cls, target: e.targetUnitId, min: m(e.tick), shelters });
    }
    prevRouted = new Set(st.units.filter((u) => u.moraleState === 'ROUTED' && !u.endState).map((u) => u.id));
  }
}
console.log(`===== shelterer strength, ${cases.length} non-isolated catches =====`);
for (const c of cases) {
  console.log(`${c.seed} ${c.cls} ${c.target} @${c.min}: ${c.shelters.map((s) => `${s.id}@${s.dist}m s${s.strength}/${s.total} (${(100 * s.ratio).toFixed(0)}%)`).join(', ')}`);
}
const all = cases.flatMap((c) => c.shelters);
const ratios = all.map((s) => s.ratio).sort((a, b) => a - b);
console.log(`\nshelterer instances ${all.length}: ratio min ${(100 * ratios[0]).toFixed(0)}% | median ${(100 * ratios[Math.floor(ratios.length / 2)]).toFixed(0)}% | max ${(100 * ratios[ratios.length - 1]).toFixed(0)}%`);
console.log(`strength min ${Math.min(...all.map((s) => s.strength))} | median ${[...all.map((s) => s.strength)].sort((a, b) => a - b)[Math.floor(all.length / 2)]} | max ${Math.max(...all.map((s) => s.strength))}`);
console.error('done');
