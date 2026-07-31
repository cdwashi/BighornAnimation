# WO-D108 bench extent as goal geometry — completed amended report

Execution date: 2026-07-31  
Starting dispatch HEAD: `c4d3da7`  
Amendment HEAD on resume: `e2d74f7`  
Registered seeds: `18760600–18760649`  
Status: **completed; re-armed stop did not fire; no tuning, commit, or push**

## Halt and Amendment 1 sequence

The first execution halted correctly when the frozen 103-cell extraction
contained 85 WEST and 18 EAST cells, F4 was red on that halted tree, and the
tick-2160 no-combat oracle moved. The halt report was delivered without a
campaign or oracle refresh.

Commit `e2d74f7` appended WO-D108 Amendment 1 and adjudicated all three items:

1. the ruled lip is the geometric extraction intersected with WEST, pinning 85
   cells while retaining the 260 m span and continuity;
2. movement-side goal geometry legitimately refreshes only the late-day
   no-combat pin, with ticks through 1080 and zero RNG draws preserved;
3. F4 was left unedited and ceased to block the campaign by itself.

This resumed execution applied those rulings only. On the amended WEST-only
tree F4 returned GREEN without a roster or behavior repair; that result is
reported as data rather than reversed to match the N=1 expectation recorded in
the amendment.

## Outcome

The full N=50 campaign completed. The live re-armed stop did not fire: three
seeds exceeded 60 Reno A/G/M killed (`18760623`, `18760633`, `18760646`), the
maximum was 74, and no seed reached 100.

| Prediction | Verdict | Result |
|---|---|---|
| PR-51 — stacking dissolves | **HIT** | 50/50 peaks below 615 (158–160); every ≥3-holder tick spans 160 m N–S / 164.92 m pairwise, with zero span violations |
| PR-52 — stand moves to lip | **MISS** | Pooled centroid median increased from 151.9 m to 163.39 m instead of shortening; effective median stayed 150 m |
| PR-53 — valley holds | **MISS** | Hard sanctuary leg failed once: co-m annihilated EAST in seed `18760633`; Reno killed median moved 32→31 rather than rising |
| PR-54 — northern confinement | **MISS** | Exact complete wing 28/50, below 30–40; coalition median 69 remains inside 36–136 |
| PR-55 — reseed-free | **HIT** | Scenario stream remains `ba288f09`; scenario bytes are identical |
| PR-56 — audit invariants | **HIT** | Zero violations across 34,182 assigned ticks: on-lip, WEST, unique, exact partition, goal count = assigned count |

Overall: **PR-51, PR-55, and PR-56 HIT; PR-52, PR-53, and PR-54 MISS.**
The load-bearing geometry prediction passed. Misses and the sanctuary breach
were recorded without tuning or preventative code.

## Implementation

| File | Change |
|---|---|
| `engine/src/lip.ts` | Pure deterministic terrain + bench-point derivation; D108 constants plus Amendment 1 WEST intersection; north–south ordering |
| `engine/src/camp-defense.ts` | Band-ID contiguous partition, middle-cell goals, join/release/destruction re-slotting, and existing held-goal cadence reuse |
| `engine/src/index.ts` | Exports the lip module |
| `engine/tests/d108-lip.test.ts` | Five frozen/amended named tests |
| `engine/tests/m4a-gates.test.ts` | Authorized combat and no-combat oracle refreshes with causes in-code |
| `scripts/d108-campaign.mjs` | Stop-guarded N=50 instrument and PR-51–PR-56 per-tick audits |
| `reports/d108-campaign-results.json` | Complete machine-readable campaign evidence |
| `reports/d108-campaign-progress.json` | Per-seed persisted campaign progress/final mirror |
| `reports/calibration-scorecard.md` | Regenerated amended baseline-seed score |
| `reports/seed-envelope.md` | Regenerated canonical N=50 envelope |

The empty-lip fallback remains the point feature and retains its required
`TODO-AMBIGUOUS`. Selection/switching semantics, D98's blocker, D96 closing
precedence, and all non-bench goals remain unchanged.

## Five named D108 tests

