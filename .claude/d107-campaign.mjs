// WO-D107 registered N=50 campaign and load-bearing event audits.
// Seeds run in ascending order. Both RE-ARMED STOP branches are checked after
// every tick; on a fire, this script writes the partial JSON and root STOP
// report before exiting without running another simulation tick.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const SIDE = 'lakota-cheyenne-coalition';
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const CENSUS = { wingCatches: 198, renoAnnihilationEligible: 2 };
const CHOKE_RADIUS_METERS = 250;
const ISO = 650;
const RESULT_PATH = join(REPO, '.claude', 'd107-campaign-results.json');
const PROGRESS_PATH = join(REPO, '.claude', 'd107-campaign-progress.json');
const STOP_REPORT_PATH = join(REPO, 'codex-report-wo-d107.md');

const engineRoot = join(REPO, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
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
const companyIds = scenario.units.filter((unit) => unit.kind === 'CAVALRY_COMPANY')
  .map((unit) => unit.id);
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const ford = landmarks.find((landmark) => landmark.id === 'ford-a');
if (!ford) throw new Error('ford-a landmark missing');
const [fordX, fordY] = terrain.toLocal(ford.position.lat, ford.position.lon);
const sideOf = (position) =>
  terrain.channelSideAtMeters?.(position.x, position.y) ?? 'UNKNOWN';
const minute = (tick) => tick * scenario.clock.tickSeconds / 60;

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
  const sorted = [...values].sort((left, right) => left - right);
  return {
    count: values.length,
    min: values.length ? sorted[0] : null,
    p25: quantile(values, 0.25),
    median: quantile(values, 0.5),
    upperMedian: values.length ? sorted[Math.floor(values.length / 2)] : null,
    p75: quantile(values, 0.75),
    max: values.length ? sorted.at(-1) : null,
    mean: values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null,
    sorted,
  };
}

function snapshot(state) {
  return new Map(state.units.map((unit) => [unit.id, {
    moraleState: unit.moraleState,
    endState: unit.endState,
    withdrawnOffField: unit.withdrawnOffField,
    strengthCurrent: unit.strengthCurrent,
    position: { ...unit.position },
  }]));
}

function eligibleFriends(state, target, shadow) {
  const sideId = sourceById.get(target.id)?.sideId;
  return state.units.filter((friend) => {
    const status = shadow.get(friend.id);
    if (friend.id === target.id || status?.endState || friend.withdrawnOffField) return false;
    const source = sourceById.get(friend.id);
    if (!source || source.sideId !== sideId || source.kind === 'NONCOMBATANT_CAMP') return false;
    if ((status?.moraleState ?? friend.moraleState) !== 'STEADY') return false;
    return Math.hypot(
      friend.position.x - target.position.x,
      friend.position.y - target.position.y,
    ) <= ISO;
  }).map((friend) => ({
    id: friend.id,
    distanceMeters: Math.hypot(
      friend.position.x - target.position.x,
      friend.position.y - target.position.y,
    ),
    strengthCurrent: friend.strengthCurrent,
    strengthTotal: friend.strengthTotal,
  })).sort((left, right) => left.distanceMeters - right.distanceMeters);
}

function eventClass(targetId) {
  if (RENO.includes(targetId)) return 'RENO';
  if (WING.includes(targetId)) return 'WING';
  return 'other';
}

