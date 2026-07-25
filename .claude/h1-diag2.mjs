// H1 diagnostic 2 — when did camp-defense latch, and was the goal impassable then?
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url'; // D91-dispatch portability: Windows ESM needs file:// URLs for absolute-path dynamic imports
import proj4 from 'proj4';

const REPO = process.cwd(); // D91-dispatch portability: original probe hardcoded the Fable-sandbox path /home/claude/BighornAnimation; run from repo root
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { findPath } = await import(pathToFileURL(join(REPO, 'dist/engine/src/pathfind.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(REPO, 'data/terrain', SCEN, 'manifest.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const toGeo = (x, y) => {
  const [lon, lat] = proj4(manifest.crs.projectedDefinition, manifest.crs.geographic, [
    x + manifest.crs.localOrigin.easting, y + manifest.crs.localOrigin.northing]);
  return { lat, lon };
};
const wall = (m) => `${String(Math.floor((180 + m) / 60) % 24).padStart(2, '0')}:${String(Math.round((180 + m) % 60)).padStart(2, '0')}`;

const sim = createSim(scenario, { seed: 18760603, terrain });
const seen = new Set();
console.log('| band | tick | minute | clock | camp | threat | goal lat,lon | path result | reason |');
console.log('|---|---:|---:|---|---|---|---|---|---|');
for (let tick = 0; tick <= 1580; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
  for (const ev of sim.events()) {
    if (ev.type !== 'camp-defense-activated') continue;
    const key = `${ev.unitId}@${ev.tick}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const unit = byId[ev.unitId];
    const camp = byId[ev.campUnitId];
    const threat = byId[ev.threatUnitId];
    const goal = { x: (camp.position.x + threat.position.x) / 2, y: (camp.position.y + threat.position.y) / 2 };
    const res = findPath(terrain.gridForPath(unit.position, goal), unit.position, goal);
    const g = toGeo(goal.x, goal.y);
    console.log(`| ${ev.unitId} | ${ev.tick} | ${ev.tick / 2} | ${wall(ev.tick / 2)} | ${ev.campUnitId} | ${ev.threatUnitId} | ${g.lat.toFixed(5)}, ${g.lon.toFixed(5)} | ${res.status} | ${res.reason ?? '—'} |`);
  }
}
