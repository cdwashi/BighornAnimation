// Order-objective check (2026-08-03, ordered by Fable at the 24th catch's
// adjudication; read-only, no proposal). Re-runs the zero-distance question
// with a predicate that CAN fire: for every recorded 0 m pair entry, resolve
// each unit's activeOrderId to its declared objective (landmarkId or final
// waypoint) through the same terrain conversion the landmark tally used, and
// measure (a) death position vs own objective, (b) death position vs the
// companion's objective, (c) whether the two objectives coincide, and
// (d) the companion's recorded live path endpoint vs its declared objective.
// (d) is the discriminator for the endpoint contradiction: weir-advance ends
// on its declared objective while right-wing-ridges and wing-consolidate do
// not, so either broken units are re-pathed by a fallback mechanism or
// objective resolution differs by order form. No sim run; inputs are the
// committed pair table and the scenario source.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const toLocal = (lat, lon) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; };
const landmarks = scenario.terrain.landmarks.map((l) => ({ id: l.id, ...toLocal(l.position.lat, l.position.lon) }));
const lmById = new Map(landmarks.map((l) => [l.id, l]));
const orders = new Map();
for (const o of scenario.orders) {
  let obj = null, form = 'none';
  if (o.objective?.landmarkId) { const lm = lmById.get(o.objective.landmarkId); obj = lm ? { x: lm.x, y: lm.y } : null; form = `landmarkId:${o.objective.landmarkId}`; }
  else if (o.objective?.waypoints?.length) { const w = o.objective.waypoints[o.objective.waypoints.length - 1]; obj = toLocal(w.lat, w.lon); form = `waypoints[last]`; }
  orders.set(o.id, { obj, form, type: o.type });
}
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log('order objective resolutions (local coords via terrain.toLocal):');
for (const [id, o] of orders) if (o.obj) log(`  ${id} (${o.type}, ${o.form}) -> (${o.obj.x.toFixed(0)},${o.obj.y.toFixed(0)})`);
log('');
const rows = (await readFile(join(REPO, '.claude/zero-distance-goal-check.out.txt'), 'utf8')).split('\n');
const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
let n = 0, sharedObj = 0, atOwn = 0, atComp = 0, noOwn = 0;
const byOrderPair = new Map(); const endVsObj = new Map();
for (const l of rows) {
  const m = l.match(/^seed (\d+) t(\d+) (\S+)\+(\S+) @\((-?[\d.]+),(-?[\d.]+)\): orders (\S+) \/ (\S+) \| pathEnds (\S+(?: \S+)?) \/ (\S+(?: \S+)?) \|/);
  if (!m) continue;
  n += 1;
  const pos = { x: Number(m[5]), y: Number(m[6]) };
  const [oa, ob] = [m[7], m[8]].map((id) => orders.get(id) ?? null);
  const dOwn = oa?.obj ? d(pos, oa.obj) : null;
  const dComp = ob?.obj ? d(pos, ob.obj) : null;
  const shared = oa?.obj && ob?.obj && d(oa.obj, ob.obj) < 10;
  if (shared) sharedObj += 1;
  if (dOwn !== null && dOwn <= 50) atOwn += 1;
  if (dOwn === null) noOwn += 1;
  if (dComp !== null && dComp <= 50) atComp += 1;
  const key = `${m[7]} / ${m[8]}`;
  if (!byOrderPair.has(key)) byOrderPair.set(key, { n: 0, dOwn: [], dComp: [], shared: 0 });
  const b = byOrderPair.get(key); b.n += 1; if (dOwn !== null) b.dOwn.push(dOwn); if (dComp !== null) b.dComp.push(dComp); if (shared) b.shared += 1;
  const em = m[10].match(/^\((-?[\d.]+),(-?[\d.]+)\)$/);
  if (em && ob?.obj) {
    const dEnd = d({ x: Number(em[1]), y: Number(em[2]) }, ob.obj);
    const k2 = m[8]; if (!endVsObj.has(k2)) endVsObj.set(k2, new Map());
    const ends = endVsObj.get(k2); const ek = `(${em[1]},${em[2]})`;
    if (!ends.has(ek)) ends.set(ek, { n: 0, dEnd });
    ends.get(ek).n += 1;
  }
}
const med = (a) => { if (!a.length) return null; const s = [...a].sort((x, y) => x - y); return s[Math.floor((s.length - 1) / 2)]; };
log(`pair entries parsed: ${n}`);
log(`SHARED declared objective (<10 m apart): ${sharedObj}`);
log(`death position within 50 m of OWN order objective: ${atOwn} (no resolvable own objective: ${noOwn})`);
log(`death position within 50 m of COMPANION's order objective: ${atComp}`);
log('');
log('per order-pair (annihilated / companion): n, median dist to own obj, median dist to companion obj, shared-obj count');
for (const [k, b] of [...byOrderPair.entries()].sort((a, c) => c[1].n - a[1].n))
  log(`  ${k}: n=${b.n} dOwn-med=${med(b.dOwn)?.toFixed(0) ?? '-'}m dComp-med=${med(b.dComp)?.toFixed(0) ?? '-'}m shared=${b.shared}`);
log('');
log('companion recorded path endpoints vs that order\'s declared objective:');
for (const [oid, ends] of endVsObj) {
  const o = orders.get(oid);
  log(`  ${oid} (${o.form}) declared -> (${o.obj.x.toFixed(0)},${o.obj.y.toFixed(0)}):`);
  for (const [ek, v] of [...ends.entries()].sort((a, c) => c[1].n - a[1].n)) log(`    end ${ek} x${v.n} -> ${v.dEnd.toFixed(0)}m from declared objective`);
}
await writeFile(join(REPO, '.claude/order-objective-check.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
