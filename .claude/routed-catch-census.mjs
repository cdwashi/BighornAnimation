// Thirty-sixth measurement: the annihilation-trigger census, before the
// wing-finisher ruling's predictions exist. Proposed shape (CC, for
// Fable's review): a break-bout whose defender was ALREADY ROUTED at bout
// start resolves ANNIHILATION - the caught fragment is finished, remaining
// strength converting per D81 terminal accounting. First break = rout +
// dispatch of wounded (D105, unchanged); catching a broken fragment =
// finishing it. Break-gated by construction, event-shaped, no new number.
// The valley-holds question this census answers: in the accepted D106
// world, WHO gets caught-while-routed? Every melee-bout is classified by
// the defender's morale state at the bout tick, by target, with defender
// strength (the annihilation size the ruling would produce). If Reno
// companies show caught-while-routed bouts in many seeds, the shape
// re-breaks the valley and needs rework BEFORE drafting. 50 seeds,
// committed D106 tree, read-only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WING = new Set(['co-c', 'co-e', 'co-f', 'co-i', 'co-l']);
const m = (t) => t / 2;

const catches = []; // {seed, target, min, strength, wounded}
let boutsTotal = 0, breakTotal = 0;
const bySeedReno = new Map();
for (let seed = 18760600; seed <= 18760649; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  let evCursor = 0;
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type !== 'melee-bout') continue;
      boutsTotal += 1;
      if (e.outcome !== 'break') continue;
      breakTotal += 1;
      const d = byId.get(e.targetUnitId);
      // Defender state at bout tick: bout sets ROUTED on break, so a
      // defender ROUTED *before* the bout is detected by the previous
      // tick's state. Track via a shadow: if this unit was ROUTED at the
      // previous sampled tick, this bout caught an already-broken fragment.
      if (!d) continue;
      const wasRouted = prevRouted.has(e.targetUnitId);
      if (wasRouted) {
        catches.push({ seed, target: e.targetUnitId, min: m(e.tick), strength: d.strengthCurrent, wounded: d.wounded });
        if (RENO.has(e.targetUnitId)) bySeedReno.set(seed, (bySeedReno.get(seed) ?? 0) + 1);
      }
    }
    var prevRouted = new Set(st.units.filter((u) => u.moraleState === 'ROUTED' && !u.endState).map((u) => u.id));
  }
}
console.log(`===== annihilation-trigger census, 50 seeds =====`);
console.log(`bouts ${boutsTotal} | break ${breakTotal} | CAUGHT-WHILE-ROUTED ${catches.length}`);
const wing = catches.filter((c) => WING.has(c.target));
const reno = catches.filter((c) => RENO.has(c.target));
const other = catches.filter((c) => !WING.has(c.target) && !RENO.has(c.target));
console.log(`by target class: WING ${wing.length} | RENO ${reno.length} | other ${other.length}`);
const q = (l, p) => { const s = [...l].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
for (const [name, set] of [['WING', wing], ['RENO', reno], ['other', other]]) {
  if (!set.length) { console.log(`${name}: none`); continue; }
  const byUnit = new Map();
  for (const c of set) byUnit.set(c.target, (byUnit.get(c.target) ?? 0) + 1);
  console.log(`${name}: seeds touched ${new Set(set.map((c) => c.seed)).size}/50 | strength-at-catch med ${q(set.map((c) => c.strength), 0.5)} p75 ${q(set.map((c) => c.strength), 0.75)} max ${Math.max(...set.map((c) => c.strength))} | by unit: ${[...byUnit.entries()].sort((l, r) => r[1] - l[1]).map(([u, n]) => `${u}:${n}`).join(' ')}`);
}
console.log(`Reno caught-while-routed per seed: ${[...bySeedReno.entries()].sort().map(([s, n]) => `${s}:${n}`).join(' ') || 'NONE in any seed'}`);
console.error('done');
