// WO-D111 Amendment 3 resume. Seed 18760627 is deterministically replaced by
// a complete run first; seeds 28-49 then run with the tripwire fully armed.
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const RESUME_SEED = 18760627;
const LAST_SEED = 18760649;
const END_TICK = 2160;
const VALLEY_END_TICK = 1600;
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const COALITION = 'lakota-cheyenne-coalition';
const RESULT_PATH = join(REPO, 'reports', 'd111-campaign-results.json');
const PROGRESS_PATH = join(REPO, 'reports', 'd111-campaign-progress.json');
const GROUND_JSON = join(REPO, 'reports', 'd111-ground-pressure-census.json');
const GROUND_MD = join(REPO, 'reports', 'd111-ground-pressure-census.md');
const VALLEY_JSON = join(REPO, 'reports', 'd111-valley-range.json');
const VALLEY_MD = join(REPO, 'reports', 'd111-valley-range.md');

const engineRoot = join(REPO, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { extractBenchLip } = await import(pathToFileURL(join(engineRoot, 'lip.js')).href);
const { runObservationExam } = await import(pathToFileURL(join(engineRoot, 'exam.js')).href);
const { scoreCalibrationRun } = await import(pathToFileURL(join(engineRoot, 'score.js')).href);
const { extractEmergentOutcomes } = await import(pathToFileURL(join(engineRoot, 'envelope.js')).href);
const { selectBaselineSeed } = await import(pathToFileURL(join(engineRoot, 'baseline-selection.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist', 'src', 'terrain', 'movement-loader.js')).href
);

const prior = JSON.parse(await readFile(RESULT_PATH, 'utf8'));
const priorStoppedAnnihilations = prior.annihilations.filter((item) => item.seed === RESUME_SEED);
const priorStoppedStrandings = prior.strandings.filter((item) => item.seed === RESUME_SEED);
const scenario = JSON.parse(await readFile(
  join(REPO, 'data', 'scenarios', SCENARIO_ID, 'scenario.json'), 'utf8'));
const criteriaBytes = await readFile(join(REPO, 'data', 'calibration', 'baseline-seed-criteria.json'));
const criteria = JSON.parse(criteriaBytes.toString('utf8'));
const criteriaHash = createHash('sha256').update(criteriaBytes).digest('hex');
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data', 'terrain', SCENARIO_ID));
const observationRows = runObservationExam(scenario, terrain).rows;
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));
const combatIds = new Set(scenario.units.filter((unit) =>
  unit.kind !== 'NONCOMBATANT_CAMP' && unit.id !== 'pony-herd').map((unit) => unit.id));
const warriorIds = new Set(scenario.units.filter((unit) =>
  unit.sideId === COALITION && combatIds.has(unit.id)).map((unit) => unit.id));
const benchSource = scenario.coverFeatures.find((feature) => feature.id === 'bench');
if (!benchSource) throw new Error('D111 scenario bench missing');
const [benchX, benchY] = terrain.toLocal(benchSource.position.lat, benchSource.position.lon);
const benchPoint = { x: benchX, y: benchY };
const lip = extractBenchLip(terrain, benchPoint);
const [referenceX, referenceY] = terrain.toLocal(45.51659, -107.38996);
const referenceLip = extractBenchLip(terrain, { x: referenceX, y: referenceY });
const lipBytes = JSON.stringify(lip);
const sideOf = (point) => terrain.channelSideAtMeters?.(point.x, point.y) ?? 'UNKNOWN';
const minute = (tick) => tick * scenario.clock.tickSeconds / 60;

function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))];
}

function distribution(values, includeSorted = false) {
  const sorted = [...values].sort((left, right) => left - right);
  const result = { count: sorted.length, min: sorted[0] ?? null, p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5), p75: quantile(sorted, 0.75), max: sorted.at(-1) ?? null,
    mean: sorted.length ? sorted.reduce((sum, value) => sum + value, 0) / sorted.length : null };
  return includeSorted ? { ...result, sorted } : result;
}

function rangeStats(values) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const q = (fraction) => sorted[Math.floor(fraction * (sorted.length - 1))];
  return { n: sorted.length, min: sorted[0], p25: q(0.25), median: q(0.5),
    p75: q(0.75), max: sorted.at(-1) };
}

