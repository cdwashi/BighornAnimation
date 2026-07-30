import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = process.cwd();
const scenarioId = 'little-bighorn-1876';
const engineRoot = join(repo, 'dist/engine/src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { hashState } = await import(pathToFileURL(join(engineRoot, 'serialize.js')).href);
const { getPathfindMetrics, resetPathfindMetrics } = await import(
  pathToFileURL(join(engineRoot, 'pathfind.js')).href
);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(repo, 'dist/src/terrain/movement-loader.js')).href
);
const scenario = JSON.parse(await readFile(
  join(repo, 'data/scenarios', scenarioId, 'scenario.json'),
  'utf8',
));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(repo, 'data/terrain', scenarioId),
);

const checkpoints = [1, 360, 1080, 2160];
const checkpointSim = createSim(scenario, {
  seed: 18760625,
  terrain,
  combatEnabled: false,
});
const noCombatHashes = {};
for (const tick of checkpoints) {
  checkpointSim.run(tick);
  noCombatHashes[tick] = hashState(checkpointSim.state());
}
const noCombatOtherSeed = createSim(scenario, {
  seed: 42,
  terrain,
  combatEnabled: false,
});
noCombatOtherSeed.run(2160);

resetPathfindMetrics();
const combat = createSim(scenario, { seed: 18760625, terrain });
combat.run(2160);

console.log(JSON.stringify({
  label: process.argv[2] ?? null,
  scenarioHash: combat.scenarioHash,
  noCombat: {
    checkpointHashes: noCombatHashes,
    finalOtherSeedHash: hashState(noCombatOtherSeed.state()),
    draws: checkpointSim.state().rng.draws,
  },
  combat: {
    finalHash: hashState(combat.state()),
    pathfind: getPathfindMetrics(),
  },
}, null, 2));
