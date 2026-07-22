# M5-SPEC — Calibration · Composite Scoring · The Controls Go Live

Status: DRAFT for Chuck. Proposed D78–D83 (numbers reserved in Memory.md).
M1–M4 built the machine; **M5 is the machine's trial** — every accumulated
[CAL] value scored against the full C1–C4 composite, then the knobs ship.

## 1. D78 — Composite scorer
`engine/src/score.ts` grows to the full PRD §8 rubric, gating together:
- C1 checkpoints (weight .35): ≥70% of HIGH-confidence hit, ≥50% overall.
- C2 casualties (.25): per-side totals within historical low–high bands;
  flagship end-states (annihilated wing) exact.
- C3 end-states (.25): 100% of HIGH-confidence assertions by their minute.
- C4 observations (.15): ≥80% (currently 12/13 — already green).
Output: one composite number + per-item report card (`npm run score`),
written to reports/calibration-scorecard.md. Variant runs scored with
counterfactual items excluded (their provenance flags already say so).

## 2. D79 — Calibration constitution (binding law for the pass)
1. Every [CAL] moves **only within its sourced range** (R1). Values without
   a sourced range get one derived and documented before tuning.
2. Global tables only (D49): no per-event, per-unit, per-checkpoint values.
3. **No mechanism changes during calibration.** Gates unreachable inside
   sourced ranges = STOP + documented finding; the R1 escape hatch (loosen a
   per-scenario tolerance with written rationale) is a Chuck-signed ruling,
   never a tuning act.
4. Every round reports before/after per value + per-gate margins; the full
   audit trail is a committed artifact.
5. Checkpoints, observation events, and calibration targets are frozen —
   no data edits during the pass (source corrections suspend calibration
   and restart it).

## 3. D80 — Seed-envelope methodology
Emergent outcomes are judged as **distributions, not runs**: N=50 seeds
(cheap at ~8 s/run) scored per D78; report distribution of composite, leader
deaths (count + who), Arikara losses, rout compositions, wing-destruction
tick. History must sit inside the envelope, not at its center. The shipping
baseline seed = a **typical member** (median composite, no rare events),
selected by stated criteria before results are inspected per-seed —
never cherry-picked. Selection script + criteria committed.

## 4. D81 — Killed/wounded split
Fire casualties split by a global [CAL] ratio per side, sourced from the
calibration targets' own bands (US: ~268 K / ~52 W hilltop-inclusive;
coalition: K 31–300 / W 100–200 — both DISPUTED spreads preserved).
Integers by construction (D26); C2 scores both columns; the D76 reserved
UI columns go live. Wounded reduce effective strength but are not dead
(terminal accounting differs); no further medical model in v1.

## 5. D82 — Valley-fight intensity (the named finding)
Reno's withdrawal must be *capable* of breaking into history's rout. In
scope as calibration (not mechanism): warrior commitment against the valley
fight flows through existing [CAL]s — engagement participation of the
Reno-response bands, suppression weight, morale drain rates — within
sourced ranges. **Pre-registered predictions**: (a) A/G/M morale reaches
BROKEN during the timber→river leg in a meaningful seed fraction; (b) the
ford choke's dead shift from scouts to broken troopers; (c) Bloody Knife's
death (leader-exposure) appears in the envelope. If intensity cannot reach
the rout inside sourced ranges → STOP: that is a mechanism finding
(candidate: close-infiltration fire from cover), ruled separately.

## 6. D83 — The controls go live (UI)
- **Variant toggles**: all 7 variants (labels, proponents, descriptions from
  scenario data), exclusion groups enforced, counterfactuals visually
  marked; toggling re-runs and re-scores.
- **Parameter panel**: leader ratings, strength Estimates (low↔best↔high
  sweep), order timing offsets, and the headline [CAL]s (friction, herd —
  each showing its sourced range as the slider's rails; no travel outside).
- **Baseline discipline**: defaults = post-calibration values; any deviation
  shows a visible "modified from baseline" flag + one-click reset (PRD §4.5).
- **Report card**: the D78 scorecard behind a builder flag (PRD §4.6);
  end-user exposure per open question 1.
- Accuracy caveats surface confidence (PRD R4): the panel shows each
  parameter's confidence tier.

## 7. Exit gates
- G-M5-1: baseline (post-calibration, selected seed) passes the C1–C4
  composite gates.
- G-M5-2: envelope report committed; history inside it; selection criteria
  predate per-seed inspection (assert by script ordering).
- G-M5-3: the two flagship variant pairs (MTC feint↔crossing;
  disintegration↔organized stand) produce materially different, plausible,
  scored runs (PRD §11).
- G-M5-4: D82 predictions adjudicated (as they fall).
- G-M5-5: audit trail complete — every [CAL] before/after with source range
  cited; spotting table refit with the 13-event exam (Crow's Nest rows
  promoted) replacing the 11-event overfit; F6 gate ported to work-metric
  primary (the Memory.md §3 note).
- Quartet; all prior gates green.

## 8. Split of work
Fable: spec, rulings, envelope-criteria signoff, STOP adjudications, final
review. CC: dispatch + independent verification (sub-agent delegation per
Chuck's economy directive). Codex: M5-A (scorer + split + envelope tooling),
M5-B (calibration pass under D79), M5-C (controls UI). Chuck: open
questions; then turn the knobs he asked for on day one.

## 9. Open questions for Chuck
1. **Scorecard exposure** (product taste): end users see the full report
   card, a summary grade, or builder-flag only?
2. **Envelope size**: N=50 seeds acceptable (~7 min compute), or larger for
   tighter distribution claims?
3. **Variant calibration depth**: G-M5-3's two flagship pairs only, or
   score all 7 variants' runs (more compute + review, better shipping
   confidence)?
