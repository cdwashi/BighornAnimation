// H1 diagnostic — why do minneconjou / sans-arc / blackfeet-santee report
// "endpoint is impassable"? Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url'; // D91-dispatch portability: Windows ESM needs file:// URLs for absolute-path dynamic imports
import proj4 from 'proj4';

const REPO = process.cwd(); // D91-dispatch portability: original probe hardcoded the Fable-sandbox path /home/claude/BighornAnimation; run from repo root
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const manifest = JSON.parse(await readFile(join(REPO, 'data/terrain', SCEN, 'manifest.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const toGeo = (x, y) => {
  const [lon, lat] = proj4(manifest.crs.projectedDefinition, manifest.crs.geographic, [
    x + manifest.crs.localOrigin.easting, y + manifest.crs.localOrigin.northing]);
  return { lat, lon };
};

const sim = createSim(scenario, { seed: 18760603, terrain });
sim.run(720 * 2);
const st = sim.state();
const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));

const costAt = (grid, x, y) => {
  const col = Math.max(0, Math.min(grid.width - 1, Math.round((x - grid.minX) / grid.resolutionMeters)));
  const row = Math.max(0, Math.min(grid.height - 1, Math.round((y - grid.minY) / grid.resolutionMeters)));
  return grid.costs[row * grid.width + col];
};

const pairs = [
  ['minneconjou-pool', 'minneconjou-camp'],
  ['sans-arc-pool', 'sans-arc-camp'],
  ['blackfeet-santee-pool', 'mixed-north-camp'],
  ['cheyenne-pool', 'cheyenne-camp'],
  ['lwm-band', 'cheyenne-camp'],
  ['oglala-pool', 'oglala-camp'],
];

console.log('## H1 diagnostic — camp-defense goal cells at minute 720 (15:00)\n');
console.log('camp-defense goal = geometric midpoint of (camp position, threat position) per M3-A/D47 note\n');
for (const [bandId, campId] of pairs) {
  const band = byId[bandId];
  const cd = band.campDefense;
  const camp = byId[cd?.campUnitId ?? campId];
  const threat = cd ? byId[cd.threatUnitId] : undefined;
  if (!cd) {
    // report distance from camp to each Reno company for the radius question
    const ds = ['co-a', 'co-g', 'co-m'].map((i) => Math.round(Math.hypot(
      byId[i].position.x - camp.position.x, byId[i].position.y - camp.position.y)));
    console.log(`- **${bandId}**: camp-defense NOT active. ${campId} → Reno companies at ${ds.join(' / ')} m. blocked=${band.blockedReason ?? '—'} posture=${band.posture}`);
    continue;
  }
  const goal = { x: (camp.position.x + threat.position.x) / 2, y: (camp.position.y + threat.position.y) / 2 };
  const grid = terrain.gridForPath(band.position, goal);
  const cStart = costAt(grid, band.position.x, band.position.y);
  const cGoal = costAt(grid, goal.x, goal.y);
  const g = toGeo(goal.x, goal.y);
  const mv = terrain.movementAtMeters(goal.x, goal.y);
  console.log(`- **${bandId}** (camp ${cd.campUnitId}, threat ${cd.threatUnitId})`);
  console.log(`  - goal midpoint ${g.lat.toFixed(5)}, ${g.lon.toFixed(5)}  cost=${cStart === undefined ? 'n/a' : String(cGoal)}  movementFactor=${mv.movementFactor}  coverKind=${mv.coverKind}`);
  console.log(`  - start cell cost=${String(cStart)} (finite=${Number.isFinite(cStart)}), goal finite=${Number.isFinite(cGoal)}`);
  // profile the straight line camp -> goal to see where impassability begins
  const steps = 12;
  const prof = [];
  for (let i = 0; i <= steps; i += 1) {
    const x = band.position.x + (goal.x - band.position.x) * (i / steps);
    const y = band.position.y + (goal.y - band.position.y) * (i / steps);
    const c = costAt(grid, x, y);
    prof.push(Number.isFinite(c) ? 'o' : 'X');
  }
  console.log(`  - straight-line passability band→goal: ${prof.join('')}  (o=passable, X=impassable)`);
}