| Test | Result | Proof |
|---|---|---|
| `lip-extraction-pinned` | **GREEN** | 85 cells; 260 m N–S; no gap >20 m; rounded minimum 51 m; 85/85 WEST; stable N–S order |
| `partition-exact` | **GREEN** | Three disjoint contiguous segments; distinct goals; band-ID order; deterministic join/release re-slot |
| `single-occupant-centers` | **GREEN** | One holder receives amended-list middle cell 42 of 85 |
| `non-bench-unchanged` | **GREEN** | Substrate timber retains nearest-point semantics and receives no lip |
| `derivation-only` | **GREEN** | Terrain + local bench point only; scenario object remains byte-identical |

Focused result: **5/5 passed**. Full suite result: **115/115 assertions passed**.

## PR-51 — stacking and goal-span distributions

### Peak simultaneous warrior strength within 30 m

| N | Min | P25 | Median | P75 | Max | Mean | Below 615 |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 50 | 158 | 160 | 160 | 160 | 160 | 159.72 | **50/50** |

Sorted distribution: `158×2, 159×10, 160×38`. D107 was 615/620/708 with
all pressure within 30 m; the amended mechanism removes 455–548 strength from
the observed peak range.

### Assigned-goal span and partition audit

All 50 seeds use one observed three-band layout whenever the bench commitment
is active:

`L1 = blackfeet-santee-pool@14 | minneconjou-pool@42 | sans-arc-pool@70`

The 85 cells partition as 28 / 28 / 29 contiguous cells. Goals are:

| Band | Lip index | Offset from bench `(east,north)` | Distance | Side |
|---|---:|---:|---:|---|
| blackfeet-santee-pool | 14 | `(80,-60)` m | 100.00 m | WEST |
| minneconjou-pool | 42 | `(70,30)` m | 76.16 m | WEST |
| sans-arc-pool | 70 | `(120,100)` m | 156.20 m | WEST |

| Audit measure | Distribution/result |
|---|---|
| Assigned ticks per seed | min 650 / P25 679 / median 679 / P75 683 / max 723; total 34,182 |
| Ticks with ≥3 holders | identical: all assigned ticks had exactly three holders |
| Minimum N–S goal span per seed | 160 m in 50/50 |
| Minimum maximum-pair distance per seed | 164.924225 m in 50/50 |
| Span violations below 150 m | 0 |
| Goal audit violations | 0 |
| Timber pressure | 0 in 50/50; min/median/max 0/0/0 |

Every seed's layout is `L1`; the per-seed table below records it explicitly.

## PR-52 — stand-window range distributions

Warrior-attacker fire on Reno A/G/M in minutes 700–800:

| Measure | D107 pooled median | D108 N | Min | P25 | Median | P75 | Max | Mean | Verdict |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---|
| Centroid range | 151.9 m | 28,097 | 0 | 150.00 | **163.39** | 226.66 | 672.12 | 220.03 | **MISS** |
| Effective range | 150 m | 28,097 | 0 | 88.31 | **150.00** | 226.66 | 599.47 | 191.57 | unchanged observation |

Per-seed centroid medians: min 150.01 / P25 150.04 / median 159.64 /
P75 165.76 / max 226.66 / mean 161.34. Per-seed effective medians: min
150 / P25 150 / median 150 / P75 150 / max 226.66 / mean 153.07.

The registered shortening direction did not occur. No range or goal constant
was changed in response.

## PR-53 — valley, sanctuary, and stop

### Reno A/G/M killed

| N | D107 median | Min | P25 | Median | P75 | Max | Mean | Direction |
|---:|---:|---:|---:|---:|---:|---:|---:|---|
| 50 | 32 | 22 | 26 | **31** | 36 | 74 | 32.80 | fell by 1; opposite registered rise |

Sorted totals:

`22,22,22,22,24,25,25,25,25,25,25,26,26,27,27,27,27,27,28,28,28,28,29,30,30,31,31,31,31,32,32,33,33,34,35,35,36,36,36,37,37,37,38,39,40,42,48,66,66,74`

Per-company distributions:

| Company | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| co-a | 1 | 4 | 6 | 8 | 45 | 6.84 |
| co-g | 2 | 5 | 6 | 8 | 15 | 6.54 |
| co-m | 12 | 16 | 18 | 20 | 45 | 19.42 |

### Hard sanctuary leg

