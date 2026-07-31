# WO-D107 close-action finishing — completed campaign report

Execution date: 2026-07-30  
Starting HEAD: `a501f06ccef26877579cc5ad21bd37dcd697398a`  
Registered seed range: `18760600–18760649`  
Completed seeds: `18760600–18760649` (50 full-day runs)  
Scenario-content stream: `ba288f09` before and throughout measurement  
Status: **implemented; N=50 completed; RE-ARMED STOP did not fire; no commit or push**

## Summary

WO-D107 is implemented as the frozen break-outcome extension. A defender that
was already `ROUTED` when its bout resolves is annihilated only when no
same-side, non-camp, `STEADY`, not-ended, non-withdrawn combat friendly is
within the existing `isolationRadiusMeters` (650 m). D105 first-break,
sheltered-break, repel, held, bout-latch, wounded conversion, and contact-break
semantics remain unchanged.

An annihilation first performs D105 wounded conversion and then mirrors D81:
the remaining `strengthCurrent` becomes killed, the unit ends `DESTROYED`,
strength fields and path are cleared, and casualties become `strengthTotal`.
The `melee-bout` event adds outcome `annihilation`, `terminalConverted` only on
that outcome, and `shelteredBy` only on already-routed catches suppressed by
the nearest eligible friendly.

The registered N=50 campaign completed without a stop:

- complete wing destruction with co-d alive: **35/50** (PR-45 HIT);
- Reno A/G/M killed: median **32**, mean **36.78**, range **18–68**;
- at least two A/G/M alive east: **50/50**;
- coalition killed median **70.5**, inside 36–136;
- 551 bouts: 400 break, 151 annihilation, 0 repel, 0 held;
- 0 annihilation-eligibility violations and 0 terminal-accounting residuals;
- all Ford A 250 m bout/annihilation extraction rows: **0 in every seed**;
- scenario stream stayed `ba288f09`.

PR-45 through PR-50 are **HIT**. The re-armed stop did not fire: four seeds
exceeded 60 (`18760603`, `18760623`, `18760632`, `18760644`), no seed reached
100, and the maximum was 68.

## Frozen-material review

Read in full before implementation:

- `docs/WO-D107.md`;
- the complete WO-D107 PR-45–PR-50 entry, registered observations, and
  RE-ARMED STOP in `docs/PREDICTIONS.md`;
- D91, the D91 RIDER, D92–D99, D101–D107 in
  `docs/IMPLEMENTATION_HISTORY.md`; D100 remains reserved.

The frozen work order controlled implementation, measurement, stop behavior,
and reporting.

## Implementation

Changed product/test files:

```text
engine/src/combat.ts
engine/src/events.ts
engine/tests/d107-annihilation.test.ts
engine/tests/m4a-gates.test.ts              (combat-oracle pins/comments only)
reports/calibration-scorecard.md            (required generated after-state)
reports/seed-envelope.md                    (required generated after-state)
```

Measurement artifacts added under `.claude/`:

```text
d107-campaign.mjs
d107-campaign-results.json
d107-campaign-progress.json
d107-campaign-rerun.stdout.txt
d107-campaign-rerun.stderr.txt
d107-oracle-probe.mjs
d107-envelope.stdout.txt
d107-envelope.stderr.txt
d107-npm-test.stdout.txt
d107-npm-test.stderr.txt
```

The campaign JSON is the exact event-level record for all 551 bouts, including
all 151 annihilations, 161 shelter suppressions, local positions, channel
sides, Ford A distances, conversions, and per-unit accounting.

A D107 annihilation can end a unit while another same-tick engagement still
references it. `resolveShock` therefore ignores an already-ended participant,
preventing a stale engagement from emitting a duplicate zero-strength terminal
conversion. This changes only a state created by the new D107 branch.

No scenario, `[CAL]`, prediction, prior report, D105 latch, D106 pursuit gate,
or F4 roster byte changed.

## Five named D107 tests

Command:

```text
npx vitest run engine/tests/d107-annihilation.test.ts --fileParallelism=false
```

Verbatim:

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 48ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  21:06:48
   Duration  1.49s (transform 465ms, setup 0ms, collect 598ms, tests 48ms, environment 0ms, prepare 298ms)
