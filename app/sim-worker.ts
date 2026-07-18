/// <reference lib="webworker" />

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import { createSim, type Simulator } from '../engine/src/index';
import { createSpottingRuntime, observerSignature, type SpottingRuntime } from '../engine/src/spotting';
import type { SaveFile } from '../engine/src/serialize';
import type { Scenario } from '../src/schema/scenario-schema';
import { TerrainMovementLoader } from '../src/terrain/movement-loader';
import { computeViewshedRaster, prepareViewshedCover } from '../src/terrain/viewshed';
import type { WorkerRequest, WorkerResponse } from './lib/sim-messages';

const scenario = scenarioData as unknown as Scenario;
let terrain: TerrainMovementLoader;
let sim: Simulator;
let fullSave: SaveFile;
let spottingRuntime: SpottingRuntime;
const viewshedCache = new Map<string, { width: number; height: number; values: Uint8ClampedArray }>();

function send(message: WorkerResponse, transfer: Transferable[] = []): void {
  self.postMessage(message, transfer);
}

async function initialize(tick: number): Promise<void> {
  terrain = await TerrainMovementLoader.fromUrl(new URL('/terrain/manifest.json', self.location.origin));
  spottingRuntime = createSpottingRuntime(scenario, terrain);
  prepareViewshedCover(spottingRuntime, terrain.fullBounds(), 30);
  sim = createSim(scenario, { terrain });
  const endTick = (18 * 60 * 60) / scenario.clock.tickSeconds;
  const started = performance.now();
  sim.run(endTick);
  const runMilliseconds = performance.now() - started;
  fullSave = sim.save(true);
  const events = [...sim.events()];
  const spottingEvents = [...sim.spottingEvents()];
  sim.load(fullSave, { useKeyframes: true, targetTick: tick });
  send({ type: 'ready', state: sim.state(), events, spottingEvents, runMilliseconds });
}

function seek(tick: number): void {
  sim.load(fullSave, { useKeyframes: true, targetTick: tick });
  send({ type: 'state', state: sim.state() });
}

function advance(tick: number): void {
  if (tick < sim.state().tick) seek(tick);
  else if (tick - sim.state().tick > 10) {
    sim.load(fullSave, { useKeyframes: true, targetTick: tick });
    send({ type: 'state', state: sim.state() });
  }
  else {
    sim.run(tick);
    send({ type: 'state', state: sim.state() });
  }
}

function viewshed(leaderId: string, atmosphericFactor: number): void {
  const leader = scenario.leaders.find((item) => item.id === leaderId);
  if (!leader) throw new Error(`Unknown leader ${leaderId}`);
  const attached = sim.state().units.find((unit) => unit.id === leader.attachedToUnitId);
  if (!attached) throw new Error(`Leader ${leaderId} has no attached runtime unit`);
  const key = `${leaderId}:${sim.state().tick}:${atmosphericFactor}`;
  let raster = viewshedCache.get(key);
  const started = performance.now();
  if (!raster) {
    const observer = observerSignature(scenario, attached, spottingRuntime.config);
    raster = computeViewshedRaster(terrain, spottingRuntime, {
      bounds: terrain.fullBounds(),
      resolutionMeters: 30,
      observer: attached.position,
      observerHeightMeters: observer.heightMeters,
      targetHeightMeters: spottingRuntime.config.heightStanding,
      atmosphericFactor,
    });
    viewshedCache.set(key, raster);
  }
  const milliseconds = performance.now() - started;
  const values = raster.values.slice();
  send({
    type: 'viewshed', leaderId, tick: sim.state().tick,
    width: raster.width, height: raster.height, values, milliseconds,
  }, [values.buffer]);
}

self.onmessage = (event: MessageEvent<WorkerRequest>): void => {
  const request = event.data;
  try {
    if (request.type === 'init') void initialize(request.tick).catch(reportError);
    else if (request.type === 'seek') seek(request.tick);
    else if (request.type === 'advance') advance(request.tick);
    else viewshed(request.leaderId, request.atmosphericFactor);
  } catch (error) {
    reportError(error);
  }
};

function reportError(error: unknown): void {
  send({ type: 'error', message: error instanceof Error ? error.message : String(error) });
}
