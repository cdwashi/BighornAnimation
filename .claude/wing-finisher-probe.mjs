// Thirty-fourth measurement: the wing-finisher hypothesis, checked at the
// mechanism level on the committed D105 tree. Claim: the wing's historical
// destruction was riding on the dissolution timer; D105 removed the
// finisher without replacing it in the north, so routed wing fragments now
// survive as fragments IN CONTACT with pursuers who have no way to finish
// them. Sharpened sub-claim, instrumented: after a bout converts a
// fragment's wounded, an able-bodied routed fragment is UNKILLABLE - fire
// needs ammo (pursuers dry by ~780; the wing fight is later), the bout
// converts wounded only, and the timer is gone. Per wing company per seed:
// rout timing, end state/strength/wounded, bouts received (count +
// converted), post-rout fire-killed, and minutes-in-contact-while-routed
// (enemy within 50 m). 34 completed seeds; read-only; stop honored.
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

const frags = []; // survivors: {seed, unit, routedAt, endStrength, endWounded, endKilled, bouts, converted, postRoutFire, contactMin}
let destroyedCount = 0, survivedRouted = 0, survivedNeverRouted = 0;
for (let seed = 18760600; seed <= 18760633; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const routedAt = new Map();
  const contact = new Map(WING.map((id) => [id, 0]));
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const byId = new Map(st.units.map((u) => [u.id, u]));
    for (const id of WING) {
      const u = byId.get(id);
      if (!u || u.endState) continue;
      if (u.moraleState === 'ROUTED' && !routedAt.has(id)) routedAt.set(id, m(tick));
      if (routedAt.has(id) && u.moraleState === 'ROUTED') {
        let near = false;
        for (const e of st.units) {
          if (scenario.units[e.unitIndex].sideId !== SIDE || e.endState === 'DESTROYED') continue;
          if (Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y) <= 50) { near = true; break; }
        }
        if (near) contact.set(id, contact.get(id) + 0.5);
      }
    }
  }
  const st = sim.state();
  const events = sim.events();
  for (const id of WING) {
    const u = st.units.find((x) => x.id === id);
    if (u.endState === 'DESTROYED') { destroyedCount += 1; continue; }
    const rAt = routedAt.get(id);
    if (rAt === undefined) { survivedNeverRouted += 1; continue; }
    survivedRouted += 1;
    const bouts = events.filter((e) => e.type === 'melee-bout' && e.targetUnitId === id);
    const postRoutFire = events.filter((e) => e.type === 'casualty-resolution' && e.targetUnitId === id && m(e.tick) > rAt)
      .reduce((s, e) => s + (e.killed ?? 0), 0);
    frags.push({
      seed, unit: id, routedAt: rAt,
      endStrength: u.strengthCurrent, endWounded: u.wounded, endKilled: u.killed,
      bouts: bouts.length, converted: bouts.reduce((s, e) => s + (e.convertedWounded ?? 0), 0),
      postRoutFire, contactMin: contact.get(id),
    });
  }
  console.log(`${seed}: done`);
}
console.log(`\n===== wing fates, 34 seeds x 5 companies = 170 company-days =====`);
console.log(`DESTROYED ${destroyedCount} | survived-after-routing ${survivedRouted} | survived-never-routed ${survivedNeverRouted}`);
const q = (l, p) => { const s = [...l].sort((a, b) => a - b); return s.length ? s[Math.min(s.length - 1, Math.floor(p * s.length))] : NaN; };
if (frags.length) {
  console.log(`\nROUTED SURVIVING FRAGMENTS (${frags.length}):`);
  console.log(`end strength: p25 ${q(frags.map((f) => f.endStrength), 0.25)} med ${q(frags.map((f) => f.endStrength), 0.5)} p75 ${q(frags.map((f) => f.endStrength), 0.75)} max ${Math.max(...frags.map((f) => f.endStrength))}`);
  console.log(`end wounded: med ${q(frags.map((f) => f.endWounded), 0.5)} max ${Math.max(...frags.map((f) => f.endWounded))} | fragments with end wounded = 0: ${frags.filter((f) => f.endWounded === 0).length}`);
  console.log(`bouts received: med ${q(frags.map((f) => f.bouts), 0.5)} max ${Math.max(...frags.map((f) => f.bouts))} | fragments receiving >=1 bout: ${frags.filter((f) => f.bouts > 0).length}`);
  console.log(`post-rout fire-killed: total ${frags.reduce((s, f) => s + f.postRoutFire, 0)} | med ${q(frags.map((f) => f.postRoutFire), 0.5)} | fragments with ZERO post-rout fire: ${frags.filter((f) => f.postRoutFire === 0).length}`);
  console.log(`minutes in contact (<=50 m) while ROUTED: med ${q(frags.map((f) => f.contactMin), 0.5)} p75 ${q(frags.map((f) => f.contactMin), 0.75)} max ${Math.max(...frags.map((f) => f.contactMin))} | fragments with >=5 contact-min: ${frags.filter((f) => f.contactMin >= 5).length}`);
  console.log(`UNKILLABLE-CLASS (routed survivor, >=5 contact-min, 0 post-rout fire, 0 end wounded): ${frags.filter((f) => f.contactMin >= 5 && f.postRoutFire === 0 && f.endWounded === 0).length}`);
  const bySeedUnit = frags.slice(0, 20).map((f) => `${f.seed}:${f.unit} s${f.endStrength} w${f.endWounded} bouts${f.bouts} postFire${f.postRoutFire} contact${f.contactMin}m`);
  console.log(`sample: ${bySeedUnit.join(' | ')}`);
}
console.error('done');
