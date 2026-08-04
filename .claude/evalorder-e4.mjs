// E4 — the snapshot counterfactual (2026-08-04), per the FROZEN plan at
// docs/research/EVALUATION-ORDER-MEASUREMENT-PLAN.md (67d5bc1). The
// finishing predicate (defender-already-routed AND the shelter check)
// evaluates against the TICK-START morale field - the simultaneity
// semantics - while everything else runs unchanged. Throwaway-patch
// discipline (M4 form), EOL-aware anchors, guarded restore, byte-identity
// verified, no reseed, stream [68325eff]. Baseline = committed
// m4-baseline.json. THE NAMED STATISTIC (Amendment 2), computed for both
// worlds and registered as the ONLY E4 support surface for H-DESIGN:
// the count and timing of same-tick sequential annihilations at the
// Calhoun and Last Stand collapses. Envelope figures are reported and
// support neither hypothesis.
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();

const P1_OLD = `function resolveShock(`;
const P1_NEW = `// E4 THROWAWAY PATCH: tick-start morale field for the finishing predicate.
let __e4Snapshot = new Map<string, string>();
function resolveShock(`;
const P2_OLD = `  const defenderAlreadyRouted = defender.moraleState === 'ROUTED';`;
const P2_NEW = `  const defenderAlreadyRouted = (__e4Snapshot.get(defender.id) ?? defender.moraleState) === 'ROUTED';`;
const P3_OLD = `      !unit.endState && !unit.withdrawnOffField && unit.moraleState === 'STEADY' &&`;
const P3_NEW = `      !unit.endState && !unit.withdrawnOffField && (__e4Snapshot.get(unit.id) ?? unit.moraleState) === 'STEADY' &&`;
const P4_OLD = `  const unitsById = new Map(state.units.map((unit) => [unit.id, unit]));`;
const P4_NEW = `  const unitsById = new Map(state.units.map((unit) => [unit.id, unit]));
  __e4Snapshot = new Map(state.units.map((unit) => [unit.id, unit.moraleState]));`;

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
log('=== E4 snapshot counterfactual, stream [68325eff], baseline = committed m4-baseline.json ===');
try {
  run('git restore engine/src/combat.ts');
  let src = await readFile(combatPath, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  for (const [o, n] of [[P1_OLD, P1_NEW], [P2_OLD, P2_NEW], [P3_OLD, P3_NEW], [P4_OLD, P4_NEW]]) {
    const anchor = o.split('\n').join(eol);
    const found = src.split(anchor).length - 1;
    if (found !== 1) throw new Error(`anchor found ${found} times (expected 1): ${o.slice(0, 60)}`);
    src = src.replace(anchor, n.split('\n').join(eol));
  }
  await writeFile(combatPath, src, 'utf8');
  run('npx tsc -p tsconfig.engine.json');
  log('snapshot patch applied and built; running...');
  run('node .claude/evalorder-e4.mjs worker .claude/e4-snapshot.json');
} finally {
  run('git restore engine/src/combat.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
const base = JSON.parse(await readFile(join(REPO, '.claude/m4-baseline.json'), 'utf8'));
const snap = JSON.parse(await readFile(join(REPO, '.claude/e4-snapshot.json'), 'utf8'));
const med = (a) => { const s = a.filter((x) => x !== null).sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => { const s = a.filter((x) => x !== null); return s.reduce((x, y) => x + y, 0) / s.length; };
const boutsOf = (d) => d.flatMap((s) => (s.annihilationBouts ?? s.bouts ?? []).map((r) => ({ seed: s.seed, tick: r.tick, unit: r.unit })));
const stat = (rows, label) => {
  const byTick = new Map();
  for (const r of rows) { const k = `${r.seed}|${r.tick}`; byTick.set(k, (byTick.get(k) ?? 0) + 1); }
  const multi = [...byTick.values()].filter((n) => n >= 2);
  const calhoun = rows.filter((r) => r.tick >= 1680 && r.tick <= 1699).length;
  const lastStand = rows.filter((r) => r.tick >= 1700 && r.tick <= 1799).length;
  log(`${label}: bouts ${rows.length} | same-tick multi-bout (seed,tick) groups ${multi.length} (bouts inside them ${multi.reduce((a, b) => a + b, 0)}) | Calhoun window t1680-1699: ${calhoun} | Last Stand window t1700-1799: ${lastStand}`);
};
log('');
log('--- THE NAMED STATISTIC (the only E4 support surface for H-DESIGN) ---');
stat(boutsOf(base), 'baseline');
stat(boutsOf(snap), 'snapshot');
const bBouts = new Set(boutsOf(base).map((r) => `${r.seed}|t${r.tick}|${r.unit}`));
const sBouts = new Set(boutsOf(snap).map((r) => `${r.seed}|t${r.tick}|${r.unit}`));
log(`bout-set delta: removed ${[...bBouts].filter((k) => !sBouts.has(k)).length} | new ${[...sBouts].filter((k) => !bBouts.has(k)).length}`);
log('');
log('--- envelope, REPORTED, supporting neither hypothesis per Amendment 2 ---');
log(`baseline median ${(med(base.map((s) => s.composite)) * 100).toFixed(4)} mean ${(mean(base.map((s) => s.composite)) * 100).toFixed(4)} | snapshot median ${(med(snap.map((s) => s.composite)) * 100).toFixed(4)} mean ${(mean(snap.map((s) => s.composite)) * 100).toFixed(4)}`);
log('');
log('M2 cross-reference: the 99-versus-0 timing fact predicts the snapshot world suppresses finishings');
log('whose shelter check now sees pre-cascade STEADY companions; the numbers above measure how much.');
log('Verdict lines are the adjudication\'s, not this probe\'s.');
await writeFile(join(REPO, '.claude/evalorder-e4.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
