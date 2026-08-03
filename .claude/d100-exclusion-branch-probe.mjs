// CC probe for Fable's pre-D100 gate (2026-08-02): how often did the
// selectReachableFeature call at camp-defense.ts:711 fire across the accepted
// D108 campaign (seeds 18760600-18760649, scenario at 29e13c3), and at each
// fire, which feature would have been selected under a foothills-declared
// world? Reseed-free: same bytes, same stream, deterministic re-run.
//
// Two fire classes counted, both reaching :711 (which-one-specifically):
//   (a) held-exclusion    - band held a feature, held-goal re-path (:710)
//                           failed, :711 ran with the held feature excluded.
//   (b) featureless-retry - band had campDefense but no feature (activation or
//                           a prior :711 found nothing); blockedReason set;
//                           :711 re-runs every pursuitRepathCadenceTicks with
//                           no exclusion. Post-D100 these would also walk.
// Fire detection is from per-tick state signatures alone (no engine edits):
// lastPathAttemptTick === tick is stamped ONLY at activate(:458),
// switchThreat(:487), and the re-path branch(:709). Activation is excluded by
// prev-tick campDefense === undefined; switchThreat by threatUnitId change;
// :710-success by featureId === prevFeatureId (defined) - :711 either changes
// featureId, nulls it, or ran with prevFeatureId undefined.
//
// Counterfactual per fire: D90 foothill coordinates as scenario point
// features; same-side filter (channelSideAtMeters at camp vs feature), camp
// radius <= campDefenseRadiusMeters (3000), excluded feature skipped, rank by
// distance to believed threat position, reachability via exported
// findCampDefensePath on the live state (read-only). Harm count = fires where
// a REACHABLE foothill would be selected.
//
// Rider (D103 classifier artifact): each foothill's side classification plus
// an eastward transect logging classifier flips and the elevation trough -
// fh-1/fh-3 sit south of the Bench, nearer Ford A, where the classifier was
// ruled unreliable beyond the polyline terminus.
//
// Cross-check before trusting counts: per-seed Reno killed for 18760625 (31)
// and 18760633 (66) must match reports/d108-campaign-results.json digit-exact.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = Number(process.argv[2] ?? 18760600);
const LAST_SEED = Number(process.argv[3] ?? 18760649);
const RENO = ['co-a', 'co-g', 'co-m'];
const RADIUS = 3000; // spotting config campDefenseRadiusMeters
const OUT_PATH = join(REPO, '.claude', 'd100-exclusion-branch-probe.out.txt');

const engineRoot = join(REPO, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { findCampDefensePath } = await import(
  pathToFileURL(join(engineRoot, 'camp-defense.js')).href
);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist', 'src', 'terrain', 'movement-loader.js')).href
);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data', 'scenarios', SCENARIO_ID, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data', 'terrain', SCENARIO_ID));

const lines = [];
const log = (line = '') => { lines.push(line); console.log(line); };

// --- Foothill candidates (D90 in-frame identification, IMPLEMENTATION_HISTORY D90 row) ---
const FOOTHILLS = [
  { id: 'foothills-1', lat: 45.50579, lon: -107.40259 },
  { id: 'foothills-2', lat: 45.51317, lon: -107.41571 },
  { id: 'foothills-3', lat: 45.50827, lon: -107.41294 },
].map((fh) => {
  const [x, y] = terrain.toLocal(fh.lat, fh.lon);
  return { ...fh, point: { x, y } };
});
const side = (x, y) => terrain.channelSideAtMeters?.(x, y) ?? 'UNKNOWN';

