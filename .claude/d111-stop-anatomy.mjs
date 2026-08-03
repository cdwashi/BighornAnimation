// CC anatomy probe for the WO-D111 campaign STOP (2026-08-02, Fable-approved,
// d104-verify pattern). Read-only on the preserved world: seed 18760627,
// stream 8e28552c (working-tree scenario). DIAGNOSTIC ONLY - no mechanism
// proposals, no fixes.
//
// Fable's candidates, registered BEFORE this ran, in his betting order:
//   (1) terminal accounting conflates destruction with death (killed at
//       destruction >> casualties accrued before it) - "135 is an accounting
//       artifact sitting on top of a militarily unremarkable rout";
//   (2) close-action cascade (the 219:2 lethality, three companies in
//       sequence);
//   (3) a common goal/morale latch putting all three in the same untenable
//       position simultaneously.
//
// Fixed report schema (ruled): per company - destruction tick; strength and
// casualties immediately prior; morale state; mechanism crediting each kill
// (fire / close-action resolver / terminal accounting); coalition units in
// contact with positions; the goal each company held. Plus the ~220 m
// position-recording reconciliation (approach-table position vs end-state
// position for co-m), on which the watch-counter frequencies are HELD
// provisional.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { hashScenario } = await import(pathToFileURL(join(REPO, 'dist/engine/src/serialize.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));
console.log(`scenario hash: ${hashScenario(scenario)} (must be 8e28552c)`);

const RENO = ['co-a', 'co-g', 'co-m'];
const SIDE = 'lakota-cheyenne-coalition';
const sourceById = new Map(scenario.units.map((u) => [u.id, u]));
const side = (x, y) => terrain.channelSideAtMeters?.(x, y) ?? 'UNKNOWN';

const sim = createSim(scenario, { seed: 18760627, terrain });
const track = new Map(RENO.map((id) => [id, []])); // per-tick snapshots
const destroyedAt = new Map();

for (let tick = 0; tick <= 1515; tick += 1) {
  sim.run(tick);
  const state = sim.state();
  for (const id of RENO) {
    const u = state.units.find((c) => c.id === id);
    if (!u) continue;
    track.get(id).push({
      tick,
      x: u.position.x, y: u.position.y,
      strength: u.strength, strengthAvailable: u.strengthAvailable,
      killed: u.killed, wounded: u.wounded,
      morale: u.morale, moraleState: u.moraleState, cohesion: u.cohesion,
      endState: u.endState, posture: u.posture,
      activeOrderId: u.activeOrderId,
      blockedReason: u.blockedReason,
    });
    if (u.endState === 'DESTROYED' && !destroyedAt.has(id)) destroyedAt.set(id, tick);
  }
}
const state = sim.state();
const events = sim.events();

console.log('\n=== Annihilation-class events for the three companies (raw JSON) ===');
for (const e of events) {
  const target = e.unitId ?? e.targetUnitId;
  if (!RENO.includes(target)) continue;
  if (e.tick < 1400) continue;
  const t = (e.type ?? '').toLowerCase();
  if (t.includes('annihil') || t.includes('destroy') || t.includes('close') || t.includes('bout') ||
      t.includes('rout') || t.includes('terminal')) {
    console.log(JSON.stringify(e));
  }
}
console.log('\n=== All event types seen for the three companies, ticks 1400-1515 (type: count) ===');
const typeCounts = new Map();
for (const e of events) {
  const target = e.unitId ?? e.targetUnitId;
  if (!RENO.includes(target) || e.tick < 1400) continue;
  typeCounts.set(e.type, (typeCounts.get(e.type) ?? 0) + 1);
}
console.log([...typeCounts.entries()].map(([t, n]) => `${t}:${n}`).join(' ') || 'none');

