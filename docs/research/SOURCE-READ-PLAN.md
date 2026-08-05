# Movement-source read plan — FROZEN 2026-08-04 (four amendments at adjudication; the selection list committed in this plan before anything opened)

*Ordered at D116: three items failed to name a mechanism from data alone, and the residue
says why — destinations are computed, no speeds are declared, ordered movement is
affected, and S2's vacuity proved that no further discriminator reads only data and the
log. The movement implementation opens next, as a dated read, under this plan.*

## What is being spent, and why — stated for the later reader

**This read is not a probe. It cannot be re-run blind.** Once the source is open it stays
open: every subsequent hypothesis in this project is drafted by parties who have seen the
implementation, permanently. Three items' worth of value — D114, D115, D116, twenty-eight
catches, and every registered prediction in them — came from nobody knowing the answer.
That position is being spent deliberately, because measurement from outside has
demonstrably run out, and continuing to guess would now be the undisciplined choice. A
later reader judging whether it was worth it should weigh this plan's questions against
the read log's answers.

## The questions, registered — with what each answer would mean, in advance

- **Q1 — What determines movement speed?** The data surface declares no speeds; movement
  runs at a consistent 126–136 m/tick. Answers and their meanings: (a) constants in the
  implementation → the speed gap is engine-owned, a documentation item and a candidate
  calibration item (constants sourced from nothing are [CAL] questions); (b) derived from
  the terrain movement-cost rasters times a base rate → speeds ARE data-determined
  through the unparsed binary surface, D115's audit caveat becomes load-bearing, and
  D116's residue finding (2) takes a dated correction; (c) computed from unit attributes
  under keys no speed-regex matches → a naming gap only, recorded and closed.
- **Q2 — What computes destinations for un-ordered movement?** The D114 family: broken
  and unbroken units pathing under unchanged orders to declared landmarks their orders
  never named. Answers: (a) a retreat/rally selection over the landmark table → the
  documentation gap resolves as an adjudicated choice with a nameable rule; (b) a
  projected vector clamped at bounds → names the flagship mechanism and makes the
  co-location population repair-sensitive; (c) pathing at target ENTITIES → explains
  S3's 22-of-22 pursued-first coupling and revives no dead hypothesis (the register's
  inheritance rule holds: dead registrations stay dead; the source names what the
  hypotheses could not).
- **Q3 — What produces terminals at the grid bounds?** (6624,20006) et al.: an explicit
  clamp, a pathfinder grid edge, or a chosen destination that happens to sit at maxY?
  Meaning: whether the flagship is a DESTINATION (chosen) or a TRUNCATION ARTIFACT
  (clamped en route) — which determines whether the stacked co-locations move under any
  future repair, the exact quantity the STEADY fix has waited on since D113.
  **Registered entanglement (Amendment 3): Q1(b) and Q3 turn on the same unaudited
  surface** — the ~20 MB of binary rasters D115 carried as an explicit caveat. If Q1
  returns (b), speeds come through the rasters, the rasters are load-bearing for
  movement, and a terminal at maxY may be an artifact of the raster's own extent rather
  than anything the movement code chose: **Q3's answer is then NOT determinable from the
  movement source alone**, and the raster surface becomes a separate registered item —
  never something read opportunistically during this one.
- **Q4 — What computes ORDER destinations that vary by seed?** gall-calhoun's units go
  to (6874,14978) in some seeds and (8097,11163) in others. Meaning: if order objectives
  are situationally resolved by design, D116's widened documentation gap is scenario
  semantics working as intended but undocumented; if not by design, it is a finding with
  its own item.
- **Q5 — What triggers path recomputation?** The 2-vs-3-tick rung cadence. Meaning:
  closes the ladder episode's account; no hypothesis rides on it, it is recorded so the
  breach-seed pursuit narrative has a mechanism instead of a story.

## The surprise clause

Anything found that answers none of Q1–Q5 is recorded in the read log under
**UNREGISTERED FINDINGS**, verbatim with file:line, and is NOT folded into the answers.
An unregistered finding earns no interpretation in the read log; it queues for its own
item like everything else in this register has.

**The null branch (Amendment 4):** if a question's answer is not in the selected files
and not reachable under the signature-only rule, it is recorded as
**UNANSWERED-IN-SCOPE** — not as an unregistered finding, not as a partial answer. That
status prevents the read log from quietly promoting a near-answer, this project's most
repeated failure, now MORE likely rather than less because the reader will be looking at
real code with real names.

## Scope bound

The read opens the movement implementation ONLY. **The selection surface was produced
and committed BEFORE this freeze (Amendment 2):** the full engine source listing —
twenty-six files, names and sizes only, no content opened — is at
`.claude/engine-src-listing.txt`, and the SELECTED SET is named here, ruled rather than
chosen at the keyboard: **`engine/src/movement.ts`, `engine/src/pathfind.ts`,
`engine/src/objectives.ts`, `engine/src/orders.ts`.** Named exclusions, not opened:
combat resolution, scoring, spotting/viewshed, morale state transitions, and every
other file on the listing — including `morale.ts`, `engagement.ts`, and `index.ts`,
whichever of them tempts.

