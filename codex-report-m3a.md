# Codex Report — M3-A

## FINAL STATUS ADDENDUM — D53a AND STATE-PURE SPOTTING CACHE

D53a corrected `reno-advance` to compose its Ford A waypoint route with the
`village-s-end` landmark as the final goal. The accepted result is **C4 10/11
(90.9%) PASS** and E5 remains **4/10** at scenario hash `083e7f2c`.

The D53a E5 changes from the preceding baseline are:

| Checkpoint | Before | D53a / final | Change |
|---|---|---|---|
| `cp-reno-skirmish-line` | 49.0 min / 156.9 m | 67.5 min / 515.2 m | +18.5 min / +358.3 m |
| `cp-reno-timber` | 7.0 min / 276.5 m | 37.5 min / 1447.7 m | +30.5 min / +1171.2 m |
| `cp-reno-hill` | 64.5 min | 42.5 min | -22.0 min |

All other E5 rows are unchanged. The state-pure cache fix caused **no further
E5 or C4 changes** relative to the D53a reports. The regenerated exam remains
10/11; `obs-cheyenne-custer-column` is the sole gateable failure. O3 readings
also remain unchanged: `obs-scouts-pony-herd` is terrain-blocked at 26,029.1 m
(score 0, informational FAIL), and `obs-custer-crows-nest-haze` is
terrain-blocked at 20,507.4 m (score 0, informational PASS).

### E6 root cause and fix

The M3-SPEC cache design was history-dependent: a pair-keyed blocked ray stayed
valid until an endpoint had moved 100 m from the position at which that cache
entry happened to be created. Continuous and keyframe-restored runs could
therefore select different rays for identical `SimState`, causing divergent
observer contacts and believed pictures.

The sweep precheck now assigns each endpoint deterministically to a floor-indexed
`blockedCacheMoveMeters` grid cell (100 m), samples the cell's origin-facing
grid edge so boundary cells stay inside loaded terrain, includes both cell IDs
and ray heights in the cache key, and computes the cached ray from that
quantized pair.
Cache contents remain outside `SimState`, but each lookup is now a pure function
of current state. A code comment records that validity may depend only on what
the state is, never when the verdict was computed. The shared terrain ray core
is untouched.

Direct `evaluateDetectability` calls are exact-position by default. The C4
harness explicitly requests the exact path, and V2 asserts that every exam row
used an unquantized terrain ray. Quantization applies only to the simulation
sweep's blocked-verdict precheck.

Verified outcomes:

- E6 straight, resume, and tick-2157 keyframe scrub are bit-identical.
- E1 and V1 remain deterministic; V1 consumes zero RNG draws.
- V2 is pinned honestly at 10/11 with the unchanged >=80% rule.
- `npm run exam`: 10/11 (90.9%) PASS.
- `npm run sim -- --scenario little-bighorn-1876 --to-tick 2160 --seed 18760625 --report`:
  scenario hash `083e7f2c`, E5 4/10, no diff from the D53a report.

### D53a/cache-fix `npm run exam` output

```text
> bighorn-animation@0.1.0 exam
> npm run build --silent && node dist/engine/exam-cli.js

[exam] C4 10/11 (90.9%) PASS
[exam] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\c4-observation-exam.md
```

### D53a/cache-fix exit quartet output verbatim

#### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

#### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

#### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 39

✓ engine/tests/variants.test.ts (3 tests) 20ms
✓ tests/data-integrity.test.ts (13 tests) 258ms
✓ engine/tests/unit.test.ts (3 tests) 124ms
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

✓ tests/terrain-gates.test.ts (5 tests) 340ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 10/11 (90.9%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

✓ engine/tests/m3a-gates.test.ts (5 tests) 23808ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"e4f5aceb","360":"a1c20b24","1080":"c20057a6","2160":"9b691109"},"sameB":{"1":"e4f5aceb","360":"a1c20b24","1080":"c20057a6","2160":"9b691109"},"different":{"1":"e4f5aceb","360":"a1c20b24","1080":"c20057a6","2160":"9b691109"}}

✓ engine/tests/gates.test.ts (6 tests) 63694ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 9890ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 20842ms

Test Files  6 passed (6)
Tests       35 passed (35)
Start at    00:02:01
Duration    65.06s (transform 1.25s, setup 0ms, collect 2.75s, tests 88.24s, environment 3ms, prepare 1.86s)
```

#### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -b
```

