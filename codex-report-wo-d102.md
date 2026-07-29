# WO-D102 asymmetric unit frontage

Execution date: 2026-07-28  
Starting HEAD: `6937e8430db70af8df1a4e160088823b3177cd90`  
Baseline seed: `18760625`  
Registered seeds: `18760600–18760649` (N=50)  
Scenario-content stream: `ba288f09` before and after  
Status: **implemented; PR-16 MISS and test-runner red reported; no commit or push**

## Summary

The frozen D102 mechanism is implemented without changing a scenario byte or
any existing `[CAL]` value:

1. exported `frontageMeters(unit, scenario)` returns
   `strengthAvailable × metersPerFiringMan` only for a dismounted `SKIRMISH`
   unit, with warrior frontage structurally zero;
2. the new additive `[CAL]` is `metersPerFiringMan = 4.57`, with its
   deliberately one-sided sourced range recorded;
3. `resolveFire` supplies edge-to-edge effective range to `rangeProbability`
   only; the engagement descriptor, opening gate, band, suppression, UI, and
   other centroid consumers remain unchanged;
4. `isFlanking` returns separate angular and endpoint-overlap flags and their
   OR, while the combat instrument counts angular and endpoint events
   independently.

No value was tuned after observing results.

The frozen mechanism is behaviorally dormant on this adjudicated tree. In all
50 registered seeds, Reno A/G/M are annihilated while still mounted in
`COLUMN`, before the minute-720 `DISMOUNT_SKIRMISH` order can complete.
Consequently all 17,154 measured valley fire resolutions have zero frontage:
effective range equals centroid range event-for-event, endpoint-flank events
are 0/50 seeds, and the full-state/path-call oracles do not move.

PR-15 is a **HIT** at an unchanged Reno-killed median of 113. PR-16 is a
**MISS**: pooled median effective range is 215.96 m, not 144 ± 35 m. PR-17 and
PR-18 are **HIT**. The Reno annihilation is reported as binding data under the
PR-5 interim supersession; it does not fire a stop in this round.

## Implementation

### Exported frontage derivation

`engine/src/frontage.ts` exports the reusable derivation. It reads the runtime
unit's preserved `strengthAvailable`, so dismounted horse-holders are already
netted out and casualty updates remain conserved. It returns zero for warriors,
mounted units, and non-`SKIRMISH` formations.

At the ruled best value:

- 34 firing men occupy `34 × 4.57 = 155.38 m`;
- the encoded A/G/M 102-firer battalion derivation is
  `102 × 4.57 = 466.14 m`;
- the registered testimony variant is approximately 512 m.

Warriors still carry zero frontage. Their ground/feature extent remains outside
this work order.

### One-sided `[CAL]`

The global combat table adds:

```text
metersPerFiringMan = 4.57
```

The provenance comment is:

```text
[CAL] best 4.57 (Upton ¶610, SOURCED-verbatim) / low 0.914 (Carpenter, SOURCED-WEAK) / high NONE, deliberately — do not invent an upper bound.
```

`METERS_PER_FIRING_MAN_RANGE` represents the upper bound as `null`; no symmetric
or invented high value was added.

### Effective fire range only

For unit-on-unit fire:

```text
effectiveRange =
  max(0, engagement.rangeMeters
         - (frontageMeters(attacker) + frontageMeters(target)) / 2)
```

Only the argument to `rangeProbability` changes. The following remain centroid:

- `EngagementDescriptor.rangeMeters`;
- the 700 m opening gate;
- `rangeBand`;
- charge, disengage, pursuit, movement, spotting, LOS, and UI consumers;
- courier fire;
- suppression-round calculation.

### Endpoint-overlap flank and instrumentation

The target segment is centered on the target position, perpendicular to
`facingRadians`, and has half-width `frontageMeters(target) / 2`. Endpoint
flank is true only when the attacker's along-axis projection lies strictly
beyond either endpoint. The combat result uses:

