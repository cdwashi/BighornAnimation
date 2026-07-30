// WO-D105 registered N=50 extraction. Seeds run in ascending registered order.
// Both live stop branches are checked after every tick; after a stop, only the
// already-observed partial row and report JSON are assembled.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const BASELINE_SEED = 18760625;
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const RETREAT_WINDOW = { start: 767.5, end: 776.5 };
const CHOKE_RADIUS_METERS = 250;
const PLANNING_BOUT_BOUND = 610;
const REGISTERED_CONVERSION_CEILING = 1_012;

const engineRoot = join(REPO, 'dist/engine/src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { runObservationExam } = await import(pathToFileURL(join(engineRoot, 'exam.js')).href);
const { scoreCalibrationRun } = await import(pathToFileURL(join(engineRoot, 'score.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href
);
const scenario = JSON.parse(await readFile(
  join(REPO, 'data/scenarios', SCENARIO_ID, 'scenario.json'),
  'utf8',
));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain', SCENARIO_ID),
);
const observationRows = runObservationExam(scenario, terrain).rows;
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const ford = landmarks.find((landmark) => landmark.id === 'ford-a');
if (!ford) throw new Error('ford-a landmark missing');
const [fordX, fordY] = terrain.toLocal(ford.position.lat, ford.position.lon);
const sideOf = (position) => terrain.channelSideAtMeters?.(position.x, position.y) ?? 'UNKNOWN';
const minute = (tick) => tick / 2;
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));
const companyIds = scenario.units.filter((unit) => unit.kind === 'CAVALRY_COMPANY')
  .map((unit) => unit.id);

const over60Seeds = new Set();
const rows = [];
let stop = null;

function blankUnitObservation() {
  return {
    firstBroken: null,
    firstRoutedMovement: null,
    firstEastAfter750: null,
    killedAtCrossing: null,
    fordEpisodes: [],
  };
}