The D53/D54 status immediately below is retained as historical trail and is
superseded where this addendum differs.

## FINAL STATUS — D53/D54 ADJUDICATION APPLIED

The integrity-preserving D52 rerun was the adjudication baseline: **6/11
(54.5%) FAIL**. Its accepted failures were the terrain-blocked Hunkpapa sighting
and four northern camps incorrectly visible. Owner-approved D53 and D54 have now
been applied without changing event expectations, event atmospheric factors, or
observer positions.

- **D53:** all six camp centers and ten dependent bands/pools were relocated at
  LOW into the D43 village strip with old/new coordinates retained in each
  provenance note. The ordering is strictly south-to-north. `village-s-end` and
  `village-n-end` now match the strip endpoints at `(45.51833, -107.38873)` and
  `(45.556, -107.44657)` respectively.
- **D54:** terrain blocking is unchanged. Visible rays now use exact,
  deterministic segment length through cover with raster-compatible overlap
  precedence and Beer–Lambert attenuation:
  `(1 - losOpacity)^(pathMeters / attenuationUnitMeters)`. The exported path
  integrator is shared/reusable for M3-B.
- **Final C4:** **9/11 (81.8%) PASS**. All verdicts are accepted as they fall.
  The remaining failures are `obs-village-reno-advance` (terrain blocked) and
  `obs-cheyenne-custer-column` (score `5.2681e-5`, below `1.3000e-3`).

### D53/D54 tuning audit

The least-moved passing table changes only the new D54 parameter. The D52
thresholds remain untouched; no redundant K/threshold rescaling was used merely
to make the displayed threshold larger.

| Global `[CAL]` parameter | D52 / D54 start | Final | Changed |
|---|---:|---:|---|
| `K` | 1 | 1 | no |
| `spotThreshold` | 0.0013 | 0.0013 | no |
| `loseThreshold` | 0.00065 | 0.00065 | no |
| `attenuationUnitMeters` | 100 | 210 | **yes** |
| all other parameters | unchanged | unchanged | no |

The complete parameter audit and every event's score, threshold, margin, path
length, and factor breakdown are in `reports/c4-observation-exam.md`.

| Gateable event | Score | Margin vs `T_spot` | Verdict |
|---|---:|---:|---|
| `obs-warriors-divide-column` | Infinity | Infinity | PASS |
| `obs-reno-village-hunkpapa` | 4.7228e-2 | +4.5928e-2 | PASS |
| `obs-reno-village-oglala` | 1.6376e-3 | +3.3761e-4 | PASS |
| `obs-reno-village-minneconjou` | 4.2793e-5 | +1.2572e-3 unseen margin | PASS |
| `obs-reno-village-sans-arc` | 0 | +1.3000e-3 unseen margin | PASS |
| `obs-reno-village-mixed-north` | 0 | +1.3000e-3 unseen margin | PASS |
| `obs-reno-village-cheyenne` | 0 | +1.3000e-3 unseen margin | PASS |
| `obs-village-reno-advance` | 0 | -1.3000e-3 | FAIL |
| `obs-cheyenne-custer-column` | 5.2681e-5 | -1.2473e-3 | FAIL |
| `obs-reno-hill-volleys` | 0 | +1.3000e-3 unseen margin | PASS |
| `obs-weir-custer-field` | 1.3962e-3 | +9.6203e-5 | PASS |

### Final E5/V7 comparison

- Authorized baseline: `reports/e5-baseline.md`, scenario hash `cbb1dfa2`, 4/10.
- D53/D54 scenario hash: `2adc1039`, 4/10.
- Checkpoint-table diff: **none**. No row changed, so there is nothing to
  itemize; moved camps/pools carry no checkpoints and did not shift US tracks.

### Final O3 informational readings

| Event | D52 reading | D53/D54 reading | Change |
|---|---|---|---|
| `obs-scouts-pony-herd` | 26,029.1 m; terrain blocked; score 0; FAIL | 26,029.1 m; terrain blocked; score 0; FAIL | none |
| `obs-custer-crows-nest-haze` | 23,171.2 m; terrain blocked; score 0; PASS | 20,507.4 m; terrain blocked; score 0; PASS | south-end relocation shortened ray 2,663.8 m; verdict/transmittance unchanged |

