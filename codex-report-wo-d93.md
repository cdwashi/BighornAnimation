# WO-D93 release symmetry, F6 re-baseline, closing mechanism — STOP report

Execution date: 2026-07-25  
Starting HEAD: `d497af2fda488e6fdf7e07d74072d4f8d47cfbd0`  
Baseline seed: `18760625`

## Summary

WO-D93 was not implemented because D95 requires behavioral values and rules
that are not uniquely derivable from D93–D95, the existing structural
constants, or the sourced material. The frozen work order anticipates these
exact gaps—superiority ratio, evaluation radius, and behavioral expression of
closing—and requires `TODO-AMBIGUOUS`, STOP, and report rather than a silent
choice.

No engine, test, scenario, schema, calibration, terrain, scorecard, prediction,
probe, or prior WO-D91 report file was changed. This report is the only new
file. No commit or push was made.

## Frozen-material review

Read in full or as the complete named ledger rows:

- `docs/WO-D93.md`
- the WO-D93 entry and PR-1–PR-8 in `docs/PREDICTIONS.md`
- D91, the D91 RIDER, D92, D93, D94, and D95 in
  `docs/IMPLEMENTATION_HISTORY.md`

The stop follows the work order's own D92 precedent. The three changes are one
round; implementing D93/D94 while inventing or omitting D95 would not execute
the frozen scope.

## Quartet (verbatim)

Not run. The binding ambiguity STOP occurred before implementation, so there is
no WO-D93 candidate tree on which the verification quartet could be
meaningfully run.

## Per-change implementation notes

1. **D93 release symmetry:** clear but not implemented because the three-change
   round stopped at D95. The current commitment path reconstructs and returns
   the committed threat even when it is absent from the radius-filtered
   candidate set; D93 clearly requires release in that case using the existing
   `campDefenseRadiusMeters`.
2. **D94 F6 re-baseline:** clear in principle but not implemented because the
   coupled round stopped at D95. The prior 11.1M ceiling, 447 pre-D91 active
   warriors, and approximately 2.2× post-D91 participation provide a
   participant-scaled derivation rather than permission to place a ceiling
   just above an observed run. No ceiling, scratch-allocation bound, or
   deterministic-calls oracle was edited.
3. **D95 closing:** not implemented. The candidate structural and sourced
   values do not select one unambiguous ratio, radius, aggregation rule, or
   engine transition. Choosing any combination would create an unruled
   mechanism or launder an existing `[CAL]` value into a new role.

## New tests named

None. Implementation did not begin after the binding ambiguity STOP.

## Composite audit

No after candidate exists, so no after score or envelope was produced. The
frozen work order records the committed before state:

| Instrument | Before |
|---|---:|
| Baseline-seed composite, seed 18760625, committed schemaVersion 0.3 stream | 55.71% |
| Envelope median, seeds 18760600–18760649 | 52.07% |

An envelope mean and before/after comparison are unavailable because the stop
precedes a candidate implementation. The known frozen-criteria envelope exit 1
was not encountered because `npm run envelope` was not run.

## Four preserved probes

Not run. There is no new build against which to re-run
`.claude/h1-probe.mjs`, `.claude/h1-diag.mjs`,
`.claude/h1-diag2.mjs`, or `.claude/h1-diag3.mjs`.

## Prediction verdicts

All predictions are **NOT JUDGED** because WO-D93 did not reach an
implementation or N=50 envelope:

1. **PR-1:** not judged; no wing-destruction distribution or completion-minute
   distribution.
2. **PR-2:** not judged; no C3 hold distribution.
3. **PR-3:** not judged; no A/G/M BROKEN or ford-choke distribution.
4. **PR-4:** not judged; no Reno killed/wounded span or median.
5. **PR-5:** not reached; no N=50 after distribution exists on which to count
   Reno killed above 26.09. No tuning occurred.
6. **PR-6:** not judged; no coalition killed/wounded distribution.
7. **PR-7:** not judged; no participant/expansion distribution or F6
   exceedance rate.
8. **PR-8:** not observed; no co-d end-state distribution.

## Protected-content audit

- `docs/PREDICTIONS.md` SHA-256 before and after:
  `F9ADCF88907A63857C0FD8D09551FB786B70F1B9FDEFA93229C87E9E6E614E7D`
  (unchanged).
- Scenario JSON SHA-256 before and after:
  `E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8`
  (unchanged). The engine's stable scenario-content FNV-1a remains
  `ba288f09`.
- `engine/src/state.ts` Git blob before and after:
  `b70e51eb03adf79109caa682398919985201fea8` (unchanged, including the
  work order's protected `state.ts:241` location).
- `[CAL]` values are byte-identical: no existing tracked file was edited.
- `codex-report-wo-d91.md` and `codex-report-wo-d91-d92.md` were not modified.

## AMBIGUITIES

- `TODO-AMBIGUOUS(WO-D93-D95-SUPERIORITY-RATIO)`: rule the numeric comparison
  and aggregation semantics for "local numerical superiority." Plausible,
  incompatible readings include strict aggregate superiority (>1:1), reuse of
  the existing charge break margin (`chargeBreakMargin = 1.1`), and the sourced
  Reno account of five-to-one odds. The source also records 500+ warriors, but
  does not convert that observation into an engine trigger ratio. The ruling
  does not say whether to sum `strengthCurrent` or `strengthAvailable`, or
  whether morale/end-state filters mirror `steadyFriendlyMass`.
- `TODO-AMBIGUOUS(WO-D93-D95-EVALUATION-RADIUS)`: rule the radius and center for
  the local-strength comparison. Existing engine radii have different
  semantics: charge 180 m, friendly mass 450 m, engagement 700 m, and
  initiative 1,500 m. O6 records a changing close from long-range fire to
  point-blank and explicitly returns no standoff range, so sourced material
  does not select one of them. The ruling also does not state whether the
  neighborhood is centered on the band, its committed threat, or the
  engagement complex.
- `TODO-AMBIGUOUS(WO-D93-D95-CLOSING-EXPRESSION)`: rule how a superior
  camp-defence band enters and exits the existing engagement machinery.
  Plausible implementations include `CHARGE` posture and zero-standoff
  target pursuit, `ATTACK` with `INITIATIVE` pursuit, or direct reuse of combat
  pursuit. These differ in repath cadence, stopping distance, engagement state,
  shock resolution, break-off behavior, events, and release cleanup. No
  existing transition is uniquely implied by the word "closing."

## DEVIATIONS

- The requested implementation, named tests, quartet, after score, envelope
  mean/median comparison, four probes, PR-1–PR-8 distributions, and PR-5 live
  threshold check were not produced because the frozen hard rule requires STOP
  before selecting the missing D95 values and behavior.
- D93 and D94 were not partially shipped because the frozen work order scopes
  all three changes as one round.
- No other deviation.