**MISS: one east-side Reno annihilation.** Seed `18760633`, tick 1628
(minute 814): `crow-king-band` annihilated `co-m` at local
`(7156.075540, 11479.543017)`, classified EAST. No preventative code was added.

### Re-armed stop

**DID NOT FIRE.** Seeds over 60: `18760623=66`, `18760633=66`,
`18760646=74` — 3/50, below the more-than-five threshold. No seed reached
100. The stop was checked after every tick, not only at seed completion.

## PR-54 — northern confinement

| Measure | D107 | D108 | Criterion | Result |
|---|---:|---:|---:|---|
| Exact wing completion (C/E/F/I/L destroyed, co-d alive) | 35/50 | **28/50** | 30–40 | **MISS** |
| Raw five-company destruction | 38/50 | 29/50 | observation | down 9 |
| Coalition killed median | 70.5 | **69** | 36–136 | HIT |

Per-company destruction counts: co-c 29/50, co-e 39/50, co-f 39/50,
co-i 50/50, co-l 50/50. The exact completion move is −7 from D107, two
seeds beyond the registered ±5 confinement. The pre-named interpretation is
pool-release timing shifting hilltop arrival; no northern mechanism was tuned.

Coalition killed distribution:

| N | Min | P25 | Median | P75 | Max | Mean |
|---:|---:|---:|---:|---:|---:|---:|
| 50 | 32 | 49 | **69** | 82 | 113 | 67.04 |

Sorted totals:

`32,34,36,36,37,37,39,41,42,42,43,44,49,52,53,55,57,62,64,66,66,67,67,68,69,69,70,71,71,71,72,74,79,80,80,81,82,82,85,85,85,86,86,90,91,91,94,102,104,113`

F4 on baseline seed `18760625` is GREEN: co-c/co-e/co-f/co-i/co-l are
DESTROYED and co-d is alive. The roster source was never edited. Amendment 1
authorized campaign execution with F4 red; the WEST-only extraction itself
restored it green.

## PR-55 and PR-56 audit tables

### PR-55

Scenario hash is `ba288f09` in 50/50 seeds and matches the D107 stream.
Scenario JSON and README blobs are byte-identical to Amendment HEAD.

### PR-56

| Invariant | Sample | Violations |
|---|---:|---:|
| Goal lies on extracted 85-cell lip | 34,182 assigned ticks | 0 |
| Goal classifies WEST | 34,182 assigned ticks | 0 |
| No two assigned bands share a goal | 34,182 assigned ticks | 0 |
| Goal count equals assigned count | 34,182 assigned ticks | 0 |
| Exact band-ID partition goal | 34,182 assigned ticks | 0 |

## Per-seed primary proof table

`P30` = peak strength within 30 m; `NS` = minimum ≥3-holder N–S goal span;
`Cmed/Emed` = per-seed stand-window centroid/effective medians; `R` = Reno
A/G/M killed; `K` = coalition killed; `W` = exact wing completion; `EA` =
east Reno annihilations; `T` = timber peak; `Comp` = composite. Every seed's
partition layout is `L1`; all goal audits are zero.

