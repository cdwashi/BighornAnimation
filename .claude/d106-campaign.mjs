// WO-D106 registered N=50 extraction. Registered seeds run in ascending order.
// Both live stop branches are checked after every tick. The campaign records
// the D106 ownership audit, hill/wing mode decomposition, D92 switching, and
// raw maximal starvation-signature windows without inventing a "sustained"
// duration threshold.
import { readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const PREVIEW_LAST_SEED = 18760633;
const SIDE = 'lakota-cheyenne-coalition';
const RENO = ['co-a', 'co-g', 'co-m'];
const RENO_SET = new Set(RENO);
const HILL_ALWAYS = new Set(['co-h', 'co-d', 'co-k', 'pack-train']);
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const WING_SET = new Set(WING);
const MODES = ['order-axis', 'combat-pursuit', 'initiative', 'camp-defence', 'unattributed'];
const CAMP_RADIUS_METERS = 3_000;
const SWITCH_MARGIN_METERS = 250;

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
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));
const minute = (tick) => tick * scenario.clock.tickSeconds / 60;
const sideOf = (position) =>
  terrain.channelSideAtMeters?.(position.x, position.y) ?? 'UNKNOWN';

function blankModes() {
  return Object.fromEntries(MODES.map((mode) => [mode, { events: 0, killed: 0 }]));
}

function addModes(target, source) {
  for (const mode of MODES) {
    target[mode].events += source[mode].events;
    target[mode].killed += source[mode].killed;
  }
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
  const sorted = [...values].sort((left, right) => left - right);
  return {
    count: values.length,
    min: values.length ? Math.min(...values) : null,
    p25: quantile(values, 0.25),
    median: quantile(values, 0.5),
    upperMedian: values.length ? sorted[Math.floor(sorted.length / 2)] : null,
    p75: quantile(values, 0.75),
    max: values.length ? Math.max(...values) : null,
    mean: values.length
      ? values.reduce((sum, value) => sum + value, 0) / values.length
      : null,
    sorted,
  };
}

function candidateThreats(state, holder) {
  const holderSource = sourceById.get(holder.id);
  const picture = state.believedPictures[holderSource.sideId] ?? {};
  const camps = state.units.filter((unit) => {
    const source = sourceById.get(unit.id);
    return source.sideId === holderSource.sideId &&
      source.kind === 'NONCOMBATANT_CAMP' && unit.id !== 'pony-herd';
  });
  const entries = [];
  for (const [targetId, belief] of Object.entries(picture)) {
    if (belief.status !== 'spotted') continue;
    const target = state.units.find((unit) => unit.id === targetId);
    const source = target && sourceById.get(target.id);
    if (!target || target.endState === 'DESTROYED' || target.withdrawnOffField) continue;
    if (source.sideId === holderSource.sideId || source.kind === 'NONCOMBATANT_CAMP' ||
      source.tacticsProfileId === 'irregular-scout') continue;
    for (const camp of camps) {
      const distanceMeters = Math.hypot(
        belief.lastSeenPos.x - camp.position.x,
        belief.lastSeenPos.y - camp.position.y,
      );
      if (distanceMeters <= CAMP_RADIUS_METERS) {
        entries.push({ target, camp, belief, distanceMeters });
      }
    }
  }
  return entries.sort((left, right) =>
    left.distanceMeters - right.distanceMeters ||
    left.target.id.localeCompare(right.target.id) ||
    left.camp.id.localeCompare(right.camp.id));
}

function starvationSignature(state, holder) {
  const commitment = holder.campDefense;
  if (!commitment) return null;
  const camp = state.units.find((unit) => unit.id === commitment.campUnitId);
  const sideId = sourceById.get(holder.id).sideId;
  const belief = state.believedPictures[sideId]?.[commitment.threatUnitId];
  if (!camp || !belief) return null;
  const currentDistanceMeters = Math.hypot(
    belief.lastSeenPos.x - camp.position.x,
    belief.lastSeenPos.y - camp.position.y,
  );
  const alternatives = candidateThreats(state, holder)
    .filter((candidate) => candidate.target.id !== commitment.threatUnitId)
    .filter((candidate) => candidate.distanceMeters < currentDistanceMeters)
    .filter((candidate) => !state.engagements.some((engagement) =>
      engagement.active && engagement.unitIds.includes(candidate.target.id)))
    .map((candidate) => ({
      targetUnitId: candidate.target.id,
      campUnitId: candidate.camp.id,
      distanceMeters: candidate.distanceMeters,
      closerByMeters: currentDistanceMeters - candidate.distanceMeters,
      switchEligible:
        candidate.distanceMeters + SWITCH_MARGIN_METERS < currentDistanceMeters,
    }));
  if (alternatives.length === 0) return null;
  return {
    committedThreatUnitId: commitment.threatUnitId,
    committedCampUnitId: commitment.campUnitId,
    currentDistanceMeters,
    alternatives,
  };
}

