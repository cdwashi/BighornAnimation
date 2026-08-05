// The arikara giving-end census (2026-08-05), per the FROZEN registration at
// docs/research/ARIKARA-VALUE-REGISTRATION.md (d32bd91), §3 — Amendment 1's
// coverage-before-flips leg, run FIRST in the frozen reading order.
// READ-ONLY: no patch, no reseed; the 50 committed seeds; full day t0..2160;
// stream [68325eff]. The committed R1 event log does not carry 50-seed
// casualty-resolution events, so this is the declared read-only probe under
// the M-COVER pattern.
// REGISTERED BEFORE THIS RAN (the adjudicator's, verbatim in substance, so it
// can miss): "I expect the arikara giving-end contribution to be under 1% of
// US-side inflicted casualties." Materially higher = a finding about the
// model's scout handling, independent of this item, NOT absorbed into the
// outcome ruling.
// Deliverables per §3: (a) attacker-side casualty-resolution census for
// arikara-scouts vs the US-side inflicted total; (b) the full event-type
// census for the unit (what the unit DOES in the logs); (c) the withdrawal
// timing — once off-field the unit is absent from every mass predicate, so
// the pre-withdrawal window bounds where its strength can matter.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));

const US = new Set(scenario.units.filter((u) => u.sideId === 'us-7th-cavalry').map((u) => u.id));
const ARI = 'arikara-scouts';
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const seeds = [...new Set(results.rows.map((r) => r.seed))].sort((a, b) => a - b);
log(`=== Arikara giving-end census: ${seeds.length} committed seeds, stream [68325eff], t0..2160 ===`);
log('Registered before the run (the adjudicator\'s): arikara share of US-side inflicted < 1%.');
log('');
const perSeed = [];
const eventTypeTally = new Map();
for (const seed of seeds) {
  const sim = createSim(scenario, { seed, terrain });
  for (let t = 0; t <= 2160; t += 1) sim.run(t);
  const events = sim.events();
  let ariInflictedCas = 0, ariInflictedK = 0, ariInflictedW = 0, ariApps = 0;
  let usInflictedCas = 0, usApps = 0;
  let firstEventTick = null, lastEventTick = null, withdrawalTick = null;
  for (const e of events) {
    if (e.type === 'casualty-resolution' && US.has(e.unitId)) {
      usInflictedCas += e.casualties ?? 0; usApps += 1;
      if (e.unitId === ARI) { ariInflictedCas += e.casualties ?? 0; ariInflictedK += e.killed ?? 0; ariInflictedW += e.wounded ?? 0; ariApps += 1; }
    }
    if (e.unitId === ARI || e.targetUnitId === ARI) {
      eventTypeTally.set(e.type, (eventTypeTally.get(e.type) ?? 0) + 1);
      if (firstEventTick === null) firstEventTick = e.tick;
      lastEventTick = e.tick;
      if (withdrawalTick === null && /withdraw/i.test(e.type)) withdrawalTick = e.tick;
    }
  }
  const st = sim.state();
  const ari = st.units.find((u) => u.id === ARI);
  perSeed.push({ seed, ariInflictedCas, ariInflictedK, ariInflictedW, ariApps, usInflictedCas, usApps,
    sharePct: usInflictedCas > 0 ? (100 * ariInflictedCas / usInflictedCas) : 0,
    firstEventTick, lastEventTick, withdrawalTick, withdrawnOffField: ari.withdrawnOffField ?? null, endState: ari.endState ?? null });
  console.error(`seed ${seed}: arikara inflicted ${ariInflictedCas} of US ${usInflictedCas} (${(usInflictedCas > 0 ? 100 * ariInflictedCas / usInflictedCas : 0).toFixed(2)}%)`);
}
log('--- per-seed: arikara inflicted / US-side inflicted (share) | apps | last arikara event tick | withdrawal ---');
for (const r of perSeed) log(`${r.seed} | ${r.ariInflictedCas}/${r.usInflictedCas} (${r.sharePct.toFixed(2)}%) | ${r.ariApps} | t${r.lastEventTick ?? '-'} | ${r.withdrawalTick !== null ? 't' + r.withdrawalTick : (r.withdrawnOffField ? 'off-field (tick not evented)' : '-')}`);
log('');
const med = (a) => { const s = [...a].sort((x, y) => x - y); return s[Math.floor(0.5 * s.length)]; };
const mean = (a) => a.reduce((x, y) => x + y, 0) / a.length;
const shares = perSeed.map((r) => r.sharePct);
const pooledAri = perSeed.reduce((a, r) => a + r.ariInflictedCas, 0);
const pooledUS = perSeed.reduce((a, r) => a + r.usInflictedCas, 0);
log('--- the gate numbers ---');
log(`pooled: arikara inflicted ${pooledAri} of US-side ${pooledUS} = ${(100 * pooledAri / pooledUS).toFixed(3)}%`);
log(`per-seed share: median ${med(shares).toFixed(3)}% | mean ${mean(shares).toFixed(3)}% | min ${Math.min(...shares).toFixed(3)}% | max ${Math.max(...shares).toFixed(3)}%`);
log(`registered <1% prediction: pooled ${100 * pooledAri / pooledUS < 1 ? 'HIT' : 'MISS'}; seeds over 1%: ${shares.filter((s) => s >= 1).length}/50`);
log('');
log('--- event types touching arikara-scouts (pooled) ---');
for (const [t, n] of [...eventTypeTally.entries()].sort((a, b) => b[1] - a[1])) log(`  ${t}: ${n}`);
log('');
log('Verdict lines are the adjudication\'s; this census sizes the reach, nothing more.');
await writeFile(join(REPO, '.claude/arikara-give-census.out.txt'), lines.join('\n') + '\n', 'utf8');
await writeFile(join(REPO, '.claude/arikara-give-census.json'), JSON.stringify({ stream: '68325eff', seeds, perSeed }, null, 2), 'utf8');
console.error('done');
