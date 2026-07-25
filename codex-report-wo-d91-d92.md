# WO-D91 / D92 camp-defence reconstruction report

Execution date: 2026-07-25  
Starting HEAD: `51ef4c1d50df78aa8c9de96e39c0fd0f6791fe6b`  
Baseline seed: `18760625`  
Envelope seeds: `18760600..18760649` (N=50)

## Summary

WO-D91 is implemented under the binding D92 ambiguity rulings:

- blocked camp-defence paths retry on the existing
  `pursuitRepathCadenceTicks` value (10 ticks); successful/static feature goals
  are not clock-reselected;
- threat commitment uses the D92 250 m switching margin;
- features within the existing `campDefenseRadiusMeters` are ranked by distance
  to the committed threat, then feature id; feature commitment changes only
  with threat switch or unreachability;
- the terrain loader deterministically derives three 8-connected TIMBER
  features from 3,158 substrate cells (cluster sizes 984, 10, 2,164);
- scenario data declares only D90's Bench and the O6 turnout-delay Estimate
  `10 / 15 / 20` minutes, MEDIUM confidence;
- movement atomically recovers a stranded start to the exact nearest
  finite-cost grid cell and refuses to place a unit on a non-finite-cost cell.

No `[CAL]` value was changed. No terrain pipeline was run. No coordinate from
`docs/research/O6 Standoff Research.md` was transcribed. No commit or push was
made.

The outcome gates are intentionally reported as they fell. The quartet is red:
the old F4 complete-wing-destruction gate fails because E/F survive, and F6
exceeds its deterministic expansion ceiling. The stock D80 envelope also exits
red because no seed satisfies its frozen typical-seed selection criteria.

Reno's battalion is not annihilated, so the mandatory overshoot STOP did not
fire.

## Quartet (verbatim)

### Typecheck

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit 0.

### Lint

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit 0.

### Tests

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ❯ engine/tests/m4a-gates.test.ts (6 tests | 2 failed) 53493ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  20339ms
   ✓ M4-A F1-F6 closeout gates > F2 conservation — integer casualties/strength/ammo and conserved strength 6ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  8285ms
   × M4-A F1-F6 closeout gates > F4 full-stack baseline — wing dies, hill and village hold, couriers deliver 7ms
     → co-e: expected undefined to be 'DESTROYED' // Object.is equality
   ✓ M4-A F1-F6 closeout gates > F5 informational scorecard is coherent — scout doctrine and D74 predictions hold 0ms
   × M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational 17258ms
     → expected 11797456 to be less than or equal to 11100000

 ✓ engine/tests/gates.test.ts (6 tests) 37537ms
 ✓ tests/m3b-gates.test.ts (3 tests) 34850ms
 ✓ engine/tests/m3a-gates.test.ts (6 tests) 30789ms
 ✓ engine/tests/d91-gates.test.ts (4 tests) 9207ms
 ✓ tests/terrain-gates.test.ts (5 tests) 157ms
 ✓ tests/data-integrity.test.ts (13 tests) 126ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 114ms
 ✓ engine/tests/unit.test.ts (3 tests) 85ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 22ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 19ms
 ✓ engine/tests/variants.test.ts (3 tests) 13ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 7ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 5ms

 Test Files  1 failed | 13 passed (14)
      Tests  2 failed | 78 passed (80)
   Duration  172.41s

 FAIL  engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F4 full-stack baseline — wing dies, hill and village hold, couriers deliver
AssertionError: co-e: expected undefined to be 'DESTROYED' // Object.is equality

 FAIL  engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