function push(map, key, value) {
  const values = map.get(key) ?? [];
  values.push(value);
  map.set(key, values);
}

const cellFeatures = new Map();
for (const feature of terrain.coverFeatures()) {
  cellFeatures.set(feature.id, new Set(feature.points.map((point) =>
    `${Math.round(point.x / 10)},${Math.round(point.y / 10)}`)));
}
const onCells = (cells, position) => {
  const cx = Math.round(position.x / 10);
  const cy = Math.round(position.y / 10);
  for (let dx = -1; dx <= 1; dx += 1) for (let dy = -1; dy <= 1; dy += 1) {
    if (cells.has(`${cx + dx},${cy + dy}`)) return true;
  }
  return false;
};
const groundKeys = ['bench-r30', 'bench-r60', ...cellFeatures.keys()];
const groundTrack = new Map(groundKeys.map((key) => [key, {
  globalPeak: 0, globalPeakUnassigned: 0, seedPeaks: [], seedPeaksUnassigned: [],
  seedsNonzero: 0, nonzeroTicks: 0, bands: new Map(),
}]));
const valleyOpenRanges = new Map();
const valleyFireRanges = new Map();
const valleyOpenMinutes = [];

function nearestEligibleFriendly(target, state) {
  const sideId = sourceById.get(target.id)?.sideId;
  return state.units.filter((unit) => unit.id !== target.id && combatIds.has(unit.id) &&
    !unit.endState && !unit.withdrawnOffField && unit.moraleState === 'STEADY' &&
    sourceById.get(unit.id)?.sideId === sideId)
    .map((unit) => ({ unit, distanceMeters: Math.hypot(
      unit.position.x - target.position.x, unit.position.y - target.position.y) }))
    .sort((left, right) => left.distanceMeters - right.distanceMeters ||
      left.unit.id.localeCompare(right.unit.id))[0];
}

function createRuntime() {
  return { previousPositions: new Map(), lastMovement: new Map(), previousDefense: new Map(),
    eventCursor: 0, seenOpen: new Set(), seenFire: new Set(), annihilations: [], strandings: [] };
}

