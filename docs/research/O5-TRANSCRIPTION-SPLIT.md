# The O5 transcription split — value-class / inert-class, per D109 as annotated

*CC's owed break-2 pre-work, 2026-08-02. Output is a claim, not a count (Fable's directive):
every one of the 180 claims is classified in the row table
(`O5-TRANSCRIPTION-SPLIT-ROWS.md`, beside this file), and the classification method is stated
so it can be audited in one read. Split passed by Fable 2026-08-02; the channel-map correction
below adopted in the same ruling.*

## Method and authority

Source: O5-RESOURCING-PROMPT.md Appendix A — the mechanical extraction of all 180 weak-source
provenance blocks, each carrying its scenario path as the claim id. Classification is by
locus against the CODE-VERIFIED gated set (the call sites verified at D111's PR-58(c)
narrowing and re-verified for this split):

| gated surface | claims | authority |
|---|---:|---|
| `calibration.casualties.*` | 24 | score.ts:242 (band.excluded) |
| `calibration.endState.*` | 13 | score.ts:256/:343 + HIGH filter :338 |
| `observationEvents.*` | 11 | exam.ts:50–54 (scopeFor gateable) |
| `checkpoints.*` | 6 | score.ts:174 + HIGH filter :182 |
| `calibration.sideCasualties.*` | 2 | score.ts:208/:216 |
| **code-gated subtotal** | **56** | |
| `variants.*` — AMBIGUITY DEFAULT, named | 5 | Fable's rule: not obviously one of the four → value-class by default. Variant provenance blocks are calibration-adjacent (they patch orders/endStates); nothing verified reads their confidence, but "verified unread" was not established for them and the default governs. |
| **VALUE-CLASS total** | **61** | |
| **INERT-CLASS total** | **119** | landmarks 15, units 55, leaders 14, orders 15, weapons 7, tacticsProfiles 2, terrain.cover 1, others — surfaces whose confidence feeds no scoring path (the verified pattern class of D111's payload) |

Note the fifth code-gated surface: Fable's directive named four; `calibration.casualties`
(the per-company bands) is ALSO gated at score.ts:242 and is classified value-class on the
code authority, not the ambiguity default. The code is the authority; the four were the list.

## Two refinements for Fable's pass, both flagged as carrying opinions

1. **The 61 is the conservative outer bound by surface.** Fable's criterion is "edits that
   TOUCH CONFIDENCE on a gated surface." Of the 56 code-gated claims, current confidence runs
   41 HIGH / 12 MEDIUM / 3 DISPUTED, and O5's cluster verdicts (casualties and endState
   "UPGRADED cleanly") mean many transcriptions will CONFIRM the existing tier — a textual
   edit, no confidence delta. The per-claim delta subset can only be pinned when the WO
   assigns each claim its O5 target tier. **Opinion: keep all 61 in the value-class commit
   regardless** — splitting gated-surface claims by whether their confidence happens to move
   would create a third class and a second seam; under-classifying is the named failure, and
   the cost of over-inclusion is only registration breadth.
2. **Overlaps with the already-named break-2 payload, stated so nothing is counted twice:**
   claims #166–167 are the coalition sideCasualties band — already the named value payload
   (killed 36/60/136, wounded 160 flat) with its own registration; the two `units.pony-herd`
   claims classify INERT by surface (units.*), while the pony STRENGTH VALUES are separately
   the named payload — the transcription touches the pony provenance note, the named payload
   touches its values, and the registrations must not blur that line.

## The scoring channels, verified at the source — with a correction to the pass

*Added after Fable's pass ordered the `sideBand` mechanism written in. Opening the source
before writing it found that part of the passed description does not survive the code. Fable
adopted the correction in full (sixteenth catch, his, fifth of his on the session): "There is
no exclusion threshold... my passed disposition was wrong... the page was read, not
remembered." The record shows the pass, the source read, and the reversal — not a quietly
better table. His flag-invariant strengthening is ruled: the invariant becomes a D110-class
PIN (d) landing before break 2 — a test asserting the set of provenance paths whose note
contains the exclusion flag equals the ruled set — because `.includes()` on a lowercased note
is exactly the kind of predicate a rewritten sentence trips by accident, and membership needs
an instrument.*

