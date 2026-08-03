// Twenty-first measurement, interpretive half: was the cadence branch ever
// exercised? Logs every routeToSafety outcome under cadence-10.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const mode = process.argv[2];
globalThis.__d74fix = 'cadence10';
globalThis.__d74log = [];
if (mode === 'LA') globalThis.__d17mode = 'A';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const sim = createSim(scenario, { seed: 18760625, terrain });
sim.run(2160);
const log = globalThis.__d74log;
console.log(`mode ${mode}: routeToSafety invocations logged: ${log.length}`);
const byUnit = new Map();
for (const e of log) {
  const l = byUnit.get(e.unit) ?? [];
  l.push(`${e.tick / 2}:${e.outcome}`);
  byUnit.set(e.unit, l);
}
for (const [u, l] of byUnit) console.log(`  ${u}: ${l.join(' ')}`);
console.error('done');
