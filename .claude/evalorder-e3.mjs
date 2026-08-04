// E3 — order sensitivity, two arms (2026-08-04), per the FROZEN plan at
// docs/research/EVALUATION-ORDER-MEASUREMENT-PLAN.md (67d5bc1). Throwaway-
// patch discipline (M4 form): patches live here, tree restored under guard,
// tracked diff verified, no reseed, stream [68325eff]. Baseline = the
// committed .claude/m4-baseline.json (identical harness, validated to the
// digit against the committed world at 4aa8ca0). DICE-PATH CONFOUND,
// disclosed in the read log before this ran: reordering reshuffles the RNG
// draw sequence, so deltas are read as a DISTRIBUTION against the ~0.5 pp
// reseed noise floor, never one number against zero.
// Arms: REVERSE (registered named permutation) and five deterministic
// per-tick shuffles (arrangements 1-5), each baked into its own build.
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();

const LOOP_OLD = `  for (const engagement of state.engagements) {
    if (!engagement.active || engagement.state === 'APPROACH' || engagement.state === 'ROUT') continue;
    resolveShock(scenario, state, engagement, config, unitsById, events);`;
const loopReverse = `  // E3 THROWAWAY PATCH (reverse arm): within-tick resolution order reversed.
  for (const engagement of [...state.engagements].reverse()) {
    if (!engagement.active || engagement.state === 'APPROACH' || engagement.state === 'ROUT') continue;
    resolveShock(scenario, state, engagement, config, unitsById, events);`;
const loopShuffle = (arrangement) => `  // E3 THROWAWAY PATCH (randomized arm ${arrangement}): deterministic per-tick shuffle.
  const __e3 = (() => {
    let s = (state.tick * 2654435761 + ${arrangement} * 40503 + 12345) >>> 0;
    const rand = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
    const copy = [...state.engagements];
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(rand() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  })();
  for (const engagement of __e3) {
    if (!engagement.active || engagement.state === 'APPROACH' || engagement.state === 'ROUT') continue;
    resolveShock(scenario, state, engagement, config, unitsById, events);`;

if (process.argv[2] === 'worker') {
  const outPath = process.argv[3];
  const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
  const { runObservationExam } = await import(pathToFileURL(join(REPO, 'dist/engine/src/exam.js')).href);
  const { scoreCalibrationRun } = await import(pathToFileURL(join(REPO, 'dist/engine/src/score.js')).href);
  const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
  const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
  const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
  const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
  const examRows = runObservationExam(scenario, terrain).rows;
  const out = [];
  for (const seed of results.rows.map((r) => r.seed).sort((a, b) => a - b)) {
    const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
    for (let t = 0; t <= 2160; t += 1) sim.run(t);
    const score = scoreCalibrationRun({ scenario, terrain, state: sim.state(), tracks: sim.tracks(), events: sim.events(), observationRows: examRows, seed });
    out.push({ seed, composite: score.composite,
      bouts: sim.events().filter((e) => e.type === 'melee-bout' && e.outcome === 'annihilation').map((e) => ({ tick: e.tick, unit: e.targetUnitId })) });
    console.error(`seed ${seed} done`);
  }
  await writeFile(outPath, JSON.stringify(out), 'utf8');
  process.exit(0);
}

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
const combatPath = join(REPO, 'engine/src/combat.ts');
log('=== E3 order sensitivity, stream [68325eff], baseline = committed m4-baseline.json ===');
const ARMS = [{ name: 'reverse', patch: loopReverse },
  ...[1, 2, 3, 4, 5].map((n) => ({ name: `shuffle-${n}`, patch: loopShuffle(n) }))];
try {
  for (const arm of ARMS) {
    run('git restore engine/src/combat.ts');
    const src = await readFile(combatPath, 'utf8');
    // The working copy is CRLF (autocrlf checkout); anchors are authored LF.
    // Match and write in the file's own EOL - the first run's 'not unique'
    // was ZERO matches from this mismatch, and the message now says which.
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    const anchor = LOOP_OLD.split('\n').join(eol);
    const patchText = arm.patch.split('\n').join(eol);
    const found = src.split(anchor).length - 1;
    if (found !== 1) throw new Error(`patch anchor found ${found} times (expected 1)`);
    await writeFile(combatPath, src.replace(anchor, patchText), 'utf8');
    run('npx tsc -p tsconfig.engine.json');
    log(`arm ${arm.name}: patched, built, running...`);
    run(`node .claude/evalorder-e3.mjs worker .claude/e3-${arm.name}.json`);
  }
} finally {
  run('git restore engine/src/combat.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
const base = JSON.parse(await readFile(join(REPO, '.claude/m4-baseline.json'), 'utf8'));
const med = (a) => { const s = a.filter((x) => x !== null).sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => { const s = a.filter((x) => x !== null); return s.reduce((x, y) => x + y, 0) / s.length; };
const bm = med(base.map((s) => s.composite)) * 100, bmn = mean(base.map((s) => s.composite)) * 100;
const bBouts = new Set(base.flatMap((s) => (s.annihilationBouts ?? s.bouts ?? []).map((r) => `${s.seed}|t${r.tick}|${r.unit}`)));
log('');
log(`baseline: median ${bm.toFixed(4)} mean ${bmn.toFixed(4)} bouts ${bBouts.size}`);
const deltasMed = [], deltasMean = [];
for (const arm of ARMS) {
  const d = JSON.parse(await readFile(join(REPO, `.claude/e3-${arm.name}.json`), 'utf8'));
  const m = med(d.map((s) => s.composite)) * 100, mn = mean(d.map((s) => s.composite)) * 100;
  const bouts = new Set(d.flatMap((s) => s.bouts.map((r) => `${s.seed}|t${r.tick}|${r.unit}`)));
  const removed = [...bBouts].filter((k) => !bouts.has(k)).length;
  const added = [...bouts].filter((k) => !bBouts.has(k)).length;
  log(`arm ${arm.name}: median ${m.toFixed(4)} (Δ ${(m - bm).toFixed(4)}) mean ${mn.toFixed(4)} (Δ ${(mn - bmn).toFixed(4)}) | bouts ${bouts.size} (removed ${removed}, new ${added})`);
  if (arm.name !== 'reverse') { deltasMed.push(m - bm); deltasMean.push(mn - bmn); }
}
log('');
log(`randomized-arm distribution (5 arrangements): median-Δ min ${Math.min(...deltasMed).toFixed(4)} max ${Math.max(...deltasMed).toFixed(4)} | mean-Δ min ${Math.min(...deltasMean).toFixed(4)} max ${Math.max(...deltasMean).toFixed(4)}`);
log('read against the ~0.5 pp reseed noise floor per the frozen plan and the disclosed dice-path confound; verdict lines are the adjudication\'s, not this probe\'s.');
await writeFile(join(REPO, '.claude/evalorder-e3.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
