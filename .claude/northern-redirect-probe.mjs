// Thirty-second measurement: decompose the northern redirection. Across the
// 34 completed WO-D105 seeds, every coalition casualty-resolution event
// against a HILL-PHASE target (Benteen H/D/K or pack-train at any time;
// Reno A/G/M when the fall position is EAST of the channel) is classified
// by the ATTACKER'S LIVE COMMAND STATE at that tick:
//   order-axis    - active scheduled order, no pursuit (fighting along its
//                   ordered route; the target was in reach)
//   combat-pursuit- D72 COMBAT pursuit (retargeted toward what's alive)
//   initiative    - INITIATIVE pursuit (the D72 family's other half)
//   camp-defence  - active campDefense commitment
//   unattributed  - none of the above (proximity engagement only)
// The same classification is run for WING-directed events (C/E/F/I/L) as
// the contrast column. This decides which domain owns the redirection:
// mostly order-axis -> C/selection (the bundle's native ground); mostly
// pursuit/initiative -> ownership is load-bearing and possibly prior.
// Read-only on the committed halted tree (bce2814); completed seeds only.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const HILL_ALWAYS = new Set(['co-h', 'co-d', 'co-k', 'pack-train']);
const RENO = new Set(['co-a', 'co-g', 'co-m']);
const WING = new Set(['co-c', 'co-e', 'co-f', 'co-i', 'co-l']);
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';
const MODES = ['order-axis', 'combat-pursuit', 'initiative', 'camp-defence', 'unattributed'];

const agg = { hill: {}, wing: {} };
for (const t of ['hill', 'wing']) for (const md of MODES) agg[t][md] = 0;
const byBand = new Map(); // band -> {hill:{mode:killed}, wing:{mode:killed}}
const perSeed = [];
for (let seed = 18760600; seed <= 18760633; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  let evCursor = 0;
  const seedAgg = { hill: 0, wing: 0, hillByMode: {} };
  for (const md of MODES) seedAgg.hillByMode[md] = 0;
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type !== 'casualty-resolution') continue;
      const attacker = byId.get(e.unitId);
      if (!attacker || scenario.units[attacker.unitIndex]?.sideId !== SIDE) continue;
      let targetClass = null;
      if (HILL_ALWAYS.has(e.targetUnitId)) targetClass = 'hill';
      else if (RENO.has(e.targetUnitId) && e.position && sideOf(e.position) === 'EAST') targetClass = 'hill';
      else if (WING.has(e.targetUnitId)) targetClass = 'wing';
      if (!targetClass) continue;
      let mode = 'unattributed';
      if (attacker.pursuit?.kind === 'COMBAT') mode = 'combat-pursuit';
      else if (attacker.pursuit?.kind === 'INITIATIVE') mode = 'initiative';
      else if (attacker.campDefense) mode = 'camp-defence';
      else if (attacker.activeOrderId !== undefined) mode = 'order-axis';
      const k = e.killed ?? 0;
      agg[targetClass][mode] += k;
      const b = byBand.get(e.unitId) ?? { hill: {}, wing: {} };
      b[targetClass][mode] = (b[targetClass][mode] ?? 0) + k;
      byBand.set(e.unitId, b);
      seedAgg[targetClass] += k;
      if (targetClass === 'hill') seedAgg.hillByMode[mode] += k;
    }
  }
  perSeed.push({ seed, ...seedAgg });
  console.log(`${seed}: hill-killed ${seedAgg.hill} (${MODES.map((md) => `${md}:${seedAgg.hillByMode[md]}`).filter((s) => !s.endsWith(':0')).join(' ')}) | wing-killed ${seedAgg.wing}`);
}
console.log('\n===== AGGREGATE, 34 complete seeds =====');
for (const t of ['hill', 'wing']) {
  const total = MODES.reduce((s, md) => s + agg[t][md], 0);
  console.log(`${t.toUpperCase()}-directed killed ${total}: ${MODES.map((md) => `${md} ${agg[t][md]} (${total ? (100 * agg[t][md] / total).toFixed(1) : 0}%)`).join(' | ')}`);
}
console.log('\nper-band hill-directed killed by mode:');
for (const [band, b] of [...byBand.entries()].sort((l, r) => (MODES.reduce((s, md) => s + (r[1].hill[md] ?? 0), 0)) - (MODES.reduce((s, md) => s + (l[1].hill[md] ?? 0), 0)))) {
  const hillTotal = MODES.reduce((s, md) => s + (b.hill[md] ?? 0), 0);
  if (!hillTotal) continue;
  console.log(`  ${band}: ${hillTotal} (${MODES.map((md) => b.hill[md] ? `${md}:${b.hill[md]}` : null).filter(Boolean).join(' ')})`);
}
console.error('done');
