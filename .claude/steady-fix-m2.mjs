// M2 — the D107 validation re-check (2026-08-04), per the FROZEN registration
// at docs/research/STEADY-SHELTER-FIX-REGISTRATION.md (298f3a1), for C1 and
// C2 only (C0 died at its registered M1 kill-branch, adjudicated 2026-08-04).
// Re-derives the 34th/37th/38th measurements' findings under each surviving
// candidate. Same-seed re-simulation, sampling at end of t-1 per the M1
// convention; read-only; no engine byte moves.
//
// 34th (analytic, printed for the record): both candidates modify ONLY the
// eligibility clause of D107's isolation scope; the D72 pursuit supply
// channel (pursuit -> contact -> bout) is untouched by construction.
// 37th (measured): would withdrawn units re-enter as shelterers? Both
// candidates RETAIN the withdrawnOffField exclusion by registration; this
// measures how load-bearing that clause is under each - withdrawn same-side
// units inside each candidate's radius at the death rows, with the verdict
// change that dropping the clause would cause.
// 38th (measured): the formed-body softness re-derived - the strength
// ratios of each candidate's shelterer population, against the 38th's
// committed profile (D107-world: 22/22 formed, ratio min 73% median 82%,
// absolute strength min 29 median 37).
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const configModule = await import(pathToFileURL(join(REPO, 'dist/engine/src/combat-config.js')).href);
const cfg = Object.values(configModule).find((v) => v && typeof v === 'object' && typeof v.friendlyRadiusMeters === 'number');
if (!cfg) throw new Error('numeric combat config not found');
const R_C1 = 650, R_C2 = cfg.friendlyRadiusMeters;
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const srcById = new Map(scenario.units.map((u) => [u.id, u]));
const SIDE_OF = (id) => srcById.get(id)?.sideId;
const isCombat = (id) => srcById.get(id) && srcById.get(id).kind !== 'NONCOMBATANT_CAMP';
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`radii: C1 eligibility @650 (D107's isolation radius) | C2 mass @${R_C2} (friendlyRadiusMeters)`);
log('');
log('=== 34th re-derivation (analytic): both candidates modify only the eligibility clause of');
log('=== D107 isolation; the D72 pursuit supply channel is untouched by construction. HOLDS for C1 and C2. ===');
log('');
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
      const near = (radius, pred) => st.units.filter((u) => u.id !== a.unit && !u.endState &&
        SIDE_OF(u.id) === a.belligerentSide && isCombat(u.id) && pred(u) &&
        Math.hypot(u.position.x - me.position.x, u.position.y - me.position.y) <= radius);
      const c1Shelterers = near(R_C1, (u) => !u.withdrawnOffField);
      const withdrawn650 = near(R_C1, (u) => u.withdrawnOffField);
      const withdrawn450SSH = near(R_C2, (u) => u.withdrawnOffField && (u.moraleState === 'STEADY' || u.moraleState === 'SHAKEN'));
      const pursuers = st.units.filter((u) => u.pursuit?.targetUnitId === a.unit && !u.endState && !u.withdrawnOffField)
        .map((u) => ({ id: u.id, kind: u.pursuit.kind, strength: u.strengthCurrent })).sort((l, r) => r.strength - l.strength);
      const pursuer = pursuers.find((p) => p.kind === 'COMBAT') ?? pursuers[0] ?? null;
      rows.push({ seed, t, unit: a.unit,
        c1: c1Shelterers.map((u) => ({ id: u.id, state: u.moraleState, cur: u.strengthCurrent, tot: u.strengthTotal, ratio: u.strengthTotal > 0 ? u.strengthCurrent / u.strengthTotal : 0 })),
        wd650: withdrawn650.map((u) => `${u.id}:${u.moraleState}`),
        wd450ssh: withdrawn450SSH.map((u) => ({ id: u.id, cur: u.strengthCurrent })),
        pursuerStrength: pursuer?.strength ?? null });
    }
    sim.run(t);
  }
  console.error(`seed ${seed} done`);
}
log('=== 37th re-derivation: the withdrawnOffField clause under each candidate ===');
const wdRows = rows.filter((r) => r.wd650.length > 0);
log(`rows with WITHDRAWN same-side units within 650: ${wdRows.length} of ${rows.length}`);
for (const r of wdRows.slice(0, 12)) log(`  ${r.seed} t${r.t} ${r.unit}: withdrawn=[${r.wd650.join(' ')}]`);
if (wdRows.length > 12) log(`  … ${wdRows.length - 12} more`);
const c1VerdictChange = wdRows.filter((r) => r.c1.length === 0).length;
log(`C1: rows where dropping the clause would CHANGE the verdict (no live shelterer, withdrawn present): ${c1VerdictChange} — the clause is load-bearing in exactly these; C1 as registered RETAINS it: contamination NOT re-admitted.`);
const c2WdEffect = rows.filter((r) => r.wd450ssh.length > 0 && r.pursuerStrength !== null &&
  r.c1.filter((u) => u.state === 'STEADY' || u.state === 'SHAKEN').reduce((s, u) => s + u.cur, 0) < r.pursuerStrength &&
  r.c1.filter((u) => u.state === 'STEADY' || u.state === 'SHAKEN').reduce((s, u) => s + u.cur, 0) + r.wd450ssh.reduce((s, u) => s + u.cur, 0) >= r.pursuerStrength).length;