function collectTick(sim, seed, runtime, collectBaselines) {
  const state = sim.state();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  for (const unit of state.units) {
    const previous = runtime.previousPositions.get(unit.id);
    if (previous && (previous.x !== unit.position.x || previous.y !== unit.position.y)) {
      runtime.lastMovement.set(unit.id, { tick: state.tick, from: previous });
    }
    runtime.previousPositions.set(unit.id, { ...unit.position });
    if (unit.defaultBehavior === 'DEFEND_CAMP') {
      const priorDefense = runtime.previousDefense.get(unit.id);
      const current = unit.campDefense;
      if (priorDefense?.featureId && current &&
        priorDefense.threatUnitId !== current.threatUnitId && current.featureId === undefined) {
        runtime.strandings.push({ seed, tick: state.tick, minute: minute(state.tick), unit: unit.id,
          heldFeatureId: priorDefense.featureId, oldThreatUnitId: priorDefense.threatUnitId,
          newThreatUnitId: current.threatUnitId, campUnitId: current.campUnitId });
      }
      runtime.previousDefense.set(unit.id, current ? { featureId: current.featureId,
        threatUnitId: current.threatUnitId, campUnitId: current.campUnitId } : undefined);
    }
  }

  const events = sim.events();
  for (; runtime.eventCursor < events.length; runtime.eventCursor += 1) {
    const event = events[runtime.eventCursor];
    if (event.type !== 'melee-bout' || event.outcome !== 'annihilation' || !event.targetUnitId) continue;
    const target = byId.get(event.targetUnitId);
    if (!target || !combatIds.has(target.id)) continue;
    const friendly = nearestEligibleFriendly(target, state);
    const movement = runtime.lastMovement.get(target.id);
    let approach = 'stationary';
    let priorDistanceMeters = null;
    if (movement) {
      if (!friendly) throw new Error(`D111 moved annihilation has no eligible friendly: ${seed}/${state.tick}/${target.id}`);
      priorDistanceMeters = Math.hypot(
        friendly.unit.position.x - movement.from.x,
        friendly.unit.position.y - movement.from.y);
      if (friendly.distanceMeters < priorDistanceMeters) approach = 'closing';
      else if (friendly.distanceMeters > priorDistanceMeters) approach = 'opening';
      else throw new Error(`D111 moved annihilation has equal approach distances: ${seed}/${state.tick}/${target.id}`);
    }
    runtime.annihilations.push({ seed, tick: event.tick, minute: minute(event.tick),
      unit: target.id, attackerUnit: event.unitId, position: { ...target.position },
      channelSide: sideOf(target.position), belligerentSide: sourceById.get(target.id)?.sideId,
      nearestEligibleFriendly: friendly?.unit.id ?? null,
      nearestEligibleFriendlyDistanceMeters: friendly?.distanceMeters ?? null,
      lastMovementTick: movement?.tick ?? null, lastMovementFromPosition: movement?.from ?? null,
      distanceFromLastMovementPositionMeters: priorDistanceMeters, approach });
  }

  if (!collectBaselines) return;
  const now = new Map(groundKeys.map((key) => [key, 0]));
  const nowUnassigned = new Map(groundKeys.map((key) => [key, 0]));
  for (const unit of state.units) {
    if (!warriorIds.has(unit.id) || unit.endState === 'DESTROYED') continue;
    const hits = [];
    const dBench = Math.hypot(unit.position.x - benchX, unit.position.y - benchY);
    if (dBench <= 30) hits.push(['bench-r30', 'scenario-bench']);
    if (dBench <= 60) hits.push(['bench-r60', 'scenario-bench']);
    for (const [featureId, cells] of cellFeatures) if (onCells(cells, unit.position)) {
      hits.push([featureId, featureId]);
    }
    for (const [key, featureId] of hits) {
      now.set(key, now.get(key) + unit.strengthAvailable);
      const item = groundTrack.get(key);
      item.bands.set(unit.id, Math.max(item.bands.get(unit.id) ?? 0, unit.strengthAvailable));
      if (unit.campDefense?.featureId !== featureId) {
        nowUnassigned.set(key, nowUnassigned.get(key) + unit.strengthAvailable);
      }
    }
  }
  for (const key of groundKeys) {
    const item = groundTrack.get(key);
    if (now.get(key) > 0) item.nonzeroTicks += 1;
    runtime.seedPeak.set(key, Math.max(runtime.seedPeak.get(key), now.get(key)));
    runtime.seedPeakUnassigned.set(key,
      Math.max(runtime.seedPeakUnassigned.get(key), nowUnassigned.get(key)));
  }
  if (state.tick <= VALLEY_END_TICK) for (const engagement of state.engagements) {
    const band = engagement.unitIds.find((id) => warriorIds.has(id));
    const reno = engagement.unitIds.find((id) => RENO.includes(id));
    if (!band || !reno) continue;
    if (!runtime.seenOpen.has(engagement.id) && engagement.startedTick === state.tick) {
      runtime.seenOpen.add(engagement.id);
      push(valleyOpenRanges, band, engagement.rangeMeters);
      valleyOpenMinutes.push(minute(state.tick));
    }
    if (!runtime.seenFire.has(engagement.id) && engagement.active && (engagement.intensity ?? 0) > 0) {
      runtime.seenFire.add(engagement.id);
      push(valleyFireRanges, band, engagement.rangeMeters);
    }
  }
}

function finishGroundSeed(runtime) {
  for (const key of groundKeys) {
    const item = groundTrack.get(key);
    const peak = runtime.seedPeak.get(key);
    const peakUnassigned = runtime.seedPeakUnassigned.get(key);
    item.seedPeaks.push(peak);
    item.seedPeaksUnassigned.push(peakUnassigned);
    if (peak > 0) item.seedsNonzero += 1;
    item.globalPeak = Math.max(item.globalPeak, peak);
    item.globalPeakUnassigned = Math.max(item.globalPeakUnassigned, peakUnassigned);
  }
}

