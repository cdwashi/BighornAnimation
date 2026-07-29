# WO-D104 rout pathing completed — RE-ARMED STOP report

Execution date: 2026-07-29  
Starting HEAD: `413450e28e6c1ec2886417e03418ad51a71fddb0`  
Registered seed range: `18760600–18760649`  
Completed seeds: `18760600–18760644` (45 full-day runs)  
Partial stop seed: `18760645` through tick 1607 / minute 803.5  
Unstarted seeds: `18760646–18760649`  
Scenario-content stream: `ba288f09` before and throughout measurement  
Status: **implemented candidate; RE-ARMED STOP fired on the sixth seed above 60; no commit or push**

## Summary

WO-D104's three ruled changes are implemented:

1. a failed safety-corridor search preserves an unconsumed path and leaves
   `blockedReason` unset while that path remains live;
2. the interdiction callback exempts points no farther than the unchanged
   `enemyInterdictionRadiusMeters` from the routing unit's search-time origin;
3. failure records `routLastPathAttemptTick` and cannot retry before the
   unchanged `pursuitRepathCadenceTicks`; success still sets the existing
   `routSafetyPath` latch.

The four named D104 tests passed 4/4 before campaign measurement. The baseline
seed produced the registered preview: Reno A/G/M killed 36, all three alive
east, C/E/F/I/L destroyed, co-d alive, coalition killed 56, and zero Ford A
choke events.

The campaign then hit the binding stop. Five completed seeds had Reno killed
above 60: 18760618=70, 18760623=97, 18760626=92, 18760638=90, and
18760640=88. At minute 803.5 of seed 18760645, Reno killed reached 67, making
that the sixth registered seed above 60. The campaign process stopped on that
tick. No seed reached 100 before the stop.

No later simulation, tuning, oracle refresh, probe, score, envelope, or quartet
command was run.

## Frozen-material review

Read before implementation:

- `docs/WO-D104.md` in full;
- the complete WO-D104 PR-24–PR-30 entry, registered observations, and
  RE-ARMED STOP in `docs/PREDICTIONS.md`;
- D91, the D91 RIDER, D92–D99, and D101–D104 in
  `docs/IMPLEMENTATION_HISTORY.md`; D100 remains reserved and has no ruling row.

The frozen work order controlled implementation and stop behavior.

## Implementation

### Failure preserves live movement

On an unreachable corridor result:

- `pathIndex < path.length`: `path` and `pathIndex` are retained and
  `blockedReason` is cleared;
- no unconsumed path: the consumed/empty path is normalized to `[]`/`0` and
  the existing no-corridor `blockedReason` is set.

Failure no longer sets `routSafetyPath`.

### Origin-bubble exemption

`routeToSafety` captures the unit's position at search time. A candidate path
point inside or on the existing `enemyInterdictionRadiusMeters` origin bubble
is not tested against enemy interdiction. Beyond the bubble, the prior enemy
set, distance predicate, radius, and pathfinding semantics are unchanged.

### D92 retry cadence and success latch

The additive optional runtime field `routLastPathAttemptTick` follows the
existing `lastPathAttemptTick` pattern. It is written only when the overall
corridor search fails. A later routed update returns before pathfinding until:

```text
state.tick - routLastPathAttemptTick >= pursuitRepathCadenceTicks
```

A successful search still installs its safety path and sets
`routSafetyPath = true`. Rally and `rout-reintegrated` code was not changed.

Files changed before this report:

```text
engine/src/morale.ts
engine/src/state.ts
engine/tests/d104-rout.test.ts
.claude/d104-campaign.mjs
```

The campaign script is a measurement instrument. It runs registered seeds in
ascending order and checks both stop branches after every tick.

## Four named tests

Names:

- `rout-keeps-live-path`
- `rout-origin-exemption`
- `rout-retry-cadence`
- `success-latch-preserved`

Pre-stop command:

```text
npx vitest run engine/tests/d104-rout.test.ts --fileParallelism=false
```

Verbatim relevant output:

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ engine/tests/d104-rout.test.ts (4 tests) 25ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  17:33:20
   Duration  743ms (transform 204ms, setup 0ms, collect 265ms, tests 25ms, environment 0ms, prepare 148ms)
