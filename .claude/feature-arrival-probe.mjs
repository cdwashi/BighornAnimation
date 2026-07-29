// Thirteenth measurement: feature arrival under the D103 candidate (PR-21's
// oddity — zero feature-arrival events). Question: do the three idle pool
// bands still travel the feature path at all (select -> march -> arrive), or
// does the D96 shouldClose divert (or something else) pull them into
// engagement before any feature is ever occupied? If features are bypassed,
// D92 selection / D98 crossing / D100 foothills / Bench extent operate on a
// path the bands no longer take — measure before the bundle is designed.
// Read-only diagnostic on the uncommitted D103 candidate tree. The RE-ARMED
// STOP is honored: primary = the stop seed 18760625 (full detail); two
// secondary seeds report feature-path quantities ONLY (no casualty figures —
// deliberately suppressed so this cannot become a partial campaign).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const bench = scenario.coverFeatures[0];
const [bx, by] = terrain.toLocal(bench.position.lat, bench.position.lon);
const d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const m = (tick) => tick / 2;

function probe(seed, { full }) {
  const sim = createSim(scenario, { seed, terrain });
  const bands = new Map(POOLS.map((id) => [id, {
    alert: null, activation: null,
    timeline: [], // change-points of {featureId, threatId, posture, speedClass}
    minGoalDist: Infinity, minGoalAt: null, lastGoalKey: null,
    minBenchDist: Infinity,
    firstCharge: null, chargeCtx: null,
    prev: {},
  }]));
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (const [id, rec] of bands) {
      const u = byId.get(id);
      if (!u) continue;
      if (rec.alert === null && u.campDefenseAlert) rec.alert = m(tick);
      if (rec.activation === null && u.campDefense) rec.activation = m(tick);
      const cd = u.campDefense;
      const threat = cd?.threatUnitId ? byId.get(cd.threatUnitId) : undefined;
      const cur = {
        featureId: cd?.featureId ?? null,
        threatId: cd?.threatUnitId ?? null,
        posture: u.posture,
        speedClass: u.speedClass ?? null,
      };
      const p = rec.prev;
      if (cd && (cur.featureId !== p.featureId || cur.threatId !== p.threatId ||
        cur.posture !== p.posture || cur.speedClass !== p.speedClass)) {
        rec.timeline.push({
          min: m(tick), ...cur, mounted: u.mounted,
          goalDist: cd.goal ? Math.round(d(u.position, cd.goal)) : null,
          threatDist: threat ? Math.round(d(u.position, threat.position)) : null,
        });
      }
      rec.prev = cur;
      if (cd?.goal) {
        const gd = d(u.position, cd.goal);
        if (gd < rec.minGoalDist) { rec.minGoalDist = gd; rec.minGoalAt = m(tick); }
      }
      const bd = d(u.position, { x: bx, y: by });
      if (bd < rec.minBenchDist) rec.minBenchDist = bd;
      if (rec.firstCharge === null && cd && u.posture === 'CHARGE') {
        rec.firstCharge = m(tick);
        rec.chargeCtx = {
          featureHeld: cd.featureId ?? null,
          goalDist: cd.goal ? Math.round(d(u.position, cd.goal)) : null,
          threatId: cd.threatUnitId,
          threatDist: threat ? Math.round(d(u.position, threat.position)) : null,
        };
      }
    }
  }
  const events = sim.events();
  const st = sim.state();
  console.log(`\n===== seed ${seed} (${full ? 'stop seed, full detail' : 'secondary: feature-path quantities only'}) =====`);
  for (const id of POOLS) {
    const rec = bands.get(id);
    const arrived = events.filter((e) => e.type === 'arrived' && e.unitId === id).map((e) => m(e.tick));
    const waypoints = events.filter((e) => e.type === 'waypoint-reached' && e.unitId === id).length;
    const firstEng = events.find((e) => e.type === 'engagement-state' &&
      (e.unitId === id || e.targetUnitId === id));
    const firstFire = events.find((e) => e.type === 'casualty-resolution' && e.unitId === id);
    console.log(`\n--- ${id} ---`);
    console.log(`alert ${rec.alert} | activation ${rec.activation}`);
    console.log(`arrived events: ${arrived.length ? arrived.join(', ') : 'NONE'} | waypoint-reached count: ${waypoints}`);
    console.log(`min dist to held feature goal: ${rec.minGoalDist === Infinity ? 'never had a goal' : Math.round(rec.minGoalDist) + ' m @ min ' + rec.minGoalAt}`);
    console.log(`min dist to Bench point over full day: ${Math.round(rec.minBenchDist)} m`);
    console.log(`first CHARGE (shouldClose divert): ${rec.firstCharge ?? 'never'}${rec.chargeCtx ? ' ctx=' + JSON.stringify(rec.chargeCtx) : ''}`);
    console.log(`first engagement-state involving band: ${firstEng ? m(firstEng.tick) + ' vs ' + (firstEng.unitId === id ? firstEng.targetUnitId : firstEng.unitId) + ' (' + firstEng.engagementState + ')' : 'none'}`);
    if (full) {
      console.log(`first fire as attacker: ${firstFire ? m(firstFire.tick) + ' -> ' + firstFire.targetUnitId : 'none'}`);
    }
    console.log('state-change timeline (featureId/threat/posture/speed change-points):');
    for (const t of rec.timeline.slice(0, 20)) {
      console.log(`  ${t.min}: feature=${t.featureId ?? '-'} threat=${t.threatId ?? '-'} ${t.posture} ${t.speedClass ?? '-'}${t.mounted ? ' MTD' : ' dis'} goalDist=${t.goalDist ?? '-'} threatDist=${t.threatDist ?? '-'}`);
    }
    if (rec.timeline.length > 20) console.log(`  ... ${rec.timeline.length - 20} more change-points`);
    if (full) {
      const u = st.units.find((x) => x.id === id);
      console.log(`end: posture=${u.posture} ${u.mounted ? 'MTD' : 'dis'} pos=(${Math.round(u.position.x)},${Math.round(u.position.y)}) casualties=${u.casualties}`);
    }
  }
}

probe(18760625, { full: true });
for (const seed of [18760610, 18760643]) probe(seed, { full: false });
console.error('done');
