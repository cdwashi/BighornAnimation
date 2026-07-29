// Eleventh measurement: the three candidate hostile-act triggers, timed from
// the live baseline event stream, plus the march-time quantity turnout
// arithmetic needs, plus one dynamic proxy run (alarm ~ attack-proximity)
// using only the existing radius machinery. Read-only.
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
const channel = corrections.channel.points.map(([lat, lon]) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; });
const sideOf = (p) => { let best = Infinity, s = 0; for (let i = 0; i < channel.length - 1; i++) { const a = channel[i], b = channel[i + 1]; const abx = b.x - a.x, aby = b.y - a.y, apx = p.x - a.x, apy = p.y - a.y; const l2 = abx * abx + aby * aby || 1; const t = Math.max(0, Math.min(1, (apx * abx + apy * aby) / l2)); const dx = p.x - (a.x + t * abx), dy = p.y - (a.y + t * aby); const d2 = dx * dx + dy * dy; if (d2 < best) { best = d2; s = abx * apy - aby * apx; } } return s > 0 ? 'W' : 'E'; };
const bench = scenario.coverFeatures[0]; const [bx, by] = terrain.toLocal(bench.position.lat, bench.position.lon);
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const RENO = ['co-a', 'co-g', 'co-m'];

// ---- Baseline run (r=3000): trigger times + march time
const sim = createSim(scenario, { seed: 18760625, terrain });
let firstFord = null, firstWest = null, chargeTick = null, firstCoalitionCas = null, activation = null;
const benchArrival = {};
for (let tick = 0; tick <= 1480; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
  for (const id of RENO) {
    const u = byId[id];
    if (!u) continue;
    if (firstFord === null && (u.insideFord || (u.fordHoldTicks ?? 0) > 0)) firstFord = tick / 2;
    if (firstWest === null && sideOf(u.position) === 'W') firstWest = tick / 2;
    if (chargeTick === null && u.posture === 'CHARGE') chargeTick = tick / 2;
  }
  if (firstCoalitionCas === null) {
    for (const u of st.units) {
      const src = scenario.units[u.unitIndex];
      if (src.sideId === 'lakota-cheyenne-coalition' && u.casualties > 0) { firstCoalitionCas = tick / 2; break; }
    }
  }
  for (const id of POOLS) {
    const u = byId[id];
    if (!u) continue;
    if (activation === null && u.campDefense) activation = tick / 2;
    if (!(id in benchArrival) && Math.hypot(u.position.x - bx, u.position.y - by) < 60) benchArrival[id] = tick / 2;
  }
}
console.log('=== measured on baseline (r=3000, seed 18760625) ===');
console.log('activation (turnout complete):', activation, '| bench arrivals:', JSON.stringify(benchArrival));
const marches = POOLS.filter((p) => p in benchArrival).map((p) => benchArrival[p] - activation);
console.log('march time turnout->Bench (min):', marches.join('/'));
console.log('T3 ford commitment: first insideFord', firstFord, '| first west-of-channel', firstWest);
console.log('T1 charge fires (posture CHARGE):', chargeTick);
console.log('T2 first coalition casualty:', firstCoalitionCas);

// ---- Dynamic proxy: r=250 (alarm ~ attack proximity to the camp)
for (const r of [250, 600]) {
  const s2 = createSim(scenario, { seed: 18760625, terrain, parameterOverrides: { campDefenseRadiusMeters: r } });
  let alert = null, act = null, lineFormed = null;
  const arr = {};
  for (let tick = 0; tick <= 1600; tick += 1) {
    s2.run(tick);
    const st = s2.state();
    const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
    for (const id of POOLS) {
      const u = byId[id];
      if (!u) continue;
      if (alert === null && u.campDefenseAlert) alert = tick / 2;
      if (act === null && u.campDefense) act = tick / 2;
      if (!(id in arr) && Math.hypot(u.position.x - bx, u.position.y - by) < 60) arr[id] = tick / 2;
    }
    if (lineFormed === null) {
      for (const id of RENO) {
        const u = byId[id];
        if (u && !u.mounted && u.formation === 'SKIRMISH' && u.endState !== 'DESTROYED') lineFormed = tick / 2;
      }
    }
  }
  const st = s2.state();
  const agm = RENO.map((id) => { const u = st.units.find((x) => x.id === id); return `${id}:${u.mounted ? 'MTD' : 'dis'}-${u.formation} k${u.killed}${u.endState ? '/' + u.endState : ''}`; }).join(' | ');
  console.log(`\n=== dynamic proxy r=${r} ===`);
  console.log(`alert ${alert} | turnout complete ${act} | bench arrivals ${JSON.stringify(arr)} | LINE FORMED ${lineFormed ?? 'no'} | end: ${agm}`);
}
