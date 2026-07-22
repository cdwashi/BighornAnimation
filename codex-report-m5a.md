# Codex Report — M5-A: Scorer · killed/wounded split · envelope tooling

Date: 2026-07-22  
Starting HEAD: `d893de4`  
Status: **COMPLETE — quartet green; pre-calibration composite intentionally not gated**

## Outcome

M5-A is implemented without calibration tuning:

- `npm run score` writes a presentation-ready C1–C4 card to `reports/calibration-scorecard.md`.
- D81 adds deterministic, per-side killed/wounded splitting, additive runtime/event fields, distinct terminal accounting, and `killed + wounded + effective = strength` conservation.
- `npm run envelope` executes the predeclared N=50 seed list and writes `reports/seed-envelope.md` with every required emergent outcome.
- Baseline selection is mechanical. Criteria SHA-256 is recorded before per-seed generation; 16 seeds qualified and seed `18760602` was selected.
- All seven variants were run and scored. The two flagships plus two provenance-flagged counterfactuals are `deep`; the remaining three are `sanity`.
- D78–D83 and artifact rows were appended to `docs/IMPLEMENTATION_HISTORY.md`, execution-dated 07-22 and not renumbered.
- No calibration values were tuned. No `app/` production file was modified. No commit or push was made.

## D81 ratio configuration and conservation

| Side | Sourced low | Best | Sourced high | Derivation |
|---|---:|---:|---:|---|
| 7th Cavalry | 3.9167 K:W | 5.1538 K:W | 6.3333 K:W | low `235/60`, best spec anchor `268/52`, high `285/45` |
| Lakota-Cheyenne coalition | 0.1550 K:W | 0.3750 K:W | 3.0000 K:W | DISPUTED cross-products `31/200`, `60/160`, `300/100` |

Each nonzero casualty resolution consumes exactly one additional seeded draw for `floor(killedExpectation) + one roll on remainder`. `casualties` remains `killed + wounded` for existing consumers; `casualty-resolution` events add `killed` and `wounded` while retaining position and total. On terminal destruction, remaining effective troops become killed and previously wounded troops remain wounded.

F2 now permanently asserts integer killed/wounded values and:

```text
killed + wounded = casualties
killed + wounded + strengthCurrent = strengthTotal
```

The post-D81 deterministic baseline state hash is `7f00bd23`.

## Variant scoring evidence

| Variant | Tier | Counterfactual flag | Composite | C1 | C2 | C3 | C4 |
|---|---|---|---:|---:|---:|---:|---:|
| `v-mtc-crossing` | deep | no | 49.97% | 27.27% | 55.56% | 46.15% | 100.00% |
| `v-organized-last-stand` | deep | no | 51.56% | 40.00% | 33.33% | 61.54% | 92.31% |
| `v-c-company-split` | sanity | no | 45.79% | 40.00% | 33.33% | 38.46% | 92.31% |
| `v-deep-ravine-ssl` | sanity | no | 58.41% | 36.36% | 88.89% | 38.46% | 92.31% |
| `v-weir-ordered` | sanity | no | 59.68% | 40.00% | 88.89% | 38.46% | 92.31% |
| `v-reno-holds-timber` | deep | yes | 47.92% | 66.67% | 33.33% | 20.00% | 75.00% |
| `v-benteen-prompt` | deep | yes | 54.86% | 33.33% | 77.78% | 40.00% | 91.67% |

Counterfactual status is detected only from the exact provenance phrase `counterfactual: excluded from calibration scoring`. For such a patch, only score items tied mechanically to units touched by the patch are excluded; the run and unrelated historical targets remain scored.

## Pre-calibration scorecard in full

# Calibration Scorecard

- Scenario: `little-bighorn-1876`
- Seed: `18760625`
- Variants: `baseline`
- Review tier: **baseline**
- Counterfactual provenance flag: **no**
- Composite: **59.68%**
- Composite gates: **FAIL**

| Component | Weight | Included score | Gate |
|---|---:|---:|---|
| C1 Checkpoints | 0.35 | 40.00% | FAIL — HIGH 25.0% ≥ 70%; overall 40.0% ≥ 50% |
| C2 Casualties | 0.25 | 88.89% | FAIL — both killed/wounded side bands and every flagship end-state exact |
| C3 End states | 0.25 | 38.46% | FAIL — 100% of HIGH-confidence assertions by their minute |
| C4 Observations | 0.15 | 92.31% | PASS — 92.3% ≥ 80% of HIGH/MEDIUM events |

> Composite gate status is the conjunction of C1–C4; no minimum weighted-number gate is invented.
> TODO-AMBIGUOUS(M5-A): `HOLDING_AT` has no schema tolerance. One global proposed [CAL] radius of 250 m is used.

## C1 — Checkpoints

