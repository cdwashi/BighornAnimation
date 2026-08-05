// M-COVER — the exposure census (2026-08-05), per the FROZEN registration at
// docs/research/268-VS-253-REGISTRATION.md (dc39dab), §4, run after Q-POP and
// the §3 two-region read per the frozen reading order. READ-ONLY: no engine
// byte moves, no patch, no reseed; current stream [68325eff] (tree clean at
// the committed world). Full-day runs t0..2160 over the 50 committed seeds
// (read from the committed results file, not assumed). Sampling: final state
// at end of day; event sums are at-tick data written when they occurred (the
// R1-style all-ticks exposure does not arise for event tallies).
// Deliverables per §4 and the adjudication disposition:
//   (a) per-seed US killed/wounded actuals;
//   (b) split-application counts and per-application magnitudes
//       (casualty-resolution events on us-7th targets = the applyResult/
//       splitCasualties path, one application per event — R1's one-call-site
//       fact);
//   (c) the fire-versus-NON-FIRE decomposition of final killed/wounded —
//       computed as final-state totals minus per-event-type sums, with every
//       event type carrying killed/wounded fields named, so no assumption
//       about what "terminal accounting" emits is needed;
//   (d) the Reno-Benteen versus Custer-wing versus non-company decomposition
//       (R3 makes it the load-bearing split);
//   (e) VALIDITY LEG: per-seed killed cross-checked against the committed
//       rows' renoKilled, row for row.
// DATED CORRECTION (2026-08-05, same day, before any figure was used): run 1
// compared a SEVEN-company Reno-Benteen sum against the committed renoKilled
// column, which every committed instrument defines as RENO = co-a/co-g/co-m
// (the three valley companies) — a label assumption made without checking the
// committed instrument's definition, caught by this leg's own 38/50 refusal
// to validate. Run 1's output is preserved at
// us268-m-cover.run1-labelerror.out.txt. This version cross-checks the
// committed A/G/M definition and keeps the seven-company decomposition as a
// separate reported figure. Per-unit finals added to the JSON for the record.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));

const CUSTER = new Set(['co-c', 'co-e', 'co-f', 'co-i', 'co-l']);
const RENO_AGM = ['co-a', 'co-g', 'co-m']; // the committed renoKilled definition
const RENO_BENTEEN = new Set(['co-a', 'co-b', 'co-d', 'co-g', 'co-h', 'co-k', 'co-m']);
const NON_COMPANY = new Set(['pack-train', 'arikara-scouts', 'crow-scouts', 'civilians-interpreters']);
const US = new Set([...CUSTER, ...RENO_BENTEEN, ...NON_COMPANY]);
const wing = (id) => CUSTER.has(id) ? 'custer' : RENO_BENTEEN.has(id) ? 'reno-benteen' : NON_COMPANY.has(id) ? 'non-company' : 'other';
const END_TICK = 2160;

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const seeds = [...new Set(results.rows.map((r) => r.seed))].sort((a, b) => a - b);
log(`=== M-COVER: ${seeds.length} committed seeds, stream [68325eff], full day t0..${END_TICK} ===`);
log('');

