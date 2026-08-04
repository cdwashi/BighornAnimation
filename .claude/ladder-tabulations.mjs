// S1/S4/S2/S3/S5 tabulations (2026-08-04), per the FROZEN plan at
// docs/research/LADDER-SHARING-MEASUREMENT-PLAN.md (6472341). Inputs: the
// committed Probe R1 log and the scenario data surface. No simulation; the
// movement implementation stays closed. The probe tabulates, it rules
// nothing; summaries print in the pre-committed reading order S1, S4, S2,
// S3, S5.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const toLocal = (lat, lon) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; };
const landmarks = scenario.terrain.landmarks.map((l) => ({ id: l.id, ...toLocal(l.position.lat, l.position.lon) }));
const sideOf = new Map(scenario.units.map((u) => [u.id, u.sideId]));
const SIDES = [...new Set(scenario.units.map((u) => u.sideId))];
const speeds = [];
const walk = (n, p) => {
  if (Array.isArray(n)) { n.forEach((v, i) => walk(v, `${p}[${i}]`)); return; }
  if (n && typeof n === 'object') { for (const [k, v] of Object.entries(n)) { if (typeof v === 'number' && /speed/i.test(k)) speeds.push({ path: `${p}.${k}`, value: v }); walk(v, `${p}.${k}`); } }
};
walk(scenario, '$');
const rows = (await readFile(join(REPO, '.claude/repath-event-log.out.txt'), 'utf8')).split('\n');
const re = /^(\d+) t(\d+) (\S+) (ORDER-CHANGED|TERMINAL-MOVES|TERMINAL-APPEARS|TERMINAL-CLEARED) (\S+) order=(\S+) (\((-?\d+),(-?\d+)\)|null)->(\((-?\d+),(-?\d+)\)|null) dObj=\S+ enemy=(\S+?)@?([\d.]*) angle=\S+ steady=\S+ prov=(.*)$/;
const events = [];
for (const l of rows) {
  const m = l.match(re);
  if (!m) continue;
  events.push({ seed: m[1], t: Number(m[2]), unit: m[3], cat: m[4], morale: m[5], order: m[6],
    oldT: m[7] === 'null' ? null : { x: Number(m[8]), y: Number(m[9]) },
    newT: m[10] === 'null' ? null : { x: Number(m[11]), y: Number(m[12]) },
    enemyId: m[13] || null, enemyD: m[14] ? Number(m[14]) : null, prov: m[15] });
}
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`events parsed: ${events.length} | sides: ${SIDES.join(' / ')} | declared speed entries found: ${speeds.length}`);
log('');
const RUNGS = [12671, 13049, 13422, 13690, 13961, 14219, 14489, 14753, 15021, 15294, 15562, 15937, 16191, 16543, 16797, 17056];
const rungEvents = (y) => events.filter((e) => e.newT && e.newT.x === 6624 && e.newT.y === y);

log('=== S1 — rung ownership (read first) ===');
const ownerTally = new Map(); let oldOnLine = 0, oldOffLine = 0, oldNull = 0;
for (const y of RUNGS) for (const e of rungEvents(y)) {
  const k = `${e.unit} (${sideOf.get(e.unit) ?? '?'})`;
  ownerTally.set(k, (ownerTally.get(k) ?? 0) + 1);
  if (!e.oldT) oldNull += 1; else if (Math.abs(e.oldT.x - 6624) <= 1) oldOnLine += 1; else oldOffLine += 1;
}
log(`rung owners: ${[...ownerTally.entries()].map(([k, n]) => `${k}:${n}`).join(' | ')}`);
log(`owner's PREVIOUS terminal: on the x=6624 line ${oldOnLine} | off the line ${oldOffLine} | null ${oldNull}`);
for (const y of RUNGS) for (const e of rungEvents(y))
  log(`  rung y=${y}: seed ${e.seed} t${e.t} ${e.unit} [${sideOf.get(e.unit) ?? '?'} ${e.morale} ${e.cat} order=${e.order}] oldT=${e.oldT ? `(${e.oldT.x},${e.oldT.y})` : 'null'} enemy=${e.enemyId ?? '-'}@${e.enemyD ?? '-'}`);
log('');

