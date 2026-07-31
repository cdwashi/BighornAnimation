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
