// Sixth measure-before-freezing (frontage WO): on the halted tree —
// (1) flanked-rate baseline for Reno A/G/M and the wing companies;
// (2) counterfactual effective-range distribution under the proposed
//     edge-to-edge formula with the LINE derivation (strengthAvailable x 2.0
//     both sides) — does the subtraction collapse ranges?
// (3) inputs the SPLIT derivation would actually have available: feature
//     ground extents (cell counts), which feature each firing band holds,
//     and the representational gaps. Read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { combatConfig } = await import(pathToFileURL(join(REPO, 'dist/engine/src/combat-config.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const config = combatConfig();
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const WARRIOR = new Set(scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id));
const seeds = Array.from({ length: 20 }, (_, i) => 18760600 + i);
const M_PER_MAN = 2.0;

console.log(`meleeRangeMeters=${config.meleeRangeMeters} chargeRangeMeters=${config.chargeRangeMeters} engagementRangeMeters=${config.engagementRangeMeters}`);
console.log('\nFeature ground extents available to a split derivation:');
for (const f of terrain.coverFeatures()) {
  const area = f.points.length * 100; // 10 m cells
  console.log(`  ${f.id}: ${f.points.length} cells = ${area} m² -> equivalent-circle diameter ${Math.round(2 * Math.sqrt(area / Math.PI))} m`);
}
console.log('  scenario-bench: POINT FEATURE - no cells, no ground representation (D90 describes a ~60 m neighbourhood)');

const flank = new Map(); // id -> {engaged, flanked}
const samples = []; // {range, bandAvail, renoAvail, featureId}
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  for (let tick = 1400; tick <= 1800; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
    for (const id of [...RENO, ...WING]) {
      const u = byId[id];
      if (!u || u.endState === 'DESTROYED') continue;
      const engaged = st.engagements.some((e) => e.active && e.state !== 'APPROACH' && e.unitIds.includes(id));
      if (!engaged) continue;
      const f = flank.get(id) ?? { engaged: 0, flanked: 0 };
      f.engaged += 1;
      if (u.flankedThisTick) f.flanked += 1;
      flank.set(id, f);
    }
    if (tick <= 1560) {
      for (const e of st.engagements) {
        if (!e.active || e.state === 'APPROACH') continue;
        const band = e.unitIds.find((i) => WARRIOR.has(i));
        const reno = e.unitIds.find((i) => RENO.includes(i));
        if (!band || !reno) continue;
        const bu = byId[band], ru = byId[reno];
        if (!bu || !ru) continue;
        samples.push({
          range: e.rangeMeters,
          bandAvail: bu.strengthAvailable,
          renoAvail: ru.strengthAvailable,
          featureId: bu.campDefense?.featureId ?? '(ordered/none)',
        });
      }
    }
  }
  console.error(`seed ${seed} done`);
}

console.log('\n(1) FLANKED-RATE BASELINE (flankedThisTick ticks / engaged ticks, 20 seeds, min 700-900):');
console.log('| unit | engaged ticks | flanked ticks | rate |');
console.log('|---|---:|---:|---:|');
for (const id of [...RENO, ...WING]) {
  const f = flank.get(id) ?? { engaged: 0, flanked: 0 };
  console.log(`| ${id} | ${f.engaged} | ${f.flanked} | ${(f.engaged ? 100 * f.flanked / f.engaged : 0).toFixed(1)}% |`);
}

const stats = (a) => {
  const v = [...a].sort((x, y) => x - y);
  const q = (p) => v[Math.floor(p * (v.length - 1))];
  return { n: v.length, min: Math.round(v[0]), p25: Math.round(q(0.25)), med: Math.round(q(0.5)), p75: Math.round(q(0.75)), max: Math.round(v[v.length - 1]) };
};
console.log('\n(2) EFFECTIVE-RANGE COUNTERFACTUAL, valley band-vs-Reno fire ticks (min 700-780):');
console.log('centroid ranges: ' + JSON.stringify(stats(samples.map((s) => s.range))));
const lineEff = samples.map((s) => Math.max(0, s.range - (s.bandAvail * M_PER_MAN + s.renoAvail * M_PER_MAN) / 2));
console.log(`LINE derivation both sides (avail x ${M_PER_MAN} m): ` + JSON.stringify(stats(lineEff)));
console.log(`  collapsed to 0 m: ${(100 * lineEff.filter((v) => v === 0).length / lineEff.length).toFixed(1)}% | at/below melee (${config.meleeRangeMeters} m): ${(100 * lineEff.filter((v) => v <= config.meleeRangeMeters).length / lineEff.length).toFixed(1)}% | at/below charge range (${config.chargeRangeMeters} m): ${(100 * lineEff.filter((v) => v <= config.chargeRangeMeters).length / lineEff.length).toFixed(1)}%`);
console.log('\n(3) SPLIT-DERIVATION INPUTS - which feature does each firing band actually hold at fire ticks:');
const byFeature = new Map();
for (const s of samples) byFeature.set(s.featureId, (byFeature.get(s.featureId) ?? 0) + 1);
for (const [k, v] of [...byFeature.entries()].sort((l, r) => r[1] - l[1])) console.log(`  ${k}: ${v} fire-tick samples (${(100 * v / samples.length).toFixed(1)}%)`);
console.log('\nband strengthAvailable at fire ticks: ' + JSON.stringify(stats(samples.map((s) => s.bandAvail))));
console.log('Reno strengthAvailable at fire ticks: ' + JSON.stringify(stats(samples.map((s) => s.renoAvail))));
