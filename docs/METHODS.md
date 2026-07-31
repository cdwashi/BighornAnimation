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

**The simulation's own output is never provenance.** The historical fact of an event is testimony-sourced; terrain analysis can explain an event, corroborate it, or flag it as implausible, but it cannot source it. This binds hardest where an event is gate ground truth: re-citing the C4 observation events to the project's own viewshed analysis would make the gate measure the model's agreement with itself, and it could never fail for the reason it exists to detect. The same rule applies to any claim whose proposed "upgrade" is something the simulation itself computes. Weak testimony honestly labeled beats strong-looking circular provenance.

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

**The discipline validated itself on the typical-seed criteria (2026-07-30).** The D80 typical-seed selection criteria were frozen before the post-stop defect arc began, and returned "none — no eligible member" in every world from the D91 fix onward. They were deliberately left un-re-derived across that entire span, because adjusting selection criteria after seeing the distributions they select from is forking-paths; the empty selection was reported as a finding each round instead. After six precedent-only defect rulings (D103–D107, none justified by a casualty figure), the WO-D107 campaign's envelope selected seed 18760612 from seven eligible candidates — the first selection in the project's history. Nobody moved the criteria toward the model; the model changed until it produced a day the frozen criteria recognise. The envelope median rose 46.30% → 57.63% over the same span. This is the cleanest validation of pre-registration this project is likely to generate: the instrument held still, and reality walked into it.

## 6. Verification

Every change is verified by a four-part gate — typecheck, lint, tests, build — plus, for behavioural changes, a before/after composite audit and a re-run of the preserved diagnostic probes.

Implementation, verification, and design are performed by **separate agents**. Verification independently reproduces the implementer's reported results rather than accepting them; reproduction to the level of deterministic internal counters is the standard.

**A gate that goes red on a real finding is reported red.** Defects discovered during work are converted into permanent tests wherever possible, so that a class of error cannot silently return.

**Measure before freezing is standing practice.** A predicate, premise, or design intended for a ruling is tested against the running model before the ruling freezes, using preserved read-only probes, and the measurement enters the ruling's evidence column. The practice has killed or reshaped four designs before they entered the record: a closing-threat ratchet (the approach march set new minimum believed approaches and would have qualified the passing column it was meant to exclude); an anticipated fallback clause (0 of 96 samples lost their last eligible feature — the clause was never needed); a phase work order's premise (the fight already opened at ~435 m; the assumed 218 m was the collapse endpoint, not the opening); and a declaration-only fix (eligible but never selected, 21 of 21). A design killed before freezing is a success of the method, not a failure of the designer.

**Ask "which one, specifically?" of any predicate that sorts correctly.** A classifier that produces the expected split has demonstrated a correlation, not expressed a concept; the follow-up question — which entity, exactly, satisfies the predicate in each case — is cheap and has twice caught things the aggregate could not. In one instance (2026-07-30) a discriminator's caution aimed at distinguishing a garrison from an incidental rallied fragment instead exposed an instrument bug: the isolation scan filtered destroyed units but not withdrawn ones, so off-field Crow scouts' frozen field-edge positions were counting as steady friendlies, and 56 of 61 "sheltered" classifications were artifacts. The aggregate percentages looked plausible in both the contaminated and corrected runs; only the per-entity answer ("sheltered by *whom*?") was diagnostic. The practice pairs with measure-before-freezing: the first tests whether a predicate sorts, the second tests whether it sorts *for the stated reason* — and a predicate passing for an unstated reason is the same defect class as a mechanism working by accident.

**Open the source before citing it for a number.** The most basic check in the hierarchy, written down precisely because it looks too obvious to state — and because it is the one that broke (2026-07-31, the fifteenth pre-freeze design death, `NEGATIVE_RESULTS` §4). An adjudication directed that a feature's ground extent be taken as "the source's described ground" — ~2,827 m², read off a prior ruling's "~60 m neighbourhood" — while ruling in the same breath that extent must be sourced rather than chosen. Nobody opened the ruling's text before citing it. The 60 m was the terrace-search criterion (≤3.5 m relief across a 60 m window — a search parameter), and the source beneath it supplies existence and location only; extent appears nowhere in the chain. The figure then propagated through two committed measurements as their arithmetic anchor before a drafting-stage read killed it. The failure was available to both roles — the adjudicator citing, the instrument-carrier propagating — and the catch was cheaper than either practice above: no probe, no campaign, one read. It stands as the zeroth step of the pair: measure-before-freezing tests a design against the model, which-one-specifically tests a predicate against its entities, and this tests a citation against its page. The page is an instrument too, and it is read, not remembered.

**The composite is a low-resolution instrument, and a flat median is not evidence of model stability.** Each component is a ratio of small integer counts (38.46% is 5/13 end-states, 92.31% is 12/13 observations, 44.44% is 4/9 casualty legs, 50.00% is n/2n checkpoints), so the weighted composite can only take a coarse lattice of values. The envelope median landing on the identical value across successive model versions — as it has, three times at 52.07% — is therefore expected behaviour of the instrument, not a claim about the model; the same quantization produced a pre-D91 distribution whose entire interquartile range sat on one value. Two consequences bind reporting: small genuine improvements can be invisible to the composite while large ones jump discontinuously, so absence of movement is not absence of change; and cross-round comparisons should read the component counts and the underlying continuous variates (casualty spans, event timings, occurrence frequencies), not the headline percentage alone. Relatedly, the composite rose 55.71% → 58.48% in a round where four of seven directional predictions missed — the composite is not the target; the criteria are.

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