const perSeed = [];
const magnitudeHist = new Map(); // casualties-per-application -> count (us-7th targets)
let renoMatches = 0;
const renoMismatches = [];
for (const seed of seeds) {
  const committedRow = results.rows.find((r) => r.seed === seed);
  const sim = createSim(scenario, { seed, terrain });
  for (let t = 0; t <= END_TICK; t += 1) sim.run(t);
  const st = sim.state();
  const events = sim.events();

  // (a) + (d): final-state totals by wing
  const fin = { total: { k: 0, w: 0 }, custer: { k: 0, w: 0 }, 'reno-benteen': { k: 0, w: 0 }, 'non-company': { k: 0, w: 0 } };
  for (const u of st.units) {
    if (!US.has(u.id)) continue;
    const g = wing(u.id);
    fin[g].k += u.killed; fin[g].w += u.wounded;
    fin.total.k += u.killed; fin.total.w += u.wounded;
  }

  // (b) + (c): event sums by type, us-7th targets; application census for
  // casualty-resolution. Attribution: targetUnitId if present, else unitId —
  // per-type sums keep any attribution ambiguity visible.
  const byType = new Map(); // type -> {k, w, n}
  let apps = 0;
  for (const e of events) {
    const hasK = typeof e.killed === 'number' || typeof e.wounded === 'number';
    if (!hasK) continue;
    const who = e.targetUnitId ?? e.unitId;
    if (!US.has(who)) continue;
    const rec = byType.get(e.type) ?? { k: 0, w: 0, n: 0 };
    rec.k += e.killed ?? 0; rec.w += e.wounded ?? 0; rec.n += 1;
    byType.set(e.type, rec);
    if (e.type === 'casualty-resolution') {
      apps += 1;
      const c = e.casualties ?? ((e.killed ?? 0) + (e.wounded ?? 0));
      magnitudeHist.set(c, (magnitudeHist.get(c) ?? 0) + 1);
    }
  }
  const fire = byType.get('casualty-resolution') ?? { k: 0, w: 0, n: 0 };
  const nonFireK = fin.total.k - fire.k;
  const nonFireW = fin.total.w - fire.w;

  // (e) validity leg — the committed A/G/M definition
  const agmKilled = RENO_AGM.reduce((s, id) => s + (st.units.find((u) => u.id === id)?.killed ?? 0), 0);
  const renoOk = committedRow ? agmKilled === committedRow.renoKilled : null;
  if (renoOk === true) renoMatches += 1;
  else renoMismatches.push(`seed ${seed}: probe A/G/M killed ${agmKilled} vs committed renoKilled ${committedRow?.renoKilled}`);
  const perUnit = Object.fromEntries(st.units.filter((u) => US.has(u.id)).map((u) => [u.id, { killed: u.killed, wounded: u.wounded, endState: u.endState ?? null }]));

  perSeed.push({
    seed, finalKilled: fin.total.k, finalWounded: fin.total.w,
    fireKilled: fire.k, fireWounded: fire.w, fireApps: apps,
    nonFireKilled: nonFireK, nonFireWounded: nonFireW,
    custer: fin.custer, renoBenteen: fin['reno-benteen'], nonCompany: fin['non-company'],
    agmKilled,
    eventTypes: Object.fromEntries([...byType.entries()].map(([t2, r]) => [t2, { killed: r.k, wounded: r.w, events: r.n }])),
    renoCheck: renoOk,
    perUnit,
  });
  console.error(`seed ${seed} done: US K ${fin.total.k} W ${fin.total.w} | fire K ${fire.k} W ${fire.w} apps ${apps} | non-fire K ${nonFireK}`);
}