| Seed | Layout | P30 | NS | Cmed | Emed | R | K | W | EA | T | Comp |
|---:|---|---:|---:|---:|---:|---:|---:|:---:|---:|---:|---:|
| 18760600 | L1 | 160 | 160 | 151.90 | 150.00 | 42 | 41 | Y | 0 | 0 | 61.26% |
| 18760601 | L1 | 160 | 160 | 168.52 | 150.00 | 36 | 71 | N | 0 | 0 | 47.37% |
| 18760602 | L1 | 160 | 160 | 226.66 | 226.66 | 22 | 74 | Y | 0 | 0 | 57.63% |
| 18760603 | L1 | 160 | 160 | 165.76 | 150.00 | 27 | 43 | Y | 0 | 0 | 60.41% |
| 18760604 | L1 | 160 | 160 | 151.90 | 150.00 | 24 | 102 | N | 0 | 0 | 55.71% |
| 18760605 | L1 | 160 | 160 | 165.76 | 150.00 | 35 | 68 | N | 0 | 0 | 55.71% |
| 18760606 | L1 | 159 | 160 | 150.03 | 150.00 | 38 | 34 | Y | 0 | 0 | 58.48% |
| 18760607 | L1 | 160 | 160 | 150.04 | 150.00 | 31 | 82 | Y | 0 | 0 | 57.63% |
| 18760608 | L1 | 159 | 160 | 150.04 | 150.00 | 37 | 37 | N | 0 | 0 | 52.93% |
| 18760609 | L1 | 160 | 160 | 150.04 | 150.00 | 26 | 55 | Y | 0 | 0 | 60.41% |
| 18760610 | L1 | 160 | 160 | 165.76 | 150.00 | 33 | 64 | Y | 0 | 0 | 60.41% |
| 18760611 | L1 | 160 | 160 | 168.52 | 150.00 | 37 | 37 | N | 0 | 0 | 52.93% |
| 18760612 | L1 | 160 | 160 | 150.01 | 150.00 | 40 | 81 | Y | 0 | 0 | 57.63% |
| 18760613 | L1 | 160 | 160 | 150.02 | 150.00 | 28 | 86 | Y | 0 | 0 | 57.63% |
| 18760614 | L1 | 159 | 160 | 165.76 | 150.00 | 30 | 39 | N | 0 | 0 | 52.07% |
| 18760615 | L1 | 160 | 160 | 165.76 | 150.00 | 39 | 52 | Y | 0 | 0 | 61.26% |
| 18760616 | L1 | 160 | 160 | 150.03 | 150.00 | 27 | 90 | Y | 0 | 0 | 57.63% |
| 18760617 | L1 | 160 | 160 | 150.04 | 150.00 | 25 | 67 | Y | 0 | 0 | 57.63% |
| 18760618 | L1 | 160 | 160 | 165.76 | 150.00 | 37 | 42 | N | 0 | 0 | 52.93% |
| 18760619 | L1 | 160 | 160 | 165.76 | 150.00 | 28 | 62 | N | 0 | 0 | 52.07% |
| 18760620 | L1 | 160 | 160 | 168.52 | 150.00 | 27 | 91 | Y | 0 | 0 | 57.63% |
| 18760621 | L1 | 160 | 160 | 151.90 | 150.00 | 25 | 91 | Y | 0 | 0 | 57.63% |
| 18760622 | L1 | 158 | 160 | 159.64 | 150.00 | 25 | 70 | N | 0 | 0 | 52.07% |
| 18760623 | L1 | 159 | 160 | 150.02 | 150.00 | 66 | 72 | N | 0 | 0 | 56.56% |
| 18760624 | L1 | 160 | 160 | 151.90 | 150.00 | 27 | 36 | N | 0 | 0 | 52.07% |
| 18760625 | L1 | 160 | 160 | 168.52 | 150.00 | 31 | 69 | Y | 0 | 0 | 63.18% |
| 18760626 | L1 | 160 | 160 | 151.90 | 150.00 | 36 | 49 | Y | 0 | 0 | 60.41% |
| 18760627 | L1 | 160 | 160 | 165.76 | 150.00 | 35 | 113 | Y | 0 | 0 | 57.63% |
| 18760628 | L1 | 160 | 160 | 150.04 | 150.00 | 36 | 66 | N | 0 | 0 | 50.15% |
| 18760629 | L1 | 159 | 160 | 165.76 | 150.00 | 22 | 82 | Y | 0 | 0 | 57.63% |
| 18760630 | L1 | 160 | 160 | 165.76 | 150.00 | 28 | 85 | Y | 0 | 0 | 57.63% |
| 18760631 | L1 | 160 | 160 | 165.76 | 150.00 | 25 | 67 | N | 0 | 0 | 52.07% |
| 18760632 | L1 | 160 | 160 | 150.04 | 150.00 | 48 | 80 | Y | 0 | 0 | 58.48% |
| 18760633 | L1 | 159 | 160 | 153.68 | 150.00 | 66 | 71 | N | 1 | 0 | 58.48% |
| 18760634 | L1 | 160 | 160 | 165.76 | 150.00 | 22 | 86 | Y | 0 | 0 | 57.63% |
| 18760635 | L1 | 159 | 160 | 226.66 | 226.66 | 27 | 79 | N | 0 | 0 | 52.93% |
| 18760636 | L1 | 158 | 160 | 151.90 | 150.00 | 28 | 66 | N | 0 | 0 | 52.07% |
| 18760637 | L1 | 160 | 160 | 168.52 | 150.00 | 25 | 71 | N | 0 | 0 | 50.15% |
| 18760638 | L1 | 160 | 160 | 150.04 | 150.00 | 25 | 69 | Y | 0 | 0 | 57.63% |
| 18760639 | L1 | 160 | 160 | 151.90 | 150.00 | 32 | 94 | Y | 0 | 0 | 57.63% |
| 18760640 | L1 | 160 | 160 | 171.01 | 150.00 | 31 | 85 | N | 0 | 0 | 55.71% |
| 18760641 | L1 | 160 | 160 | 165.76 | 150.00 | 26 | 53 | N | 0 | 0 | 52.07% |
| 18760642 | L1 | 160 | 160 | 168.52 | 150.00 | 34 | 44 | Y | 0 | 0 | 60.41% |
| 18760643 | L1 | 159 | 160 | 159.64 | 150.00 | 32 | 42 | Y | 0 | 0 | 57.63% |
| 18760644 | L1 | 160 | 160 | 151.90 | 150.00 | 22 | 80 | Y | 0 | 0 | 57.63% |
| 18760645 | L1 | 159 | 160 | 150.04 | 150.00 | 31 | 57 | Y | 0 | 0 | 61.26% |
| 18760646 | L1 | 159 | 160 | 150.04 | 150.00 | 74 | 85 | N | 0 | 0 | 50.15% |
| 18760647 | L1 | 160 | 160 | 162.26 | 150.00 | 30 | 36 | N | 0 | 0 | 52.93% |
| 18760648 | L1 | 160 | 160 | 174.01 | 150.00 | 29 | 104 | Y | 0 | 0 | 57.63% |
| 18760649 | L1 | 160 | 160 | 151.90 | 150.00 | 33 | 32 | N | 0 | 0 | 52.93% |