function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  const position = (sorted.length - 1) * fraction;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function distribution(values) {
  return {
    count: values.length,
    min: values.length ? Math.min(...values) : null,
    p25: quantile(values, 0.25),
    median: quantile(values, 0.5),
    p75: quantile(values, 0.75),
    max: values.length ? Math.max(...values) : null,
    mean: values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null,
    sorted: [...values].sort((left, right) => left - right),
  };
}

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const observed = new Map([...RENO, ...WING].map((id) => [id, blankUnitObservation()]));
  const previousPositions = new Map();
  const chokeEvents = [];
  let eventCursor = 0;
  let stopTick = null;

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));
    const events = sim.events();
    for (const event of events.slice(eventCursor)) {
      if (event.type !== 'casualty-resolution' && event.type !== 'melee-bout') continue;
      const target = event.targetUnitId ? byId.get(event.targetUnitId) : undefined;
      const position = event.position ?? target?.position;
      if (!position) continue;
      const fordDistanceMeters = Math.hypot(position.x - fordX, position.y - fordY);
      if (fordDistanceMeters > CHOKE_RADIUS_METERS) continue;
      chokeEvents.push({
        tick: event.tick,
        minute: minute(event.tick),
        type: event.type === 'melee-bout' ? 'bout' : 'fire',
        unitId: event.unitId,
        targetUnitId: event.targetUnitId,
        killed: event.killed ?? 0,
        wounded: event.wounded ?? 0,
        convertedWounded: event.convertedWounded ?? 0,
        outcome: event.outcome ?? null,
        position: { ...position },
        fordDistanceMeters,
      });
    }
    eventCursor = events.length;

    for (const id of [...RENO, ...WING]) {
      const unit = byId.get(id);
      const item = observed.get(id);
      if (!unit || !item) continue;
      const now = minute(tick);
      if (item.firstBroken === null && unit.moraleState === 'BROKEN') item.firstBroken = now;
      const previous = previousPositions.get(id);
      if (item.firstRoutedMovement === null && unit.moraleState === 'ROUTED' && previous &&
        Math.hypot(unit.position.x - previous.x, unit.position.y - previous.y) > 0) {
        item.firstRoutedMovement = now;
      }
      previousPositions.set(id, { ...unit.position });

      if (RENO.includes(id)) {
        const inFord = Boolean(unit.insideFord || unit.fordHoldTicks > 0);
        const lastEpisode = item.fordEpisodes.at(-1);
        if (inFord && (!lastEpisode || lastEpisode.end !== null)) {
          item.fordEpisodes.push({ start: now, end: null });
        } else if (!inFord && lastEpisode?.end === null) {
          lastEpisode.end = now;
        }
        if (item.firstEastAfter750 === null && now > 750 && sideOf(unit.position) === 'EAST') {
          item.firstEastAfter750 = now;
          item.killedAtCrossing = unit.killed;
        }
      }
    }

    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (renoKilled > 60) over60Seeds.add(seed);
    if (renoKilled >= 100) {
      stop = {
        fired: true,
        seed,
        tick,
        minute: minute(tick),
        reason: 'registered seed reached Reno A/G/M killed >= 100',
        renoKilled,
      };
      stopTick = tick;
      break;
    }
    if (over60Seeds.size > 5) {
      stop = {
        fired: true,
        seed,
        tick,
        minute: minute(tick),
        reason: 'Reno A/G/M killed exceeded 60 in more than 5 registered seeds',
        renoKilled,
        over60Seeds: [...over60Seeds],
      };
      stopTick = tick;
      break;
    }
  }

  const state = sim.state();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  const events = sim.events();
  const fireKilledByTarget = new Map();
  const boutConvertedByTarget = new Map();
  const bouts = [];
  for (const event of events) {
    if (event.type === 'casualty-resolution' && event.targetUnitId) {
      fireKilledByTarget.set(
        event.targetUnitId,
        (fireKilledByTarget.get(event.targetUnitId) ?? 0) + (event.killed ?? 0),
      );
    } else if (event.type === 'melee-bout' && event.targetUnitId) {
      boutConvertedByTarget.set(
        event.targetUnitId,
        (boutConvertedByTarget.get(event.targetUnitId) ?? 0) + (event.convertedWounded ?? 0),
      );
      bouts.push({
        tick: event.tick,
        unitId: event.unitId,
        targetUnitId: event.targetUnitId,
        outcome: event.outcome,
        convertedWounded: event.convertedWounded ?? 0,
      });
    }
  }
  const deaths = Object.fromEntries(state.units.map((unit) => {
    const fireKilled = fireKilledByTarget.get(unit.id) ?? 0;
    const boutConverted = boutConvertedByTarget.get(unit.id) ?? 0;
    return [unit.id, {
      killed: unit.killed,
      fireKilled,
      boutConverted,
      otherKilled: unit.killed - fireKilled - boutConverted,
    }];
  }));
  const companyDeaths = Object.fromEntries(companyIds.map((id) => [id, deaths[id]]));
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const reno = Object.fromEntries(RENO.map((id) => {
    const unit = byId.get(id);
    const item = observed.get(id);
    const endedEastAlive = unit?.endState !== 'DESTROYED' && sideOf(unit.position) === 'EAST';
    return [id, {
      ...deaths[id],
      endState: unit?.endState ?? 'ALIVE',
      endMorale: unit?.moraleState ?? null,
      endSide: unit ? sideOf(unit.position) : null,
      endedEastAlive,
      firstBroken: item.firstBroken,
      firstRoutedMovement: item.firstRoutedMovement,
      crossingMinute: item.firstEastAfter750,
      killedAtCrossing: item.killedAtCrossing,
      postCrossingKilled: item.killedAtCrossing === null
        ? null
        : (unit?.killed ?? 0) - item.killedAtCrossing,
      fordEpisodes: item.fordEpisodes,
    }];
  }));
  const eastAliveCount = RENO.filter((id) => reno[id].endedEastAlive).length;
  const fordWindowOverlap = RENO.some((id) => reno[id].fordEpisodes.some((episode) =>
    episode.start <= RETREAT_WINDOW.end &&
    (episode.end === null || episode.end >= RETREAT_WINDOW.start)));
  const wing = Object.fromEntries(WING.map((id) => {
    const unit = byId.get(id);
    return [id, { endState: unit?.endState ?? 'ALIVE' }];
  }));
  const coD = byId.get('co-d');
  const completeWing = WING.every((id) => wing[id].endState === 'DESTROYED') &&
    coD?.endState !== 'DESTROYED';
  const coalitionUnits = state.units.filter((unit) => {
    const source = sourceById.get(unit.id);
    return source?.sideId === 'lakota-cheyenne-coalition' &&
      source.kind !== 'NONCOMBATANT_CAMP';
  });
  const coalitionKilled = coalitionUnits.reduce((sum, unit) => sum + unit.killed, 0);
  const destroyedBands = coalitionUnits.filter((unit) =>
    sourceById.get(unit.id)?.kind === 'WARRIOR_BAND' && unit.endState === 'DESTROYED')
    .map((unit) => unit.id);
  const outcomeCounts = { break: 0, repel: 0, held: 0 };
  for (const bout of bouts) outcomeCounts[bout.outcome] += 1;
  const convertedWounded = bouts.reduce((sum, bout) => sum + bout.convertedWounded, 0);
  let composite = null;
  let components = null;
  if (stopTick === null) {
    const scorecard = scoreCalibrationRun({
      scenario: sim.scenario,
      terrain,
      state,
      tracks: sim.tracks(),
      events,
      observationRows,
      seed,
    });
    composite = scorecard.composite;
    components = Object.fromEntries(scorecard.components.map((component) =>
      [component.id, component.score]));
  }

  rows.push({
    seed,
    complete: stopTick === null,
    stopTick,
    scenarioHash: sim.scenarioHash,
    composite,
    components,
    renoKilled,
    over60: renoKilled > 60,
    eastAliveCount,
    atLeastTwoEastAlive: eastAliveCount >= 2,
    fordWindowOverlap,
    reno,
    companyDeaths,
    wing,
    coDEndState: coD?.endState ?? 'ALIVE',
    completeWing,
    coalitionKilled,
    destroyedBands,
    chokeEvents,
    boutCount: bouts.length,
    boutOutcomes: outcomeCounts,
    convertedWounded,
    conversionExclusivityViolations: bouts.filter((bout) =>
      bout.convertedWounded > 0 && bout.outcome !== 'break'),
    allUnitOtherKilled: Object.entries(deaths).filter(([, value]) => value.otherKilled !== 0),
  });
  console.error(`seed ${seed}: Reno killed ${renoKilled}; east-alive ${eastAliveCount}; ` +
    `bouts ${bouts.length} (${outcomeCounts.break}/${outcomeCounts.repel}/${outcomeCounts.held}); ` +
    `converted ${convertedWounded}; wing ${completeWing ? 'complete' : 'incomplete'}; ` +
    `coalition killed ${coalitionKilled}; choke ${chokeEvents.length}${stop ? '; STOP' : ''}`);
}

