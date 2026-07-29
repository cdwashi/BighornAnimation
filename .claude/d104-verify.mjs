// WO-D104 independent verification: reproduce the report's numbers on the
// candidate tree for the baseline seed (18760625) and the worst stop-tail
// seed (18760623), and diagnose the east-bank deaths on 18760623 - who
// kills the crossers, after they cross, and from which side. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const seed = Number(process.argv[2]);
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const lm = (id) => { const l = landmarks.find((x) => x.id === id); const [x, y] = terrain.toLocal(l.position.lat, l.position.lon); return { x, y }; };
const fordA = lm('ford-a');
const SIDE = 'lakota-cheyenne-coalition';
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

const sim = createSim(scenario, { seed, terrain });
const crossed = {};
for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  for (const id of RENO) {
    const u = st.units.find((x) => x.id === id);
    if (u && !(id in crossed) && sideOf(u.position) === 'EAST' && m(tick) > 750) crossed[id] = m(tick);
  }
}
const st = sim.state();
const byId = new Map(st.units.map((u) => [u.id, u]));
const renoKilled = RENO.reduce((s, id) => s + byId.get(id).killed, 0);
let coalitionKilled = 0;
const destroyedBands = [];
for (const u of st.units) {
  const src = scenario.units[u.unitIndex];
  if (src.sideId !== SIDE || src.kind === 'NONCOMBATANT_CAMP') continue;
  coalitionKilled += u.killed;
  if (u.endState === 'DESTROYED') destroyedBands.push(u.id);
}
const events = sim.events();
const choke = events.filter((e) => e.type === 'casualty-resolution' && e.position &&
  Math.hypot(e.position.x - fordA.x, e.position.y - fordA.y) <= 250).length;
console.log(`===== seed ${seed} verification =====`);
console.log(`Reno killed ${renoKilled} | per company: ${RENO.map((id) => { const u = byId.get(id); return `${id} k${u.killed}${u.endState ? '/DEST' : '/alive'} ${sideOf(u.position)}`; }).join(' | ')}`);
console.log(`wing: ${WING.map((id) => `${id}:${byId.get(id).endState ?? 'alive'}`).join(' ')} | co-d: ${byId.get('co-d').endState ?? 'alive'}`);
console.log(`coalition killed ${coalitionKilled} | destroyed bands: ${destroyedBands.join(',') || 'none'} | choke events ${choke}`);
console.log(`crossings: ${JSON.stringify(crossed)}`);

// East-bank death diagnosis: post-crossing casualty events on Reno companies
for (const id of RENO) {
  if (!(id in crossed)) continue;
  const after = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id && m(e.tick) > crossed[id]);
  if (!after.length) { console.log(`${id}: zero post-crossing casualty events`); continue; }
  const byAttacker = new Map();
  for (const e of after) byAttacker.set(e.unitId, (byAttacker.get(e.unitId) ?? 0) + (e.casualties ?? 0));
  const window = `${m(after[0].tick)}-${m(after[after.length - 1].tick)}`;
  const sides = new Set(after.filter((e) => e.position).map((e) => sideOf(e.position)));
  console.log(`${id}: ${after.length} post-crossing casualty events, window ${window}, event-position sides [${[...sides].join(',')}], by attacker: ${[...byAttacker.entries()].sort((l, r) => r[1] - l[1]).map(([a, n]) => `${a}:${n}`).join(' ')}`);
}
console.error('done');