## Registered observations

- Endpoint-flank events fell from 2,591 to **1,127**. Angular flank events:
  18,373.
- Timber pressure remained zero in all 50 seeds.
- The only assigned partition was the three-pool `L1` layout; activation began
  at tick 1438 in every seed and persisted intermittently through tick 2160.
- Point-pressure residuals are transit/unassigned pressure: goals are 76–156 m
  from the point and contribute no on-goal pressure inside 30 m.
- F4 is green on seed `18760625` despite its red state on the pre-amendment
  103-cell halted tree.
- Sanctuary breach, range-direction miss, casualty-direction result, and
  northern completion miss were observed and not repaired.

## Before/after composite and envelope

### Baseline-seed score (`18760625`)

| Metric | D107 before | D108 after |
|---|---:|---:|
| Composite | 57.63% | **63.18%** |
| C1 | 50.00% | 50.00% |
| C2 | 66.67% | **88.89%** |
| C3 | 38.46% | 38.46% |
| C4 | 92.31% | 92.31% |
| US killed / wounded | 225 / 7 | 274 / 14 |
| Coalition killed / wounded | 72 / 212 | 69 / 168 |

### Canonical N=50 envelope

| Metric | D107 before | D108 after |
|---|---:|---:|
| Composite min | 44.59% | 47.37% |
| Composite P25 | 56.83% | 52.93% |
| Composite median | 57.63% | 57.63% |
| Composite P75 | 60.14% | 57.63% |
| Composite max | 63.18% | 63.18% |
| Composite mean | 57.28% | 56.15% |
| Raw five-company destruction | 38/50 | 29/50 |
| Exact complete wing, co-d alive | 35/50 | 28/50 |
| Typical seed | `18760612` | `18760616` |
| Eligible candidates | 7 | 6 |

Criteria SHA-256 remains
`507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad`.

Artifact-baseline line carried verbatim from the prediction row:
**D108 moves the valley stand again, so every northern baseline figure inherits
one more round of “measured against a world that no longer exists.” The caveat
has been shrinking since the eighteenth measurement and was partly lifted at
D107; this round re-ages it by one. The bundle's registrations are not to
over-claim the northern baseline's stability when sizing against it.**

## Authorized oracle refreshes

