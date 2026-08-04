// Membership re-derivation (2026-08-03, ordered at the twenty-fifth catch's
// adjudication; read-only, no proposal). For each of the 120 committed
// annihilation rows, classify every within-650 companion by population:
//   P1 at-own-objective  - within 50 m of its OWN order's declared objective
//   P2 at-other-objective - >50 m from its own but within 50 m of some OTHER
//                           order's declared objective (re-path-produced)
//   P3 undeclared        - within 50 m of no declared objective at all
//                           (re-path-produced)
//   UNRESOLVED           - active order has no resolvable objective
// then re-derive the membership count over rows that retain at least one
// P1 companion. Same-seed re-simulation of the committed world (reseed-free);
// classification thresholds match the order-objective check (50 m / 10 m).
// The annihilated unit's own population is recorded per row for context.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const toLocal = (lat, lon) => { const [x, y] = terrain.toLocal(lat, lon); return { x, y }; };
const lmById = new Map(scenario.terrain.landmarks.map((l) => [l.id, toLocal(l.position.lat, l.position.lon)]));
const orderObj = new Map();
for (const o of scenario.orders) {
  let obj = null;
  if (o.objective?.landmarkId) obj = lmById.get(o.objective.landmarkId) ?? null;
  else if (o.objective?.waypoints?.length) { const w = o.objective.waypoints[o.objective.waypoints.length - 1]; obj = toLocal(w.lat, w.lon); }
  orderObj.set(o.id, obj);
}
const census = (await readFile(join(REPO, '.claude/steady-shelter-probes.out.txt'), 'utf8')).split('\n');
const rows = [];
for (const l of census) {
  const m = l.match(/^row (\d+) t(\d+) (\S+): .*within650=\[([^\]]*)\]/);
  if (!m) continue;
  const comps = m[4].split(' ').filter(Boolean).map((e) => { const [id, rest] = e.split(':'); const [state, dist] = rest.split('@'); return { id, state, dist: Number(dist) }; });
  rows.push({ seed: Number(m[1]), tick: Number(m[2]), unit: m[3], comps });
}
const d = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
const classify = (u) => {
  const own = orderObj.get(u.activeOrderId);
  if (u.activeOrderId == null || (orderObj.has(u.activeOrderId) === false)) return { cls: 'UNRESOLVED', dOwn: null };
  if (own == null) return { cls: 'UNRESOLVED', dOwn: null };
  const dOwn = d(u.position, own);
  if (dOwn <= 50) return { cls: 'P1', dOwn };
  for (const [oid, obj] of orderObj) if (obj && oid !== u.activeOrderId && d(u.position, obj) <= 50) return { cls: 'P2', dOwn };
  return { cls: 'P3', dOwn };
};
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`census rows parsed: ${rows.length} (with >=1 within-650 companion: ${rows.filter((r) => r.comps.length).length})`);
const bySeed = new Map();
for (const r of rows) { if (!bySeed.has(r.seed)) bySeed.set(r.seed, []); bySeed.get(r.seed).push(r); }
const compTally = { P1: 0, P2: 0, P3: 0, UNRESOLVED: 0 };
let occupied = 0, survives = 0, dies = 0;
for (const [seed, list] of [...bySeed.entries()].sort((a, b) => a[0] - b[0])) {
  const withComps = list.filter((r) => r.comps.length);
  if (!withComps.length) continue;
  const maxTick = Math.max(...withComps.map((r) => r.tick));
  const sim = createSim(scenario, { seed, terrain });
  let li = 0; const sorted = withComps.sort((a, b) => a.tick - b.tick);
  for (let t = 0; t <= maxTick; t += 1) {
    sim.run(t);
    while (li < sorted.length && sorted[li].tick === t) {
      const r = sorted[li]; li += 1;
      const st = sim.state();
      const self = st.units.find((u) => u.id === r.unit);
      const selfCls = self ? classify(self) : { cls: '?', dOwn: null };
      const parts = [];
      let hasP1 = false;
      for (const c of r.comps) {
        const cu = st.units.find((u) => u.id === c.id);
        if (!cu) { parts.push(`${c.id}:?`); continue; }
        const k = classify(cu);
        compTally[k.cls] += 1;
        if (k.cls === 'P1') hasP1 = true;
        parts.push(`${c.id}:${k.cls}@${c.dist}(own-obj ${k.dOwn === null ? '-' : k.dOwn.toFixed(0)}m, order ${cu.activeOrderId ?? '-'})`);
      }
      occupied += 1;
      if (hasP1) survives += 1; else dies += 1;
      log(`row ${seed} t${t} ${r.unit}[self ${selfCls.cls}${selfCls.dOwn === null ? '' : ` ${selfCls.dOwn.toFixed(0)}m`}]: ${parts.join(' ')} | rowSurvives=${hasP1 ? 'YES' : 'no'}`);
    }
  }
  console.error(`seed ${seed} done`);
}
log('');
log(`companion observations: ${compTally.P1 + compTally.P2 + compTally.P3 + compTally.UNRESOLVED} | P1 at-own-objective ${compTally.P1} | P2 at-other-objective ${compTally.P2} | P3 undeclared ${compTally.P3} | UNRESOLVED ${compTally.UNRESOLVED}`);
log(`occupied rows re-derived: ${occupied} | retain >=1 P1 companion (membership survives): ${survives} | all companions re-path-produced or unresolved: ${dies}`);
log(`restricted membership: ${survives}/120 against the original 99/120 (the 21 none-within-650 rows are unchanged)`);
await writeFile(join(REPO, '.claude/membership-rederivation.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