const completeRows = rows.filter((row) => row.complete);
const result = {
  registeredRange: [FIRST_SEED, LAST_SEED],
  baselineSeed: BASELINE_SEED,
  planningBoutBound: PLANNING_BOUT_BOUND,
  registeredConversionCeiling: REGISTERED_CONVERSION_CEILING,
  ford: {
    id: ford.id,
    localPosition: { x: fordX, y: fordY },
    radiusMeters: CHOKE_RADIUS_METERS,
  },
  rows,
  summary: {
    completeSeeds: completeRows.length,
    renoKilled: distribution(completeRows.map((row) => row.renoKilled)),
    compositePercent: distribution(completeRows.map((row) => row.composite * 100)),
    coalitionKilled: distribution(completeRows.map((row) => row.coalitionKilled)),
    boutCount: distribution(completeRows.map((row) => row.boutCount)),
    conversions: distribution(completeRows.map((row) => row.convertedWounded)),
    totalConversions: completeRows.reduce((sum, row) => sum + row.convertedWounded, 0),
    totalBouts: completeRows.reduce((sum, row) => sum + row.boutCount, 0),
    outcomeTotals: completeRows.reduce((totals, row) => ({
      break: totals.break + row.boutOutcomes.break,
      repel: totals.repel + row.boutOutcomes.repel,
      held: totals.held + row.boutOutcomes.held,
    }), { break: 0, repel: 0, held: 0 }),
    seedsWithAtLeastTwoEastAlive: completeRows.filter((row) => row.atLeastTwoEastAlive).length,
    completeWingSeeds: completeRows.filter((row) => row.completeWing).length,
    seedsWithBandDestruction: completeRows.filter((row) => row.destroyedBands.length > 0).length,
    seedsWithChokeEvents: completeRows.filter((row) => row.chokeEvents.length > 0).length,
    chokeEvents: completeRows.reduce((sum, row) => sum + row.chokeEvents.length, 0),
    over60Seeds: [...over60Seeds],
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
  },
  stop: stop ?? { fired: false },
};
const outputPath = join(tmpdir(), 'bighorn-wo-d105-campaign-results.json');
await writeFile(outputPath, JSON.stringify(result, null, 2));
console.log(outputPath);
