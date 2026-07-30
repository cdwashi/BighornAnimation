// Twenty-seventh measurement: bound the closing-event resolver's firing
// frequency before its internals exist. Across the 45 completed WO-D104
// seeds: how often does a unit reach ROUTED while an enemy stands within
// melee range, how long does the condition persist, and how much WOUNDED
// strength is present at those moments (the pool the D81 exception would
// convert)? Two radii, disclosed: 25 m (meleeRangeMeters - the literal
// melee condition under current movement) and 50 m (pursuitCloseRangeMeters
// - the standoff ring where pursuers actually park; upper-bound proxy for a
// world where closing is enabled). Both sides counted, never merged.
// Read-only on the committed halted tree; stop honored (completed seeds
// only).
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

const episodes = { 25: [], 50: [] }; // {seed, unit, side, start, dur, woundedAtStart, strengthAtStart, destroyedDuring}
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const open = { 25: new Map(), 50: new Map() };
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const combatants = st.units.filter((u) => {
      const src = scenario.units[u.unitIndex];
      return src.kind !== 'NONCOMBATANT_CAMP' && !u.withdrawnOffField;
    });
    for (const u of combatants) {
      const src = scenario.units[u.unitIndex];
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
        const inCond = routedAlive && nearest <= r;
        const cur = open[r].get(u.id);
        if (inCond && !cur) {
          open[r].set(u.id, { seed, unit: u.id, side: src.sideId === SIDE ? 'coalition' : 'cavalry', start: m(tick), dur: 0.5, woundedAtStart: u.wounded, strengthAtStart: u.strengthCurrent, destroyedDuring: false });
        } else if (inCond && cur) {
          cur.dur += 0.5;
        } else if (!inCond && cur) {
          episodes[r].push(cur); open[r].delete(u.id);
        }
      }
      // destruction during an open episode
      if (u.endState === 'DESTROYED') {
        for (const r of RADII) {
          const cur = open[r].get(u.id);
          if (cur) { cur.destroyedDuring = true; episodes[r].push(cur); open[r].delete(u.id); }
        }
      }
    }
  }
  for (const r of RADII) for (const cur of open[r].values()) episodes[r].push(cur);
  console.log(`${seed}: episodes@25m ${episodes[25].filter((e) => e.seed === seed).length} | @50m ${episodes[50].filter((e) => e.seed === seed).length}`);
}
for (const r of RADII) {
  const eps = episodes[r];
  const cav = eps.filter((e) => e.side === 'cavalry');
  const coa = eps.filter((e) => e.side === 'coalition');
  const durs = eps.map((e) => e.dur).sort((a, b) => a - b);
  const wounded = eps.map((e) => e.woundedAtStart);
  console.log(`\n===== radius ${r} m =====`);
  console.log(`episodes total ${eps.length} | cavalry-unit episodes ${cav.length} | coalition-unit episodes ${coa.length}`);
  console.log(`seeds with >=1 episode: ${new Set(eps.map((e) => e.seed)).size}/45`);
  console.log(`duration min: median ${durs.length ? durs[Math.floor(durs.length / 2)] : 0} | mean ${(durs.reduce((a, b) => a + b, 0) / Math.max(1, durs.length)).toFixed(1)} | max ${durs[durs.length - 1] ?? 0}`);
  console.log(`ended in destruction during episode: ${eps.filter((e) => e.destroyedDuring).length}`);
  console.log(`WOUNDED at episode start: total ${wounded.reduce((a, b) => a + b, 0)} | median ${wounded.length ? [...wounded].sort((a, b) => a - b)[Math.floor(wounded.length / 2)] : 0} | max ${Math.max(0, ...wounded)}`);
  console.log(`strength at episode start: median ${eps.length ? eps.map((e) => e.strengthAtStart).sort((a, b) => a - b)[Math.floor(eps.length / 2)] : 0}`);
  const byUnit = new Map();
  for (const e of eps) byUnit.set(e.unit, (byUnit.get(e.unit) ?? 0) + 1);
  console.log(`by unit: ${[...byUnit.entries()].sort((l, r2) => r2[1] - l[1]).map(([u, n]) => `${u}:${n}`).join(' ')}`);
}
console.error('done');