function extendWindow(openWindows, completedWindows, unitId, tick, signature) {
  const open = openWindows.get(unitId);
  if (!signature) {
    if (open) {
      open.endTick = tick - 1;
      open.durationTicks = open.endTick - open.startTick + 1;
      open.durationMinutes = minute(open.durationTicks);
      completedWindows.push(open);
      openWindows.delete(unitId);
    }
    return;
  }
  const alternativeIds = signature.alternatives.map((item) => item.targetUnitId);
  const switchEligible = signature.alternatives.some((item) => item.switchEligible);
  if (!open) {
    openWindows.set(unitId, {
      unitId,
      startTick: tick,
      endTick: null,
      durationTicks: null,
      durationMinutes: null,
      committedThreatUnitIds: [signature.committedThreatUnitId],
      alternativeThreatUnitIds: [...new Set(alternativeIds)].sort(),
      maxCloserByMeters: Math.max(...signature.alternatives.map((item) => item.closerByMeters)),
      switchEligibleTicks: switchEligible ? 1 : 0,
    });
    return;
  }
  if (!open.committedThreatUnitIds.includes(signature.committedThreatUnitId)) {
    open.committedThreatUnitIds.push(signature.committedThreatUnitId);
  }
  open.alternativeThreatUnitIds = [...new Set([
    ...open.alternativeThreatUnitIds,
    ...alternativeIds,
  ])].sort();
  open.maxCloserByMeters = Math.max(
    open.maxCloserByMeters,
    ...signature.alternatives.map((item) => item.closerByMeters),
  );
  if (switchEligible) open.switchEligibleTicks += 1;
}

function closeWindows(openWindows, completedWindows, endTick) {
  for (const open of openWindows.values()) {
    open.endTick = endTick;
    open.durationTicks = open.endTick - open.startTick + 1;
    open.durationMinutes = minute(open.durationTicks);
    completedWindows.push(open);
  }
  openWindows.clear();
}