async function runSeed(seed, collectBaselines) {
  const sim = createSim(scenario, { seed, terrain });
  const runtime = createRuntime();
  if (collectBaselines) {
    runtime.seedPeak = new Map(groundKeys.map((key) => [key, 0]));
    runtime.seedPeakUnassigned = new Map(groundKeys.map((key) => [key, 0]));
  }
  let prefix = null;
  for (let tick = 0; tick <= END_TICK; tick += 1) {
    sim.run(tick);
    collectTick(sim, seed, runtime, collectBaselines);
    const byId = new Map(sim.state().units.map((unit) => [unit.id, unit]));
    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (seed === RESUME_SEED && tick === 1515) {
      prefix = { renoKilled, annihilations: structuredClone(runtime.annihilations),
        strandings: structuredClone(runtime.strandings) };
    }
    if (seed > RESUME_SEED && (renoKilled >= 100 || activeOver60Seeds.size > 5 ||
      (renoKilled > 60 && !activeOver60Seeds.has(seed) && activeOver60Seeds.size + 1 > 5))) {
      if (renoKilled > 60) activeOver60Seeds.add(seed);
      freshStop = { fired: true,
        reason: renoKilled >= 100 ? 'new seed reached Reno killed >=100' : '>5 seeds exceeded 60 Reno killed',
        seed, tick, minute: minute(tick), renoKilled, over60Seeds: [...activeOver60Seeds] };
      return { sim, runtime, prefix, stopped: true };
    }
    if (seed > RESUME_SEED && renoKilled > 60) activeOver60Seeds.add(seed);
  }
  if (collectBaselines) finishGroundSeed(runtime);
  return { sim, runtime, prefix, stopped: false };
}

function makeRow(seed, sim) {
  const state = sim.state();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const coalitionKilled = state.units.filter((unit) =>
    sourceById.get(unit.id)?.sideId === COALITION && combatIds.has(unit.id))
    .reduce((sum, unit) => sum + unit.killed, 0);
  const f4 = Object.fromEntries([...WING, 'co-d'].map((id) =>
    [id, byId.get(id)?.endState ?? 'ALIVE']));
  const scorecard = scoreCalibrationRun({ scenario: sim.scenario, terrain, state,
    tracks: sim.tracks(), events: sim.events(), observationRows, seed });
  const outcome = extractEmergentOutcomes(sim.scenario, terrain, state, sim.events(), scorecard);
  return { row: { seed, complete: true, stopTick: null, scenarioHash: sim.scenarioHash,
    renoKilled, coalitionKilled,
    completeWing: WING.every((id) => f4[id] === 'DESTROYED') && f4['co-d'] === 'ALIVE',
    f4, composite: scorecard.composite, components: outcome.componentScores }, outcome };
}

function summarize(rows, stop, annihilations, strandings) {
  const components = Object.fromEntries(['C1', 'C2', 'C3', 'C4'].map((id) =>
    [id, distribution(rows.map((row) => row.components[id]), true)]));
  return { completedSeeds: rows.length, stop,
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
    composite: distribution(rows.map((row) => row.composite), true),
    compositePercent: distribution(rows.map((row) => row.composite * 100), true), components,
    renoKilled: distribution(rows.map((row) => row.renoKilled), true),
    over60Seeds: rows.filter((row) => row.renoKilled > 60).map((row) => row.seed),
    eastRenoAnnihilations: annihilations.filter((item) =>
      RENO.includes(item.unit) && item.channelSide === 'EAST'),
    annihilationCount: annihilations.length,
    approachFrequency: Object.fromEntries(['closing', 'opening', 'stationary'].map((value) =>
      [value, annihilations.filter((item) => item.approach === value).length])),
    strandingCount: strandings.length,
    strandingSeeds: [...new Set(strandings.map((item) => item.seed))],
    completeWingSeeds: rows.filter((row) => row.completeWing).length,
    f4BaselineSeed: rows.find((row) => row.seed === 18760625)?.f4 ?? null,
    coalitionKilled: distribution(rows.map((row) => row.coalitionKilled), true) };
}

let rows = prior.rows.filter((row) => row.seed < RESUME_SEED);
let outcomes = prior.envelopeOutcomes.filter((outcome) => outcome.seed < RESUME_SEED);
let annihilations = prior.annihilations.filter((item) => item.seed < RESUME_SEED);
let strandings = prior.strandings.filter((item) => item.seed < RESUME_SEED);
const activeOver60Seeds = new Set(rows.filter((row) => row.renoKilled > 60).map((row) => row.seed));
activeOver60Seeds.add(RESUME_SEED);
let freshStop = { fired: false };
let seed627FinalRenoKilled = null;

