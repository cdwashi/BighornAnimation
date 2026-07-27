// Investigation (Fable): what is the eligible feature set for valley bands
// under the live D92(c)+D98 rules, and do all bands select the same feature?
// Mirrors engine selection exactly: features = substrate timber clusters +
// scenario bench; points filtered to the defended camp's channel side;
// eligible if nearest same-side point is within campDefenseRadiusMeters of
// the camp; ranked by distance to the believed threat, tie-break by id.
// Also: are D90's foothill coordinates represented in ANY feature? Read-only.
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
const RADIUS = 3000;
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const seeds = [18760600, 18760610, 18760620, 18760625, 18760630, 18760635, 18760640, 18760643, 18760645, 18760649];

const scenarioFeatures = (scenario.coverFeatures ?? []).map((f) => {
  const [x, y] = terrain.toLocal(f.position.lat, f.position.lon);
  return { id: `scenario-${f.id}`, points: [{ x, y }] };
});
const allFeatures = [...(terrain.coverFeatures?.() ?? []), ...scenarioFeatures]
  .sort((l, r) => l.id.localeCompare(r.id));

const side = (p) => terrain.channelSideAtMeters(p.x, p.y);
const nearest = (pts, t) => {
  let d = Infinity, sel = null;
  for (const p of pts) { const dd = Math.hypot(p.x - t.x, p.y - t.y); if (dd < d) { d = dd; sel = p; } }
  return { d, sel };
};

// engine-mirrored candidate list for a (camp, believed-threat) pair
const candidates = (campPos, threatPos) => {
  const defended = side(campPos);
  return allFeatures.map((f) => {
    const pts = f.points.filter((p) => side(p) === defended);
    if (pts.length === 0) return { id: f.id, verdict: `INELIGIBLE (0 ${defended}-side points)` };
    const dCamp = nearest(pts, campPos).d;
    if (dCamp > RADIUS) return { id: f.id, verdict: `INELIGIBLE (nearest ${defended} point ${Math.round(dCamp)} m from camp > 3000)` };
    const n = nearest(pts, threatPos);
    return { id: f.id, dThreat: n.d, goal: n.sel, verdict: 'eligible' };
  });
};

// D90 foothill coordinates — are they represented in any feature?
const FOOTHILLS = [[45.50579, -107.40259], [45.51317, -107.41571], [45.50827, -107.41294]];
console.log('D90 foothills vs feature set (distance from each foothill to nearest point of any feature):');
for (const [lat, lon] of FOOTHILLS) {
  const [x, y] = terrain.toLocal(lat, lon);
  let best = { d: Infinity, id: null };
  for (const f of allFeatures) { const n = nearest(f.points, { x, y }); if (n.d < best.d) best = { d: n.d, id: f.id }; }
  console.log(`  ${lat},${lon}: nearest feature point ${Math.round(best.d)} m away (${best.id}); side=${side({ x, y })}`);
}

const selections = new Map(); // "band|feature" -> count
const rankTables = new Set();
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  for (let tick = 1400; tick <= 1520; tick += 10) {
    sim.run(tick);
    const st = sim.state();
    const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
    const picture = st.believedPictures[SIDE] ?? {};
    for (const u of st.units) {
      if (!u.campDefense?.threatUnitId || !RENO.has(u.campDefense.threatUnitId)) continue;
      const camp = byId[u.campDefense.campUnitId];
      const belief = picture[u.campDefense.threatUnitId];
      if (!camp || !belief) continue;
      const cands = candidates(camp.position, belief.lastSeenPos);
      const eligible = cands.filter((c) => c.verdict === 'eligible')
        .sort((l, r) => l.dThreat - r.dThreat || l.id.localeCompare(r.id));
      const sel = eligible[0];
      const key = `${u.id}|${u.campDefense.featureId ?? 'none'}|mirror:${sel?.id ?? 'NONE'}`;
      selections.set(key, (selections.get(key) ?? 0) + 1);
      const table = cands.map((c) => `${c.id}: ${c.verdict === 'eligible' ? Math.round(c.dThreat) + ' m to threat' : c.verdict}`).join(' | ');
      rankTables.add(`camp=${u.campDefense.campUnitId} threat=${u.campDefense.threatUnitId} :: ${table}`);
    }
  }
  console.error(`seed ${seed} done`);
}

console.log('\nEligible-set rank tables observed during valley window (minutes 700-760, unique):');
for (const t of [...rankTables].sort()) console.log('  ' + t);
console.log('\nSelections (band | engine featureId | mirrored top pick) with sample counts:');
for (const [k, v] of [...selections.entries()].sort()) console.log(`  ${k} :: ${v}`);
