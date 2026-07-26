// Cohesion-asymmetry diagnostic (Fable, 07-25): why does cohesion degrade for
// Custer's wing but never for Reno's A/G/M? Side-by-side timelines of morale,
// suppression, and the suppression inputs each company receives.
// Read-only. No repo mutation. Run from repo root: node <this> [seed]
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
const REPO = process.cwd();
const SCEN = 'little-bighorn-1876';
const { createSim } = await import(pathToFileURL(join(REPO, 'dist/engine/src/index.js')).href);
const { TerrainMovementLoader } = await import(pathToFileURL(join(REPO, 'dist/src/terrain/movement-loader.js')).href);

const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios', SCEN, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(join(REPO, 'data/terrain', SCEN));
const seed = Number(process.argv[2] ?? 18760625);

const RENO = ['co-a', 'co-g', 'co-m'];
const WING = ['co-c', 'co-e', 'co-f', 'co-i', 'co-l'];
const TRACKED = [...RENO, ...WING];
const COVER = { 0: 'open', 1: 'TIMBER', 2: 'VILLAGE', 3: 'RAVINE', 4: 'HISTCORR', 254: 'RIVER', 255: 'FORD' };

const sim = createSim(scenario, { seed, terrain });
const acc = Object.fromEntries(TRACKED.map((id) => [id, {
  engagedTicks: 0, suppSum: 0, suppPeak: 0, oppOnCover: 0, oppSamples: 0,
  rangeSum: 0, rangeN: 0, oppStrengthSum: 0, intensitySum: 0,
  firstDegrade: null, degradeContext: null, timeline: [],
}]));

for (let tick = 0; tick <= 1800; tick += 1) {
  sim.run(tick);
  const st = sim.state();
  const byId = Object.fromEntries(st.units.map((u) => [u.id, u]));
  for (const id of TRACKED) {
    const u = byId[id];
    if (!u) continue;
    const a = acc[id];
    const mine = st.engagements.filter((e) => e.active && e.unitIds.includes(id));
    if (mine.length > 0) {
      a.engagedTicks += 1;
      a.suppSum += u.suppression ?? 0;
      a.suppPeak = Math.max(a.suppPeak, u.suppression ?? 0);
      for (const e of mine) {
        const oppId = e.unitIds.find((i) => i !== id);
        const opp = byId[oppId];
        if (!opp) continue;
        a.oppSamples += 1;
        const kind = terrain.movementAtMeters(opp.position.x, opp.position.y).coverKind;
        if (kind === 1 || kind === 2) a.oppOnCover += 1;
        a.rangeSum += e.rangeMeters; a.rangeN += 1;
        a.oppStrengthSum += opp.strengthAvailable;
        a.intensitySum += e.intensity ?? 0;
      }
    }
    if (a.firstDegrade === null && u.moraleState !== 'STEADY') {
      a.firstDegrade = tick / 2;
      a.degradeContext = mine.map((e) => {
        const oppId = e.unitIds.find((i) => i !== id);
        const opp = byId[oppId];
        const kind = opp ? terrain.movementAtMeters(opp.position.x, opp.position.y).coverKind : -1;
        return `${oppId}@${Math.round(e.rangeMeters)}m/${e.state}/${COVER[kind] ?? kind}`;
      }).join(' ');
    }
    if (tick % 40 === 0) {
      a.timeline.push({ min: tick / 2, morale: u.morale, state: u.moraleState,
        supp: u.suppression ?? 0, cas: u.casualties, eng: mine.length });
    }
  }
}

console.log(`seed ${seed} — per-company summary (0-900 min)`);
console.log('| unit | side | engaged min | mean supp | peak supp | mean range m | opp-on-cover % | mean opp avail | mean intensity | casualties | first non-STEADY (min) | context at degradation |');
console.log('|---|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|');
for (const id of TRACKED) {
  const a = acc[id];
  const grp = RENO.includes(id) ? 'RENO' : 'WING';
  console.log(`| ${id} | ${grp} | ${(a.engagedTicks / 2).toFixed(0)} | ${(a.suppSum / Math.max(1, a.engagedTicks)).toFixed(2)} | ${a.suppPeak.toFixed(2)} | ${(a.rangeSum / Math.max(1, a.rangeN)).toFixed(0)} | ${(100 * a.oppOnCover / Math.max(1, a.oppSamples)).toFixed(0)}% | ${(a.oppStrengthSum / Math.max(1, a.oppSamples)).toFixed(0)} | ${(a.intensitySum / Math.max(1, a.oppSamples)).toFixed(2)} | ${acc[id].timeline.at(-1)?.cas ?? ''} | ${a.firstDegrade ?? 'never'} | ${a.degradeContext ?? '—'} |`);
}
console.log('\nmorale/suppression timeline (every 20 min, engaged windows only): unit min morale state supp cas eng');
for (const id of TRACKED) {
  const rows = acc[id].timeline.filter((r) => r.eng > 0 || (r.state !== 'STEADY'));
  if (rows.length === 0) continue;
  console.log(id + ': ' + rows.map((r) => `${r.min}:${r.morale.toFixed(0)}/${r.state[0]}${r.state === 'STEADY' ? '' : '!'}/s${r.supp.toFixed(1)}/c${r.cas}/e${r.eng}`).join(' '));
}
