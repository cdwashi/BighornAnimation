# WO-D91 camp-defence reconstruction — STOP report

Execution date: 2026-07-25  
Starting HEAD: `51ef4c1d50df78aa8c9de96e39c0fd0f6791fe6b`  
Baseline seed: `18760625`

## Summary

WO-D91 was not implemented because the frozen order requires behavioral values
and a selection rule that it does not state. The work order's ambiguity
protocol says to flag `TODO-AMBIGUOUS`, STOP, and report rather than choose a
value silently.

No engine, scenario, schema, calibration, test, terrain, scorecard, or probe
file was changed. This report is the only new file. No commit or push was made.

## Quartet (verbatim)

Not run. The binding ambiguity STOP occurred before implementation, so there is
no WO-D91 candidate tree on which the verification quartet could be meaningful.

## Per-change implementation notes

1. **Re-path:** not implemented. `camp-defense.ts` currently calls
   `updateCampDefense` every tick, while spotting has an existing `[CAL]`
   `sweepCadenceTicks = 2`. WO-D91 says "per-cadence" but does not authorize a
   numeric camp-defence re-path cadence or state that the spotting `[CAL]`
   cadence must be reused.
2. **Stranded-unit guard:** not implemented because the coupled work order must
   ship in one round and another coupled item is ambiguous.
3. **Feature goal:** not implemented. D89 supplies the CoverKind-to-substrate
   mapping and D90 supplies the Bench coordinate, but neither states how a
   defender selects among eligible scenario cover features (for example,
   nearest to unit, camp, or threat; or a fixed band-to-feature assignment).
   Choosing a ranking would create unauthorised behavior.
4. **Threat commitment:** not implemented. WO-D91 requires an alternative to be
   nearer "by that margin," but supplies no switching-margin value, Estimate, or
   derivation.
5. **Turnout delay:** the ruled `10 / 15 / 20` minute MEDIUM-confidence Estimate
   is clear, but was not added because the coupled work order is stopped before
   implementation.

No `[CAL]` value was touched. No coordinate from
`docs/research/O6 Standoff Research.md` was transcribed.

## New tests named

None. In particular, the required full-day non-finite-cell invariant gate was
not added because implementation did not begin.

## Gate results

Not run after the ambiguity STOP.

## Before/after scorecard

The committed before scorecard remains:

| Component | Before |
|---|---:|
| C1 Checkpoints | 50.00% |
| C2 Casualties | 77.78% |
| C3 End states | 38.46% |
| C4 Observations | 92.31% |
| Composite | 60.41% |

No after score exists; `npm run score` was not run because no implementation
candidate exists. The committed scorecard was not rewritten.

## Envelope summary

Not run. There is no WO-D91 implementation to evaluate with the D80 N=50
envelope.

## Four probe outputs

Not run. There is no new build against which to re-run the four preserved
probes.

## Prediction verdicts

All four verdicts are **NOT JUDGED** because WO-D91 did not reach an
implementation or N=50 envelope:

1. Contact mass against Reno: not judged.
2. Northward handoff and C3 hold: not judged.
3. A/G/M BROKEN and ford repopulation: not judged.
4. Reno losses inside the sourced band / annihilation stop signal: not judged.

## AMBIGUITIES

- `TODO-AMBIGUOUS(WO-D91-REPATH-CADENCE)`: supply the numeric structural
  re-path cadence, or explicitly rule that camp defence reuses the existing
  spotting sweep cadence without changing its `[CAL]` value.
- `TODO-AMBIGUOUS(WO-D91-THREAT-SWITCH-MARGIN)`: supply the switching margin
  (and low/best/high Estimate if scenario-authored), including units.
- `TODO-AMBIGUOUS(WO-D91-FEATURE-SELECTION)`: supply the deterministic rule that
  selects a goal among the scenario-supplied, D89-mapped cover features,
  including how the D90 Bench participates.

## DEVIATIONS

- The quartet, after-score, four probes, N=50 envelope, tests, and prediction
  verdicts required by the proof section were not produced because the hard
  ambiguity rule requires STOP before inventing the missing values/rule.
- No other deviation.
