// Thirty-fifth measurement: of the surviving wing cores (the 34th's 67),
// how much of their routed contact time is spent against pursuers that
// still have ammunition? Decides the wing-finisher fork: mostly-dry ->
// (a) direct-kill in the break outcome is the only path and (b) is
// settled; mostly-supplied -> the paths overlap and the fork needs
// re-examining. Per surviving routed wing fragment: contact minutes
// classified SUPPLIED (>=1 nearby enemy within 50 m with any ammo) vs DRY
// (nearby enemies all at zero). 34 completed D105 seeds; read-only.
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
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const m = (t) => t / 2;
const hasAmmo = (u) => Object.values(u.ammunition ?? {}).some((n) => n > 0);

const frags = [];
for (let seed = 18760600; seed <= 18760633; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const routed = new Set();
  const acc = new Map(WING.map((id) => [id, { supplied: 0, dry: 0 }]));
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (const id of WING) {
      const u = byId.get(id);
      if (!u || u.endState) continue;
      if (u.moraleState === 'ROUTED') routed.add(id);
      if (!routed.has(id) || u.moraleState !== 'ROUTED') continue;
      let near = false, supplied = false;
      for (const e of st.units) {
        if (scenario.units[e.unitIndex].sideId !== SIDE || e.endState === 'DESTROYED') continue;
        if (Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y) <= 50) {
          near = true;
          if (hasAmmo(e)) { supplied = true; break; }
        }
      }
      if (near) acc.get(id)[supplied ? 'supplied' : 'dry'] += 0.5;
    }
  }
  const st = sim.state();
  for (const id of WING) {
    const u = st.units.find((x) => x.id === id);
    if (u.endState === 'DESTROYED' || !routed.has(id)) continue;
    const a = acc.get(id);
    if (a.supplied + a.dry === 0) { frags.push({ seed, unit: id, cls: 'no-contact', supplied: 0, dry: 0 }); continue; }
    frags.push({ seed, unit: id, supplied: a.supplied, dry: a.dry, cls: a.supplied >= a.dry ? 'mostly-supplied' : 'mostly-dry' });
  }
  console.log(`${seed}: done`);
}
console.log(`\n===== surviving routed wing fragments: ${frags.length} =====`);
const byCls = new Map();
for (const f of frags) byCls.set(f.cls, (byCls.get(f.cls) ?? 0) + 1);
console.log([...byCls.entries()].map(([k, v]) => `${k}: ${v}`).join(' | '));
const contact = frags.filter((f) => f.cls !== 'no-contact');
const totS = contact.reduce((s, f) => s + f.supplied, 0), totD = contact.reduce((s, f) => s + f.dry, 0);
console.log(`contact minutes total: SUPPLIED ${totS.toFixed(1)} (${(100 * totS / (totS + totD)).toFixed(1)}%) | DRY ${totD.toFixed(1)} (${(100 * totD / (totS + totD)).toFixed(1)}%)`);
console.log(`fragments >=5 supplied-contact-min: ${contact.filter((f) => f.supplied >= 5).length} | >=5 dry-contact-min: ${contact.filter((f) => f.dry >= 5).length}`);
console.error('done');
