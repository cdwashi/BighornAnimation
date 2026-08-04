// STEADY-shelter measurement probes (2026-08-02), per the FROZEN plan at
// docs/research/STEADY-SHELTER-MEASUREMENT-PLAN.md (committed 73c1349 BEFORE
// any breach seed's legs were read). Read-only; no diagnosis beyond the
// registered branches; mechanism untouched.
//
// Probe 2 (census): for every committed D112 annihilation row, re-run its
// seed to the destruction tick; record nearest ANY-state same-side combat
// unit, the within-650 census by morale state, distances, and the committed
// nearest-ELIGIBLE cross-check.
// Probe 1 (leg attribution): for breach seeds 617/626/635 and their
// composite-matched non-breach neighbours (chosen by committed composite
// alone), full-day run + scoring; per-leg pass/fail dump.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const MODE = process.argv[2]; // number = census smoke cap; 'legs' = leg pass only
const LIMIT = MODE && MODE !== 'legs' ? Number(MODE) : Infinity;
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { runObservationExam } = await import(pathToFileURL(join(REPO, 'dist/engine/src/exam.js')).href);
const { scoreCalibrationRun } = await import(pathToFileURL(join(REPO, 'dist/engine/src/score.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(
  join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const srcById = new Map(scenario.units.map((u) => [u.id, u]));
const SIDE_OF = (id) => srcById.get(id)?.sideId;
const isCombat = (id) => srcById.get(id) && srcById.get(id).kind !== 'NONCOMBATANT_CAMP';
const examRows = runObservationExam(scenario, terrain).rows;

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const ann = results.annihilations;
log(`MEASURED annihilation row count (committed D112 array): ${ann.length}`);

// ---- Probe 2: census ----
const bySeed = new Map();
for (const a of ann) { if (!bySeed.has(a.seed)) bySeed.set(a.seed, []); bySeed.get(a.seed).push(a); }
const seeds = MODE === 'legs' ? [] : [...bySeed.keys()].sort().slice(0, LIMIT === Infinity ? undefined : LIMIT);
const census = [];
for (const seed of seeds) {
  const rows = bySeed.get(seed).sort((l, r) => l.tick - r.tick);
  const maxTick = rows[rows.length - 1].tick;
  const sim = createSim(scenario, { seed, terrain });
  let ri = 0;
  for (let t = 0; t <= maxTick; t += 1) {
    sim.run(t);
    while (ri < rows.length && rows[ri].tick === t) {
      const a = rows[ri];
      const st = sim.state();
      const me = st.units.find((u) => u.id === a.unit);
      // Filter matches the engine's own shelter predicate (combat.ts:430-431):
      // !endState && !withdrawnOffField. First run omitted withdrawnOffField and
      // reproduced METHODS S6's documented frozen-scout artifact (23rd catch).
      const friends = st.units.filter((u) => u.id !== a.unit && !u.endState &&
        !u.withdrawnOffField && SIDE_OF(u.id) === a.belligerentSide && isCombat(u.id))
        .map((u) => ({ id: u.id, state: u.moraleState,
          d: Math.hypot(u.position.x - me.position.x, u.position.y - me.position.y) }))
        .sort((l, r) => l.d - r.d);
      const near = friends.filter((f) => f.d <= 650);
      census.push({ seed, tick: t, unit: a.unit,
        nearestAny: friends[0] ?? null,
        within650: near.map((f) => `${f.id}:${f.state}@${f.d.toFixed(0)}`),
        steadyWithin650: near.filter((f) => f.state === 'STEADY').length,
        nonSteadyWithin650: near.filter((f) => f.state !== 'STEADY').length,
        committedEligibleDist: a.nearestEligibleFriendlyDistanceMeters });
      ri += 1;
    }
  }
  console.log(`census seed ${seed} done (${rows.length} rows)`);
}
log(`\n=== Probe 2 census (${census.length} of ${ann.length} rows measured) ===`);
const none = census.filter((c) => c.nonSteadyWithin650 === 0 && c.steadyWithin650 === 0).length;
const steadyBucket = census.filter((c) => c.steadyWithin650 > 0).length;
const broken = census.filter((c) => c.nonSteadyWithin650 > 0 && c.steadyWithin650 === 0).length;
log(`split: none-within-650 ${none} | STEADY-within-650 (SHOULD BE EMPTY) ${steadyBucket} | only-non-STEADY-within-650 ${broken}`);
log(`FRACTION with >=1 non-STEADY friendly within 650: ${census.filter((c) => c.nonSteadyWithin650 > 0).length}/${census.length}`);
const dists = census.flatMap((c) => c.within650.map((s) => Number(s.split('@')[1]))).sort((a, b) => a - b);
if (dists.length) log(`within-650 distance distribution: n=${dists.length} min ${dists[0]} p25 ${dists[Math.floor(dists.length*0.25)]} med ${dists[Math.floor(dists.length*0.5)]} p75 ${dists[Math.floor(dists.length*0.75)]} max ${dists[dists.length-1]}`);
for (const c of census) log(`row ${c.seed} t${c.tick} ${c.unit}: nearestAny=${c.nearestAny ? `${c.nearestAny.id}:${c.nearestAny.state}@${c.nearestAny.d.toFixed(0)}` : 'none'} | within650=[${c.within650.join(' ')}] | eligibleCrosscheck=${Math.round(c.committedEligibleDist)}`);

// ---- Probe 1: leg attribution ----
const BREACH = [18760617, 18760626, 18760635];
try {
if (LIMIT === Infinity) {
  const rowsBySeed = new Map(results.rows.map((r) => [r.seed, r]));
  const nonBreach = results.rows.filter((r) => !BREACH.includes(r.seed));
  const used = new Set();
  const pairs = BREACH.map((b) => {
    const bc = rowsBySeed.get(b).composite;
    const m = nonBreach.filter((r) => !used.has(r.seed))
      .sort((l, r) => Math.abs(l.composite - bc) - Math.abs(r.composite - bc))[0];
    used.add(m.seed);
    return { breach: b, match: m.seed, bc, mc: m.composite };
  });
  log(`\n=== Probe 1 leg attribution (matched by committed composite alone) ===`);
  for (const p of pairs) log(`pair: breach ${p.breach} (${(p.bc*100).toFixed(4)}) vs match ${p.match} (${(p.mc*100).toFixed(4)})`);
  for (const seed of pairs.flatMap((p) => [p.breach, p.match])) {
    const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
    for (let t = 0; t <= 2160; t += 1) sim.run(t);
    const score = scoreCalibrationRun({ scenario, terrain, state: sim.state(),
      tracks: sim.tracks(), events: sim.events(), observationRows: examRows, seed });
    log(`\n--- seed ${seed} legs ---`);
    for (const comp of score.components) {
      for (const item of comp.items ?? []) {
        log(`${comp.id} | ${item.id} | scope=${item.scope ?? item.excluded ?? ''} | passed=${item.passed}`);
      }
    }
  }
}
} catch (error) { log(`PROBE-1 LEG PASS FAILED (census above is intact): ${error.message}`); }
await writeFile(join(REPO, '.claude',
  MODE === 'legs' ? 'steady-shelter-legs.out.txt' : 'steady-shelter-probes.out.txt'),
  lines.join('\n') + '\n', 'utf8');
console.error('done');
