# WO-D97 — Frozen Work Order: no-crossing camp defence, scout exclusion

**Status: frozen before dispatch.** Written 2026-07-26 against rulings D97, D98, D99 (`docs/IMPLEMENTATION_HISTORY.md`) and the tier-A predictions PR-9–PR-13 (`docs/PREDICTIONS.md`, commit `b6a0055`, committed alone before this file existed). This work order was written to match those predictions; the predictions are never amended to match this file.

**Self-contained. Assume zero prior context.**

---

## Context

WO-D93/D96 (commit `ac52c46`) made camp defence live: bands commit, hold features, release symmetrically, and close on cohesion-degraded threats. Its verification exposed a **sequence inversion**: in the worst seed, camp-defence bands crossed the river at minute 622, stood in east-bank timber 692 m from Custer's passing column, and destroyed the wing by 653.5 — before Reno reaches Ford A at 675. History has that fight three hours later. The root cause is measured, not inferred (preserved probes, `.claude/d98-ratchet-test.mjs` and `.claude/d98-crossing-test.mjs`):

- A closing-threat "new minimum approach" predicate was designed and **killed by measurement before freezing**: the bluff route converges on the village strip, so the passing column sets new minimum believed approaches to four camps (up to 13 each) during the exact commitment window.
- The replacement, ruled as D98: **camp defence does not cross the river.** Measured on seeds 18760643 and 18760625: it kills the interception (west stands are 713–1,684 m from the column with no closing path), loses no legal behaviour (every observed camp-defence crossing is interception-class — including baseline bands re-crossing at 808.5 against co-e, which means the *late* destruction cluster was partly camp-defence-driven too; the valley fight is fought entirely west-bank; all Ford-B-area crossings are order-driven), and re-freezes nobody (0 of 96 committed samples lose their last eligible feature).
- Separately measured: pool bands committed to **crow-scouts** (650) and **arikara-scouts** (660) as camp threats. D99 excludes scout-profile units from camp-threat eligibility.

Baseline for this work order: commit `b6a0055`; tests 81/82 (F4 the sole red — co-d overshoot, PR-8-registered); baseline-seed composite 58.48%; envelope median 52.07%; scenario stream `ba288f09` (must not change — D31a).

## Scope — two changes under one sequencing ruling

1. **D98 — camp defence does not cross the river** (defect class). Bands acting under camp defence may not cross the 1876 channel: feature-goal selection and closing movement are confined to the defended camp's side of the river. Side-of-channel classification is **derived at load from the committed channel geometry** (`docs/o4-corrections-data.json` → `channel.points`, 298 points S→N; the D92(d) derivation pattern — no scenario duplication, no new number). Threat eligibility is unchanged: a cross-river threat may hold a commitment (watched from a west-bank feature at range) but cannot be closed on. Order-driven movement is untouched — the scheduled axes cross freely. Movement toward the camp's own side (coming home) is always permitted.
2. **D99 — scouts are not camp threats** (defect class). Units whose `tacticsProfileId` is `irregular-scout` are excluded from camp-threat eligibility. Profile scoping per the D75 precedent, not unit kind. Reopen clause per the D60 pattern: reopens if O5 or later sourcing documents a band-level sortie provoked by scouts at the lodges.

Under **D97 (sequencing)**: this is a defect round. No calibration of any kind — `moraleSuppressionDrain` testing is queued behind a clean baseline; `state.ts:241` eligibility stays held.

**Anticipated ambiguities, named in advance:** the side classifier's representation (per-cell raster derived at load vs runtime polyline test) and its treatment of on-channel/ford cells; the semantics of a held CHARGE whose target crosses to the far side mid-charge (halt at the bank? release per D93?). If a needed rule is not derivable from the rulings, existing structural constants, or sourced material: `TODO-AMBIGUOUS`, STOP, report — the D92/D96 precedent, now twice-proven.

## Out of scope — do not touch

Any `[CAL]` value, explicitly including `moraleSuppressionDrain` (queued per D97); global lethality rails; `state.ts:241`; unit frontage; scenario data of any kind (if you believe a scenario byte must change, that is a STOP — D31a re-rolls every stream); `docs/PREDICTIONS.md`; all prior codex reports.

## Pre-registered predictions — PR-9 through PR-13

The governing text is `docs/PREDICTIONS.md` (commit `b6a0055`); binding; not restated here to avoid divergence. Note PR-9's registered scoring rationale (first casualty, not engagement-open), PR-11's unscored registered expectation that the destruction count FALLS, and the pre-committed miss responses. **PR-5's overshoot stop remains armed verbatim: Reno killed above 26.09 in more than 5 of 50 seeds halts everything for adjudication.**

## Proof required

1. **Quartet** verbatim; reds reported red; new tests named.
2. **Composite audit**: baseline-seed before/after (state the stream) and envelope-to-envelope (median and mean, N=50).
3. **Probes re-run** from repo root against the new build: the four `h1-*` probes, `.claude/cohesion-asymmetry-probe.mjs`, and `.claude/d98-crossing-test.mjs` on seeds 18760643 and 18760625 — the crossing test must show **zero camp-defence crossings** post-fix, with order-driven crossings intact.
4. **PR-9–PR-13 verdicts** with their measured distributions (first-casualty orderings; completions before 800; completion-minute median; coalition wounded median and max; scout-commitment count), plus the registered observations reported as data (P3 count, destruction count, both-bands count).
5. `[CAL]` byte-identity; scenario content hash unchanged (`ba288f09`).

Output: `codex-report-wo-d97.md` at repo root, house format, AMBIGUITIES and DEVIATIONS included. **Do not commit or push.**
