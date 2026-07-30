// Thirty-sixth measurement, side-and-minute pass: the 9 Reno
// caught-while-routed bouts (seeds 18760618/622/632/647) classified by
// channel side at the catch, minute, and fragment strength - the
// sanctuary-breach vs missing-choke-deaths determination registered
// before this data existed. Read-only, 4 seeds.
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
const fordA = lm('ford-a');
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

for (const seed of [18760618, 18760622, 18760632, 18760647]) {
  const sim = createSim(scenario, { seed, terrain });
  let evCursor = 0;
  let prevRouted = new Set();
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type !== 'melee-bout' || e.outcome !== 'break' || !RENO.has(e.targetUnitId)) continue;
      if (!prevRouted.has(e.targetUnitId)) continue;
      const d = byId.get(e.targetUnitId);
      const side = sideOf(d.position);
      const fordDist = Math.round(Math.hypot(d.position.x - fordA.x, d.position.y - fordA.y));
      const window = m(e.tick) >= 760 && m(e.tick) <= 790 ? 'RETREAT-WINDOW' : (m(e.tick) < 760 ? 'pre-retreat' : 'post-retreat');
      console.log(`${seed} ${e.targetUnitId} @${m(e.tick)}: side=${side} fordA-dist=${fordDist}m strength=${d.strengthCurrent} wounded=${d.wounded} [${window}]`);
    }
    prevRouted = new Set(st.units.filter((u) => u.moraleState === 'ROUTED' && !u.endState).map((u) => u.id));
  }
}
console.error('done');