log('--- (a)+(d) per-seed US actuals and wing decomposition ---');
log('seed | final K/W | fire K/W (apps) | non-fire K/W | custer K/W | reno-benteen K/W | non-company K/W | renoKilled check');
for (const r of perSeed) {
  log(`${r.seed} | ${r.finalKilled}/${r.finalWounded} | ${r.fireKilled}/${r.fireWounded} (${r.fireApps}) | ${r.nonFireKilled}/${r.nonFireWounded} | ${r.custer.k}/${r.custer.w} | ${r.renoBenteen.k}/${r.renoBenteen.w} | ${r.nonCompany.k}/${r.nonCompany.w} | ${r.renoCheck === true ? 'MATCH' : r.renoCheck === false ? 'MISMATCH' : 'NO-ROW'}`);
}
log('');
const med = (xs) => { const s = [...xs].sort((a, b) => a - b); return s[Math.floor(0.5 * s.length)]; }; // registered floor-quantile convention
const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
const stat = (name, xs) => log(`  ${name}: median ${med(xs)} | mean ${mean(xs).toFixed(2)} | min ${Math.min(...xs)} | max ${Math.max(...xs)}`);
log('--- distribution over the 50 seeds (median = floor-quantile, the registered convention) ---');
stat('US final killed', perSeed.map((r) => r.finalKilled));
stat('US final wounded', perSeed.map((r) => r.finalWounded));
stat('US fire-path killed', perSeed.map((r) => r.fireKilled));
stat('US fire-path wounded', perSeed.map((r) => r.fireWounded));
stat('US non-fire killed (final minus fire events)', perSeed.map((r) => r.nonFireKilled));
stat('split applications per seed', perSeed.map((r) => r.fireApps));
stat('custer-wing killed', perSeed.map((r) => r.custer.k));
stat('custer-wing wounded', perSeed.map((r) => r.custer.w));
stat('reno-benteen killed', perSeed.map((r) => r.renoBenteen.k));
stat('reno-benteen wounded', perSeed.map((r) => r.renoBenteen.w));
stat('non-company killed', perSeed.map((r) => r.nonCompany.k));
stat('non-company wounded', perSeed.map((r) => r.nonCompany.w));
log('');
log('--- (c) fire-versus-non-fire share (the number the ruling turns on) ---');
const totF = perSeed.reduce((a, r) => a + r.fireKilled, 0), totK = perSeed.reduce((a, r) => a + r.finalKilled, 0);
const totFW = perSeed.reduce((a, r) => a + r.fireWounded, 0), totW = perSeed.reduce((a, r) => a + r.finalWounded, 0);
log(`  pooled killed: fire ${totF} of ${totK} final (${(100 * totF / Math.max(1, totK)).toFixed(1)}%) | non-fire ${totK - totF} (${(100 * (totK - totF) / Math.max(1, totK)).toFixed(1)}%)`);
log(`  pooled wounded: fire ${totFW} of ${totW} final (${(100 * totFW / Math.max(1, totW)).toFixed(1)}%)`);
for (const g of ['custer', 'renoBenteen', 'nonCompany']) {
  const gk = perSeed.reduce((a, r) => a + r[g].k, 0);
  log(`  ${g} pooled killed: ${gk} of ${totK} final (${(100 * gk / Math.max(1, totK)).toFixed(1)}%)`);
}
log('');
log('--- event types carrying killed/wounded on us-7th units (pooled; attribution targetUnitId ?? unitId) ---');
const pooledTypes = new Map();
for (const r of perSeed) for (const [t2, v] of Object.entries(r.eventTypes)) {
  const rec = pooledTypes.get(t2) ?? { k: 0, w: 0, n: 0 };
  rec.k += v.killed; rec.w += v.wounded; rec.n += v.events; pooledTypes.set(t2, rec);
}
for (const [t2, v] of [...pooledTypes.entries()].sort((a, b) => b[1].k - a[1].k)) log(`  ${t2}: killed ${v.k} wounded ${v.w} over ${v.n} events`);
log('');
log('--- (b) per-application magnitude histogram (casualties per casualty-resolution event, us-7th targets, pooled) ---');
for (const [c, n] of [...magnitudeHist.entries()].sort((a, b) => a[0] - b[0])) log(`  casualties=${c}: ${n} applications`);
log('');
log(`--- (e) validity leg: probe A/G/M killed vs committed renoKilled (the committed definition) — ${renoMatches}/${seeds.length} MATCH ---`);
for (const m of renoMismatches) log(`  ${m}`);
log('');
log('Verdict lines are the adjudication\'s; this census sizes and names, nothing more.');
await writeFile(join(REPO, '.claude/us268-m-cover.out.txt'), lines.join('\n') + '\n', 'utf8');
await writeFile(join(REPO, '.claude/us268-m-cover.json'), JSON.stringify({ stream: '68325eff', endTick: END_TICK, seeds, perSeed }, null, 2), 'utf8');
console.error('done');