```

| Test | Result | Proof |
|---|---|---|
| `annihilation-on-isolated-catch` | pass | Routed isolated defender ends destroyed; wounded and terminal conversions, strength fields, casualties, path, and destruction event are exact |
| `no-annihilation-on-first-break` | pass | STEADY defender first breaks to ROUTED; no terminal field or destruction |
| `no-annihilation-when-sheltered` | pass | Eligible co-g at 180 m suppresses; event carries exact id, distance, and strength |
| `withdrawn-does-not-shelter` | pass | The same nearby co-g marked withdrawn does not suppress |
| `accounting-terminal-conversion` | pass | killed − fire − bout-converted − terminal-converted = 0 |

The focused D105/D106/D107 regression command passed 14/14 assertions before
the campaign.

## RE-ARMED STOP

Binding rule:

```text
halt if Reno A/G/M killed exceeds 60 in more than 5/50 registered seeds,
or if any registered seed reaches killed >= 100
```

| Branch | Result |
|---|---|
| More than five seeds above 60 | **Did not fire: 4/50** |
| Any seed killed ≥100 | **Did not fire: maximum 68** |
| Seeds above 60 | `18760603=63`, `18760623=61`, `18760632=68`, `18760644=66` |
| PR-47 implementation-error halt | **Did not fire: 0 eligibility, 0 accounting violations** |
| Campaign completion | **50/50 full-day seeds** |

**STOP STATUS: NOT FIRED.** No result caused tuning, threshold movement,
parameter change, scenario change, or behavioral repair.

## PR-45–PR-50 verdicts

| Prediction | Verdict | N=50 evidence |
|---|---|---|
| PR-45 — the wing completes | **HIT** | C/E/F/I/L destroyed with co-d alive in 35/50, threshold 30/50, baseline 9/50 |
| PR-46 — the valley holds | **HIT** | ≥2 A/G/M alive east in 50/50, threshold 45/50; killed median 32 <45 |
| PR-47 — audit legs | **HIT** | Every annihilation entered already ROUTED and isolated; zero first-break/sheltered annihilations; killed − fire − bout − terminal = 0 for every unit in every seed |
| PR-48 — coalition stays sourced | **HIT** | Coalition killed median 70.5, inside 36–136 |
| PR-49 — choke directional/reporting leg | **HIT** | All bouts/annihilations within 250 m reported per seed: 0 in every seed; catch locations reported below |
| PR-50 — same stream | **HIT** | `ba288f09` in 50/50; scenario directory byte-identical to starting HEAD |

## Full distributions

| Distribution | N | Min | P25 | Median | Upper median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Reno A/G/M killed | 50 | 18 | 28 | 32 | 32 | 42.25 | 68 | 36.78 |
| Coalition killed | 50 | 29 | 49 | 70.5 | 71 | 81 | 103 | 67.62 |
| Bouts per seed | 50 | 6 | 9 | 10 | 10 | 12 | 23 | 11.02 |
| Annihilations per seed | 50 | 1 | 2 | 3 | 3 | 4 | 5 | 3.02 |
| Composite | 50 | 44.59% | 56.83% | 57.63% | 57.63% | 60.14% | 63.18% | 57.28% |

Reno killed sorted:

```text
18,22,24,24,24,26,26,27,27,27,28,28,28,28,28,30,30,30,30,30,30,31,31,32,32,
32,33,33,35,36,36,36,36,37,37,39,40,43,43,43,47,51,56,58,59,60,61,63,66,68
```

Coalition killed sorted:

```text
29,33,34,39,39,40,45,46,48,48,48,48,49,49,53,57,60,62,63,64,64,65,66,69,70,
71,71,72,72,72,74,75,76,79,79,79,81,81,83,85,86,89,90,91,92,94,94,101,103,103
```

## Per-company completion, catches, and annihilations

Catch means an already-routed bout that either annihilated or emitted
`shelteredBy`. The D106 census bound was approximately 198 wing catches and
two Reno annihilation-eligible catches. D107's dynamic world produced 259 wing
catches and 47 Reno catches, of which 8 Reno catches annihilated. The increase
is the registered static-vs-behavioral gap: removing fragments changes later
catch sequences.

| Company | Destroyed seeds | Catches | Annihilations | Sheltered catches |
|---|---:|---:|---:|---:|
| co-c | 40/50 | 72 | 21 | 51 |
| co-e | 43/50 | 29 | 17 | 12 |
| co-f | 42/50 | 14 | 13 | 1 |
| co-i | 48/50 | 94 | 39 | 55 |
| co-l | 50/50 | 50 | 50 | 0 |
| **Wing total** | — | **259** | **140** | **119** |
| co-a | — | 2 | 2 | 0 |
| co-g | — | 0 | 0 | 0 |
| co-m | — | 45 | 6 | 39 |
| **Reno total** | — | **47** | **8** | **39** |
| co-d (other) | 3/50 | 6 | 3 | 3 |

The five wing companies were all destroyed in 38/50 seeds, but co-d was also
destroyed in seeds `18760601`, `18760603`, and `18760604`; PR-45's exact
co-d-alive completion is therefore 35/50.

## Bout, annihilation, suppression, and location tables

### Bout outcomes

| Outcome | Events | Share |
|---|---:|---:|
| Break | 400 | 72.60% |
| Annihilation | 151 | 27.40% |
| Repel | 0 | 0% |
| Held | 0 | 0% |
| **Total** | **551** | **100%** |

All 161 suppressions are a subset of the 400 break events. Repulse remains
0-for-N as registered.

### All bout targets and location ranges

Local x/y and Ford distances are meters. Ford distance is to the preserved
Ford A extraction center.

| Target | Bouts | Break | Annihilation | Suppression | Minute range | Side | Ford-distance range |
|---|---:|---:|---:|---:|---|---|---:|
| co-a | 4 | 2 | 2 | 0 | 763–773.5 | WEST | 2914.9–2954.7 |
| co-c | 158 | 137 | 21 | 51 | 842–938.5 | EAST/WEST | 2713.6–11917.2 |
| co-d | 9 | 6 | 3 | 3 | 892–964.5 | EAST/WEST | 2946.8–4420.3 |
| co-e | 43 | 26 | 17 | 12 | 854.5–939 | EAST | 4420.3–11917.2 |
| co-f | 17 | 4 | 13 | 1 | 865.5–917 | EAST | 4420.3–11917.2 |
| co-i | 144 | 105 | 39 | 55 | 842–863 | EAST | 7959.7–8815.1 |
| co-l | 100 | 50 | 50 | 0 | 842–842 | EAST | 7959.7 |
| co-m | 76 | 70 | 6 | 39 | 749.5–802 | EAST/WEST | 2702.2–3722.4 |

### Annihilation locations

| Target | Events | Minute range | Side | Ford-distance range | Local x range | Local y range |
|---|---:|---|---|---:|---:|---:|
| co-a | 2 | 763–773.5 | WEST | 2914.9–2954.7 | 7126.9–7718.5 | 10974.0–11009.8 |
| co-c | 21 | 870–938.5 | EAST/WEST | 2713.6–11917.2 | 4107.1–7409.9 | 10785.6–20005.6 |
| co-d | 3 | 892–964.5 | EAST | 4420.3 | 7162.2 | 12514.8 |
| co-e | 17 | 854.5–939 | EAST | 4420.3–11917.2 | 4627.9–7162.2 | 12514.8–20005.6 |
| co-f | 13 | 882.5–917 | EAST | 4420.3–11917.2 | 6624.1–7162.2 | 12514.8–20005.6 |
| co-i | 39 | 853.5–863 | EAST | 8815.1 | 4627.9 | 16571.8 |
| co-l | 50 | 842 | EAST | 7959.7 | 5348.7 | 15871.7 |
| co-m | 6 | 783.5 | WEST | 2876.1 | 7564.8 | 10925.6 |

The eight Reno annihilations, individually:

| Seed | Minute | Defender | Attacker | Terminal converted | Side | Ford distance | Local position x/y |
|---:|---:|---|---|---:|---|---:|---|
| 18760603 | 783.5 | co-m | blackfeet-santee-pool | 21 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760604 | 783.5 | co-m | blackfeet-santee-pool | 28 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760611 | 783.5 | co-m | blackfeet-santee-pool | 20 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760617 | 783.5 | co-m | blackfeet-santee-pool | 25 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760623 | 783.5 | co-m | blackfeet-santee-pool | 25 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760630 | 783.5 | co-m | blackfeet-santee-pool | 28 | WEST | 2876.1 | 7564.8 / 10925.6 |
| 18760632 | 773.5 | co-a | crow-king-band | 28 | WEST | 2954.7 | 7718.5 / 10974.0 |
| 18760644 | 763.0 | co-a | blackfeet-santee-pool | 36 | WEST | 2914.9 | 7126.9 / 11009.8 |

Seed `18760632` reaches the disclosed expected 68 killed. The additional
dynamic co-m catches explain the static-vs-behavioral gap without moving the
median or firing the stop.

### Shelter suppressions

There are 161 suppression events across 143 unique
seed/minute/defender cases.

| Shelterer | Events | Min strength | Median strength | Min ratio | Max distance |
|---|---:|---:|---:|---:|---:|
| co-i | 50 | 34 | 37 | 85.0% | 0.0 |
| co-l | 50 | 33 | 37 | 82.5% | 0.0 |
| co-a | 25 | 33 | 37 | 73.3% | 636.7 |
| co-g | 16 | 35 | 39 | 77.8% | 167.0 |
| co-d | 13 | 37 | 42 | 82.2% | 412.3 |
| co-e | 5 | 29 | 31 | 72.5% | 0.0 |
| co-h | 2 | 45 | 45 | 100% | 611.1 |

Overall shelterer distribution:

| Metric | Min | Median | Max |
|---|---:|---:|---:|
| StrengthCurrent | 29 | 37 | 45 |
| Strength ratio | 72.5% | 90.0% | 100% |
| Distance meters | 0.0 | 0.0 | 636.7 |

The minimum remains strength 29. The exact 29/40 ratio is 72.5%, which rounds
to the thirty-eighth measurement's registered 73% floor; it is not materially
below that floor. The formed-question reopen signal therefore does not fire.

Suppression target locations:

| Target | Events | Minute range | Side | Ford-distance range | Local x range | Local y range |
|---|---:|---|---|---:|---:|---:|
| co-c | 51 | 842–893 | EAST | 4052.7–7959.7 | 5348.7–6575.2 | 12120.7–15871.7 |
| co-d | 3 | 909 | WEST | 2946.8 | 7720.0 | 10965.6 |
| co-e | 12 | 880–898 | EAST | 4420.3 | 7162.2 | 12514.8 |
| co-f | 1 | 893.5 | EAST | 4749.0 | 6912.6 | 12843.0 |
| co-i | 55 | 842–850.5 | EAST | 7959.7–8815.1 | 4627.9–5348.7 | 15871.7–16571.8 |
| co-m | 39 | 754.5–802 | EAST/WEST | 2702.2–3722.4 | 6770.5–8339.7 | 10795.6–11817.9 |

### Ford A 250 m extraction

| Seed range | Bout events ≤250 m | Annihilations ≤250 m | Suppressions ≤250 m |
|---|---:|---:|---:|
| 18760600–18760649 | 0 | 0 | 0 |

Per-seed distribution is fifty zeros. PR-29's ammunition reading is not
superseded because the choke remains empty. The nearest catch-class event is
still more than 2.7 km from Ford A; the exact catch locations are reported in
the tables above and in the event JSON.

## Per-seed primary table

`Suppress` is routed-catch break events carrying `shelteredBy`.

| Seed | Reno K | East alive | Coalition K | Complete wing | Bouts | Break | Annih | Suppress | Repel | Composite |
|---:|---:|---:|---:|---|---:|---:|---:|---:|---:|---:|
| 18760600 | 35 | 3 | 103 | no | 14 | 12 | 2 | 7 | 0 | 53.78% |
| 18760601 | 31 | 3 | 76 | no | 18 | 14 | 4 | 8 | 0 | 56.56% |
| 18760602 | 18 | 3 | 63 | yes | 8 | 6 | 2 | 2 | 0 | 60.41% |
| 18760603 | 63 | 2 | 48 | no | 17 | 13 | 4 | 5 | 0 | 56.56% |
| 18760604 | 60 | 2 | 53 | no | 21 | 17 | 4 | 7 | 0 | 56.56% |
| 18760605 | 43 | 3 | 79 | yes | 14 | 11 | 3 | 5 | 0 | 59.34% |
| 18760606 | 47 | 3 | 101 | yes | 14 | 11 | 3 | 6 | 0 | 58.48% |
| 18760607 | 33 | 3 | 71 | no | 10 | 7 | 3 | 3 | 0 | 54.85% |
| 18760608 | 31 | 3 | 90 | yes | 9 | 6 | 3 | 2 | 0 | 57.63% |
| 18760609 | 22 | 3 | 79 | yes | 11 | 7 | 4 | 2 | 0 | 60.41% |
| 18760610 | 37 | 3 | 48 | yes | 11 | 7 | 4 | 3 | 0 | 63.18% |
| 18760611 | 56 | 2 | 57 | no | 17 | 12 | 5 | 4 | 0 | 58.48% |
| 18760612 | 36 | 3 | 74 | yes | 7 | 5 | 2 | 2 | 0 | 57.63% |
| 18760613 | 28 | 3 | 94 | no | 9 | 7 | 2 | 2 | 0 | 52.93% |
| 18760614 | 32 | 3 | 40 | yes | 10 | 6 | 4 | 2 | 0 | 60.41% |
| 18760615 | 32 | 3 | 49 | yes | 9 | 5 | 4 | 2 | 0 | 60.41% |
| 18760616 | 30 | 3 | 34 | yes | 11 | 7 | 4 | 2 | 0 | 60.41% |
| 18760617 | 59 | 2 | 69 | no | 16 | 12 | 4 | 4 | 0 | 58.48% |
| 18760618 | 51 | 3 | 94 | no | 9 | 8 | 1 | 4 | 0 | 46.52% |
| 18760619 | 28 | 3 | 66 | yes | 9 | 6 | 3 | 2 | 0 | 57.63% |
| 18760620 | 36 | 3 | 62 | no | 6 | 5 | 1 | 2 | 0 | 52.07% |
| 18760621 | 26 | 3 | 81 | yes | 11 | 7 | 4 | 2 | 0 | 60.41% |
| 18760622 | 43 | 3 | 89 | yes | 17 | 12 | 5 | 6 | 0 | 58.48% |
| 18760623 | 61 | 2 | 64 | yes | 17 | 12 | 5 | 4 | 0 | 58.48% |
| 18760624 | 30 | 3 | 33 | yes | 8 | 6 | 2 | 2 | 0 | 60.41% |
| 18760625 | 30 | 3 | 72 | yes | 11 | 7 | 4 | 2 | 0 | 57.63% |
| 18760626 | 30 | 3 | 75 | yes | 11 | 7 | 4 | 2 | 0 | 57.63% |
| 18760627 | 33 | 3 | 86 | yes | 10 | 6 | 4 | 2 | 0 | 57.63% |
| 18760628 | 36 | 3 | 103 | yes | 8 | 5 | 3 | 2 | 0 | 60.41% |
| 18760629 | 27 | 3 | 60 | no | 6 | 5 | 1 | 2 | 0 | 54.85% |
| 18760630 | 58 | 2 | 70 | no | 23 | 20 | 3 | 11 | 0 | 53.78% |
| 18760631 | 40 | 3 | 46 | yes | 9 | 7 | 2 | 2 | 0 | 58.48% |
| 18760632 | 68 | 2 | 48 | yes | 10 | 7 | 3 | 2 | 0 | 59.34% |
| 18760633 | 28 | 3 | 91 | yes | 10 | 7 | 3 | 3 | 0 | 57.63% |
| 18760634 | 28 | 3 | 79 | yes | 9 | 6 | 3 | 2 | 0 | 57.63% |
| 18760635 | 24 | 3 | 48 | yes | 11 | 8 | 3 | 3 | 0 | 60.41% |
| 18760636 | 30 | 3 | 72 | no | 7 | 5 | 2 | 2 | 0 | 52.07% |
| 18760637 | 26 | 3 | 65 | yes | 8 | 6 | 2 | 2 | 0 | 57.63% |
| 18760638 | 27 | 3 | 71 | yes | 11 | 7 | 4 | 2 | 0 | 57.63% |
| 18760639 | 37 | 3 | 64 | no | 13 | 12 | 1 | 6 | 0 | 47.37% |
| 18760640 | 39 | 3 | 92 | yes | 8 | 5 | 3 | 2 | 0 | 57.63% |
| 18760641 | 32 | 3 | 49 | yes | 10 | 7 | 3 | 3 | 0 | 60.41% |
| 18760642 | 24 | 3 | 72 | yes | 8 | 6 | 2 | 2 | 0 | 57.63% |
| 18760643 | 43 | 3 | 81 | yes | 6 | 5 | 1 | 2 | 0 | 57.63% |
| 18760644 | 66 | 2 | 85 | yes | 12 | 7 | 5 | 2 | 0 | 58.48% |
| 18760645 | 36 | 3 | 39 | yes | 9 | 6 | 3 | 3 | 0 | 60.41% |
| 18760646 | 27 | 3 | 45 | yes | 9 | 6 | 3 | 2 | 0 | 58.48% |
| 18760647 | 30 | 3 | 29 | no | 12 | 10 | 2 | 6 | 0 | 44.59% |
| 18760648 | 24 | 3 | 83 | yes | 9 | 6 | 3 | 2 | 0 | 57.63% |
| 18760649 | 28 | 3 | 39 | yes | 8 | 6 | 2 | 2 | 0 | 60.41% |

## PR-47 audit detail

The event audit replays bout order within each tick, which is necessary because
one attacker can first-break a unit and another can catch that now-routed unit
later in the same resolution pass.

| Audit | Population | Violations |
|---|---:|---:|
| Annihilation defender ROUTED on entry | 151 events | 0 |
| Annihilation had no eligible friendly within 650 m | 151 events | 0 |
| First-break annihilation | 400 non-annihilation break events checked | 0 |
| Annihilation carried `shelteredBy` | 151 events | 0 |
| Suppressed routed catch lacked/mismatched shelter event | 161 events | 0 |
| killed − fire-killed − bout-converted − terminal-converted | every unit, 50 seeds | 0 nonzero residuals |

`terminalConverted` sums only D107 destruction conversion. `convertedWounded`
retains D105 meaning. No terminal conversion was hidden in the bout-converted
column.

## Before/after score and envelope

### Baseline-seed score (`18760625`)

| Metric | D106 before | D107 after |
|---|---:|---:|
| Composite | 57.63% | 57.63% |
| C1 | 50.00% | 50.00% |
| C2 | 66.67% | 66.67% |
| C3 | 38.46% | 38.46% |
| C4 | 92.31% | 92.31% |
| US killed / wounded | 207 / 27 | 225 / 7 |
| Coalition killed / wounded | 90 / 206 | 72 / 212 |

The composite is unchanged because the component buckets are unchanged even
though their casualty actuals moved.

### N=50 envelope

| Metric | D106 before | D107 after |
|---|---:|---:|
| Composite min | 44.59% | 44.59% |
| Composite P25 | 53.14% | 56.83% |
| Composite median | 54.85% | 57.63% |
| Composite P75 | 57.63% | 60.14% |
| Composite max | 60.41% | 63.18% |
| Composite mean | 55.27% | 57.28% |
| Raw five-company wing destruction | 9/50 | 38/50 |
| Exact PR-45 wing completion (co-d alive) | 9/50 | 35/50 |
| Typical seed | none | `18760612` |
| Eligible typical candidates | 0 | 7 |

Criteria SHA-256 remains
`507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad`.
The generated reports are `reports/calibration-scorecard.md` and
`reports/seed-envelope.md`.

## F4 and behavioral oracles

F4 passed in the focused M4-A gate and in the full suite. The immutable roster
remains:

```text
destroyed: co-c, co-e, co-f, co-i, co-l
alive:     co-d
```

Only the authorized combat behavioral pins moved:

| Oracle | D106 before | D107 after | Cause |
|---|---:|---:|---|
| Full-state hash | `38f6ce32` | `baafb3c9` | D107 terminally removes isolated caught fragments |
| Whole-create path calls | 155 | 148 | Ended fragments no longer create later path work |
| M4-A run-only path calls | 153 | 146 | Same cause under the gate's post-`createSim` reset protocol |

No-combat before/after is exact:

| Tick | Before | After |
|---:|---|---|
| 1 | `baadad58` | `baadad58` |
| 360 | `46f01a7a` | `46f01a7a` |
| 1080 | `49bc6012` | `49bc6012` |
| 2160 | `b36d9fa9` | `b36d9fa9` |

No-combat RNG draws remain zero. There is no no-combat oracle refresh.

## Protected-content and `[CAL]` audit

| Protected item | Starting blob/hash | Final | Result |
|---|---|---|---|
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` | same | byte-identical |
| `scenario.json` | `11db18bd727ae93a4460b146a7300b3f34909241` | same | byte-identical |
| scenario README | `dee0cd99f12b1872e0cc23e78387c87500d0c47f` | same | byte-identical |
| `docs/PREDICTIONS.md` | `c291f34ed9e775cc8d7ffe65f2c442223d1cc271` | same | byte-identical |
| Scenario FNV-1a stream | `ba288f09` | `ba288f09` | byte-identical |
| Prior `codex-report-*.md` files | starting HEAD | no diff | byte-identical |
| F4 roster source lines | starting HEAD | no diff | byte-identical |

