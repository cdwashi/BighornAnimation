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

*Superseding note (2026-07-28, later the same day — the verbatim page corrects the correction).* The Upton PDF was obtained by human download and paragraphs 610 and 652 were transcribed and **eye-verified against the printed page** (`docs/research/UPTON-1874-VERBATIM-TRANSCRIPTION.md`). Three findings supersede parts of the note above: (1) **¶610: "The habitual interval between skirmishers is five yards"** — the figure O7 classified as the secondary HIGH bound is Upton's own habitual standard; (2) O7's "three yards" best bound was a **misattributed index term** — every three-yard index entry is the horse interval of the School of the Trooper, not a skirmish spacing; (3) ¶652's dismounted deploy-forward is clustered (three firers per four at five-yard intervals, fifteen yards between fours), giving **4.57–7.62 m of front per firing man** depending on how "interval between fours" is read — a ruling choice, recorded as such. Consequences: O5's B5 derivation is **rehabilitated** (RCOI's "five to 10 yards apart" matches the current manual; ~112 firers at habitual interval ≈ 512 m), and the encoded 206 m sits **below Upton 1874 doctrine entirely**, inside Cooke 1862's two-to-three-pace band. The correction chain now runs three layers — secondary → index terms → printed page — each from a better tier, each dated here before the next arrived. PR-14 remains UNSCORED on both registered grounds; nothing in this note rescores anything.

---

## WO-D102 — asymmetric unit frontage (tier A)

**Tier A.** Committed alone, before the work order was frozen and before any dispatch. Ruling D102; the work order follows at `docs/WO-D102.md`, written to match these predictions. This work order changes **no scenario byte** — frontage is derived, not authored — so every comparison is same-stream.

### PR-5 interim supersession — deliberate, visible, re-armed later

*Dated note (2026-07-28), per the approved ruling:* the Reno annihilation is an **adjudicated known state** (PR-5 fired at WO-D97, 7/50, halted, adjudicated to the occupancy/dispersal chain). Interim work orders — this one included — **report Reno A/G/M killed as data**; no PR-5-class stop governs them. A stop of PR-5's class **re-arms with fresh referents in C's work order**, where dispersal is the actual fix. The stop was suspended deliberately and will be visibly re-armed — not quietly dropped after it fired.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-15 — Direction: frontage deepens the annihilation, and that is the predicted consequence of a sourced correction.** Scored: the Reno A/G/M killed median (N=50) does **not decrease** relative to the pre-WO baseline measured at dispatch; it is expected to increase. Registered in advance so a worse casualty picture reads as the named consequence of shorter sourced effective ranges — not as a regression — and the pressure stays on C and dispersal, which are the actual fix.

**PR-16 — Effective range lands where the instrument predicted.** Scored: the median effective fire range in the valley window falls below the 216 m centroid baseline and within **±35 m of 144 m** (the pre-registered static counterfactual, `.claude`-preserved probe lineage, at the ruled 4.57 m bound).

**PR-17 — Same stream.** Scored: scenario content stream `ba288f09` byte-identical after implementation. Frontage derived from strength and formation only; a scenario byte change is a STOP, not a miss.

**PR-18 — Confinement holds.** Scored: C4 remains 12/13, the E5 checkpoint table diff is none, and F3 no-combat byte-identity holds — extent is read by fire range and flank determination only; spotting, LOS, movement, and the 700 m opening gate stay centroid, per the standing rulings.

### Registered observations, not scored

- **Endpoint-overlap flank events are reported as data only.** No baseline exists (the mechanism doesn't yet); angular flanking already runs 56–77% of engaged ticks, so endpoint flanking requires separate accounting before it could ever be scored. Instrumented separately for that reason.
- **Warriors carry zero frontage**, disclosed simplification: their extent is their ground, and their ground arrives with the reseed bundle.
- **Convergence observation, corroboration not proof** (recorded as observation because the answer is already known — registering it as a prediction would be pre-registration theatre): Upton prescribes 5 yards (¶610, verbatim); RCOI troopers testify "five to 10 yards apart"; the derivation from encoded strengths gives 102 firers → **466 m** of battalion front (O5's ~112-firer testimony variant: ~512 m). Doctrine and testimony agree; the encoded 206 m is doubly dead — unsourced per B5, and below the doctrine its own troopers followed.

---

## WO-D103 — hostile-act alarm and attack-speed response (tier A)

**Tier A.** Committed alone, before the work order was frozen and before any dispatch. Ruling D103; work order follows at `docs/WO-D103.md`, written to match. No scenario byte changes — same stream.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-19 — The sequence forms.** In at least 45/50 seeds, at least one of A/G/M reaches dismounted SKIRMISH formation alive (a skirmish line exists). Pre-fix baseline: 0/50 — no line has ever formed outside the r=250 proxy.

**PR-20 — Alarm fires on the hostile act.** In 50/50 seeds the first camp-defence alert occurs at or after minute 695 (T3: the ford commitment at ~700, not the approach march at 587), and turnout completes between 700 and 730.

**PR-21 — The mass builds during the line phase.** Pool-band feature-arrival median falls within minutes 725–755 (alarm ~700 + 15 turnout + gallop ride), i.e., after contact begins and before the historical rout window closes — not pre-assembled, not post-fight.

**PR-22 — Casualties move toward the band, both branches registered.** Scored: Reno A/G/M killed median lands **within the sourced band 19.24–26.09**. *Low branch, registered as informative:* a median below the band with ~900 warriors arriving mid-fight is not a null result — it is evidence the arriving mass is not converting to casualties, pointing at C and dispersal. *High branch:* the re-armed stop below. Baseline for this round: the r=250 proxy's killed 18 (ordered trio only).

**PR-23 — No interception resurrection; Ford B stays honest.** In 50/50 seeds: zero camp-defence alerts before minute 675 (the approach march never alarms), and any northern-camp alarm at Ford B occurs only at or after an E/F ford commitment (measured pre-fix at ~798). Retreat crossings (measured 767.5–776.5) raise no alarm — the trigger is closing, camp-ward commitment only.

**RE-ARMED STOP (PR-5 class, fresh referents per ruling — stated against the current band and this round's baseline):** work halts for adjudication if Reno A/G/M killed exceeds **40** (the band high plus roughly one band width — overshoot-class, not band-edge noise) in more than **5 of 50** seeds, **or** any seed reaches annihilation-class loss (killed ≥ 100, the pre-fix regime). Thresholds registered before dispatch; not to be moved.

### Registered observations, not scored

- **Wing/F4 effects reported as data** — the alarm change touches the north; movement is expected to be visible, not scored here.
- **Ford-choke composition reported as data** — pursuit at the retreat crossing belongs to D93 release and D96 closing; if the choke does not repopulate, the finding is attributed there, never supplied by an alarm side-effect.
- **Frontage activity reported as data** — the line now exists, so PR-16's instrument (effective ranges, endpoint-flank counts) produces its first live readings; unscored this round.

---

## PR-21 instrument supersession — recorded before any rescoring

*Dated superseding entry (2026-07-29); PR-21's original text stands unedited above, and its status remains NOT JUDGED — the RE-ARMED STOP halted WO-D103's campaign at N=1, so there is no verdict to revise.* The thirteenth measurement (`.claude/feature-arrival-probe.mjs`: the stop seed in full, two secondary seeds reporting feature-path quantities only, casualty figures deliberately suppressed on the secondaries so the measurement cannot become a partial campaign) establishes that PR-21's metric and its intent diverge on the D103 candidate.

**What was intended:** the mass builds during the line phase — not pre-assembled, not post-fight. **What was measured as the metric:** pool-band feature-arrival median within minutes 725–755. **What actually happens:** the pools activate at 719, select scenario-bench (goals 3.9–4.7 km out), and gallop toward it on a D92/D98-legal path; en route they come into engagement range of Reno's companies at 741–742 and open fire at 744 — inside the registered window — whereupon D72 combat pursuit (`pursuit-started`) replaces the camp-defence march 242–512 m short of the goal, so no `arrived` event ever fires on the stop seed. On a secondary seed with different interception geometry the bands do arrive (Bench at minute 747, 0 m; a later feature at 873): selection and pathing are intact, and arrival is preempted by contact rather than bypassed.

**Why they diverged:** feature arrival was a proxy for "the mass reaches the fight while the line stands," and interception satisfies the intent while skipping the proxied step. Same error class as O5's B5 spacing-derivation finding: a proxy standing in for the thing of interest, diverging from it in the case that matters. PR-21 is **not rescored against any substitute metric chosen after seeing this result**; if a mass-timing prediction is wanted for a future round, it gets its own registration with the interception path named in advance.

*Carried observation, not a ruling:* D96's `shouldClose` closing trigger never fired on any measured seed — combat pursuit preempts it every time — so the D96 closing mechanism is currently dormant in the valley. When en-route contact should legitimately preempt feature occupation is an open ruling (the pursuit-interception boundary), deliberately held to the bundle because dispersal across features changes interception geometry; recorded here so the dormancy is attributed to a named cause rather than discovered again.

---

## WO-D104 — rout pathing completed: no wipe, origin exemption, cadenced retry (tier A)

**Tier A.** Committed alone, before the work order was frozen and before any dispatch. Ruling D104; work order follows at `docs/WO-D104.md`, written to match. No scenario byte changes — same stream. This work order dispatches ALONE; the D96/D72 ownership ruling follows separately against the baseline this work order produces, per the D104 sequencing clause.

**Baseline disclosure:** the pre-fix tree is the accepted D103 candidate (`bd7b998`), whose registered campaign halted at N=1 under the re-armed stop (killed 109). No N=50 killed distribution exists for it; these predictions are therefore stated against absolute criteria, not deltas. The twentieth/twenty-first measurements' figures are previews from a probe-grade fix at N=1 and are NOT predictions; where they appear below they are labeled as previews.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-24 — The annihilation does not recur.** Scored: 0/50 seeds reach annihilation-class Reno A/G/M killed ≥ 100. (Preview: 36.)

**PR-25 — Above the band, registered as the expected direction.** Scored: the Reno A/G/M killed median lands ABOVE the sourced band high (26.09). Registered so the above-band landing is the stated expectation rather than a discovery: the latch fix removes the pin, not the fire. A median inside or below the band is recorded as an informative surprise in the favourable direction — not a rescue, and not a hit on this prediction. No upper edge is scored; the re-armed stop below owns the upper tail.

**PR-26 — The retreat crosses.** Scored: in at least 45/50 seeds, at least two of A/G/M end the day alive east of the channel, and ford episodes occur within or overlapping the registered retreat-crossing window (measured pre-fix at 767.5–776.5) in a majority of seeds.

**PR-27 — The wing roster returns, both branches registered.** Scored: F4's five-destroyed criterion (C/E/F/I/L all DESTROYED, co-d survives) holds on the baseline seed, and complete wing destruction occurs in **at least 25/50 seeds — direction stated: the substantive claim is that mobile routing restores the roster, demonstrated by a large move off the 17/50 historical high-water mark, not by crossing 50%.** Registered mechanism: wing companies routing MOBILE during the northern fight (the 842–880 corridor-search cluster). *Other branch, registered now:* if E/F survive across many seeds, the latch-artifact conclusion weakens, F4 stays honestly red, and the Ford-B timing question reopens — that outcome is a finding, not a failure of this work order.

**PR-28 — Coalition stays sourced.** Scored: coalition killed median (all coalition combat units) inside O5's rebuilt band 36–136. (Preview: 56.) *Registered observation with a threshold, not scored and not a stop:* coalition band destructions are expected in 0/50 seeds under this work order alone; any occurrence is reported as data, and occurrences in more than 5/50 seeds constitute a named finding for the ownership round's design. Band destruction was observed only under the ownership configuration this work order deliberately does not ship — if bands start dying under the latch fix alone, that is informative and we want to see it, not stop on it.

**PR-29 — The ford choke stays empty, registered as expected.** Scored: zero casualty-resolution events within the preserved 250 m Ford A extraction in at least 45/50 seeds. Pre-registered interpretation, both directions: emptiness is the expected consequence of pursuit-versus-crossing timing (pursuers arrive at the bank after crossings complete — twentieth/twenty-first observation), NOT evidence the retreat is safe by nature. **A non-empty choke, arriving without any ruling having touched pursuit timing, is registered now as evidence that the choke was empty for latch-related reasons all along — a reading that reaches back into the east-bank sanctuary question and is recorded here so it cannot be constructed after the result.** Repopulation would also be the first model-generated crossing fight — an informative surprise in the historical direction, to be investigated (timing first, sanctuary rule second) before any celebration or ruling.

**PR-30 — Same stream.** Scored: scenario content stream `ba288f09` byte-identical after implementation. The fix is engine-behavioral only; a scenario byte change is a STOP, not a miss.

### Registered observations, no direction scored

- **PR-3's two readings, held apart deliberately:** a company routing MOBILE and escaping is a different outcome from a company BREAKING under fire in the valley window, and only the latter is what PR-3 asked for. Record which occurs, per seed. (Twentieth preview: co-a never routs at all — it retreats under orders and crosses before breaking.)
- **East-bank sanctuary data:** crossing minutes, killed-at-crossing, and post-crossing casualties (expected 0) for each surviving company — the invariant's reference measurements, carried forward from the fifteenth.
- **Hilltop outcome as data:** hunkpapa-pool and the ordered trio's casualties against the (possibly intact) garrison. The hilltop over-lethality question stays open and is NOT this work order's to answer. (Preview under latch-alone: hunkpapa k5.)

### RE-ARMED STOP (PR-5 class, fresh referents against the latch-fixed world)

Work halts for adjudication if Reno A/G/M killed exceeds **60** in more than **5/50** seeds (overshoot-class above the registered above-band expectation), **or** any seed reaches killed ≥ **100** (annihilation-class returns). Thresholds registered before dispatch; not to be moved.

### Compounding-uncertainty disclosure (per adjudication, stated rather than implicit)

Every figure feeding these predictions is N=1 on seed 18760625, at the end of a four-defect chain unwound sequentially on that one seed. The interactions between fixes are exactly where single-seed reasoning is weakest — the twentieth's L/LA sign-flip is the measured proof. This campaign is the first N=50 test of any link in the chain; surprises here are the register doing its job.

---

## PR-29 interpretation superseded — ammunition, not timing

*Dated superseding entry (2026-07-29, post-campaign); PR-29's original text and its judged HIT (zero choke events in all 45 completed seeds) stand unedited above.* PR-29's pre-registered interpretation named pursuit-versus-crossing **timing** as the expected cause of emptiness, with the sanctuary rule second. The twenty-fifth measurement supersedes both: the pursuers arriving at the bank during the retreat-crossing window (767.5–776.5) were already **nearly out of ammunition** — the coalition's repeaters empty by ~720, bows by ~765, everything by ~780, with no warrior resupply mechanism in the model — so the choke was bloodless primarily because the pursuers could not shoot, whatever their timing. The registered non-empty-choke reading (latch-related emptiness reaching into the sanctuary question) is likewise superseded at its cause: the latch, the timing, and the sanctuary were all downstream of the same dry-quiver fact. Recorded now, before the choke question ripens, so the correction is dated rather than reconstructed. The HIT itself is unaffected — the prediction scored an outcome, and the outcome stands; what is corrected is why.

---

## WO-D105 — the close-action bout: emergent outcomes, sourced finishing (tier A)

**Tier A.** Committed alone, before the work order is frozen and before any dispatch. Ruling D105; work order follows at `docs/WO-D105.md`, written to match. No scenario byte changes — same stream.

**First-unmeasured-design disclosure:** twelve designs in this arc died on pre-freeze probes; this design cannot be probed before it exists — its outcomes are emergent from dynamics no static query reaches, and the twenty-eighth through thirtieth measurements are the record of trying (every discriminator the record offers relies on state the model does not carry; NEGATIVE_RESULTS §7). These predictions therefore carry the load the probes cannot, are sized wider than usual, and register the unfavourable branch explicitly.

**Baseline disclosure:** the pre-fix world is the committed WO-D104 halted tree (`5c87b25`): killed median 45 (fire-only 41), 5 complete seeds above 60 — all via the cohesion-floor dissolution this work order removes — 23 Reno company destructions, coalition killed median 66 with band destructions in 16/45, ford choke empty in 45/45, five-destroyed wing in 25/45. Its campaign stopped at 45 complete seeds + 1 partial; comparisons are against the 45 complete.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-31 — Direction: total killed falls, and the over-kill branch is registered LIVE.** Scored: the Reno A/G/M killed median falls below 45. The 348 dissolution deaths are removed by the drain interlock; bout conversions replace some; escapees now live. *Over-kill branch:* the thirty-first measurement's conversion ceiling (tight 1,012) sits roughly three times above the deaths removed, so a median at or above 45 is arithmetically possible and is the twenty-sixth's warned direction — anticipated, named, owned by the re-armed stop, never absorbed as noise.

**PR-32 — Deaths relocate to contact, and the timer class is extinguished.** Scored, two audit legs graded from the new `melee-bout` event: (a) zero deaths from cohesion-floor conversion in 50/50 seeds (the mechanism no longer exists; failure = implementation error, not a miss); (b) killed − fire-killed − bout-converted = 0 per company per seed. The historical shape: dying at contact, not on a timer after escape.

**PR-33 — The escapes persist.** Scored: in at least 45/50 seeds, at least two of A/G/M end the day alive east of the channel. The bout must not un-win the retreat.

**PR-34 — The ford choke, both branches registered, scored on neither.** A populated choke (fire or bout events within the preserved 250 m Ford A extraction) would be the first model-generated crossing fight — bouts need no ammunition, so the dry-quiver explanation no longer forbids it — and **would supersede PR-29's ammunition reading in turn; that supersession is pre-registered here.** An empty choke means crossers outdistance pursuit through the window — informative for the junction question. Recorded per seed with locations.

**PR-35 — Coalition nearly untouched, direction-scored, two legs.** Scored: (a) the coalition killed median does not rise above the baseline 66 (rationale: the twenty-seventh's 219:2 — the bout barely runs in the trooper-on-warrior direction); (b) coalition band destructions fall below the 16/45 reference — **the interlock reaches the coalition too**: the baseline's band destructions were substantially cohesion-floor deaths, and the mechanism producing them is deleted for everyone. Band destructions holding at the reference rate would be a genuine surprise; a one-legged "nearly untouched" would have let it pass unremarked. Actual medians reported as data; no band is invented.

**PR-36 — The D81 exception's own prediction, with the registered ceiling.** Scored, exclusivity legs: wounded-to-killed conversions occur ONLY in break-outcome bouts — zero in flight, repulse, fire, or any other path, 50/50 seeds. **Registered upper bound, from the thirty-first measurement: total conversions cannot exceed the tight ceiling's order — 1,012 across 45 baseline-condition seeds (per-seed median 22, range 7–31); naive-sum 2,106 disclosed as the overcounting variant.** Magnitude within the ceiling reported as data; the ceiling is a bound, not a target, and conversions approaching it would themselves indicate the over-kill branch.

**PR-37 — The wing roster holds.** Scored: F4's five-destroyed criterion holds on the baseline seed, and complete wing destruction occurs in at least 25/50 seeds (the WO-D104 threshold carried forward for cross-campaign comparability). *Other branch:* the bout changing the wing's outcome in either direction is a finding about the northern fight, not a failure.

**PR-38 — Same stream.** Scored: scenario content stream `ba288f09` byte-identical. Engine-behavioral only; a scenario byte change is a STOP, not a miss.

### Registered observations, no direction scored

- **Bout counts against the planning bound:** ~610 episodes at the 50 m ring; realized bouts per seed reported against it.
- **Repulse frequency:** the Wolf Mountain branch now exists; its rate is data, and a zero would itself be informative — shock at valley odds may never lose.
- **PR-3's two readings continue** (mobile-escape vs breaking-under-fire, per seed); the rout-rally question stays open behind the junction ruling.

### RE-ARMED STOP (PR-5 class, fresh referents against the post-resolver world)

Work halts for adjudication if Reno A/G/M killed exceeds **60** in more than **5/50** seeds, or any seed reaches killed ≥ **100**. The same numbers as WO-D104's stop, deliberately: the baseline hit the first branch via dissolution, which this work order removes — a re-fire can only mean bout over-kill, so the threshold's meaning sharpens without moving, and cross-round comparability is preserved. Registered before dispatch; not to be moved.

### Compounding-uncertainty disclosure

The chain is five defects deep on one seed-family, and this work order adds the arc's first never-probed mechanism. The N=50 campaign is simultaneously the design's first measurement and its judgment; the wider sizing, the explicit unfavourable branches, and the audit legs are what that costs.

---

## WO-D106 — camp-defence command ownership: the plain gate (tier A)

**Tier A.** Committed alone, before the work order is frozen and before any dispatch. Ruling D106; work order follows at `docs/WO-D106.md`, written to match. No scenario byte changes — same stream.

**Preview disclosure, stated bluntly:** the thirty-third measurement ran this exact gate (dist-toggle form) over seeds 18760600–18760633 on this exact tree. Thirty-four of the campaign's fifty seeds are therefore *previewed, not predicted* — if the source implementation is faithful, they should reproduce the preview near-digit-exactly, and that reproduction is an implementation audit, not a prediction hit. **The predictions' real evidentiary content lives in the sixteen never-run seeds (18760634–18760649) and in the N=50 aggregates.** Sized accordingly.

**Baseline disclosure:** the pre-fix world is the committed D105 tree (`bce2814`): killed median 48 (N=34), coalition 77, complete wing 4/34, hill killed 169 at 60/40 combat-pursuit/initiative, ≥2-east 34/34. Its campaign stopped at 34+1 under its own stop.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-39 — The gate's world holds at N=50.** Scored: Reno A/G/M killed median falls below the baseline 48, and no seed reaches killed ≥ 100. (Preview at N=34: median 34, max 51, zero stop-class — the sixteen unseen seeds are the test.)

**PR-40 — The mode instrument moves as the ruling predicts, and stays moved.** Scored: hill-directed killed's combat-pursuit share falls below its baseline 60.4%, with the remaining hill killing initiative-dominant, at N=50. (Preview: 19 of 101.) This is the primary instrument per the standing adjudication — if casualties move but the mode split does not, something other than the ruling is doing the work, and that is reportable as a finding against the implementation, not a hit.

**PR-41 — The valley holds.** Scored: at least two of A/G/M end alive east of the channel in at least 45/50 seeds. (Preview: 34/34.)

**PR-42 — Coalition stays sourced.** Scored: coalition killed median inside 36–136. (Preview: 63.)

**PR-43 — The audit leg.** Scored: in 50/50 seeds, no unit holding an active camp-defence commitment ever carries a COMBAT or INITIATIVE pursuit (checkable from serialized state each tick). Failure = implementation error, not a miss.

**PR-44 — Same stream.** Scored: `ba288f09` byte-identical; a change is a STOP.

### Registered observations, no direction scored

- **Wing completion expected LOW and unchanged (~4–5/34-class rate):** the wing-completion deficit is the thirty-fourth's separately-owned finding (ammunition-starved bout loop), and this work order deliberately does not touch it. Registered so that a low wing count is read as the known deficit persisting, not as this ruling's regression — and so that any *movement* in it is visible as unexplained.
- **Reopen-clause instrumentation:** D92 switching events per pool band, and any band holding a commitment while a nearer eligible threat stands unengaged for a sustained window — the commitment-switch starvation signature that would reopen the B-variant. Data only.
- **Bout counts and hill/wing mode tables** reported in full for the bundle's baseline (this world, if it lands, is the bundle's pre-design referent).

### RE-ARMED STOP (PR-5 class)

Work halts for adjudication if Reno A/G/M killed exceeds **60** in more than **5/50** seeds, or any seed reaches killed ≥ **100**. Same referents as WO-D104/WO-D105, deliberately, with the meaning restated for this world: the preview shows zero seeds above 60 in the 34 previewed — a re-fire therefore means either the unseen-seed tail or a source-vs-preview divergence, both of which are exactly what should halt a campaign. Registered before dispatch; not to be moved.

### Compounding-uncertainty disclosure

Thirty-four of fifty seeds are previewed; the sixteen unseen seeds carry the genuine uncertainty, and the wing-completion deficit rides through this campaign unfixed by design. The bundle's northern registrations are not to be sized from this campaign's wing numbers — that sizing waits on the wing-finisher ruling's own campaign.

---

## WO-D107 — close-action finishing: the annihilation outcome, isolation-scoped (tier A)

**Tier A.** Committed alone, before the work order is frozen and before any dispatch. Ruling D107; work order follows at `docs/WO-D107.md`, written to match. No scenario byte changes — same stream.

**Baseline disclosure:** the pre-fix world is the accepted D106 tree: Reno killed median 32 (N=50), coalition 67.5, complete wing 9/50, ≥2-east 50/50 (49/50 all three), ford choke empty 50/50, bouts 634 all-break. The 36th's census bounds the annihilation set on this world (~198 wing catches, 2 Reno annihilation-eligible catches) — a static bound, not a behavioral preview: annihilations remove units and change subsequent dynamics, so this campaign is the design's first behavioral measurement. Sized accordingly, with the 26th's warned direction registered.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-45 — The wing completes.** Scored: complete wing destruction (C/E/F/I/L destroyed, co-d alive) in at least **30/50** seeds, against 9/50 baseline. Direction is the claim: the finisher transforms completion, demonstrated by a large move off the baseline. 30 was chosen at review over the drafted 35 because co-e's census catch-column is thin (19 across 50 seeds) and the recur dynamics that would fill it are exactly the static-vs-behavioral gap nobody has observed — the threshold does not stake the prediction on a hoped-for mechanism (the PR-25 lesson). *Other branch, registered:* completion below 30/50 with catches occurring means the recur dynamics under-deliver specific companies (the census's thin co-e/co-f columns) — a finding about catch distribution, not the mechanism failing; report per-company completion counts.

**PR-46 — The valley holds.** Scored, two legs: at least two of A/G/M end alive east in at least **45/50** seeds, and the Reno A/G/M killed median stays below **45** (the same referent as the D104 and D105 campaigns, held for cross-round comparability per review). The two known annihilation-eligible Reno catches (an isolated straggler remnant; seed 632's retreat-window fragment) are inside this envelope; a median approaching 45 means annihilations are reaching companies the census said were sheltered — the over-kill direction, owned by the stop.

**PR-47 — The audit legs.** Scored, graded from the extended `melee-bout` event (outcome gains `annihilation`): (a) every annihilation's defender was ROUTED before the bout and ISOLATED at it (no eligible friendly — STEADY, non-withdrawn, same-side combat unit — within 650 m); zero annihilations of first-break defenders, zero with an eligible friendly in radius, 50/50 seeds; (b) killed − fire-killed − bout-converted − annihilation-converted = 0 for every unit in every seed. Failure = implementation error, not a miss.

**PR-48 — Coalition stays sourced.** Scored: coalition killed median inside 36–136. The annihilation outcome targets cavalry (the 36th: zero coalition catches); material coalition movement means something else moved, registered as such.

**PR-49 — The choke, directional at last.** Registered expectation, per adjudication: seed-632-class catches — west-side, retreat-window, isolated — are **expected behaviour producing deaths where the record puts them**, and PR-34's choke-populates branch may now fire for the right reason. Scored leg: all annihilation and bout events within the preserved 250 m Ford A extraction reported per seed; a populated choke **supersedes PR-29's ammunition reading per the pre-registered chain** (bouts and finishes need no rounds). An empty choke remains informative (catches happening away from the registered extraction point — report catch locations).

**PR-50 — Same stream.** Scored: `ba288f09` byte-identical; a change is a STOP.

### Registered observations, no direction scored

- **Shelter-suppression events as data:** every catch-while-routed that does NOT annihilate because an eligible friendly stands in radius, with the friendly's identity, distance, and strength (the which-one-specifically practice, instrumented in the mechanism itself). The 618/647-class exclusions should appear here; a suppression by a weak shelterer is the known softness showing itself, reported not repaired. The thirty-eighth measured the softness harmless on the census world — all 22 shelterer instances are formed bodies (ratio min 73%, median 82%; strength min 29, median 37; the shattered-remnant arm empty) — so any suppression by a shelterer materially below that observed floor is the reopen signal for the formed question, on measurement.
- **Repulse remains 0-for-N watch:** the standing observation rides along.
- **Per-company catch and annihilation counts** against the census bound (198 wing / 2 Reno) — the static-vs-behavioral gap is itself informative.

### RE-ARMED STOP (PR-5 class)

Work halts for adjudication if Reno A/G/M killed exceeds **60** in more than **5/50** seeds, or any seed reaches killed ≥ **100**. Same referents, held deliberately for the fourth consecutive work order: on this world a re-fire can only mean the annihilation outcome reaching the valley beyond its census bound — the 26th's warned direction in its exact form. Registered before dispatch; not to be moved.

### Compounding-uncertainty disclosure

The census bounds the trigger set statically, but annihilations change the day: removed units release pursuers, alter catch sequences, and shift the northern fight the 32nd measured. This campaign is the design's first behavioral measurement, the sixth mechanism in the post-stop chain, and the last ruling scheduled before the bundle. Surprises are the register working.

---

## WO-D108 — Bench extent as goal geometry: the lip ruling (tier A)

**Tier A.** Committed alone, before the work order is frozen and before any dispatch. Ruling D108; work order follows at `docs/WO-D108.md`, written to match. **No scenario byte changes — the mechanism is a derivation (D102 `frontageMeters` class), and that claim is itself scored (PR-55).**

**Baseline disclosure:** the accepted D107 world: composite median 57.63; Reno A/G/M killed median 32 (4 seeds >60, max 68 — seed 632's disclosed number); complete wing 35/50; coalition killed median 70.5; **zero east-side Reno annihilations**; bench ground pressure per-seed peak 615/620/708, all of it within 30 m of the point (41st); stand-window ranges median 151.9 m centroid / 150 m effective (39th); timber features at zero pressure in all 50 seeds (41st). Evidence base for the ruling: measurements 39 through 44; the fifteenth design death and its METHODS entry stand behind the segment-boundary discipline below.

### Predictions (judged per D80, N=50, seeds 18760600–18760649; verdicts as they fall)

**PR-51 — The stacking dissolves (load-bearing).** Scored, two legs: (a) peak simultaneous warrior strength within 30 m of the bench point falls below the 41st's measured floor (615) in at least **45/50** seeds; (b) assigned-band goals span at least **150 m** of the lip arc in every seed-tick where ≥3 bands hold assignment. *Threshold basis, stated because it is geometric rather than comfortable:* every extracted lip cell lies ≥51 m from the bench point, so a band standing on its goal contributes zero pressure inside the 30 m radius — mechanically this should approach 50/50, and the 5-seed allowance absorbs transit spikes (bands passing the point en route), not mechanism failure; the per-seed distribution is a registered observation. The 150 m clears 3-band equal partition of the 260 m arc (~173 m end-to-end) without assuming a fourth assignment. If pressure still stacks at the point, the ruling failed regardless of every other verdict.

**PR-52 — The stand moves to the lip.** Scored, direction: warrior-on-Reno centroid ranges in the stand window (min 700–800) shorten — pooled median falls below the 39th's measured 151.9 m. Registered observation, not scored: effective median (39th: 150 m) expected to fall in sympathy, with the frontage contribution (~68 m median shortening) continuing on top. Cause pre-stated by the 44th's geometric note: all measured demand stood 51–100 m behind the lip; goals now sit on it.

**PR-53 — The valley holds, two legs.** (a) **Sanctuary, hard leg:** zero east-side Reno annihilations, 50/50 — the invariant has survived two mechanisms that could have breached it without touching D98 and stays hard; goals are west-side lip cells; any east-side annihilation is a MISS, not noise. (b) Reno A/G/M killed median **registered as expected to RISE from 32** — the named consequence of forward movement (shorter range, higher hit probability; the PR-15 shape: a worse casualty picture is the predicted result of a geometry correction, pressure stays on the ruled mechanism, nothing is tuned in response). Direction-registered, not band-scored, per the PR-25 lesson; the stop owns the tail.

**PR-54 — Northern confinement.** Scored: complete wing destruction within **30–40/50** (±5 of the D107 baseline 35) and coalition killed median inside the sourced band 36–136 (D107: 70.5). *Honesty note, kept exactly as constructed:* same stream plus deterministic engine means any wing movement at all is mechanism-caused knock-on — this leg scores knock-on MAGNITUDE, not noise. The ±5 permits knock-on about one-fifth of D107's own mechanism effect (the 9→35 swing was 26 seeds) while catching anything approaching mechanism scale; no repeat-campaign variance exists to calibrate against, so the ±5 is a judgment and is labelled as one. Knock-on channel named in advance: pool release timing (D93) shifting hilltop arrival — a northern move beyond threshold points there first.

**PR-55 — Reseed-free, scored on the hash.** Scenario content hash byte-identical (`ba288f09`). The lip derivation consumes terrain plus the existing bench point only; "this is a derivation, not data" is a falsifiable claim and this is its score. A hash change is a STOP.

**PR-56 — Audit invariants.** Zero tolerance, 50/50: every assigned goal lies on an extracted lip cell; every goal cell classifies WEST of the channel (D98 composition); no two bands assigned to the feature share a goal cell; goal count equals assigned-band count at every sampled tick. Any violation is an implementation error, not a miss.

### Registered observations, no direction scored

- Per-seed goal-partition layouts (which band holds which segment, by the ruled band-id order).
- Per-seed distribution of peak within-30 m pressure (PR-51's slack, watched).
- Timber features expected to remain at zero pressure — this mechanism must not touch them.
- Endpoint-flank event count (39th baseline: 2,591) as the stand geometry moves.
- F4 expected GREEN; five-destroyed roster untouched.
- Composite envelope before/after, carrying **the artifact-baseline line (adjudicated for this row): D108 moves the valley stand again, so every northern baseline figure inherits one more round of "measured against a world that no longer exists." The caveat has been shrinking since the eighteenth measurement and was partly lifted at D107; this round re-ages it by one. The bundle's registrations are not to over-claim the northern baseline's stability when sizing against it.**

### RE-ARMED STOP (PR-5 class)

Work halts for adjudication if Reno A/G/M killed exceeds **60** in more than **5/50** seeds, or any seed reaches killed ≥ **100**. Standing form, fifth consecutive work order — precedent carried forward, not re-derived. On this world a re-fire means forward movement over-delivering fire against the retreating battalion. Registered before dispatch; not to be moved.

### Compounding-uncertainty disclosure

This is the first behavioral measurement of goal geometry: the 44th extracted the lip statically, but moving four pools' stands changes engagement ranges, timing, and release downstream — the static-vs-behavioral gap that has surprised this register five times. The segment boundary is a 1-D convention owned in D108's row; these predictions test the mechanism against that stated boundary, not the boundary against history.

## WO-D111 — break 1: the inert-class commit (tier A)

*Registered 2026-08-02, before any implementation exists. Payload: the inert-class bytes — bench provenance MEDIUM→LOW with the B3/B2 note, the B4 timeAnchor reframe, and the three D100 foothill landmark entries (gate satisfied: the D90 dated annotation landed `3a2bd80`) — five edits for bisect purposes. Code half (UI `important`-set addition, banner rewording) is reseed-free and unregistered. The 180-claim transcription is break 2 per D109. All referent values below are from the committed D108 campaign (`reports/d108-campaign-results.json`, 50 seeds, stream `ba288f09`); medians floor-quantile.*

**PR-57 — One break, and only one.** The scenario content hash changes exactly once across the entire break-1 sequence (`ba288f09` → new value, recorded as the new stream id); combat and no-combat oracles refresh once each with documented cause (data-side commit; every stream re-rolls per D31a); the standing stop re-arms in its registered form against the new world. A second hash change anywhere in the sequence is a STOP.

**PR-58 — The PR-55-inverse core: the stream changes and nothing else.** Scored on the N=50 envelope against the committed D108 campaign — envelope statistics only, per the boundary ruling. Legs: **(a) envelope composite median reproduces EXACTLY at 57.63% (0.576282)** — any movement is a miss; the referent is tie-rule-independent (the 25th and 26th order statistics are identical, so the median is exact under any convention); the one-lattice-step allowance was considered and rejected as self-defeating, since the smallest possible movement IS one step (observation leg: 1/13 × 0.15 = 1.15 pp) and the allowance would license the entire realistic failure mode; the accidental one-character reseed held the median exactly, and the distribution concentrates. **(b) envelope mean within ±1.02 pp of 56.15%** — the bound is DERIVED, not chosen: per-seed composite sample SD across the 50 accepted seeds is 3.60 pp, SE = 3.60/√50 = 0.51 pp, registered bound ±2 SE = ±1.02 pp; computed from preserved committed results, independent of the break it judges. **(c) all four component envelope medians reproduce EXACTLY, scored separately:** checkpoint 50.00% (0.5), casualty 66.67% (6/9), endState 38.46% (5/13), observation 92.31% (12/13) — small-integer ratios that break 1 touches nothing graded by, and the legs the bisect would read. **The inertness claim, stated narrowly with its call sites, because the broad form is false:** confidence values DO gate scoring — an observation event below MEDIUM is scoped `excluded-confidence` (exam.ts:50–54), and `isCalibrationExcluded` (score.ts:144) scopes checkpoints (:174), side targets (:208/:216), and assertions (:256/:343), with HIGH filters at :182 and :338. This payload is safe because it was CONFINED to fields verified unread at their call sites — `coverFeatures[].provenance` is read nowhere, `meta.timeAnchor` is touched only by schema validation, and the foothill landmarks are unreferenced — not because provenance is a harmless category. (The coalition band is break 2.) **Non-independence, stated in advance:** the weighted sum of the component medians lands exactly on the composite median (0.35·0.5 + 0.25·6/9 + 0.25·5/13 + 0.15·12/13 = 0.576282) — not guaranteed in general, holding here because the distribution concentrates — so these five exact legs are closer to one-and-a-bit than to five, a miss will likely move several at once, and this registration claims no five-fold independent confirmation; separate scoring exists because the bisect reads components. **Pre-committed miss response (D109):** a per-edit bisect over the five payload edits; the row records which edit was load-bearing, or that none was (lattice-exceeding stream noise) — the ambiguity is named in advance and both outcomes are findings.

**PR-59 — Derivation invariance.** The lip extraction is byte-identical across the break (85 cells / 260 m / zero gaps >20 m / min 51 m / all WEST) — it consumes terrain plus the bench point, and neither changes (D101 superseded confidence, not coordinates); the pinned lip test stays green untouched. Pin (b) stays green: `coverFeatures` still yields exactly `scenario-bench` — the landmark vehicle adds nothing to the camp-defence candidate set by construction.

**PR-60 — Landmark inertness, on the instrument.** Pin (c) green post-commit with the three foothill ids absent from the consumed set (unreferenced by any order, checkpoint, assertion, or exam item — engine consumption is id-lookup only, and nothing looks these up). Zero behavioral channel attributable to the declaration. The UI labels appear only through the code half's `important`-set addition — visible change, unscored, disclosed.

**PR-61 — Standing forms re-armed, N=50 in the new world.** (a) Sanctuary hard leg: zero east-side Reno annihilations, 50/50 — any east-side annihilation is a MISS. (b) Stop: >5/50 seeds above 60 Reno killed, or any ≥100 (registered thresholds, stream-independent, not to be moved). (c) Watch counters, **frequency-only, no threshold, registered here so their observed values are citable:** the approach-vector-vs-radius recurrence count (the named bench item) and the switch-to-nothing stranding count (the D98-annotation watch, feeding the switchThreat candidate measurement behind break 2). **Any future threshold on either counter must be justified on grounds independent of this campaign's observed value** — D80's discipline applied forward: frozen criteria, findings reported as they fall, never re-derived after seeing what they select from. Stated here so it cannot be constructed later.

**PR-62 — The re-baseline, registered as observations.** The break-1 campaign's envelope distribution, the ground-pressure census, and the valley-range instrument run in the same WO and enter the register as THE NEW BASELINES — nothing registers against a pre-break number afterward. The measured deltas on every watched statistic are recorded as the PURE-RESEED NOISE FLOOR: the null distribution break 2 is judged against. No thresholds — the noise floor is the measurement, and a threshold on the quantity being measured would presuppose it.

**PR-63 — Seed-fragile gates and the frozen selection, registered before the break.** (a) F4's single-seed character may flip and is adjudicated **on the envelope only**, per the standing seed-fragility finding (METHODS §6: across the accidental reseed, F4's failure mode changed qualitatively with zero mechanism change). A baseline-seed flip is expected reseed behaviour — not a miss, and not evidence about the payload; without this registration, an expected artifact would read as a load-bearing-byte finding through a channel PR-58's ambiguity clause does not cover. (b) The D80 typical-seed criteria **re-run unchanged** against the new distribution; whatever they return — a member, several, or none — is reported as a finding, and they are not re-derived after seeing the distribution they select from (the criteria stood still through six consecutive empty rounds, then selected 18760612 at D107 and 18760616 at D108 without anyone moving them; that record survives only if they stay still across a reseed too).

*Component-lattice note: the denominators above match METHODS §6's stated lattice (9 casualty legs, 13 end-states, 13 observations), confirming component identity; the values differ from §6's examples because the world moved.*

## WO-D112 — break 2: the value-class commit (tier A)

*Registered 2026-08-02, before any implementation exists. Payload: the named value bytes — coalition killed 36/60/136 source-per-bound (300 removed as the discredited bound), coalition wounded 160 flat (bounds UNAVAILABLE, not agreed; the Red Horse coupling noted — one testimony supplies the killed high and the wounded figure), pony strength = total herd 15000/15000/25000 LOW with the dawn-visible subset moved to the Crow's Nest observation event — plus the 61-claim transcription (docs/research/O5-TRANSCRIPTION-SPLIT*, `0c65e97`; the channel map read from the source, sixteenth catch). Preconditions: PIN (d) lands green before the break — the set of provenance paths whose note contains the calibration-exclusion flag equals the ruled three (`variants[5].patch.addOrders[0].provenance.note`, `variants[5].provenance.note`, `variants[6].provenance.note`, measured 2026-08-02); Amendment-1 acceptance semantics and Amendment-2's payload-pin class are standing law, with the payload-pinned assertion enumeration performed at WO freeze. Pre-drafting measurements on the committed D111 stream (`8e28552c`): coalition killed runs 25–98 (inside both old and new bands — the killed edit is scoring-inert in that world); wounded anchors 121/122 (seeds 18760600/18760616).*

**PR-64 — One accepted break.** Amendment-1 semantics: the stream is accepted at first engine execution; editor-time corrections permitted before it and disclosed by hash; a second break is a STOP. `8e28552c` → new id recorded; combat/no-combat oracles refresh once each with cause; the stop re-arms in registered form.

**PR-65 — Pin (a) fires, and is re-pinned in the same tree.** The registered firing (D109 row): the coalition band edit turns the ratio pin RED; the same WO carries the simultaneous code-side update and the pin returns green at the new conservative cross-products — low 36/160 = 0.225, best 60/160 = 0.375, high 136/160 = 0.85. The us-7th assertions (including the 268/52 declared exception) are untouched. A pin that never fires is indistinguishable from a pin that isn't wired; this is the wiring test.

**PR-66 — The designed movement is the WOUNDED leg, the killed leg is inert, and the CEILING IS DECLARED.** (a) STRUCTURAL AND EXACT: `low = high = 160` is not a band; it is an equality test on an integer count. The coalition-wounded leg passes iff the model produces exactly 160 coalition wounded, failing identically at 121, at 159, and at 161. **From D112 forward, C2's maximum achievable score is 8/9 = 0.8889, permanently, until a width-bearing wounded source is located — and the composite's reachable maximum falls by the same 2.7778 pp.** Two seeds already sit at 0.8889 in the D111 world; after D112 that value is the maximum, not a good outcome. Declared here so future rounds do not chase a C2 ceiling that does not exist, and so a persistent wounded failure reads as a SOURCE deficiency, not a model deficiency. (b) Killed: zero C2 flips — measured against the D111 stream, every seed's coalition killed inside both bands. (c) Flip fraction: the anchors say effectively all seeds flip, but the fraction is measured against the D111 stream and the D112 stream re-rolls — the pre-freeze 50-seed distribution measurement is an ESTIMATE of a quantity the break itself changes; registered as approximate, source stream named. (d) PRIMARY LEG, structural: **the composite median steps down exactly one C2 lattice notch**, conditional on the flip fraction being 1; the implied point value is 54.8504% (57.6282 − 2.7778), resting on two stated assumptions — every seed flips, and the reseed leaves the median unmoved. The second is the measured floor (median 0.0000 pp) at n = 2 observations — the accidental reseed and D111's deliberate one — enough to register on and not enough to treat as a law. (e) Mean: falls ≈ 2.78 pp × flip fraction, judged against the derived floor (PR-71(e)) around the post-PR-66 expectation. (f) THE HONEST-INSTRUMENT LINE, stated in advance so the drop cannot be read as regression: the encoded 100–200 band was PASSING a model that wounds ~121 against a sole sourced figure of 160 — the spread's generosity was unsourced, and the ruled degenerate band makes the grading honest about a ~25% under-wounding. PR-15 shape; nothing is tuned in response. **The exclusion flag is NOT used to suppress the leg**: exclusion would yield 5/8 = 0.625 rather than 5/9 = 0.5556 — a 1.74 pp composite difference — and the flag's ruled semantic is counterfactual variants, whose set pin (d) fixes at three. The wounded gap is surfaced as a FAILURE, visible, never hidden as an exclusion. (g) The O5 revisit register gains the item: **a wounded figure with width, from any locatable source, restores the leg** — recorded beside the pony-census threshold.

**PR-67 — C3: thirteen predicted no-ops.** All 13 endState claims are already HIGH and O5's cluster verdict is "UPGRADED cleanly" — transcription confirms tiers, C3's membership is unchanged, C3 median stays 5/13. A free falsifiable check inside the value commit: any C3 membership movement means a transcription edit was load-bearing, caught by the component medians exactly as the scoring instruction directs.

**PR-68 — C1: the score cannot move; the gate line may.** Checkpoint confidence feeds only the `:182` HIGH-subset PASS gate, not the component score. C1 median stays 0.5. Up to three MEDIUM checkpoints (`cp-reno-ford-a`, `cp-reno-skirmish-line`, `cp-weir-point`) are upgrade candidates under O5's GNIS/Fox criterion, per-claim tiers assigned at WO freeze; any gate-subset growth is reported, not scored.

**PR-69 — C4: one hinge claim, and both denominators reported.** The standing 2026-07-28 refusal governs the nine MEDIUM observation events: no DEM self-citation, textual re-sourcing only, tiers unchanged. The hinge is **#133 `obs-custer-weir-village` (DISPUTED)** — the Weir Point line-of-sight is RCOI-documented (Davern/Weir), the only legitimate EXTERNAL upgrade path; its target tier is assigned at WO freeze. Conditional registration: if it upgrades to ≥ MEDIUM, the gateable set grows 13→14 and C4's referent changes shape (12/13 → x/14), with BOTH denominators reported — a component whose denominator moves is not comparable across rounds without them; if it stays DISPUTED, C4 is unchanged at 12/13.

**PR-70 — The flag invariant on its instrument.** Pin (d) green before and after the transcription: the set of provenance paths whose note contains the calibration-exclusion flag equals the ruled three, the same set byte-for-byte. Any intended change is its own ruling, never a transcription side-effect.

**PR-71 — Standing forms, re-armed for the new world.** (a) Sanctuary, two legs as ruled at D111 acceptance: the HARD INVARIANT at zero east-side Reno annihilations (validity claim — any is a MISS) AND the calibrated expectation ~1 in 50 recorded as the measured-rate referent, frequency-reported, no threshold, threshold-independence clause standing. (b) Stop: registered form, not to be moved. (c) Lip byte-identical; pins (b)/(c) green, foothill ids still unreferenced. (d) F4 on the envelope only; the D80 criteria re-run unchanged; whatever they return is a finding. (e) Scoring instruction, registered AS INSTRUCTION: the mean is the instrument that can speak, judged against the freshly derived floor from the D111 baseline — per-seed sample SD 4.0371 pp, SE 0.5709, ±2 SE = ±1.14 pp — around the post-PR-66 expectation; median-unchanged is uninformative; component medians are where a confidence edit shows first.

*Resolved at WO drafting, measured not reasoned: the full wounded distribution across the D111 stream (refines PR-66(c)'s estimate); the payload-pinned assertion enumeration; per-claim target tiers for the three MEDIUM checkpoints and #133; the us-7th `sideCasualties` question — adding an entry bypasses the `:211–222` per-company synthesis entirely, consequence stated, decision measured.*

### PR-66 bands completed (dated amendment, 2026-08-02, before the D112 row and WO freeze; original entry above untouched)

*The pre-freeze measurement returned (probe `7e023ce`: wounded 66–243, median 177, flip fraction 29/50, twenty seeds already failing the OLD band, exactly one seed at 160) and the adjudicator completed the bands. The n = 2 anchor was two low draws from a wide distribution — the structural/stream separation absorbed it exactly as designed: the conditional's condition (fraction = 1) is not met, and the one-notch median step leaves the expectation without ever having been a wrong registration.*

**Mean leg, scored:** expectation **55.11%** (56.7179 − 29/50 × 2.7778 = 55.1068), band **± 1.16 pp** — the two independent noise sources combined in quadrature (√(1.1419² + 0.19²), reseed floor and binomial fraction noise). The designed movement clears its own band: the first time in this project a data commit has a predicted effect larger than its measured noise floor, knowable only because break 1 was bought.

**Median leg, scored as directional and bounded:** the composite median does NOT rise, and falls by AT MOST one C2 notch — the scored region is the closed interval **[54.8504%, 57.6282%]**; a rise is a MISS, a fall beyond one notch is a MISS. (Stated as the interval, not as a two-point set: each seed's composite moves down by exactly zero or one C2 notch, so the 26th order statistic is bounded by the interval — but it can land on ANY seed's value inside it, including intermediate lattice families such as 55.7051, whichever seed comes to occupy the middle rank.) The D111-stream projection — median unchanged at 57.6282, because none of the fourteen median-value seeds flips — is recorded as the expectation WITH ITS STREAM-FRAGILITY NAMED: a rank coincidence on a specific arrangement the D112 stream re-rolls; reported, not scored. A still median at D112 is now predicted rather than reassuring, and the mean carries the falsifiable weight — the floor's asymmetry used, not merely acknowledged.

**Recorded for the D112 row as its own line (the adjudicator's ruling):** twenty of fifty seeds already fail the OLD wounded band — the leg has been failing 40% of the time, silently, in the world we already had; the encoded band was both unsourced AND insufficient, and the model's wounded output ranges 66–243 against a target nobody could source. The measurement that found it was forced by a registration — the strongest single argument the arc has produced for measure-before-freezing. And exactly one seed of fifty lands on 160: the declared C2 ceiling is reachable once per fifty, and only by accident.

**Tier rulings (adjudicated, carried to the WO):** `cp-weir-point` MEDIUM→HIGH (the GNIS/Fox criterion's clean case); `cp-reno-ford-a` and `cp-reno-skirmish-line` stay MEDIUM (APPROX/inference, excluded by the criterion); **#133 `obs-custer-weir-village` DISPUTED→MEDIUM** (RCOI Davern/Weir: an upgrade with a source, not a self-citation; relayed testimony stops short of HIGH). Consequences: gateable 13→14; C4 reported with BOTH denominators on every cross-round comparison; `m3a-gates.test.ts:94` becomes the sanctioned second payload-pin member (13→14 with cause) — the ruling licenses the pin, never the reverse.

### Reading-order pre-commitment for PR-66 (2026-08-02, registered while the D112 campaign runs, before any result is read)

*The adjudicator's pre-commitment, same spirit as the consumption-instruments-first ruling — the reading order is fixed before the number exists to choose it by.* **If PR-66's mean misses, the first read is the OBSERVED FLIP COUNT, not a diagnosis.** The campaign measures coalition wounded per seed directly, so the D112 flip fraction is a reported quantity, not an inference, and it decomposes any miss without a bisect: flip fraction ≈ 29/50 with the mean still missing → the arithmetic was right and something outside the registered payload moved — a finding, and it goes to the instruments; flip fraction materially different from 29/50 → the registration's mechanics were right and the D112 stream drew a different wounded distribution — the reseed doing what the caveat said it would, with the ±0.19 pp binomial term already accounting for part of it, and whether the residual clears the band is then arithmetic rather than judgment. Either way the answer comes from a number the campaign already collects. No rerun, no bisect, no diagnosis in the report — misses stay report-only, as ruled. **Two live registrations, neither a formality:** the stop, armed in registered form, which has fired once in this project's history; and the sanctuary hard leg, which has missed in two consecutive worlds at one in fifty — a third instance would be the third independent stream, and at that point the STEADY-shelter question stops being the head of a queue and becomes the next thing ruled.
