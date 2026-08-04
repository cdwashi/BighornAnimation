// Probe R1 — the re-path event log (2026-08-04), per the FROZEN plan at
// docs/research/RE-PATH-MEASUREMENT-PLAN.md (committed 3dbbf3c BEFORE this
// probe was written or run). Read-only; black-box per Amendment 4: sim state
// and public API only, movement/retreat implementation unopened. Results
// carry nothing beyond the registered branches; summaries print in the
// pre-committed reading order D1..D5.
//
// Registered conventions carried from the plan: event categories
// terminal-moves (point->point, disp>=100, new terminal >=100 from own
// declared objective), terminal-appears (null->point, >=100 from objective),
// terminal-cleared (point->null); order-changed terminal changes are a NAMED
// category (attributed when the change lands on the same tick as the
// activeOrderId change or the tick after — stated here as the attribution
// window); waypoint consumption (terminal unchanged) is not an event; small
// moves and to-objective re-paths are counted exclusions; threshold
// sensitivity reported at 50/100/200 without re-ruling.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const toLocal = (lat, lon) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; };
const srcById = new Map(scenario.units.map((u) => [u.id, u]));
const SIDE_OF = (id) => srcById.get(id)?.sideId;
const isCombat = (id) => srcById.get(id) && srcById.get(id).kind !== 'NONCOMBATANT_CAMP';
const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);

// ---- Coordinate audit: every {lat, lon}-bearing point in scenario.json ----
const audit = [];
const walk = (node, path) => {
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`)); return; }
  if (node && typeof node === 'object') {
    if (typeof node.lat === 'number' && typeof node.lon === 'number') {
      const p = toLocal(node.lat, node.lon);
      audit.push({ x: p.x, y: p.y, path });
    }
    for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`);
  }
};
walk(scenario, 'scenario');

// ---- Order objectives (same resolution as the D113 probes) ----
const lmById = new Map(scenario.terrain.landmarks.map((l) => [l.id, toLocal(l.position.lat, l.position.lon)]));
const orderObj = new Map();
for (const o of scenario.orders) {
  let obj = null;
  if (o.objective?.landmarkId) obj = lmById.get(o.objective.landmarkId) ?? null;
  else if (o.objective?.waypoints?.length) { const w = o.objective.waypoints[o.objective.waypoints.length - 1]; obj = toLocal(w.lat, w.lon); }
  orderObj.set(o.id, obj);
}

// ---- Death rows (for D5 tracing) and the escrow/failed classification ----
const deaths = new Map(); // `${seed}|${unit}` -> tick
for (const a of results.annihilations) deaths.set(`${a.seed}|${a.unit}`, a.tick);
const reder = (await readFile(join(REPO, '.claude/membership-rederivation.out.txt'), 'utf8')).split('\n');
const escrow = [], failed = [];
for (const l of reder) {
  const m = l.match(/^row (\d+) t(\d+) (\S+)\[self (\S+?)( [\d.]+m)?\]:.*rowSurvives=(YES|no)/);
  if (!m) continue;
  const row = { seed: Number(m[1]), tick: Number(m[2]), unit: m[3], self: m[4], survives: m[6] === 'YES' };
  if (row.self === 'P2' && row.survives) escrow.push(row);
  else if ((row.self === 'P2' && !row.survives) || row.self === 'P3') failed.push(row);
}

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`coordinate audit size: ${audit.length} lat/lon-bearing points in scenario.json`);
log(`escrow rows parsed: ${escrow.length} (expect 33) | failed rows parsed: ${failed.length} (expect 17)`);
log('');