### Final `npm run exam` output

```text
> bighorn-animation@0.1.0 exam
> npm run build --silent && node dist/engine/exam-cli.js

[exam] C4 9/11 (81.8%) PASS
[exam] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\c4-observation-exam.md
```

### Final quartet output verbatim

#### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

#### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

#### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 39

✓ engine/tests/variants.test.ts (3 tests) 21ms
✓ tests/data-integrity.test.ts (13 tests) 250ms
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

✓ tests/terrain-gates.test.ts (5 tests) 294ms
✓ engine/tests/unit.test.ts (3 tests) 134ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 9/11 (81.8%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the cbb1dfa2 baseline
[gate] V7 PASS E5 table diff=none

✓ engine/tests/m3a-gates.test.ts (5 tests) 21051ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"12c6e1b0","360":"54c3af2f","1080":"e8daa1b9","2160":"c90e3781"},"sameB":{"1":"12c6e1b0","360":"54c3af2f","1080":"e8daa1b9","2160":"c90e3781"},"different":{"1":"12c6e1b0","360":"54c3af2f","1080":"e8daa1b9","2160":"c90e3781"}}

✓ engine/tests/gates.test.ts (6 tests) 78478ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 13750ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 32841ms

Test Files  6 passed (6)
Tests       35 passed (35)
Start at    23:27:06
Duration    80.16s (transform 1.01s, setup 0ms, collect 2.42s, tests 100.23s, environment 3ms, prepare 2.30s)
```

#### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -b
```

### D53 placement ambiguity

`mixed-north-camp` had no numeric sourced center; its old `(45.552, -107.45)`
was explicitly a repeated north-end placeholder. D53 makes ordering the firm
fact, so it is placed at strip-midpoint `(45.551, -107.427914)`, immediately
south of the Cheyenne center at `(45.552, -107.428467)`. This is LOW and retains
both coordinates in provenance.

## SUPERSEDED HISTORICAL TRAIL — pre-D52/D53/D54

The sections below are retained as the requested execution trail. Their 9/11
result, tuning audit, scenario hash, O3 distances, and command transcript predate
D52–D54 and are superseded by the final status above.

## Superseded pre-D52 final status

M3-A is complete and green. Deterministic spotting uses the shared M1
`raycastTerrain` core with D23 curvature/refraction (`k=0.13`), consumes no RNG,
and maintains per-observer contacts plus serialized/replayed/hashed side belief
pictures. Idle unscheduled warrior pools now activate DEFEND_CAMP interpose
objectives from believed contacts. The C4 exam passes at **9/11 (81.8%)** with
one global parameter table. No UI or M3-B work was performed.

The D51 split replaces one partial-village row with six camp-target rows, so the
new `observationEvents` count is **14** (previously 9).

## Superseded pre-D52 tuning before/after

Every `[CAL]` parameter was audited. Only the hysteresis thresholds changed;
the 2:1 gain/loss ratio was preserved.

| Parameter | Before | After |
|---|---:|---:|
| `spotThreshold` | 0.008 | 0.0013 |
| `loseThreshold` | 0.004 | 0.00065 |

All other global values are unchanged. The complete unchanged/changed table and
every gateable event's score, threshold, and margin appear in the full C4 report
below. The owner-provided pre-tuning sanity anchors are asserted in tests: a
600-person mounted-moving column from an elevated overlook at 15 km clears the
starting threshold; a 50-person dismounted skirmish line at 1 km clears it; and
the 5,000-person CAMP signature at 9 km outscores a cavalry company at 3 km.

## Superseded pre-D52 V7 E5 stability

- Authorized baseline scenario hash: `cbb1dfa2`
- Current post-D51 scenario hash: `d6935748`
- Regenerated checkpoint-table diff: **none**
- Result remains **4/10 hits**; no DEFEND_CAMP pool carries a checkpoint.

## Superseded pre-D52 quartet output verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 39

✓ engine/tests/variants.test.ts (3 tests) 17ms
✓ tests/data-integrity.test.ts (13 tests) 133ms
✓ engine/tests/unit.test.ts (3 tests) 62ms
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