**Exclusion is a NOTE FLAG, not a confidence threshold.** `isCalibrationExcluded`
(score.ts:144) keys on `CALIBRATION_EXCLUSION_FLAG = 'counterfactual: excluded from
calibration scoring'` (:91) appearing in the provenance NOTE (:138–142). There is no
confidence value in the predicate. Therefore: **a per-company confidence downgrade does NOT
shrink the us-7th band** — the `:216` survivor filter and the `:218–219` low/high sums key on
the flag, and the passed sentence "a single downgrade below the exclusion threshold silently
shrinks the US band" has no code path. The `sideBand` fall-through itself is exactly as
described (`:203` coalition short-circuit; `:211–222` us-7th synthesis from per-company
bands; the add-an-entry question stands, measured not reasoned) — the correction is to what
drives the arithmetic, not to the structure.

**The confidence channels with arithmetic effect, ranked by consequence:**

| surface | claims | channel | effect |
|---|---:|---|---|
| `calibration.endState` | 13 | `:338/:345` — included in C3 ONLY if confidence === HIGH | **strongest**: membership in C3's denominator; an upgrade to HIGH adds an assertion to scoring |
| `observationEvents` | 11 | exam.ts:50–54 — gateable only at MEDIUM/HIGH | C4 denominator membership at the MEDIUM boundary |
| `checkpoints` | 6 | `:182` — HIGH subset feeds C1's PASS GATE | moves the gate line, NOT C1's score |
| `calibration.casualties` | 24 | `:220` — every-HIGH → HIGH else MIXED, consumed at `:241` as a LABEL | **reportorial only** — no arithmetic path from per-company confidence to C2 |
| `calibration.sideCasualties` | 2 | `:203–209` values + label | C2's arithmetic moves via the VALUES (the named band payload) |

Consequences: (1) the 24 casualty claims are the most NUMEROUS value-class members and the
least consequential — the passed ranking inverts; the 13 endState claims are the strongest
channel; (2) **C2 has one hand on it, not two** — the coalition band values; per-company
confidence edits cannot reach C2's arithmetic; (3) the note-flag channel is real on every
calibration surface and transcription edits notes — proposed WO invariant, pinned
mechanically: **the set of flag-bearing provenance notes is identical before and after
transcription** (any intended change is its own ruling, never a transcription side-effect).

All 61 stay value-class — the classification was by surface, not by channel, and the
conservative bound survives the correction; what changes is the C1/C3/C4 direction work
(the 13 endState claims join the 17 as direction-bearing) and the registration language.

## What this feeds (break 2's predictions draft)

- The C1/C4 direction registration Fable ordered: C1's instrument is the checkpoint HIGH
  filter (:182) and C4's is the obs-event gateable boundary (:50–54). The 6 checkpoint claims
  and 11 obs-event claims are the entire channel. Direction depends on O5's per-claim target
  tiers (cluster A-CHECKPOINTS-OBS is MIXED — per-claim reading at WO drafting); the
  registered direction comes from that reading, made before any campaign runs.
- The scoring instruction from the acceptance row, to be written into D112's predictions as
  an explicit instruction, not background: **the mean is the instrument that can speak,
  judged against ~0.5 pp of pure-reseed noise; median-unchanged is uninformative; component
  medians are where a confidence edit's effect on C1 or C4 shows.**
- Pin (a) FIRES at break 2 (registered in the D109 row): the coalition band change turns the
  ratio pin red, and the break-2 WO carries the simultaneous code-side update.
- The sanctuary registration per the acceptance row: the hard invariant at zero (validity
  claim) AND the calibrated ~1-in-50 frequency expectation as a separate leg.
- The us-7th aggregate question (sixth catch, D110 evidence column): does `sideCasualties`
  gain a us-7th entry; does the scenario carry the hilltop-inclusive 268.