// ---- Event scan across all 50 seeds ----
const provenance = (pt) => {
  const whole = audit.filter((a) => d(a, pt) <= 10);
  const rx = Math.round(pt.x), ry = Math.round(pt.y);
  const compX = audit.filter((a) => Math.round(a.x) === rx && d(a, pt) > 10);
  const compY = audit.filter((a) => Math.round(a.y) === ry && d(a, pt) > 10);
  return { whole, compX, compY };
};
const seeds = results.rows.map((r) => r.seed).sort((a, b) => a - b);
const events = [];
// waypoint consumption leaves the terminal unchanged and is structurally not a
// terminal change; it cannot enter this scan and therefore has no counter.
const excl = { smallMove: 0, toObjective: 0, appearsAtObjective: 0 };
const rawMoves = [], rawAppears = [];
const END_TICK = 2160;
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  const prev = new Map(); // unit -> {term, orderId, orderChangedAt}
  for (let t = 0; t <= END_TICK; t += 1) {
    sim.run(t);
    const st = sim.state();
    for (const u of st.units) {
      if (!isCombat(u.id)) continue;
      const term = u.path?.length ? { x: u.path[u.path.length - 1].x, y: u.path[u.path.length - 1].y } : null;
      const p = prev.get(u.id);
      if (!p) { prev.set(u.id, { term, orderId: u.activeOrderId ?? null, orderChangedAt: -99 }); continue; }
      const orderChanged = (u.activeOrderId ?? null) !== p.orderId;
      const changedAt = orderChanged ? t : p.orderChangedAt;
      const termChanged = (term === null) !== (p.term === null) || (term && p.term && d(term, p.term) > 0.5);
      if (termChanged) {
        const obj = orderObj.get(u.activeOrderId) ?? null;
        const dObj = term && obj ? d(term, obj) : null;
        const recent = t - changedAt <= 1;
        const mk = (category) => {
          const enemies = st.units.filter((e) => isCombat(e.id) && !e.endState && !e.withdrawnOffField && SIDE_OF(e.id) !== SIDE_OF(u.id))
            .map((e) => ({ id: e.id, dd: d(e.position, u.position), pos: e.position })).sort((a, b) => a.dd - b.dd)[0] ?? null;
          const steady = st.units.filter((f) => f.id !== u.id && isCombat(f.id) && !f.endState && !f.withdrawnOffField && SIDE_OF(f.id) === SIDE_OF(u.id) && f.moraleState === 'STEADY')
            .map((f) => ({ id: f.id, dd: d(f.position, u.position) })).sort((a, b) => a.dd - b.dd)[0] ?? null;
          const prov = term ? provenance(term) : null;
          events.push({ seed, t, unit: u.id, category, morale: u.moraleState, orderId: u.activeOrderId ?? null,
            oldT: p.term, newT: term, pos: { x: u.position.x, y: u.position.y }, dObj, enemy: enemies, steady, prov });
        };
        if (orderChanged || recent) { mk('ORDER-CHANGED'); }
        else if (p.term === null && term !== null) {
          rawAppears.push({ dObj });
          if (dObj === null || dObj >= 100) mk('TERMINAL-APPEARS'); else excl.appearsAtObjective += 1;
        } else if (p.term !== null && term === null) { mk('TERMINAL-CLEARED'); }
        else {
          const disp = d(term, p.term);
          rawMoves.push({ disp, dObj });
          if (disp < 100) excl.smallMove += 1;
          else if (dObj !== null && dObj < 100) excl.toObjective += 1;
          else if (disp >= 100) mk('TERMINAL-MOVES');
        }
      }
      prev.set(u.id, { term, orderId: u.activeOrderId ?? null, orderChangedAt: changedAt });
    }
  }
  console.error(`seed ${seed} done (${events.length} events so far)`);
}

// ---- Event log ----
const fmt = (pt) => pt ? `(${pt.x.toFixed(0)},${pt.y.toFixed(0)})` : 'null';
const provStr = (e) => {
  if (!e.prov) return '-';
  const w = e.prov.whole.length ? `WHOLE[${e.prov.whole.slice(0, 2).map((a) => a.path).join(';')}${e.prov.whole.length > 2 ? ';…' : ''}]` : '';
  const cx = e.prov.compX.length ? `X=[${e.prov.compX.slice(0, 2).map((a) => a.path).join(';')}${e.prov.compX.length > 2 ? ';…' : ''}]` : '';
  const cy = e.prov.compY.length ? `Y=[${e.prov.compY.slice(0, 2).map((a) => a.path).join(';')}${e.prov.compY.length > 2 ? ';…' : ''}]` : '';
  return [w, cx, cy].filter(Boolean).join(' ') || 'none';
};
log('=== EVENT LOG ===');
for (const e of events) {
  const ang = e.enemy && e.newT ? (() => {
    const flight = Math.atan2(e.newT.y - e.pos.y, e.newT.x - e.pos.x);
    const away = Math.atan2(e.pos.y - e.enemy.pos.y, e.pos.x - e.enemy.pos.x);
    let a = (flight - away) * 180 / Math.PI; while (a > 180) a -= 360; while (a < -180) a += 360; return a.toFixed(0);
  })() : '-';
  log(`${e.seed} t${e.t} ${e.unit} ${e.category} ${e.morale} order=${e.orderId ?? '-'} ${fmt(e.oldT)}->${fmt(e.newT)} dObj=${e.dObj === null ? '-' : e.dObj.toFixed(0)} enemy=${e.enemy ? `${e.enemy.id}@${e.enemy.dd.toFixed(0)}` : 'none'} angle=${ang} steady=${e.steady ? `${e.steady.id}@${e.steady.dd.toFixed(0)}` : 'none'} prov=${provStr(e)}`);
}

