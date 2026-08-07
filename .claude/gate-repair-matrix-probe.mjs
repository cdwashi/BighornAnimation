// GATE-REPAIR instrument 3/3 — the offense matrix, measured BEFORE the repair is
// authorised (D127's form applied to an instrument repair). Builds a THROWAWAY temp repo
// in the session scratchpad — ZERO bytes of the project repository are touched.
//
// Columns per cell:
//   OLD    — the current gate's verdict, via its exact mechanism (execFileSync `git show
//            :path`, encoding 'buffer', DEFAULT maxBuffer, the test's BOM/CR predicates).
//            Equivalence of this replica to the committed test was established on the real
//            repository by gate-repair-enobufs-probe.mjs (same ENOBUFS, same blob).
//   REF    — the reference oracle's verdict. Shares NO implementation with Node:
//            blob-CR   = `git grep -I --cached -P '\r'` (git-native, line-scoped; a CR
//                        byte always lies within some line, so path-level presence is
//                        equivalent to CR-anywhere);
//            blob-BOM  = `git show :path | od -An -tx1 -N3` under sh (the pre-commit
//                        hook's own mechanism), first three bytes efbbbf AT OFFSET 0 —
//                        chosen over git-grep for BOM because grep would also match BOM
//                        bytes mid-file, which the gate's predicate deliberately permits;
//            message   = `git log -1 --format=%B <sha> | od -An -v -tx1` under sh; BOM =
//                        first three bytes efbbbf, CR = any 0d byte.
//   HOOK   — scripts/hooks/pre-commit (the REAL committed hook, run via sh against the
//            temp repo's staged index). Message cells: the commit-msg hook does not exist
//            yet (it is payload); that column is filled at acceptance.
//
// The repaired gate must reproduce REF on every cell. The OLD column is the measured
// defect: ERROR rows are the scale clause; NO-COVERAGE rows are the subjects clause.
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const SH = 'C:\\Program Files\\Git\\bin\\sh.exe';
const SCRATCH = process.env.GATE_REPAIR_SCRATCH || tmpdir();
const TMP = join(SCRATCH, 'gate-repair-matrix-repo');
const PROJECT_ROOT = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
const HOOK = join(PROJECT_ROOT, 'scripts', 'hooks', 'pre-commit');

const MiB = 1024 * 1024;
const g = (args, opts = {}) => execFileSync('git', args, { cwd: TMP, stdio: ['ignore', 'pipe', 'pipe'], ...opts });
const sh = (cmd) => {
  const r = spawnSync(SH, ['-c', cmd], { cwd: TMP, encoding: 'utf8' });
  return { out: (r.stdout || '').trim(), err: (r.stderr || '').trim(), status: r.status };
};

rmSync(TMP, { recursive: true, force: true });
mkdirSync(TMP, { recursive: true });
g(['init', '-q']);
g(['config', 'user.name', 'matrix-probe']);
g(['config', 'user.email', 'matrix-probe@invalid']);
g(['config', 'core.autocrlf', 'false']); // staged bytes = written bytes; disclosed
g(['config', 'commit.gpgsign', 'false']);
writeFileSync(join(TMP, 'seed.md'), 'seed\n');
g(['add', 'seed.md']);
g(['commit', '-q', '-m', 'seed']);

console.log(`temp repo: ${TMP}`);
console.log(`hook under test: ${HOOK}`);
console.log(`git ${execFileSync('git', ['--version'], { encoding: 'utf8' }).trim()}, node ${process.version}`);

