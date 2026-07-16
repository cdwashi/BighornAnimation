import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import { createSim } from './src/index.js';
import { formatCheckpointTable, scoreCheckpoints } from './src/score.js';
import type { Scenario } from '../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../src/terrain/movement-loader.js';
import { assertScenario } from '../src/validate.js';

export interface CliResult {
  output: string;
  report: string;
  reportPath?: string;
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : undefined;
}

export async function runCli(args: readonly string[], cwd = process.cwd()): Promise<CliResult> {
  const scenarioId = valueAfter(args, '--scenario');
  if (!scenarioId) throw new Error('Usage: --scenario <id> --to-tick <tick> [--seed <seed>] [--report]');
  const toTick = Number(valueAfter(args, '--to-tick') ?? 2160);
  if (!Number.isInteger(toTick) || toTick < 0) throw new Error('--to-tick must be a non-negative integer');
  const seedText = valueAfter(args, '--seed') ?? '18760625';
  const seed = /^-?\d+$/.test(seedText) ? Number(seedText) : seedText;
  const scenarioPath = join(cwd, 'data', 'scenarios', scenarioId, 'scenario.json');
  const terrainPath = join(cwd, 'data', 'terrain', scenarioId);
  const scenarioValue = JSON.parse(await readFile(scenarioPath, 'utf8')) as unknown;
  assertScenario(scenarioValue);
  const scenario: Scenario = scenarioValue;
  const terrain = await TerrainMovementLoader.fromDirectory(terrainPath);
  const sim = createSim(scenario, { seed, terrain });
  sim.run(toTick);
  const scores = scoreCheckpoints(sim.scenario, terrain, sim.tracks());
  const table = formatCheckpointTable(scores);
  const hits = scores.filter((score) => score.hit).length;
  const report = [
    '# E5 Movement-only Checkpoint Baseline',
    '',
    `- Seed: \`${String(seed)}\``,
    `- Scenario FNV-1a: \`${sim.scenarioHash}\``,
    `- Target tick: \`${toTick}\``,
    `- Result: \`${hits}/${scores.length} checkpoints hit\``,
    '',
    table,
    '',
  ].join('\n');
  let reportPath: string | undefined;
  if (args.includes('--report')) {
    const reportsDirectory = join(cwd, 'reports');
    await mkdir(reportsDirectory, { recursive: true });
    reportPath = join(reportsDirectory, 'e5-baseline.md');
    await writeFile(reportPath, report);
  }
  const output = [
    `[sim] scenario=${scenarioId} seed=${String(seed)} hash=${sim.scenarioHash} ticks=0..${toTick}`,
    `[sim] E5 checkpoints=${scores.length} hits=${hits} misses=${scores.length - hits}`,
    table,
    ...(reportPath ? [`[sim] wrote ${reportPath}`] : []),
  ].join('\n');
  return { output, report, reportPath };
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/engine/cli.js')) {
  runCli(process.argv.slice(2)).then(
    (result) => { console.log(result.output); },
    (error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
