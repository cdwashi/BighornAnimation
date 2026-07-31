// FORTY-SECOND MEASUREMENT: the overflow eligibility check, ordered by
// Fable as the gate on the overflow half of the joint ruling ("if timber
// isn't reachable-eligible under D92(c) for pool bands, overflow has no
// destination and the option dies before it drafts"). The 41st showed
// zero warrior pressure on any timber feature in the D107 world; this
// probe asks the counterfactual the overflow mechanism would face: WITH
// scenario-bench EXCLUDED (capacity-full), does D92(c)'s own candidate
// enumeration offer the pool bands anywhere to go, and is it reachable?
//
// Fidelity: eligibleFeatures/defenseFeatures/classifiedSide/campSide are
// replicated verbatim-in-JS from engine/src/camp-defense.ts (lines
// 179-242 at HEAD b6d3d4d): scenario cover features enter as point
// features with id `scenario-<id>` via terrain.toLocal; feature points
// are filtered to the defended (camp) side of the channel; the nearest
// surviving point must lie within campDefenseRadiusMeters 3,000 of the
// CAMP; candidates sort by nearest-point distance to the THREAT, id
// tie-break. Reachability uses the EXPORTED findCampDefensePath (real
// D98 blocker, real grid, real cache) on the live state - it mutates
// nothing on the unit. Threat position approximated by the threat
// unit's actual position at the sampled tick (the engine uses the
// spotted position; disclosed).
//
// Sampling: every pool band's FIRST bench-assignment tick per seed plus
// every 60 ticks (30 min) while assigned. 10 seeds (18760600-609) -
// eligibility is dominantly geometric (camps and features static); if
// results are mixed across seeds the pass extends before anything rules.
// Also recorded WITH bench included: bench's own rank, to name exactly
// why timber has zero organic demand (selection shadowing vs
// ineligibility). Read-only. No engine change. No prediction judged.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { findCampDefensePath } = await import(pathToFileURL(join(REPO, 'dist/engine/src/camp-defense.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const POOLS = new Set(['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool', 'cheyenne-pool', 'hunkpapa-pool']);
const RADIUS = 3000; // campDefenseRadiusMeters (spotting.ts:81)

// --- replicated helpers (camp-defense.ts 179-242) ---
const classifiedSide = (point) => terrain.channelSideAtMeters?.(point.x, point.y);
const campSide = (camp) => {
  const side = classifiedSide(camp);
  return side === 'WEST' || side === 'EAST' ? side : undefined;
};
const nearestPoint = (points, target) => {
  let selected = points[0], distanceMeters = Infinity;
  for (const point of points) {
    const d = Math.hypot(point.x - target.x, point.y - target.y);
    if (d < distanceMeters) { selected = point; distanceMeters = d; }
  }
  return { point: { ...selected }, distanceMeters };
};
const defenseFeatures = () => {
  const scen = (scenario.coverFeatures ?? []).map((f) => {
    const [x, y] = terrain.toLocal(f.position.lat, f.position.lon);
    return { id: `scenario-${f.id}`, points: [{ x, y }] };
  });
  return [...(terrain.coverFeatures?.() ?? []), ...scen].sort((l, r) => l.id.localeCompare(r.id));
};
const eligibleFeatures = (features, camp, threat) => {
  const defendedSide = campSide(camp);
  return features.flatMap((feature) => {
    const points = defendedSide
      ? feature.points.filter((p) => classifiedSide(p) === defendedSide)
      : feature.points;
    if (points.length === 0 || nearestPoint(points, camp).distanceMeters > RADIUS) return [];
    const nearest = nearestPoint(points, threat);
    return [{ feature, goal: nearest.point, threatDistanceMeters: nearest.distanceMeters, campDistanceMeters: nearestPoint(points, camp).distanceMeters }];
  }).sort((l, r) => l.threatDistanceMeters - r.threatDistanceMeters || l.feature.id.localeCompare(r.feature.id));
};
// --- end replication ---

const FEATURES = defenseFeatures();
console.log('defense features (id, points, camp-side check deferred to per-camp eval): ' +
  FEATURES.map((f) => `${f.id}(${f.points.length}pt)`).join(' '));