for (let seed = RESUME_SEED; seed <= LAST_SEED && !freshStop.fired; seed += 1) {
  const run = await runSeed(seed, true);
  if (seed === RESUME_SEED) {
    const prefixMatches = run.prefix?.renoKilled === 135 &&
      JSON.stringify(run.prefix.annihilations) === JSON.stringify(priorStoppedAnnihilations) &&
      JSON.stringify(run.prefix.strandings) === JSON.stringify(priorStoppedStrandings);
    if (!prefixMatches) throw new Error('Amendment 3 seed 18760627 prefix did not reproduce exactly');
  }
  if (run.stopped) {
    annihilations.push(...run.runtime.annihilations);
    strandings.push(...run.runtime.strandings);
    break;
  }
  const complete = makeRow(seed, run.sim);
  rows.push(complete.row);
  outcomes.push(complete.outcome);
  annihilations.push(...run.runtime.annihilations);
  strandings.push(...run.runtime.strandings);
  if (seed === RESUME_SEED) seed627FinalRenoKilled = complete.row.renoKilled;
  const partialSummary = summarize(rows, freshStop, annihilations, strandings);
  await writeFile(PROGRESS_PATH, JSON.stringify({ registeredRange: [18760600, LAST_SEED],
    amendment3: { seed627PinnedAtTick1515: 135, seed627FinalRenoKilled }, rows, envelopeOutcomes: outcomes,
    annihilations, strandings, summary: partialSummary, stop: freshStop }, null, 2), 'utf8');
  console.error(`seed ${seed}: Reno ${complete.row.renoKilled}; ` +
    `annih ${run.runtime.annihilations.length}; strand ${run.runtime.strandings.length}`);
}

if (freshStop.fired) {
  const stopped = { registeredRange: [18760600, LAST_SEED], amendment3: {
    seed627PinnedAtTick1515: 135, seed627FinalRenoKilled }, rows, envelopeOutcomes: outcomes,
    annihilations, strandings, summary: summarize(rows, freshStop, annihilations, strandings),
    stop: freshStop };
  await writeFile(RESULT_PATH, JSON.stringify(stopped, null, 2), 'utf8');
  console.log(RESULT_PATH);
  process.exit(2);
}

// Seeds 27-49 supplied the resumed campaign and baseline observations above.
// Reconstruct baseline-only observations for preserved seeds 00-26 now; no
// campaign row is replaced and no tripwire can be newly encountered there.
for (let seed = 18760600; seed < RESUME_SEED; seed += 1) {
  await runSeed(seed, true);
  console.error(`baseline reconstruction seed ${seed}`);
}

rows = rows.sort((left, right) => left.seed - right.seed);
outcomes = outcomes.sort((left, right) => left.seed - right.seed);
annihilations = annihilations.sort((left, right) => left.seed - right.seed || left.tick - right.tick);
strandings = strandings.sort((left, right) => left.seed - right.seed || left.tick - right.tick ||
  left.unit.localeCompare(right.unit));
const selection = selectBaselineSeed(outcomes, criteria);
const summary = summarize(rows, { fired: false }, annihilations, strandings);
const northings = lip.map((point) => point.y).sort((left, right) => left - right);
const lipIdentity = { cells: lip.length,
  northSouthSpanMeters: northings.at(-1) - northings[0],
  maxNorthingGapMeters: Math.max(...northings.slice(1).map((value, index) => value - northings[index])),
  minimumBenchDistanceMeters: Math.min(...lip.map((point) => Math.round(Math.hypot(
    point.x - benchX, point.y - benchY)))), westCells: lip.filter((point) => sideOf(point) === 'WEST').length,
  byteIdenticalToPinnedBenchPoint: lipBytes === JSON.stringify(referenceLip),
  cellListSha256: createHash('sha256').update(lipBytes).digest('hex') };
