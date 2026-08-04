// R2/R3/R3b/R4 tabulations (2026-08-04), per the FROZEN plan at
// docs/research/X6624-RESIDUE-MEASUREMENT-PLAN.md (d376d3a). Semi-seen
// class: every input is the committed Probe R1 log or the committed R1
// audit; no simulation, no engine source. The probe tabulates, it rules
// nothing. Bounds from the audited manifest are used in R3b/R4 as declared
// facts (minX 240.049, minY 7425.570, maxX 12320.049, maxY 20005.570).
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const toLocal = (lat, lon) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; };
const landmarks = scenario.terrain.landmarks.map((l) => ({ id: l.id, ...toLocal(l.position.lat, l.position.lon) }));
const BOUNDS = { minX: 240.049, minY: 7425.57, maxX: 12320.049, maxY: 20005.57 };
const FAMILY = new Set(['6624,20006', '6624,19148', '6624,15124', '240,12030']);
const DECLARED_RETREATS = new Set(['4628,16572', '7162,12515', '8340,11112']);
const rows = (await readFile(join(REPO, '.claude/repath-event-log.out.txt'), 'utf8')).split('\n');
const re = /^(\d+) t(\d+) (\S+) (ORDER-CHANGED|TERMINAL-MOVES|TERMINAL-APPEARS|TERMINAL-CLEARED) (\S+) order=(\S+) (\(.+?\)|null)->(\((-?\d+),(-?\d+)\)|null) dObj=(\S+) enemy=(\S+?)@?([\d.]*) /;
const events = [];
for (const l of rows) {
  const m = l.match(re);
  if (!m) continue;
  events.push({ seed: m[1], t: Number(m[2]), unit: m[3], cat: m[4], morale: m[5], order: m[6],
    oldT: m[7], newT: m[8] === 'null' ? null : { x: Number(m[9]), y: Number(m[10]) },
    enemyD: m[13] ? Number(m[13]) : null });
}
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`events parsed from committed log: ${events.length}`);
const key = (p) => `${p.x},${p.y}`;
const fam = events.filter((e) => e.newT && FAMILY.has(key(e.newT)));
log(`family events: ${fam.length}`);
log('');
log('=== R2 — constancy against geometry (semi-seen) ===');
const byDest = new Map();
for (const e of fam) { const k = key(e.newT); if (!byDest.has(k)) byDest.set(k, []); byDest.get(k).push(e); }
for (const [k, es] of byDest) {
  const olds = new Set(es.map((e) => e.oldT));
  const eds = es.filter((e) => e.enemyD !== null).map((e) => e.enemyD).sort((a, b) => a - b);
  log(`  (${k}): n=${es.length} | distinct old terminals ${olds.size} | enemy-dist min ${eds[0] ?? '-'} med ${eds[Math.floor(eds.length / 2)] ?? '-'} max ${eds[eds.length - 1] ?? '-'}`);
}
log('  destination constant per point across all events and seeds (registered: consistent with DECL2 and REF; kills live-source MIX2 if true, cannot kill constant-source MIX2)');
log('');
log('=== R3 — precondition coherence (semi-seen) ===');
const tab = (es, label) => {
  const units = new Map(), morales = new Map(), orders = new Map();
  for (const e of es) { units.set(e.unit, (units.get(e.unit) ?? 0) + 1); morales.set(e.morale, (morales.get(e.morale) ?? 0) + 1); orders.set(e.order, (orders.get(e.order) ?? 0) + 1); }
  log(`  ${label}: units {${[...units.entries()].map(([k, n]) => `${k}:${n}`).join(' ')}} | morale {${[...morales.entries()].map(([k, n]) => `${k}:${n}`).join(' ')}} | orders {${[...orders.entries()].map(([k, n]) => `${k}:${n}`).join(' ')}}`);
};
tab(fam, 'FAMILY');
tab(events.filter((e) => e.newT && DECLARED_RETREATS.has(key(e.newT)) && e.cat !== 'ORDER-CHANGED'), 'DECLARED-RETREATS (un-ordered events only)');
const touched = new Set();
for (const e of events) if (e.newT && key(e.newT) === '6624,12030') touched.add(`${e.seed}|${e.unit}`);
const famNoTouch = fam.filter((e) => !touched.has(`${e.seed}|${e.unit}`));
log(`  registered check — family events by units whose route NEVER touched cedar-coulee (per seed): ${famNoTouch.length}${famNoTouch.length ? ' — ' + [...new Set(famNoTouch.map((e) => e.unit))].join(' ') : ''}`);
log('');
log('=== R3b — the generalisation test (semi-seen) ===');
const strays = events.filter((e) => (e.cat === 'TERMINAL-MOVES' || e.cat === 'TERMINAL-APPEARS') && e.newT);
const strayDests = new Map();
for (const e of strays) { const k = key(e.newT); if (!strayDests.has(k)) strayDests.set(k, 0); strayDests.set(k, strayDests.get(k) + 1); }
log(`distinct stray terminals: ${strayDests.size}`);
log('-- per-landmark component families: terminals sharing a landmark component (±1 m) with the OTHER component differing by >50 m --');
for (const lm of landmarks) {
  const fx = [], fy = [];
  for (const [k, n] of strayDests) {
    const [x, y] = k.split(',').map(Number);
    if (Math.abs(x - lm.x) <= 1 && Math.abs(y - lm.y) > 50) fx.push(`(${k})x${n}`);
    if (Math.abs(y - lm.y) <= 1 && Math.abs(x - lm.x) > 50) fy.push(`(${k})x${n}`);
  }
  if (fx.length || fy.length) log(`  ${lm.id} (${lm.x.toFixed(0)},${lm.y.toFixed(0)}): preserve-x [${fx.join(' ')}] preserve-y [${fy.join(' ')}]`);
}
log('-- per-bound families: terminals within 1 m of a declared grid bound --');
for (const [bname, bval] of Object.entries(BOUNDS)) {
  const axis = bname.includes('X') ? 0 : 1;
  const hits = [];
  for (const [k, n] of strayDests) {
    const c = Number(k.split(',')[axis]);
    if (Math.abs(c - bval) <= 1) hits.push(`(${k})x${n}`);
  }
  if (hits.length) log(`  ${bname}=${bval}: ${hits.join(' ')}`);
  else log(`  ${bname}=${bval}: none`);
}
log('');
log('=== R4 — the sibling constraint against the registered frame ===');
log('  (6624,20006): y = maxY (audited, metre-rounded) — bound component CONFIRMED');
log('  (240,12030): x = minX (audited, metre-rounded) — bound component CONFIRMED');
log('  (6624,19148), (6624,15124): y declared nowhere on the parsed data surface (R1) — NOT bound components; partial coverage under the registered frame, reported as partial');
await writeFile(join(REPO, '.claude/x6624-tabulations.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
