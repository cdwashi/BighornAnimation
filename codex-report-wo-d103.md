# WO-D103 hostile-act alarm and attack-speed response — RE-ARMED STOP report

Execution date: 2026-07-29  
Starting HEAD: `6ac09527d1c68df966d827b69f3b11ceee822300`  
Registered seed first measured: `18760625`  
Registered seed range: `18760600–18760649` (N=50; campaign halted at N=1)  
Scenario-content stream: `ba288f09` before and after  
Status: **implemented candidate; RE-ARMED STOP fired at Reno A/G/M killed 109; halted for adjudication; no commit or push**

## Summary

The frozen D103 candidate implements only the two ruled behavioral changes:

1. awareness inside `campDefenseRadiusMeters` no longer forms
   `campDefenseAlert`; a spotted eligible threat must occupy a ford cell and
   its committed movement path must continue toward the defended camp;
2. `activate()` assigns an existing `CAVALRY_GALLOP` speed class to mounted
   responders and preserves `ON_FOOT` for dismounted responders.

The camp-ward predicate is determined entirely by existing machinery. It
accepts the existing `insideFord` flag or a believed-position ford-cell sample,
then compares the threat path's next committed waypoint with its believed
camp distance. A strictly closer next waypoint is camp-ward. An outbound next
waypoint is not. The known-bad channel-side classifier near the channel
polyline's southern terminus is never consulted.

The four named mechanism tests pass 4/4. Behavioral oracles were refreshed for
the expected D103 stream change and their focused gate files pass 12/12.

The first registered post-fix seed measured, `18760625`, reached **109 Reno
A/G/M killed**. This meets the live annihilation-class threshold
`killed >= 100`, so the RE-ARMED STOP fired immediately. The remaining 49
seeds, after score/envelope, preserved probes, and final quartet were not run.
Nothing was tuned or altered in response.

## Frozen-material review

Read before implementation:

- `docs/WO-D103.md` in full;
- the complete WO-D103 PR-19–PR-23 entry, registered observations, and
  RE-ARMED STOP in `docs/PREDICTIONS.md`;
