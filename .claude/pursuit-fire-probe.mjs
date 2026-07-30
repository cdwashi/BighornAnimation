// Twenty-fifth measurement, stage 1: why doesn't pursuit convert? Seed
// 18760644, co-m's pursued flight (minutes 764-800). Per tick, mirror the
// fire-resolution eligibility rules (combat.ts:459 state gate, :402 routed-
// firer gate) for every engagement involving co-m, and count actual
// casualty-resolution events. If eligible fire directions exist for tens of
// minutes at lethal range while kills stay ~0, the block is inside
// resolveFire and stage 2 instruments it. Read-only, committed tree.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const ID = 'co-m';
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760644, terrain });
let eligibleTicks = 0, totalTicks = 0, lastEvCount = 0;
const stateCounts = new Map();
const samples = [];
for (let tick = 0; tick <= 1600; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const u = st.units.find((x) => x.id === ID);
  if (!u || u.endState) break;
  if (m(tick) < 764) continue;
  totalTicks += 1;
  const engs = st.engagements.filter((e) => e.active && e.unitIds.includes(ID));
  let anyEligible = false;
  const detail = [];
  for (const e of engs) {
    stateCounts.set(e.state, (stateCounts.get(e.state) ?? 0) + 1);
    const otherId = e.unitIds.find((x) => x !== ID);
    const other = st.units.find((x) => x.id === otherId);
    const stateGate = e.state !== 'APPROACH' && e.state !== 'ROUT';
    const firerGate = other && other.endState !== 'DESTROYED' && other.moraleState !== 'ROUTED';
    const eligible = stateGate && firerGate;
    if (eligible) anyEligible = true;
    detail.push(`${otherId}:${e.state} r${Math.round(e.rangeMeters)} ${eligible ? 'ELIGIBLE' : (stateGate ? 'firer-blocked(' + (other?.moraleState ?? '?') + ')' : 'state-blocked')}${other ? ' ammo' + (other.ammunition ?? '?') : ''}`);
  }
  if (anyEligible) eligibleTicks += 1;
  const events = sim.events();
  const evs = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === ID);
  const newEvs = evs.length - lastEvCount;
  lastEvCount = evs.length;
  if (m(tick) % 5 === 0 || newEvs > 0) {
    samples.push(`${m(tick)}: ${u.moraleState} ${u.mounted ? 'MTD' : 'dis'} | ${detail.join(' | ')}${newEvs ? ` | FIRE EVENTS +${newEvs}` : ''}`);
  }
}
for (const s of samples) console.log(s);
console.log(`\nticks in window: ${totalTicks}; ticks with >=1 ELIGIBLE fire direction at co-m: ${eligibleTicks}`);
console.log(`engagement-state tick counts: ${[...stateCounts.entries()].map(([k, v]) => `${k}:${v}`).join(' ')}`);
const events = sim.events();
const all = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === ID && m(e.tick) >= 764);
console.log(`casualty-resolution events targeting co-m in window: ${all.length}, total casualties ${all.reduce((s, e) => s + (e.casualties ?? 0), 0)}`);
console.error('done');
