// M4 — the envelope under C2 (2026-08-04), per the FROZEN registration
// (298f3a1), its dated adjudication amendment (b8fcc82), and the source-read
// plan's combat.ts amendment (05637f3). THROWAWAY PATCH DISCIPLINE: the
// patch below lives in this file, is applied to the working tree for the
// patched pass only, and the tree is restored under a guard however the run
// exits, with whole-tree verification printed. No reseed: mechanism change,
// same seeds, stream lineage [68325eff] declared. The M4 read is scored
// against C2's frozen M1(b) prediction; the reverse channel is read against
// its named paragraph in M3; the evaluation-order caveat is in view.
//
// Modes: (default) orchestrate baseline -> patch -> patched -> restore ->
// verify -> summarize; `worker <label> <outPath>` runs one 50-seed scored
// campaign in a fresh process (fresh dist import).
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();

const PATCH_OLD = `  const nearestShelter = defenderAlreadyRouted
    ? state.units.filter((unit) => unit.id !== defender.id &&
      !unit.endState && !unit.withdrawnOffField && unit.moraleState === 'STEADY' &&
      scenario.units[unit.unitIndex].sideId === defenderSideId &&
      scenario.units[unit.unitIndex].kind !== 'NONCOMBATANT_CAMP')
      .map((unit) => ({
        unit,
        distanceMeters: Math.hypot(
          unit.position.x - defender.position.x,
          unit.position.y - defender.position.y,
        ),
      }))
      .filter(({ distanceMeters }) => distanceMeters <= config.isolationRadiusMeters)
      .sort((left, right) => left.distanceMeters - right.distanceMeters)[0]
    : undefined;`;
const PATCH_NEW = `  // M4 THROWAWAY PATCH (C2): STEADY+SHAKEN strength within friendlyRadiusMeters
  // compared against the attacker - the D72 form imported into finishing.
  const shelterCandidates = defenderAlreadyRouted
    ? state.units.filter((unit) => unit.id !== defender.id &&
      !unit.endState && !unit.withdrawnOffField &&
      (unit.moraleState === 'STEADY' || unit.moraleState === 'SHAKEN') &&
      scenario.units[unit.unitIndex].sideId === defenderSideId &&
      scenario.units[unit.unitIndex].kind !== 'NONCOMBATANT_CAMP')
      .map((unit) => ({
        unit,
        distanceMeters: Math.hypot(
          unit.position.x - defender.position.x,
          unit.position.y - defender.position.y,
        ),
      }))
      .filter(({ distanceMeters }) => distanceMeters <= config.friendlyRadiusMeters)
      .sort((left, right) => left.distanceMeters - right.distanceMeters)
    : [];
  const shelterMass = shelterCandidates.reduce((sum, item) => sum + item.unit.strengthCurrent, 0);
  const nearestShelter = defenderAlreadyRouted && shelterMass >= attacker.strengthCurrent
    ? shelterCandidates[0]
    : undefined;`;