Gate: **FAIL** — HIGH 25.0% ≥ 70%; overall 40.0% ≥ 50%.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| cp-scouts-crows-nest | LOW | included | ≤1000 m and ±40 min | 0.0 m, 0.0 min | PASS |
| cp-reno-ford-a | MEDIUM | included | ≤150 m and ±25 min | 0.0 m, -95.0 min | FAIL |
| cp-reno-skirmish-line | MEDIUM | included | ≤300 m and ±25 min | 515.2 m, 67.5 min | FAIL |
| cp-reno-timber | MEDIUM | included | ≤200 m and ±25 min | 1447.7 m, 37.5 min | FAIL |
| cp-reno-hill | HIGH | included | ≤50 m and ±15 min | 0.0 m, 42.5 min | FAIL |
| cp-yates-ford-b | MEDIUM | included | ≤150 m and ±25 min | 9.3 m, 17.5 min | PASS |
| cp-right-wing-calhoun | HIGH | included | ≤50 m and ±15 min | 0.0 m, 23.5 min | FAIL |
| cp-keogh-sector | HIGH | included | ≤75 m and ±15 min | 415.6 m, -8.5 min | FAIL |
| cp-custer-last-stand | HIGH | included | ≤30 m and ±15 min | 0.0 m, -10.5 min | PASS |
| cp-weir-point | MEDIUM | included | ≤100 m and ±25 min | 0.0 m, -17.5 min | PASS |

## C2 — Casualties

Gate: **FAIL** — both killed/wounded side bands and every flagship end-state exact.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| us-7th-cavalry:killed | HIGH | included | 235.0–285.0 | 195 | FAIL |
| us-7th-cavalry:wounded | HIGH | included | 45.0–60.0 | 51 | PASS |
| lakota-cheyenne-coalition:killed | DISPUTED | included | 31.0–300.0 | 67 | PASS |
| lakota-cheyenne-coalition:wounded | DISPUTED | included | 100.0–200.0 | 174 | PASS |
| flagship:co-c | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-e | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-f | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-i | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-l | HIGH | included | DESTROYED exactly | DESTROYED | PASS |

## C3 — End states

Gate: **FAIL** — 100% of HIGH-confidence assertions by their minute.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| co-c:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-e:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-f:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-i:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-l:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-a:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-g:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-m:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-h:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-d:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-k:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-b:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 3966.1 m from reno-hill | FAIL |
| pack-train:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |

## C4 — Observations

Gate: **PASS** — 92.3% ≥ 80% of HIGH/MEDIUM events.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| obs-scouts-pony-herd | MEDIUM | included | seen | seen | PASS |
| obs-custer-crows-nest-haze | MEDIUM | included | unseen | unseen | PASS |
| obs-warriors-divide-column | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-hunkpapa | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-oglala | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-minneconjou | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-sans-arc | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-mixed-north | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-cheyenne | MEDIUM | included | unseen | unseen | PASS |
| obs-custer-weir-village | DISPUTED | excluded-confidence | seen | unseen | FAIL |
| obs-village-reno-advance | HIGH | included | seen | seen | PASS |
| obs-cheyenne-custer-column | MEDIUM | included | seen | unseen | FAIL |
| obs-reno-hill-volleys | MEDIUM | included | unseen | unseen | PASS |
| obs-weir-custer-field | MEDIUM | included | seen | seen | PASS |

## Envelope summary tables in full

### G-M5-2 ordering evidence

Actual process output began:

```text
[envelope] order=1 criteria-sha256=507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad
[envelope] order=2 per-seed-generation-started N=50
```

The report records the same sequence:

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

Envelope execution time on this host was 550.6 s. Timing is not included in the deterministic artifact.

### Selection result

- Median composite: **56.91%**
- Selected typical seed: **18760602**
- Eligible no-rare-event candidates: **16** (`18760602`, `18760604`, `18760606`, `18760612`, `18760616`, `18760617`, `18760618`, `18760629`, `18760630`, `18760633`, `18760634`, `18760635`, `18760639`, `18760641`, `18760643`, `18760649`)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%; ties by absolute distance from median then numeric seed.

### Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 45.79% | 54.34% | 56.91% | 56.91% | 59.68% | 54.60% |

### Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% |
| C2 | 33.33% | 69.44% | 77.78% | 77.78% | 88.89% | 69.33% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 38.46% | 37.69% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

### Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 18 | 36.0% |
| 1 | 21 | 42.0% |
| 2 | 10 | 20.0% |
| 3 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| two-moons | 9 | 18.0% |
| keogh | 8 | 16.0% |
| lame-white-man | 8 | 16.0% |
| calhoun | 4 | 8.0% |
| gall | 4 | 8.0% |
| crazy-horse | 3 | 6.0% |
| sitting-bull | 2 | 4.0% |
| weir | 2 | 4.0% |
| yates | 2 | 4.0% |
| crow-king | 1 | 2.0% |
| custer | 1 | 2.0% |

### Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

### Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| arikara-scouts | 50 | 100.0% |
| co-e | 40 | 80.0% |
| co-f | 40 | 80.0% |
| lwm-band | 40 | 80.0% |
| co-d | 6 | 12.0% |
| cheyenne-pool | 5 | 10.0% |

