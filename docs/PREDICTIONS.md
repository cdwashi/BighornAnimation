# Predictions Register

Pre-registered expectations, committed before results are known. Append-only. **Entries are never edited after a result is known** — a superseding entry is added with a dated note instead.

Companion to `METHODS.md` §5.

---

## Provenance of this register — read first

This file begins mid-project. The evidentiary strength of its entries is **not uniform**, and the differences are stated rather than flattened.

| tier | what it means | entries |
|---|---|---|
| **A — full protocol** | Predictions committed in their own commit, containing no implementation and no results, before dispatch. Git timestamps establish ordering independently. | WO-D94 onward |
| **B — prior to knowledge** | Committed after dispatch but **before the decision-maker had seen any result**; the implementation/verification run was still in progress at commit time. Protects against fitting predictions to observed outcomes; does **not** establish priority over implementation. | WO-D93 |
| **C — prior in substance** | Registered in the decision ledger before the run, but not in a separate prior commit. Ordering rests on ledger content and commit history, not on an independent timestamp. | D91 set (P1–P4) |

The tier-C set is recorded in D91 and D92. Two of its four predictions **missed** (P3 0/50; P4 low), the misses were recorded as they fell, and the composite dropped 60.41% → 52.07% as a result. Nothing was adjusted to rescue them.

*Reconciliation note (2026-07-25, CC, appended without altering the entry above):* "60.41% → 52.07%" is exact as an **envelope-median** comparison, and that is the robust reading. As single-seed figures the numbers are stream-specific under D31a content-hash seeding: 52.07% was the baseline-seed composite on the as-dispatched content; the committed bytes (schemaVersion 0.3) score 55.71% on the same seed, while the envelope median held at 52.07% across the reseed and all four verdicts re-derived identically. Full reconciliation in commit `b139b42`.

The protocol described in `METHODS.md` §5 takes effect from tier A. This discontinuity is disclosed rather than smoothed.

---

## WO-D93 — F4 release symmetry, F6 re-baseline, closing mechanism

**Tier B.** Dispatched prior to commit; committed before the decision-maker had seen any result — the run was still executing at commit time.

*Precision note (2026-07-25, CC, recorded pre-result):* the tier-B wording was tightened before any WO-D93 result was known. Machine-of-record check at 14:45 local, ~90 minutes after the commit (13:15): no WO-D93 report file existed and no WO-D93 implementation change was present in the working tree — the dispatched run had produced nothing observable yet. No prediction, threshold, or judging clause in this entry was altered.

*Correction and provenance note (2026-07-25, CC, appended per the append-only rule):* the notes above assert a dispatch preceded this commit. Machine-of-record investigation subsequently established that **no WO-D93 dispatch ever occurred**: the on-disk Codex session logs (which persist independent of assistant-session boundaries) contain no trace of this work order, and the process presumed to be the running dispatch was identified by its command line as the VS Code extension's companion server, unrelated to project dispatches. Both the project owner and the design agent have confirmed neither engaged Codex elsewhere. Commit `ff57568` — containing only predictions, no implementation, no results — therefore preceded not only every result but the dispatch itself. The tier-B label above is deliberately retained; the facts are stated and the reader may weigh them against the tier definitions. The work order was subsequently frozen at `docs/WO-D93.md` before actual dispatch and was written to match these predictions; any genuine scope mismatch will be recorded here as a dated note, never an edit.

> **Verify before committing:** these predictions must match the work order as actually dispatched. Amend to fit the dispatched scope — do not amend after seeing results.

### Context

Following D91, the ruled defect fix raised contact mass 444 → 964 and fixed the backward walk, but P3 (A/G/M BROKEN) missed 0/50 and P4 missed low. F4 and F6 went red for structural reasons downstream of the fix. Three rulings follow: release symmetry, a re-baselined work ceiling, and a closing mechanism on local numerical superiority.

### Predictions

**PR-1 — Release symmetry moves the wing fight earlier.**
Bands disengage when the committed threat leaves the radius that would have triggered activation. Expect complete wing destruction in **more than 25 of 50 seeds** (baseline 10/50), with median completion **earlier than 858** (baseline 858–914; historical target 825–840).

**PR-2 — Release symmetry does not cost the hilltop.**
C3 continues to pass. Reno-Benteen hold survives bands departing north.

**PR-3 — Closing mechanism breaks Reno.**
A, G or M reach BROKEN during the valley fight in **more than 25 of 50 seeds**, with **no change to any global lethality rail**. The ford choke repopulates in the majority of seeds where a company breaks.

**PR-4 — Closing raises Reno's casualties toward the band, not past it.**
Reno killed rises from the current 6–20 toward the sourced band 19.24–26.09. Target: median inside the band.

**PR-5 — Overshoot stop.**
**If Reno killed exceeds 26.09 in more than 5 of 50 seeds, the closing mechanism is over-delivering and work halts for adjudication.** This threshold is registered before any result is seen and is not to be moved afterwards.

**PR-6 — Coalition casualties stay sourced.**
Coalition losses remain inside their sourced band in the great majority of seeds. Closing must not be purchased by killing warriors at unhistorical rates.

