// Twenty-third measurement: across the 45 completed WO-D104 seeds, split
// every death booked to Reno's companies into FIRE (casualty-resolution
// killed) versus DISSOLUTION (D81 terminal conversion at the cohesion
// floor). Same split for post-crossing deaths. Inside it, the class
// question: does routRallyMorale recovery EVER fire for a unit that has
// escaped contact (rally = ROUTED -> BROKEN transition, morale.ts:196)?
// Unreachable = defect class (the D74 pattern); reachable-but-losing =
// calibration. Re-measures completed seeds only - the stop is honored, no
// new seeds. Read-only on the committed halted tree (5c87b25).
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const ROUT_RALLY_MORALE = 25; // combat-config routRallyMorale
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

const agg = {
  fire: 0, dissolution: 0,
  postCrossFire: 0, postCrossDissolution: 0, postCrossCases: 0,
  rallies: [], destroyedRouted: [],
  routedRecoveryStretches: 0, routedStretches: 0,
};
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const track = new Map(RENO.map((id) => [id, {
    crossed: null, killedAtCross: null,
    prevMorale: null, routedStretch: null, maxMoraleInStretch: null, recovered: false,
    lastRoutedMax: null,
  }]));
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    for (const id of RENO) {
      const u = st.units.find((x) => x.id === id);
      if (!u) continue;
      const t = track.get(id);
      if (t.crossed === null && sideOf(u.position) === 'EAST' && m(tick) > 750) {
        t.crossed = m(tick); t.killedAtCross = u.killed;
      }
      const cur = u.moraleState;
      if (cur === 'ROUTED') {
        if (t.routedStretch === null) { t.routedStretch = m(tick); t.maxMoraleInStretch = u.morale; agg.routedStretches += 1; t.recovered = false; }
        else {
          if (u.morale > t.maxMoraleInStretch + 1e-9 && !t.recovered) { t.recovered = true; agg.routedRecoveryStretches += 1; }
          t.maxMoraleInStretch = Math.max(t.maxMoraleInStretch, u.morale);
        }
        t.lastRoutedMax = t.maxMoraleInStretch;
      } else {
        if (t.prevMorale === 'ROUTED' && cur === 'BROKEN' && !u.endState) {
          const engaged = st.engagements?.some((e) => e.active && e.unitIds.includes(id)) ?? false;
          agg.rallies.push({ seed, id, min: m(tick), side: sideOf(u.position), engaged });
        }
        t.routedStretch = null; t.maxMoraleInStretch = null;
      }
      t.prevMorale = cur;
    }
  }
  const st = sim.state();
  const events = sim.events();
  const line = [];
  for (const id of RENO) {
    const u = st.units.find((x) => x.id === id);
    const t = track.get(id);
    const fireKilled = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id)
      .reduce((s, e) => s + (e.killed ?? 0), 0);
    const dissolution = u.killed - fireKilled;
    agg.fire += fireKilled; agg.dissolution += Math.max(0, dissolution);
    if (t.crossed !== null && u.killed > t.killedAtCross) {
      const postFire = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id && m(e.tick) > t.crossed)
        .reduce((s, e) => s + (e.killed ?? 0), 0);
      const postTotal = u.killed - t.killedAtCross;
      agg.postCrossCases += 1;
      agg.postCrossFire += postFire;
      agg.postCrossDissolution += Math.max(0, postTotal - postFire);
    }
    if (u.endState === 'DESTROYED') {
      const destEv = events.find((e) => e.type === 'unit-destroyed' && e.unitId === id);
      agg.destroyedRouted.push({ seed, id, min: destEv ? m(destEv.tick) : null, side: sideOf(u.position), routedMax: t.lastRoutedMax });
    }
    line.push(`${id} k${u.killed}=f${fireKilled}+d${Math.max(0, dissolution)}${u.endState ? '/DEST' : ''}`);
  }
  console.log(`${seed}: ${line.join(' | ')}`);
}
console.log('\n===== AGGREGATE, 45 complete seeds =====');
console.log(`Reno deaths total: FIRE ${agg.fire} | DISSOLUTION ${agg.dissolution} (${(100 * agg.dissolution / (agg.fire + agg.dissolution)).toFixed(1)}% dissolution)`);
console.log(`post-crossing cases ${agg.postCrossCases}: FIRE ${agg.postCrossFire} | DISSOLUTION ${agg.postCrossDissolution} (${agg.postCrossFire + agg.postCrossDissolution ? (100 * agg.postCrossDissolution / (agg.postCrossFire + agg.postCrossDissolution)).toFixed(1) : 0}% dissolution)`);
console.log(`\nRALLIES (ROUTED -> BROKEN survivals): ${agg.rallies.length}`);
for (const r of agg.rallies.slice(0, 30)) console.log(`  ${r.seed} ${r.id} @${r.min} side=${r.side} engaged=${r.engaged}`);
console.log(`ROUTED stretches observed: ${agg.routedStretches}; stretches with ANY morale recovery: ${agg.routedRecoveryStretches}`);
console.log(`\nDESTROYED-while-out companies (${agg.destroyedRouted.length}) — max morale in final ROUTED stretch vs rally threshold ${ROUT_RALLY_MORALE}:`);
const dist = agg.destroyedRouted.map((d) => d.routedMax === null ? 'n/a' : d.routedMax.toFixed(1));
console.log(`  max-morale values: ${dist.join(', ')}`);
console.log(`  by side at destruction: EAST ${agg.destroyedRouted.filter((d) => d.side === 'EAST').length} | WEST ${agg.destroyedRouted.filter((d) => d.side === 'WEST').length}`);
console.error('done');