✓ tests/terrain-gates.test.ts (5 tests) 209ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 9/11 (81.8%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the cbb1dfa2 baseline
[gate] V7 PASS E5 table diff=none

✓ engine/tests/m3a-gates.test.ts (5 tests) 22951ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"35489c9d","360":"5a172992","1080":"8ead882e","2160":"07bd2a00"},"sameB":{"1":"35489c9d","360":"5a172992","1080":"8ead882e","2160":"07bd2a00"},"different":{"1":"35489c9d","360":"5a172992","1080":"8ead882e","2160":"07bd2a00"}}

✓ engine/tests/gates.test.ts (6 tests) 59980ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 9654ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 19018ms

Test Files  6 passed (6)
Tests       35 passed (35)
Start at    22:21:49
Duration    61.01s (transform 765ms, setup 0ms, collect 1.58s, tests 83.35s, environment 2ms, prepare 1.69s)
```

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -b
```

## Superseded pre-D52 `npm run exam` output

```text
> bighorn-animation@0.1.0 exam
> npm run build --silent && node dist/engine/exam-cli.js

[exam] C4 9/11 (81.8%) PASS
[exam] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\c4-observation-exam.md
```

## Superseded pre-D52 full C4 report inline

```text
# C4 Observation-Event Exam

- Gateable result: **9/11 (81.8%) — PASS**
- Required: at least 80.0% of HIGH/MEDIUM events, excluding the two Crow's Nest/O3 rows.
- Model: production deterministic spotting score; no RNG consumed; event-recorded atmosphericFactor only.

## Global [CAL] tuning audit

| Parameter [CAL] | Before | After | Changed |
|---|---:|---:|---|
| K | 1 | 1 | no |
| spotThreshold | 0.008 | 0.0013 | yes |
| loseThreshold | 0.004 | 0.00065 | yes |
| heightMounted | 2.4 | 2.4 | no |
| heightStanding | 1.7 | 1.7 | no |
| heightProne | 0.3 | 0.3 | no |
| heightCamp | 3 | 3 | no |
| dispersionColumn | 1 | 1 | no |
| dispersionLine | 1.3 | 1.3 | no |
| dispersionSkirmish | 0.7 | 0.7 | no |
| dispersionDispersed | 0.8 | 0.8 | no |
| dispersionCamp | 4 | 4 | no |
| motionStationary | 1 | 1 | no |
| motionFoot | 1.5 | 1.5 | no |
| motionMounted | 2 | 2 | no |
| motionMountedDry | 3 | 3 | no |
| perceptionDivisor | 50 | 50 | no |
| perceptionMinimum | 0.5 | 0.5 | no |
| perceptionMaximum | 2 | 2 | no |
| sweepCadenceTicks | 2 | 2 | no |
| blockedCacheMoveMeters | 100 | 100 | no |
| campDefenseRadiusMeters | 3000 | 3000 | no |

## Gateable events

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-warriors-divide-column | 360 | seen | seen | Infinity | 1.3000e-3 | Infinity | PASS |
| obs-reno-village-hunkpapa | 720 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |
| obs-reno-village-oglala | 720 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |
| obs-reno-village-minneconjou | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-sans-arc | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-mixed-north | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-cheyenne | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-village-reno-advance | 720 | seen | seen | Infinity | 1.3000e-3 | Infinity | PASS |
| obs-cheyenne-custer-column | 780 | seen | seen | 6.3039e-3 | 1.3000e-3 | 5.0039e-3 | PASS |
| obs-reno-hill-volleys | 800 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-weir-custer-field | 865 | seen | seen | 1.3962e-3 | 1.3000e-3 | 9.6203e-5 | PASS |

### Gateable factor audit

- **obs-warriors-divide-column (PASS):** distance=0.0m; angular=Infinity; terrain=visible; cover=1.0000e+0; atmosphere=1.0000e+0; transmittance=1.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; no unit/leader, doctrine-average perception; target unit.
- **obs-reno-village-hunkpapa (FAIL):** distance=4027.8m; angular=1.1007e-1; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit. Failing factor: terrain-blocked (transmittance 0).
- **obs-reno-village-oglala (FAIL):** distance=5787.4m; angular=7.5190e-2; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit. Failing factor: terrain-blocked (transmittance 0).
- **obs-reno-village-minneconjou (PASS):** distance=6906.5m; angular=4.8836e-2; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-sans-arc (PASS):** distance=7268.4m; angular=3.9589e-2; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-mixed-north (PASS):** distance=7766.8m; angular=3.7049e-2; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-cheyenne (PASS):** distance=7766.8m; angular=3.8780e-2; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-village-reno-advance (PASS):** distance=0.0m; angular=Infinity; terrain=visible; cover=1.0000e+0; atmosphere=1.0000e+0; transmittance=1.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: movement-only unit position; target unit.
- **obs-cheyenne-custer-column (PASS):** distance=3611.8m; angular=4.2026e-3; terrain=visible; cover=5.0000e-1; atmosphere=1.0000e+0; transmittance=5.0000e-1; motion=3.0000e+0; perception=1.0000e+0. Resolution: movement-only unit position; target unit.
- **obs-reno-hill-volleys (PASS):** distance=4076.0m; angular=3.7239e-3; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-weir-custer-field (PASS):** distance=4783.5m; angular=3.1732e-3; terrain=visible; cover=1.0000e+0; atmosphere=4.0000e-1; transmittance=4.0000e-1; motion=1.0000e+0; perception=1.1000e+0. Resolution: event-recorded observer position; nearest unit to target landmark last-stand-hill.

### Gateable mismatches

- obs-reno-village-hunkpapa: terrain-blocked (transmittance 0)
- obs-reno-village-oglala: terrain-blocked (transmittance 0)

## Informational/O3 — Crow's Nest (excluded from gate)

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-scouts-pony-herd | 60 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |
| obs-custer-crows-nest-haze | 300 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |

- **obs-scouts-pony-herd (FAIL):** distance=26029.1m; angular=4.6102e-4; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit. Failing factor: terrain-blocked (transmittance 0).
- **obs-custer-crows-nest-haze (PASS):** distance=23171.2m; angular=1.2567e-3; terrain=blocked; cover=0.0000e+0; atmosphere=5.0000e-1; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; nearest unit to target landmark village-s-end.

## Confidence-excluded events

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-custer-weir-village | 760 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |

- **obs-custer-weir-village (FAIL):** distance=3289.0m; angular=3.5509e-3; terrain=blocked; cover=0.0000e+0; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; nearest unit to target landmark village-s-end. Failing factor: terrain-blocked (transmittance 0).
```