log('=== Rider: foothill classification + eastward transects (D103 artifact check) ===');
for (const fh of FOOTHILLS) {
  const s = side(fh.point.x, fh.point.y);
  const e = terrain.elevationAtMeters(fh.point.x, fh.point.y);
  const flips = [];
  let prev = s;
  let minE = Infinity, minX = null;
  for (let xo = 20; xo <= 3000; xo += 20) {
    const sx = side(fh.point.x + xo, fh.point.y);
    if (sx !== prev) { flips.push(`${xo}:${prev}->${sx}`); prev = sx; }
    const ex = terrain.elevationAtMeters(fh.point.x + xo, fh.point.y);
    if (Number.isFinite(ex) && ex < minE) { minE = ex; minX = xo; }
  }
  log(`${fh.id} (${fh.lat},${fh.lon}) local(${fh.point.x.toFixed(0)},${fh.point.y.toFixed(0)})` +
    ` side=${s} elev=${Number.isFinite(e) ? e.toFixed(1) : 'n/a'}` +
    ` | east transect flips [${flips.join(' ')}] | trough ${minE.toFixed(1)} at x+${minX}`);
}
log();

// --- Campaign sweep ---
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));
const fires = [];
const perSeed = new Map();
const renoKilledBySeed = new Map();

for (let seed = FIRST_SEED; seed <= LAST_SEED; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const prevSnapshot = new Map(); // unitId -> {threatUnitId, featureId, lastPathAttemptTick}
  const seedFires = [];

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    for (const unit of state.units) {
      if (unit.defaultBehavior !== 'DEFEND_CAMP') continue;
      const cd = unit.campDefense;
      const prev = prevSnapshot.get(unit.id);
      if (cd && cd.lastPathAttemptTick === state.tick && prev !== undefined) {
        const sameThreat = prev.threatUnitId === cd.threatUnitId;
        const heldRepathSuccess = prev.featureId !== undefined &&
          cd.featureId === prev.featureId;
        if (sameThreat && !heldRepathSuccess) {
          const fireClass = prev.featureId !== undefined ? 'held-exclusion' : 'featureless-retry';
          const camp = state.units.find((u) => u.id === cd.campUnitId);
          const threatUnit = state.units.find((u) => u.id === cd.threatUnitId);
          const sideId = sourceById.get(unit.id)?.sideId;
          const believed = sideId
            ? state.believedPictures?.[sideId]?.[cd.threatUnitId]?.lastSeenPos
            : undefined;
          const threatPos = believed ?? threatUnit?.position;
          const record = {
            seed, tick,
            minute: Math.round(tick * scenario.clock.tickSeconds / 60 * 10) / 10,
            unitId: unit.id,
            fireClass,
            campUnitId: cd.campUnitId,
            threatUnitId: cd.threatUnitId,
            heldFeatureId: prev.featureId,
            actualFeatureAfter: cd.featureId,
            blockedReason: unit.blockedReason,
            counterfactual: [],
          };
          // Counterfactual: which foothill would :711 select under D100?
          if (camp && threatPos) {
            const campSide = side(camp.position.x, camp.position.y);
            const excluded = prev.featureId; // undefined for featureless-retry
            const candidates = FOOTHILLS
              .filter((fh) => `scenario-${fh.id}` !== excluded)
              .filter((fh) => campSide === 'WEST' || campSide === 'EAST'
                ? side(fh.point.x, fh.point.y) === campSide
                : true)
              .map((fh) => ({
                id: `scenario-${fh.id}`,
                point: fh.point,
                campDistance: Math.hypot(fh.point.x - camp.position.x, fh.point.y - camp.position.y),
                threatDistance: Math.hypot(fh.point.x - threatPos.x, fh.point.y - threatPos.y),
              }))
              .filter((fh) => fh.campDistance <= RADIUS)
              .sort((l, r) => l.threatDistance - r.threatDistance || l.id.localeCompare(r.id));
            for (const candidate of candidates) {
              const path = findCampDefensePath(state, unit, terrain, candidate.point);
              record.counterfactual.push({
                id: candidate.id,
                campDistance: Math.round(candidate.campDistance),
                threatDistance: Math.round(candidate.threatDistance),
                reachable: path.status === 'reachable',
                reason: path.status === 'reachable' ? undefined : path.reason,
              });
              if (path.status === 'reachable') break; // :711 selects the first reachable candidate
            }
          }
          record.wouldSelect = record.counterfactual.find((c) => c.reachable)?.id ?? null;
          seedFires.push(record);
          fires.push(record);
        }
      }
      prevSnapshot.set(unit.id, cd
        ? { threatUnitId: cd.threatUnitId, featureId: cd.featureId, lastPathAttemptTick: cd.lastPathAttemptTick }
        : undefined);
    }
  }

  const byId = new Map(sim.state().units.map((u) => [u.id, u]));
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  renoKilledBySeed.set(seed, renoKilled);
  perSeed.set(seed, seedFires);
  console.log(`seed ${seed}: fires ${seedFires.length} ` +
    `(held-exclusion ${seedFires.filter((f) => f.fireClass === 'held-exclusion').length}, ` +
    `featureless-retry ${seedFires.filter((f) => f.fireClass === 'featureless-retry').length}); ` +
    `would-walk ${seedFires.filter((f) => f.wouldSelect).length}; Reno killed ${renoKilled}`);
}

