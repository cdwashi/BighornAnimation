# Codex Report — O3-A Phase 2

## Status

**PASS.** D60 is applied. The `crows-nest` landmark is at `45.4454, -107.1392` with MEDIUM confidence and the required prior APPROX coordinate, OSM basis, sweep corroboration, NPS decoys, D27 lineage, and reopen clause retained in provenance. Both Crow's Nest observation events use the ruled coordinate and are gateable under D49/D60.

The C4 exam passed at **11/13 (84.6%)** with no tuning. This differs from the expected 12/13 shape but is not the gross-surprise stop condition: the pony-herd terrain ray is CLEAR at 26.982 km. The row fails only because its angular detectability score `4.4474e-4` is below the unchanged global threshold `1.3e-3`. The haze row PASSes unseen with terrain blocked and `atmosphericFactor: 0.5` retained. All verdicts were accepted as they fell.

The D60-consistent companion move was applied to both scout units' old Crow's Nest start positions and to `cp-scouts-crows-nest`. The checkpoint table is exactly unchanged; minute-0 scout distance remains 0.0 m. Only the scenario hash changed, `083e7f2c` → `a22a2d67`.

The full quartet is green with 51 tests. No commit or push was performed.

## D60 application

- Landmark: `crows-nest` → `45.4454, -107.1392`, confidence MEDIUM.
- Event: `obs-scouts-pony-herd.observerPosition` → ruled coordinate; promoted to C4.
- Event: `obs-custer-crows-nest-haze.observerPosition` → ruled coordinate; promoted to C4; `atmosphericFactor: 0.5` unchanged.
- Unit: `arikara-scouts.startPosition` → ruled coordinate, old position retained in provenance.
- Unit: `crow-scouts.startPosition` → ruled coordinate, old position retained in provenance.
- Checkpoint: `cp-scouts-crows-nest.position` → ruled coordinate; tolerances unchanged; old position retained in provenance.
- Harness: Crow's Nest informational exclusion removed; gateable count 11 → 13.
- History: D60 was not re-appended; O3 is closed with its >1.5 km reopen clause; the three requested 07-18 artifact rows were added.

## Exam command output

```text
> bighorn-animation@0.1.0 exam
> npm run build --silent && node dist/engine/exam-cli.js

[exam] C4 11/13 (84.6%) PASS
[exam] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\c4-observation-exam.md
```

## C4 exam table

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-scouts-pony-herd | 60 | seen | unseen | 4.4474e-4 | 1.3000e-3 | -8.5526e-4 | FAIL |
| obs-custer-crows-nest-haze | 300 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-warriors-divide-column | 360 | seen | seen | Infinity | 1.3000e-3 | Infinity | PASS |
| obs-reno-village-hunkpapa | 720 | seen | seen | 4.7228e-2 | 1.3000e-3 | 4.5928e-2 | PASS |
| obs-reno-village-oglala | 720 | seen | seen | 1.6376e-3 | 1.3000e-3 | 3.3761e-4 | PASS |
| obs-reno-village-minneconjou | 720 | unseen | unseen | 4.2793e-5 | 1.3000e-3 | 1.2572e-3 | PASS |
| obs-reno-village-sans-arc | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-mixed-north | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-cheyenne | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-village-reno-advance | 720 | seen | seen | 3.3616e-2 | 1.3000e-3 | 3.2316e-2 | PASS |
| obs-cheyenne-custer-column | 780 | seen | unseen | 5.2681e-5 | 1.3000e-3 | -1.2473e-3 | FAIL |
| obs-reno-hill-volleys | 800 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-weir-custer-field | 865 | seen | seen | 1.3962e-3 | 1.3000e-3 | 9.6203e-5 | PASS |

Promoted-row factor audit:

- `obs-scouts-pony-herd`: distance 26,982.2 m; terrain visible; cover transmittance 1; atmosphere 1; angular size/score `4.4474e-4`; FAIL because score is `8.5526e-4` below `T_spot`. No gross-surprise terrain block occurred.
- `obs-custer-crows-nest-haze`: distance 21,317.1 m; terrain blocked; cover/transmittance 0; atmosphere 0.5; score 0; PASS unseen.

The complete factor audit and unchanged global parameter table are in `reports/c4-observation-exam.md`.

## E5 statement

`E5_TABLE_UNCHANGED true`. The regenerated table exactly matches the D53a `083e7f2c` baseline table; only the scenario hash changed to `a22a2d67`.