```

The pre-stop engine compilation `npx tsc -p tsconfig.engine.json` exited 0
with no stdout.

## RE-ARMED STOP

Binding rule:

```text
halt if Reno A/G/M killed exceeds 60 in more than 5/50 registered seeds,
or if any registered seed reaches killed >= 100
```

Stop result:

| Branch | Result |
|---|---|
| More than five seeds above 60 | **FIRED** at seed 18760645, tick 1607 / minute 803.5 |
| Any seed killed ≥100 | Did not fire before halt; observed maximum was 97 |
| Above-60 seeds | 18760618=70; 18760623=97; 18760626=92; 18760638=90; 18760640=88; 18760645=67 at stop |
| Later work | Halted; seeds 18760646–18760649 never started |

Seed 18760645 is partial. Its end-of-day survival, coalition losses, wing
roster, and final killed count are unknown and are never treated as completed
observations.

No observed result caused a code, parameter, assertion, or content change.

## PR-24–PR-30 verdicts as they fell

| Prediction | Verdict | Evidence available at STOP |
|---|---|---|
| PR-24 — no annihilation | **NOT JUDGED** | 0/45 complete seeds and the partial stop seed reached 100; maximum complete result 97. Four seeds were unstarted and the stop seed was incomplete. |
| PR-25 — median above 26.09 | **HIT, locked before STOP** | The 46 observed killed values have only one value ≤26.09. Even if all four unstarted seeds were arbitrarily low, the final N=50 median lower bound is 43.5, above 26.09. |
| PR-26 — retreat crosses | **NOT JUDGED** | 41/45 complete seeds ended with at least two A/G/M alive east; the four failures were 18760623, 18760626, 18760638, 18760640. All 45 complete seeds had a ford episode overlapping 767.5–776.5. The end-day clause was not locked when the stop fired. |
| PR-27 — wing roster returns | **HIT, locked before STOP** | Baseline seed: C/E/F/I/L DESTROYED and co-d alive. Complete wing destruction with co-d alive occurred in exactly 25 of the first 45 complete seeds, so the ≥25/50 threshold was already irreversible. |
| PR-28 — coalition stays sourced | **HIT, locked before STOP** | Coalition killed median among 45 complete seeds was 66. With five unfinished/unstarted outcomes placed arbitrarily, the possible N=50 median is bounded 64.5–68.5, wholly inside 36–136. |
| PR-29 — ford choke stays empty | **HIT, locked before STOP** | Zero choke events in all 45 complete seeds; the ≥45/50 zero-event requirement was already met. The partial seed also had zero through the stop tick. |
| PR-30 — same stream | **HIT** | Every measured sim reported `ba288f09`; scenario JSON is byte-identical to HEAD. |

PR-28's registered non-scored band-destruction expectation produced the named
finding: coalition band destruction occurred in **16/45 complete seeds**, well
above the registered “more than 5/50” threshold. This is not a stop and did not
alter implementation.

## Full primary distribution through STOP

`Ford window` means at least one A/G/M ford episode overlaps minutes
767.5–776.5. `Wing` requires C/E/F/I/L destroyed and co-d alive. Seed
18760645 is partial.

| Seed | Status | Reno killed | A/G/M alive east | Ford window | Wing | Coalition killed | Destroyed bands | Choke events |
|---:|---|---:|---:|---|---|---:|---|---:|
| 18760600 | full | 56 | 3 | yes | complete | 62 | — | 0 |
| 18760601 | full | 52 | 2 | yes | incomplete | 64 | — | 0 |
| 18760602 | full | 27 | 3 | yes | complete | 99 | crow-king-band | 0 |
| 18760603 | full | 55 | 2 | yes | incomplete | 171 | hunkpapa-pool | 0 |
| 18760604 | full | 35 | 3 | yes | complete | 104 | crow-king-band | 0 |
| 18760605 | full | 58 | 2 | yes | incomplete | 84 | — | 0 |
| 18760606 | full | 56 | 2 | yes | complete | 174 | hunkpapa-pool | 0 |
| 18760607 | full | 46 | 3 | yes | complete | 39 | — | 0 |
| 18760608 | full | 37 | 3 | yes | incomplete | 65 | — | 0 |
| 18760609 | full | 51 | 2 | yes | incomplete | 28 | — | 0 |
| 18760610 | full | 39 | 3 | yes | complete | 67 | — | 0 |
| 18760611 | full | 54 | 2 | yes | complete | 160 | hunkpapa-pool | 0 |
| 18760612 | full | 44 | 3 | yes | complete | 39 | — | 0 |
| 18760613 | full | 39 | 3 | yes | complete | 48 | — | 0 |
| 18760614 | full | 56 | 2 | yes | incomplete | 31 | — | 0 |
| 18760615 | full | 43 | 3 | yes | incomplete | 103 | crow-king-band | 0 |
| 18760616 | full | 39 | 3 | yes | complete | 66 | — | 0 |
| 18760617 | full | 39 | 3 | yes | complete | 93 | — | 0 |
| 18760618 | full | 70 | 2 | yes | incomplete | 133 | crow-king-band | 0 |
| 18760619 | full | 53 | 2 | yes | incomplete | 64 | — | 0 |
| 18760620 | full | 59 | 2 | yes | incomplete | 65 | — | 0 |
| 18760621 | full | 43 | 3 | yes | complete | 54 | — | 0 |
| 18760622 | full | 37 | 3 | yes | incomplete | 61 | lwm-band | 0 |
| 18760623 | full | 97 | 1 | yes | incomplete | 53 | — | 0 |
| 18760624 | full | 36 | 3 | yes | complete | 171 | hunkpapa-pool, crow-king-band | 0 |
| 18760625 | full | 36 | 3 | yes | complete | 56 | — | 0 |
| 18760626 | full | 92 | 1 | yes | incomplete | 73 | — | 0 |
| 18760627 | full | 45 | 3 | yes | complete | 94 | crow-king-band | 0 |
| 18760628 | full | 39 | 3 | yes | incomplete | 60 | lwm-band | 0 |
| 18760629 | full | 53 | 2 | yes | complete | 35 | — | 0 |
| 18760630 | full | 37 | 3 | yes | complete | 87 | — | 0 |
| 18760631 | full | 54 | 2 | yes | complete | 178 | hunkpapa-pool | 0 |
| 18760632 | full | 38 | 3 | yes | incomplete | 24 | — | 0 |
| 18760633 | full | 52 | 2 | yes | incomplete | 43 | — | 0 |
| 18760634 | full | 42 | 3 | yes | complete | 226 | hunkpapa-pool, lwm-band | 0 |
| 18760635 | full | 24 | 3 | yes | incomplete | 40 | lwm-band | 0 |
| 18760636 | full | 35 | 3 | yes | complete | 155 | gall-band, crow-king-band | 0 |
| 18760637 | full | 36 | 3 | yes | complete | 47 | — | 0 |
| 18760638 | full | 90 | 1 | yes | incomplete | 30 | — | 0 |
| 18760639 | full | 58 | 2 | yes | incomplete | 70 | — | 0 |
| 18760640 | full | 88 | 1 | yes | incomplete | 67 | — | 0 |
| 18760641 | full | 32 | 3 | yes | complete | 71 | crow-king-band | 0 |
| 18760642 | full | 32 | 3 | yes | complete | 86 | — | 0 |
| 18760643 | full | 46 | 3 | yes | complete | 79 | — | 0 |
| 18760644 | full | 53 | 2 | yes | complete | 39 | — | 0 |
| 18760645 | partial through 803.5 | 67 | 1 currently | yes | incomplete currently | 6 currently | — currently | 0 through stop |

Complete-seed Reno killed sorted distribution:

```text
24,27,32,32,35,35,36,36,36,37,37,37,38,39,39,39,39,39,42,43,43,44,45,
46,46,51,52,52,53,53,53,54,54,55,56,56,56,58,58,59,70,88,90,92,97
```

Complete-seed Reno killed: median 45; mean 48.96; range 24–97. Including
the partial stop observation: median 45.5; mean 49.35; range 24–97.

Complete-seed coalition killed sorted distribution:

```text
24,28,30,31,35,39,39,39,40,43,47,48,53,54,56,60,61,62,64,64,65,65,66,
67,67,70,71,73,79,84,86,87,93,94,99,103,104,133,155,160,171,171,174,178,226
```

Complete-seed coalition killed: median 66; mean 81.29; range 24–226.

Complete-wing seeds:

```text
18760600, 18760602, 18760604, 18760606, 18760607, 18760610, 18760611,
18760612, 18760613, 18760616, 18760617, 18760621, 18760624, 18760625,
18760627, 18760629, 18760630, 18760631, 18760634, 18760636, 18760637,
18760641, 18760642, 18760643, 18760644
```

## Per-seed crossing, sanctuary, and ford episodes

Company cells are `crossing minute / killed at crossing / post-crossing
killed / final state`. The final state is full-day except seed 18760645.

| Seed | co-a | co-g | co-m | Ford episodes (A; G; M) |
|---:|---|---|---|---|
| 18760600 | 756.5/9/6/alive | 769.5/9/0/alive | 787.5/32/0/alive | 700–704.5,771.5–776.5; 770–774.5; 788–792.5 |
| 18760601 | 756.5/7/0/alive | 769/8/0/alive | 767/33/4/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760602 | 756.5/4/5/alive | 769.5/7/1/alive | 767/10/0/alive | 700–704.5,771.5–776.5; 770–774.5; 767.5–772 |
| 18760603 | 756.5/6/0/alive | 769.5/9/0/alive | 766.5/24/16/destroyed | 700–704.5,771.5–776.5; 770–774.5; 767–771.5 |
| 18760604 | 756.5/6/0/alive | 769/6/0/alive | 767/22/1/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760605 | 756.5/7/1/alive | 769/11/1/alive | 767/32/6/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760606 | 756.5/10/0/alive | 769.5/8/0/alive | 770/29/9/destroyed | 700–704.5,771.5–776.5; 770–774.5; 766–771 |
| 18760607 | 756.5/6/0/alive | 769.5/8/0/alive | 766/32/0/alive | 700–704.5,771.5–776.5; 770–774.5; 766.5–771 |
| 18760608 | 756.5/8/0/alive | 769/9/0/alive | 767/20/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760609 | 756.5/4/1/alive | 769/7/1/alive | 760/20/18/destroyed | 700–704.5,771.5–776.5; 769.5–774; 760.5–765 |
| 18760610 | 756.5/7/0/alive | 769/11/0/alive | 767/21/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760611 | 756.5/5/0/alive | 769.5/9/0/alive | 766.5/27/13/destroyed | 700–704.5,771.5–776.5; 770–774.5; 767–771.5 |
| 18760612 | 756.5/7/0/alive | 769.5/11/0/alive | 766/25/1/alive | 700–704.5,771.5–776.5; 770–774.5; 766.5–771 |
| 18760613 | 756.5/7/0/alive | 769/8/0/alive | 767/22/2/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760614 | 756.5/6/0/alive | 769/9/0/alive | 767/26/15/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760615 | 756.5/6/0/alive | 769/10/0/alive | 767/27/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760616 | 756.5/4/2/alive | 769/11/0/alive | 767/22/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760617 | 756.5/6/0/alive | 769/7/0/alive | 767/26/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760618 | 756.5/6/1/alive | 769.5/14/6/alive | 765/27/16/destroyed | 700–704.5,771.5–776.5; 770–774.5; 761–766 |
| 18760619 | 756.5/6/1/alive | 769/6/0/alive | 767/24/16/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760620 | 756.5/6/1/alive | 769.5/12/0/alive | 766/27/13/destroyed | 700–704.5,771.5–776.5; 770–774.5; 766.5–771 |
| 18760621 | 756.5/7/0/alive | 769.5/8/1/alive | 765.5/26/1/alive | 700–704.5,771.5–776.5; 770–774.5; 766–770.5 |
| 18760622 | 756.5/4/0/alive | 769/6/4/alive | 766.5/23/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767–771.5 |
| 18760623 | 756.5/7/3/alive | 769.5/9/35/destroyed | 762/23/20/destroyed | 700–704.5,771.5–776.5; 770–774.5; 762.5–767 |
| 18760624 | 756.5/8/0/alive | 769.5/5/0/alive | 775.5/23/0/alive | 700–704.5,771.5–776.5; 770–774.5; 776–780.5 |
| 18760625 | 756.5/7/0/alive | 769/9/0/alive | 767/20/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760626 | 756.5/6/0/alive | 782.5/11/32/destroyed | 764/24/19/destroyed | 700–704.5,771.5–776.5; 823.5–828; 760–765 |
| 18760627 | 756.5/5/1/alive | 769/9/2/alive | 767/28/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760628 | 756.5/9/0/alive | 769/7/2/alive | 766.5/21/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767–771.5 |
| 18760629 | 756.5/5/1/alive | 769/6/1/alive | 767/30/10/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760630 | 756.5/3/0/alive | 769/10/0/alive | 767/24/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760631 | 764/9/0/alive | 762.5/9/0/alive | 771.5/23/13/destroyed | 700–704.5,779.5–784; 777.5–782; 772–776.5 |
| 18760632 | 756.5/6/0/alive | 769.5/10/2/alive | 762/20/0/alive | 700–704.5,771.5–776.5; 770–774.5; 762.5–767 |
| 18760633 | 756.5/10/0/alive | 769/4/0/alive | 767/22/16/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760634 | 756.5/6/1/alive | 769.5/3/0/alive | 790.5/32/0/alive | 700–704.5,771.5–776.5; 770–774.5; 791–795.5 |
| 18760635 | 756.5/8/0/alive | 769.5/3/0/alive | 767/13/0/alive | 700–704.5,771.5–776.5; 770–774.5; 767.5–772 |
| 18760636 | 756.5/4/0/alive | 769.5/3/5/alive | 765.5/23/0/alive | 700–704.5,771.5–776.5; 770–774.5; 766–770.5 |
| 18760637 | 756.5/7/1/alive | 769.5/2/0/alive | 787/25/1/alive | 700–704.5,771.5–776.5; 770–774.5; 787.5–792 |
| 18760638 | 756.5/7/1/alive | 769.5/9/33/destroyed | 760.5/19/21/destroyed | 700–704.5,771.5–776.5; 770–774.5; 761–765.5 |
| 18760639 | 756.5/8/0/alive | 769/10/1/alive | 767/30/9/destroyed | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760640 | 756.5/9/0/alive | 782.5/8/32/destroyed | 764/20/19/destroyed | 700–704.5,771.5–776.5; 822–826.5; 760–765 |
| 18760641 | 756.5/6/0/alive | 769/8/0/alive | 767/18/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760642 | 756.5/6/0/alive | 769/7/0/alive | 767/18/1/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760643 | 756.5/5/0/alive | 769/8/1/alive | 767/32/0/alive | 700–704.5,771.5–776.5; 769.5–774; 767.5–772 |
| 18760644 | 756.5/9/0/alive | 769.5/7/0/alive | 765.5/24/13/destroyed | 700–704.5,771.5–776.5; 770–774.5; 766–770.5 |
| 18760645 | 756.5/7/0/alive at stop | 782.5/9/10/alive west at stop | 764/22/19/destroyed | 700–704.5,771.5–776.5; none through stop; 760–765 |

Crossing summary for the 45 complete seeds:

| Company | Crossings observed | Crossing minute median (range) | Survived day | Survivor post-crossing zero | Survivor post-crossing positive |
|---|---:|---:|---:|---:|---:|
| co-a | 45 | 756.5 (756.5–764) | 45 | 31 | 14 |
| co-g | 45 | 769 (762.5–782.5) | 41 | 28 | 13 |
| co-m | 45 | 767 (760–790.5) | 26 | 20 | 6 |

Thus the registered “post-crossing casualties expected 0” observation did
not hold uniformly: 33 of 112 surviving-company crossing observations had
positive post-crossing killed.

## PR-3 readings held apart

The extraction records first `BROKEN` and first actual movement during
`ROUTED` separately. Counts over 45 complete seeds:

| Company | Any first BROKEN recorded | Any routed movement recorded |
|---|---:|---:|
| co-a | 3 | 0 |
| co-g | 4 | 28 |
| co-m | 43 | 37 |

Per-seed cells are `first BROKEN / first routed movement`; `—` means absent.
These are raw times, not a post-hoc classification into an undefined numerical
“valley window.”

| Seed | co-a | co-g | co-m |
|---:|---:|---:|---:|
| 18760600 | —/— | —/— | 748.5/755 |
| 18760601 | —/— | —/768.5 | 748.5/755 |
| 18760602 | —/— | —/— | 760.5/— |
| 18760603 | —/— | —/— | 744.5/747 |
| 18760604 | —/— | —/768.5 | 747.5/755 |
| 18760605 | —/— | 768/768.5 | 748.5/755 |
| 18760606 | —/— | —/— | 745/746.5 |
| 18760607 | —/— | —/— | 746.5/749.5 |
| 18760608 | —/— | —/768.5 | 746/— |
| 18760609 | —/— | —/768.5 | 746.5/756 |
| 18760610 | —/— | —/768.5 | 745.5/— |
| 18760611 | —/— | —/— | 744.5/747 |
| 18760612 | —/— | —/— | 744.5/749.5 |
| 18760613 | 855.5/— | —/768.5 | 746.5/771.5 |
| 18760614 | —/— | —/768.5 | 747/753 |
| 18760615 | —/— | —/768.5 | 746/755 |
| 18760616 | —/— | —/768.5 | 746/— |
| 18760617 | —/— | —/768.5 | 747.5/753.5 |
| 18760618 | 831.5/— | —/769 | —/745.5 |
| 18760619 | —/— | —/768.5 | 746/755 |
| 18760620 | —/— | —/— | 747/751 |
| 18760621 | —/— | —/— | 746/748 |
| 18760622 | —/— | —/768.5 | 745.5/747 |
| 18760623 | 829/— | —/769 | 747.5/755 |
| 18760624 | —/— | —/— | 746/752 |
| 18760625 | —/— | —/768.5 | 746/— |
| 18760626 | —/— | 792/769 | 746/755.5 |
| 18760627 | —/— | —/768.5 | 747/753 |
| 18760628 | —/— | —/768.5 | 746.5/752 |
| 18760629 | —/— | —/768.5 | 747/751.5 |
| 18760630 | —/— | —/768.5 | 747.5/755 |
| 18760631 | —/— | —/— | 745.5/747 |
| 18760632 | —/— | —/— | 745/755 |
| 18760633 | —/— | —/763.5 | 747/753.5 |
| 18760634 | —/— | —/— | 748/755 |
| 18760635 | —/— | —/— | —/— |
| 18760636 | —/— | —/— | 746/749 |
| 18760637 | —/— | —/— | 746.5/753.5 |
| 18760638 | —/— | —/769 | 749.5/757 |
| 18760639 | —/— | 767.5/768.5 | 748.5/755 |
| 18760640 | —/— | 792/769 | 746/755.5 |
| 18760641 | —/— | —/768.5 | 745.5/— |
| 18760642 | —/— | —/768.5 | 746.5/— |
| 18760643 | —/— | —/768.5 | 748/753.5 |
| 18760644 | —/— | —/— | 747/750 |
| 18760645 | —/— | 792/769 | 746/755.5 |

The partial seed's times precede the stop and are factual, but it is excluded
from the complete-seed counts.

## Baseline F4 and mobile-routing mechanism

Seed 18760625:

| Unit | End state | First ROUTED | First routed live path | First routed movement |
|---|---|---:|---:|---:|
| co-c | DESTROYED | 842.0 | 842.0 | 842.5 |
| co-e | DESTROYED | 859.5 | 859.5 | 860.0 |
| co-f | DESTROYED | 859.0 | 859.0 | 859.5 |
| co-i | DESTROYED | 842.0 | 842.0 | 842.5 |
| co-l | DESTROYED | 842.0 | 842.0 | 842.5 |
| co-d | alive | — | — | — |

This is the unchanged F4 roster and the registered 842–880 mobile-routing
cluster. The F4 assertion file was not edited. The F4 test itself was not run
after implementation because the campaign stop preceded the quartet.

## Hilltop outcome data

The “ordered trio” extraction uses the existing ordered attacker bands
`gall-band`, `crazy-horse-band`, and `lwm-band`, alongside `hunkpapa-pool`.
Statistics cover 45 complete seeds:

| Unit | Killed median / mean / range | Wounded median / mean / range | Casualties median / mean / range | Destroyed |
|---|---|---|---|---:|
| hunkpapa-pool | 11 / 25.42 / 0–172 | 23 / 32.38 / 3–113 | 35 / 57.80 / 4–230 | 6 |
| gall-band | 15 / 16.27 / 1–114 | 38 / 34.98 / 2–50 | 55 / 51.24 / 6–150 | 1 |
| crazy-horse-band | 1 / 1.16 / 0–8 | 3 / 3.16 / 0–14 | 4 / 4.31 / 0–22 | 0 |
| lwm-band | 3 / 5.51 / 0–25 | 9 / 13.36 / 0–49 | 13 / 18.87 / 0–60 | 4 |

Full killed distributions in seed order 18760600–18760644:

```text
hunkpapa-pool:
12,11,9,121,21,20,120,1,12,7,8,117,1,1,3,18,10,21,20,11,9,3,5,4,120,
5,15,11,3,6,11,134,0,15,172,2,5,3,5,17,13,7,20,11,4

