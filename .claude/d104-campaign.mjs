// WO-D104 registered N=50 extraction. Runs seeds in ascending registered order
// and checks the live stop after every tick; no later tick or seed runs once it fires.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = 18760600;
const LAST_SEED = 18760649;
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const HILLTOP = ['hunkpapa-pool', 'gall-band', 'crazy-horse-band', 'lwm-band'];
const RETREAT_WINDOW = { start: 767.5, end: 776.5 };
const CHOKE_RADIUS_METERS = 250;

const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
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
const landmarks = scenario.terrain?.landmarks ?? scenario.landmarks ?? [];
const ford = landmarks.find((landmark) => landmark.id === 'ford-a');
if (!ford) throw new Error('ford-a landmark missing');
const [fordX, fordY] = terrain.toLocal(ford.position.lat, ford.position.lon);
const sideOf = (position) => terrain.channelSideAtMeters?.(position.x, position.y) ?? 'UNKNOWN';
const minute = (tick) => tick / 2;
const sourceById = new Map(scenario.units.map((unit) => [unit.id, unit]));

const over60Seeds = new Set();
const rows = [];
let stop = null;

function blankUnitObservation() {
  return {
    firstBroken: null,
    firstRouted: null,
    firstRoutedLivePath: null,
    firstRoutedMovement: null,
    firstEastAfter750: null,
    killedAtCrossing: null,
    fordEpisodes: [],
  };
}

for (let seed = FIRST_SEED; seed <= LAST_SEED && !stop; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const observed = new Map([...RENO, ...WING].map((id) => [id, blankUnitObservation()]));
  const previousPositions = new Map();
  let stopTick = null;

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    const byId = new Map(state.units.map((unit) => [unit.id, unit]));

    for (const id of [...RENO, ...WING]) {
      const unit = byId.get(id);
      const observation = observed.get(id);
      if (!unit || !observation) continue;
      const now = minute(tick);
      if (observation.firstBroken === null && unit.moraleState === 'BROKEN') {
        observation.firstBroken = now;
      }
      if (observation.firstRouted === null && unit.moraleState === 'ROUTED') {
        observation.firstRouted = now;
      }
      if (observation.firstRoutedLivePath === null && unit.moraleState === 'ROUTED' &&
        unit.pathIndex < unit.path.length) {
        observation.firstRoutedLivePath = now;
      }
      const previous = previousPositions.get(id);
      if (observation.firstRoutedMovement === null && unit.moraleState === 'ROUTED' && previous &&
        Math.hypot(unit.position.x - previous.x, unit.position.y - previous.y) > 0) {
        observation.firstRoutedMovement = now;
      }
      previousPositions.set(id, { ...unit.position });

      if (RENO.includes(id)) {
        const inFord = Boolean(unit.insideFord || unit.fordHoldTicks > 0);
        const lastEpisode = observation.fordEpisodes.at(-1);
        if (inFord && (!lastEpisode || lastEpisode.end !== null)) {
          observation.fordEpisodes.push({ start: now, end: null });
        } else if (!inFord && lastEpisode?.end === null) {
          lastEpisode.end = now;
        }
        if (observation.firstEastAfter750 === null && now > 750 &&
          sideOf(unit.position) === 'EAST') {
          observation.firstEastAfter750 = now;
          observation.killedAtCrossing = unit.killed;
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
  const renoKilled = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
  const reno = Object.fromEntries(RENO.map((id) => {
    const unit = byId.get(id);
    const observation = observed.get(id);
    const endedEastAlive = unit?.endState !== 'DESTROYED' && sideOf(unit.position) === 'EAST';
    return [id, {
      killed: unit?.killed ?? null,
      endState: unit?.endState ?? 'ALIVE',
      endMorale: unit?.moraleState ?? null,
      endSide: unit ? sideOf(unit.position) : null,
      endedEastAlive,
      firstBroken: observation.firstBroken,
      firstRouted: observation.firstRouted,
      firstRoutedLivePath: observation.firstRoutedLivePath,
      firstRoutedMovement: observation.firstRoutedMovement,
      crossingMinute: observation.firstEastAfter750,
      killedAtCrossing: observation.killedAtCrossing,
      postCrossingKilled: observation.killedAtCrossing === null
        ? null
        : (unit?.killed ?? 0) - observation.killedAtCrossing,
      fordEpisodes: observation.fordEpisodes,
    }];
  }));
  const eastAliveCount = RENO.filter((id) => reno[id].endedEastAlive).length;
  const fordWindowOverlap = RENO.some((id) => reno[id].fordEpisodes.some((episode) =>
    episode.start <= RETREAT_WINDOW.end &&
    (episode.end === null || episode.end >= RETREAT_WINDOW.start)));
  const wing = Object.fromEntries(WING.map((id) => {
    const unit = byId.get(id);
    const observation = observed.get(id);
    return [id, {
      endState: unit?.endState ?? 'ALIVE',
      firstRouted: observation.firstRouted,
      firstRoutedLivePath: observation.firstRoutedLivePath,
      firstRoutedMovement: observation.firstRoutedMovement,
    }];
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
  const chokeEvents = events.filter((event) =>
    event.type === 'casualty-resolution' && event.position &&
    Math.hypot(event.position.x - fordX, event.position.y - fordY) <= CHOKE_RADIUS_METERS);
  const chokeByTarget = {};
  for (const event of chokeEvents) {
    chokeByTarget[event.targetUnitId] = (chokeByTarget[event.targetUnitId] ?? 0) +
      (event.casualties ?? 0);
  }
  const hilltop = Object.fromEntries(HILLTOP.map((id) => {
    const unit = byId.get(id);
    return [id, {
      killed: unit?.killed ?? null,
      wounded: unit?.wounded ?? null,
      casualties: unit?.casualties ?? null,
      endState: unit?.endState ?? 'ALIVE',
    }];
  }));

  rows.push({
    seed,
    complete: stopTick === null,
    stopTick,
    scenarioHash: sim.scenarioHash,
    renoKilled,
    over60: renoKilled > 60,
    eastAliveCount,
    atLeastTwoEastAlive: eastAliveCount >= 2,
    fordWindowOverlap,
    reno,
    wing,
    coDEndState: coD?.endState ?? 'ALIVE',
    completeWing,
    coalitionKilled,
    destroyedBands,
    chokeEventCount: chokeEvents.length,
    chokeByTarget,
    hilltop,
  });
  console.error(`seed ${seed}: Reno killed ${renoKilled}; east-alive ${eastAliveCount}; ` +
    `wing ${completeWing ? 'complete' : 'incomplete'}; coalition killed ${coalitionKilled}; ` +
    `choke events ${chokeEvents.length}${stop ? '; STOP' : ''}`);
}

console.log(JSON.stringify({
  registeredRange: [FIRST_SEED, LAST_SEED],
  rows,
  over60Seeds: [...over60Seeds],
  stop: stop ?? { fired: false },
}, null, 2));
