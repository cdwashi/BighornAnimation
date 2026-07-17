import type { Scenario } from '../../src/schema/scenario-schema.js';
import { applyVariants } from '../../src/scenario/apply-variants.js';
import type { SimEvent } from './events.js';
import { updateCampDefense } from './camp-defense.js';
import { moveUnits } from './movement.js';
import type { PathCache } from './objectives.js';
import { deliverOrders } from './orders.js';
import type { EngineTerrain } from './pathfind.js';
import type { TrackSample } from './score.js';
import {
  createSpottingRuntime,
  performSpottingSweep,
  type SpottingEvent,
  type SpottingRuntime,
} from './spotting.js';
import {
  cloneState,
  fnv1a,
  hashScenario,
  type SaveFile,
  type SimKeyframe,
} from './serialize.js';
import { initializeState, type SimState } from './state.js';

export interface CreateSimOptions {
  variants?: readonly string[];
  seed?: string | number;
  terrain: EngineTerrain;
  parameterOverrides?: Readonly<Record<string, number>>;
  /** D55 cache-equivalence gate hook: recompute every ray instead of memoizing. */
  disableSpottingCache?: boolean;
}

export interface LoadOptions { useKeyframes?: boolean; targetTick?: number }

export interface Simulator {
  readonly scenario: Scenario;
  readonly scenarioHash: string;
  readonly seed: string | number;
  step(): SimState;
  run(toTick: number): SimState;
  save(includeKeyframes?: boolean): SaveFile;
  load(save: SaveFile, options?: LoadOptions): SimState;
  events(): readonly SimEvent[];
  spottingEvents(): readonly SpottingEvent[];
  state(): SimState;
  tracks(): readonly (readonly TrackSample[])[];
}

function sameStrings(left: readonly string[], right: readonly string[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

export function createSim(baseScenario: Scenario, options: CreateSimOptions): Simulator {
  const enabledVariantIds = [...(options.variants ?? [])];
  const scenario = applyVariants(baseScenario, enabledVariantIds);
  const scenarioHash = hashScenario(baseScenario);
  const seed = options.seed ?? 0;
  const userSeed = typeof seed === 'number' ? seed >>> 0 : Number.parseInt(fnv1a(seed), 16) >>> 0;
  const scenarioSeed = Number.parseInt(scenarioHash, 16) >>> 0;
  const parameters = { ...(options.parameterOverrides ?? {}) };
  let current = initializeState(scenario, options.terrain, scenarioSeed);
  let eventLog: SimEvent[] = [];
  let spottingEventLog: SpottingEvent[] = [];
  let spottingRuntime: SpottingRuntime = createSpottingRuntime(
    scenario,
    options.terrain,
    options.parameterOverrides,
    options.disableSpottingCache !== true,
  );
  let pathCache: PathCache = new Map();
  let unitTracks: TrackSample[][] = current.units.map((unit) => [{
    tick: current.tick,
    ...unit.position,
  }]);
  let keyframes: SimKeyframe[] = [];

  const captureKeyframe = (): void => {
    if (current.tick % 10 === 0) keyframes.push({ tick: current.tick, state: cloneState(current) });
  };
  const recordTracks = (): void => {
    current.units.forEach((unit, index) => unitTracks[index].push({
      tick: current.tick,
      ...unit.position,
    }));
  };
  const processCurrentTick = (): void => {
    deliverOrders(scenario, current, options.terrain, eventLog, pathCache);
    performSpottingSweep(
      scenario,
      current,
      options.terrain,
      spottingRuntime,
      spottingEventLog,
    );
    updateCampDefense(scenario, current, options.terrain, spottingRuntime.config, eventLog);
  };
  processCurrentTick();
  keyframes.push({ tick: 0, state: cloneState(current) });
  unitTracks = current.units.map((unit) => [{ tick: 0, ...unit.position }]);

  const step = (): SimState => {
    current.tick += 1;
    deliverOrders(scenario, current, options.terrain, eventLog, pathCache);
    moveUnits(scenario, current, options.terrain, eventLog, pathCache);
    performSpottingSweep(
      scenario,
      current,
      options.terrain,
      spottingRuntime,
      spottingEventLog,
    );
    updateCampDefense(scenario, current, options.terrain, spottingRuntime.config, eventLog);
    recordTracks();
    captureKeyframe();
    return current;
  };

  const run = (toTick: number): SimState => {
    if (!Number.isInteger(toTick) || toTick < current.tick) {
      throw new RangeError(`Cannot run from tick ${current.tick} to ${toTick}`);
    }
    while (current.tick < toTick) step();
    return current;
  };

  const resetRuntime = (state: SimState): void => {
    current = cloneState(state);
    eventLog = [];
    spottingEventLog = [];
    spottingRuntime = createSpottingRuntime(
      scenario,
      options.terrain,
      options.parameterOverrides,
      options.disableSpottingCache !== true,
    );
    pathCache = new Map();
    unitTracks = current.units.map((unit) => [{ tick: current.tick, ...unit.position }]);
    keyframes = [];
  };

  const load = (saveFile: SaveFile, loadOptions: LoadOptions = {}): SimState => {
    if (saveFile.scenarioId !== scenario.meta.id) {
      throw new Error(`Save scenario id mismatch: expected ${scenario.meta.id}, received ${saveFile.scenarioId}`);
    }
    if (saveFile.scenarioHash !== scenarioHash) {
      throw new Error(`Save scenario hash mismatch: expected ${scenarioHash}, received ${saveFile.scenarioHash}`);
    }
    if (!sameStrings(saveFile.enabledVariantIds, enabledVariantIds)) {
      throw new Error('Save enabled variants do not match this simulation');
    }
    if (saveFile.seed !== seed) throw new Error('Save seed does not match this simulation');
    void userSeed;
    const targetTick = loadOptions.targetTick ?? saveFile.targetTick;
    let startingState = initializeState(scenario, options.terrain, scenarioSeed);
    if (loadOptions.useKeyframes && saveFile.keyframes) {
      for (const keyframe of saveFile.keyframes) {
        if (keyframe.tick <= targetTick && keyframe.tick >= startingState.tick) {
          startingState = keyframe.state;
        }
      }
    }
    resetRuntime(startingState);
    if (current.tick === 0) processCurrentTick();
    keyframes.push({ tick: current.tick, state: cloneState(current) });
    return run(targetTick);
  };

  return {
    scenario,
    scenarioHash,
    seed,
    step,
    run,
    save: (includeKeyframes = true): SaveFile => ({
      formatVersion: 1,
      scenarioId: scenario.meta.id,
      scenarioHash,
      enabledVariantIds: [...enabledVariantIds],
      parameterOverrides: { ...parameters },
      seed,
      targetTick: current.tick,
      keyframes: includeKeyframes
        ? keyframes.map((keyframe) => ({ tick: keyframe.tick, state: cloneState(keyframe.state) }))
        : undefined,
    }),
    load,
    events: () => eventLog,
    spottingEvents: () => spottingEventLog,
    state: () => current,
    tracks: () => unitTracks,
  };
}

export * from './clock.js';
export * from './camp-defense.js';
export * from './events.js';
export * from './movement.js';
export * from './pathfind.js';
export * from './rng.js';
export * from './score.js';
export * from './serialize.js';
export * from './spotting.js';
export * from './state.js';