function aggregate(rows, over60Seeds, stop) {
  const completeRows = rows.filter((row) => row.complete);
  const companyCompletion = Object.fromEntries(WING.map((id) => [
    id,
    completeRows.filter((row) => row.companyEndStates[id] === 'DESTROYED').length,
  ]));
  const companyCatch = Object.fromEntries([...WING, ...RENO].map((id) => [
    id,
    completeRows.reduce((sum, row) =>
      sum + row.bouts.filter((bout) =>
        bout.targetUnitId === id && (bout.outcome === 'annihilation' || bout.shelteredBy)).length, 0),
  ]));
  const companyAnnihilation = Object.fromEntries([...WING, ...RENO].map((id) => [
    id,
    completeRows.reduce((sum, row) =>
      sum + row.bouts.filter((bout) =>
        bout.targetUnitId === id && bout.outcome === 'annihilation').length, 0),
  ]));
  const allBouts = completeRows.flatMap((row) => row.bouts);
  const annihilations = allBouts.filter((bout) => bout.outcome === 'annihilation');
  const suppressions = allBouts.filter((bout) => bout.shelteredBy);
  const chokeEvents = allBouts.filter((bout) => bout.fordDistanceMeters <= CHOKE_RADIUS_METERS);
  const accountingViolations = completeRows.flatMap((row) => row.accountingViolations);
  const auditViolations = completeRows.flatMap((row) => row.auditViolations);
  return {
    completeSeeds: completeRows.length,
    renoKilled: distribution(completeRows.map((row) => row.renoKilled)),
    coalitionKilled: distribution(completeRows.map((row) => row.coalitionKilled)),
    compositePercent: distribution(completeRows.map((row) => row.composite * 100)),
    boutCount: distribution(completeRows.map((row) => row.bouts.length)),
    annihilationCount: distribution(completeRows.map((row) =>
      row.bouts.filter((bout) => bout.outcome === 'annihilation').length)),
    completeWingSeeds: completeRows.filter((row) => row.completeWing).length,
    eastSurvivalSeeds: completeRows.filter((row) => row.eastAliveCount >= 2).length,
    companyCompletion,
    companyCatch,
    companyAnnihilation,
    totalBouts: allBouts.length,
    outcomeTotals: {
      break: allBouts.filter((bout) => bout.outcome === 'break').length,
      annihilation: annihilations.length,
      repel: allBouts.filter((bout) => bout.outcome === 'repel').length,
      held: allBouts.filter((bout) => bout.outcome === 'held').length,
    },
    catches: annihilations.length + suppressions.length,
    wingCatches: allBouts.filter((bout) =>
      bout.class === 'WING' && (bout.outcome === 'annihilation' || bout.shelteredBy)).length,
    renoCatches: allBouts.filter((bout) =>
      bout.class === 'RENO' && (bout.outcome === 'annihilation' || bout.shelteredBy)).length,
    renoAnnihilations: annihilations.filter((bout) => bout.class === 'RENO').length,
    annihilations,
    suppressions,
    chokeEvents,
    accountingViolations,
    auditViolations,
    over60Seeds: [...over60Seeds],
    stop,
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
  };
}

function stopReport(result) {
  const rows = result.rows;
  const summary = result.summary;
  const fmt = (value) => value === null ? 'n/a' :
    Number.isInteger(value) ? String(value) : value.toFixed(2);
  const measured = rows.map((row) =>
    `| ${row.seed} | ${row.complete ? 'complete' : `partial @ tick ${row.stopTick}`} | ` +
    `${row.renoKilled} | ${row.eastAliveCount} | ${row.coalitionKilled} | ` +
    `${row.bouts.filter((bout) => bout.outcome === 'annihilation').length} |`).join('\n');
  return `# WO-D107 close-action finishing — RE-ARMED STOP report

Execution date: 2026-07-30  
Starting HEAD: \`a501f06ccef26877579cc5ad21bd37dcd697398a\`  
Registered seeds: \`18760600–18760649\`  
Status: **HALTED immediately by the binding RE-ARMED STOP; no tuning, commit, or push**

## STOP status

**STOP FIRED:** ${result.stop.reason} at seed ${result.stop.seed}, tick
${result.stop.tick} (minute ${minute(result.stop.tick)}), with Reno A/G/M killed
${result.stop.renoKilled}. Seeds exceeding 60 at the stop:
${result.stop.over60Seeds.join(', ') || 'none'}.

The campaign wrote this report and the partial machine-readable record before
exiting. No further simulation, oracle refresh, score/envelope regeneration,
quartet command, lint, test suite, build, tuning, or repair was run.

## Evidence measured before the halt

- Complete registered seeds: **${summary.completeSeeds}/50**
- Reno killed on complete seeds: min ${fmt(summary.renoKilled.min)}, median
  ${fmt(summary.renoKilled.median)}, max ${fmt(summary.renoKilled.max)}
- Complete wing: **${summary.completeWingSeeds}/${summary.completeSeeds}**
- At least two A/G/M alive east: **${summary.eastSurvivalSeeds}/${summary.completeSeeds}**
- Coalition killed median: **${fmt(summary.coalitionKilled.median)}**
- Bouts: break ${summary.outcomeTotals.break}, annihilation
  ${summary.outcomeTotals.annihilation}, repel ${summary.outcomeTotals.repel},
  held ${summary.outcomeTotals.held}
- Audit violations measured on complete seeds: eligibility
  ${summary.auditViolations.length}, accounting ${summary.accountingViolations.length}
- Scenario hashes observed: ${summary.scenarioHashes.map((hash) => `\`${hash}\``).join(', ')}