## AMBIGUITIES

1. The scenario schema exposes `DEFEND_CAMP` as an order type but has no
   default-behavior field. `TODO-AMBIGUOUS(M3-A)` documents the v1 rule:
   otherwise-unscheduled `WARRIOR_BAND` units are the idle defensive pools.
2. Runtime state has no prone stance. `TODO-AMBIGUOUS(M3-A)` documents that
   non-mounted targets use the specified standing height; the prone `[CAL]`
   value remains in the one global table for the future state addition.
3. D47 says to interpose "between" threat and camp but gives no standoff.
   `TODO-AMBIGUOUS(M3-A)` documents use of the neutral geometric midpoint.
4. D47 requires release when the trigger clears, while last-known contacts have
   no decay rule. `TODO-AMBIGUOUS(M3-A)` documents that only currently spotted
   contacts keep the trigger live.
5. Two inherited description-only observation rows could not be evaluated
   mechanically. Their provenance now carries `TODO-AMBIGUOUS(M3-A)` mappings:
   the collective 7th Cavalry column uses `co-a`, and the Custer fight uses
   Custer's attached `co-f`; no source identifies a specific company.
6. Landmark-only observations have a target position but no unit signature.
   `TODO-AMBIGUOUS(M3-A)` documents the generic nearest movement-only unit rule;
   there are no event-ID-specific mappings.

## Deviations and findings

- Beyond the required D51 split, the two inherited description-only target rows
  received explicit representative `unitId` values so every gateable row is
  mechanically evaluable. Both are marked ambiguous in scenario provenance.
- The two D51 southern-camp expected sightings remain production-ray failures:
  the shared terrain core blocks both at the event-recorded observer position.
  They were not repaired with observer movement, per-event atmosphere, or a
  special-case ray exception. The overall gate still passes at 81.8%.
- V3 covers the headless scope requested here: opposing belief and its serialized
  form. No POV UI/render implementation was added because that belongs to M3-B.
- No M3-B file was edited, no UI was built, and no commit or push was performed.