- D91, the D91 RIDER, and D92–D103 in
  `docs/IMPLEMENTATION_HISTORY.md` (D100 remains the ledger's reserved row).

The frozen work order controlled all implementation and stop decisions.

## Implementation

### T3 hostile-act alert gate

`engine/src/camp-defense.ts` now selects the nearest spotted candidate that
satisfies all existing eligibility rules and a D103 ford commitment:

- hostile non-camp unit;
- non-`irregular-scout` tactics profile;
- believed spotted;
- within the unchanged `campDefenseRadiusMeters` of a camp;
- currently `insideFord` or believed to occupy a terrain cell with a ford
  crossing penalty;
- next committed path waypoint is strictly closer to the defended camp than
  the believed threat position.

The ford-commitment filter applies only when a new `campDefenseAlert` forms.
After the alert, existing D91/D92 threat selection and switching, D93 release,
D96 closing, and D98 defended-side movement remain unchanged.

No channel-side classification was added to the alert gate. No movement
history field, direction number, tolerance, radius, or other parameter was
invented.

### Mounted response speed

`activate()` changed:

```text
mounted:    CAVALRY_WALK -> CAVALRY_GALLOP
dismounted: ON_FOOT     -> ON_FOOT
```

No speed value changed. `switchThreat()` and D96's existing charge transition
were not altered.

## New tests named

The focused D103 file section contains:

- `no-alarm-on-approach: a spotted threat inside the radius but never ford-committed raises no alert`
- `alarm-on-camp-ward-ford-commitment`
- `no-alarm-on-outbound-crossing`
- `gallop-response-speed: activate uses CAVALRY_GALLOP for a mounted responder`

The existing D91/D93/D96/D98/D99 synthetic tests now declare their ford
commitment precondition explicitly. Focused result:

```text
✓ engine/tests/d91-gates.test.ts (12 tests) 11849ms

Test Files  1 passed (1)
     Tests  12 passed (12)
```

The file contains eight preserved gates plus the four new D103 gates.

## RE-ARMED STOP

The binding rule is:

```text
halt if Reno A/G/M killed > 40 in more than 5/50 registered seeds,
or if any registered seed reaches killed >= 100
```

The first registered seed measured produced:

| Seed | First alert | First turnout | First live A/G/M line | Reno A/G/M killed | Stop |
|---:|---:|---:|---:|---:|---|
| 18760625 | 704.0 | 719.0 | 725.5 | **109** | **FIRED: killed >= 100** |

The threshold fired on the second branch without needing a distribution. Work
halted at N=1. The >40-in-more-than-5/50 branch was not evaluated because the
annihilation branch already required adjudication.

No result-driven tuning occurred in either direction.

## Partial registered observations before STOP

These are N=1 data from seed `18760625`, not N=50 verdicts.

### Alert, turnout, line, and Ford timing

- all three idle defensive pools first formed alerts at minute **704.0**,
  against `co-a` for `hunkpapa-camp`;
- all three completed turnout at minute **719.0**;
- at turnout, normal post-alert threat selection had switched all three
  commitments to `co-g`, as allowed by D91/D92;
- a live dismounted A/G/M `SKIRMISH` formation first existed at minute
  **725.5**;
- `co-a` first occupied a ford cell at minute **700.0**;
- no alert event occurred before minute 675;
- no new Reno-threat alert occurred during the registered retreat-crossing
  window, minutes 767.5–776.5;
- `co-f` and `co-e` first occupied ford cells at minutes **798.0** and
  **800.0**, respectively;
- no E/F-triggered northern-camp alert formed in this seed, so there is no
  Ford B alert time to compare beyond the observed commitment times.

None of the three idle pools emitted a first feature-arrival event during the
full-day N=1 run. Therefore no pool-arrival median exists for this seed.

### Wing/F4 movement — data only

The registered seed's full-day wing result changed behaviorally:

| Unit | Total movement (m) | Final destroyed? |
|---|---:|---|
| co-c | 11,217.32 | yes |
| co-e | 11,672.00 | no |
| co-f | 12,182.19 | no |
| co-i | 12,218.81 | yes |
| co-l | 12,814.36 | yes |

This is the refreshed F4 oracle: C/I/L are destroyed; E/F survive. It is
reported as the registered wing observation, not scored or tuned.

### Ford-choke composition — data only

Using the envelope's preserved 250 m Ford A extraction, seed `18760625`
contains **no casualty-resolution target at the ford choke**. Composition is
empty for this N=1 observation.

### First live frontage readings — data only

For actual warrior-versus-Reno A/G/M fire resolutions:

| Metric | N / value |
|---|---:|
| Fire-resolution events | 1,691 |
| Effective range min | 0.00 m |
| Effective range P25 | 50.00 m |
| Effective range median | 73.35 m |
| Effective range P75 | 152.25 m |
| Effective range max | 496.84 m |
| Effective range mean | 114.14 m |
| Events where effective range differs from centroid | 375 |
| Endpoint-flank events | 16 |
| Angular-flank events | 242 |

The 375 changed-range events have effective-range median 81.46 m and mean
106.32 m. These are the first live frontage readings because a line now exists;
they are unscored N=1 observations.

## PR-19–PR-23 verdicts

All registered predictions are **NOT JUDGED** at N=50 because the binding stop
terminated the campaign at N=1. The partial observations are:

| Prediction | Verdict | N=1 evidence before STOP |
|---|---|---|
| PR-19 — sequence forms | **NOT JUDGED** | seed 18760625 forms a live line at 725.5 |
| PR-20 — hostile-act alarm | **NOT JUDGED** | first alert 704.0; turnout 719.0 |
| PR-21 — mass builds during line | **NOT JUDGED** | no first feature-arrival event for any of the three idle pools; no median |
| PR-22 — Reno killed vs band, both branches | **STOP / NOT JUDGED** | killed 109, above 19.24–26.09 and at the registered annihilation threshold; low branch cannot be assessed |
| PR-23 — no interception resurrection | **NOT JUDGED** | zero pre-675 alerts; zero retreat-window Reno alerts; E/F commitments 798.0/800.0; no northern alert |

PR-22's high branch is the adjudication result. The low branch remains
registered but unobserved; it is not relabeled null.

## Behavioral oracle refresh

D103 necessarily changes serialized behavior without changing scenario or
PRNG-stream bytes. The stale-oracle full-suite run identified four initial
failures:

```text
Test Files  2 failed | 13 passed (15)
     Tests  4 failed | 88 passed (92)
```

The four failures were:

1. V1 expected spotting alone to produce a no-combat camp activation;
2. F1 expected baseline full-state hash `edf884c0`, received `4d5ed785`;
3. F4 expected `co-e` destroyed, received `undefined`;
4. F6 expected full-state hash `edf884c0`, received `4d5ed785`.

The behavioral refreshes are:

| Oracle | Before | D103 candidate | Cause |
|---|---|---|---|
| no-combat spotting activation | present | absent | detection is not alarm; fixture has no ford commitment |
| full-combat state hash | `edf884c0` | `4d5ed785` | later alerts and gallop response |
| F4 wing roster | C/E/F/I/L destroyed | C/I/L destroyed; E/F survive | Ford B response timing changed |
| `findPath` call count | 205 | 171 | later camp-defence activation reduces full-day path work |

After refresh, the two affected focused files pass:

```text
Test Files  2 passed (2)
     Tests  12 passed (12)
Duration  93.22s
```

The F6 diagnostic was:

```text
[gate] F6 median=7204.7ms timings=7180.7,7204.7,8640.7
pathfind={"calls":171,"expandedNodes":9446764,"scratchAllocations":1,"heapGrowths":3}
```

These are behavioral oracle refreshes only. No scenario content or RNG stream
was reseeded.

## Quartet — verbatim status

The final quartet was not completed because the RE-ARMED STOP fired before
final verification.

### `npm run typecheck`

Not run as the final quartet command. The narrower engine compilation executed
before the stop and passed:

```text
> npx tsc -p tsconfig.engine.json
```

Exit 0.

### `npm run lint`

Not run; halted by the binding stop.

### `npm test`

One full stale-oracle run completed before the stop:

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

Test Files  2 failed | 13 passed (15)
     Tests  4 failed | 88 passed (92)
Duration  190.23s
```

Those four behavioral failures and their refreshes are documented above.
After refresh only the two affected files were rerun, passing 12/12. A final
full-suite run was not performed after the stop.

### `npm run build`

Not run; halted by the binding stop. `dist/` was compiled with
`npx tsc -p tsconfig.engine.json` before the registered seed measurement.

## Composite and envelope audit

The required before-state was measured before implementation:

| Instrument | Before |
|---|---:|
| Seed 18760625 composite | 54.64% |
| C1 | 50.00% FAIL |
| C2 | 77.78% FAIL |
| C3 | 15.38% FAIL |
| C4 | 92.31% PASS |
| N=50 envelope median | 46.30% |
| N=50 envelope mean | 48.56% |
| N=50 envelope min–max | 36.05%–60.19% |

The before `npm run score` command exited 0 and wrote
`reports/calibration-scorecard.md`.

The before envelope child completed all 50 seeds and wrote
`reports/seed-envelope.md`, preserving the known result:

```text
Selected typical baseline seed: NONE — criteria produced no eligible member
Median composite: 46.30%
Composite mean: 48.56%
```

The invoking shell timed out before returning the known CLI exit-1 diagnostic;
the completed report timestamp and full N=50 contents were inspected after the
child exited. A duplicate timed-out envelope child was terminated while the
single retained child completed.

No after score or envelope exists. Producing either would continue simulation
after the binding stop. The scenario stream nevertheless remains `ba288f09`.

## Preserved probes

Not run after the candidate build because the RE-ARMED STOP fired first:

- `.claude/h1-probe.mjs`
- `.claude/h1-diag.mjs`
- `.claude/h1-diag2.mjs`
- `.claude/h1-diag3.mjs`
- `.claude/cohesion-asymmetry-probe.mjs 18760625`
- `.claude/d98-crossing-test.mjs 18760643`
- `.claude/d98-crossing-test.mjs 18760625`

Consequently the required post-candidate zero camp-defence crossing probe
verdict is not claimed.

## `[CAL]` and protected-content audit

Only these tracked files differ before this report:

```text
engine/src/camp-defense.ts
engine/tests/d91-gates.test.ts
engine/tests/m3a-gates.test.ts
engine/tests/m4a-gates.test.ts
```

All files containing the protected existing `[CAL]` tables are byte-identical
to HEAD. Representative Git blobs:

| Protected file | HEAD and working-tree blob |
|---|---|
| `engine/src/spotting.ts` | `8c889c2adec0f345c73bf2e7e65b1afbe9614654` |
| `engine/src/movement.ts` | `c4550a476e51e70abe6dddb9ead9b35f42fac508` |
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` |
| `engine/src/morale.ts` | `56b1efc323a3ceeaf82cffbe420d5cc3b15adab2` |
| `engine/src/state.ts` | `b70e51eb03adf79109caa682398919985201fea8` |

Specific protected results:

- `campDefenseRadiusMeters` remains 3,000 and remains the candidate
  eligibility radius; it no longer constitutes the alarm;
- every movement speed and formation multiplier is byte-identical;
- `moraleSuppressionDrain` is byte-identical;
- `state.ts:241` remains byte-identical;
- D93/D96/D98/D99/D102 source semantics are untouched beyond the authorized
  alert-gate behavior and mounted activation speed class;
- `git diff --check` reports no whitespace error.

Protected documents/content:

| File | Git blob | SHA-256 |
|---|---|---|
| Scenario JSON | `11db18bd727ae93a4460b146a7300b3f34909241` | `E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8` |
| `docs/PREDICTIONS.md` | `a997329354b54a4fd5316398a17d0346efa6cbd5` | `284AC1ED1A866F1E841848BC524F3FB8AC1151B08DD3F26535D093790DDF0E27` |

The scenario's stable content hash is `ba288f09` before and after. No scenario
byte, prediction byte, prior codex report, or frozen work-order byte changed.
`npm run terrain` was never run.

## AMBIGUITIES

No implementation ambiguity required `TODO-AMBIGUOUS`.

- Ford commitment is directly represented by `insideFord` and terrain
  ford-cell occupancy.
- Camp-ward direction is directly represented by the committed movement path's
  next waypoint. Comparing its camp distance with the believed position
  distinguishes inbound from outbound crossings without a new number or the
  southern channel-side classifier.
- “Has been inside” needs no additional latch for a new alarm: the existing
  multi-tick ford hold exposes occupancy long enough for the spotting cadence
  and the alert itself is already the persistent latch.

The unresolved matter is adjudicative rather than implementational: the
candidate reaches annihilation-class Reno loss despite forming the intended
line.

## DEVIATIONS

- **Binding RE-ARMED STOP:** seed `18760625` produced Reno A/G/M killed 109.
  The N=50 campaign stopped at N=1.
- PR-19–PR-23 distributions and final verdicts were not produced. All are
  explicitly NOT JUDGED except PR-22's fired stop branch.
- The after composite, after envelope median/mean, final quartet, and preserved
  probes were not run because they would continue work after the stop.
- The only full-suite run preceded behavioral-oracle refresh and therefore
  reports 88 passing / 4 expected stale-oracle failures. The affected focused
  files pass 12/12 after refresh, but no post-refresh full-suite result is
  claimed.
- The before envelope shell timed out while its retained child completed and
  wrote the full N=50 report; no final parent exit code was captured.
- No calibration change, scenario change, result-driven tuning, commit, or
  push occurred.