const result = { registeredRange: [18760600, LAST_SEED], criteriaHash,
  amendment3: { seed627PinnedAtTick1515: 135, seed627FinalRenoKilled,
    completedEnvelopeWorseThanPartial: summary.composite.median < prior.summary.composite.median,
    partialCompositeMedian: prior.summary.composite.median,
    completedCompositeMedian: summary.composite.median },
  rows, envelopeOutcomes: outcomes, selection, annihilations, strandings, lipIdentity,
  summary, stop: { fired: false } };
await writeFile(RESULT_PATH, JSON.stringify(result, null, 2), 'utf8');
await writeFile(PROGRESS_PATH, JSON.stringify(result, null, 2), 'utf8');

const ground = { streamId: summary.scenarioHashes[0], registeredRange: [18760600, LAST_SEED],
  completedSeeds: 50, grounds: Object.fromEntries(groundKeys.map((key) => {
    const item = groundTrack.get(key);
    return [key, { globalPeak: item.globalPeak, globalPeakUnassigned: item.globalPeakUnassigned,
      seedPeaks: distribution(item.seedPeaks, true),
      seedPeaksUnassigned: distribution(item.seedPeaksUnassigned, true),
      seedsNonzero: item.seedsNonzero, nonzeroTicks: item.nonzeroTicks,
      topBands: [...item.bands.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([unit, peakStrength]) => ({ unit, peakStrength })) }];
  })) };
await writeFile(GROUND_JSON, JSON.stringify(ground, null, 2), 'utf8');
const groundLines = ['# D111 Ground-pressure Census', '', `Stream: \`${ground.streamId}\``,
  '', 'Completed seeds: **50/50**', '',
  '| ground | global peak | peak unassigned | seed peak min/median/max | seeds >0 | nonzero ticks |',
  '|---|---:|---:|---|---:|---:|'];
for (const [key, item] of Object.entries(ground.grounds)) groundLines.push(
  `| ${key} | ${item.globalPeak} | ${item.globalPeakUnassigned} | ` +
  `${item.seedPeaks.min}/${item.seedPeaks.median}/${item.seedPeaks.max} | ` +
  `${item.seedsNonzero}/50 | ${item.nonzeroTicks} |`);
await writeFile(GROUND_MD, `${groundLines.join('\n')}\n`, 'utf8');

const valley = { streamId: summary.scenarioHashes[0], registeredRange: [18760600, LAST_SEED],
  completedSeeds: 50, endTick: VALLEY_END_TICK,
  engagementOpenRanges: Object.fromEntries([...valleyOpenRanges.entries()].sort().map(
    ([key, values]) => [key, rangeStats(values)])),
  firstFireRanges: Object.fromEntries([...valleyFireRanges.entries()].sort().map(
    ([key, values]) => [key, rangeStats(values)])),
  allBandsFirstFire: rangeStats([...valleyFireRanges.values()].flat()),
  engagementOpenMinutes: rangeStats(valleyOpenMinutes) };
await writeFile(VALLEY_JSON, JSON.stringify(valley, null, 2), 'utf8');
const valleyLines = ['# D111 Valley-range Baseline', '', `Stream: \`${valley.streamId}\``,
  '', 'Completed seeds: **50/50**', '', '## Engagement-open range (m)', '',
  '| band | n | min | p25 | median | p75 | max |', '|---|---:|---:|---:|---:|---:|---:|'];
for (const [key, item] of Object.entries(valley.engagementOpenRanges)) valleyLines.push(
  `| ${key} | ${item.n} | ${Math.round(item.min)} | ${Math.round(item.p25)} | ` +
  `${Math.round(item.median)} | ${Math.round(item.p75)} | ${Math.round(item.max)} |`);
valleyLines.push('', '## First-fire range (m)', '',
  '| band | n | min | p25 | median | p75 | max |', '|---|---:|---:|---:|---:|---:|---:|');
for (const [key, item] of Object.entries(valley.firstFireRanges)) valleyLines.push(
  `| ${key} | ${item.n} | ${Math.round(item.min)} | ${Math.round(item.p25)} | ` +
  `${Math.round(item.median)} | ${Math.round(item.p75)} | ${Math.round(item.max)} |`);
await writeFile(VALLEY_MD, `${valleyLines.join('\n')}\n`, 'utf8');
console.log(RESULT_PATH);
