// CC follow-up probe (2026-08-02, Fable's question back on the 405): which
// state are the featureless-retry bands in - "never acquired a feature at
// activation" or "held one and lost it"? D98's finding was "0 of 96 committed
// samples lose their last eligible feature; no fallback clause needed" (07-26
// world). 405 featureless-retry fires in the D108 world say camp-defence-
// without-feature DOES arise; this probe classifies the origin so the D98
// annotation (if owed) states the right supersession.
//
// Origin classes per featureless EPISODE-SEGMENT:
//   never-acquired  - activation's own selectReachableFeature found nothing
//                     (campDefense appears with featureId undefined).
//   lost-via-switch - band held a feature, then switchThreat (threatUnitId
//                     changed, camp-defense.ts:473-491) cleared it and the new
//                     threat's camp had nothing eligible.
//   lost-via-exclusion - held-goal re-path failed and :711 found nothing
//                     (known 0 from the first probe; counted for completeness).
// Loss/acquisition EVENTS are counted separately from retry FIRES (fires
// recur every 10 ticks; events are the D98-relevant quantity). Re-acquisition
// (featureless band later gains a feature) is also counted.
// Reseed-free deterministic re-run of the accepted campaign seeds at 29e13c3.
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const REPO = process.cwd();
const SCENARIO_ID = 'little-bighorn-1876';
const FIRST_SEED = Number(process.argv[2] ?? 18760600);
const LAST_SEED = Number(process.argv[3] ?? 18760649);
const OUT_PATH = join(REPO, '.claude', 'd100-featureless-origin-probe.out.txt');

const engineRoot = join(REPO, 'dist', 'engine', 'src');
const { createSim } = await import(pathToFileURL(join(engineRoot, 'index.js')).href);
const { TerrainMovementLoader } = await import(
  pathToFileURL(join(REPO, 'dist', 'src', 'terrain', 'movement-loader.js')).href
);

const scenario = JSON.parse(await readFile(
  join(REPO, 'data', 'scenarios', SCENARIO_ID, 'scenario.json'), 'utf8'));
const terrain = await TerrainMovementLoader.fromDirectory(
  join(REPO, 'data', 'terrain', SCENARIO_ID));

const lines = [];
const log = (line = '') => { lines.push(line); console.log(line); };

const events = {
  activationWithFeature: 0,
  activationWithout: 0,       // never-acquired segment opens
  switchToFeature: 0,
  switchToNothing: 0,         // lost-via-switch segment opens
  exclusionToNothing: 0,      // lost-via-exclusion (expect 0)
  exclusionToOther: 0,
  reacquired: 0,              // featureless band gains a feature later
};
const fireOrigins = new Map([['never-acquired', 0], ['lost-via-switch', 0], ['lost-via-exclusion', 0]]);
const switchDetails = new Map(); // "heldFeature|oldThreat->newThreat|camp" -> count
const sampleEvents = [];

for (let seed = FIRST_SEED; seed <= LAST_SEED; seed += 1) {
  const sim = createSim(scenario, { seed, terrain });
  // unitId -> {threatUnitId, featureId, lastPathAttemptTick, heldEver, flOrigin}
  const track = new Map();

  for (let tick = 0; tick <= 2160; tick += 1) {
    sim.run(tick);
    const state = sim.state();
    for (const unit of state.units) {
      if (unit.defaultBehavior !== 'DEFEND_CAMP') continue;
      const cd = unit.campDefense;
      const prev = track.get(unit.id);

      if (cd && prev === undefined) {
        // Activation this tick (or first tick of an episode after release).
        const acquired = cd.featureId !== undefined;
        if (acquired) { events.activationWithFeature += 1; }
        else {
          events.activationWithout += 1;
          if (sampleEvents.length < 30) sampleEvents.push(
            `seed ${seed} t${tick} ${unit.id} ACTIVATE->nothing camp=${cd.campUnitId} threat=${cd.threatUnitId}`);
        }
        track.set(unit.id, {
          threatUnitId: cd.threatUnitId, featureId: cd.featureId,
          heldEver: acquired, flOrigin: acquired ? null : 'never-acquired',
        });
        continue;
      }
      if (!cd) { track.set(unit.id, undefined); continue; }

      const info = { ...prev };
      const threatChanged = prev.threatUnitId !== cd.threatUnitId;
      if (threatChanged) {
        // switchThreat ran this tick (only site that changes threatUnitId).
        if (cd.featureId !== undefined) { events.switchToFeature += 1; info.flOrigin = null; }
        else {
          events.switchToNothing += 1;
          info.flOrigin = prev.heldEver ? 'lost-via-switch' : 'never-acquired';
          const key = `${prev.featureId ?? 'none'}|${prev.threatUnitId}->${cd.threatUnitId}|${cd.campUnitId}`;
          switchDetails.set(key, (switchDetails.get(key) ?? 0) + 1);
          if (sampleEvents.length < 30) sampleEvents.push(
            `seed ${seed} t${tick} ${unit.id} SWITCH->nothing held=${prev.featureId ?? '-'} ` +
            `${prev.threatUnitId}->${cd.threatUnitId} camp=${cd.campUnitId}`);
        }
      } else if (cd.lastPathAttemptTick === state.tick) {
        // Re-path branch ran (same threat). Distinguish :710 success / :711.
        const heldRepathSuccess = prev.featureId !== undefined && cd.featureId === prev.featureId;
        if (!heldRepathSuccess) {
          if (prev.featureId !== undefined && cd.featureId === undefined) {
            events.exclusionToNothing += 1; info.flOrigin = 'lost-via-exclusion';
          } else if (prev.featureId !== undefined && cd.featureId !== undefined) {
            events.exclusionToOther += 1; info.flOrigin = null;
          } else {
            // featureless retry FIRE - attribute to the segment's origin.
            const origin = prev.flOrigin ?? 'never-acquired';
            fireOrigins.set(origin, (fireOrigins.get(origin) ?? 0) + 1);
          }
        }
      }
      if (prev.featureId === undefined && cd.featureId !== undefined && !threatChanged &&
        cd.lastPathAttemptTick === state.tick) {
        events.reacquired += 1; info.flOrigin = null;
      }
      if (cd.featureId !== undefined) info.heldEver = true;
      info.threatUnitId = cd.threatUnitId;
      info.featureId = cd.featureId;
      track.set(unit.id, info);
    }
  }
  console.log(`seed ${seed} done`);
}

log('=== Origin of the featureless-retry fires (Fable\'s question on the 405) ===');
log(`fires by segment origin: ${[...fireOrigins.entries()].map(([k, v]) => `${k}:${v}`).join(' ')}`);
log();
log('=== Events (the D98-relevant counts - transitions, not retry fires) ===');
for (const [key, value] of Object.entries(events)) log(`${key}: ${value}`);
log();
log('=== switch-to-nothing detail (heldFeature|threat transition|camp -> count) ===');
for (const [key, count] of [...switchDetails.entries()].sort((l, r) => r[1] - l[1])) {
  log(`${key}: ${count}`);
}
log();
log('=== First 30 transition events ===');
for (const sample of sampleEvents) log(sample);
await writeFile(OUT_PATH, lines.join('\n') + '\n', 'utf8');
console.error('done');
