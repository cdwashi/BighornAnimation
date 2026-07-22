import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Scenario } from '../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../src/terrain/movement-loader.js';
import { assertScenario } from '../src/validate.js';
import { runObservationExam } from './src/exam.js';
import { createSim } from './src/index.js';
import { scoreCalibrationRun, type CalibrationScorecard } from './src/score.js';

function valuesAfter(args: readonly string[], flag: string): string[] {
  return args.flatMap((value, index) => value === flag && args[index + 1] ? [args[index + 1]] : []);
}

function valueAfter(args: readonly string[], flag: string): string | undefined {
  return valuesAfter(args, flag)[0];
}

export async function runScoreCli(
  args: readonly string[],
  cwd = process.cwd(),
): Promise<{ output: string; scorecard: CalibrationScorecard; reportPath: string }> {
  const scenarioId = valueAfter(args, '--scenario') ?? 'little-bighorn-1876';
  const seedText = valueAfter(args, '--seed') ?? '18760625';
  const seed = /^-?\d+$/.test(seedText) ? Number(seedText) : seedText;
  const variantIds = valuesAfter(args, '--variant');
  const scenarioValue = JSON.parse(await readFile(
    join(cwd, 'data', 'scenarios', scenarioId, 'scenario.json'), 'utf8',
  )) as unknown;
  assertScenario(scenarioValue);
  const scenario = scenarioValue as Scenario;
  const terrain = await TerrainMovementLoader.fromDirectory(join(cwd, 'data', 'terrain', scenarioId));
  const sim = createSim(scenario, { seed, terrain, variants: variantIds });
  const toTick = Math.round(1080 * 60 / sim.scenario.clock.tickSeconds);
  sim.run(toTick);
  const exam = runObservationExam(sim.scenario, terrain);
  const scorecard = scoreCalibrationRun({
    scenario: sim.scenario,
    terrain,
    state: sim.state(),
    tracks: sim.tracks(),
    events: sim.events(),
    observationRows: exam.rows,
    seed,
    variantIds,
  });
  const reportsDirectory = join(cwd, 'reports');
  await mkdir(reportsDirectory, { recursive: true });
  const reportPath = join(reportsDirectory, 'calibration-scorecard.md');
  await writeFile(reportPath, scorecard.report);
  return {
    output: [
      `[score] scenario=${scenarioId} seed=${String(seed)} variants=${variantIds.join(',') || 'baseline'} tier=${scorecard.reviewTier}`,
      `[score] composite=${(scorecard.composite * 100).toFixed(2)}% gates=${scorecard.passed ? 'PASS' : 'FAIL'}`,
      ...scorecard.components.map((component) =>
        `[score] ${component.id}=${(component.score * 100).toFixed(2)}% ${component.passed ? 'PASS' : 'FAIL'}`),
      `[score] wrote ${reportPath}`,
    ].join('\n'),
    scorecard,
    reportPath,
  };
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/engine/score-cli.js')) {
  runScoreCli(process.argv.slice(2)).then(
    (result) => { console.log(result.output); },
    (error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
