// WO-D108 Amendment 1 registered campaign instrument. Seeds run in ascending
// order and both re-armed stop branches are checked after every simulation tick.
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const COALITION = 'lakota-cheyenne-coalition';
const BENCH_FEATURE_ID = 'scenario-bench';
const RESULT_PATH = join(REPO, 'reports', 'd108-campaign-results.json');
const PROGRESS_PATH = join(REPO, 'reports', 'd108-campaign-progress.json');

const engineRoot = join(REPO, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { extractBenchLip } = await import(pathToFileURL(join(engineRoot, 'lip.js')).href);
const { partitionLipCells } = await import(
  pathToFileURL(join(engineRoot, 'camp-defense.js')).href
);
const { runObservationExam } = await import(pathToFileURL(join(engineRoot, 'exam.js')).href);
const { scoreCalibrationRun } = await import(pathToFileURL(join(engineRoot, 'score.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist', 'src', 'terrain', 'movement-loader.js')).href
);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data', 'scenarios', SCENARIO_ID, 'scenario.json'),
  'utf8',
));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data', 'terrain', SCENARIO_ID),
);
const observationRows = runObservationExam(scenario, terrain).rows;
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));
const warriorIds = new Set(scenario.units.filter((unit) =>
  unit.sideId === COALITION && unit.kind !== 'NONCOMBATANT_CAMP' && unit.id !== 'pony-herd')
  .map((unit) => unit.id));
const benchSource = (scenario.coverFeatures ?? []).find((feature) => feature.id === 'bench');
if (!benchSource) throw new Error('scenario bench missing');
const [benchX, benchY] = terrain.toLocal(
  benchSource.position.lat,
  benchSource.position.lon,
);
const benchPoint = { x: benchX, y: benchY };
const lip = extractBenchLip(terrain, benchPoint);
const coordinate = (value) => value.toFixed(6);
const pointKey = (point) => `${coordinate(point.x)},${coordinate(point.y)}`;
const lipIndex = new Map(lip.map((point, index) => [pointKey(point), index]));

// The forty-first measurement counts timber occupancy within one 10 m cell of
// a substrate feature cell. Pre-expand those cells so the per-tick audit is O(1).
const timberCells = new Set();
for (const feature of terrain.coverFeatures?.() ?? []) {
  for (const point of feature.points) {
    const cellX = Math.round(point.x / 10);
    const cellY = Math.round(point.y / 10);
    for (let dx = -1; dx <= 1; dx += 1) {
      for (let dy = -1; dy <= 1; dy += 1) timberCells.add(`${cellX + dx},${cellY + dy}`);
    }
  }
}

const minute = (tick) => tick * scenario.clock.tickSeconds / 60;
const sideOf = (point) => terrain.channelSideAtMeters?.(point.x, point.y) ?? 'UNKNOWN';

function quantile(values, fraction) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.min(sorted.length - 1, Math.floor(fraction * sorted.length))];
}

function distribution(values, includeSorted = false) {
  const sorted = [...values].sort((left, right) => left - right);
  const result = {
    count: sorted.length,
    min: sorted.length ? sorted[0] : null,
    p25: quantile(sorted, 0.25),
    median: quantile(sorted, 0.5),
    p75: quantile(sorted, 0.75),
    max: sorted.length ? sorted.at(-1) : null,
    mean: sorted.length
      ? sorted.reduce((sum, value) => sum + value, 0) / sorted.length
      : null,
  };
  return includeSorted ? { ...result, sorted } : result;
}

function maxPairDistance(points) {
  let maximum = 0;
  for (let left = 0; left < points.length; left += 1) {
    for (let right = left + 1; right < points.length; right += 1) {
      maximum = Math.max(maximum, Math.hypot(
        points[left].x - points[right].x,
        points[left].y - points[right].y,
      ));
    }
  }
  return maximum;
}

