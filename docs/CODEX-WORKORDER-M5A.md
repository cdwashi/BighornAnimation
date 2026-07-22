# CODEX WORK ORDER — M5-A: Scorer · killed/wounded split · envelope tooling

## Goal
Implement M5-SPEC §1 (D78 composite scorer), §4 (D81 split), §3 (D80 envelope
tooling + selection script). NO calibration tuning in this order — M5-B does
that under the D79 constitution. Exit: quartet green, gates below.

## Inputs
docs/M5-SPEC.md (authoritative), IMPLEMENTATION_HISTORY through D77, PRD §8.
House rules: assemble don't invent; ambiguity protocol; [CAL] values touched
ONLY to add the D81 ratio slots (sourced ranges from calibration targets).

## Chuck's rulings (binding): Q1 full report card exposed to end users
(M5-C consumes this; scorer output must be presentation-ready). Q2 N=50.
Q3 all 7 variants scored, tiered review (flagships + counterfactuals deep,
remaining three sanity-tier) — tooling must tag runs by tier.

## Tasks
1. score.ts → full C1–C4 composite per spec §1; `npm run score` emits
   reports/calibration-scorecard.md (per-item card + composite; PRD §8
   weights; counterfactual exclusions honored via provenance flags).
2. D81 split: global per-side killed:wounded [CAL] ratio, sourced ranges in
   the config table (US ~268K/52W; coalition K 31–300 / W 100–200, spreads
   preserved); integers (D26); wounded reduce effective strength, distinct
   terminal accounting; C2 scores both columns. F2 conservation extended:
   killed+wounded+effective ≡ strength.
3. Envelope tooling: `npm run envelope` — N=50 seeds, per-seed composite +
   emergent-outcome extraction (leader deaths count/who, Arikara losses,
   rout composition, wing-destruction tick, ford-choke composition);
   reports/seed-envelope.md with distributions vs historical envelope.
4. Baseline-seed selection script: criteria file (median composite band, no
   rare events) evaluated mechanically; **G-M5-2 ordering assertion** —
   criteria file's content hash recorded before per-seed report generation
   in the same run (script emits both, order provable in output).
5. Variant runner: `npm run score -- --variant <id>` for all 7; tier tags.
6. Ledger: append D78–D83 rows derived verbatim from spec §§1–6 with
   Chuck's Q1–Q3 answers noted in D78/D80 rationale (all Approved,
   execution-dated); artifact rows.

## Gates
Scorer unit tests (each C-rule + weighting + a synthetic perfect/failing
run); split conservation; envelope determinism (same seed list ⇒ identical
report); quartet; all prior gates green (F2 extension included).
NOTE: composite gates are NOT expected to pass yet — pre-calibration
baseline score is reported, not gated. Gating begins in M5-B.

## Proof
codex-report-m5a.md: quartet verbatim, the pre-calibration scorecard +
envelope summary tables in full (M5-B's starting line), AMBIGUITIES,
deviations. No commit/push.
