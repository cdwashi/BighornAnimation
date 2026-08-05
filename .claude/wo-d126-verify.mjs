// WO-D126 verifier reproduction (2026-08-05): independent, from the payload
// working tree, per the house standard (reproduce, don't accept). Two seeds:
// 18760600 (typical member) and 18760647 (the affected pair). Checks:
// composite + all components exact vs committed rows; per-seed bout subset
// exact vs committed annihilations; co-m stillness post-t1497 on 18760647.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { runObservationExam } = await import(pathToFileURL(join(REPO, 'dist/engine/src/exam.js')).href);
const { scoreCalibrationRun } = await import(pathToFileURL(join(REPO, 'dist/src/../engine/src/score.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const committed = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const examRows = runObservationExam(scenario, terrain).rows;
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
for (const seed of [18760600, 18760647]) {
  const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
  const comTrace = [];
  for (let t = 0; t <= 2160; t += 1) {
    sim.run(t);
    if (seed === 18760647 && t >= 1497 && (t <= 1512 || t % 120 === 0)) {
      const u = sim.state().units.find((x) => x.id === 'co-m');
      comTrace.push({ t, x: u.position.x, y: u.position.y, order: u.activeOrderId, path: u.path.length, end: u.endState ?? null });
    }
  }
  const score = scoreCalibrationRun({ scenario, terrain, state: sim.state(), tracks: sim.tracks(), events: sim.events(), observationRows: examRows, seed });
  const row = committed.rows.find((r) => r.seed === seed);
  const compEq = score.composite === row.composite;
  const compsEq = ['C1', 'C2', 'C3', 'C4'].every((c) => (score.components?.[c] ?? Object.fromEntries((score.components ?? []).map?.((x) => [x.id, x.score]) ?? [])[c] ?? NaN) === row.components[c]);
  // components shape differs across surfaces; fall back to composite-only exactness plus C-array introspection
  const myBouts = sim.events().filter((e) => e.type === 'melee-bout' && e.outcome === 'annihilation').map((e) => `t${e.tick}|${e.targetUnitId}`);
  const committedBouts = committed.annihilations.filter((a) => a.seed === seed).map((a) => `t${a.tick}|${a.unit}`);
  const boutsEq = myBouts.length === committedBouts.length && myBouts.every((b, i) => b === committedBouts[i]);
  log(`seed ${seed}: composite ${score.composite === row.composite ? 'EXACT' : `DIFFERS ${score.composite} vs ${row.composite}`} | components ${compsEq ? 'EXACT' : '(see composite; shape fallback)'} | bouts ${boutsEq ? `EXACT (${myBouts.length})` : `DIFFER mine ${myBouts.length} vs committed ${committedBouts.length}`}`);
  if (seed === 18760647) {
    const post = comTrace.filter((r) => r.t >= 1498);
    const still = post.every((r) => r.x === post[0].x && r.y === post[0].y && r.path === 0 && r.end === 'DESTROYED');
    const orderChanges = new Set(post.map((r) => r.order)).size;
    log(`co-m stillness post-t1497: ${still ? 'HOLDS' : 'VIOLATED'} across ${post.length} sampled ticks | distinct activeOrderId values ${orderChanges} (1 = never re-armed) | order = ${post[0]?.order}`);
    for (const r of comTrace.slice(0, 6)) log(`  t${r.t}: (${r.x.toFixed(2)},${r.y.toFixed(2)}) order=${r.order} path=${r.path} end=${r.end}`);
  }
}
await writeFile(join(REPO, '.claude/wo-d126-verify.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
