// CC independent verification of the completed WO-D108 campaign +
// which-one-specifically diagnosis of the sanctuary breach (seed
// 18760633, reported: co-m annihilated EAST at tick 1628 by
// crow-king-band at (7156.08, 11479.54)). Also digit-checks the
// baseline seed (18760625: Reno killed 31, F4 roster green) and the
// breach seed's Reno total (66). Diagnosis questions: (1) event
// digit-exact? (2) was co-m ROUTED-then-caught per D107 semantics -
// and WHO was within isolationRadiusMeters 650 at the catch (should be
// nobody STEADY) - i.e., where was the garrison, and did co-m cross
// toward friendly mass or away from it? Read-only on the halted
// candidate tree.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const m = (t) => t / 2;

// --- seed 18760625 baseline checks ---
{
  const sim = createSim(scenario, { seed: 18760625, terrain });
  sim.run(2160);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  const renoKilled = RENO.reduce((a, id) => a + (byId.get(id)?.killed ?? 0), 0);
  console.log(`seed 18760625: Reno killed ${renoKilled} (report: 31) | F4 roster: ${WING.map((id) => `${id}:${byId.get(id)?.endState ?? 'alive'}`).join(' ')} co-d:${byId.get('co-d')?.endState ?? 'alive'} (report: five destroyed, co-d alive)`);
}

// --- seed 18760633 breach diagnosis ---
{
  const sim = createSim(scenario, { seed: 18760633, terrain });
  const comTrack = []; // sampled position/state
  let annEvent = null;
  let evCursor = 0;
  let preCatch = null;
  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const st = sim.state();
    const events = sim.events();
    for (; evCursor < events.length; evCursor += 1) {
      const e = events[evCursor];
      if (e.type === 'melee-bout' && e.targetUnitId === 'co-m' && e.outcome === 'annihilation') annEvent = e;
    }
    const byId = new Map(st.units.map((u) => [u.id, u]));
    const com = byId.get('co-m');
    if (com && !com.endState && tick % 20 === 0 && tick >= 1400) {
      comTrack.push({ min: m(tick), x: Math.round(com.position.x), y: Math.round(com.position.y), morale: com.moraleState, side: terrain.channelSideAtMeters?.(com.position.x, com.position.y) });
    }
    if (annEvent && !preCatch) {
      // capture the tick BEFORE conversion state is gone: use current state at the annihilation tick
      preCatch = { tick, st };
      const com2 = byId.get('co-m');
      console.log(`\nseed 18760633 ANNIHILATION EVENT: tick ${annEvent.tick} (min ${m(annEvent.tick)}), attacker ${annEvent.attackerUnitId ?? annEvent.attackerId}, terminalConverted ${annEvent.terminalConverted}, at (${annEvent.x ?? '?'},${annEvent.y ?? '?'}) | report: tick 1628, crow-king-band, (7156,11480)`);
      console.log(`co-m at catch: pos (${Math.round(com2?.position.x)},${Math.round(com2?.position.y)}) side ${terrain.channelSideAtMeters?.(com2?.position.x, com2?.position.y)} endState ${com2?.endState}`);
      console.log(`\nWHICH FRIENDLY WHERE at the catch (all same-side combat units, distance from co-m, moraleState, withdrawn):`);
      for (const u of st.units) {
        if (u.id === 'co-m' || u.endState === 'DESTROYED') continue;
        const src = scenario.units[u.unitIndex];
        if (!src || src.sideId === 'lakota-cheyenne-coalition' || src.kind === 'NONCOMBATANT_CAMP') continue;
        const d = Math.hypot(u.position.x - com2.position.x, u.position.y - com2.position.y);
        if (d <= 1500) console.log(`  ${u.id}: ${Math.round(d)} m | ${u.moraleState} | withdrawn ${u.withdrawnOffField ?? false} | pos (${Math.round(u.position.x)},${Math.round(u.position.y)})`);
      }
    }
  }
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  const renoKilled = RENO.reduce((a, id) => a + (byId.get(id)?.killed ?? 0), 0);
  console.log(`\nseed 18760633: Reno killed ${renoKilled} (report: 66)`);
  console.log(`\nco-m track (last 12 samples before catch, every 10 min from 700):`);
  for (const s of comTrack.slice(-12)) console.log(`  min ${s.min}: (${s.x},${s.y}) ${s.side} ${s.morale}`);
}
console.error('done');
