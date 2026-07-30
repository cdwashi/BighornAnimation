// Thirty-first measurement: the D81 exception's conversion ceiling,
// computed from the 27th's episode condition before the resolver exists -
// the registered upper bound for PR-36 and the load-bearing test for
// PR-31. Two figures, disclosed: NAIVE ceiling = sum of wounded-at-start
// across all 50 m cavalry-side episodes (overcounts: a unit re-enters
// episodes and each wounded man converts at most once); TIGHT ceiling =
// per (seed, unit) the MAXIMUM wounded at any episode start, summed.
// Compared per-seed and in total against the baseline's 348 dissolution
// deaths: ceiling below 348 = PR-31's fall arithmetically guaranteed
// (near-vacuous); far above = the over-kill branch is live. Read-only;
// stop honored; 45 completed seeds; 50 m ring (the planning bound).
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
const R = 50;
const m = (t) => t / 2;

let naiveTotal = 0, tightTotal = 0;
const perSeedTight = [];
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const inCond = new Set();
  const maxWounded = new Map(); // unit -> max wounded at any episode start
  let naive = 0;
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const combatants = st.units.filter((u) => {
      const src = scenario.units[u.unitIndex];
      return src.kind !== 'NONCOMBATANT_CAMP' && !u.withdrawnOffField;
    });
    for (const u of combatants) {
      const src = scenario.units[u.unitIndex];
      if (src.sideId === SIDE) continue;
      const routedAlive = u.moraleState === 'ROUTED' && u.endState !== 'DESTROYED';
      let nearest = Infinity;
      if (routedAlive) {
        for (const e of combatants) {
          if (scenario.units[e.unitIndex].sideId === src.sideId || e.endState === 'DESTROYED') continue;
          const d = Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y);
          if (d < nearest) nearest = d;
        }
      }
      const now = routedAlive && nearest <= R;
      const was = inCond.has(u.id);
      if (now && !was) {
        inCond.add(u.id);
        naive += u.wounded;
        maxWounded.set(u.id, Math.max(maxWounded.get(u.id) ?? 0, u.wounded));
      } else if (!now && was) inCond.delete(u.id);
    }
  }
  const tight = [...maxWounded.values()].reduce((a, b) => a + b, 0);
  naiveTotal += naive; tightTotal += tight;
  perSeedTight.push(tight);
  console.log(`${seed}: naive ${naive} | tight ${tight} (${[...maxWounded.entries()].map(([u, w]) => `${u}:${w}`).join(' ')})`);
}
const sorted = [...perSeedTight].sort((a, b) => a - b);
console.log('\n===== CONVERSION CEILING, 45 seeds, 50 m ring =====');
console.log(`NAIVE ceiling (sum over episodes): ${naiveTotal}`);
console.log(`TIGHT ceiling (per seed-unit max, summed): ${tightTotal}`);
console.log(`tight per seed: median ${sorted[22]} | mean ${(tightTotal / 45).toFixed(1)} | range ${sorted[0]}-${sorted[44]}`);
console.log(`baseline comparator: 348 dissolution deaths across the same 45 seeds (~7.7/seed)`);
console.log(`load-bearing verdict: tight ceiling ${tightTotal > 348 ? 'ABOVE' : 'BELOW'} 348 -> ${tightTotal > 348 ? 'over-kill branch LIVE; PR-31 is a real prediction' : "PR-31's fall arithmetically guaranteed; near-vacuous"}`);
console.error('done');