| Oracle | D107 | D108 Amendment 1 | Cause |
|---|---:|---:|---|
| Combat full-state hash | `baafb3c9` | `2de157f8` | WEST-only goal geometry changes held paths, engagement timing, and combat stream |
| Whole-create path calls | 148 | 160 | Changed held-goal paths |
| Run-only path calls | 146 | 158 | Same cause under the M4-A reset protocol |
| No-combat tick 1 | `baadad58` | `baadad58` | unchanged |
| No-combat tick 360 | `46f01a7a` | `46f01a7a` | unchanged |
| No-combat tick 1080 | `49bc6012` | `49bc6012` | unchanged |
| No-combat tick 2160 | `b36d9fa9` | `4968ae62` | Goal geometry is movement-side and runs with combat disabled |
| No-combat RNG draws | 0 | 0 | unchanged |

The refresh causes are documented in `engine/tests/m4a-gates.test.ts`. Earlier
no-combat pins did not move. The repo's D107 pin `baafb3c9` was used as the
authoritative referent.

## Protected-content and calibration audit

| Protected item | Amendment HEAD blob/hash | Final | Result |
|---|---|---|---|
| `scenario.json` | `11db18bd727ae93a4460b146a7300b3f34909241` | same | byte-identical |
| Scenario README | `dee0cd99f12b1872e0cc23e78387c87500d0c47f` | same | byte-identical |
| `docs/PREDICTIONS.md` | `c9a0ba6915efc7c3a54eb06fcdeadddf911ceb8a` | same | byte-identical |
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` | same | byte-identical |
| Baseline criteria | `55553f2515d7754259a9a14a4e070af4433653cf` | same | byte-identical |
| Scenario FNV-1a stream | `ba288f09` | `ba288f09` | byte-identical |
| `.claude/` Amendment evidence | Amendment HEAD | no working diff | byte-identical |
| F4 roster source | Amendment HEAD | no diff | byte-identical |
| Prior `codex-report-*.md` files | Amendment HEAD | no diff | byte-identical |

`git diff -U0 HEAD -- .` contains no added or removed line containing `[CAL]`.
Tracked occurrences are 241 before / 241 after. Every existing entry is
byte-identical and no entry was added. The D108 constants and Amendment 1 WEST
intersection are structural derivation rules, not tunables.

## Quartet — verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Result: **GREEN**.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Result: **GREEN**.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"4968ae62"},"sameB":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"4968ae62"},"different":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"4968ae62"}}

 ✓ engine/tests/gates.test.ts (6 tests) 71396ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  16516ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  33185ms
stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=15421.8ms timings=14954.4,15421.8,16314.8 pathfind={"calls":158,"expandedNodes":15125753,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 90300ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  30027ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  13082ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  30548ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 53184ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  38271ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=119.09ms baseline=5190.41ms sweep=4974.87ms spottingOverhead=-3.50%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=29 orders=26 activations=3 leaderDeaths=0

 ✓ tests/m3b-gates.test.ts (3 tests) 45024ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 18166ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  17920ms
 ✓ engine/tests/d108-lip.test.ts (5 tests) 406ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 186ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

 ✓ tests/data-integrity.test.ts (13 tests) 146ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 139ms
 ✓ engine/tests/unit.test.ts (3 tests) 107ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 34ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 27ms
 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 27ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 26ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 25ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 26ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 21ms
 ✓ engine/tests/variants.test.ts (3 tests) 20ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 8ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 6ms

 Test Files  20 passed (20)
      Tests  115 passed (115)
     Errors  1 error
   Start at  11:12:23
   Duration  288.65s (transform 705ms, setup 0ms, collect 2.02s, tests 279.27s, environment 5ms, prepare 2.37s)

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7
```

Result: **GREEN assertions, 115/115**. The command's nonzero process status is
the known post-result Vitest worker-channel teardown artifact documented at
dispatch. It is reported verbatim and was not chased.

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

Result: **GREEN**.

## AMBIGUITIES

None remain after Amendment 1. The original 103-vs-WEST contradiction, the
late-day no-combat refresh rule, and the F4 campaign gate were adjudicated by
the amendment. The sanctuary breach and PR-52/PR-54 misses are registered
results, not ambiguities.

## DEVIATIONS

None. The work order was halted under its original contradiction, resumed only
after committed adjudication, and then completed without changing a scenario
byte, calibration entry, prediction, threshold, roster, or protected probe.
No commit or push was made.