const evals = []; // {seed, band, min, benchRank, alternatives: [{id, threatDist, campDist, reachable}], anyReachableAlt}
for (let seed = 18760600; seed <= 18760609; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const firstDone = new Set();
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (const u of st.units) {
      if (!POOLS.has(u.id) || u.endState) continue;
      const cd = u.campDefense;
      if (!cd || cd.featureId !== 'scenario-bench' || !cd.campUnitId || !cd.threatUnitId) continue;
      const isFirst = !firstDone.has(`${u.id}`);
      if (!isFirst && tick % 60 !== 0) continue;
      firstDone.add(`${u.id}`);
      const camp = byId.get(cd.campUnitId);
      const threatUnit = byId.get(cd.threatUnitId);
      if (!camp || !threatUnit) continue;
      const all = eligibleFeatures(FEATURES, camp.position, threatUnit.position);
      const benchRank = all.findIndex((c) => c.feature.id === 'scenario-bench');
      const alternatives = all.filter((c) => c.feature.id !== 'scenario-bench').map((c) => {
        const r = findCampDefensePath(st, u, terrain, c.goal);
        return {
          id: c.feature.id,
          threatDist: Math.round(c.threatDistanceMeters),
          campDist: Math.round(c.campDistanceMeters),
          reachable: r.status === 'reachable',
          pathMeters: r.status === 'reachable' ? Math.round(r.path.reduce((acc, p, i) => i ? acc + Math.hypot(p.x - r.path[i - 1].x, p.y - r.path[i - 1].y) : 0, 0)) : null,
        };
      });
      evals.push({
        seed, band: u.id, min: tick / 2, isFirst, benchRank,
        alternatives, anyReachableAlt: alternatives.some((a) => a.reachable),
      });
    }
  }
  console.error(`seed ${seed} done`);
}

console.log(`\n===== FORTY-SECOND MEASUREMENT: overflow eligibility (bench excluded), 10 seeds =====`);
console.log(`evaluations: ${evals.length} (bands: ${[...new Set(evals.map((e) => e.band))].sort().join(', ')})`);
console.log(`bench rank when included: ${[...new Set(evals.map((e) => e.benchRank))].sort().join(',')} (0 = first choice)`);
const withAlt = evals.filter((e) => e.anyReachableAlt);
console.log(`evaluations with ANY reachable non-bench candidate: ${withAlt.length}/${evals.length}`);
const altAgg = new Map(); // id -> {n, reach, threatDists:[], campDists:[], pathMeters:[]}
for (const e of evals) for (const a of e.alternatives) {
  const t = altAgg.get(a.id) ?? { n: 0, reach: 0, threatDists: [], campDists: [], pathMeters: [] };
  t.n += 1; if (a.reachable) { t.reach += 1; if (a.pathMeters != null) t.pathMeters.push(a.pathMeters); }
  t.threatDists.push(a.threatDist); t.campDists.push(a.campDist);
  altAgg.set(a.id, t);
}
const q = (l, p) => { const s = [...l].sort((x, y) => x - y); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
console.log('\n| candidate (bench excluded) | offered | reachable | dist-to-threat med (m) | dist-to-camp med (m) | path length med (m) |');
console.log('|---|---:|---:|---:|---:|---:|');
for (const [id, t] of [...altAgg.entries()].sort((l, r) => r[1].n - l[1].n)) {
  console.log(`| ${id} | ${t.n} | ${t.reach} | ${q(t.threatDists, 0.5)} | ${q(t.campDists, 0.5)} | ${t.pathMeters.length ? q(t.pathMeters, 0.5) : 'n/a'} |`);
}
console.log('\nPer-band summary (first-assignment evaluations only):');
for (const band of [...new Set(evals.map((e) => e.band))].sort()) {
  const first = evals.filter((e) => e.band === band && e.isFirst);
  const alt = first.filter((e) => e.anyReachableAlt).length;
  console.log(`  ${band}: ${first.length} first-assignments, reachable alternative in ${alt}`);
}
console.log(`\nVERDICT INPUT: ${withAlt.length === evals.length ? 'a reachable non-bench destination EXISTS at every evaluation - overflow has somewhere to send excess (state-change registration still required per Fable)' : withAlt.length === 0 ? 'NO reachable non-bench destination at any evaluation - overflow has no destination and the option dies before drafting' : 'MIXED - destination exists at some evaluations only; extend the pass before ruling'}`);
console.error('done');