```text
flanked = angularFlank || endpointFlank
```

`CombatMetrics` keeps independent `angularFlankEvents` and
`endpointFlankEvents` counters. A D102 audit option additionally retains
per-fire centroid/effective ranges and both flags without adding them to
serialized simulation state.

Couriers use their existing separate fire path with no flank. The baseline
pack train is mounted/non-skirmish and therefore has zero frontage and angular
flank only.

## New tests named

- `D102 frontage derivation scopes nonzero extent to dismounted SKIRMISH cavalry; mounted and warrior frontage stay zero`
- `D102 centroid opening invariant keeps the 700 m engagement gate centroid-based`
- `D102 effective fire range subtracts both frontage half-widths without changing centroid range`
- `D102 endpoint flank flags a beyond-endpoint attacker but not one abeam within the segment`

The focused file passes **4/4**.

## Quartet — verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit 0.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit 0.

### `npm test`

The final repeated run produced:

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=15739.0ms timings=15684.6,15739.0,16492.6 pathfind={"calls":205,"expandedNodes":17174914,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 108993ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  43905ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  16641ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  31595ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"9615cff5"},"sameB":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"9615cff5"},"different":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"9615cff5"}}

 ✓ engine/tests/gates.test.ts (6 tests) 71417ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 59677ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=176.69ms baseline=6254.05ms sweep=5686.69ms spottingOverhead=0.10%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=31 orders=26 activations=3 leaderDeaths=2

 ✓ tests/m3b-gates.test.ts (3 tests) 56513ms
 ✓ engine/tests/d91-gates.test.ts (8 tests) 21191ms
 ✓ tests/terrain-gates.test.ts (5 tests) 205ms
 ✓ tests/data-integrity.test.ts (13 tests) 161ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 155ms
 ✓ engine/tests/unit.test.ts (3 tests) 108ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 28ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 23ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 24ms
 ✓ engine/tests/variants.test.ts (3 tests) 16ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 8ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 7ms

 Test Files  15 passed (15)
      Tests  88 passed (88)
     Errors  1 error
   Duration  326.07s

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7
```

Exit 1. Every test assertion passed: **15/15 files, 88/88 tests**. Vitest
reported one unhandled worker-RPC timeout after the long serial gate run. This
same red reproduced on three full-suite attempts and is not relabeled green.

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
┌ ○ /                                    76 kB           163 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

Exit 0.

## Composite audit

Both measurements use the unchanged `ba288f09` stream.

| Instrument | Before | After | Change |
|---|---:|---:|---:|
| Seed 18760625 composite | 54.64% | 54.64% | 0.00 pp |
| N=50 envelope median | 46.30% | 46.30% | 0.00 pp |
| N=50 envelope mean | 48.56% | 48.56% | 0.00 pp |
| N=50 envelope min–max | 36.05%–60.19% | 36.05%–60.19% | none |

Seed 18760625 remains C1 50.00% FAIL, C2 77.78% FAIL, C3 15.38%
FAIL, and C4 92.31% PASS.

Both verbatim `npm run envelope` invocations completed all 50 seeds, wrote
`reports/seed-envelope.md`, and then exited 1 on the known finding:

```text
Error: Baseline criteria selected no typical seed; preserved diagnostic report at
C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\seed-envelope.md
```

This is the dispatched known finding, not a D102 defect.

## Registered N=50 measurements

### Reno A/G/M killed

| State | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Before | 108 | 111 | 113 | 115 | 123 | 113.58 |
| After | 108 | 111 | 113 | 115 | 123 | 113.58 |

The exact frequency distribution is unchanged:

| Killed | Seeds |
|---:|---:|
| 108 | 2 |
| 109 | 2 |
| 110 | 4 |
| 111 | 6 |
| 112 | 7 |
| 113 | 4 |
| 114 | 6 |
| 115 | 6 |
| 116 | 5 |
| 117 | 3 |
| 118 | 2 |
| 119 | 1 |
| 120 | 1 |
| 123 | 1 |

At baseline seed 18760625, A/G/M killed are 37/34/38 and wounded are
8/11/7: every company has 45 total losses and is annihilated. This is reported
as data under the binding PR-5 interim supersession. No stop fires and nothing
was tuned in response.

### Valley fire range

The audit window is through tick 1600/minute 800 and includes actual
unit-on-unit fire resolutions where one participant is Reno A/G/M and the other
is a warrior band.

| Distribution | N | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| Pooled centroid range (m) | 17,154 | 0.75 | 111.86 | 215.96 | 226.66 | 588.97 | 205.45 |
| Pooled effective range (m) | 17,154 | 0.75 | 111.86 | 215.96 | 226.66 | 588.97 | 205.45 |
| Per-seed median effective range (m) | 50 | 126.35 | 215.96 | 215.96 | 215.96 | 226.66 | 215.82 |

Changed-range events: **0/17,154**. Reno units remain mounted/COLUMN throughout
their live valley fire, so the registered frontage never materializes before
annihilation.

### Flank instrumentation

Whole-day fire-resolution event counts, kept separate:

| Flag | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Angular flank | 192 | 346 | 368 | 410 | 495 | 370.40 |
| Endpoint flank | 0 | 0 | 0 | 0 | 0 | 0.00 |

Endpoint-overlap is therefore reported as data only, with no baseline verdict.

### Coalition casualties — superseded-band labeling

| Outcome | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Coalition killed | 11 | 22 | 27 | 52 | 95 | 41.66 |
| Coalition wounded | 45 | 63 | 68 | 143 | 241 | 108.40 |

The live scorecard still encodes the superseded scenario bands, so these are
explicitly labeled interim:

- original encoded killed band 31–300: 20/50 seeds;
- PR-6 superseding corrected killed band 36–136: 17/50 seeds;
- encoded wounded band 100–200: 5/50 seeds;
- both original encoded bands: 5/50 seeds;
- corrected killed plus encoded wounded bands: 4/50 seeds.

At seed 18760625 the coalition result is 17 killed / 63 wounded, below both the
PR-6 superseding killed low of 36 and the still-encoded wounded low of 100.
No scenario correction was made; it remains reserved for the reseed bundle.

## PR-15–PR-18 verdicts

| Prediction | Verdict | Evidence |
|---|---|---|
| PR-15 — Reno killed median does not decrease | **HIT** | 113 before → 113 after; identical distribution |
| PR-16 — median effective range below 216 m and within 144 ± 35 m | **MISS** | pooled median 215.96 m; 71.96 m above 144 and outside 109–179 m; effective equals centroid on all 17,154 events |
| PR-17 — same scenario stream | **HIT** | `ba288f09` before and after; scenario JSON byte-identical |
| PR-18 — confinement | **HIT** | C4 12/13; E5 diff none; F3 byte-identity |

PR-15's load-bearing non-decrease criterion passes by equality, not by the
expected increase. The causal observation is that the eligible formation never
exists during live Reno combat on this tree.

PR-18 details:

- C4: **12/13 (92.3%) PASS**;
- E5: **checkpoint table diff none**;
- F3: seed 18760625 and seed 42 no-combat full-day states are byte-identical,
  both with zero RNG draws; full-day hash `9615cff5`.

## Oracle audit

No combat oracle refresh was required:

| Oracle | Before | After |
|---|---:|---:|
| Baseline full-combat state hash | `edf884c0` | `edf884c0` |
| `findPath` calls | 205 | 205 |
| Expanded nodes | 17,174,914 | 17,174,914 |

This is not a reseed and not a hidden stale pin. It is the measured behavioral
result: no live firing unit acquires nonzero frontage. Detailed D102 metrics are
runtime-only and do not manufacture a serialized-state change.

## Preserved probes — final built `dist/`

All commands ran from repo root after the final build.

| Probe | Result |
|---|---|
| `node .claude/h1-probe.mjs` | exit 0; 18 Reno-warrior APPROACH openings retained |
| `node .claude/h1-diag.mjs` | exit 0 |
| `node .claude/h1-diag2.mjs` | exit 0 |
| `node .claude/h1-diag3.mjs` | exit 0 |
| `node .claude/cohesion-asymmetry-probe.mjs 18760625` | exit 0 |
| `node .claude/d98-crossing-test.mjs 18760643` | exit 0; 30 crossings, all 30 order-driven, 0 camp-defence |
| `node .claude/d98-crossing-test.mjs 18760625` | exit 0; 26 crossings, all 26 order-driven, 0 camp-defence |

The cohesion probe's Reno picture is unchanged:

| Unit | Engaged min | Mean centroid range | Casualties | Minute-720 state |
|---|---:|---:|---:|---|
| co-a | 4 | 284 m | 45 | ROUTED, zero strength |
| co-g | 6 | 243 m | 45 | ROUTED, zero strength |
| co-m | 6 | 243 m | 45 | ROUTED, zero strength |

Suppression remains 0.00 for all three. The probe reports centroid engagement
ranges by design; the D102 fire audit separately measures effective ranges.

## `[CAL]` and protected-content audit

- `git diff` removes **zero existing numeric literal** from
  `engine/src/combat-config.ts`; `metersPerFiringMan` and its one-sided range
  are additive.
- `engine/src/spotting.ts` remains blob
  `8c889c2adec0f345c73bf2e7e65b1afbe9614654`.
- `engine/src/movement.ts` remains blob
  `c4550a476e51e70abe6dddb9ead9b35f42fac508`.
- `engine/src/state.ts` remains blob
  `b70e51eb03adf79109caa682398919985201fea8`; `state.ts:241` is untouched.
- Scenario JSON remains blob
  `11db18bd727ae93a4460b146a7300b3f34909241`, SHA-256
  `E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8`.
- `docs/PREDICTIONS.md` remains blob
  `1bb534184d101778b3fe085df42d70d914dc5027`, SHA-256
  `4C51146E4395CA295CFFFA286DE5674B82F0817892569F85C5C34CBC2470DD28`.
- `moraleSuppressionDrain`, the 700 m gate, D96 trigger semantics, every
  scenario byte, and all prior codex reports have zero diff.
- `git diff --check` reports no whitespace error.

The score and envelope commands regenerated
`reports/calibration-scorecard.md` and `reports/seed-envelope.md`; these are
measurement artifacts, not scenario or calibration changes.

## AMBIGUITIES

No unresolved `TODO-AMBIGUOUS` was added and no STOP was required.

- Other in-`resolveFire` range consumers: the ruling explicitly names
  hit-probability lookup only. `rangeProbability` receives effective range;
  suppression and descriptor/band state remain centroid.
- Courier/pack-train endpoint flank: courier fire remains on its separate
  no-flank path. The live pack train has zero frontage, so endpoint is false
  and angular-only behavior is preserved.
- The dormant result is not an ambiguity in the formula. It is a measured
  sequencing fact: annihilation precedes completion of the only eligible
  dismount order.

## DEVIATIONS

- **PR-16 MISS:** effective range does not move because no live valley unit has
  nonzero frontage. The miss is reported without tuning.
- `npm test` exits 1 despite 88/88 assertions passing because Vitest reports
  one repeated worker-RPC `onTaskUpdate` timeout after the long serial suite.
  Three full-suite attempts reproduced the runner error; it is not relabeled
  green.
- Both required envelope runs exit 1 after writing complete N=50 reports on
  the dispatched known “no eligible typical seed” finding.
- The anticipated state-hash and path-call refreshes do not occur. The same
  oracles are retained because the mechanism is behaviorally dormant, not
  because of a reseed or manual pinning.
- No scenario change, tuning, calibration move, commit, or push occurred.
