// WO-D111/D112 registered campaign and re-baseline instrument. The stop is
// checked after every tick. All outputs derive from one accepted 50-seed run.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const CAMPAIGN = process.env.BIGHORN_CAMPAIGN_ID ?? 'd111';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const END_TICK = 2160;
const VALLEY_END_TICK = 1600;
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const COALITION = 'lakota-cheyenne-coalition';
const RESULT_PATH = join(REPO, 'reports', `${CAMPAIGN}-campaign-results.json`);
const PROGRESS_PATH = join(REPO, 'reports', `${CAMPAIGN}-campaign-progress.json`);
const GROUND_JSON = join(REPO, 'reports', `${CAMPAIGN}-ground-pressure-census.json`);
const GROUND_MD = join(REPO, 'reports', `${CAMPAIGN}-ground-pressure-census.md`);
const VALLEY_JSON = join(REPO, 'reports', `${CAMPAIGN}-valley-range.json`);
const VALLEY_MD = join(REPO, 'reports', `${CAMPAIGN}-valley-range.md`);

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
const referenceLipBytes = JSON.stringify(referenceLip);
const sideOf = (point) => terrain.channelSideAtMeters?.(point.x, point.y) ?? 'UNKNOWN';
const minute = (tick) => tick * scenario.clock.tickSeconds / 60;

function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))];
}

function distribution(values, includeSorted = false) {
  const sorted = [...values].sort((left, right) => left - right);
  const result = {
    count: sorted.length,
    min: sorted[0] ?? null,
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    max: sorted.at(-1) ?? null,
    mean: sorted.length ? sorted.reduce((sum, value) => sum + value, 0) / sorted.length : null,
  };
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
  const targetSource = sourceById.get(target.id);
  const eligible = state.units.filter((unit) => unit.id !== target.id && combatIds.has(unit.id) &&
    !unit.endState && !unit.withdrawnOffField && unit.moraleState === 'STEADY' &&
    sourceById.get(unit.id)?.sideId === targetSource?.sideId)
    .map((unit) => ({ unit, distanceMeters: Math.hypot(
      unit.position.x - target.position.x, unit.position.y - target.position.y) }))
    .sort((left, right) => left.distanceMeters - right.distanceMeters ||
      left.unit.id.localeCompare(right.unit.id));
  return eligible[0];
}

function summarize(rows, stop, annihilations, strandings) {
  const complete = rows.filter((row) => row.complete);
  const components = Object.fromEntries(['C1', 'C2', 'C3', 'C4'].map((id) => [id,
    distribution(complete.map((row) => row.components[id]), true)]));
  return {
    completedSeeds: complete.length,
    stop,
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
    composite: distribution(complete.map((row) => row.composite), true),
    compositePercent: distribution(complete.map((row) => row.composite * 100), true),
    components,
    renoKilled: distribution(complete.map((row) => row.renoKilled), true),
    over60Seeds: complete.filter((row) => row.renoKilled > 60).map((row) => row.seed),
    eastRenoAnnihilations: annihilations.filter((item) =>
      RENO.includes(item.unit) && item.channelSide === 'EAST'),
    annihilationCount: annihilations.length,
    approachFrequency: Object.fromEntries(['closing', 'opening', 'stationary'].map((value) =>
      [value, annihilations.filter((item) => item.approach === value).length])),
    strandingCount: strandings.length,
    strandingSeeds: [...new Set(strandings.map((item) => item.seed))],
    completeWingSeeds: complete.filter((row) => row.completeWing).length,
    f4BaselineSeed: complete.find((row) => row.seed === 18760625)?.f4 ?? null,
    coalitionKilled: distribution(complete.map((row) => row.coalitionKilled), true),
    coalitionWounded: distribution(complete.map((row) => row.coalitionWounded), true),
    woundedFlipSeeds: complete.filter((row) => row.woundedFlip).map((row) => row.seed),
    woundedFlipCount: complete.filter((row) => row.woundedFlip).length,
    c4CurrentSeries: complete.map((row) => ({ seed: row.seed, ...row.c4Current })),
    c4LineageReferent: { passed: 12, total: 13, score: 12 / 13 },
  };
}