| Checkpoint | Unit | Target min | Nearest min | Distance m | Delta min | Result |
|---|---|---:|---:|---:|---:|---|
| cp-scouts-crows-nest | crow-scouts | 0.0 | 0.0 | 0.0 | 0.0 | HIT |
| cp-reno-ford-a | co-a | 675.0 | 582.0 | 0.0 | -93.0 | MISS |
| cp-reno-skirmish-line | co-a | 720.0 | 787.5 | 515.2 | 67.5 | MISS |
| cp-reno-timber | co-a | 750.0 | 787.5 | 1447.7 | 37.5 | MISS |
| cp-reno-hill | co-a | 765.0 | 807.5 | 0.0 | 42.5 | MISS |
| cp-yates-ford-b | co-f | 780.0 | 796.0 | 0.0 | 16.0 | HIT |
| cp-right-wing-calhoun | co-l | 795.0 | 815.0 | 0.0 | 20.0 | MISS |
| cp-keogh-sector | co-i | 825.0 | 815.0 | 415.6 | -10.0 | MISS |
| cp-custer-last-stand | co-f | 840.0 | 831.5 | 0.0 | -8.5 | HIT |
| cp-weir-point | co-d | 865.0 | 848.0 | 0.0 | -17.0 | HIT |

## AMBIGUITIES

- No new blocking D60 ambiguity was introduced. The user's operational ruling explicitly authorized moving the scout starts and checkpoint together when they were found at the old APPROX coordinate.
- The existing representative-unit ambiguity remains on `obs-scouts-pony-herd` and `cp-scouts-crows-nest`: collective “Scouts” are mechanically represented by `crow-scouts`.
- The existing `DISPERSED` formation TODOs remain for the Arikara and Crow scouts; D60 changes coordinate coherence, not formation evidence.
- The pony-herd row's detectability failure is not treated as an ambiguity or tuned away: terrain is CLEAR, while the existing target signature/global threshold makes the distant herd too small to cross `T_spot`.

## Deviations

- Expected exam shape was 12/13; actual is 11/13. The promoted pony-herd row is terrain-visible but below the unchanged detectability threshold. Per standing policy, the verdict was accepted and V2 was pinned honestly to 11/13.
- As found in Phase 1, `tsconfig.json` has `noEmit: true` while `npm run exam` executes `dist`. `npx tsc --noEmit false --incremental false` was run before the prescribed exam command so the current promotion logic was emitted. No unrelated build-configuration patch was made.
- E5's report header necessarily changed its scenario hash, but its checkpoint table did not change.
- D60 already existed and was not re-appended.

## Final quartet output verbatim

Command: `cmd /c "npm run typecheck && npm run lint && npm test && npm run build"`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit


> bighorn-animation@0.1.0 lint
> eslint .


> bighorn-animation@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

✓ tests/m3c-interactions.test.ts (7 tests) 15ms
✓ engine/tests/variants.test.ts (3 tests) 27ms
✓ tests/m3d-interactions.test.ts (5 tests) 40ms
✓ tests/data-integrity.test.ts (13 tests) 270ms
✓ engine/tests/unit.test.ts (3 tests) 177ms
stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON
[gate] G1 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":939.2357514637081,"renoHill":1034.959347093062,"fordA":957.904810237618,"weirPoint":1041.7486488377403,"sharpshooterRidge":1038.9672878067122}
[gate] G2 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target
[gate] G4 PASS blockedAt=489.77m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance
[gate] G5 PASS samples=100 tolerance=0.05m

✓ tests/terrain-gates.test.ts (5 tests) 389ms
  ✓ M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON 305ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 11/13 (84.6%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=116.09ms baseline=4119.23ms sweep=4638.20ms spottingOverhead=12.60%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — one entry per 23 orders plus each camp-defense activation
[gate] V6 PASS entries=29 orders=23 activations=6

✓ tests/m3b-gates.test.ts (3 tests) 18973ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"17d6cf3b","360":"fcfb6aea","1080":"57fc3fa2","2160":"8b0ed331"},"sameB":{"1":"17d6cf3b","360":"fcfb6aea","1080":"57fc3fa2","2160":"8b0ed331"},"different":{"1":"17d6cf3b","360":"fcfb6aea","1080":"57fc3fa2","2160":"8b0ed331"}}

✓ engine/tests/m3a-gates.test.ts (6 tests) 41632ms
  ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run 24982ms
✓ engine/tests/gates.test.ts (6 tests) 45770ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 6729ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 14249ms

Test Files  9 passed (9)
Tests       51 passed (51)
Start at    12:13:17
Duration    47.42s (transform 1.67s, setup 0ms, collect 4.22s, tests 107.29s, environment 4ms, prepare 3.52s)


> bighorn-animation@0.1.0 build
> tsc -b && node scripts/prepare-app-assets.mjs && next build

  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/4) ...
   Generating static pages (1/4)
   Generating static pages (2/4)
   Generating static pages (3/4)
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    70.2 kB         158 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

Exit code: 0.

No commit or push was performed.
