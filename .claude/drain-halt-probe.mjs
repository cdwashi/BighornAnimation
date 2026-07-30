// Twenty-fourth measurement: out-of-contact drain halt ALONE, all 45
// completed WO-D104 seeds. Operationalization, disclosed: routCohesionDrain
// applies only while the routed unit has an ACTIVE D63 engagement
// (structural reuse of the existing contact machinery; the ruling gets to
// define "contact" - this is the measurement's reading). No rally
// mechanism added. Reported per Fable's order: killed distribution, seeds
// above 60, company destructions, remaining dissolution. Completed seeds
// only - the stop stays honored. Dist toggle only, restored byte-identical.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__drainHalt = true;
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const SIDE = 'lakota-cheyenne-coalition';

const killedPerSeed = [];
const firePerSeed = [];
let destructions = 0, dissolutionTotal = 0, fireTotal = 0;
const destroyedList = [];
let coalitionBandDestructions = 0;
for (let seed = 18760600; seed <= 18760644; seed += 1) {
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
    if (u.endState === 'DESTROYED') { destructions += 1; destroyedList.push(`${seed}:${id}`); }
    line.push(`${id} k${u.killed}=f${f}+d${Math.max(0, u.killed - f)}${u.endState ? '/DEST' : ''}`);
  }
  for (const u of st.units) {
    const src = scenario.units[u.unitIndex];
    if (src.sideId === SIDE && src.kind !== 'NONCOMBATANT_CAMP' && u.endState === 'DESTROYED') coalitionBandDestructions += 1;
  }
  killedPerSeed.push(killed); firePerSeed.push(fire);
  fireTotal += fire; dissolutionTotal += Math.max(0, killed - fire);
  console.log(`${seed}: total ${killed} | ${line.join(' | ')}`);
}
const sorted = [...killedPerSeed].sort((a, b) => a - b);
const median = sorted[22];
console.log('\n===== AGGREGATE, drain-halt alone, 45 seeds =====');
console.log(`Reno killed: median ${median} | mean ${(killedPerSeed.reduce((a, b) => a + b) / 45).toFixed(1)} | range ${sorted[0]}-${sorted[44]}`);
console.log(`seeds above 60: ${killedPerSeed.filter((k) => k > 60).length} | seeds >= 100: ${killedPerSeed.filter((k) => k >= 100).length} | above band 26.09: ${killedPerSeed.filter((k) => k > 26.09).length}`);
console.log(`Reno deaths: FIRE ${fireTotal} | DISSOLUTION ${dissolutionTotal}`);
console.log(`Reno company destructions: ${destructions} (${destroyedList.join(', ') || 'none'})`);
console.log(`coalition band destructions (seed-unit count): ${coalitionBandDestructions}`);
console.log(`sorted killed: ${sorted.join(',')}`);
console.error('done');
