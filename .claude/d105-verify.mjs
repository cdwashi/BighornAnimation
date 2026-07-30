// WO-D105 independent verification + stop-seed diagnosis. Part 1: reproduce
// the report's numbers for baseline seed 18760625 (killed 44, A/G/M 7/9/28,
// all three east, exact F4 roster, 17 bouts, 7 conversions) and the stop
// seed 18760634 TO THE STOP TICK 1766 (killed 102, A/G/M 18/40/44, one east,
// 20 bouts). Part 2: diagnose 634's inverted day - who kills Reno, where;
// why H/D/K are engaged and the wing untouched through 883. Verification
// re-runs measured seeds only; 634 is run to the stop tick, not beyond.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const BENTEEN = ['co-h', 'co-d', 'co-k'];
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

function summarize(sim, label, toTick) {
  const st = sim.state();
  const events = sim.events();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  const renoKilled = RENO.reduce((s, id) => s + byId.get(id).killed, 0);
  const bouts = events.filter((e) => e.type === 'melee-bout');
  const conv = bouts.reduce((s, e) => s + (e.convertedWounded ?? 0), 0);
  console.log(`===== ${label} (to tick ${toTick}) =====`);
  console.log(`Reno killed ${renoKilled} | ${RENO.map((id) => { const u = byId.get(id); return `${id} k${u.killed} ${sideOf(u.position)}${u.endState ? '/DEST' : ''}`; }).join(' | ')}`);
  console.log(`east alive: ${RENO.filter((id) => { const u = byId.get(id); return !u.endState && sideOf(u.position) === 'EAST'; }).length}`);
  console.log(`wing: ${WING.map((id) => `${id}:k${byId.get(id).killed}${byId.get(id).endState ? '/D' : ''}`).join(' ')}`);
  console.log(`benteen+: ${BENTEEN.map((id) => `${id}:k${byId.get(id).killed}${byId.get(id).endState ? '/D' : ''}`).join(' ')}`);
  console.log(`bouts ${bouts.length} (${bouts.filter((e) => e.outcome === 'break').length}b/${bouts.filter((e) => e.outcome === 'repel').length}r/${bouts.filter((e) => e.outcome === 'held').length}h) | converted ${conv}`);
  return { events, st, byId };
}

// Baseline seed, full day
const s1 = createSim(scenario, { seed: 18760625, terrain });
s1.run(2160);
summarize(s1, 'seed 18760625 FULL', 2160);

// Stop seed, to the stop tick only
const s2 = createSim(scenario, { seed: 18760634, terrain });
s2.run(1766);
const { events, byId } = summarize(s2, 'seed 18760634 STOP-TICK', 1766);

// Diagnosis: who kills A/G/M, when, where; what engages Benteen; wing state
console.log('\n--- 634 diagnosis ---');
for (const id of RENO) {
  const evs = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id);
  const byAttacker = new Map();
  for (const e of evs) byAttacker.set(e.unitId, (byAttacker.get(e.unitId) ?? 0) + (e.killed ?? 0));
  const buckets = new Map();
  for (const e of evs) { const b = Math.floor(m(e.tick) / 30) * 30; buckets.set(b, (buckets.get(b) ?? 0) + (e.killed ?? 0)); }
  const sides = new Set(evs.filter((e) => e.position).map((e) => sideOf(e.position)));
  console.log(`${id}: fire-killed by attacker: ${[...byAttacker.entries()].sort((l, r) => r[1] - l[1]).map(([a, n]) => `${a}:${n}`).join(' ')} | 30-min buckets: ${[...buckets.entries()].sort((l, r) => l[0] - r[0]).map(([b, n]) => `${b}:${n}`).join(' ')} | event sides: ${[...sides].join(',')}`);
}
for (const id of BENTEEN) {
  const evs = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id);
  const byAttacker = new Map();
  for (const e of evs) byAttacker.set(e.unitId, (byAttacker.get(e.unitId) ?? 0) + (e.killed ?? 0));
  const first = evs[0] ? m(evs[0].tick) : null;
  console.log(`${id}: first fire ${first} | by attacker: ${[...byAttacker.entries()].sort((l, r) => r[1] - l[1]).map(([a, n]) => `${a}:${n}`).join(' ') || 'none'}`);
}
// wing: any engagement at all?
const wingEng = events.filter((e) => e.type === 'engagement-state' && WING.some((id) => e.unitId === id || e.targetUnitId === id));
console.log(`wing engagement-state events through 883: ${wingEng.length}${wingEng.length ? `, first ${m(wingEng[0].tick)}` : ''}`);
// E/F ford commitments (T3 trigger normally 798/800)
for (const id of ['co-e', 'co-f']) {
  const u = byId.get(id);
  console.log(`${id} at stop: pos side ${sideOf(u.position)}, mounted ${u.mounted}, posture ${u.posture}`);
}
console.error('done');