await mkdir(join(REPO, 'reports'), { recursive: true });
const rows = [];
const envelopeOutcomes = [];
const annihilations = [];
const strandings = [];
const over60Seeds = new Set();
let stop = { fired: false };

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop.fired; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const previousPositions = new Map();
  const lastMovement = new Map();
  const previousDefense = new Map();
  const seenOpen = new Set();
  const seenFire = new Set();
  const seedPeak = new Map(groundKeys.map((key) => [key, 0]));
  const seedPeakUnassigned = new Map(groundKeys.map((key) => [key, 0]));
  let eventCursor = 0;
  let stopTick = null;

  for (let tick = 0; tick <= END_TICK; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));

    for (const unit of state.units) {
      const previous = previousPositions.get(unit.id);
      if (previous && (previous.x !== unit.position.x || previous.y !== unit.position.y)) {
        lastMovement.set(unit.id, { tick, from: previous });
      }
      previousPositions.set(unit.id, { ...unit.position });

      if (unit.defaultBehavior === 'DEFEND_CAMP') {
        const prior = previousDefense.get(unit.id);
        const current = unit.campDefense;
        if (prior?.featureId && current && prior.threatUnitId !== current.threatUnitId &&
          current.featureId === undefined) {
          strandings.push({ seed, tick, minute: minute(tick), unit: unit.id,
            heldFeatureId: prior.featureId, oldThreatUnitId: prior.threatUnitId,
            newThreatUnitId: current.threatUnitId, campUnitId: current.campUnitId });
        }
        previousDefense.set(unit.id, current ? {
          featureId: current.featureId, threatUnitId: current.threatUnitId,
          campUnitId: current.campUnitId,
        } : undefined);
      }
    }

    const now = new Map(groundKeys.map((key) => [key, 0]));
    const nowUnassigned = new Map(groundKeys.map((key) => [key, 0]));
    for (const unit of state.units) {
      if (!warriorIds.has(unit.id) || unit.endState === 'DESTROYED') continue;
      const hits = [];
      const dBench = Math.hypot(unit.position.x - benchX, unit.position.y - benchY);
      if (dBench <= 30) hits.push(['bench-r30', 'scenario-bench']);
      if (dBench <= 60) hits.push(['bench-r60', 'scenario-bench']);
      for (const [featureId, cells] of cellFeatures) {
        if (onCells(cells, unit.position)) hits.push([featureId, featureId]);
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
      seedPeak.set(key, Math.max(seedPeak.get(key), now.get(key)));
      seedPeakUnassigned.set(key, Math.max(seedPeakUnassigned.get(key), nowUnassigned.get(key)));
    }

    if (tick <= VALLEY_END_TICK) for (const engagement of state.engagements) {
      const band = engagement.unitIds.find((id) => warriorIds.has(id));
      const reno = engagement.unitIds.find((id) => RENO.includes(id));
      if (!band || !reno) continue;
      if (!seenOpen.has(engagement.id) && engagement.startedTick === tick) {
        seenOpen.add(engagement.id);
        push(valleyOpenRanges, band, engagement.rangeMeters);
        valleyOpenMinutes.push(minute(tick));
      }
      if (!seenFire.has(engagement.id) && engagement.active && (engagement.intensity ?? 0) > 0) {
        seenFire.add(engagement.id);
        push(valleyFireRanges, band, engagement.rangeMeters);
      }
    }

    const events = sim.events();
    for (; eventCursor < events.length; eventCursor += 1) {
      const event = events[eventCursor];
      if (event.type !== 'melee-bout' || event.outcome !== 'annihilation' ||
        !event.targetUnitId) continue;
      const target = byId.get(event.targetUnitId);
      if (!target || !combatIds.has(target.id)) continue;
      const friendly = nearestEligibleFriendly(target, state);
      const movement = lastMovement.get(target.id);
      let approach = 'stationary';
      let priorDistanceMeters = null;
      if (movement) {
        if (!friendly) throw new Error(`${CAMPAIGN} moved annihilation has no eligible friendly: ${seed}/${tick}/${target.id}`);
        priorDistanceMeters = Math.hypot(
          friendly.unit.position.x - movement.from.x,
          friendly.unit.position.y - movement.from.y);
        if (friendly.distanceMeters < priorDistanceMeters) approach = 'closing';
        else if (friendly.distanceMeters > priorDistanceMeters) approach = 'opening';
        else throw new Error(`${CAMPAIGN} moved annihilation has equal approach distances: ${seed}/${tick}/${target.id}`);
      }
      annihilations.push({
        seed, tick: event.tick, minute: minute(event.tick), unit: target.id,
        attackerUnit: event.unitId, position: { ...target.position },
        channelSide: sideOf(target.position), belligerentSide: sourceById.get(target.id)?.sideId,
        nearestEligibleFriendly: friendly?.unit.id ?? null,
        nearestEligibleFriendlyDistanceMeters: friendly?.distanceMeters ?? null,
        lastMovementTick: movement?.tick ?? null,
        lastMovementFromPosition: movement?.from ?? null,
        distanceFromLastMovementPositionMeters: priorDistanceMeters,
        approach,
      });
    }

    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (renoKilled > 60) over60Seeds.add(seed);
    if (renoKilled >= 100 || over60Seeds.size > 5) {
      stop = { fired: true,
        reason: renoKilled >= 100 ? 'Reno killed reached >=100' : '>5 seeds exceeded 60 Reno killed',
        seed, tick, minute: minute(tick), renoKilled, over60Seeds: [...over60Seeds] };
      stopTick = tick;
      break;
    }
  }

  for (const key of groundKeys) {
    const item = groundTrack.get(key);
    item.seedPeaks.push(seedPeak.get(key));
    item.seedPeaksUnassigned.push(seedPeakUnassigned.get(key));
    if (seedPeak.get(key) > 0) item.seedsNonzero += 1;
    item.globalPeak = Math.max(item.globalPeak, seedPeak.get(key));
    item.globalPeakUnassigned = Math.max(item.globalPeakUnassigned, seedPeakUnassigned.get(key));
  }

  const state = sim.state();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const coalitionKilled = state.units.filter((unit) =>
    sourceById.get(unit.id)?.sideId === COALITION && combatIds.has(unit.id))
    .reduce((sum, unit) => sum + unit.killed, 0);
  const coalitionWounded = state.units.filter((unit) =>
    sourceById.get(unit.id)?.sideId === COALITION && combatIds.has(unit.id))
    .reduce((sum, unit) => sum + unit.wounded, 0);
  const f4 = Object.fromEntries([...WING, 'co-d'].map((id) =>
    [id, byId.get(id)?.endState ?? 'ALIVE']));
  const completeWing = WING.every((id) => f4[id] === 'DESTROYED') && f4['co-d'] === 'ALIVE';
  let composite = null;
  let components = null;
  let c4Current = null;
  if (stopTick === null) {
    const scorecard = scoreCalibrationRun({ scenario: sim.scenario, terrain, state,
      tracks: sim.tracks(), events: sim.events(), observationRows, seed });
    const outcome = extractEmergentOutcomes(
      sim.scenario, terrain, state, sim.events(), scorecard);
    envelopeOutcomes.push(outcome);
    composite = scorecard.composite;
    components = outcome.componentScores;
    const c4 = scorecard.components.find((component) => component.id === 'C4');
    const included = c4?.items.filter((item) => item.scope === 'included') ?? [];
    c4Current = { passed: included.filter((item) => item.passed).length,
      total: included.length, score: c4?.score ?? null };
  }
  rows.push({ seed, complete: stopTick === null, stopTick, scenarioHash: sim.scenarioHash,
    renoKilled, coalitionKilled, coalitionWounded,
    woundedOldPass: coalitionWounded >= 100 && coalitionWounded <= 200,
    woundedNewPass: coalitionWounded === 160,
    woundedFlip: (coalitionWounded >= 100 && coalitionWounded <= 200) !== (coalitionWounded === 160),
    c4Current, c4Lineage: { passed: 12, total: 13, score: 12 / 13 },
    completeWing, f4, composite, components });
  const partial = { registeredRange: [FIRST_SEED, LAST_SEED], rows,
    annihilations, strandings, summary: summarize(rows, stop, annihilations, strandings), stop };
  await writeFile(PROGRESS_PATH, JSON.stringify(partial, null, 2), 'utf8');
  console.error(`seed ${seed}${stopTick === null ? '' : ` partial@${stopTick}`}: ` +
    `Reno ${renoKilled}; annih ${annihilations.filter((item) => item.seed === seed).length}; ` +
    `strand ${strandings.filter((item) => item.seed === seed).length}${stop.fired ? '; STOP' : ''}`);
}