console.log('\n=== Per-company anatomy (ruled schema) ===');
for (const id of RENO) {
  const rows = track.get(id);
  const d = destroyedAt.get(id);
  const prior = rows.find((r) => r.tick === d - 1);
  const at = rows.find((r) => r.tick === d);
  const src = sourceById.get(id);
  console.log(`\n--- ${id} (encoded strength best ${src?.strength?.best}) ---`);
  console.log(`destruction tick ${d} (min ${d / 2})`);
  console.log(`immediately prior (t=${d - 1}): strength ${prior.strength}, available ${prior.strengthAvailable}, ` +
    `killed ${prior.killed}, wounded ${prior.wounded}, morale ${prior.morale?.toFixed?.(1)} (${prior.moraleState}), ` +
    `cohesion ${prior.cohesion?.toFixed?.(1)}, posture ${prior.posture}, order ${prior.activeOrderId ?? '-'}, ` +
    `pos (${prior.x.toFixed(1)},${prior.y.toFixed(1)}) ${side(prior.x, prior.y)}`);
  console.log(`at destruction (t=${d}): strength ${at.strength}, killed ${at.killed}, wounded ${at.wounded}, ` +
    `pos (${at.x.toFixed(1)},${at.y.toFixed(1)}) ${side(at.x, at.y)}`);
  console.log(`KILL CREDIT SPLIT: killed before destruction tick = ${prior.killed}; ` +
    `booked AT destruction tick = ${at.killed - prior.killed} ` +
    `(terminal-accounting share if fire did not spike this tick)`);
  // kill accrual curve, every 10 ticks from 1400
  const curve = rows.filter((r) => r.tick >= 1400 && (r.tick % 10 === 0 || r.tick === d || r.tick === d - 1));
  console.log('kill/morale curve: ' + curve.map((r) =>
    `t${r.tick}:k${r.killed}/s${r.strength}/${r.moraleState}${r.endState === 'DESTROYED' ? '/DEAD' : ''}`).join(' '));
  // coalition in contact at destruction tick: within 400 m at t=d
  const contacts = state.units
    .filter((u) => sourceById.get(u.id)?.sideId === SIDE &&
      sourceById.get(u.id)?.kind !== 'NONCOMBATANT_CAMP');
  // use positions recorded at end (1515) is wrong for t=d; re-run below handles per-company contact
  void contacts;
}

console.log('\n=== Coalition contact at each destruction tick (re-runs to the exact tick) ===');
for (const id of RENO) {
  const d = destroyedAt.get(id);
  const sim2 = createSim(scenario, { seed: 18760627, terrain });
  for (let tick = 0; tick <= d; tick += 1) sim2.run(tick);
  const st = sim2.state();
  const me = st.units.find((u) => u.id === id);
  const near = st.units
    .filter((u) => sourceById.get(u.id)?.sideId === SIDE &&
      sourceById.get(u.id)?.kind !== 'NONCOMBATANT_CAMP' && u.endState !== 'DESTROYED')
    .map((u) => ({ id: u.id, d: Math.hypot(u.position.x - me.position.x, u.position.y - me.position.y),
      x: u.position.x, y: u.position.y, state: u.moraleState }))
    .filter((c) => c.d <= 400)
    .sort((l, r) => l.d - r.d);
  console.log(`${id} at t=${d} pos (${me.position.x.toFixed(1)},${me.position.y.toFixed(1)}): ` +
    (near.length ? near.map((c) => `${c.id}@${c.d.toFixed(0)}m(${c.state})`).join(' ') : 'NO coalition combat unit within 400 m'));
}

console.log('\n=== Position-recording reconciliation (the ~220 m item; counters held provisional on this) ===');
const cm = track.get('co-m');
const dm = destroyedAt.get('co-m');
const window = cm.filter((r) => r.tick >= dm - 4 && r.tick <= Math.min(dm + 20, 1515));
for (const r of window) {
  console.log(`co-m t${r.tick}: pos (${r.x.toFixed(2)},${r.y.toFixed(2)}) ${r.endState ?? 'active'}`);
}
console.log('approach-table row recorded: (6951.47,10965.34) at tick 1497; end-state read at 1515: see above.');
console.log('If position moved AFTER the DESTROYED tick, the table and the closing comparison used different moments.');
console.error('done');