function summarize(rows, stop, pooledCentroidRanges, pooledEffectiveRanges) {
  const complete = rows.filter((row) => row.complete);
  const allAuditViolations = complete.flatMap((row) => row.goalAudit.violations);
  const allEastAnnihilations = complete.flatMap((row) => row.eastRenoAnnihilations);
  return {
    completedSeeds: complete.length,
    stop,
    lip: {
      cells: lip.length,
      northSouthSpanMeters: Math.max(...lip.map((point) => point.y)) -
        Math.min(...lip.map((point) => point.y)),
      westCells: lip.filter((point) => sideOf(point) === 'WEST').length,
    },
    pressureWithin30: distribution(complete.map((row) => row.peakPressureWithin30), true),
    pressureBelow615Seeds: complete.filter((row) => row.peakPressureWithin30 < 615).length,
    minGoalNorthSouthSpan: distribution(complete
      .filter((row) => row.goalAudit.sampledTicksAtLeast3 > 0)
      .map((row) => row.goalAudit.minNorthSouthSpanMeters), true),
    minGoalPairSpan: distribution(complete
      .filter((row) => row.goalAudit.sampledTicksAtLeast3 > 0)
      .map((row) => row.goalAudit.minPairSpanMeters), true),
    goalSpanViolationTicks: complete.reduce((sum, row) =>
      sum + row.goalAudit.spanViolationTicks, 0),
    goalAuditViolations: allAuditViolations,
    centroidRanges: distribution(pooledCentroidRanges),
    effectiveRanges: distribution(pooledEffectiveRanges),
    perSeedCentroidMedian: distribution(complete
      .map((row) => row.standWindow.centroidMedian)
      .filter((value) => value !== null), true),
    perSeedEffectiveMedian: distribution(complete
      .map((row) => row.standWindow.effectiveMedian)
      .filter((value) => value !== null), true),
    renoKilled: distribution(complete.map((row) => row.renoKilled), true),
    over60Seeds: complete.filter((row) => row.renoKilled > 60).map((row) => row.seed),
    eastRenoAnnihilations: allEastAnnihilations,
    completeWingSeeds: complete.filter((row) => row.completeWing).length,
    companyDestruction: Object.fromEntries(WING.map((id) => [
      id,
      complete.filter((row) => row.companyEndStates[id] === 'DESTROYED').length,
    ])),
    coalitionKilled: distribution(complete.map((row) => row.coalitionKilled), true),
    compositePercent: distribution(complete.map((row) => row.composite * 100), true),
    endpointFlankEvents: complete.reduce((sum, row) => sum + row.endpointFlankEvents, 0),
    angularFlankEvents: complete.reduce((sum, row) => sum + row.angularFlankEvents, 0),
    timberPressure: distribution(complete.map((row) => row.peakTimberPressure), true),
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
  };
}

