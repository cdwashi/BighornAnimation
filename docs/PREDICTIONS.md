# Predictions Register

Pre-registered expectations, committed before results are known. Append-only. **Entries are never edited after a result is known** — a superseding entry is added with a dated note instead.

Companion to `METHODS.md` §5.

---

## Provenance of this register — read first

This file begins mid-project. The evidentiary strength of its entries is **not uniform**, and the differences are stated rather than flattened.

| tier | what it means | entries |
|---|---|---|
| **A — full protocol** | Predictions committed in their own commit, containing no implementation and no results, before dispatch. Git timestamps establish ordering independently. | WO-D94 onward |
| **B — prior to knowledge** | Committed after dispatch but **before any result was known**. Protects against fitting predictions to observed outcomes; does **not** establish priority over implementation. | WO-D93 |
| **C — prior in substance** | Registered in the decision ledger before the run, but not in a separate prior commit. Ordering rests on ledger content and commit history, not on an independent timestamp. | D91 set (P1–P4) |

The tier-C set is recorded in D91 and D92. Two of its four predictions **missed** (P3 0/50; P4 low), the misses were recorded as they fell, and the composite dropped 60.41% → 52.07% as a result. Nothing was adjusted to rescue them.

The protocol described in `METHODS.md` §5 takes effect from tier A. This discontinuity is disclosed rather than smoothed.

---

## WO-D93 — F4 release symmetry, F6 re-baseline, closing mechanism

**Tier B.** Committed before any result was known; dispatched prior to commit.

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

### Pre-committed responses to anticipated misses

- **If PR-3 misses again**, numerical superiority is insufficient as a closing trigger. The next candidate is **flank exposure**, which is the historically attested mechanism (warriors against Reno's left and rear on an unanchored flank). That trigger is **not currently computable** — units are dimensionless points and Reno's three companies occupy one position (D91 rider) — so the frontage adjudication becomes its prerequisite. **Not a parameter change, in either case.**
- **If PR-4 overshoots past PR-5's threshold**, halt. Do not tune the closing mechanism down to land inside the band; adjudicate whether the mechanism is wrong in kind.
- **If PR-1 misses**, release symmetry is insufficient and the eligibility rule at `state.ts:241` — deliberately sequenced out of D91 to keep attribution clean — becomes the next candidate.
- **If the composite falls again**, that is not by itself a failure. Per D84 and D91, a structurally more correct day may score worse. The composite is not the target; the criteria are.

### Judging

Distributions across N=50 per D80, not single favourable runs. Verdicts recorded as they fall, in a commit that does not modify this file.