AssertionError: expected 11797456 to be less than or equal to 11100000
```

Exit 1. Test count is 80: the original 76 plus four named D91/D92 tests.
The deterministic path-call oracle is 168 after the four structural D91/D92
queries; the pre-existing expansion ceiling was not raised.

### Build

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

## Per-change implementation notes

### 1. Re-path

`campDefense` now records `lastPathAttemptTick`, its committed feature, and its
static goal. Only a blocked unit retries, and only when
`state.tick - lastPathAttemptTick >= combat.pursuitRepathCadenceTicks`.
Successful feature paths are not periodically recomputed. A threat switch
causes immediate feature re-selection. `camp-defense-activated` is emitted once
per activation episode and not on retry or threat switch.

### 2. Stranded-unit guard

`findPath` recovers an impassable start to the exact nearest finite-cost grid
cell with stable cell-index tie-breaking. Movement performs that recovery
atomically before movement and checks the destination sample before committing
each step. `MovementSample` now exposes the actual grid cost, making the
finite-cost invariant direct rather than inferred from a cover code.

### 3. Feature goal

The D47 `(camp + threat) / 2` midpoint is removed from engine behavior.
Scenario-authored point features and loader-derived substrate clusters share
one runtime feature representation. Eligible features have some cell/point
within the unchanged 3,000 m camp-defence radius of the defended camp. Ranking
uses the point nearest the committed threat and then feature id. No camp-side
constraint, standoff number, or ratchet was added.

At baseline seed 18760625, the three unordered defenders first select the Bench
against Company A at minute 602, then hand off to Company C at minute 608 and
select `substrate-timber-0001`. Subsequent changes are event-driven threat
switches, not cadence-driven goal motion.

### 4. Threat commitment

The current believed threat/camp pair is retained until another spotted threat
is more than 250 m nearer. Destroyed or off-field threats release the
commitment. Stable id ordering resolves all remaining distance ties, including
the coincident A/G/M geometry.

### 5. Turnout delay

Scenario data carries the MEDIUM-confidence `10 / 15 / 20` minute Estimate.
The baseline uses `best = 15` minutes, converted through the scenario tick
length. The alarm retains its first tick and provisional threat commitment
through the turnout interval.

## New tests named

All are in `engine/tests/d91-gates.test.ts`:

1. `D92 derives deterministic TIMBER feature clusters and scenario data declares only the Bench`
2. `D91 delays turnout, commits threat and feature, switches at 250 m, and retries blocked paths at 10 ticks`
3. `D91 recovers an impassable path start and movement refuses an impassable destination cell`
4. `D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick`

All four pass. The fourth test runs baseline seed 18760625 tick-by-tick through
tick 2160 and checks every unit at every tick.

## Gate results

| Gate | Result | Evidence |
|---|---|---|
| Typecheck | PASS | exit 0 |
| Lint | PASS | exit 0 |
| D91/D92 focused gates | PASS | 4/4 |
| Permanent non-finite occupancy invariant | PASS | every unit, every tick 0–2160 |
| Determinism | PASS | same-seed hash `c1d4d68d`; no-combat hashes remain seed-independent |
| F4 full-stack baseline | **FAIL** | C/I/L destroyed; E/F survive |
| F6 work bound | **FAIL** | 11,797,456 expansions > 11,100,000 ceiling |
| Build | PASS | exit 0 |
| Reno annihilation STOP | NOT TRIGGERED | baseline A/G/M retain 45/44/34 men |

The F4 and F6 failures were not tuned away and their gate thresholds were not
weakened.

## Before/after scorecard

`npm run score` completed and rewrote the committed scorecard as required:

```text
[score] scenario=little-bighorn-1876 seed=18760625 variants=baseline tier=baseline
[score] composite=52.07% gates=FAIL
[score] C1=50.00% FAIL
[score] C2=44.44% FAIL
[score] C3=38.46% FAIL
[score] C4=92.31% PASS
[score] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\calibration-scorecard.md
```

| Component | Before | After | Delta |
|---|---:|---:|---:|
| C1 Checkpoints | 50.00% | 50.00% | 0.00 pp |
| C2 Casualties | 77.78% | 44.44% | -33.34 pp |
| C3 End states | 38.46% | 38.46% | 0.00 pp |
| C4 Observations | 92.31% | 92.31% | 0.00 pp |
| Composite | 60.41% | 52.07% | -8.34 pp |

No post-result tuning was performed.

## Four probe outputs

All four preserved scripts were run from the repository root against the new
`dist/`.

### `.claude/h1-probe.mjs`

Contact mass against Reno:

| minute | ≤500 m mass |
|---:|---:|
| 660 | 0 |
| 670 | 0 |
| 680 | 0 |
| 690 | 0 |
| 700 | 0 |
| 710 | 0 |
| 720 | 515 |
| 730 | 964 |
| 740 | 963 |
| 750 | 458 |
| 760 | 458 |
| 770 | 458 |
| 780 | 458 |
| 790 | 0 |

Maximum sampled ≤500 m mass is **964 at minute 730**. Six bands move:
`hunkpapa-pool`, `gall-band`, `crow-king-band`, `minneconjou-pool`,
`sans-arc-pool`, and `blackfeet-santee-pool`. Four never move by minute 790:
`oglala-pool`, `crazy-horse-band`, `cheyenne-pool`, and `lwm-band`.

The newly activated unordered bands first move at minute 602.5. Eighteen
Reno-versus-warrior engagements open: the three unordered bands against A/G/M
at minute 715, then hunkpapa/gall/crow-king against A/G/M at minute 724.

### `.claude/h1-diag.mjs`

The preserved script still labels and computes the retired midpoint for
diagnostic comparison. At minute 720 it reports all three active unordered
bands with finite starts (`cost=1.2308682203292847`), no blocked reason, and
camp commitment `hunkpapa-camp / co-g`. Cheyenne, Lame White Man, and Oglala
remain inactive at that minute.

### `.claude/h1-diag2.mjs`

The preserved activation table reports exactly three activation events:

```text
| minneconjou-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
| sans-arc-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
| blackfeet-santee-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
```

The displayed coordinate is that script's retired-midpoint diagnostic, not the
implemented feature goal. Runtime commitment at activation is
`scenario-bench`.

### `.claude/h1-diag3.mjs`

The preserved blocked-midpoint sample remains a RIVER cell:

```text
blocked midpoint local x,y = 8110 9690
sample: {"movementFactor":0,"cost":null,"coverKind":254,"cellKey":"core:274021"}
elevation: 951.7466492949291
```

JSON serializes the in-memory `Infinity` cost as `null`. This cell is no longer
a camp-defence goal.

### Required supplemental measurements

The preserved scripts do not calculate signed travel, so the D91 measurement
was repeated read-only over full-day tracks, classifying actual step length by
its projection toward the held static feature goal:

| Band | Forward | Backward | Unclassified |
|---|---:|---:|---:|
| sans-arc-pool | 8,086 m | 106 m | 0 m |
| blackfeet-santee-pool | 8,182 m | 106 m | 0 m |

The small backward total is route geometry around obstacles; the held feature
does not recede.

`minneconjou-pool` is not stranded:

| Tick / minute | Cost | Movement factor | Cover | Blocked | Path left | Feature |
|---|---:|---:|---:|---|---:|---|
| 1204 / 602 | 0.74895 | 0.65425 | 2 | no | 3 | `scenario-bench` |
| 1440 / 720 | 1.23087 | 0.81243 | 0 | no | 4 | `scenario-bench` |
| 2160 / 1080 | 1.00000 | 1.00000 | 0 | no | 0 | `scenario-bench` |

## Envelope summary

`npm run envelope` completed all 50 seeds, wrote
`reports/seed-envelope.md`, then exited 1:

```text
[envelope] order=1 criteria-sha256=507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad
[envelope] order=2 per-seed-generation-started N=50
[envelope] completed=50/50 seed=18760649 composite=57.63%
Error: Baseline criteria selected no typical seed; preserved diagnostic report at C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\seed-envelope.md
```

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 48.57% | 52.07% | 52.07% | 54.16% | 58.48% | 52.68% |
| C1 | 40.00% | 50.00% | 50.00% | 50.00% | 50.00% | 49.80% |
| C2 | 33.33% | 44.44% | 44.44% | 52.78% | 77.78% | 47.78% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 38.46% | 37.85% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

Complete wing destruction occurs in 10/50 seeds, at minutes 858.0–914.5.
No A/G/M ford-choke casualty appears. The stock selector finds zero eligible
typical candidates; its criteria were not changed.

## Pre-registered prediction verdicts

The D91-specific metrics were evaluated across the same frozen 50 seeds:

1. **HIT — 50/50.** ≤500 m contact mass exceeds 800 before minute 750 in every
   seed. First crossing is minute 718 or 726; per-seed maxima span 946–981.
2. **HIT — 50/50.** All three unordered defenders hand off unscripted to a
   Custer company in every seed, and A/G/M all finish alive within the existing
   250 m C3 holding radius in every seed.
3. **MISS — 0/50.** No seed has all A/G/M reach BROKEN; in fact none of A/G/M
   reaches BROKEN in any seed. No A/G/M ford-choke casualty occurs. Per D92,
   this is the pre-recorded finding for a separately ruled closing mechanism,
   not a knob; nothing was tuned.
4. **MISS LOW — 0/50 inside band; 0/50 annihilated.** Reno battalion killed
   span 6–20 and wounded span 0–6, versus aggregate sourced A/G/M bands
   19.24–26.09 killed and 19.24–26.09 wounded. Reno is under-hit, never
   annihilated. The overshoot STOP signal does not occur.

## AMBIGUITIES

None. D92 supplied every value/rule needed to resume the frozen work order.

## DEVIATIONS

- The preserved `codex-report-wo-d91.md` STOP report was not modified.
- `docs/IMPLEMENTATION_HISTORY.md` already contained the owner-appended D92
  change when work resumed; it was preserved and not authored by this
  implementation.
- The quartet is not green: F4 and F6 are reported red exactly as observed.
- The stock envelope command exits red after completing N=50 because no typical
  seed is eligible. Its diagnostic report is preserved.
- `reports/calibration-scorecard.md` and `reports/seed-envelope.md` were
  rewritten only by the explicitly required `npm run score` and
  `npm run envelope` commands.