const rows = [];
const over60Seeds = new Set();
let stop = null;

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const initialState = sim.state();
  const poolIds = initialState.units.filter((unit) => unit.defaultBehavior === 'DEFEND_CAMP')
    .map((unit) => unit.id).sort();
  const previousCommitments = new Map();
  const openWindows = new Map();
  const starvationWindows = [];
  const switchEvents = [];
  const holderSamplesByUnit = Object.fromEntries(poolIds.map((id) => [id, 0]));
  const holderPursuitViolations = [];
  const hillModes = blankModes();
  const wingModes = blankModes();
  let eventCursor = 0;
  let stopTick = null;
  let lastTick = 0;

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    lastTick = tick;
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));
    const events = sim.events();

    for (; eventCursor < events.length; eventCursor += 1) {
      const event = events[eventCursor];
      if (event.type !== 'casualty-resolution') continue;
      const attacker = byId.get(event.unitId);
      if (!attacker || sourceById.get(attacker.id)?.sideId !== SIDE) continue;
      let theater = null;
      if (HILL_ALWAYS.has(event.targetUnitId)) theater = 'hill';
      else if (RENO_SET.has(event.targetUnitId) && event.position &&
        sideOf(event.position) === 'EAST') theater = 'hill';
      else if (WING_SET.has(event.targetUnitId)) theater = 'wing';
      if (!theater) continue;
      let mode = 'unattributed';
      if (attacker.pursuit?.kind === 'COMBAT') mode = 'combat-pursuit';
      else if (attacker.pursuit?.kind === 'INITIATIVE') mode = 'initiative';
      else if (attacker.campDefense) mode = 'camp-defence';
      else if (attacker.activeOrderId !== undefined) mode = 'order-axis';
      const table = theater === 'hill' ? hillModes : wingModes;
      table[mode].events += 1;
      table[mode].killed += event.killed ?? 0;
    }

    for (const id of poolIds) {
      const holder = byId.get(id);
      const previous = previousCommitments.get(id);
      const current = holder.campDefense
        ? {
            campUnitId: holder.campDefense.campUnitId,
            threatUnitId: holder.campDefense.threatUnitId,
          }
        : null;
      if (previous && current && previous.threatUnitId !== current.threatUnitId) {
        switchEvents.push({
          tick,
          minute: minute(tick),
          unitId: id,
          fromThreatUnitId: previous.threatUnitId,
          toThreatUnitId: current.threatUnitId,
          fromCampUnitId: previous.campUnitId,
          toCampUnitId: current.campUnitId,
        });
      }
      if (current) previousCommitments.set(id, current);
      else previousCommitments.delete(id);

      if (holder.campDefense) {
        holderSamplesByUnit[id] += 1;
        if (holder.pursuit?.kind === 'COMBAT' || holder.pursuit?.kind === 'INITIATIVE') {
          holderPursuitViolations.push({
            tick,
            minute: minute(tick),
            unitId: id,
            pursuitKind: holder.pursuit.kind,
            pursuitTargetUnitId: holder.pursuit.targetUnitId,
            committedThreatUnitId: holder.campDefense.threatUnitId,
          });
        }
      }
      extendWindow(
        openWindows,
        starvationWindows,
        id,
        tick,
        holder.campDefense ? starvationSignature(state, holder) : null,
      );
    }

    const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
    if (holderPursuitViolations.length > 0) {
      stop = {
        fired: true,
        seed,
        tick,
        minute: minute(tick),
        renoKilled,
        reason: 'PR-43 implementation error: commitment holder carried COMBAT/INITIATIVE pursuit',
        violation: holderPursuitViolations.at(-1),
      };
      stopTick = tick;
      break;
    }
    if (renoKilled > 60) over60Seeds.add(seed);
    if (renoKilled >= 100) {
      stop = {
        fired: true,
        seed,
        tick,
        minute: minute(tick),
        renoKilled,
        reason: 'registered seed reached Reno A/G/M killed >= 100',
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
        renoKilled,
        over60Seeds: [...over60Seeds],
        reason: 'Reno A/G/M killed exceeded 60 in more than 5 registered seeds',
      };
      stopTick = tick;
      break;
    }
  }

  closeWindows(openWindows, starvationWindows, lastTick);
  const state = sim.state();
  const events = sim.events();
  const byId = new Map(state.units.map((unit) => [unit.id, unit]));
  const renoKilledByUnit = Object.fromEntries(RENO.map((id) => [id, byId.get(id).killed]));
  const renoKilled = Object.values(renoKilledByUnit).reduce((sum, killed) => sum + killed, 0);
  const eastAliveByUnit = Object.fromEntries(RENO.map((id) => {
    const unit = byId.get(id);
    return [id, unit.endState !== 'DESTROYED' && sideOf(unit.position) === 'EAST'];
  }));
  const eastAliveCount = Object.values(eastAliveByUnit).filter(Boolean).length;
  const coalitionUnits = state.units.filter((unit) => {
    const source = sourceById.get(unit.id);
    return source.sideId === SIDE && source.kind !== 'NONCOMBATANT_CAMP';
  });
  const coalitionKilled = coalitionUnits.reduce((sum, unit) => sum + unit.killed, 0);
  const completeWing = WING.every((id) => byId.get(id).endState === 'DESTROYED') &&
    byId.get('co-d').endState !== 'DESTROYED';
  const boutOutcomes = { break: 0, repel: 0, held: 0 };
  for (const event of events) {
    if (event.type === 'melee-bout') boutOutcomes[event.outcome] += 1;
  }
  const boutCount = Object.values(boutOutcomes).reduce((sum, count) => sum + count, 0);
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
    previewed: seed <= PREVIEW_LAST_SEED,
    complete: stopTick === null,
    stopTick,
    scenarioHash: sim.scenarioHash,
    poolIds,
    renoKilled,
    renoKilledByUnit,
    over60: renoKilled > 60,
    eastAliveCount,
    eastAliveByUnit,
    atLeastTwoEastAlive: eastAliveCount >= 2,
    coalitionKilled,
    completeWing,
    hillModes,
    wingModes,
    boutCount,
    boutOutcomes,
    holderSamplesByUnit,
    holderPursuitViolations,
    switchEvents,
    starvationWindows,
    composite,
    components,
  });
  console.error(`seed ${seed}: Reno ${renoKilled}; coalition ${coalitionKilled}; ` +
    `east ${eastAliveCount}; wing ${completeWing ? 'complete' : 'incomplete'}; ` +
    `hill ${MODES.map((mode) => `${mode}=${hillModes[mode].killed}`).join(',')}; ` +
    `holder-violations ${holderPursuitViolations.length}; switches ${switchEvents.length}; ` +
    `starvation-windows ${starvationWindows.length}${stop ? '; STOP' : ''}`);
}

