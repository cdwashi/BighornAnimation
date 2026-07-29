// Fifteenth measurement: what differentiates co-m (survives, k20) from co-a
// and co-g (annihilated in place, k44/k45) in the 800-820 conversion window,
// and why does D96's shouldClose never fire (D96 dormancy - evidence for the
// bundle's first design question: is D96 supposed to be reachable?).
// Read-only, stop seed 18760625 only, D103 candidate dist as built.
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
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const SIDE = 'lakota-cheyenne-coalition';
const FRIENDLY_R = 450; // combat-config friendlyRadiusMeters, mirrored
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

// shouldClose mirror: threat not STEADY, and local coalition strengthAvailable
// (non-camp, not BROKEN/ROUTED) > local threat-side strengthAvailable, both
// within 450 m of the threat.
function closeInputs(st, threat) {
  let closing = 0, defending = 0;
  for (const u of st.units) {
    const src = scenario.units[u.unitIndex];
    if (src.kind === 'NONCOMBATANT_CAMP' || u.endState === 'DESTROYED') continue;
    const d = Math.hypot(u.position.x - threat.position.x, u.position.y - threat.position.y);
    if (d > FRIENDLY_R) continue;
    if (src.sideId === SIDE) {
      if (u.moraleState !== 'BROKEN' && u.moraleState !== 'ROUTED') closing += u.strengthAvailable;
    } else defending += u.strengthAvailable;
  }
  return { closing, defending };
}

const sim = createSim(scenario, { seed: 18760625, terrain });
const rows = [];
const fordCrossings = {};
let firstNonSteady = {};
for (let tick = 0; tick <= 1700; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  for (const id of RENO) {
    const u = byId.get(id);
    if (!u) continue;
    if (u.insideFord && !(id in fordCrossings)) fordCrossings[id] = m(tick);
    if (!(id in firstNonSteady) && u.moraleState !== 'STEADY') firstNonSteady[id] = `${m(tick)}:${u.moraleState}`;
  }
  const min = m(tick);
  if (min >= 745 && min <= 840 && tick % 10 === 0) {
    const line = { min };
    for (const id of RENO) {
      const u = byId.get(id);
      const ci = closeInputs(st, u);
      line[id] = `${sideOf(u.position)} ${u.mounted ? 'M' : 'd'}${u.posture[0]}${u.formation[0]} ${u.moraleState.slice(0, 4)} k${u.killed}${u.endState ? '/DEST' : ''} sa${u.strengthAvailable} [cls ${ci.closing}v${ci.defending}]`;
    }
    line.pools = POOLS.map((id) => {
      const u = byId.get(id);
      const t = u.pursuit?.targetUnitId ?? u.campDefense?.threatUnitId ?? '-';
      return `${id.split('-')[0]}->${t}@${u.posture[0]}`;
    }).join(' ');
    rows.push(line);
  }
}
for (const r of rows) {
  console.log(`${r.min}: A[${r['co-a']}] G[${r['co-g']}] M[${r['co-m']}] | ${r.pools}`);
}
console.log('\nfirst insideFord (retreat crossing):', JSON.stringify(fordCrossings));
console.log('first non-STEADY morale:', JSON.stringify(firstNonSteady));
const st = sim.state();
for (const id of RENO) {
  const u = st.units.find((x) => x.id === id);
  console.log(`end ${id}: side=${sideOf(u.position)} pos=(${Math.round(u.position.x)},${Math.round(u.position.y)}) ${u.mounted ? 'MTD' : 'dis'} ${u.moraleState} k${u.killed} ${u.endState ?? 'alive'}`);
}
console.error('done');