if (process.argv[2] === 'worker') {
  const label = process.argv[3];
  const outPath = process.argv[4];
  const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
  const { runObservationExam } = await import(pathToFileURL(join(REPO, 'dist/engine/src/exam.js')).href);
  const { scoreCalibrationRun } = await import(pathToFileURL(join(REPO, 'dist/src/../engine/src/score.js')).href)
    .catch(() => import(pathToFileURL(join(REPO, 'dist/engine/src/score.js')).href));
  const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
  const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
  const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
  const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
  const examRows = runObservationExam(scenario, terrain).rows;
  const seeds = results.rows.map((r) => r.seed).sort((a, b) => a - b);
  const out = [];
  for (const seed of seeds) {
    const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
    for (let t = 0; t <= 2160; t += 1) sim.run(t);
    const score = scoreCalibrationRun({ scenario, terrain, state: sim.state(), tracks: sim.tracks(), events: sim.events(), observationRows: examRows, seed });
    const composite = typeof score.composite === 'number' ? score.composite : null;
    const destroyed = sim.events().filter((e) => e.type === 'unit-destroyed').map((e) => ({ tick: e.tick, unit: e.unitId }));
    const bouts = sim.events().filter((e) => e.type === 'melee-bout' && e.outcome === 'annihilation').map((e) => ({ tick: e.tick, unit: e.targetUnitId }));
    out.push({ seed, composite, scoreKeys: out.length === 0 ? Object.keys(score) : undefined, destroyed, annihilationBouts: bouts });
    console.error(`${label} seed ${seed} done (composite ${composite})`);
  }
  await writeFile(outPath, JSON.stringify(out), 'utf8');
  console.error(`${label} pass complete`);
  process.exit(0);
}

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
log('=== M4 under C2, stream [68325eff], same seeds, no reseed ===');
const pre = sh('git status --porcelain');
if (pre.split('\n').some((l) => l.trim() && !l.includes('.claude/steady-fix-m4'))) {
  throw new Error(`tree not clean before M4 (beyond this probe's own files):\n${pre}`);
}
log('pre-run tracked tree: clean (probe artifacts excepted)');
log('baseline pass (committed source, rebuilt to be certain)...');
run('npx tsc -p tsconfig.engine.json');
run(`node .claude/steady-fix-m4.mjs worker baseline .claude/m4-baseline.json`);
const combatPath = join(REPO, 'engine/src/combat.ts');
let patched = false;
try {
  const src = await readFile(combatPath, 'utf8');
  const count = src.split(PATCH_OLD).length - 1;
  if (count !== 1) throw new Error(`patch anchor found ${count} times; refusing`);
  await writeFile(combatPath, src.replace(PATCH_OLD, PATCH_NEW), 'utf8');
  patched = true;
  log('patch applied to working tree (engine/src/combat.ts, uncommitted)');
  run('npx tsc -p tsconfig.engine.json');
  log('patched pass...');
  run(`node .claude/steady-fix-m4.mjs worker patched .claude/m4-patched.json`);
} finally {
  if (patched) {
    run('git restore engine/src/combat.ts');
    run('npx tsc -p tsconfig.engine.json');
    log('restore executed under guard; dist rebuilt from committed source (dist/ untracked per .gitignore:2).');
  }
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
const base = JSON.parse(await readFile(join(REPO, '.claude/m4-baseline.json'), 'utf8'));
const pat = JSON.parse(await readFile(join(REPO, '.claude/m4-patched.json'), 'utf8'));
const med = (a) => { const s = a.filter((x) => x !== null).sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => { const s = a.filter((x) => x !== null); return s.reduce((x, y) => x + y, 0) / s.length; };
const key = (seed, r) => `${seed}|t${r.tick}|${r.unit}`;
const setOf = (data, field) => new Set(data.flatMap((s) => s[field].map((r) => key(s.seed, r))));
log('');
log(`score object keys (first seed): ${JSON.stringify(base[0].scoreKeys)}`);
log('=== per-seed composites (baseline | patched) ===');
for (let i = 0; i < base.length; i += 1) log(`  ${base[i].seed}: ${base[i].composite === null ? '-' : (base[i].composite * 100).toFixed(4)} | ${pat[i].composite === null ? '-' : (pat[i].composite * 100).toFixed(4)}`);
log('');
const bd = setOf(base, 'destroyed'), pd = setOf(pat, 'destroyed');
const bb = setOf(base, 'annihilationBouts'), pb = setOf(pat, 'annihilationBouts');
log(`unit-destroyed events: baseline ${bd.size} (committed array: 120) | patched ${pd.size}`);
log(`annihilation bouts:    baseline ${bb.size} | patched ${pb.size}`);
log(`REMOVED under C2 (in baseline, not patched): destroyed ${[...bd].filter((k) => !pd.has(k)).length} | bouts ${[...bb].filter((k) => !pb.has(k)).length}`);
log(`NEW under C2 (reverse channel; in patched, not baseline): destroyed ${[...pd].filter((k) => !bd.has(k)).length} | bouts ${[...pb].filter((k) => !bb.has(k)).length}`);
for (const k of [...pb].filter((x) => !bb.has(x)).slice(0, 20)) log(`  NEW bout: ${k}`);
log('');
log(`envelope (registered floor-quantile convention, 26th order statistic of 50): baseline median ${(med(base.map((s) => s.composite)) * 100).toFixed(4)} mean ${(mean(base.map((s) => s.composite)) * 100).toFixed(4)} | patched median ${(med(pat.map((s) => s.composite)) * 100).toFixed(4)} mean ${(mean(pat.map((s) => s.composite)) * 100).toFixed(4)}`);
log(`committed stream figures beside them, for lineage: median 54.7161 mean 52.5409 [68325eff]`);
log('');
log('=== scored against C2\'s FROZEN M1(b) prediction (verbatim from b6b6668): ===');
log('  "small perturbation - ... the annihilation count at M4 is predicted within a few rows of 120');
log('  minus first-order flips, and the envelope moves little. A C2 M4 run collapsing the annihilation');
log('  sequence FALSIFIES this registration."');
log('The reverse channel (M3, 97196f9) is read against its named paragraph, not folded in. The');
log('evaluation-order caveat (EVALUATION-ORDER-ITEM.md) is in view for every line above.');
await writeFile(join(REPO, '.claude/steady-fix-m4.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
