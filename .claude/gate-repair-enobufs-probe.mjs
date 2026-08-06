// GATE-REPAIR instrument 1/3 — ENOBUFS mechanism probe. READ-ONLY on the repository.
// Question: does the D110 gate's ENOBUFS come from the AGGREGATE 10.9 MB through one
// subprocess (WO-D126 §4's adjudicated diagnosis) or from a SINGLE blob exceeding
// execFileSync's default per-call maxBuffer?
// Method: replicate the gate's exact call shape (tests/repository-text-integrity.test.ts:
// execFileSync, encoding:'buffer', default maxBuffer) per blob; record which calls fail.
// Control: re-read any failing blob under an explicit 64 MiB buffer.
import { execFileSync } from 'node:child_process';
import { basename, extname } from 'node:path';

const TEXT_EXTENSIONS = new Set([
  '.css', '.gitignore', '.gitkeep', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.txt',
]);
const isTrackedText = (p) =>
  TEXT_EXTENSIONS.has(extname(p).toLowerCase()) ||
  p === 'scripts/hooks/pre-commit' || basename(p) === '.gitignore';

const git = (args) =>
  execFileSync('git', args, { encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'] });

console.log(`node ${process.version}`);
console.log(`HEAD ${execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()}`);

const root = git(['rev-parse', '--show-toplevel']).toString('utf8').trim();
process.chdir(root);
const paths = git(['ls-files', '-z']).toString('utf8').split('\0').filter(Boolean)
  .filter(isTrackedText);
console.log(`tracked text files under the gate's filter: ${paths.length}`);

let ok = 0; const failed = []; let aggregate = 0;
for (const p of paths) {
  const size = Number(execFileSync('git', ['cat-file', '-s', `:${p}`], { encoding: 'utf8' }).trim());
  aggregate += size;
  try {
    git(['show', `:${p}`]); // the gate's exact per-blob call, default maxBuffer
    ok++;
  } catch (e) {
    failed.push({ path: p, size, code: e.code, msg: String(e.message).slice(0, 80) });
  }
}
console.log(`aggregate bytes: ${aggregate}`);
console.log(`per-blob calls OK: ${ok}, FAILED: ${failed.length}`);
for (const f of failed) console.log(`  FAIL ${f.code} size=${f.size} ${f.path} :: ${f.msg}`);

for (const f of failed) {
  try {
    const b = execFileSync('git', ['show', `:${f.path}`],
      { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
    console.log(`  control(64MiB buffer): ${f.path} reads clean, ${b.length} bytes`);
  } catch (e) {
    console.log(`  control(64MiB buffer): ${f.path} STILL FAILS: ${e.code}`);
  }
}