### Wing-destruction distribution

- Complete wing destruction: **40/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 857.00 | 860.50 | 862.25 | 864.00 | 867.00 | 862.44 |

### Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

No qualifying casualty-resolution event occurred in any of the 50 runs.

### Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, gall, keogh, lame-white-man, sitting-bull, two-moons, weir, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=arikara-scouts, cheyenne-pool, co-d, co-e, co-f, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=857.0–867.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These are M5-B starting-line findings. No value was changed to improve them in this order. The complete 50-row table is in `reports/seed-envelope.md`.

## Determinism and gate evidence

- D31/D55: same-seed simulations remain bit-identical; post-split state hash `7f00bd23` is asserted.
- Split rounding consumes the serialized seeded stream and exactly one draw per nonzero split.
- Envelope report formatting is tested byte-for-byte for the same declared seed/outcome sequence.
- Criteria content hash and per-seed generation order are emitted and stored in the same run.
- F2 conservation is asserted for all baseline units.
- C1, C2, C3, C4, weighting, synthetic perfect/failing cards, all seven tier tags, and provenance-driven exclusions have focused tests.

## AMBIGUITIES

1. **C3 `HOLDING_AT` has no tolerance in the schema or M5 spec.** `TODO-AMBIGUOUS(M5-A)` is recorded in the scorer. A single global proposed `[CAL]` radius of 250 m is used; there are no per-assertion values.
2. **The spec defines category gates and weights but no separate threshold for the weighted number.** The composite is the weighted included-item pass rate; overall gate status is the conjunction of C1–C4. This is stated in every scorecard.
3. **Bloody Knife cannot appear in the envelope.** D82 names his death, but `scenario.leaders` has no Bloody Knife entity. The envelope flags this explicitly; adding him would be a separately ruled data change and was not invented here.
4. **Ford-choke radius is numberless.** Extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md` and flags the choice `TODO-AMBIGUOUS(M5-A)`.
5. **US ratio spread requires a derived ratio range.** The best is the spec's hilltop-inclusive `268/52`; low/high use the calibration unit-band conservative endpoints `235/60` and `285/45`. The derivation and source text live beside the config values.
6. **Counterfactual exclusion scope is not structurally enumerated.** The exact provenance flag activates exclusion, and affected score units are derived mechanically from that variant patch's orders, unit changes, leader attachments, and end-state changes. No counterfactual ID list is used.

## Deviations

- **F6 work-metric port was pulled forward.** M5-SPEC G-M5-5 requires deterministic work metrics as primary. The old 10 s host-wall-clock assertion was replaced by `calls = 158`, `expandedNodes ≤ 11,100,000`, and `scratchAllocations ≤ 3`; timing remains emitted. This host ranged above 10 s during a loaded run, while the final quartet median was 9.94 s. No engine behavior or `[CAL]` value changed.
- **No calibration pass was performed.** Composite and historical-envelope failures are preserved as measured, per the work order.
- **No production `app/` edit was needed.** The event change is additive and existing total/position consumers remain compatible; M5-C can consume `killed`/`wounded` from runtime state and casualty events.

## Final exit quartet output verbatim

PowerShell profile noise is excluded. Command output is otherwise reproduced verbatim.

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=9937.8ms timings=8881.3,9937.8,10212.9 pathfind={"calls":158,"expandedNodes":11084487,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 64254ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  23059ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  11622ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  19035ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"74ed919d","360":"bfd656f3","1080":"dd04bfd3","2160":"63e20c21"},"sameB":{"1":"74ed919d","360":"bfd656f3","1080":"dd04bfd3","2160":"63e20c21"},"different":{"1":"74ed919d","360":"bfd656f3","1080":"dd04bfd3","2160":"63e20c21"}}

 ✓ engine/tests/gates.test.ts (6 tests) 39456ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  8375ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  17396ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=117.11ms baseline=4770.07ms sweep=5189.56ms spottingOverhead=4.09%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=30 orders=23 activations=6 leaderDeaths=1

 ✓ tests/m3b-gates.test.ts (3 tests) 38239ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 39236ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  28444ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 195ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

 ✓ tests/data-integrity.test.ts (13 tests) 152ms
 ✓ engine/tests/m5a-gates.test.ts (8 tests) 149ms
 ✓ engine/tests/unit.test.ts (3 tests) 116ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 32ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 29ms
 ✓ engine/tests/variants.test.ts (3 tests) 29ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 11ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 7ms

 Test Files  13 passed (13)
      Tests  75 passed (75)
   Start at  17:01:33
   Duration  189.21s (transform 639ms, setup 0ms, collect 1.57s, tests 181.91s, environment 4ms, prepare 1.78s)
```

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -p tsconfig.engine.json && tsc -b && node scripts/prepare-app-assets.mjs && next build

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
┌ ○ /                                    74.9 kB         162 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB


○  (Static)  prerendered as static content
```

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

## Final repository state

- Worktree intentionally contains the M5-A implementation and supplied untracked spec/work-order files.
- `git diff --check`: clean.
- No commit created; no push performed.
