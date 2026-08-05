// WO-D127 (RUN-253) pre-freeze red enumeration dry-run (2026-08-05) — THE
// FIRST UNDER D126's TWO-SURFACE AMENDMENT, and per the adjudication it is a
// test of the rule as much as of the payload. Capture instrument corrected
// from wo-d126-dryrun: the FULL suite-output tail is preserved so BOTH
// surfaces are visible — assertion reds AND process-level errors (the D126
// forty-fourth catch's exact gap).
// Payload core dry-run VERBATIM: the value literal (combat-config.ts,
// 268/52 -> 253/52) and the pin literal (d110-pins.test.ts:167, same token)
// — the simultaneous update the D110 PR-65 pattern requires and D122
// licenses. Comment rewrites carry no test surface and ride the real WO.
// EXPECTED, registered before the run: assertion surface — ENOBUFS
// (EXPECTED-PRE-EXISTING, gate-repair WO), d110-pins GREEN under the
// simultaneous update; process surface — the vitest-worker RPC timeout
// (EXPECTED-PRE-EXISTING, harness-repair WO, known reproducible at current
// suite scale). A THIRD red on either surface is a FINDING.
// Throwaway discipline: EOL-aware anchors, exact-count guards, restore +
// rebuild in finally, byte-identity verified.
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
const REPO = process.cwd();
const CFG = join(REPO, 'engine/src/combat-config.ts');
const PIN = join(REPO, 'engine/tests/d110-pins.test.ts');
const P1_OLD = `      best: 268 / 52,`;
const P1_NEW = `      best: 253 / 52,`;
const P2_OLD = `    expect(usRange.best).toBe(268 / 52);`;
const P2_NEW = `    expect(usRange.best).toBe(253 / 52);`;
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
const patch = async (path, oldS, newS) => {
  let src = await readFile(path, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const anchor = oldS.split('\n').join(eol);
  const found = src.split(anchor).length - 1;
  if (found !== 1) throw new Error(`anchor found ${found} times (expected 1) in ${path}`);
  await writeFile(path, src.replace(anchor, newS.split('\n').join(eol)), 'utf8');
};
log('=== WO-D127 dry-run: value + pin literals simultaneously, full suite, TWO-SURFACE capture ===');
try {
  run('git restore engine/src/combat-config.ts engine/tests/d110-pins.test.ts');
  await patch(CFG, P1_OLD, P1_NEW);
  await patch(PIN, P2_OLD, P2_NEW);
  run('npx tsc -p tsconfig.engine.json');
  log('payload core applied and built; running the full suite...');
  let out = '';
  try {
    out = sh('npx vitest run --fileParallelism=false');
    log('suite exit: 0');
  } catch (error) {
    out = (error.stdout?.toString() ?? '') + (error.stderr?.toString() ?? '');
    log('suite exit: nonzero');
  }
  const tail = out.split('\n').slice(-60).join('\n');
  log('--- FULL TAIL (both surfaces) ---');
  log(tail);
} finally {
  run('git restore engine/src/combat-config.ts engine/tests/d110-pins.test.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
await writeFile(join(REPO, '.claude/wo-d127-dryrun.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
