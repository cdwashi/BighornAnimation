// Twelfth measurement: T3 (river commitment) at Ford B — does the wing enter
// a ford, and when? Plus the retreat-crossing edge (A/G/M entering the
// retreat ford away from the village) that T3's operationalization must
// handle. insideFord flags only — no channel-side classifier (artifact class
// disclosed at the eleventh measurement). Read-only, baseline seed.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const lm = (id) => { const l = landmarks.find((x) => x.id === id); const [x, y] = terrain.toLocal(l.position.lat, l.position.lon); return { x, y }; };
const fordB = lm('ford-b'); const fordA = lm('ford-a');
let retreatX = null; try { const rc = lm('retreat-crossing'); retreatX = rc; } catch { retreatX = null; }
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const RENO = ['co-a', 'co-g', 'co-m'];

const sim = createSim(scenario, { seed: 18760625, terrain });
const fordEpisodes = new Map(); // id -> [{start,end}]
const minDist = new Map();      // id -> {fordB, fordA, retreat}
for (const id of [...WING, ...RENO]) minDist.set(id, { fordB: Infinity, fordA: Infinity, retreat: Infinity });
for (let tick = 0; tick <= 1800; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  for (const id of [...WING, ...RENO]) {
    const u = st.units.find((x) => x.id === id);
    if (!u) continue;
    const inFord = !!(u.insideFord || (u.fordHoldTicks ?? 0) > 0);
    const eps = fordEpisodes.get(id) ?? [];
    if (inFord && (eps.length === 0 || eps[eps.length - 1].end !== null)) eps.push({ start: tick / 2, end: null });
    if (!inFord && eps.length > 0 && eps[eps.length - 1].end === null) eps[eps.length - 1].end = tick / 2;
    fordEpisodes.set(id, eps);
    const m = minDist.get(id);
    m.fordB = Math.min(m.fordB, Math.hypot(u.position.x - fordB.x, u.position.y - fordB.y));
    m.fordA = Math.min(m.fordA, Math.hypot(u.position.x - fordA.x, u.position.y - fordA.y));
    if (retreatX) m.retreat = Math.min(m.retreat, Math.hypot(u.position.x - retreatX.x, u.position.y - retreatX.y));
  }
}
console.log('unit | ford episodes (min) | min dist ford-b | min dist ford-a | min dist retreat-x');
for (const id of [...WING, ...RENO]) {
  const eps = (fordEpisodes.get(id) ?? []).map((e) => `${e.start}-${e.end ?? 'end'}`).join(', ') || 'none';
  const m = minDist.get(id);
  console.log(`${id} | ${eps} | ${Math.round(m.fordB)} m | ${Math.round(m.fordA)} m | ${retreatX ? Math.round(m.retreat) + ' m' : 'n/a'}`);
}