**The transitive rule, and the read's own STOP (Amendment 1):** following a call into a
file not on the selected list is permitted ONLY to the extent of reading the called
function's SIGNATURE and its RETURN, never its body. If answering a question requires
the body of an unlisted file, **the read HALTS, records which question and which file,
and that file is added to the selection by a dated amendment before it is opened** —
the frozen-WO STOP discipline, for the same reason: the moment the boundary is crossed
by reasoning rather than by ruling, the boundary is gone. Anything beyond the committed
selection is a SEPARATE DATED READ under its own entry — "opening the movement
implementation" does not silently become "reading the engine."

## The conduct statement owed afterward

From this read forward, no hypothesis in this project is drafted from a blind position
again. Both parties will state, in every subsequent registration where it matters, that
the drafting was POST-READ; the semi-seen principle applies to everything the read log
touches. The blind era's registers (D108–D116) retain the evidential weight of having
been blind; nothing after this read does.

## Deliverable and bound

One READ LOG, committed evidence-first: per question, the answer with file:line
citations; the unregistered-findings section; the committed directory listing; the date.

## Dated amendment — 2026-08-04, at the HALT's adjudication

The read halted per Amendment 1: nothing in the four ruled files assigns a broken unit's
flight path, the scout-withdrawal path, or the COMBAT/INITIATIVE pursuit kinds. Ruled:
**`engine/src/morale.ts` OPENS**, named for **Q2-rout** (what assigns a broken unit's
flight path) and **Q3** (chosen destination versus truncation artifact) — named by
FUNCTION, not by size: rout and withdrawal are morale-state transitions, and the
destination assignment plausibly lives with them. **This REVERSES a named exclusion** —
the original scope bound excluded morale-state-transition bodies — and is recorded as a
reversal, not an addition. **`combat.ts` does NOT ride with it:** a maybe does not
travel on a yes; if `morale.ts` leaves either question unanswered, `combat.ts` gets its
own dated amendment naming what remains, which costs one round and preserves the
property that every opened file was opened by a ruling. **The adjudicator's registered
prediction, before the file opens:** Q3 returns TRUNCATION — a flight vector clamped at
the grid edge rather than a chosen destination; grounds: `repathPursuit` already
overwrites terminal points directly against a target, and a flight computation doing the
same against a bound would produce exactly the observed stack. If it returns CHOSEN, the
co-locations are stable under repair and the STEADY fix's scale holds at 82/120.

## Dated amendment — 2026-08-04, at the M4 halt

**`engine/src/combat.ts` OPENS, named for M4:** implementing C2's throwaway patch
requires the finishing predicate's body, and no ruling had opened the file that holds
it. Scoped to the CLOSE-ACTION FINISHING REGION — the isolation predicate and its
immediate resolution context; signature-only beyond it, transitive halt rule live;
first look recorded as a dated read in the read log. **This REVERSES `combat.ts`'s
held-back status**, established when `morale.ts` was named and recorded at D117 as
"never needed" — true for the source-read questions, not true for M4; stated plainly
rather than letting the file slide in as an extension. **The THIRTIETH catch, the
adjudicator's, on the record with it:** five M4 conditions were written covering patch
containment, byte-identity, reseed discipline, prediction scoring, and freeze
exclusion — without asking what the patch would be written against; the register's
standing pattern (an instrument specified without checking what it requires to exist),
caught this time at the boundary by the verifier's halt rather than by a probe's
output — an improvement in where it surfaced, not in the writing. **Workflow additions,
registered:** byte-identity verification covers the WHOLE tree — `git status` clean and
`git diff` empty printed into the probe output — with the explicit statement that
`dist/` is untracked by rule (`.gitignore:2`) and is REGENERATED from committed source
in the restore step so the running artifact matches the committed tree; and
restore-and-verify runs under a GUARD so the tree is returned and the verification
prints regardless of how the envelope run exits. **The adjudicator's stated
expectation, registered so it can miss:** the finishing predicate is a straightforward
eligibility filter and the read answers nothing beyond M4's needs; any surplus is an
UNREGISTERED FINDING under the surprise clause — logged verbatim, not interpreted,
queued — and given the evaluation-order item sits registered and unexamined precisely
where a timing surface would live, the chance of surplus is real and it does not get
absorbed into M4.

## Dated amendment — 2026-08-04, at the corpse-drift audit question

**`engine/src/score.ts` OPENS, named for one question with a yes-or-no answer:** does
any calibration leg read unit POSITIONS, and if so does it filter on `endState`? The
corpse-drift blast-radius audit (D121-pending) cannot claim "instruments audited" while
a scoring path is unexamined — a row asserting audited with a known unexamined surface
would be the near-true-summary family in the row that closes the audit. Scoped to
positional reads and their endState filtering; signature-only beyond; transitive halt
rule live; first look recorded as a dated read. Two outcomes, both fine: no positional
read or filtered → the audit closes clean and the blast radius is one; reads corpse
positions → seed 18760647's composite is named affected and every campaign figure it
contributed to takes a dated note.
**The read repairs nothing and edits nothing** — repairs remain separate WOs against
registered predictions, and the STEADY fix stays waiting until the read's ruling lands.
The read log's claims are verifiable by any reader against the same files, which
restores to the record what the read spends: the answers stop depending on trust in the
reader, because the source is citable.
