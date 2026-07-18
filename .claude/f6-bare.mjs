// Dev-only F6 bare measurement: one clean full-day run per process invocation.
import { readFile } from 'node:fs/promises';
import { performance } from 'node:perf_hooks';
import { createSim, getPathfindMetrics, resetPathfindMetrics } from '../dist/engine/src/index.js';
import { TerrainMovementLoader } from '../dist/src/terrain/movement-loader.js';

const scenario = JSON.parse(await readFile('data/scenarios/little-bighorn-1876/scenario.json', 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory('data/terrain/little-bighorn-1876');
const sim = createSim(scenario, { seed: 18760625, terrain });
resetPathfindMetrics();
const started = performance.now();
sim.run(2160);
const elapsed = performance.now() - started;
console.log(JSON.stringify({ elapsedMs: Number(elapsed.toFixed(1)), pathfind: getPathfindMetrics() }));
