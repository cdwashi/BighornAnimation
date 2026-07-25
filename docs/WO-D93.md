# WO-D93 — Frozen Work Order: release symmetry, F6 re-baseline, closing mechanism

**Status: frozen before dispatch.** Written 2026-07-25 against rulings D93, D94, D95 (`docs/IMPLEMENTATION_HISTORY.md`) and the pre-registered predictions PR-1–PR-7 (`docs/PREDICTIONS.md`, commit `ff57568`, which precedes this file and any dispatch). This work order was written to match the committed predictions; the predictions are never amended to match this file — a genuine scope mismatch gets a dated note in the register, not an edit.

*Provenance note:* an earlier draft of this document was prepared as a post-dispatch reconstruction, under the belief that a dispatch had already occurred. Machine-of-record investigation established that none had — no Codex session ever received this work order (see the PREDICTIONS.md correction note and NEGATIVE_RESULTS.md §1). This file is therefore the genuine, contemporaneous referent.

**Self-contained. Assume zero prior context.**

---

## Context

WO-D91 (commit `b139b42`) fixed the camp-defence participation defect: contact mass against Reno rose 444 → 964 and the backward-walk artifact is gone by construction. Three findings remain, each now ruled:

1. **Bands pin to a departed threat.** Activation fires when a threat comes within `campDefenseRadiusMeters` (3,000 m) of the defended camp; `release()` never consults that predicate, firing only on loss of spotting, threat destruction/withdrawal, or arrival of a real order. Consequence: bands committed to Reno never release to follow the fight north. F4 is red — complete wing destruction in 8/50 seeds, late (858–861 vs historical 825–840).
2. **The F6 work ceiling encodes a dead world.** The 11.1M expansion ceiling was set when 26% of warriors participated; the D91 defect fix invalidated that state (observed 11.55M on the committed stream — participants ~2.2×, work +~6%).
3. **Bands position but never close.** P3 missed 0/50 (no A/G/M ever BROKEN, ford choke empty) exactly as D92 pre-recorded; P4 missed low (Reno killed 6–20 vs sourced band 19.24–26.09).

Baseline for this work order: quartet 78/80 with F4 and F6 the two known reds; baseline-seed composite 55.71%; envelope median 52.07% (figures are stream-specific per D31a — any scenario byte change re-rolls the PRNG; cross-version comparisons are envelope-median to envelope-median).

## Scope — three changes, one round

1. **D93 — Release symmetry** (`engine/src/camp-defense.ts`, defect class). A band releases its committed threat when that threat leaves the radius that would have triggered activation — the same `campDefenseRadiusMeters` predicate, structural reuse of the existing 3,000 m value, no new number. Existing release conditions (threat destroyed, withdrawn off-field, real order arrives) are unchanged. On release the band re-enters normal camp-defence evaluation (it may re-commit to a nearer spotted threat, or stand down per existing rules).
2. **D94 — F6 re-baseline** (`engine/tests/m4a-gates.test.ts`). Re-derive the expansion ceiling **tied to active participant count, with the derivation recorded in the test comment** — basis: expansion work scales approximately linearly with active participants (PR-7). Explicitly NOT set to just above the current observation; a ceiling moved to wherever the current run lands is not a ceiling. The scratch-allocation bound and the deterministic-calls oracle are untouched except as honest measurement requires.
3. **D95 — Closing mechanism** (engine, camp-defence/engagement seam). Closing ruled on **local numerical superiority**, which the sources support and the engine can express. **The historically attested trigger is flank exposure — 500+ warriors against Reno's left and rear, on an unanchored flank in open ground. That trigger is not computable in the current model:** under the D91 rider, units are dimensionless points and Reno's three companies occupy one position; there is no flank to turn. This substitution is disclosed in D95 itself. Pre-registered before any result: if numerical superiority alone does not reach P3/P4, flank exposure is the next candidate and the frontage adjudication becomes its prerequisite. **Not a parameter change, in either case.**

**Anticipated ambiguities, named in advance:** the rulings do not state the superiority ratio, its evaluation radius, or the precise behavioral expression of "closing" (e.g., transition into the existing CHARGE/engagement machinery). If any needed value or rule is not derivable from the rulings, existing structural constants, or sourced material, do NOT choose silently — flag `TODO-AMBIGUOUS`, STOP, and report, per the D92 precedent. A STOP is cheaper than a laundered constant.

## Out of scope — do not touch

Any `[CAL]` value; global lethality rails; the DEFEND_CAMP eligibility rule at `state.ts:241` (pre-registered as the next candidate if PR-1 misses — a separate ruling, not this work order); unit frontage (D91 rider — prerequisite only of a *future* flank-exposure ruling); the empty RAVINE and HISTORICAL_CORRECTION raster codes; `DUST_SMOKE_ZONE`; `docs/PREDICTIONS.md` (never modified by an implementation or results commit); scenario data (none of the three rulings touches it — if you believe a scenario edit is required, that is a STOP, because it would re-roll every stream per D31a).

## Pre-registered predictions — PR-1 through PR-7

The governing text is `docs/PREDICTIONS.md` (commit `ff57568`); it is binding and is not restated here to avoid divergence. Every PR is judged as a distribution per D80, N=50 seeds (18760600–18760649); verdicts are reported as they fall, in a commit that does not modify that file. **PR-5 is a live stop condition: if Reno killed exceeds 26.09 in more than 5 of 50 seeds, halt for adjudication — do not tune down.** PR-6 requires coalition killed/wounded reported against their sourced bands. The pre-committed responses to anticipated misses in that file apply verbatim.

## Proof required

1. **Quartet** — typecheck · lint · tests · build — verbatim output. Reds reported red; no gate threshold weakened; the D94 ceiling change must show its derivation.
2. **Composite audit**: baseline-seed before/after (state the stream) and envelope-to-envelope (median and mean, N=50) — the envelope is the judging instrument.
3. **The four preserved probes** (`.claude/h1-*.mjs`, run from repo root) re-run against the new build.
4. **PR-1–PR-7 verdicts**, each with the measured distribution behind it (wing-destruction seed count and minutes; C3 holds; A/G/M BROKEN seed count and ford-choke composition; Reno killed/wounded spans and median vs band; PR-5 threshold count; coalition casualties vs bands; F6 exceedance rate across seeds).
5. New tests named; all `[CAL]` values byte-identical; no scenario-content change (assert by content hash).

Output: `codex-report-wo-d93.md` at repo root, house format, AMBIGUITIES and DEVIATIONS sections included. **Do not commit or push.**