| Seed | State | Reno killed | East alive | Coalition killed | Annihilations |
|---:|---|---:|---:|---:|---:|
${measured}

## Gates not run after STOP

The five named D107 tests and focused D105/D106 regressions passed before the
campaign. The quartet, final F4, refreshed oracles, final protected-content
audit, PR-45–PR-50 verdicts, and after score/envelope are intentionally
unexecuted/unscored because the frozen work order requires immediate
adjudication.

## AMBIGUITIES

None encountered before the binding stop.

## DEVIATIONS

None. The early halt and omission of all later gates are required behavior,
not a deviation.
`;
}

const rows = [];
const over60Seeds = new Set();
let stop = { fired: false };

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop.fired; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  let eventCursor = 0;
  let previous = new Map();
  let stopTick = null;
  const bouts = [];

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));
    const events = sim.events();
    const shadow = new Map(state.units.map((unit) => {
      const prior = previous.get(unit.id);
      return [unit.id, {
        moraleState: prior?.moraleState ?? unit.moraleState,
        endState: prior?.endState,
        withdrawnOffField: unit.withdrawnOffField,
        strengthCurrent: prior?.strengthCurrent ?? unit.strengthCurrent,
        position: { ...unit.position },
      }];
    }));
    for (; eventCursor < events.length; eventCursor += 1) {
      const event = events[eventCursor];
      if (event.type === 'unit-destroyed') {
        const status = shadow.get(event.unitId);
        if (status) status.endState = 'DESTROYED';
      }
      if (event.type !== 'melee-bout' || !event.targetUnitId) continue;
      const target = byId.get(event.targetUnitId);
      if (!target) continue;
      const priorTarget = shadow.get(target.id);
      const friends = eligibleFriends(state, target, shadow);
      const position = { ...target.position };
      const fordDistanceMeters = Math.hypot(position.x - fordX, position.y - fordY);
      const shelter = event.shelteredBy
        ? byId.get(event.shelteredBy.id)
        : undefined;
      bouts.push({
        seed,
        tick: event.tick,
        minute: minute(event.tick),
        unitId: event.unitId,
        targetUnitId: target.id,
        class: eventClass(target.id),
        outcome: event.outcome,
        convertedWounded: event.convertedWounded ?? 0,
        terminalConverted: event.terminalConverted ?? 0,
        shelteredBy: event.shelteredBy ? {
          ...event.shelteredBy,
          strengthTotal: shelter?.strengthTotal ?? null,
          strengthRatio: shelter
            ? event.shelteredBy.strengthCurrent / shelter.strengthTotal
            : null,
        } : null,
        defenderWasRouted: priorTarget?.moraleState === 'ROUTED',
        eligibleFriendIds: friends.map((friend) => friend.id),
        position,
        channelSide: sideOf(position),
        fordDistanceMeters,
      });
      if (event.outcome === 'break' || event.outcome === 'annihilation') {
        const status = shadow.get(target.id);
        if (status) {
          status.moraleState = 'ROUTED';
          if (event.outcome === 'annihilation') status.endState = 'DESTROYED';
        }
      }
    }

    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (renoKilled > 60) over60Seeds.add(seed);
    if (renoKilled >= 100) {
      stop = {
        fired: true,
        reason: 'a registered seed reached Reno A/G/M killed >= 100',
        seed,
        tick,
        renoKilled,
        over60Seeds: [...over60Seeds],
      };
      stopTick = tick;
      break;
    }
    if (over60Seeds.size > 5) {
      stop = {
        fired: true,
        reason: 'Reno A/G/M killed exceeded 60 in more than 5/50 registered seeds',
        seed,
        tick,
        renoKilled,
        over60Seeds: [...over60Seeds],
      };
      stopTick = tick;
      break;
    }
    previous = snapshot(state);
  }

  const state = sim.state();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  const events = sim.events();
  const fireKilled = new Map();
  const boutConverted = new Map();
  const terminalConverted = new Map();
  for (const event of events) {
    if (event.type === 'casualty-resolution' && event.targetUnitId) {
      fireKilled.set(
        event.targetUnitId,
        (fireKilled.get(event.targetUnitId) ?? 0) + (event.killed ?? 0),
      );
    }
    if (event.type === 'melee-bout' && event.targetUnitId) {
      boutConverted.set(
        event.targetUnitId,
        (boutConverted.get(event.targetUnitId) ?? 0) + (event.convertedWounded ?? 0),
      );
      terminalConverted.set(
        event.targetUnitId,
        (terminalConverted.get(event.targetUnitId) ?? 0) + (event.terminalConverted ?? 0),
      );
    }
  }
  const accounting = Object.fromEntries(state.units.map((unit) => [unit.id, {
    killed: unit.killed,
    fireKilled: fireKilled.get(unit.id) ?? 0,
    boutConverted: boutConverted.get(unit.id) ?? 0,
    terminalConverted: terminalConverted.get(unit.id) ?? 0,
    residual: unit.killed - (fireKilled.get(unit.id) ?? 0) -
      (boutConverted.get(unit.id) ?? 0) - (terminalConverted.get(unit.id) ?? 0),
  }]));
  const accountingViolations = Object.entries(accounting)
    .filter(([, item]) => item.residual !== 0)
    .map(([unitId, item]) => ({ seed, unitId, ...item }));
  const auditViolations = bouts.filter((bout) =>
    (bout.outcome === 'annihilation' &&
      (!bout.defenderWasRouted || bout.shelteredBy || bout.eligibleFriendIds.length > 0)) ||
    (bout.shelteredBy && (bout.outcome !== 'break' || !bout.defenderWasRouted)));
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const eastAliveCount = RENO.filter((id) => {
    const unit = byId.get(id);
    return unit && !unit.endState && sideOf(unit.position) === 'EAST';
  }).length;
  const companyEndStates = Object.fromEntries(companyIds.map((id) => [
    id,
    byId.get(id)?.endState ?? 'ALIVE',
  ]));
  const completeWing = WING.every((id) => companyEndStates[id] === 'DESTROYED') &&
    companyEndStates['co-d'] === 'ALIVE';
  const coalitionKilled = state.units.filter((unit) => {
    const source = sourceById.get(unit.id);
    return source?.sideId === SIDE && source.kind !== 'NONCOMBATANT_CAMP';
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
    renoKilled,
    renoByCompany: Object.fromEntries(RENO.map((id) => [id, byId.get(id)?.killed ?? 0])),
    eastAliveCount,
    coalitionKilled,
    companyEndStates,
    completeWing,
    bouts,
    accounting,
    accountingViolations,
    auditViolations,
    composite,
    components,
  });

  const partialResult = {
    registeredRange: [FIRST_SEED, LAST_SEED],
    census: CENSUS,
    ford: {
      id: ford.id,
      localPosition: { x: fordX, y: fordY },
      radiusMeters: CHOKE_RADIUS_METERS,
    },
    rows,
    summary: aggregate(rows, over60Seeds, stop),
    stop,
  };
  await writeFile(PROGRESS_PATH, JSON.stringify(partialResult, null, 2));
  console.error(`seed ${seed}${stopTick === null ? '' : ` partial@${stopTick}`}: ` +
    `Reno ${renoKilled}; east ${eastAliveCount}; coalition ${coalitionKilled}; ` +
    `bouts ${bouts.length}; annih ${bouts.filter((bout) =>
      bout.outcome === 'annihilation').length}; suppress ${bouts.filter((bout) =>
      bout.shelteredBy).length}; wing ${completeWing ? 'complete' : 'incomplete'}; ` +
    `audit ${auditViolations.length}; accounting ${accountingViolations.length}` +
    `${stop.fired ? '; STOP' : ''}`);
}

const result = {
  registeredRange: [FIRST_SEED, LAST_SEED],
  census: CENSUS,
  ford: {
    id: ford.id,
    localPosition: { x: fordX, y: fordY },
    radiusMeters: CHOKE_RADIUS_METERS,
  },
  rows,
  summary: aggregate(rows, over60Seeds, stop),
  stop,
};
await writeFile(RESULT_PATH, JSON.stringify(result, null, 2));
if (stop.fired) {
  await writeFile(STOP_REPORT_PATH, stopReport(result));
  console.log(`STOP report: ${STOP_REPORT_PATH}`);
} else {
  console.log(RESULT_PATH);
}