// --- Cross-check digit-exactness against the accepted campaign ---
log('=== Cross-check vs reports/d108-campaign-results.json ===');
try {
  const results = JSON.parse(await readFile(
    join(REPO, 'reports', 'd108-campaign-results.json'), 'utf8'));
  const rows = results.rows ?? results.seeds ?? [];
  for (const checkSeed of [18760625, 18760633]) {
    const row = rows.find?.((r) => r.seed === checkSeed);
    const mine = renoKilledBySeed.get(checkSeed);
    log(`seed ${checkSeed}: probe Reno killed ${mine}, campaign ${row?.renoKilled ?? 'NOT FOUND'} ` +
      `${row && row.renoKilled === mine ? 'MATCH' : 'MISMATCH - counts NOT trustworthy'}`);
  }
} catch (error) {
  log(`cross-check unavailable: ${error.message}`);
}
log();

// --- Aggregates ---
const held = fires.filter((f) => f.fireClass === 'held-exclusion');
const retry = fires.filter((f) => f.fireClass === 'featureless-retry');
const walkers = fires.filter((f) => f.wouldSelect);
log('=== Aggregate: :711 fires across 50 accepted-campaign seeds ===');
log(`total fires ${fires.length} | held-exclusion ${held.length} | featureless-retry ${retry.length}`);
log(`fires where a reachable foothill would be selected (the harm count): ${walkers.length}`);
log(`seeds with any fire: ${[...perSeed.entries()].filter(([, f]) => f.length).length}/50`);
log(`seeds with any would-walk fire: ${[...perSeed.entries()]
  .filter(([, f]) => f.some((x) => x.wouldSelect)).length}/50`);
const byUnit = new Map();
for (const f of fires) byUnit.set(f.unitId, (byUnit.get(f.unitId) ?? 0) + 1);
log(`fires by unit: ${[...byUnit.entries()].sort((l, r) => r[1] - l[1])
  .map(([id, n]) => `${id}:${n}`).join(' ') || 'none'}`);
const bySelect = new Map();
for (const f of walkers) bySelect.set(f.wouldSelect, (bySelect.get(f.wouldSelect) ?? 0) + 1);
log(`would-select distribution: ${[...bySelect.entries()]
  .map(([id, n]) => `${id}:${n}`).join(' ') || 'none'}`);
log();
if (fires.length > 0) {
  log('=== First 40 fires, detail ===');
  for (const f of fires.slice(0, 40)) {
    log(`seed ${f.seed} t${f.tick} (m${f.minute}) ${f.unitId} [${f.fireClass}] ` +
      `camp=${f.campUnitId} threat=${f.threatUnitId} held=${f.heldFeatureId ?? '-'} ` +
      `actual-after=${f.actualFeatureAfter ?? 'none'}${f.blockedReason ? ` (${f.blockedReason})` : ''} ` +
      `would-select=${f.wouldSelect ?? 'none'} ` +
      `[${f.counterfactual.map((c) => `${c.id}@${c.threatDistance}m:${c.reachable ? 'REACHABLE' : c.reason}`).join(' | ')}]`);
  }
}
await writeFile(OUT_PATH, lines.join('\n') + '\n', 'utf8');
console.error('done');