const completeRows = rows.filter((row) => row.complete);
const previewRows = completeRows.filter((row) => row.previewed);
const unseenRows = completeRows.filter((row) => !row.previewed);
const hillModes = blankModes();
const wingModes = blankModes();
for (const row of completeRows) {
  addModes(hillModes, row.hillModes);
  addModes(wingModes, row.wingModes);
}
const switchEventsByUnit = {};
const holderSamplesByUnit = {};
for (const row of completeRows) {
  for (const id of row.poolIds) {
    switchEventsByUnit[id] = (switchEventsByUnit[id] ?? 0) +
      row.switchEvents.filter((event) => event.unitId === id).length;
    holderSamplesByUnit[id] = (holderSamplesByUnit[id] ?? 0) +
      row.holderSamplesByUnit[id];
  }
}

const result = {
  registeredRange: [FIRST_SEED, LAST_SEED],
  previewedRange: [FIRST_SEED, PREVIEW_LAST_SEED],
  modes: MODES,
  starvationDefinition: {
    eligibility:
      'D92 spotted, non-scout, live enemy within 3000 m of a defended camp, using believed position',
    nearer:
      'candidate camp-distance strictly below committed threat distance; switchEligible also records the ruled 250 m margin',
    unengaged:
      'candidate belongs to no active engagement in serialized state',
    sustained:
      'raw maximal contiguous windows reported; no duration threshold invented',
  },
  rows,
  summary: {
    completeSeeds: completeRows.length,
    previewedCompleteSeeds: previewRows.length,
    unseenCompleteSeeds: unseenRows.length,
    renoKilled: distribution(completeRows.map((row) => row.renoKilled)),
    previewedRenoKilled: distribution(previewRows.map((row) => row.renoKilled)),
    unseenRenoKilled: distribution(unseenRows.map((row) => row.renoKilled)),
    coalitionKilled: distribution(completeRows.map((row) => row.coalitionKilled)),
    previewedCoalitionKilled: distribution(previewRows.map((row) => row.coalitionKilled)),
    unseenCoalitionKilled: distribution(unseenRows.map((row) => row.coalitionKilled)),
    compositePercent: distribution(completeRows.map((row) => row.composite * 100)),
    boutCount: distribution(completeRows.map((row) => row.boutCount)),
    boutOutcomes: completeRows.reduce((total, row) => ({
      break: total.break + row.boutOutcomes.break,
      repel: total.repel + row.boutOutcomes.repel,
      held: total.held + row.boutOutcomes.held,
    }), { break: 0, repel: 0, held: 0 }),
    completeWingSeeds: completeRows.filter((row) => row.completeWing).length,
    previewedCompleteWingSeeds: previewRows.filter((row) => row.completeWing).length,
    unseenCompleteWingSeeds: unseenRows.filter((row) => row.completeWing).length,
    seedsWithAtLeastTwoEastAlive:
      completeRows.filter((row) => row.atLeastTwoEastAlive).length,
    previewedSeedsWithAtLeastTwoEastAlive:
      previewRows.filter((row) => row.atLeastTwoEastAlive).length,
    unseenSeedsWithAtLeastTwoEastAlive:
      unseenRows.filter((row) => row.atLeastTwoEastAlive).length,
    hillModes,
    wingModes,
    holderSamplesByUnit,
    holderSamples: Object.values(holderSamplesByUnit).reduce((sum, count) => sum + count, 0),
    holderPursuitViolations: completeRows.flatMap((row) =>
      row.holderPursuitViolations.map((item) => ({ seed: row.seed, ...item }))),
    switchEventsByUnit,
    switchEvents: completeRows.flatMap((row) =>
      row.switchEvents.map((item) => ({ seed: row.seed, ...item }))),
    starvationWindows: completeRows.flatMap((row) =>
      row.starvationWindows.map((item) => ({ seed: row.seed, ...item }))),
    over60Seeds: [...over60Seeds],
    scenarioHashes: [...new Set(rows.map((row) => row.scenarioHash))],
  },
  stop: stop ?? { fired: false },
};

const outputPath = join(tmpdir(), 'bighorn-wo-d106-campaign-results.json');
await writeFile(outputPath, JSON.stringify(result, null, 2));
console.log(outputPath);
