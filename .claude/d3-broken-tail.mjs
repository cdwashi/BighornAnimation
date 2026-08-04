// D3 rescope (2026-08-04, ordered at the twenty-seventh catch's
// adjudication): the registered D3 statistic re-run over the BROKEN-UNIT
// TAIL alone - stray events (TERMINAL-MOVES / TERMINAL-APPEARS) by units in
// SHAKEN / ROUTED / BROKEN morale - parsed from the committed Probe R1 log,
// no new simulation. Same statistic, same bins; per-morale and per-category
// splits and the tail's destination tally reported beside it. Read-only;
// results carry nothing beyond the registered branches.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
const REPO = process.cwd();
const rows = (await readFile(join(REPO, '.claude/repath-event-log.out.txt'), 'utf8')).split('\n');
const re = /^(\d+) t(\d+) (\S+) (TERMINAL-MOVES|TERMINAL-APPEARS) (\S+) order=(\S+) (\(.+?\)|null)->\((-?\d+),(-?\d+)\) dObj=(\S+) enemy=(\S+) angle=(-?\d+|-) /;
const TAIL = new Set(['SHAKEN', 'ROUTED', 'BROKEN']);
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
let all = 0, tail = 0, noAngle = 0;
const bins = new Array(12).fill(0);
const byMorale = new Map(); const byCat = new Map(); const dests = new Map();
for (const l of rows) {
  const m = l.match(re);
  if (!m) continue;
  all += 1;
  const morale = m[5];
  if (!TAIL.has(morale)) continue;
  tail += 1;
  const cat = m[4];
  const destKey = `${m[8]},${m[9]}`;
  if (!dests.has(destKey)) dests.set(destKey, { n: 0, seeds: new Set() });
  dests.get(destKey).n += 1; dests.get(destKey).seeds.add(m[1]);
  const bump = (map, k) => { if (!map.has(k)) map.set(k, new Array(12).fill(0).concat([0])); };
  if (m[12] === '-') { noAngle += 1; continue; }
  const a = Number(m[12]);
  const bi = Math.min(11, Math.floor((a + 180) / 30));
  bins[bi] += 1;
  bump(byMorale, morale); byMorale.get(morale)[bi] += 1;
  bump(byCat, cat); byCat.get(cat)[bi] += 1;
}
log(`stray events parsed from committed log: ${all} | broken-unit tail (SHAKEN/ROUTED/BROKEN): ${tail} | tail events without an angle: ${noAngle}`);
log('');
log('D3 rescoped - angle flight-vs-away-from-nearest-enemy, 30-degree bins [-180..180), broken tail only:');
log(`  ${bins.join(' ')}`);
const n = bins.reduce((s, v) => s + v, 0);
log(`  n=${n} | fraction in the two toward-enemy end bins: ${((bins[0] + bins[11]) / n * 100).toFixed(1)}% | fraction in the two away-from-enemy centre bins [-30..30): ${((bins[5] + bins[6]) / n * 100).toFixed(1)}%`);
log('');
log('per morale state:');
for (const [k, v] of byMorale) log(`  ${k}: ${v.slice(0, 12).join(' ')} (n=${v.slice(0, 12).reduce((s, x) => s + x, 0)})`);
log('per category:');
for (const [k, v] of byCat) log(`  ${k}: ${v.slice(0, 12).join(' ')} (n=${v.slice(0, 12).reduce((s, x) => s + x, 0)})`);
log('');
log(`tail destination tally: ${dests.size} distinct terminals`);
for (const [k, v] of [...dests.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 20)) log(`  (${k}) x${v.n} across ${v.seeds.size} seeds`);
if (dests.size > 20) log(`  ... ${dests.size - 20} more`);
await writeFile(join(REPO, '.claude/d3-broken-tail.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