**PR-7 — F6 scales with participation.**
Expansion count scales approximately linearly with active participant count. The re-baselined ceiling is exceeded in fewer than 5% of seeds.

**PR-8 — co-d overshoot, observation registered.** *(Appended 2026-07-25, before first dispatch — see the correction note above; PR-1–PR-7 are from commit `ff57568`.)*
F4 fails on the committed baseline partly through co-d overshooting. No ruling addresses this and no directional prediction is made. Registered so that any post-run claim about it is checkable against a prior record rather than formed after the result.

### Pre-committed responses to anticipated misses

- **If PR-3 misses again**, numerical superiority is insufficient as a closing trigger. The next candidate is **flank exposure**, which is the historically attested mechanism (warriors against Reno's left and rear on an unanchored flank). That trigger is **not currently computable** — units are dimensionless points and Reno's three companies occupy one position (D91 rider) — so the frontage adjudication becomes its prerequisite. **Not a parameter change, in either case.**
- **If PR-4 overshoots past PR-5's threshold**, halt. Do not tune the closing mechanism down to land inside the band; adjudicate whether the mechanism is wrong in kind.
- **If PR-1 misses**, release symmetry is insufficient and the eligibility rule at `state.ts:241` — deliberately sequenced out of D91 to keep attribution clean — becomes the next candidate.
- **If the composite falls again**, that is not by itself a failure. Per D84 and D91, a structurally more correct day may score worse. The composite is not the target; the criteria are.

### Judging

Distributions across N=50 per D80, not single favourable runs. Verdicts recorded as they fall, in a commit that does not modify this file.

---

## WO-D97 — sequence-inversion fix: no-crossing camp defence, scout exclusion

**Tier A.** Committed alone, before the work order was frozen and before any dispatch. Rulings D97–D99; the work order follows at `docs/WO-D97.md`, written to match these predictions.

### Predictions

Judged per D80, N=50, seeds 18760600–18760649; verdicts recorded as they fall, in a commit that does not modify this file.

**PR-9 — Sequence restored.** In 50/50 seeds: no wing company (co-c/e/f/i/l) takes a casualty before minute 675 (Reno's Ford A crossing), and the first wing-company casualty occurs after the first A/G/M engagement. *Scoring rationale, registered in advance:* scored on first casualty rather than engagement-open, because post-D98 the west-bank timber fringe sits ~713 m from the bluff route and brief cross-river APPROACH contacts near the 700 m engagement radius remain possible — benign harassment fire across the river must not fail this prediction on a technicality. (Pre-fix: wing engagements opened at minute 641.5 and destruction completed at 653.5 in the worst seed.)

**PR-10 — Early cluster eliminated.** Complete wing destruction before minute 800 occurs in 0/50 seeds (pre-fix: 9/50 complete before 858, minimum 653.5).

**PR-11 — Wing timing.** Among seeds with complete wing destruction, the completion-minute median is at or after 825. *Registered expectation, not scored (PR-8 class):* the destruction count is expected to FALL from 17/50 as interceptions are removed — including from the late cluster, since baseline-seed bands re-cross at 808.5 against co-e — and a falling count is the fix working, not a regression. PR-1's more-than-25/50 target is explicitly not chased by this work order.

**PR-12 — Coalition casualties move toward band.** Scored: coalition wounded median falls below 85.5 AND wounded maximum falls below 237. *Registered directional observation, not scored:* seeds with both killed and wounded inside their sourced bands rise from 14/50. No pre-D93 magnitude anchor exists; an honest directional beats a fake-precise threshold.

**PR-13 — Scout exclusion.** Camp-defence commitments to `irregular-scout`-profile units occur in 0/50 seeds (pre-fix observation: pool bands committed to crow-scouts at minute 650 and arikara-scouts at 660).

**Registered observations, no direction:** P3 (A/G/M BROKEN) is expected unchanged at 0/50 — these rulings do not touch the valley fight; registered so an unchanged miss is not read as this work order failing, and so any movement is visible. PR-5's overshoot stop remains armed verbatim.

### Pre-committed responses to anticipated misses

- **If PR-9 or PR-10 misses**, the no-crossing predicate failed its purpose. STOP class: redesign, not adjustment.
- **If PR-12's scored legs miss while PR-9/PR-10 hit**, coalition wounded has a second source beyond the interception; that becomes its own diagnostic before any ruling.
- **If PR-13 misses**, the exclusion was mis-scoped; re-examine against the D75 profile-scoping precedent before touching anything else.

---

## Occupancy research — pre-registered out-of-sample check

**Registered 2026-07-26, alone, before either input exists.** The ground-occupancy research prompt (O7-OCCUPANCY) had not been released and O5's B5 verdict had not returned when this entry was committed. Both branches and the tolerance are fixed now so that neither result can shape the check.

**PR-14 — occupancy predicts Reno's line, out of sample.**
Reno's skirmish-line length is derived as fielded men × linear ground-per-man (formed skirmish order, dismounted), using a figure sourced **independently of the Little Bighorn** — the O7 prompt excludes LBH-derived figures explicitly and by name, because the 2.0 m/man working figure this project previously used was itself derived from the 206 m line, and predicting a number from an input derived from that same number would be circular and worthless.

- If O5's B5 returns a **range** for the line length: hit = the derived value falls inside it.
- If B5 returns a **point figure**: hit = derived value within **±20%** of it.
- If B5 returns **CONFIRMED-WEAK with no usable figure**: the check is **unscored** and recorded as such.

Tolerance registered before either the occupancy research or B5 returned; not to be moved afterwards. The derivation's inputs (fielded-men count and the sourced ground-per-man figure, with its bound) are to be stated alongside the verdict.

*Interpretive note (2026-07-26, registered pre-result):* the O7 exclusion clause is enforceable only where a source's derivation is traceable. A doctrinal interval from Upton is clean; a Plains-warfare density figure in a modern synthesis may have absorbed Little Bighorn evidence without declaring it — the Little Bighorn being the largest and best-documented Plains engagement, it is disproportionately likely to sit inside any general claim. The clause catches what is declared; it cannot catch what is not. Consequence for scoring: a hit is meaningful, a miss is meaningful, and a **suspiciously exact hit warrants inspection of the derivation chain before it is celebrated**. This note is registered before either input exists so that such an inspection cannot read as post-hoc dismissal of an inconvenient result — in either direction.

**VERDICT (2026-07-28): PR-14 is UNSCORED, per the registered third branch.** O5's B5 verdict is CONFIRMED-WEAK: no publication-grade source gives the 225-yard frontage, and B5's core finding is that **no independently documented frontage exists at all**. The tempting alternative — scoring against the RCOI-derived ~500+ yards — is rejected because that figure is itself a spacing derivation (~112 men at ~5-yard intervals); scoring a spacing-derived prediction against a spacing-derived target would test whether two spacing figures agree, not whether the occupancy model reproduces an independently documented frontage. The judging input is not weak; it is absent. Recorded as the registered branch prescribed, with nothing satisfying to report — which is why it is the right branch. A doctrine-versus-practice comparison (O7's doctrinal interval vs RCOI's observed 5–10 yards) is genuinely available but is NOT PR-14 and will not be relabeled as such; if wanted, it gets its own registration after O7 returns. O7 remained unreleased and its executor unbriefed when this verdict was recorded.

---

## PR-6 criterion supersession — recorded before any rescoring

*Dated superseding entry (2026-07-28); PR-6's original text and its judged MISS (14/50) stand unedited above.* The encoded coalition killed band (31–300) is corrected by O5: **killed low 36 / best ~60 / high 136, with 300 explicitly discredited** (source per bound in the O5 report — the encoded low of 31 was not the lowest cited figure, and the encoded high of 300 was the discredited bound). **Direction of change, stated deliberately: the upper bound tightens by more than half, making PR-6 harder to hit, not easier.** This record predates any rescoring, so the correction cannot later read as a criterion loosened to rescue a missed prediction — the corrected target is less favourable than the one PR-6 missed against. Wounded: O5 sources Red Horse's 160 (1877); the encoded 100–200 spread's re-encoding is resolved at transcription. **Scenario bytes are deliberately not updated now** — any scenario change re-rolls every PRNG stream (D31a), so the byte correction rides the single budgeted reseed bundle alongside the other O5 corrections; until it lands, interim C2 scores are computed against the superseded band and are to be labeled as such wherever reported.

---

## O7 returned — dated notes (2026-07-28)

*The exclusion clause fired in practice, and the record should show it.* O7's EXCLUDED-CIRCULAR note states the ~206 m figure "was encountered repeatedly across sources" and was excluded with the derivation chain named — RCOI testimony → company frontage → meters-per-man back-computed. The safeguard has teeth; recorded as evidence rather than decoration.

*PR-14's UNSCORED verdict gains a second, independent ground.* O7's linear figure spans 3× — 1.52 / 2.74 / 4.57 m per firing man (Cooke 1862 / Upton 1874 via the volume's index terms / Poinsett-lineage secondary), with one man in four off the line holding horses. Even had B5 returned a usable frontage, a ±20% tolerance against an input spanning 3× would have been untestable: the derived value inherits a spread far wider than the test. The check failed for want of a judging input; it would also have failed for want of resolution.

*Correction recorded against O5's B5: the "contradiction" finding was overstated.* O5 derived "~500+ yards" from "standard ~5-yard skirmish intervals"; O7 establishes 5 yards as the doctrinal HIGH bound, not the standard — Upton's best is 3 yards. At O5's ~112 men on the line, the doctrinal envelope spans ~170–512 m, and the encoded 206 m sits **inside** it, between the low and best bounds. B5's finding that the 225-yard figure is UNSOURCED stands entirely; its finding that a spacing derivation *contradicts* it does not. This correction is inherited by D101's forward note ("real frontage plausibly ~2.5× the 206 m") — the 2.5× multiple is the high-bound case only; the corrected statement is 0.8×–2.5× depending on bound. Each research job caught something the other got wrong; the uncontaminated-separate-sessions discipline is why either error was catchable at all. The Q1 best bound rests on index terms pending verbatim consultation of Upton para 665 (access register: one human download closes it).