// ---- Summaries, pre-committed reading order ----
const strays = events.filter((e) => (e.category === 'TERMINAL-MOVES' || e.category === 'TERMINAL-APPEARS'));
const key = (pt) => `${Math.round(pt.x)},${Math.round(pt.y)}`;
log('\n=== D1 — cardinality and repetition ===');
const catTally = {};
for (const e of events) catTally[e.category] = (catTally[e.category] ?? 0) + 1;
log(`events by category: ${JSON.stringify(catTally)} | exclusions: ${JSON.stringify(excl)}`);
const destMap = new Map();
for (const e of strays) { const k = key(e.newT); if (!destMap.has(k)) destMap.set(k, { n: 0, seeds: new Set() }); const v = destMap.get(k); v.n += 1; v.seeds.add(e.seed); }
log(`stray events (moves+appears): ${strays.length} | DISTINCT stray terminals: ${destMap.size}`);
for (const [k, v] of [...destMap.entries()].sort((a, b) => b[1].n - a[1].n).slice(0, 25)) log(`  (${k}) x${v.n} across ${v.seeds.size} seeds`);
if (destMap.size > 25) log(`  … ${destMap.size - 25} more`);
log(`sensitivity (point->point candidates, disp/dObj thresholds): 50m: ${rawMoves.filter((r) => r.disp >= 50 && (r.dObj === null || r.dObj >= 50)).length} | 100m: ${rawMoves.filter((r) => r.disp >= 100 && (r.dObj === null || r.dObj >= 100)).length} | 200m: ${rawMoves.filter((r) => r.disp >= 200 && (r.dObj === null || r.dObj >= 200)).length}`);
log(`sensitivity (appears, dObj thresholds): 50m: ${rawAppears.filter((r) => r.dObj === null || r.dObj >= 50).length} | 100m: ${rawAppears.filter((r) => r.dObj === null || r.dObj >= 100).length} | 200m: ${rawAppears.filter((r) => r.dObj === null || r.dObj >= 200).length}`);

log('\n=== D2 — provenance over DISTINCT stray terminals ===');
log(`audit size: ${audit.length} | distinct stray terminals: ${destMap.size} | pairs = ${destMap.size * audit.length} | expected metre-exact component collisions at 1e-4/pair: ${(destMap.size * audit.length * 1e-4).toFixed(2)}`);
let wholeN = 0, compN = 0, noneN = 0;
for (const k of destMap.keys()) {
  const [x, y] = k.split(',').map(Number);
  const p = provenance({ x, y });
  const tag = p.whole.length ? `WHOLE ${p.whole[0].path}` : (p.compX.length || p.compY.length) ? `COMPONENT ${p.compX.map((a) => `x=${Math.round(a.x)}:${a.path}`).slice(0, 2).join(' ')} ${p.compY.map((a) => `y=${Math.round(a.y)}:${a.path}`).slice(0, 2).join(' ')}` : 'none';
  if (p.whole.length) wholeN += 1; else if (p.compX.length || p.compY.length) compN += 1; else noneN += 1;
  log(`  (${k}) -> ${tag}`);
}
log(`distinct-terminal provenance: WHOLE ${wholeN} | COMPONENT-only ${compN} | none ${noneN}`);

log('\n=== D3 — situational correlation (stray events; angle flight-vs-away-from-enemy, 30° bins) ===');
const bins = new Array(12).fill(0); let noEnemy = 0;
for (const e of strays) {
  if (!e.enemy || !e.newT) { noEnemy += 1; continue; }
  const flight = Math.atan2(e.newT.y - e.pos.y, e.newT.x - e.pos.x);
  const away = Math.atan2(e.pos.y - e.enemy.pos.y, e.pos.x - e.enemy.pos.x);
  let a = (flight - away) * 180 / Math.PI; while (a > 180) a -= 360; while (a < -180) a += 360;
  bins[Math.min(11, Math.floor((a + 180) / 30))] += 1;
}
log(`bins [-180..180): ${bins.join(' ')} | no-enemy events: ${noEnemy}`);

log('\n=== D4 — trigger state (record-only) ===');
const stateTally = {};
for (const e of events) { const k = `${e.category}|${e.morale}`; stateTally[k] = (stateTally[k] ?? 0) + 1; }
for (const [k, n] of Object.entries(stateTally).sort((a, b) => b[1] - a[1])) log(`  ${k}: ${n}`);

log('\n=== D5 — escrow and failed-row tracing (read LAST) ===');
const trace = (rows, label) => {
  log(`-- ${label} --`);
  for (const r of rows) {
    const evs = events.filter((e) => e.seed === r.seed && e.unit === r.unit && e.t <= r.tick);
    log(`row ${r.seed} t${r.tick} ${r.unit} [self ${r.self}]: ${evs.length ? evs.map((e) => `${e.category}@t${e.t}->${fmt(e.newT)}(${provStr(e)})`).join(' ') : 'NO EVENTS'}`);
  }
};
trace(escrow, `ESCROW (${escrow.length})`);
trace(failed, `FAILED 4+13 (${failed.length})`);

await writeFile(join(REPO, '.claude/repath-event-log.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
