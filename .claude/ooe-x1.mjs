// X1 — the flip census for G2, sole survivor (2026-08-04), per the FROZEN
// registration (c50f69a) and the X2 adjudication (G1 dead by coverage; G2
// to X1 alone). Offline: the committed X2 output, the scenario, and the
// config value read instrument-style. THE AMBIGUITY, registered rather than
// silently resolved: the frozen G2 text says "laterally ... the way
// marchSpacingMeters already staggers their starts" - and the existing
// stagger is LONGITUDINAL (orders.ts:124, followers offset backward along
// the approach path). Direction-of-offset and mechanism-being-reused
// diverge; X3 therefore runs BOTH arms (longitudinal column-halt and
// lateral line-abreast), measured not chosen, each against the predictions
// registered below.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const configModule = await import(pathToFileURL(join(REPO, 'dist/engine/src/combat-config.js')).href);
const cfg = Object.values(configModule).find((v) => v && typeof v === 'object' && typeof v.marchSpacingMeters === 'number');
if (!cfg) throw new Error('numeric marchSpacingMeters not found');
const SPACING = cfg.marchSpacingMeters;
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
const rww = scenario.orders.find((o) => o.id === 'right-wing-ridges');
const unitIndex = new Map(scenario.units.map((u, i) => [u.id, i]));
const ordinals = [...rww.recipientUnitIds].sort((a, b) => unitIndex.get(a) - unitIndex.get(b));
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
log(`=== X1 for G2 (sole survivor), offline ===`);
log(`marchSpacingMeters (instrument-read, numeric-asserted): ${SPACING}`);
log(`right-wing-ridges recipients in declared order (ordinal 0,1,2): ${ordinals.join(', ')}`);
log(`G2 destination offsets: ordinal x ${SPACING} m = ${ordinals.map((u, i) => `${u}:${i * SPACING}m`).join(' ')}`);
log('');
const x2 = (await readFile(join(REPO, '.claude/ooe-x2.out.txt'), 'utf8')).split('\n');
const target = x2.filter((l) => l.includes('form=WAYPOINTS') && l.includes('AT-OWN-DECLARED'));
const byUnit = new Map();
for (const l of target) { const m = l.match(/^row \d+ t\d+ (\S+):/); if (m) byUnit.set(m[1], (byUnit.get(m[1]) ?? 0) + 1); }
log(`G2's reachable population (X2's 52, by dying unit): ${[...byUnit.entries()].map(([k, n]) => `${k}:${n}`).join(' ')}`);
log('');
log('--- X1(a) first-order, offline: offset magnitude vs the world\'s radii ---');
log(`max destination displacement = 2 x ${SPACING} = ${2 * SPACING} m. The MEMBERSHIP/SHELTER radii -`);
log(`isolation 650, friendly 450 - EXCEED it: no membership or shelter verdict in the committed rows`);
log(`flips from geometry alone. The repath threshold (250) and pursuit standoff (150) are SMALLER than`);
log(`the maximum offset: pursuit repath timing and contact geometry CAN shift first-order, which`);
log('SHARPENS Section 4\'s channel from possible to expected. (A first draft of this paragraph claimed');
log('every radius exceeded the offset - false as written for 250 and 150, corrected on read before');
log('commit: the near-true-summary family, caught in the instrument\'s own prose.) Note the ordinal');
log(`irony: co-l, the dying unit in 50 of the 52 reachable rows, takes the MAXIMUM ${2 * SPACING} m displacement.`);
log('X1(a) verdict: zero membership flips predicted from offsets; contact-order and repath-timing');
log('effects expected at some magnitude, measurable only by X3.');
log('');
log('--- X1(b) PREDICTIONS, registered before any X3 world runs ---');
log(`LONGITUDINAL arm (column-halt; the existing mechanism's direction): the three companies halt in`);
log(`column at 0/${SPACING}/${2 * SPACING} m short of the chain end along the approach. Prediction: the Calhoun`);
log('collapse SURVIVES in sequence and timing (the cluster stays inside every radius); annihilation');
log('bout count within a few rows of 120; envelope within the ~0.5 pp floor on means; the co-l-first');
log('death order at t1684 may shift to a different company - reported, not predicted. FALSIFIED by');
log('bout-count movement beyond a few rows or envelope movement well beyond the floor.');
log(`LATERAL arm (line-abreast; the frozen text's word): same magnitudes, perpendicular. Prediction:`);
log('same as longitudinal - the offsets are small against every radius - with the difference, if any,');
log('appearing through contact ORDER (Section 4). A large divergence BETWEEN the two arms is itself');
log('the bout-order channel firing and is read against Section 4, not against G2.');
await writeFile(join(REPO, '.claude/ooe-x1.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
