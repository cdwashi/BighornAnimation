// GATE-REPAIR instrument 2/3 — commit-message BOM/CR census. READ-ONLY on the repository.
// Enumerates every commit reachable from HEAD whose message carries a UTF-8 BOM at message
// offset 0 or any CR byte. The result is the subjects-clause allowlist: the register's
// recorded scars, and nothing else, must appear here.
import { execFileSync } from 'node:child_process';

console.log(`HEAD ${execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()}`);
const shas = execFileSync('git', ['rev-list', 'HEAD'], { encoding: 'utf8' }).trim().split('\n');
console.log(`commits scanned: ${shas.length}`);
const bad = [];
for (const s of shas) {
  const b = execFileSync('git', ['cat-file', 'commit', s], { maxBuffer: 16 * 1024 * 1024 });
  const i = b.indexOf('\n\n');
  const m = b.slice(i + 2);
  const flags = [];
  if (m[0] === 0xef && m[1] === 0xbb && m[2] === 0xbf) flags.push('BOM');
  if (m.includes(0x0d)) flags.push('CR');
  if (flags.length) bad.push({ sha: s, flags, subject: m.toString('utf8').split('\n')[0].slice(0, 90) });
}
console.log(`offending messages: ${bad.length}`);
for (const x of bad) console.log(`${x.sha}  [${x.flags.join('+')}]  ${x.subject}`);
