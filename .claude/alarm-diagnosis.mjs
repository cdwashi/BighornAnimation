// Ninth measure-before-ruling (Fable's two questions):
// Q1 â€” what is spotted at minute 602: which observer, which target, what
//      believed and true range, and which camp's 3 km radius it violates.
// Q2 â€” the reno-skirmish order's data, verbatim, to establish whether the
//      dismount is purely time-scheduled. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const US = new Set(scenario.units.filter((u) => u.sideId !== SIDE).map((u) => u.id));

const sim = createSim(scenario, { seed: 18760625, terrain });
sim.run(1210);
const st = sim.state();
const camps = st.units.filter((u) => scenario.units[u.unitIndex].kind === 'NONCOMBATANT_CAMP' && u.id !== 'pony-herd');

console.log('=== Q1a: coalition spotting events for US targets, ticks 0-1210 (first per observer-target pair) ===');
const seen = new Set();
const events = sim.spottingEvents();
if (events.length > 0) console.log('event shape:', Object.keys(events[0]).join(','));
for (const e of events) {
  if (e.tick > 1210) continue;
  const obs = e.observerUnitId ?? e.observerId ?? '?';
  const tgt = e.targetUnitId ?? e.targetId ?? '?';
  if (!US.has(tgt)) continue;
  const obsUnit = st.units.find((u) => u.id === obs);
  const side = obsUnit ? scenario.units[obsUnit.unitIndex].sideId : (scenario.leaders?.find?.((l) => l.id === obs) ? '?' : '?');
  if (side !== SIDE && !(obs + '').includes('pool') && !(obs + '').includes('band') && !(obs + '').includes('camp')) continue;
  const key = obs + '|' + tgt;
  if (seen.has(key)) continue;
  seen.add(key);
  console.log(`tick ${e.tick} (min ${e.tick / 2}): ${obs} spots ${tgt}` + (e.rangeMeters ? ` @ ${Math.round(e.rangeMeters)} m` : '') + (e.type ? ` [${e.type}]` : ''));
}

console.log('\n=== Q1b: coalition believed picture at tick 1204 (min 602) â€” spotted US targets vs camp radii ===');
// re-run to exactly 1204 for the belief snapshot
const sim2 = createSim(scenario, { seed: 18760625, terrain });
sim2.run(1204);
const st2 = sim2.state();
const by2 = Object.fromEntries(st2.units.map((u) => [u.id, u]));
const pic2 = st2.believedPictures?.[SIDE] ?? {};
for (const [tgt, belief] of Object.entries(pic2)) {
  if (!US.has(tgt) || belief.status !== 'spotted') continue;
  const tru = by2[tgt];
  const trueNote = tru ? `true pos dist-to-believed ${Math.round(Math.hypot(tru.position.x - belief.lastSeenPos.x, tru.position.y - belief.lastSeenPos.y))} m` : 'no runtime unit';
  const campDists = camps.map((c) => {
    const c2 = by2[c.id];
    return `${c.id}:${Math.round(Math.hypot(belief.lastSeenPos.x - c2.position.x, belief.lastSeenPos.y - c2.position.y))}m`;
  }).join(' ');
  console.log(`${tgt}: spotted (lastSeenTick ${belief.lastSeenTick}); ${trueNote}; believed dist to camps: ${campDists}`);
}

console.log('\n=== Q2: the reno-skirmish and reno-charge orders, verbatim ===');
for (const id of ['reno-charge', 'reno-skirmish']) {
  const o = scenario.orders.find((x) => x.id === id);
  console.log(JSON.stringify(o, null, 1));
}
