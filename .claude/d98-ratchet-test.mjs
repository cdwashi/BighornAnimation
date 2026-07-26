// D98 pre-freeze measurement (Fable, required): during the approach march,
// do Custer's wing companies set NEW MINIMUM believed approaches to the
// northern camps while inside the 3,000 m eligibility radius? If yes, the
// new-minimum ratchet qualifies the passing column and D98 must be redesigned.
// Read-only. Run: node <this> [seed]
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const seed = Number(process.argv[2] ?? 18760643);
const SIDE = 'lakota-cheyenne-coalition';
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const RADIUS = 3000, RETAIN = 700;
const START_TICK = 1000, END_TICK = 1320; // minutes 500-660

const sim = createSim(scenario, { seed, terrain });
sim.run(START_TICK - 1);
const camps = sim.state().units
  .filter((u) => scenario.units[u.unitIndex].kind === 'NONCOMBATANT_CAMP' && u.id !== 'pony-herd')
  .map((u) => u.id);

// track per (camp, wing company): running min believed range, events
const key = (c, w) => `${c}|${w}`;
const track = new Map();
for (const c of camps) for (const w of WING) track.set(key(c, w), {
  min: Infinity, newMinsInside: 0, lastNewMinInsideMin: null, minEver: Infinity,
  firstInsideMin: null, everWithin700: false,
});
const commits = [];

for (let tick = START_TICK; tick <= END_TICK; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
  const picture = st.believedPictures[SIDE] ?? {};
  for (const w of WING) {
    const belief = picture[w];
    if (!belief || belief.status !== 'spotted') continue;
    for (const c of camps) {
      const camp = byId[c];
      const r = Math.hypot(belief.lastSeenPos.x - camp.position.x, belief.lastSeenPos.y - camp.position.y);
      const t = track.get(key(c, w));
      t.minEver = Math.min(t.minEver, r);
      if (r <= RADIUS && t.firstInsideMin === null) t.firstInsideMin = tick / 2;
      if (r <= RETAIN) t.everWithin700 = true;
      if (r < t.min) {
        t.min = r;
        if (r <= RADIUS) { t.newMinsInside += 1; t.lastNewMinInsideMin = tick / 2; }
      }
    }
  }
  if (tick % 20 === 0) {
    for (const u of st.units) {
      if (u.campDefense?.threatUnitId) {
        commits.push(`${tick / 2}min ${u.id}->${u.campDefense.threatUnitId}`);
      }
    }
  }
}

console.log(`seed ${seed} — believed-range ratchet test, minutes ${START_TICK / 2}-${END_TICK / 2}`);
console.log('| camp | company | first inside 3km (min) | min believed range (m) | new-mins while inside 3km | last new-min (min) | ever <=700 m | D98 draft would qualify? |');
console.log('|---|---|---:|---:|---:|---:|---|---|');
for (const c of camps) for (const w of WING) {
  const t = track.get(key(c, w));
  if (t.minEver === Infinity) continue;
  const qualifies = t.newMinsInside > 0 || t.everWithin700;
  console.log(`| ${c} | ${w} | ${t.firstInsideMin ?? '—'} | ${Math.round(t.minEver)} | ${t.newMinsInside} | ${t.lastNewMinInsideMin ?? '—'} | ${t.everWithin700 ? 'YES' : 'no'} | ${t.firstInsideMin !== null ? (qualifies ? '**YES**' : 'no') : 'n/a (never inside)'} |`);
}
console.log('\ncamp-defense commitments sampled every 10 min:');
console.log([...new Set(commits)].join('; ') || '(none in window)');
