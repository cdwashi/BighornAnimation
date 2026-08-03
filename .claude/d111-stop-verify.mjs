// CC independent verification of the WO-D111 campaign STOP (2026-08-02):
// deterministic re-run of seed 18760627 on the accepted stream (working-tree
// scenario, 8e28552c) to tick 1515. Confirms: Reno A/G/M killed 135 at the
// stop tick; the three Reno-company end states; the annihilation window.
// Read-only; no result promoted; adjudication reserved.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { hashScenario } = await import(pathToFileURL(join(REPO, 'dist/engine/src/serialize.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data/terrain/little-bighorn-1876'));

console.log(`scenario hash: ${hashScenario(scenario)}`);
const RENO = ['co-a', 'co-g', 'co-m'];
const sim = createSim(scenario, { seed: 18760627, terrain });
const destroyedAt = new Map();
for (let tick = 0; tick <= 1515; tick += 1) {
  sim.run(tick);
  const state = sim.state();
  for (const id of RENO) {
    const unit = state.units.find((u) => u.id === id);
    if (unit?.endState === 'DESTROYED' && !destroyedAt.has(id)) destroyedAt.set(id, tick);
  }
}
const state = sim.state();
const byId = new Map(state.units.map((u) => [u.id, u]));
const killed = RENO.reduce((sum, id) => sum + (byId.get(id)?.killed ?? 0), 0);
console.log(`tick 1515 (min 757.5): Reno A/G/M killed = ${killed}`);
for (const id of RENO) {
  const u = byId.get(id);
  console.log(`  ${id}: killed ${u.killed}, endState ${u.endState ?? 'active'}, ` +
    `destroyed at tick ${destroyedAt.get(id) ?? '-'}, pos (${u.position.x.toFixed(0)},${u.position.y.toFixed(0)})`);
}
console.error('done');
