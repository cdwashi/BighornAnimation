# Methods

**Project:** BighornAnimation — order-driven simulation of the Battle of the Little Bighorn, 25 June 1876
**Status:** working document. Amended by ledger ruling; see `IMPLEMENTATION_HISTORY.md`.
**Purpose:** to let a reader judge how this simulation was built, what its outputs may and may not be taken to mean, and where it is weak. It is written to be read adversarially.

---

## 1. What this simulation claims

It claims to be a **terrain-accurate, order-driven reconstruction** whose mechanisms are sourced and whose free parameters are constrained to published ranges. It is a tool for examining how the documented events fit together in space and time — most centrally, what participants could see from where they stood.

**It does not claim to settle disputed history.** Where the record is contested, the dispute is preserved as a labelled variant rather than resolved by fiat or averaged away.

**It does not claim its composite score measures historical truth.** The composite measures agreement with a set of scoring criteria derived from the record. A higher composite is not automatically a more accurate day: see §7, where a correctness fix lowered the score by more than eight points.

**Its outputs are not evidence about 1876.** They are consequences of the encoded assumptions. Any claim about the battle must rest on the sources, not on the simulation's behaviour.

## 2. Source hierarchy

Weight when accounts conflict, highest first:

1. **Archaeological record** — cartridge-case distribution, firearms identification, position mapping. Physical evidence overrides testimony where they conflict.
2. **Time-motion and synthetic scholarship** — peer-reviewed and monograph-length reconstructions.
3. **Contemporary official records** — the 1879 Reno Court of Inquiry, official reports.
4. **Native eyewitness accounts** — for the coalition's own positioning and decisions these are the *primary* record, not a supplement; the cavalry observed the defence from outside it. Translation and recording caveats are noted per claim.
5. **Later reminiscence and popular accounts** — lowest weight. Where a widely repeated figure traces only to this tier, that fact is recorded with the datum.

Weak citations are **recorded faithfully rather than laundered** (D16). Where a claim rests on a low-tier source, the scenario file says so. Re-sourcing to publication grade is tracked as work item O5 and is v1-blocking.

## 3. Provenance and confidence

Every datum in the scenario carries provenance: source keys, locus, and a confidence rating — HIGH (physical evidence or multiple independent primaries), MEDIUM (single credible primary or strong scholarly consensus), LOW (inference or reconstruction), DISPUTED (competing published interpretations).

**Disputed quantities are recorded as low / best / high with a separate source for each bound. Competing figures are never averaged.** An average destroys the disagreement; a spread carries it forward into the results.

## 4. The mechanism / calibration boundary

This is the project's central anti-fitting device.

- **Mechanisms need sources.** How something works is a historical claim and requires a ruling with evidence behind it.
- **Knobs need calibration.** Free parameters may be moved only within published ranges, and only global tables are exposed — no per-event parameter exists that could be set to make one moment come out right (D49).

During a calibration round, **mechanism changes are forbidden** (D79.3). If a scoring gate cannot be reached by any legal parameter move inside sourced ranges, the required response is to **stop and document the finding**, not to widen a range or add a mechanism.

This has fired in practice. Composite gate D82 proved unreachable; the escape hatch was used; the investigation that followed found two implementation defects that had capped participation at 26% of available strength. The gate was right to refuse.

## 5. Pre-registration

Before any implementation is dispatched, the expected consequences are written down as **falsifiable predictions**, committed to the repository in their own commit, and judged as they fall.

Requirements:

- Predictions are **specific and falsifiable** — a threshold, a direction, a count — not "the model should improve."
- Predictions are **committed before implementation exists**, in a commit that contains no implementation and no results. Git timestamps then establish ordering independently of anyone's testimony.
- Predictions are judged **as distributions** across a seed ensemble, not on a single favourable run.
- **Verdicts are accepted as they fall.** A missed prediction is recorded as missed. Nothing is adjusted to rescue it.
- Where a plausible failure mode is anticipated, the **response is pre-committed** — for example, that a particular miss would require a separately-ruled mechanism and explicitly not a parameter change.

## 6. Verification

Every change is verified by a four-part gate — typecheck, lint, tests, build — plus, for behavioural changes, a before/after composite audit and a re-run of the preserved diagnostic probes.

Implementation, verification, and design are performed by **separate agents**. Verification independently reproduces the implementer's reported results rather than accepting them; reproduction to the level of deterministic internal counters is the standard.

**A gate that goes red on a real finding is reported red.** Defects discovered during work are converted into permanent tests wherever possible, so that a class of error cannot silently return.

**The judging statistic has been validated empirically, by accident.** A pre-commit schema correction changed one string in the scenario file; because the PRNG seed derives from the scenario content hash (D31a), that single character re-rolled every combat die of the day with zero mechanism change. Across this full reseed the N=50 envelope median held exactly (52.07%) and the mean moved 0.03 pp, while the single-seed baseline composite swung 3.64 pp (52.07% → 55.71%) and one gate's failure mode changed qualitatively (F4). Nobody designed this experiment. It demonstrates on real data that the envelope is the robust statistic and the single-seed composite is noise-limited — which is why distributions are the judging instrument (D80), single-seed figures must state their content stream, and seed-fragile gates are adjudicated on the envelope.

## 7. Threats to validity

Disclosed because an auditor would otherwise find them.

**Mechanism investigation has been score-directed.** The decision to examine warrior participation was prompted by a scoring gate that could not be reached. Which mechanism gets scrutinised has therefore been influenced by which gates were failing — a garden-of-forking-paths risk at the mechanism level rather than the parameter level. Mitigations: every resulting change was required to be either defect-class (wrong regardless of its effect on the score) or independently sourced; predictions were pre-registered before running; and the outcome is recorded whichever way it falls. In the instance at hand, the fix **lowered** the envelope median from 60.41% to 52.07%.

**Units are dimensionless points.** Three companies operating under one order occupy an identical position. The battle's valley phase turned historically on an unanchored left flank; a flank that cannot be located cannot be turned. Recorded as the D91 rider; adjudication pending. This is a live constraint on how well that phase can ever be reproduced.

**Some load-bearing citations remain unread at the primary level.** Several claims reach the project through secondary relays rather than the cited page. These are flagged in the scenario file and in the research deliverables' own negative-findings sections, and are tracked as O5.

**Coordinate precision exceeds coordinate accuracy in the historical record.** Positions are stored to a precision the sources do not support. Positional uncertainty is recorded alongside; readers should not infer accuracy from decimal places.

**Terrain is modern.** The elevation model post-dates 1876. The river channel in particular has migrated. No systematic correction has been applied.

**Two declared terrain classes are empty.** `RAVINE` and `HISTORICAL_CORRECTION` exist in the cover vocabulary and contain no cells. Nothing may be built on them; the purpose of the latter is unknown and no interpretation is asserted.

## 8. Reproducibility

Runs are deterministic given scenario, seed, and terrain. The scenario carries a content hash. Diagnostic probes are preserved in the repository as tooling rather than discarded after use, so that any published figure can be regenerated. Disputed history is exposed as toggleable variants so a reader may run the alternative rather than take the baseline on trust.

## 9. Negative results

Refuted hypotheses, missed predictions, gates that remain red, and mechanisms considered and rejected are recorded in `NEGATIVE_RESULTS.md`. A record containing only successes is a curated record.
