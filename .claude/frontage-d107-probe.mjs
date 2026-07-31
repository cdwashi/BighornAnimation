// THIRTY-NINTH MEASUREMENT: what is frontage currently doing in the D107
// world? D102 proved frontage provably inert (PR-16 MISS: effective ==
// centroid on all 17,154 fire events) BECAUSE no skirmish line existed.
// The line now forms at ~725.5 in 50/50 seeds (D103+). Fable's bundle-opening
// adjudication: a mechanism proven inert before a fix must be re-tested
// after it — frontage has plausibly been firing since D103, baked into
// every D103–D107 figure without separate measurement. This probe re-runs
// D102's PR-16-class instruments on the accepted D107 tree (HEAD 5969ff8).
// Read-only. 50 seeds 18760600–18760649, full day.
//
// Instruments:
//  (1) fire-resolution audit (collectCombatMetrics): share of fire events
//      where effective < centroid (frontage ACTIVE), delta distribution,
//      split by attacker side and by window (valley min 700–800 vs rest);
//  (2) PR-16 re-run: pooled + per-seed median effective range, valley
//      band-vs-Reno events, vs D102 baseline 215.96 m and the registered
//      instrument 144 ± 35 m (informal re-score — PR-16 is not re-opened,
//      this is the same instrument pointed at a changed world);
//  (3) frontage-state census: which units carry nonzero frontage, when
//      (first/last minute), magnitude (med/max meters);
//  (4) endpoint-flank event count (D102 baseline: 0 events).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { frontageMeters } = await import(pathToFileURL(join(REPO, 'dist/engine/src/frontage.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WARRIOR = new Set(scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id));
const CAV = new Set(scenario.units.filter((u) => u.kind !== 'WARRIOR_BAND' && u.sideId !== 'lakota-cheyenne-coalition').map((u) => u.id));
const m = (t) => t / 2;
const q = (l, p) => { const s = [...l].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
const stats = (a) => a.length
  ? { n: a.length, min: Math.round(q(a, 0) * 100) / 100, p25: Math.round(q(a, 0.25) * 100) / 100, med: Math.round(q(a, 0.5) * 100) / 100, p75: Math.round(q(a, 0.75) * 100) / 100, max: Math.round(Math.max(...a) * 100) / 100 }
  : { n: 0 };

let totalFire = 0, activeFire = 0, endpointFlank = 0, angularFlank = 0;
const deltasActive = [];            // centroid - effective, where active
const valleyEff = [], valleyCent = []; // band-vs-Reno, min 700-800 (PR-16 window class)
const perSeedValleyMed = [];
const activeByAttacker = new Map(); // attackerId -> count
const activeByTarget = new Map();
const activeByWindow = { valley: 0, north: 0, other: 0 }; // valley = Reno-involved 700-800; north = wing/hill involved
const census = new Map(); // unitId -> {ticks, firstMin, lastMin, meters: []}

for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    for (const u of st.units) {
      if (u.endState === 'DESTROYED') continue;
      const f = frontageMeters(u, scenario);
      if (f > 0) {
        const c = census.get(u.id) ?? { ticks: 0, firstMin: m(tick), lastMin: m(tick), meters: [] };
        c.ticks += 1; c.lastMin = m(tick); c.meters.push(f);
        census.set(u.id, c);
      }
    }
  }
  const fires = sim.combatMetrics().fireResolutions;
  const seedValleyEff = [];
  for (const r of fires) {
    totalFire += 1;
    if (r.endpointFlank) endpointFlank += 1;
    if (r.angularFlank) angularFlank += 1;
    const active = r.effectiveRangeMeters < r.centroidRangeMeters;
    const minute = m(r.tick);
    const renoInvolved = RENO.has(r.attackerId) || RENO.has(r.targetId);
    if (active) {
      activeFire += 1;
      deltasActive.push(r.centroidRangeMeters - r.effectiveRangeMeters);
      activeByAttacker.set(r.attackerId, (activeByAttacker.get(r.attackerId) ?? 0) + 1);
      activeByTarget.set(r.targetId, (activeByTarget.get(r.targetId) ?? 0) + 1);
      if (renoInvolved && minute >= 700 && minute <= 800) activeByWindow.valley += 1;
      else if (minute > 800) activeByWindow.north += 1;
      else activeByWindow.other += 1;
    }
    if (renoInvolved && WARRIOR.has(r.attackerId) && minute >= 700 && minute <= 800) {
      valleyEff.push(r.effectiveRangeMeters); valleyCent.push(r.centroidRangeMeters);
      seedValleyEff.push(r.effectiveRangeMeters);
    }
  }
  if (seedValleyEff.length) perSeedValleyMed.push(q(seedValleyEff, 0.5));
  console.error(`seed ${seed} done (${fires.length} fire events)`);
}

console.log('===== THIRTY-NINTH MEASUREMENT: frontage in the D107 world, 50 seeds =====');
console.log(`\n(1) FIRE AUDIT: ${totalFire} fire events | frontage-ACTIVE (effective < centroid): ${activeFire} (${(100 * activeFire / totalFire).toFixed(2)}%)`);
console.log(`    delta (centroid - effective) where active: ${JSON.stringify(stats(deltasActive))}`);
console.log(`    active by window: valley(Reno,700-800) ${activeByWindow.valley} | post-800 ${activeByWindow.north} | other ${activeByWindow.other}`);
const top = (map, n) => [...map.entries()].sort((l, r) => r[1] - l[1]).slice(0, n).map(([k, v]) => `${k}:${v}`).join(' ');
console.log(`    active by attacker (top 8): ${top(activeByAttacker, 8) || 'NONE'}`);
console.log(`    active by target (top 8): ${top(activeByTarget, 8) || 'NONE'}`);
console.log(`\n(2) PR-16 INSTRUMENT RE-RUN (warrior-on-Reno fire, min 700-800):`);
console.log(`    centroid ranges: ${JSON.stringify(stats(valleyCent))}`);
console.log(`    effective ranges: ${JSON.stringify(stats(valleyEff))}`);
console.log(`    per-seed median effective: ${JSON.stringify(stats(perSeedValleyMed))} (seeds with valley events: ${perSeedValleyMed.length}/50)`);
console.log(`    D102 baseline: pooled median 215.96 m, effective==centroid everywhere | registered instrument was 144 +/- 35 m`);
console.log(`\n(3) FRONTAGE-STATE CENSUS (units with nonzero frontage, any tick):`);
if (!census.size) console.log('    NONE - frontage still inert');
for (const [id, c] of [...census.entries()].sort((l, r) => r[1].ticks - l[1].ticks)) {
  console.log(`    ${id}: ${c.ticks} unit-ticks (sum over 50 seeds) | first min ${c.firstMin} last ${c.lastMin} | frontage m med ${Math.round(q(c.meters, 0.5))} p75 ${Math.round(q(c.meters, 0.75))} max ${Math.round(Math.max(...c.meters))}`);
}
console.log(`\n(4) FLANK EVENTS: endpoint ${endpointFlank} (D102 baseline 0) | angular ${angularFlank}`);
console.error('done');
