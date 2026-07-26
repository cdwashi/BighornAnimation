// D98 crossing-constraint pre-freeze measurements (Fable, three tests):
// 1. FIX: with west-only features, do pool bands still reach east-bank timber
//    near the wing on seed 18760643? (counterfactual goal distances)
// 2. NO LEGAL LOSS: does any band cross the river for a defensible camp-defence
//    reason in the current build? (classify every actual crossing by driver)
// 3. REGRESSION: with east-bank feature points ineligible, does any committed
//    band end up with NO eligible feature? (counterfactual selection per sample)
// Read-only. Run: node <this> [seed]
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const corrections = JSON.parse(await readFile(join(REPO, 'docs/o4-corrections-data.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const seed = Number(process.argv[2] ?? 18760643);
const SIDE = 'lakota-cheyenne-coalition';
const RADIUS = 3000;

// channel polyline in local meters, S->N
const channel = corrections.channel.points.map(([lat, lon]) => {
  const [x, y] = terrain.toLocal(lat, lon);
  return { x, y };
});
const sideOf = (p) => {
  let best = Infinity, sign = 0;
  for (let i = 0; i < channel.length - 1; i += 1) {
    const a = channel[i], b = channel[i + 1];
    const abx = b.x - a.x, aby = b.y - a.y;
    const apx = p.x - a.x, apy = p.y - a.y;
    const len2 = abx * abx + aby * aby || 1;
    const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / len2));
    const dx = p.x - (a.x + t * abx), dy = p.y - (a.y + t * aby);
    const d2 = dx * dx + dy * dy;
    if (d2 < best) { best = d2; sign = abx * apy - aby * apx; }
  }
  return sign > 0 ? 'W' : 'E'; // channel runs S->N; positive cross = left = west
};

const WARRIOR = scenario.units
  .filter((u) => u.sideId === SIDE && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id);

// features exactly as the engine builds them, with per-point side classification
const scenarioFeatures = (scenario.coverFeatures ?? []).map((f) => {
  const [x, y] = terrain.toLocal(f.position.lat, f.position.lon);
  return { id: `scenario-${f.id}`, points: [{ x, y }] };
});
const allFeatures = [...(terrain.coverFeatures?.() ?? []), ...scenarioFeatures]
  .map((f) => ({ id: f.id, points: f.points.map((p) => ({ ...p, side: sideOf(p) })) }))
  .sort((l, r) => l.id.localeCompare(r.id));

const nearest = (pts, t) => {
  let d = Infinity, sel = null;
  for (const p of pts) { const dd = Math.hypot(p.x - t.x, p.y - t.y); if (dd < d) { d = dd; sel = p; } }
  return { d, sel };
};
const selectFeature = (pts0, campPos, threatPos, westOnly) => {
  const cands = [];
  for (const f of allFeatures) {
    const pts = westOnly ? f.points.filter((p) => p.side === 'W') : f.points;
    if (pts.length === 0) continue;
    if (nearest(pts, campPos).d > RADIUS) continue;
    const n = nearest(pts, threatPos);
    cands.push({ id: f.id, goal: n.sel, dThreat: n.d });
  }
  cands.sort((l, r) => l.dThreat - r.dThreat || l.id.localeCompare(r.id));
  return cands[0] ?? null;
};

const sim = createSim(scenario, { seed, terrain });
const lastSide = new Map();
const crossings = [];
const cfStats = new Map(); // band -> {samples, none, changed, maxGoalShift}
const window643 = [];

for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
  const picture = st.believedPictures[SIDE] ?? {};
  for (const id of WARRIOR) {
    const u = byId[id];
    if (!u || u.endState === 'DESTROYED' || u.withdrawnOffField) continue;
    const s = sideOf(u.position);
    const prev = lastSide.get(id);
    if (prev && prev !== s) {
      crossings.push({
        min: tick / 2, band: id, dir: `${prev}->${s}`,
        driver: u.campDefense ? `CAMP-DEF(threat=${u.campDefense.threatUnitId},feat=${u.campDefense.featureId ?? '—'})`
          : u.activeOrderId ? `ORDER(${u.activeOrderId})`
          : u.pursuit ? `PURSUIT(${u.pursuit.targetUnitId})` : `OTHER(${u.posture})`,
      });
    }
    lastSide.set(id, s);

    if (tick % 20 === 0 && u.campDefense?.threatUnitId) {
      const camp = byId[u.campDefense.campUnitId];
      const belief = picture[u.campDefense.threatUnitId];
      if (camp && belief) {
        const actual = selectFeature(null, camp.position, belief.lastSeenPos, false);
        const west = selectFeature(null, camp.position, belief.lastSeenPos, true);
        const c = cfStats.get(id) ?? { samples: 0, none: 0, changed: 0 };
        c.samples += 1;
        if (!west) c.none += 1;
        else if (actual && west.id !== actual.id) c.changed += 1;
        cfStats.set(id, c);
        if (seed === 18760643 && tick >= 1280 && tick <= 1310 && ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'].includes(id)) {
          const wing = byId['co-i'];
          window643.push(`${tick / 2}min ${id}: actual=${actual?.id}@${Math.round(actual?.dThreat ?? -1)}m-to-threat | west-only=${west ? `${west.id}, goal ${Math.round(Math.hypot(west.goal.x - wing.position.x, west.goal.y - wing.position.y))} m from co-i` : 'NONE'}`);
        }
      }
    }
  }
}

console.log(`seed ${seed} — D98 crossing-constraint measurements`);
console.log(`sanity: hunkpapa-camp=${sideOf(Object.fromEntries(sim.state().units.map((u) => [u.id, u]))['hunkpapa-camp'].position)} (expect W); bench=${allFeatures.find((f) => f.id === 'scenario-bench').points[0].side} (expect W)`);
console.log(`feature west-point coverage: ${allFeatures.map((f) => `${f.id}:${f.points.filter((p) => p.side === 'W').length}/${f.points.length}`).join(' ')}`);
console.log('\nTEST 2 — actual river crossings by coalition bands (full day):');
if (crossings.length === 0) console.log('(none)');
for (const c of crossings) console.log(`  ${c.min}min ${c.band} ${c.dir} ${c.driver}`);
console.log('\nTEST 1/3 — counterfactual west-only feature selection at committed samples (every 10 min):');
console.log('| band | samples | west-only NONE | feature changed |');
console.log('|---|---:|---:|---:|');
for (const [id, c] of [...cfStats.entries()].sort()) console.log(`| ${id} | ${c.samples} | ${c.none} | ${c.changed} |`);
if (window643.length) { console.log('\nTEST 1 detail — interception window (640-655min), pool bands vs co-i:'); for (const l of window643) console.log('  ' + l); }
