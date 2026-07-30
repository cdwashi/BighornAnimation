// Twenty-ninth measurement: the mounted/afoot discriminator tested in the
// abstract before anyone proposes it. Same episode condition as the 27th
// (ROUTED with enemy within radius, both radii, 45 completed seeds), plus:
// (1) the unit's mounted flag at episode start; (2) the decisive part -
// whether the outcomes it would produce TRACK THE HISTORICAL CASES: do
// episodes of units that end the day DESTROYED sort to afoot, and episodes
// of units that survive sort to mounted? Cross-tab per radius, plus the
// named units (co-a/co-g death seeds, co-m survivals, the wing). The trap
// Fable named is live: if cavalry fragments are overwhelmingly mounted at
// episode start, the split collapses toward flight again and the
// discriminator is degenerate in the other direction. Read-only; stop
// honored.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const RADII = [25, 50];
const m = (t) => t / 2;

const episodes = { 25: [], 50: [] }; // {seed, unit, start, mounted, wounded, fate (filled at seed end)}
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const inCond = { 25: new Set(), 50: new Set() };
  const thisSeed = { 25: [], 50: [] };
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const combatants = st.units.filter((u) => {
      const src = scenario.units[u.unitIndex];
      return src.kind !== 'NONCOMBATANT_CAMP' && !u.withdrawnOffField;
    });
    for (const u of combatants) {
      const src = scenario.units[u.unitIndex];
      if (src.sideId === SIDE) continue; // cavalry-side episodes only (219:2 asymmetry)
      const routedAlive = u.moraleState === 'ROUTED' && u.endState !== 'DESTROYED';
      let nearest = Infinity;
      if (routedAlive) {
        for (const e of combatants) {
          if (scenario.units[e.unitIndex].sideId === src.sideId || e.endState === 'DESTROYED') continue;
          const d = Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y);
          if (d < nearest) nearest = d;
        }
      }
      for (const r of RADII) {
        const now = routedAlive && nearest <= r;
        const was = inCond[r].has(u.id);
        if (now && !was) {
          inCond[r].add(u.id);
          thisSeed[r].push({ seed, unit: u.id, start: m(tick), mounted: !!u.mounted, wounded: u.wounded });
        } else if (!now && was) inCond[r].delete(u.id);
      }
    }
  }
  const st = sim.state();
  for (const r of RADII) {
    for (const ep of thisSeed[r]) {
      const u = st.units.find((x) => x.id === ep.unit);
      ep.fate = u?.endState === 'DESTROYED' ? 'DESTROYED' : 'survived';
      episodes[r].push(ep);
    }
  }
  console.log(`${seed}: done`);
}
for (const r of RADII) {
  const eps = episodes[r];
  const mt = eps.filter((e) => e.mounted), ft = eps.filter((e) => !e.mounted);
  console.log(`\n===== radius ${r} m, cavalry episodes ${eps.length} =====`);
  console.log(`SPLIT AT EPISODE START: MOUNTED ${mt.length} (${(100 * mt.length / Math.max(1, eps.length)).toFixed(1)}%) | AFOOT ${ft.length} (${(100 * ft.length / Math.max(1, eps.length)).toFixed(1)}%)`);
  const cell = (list) => `${list.filter((e) => e.fate === 'DESTROYED').length} destroyed / ${list.filter((e) => e.fate === 'survived').length} survived`;
  console.log(`FATE TRACKING: mounted episodes -> ${cell(mt)} | afoot episodes -> ${cell(ft)}`);
  const wm = mt.reduce((s, e) => s + e.wounded, 0), wf = ft.reduce((s, e) => s + e.wounded, 0);
  console.log(`wounded pool: mounted-episodes total ${wm} | afoot-episodes total ${wf}`);
  const byUnit = new Map();
  for (const e of eps) {
    const k = `${e.unit}|${e.mounted ? 'MTD' : 'FOOT'}|${e.fate}`;
    byUnit.set(k, (byUnit.get(k) ?? 0) + 1);
  }
  console.log('unit | status-at-episode | end fate | count:');
  for (const [k, v] of [...byUnit.entries()].sort()) console.log(`  ${k.replaceAll('|', ' | ')} : ${v}`);
}
console.error('done');
