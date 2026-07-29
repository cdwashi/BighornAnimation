// Twentieth measurement: the D74 latch fix alone (L), then latch fix plus
// D72 ownership (LA), on the stop seed. Fix operationalization, disclosed:
// (1) no latch on corridor failure - re-attempts every ROUTED tick; (2) a
// corridor failure no longer wipes an existing path - the unit keeps
// retreating on what it has; (3) origin-bubble exemption - interdiction is
// not tested within enemyInterdictionRadiusMeters of the routing unit's own
// position, since any escape from close contact necessarily begins inside
// the engaging enemy's radius. Reported per Fable's order: valley
// trajectory, coalition totals vs O5 36/~60/136, co-m sanctuary, destroyed
// roster, and whether the ford choke repopulates (casualty-resolution
// within 250 m of ford-a, the envelope's preserved extraction). Dist-only
// toggles, restored byte-identical afterward. All N=1.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const mode = process.argv[2];
if (mode !== 'L' && mode !== 'LA') throw new Error('pass L or LA');
globalThis.__d74fix = 'cadence10'; // D92's 10-tick blocked-retry cadence (pursuitRepathCadenceTicks), per Fable's pre-freeze instruction
if (mode === 'LA') globalThis.__d17mode = 'A';
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

const sim = createSim(scenario, { seed: 18760625, terrain });
const checkpoints = [740, 767.5, 800, 820, 840, 900, 1080];
const killedAt = {};
let next = 0;
const crossed = {};
const fordEpisodes = new Map(RENO.map((id) => [id, []]));
for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  if (next < checkpoints.length && m(tick) >= checkpoints[next]) {
    killedAt[checkpoints[next]] = RENO.reduce((s, id) => s + (byId.get(id)?.killed ?? 0), 0);
    next += 1;
  }
  for (const id of RENO) {
    const u = byId.get(id);
    if (!u) continue;
    if (!(id in crossed) && sideOf(u.position) === 'EAST' && m(tick) > 750) crossed[id] = `${m(tick)} k${u.killed}`;
    const inFord = !!(u.insideFord || (u.fordHoldTicks ?? 0) > 0);
    const eps = fordEpisodes.get(id);
    if (inFord && (!eps.length || eps[eps.length - 1].end !== null)) eps.push({ start: m(tick), end: null });
    if (!inFord && eps.length && eps[eps.length - 1].end === null) eps[eps.length - 1].end = m(tick);
  }
}
const st = sim.state();
const byId = new Map(st.units.map((u) => [u.id, u]));
console.log(`===== mode ${mode} â€” seed 18760625 =====`);
console.log('Reno A/G/M killed:', JSON.stringify(killedAt), '| end:', RENO.reduce((s, id) => s + byId.get(id).killed, 0));
console.log('per company end:', RENO.map((id) => { const u = byId.get(id); return `${id} k${u.killed} ${u.moraleState}${u.endState ? '/' + u.endState : '/alive'} ${sideOf(u.position)}`; }).join(' | '));
console.log('retreat crossings (first EAST after 750):', JSON.stringify(crossed));
console.log('ford episodes:', RENO.map((id) => `${id}: ${fordEpisodes.get(id).map((e) => `${e.start}-${e.end ?? 'end'}`).join(',') || 'none'}`).join(' | '));
console.log('wing end:', WING.map((id) => `${id}:${byId.get(id).endState ?? 'alive'}`).join(' | '));
let killed = 0, wounded = 0;
const rows = [];
for (const u of st.units) {
  const src = scenario.units[u.unitIndex];
  if (src.sideId !== SIDE || src.kind === 'NONCOMBATANT_CAMP') continue;
  killed += u.killed; wounded += u.wounded;
  if (u.killed > 0 || u.casualties > 0) rows.push(`${u.id} k${u.killed}w${u.wounded}${u.endState ? '/' + u.endState : ''}`);
}
console.log(`coalition TOTAL killed ${killed} wounded ${wounded} (band 36/~60/136; Red Horse 160)`);
console.log('coalition losses:', rows.join(' | ') || 'none');
const events = sim.events();
const choke = events.filter((e) => e.type === 'casualty-resolution' && e.position &&
  Math.hypot(e.position.x - fordA.x, e.position.y - fordA.y) <= 250);
const chokeByTarget = new Map();
for (const e of choke) chokeByTarget.set(e.targetUnitId, (chokeByTarget.get(e.targetUnitId) ?? 0) + (e.casualties ?? 0));
const chokeMinutes = choke.length ? `${m(choke[0].tick)}-${m(choke[choke.length - 1].tick)}` : 'n/a';
console.log(`FORD CHOKE (250 m ford-a): ${choke.length} casualty-resolution events, window ${chokeMinutes}, by target: ${[...chokeByTarget.entries()].map(([t, n]) => `${t}:${n}`).join(' ') || 'none'}`);
console.error('done ' + mode);