gall-band:
9,16,8,18,24,19,22,17,10,4,13,10,9,26,11,18,16,13,13,15,13,18,18,4,20,
15,10,15,12,12,23,16,6,1,17,7,114,11,3,22,12,18,20,17,17

crazy-horse-band:
2,2,8,1,1,3,2,0,3,1,0,0,1,1,2,1,1,0,0,2,0,2,1,0,0,1,0,1,2,2,1,2,0,0,
1,2,1,0,1,2,0,1,1,0,0

lwm-band:
16,4,12,0,0,5,2,0,4,0,11,0,2,2,4,0,9,4,9,4,17,1,22,6,2,0,13,0,25,1,
1,2,3,10,18,11,0,0,3,2,12,6,4,1,0
```

Baseline seed detail:

| Unit | Killed | Wounded | Casualties | End |
|---|---:|---:|---:|---|
| hunkpapa-pool | 5 | 9 | 14 | alive |
| gall-band | 15 | 38 | 53 | alive |
| crazy-horse-band | 1 | 3 | 4 | alive |
| lwm-band | 0 | 2 | 2 | alive |

## Composite and envelope audit

The exact before-state is the accepted D103 candidate and is unchanged at
starting HEAD except for frozen prediction/work-order documents. Its committed
measurement is:

| Instrument | Before | After |
|---|---:|---:|
| Seed 18760625 composite | 54.64% | **not run — STOP** |
| C1 | 50.00% FAIL | **not run — STOP** |
| C2 | 77.78% FAIL | **not run — STOP** |
| C3 | 15.38% FAIL | **not run — STOP** |
| C4 | 92.31% PASS | **not run — STOP** |
| N=50 envelope median | 46.30% | **not run — STOP** |
| N=50 envelope mean | 48.56% | **not run — STOP** |
| N=50 envelope min–max | 36.05%–60.19% | **not run — STOP** |

No after composite or envelope was permitted once the stop fired.

## Behavioral oracles

No oracle was refreshed.

The pre-fix tree's registered combat pins remain in their test assertions:

```text
full-state hash: 4d5ed785
findPath calls: 171
```

WO-D104 changes combat behavior and adds a serialized failure timestamp, so
those pins are expected to require a documented behavioral refresh. The full
suite was deliberately not run after the stop, and neither value was measured
or edited. The no-combat F3/V1-class pins were likewise not run or changed;
no no-combat movement is claimed.

## Preserved probes

Not run after the candidate build:

```text
node .claude/d98-crossing-test.mjs 18760643
node .claude/d98-crossing-test.mjs 18760625
node .claude/cohesion-asymmetry-probe.mjs 18760625
```

The stop fired during the registered campaign before the proof sequence
reached these probes. Running them afterward would have violated the explicit
no-further-simulation clause. Therefore zero camp-defence crossings and the
cohesion probe are not re-claimed for this candidate.

## Quartet — verbatim status

The final quartet did not run. There is no quartet stdout to reproduce.

### `npm run typecheck`

```text
NOT RUN — binding RE-ARMED STOP
```

The narrower pre-stop engine compile exited 0 as recorded above.

### `npm run lint`

```text
NOT RUN — binding RE-ARMED STOP
```

### `npm test`

```text
NOT RUN — binding RE-ARMED STOP
```

The only pre-stop test command was the four-test D104 focused run reproduced
verbatim above.

### `npm run build`

```text
NOT RUN — binding RE-ARMED STOP
```

`dist/` was compiled pre-stop with `npx tsc -p tsconfig.engine.json`.
`npm run terrain` was never run.

## `[CAL]` and protected-content byte audit

The protected configuration and scenario files are identical to starting
HEAD:

| File | HEAD blob | Working blob | Identical |
|---|---|---|---|
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` | same | yes |
| `engine/src/movement.ts` | `c4550a476e51e70abe6dddb9ead9b35f42fac508` | same | yes |
| `engine/src/spotting.ts` | `8c889c2adec0f345c73bf2e7e65b1afbe9614654` | same | yes |
| Scenario JSON | `11db18bd727ae93a4460b146a7300b3f34909241` | same | yes |
| `docs/PREDICTIONS.md` | `a9459a310ec6a60f6dac5c237076b40e5d0c52c5` | same | yes |
| `docs/WO-D104.md` | `58af78e41f7a4fef66c8772a60ed994bfec2147a` | same | yes |

