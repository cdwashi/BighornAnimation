// Twenty-sixth measurement: pursuit permitted to reach the melee channel,
// all 45 completed WO-D104 seeds. Operationalization, disclosed (two
// coupled halves, both structural reuse, both for the ruling to make
// properly): (i) COMBAT-pursuit movement standoff becomes meleeRangeMeters
// (25) instead of pursuitCloseRangeMeters (50) - the pursuer may actually
// arrive; (ii) resolveShock's attacker selection accepts a COMBAT pursuer
// of the other party when no CHARGE-postured attacker exists - D65 shock
// formula unchanged. Corrected premise on the record: determineState
// already lets MELEE outrank PURSUIT (engagement.ts:58); the blockers were
// the 50 m standoff parking pursuers at 2x melee range, and shock's
// CHARGE-only attacker selection. Reported per Fable's order: killed
// distribution, seeds above 60, dissolution deaths, ford choke, and
// whether D65 shock resolves at the bank. Stop honored: completed seeds
// only. Dist toggles only, restored byte-identical afterward.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__meleeClose = true;
globalThis.__shockLog = [];
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const lm = (id) => { const l = landmarks.find((x) => x.id === id); const [x, y] = terrain.toLocal(l.position.lat, l.position.lon); return { x, y }; };
const fordA = lm('ford-a');
const RENO = ['co-a', 'co-g', 'co-m'];
const SIDE = 'lakota-cheyenne-coalition';
const m = (t) => t / 2;

const killedPerSeed = [];
let fireTotal = 0, dissolutionTotal = 0, chokeTotal = 0, renoDestructions = 0;
let shockEventsTotal = 0, shockNearFordTotal = 0;
const perSeedShock = [];
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  globalThis.__shockLog.length = 0;
  const sim = createSim(scenario, { seed, terrain });
  sim.run(2160);
  const st = sim.state();
  const events = sim.events();
  let killed = 0, fire = 0;
  const line = [];
  for (const id of RENO) {
    const u = st.units.find((x) => x.id === id);
    const f = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id)
      .reduce((s, e) => s + (e.killed ?? 0), 0);
    killed += u.killed; fire += f;
    if (u.endState === 'DESTROYED') renoDestructions += 1;
    line.push(`${id} k${u.killed}=f${f}+d${Math.max(0, u.killed - f)}${u.endState ? '/DEST' : ''}`);
  }
  const choke = events.filter((e) => e.type === 'casualty-resolution' && e.position &&
    Math.hypot(e.position.x - fordA.x, e.position.y - fordA.y) <= 250).length;
  const shocks = globalThis.__shockLog.length;
  // shock-at-the-bank: pursuit-selected shock attacker within 400 m of ford-a
  let shocksNearFord = 0;
  for (const s of globalThis.__shockLog) {
    const a = st.units.find((x) => x.id === s.attacker);
    if (a && Math.hypot(a.position.x - fordA.x, a.position.y - fordA.y) <= 400) shocksNearFord += 1;
  }
  shockEventsTotal += shocks; shockNearFordTotal += shocksNearFord;
  killedPerSeed.push(killed);
  fireTotal += fire; dissolutionTotal += Math.max(0, killed - fire); chokeTotal += choke;
  perSeedShock.push(shocks);
  console.log(`${seed}: total ${killed} | ${line.join(' | ')} | choke ${choke} | pursuit-shock ticks ${shocks}`);
}
const sorted = [...killedPerSeed].sort((a, b) => a - b);
console.log('\n===== AGGREGATE, melee-close alone, 45 seeds =====');
console.log(`Reno killed: median ${sorted[22]} | mean ${(killedPerSeed.reduce((a, b) => a + b) / 45).toFixed(1)} | range ${sorted[0]}-${sorted[44]}`);
console.log(`seeds above 60: ${killedPerSeed.filter((k) => k > 60).length} | >= 100: ${killedPerSeed.filter((k) => k >= 100).length} | above band 26.09: ${killedPerSeed.filter((k) => k > 26.09).length}`);
console.log(`Reno deaths: FIRE ${fireTotal} | DISSOLUTION ${dissolutionTotal}`);
console.log(`Reno company destructions: ${renoDestructions}`);
console.log(`ford-choke casualty events total: ${chokeTotal}`);
console.log(`pursuit-selected shock ticks: total ${shockEventsTotal}, attacker within 400 m of ford-a at end-of-day check: ${shockNearFordTotal}`);
console.log(`seeds with any pursuit-shock: ${perSeedShock.filter((s) => s > 0).length}/45`);
console.log(`sorted killed: ${sorted.join(',')}`);
console.error('done');
