// Eighteenth measurement, diagnosis half: who kills hunkpapa-pool under
// one-authority (mode A), when, and under what commitment/posture. The band
// went k14 (BASE) -> k160 DESTROYED (A). Same dist gate; stop seed.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
globalThis.__d17mode = 'A';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const ID = 'hunkpapa-pool';
const m = (t) => t / 2;

const sim = createSim(scenario, { seed: 18760625, terrain });
const timeline = [];
let prev = {};
for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const u = st.units.find((x) => x.id === ID);
  if (!u) continue;
  const cur = {
    order: u.activeOrderId ?? null,
    cd: u.campDefense ? `${u.campDefense.threatUnitId}/${u.campDefense.featureId ?? 'nofeat'}` : null,
    posture: u.posture, speed: u.speedClass ?? null, morale: u.moraleState,
    end: u.endState ?? null,
  };
  if (JSON.stringify(cur) !== JSON.stringify(prev)) {
    timeline.push({ min: m(tick), ...cur, k: u.killed, c: u.casualties,
      pos: `${Math.round(u.position.x)},${Math.round(u.position.y)}` });
    prev = cur;
  }
}
const events = sim.events();
const hits = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === ID);
const byAttacker = new Map();
const byBucket = new Map();
for (const e of hits) {
  byAttacker.set(e.unitId, (byAttacker.get(e.unitId) ?? 0) + (e.casualties ?? 0));
  const b = Math.floor(m(e.tick) / 30) * 30;
  byBucket.set(b, (byBucket.get(b) ?? 0) + (e.casualties ?? 0));
}
console.log('casualties inflicted on hunkpapa-pool by attacker:');
for (const [a, n] of [...byAttacker.entries()].sort((l, r) => r[1] - l[1])) console.log(`  ${a}: ${n}`);
console.log('by 30-min bucket:');
for (const [b, n] of [...byBucket.entries()].sort((l, r) => l[0] - r[0])) console.log(`  ${b}-${b + 30}: ${n}`);
console.log('\nstate change-points (order/commitment/posture/speed/morale):');
for (const t of timeline.slice(0, 40)) {
  console.log(`  ${t.min}: order=${t.order ?? '-'} cd=${t.cd ?? '-'} ${t.posture} ${t.speed ?? '-'} ${t.morale}${t.end ? ' ' + t.end : ''} k${t.k} c${t.c} @${t.pos}`);
}
if (timeline.length > 40) console.log(`  ... ${timeline.length - 40} more`);
console.error('done');
