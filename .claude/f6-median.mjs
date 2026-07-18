// Dev-only authoritative F6 measurement: three clean Node processes.
import { execFileSync } from 'node:child_process';

const runs = [];
for (let index = 0; index < 3; index += 1) {
  const output = execFileSync(process.execPath, ['.claude/f6-bare.mjs'], {
    encoding: 'utf8',
  }).trim();
  const result = JSON.parse(output);
  runs.push(result);
}
runs.sort((left, right) => left.elapsedMs - right.elapsedMs);
console.log(JSON.stringify({ medianMs: runs[1].elapsedMs, runs }, null, 2));
