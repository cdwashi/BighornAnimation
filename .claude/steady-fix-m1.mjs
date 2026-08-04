// M1 — the flip census, both directions (2026-08-04), per the FROZEN
// registration at docs/research/STEADY-SHELTER-FIX-REGISTRATION.md
// (298f3a1). Candidate order C0, C1, C2. Read-only; no engine byte moves.
// C1(a) is TABULATED from the committed census file, not inherited from its
// headline (the adjudicator's standing caution). C2(a) uses same-seed
// re-simulation: per committed annihilation row, the dying unit's
// STEADY+SHAKEN friendly strength inside friendlyRadiusMeters versus its
// active pursuer's strength at the death tick — D72's comparison form,
// applied to the finishing question. Config values are read from the
// compiled artifact instrument-style, as every campaign probe has done.
// M1(b) PREDICTIONS are registered in this output, before any M4 world runs.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const configModule = await import(pathToFileURL(join(REPO, 'dist/engine/src/combat-config.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain/little-bighorn-1876'));
const results = JSON.parse(await readFile(join(REPO, 'reports/d112-campaign-results.json'), 'utf8'));
const srcById = new Map(scenario.units.map((u) => [u.id, u]));
const SIDE_OF = (id) => srcById.get(id)?.sideId;
const isCombat = (id) => srcById.get(id) && srcById.get(id).kind !== 'NONCOMBATANT_CAMP';
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };

// Locate the combat config object among the module's exports. The value must
// be NUMERIC: the module also exports COMBAT_CONFIG_PROVENANCE, whose
// friendlyRadiusMeters is the string tag 'proposed-flagged' — the first run
// matched it, was caught at the header check, and was killed before its
// coerced-NaN radius could zero every C2 mass. The instrument asserts types.
const cfgExport = Object.values(configModule).find((v) => v && typeof v === 'object' &&
  typeof v.friendlyRadiusMeters === 'number');
const FRIENDLY_RADIUS = cfgExport?.friendlyRadiusMeters;
const ISOLATION_RADIUS = typeof cfgExport?.isolationRadiusMeters === 'number' ? cfgExport.isolationRadiusMeters : undefined;
if (typeof FRIENDLY_RADIUS !== 'number') throw new Error('numeric friendlyRadiusMeters not found — refusing to run C2 on a fallback');
log(`config (compiled artifact, numeric-asserted): friendlyRadiusMeters=${FRIENDLY_RADIUS} isolationRadiusMeters=${ISOLATION_RADIUS ?? 'n/a'}`);
log('');

log('=== C0 — M1(a): zero flips by definition. Recorded, not credited: C0 passes M1 only when its');
log('=== registered burden holds at adjudication; a trivial measurement is not a survived phase. ===');
log('');

// ---- C1(a): tabulated from the committed census file ----
log('=== C1 — M1(a), tabulated from .claude/steady-shelter-probes.out.txt (not inherited) ===');
const census = (await readFile(join(REPO, '.claude/steady-shelter-probes.out.txt'), 'utf8')).split('\n');
let c1Rows = 0, c1Flips = 0, c1None = 0;
const c1FlipList = [];
for (const l of census) {
  const m = l.match(/^row (\d+) t(\d+) (\S+): .*within650=\[([^\]]*)\]/);
  if (!m) continue;
  c1Rows += 1;
  const occupied = m[4].trim().length > 0;
  if (occupied) { c1Flips += 1; c1FlipList.push(`${m[1]}/t${m[2]}/${m[3]}`); } else c1None += 1;
}
log(`rows tabulated: ${c1Rows} | C1 first-order flips (>=1 any-state companion within 650): ${c1Flips} | unchanged (none within 650): ${c1None}`);
log(`flip rows: ${c1FlipList.join(' ')}`);
log('');

