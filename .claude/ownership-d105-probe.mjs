// Thirty-third measurement: ownership re-measured in the D105 world, TWO
// SCOPES, per the conflation finding stated before launch:
//   CD  - the QUEUED ruling's letter: campDefense holders immune to D72
//         startPursuit. The 32nd showed camp-defence at 0.0% of northern
//         kills, so CD is expected to move the north little or not at all.
//   ORD - the GENERALIZED principle Fable's blast-radius statement
//         describes: any unit with a standing authority (active order OR
//         campDefense) immune to D72 startPursuit. This is the scope that
//         governs the 91.2% pursuit-family north.
// Primary instrument: the 32nd's hill/wing mode decomposition (ownership
// should move mode visibly and predictably; casualties are secondary).
// B-variant (pursuit-informs-commitment) deferred, disclosed. 34 completed
// seeds; expectations sized wider than the 17th's per adjudication.
// Dist toggle only, restored byte-identical afterward; stop honored.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const mode = process.argv[2];
if (mode !== 'CD' && mode !== 'ORD') throw new Error('pass CD or ORD');
globalThis.__d33mode = mode;
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const HILL_ALWAYS = new Set(['co-h', 'co-d', 'co-k', 'pack-train']);
const RENO = ['co-a', 'co-g', 'co-m'];
const RENO_SET = new Set(RENO);
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const WING_SET = new Set(WING);
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';
const MODES = ['order-axis', 'combat-pursuit', 'initiative', 'camp-defence', 'unattributed'];

const killedPerSeed = [];
const coalitionPerSeed = [];
let wingComplete = 0, eastOk = 0, boutsTotal = 0, bandDestructions = 0;
const hillMode = {}, wingMode = {};
for (const md of MODES) { hillMode[md] = 0; wingMode[md] = 0; }
let hillTotal = 0, wingTotal = 0;
for (let seed = 18760600; seed <= 18760633; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  let evCursor = 0;
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type !== 'casualty-resolution') continue;
      const attacker = byId.get(e.unitId);
      if (!attacker || scenario.units[attacker.unitIndex]?.sideId !== SIDE) continue;
      let tc = null;
      if (HILL_ALWAYS.has(e.targetUnitId)) tc = 'hill';
      else if (RENO_SET.has(e.targetUnitId) && e.position && sideOf(e.position) === 'EAST') tc = 'hill';
      else if (WING_SET.has(e.targetUnitId)) tc = 'wing';
      if (!tc) continue;
      let cm = 'unattributed';
      if (attacker.pursuit?.kind === 'COMBAT') cm = 'combat-pursuit';
      else if (attacker.pursuit?.kind === 'INITIATIVE') cm = 'initiative';
      else if (attacker.campDefense) cm = 'camp-defence';
      else if (attacker.activeOrderId !== undefined) cm = 'order-axis';
      const k = e.killed ?? 0;
      if (tc === 'hill') { hillMode[cm] += k; hillTotal += k; } else { wingMode[cm] += k; wingTotal += k; }
    }
  }
  const st = sim.state();
  const events = sim.events();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  killedPerSeed.push(RENO.reduce((s, id) => s + byId.get(id).killed, 0));
  let ck = 0, bd = 0;
  for (const u of st.units) {
    const src = scenario.units[u.unitIndex];
    if (src.sideId !== SIDE || src.kind === 'NONCOMBATANT_CAMP') continue;
    ck += u.killed;
    if (u.endState === 'DESTROYED') bd += 1;
  }
  coalitionPerSeed.push(ck); bandDestructions += bd;
  if (WING.every((id) => byId.get(id).endState === 'DESTROYED') && !byId.get('co-d').endState) wingComplete += 1;
  if (RENO.filter((id) => { const u = byId.get(id); return !u.endState && sideOf(u.position) === 'EAST'; }).length >= 2) eastOk += 1;
  boutsTotal += events.filter((e) => e.type === 'melee-bout').length;
  console.log(`${seed}: reno ${killedPerSeed[killedPerSeed.length - 1]} coalition ${ck}`);
}
const med = (l) => [...l].sort((a, b) => a - b)[Math.floor(l.length / 2)];
console.log(`\n===== mode ${mode}, 34 seeds =====`);
console.log(`Reno killed: median ${med(killedPerSeed)} mean ${(killedPerSeed.reduce((a, b) => a + b) / 34).toFixed(1)} range ${Math.min(...killedPerSeed)}-${Math.max(...killedPerSeed)} | >60: ${killedPerSeed.filter((k) => k > 60).length} | >=100: ${killedPerSeed.filter((k) => k >= 100).length}`);
console.log(`coalition killed: median ${med(coalitionPerSeed)} | band destructions (seed-units) ${bandDestructions}`);
console.log(`complete wing ${wingComplete}/34 | >=2 east ${eastOk}/34 | bouts total ${boutsTotal}`);
console.log(`HILL killed ${hillTotal}: ${MODES.map((md) => `${md} ${hillMode[md]}`).join(' | ')}`);
console.log(`WING killed ${wingTotal}: ${MODES.map((md) => `${md} ${wingMode[md]}`).join(' | ')}`);
console.error('done ' + mode);
