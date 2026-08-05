// X3 — the envelope for G2, BOTH ARMS (2026-08-04), per the FROZEN
// registration (c50f69a), the X2 adjudication (G2 sole survivor), and X1's
// registered predictions (1df7821). The lateral/longitudinal ambiguity is
// measured, not chosen: LONGITUDINAL (column-halt, the existing mechanism's
// direction) and LATERAL (line-abreast, the frozen text's word), each its
// own throwaway build. M4 discipline: patch lives here, tree restored under
// guard, byte-identity verified, no reseed, stream [68325eff]; baseline =
// committed m4-baseline.json. Reads against X1(b)'s per-arm predictions;
// between-arm divergence pre-assigned to the registration's Section 4
// bout-order channel.
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();

const ANCHOR = `  if (result.targetUnitId) {`;
const blockFor = (label, oxExpr, oyExpr) => `  // X3 THROWAWAY PATCH (G2, ${label} arm): multi-recipient destination offsets.
  if (combat && unit.path.length > 1) {
    const g2Recipients = order.recipientUnitIds.filter((unitId) => {
      const runtime = state.units.find((item) => item.id === unitId);
      return runtime && scenario.units[runtime.unitIndex].kind === 'CAVALRY_COMPANY';
    }).sort((left, right) =>
      scenario.units.findIndex((item) => item.id === left) -
      scenario.units.findIndex((item) => item.id === right));
    const g2Ordinal = g2Recipients.indexOf(unit.id);
    if (g2Ordinal > 0) {
      const last = unit.path[unit.path.length - 1];
      const prev = unit.path[unit.path.length - 2];
      const dx = last.x - prev.x;
      const dy = last.y - prev.y;
      const len = Math.hypot(dx, dy);
      if (len > 0) {
        const off = combat.marchSpacingMeters * g2Ordinal;
        const ox = ${oxExpr};
        const oy = ${oyExpr};
        unit.path[unit.path.length - 1] = { ...last, x: last.x + ox, y: last.y + oy };
      }
    }
  }
${ANCHOR}`;
const ARMS = [
  { name: 'longitudinal', block: blockFor('longitudinal', '-dx / len * off', '-dy / len * off') },
  { name: 'lateral', block: blockFor('lateral', '-dy / len * off', 'dx / len * off') },
];

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
const ordersPath = join(REPO, 'engine/src/orders.ts');
log('=== X3 for G2, both arms, stream [68325eff], baseline = committed m4-baseline.json ===');
try {
  for (const arm of ARMS) {
    run('git restore engine/src/orders.ts');
    const src = await readFile(ordersPath, 'utf8');
    const eol = src.includes('\r\n') ? '\r\n' : '\n';
    const anchor = ANCHOR.split('\n').join(eol);
    const found = src.split(anchor).length - 1;
    if (found !== 1) throw new Error(`anchor found ${found} times (expected 1)`);
    await writeFile(ordersPath, src.replace(anchor, arm.block.split('\n').join(eol)), 'utf8');
    run('npx tsc -p tsconfig.engine.json');
    log(`arm ${arm.name}: patched, built, running...`);
    run(`node .claude/ooe-x3.mjs worker .claude/x3-${arm.name}.json`);
  }
} finally {
  run('git restore engine/src/orders.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
const base = JSON.parse(await readFile(join(REPO, '.claude/m4-baseline.json'), 'utf8'));
const med = (a) => { const s = a.filter((x) => x !== null).sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => { const s = a.filter((x) => x !== null); return s.reduce((x, y) => x + y, 0) / s.length; };
const boutsOf = (d) => d.flatMap((s) => (s.annihilationBouts ?? s.bouts ?? []).map((r) => ({ seed: s.seed, tick: r.tick, unit: r.unit })));
const bm = med(base.map((s) => s.composite)) * 100, bmn = mean(base.map((s) => s.composite)) * 100;
const bRows = boutsOf(base);
const bSet = new Set(bRows.map((r) => `${r.seed}|t${r.tick}|${r.unit}`));
const firstCalhoun = (rows) => {
  const bySeed = new Map();
  for (const r of rows.filter((r) => r.tick >= 1680 && r.tick <= 1699)) {
    const cur = bySeed.get(r.seed);
    if (!cur || r.tick < cur.tick) bySeed.set(r.seed, r);
  }
  const tally = new Map();
  for (const r of bySeed.values()) tally.set(r.unit, (tally.get(r.unit) ?? 0) + 1);
  return { seeds: bySeed.size, tally: [...tally.entries()].map(([k, n]) => `${k}:${n}`).join(' ') };
};
const fc = firstCalhoun(bRows);
log('');
log(`baseline: median ${bm.toFixed(4)} mean ${bmn.toFixed(4)} bouts ${bRows.length} | Calhoun window ${bRows.filter((r) => r.tick >= 1680 && r.tick <= 1699).length} | first Calhoun death: ${fc.tally} across ${fc.seeds} seeds`);
for (const arm of ARMS) {
  const d = JSON.parse(await readFile(join(REPO, `.claude/x3-${arm.name}.json`), 'utf8'));
  const rows = boutsOf(d);
  const set = new Set(rows.map((r) => `${r.seed}|t${r.tick}|${r.unit}`));
  const f = firstCalhoun(rows);
  log(`arm ${arm.name}: median ${(med(d.map((s) => s.composite)) * 100).toFixed(4)} (Δ ${(med(d.map((s) => s.composite)) * 100 - bm).toFixed(4)}) mean ${(mean(d.map((s) => s.composite)) * 100).toFixed(4)} (Δ ${(mean(d.map((s) => s.composite)) * 100 - bmn).toFixed(4)}) | bouts ${rows.length} (removed ${[...bSet].filter((k) => !set.has(k)).length}, new ${[...set].filter((k) => !bSet.has(k)).length}) | Calhoun window ${rows.filter((r) => r.tick >= 1680 && r.tick <= 1699).length} | first Calhoun death: ${f.tally} across ${f.seeds} seeds`);
}
log('');
log('read against X1(b)\'s per-arm predictions (1df7821); between-arm divergence pre-assigned to the');
log('registration\'s Section 4 bout-order channel; verdict lines are the adjudication\'s.');
await writeFile(join(REPO, '.claude/ooe-x3.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
