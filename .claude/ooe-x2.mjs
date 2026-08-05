// X2 — the coverage census (2026-08-04), per the FROZEN registration at
// docs/research/ORDER-OBJECTIVE-EXTENT-REGISTRATION.md (c50f69a).
// Amendment 1 applied: the 120-bout population partitioned by RESOLUTION
// FORM including the computed/runtime bucket, sized explicitly; per-candidate
// reach stated per bucket. Same-seed re-simulation, sampling at end of t-1
// per the M-series convention (disclosed); read-only; no engine byte moves.
// Note on units: the registration's "98" are PAIR ENTRIES from bd7c712
// (one row can contribute two entries); this census runs over the 120 ROWS
// and states the relation explicitly.
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
const lmById = new Map(scenario.terrain.landmarks.map((l) => [l.id, toLocal(l.position.lat, l.position.lon)]));
const orderInfo = new Map();
for (const o of scenario.orders) {
  let form = 'NONE', obj = null;
  if (o.objective?.waypoints?.length) { form = o.objective.landmarkId ? 'WAYPOINTS+LANDMARK' : 'WAYPOINTS'; const w = o.objective.waypoints[o.objective.waypoints.length - 1]; obj = o.objective.landmarkId ? lmById.get(o.objective.landmarkId) : toLocal(w.lat, w.lon); }
  else if (o.objective?.landmarkId) { form = 'LANDMARK'; obj = lmById.get(o.objective.landmarkId) ?? null; }
  else if (o.objective?.targetUnitId) { form = 'ENTITY'; }
  orderInfo.set(o.id, { form, obj, recipients: o.recipientUnitIds?.length ?? 0 });
}
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const ann = results.annihilations;
const bySeed = new Map();
for (const a of ann) { if (!bySeed.has(a.seed)) bySeed.set(a.seed, []); bySeed.get(a.seed).push(a); }
const rows = [];
for (const [seed, list] of [...bySeed.entries()].sort((a, b) => a[0] - b[0])) {
  const sorted = list.sort((l, r) => l.tick - r.tick);
  const maxTick = sorted[sorted.length - 1].tick;
  const sim = createSim(scenario, { seed, terrain });
  let ri = 0;
  for (let t = 0; t <= maxTick; t += 1) {
    while (ri < sorted.length && sorted[ri].tick === t) {
      const a = sorted[ri]; ri += 1;
      const st = sim.state();
      const me = st.units.find((u) => u.id === a.unit);
      const info = me.activeOrderId ? orderInfo.get(me.activeOrderId) : undefined;
      const dOwn = info?.obj ? Math.hypot(me.position.x - info.obj.x, me.position.y - info.obj.y) : null;
      rows.push({ seed, t, unit: a.unit, order: me.activeOrderId ?? '-',
        form: info?.form ?? 'NONE', recipients: info?.recipients ?? 0,
        dOwn, atOwn: dOwn !== null && dOwn <= 50 });
    }
    sim.run(t);
  }
  console.error(`seed ${seed} done`);
}
log('=== X2 coverage census over the 120 rows (sampled end t-1; the registration\'s 98 are PAIR ENTRIES from bd7c712 — one row can contribute two) ===');
for (const r of rows) log(`row ${r.seed} t${r.t} ${r.unit}: order=${r.order} form=${r.form} recipients=${r.recipients} dOwn=${r.dOwn === null ? '-' : r.dOwn.toFixed(0)} ${r.atOwn ? 'AT-OWN-DECLARED' : 'ELSEWHERE (runtime-computed position)'}`);
log('');
const tally = new Map();
for (const r of rows) { const k = `${r.form}|${r.atOwn ? 'at-own' : 'elsewhere'}`; tally.set(k, (tally.get(k) ?? 0) + 1); }
log('--- partition: form × position class ---');
for (const [k, n] of [...tally.entries()].sort((a, b) => b[1] - a[1])) log(`  ${k}: ${n}`);
const atOwn = rows.filter((r) => r.atOwn);
const computedBucket = rows.filter((r) => !r.atOwn);
log('');
log(`AT-OWN-DECLARED rows: ${atOwn.length} of ${rows.length} | COMPUTED/RUNTIME bucket (dying elsewhere than any declared objective): ${computedBucket.length} of ${rows.length}`);
log('');
log('--- candidate reach (Amendment 1: neither declared-form candidate reaches the computed bucket) ---');
const g1 = atOwn.filter((r) => r.form === 'LANDMARK' || r.form === 'WAYPOINTS+LANDMARK');
const g2 = atOwn.filter((r) => r.recipients >= 2);
log(`G1 reach (landmark-form, at-own): ${g1.length} of ${rows.length}`);
log(`G2 reach (multi-recipient, at-own): ${g2.length} of ${rows.length} (forms: ${[...new Set(g2.map((r) => r.form))].join(' ')})`);
log(`G0 reach: all ${rows.length} by construction (it changes nothing)`);
log(`UNREACHABLE by any declared-form candidate: ${computedBucket.length} (the computed bucket)`);
log('');
log('--- the premise check the amendment ordered ---');
log(`If the computed bucket is a material share of the phenomenon, the item's premise (order`);
log(`objectives are dimensionless) is NARROWER THAN THE PHENOMENON. Share: ${computedBucket.length}/${rows.length} = ${(computedBucket.length / rows.length * 100).toFixed(1)}%. Verdict lines are the adjudication's.`);
await writeFile(join(REPO, '.claude/ooe-x2.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
