import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Scenario } from '../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../src/terrain/movement-loader.js';
import { assertScenario } from '../src/validate.js';
import { runObservationExam } from './src/exam.js';

export async function runExamCli(cwd = process.cwd()): Promise<string> {
  const scenarioId = 'little-bighorn-1876';
  const scenarioValue = JSON.parse(await readFile(
    join(cwd, 'data', 'scenarios', scenarioId, 'scenario.json'),
    'utf8',
  )) as unknown;
  assertScenario(scenarioValue);
  const terrain = await TerrainMovementLoader.fromDirectory(
    join(cwd, 'data', 'terrain', scenarioId),
  );
  const result = runObservationExam(scenarioValue as Scenario, terrain);
  const reportsDirectory = join(cwd, 'reports');
  await mkdir(reportsDirectory, { recursive: true });
  const reportPath = join(reportsDirectory, 'c4-observation-exam.md');
  await writeFile(reportPath, result.report);
  return `[exam] C4 ${result.reproducedCount}/${result.gateableCount} ` +
    `(${(result.reproductionRate * 100).toFixed(1)}%) ${result.passed ? 'PASS' : 'FAIL'}\n` +
    `[exam] wrote ${reportPath}`;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/engine/exam-cli.js')) {
  runExamCli().then(
    (output) => { console.log(output); },
    (error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
