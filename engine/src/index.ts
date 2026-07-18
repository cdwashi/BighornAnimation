import type { Scenario } from '../../src/schema/scenario-schema.js';
import { applyVariants } from '../../src/scenario/apply-variants.js';
import type { SimEvent } from './events.js';
import { updateCampDefense } from './camp-defense.js';
import { updateResupply } from './ammunition.js';
import { combatConfig, type CombatConfig } from './combat-config.js';
import { createCombatRuntime, resolveCombat, type CombatRuntime } from './combat.js';
import { updateCouriers } from './couriers.js';
import { updateEngagements } from './engagement.js';
import { updateFatigue } from './fatigue.js';
import { resolveLeaderExposure } from './leaders.js';
import { startScoutWithdrawals, updateMorale } from './morale.js';
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
  /** M4-A combat switch. Default ON; false bypasses every M4 path and PRNG draw. */
  combatEnabled?: boolean;
  /** F6/D55 hook: recompute exact pursuit paths instead of memoizing them. */
  disableCombatPathCache?: boolean;
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
  const combatEnabled = options.combatEnabled !== false;
  const combat: CombatConfig = combatConfig(options.parameterOverrides);
  const combatRuntime: CombatRuntime = createCombatRuntime(scenario, options.terrain, combat);
  let current = initializeState(scenario, options.terrain, scenarioSeed, combatEnabled);
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
    if (combatEnabled) updateCouriers(scenario, current, options.terrain, eventLog);
    deliverOrders(scenario, current, options.terrain, eventLog, pathCache, combatEnabled ? combat : undefined);
    performSpottingSweep(
      scenario,
      current,
      options.terrain,
      spottingRuntime,
      spottingEventLog,
    );
    updateCampDefense(scenario, current, options.terrain, spottingRuntime.config, eventLog);
    if (combatEnabled) {
      updateEngagements(scenario, current, combat, eventLog);
      startScoutWithdrawals(scenario, current, options.terrain, eventLog);
      resolveCombat(scenario, current, options.terrain, combatRuntime, userSeed, eventLog);
      resolveLeaderExposure(scenario, current, combat, userSeed, eventLog);
      updateMorale(scenario, current, options.terrain, combat, eventLog,
        options.disableCombatPathCache ? undefined : pathCache);
      updateResupply(scenario, current, combat, eventLog);
      updateFatigue(current, combat);
    }
  };
  processCurrentTick();
  keyframes.push({ tick: 0, state: cloneState(current) });
  unitTracks = current.units.map((unit) => [{ tick: 0, ...unit.position }]);

  const step = (): SimState => {
    current.tick += 1;
    if (combatEnabled) updateCouriers(scenario, current, options.terrain, eventLog);
    deliverOrders(scenario, current, options.terrain, eventLog, pathCache, combatEnabled ? combat : undefined);
    moveUnits(scenario, current, options.terrain, eventLog, pathCache,
      combatEnabled ? combat : undefined, options.disableCombatPathCache !== true);
    performSpottingSweep(
      scenario,
      current,
      options.terrain,
      spottingRuntime,
      spottingEventLog,
    );
    updateCampDefense(scenario, current, options.terrain, spottingRuntime.config, eventLog);
    if (combatEnabled) {
      updateEngagements(scenario, current, combat, eventLog);
      startScoutWithdrawals(scenario, current, options.terrain, eventLog);
      resolveCombat(scenario, current, options.terrain, combatRuntime, userSeed, eventLog);
      resolveLeaderExposure(scenario, current, combat, userSeed, eventLog);
      updateMorale(scenario, current, options.terrain, combat, eventLog,
        options.disableCombatPathCache ? undefined : pathCache);
      updateResupply(scenario, current, combat, eventLog);
      updateFatigue(current, combat);
    }
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
    let startingState = initializeState(scenario, options.terrain, scenarioSeed, combatEnabled);
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
export * from './ammunition.js';
export * from './camp-defense.js';
export * from './combat-config.js';
export * from './combat.js';
export * from './couriers.js';
export * from './engagement.js';
export * from './events.js';
export * from './fatigue.js';
export * from './leaders.js';
export * from './morale.js';
export * from './movement.js';
export * from './pathfind.js';
export * from './rng.js';
export * from './score.js';
export * from './serialize.js';
export * from './spotting.js';
export * from './state.js';
