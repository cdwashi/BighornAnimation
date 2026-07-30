// Thirtieth measurement: surrounded-ness tested in the abstract - Fable's
// contingency ("if mounted/afoot fails too, back to the dynamic
// candidates") with one correction: bearing spread at episode start is a
// STATIC query, testable on the same harness. At each cavalry-side episode
// start (27th's condition): bearings from the routed unit to every living
// enemy combatant within 250 m (interdiction radius, structural reuse);
// LARGEST ANGULAR GAP = the open arc a fleeing unit could run through.
// Keogh "died in one compact mass" (surrounded, no arc); Reno's crossers
// had a clear rear. No threshold invented: the gap distribution is
// reported BY FATE, and the split at three candidate cuts (90/120/180
// degrees) so the data shows whether and where it discriminates. Fate
// tracking as in the 29th. Read-only; stop honored; 45 seeds.
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
const NEAR = 250;
const m = (t) => t / 2;

const episodes = { 25: [], 50: [] };
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
      if (src.sideId === SIDE) continue;
      const routedAlive = u.moraleState === 'ROUTED' && u.endState !== 'DESTROYED';
      let nearestD = Infinity;
      const nearEnemies = [];
      if (routedAlive) {
        for (const e of combatants) {
          if (scenario.units[e.unitIndex].sideId === src.sideId || e.endState === 'DESTROYED') continue;
          const d = Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y);
          if (d < nearestD) nearestD = d;
          if (d <= NEAR) nearEnemies.push(e);
        }
      }
      for (const r of RADII) {
        const now = routedAlive && nearestD <= r;
        const was = inCond[r].has(u.id);
        if (now && !was) {
          inCond[r].add(u.id);
          const bearings = nearEnemies.map((e) => Math.atan2(e.position.y - u.position.y, e.position.x - u.position.x))
            .sort((a, b) => a - b);
          let largestGap = 360;
          if (bearings.length >= 1) {
            largestGap = 0;
            for (let i = 0; i < bearings.length; i += 1) {
              const next = i + 1 < bearings.length ? bearings[i + 1] : bearings[0] + 2 * Math.PI;
              largestGap = Math.max(largestGap, (next - bearings[i]) * 180 / Math.PI);
            }
          }
          thisSeed[r].push({ seed, unit: u.id, start: m(tick), gap: largestGap, nEnemies: nearEnemies.length, wounded: u.wounded });
        } else if (!now && was) inCond[r].delete(u.id);
      }
    }
  }
  const st = sim.state();
  for (const r of RADII) for (const ep of thisSeed[r]) {
    const u = st.units.find((x) => x.id === ep.unit);
    ep.fate = u?.endState === 'DESTROYED' ? 'DESTROYED' : 'survived';
    episodes[r].push(ep);
  }
  console.log(`${seed}: done`);
}
const q = (list, p) => { const s = [...list].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
for (const r of RADII) {
  const eps = episodes[r];
  const dead = eps.filter((e) => e.fate === 'DESTROYED');
  const live = eps.filter((e) => e.fate === 'survived');
  console.log(`\n===== radius ${r} m, cavalry episodes ${eps.length} (${dead.length} destroyed-unit / ${live.length} survived-unit) =====`);
  const g = (l) => `p25 ${Math.round(q(l.map((e) => e.gap), 0.25))} med ${Math.round(q(l.map((e) => e.gap), 0.5))} p75 ${Math.round(q(l.map((e) => e.gap), 0.75))}`;
  console.log(`LARGEST-GAP (deg) by fate: destroyed-unit episodes ${g(dead)} | survived-unit episodes ${g(live)}`);
  for (const cut of [90, 120, 180]) {
    const sur = eps.filter((e) => e.gap < cut);
    const open = eps.filter((e) => e.gap >= cut);
    const cell = (l) => `${l.filter((e) => e.fate === 'DESTROYED').length}D/${l.filter((e) => e.fate === 'survived').length}S`;
    console.log(`cut ${cut}: SURROUNDED ${sur.length} (${cell(sur)}) | OPEN-ARC ${open.length} (${cell(open)}) | wounded in surrounded ${sur.reduce((s, e) => s + e.wounded, 0)}`);
  }
  console.log(`enemies-within-250m at episode start: med ${q(eps.map((e) => e.nEnemies), 0.5)} max ${Math.max(0, ...eps.map((e) => e.nEnemies))}`);
}
console.error('done');