Consumed `[CAL]` values remain:

```text
meleeRangeMeters: 25
isolationRadiusMeters: 650
chargeBreakMargin: 1.1
chargeRepelMargin: 0.8
```

`git diff --exit-code HEAD` over `combat-config.ts`, the scenario directory,
`docs/PREDICTIONS.md`, and all prior codex reports exited 0.

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

Exit 0. `.claude/` remains excluded for the accepted D106 rationale: it holds
preserved measurement programs/logs, not product code, and post-preservation
lint edits would alter evidence bytes.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=18055.5ms timings=14715.7,18055.5,18478.0 pathfind={"calls":146,"expandedNodes":12560251,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 103571ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  34756ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  16892ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  33003ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"},"sameB":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"},"different":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"}}

 ✓ engine/tests/gates.test.ts (6 tests) 88645ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  15579ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  28961ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 58992ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  41293ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=472.35ms baseline=8003.06ms sweep=6901.14ms spottingOverhead=-9.34%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=30 orders=26 activations=3 leaderDeaths=1

 ✓ tests/m3b-gates.test.ts (3 tests) 64367ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 27719ms
   ✓ D91/D92 camp-defence reconstruction gates > D92 derives deterministic TIMBER feature clusters and scenario data declares only the Bench  394ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  27202ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 338ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 273ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

 ✓ tests/data-integrity.test.ts (13 tests) 226ms
 ✓ engine/tests/unit.test.ts (3 tests) 128ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 75ms
 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 47ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 47ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 26ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 38ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 28ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 32ms
 ✓ engine/tests/variants.test.ts (3 tests) 20ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 11ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 8ms

 Test Files  19 passed (19)
      Tests  110 passed (110)
     Errors  1 error
   Start at  20:56:53
   Duration  359.03s (transform 1.17s, setup 0ms, collect 3.07s, tests 344.59s, environment 7ms, prepare 3.59s)

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
```

The process exited 1 because of the same post-run Vitest worker-RPC
`onTaskUpdate` timeout documented in the accepted D106 report. All 19 files
and all 110 assertions passed. The assertion result is green; the process exit
is not relabeled green.

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

## AMBIGUITIES

None. No `TODO-AMBIGUOUS` was added. The repository-wide pre-existing count
remains 38.

## DEVIATIONS

One preliminary measurement attempt was deliberately discarded after seed
`18760600`: its audit shadow used previous-tick morale and therefore
misclassified legitimate same-tick first-break/second-catch sequences. That
attempt also exposed the stale-engagement duplicate terminal event described
in Implementation. The audit was corrected to replay event order, the
already-ended guard was added, focused tests remained green, and the
registered campaign was restarted from `18760600`. No casualty, completion,
or prediction result from the discarded attempt was used, and no number,
parameter, threshold, or scenario byte changed.

The only remaining process-level deviation is the known Vitest worker-RPC
timeout after 110/110 assertions passed. No other deviation from the frozen
work order occurred.