log('=== S4 — the ordered-march control (read second) ===');
const oc = events.filter((e) => e.cat === 'ORDER-CHANGED' && e.newT);
const provClass = (p) => p.includes('WHOLE') ? 'WHOLE' : (p.includes('X=') || p.includes('Y=')) ? 'COMPONENT' : 'none';
const ocTally = { WHOLE: 0, COMPONENT: 0, none: 0 };
for (const e of oc) ocTally[provClass(e.prov)] += 1;
log(`ORDER-CHANGED events with a terminal: ${oc.length} | provenance: WHOLE ${ocTally.WHOLE} | COMPONENT-only ${ocTally.COMPONENT} | none ${ocTally.none}`);
const ocNone = oc.filter((e) => provClass(e.prov) === 'none');
log(`ORDER-CHANGED terminals matching nothing declared (candidate ordered-march rungs): ${ocNone.length}`);
for (const e of ocNone.slice(0, 15)) log(`  ${e.seed} t${e.t} ${e.unit} order=${e.order} ->(${e.newT.x},${e.newT.y})`);
if (ocNone.length > 15) log(`  … ${ocNone.length - 15} more`);
log('');

log('=== S2 — step arithmetic against declared speeds (read third) ===');
log(`declared speeds on the data surface: ${speeds.map((s) => `${s.path}=${s.value}`).join(' | ') || 'NONE FOUND under /speed/i keys'}`);
const spacings = RUNGS.slice(1).map((y, i) => y - RUNGS[i]);
log(`rung spacings: ${spacings.join(' ')} (n=${spacings.length}, min ${Math.min(...spacings)}, max ${Math.max(...spacings)})`);
for (const s of speeds) {
  const ratios = spacings.map((sp) => (sp / s.value));
  const intish = ratios.filter((r) => Math.abs(r - Math.round(r)) <= 0.05 && Math.round(r) >= 1).length;
  log(`  ÷ ${s.path} (${s.value}): ratios ${ratios.map((r) => r.toFixed(2)).join(' ')} | near-integer ${intish}/${ratios.length}`);
}
log('');

log('=== S3 — temporal coupling at the flagship (read fourth) ===');
const flag = events.filter((e) => e.newT && e.newT.x === 6624 && e.newT.y === 20006);
const bySeed = new Map();
for (const e of flag) { if (!bySeed.has(e.seed)) bySeed.set(e.seed, []); bySeed.get(e.seed).push(e); }
let usFirst = 0, coFirst = 0, only = 0;
const usSide = SIDES.find((s) => /us|7th/i.test(s)) ?? SIDES[0];
for (const [seed, es] of bySeed) {
  const us = es.filter((e) => sideOf.get(e.unit) === usSide).map((e) => e.t);
  const co = es.filter((e) => sideOf.get(e.unit) !== usSide).map((e) => e.t);
  if (us.length && co.length) { if (Math.min(...us) <= Math.min(...co)) usFirst += 1; else coFirst += 1; }
  else only += 1;
}
log(`flagship events ${flag.length} across ${bySeed.size} seeds | seeds with both sides: US-side first ${usFirst}, coalition first ${coFirst} | single-side seeds ${only}`);
const eD = (side) => { const a = flag.filter((e) => (sideOf.get(e.unit) === usSide) === side && e.enemyD !== null).map((e) => e.enemyD).sort((x, y) => x - y); return a.length ? `n=${a.length} min ${a[0]} med ${a[Math.floor(a.length / 2)]} max ${a[a.length - 1]}` : 'n=0'; };
log(`flagship enemy-distance: US-side ${eD(true)} | coalition ${eD(false)}`);
const sample = [...bySeed.entries()].slice(0, 3);
for (const [seed, es] of sample) log(`  seed ${seed} sequence: ${es.sort((a, b) => a.t - b.t).map((e) => `t${e.t} ${e.unit}[${sideOf.get(e.unit) === usSide ? 'US' : 'CO'} ${e.morale}]`).join(' → ')}`);
log('');

log('=== S5 — pairing identity (read last) ===');
for (const y of RUNGS) {
  const es = rungEvents(y);
  log(`  y=${y}: ${es.map((e) => `${e.seed}/t${e.t}/${e.unit}`).join(' , ')}`);
}
await writeFile(join(REPO, '.claude/ladder-tabulations.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