log(`C2: rows where withdrawn STEADY/SHAKEN mass would cross the pursuer threshold if the clause were dropped: ${c2WdEffect} — C2 as registered RETAINS the clause: contamination NOT re-admitted.`);
log('');
log('=== 38th re-derivation: the formed-body softness under each candidate ===');
log('D107-world committed profile: 22/22 shelterer instances formed; ratio min 73% median 82% max 100%; absolute strength min 29 median 37.');
const c1Instances = rows.flatMap((r) => r.c1);
const ratios = c1Instances.map((u) => u.ratio).sort((a, b) => a - b);
const med = (a) => a.length ? a[Math.floor((a.length - 1) / 2)] : null;
log(`C1 shelterer instances across the 99 occupied rows: ${c1Instances.length}`);
if (ratios.length) {
  log(`  strength ratio: min ${(ratios[0] * 100).toFixed(0)}% p25 ${(ratios[Math.floor(ratios.length * 0.25)] * 100).toFixed(0)}% median ${(med(ratios) * 100).toFixed(0)}% max ${(ratios[ratios.length - 1] * 100).toFixed(0)}%`);
  log(`  below the D107-world minimum (73%): ${ratios.filter((x) => x < 0.73).length} of ${ratios.length} | below 50%: ${ratios.filter((x) => x < 0.5).length} | absolute strength min ${Math.min(...c1Instances.map((u) => u.cur))} median ${med(c1Instances.map((u) => u.cur).sort((a, b) => a - b))}`);
  const states = {};
  for (const u of c1Instances) states[u.state] = (states[u.state] ?? 0) + 1;
  log(`  by morale state: ${Object.entries(states).map(([k, n]) => `${k}:${n}`).join(' ')}`);
  log('  READING, per the registration: C1 does not silently unwind the softness — it EXPLICITLY abandons the');
  log('  formed proxy; the numbers above are the population that abandonment admits, reported for adjudication.');
}
const flip = rows.find((r) => r.seed === 18760602 && r.unit === 'co-l');
if (flip) {
  const ssh = flip.c1.filter((u) => u.state === 'STEADY' || u.state === 'SHAKEN');
  log(`C2's single M1 flip (18760602 co-l): mass constituents ${ssh.map((u) => `${u.id}:${u.state}@${u.cur}/${u.tot}(${(u.ratio * 100).toFixed(0)}%)`).join(' ')} — the strength comparison IS a formed-body test by construction; the 38th's concern is structurally addressed under C2.`);
}
await writeFile(join(REPO, '.claude/steady-fix-m2.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