await mkdir(join(REPO, 'reports'), { recursive: true });
const rows = [];
const over60Seeds = new Set();
const pooledCentroidRanges = [];
const pooledEffectiveRanges = [];
let stop = { fired: false };

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop.fired; seed += 1) {
  const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
  let eventCursor = 0;
  let peakPressureWithin30 = 0;
  let peakTimberPressure = 0;
  let stopTick = null;
  const eastRenoAnnihilations = [];
  const layouts = new Map();
  const goalAudit = {
    sampledTicks: 0,
    sampledTicksAtLeast3: 0,
    minNorthSouthSpanMeters: null,
    minPairSpanMeters: null,
    spanViolationTicks: 0,
    violations: [],
  };

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));

    let pressure = 0;
    let timberPressure = 0;
    for (const unit of state.units) {
      if (!warriorIds.has(unit.id) || unit.endState === 'DESTROYED') continue;
      if (Math.hypot(unit.position.x - benchX, unit.position.y - benchY) <= 30) {
        pressure += unit.strengthAvailable;
      }
      const timberKey = `${Math.round(unit.position.x / 10)},${Math.round(unit.position.y / 10)}`;
      if (timberCells.has(timberKey)) timberPressure += unit.strengthAvailable;
    }
    peakPressureWithin30 = Math.max(peakPressureWithin30, pressure);
    peakTimberPressure = Math.max(peakTimberPressure, timberPressure);

    const holders = state.units.filter((unit) =>
      unit.endState !== 'DESTROYED' && unit.campDefense?.featureId === BENCH_FEATURE_ID)
      .sort((left, right) => left.id.localeCompare(right.id));
    if (holders.length > 0) {
      goalAudit.sampledTicks += 1;
      const expected = partitionLipCells(lip, holders.map((holder) => holder.id));
      const expectedById = new Map(expected.map((slot) => [slot.unitId, slot.goal]));
      const goals = holders.flatMap((holder) => holder.campDefense?.goal
        ? [{ unitId: holder.id, ...holder.campDefense.goal }]
        : []);
      const goalKeys = goals.map((goal) => pointKey(goal));
      const violations = [];
      if (goals.length !== holders.length) violations.push('goal count != assigned count');
      if (new Set(goalKeys).size !== goals.length) violations.push('duplicate goal');
      for (const goal of goals) {
        if (!lipIndex.has(pointKey(goal))) violations.push(`${goal.unitId}: goal not on lip`);
        if (sideOf(goal) !== 'WEST') violations.push(`${goal.unitId}: goal not WEST`);
        const expectedGoal = expectedById.get(goal.unitId);
        if (!expectedGoal || pointKey(expectedGoal) !== pointKey(goal)) {
          violations.push(`${goal.unitId}: partition mismatch`);
        }
      }
      if (violations.length > 0) {
        goalAudit.violations.push({ seed, tick, minute: minute(tick), violations, goals });
      }
      const layoutKey = goals.map((goal) => `${goal.unitId}@${lipIndex.get(pointKey(goal)) ?? 'X'}`)
        .join('|');
      const layout = layouts.get(layoutKey) ?? {
        layout: layoutKey,
        firstTick: tick,
        lastTick: tick,
        sampledTicks: 0,
      };
      layout.lastTick = tick;
      layout.sampledTicks += 1;
      layouts.set(layoutKey, layout);
      if (goals.length >= 3) {
        goalAudit.sampledTicksAtLeast3 += 1;
        const northSouthSpan = Math.max(...goals.map((goal) => goal.y)) -
          Math.min(...goals.map((goal) => goal.y));
        const pairSpan = maxPairDistance(goals);
        goalAudit.minNorthSouthSpanMeters = goalAudit.minNorthSouthSpanMeters === null
          ? northSouthSpan
          : Math.min(goalAudit.minNorthSouthSpanMeters, northSouthSpan);
        goalAudit.minPairSpanMeters = goalAudit.minPairSpanMeters === null
          ? pairSpan
          : Math.min(goalAudit.minPairSpanMeters, pairSpan);
        if (northSouthSpan < 150) goalAudit.spanViolationTicks += 1;
      }
    }

    const events = sim.events();
    for (; eventCursor < events.length; eventCursor += 1) {
      const event = events[eventCursor];
      if (event.type !== 'melee-bout' || event.outcome !== 'annihilation' ||
        !event.targetUnitId || !RENO.includes(event.targetUnitId)) continue;
      const target = byId.get(event.targetUnitId);
      if (target && sideOf(target.position) === 'EAST') {
        eastRenoAnnihilations.push({
          seed,
          tick: event.tick,
          minute: minute(event.tick),
          targetUnitId: event.targetUnitId,
          unitId: event.unitId,
          position: { ...target.position },
        });
      }
    }

    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (renoKilled > 60) over60Seeds.add(seed);
    if (renoKilled >= 100 || over60Seeds.size > 5) {
      stop = {
        fired: true,
        reason: renoKilled >= 100
          ? 'a registered seed reached Reno A/G/M killed >= 100'
          : 'Reno A/G/M killed exceeded 60 in more than 5/50 registered seeds',
        seed,
        tick,
        minute: minute(tick),
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
  const fireMetrics = sim.combatMetrics();
  const centroidRanges = [];
  const effectiveRanges = [];
  for (const metric of fireMetrics.fireResolutions) {
    const source = sourceById.get(metric.attackerId);
    if (source?.sideId === COALITION && warriorIds.has(metric.attackerId) &&
      RENO.includes(metric.targetId) && minute(metric.tick) >= 700 && minute(metric.tick) <= 800) {
      centroidRanges.push(metric.centroidRangeMeters);
      effectiveRanges.push(metric.effectiveRangeMeters);
    }
  }
  if (stopTick === null) {
    pooledCentroidRanges.push(...centroidRanges);
    pooledEffectiveRanges.push(...effectiveRanges);
  }
  const companyEndStates = Object.fromEntries(
    [...RENO, ...WING, 'co-d'].map((id) => [id, byId.get(id)?.endState ?? 'ALIVE']),
  );
  const completeWing = WING.every((id) => companyEndStates[id] === 'DESTROYED') &&
    companyEndStates['co-d'] === 'ALIVE';
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const coalitionKilled = state.units.filter((unit) => {
    const source = sourceById.get(unit.id);
    return source?.sideId === COALITION && source.kind !== 'NONCOMBATANT_CAMP';
  }).reduce((sum, unit) => sum + unit.killed, 0);
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
    peakPressureWithin30,
    peakTimberPressure,
    goalAudit: {
      ...goalAudit,
      layouts: [...layouts.values()],
    },
    standWindow: {
      events: centroidRanges.length,
      centroid: distribution(centroidRanges),
      effective: distribution(effectiveRanges),
      centroidMedian: quantile(centroidRanges, 0.5),
      effectiveMedian: quantile(effectiveRanges, 0.5),
    },
    renoKilled,
    renoByCompany: Object.fromEntries(RENO.map((id) => [id, byId.get(id)?.killed ?? 0])),
    eastRenoAnnihilations,
    companyEndStates,
    completeWing,
    coalitionKilled,
    endpointFlankEvents: fireMetrics.endpointFlankEvents,
    angularFlankEvents: fireMetrics.angularFlankEvents,
    composite,
    components,
  });

  const partial = {
    registeredRange: [FIRST_SEED, LAST_SEED],
    benchPoint,
    rows,
    summary: summarize(rows, stop, pooledCentroidRanges, pooledEffectiveRanges),
    stop,
  };
  await writeFile(PROGRESS_PATH, JSON.stringify(partial, null, 2));
  console.error(`seed ${seed}${stopTick === null ? '' : ` partial@${stopTick}`}: ` +
    `pressure ${peakPressureWithin30}; Reno ${renoKilled}; coalition ${coalitionKilled}; ` +
    `wing ${completeWing ? 'complete' : 'incomplete'}; goal-audit ${goalAudit.violations.length}; ` +
    `span-red ${goalAudit.spanViolationTicks}; east-annih ${eastRenoAnnihilations.length}` +
    `${stop.fired ? '; STOP' : ''}`);
}

const result = {
  registeredRange: [FIRST_SEED, LAST_SEED],
  benchPoint,
  rows,
  summary: summarize(rows, stop, pooledCentroidRanges, pooledEffectiveRanges),
  stop,
};
await writeFile(RESULT_PATH, JSON.stringify(result, null, 2));
console.log(RESULT_PATH);
if (stop.fired) process.exitCode = 2;
