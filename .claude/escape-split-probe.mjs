// Twenty-eighth measurement: test Fable's structural outcome discriminator
// in the abstract, before the resolver exists. At every ROUTED-in-contact
// episode start (the 27th's condition, both radii), did the unit have a
// viable escape - i.e., under the discriminator, would this episode resolve
// FLIGHT or ANNIHILATION? (Repulse is decided upstream by D65 shock and is
// not measurable here; this is the flight-vs-annihilation fork among
// broken-contacted units.) Escape, per D74's own committed semantics:
//   (a) an existing unconsumed path (keep-path case - exact), OR
//   (b) a corridor to the NEAREST steady, unengaged friendly under the
//       D104 blocker (origin-bubble exemption + 250 m interdiction, real
//       findPath) - nearest-ONE only, disclosed: the real routeToSafety
//       tries all friends in order, so the FLIGHT share reported here is a
//       LOWER bound.
// If the split comes back ~95/5 either way, the discriminator is wrong and
// we know before building on it. Read-only; stop honored; 45 seeds.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { findPath } = await import(pathToFileURL(join(REPO, 'dist/engine/src/pathfind.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const SIDE = 'lakota-cheyenne-coalition';
const RADII = [25, 50];
const INTERDICT = 250; // enemyInterdictionRadiusMeters
const m = (t) => t / 2;

const results = { 25: [], 50: [] }; // {seed, unit, min, escape: 'live-path'|'corridor'|'none', wounded}
for (let seed = 18760600; seed <= 18760644; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  const inCond = { 25: new Set(), 50: new Set() };
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const combatants = st.units.filter((u) => {
      const src = scenario.units[u.unitIndex];
      return src.kind !== 'NONCOMBATANT_CAMP' && !u.withdrawnOffField;
    });
    const engagedIds = new Set(st.engagements.filter((e) => e.active).flatMap((e) => e.unitIds));
    for (const u of combatants) {
      const src = scenario.units[u.unitIndex];
      const routedAlive = u.moraleState === 'ROUTED' && u.endState !== 'DESTROYED';
      let nearest = Infinity;
      if (routedAlive) {
        for (const e of combatants) {
          if (scenario.units[e.unitIndex].sideId === src.sideId || e.endState === 'DESTROYED') continue;
          const d = Math.hypot(e.position.x - u.position.x, e.position.y - u.position.y);
          if (d < nearest) nearest = d;
        }
      }
      for (const r of RADII) {
        const now = routedAlive && nearest <= r;
        const was = inCond[r].has(u.id);
        if (now && !was) {
          inCond[r].add(u.id);
          // Episode start: evaluate escape per the discriminator.
          let escape = 'none';
          if (u.pathIndex < u.path.length) escape = 'live-path';
          else {
            const friends = combatants.filter((f) => f.id !== u.id &&
              scenario.units[f.unitIndex].sideId === src.sideId &&
              f.endState !== 'DESTROYED' && f.moraleState === 'STEADY' && !engagedIds.has(f.id))
              .sort((l, rr) => Math.hypot(l.position.x - u.position.x, l.position.y - u.position.y) -
                Math.hypot(rr.position.x - u.position.x, rr.position.y - u.position.y));
            const safety = friends[0];
            if (safety) {
              const enemies = combatants.filter((e) => scenario.units[e.unitIndex].sideId !== src.sideId &&
                e.endState !== 'DESTROYED' && e.moraleState !== 'ROUTED');
              const origin = { ...u.position };
              const result = findPath(
                terrain.gridForPath(u.position, safety.position), u.position, safety.position,
                (point) => Math.hypot(point.x - origin.x, point.y - origin.y) > INTERDICT &&
                  enemies.some((e) => Math.hypot(e.position.x - point.x, e.position.y - point.y) <= INTERDICT),
              );
              if (result.status === 'reachable') escape = 'corridor';
            }
          }
          results[r].push({ seed, unit: u.id, min: m(tick), escape, wounded: u.wounded, side: src.sideId === SIDE ? 'coalition' : 'cavalry' });
        } else if (!now && was) inCond[r].delete(u.id);
      }
    }
  }
  console.log(`${seed}: done (${results[25].filter((e) => e.seed === seed).length}@25, ${results[50].filter((e) => e.seed === seed).length}@50)`);
}
for (const r of RADII) {
  const eps = results[r].filter((e) => e.side === 'cavalry');
  const flight = eps.filter((e) => e.escape !== 'none');
  const byKind = { 'live-path': eps.filter((e) => e.escape === 'live-path').length, corridor: eps.filter((e) => e.escape === 'corridor').length, none: eps.filter((e) => e.escape === 'none').length };
  console.log(`\n===== radius ${r} m, cavalry-side episodes ${eps.length} =====`);
  console.log(`DISCRIMINATOR SPLIT: FLIGHT ${flight.length} (${(100 * flight.length / Math.max(1, eps.length)).toFixed(1)}%) | ANNIHILATION ${byKind.none} (${(100 * byKind.none / Math.max(1, eps.length)).toFixed(1)}%)`);
  console.log(`flight components: live-path ${byKind['live-path']} | corridor ${byKind.corridor} (flight share is a LOWER bound - nearest-one corridor only)`);
  const annWounded = eps.filter((e) => e.escape === 'none').map((e) => e.wounded);
  console.log(`wounded at ANNIHILATION-outcome episodes: total ${annWounded.reduce((a, b) => a + b, 0)} | median ${annWounded.length ? [...annWounded].sort((a, b) => a - b)[Math.floor(annWounded.length / 2)] : 0} | max ${Math.max(0, ...annWounded)}`);
  const byUnit = new Map();
  for (const e of eps.filter((x) => x.escape === 'none')) byUnit.set(e.unit, (byUnit.get(e.unit) ?? 0) + 1);
  console.log(`annihilation-outcome by unit: ${[...byUnit.entries()].sort((l, rr) => rr[1] - l[1]).map(([u, n]) => `${u}:${n}`).join(' ') || 'none'}`);
}
console.error('done');