// ---------- MESSAGE CELLS (committed first, on a clean tree) ----------
const BOM = Buffer.from([0xef, 0xbb, 0xbf]);
const msgCells = [
  { id: 'M1', desc: 'clean message, -F, default cleanup', bytes: Buffer.from('M1 clean subject\n\nclean body\n'), cleanup: null },
  { id: 'M2', desc: 'BOM at message offset 0, -F, default cleanup (the 94b4045 class)', bytes: Buffer.concat([BOM, Buffer.from('M2 bom subject\n\nbody\n')]), cleanup: null },
  { id: 'M3', desc: 'CRLF line endings, -F, default cleanup', bytes: Buffer.from('M3 crlf subject\r\n\r\nbody line\r\n'), cleanup: null },
  { id: 'M4', desc: 'CRLF line endings, -F, --cleanup=verbatim', bytes: Buffer.from('M4 crlf subject\r\n\r\nbody line\r\n'), cleanup: 'verbatim' },
  { id: 'M5', desc: 'interior CR (mid-line), -F, default cleanup', bytes: Buffer.from('M5 subject\n\nbody with\rinterior CR\n'), cleanup: null },
];
const msgResults = [];
for (const c of msgCells) {
  const f = join(TMP, `${c.id}.msgfile`);
  writeFileSync(f, c.bytes);
  const args = ['commit', '-q', '--allow-empty', '-F', f];
  if (c.cleanup) args.push(`--cleanup=${c.cleanup}`);
  g(args);
  const sha = g(['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  // Committed-bytes FACT (node read, cross-checkable against REF):
  const raw = g(['cat-file', 'commit', sha]);
  const m = raw.slice(raw.indexOf('\n\n') + 2);
  const fact = { bom: m[0] === 0xef && m[1] === 0xbb && m[2] === 0xbf, cr: m.includes(0x0d) };
  // REF oracle, sh + git plumbing + od only:
  const first3 = sh(`git log -1 --format=%B ${sha} | od -An -v -tx1 -N3 | tr -d ' \\n'`).out;
  const crHits = sh(`git log -1 --format=%B ${sha} | od -An -v -tx1 | tr ' ' '\\n' | grep -c '^0d$'`);
  const refBom = first3 === 'efbbbf';
  const refCr = crHits.status === 0 && Number(crHits.out) > 0;
  const ref = refBom || refCr ? `FAIL(${[refBom && 'BOM', refCr && 'CR'].filter(Boolean).join('+')})` : 'PASS';
  msgResults.push({ id: c.id, desc: c.desc, sha: sha.slice(0, 9), fact, old: 'NO-COVERAGE', ref });
}

// ---------- BLOB CELLS (staged, never committed) ----------
const bigClean = Buffer.from(('a'.repeat(63) + '\n').repeat(Math.ceil(1.5 * MiB / 64)));
const bigCrPastBoundary = Buffer.concat([
  Buffer.from(('b'.repeat(63) + '\n').repeat(Math.ceil(1.2 * MiB / 64))), // clean past 1 MiB
  Buffer.from('tail line with CRLF\r\n'),
]);
const bigBom = Buffer.concat([BOM, Buffer.from(('c'.repeat(63) + '\n').repeat(Math.ceil(1.2 * MiB / 64)))]);
const blobCells = [
  { id: 'B1', file: 'b1-clean.md', desc: 'clean small blob', bytes: Buffer.from('clean cell\n') },
  { id: 'B2', file: 'b2-bom.md', desc: 'BOM at offset 0, small', bytes: Buffer.concat([BOM, Buffer.from('bom cell\n')]) },
  { id: 'B3', file: 'b3-cr.md', desc: 'CR bytes, small', bytes: Buffer.from('cr cell\r\nsecond\r\n') },
  { id: 'B4', file: 'b4-big-clean.txt', desc: `clean blob ${bigClean.length} B (> 1 MiB default maxBuffer)`, bytes: bigClean },
  { id: 'B5', file: 'b5-big-cr-past-1mib.txt', desc: `CR located PAST the 1 MiB boundary (${bigCrPastBoundary.length} B)`, bytes: bigCrPastBoundary },
  { id: 'B6', file: 'b6-big-bom.txt', desc: `BOM at offset 0, blob ${bigBom.length} B > 1 MiB`, bytes: bigBom },
  { id: 'B7', file: 'b7-bom-not-at-0.md', desc: 'BOM bytes NOT at offset 0 (false-positive control)', bytes: Buffer.concat([Buffer.from('x'), BOM, Buffer.from('\n')]) },
  { id: 'B8', file: 'scripts/hooks/b8-synthetic-hook', desc: 'BOM at offset 0, extensionless scripts/hooks path', bytes: Buffer.concat([BOM, Buffer.from('#!/bin/sh\nexit 0\n')]) },
];
mkdirSync(join(TMP, 'scripts', 'hooks'), { recursive: true });
for (const c of blobCells) writeFileSync(join(TMP, c.file), c.bytes);
g(['add', ...blobCells.map((c) => c.file)]);

// OLD column — the current gate's exact mechanism and predicates:
const oldVerdict = (path) => {
  let bytes;
  try {
    bytes = execFileSync('git', ['show', `:${path}`], { cwd: TMP, encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (e) {
    return `ERROR(${e.code})`;
  }
  const offenses = [];
  if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) offenses.push('BOM');
  if (bytes.includes(0x0d)) offenses.push('CR');
  return offenses.length ? `FAIL(${offenses.join('+')})` : 'PASS';
};

// REF columns:
const grepCr = sh(`git grep -I --cached -P '\\r' | cut -d: -f1 | sort -u`);
const crPaths = new Set(grepCr.out ? grepCr.out.split('\n') : []);
const refVerdict = (path) => {
  const first3 = sh(`git show :${path} | od -An -tx1 -N3 | tr -d ' \\n'`).out;
  const bom = first3 === 'efbbbf';
  const cr = crPaths.has(path);
  return bom || cr ? `FAIL(${[bom && 'BOM', cr && 'CR'].filter(Boolean).join('+')})` : 'PASS';
};

// HOOK column — one run over the staged set, per-path rejections parsed from stderr:
const hookRun = sh(`'${HOOK.replace(/\\/g, '/').replace("'", "'\\''")}'`);
const hookVerdict = (path) => {
  const lines = hookRun.err.split('\n').filter((l) => l.includes(`: ${path}:`));
  if (!lines.length) return 'PASS';
  const bom = lines.some((l) => l.includes('BOM'));
  const cr = lines.some((l) => l.includes('CR'));
  return `FAIL(${[bom && 'BOM', cr && 'CR'].filter(Boolean).join('+')})`;
};

console.log('\n=== BLOB CELLS (staged in temp index) ===');
console.log('cell | description | OLD (current gate mechanism) | REF (git-native oracle) | HOOK (pre-commit, real file)');
for (const c of blobCells) {
  console.log(`${c.id} | ${c.desc} | ${oldVerdict(c.file)} | ${refVerdict(c.file)} | ${hookVerdict(c.file)}`);
}
console.log(`hook exit status over the staged set: ${hookRun.status} (non-zero = rejected commit, expected)`);

console.log('\n=== MESSAGE CELLS (committed in temp repo) ===');
console.log('cell | description | committed-bytes fact | OLD | REF');
for (const r of msgResults) {
  console.log(`${r.id} | ${r.desc} | sha ${r.sha} BOM=${r.fact.bom} CR=${r.fact.cr} | ${r.old} | ${r.ref}`);
}
console.log('\nNote: OLD has NO message coverage anywhere — that measured absence IS the subjects clause.');
console.log('The commit-msg hook column is payload and is filled at acceptance.');

// ---------- MECHANISM ISOLATION: why the hook's CR leg is inert (defect 3) ----------
// Git-for-Windows' MSYS2 grep opens files in text mode and strips EOL CRs before
// matching, so `grep "$(printf '\r')"` cannot see a CRLF ending — the exact class the
// gate exists for — while an interior CR still matches. The od route is byte-true.
console.log('\n=== HOOK CR-LEG MECHANISM ISOLATION (sh, temp dir) ===');
const isoDir = join(TMP, 'iso');
mkdirSync(isoDir, { recursive: true });
const iso = (cmd) => spawnSync(SH, ['-c', cmd], { cwd: isoDir, encoding: 'utf8' });
iso(`printf 'a\\r\\nb\\n' > eolcr.txt; printf 'a\\rb\\n' > midcr.txt`);
console.log(`EOL CR file, hook's grep pattern:      exit ${iso(`grep -q "$(printf '\\r')" eolcr.txt`).status} (1 = MISSED, the defect)`);
console.log(`interior CR file, hook's grep pattern: exit ${iso(`grep -q "$(printf '\\r')" midcr.txt`).status} (0 = matched)`);
console.log(`EOL CR file, od byte-true route:       ${iso(`od -An -v -tx1 eolcr.txt | tr ' ' '\\n' | grep -c '^0d$'`).stdout.trim()} CR byte(s) found (the repair route)`);