Scenario JSON SHA-256:

```text
E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8
```

Specific protected results:

- `enemyInterdictionRadiusMeters` remains 250;
- `pursuitRepathCadenceTicks` remains 10;
- `moraleSuppressionDrain` and every other existing combat `[CAL]` remain
  byte-identical;
- movement speeds and formation multipliers remain byte-identical;
- scenario stream remains `ba288f09`;
- the protected `insideFord: false` statement formerly referenced as
  `state.ts:241` is unchanged in content and semantics; the additive runtime
  type field above it shifts its physical line to 242;
- `startPursuit` and its callers were not changed;
- D93/D96/D98/D99/D102/D103 code was not changed;
- the F4 assertion roster was not changed;
- no prior codex report was changed;
- `git diff --check` reported no whitespace error before report creation.

## AMBIGUITIES

`TODO-AMBIGUOUS(D104-report)`: the frozen registered observation says to
distinguish `BROKEN` “in the valley window,” but the frozen D104 text does not
give numerical bounds for that window. No bounds were invented. The report
provides every raw first-BROKEN time and every first-routed-movement time so an
adjudicated window can classify them later.

No implementation ambiguity required a `TODO-AMBIGUOUS` code marker:

- the live-path predicate is specified exactly as
  `pathIndex < path.length`;
- both radii/cadence consumers are existing config fields;
- the existing `lastPathAttemptTick` pattern determines the timestamp form;
- success-latch and rally/reintegration branches remain unchanged.

## DEVIATIONS

- **Binding RE-ARMED STOP:** seed 18760645 became the sixth seed above 60 at
  minute 803.5 with killed 67. Work stopped at 45 full seeds plus one partial
  seed.
- Seeds 18760646–18760649 were not run. PR-24 and PR-26 remain NOT JUDGED.
- The final quartet, post-fix full suite, after composite, after envelope,
  preserved crossing probes, cohesion probe, and behavioral-oracle refresh
  were not run because each would continue work after the stop.
- The stop-seed row is partial and excluded from every complete-day aggregate.
- The before composite/envelope values are the exact accepted D103 baseline
  measurements rather than a duplicated pre-fix rerun.
- No calibration change, scenario change, F4 assertion edit, result-driven
  tuning, commit, or push occurred.
