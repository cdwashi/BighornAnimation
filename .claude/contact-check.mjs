// Twenty-fourth measurement, interpretive half: WHY was the drain halt a
// near no-op? Hypothesis: D63 engagements are range-based and stay ACTIVE
// across the river, so routed crossers are never "out of contact" under the
// engagement-active reading. Seed 18760644, co-m post-crossing.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__drainHalt = true;
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const ID = 'co-m';
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

const sim = createSim(scenario, { seed: 18760644, terrain });
for (let tick = 0; tick <= 1800; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const u = st.units.find((x) => x.id === ID);
  if (!u || u.endState) { if (u?.endState) { console.log(`${m(tick)}: DESTROYED`); break; } continue; }
  if (m(tick) < 764 || m(tick) % 5 !== 0) continue;
  const eng = st.engagements.filter((e) => e.active && e.unitIds.includes(ID));
  const partners = eng.map((e) => {
    const other = e.unitIds.find((x) => x !== ID);
    const o = st.units.find((x) => x.id === other);
    const d = o ? Math.round(Math.hypot(o.position.x - u.position.x, o.position.y - u.position.y)) : '?';
    return `${other}@${d}m(${e.state})`;
  });
  console.log(`${m(tick)}: side=${sideOf(u.position)} ${u.moraleState} coh=${u.cohesion.toFixed(1)} morale=${u.morale.toFixed(1)} engaged=${eng.length}: ${partners.join(' ')}`);
}
console.error('done');
