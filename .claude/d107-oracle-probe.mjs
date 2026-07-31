import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const scenarioId = 'little-bighorn-1876';
const engineRoot = join(repo, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { hashState } = await import(pathToFileURL(join(engineRoot, 'serialize.js')).href);
const { getPathfindMetrics, resetPathfindMetrics } = await import(
  pathToFileURL(join(engineRoot, 'pathfind.js')).href
);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(repo, 'dist', 'src', 'terrain', 'movement-loader.js')).href
);
const scenario = JSON.parse(await readFile(
  join(repo, 'data', 'scenarios', scenarioId, 'scenario.json'),
  'utf8',
));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(repo, 'data', 'terrain', scenarioId),
);

const checkpoints = [1, 360, 1080, 2160];
const noCombat = createSim(scenario, { seed: 18760625, terrain, combatEnabled: false });
const noCombatHashes = {};
for (const tick of checkpoints) {
  noCombat.run(tick);
  noCombatHashes[tick] = hashState(noCombat.state());
}

resetPathfindMetrics();
const wholeCreate = createSim(scenario, { seed: 18760625, terrain });
wholeCreate.run(2160);
const wholeCreateMetrics = getPathfindMetrics();

const runOnly = createSim(scenario, { seed: 18760625, terrain });
resetPathfindMetrics();
runOnly.run(2160);
const runOnlyMetrics = getPathfindMetrics();

console.log(JSON.stringify({
  scenarioHash: runOnly.scenarioHash,
  noCombat: {
    hashes: noCombatHashes,
    draws: noCombat.state().rng.draws,
  },
  combat: {
    hash: hashState(runOnly.state()),
    wholeCreatePathfind: wholeCreateMetrics,
    runOnlyPathfind: runOnlyMetrics,
  },
}, null, 2));