// ---- C2(a): same-seed re-simulation, D72-form comparison at each death tick ----
log('=== C2 — M1(a), same-seed re-simulation (STEADY+SHAKEN mass in friendlyRadius vs active pursuer strength) ===');
const ann = results.annihilations;
const bySeed = new Map();
for (const a of ann) { if (!bySeed.has(a.seed)) bySeed.set(a.seed, []); bySeed.get(a.seed).push(a); }
let c2Flips = 0, c2NoFlip = 0, c2NoPursuer = 0;
const c2Detail = [];
for (const [seed, rows] of [...bySeed.entries()].sort((a, b) => a[0] - b[0])) {
  const sorted = rows.sort((l, r) => l.tick - r.tick);
  const maxTick = sorted[sorted.length - 1].tick;
  const sim = createSim(scenario, { seed, terrain });
  let ri = 0;
  // Sampling is at END OF t-1, the last observable pre-death state: the first
  // run of this leg sampled after sim.run(t) and returned 120/120
  // NO-PURSUER-AT-TICK, because the engine ends every pursuit of a destroyed
  // target within the death tick itself (morale.ts:424, 'target-ended') - an
  // instrument that could only return one answer, caught by its own output's
  // uniformity and corrected here with the cause cited.
  for (let t = 0; t <= maxTick; t += 1) {
    while (ri < sorted.length && sorted[ri].tick === t) {
      const a = sorted[ri]; ri += 1;
      const st = sim.state();
      const me = st.units.find((u) => u.id === a.unit);
      const mass = st.units.filter((u) => u.id !== a.unit && !u.endState && !u.withdrawnOffField &&
        (u.moraleState === 'STEADY' || u.moraleState === 'SHAKEN') &&
        SIDE_OF(u.id) === a.belligerentSide && isCombat(u.id) &&
        Math.hypot(u.position.x - me.position.x, u.position.y - me.position.y) <= FRIENDLY_RADIUS)
        .reduce((s, u) => s + u.strengthCurrent, 0);
      const pursuers = st.units.filter((u) => u.pursuit?.targetUnitId === a.unit && !u.endState && !u.withdrawnOffField)
        .map((u) => ({ id: u.id, kind: u.pursuit.kind, strength: u.strengthCurrent }))
        .sort((l, r) => r.strength - l.strength);
      const pursuer = pursuers.find((p) => p.kind === 'COMBAT') ?? pursuers[0] ?? null;
      let verdict;
      if (!pursuer) { verdict = 'NO-PURSUER-AT-TICK'; c2NoPursuer += 1; }
      else if (mass >= pursuer.strength) { verdict = 'FLIP'; c2Flips += 1; }
      else { verdict = 'no-flip'; c2NoFlip += 1; }
      c2Detail.push(`row ${seed} t${t} ${a.unit} (sampled end t${t - 1}): mass(S+SH,@${FRIENDLY_RADIUS})=${mass} pursuer=${pursuer ? `${pursuer.id}(${pursuer.kind})@${pursuer.strength}` : 'none'} -> ${verdict}`);
    }
    sim.run(t);
  }
  console.error(`seed ${seed} done`);
}
for (const d of c2Detail) log(d);
log(`C2 first-order: FLIP ${c2Flips} | no-flip ${c2NoFlip} | no-pursuer-at-tick (recorded, unresolved) ${c2NoPursuer}`);
log('');

log('=== M1(b) — PREDICTIONS, registered here before any M4 world exists ===');
log('C0(b): zero bouts change, by definition; the envelope under C0 is the committed envelope.');
log(`C1(b): first-order, ${c1Flips} of ${c1Rows} committed finishing bouts do not fire. Dynamic prediction, DIRECTIONAL:`);
log('  unfinished fragments persist ROUTED among non-STEADY companions (rout-reintegration requires a STEADY');
log('  protector and mostly cannot fire there); attrition to the destruction floor recovers SOME annihilations');
log('  late; net committed-annihilation count at M4 predicted BELOW HALF of 120, and the Custer-wing');
log('  in-place annihilation sequence (C3/F4 legs) predicted to degrade materially. A C1 M4 run landing near');
log('  120 annihilations FALSIFIES this registration.');
log(`C2(b): first-order, ${c2Flips} bouts do not fire. Dynamic prediction: small perturbation - flipped rows are`);
log('  the SHAKEN-mass minority (committed STEADY-within-650 is zero by construction), so the annihilation');
log('  count at M4 is predicted within a few rows of 120 minus first-order flips, and the envelope moves');
log('  little. A C2 M4 run collapsing the annihilation sequence FALSIFIES this registration.');
await writeFile(join(REPO, '.claude/steady-fix-m1.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
