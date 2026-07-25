// H1 PROBE — where are the warrior bands standing during the valley-fight window?
// Read-only diagnostic. No engine mutation, no calibration change, no commit.
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url'; // D91-dispatch portability: Windows ESM needs file:// URLs for absolute-path dynamic imports
const REPO = process.cwd(); // D91-dispatch portability: original probe hardcoded the Fable-sandbox path /home/claude/BighornAnimation; run from repo root
const proj4 = (await import('proj4')).default;
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);
const { assertScenario } = await import(pathToFileURL(join(REPO, 'dist/src/validate.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
assertScenario(scenario);
const manifest = JSON.parse(await readFile(join(REPO, 'data/terrain', SCEN, 'manifest.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));

const toGeo = (x, y) => {
  const [lon, lat] = proj4(manifest.crs.projectedDefinition, manifest.crs.geographic, [
    x + manifest.crs.localOrigin.easting,
    y + manifest.crs.localOrigin.northing,
  ]);
  return { lat, lon };
};
const wall = (min) => {
  const t = 180 + min; // clock start 03:00
  return `${String(Math.floor(t / 60) % 24).padStart(2, '0')}:${String(t % 60).padStart(2, '0')}`;
};
const dist = (a, b) => Math.hypot(a.position.x - b.position.x, a.position.y - b.position.y);

const RENO = ['co-a', 'co-g', 'co-m'];
const WARRIOR = scenario.units
  .filter((u) => u.sideId === 'lakota-cheyenne-coalition' && !u.id.endsWith('-camp') && u.id !== 'pony-herd')
  .map((u) => u.id);

const seed = Number(process.argv[2] ?? 18760603);
const START_MIN = 660, END_MIN = 790, STEP_MIN = 10;

const sim = createSim(scenario, { seed, terrain });
const samples = [];
const firstMove = new Map();
const engagementsSeen = new Map();

for (let min = 0; min <= END_MIN; min += 0.5) {
  sim.run(min * 2);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));

  for (const id of WARRIOR) {
    const u = byId[id];
    if (!firstMove.has(id) && u.lastMovedTick !== undefined && u.lastMovedTick > 0) firstMove.set(id, min);
  }
  for (const e of st.engagements) {
    if (e.unitIds.some((i) => RENO.includes(i)) && e.unitIds.some((i) => WARRIOR.includes(i))) {
      const key = e.unitIds.join('|');
      if (!engagementsSeen.has(key)) {
        engagementsSeen.set(key, { key, firstMin: min, state: e.state, range: e.rangeMeters });
      }
    }
  }

  if (min >= START_MIN && min <= END_MIN && Number.isInteger(min / STEP_MIN)) {
    const renoUnits = RENO.map((i) => byId[i]).filter((u) => u.strengthCurrent > 0);
    const rows = WARRIOR.map((id) => {
      const u = byId[id];
      const d = renoUnits.length ? Math.min(...renoUnits.map((r) => dist(u, r))) : Infinity;
      const geo = toGeo(u.position.x, u.position.y);
      return {
        id, d,
        avail: u.strengthAvailable,
        posture: u.posture,
        morale: u.moraleState,
        order: u.activeOrderId ?? '—',
        blocked: u.blockedReason ?? '',
        pathLeft: Math.max(0, u.path.length - u.pathIndex),
        lat: geo.lat, lon: geo.lon,
      };
    });
    const mass = (limit) => rows.filter((r) => r.d <= limit).reduce((s, r) => s + r.avail, 0);
    samples.push({
      min, rows,
      total: rows.reduce((s, r) => s + r.avail, 0),
      m: [200, 500, 1000, 2000, 4000].map(mass),
      reno: RENO.map((i) => {
        const u = byId[i];
        const geo = toGeo(u.position.x, u.position.y);
        return { id: i, cur: u.strengthCurrent, k: u.killed, w: u.wounded, morale: u.moraleState, posture: u.posture, lat: geo.lat, lon: geo.lon };
      }),
    });
  }
}

const out = [];
out.push(`# H1 PROBE — warrior band positions, valley-fight window`);
out.push(``);
out.push(`- Scenario: \`${SCEN}\`  hash \`${sim.scenarioHash}\`  seed \`${seed}\`  variants: baseline`);
out.push(`- Window: minute ${START_MIN}–${END_MIN} (${wall(START_MIN)}–${wall(END_MIN)}); Ford A 675, skirmish line 720, timber 750, Reno Hill 765`);
out.push(`- Read-only probe. No CAL value, mechanism, or file in the repo was changed.`);
out.push(``);
out.push(`## A. Contact mass vs Reno battalion (warriors within radius of nearest live Reno company)`);
out.push(``);
out.push(`| min | clock | ≤200 m | ≤500 m | ≤1 km | ≤2 km | ≤4 km | total avail |`);
out.push(`|---:|---|---:|---:|---:|---:|---:|---:|`);
for (const s of samples) out.push(`| ${s.min} | ${wall(s.min)} | ${s.m[0]} | ${s.m[1]} | ${s.m[2]} | ${s.m[3]} | ${s.m[4]} | ${s.total} |`);
out.push(``);
out.push(`## B. Where each band is standing`);
for (const s of samples) {
  out.push(``);
  out.push(`### minute ${s.min} (${wall(s.min)})`);
  out.push(``);
  out.push(`| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |`);
  out.push(`|---|---:|---:|---|---|---|---:|---|---:|---:|`);
  for (const r of [...s.rows].sort((a, b) => a.d - b.d)) {
    out.push(`| ${r.id} | ${r.avail} | ${Math.round(r.d)} | ${r.posture} | ${r.morale} | ${r.order} | ${r.pathLeft} | ${r.blocked || '—'} | ${r.lat.toFixed(5)} | ${r.lon.toFixed(5)} |`);
  }
  out.push(``);
  out.push(`Reno: ` + s.reno.map((r) => `${r.id} ${r.cur} men (${r.k}k/${r.w}w) ${r.moraleState ?? r.morale}/${r.posture} @ ${r.lat.toFixed(5)},${r.lon.toFixed(5)}`).join(' · '));
}
out.push(``);
out.push(`## C. First movement tick per band (whole day up to minute ${END_MIN})`);
out.push(``);
out.push(`| band | first moved (min) | clock |`);
out.push(`|---|---:|---|`);
for (const id of WARRIOR) {
  const m = firstMove.get(id);
  out.push(`| ${id} | ${m ?? 'never'} | ${m === undefined ? '—' : wall(m)} |`);
}
out.push(``);
out.push(`## D. Reno-vs-warrior engagements opened (first appearance)`);
out.push(``);
out.push(`| pair | first min | clock | state at open | range (m) |`);
out.push(`|---|---:|---|---|---:|`);
for (const e of engagementsSeen.values()) {
  out.push(`| ${e.key} | ${e.firstMin} | ${wall(e.firstMin)} | ${e.state} | ${Math.round(e.range)} |`);
}
if (engagementsSeen.size === 0) out.push(`| (none) | | | | |`);
out.push(``);

console.log(out.join('\n'));
