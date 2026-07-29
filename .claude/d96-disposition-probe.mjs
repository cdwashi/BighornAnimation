// Seventeenth measurement: both candidate dispositions for the D96/D72
// ownership defect, measured on the stop seed BEFORE any ruling is drafted.
//   A (D96-wins): a band under an active camp-defence commitment answers to
//     camp defence; D72 startPursuit does not write posture/target for it.
//   B (pursuit-informs-commitment): same gate, but D72's proposed target is
//     offered to the commitment as a switching candidate under D92's 250 m
//     margin, band-relative (disclosed operationalization: proposed target
//     must be 250 m nearer the BAND than the committed one; the ruled D92
//     margin is camp-relative - this mirrors its structure at the band).
// Gate covers both COMBAT and INITIATIVE kinds for committed units (one
// authority per unit), disclosed. Dist-only patch behind __d17mode (inert
// when unset), restored by rebuild + hash check. Read-only w.r.t. repo.
// Reported per disposition: killed trajectory incl. fine 800-820, roster,
// wing, co-m east-bank sanctuary, D96 CHARGE observability, end positions.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const mode = process.argv[2];
if (mode !== 'A' && mode !== 'B') throw new Error('pass A or B');
globalThis.__d17mode = mode;
globalThis.__d17log = [];
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const POOLS = ['minneconjou-pool', 'sans-arc-pool', 'blackfeet-santee-pool'];
const m = (t) => t / 2;
const sideOf = (p) => terrain.channelSideAtMeters?.(p.x, p.y) ?? '?';

const sim = createSim(scenario, { seed: 18760625, terrain });
const checkpoints = [740, 767.5, 800, 805, 810, 815, 820, 840, 900, 1080];
const killedAt = {};
let next = 0;
let chargeTicks = 0, firstCharge = null;
let coMkilledAtCross = null, coMcrossed = null;
for (let tick = 0; tick <= 2160; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = new Map(st.units.map((u) => [u.id, u]));
  if (next < checkpoints.length && m(tick) >= checkpoints[next]) {
    killedAt[checkpoints[next]] = RENO.reduce((s, id) => s + (byId.get(id)?.killed ?? 0), 0);
    next += 1;
  }
  const coM = byId.get('co-m');
  if (coM && coMcrossed === null && sideOf(coM.position) === 'EAST' && m(tick) > 750) {
    coMcrossed = m(tick);
    coMkilledAtCross = coM.killed;
  }
  let anyCharge = false;
  for (const id of POOLS) {
    const u = byId.get(id);
    if (u?.posture === 'CHARGE') anyCharge = true;
  }
  if (anyCharge) {
    chargeTicks += 1;
    if (firstCharge === null) firstCharge = m(tick);
  }
}
const st = sim.state();
const byId = new Map(st.units.map((u) => [u.id, u]));
const coM = byId.get('co-m');
console.log(`===== disposition ${mode} — seed 18760625 =====`);
console.log('Reno A/G/M killed:', JSON.stringify(killedAt), '| end:', RENO.reduce((s, id) => s + byId.get(id).killed, 0));
console.log('per company end:', RENO.map((id) => { const u = byId.get(id); return `${id} k${u.killed}${u.endState ? '/' + u.endState : '/alive'}`; }).join(' | '));
console.log('wing end:', WING.map((id) => `${id}:${byId.get(id).endState ?? 'alive'}`).join(' | '));
console.log(`co-m sanctuary: crossed EAST at ${coMcrossed} with k${coMkilledAtCross}; end side=${sideOf(coM.position)} k${coM.killed} ${coM.endState ?? 'alive'} morale=${coM.moraleState}`);
console.log(`pool CHARGE observability: first observable CHARGE ${firstCharge ?? 'never'}, tick-boundaries with a pool in CHARGE: ${chargeTicks}`);
console.log('pools end:', POOLS.map((id) => { const u = byId.get(id); return `${id}(${Math.round(u.position.x)},${Math.round(u.position.y)})${sideOf(u.position)[0]}c${u.casualties}`; }).join(' | '));
const gated = globalThis.__d17log.filter((e) => e.ev === 'D72-gated').length;
const informed = globalThis.__d17log.filter((e) => e.ev === 'informed-switch');
console.log(`instrument: D72 startPursuit gated ${gated} times; informed switches ${informed.length}${informed.length ? ' -> ' + informed.slice(0, 8).map((e) => `${m(e.tick)}:${e.unit.split('-')[0]}->${e.target}`).join(' ') : ''}`);
console.error('done ' + mode);