const selection = stop.fired ? null : selectBaselineSeed(envelopeOutcomes, criteria);
const lipIdentity = {
  cells: lip.length,
  northSouthSpanMeters: Math.max(...lip.map((point) => point.y)) - Math.min(...lip.map((point) => point.y)),
  maxNorthingGapMeters: Math.max(...lip.map((point) => point.y).sort((a, b) => a - b)
    .slice(1).map((value, index, values) => value - [lip.map((point) => point.y).sort((a, b) => a - b)[0], ...values][index])),
  minimumBenchDistanceMeters: Math.min(...lip.map((point) => Math.round(Math.hypot(
    point.x - benchX, point.y - benchY)))),
  westCells: lip.filter((point) => sideOf(point) === 'WEST').length,
  byteIdenticalToPinnedBenchPoint: lipBytes === referenceLipBytes,
  cellListSha256: createHash('sha256').update(lipBytes).digest('hex'),
};
const result = { registeredRange: [FIRST_SEED, LAST_SEED], criteriaHash, rows,
  envelopeOutcomes, selection, annihilations, strandings, lipIdentity,
  summary: summarize(rows, stop, annihilations, strandings), stop };
await writeFile(RESULT_PATH, JSON.stringify(result, null, 2), 'utf8');

const ground = { streamId: result.summary.scenarioHashes[0], registeredRange: [FIRST_SEED, LAST_SEED],
  grounds: Object.fromEntries(groundKeys.map((key) => {
    const item = groundTrack.get(key);
    return [key, { globalPeak: item.globalPeak, globalPeakUnassigned: item.globalPeakUnassigned,
      seedPeaks: distribution(item.seedPeaks, true),
      seedPeaksUnassigned: distribution(item.seedPeaksUnassigned, true),
      seedsNonzero: item.seedsNonzero, nonzeroTicks: item.nonzeroTicks,
      topBands: [...item.bands.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
        .map(([unit, peakStrength]) => ({ unit, peakStrength })) }];
  })) };
await writeFile(GROUND_JSON, JSON.stringify(ground, null, 2), 'utf8');
const groundLines = [`# ${CAMPAIGN.toUpperCase()} Ground-pressure Census`, '', `Stream: \`${ground.streamId}\``, '',
  '| ground | global peak | peak unassigned | seed peak min/median/max | seeds >0 | nonzero ticks |',
  '|---|---:|---:|---|---:|---:|'];
for (const [key, item] of Object.entries(ground.grounds)) groundLines.push(
  `| ${key} | ${item.globalPeak} | ${item.globalPeakUnassigned} | ` +
  `${item.seedPeaks.min}/${item.seedPeaks.median}/${item.seedPeaks.max} | ` +
  `${item.seedsNonzero}/50 | ${item.nonzeroTicks} |`);
await writeFile(GROUND_MD, `${groundLines.join('\n')}\n`, 'utf8');

const valley = { streamId: result.summary.scenarioHashes[0], registeredRange: [FIRST_SEED, LAST_SEED],
  endTick: VALLEY_END_TICK,
  engagementOpenRanges: Object.fromEntries([...valleyOpenRanges.entries()].sort().map(
    ([key, values]) => [key, rangeStats(values)])),
  firstFireRanges: Object.fromEntries([...valleyFireRanges.entries()].sort().map(
    ([key, values]) => [key, rangeStats(values)])),
  allBandsFirstFire: rangeStats([...valleyFireRanges.values()].flat()),
  engagementOpenMinutes: rangeStats(valleyOpenMinutes) };
await writeFile(VALLEY_JSON, JSON.stringify(valley, null, 2), 'utf8');
const valleyLines = [`# ${CAMPAIGN.toUpperCase()} Valley-range Baseline`, '', `Stream: \`${valley.streamId}\``, '',
  '## Engagement-open range (m)', '', '| band | n | min | p25 | median | p75 | max |',
  '|---|---:|---:|---:|---:|---:|---:|'];
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
if (stop.fired) process.exitCode = 2;
