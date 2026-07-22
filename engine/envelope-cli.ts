import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import type { Scenario } from '../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../src/terrain/movement-loader.js';
import { assertScenario } from '../src/validate.js';
import type { BaselineSeedCriteria, SeedEnvelopeOutcome } from './src/baseline-selection.js';
import { extractEmergentOutcomes, formatSeedEnvelope } from './src/envelope.js';
import { runObservationExam } from './src/exam.js';
import { createSim } from './src/index.js';
import { scoreCalibrationRun } from './src/score.js';

export async function runEnvelopeCli(cwd = process.cwd()): Promise<string> {
  const scenarioId = 'little-bighorn-1876';
  const criteriaPath = join(cwd, 'data', 'calibration', 'baseline-seed-criteria.json');
  const criteriaBytes = await readFile(criteriaPath);
  const criteriaHash = createHash('sha256').update(criteriaBytes).digest('hex');
  const criteria = JSON.parse(new TextDecoder().decode(criteriaBytes)) as BaselineSeedCriteria;
  if (criteria.seedList.length !== 50 || new Set(criteria.seedList).size !== 50) {
    throw new Error('D80/Chuck Q2 requires exactly 50 unique criteria-declared seeds');
  }
  // These emissions occur before terrain loading and before the first simulation.
  console.log(`[envelope] order=1 criteria-sha256=${criteriaHash}`);
  console.log(`[envelope] order=2 per-seed-generation-started N=${criteria.seedList.length}`);

  const scenarioValue = JSON.parse(await readFile(
    join(cwd, 'data', 'scenarios', scenarioId, 'scenario.json'), 'utf8',
  )) as unknown;
  assertScenario(scenarioValue);
  const scenario = scenarioValue as Scenario;
  const terrain = await TerrainMovementLoader.fromDirectory(join(cwd, 'data', 'terrain', scenarioId));
  const observation = runObservationExam(scenario, terrain);
  const outcomes: SeedEnvelopeOutcome[] = [];
  for (let index = 0; index < criteria.seedList.length; index += 1) {
    const seed = criteria.seedList[index];
    const sim = createSim(scenario, { seed, terrain });
    sim.run(Math.round(1080 * 60 / scenario.clock.tickSeconds));
    const scorecard = scoreCalibrationRun({
      scenario: sim.scenario,
      terrain,
      state: sim.state(),
      tracks: sim.tracks(),
      events: sim.events(),
      observationRows: observation.rows,
      seed,
    });
    outcomes.push(extractEmergentOutcomes(sim.scenario, terrain, sim.state(), sim.events(), scorecard));
    console.log(`[envelope] completed=${index + 1}/${criteria.seedList.length} seed=${seed} ` +
      `composite=${(scorecard.composite * 100).toFixed(2)}%`);
  }
  const result = formatSeedEnvelope({ scenario, criteria, criteriaHash, outcomes });
  const reportsDirectory = join(cwd, 'reports');
  await mkdir(reportsDirectory, { recursive: true });
  const reportPath = join(reportsDirectory, 'seed-envelope.md');
  await writeFile(reportPath, result.report);
  if (!result.selection.selected) {
    throw new Error(`Baseline criteria selected no typical seed; preserved diagnostic report at ${reportPath}`);
  }
  return `[envelope] selected=${result.selection.selected.seed} candidates=${result.selection.candidates.length}\n` +
    `[envelope] wrote ${reportPath}`;
}

if (process.argv[1]?.replaceAll('\\', '/').endsWith('/engine/envelope-cli.js')) {
  runEnvelopeCli().then(
    (output) => { console.log(output); },
    (error: unknown) => {
      console.error(error);
      process.exitCode = 1;
    },
  );
}
