// M-FLIP — the counterfactual arm (2026-08-05), per the FROZEN registration
// docs/research/268-VS-253-REGISTRATION.md (dc39dab) §5 and the FROZEN bands
// amendment docs/research/268-VS-253-BANDS-AMENDMENT.md (31c53b5).
// ONE TOKEN: the us-7th killed-best numerator 268 -> 253 in
// engine/src/combat-config.ts; nothing else moves. Throwaway-patch
// discipline (E4 form): EOL-aware anchor with exact-count guard, guarded
// restore + rebuild in finally, byte-identity verified, no reseed, stream
// [68325eff] on every figure.
// PIN (a)(3) EXPECTED-RED, declared in the frozen registration: the pin test
// runs while patched and its red is RECORDED (assertion named), not
// repaired; the pin is re-run green after restore. Second designed firing.
// Registered predictions (frozen before this file ran):
//   P-A bout census row-for-row identical to the committed 120; one row of
//       divergence = STOP, P-B/P-C void.
//   P-B pooled fire-killed delta in [-120,-30] (expectation -69.6);
//       pooled final-killed delta in [-85,-15] (expectation ~-45);
//       wounded mirrors positive; per-seed final delta in [-4,0].
//   P-C envelope IDENTICAL: median delta 0.0000, mean delta 0.0000, every
//       component identical on every seed; any nonzero = STOP.
// Baselines (committed, no patched-world figure informed the bands):
//   composites/components/annihilations: reports/d112-campaign-results.json
//   US finals + fire sums: .claude/us268-m-cover.json
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();

const CUSTER = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const RENO_BENTEEN = ['co-a', 'co-b', 'co-d', 'co-g', 'co-h', 'co-k', 'co-m'];
const NON_COMPANY = ['pack-train', 'arikara-scouts', 'crow-scouts', 'civilians-interpreters'];
const US = new Set([...CUSTER, ...RENO_BENTEEN, ...NON_COMPANY]);

