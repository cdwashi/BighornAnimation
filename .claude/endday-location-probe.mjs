// END-OF-DAY LOCATION PROBE (ruled at the sitting adjudication, 2026-08-07):
// read-only, seed 18760600 (the app's default, the envelope median), targets
// co-a / co-h / co-k / co-c — the four companies whose end-of-day positions Chuck
// questioned at the re-baseline sitting (locations, not casualties).
// Reports per target: endState; destruction tick + position at destruction (if
// destroyed); final rendered position at t2160; drift distance death->final (the
// D126 corpse-guard check: must be 0 for the destroyed); nearest landmark to the
// final position. THREE-WAY DISCRIMINATOR, no diagnosis beyond it:
//   marker != death position        -> corpse drift: GUARD FAILURE, escalates.
//   marker = death, wrong ground    -> ruled design reading wrong to a user (new class).
//   positions defensible            -> expectation off; also a result, and cheap.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

const SEED = 18760600;
const TARGETS = ['co-a', 'co-h', 'co-k', 'co-c'];
const END_TICK = 2160;

const landmarks = scenario.terrain.landmarks.map((l) => {
  const [x, y] = terrain.toLocal(l.position.lat, l.position.lon);
  return { id: l.id, x, y };
});
const nearest = (p) => {
  let best = null;
  for (const l of landmarks) {
    const d = Math.hypot(p.x - l.x, p.y - l.y);
    if (!best || d < best.d) best = { id: l.id, d };
  }
  return best;
};

const sim = createSim(scenario, { seed: SEED, terrain });
const deaths = new Map();
for (let t = 0; t <= END_TICK; t += 1) {
  sim.run(t);
  const units = sim.state().units;
  for (const id of TARGETS) {
    if (deaths.has(id)) continue;
    const u = units.find((x) => x.id === id);
    if (u && u.endState === 'DESTROYED') {
      deaths.set(id, { tick: t, x: u.position.x, y: u.position.y });
    }
  }
}
const state = sim.state();
const tracks = sim.tracks();
log(`seed ${SEED}, scenario hash context: app-default run, stream 68325eff, end tick ${END_TICK}`);
log('');
log('unit | endState | death tick (clock) | death pos | final pos @2160 | drift death->final (m) | nearest landmark to final (m)');
for (const id of TARGETS) {
  const idx = scenario.units.findIndex((u) => u.id === id);
  const u = state.units.find((x) => x.id === id);
  const track = tracks[idx];
  const last = track[track.length - 1];
  const death = deaths.get(id);
  const clock = death ? `t${death.tick} (${String(Math.floor((3 * 60 + death.tick * scenario.clock.tickSeconds / 60) / 60)).padStart(2, '0')}:${String(Math.round((3 * 60 + death.tick * scenario.clock.tickSeconds / 60) % 60)).padStart(2, '0')})` : '-';
  const drift = death ? Math.hypot(last.x - death.x, last.y - death.y) : null;
  const near = nearest({ x: last.x, y: last.y });
  log(`${id} | ${u.endState ?? 'n/a'} | ${clock} | ${death ? `(${death.x.toFixed(0)},${death.y.toFixed(0)})` : '-'} | (${last.x.toFixed(0)},${last.y.toFixed(0)}) @t${last.tick} | ${drift === null ? 'n/a (survivor)' : drift.toFixed(1)} | ${near.id} ${near.d.toFixed(0)}m`);
}
log('');
log('Discriminator key: drift > 0 on a destroyed unit = D126 guard failure (escalate).');
log('Survivors (A/H/K expected): judge final position + nearest landmark against the hill.');
await writeFile(join(REPO, '.claude/endday-location-probe.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