const P_OLD = `      best: 268 / 52,`;
const P_NEW = `      best: 253 / 52,`;

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
  // runtime introspection for casualty-leg items (id "side:column"): a JSON
  // walk over the score object, no source read required.
  const findLegs = (node, acc) => {
    if (Array.isArray(node)) { for (const item of node) findLegs(item, acc); return acc; }
    if (node && typeof node === 'object') {
      if (typeof node.id === 'string' && /:(killed|wounded)$/.test(node.id) && 'passed' in node) {
        acc.push({ id: node.id, passed: node.passed, actual: node.actual, expected: node.expected });
      }
      for (const value of Object.values(node)) findLegs(value, acc);
    }
    return acc;
  };
  const out = [];
  for (const seed of [...new Set(results.rows.map((r) => r.seed))].sort((a, b) => a - b)) {
    const sim = createSim(scenario, { seed, terrain, collectCombatMetrics: true });
    for (let t = 0; t <= 2160; t += 1) sim.run(t);
    const st = sim.state();
    const events = sim.events();
    const score = scoreCalibrationRun({ scenario, terrain, state: st, tracks: sim.tracks(), events, observationRows: examRows, seed });
    let fireK = 0, fireW = 0, apps = 0;
    for (const e of events) {
      if (e.type !== 'casualty-resolution') continue;
      const who = e.targetUnitId ?? e.unitId;
      if (!US.has(who)) continue;
      fireK += e.killed ?? 0; fireW += e.wounded ?? 0; apps += 1;
    }
    let finK = 0, finW = 0;
    const perUnit = {};
    for (const u of st.units) {
      if (!US.has(u.id)) continue;
      finK += u.killed; finW += u.wounded;
      perUnit[u.id] = { killed: u.killed, wounded: u.wounded, endState: u.endState ?? null };
    }
    out.push({
      seed, composite: score.composite,
      components: score.components ?? null,
      casualtyLegs: findLegs(score, []),
      bouts: events.filter((e) => e.type === 'melee-bout' && e.outcome === 'annihilation').map((e) => ({ tick: e.tick, unit: e.targetUnitId })),
      fireKilled: fireK, fireWounded: fireW, fireApps: apps,
      finalKilled: finK, finalWounded: finW, perUnit,
    });
    console.error(`seed ${seed} done: composite ${(score.composite * 100).toFixed(4)} K ${finK} W ${finW}`);
  }
  await writeFile(outPath, JSON.stringify({ stream: '68325eff', patch: 'best: 268/52 -> 253/52', perSeed: out }, null, 2), 'utf8');
  process.exit(0);
}

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
const tryTest = (label) => {
  try {
    execSync('npx vitest run engine/tests/d110-pins.test.ts', { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] });
    log(`pin suite ${label}: GREEN (exit 0)`);
    return 'GREEN';
  } catch (error) {
    const tail = ((error.stdout?.toString() ?? '') + (error.stderr?.toString() ?? '')).split('\n')
      .filter((l) => /us-7th|268|253|FAIL|failed|×/.test(l)).slice(0, 12).join('\n');
    log(`pin suite ${label}: RED (nonzero exit) — relevant lines:\n${tail}`);
    return 'RED';
  }
};
const cfgPath = join(REPO, 'engine/src/combat-config.ts');
log('=== M-FLIP: one token, 268/52 -> 253/52, stream [68325eff]; predictions frozen at 31c53b5 ===');
try {
  run('git restore engine/src/combat-config.ts');
  let src = await readFile(cfgPath, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const anchor = P_OLD.split('\n').join(eol);
  const found = src.split(anchor).length - 1;
  if (found !== 1) throw new Error(`anchor found ${found} times (expected 1): ${P_OLD}`);
  src = src.replace(anchor, P_NEW.split('\n').join(eol));
  await writeFile(cfgPath, src, 'utf8');
  run('npx tsc -p tsconfig.engine.json');
  log('patch applied and built.');
  const patchedPin = tryTest('WHILE PATCHED (expected RED per the frozen registration — pin (a)(3), the literal 268/52; recorded, NOT repaired)');
  if (patchedPin !== 'RED') log('NOTE: expected-red did not fire — recorded for adjudication, run continues.');
  run('node .claude/us268-m-flip.mjs worker .claude/us268-m-flip.json');
} finally {
  run('git restore engine/src/combat-config.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
  tryTest('AFTER GUARDED RESTORE (expected GREEN)');
}

// ---- comparison against committed baselines (no patched figure informed the bands) ----
const flip = JSON.parse(await readFile(join(REPO, '.claude/us268-m-flip.json'), 'utf8')).perSeed;
const committed = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const cover = JSON.parse(await readFile(join(REPO, '.claude/us268-m-cover.json'), 'utf8')).perSeed;
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
log('');
log('--- P-A: the bout census, row for row against the committed 120 ---');
const committedBouts = new Set(committed.annihilations.map((a) => `${a.seed}|t${a.tick}|${a.unit}`));
const flipBouts = new Set(flip.flatMap((s) => s.bouts.map((b) => `${s.seed}|t${b.tick}|${b.unit}`)));
const removed = [...committedBouts].filter((k) => !flipBouts.has(k));
const added = [...flipBouts].filter((k) => !committedBouts.has(k));
log(`committed ${committedBouts.size} | patched ${flipBouts.size} | removed ${removed.length} | new ${added.length}`);
if (removed.length + added.length === 0) log('P-A: IDENTICAL row for row.');
else { log('P-A: DIVERGENCE — STOP per the frozen falsification; P-B/P-C VOID; rows follow:'); for (const k of [...removed.map((r) => 'removed ' + r), ...added.map((a2) => 'new ' + a2)].slice(0, 40)) log(`  ${k}`); }
log('');
log('--- P-B: the ledger shift (patched minus committed) ---');
const coverBySeed = new Map(cover.map((r) => [r.seed, r]));
const dFireK = flip.map((s) => s.fireKilled - coverBySeed.get(s.seed).fireKilled);
const dFireW = flip.map((s) => s.fireWounded - coverBySeed.get(s.seed).fireWounded);
const dFinK = flip.map((s) => s.finalKilled - coverBySeed.get(s.seed).finalKilled);
const dFinW = flip.map((s) => s.finalWounded - coverBySeed.get(s.seed).finalWounded);
const dApps = flip.map((s) => s.fireApps - coverBySeed.get(s.seed).fireApps);
const sum = (a) => a.reduce((x, y) => x + y, 0);
log(`pooled fire-killed delta ${sum(dFireK)} (band [-120,-30], expectation -69.6) | fire-wounded delta ${sum(dFireW)}`);
log(`pooled final-killed delta ${sum(dFinK)} (band [-85,-15], expectation ~-45) | final-wounded delta ${sum(dFinW)}`);
log(`per-seed final-killed delta: min ${Math.min(...dFinK)} max ${Math.max(...dFinK)} (band [-4,0] every seed) | application-count delta: min ${Math.min(...dApps)} max ${Math.max(...dApps)} (identity expected under P-A)`);
log('');
log('--- P-C: the envelope, per seed against the committed rows ---');
const rowBySeed = new Map(committed.rows.map((r) => [r.seed, r]));
let compIdentical = 0; const compDiffs = [];
for (const s of flip) {
  const row = rowBySeed.get(s.seed);
  const dc = s.composite - row.composite;
  const compDelta = ['C1', 'C2', 'C3', 'C4'].map((c) => (s.components?.[c] ?? NaN) - (row.components?.[c] ?? NaN));
  if (dc === 0 && compDelta.every((d) => d === 0)) compIdentical += 1;
  else compDiffs.push(`seed ${s.seed}: composite ${(dc * 100).toFixed(4)} pp | components ${compDelta.map((d) => (d * 100).toFixed(4)).join('/')}`);
}
log(`seeds with composite AND all components IDENTICAL: ${compIdentical}/50`);
for (const d of compDiffs) log(`  ${d}`);
const fm = flip.map((s) => s.composite), cm = committed.rows.map((r) => r.composite);
log(`patched median ${(med(fm) * 100).toFixed(4)} vs committed ${(med(cm) * 100).toFixed(4)} (delta ${((med(fm) - med(cm)) * 100).toFixed(4)} pp; predicted 0.0000)`);
log(`patched mean ${(mean(fm) * 100).toFixed(4)} vs committed ${(mean(cm) * 100).toFixed(4)} (delta ${((mean(fm) - mean(cm)) * 100).toFixed(4)} pp; predicted 0.0000)`);
log('');
log('--- the per-seed US C2 legs (patched world; committed-world counterpart derivable from M-COVER actuals vs the data-surface bands) ---');
const legTally = new Map();
for (const s of flip) for (const leg of s.casualtyLegs.filter((l) => l.id.startsWith('us-7th'))) {
  const k = `${leg.id}:${leg.passed ? 'PASS' : 'FAIL'}`; legTally.set(k, (legTally.get(k) ?? 0) + 1);
}
for (const [k, n] of [...legTally.entries()].sort()) log(`  ${k}: ${n}/50`);
log('');
log('Verdict lines are the adjudication\'s; figures above are the probe\'s only claims.');
await writeFile(join(REPO, '.claude/us268-m-flip.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
