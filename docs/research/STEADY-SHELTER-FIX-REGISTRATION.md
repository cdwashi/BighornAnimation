# STEADY-shelter fix registration — FROZEN 2026-08-04 (POST-READ; the ledger search ran first, per the fourth practice's first execution; three amendments and one framing correction at adjudication)

*The item D113 opened and D117 unblocked — into a registration, not a WO. Conduct
statement (POST-READ, as the source-read plan requires): both parties have read
`movement.ts`, `pathfind.ts`, `objectives.ts`, `orders.ts`, and `morale.ts`; nothing
below is drafted blind, and the semi-seen principle applies to everything the read log
touches. The drafter's candidate designs are the registered set; none is withheld.*

## The ledger search, run first — what the register already rules

- **D107 OWNS THE PREDICATE.** Isolation for close-action finishing: no eligible friendly
  within 650 m, eligible = same-side combat unit, STEADY, not destroyed, not withdrawn
  off-field — the withdrawnOffField clause written into the ruling from the 37th
  measurement's contamination. **D107 also carries the precedent this item must follow:
  a KNOWN SOFTNESS was measured pre-freeze** (the missing strength floor, measured
  harmless: 22/22 shelterer instances were formed bodies).
- **D66** rules the morale system: isolation drains, friendly proximity recovers — and
  its isolation check (`morale.ts:174`, `nearbyFriendlies`) counts ANY non-destroyed
  same-side unit, no morale filter.
- **D72** rules pursuit disengagement "against steady massed fire" — implemented as
  `steadyFriendlyMass` (`morale.ts:316-328`), which counts **STEADY OR SHAKEN** units
  and compares STRENGTH, not presence.
- **D74** rules rout-safety pathing to a STEADY protecting mass; no corridor = no safety.
- **D75/D91** rule the scout exits and the stranded-unit guard — context, not adjacency.
- **The search's central yield: the engine carries THREE DISTINCT adjacency notions.**
  (1) Morale isolation: any friendly, presence only (D66). (2) Finishing shelter:
  STEADY-only, presence only (D107). (3) Pursuit-breaking shelter: STEADY+SHAKEN,
  strength-compared (D72). D113's misaim finding sits entirely inside notion (2); the
  two unregistered morale findings D117 queued (rout-reintegration `morale.ts:361-392`,
  steady-massed-fire `morale.ts:433-437`) are notions (2)-adjacent and (3) live.

## The finding independent of the candidates (Amendment 1)

**The adjacency-notion inconsistency is recorded as a DEFECT-CLASS FINDING at this
item's ruling, whatever the fix decision.** Three rulings give three answers to "is a
friendly nearby enough to matter" — any-friendly-by-presence (D66), STEADY-only-by-
presence (D107), STEADY+SHAKEN-by-strength (D72) — and no row anywhere reconciles them.
The finding will still be true if C0 wins; it does not close as documentation when the
item closes, and it is logged here so it cannot quietly survive as the thing nobody
recorded.

## What is settled and carried in

D113 (concept misaimed: snapshot-versus-vector, STEADY-versus-broken,
cluster-versus-isolation; implementation certified honest) at scale 82/120,
source-confirmed at D117: co-locations stable under repair, the dying and their broken
companions at positions D66/D74-ruled mechanics and their orders put them.

## The candidate designs, registered — including the one that changes nothing

- **C0 — ADJUDICATED NO-CHANGE:** D107's STEADY-only eligibility is CORRECT for
  finishing, and the misaim is in the concept's DESCRIPTION, not its operation — a
  routed mass shelters nobody, historically and mechanically; broken companions at 0 m
  are the annihilation's context, not its refutation. Consequence if ruled: a
  documentation fix (the predicate's prose says what it counts and why), zero bytes,
  and the 82/120 stands as a described property, not a defect. Registered first because
  post-read honesty demands the null design be a real candidate, not a strawman.
  **Registered burden (Amendment 2), symmetric with C1's and C2's:** C0 must state why
  finishing eligibility should use a DIFFERENT relation than disengagement eligibility,
  given that both ask whether nearby friends prevent an outcome — D72 is about breaking
  a pursuit, not interrupting a finishing bout, and borrowing its mechanism for a
  different predicate is exactly the reasoning C2 makes explicit; if the borrowing is
  legitimate, C2's unification is its honest expression, not a competitor. "Different
  mechanisms, different relations" may be exactly right — but it must be said, not
  assumed, or C0 wins by inheriting an argument from a ruling that was not about it.
- **C1 — CLUSTER SHELTER:** eligibility widens to any non-destroyed, non-withdrawn
  same-side combat unit (aligning notion (2) with notion (1)). **Its basis, corrected at
  adjudication: C1 rests on Amendment 1's inconsistency finding — the predicate's
  relation disagrees with the two other relations the engine uses for the same question
  — NOT on spatial texture; after D117, the clusters are units at positions D66/D74
  mechanics and their orders put them, legitimate placements, source-confirmed, and
  "the model produces clusters the predicate ignores" is no longer C1's case.**
  Registered burden: it must state why a ROUTED
  companion — definitionally incapable of massed fire (D72's mechanism) — should stop a
  finishing bout, or accept that it trades historical mechanism for spatial texture.
- **C2 — MASS ALIGNMENT:** finishing eligibility adopts D72's shelter form —
  STEADY+SHAKEN, strength-compared against the pursuer — unifying notions (2) and (3)
  into one shelter concept with one [CAL] surface. Registered burden: it changes TWO
  rulings' semantics at once (D107's finishing and its interaction with D72's
  disengagement), and the interaction analysis below is mandatory before any freeze.

## Pre-freeze measurements, per standing practice — no design freezes unmeasured

- **M1 — the flip census, BOTH DIRECTIONS (Amendment 3):** for each candidate, (a) which
  of the 120 committed annihilation rows change outcome (the 82, the 17 none-rows, the
  21) — computed from the committed census and event log where possible, same-seed
  re-simulation where not — and (b) **the count of finishing bouts that no longer occur,
  or newly occur, across the whole run**: a widened predicate changes which bouts reach
  finishing at all, and annihilations that never happen under a candidate are invisible
  to a census over rows that did. Direction (a) is first-order and offline; direction
  (b) is PREDICTED at M1 and measured in the M4 run, whose read compares against the
  prediction — (b) is the number that moves the envelope, and reading only (a) would
  under-predict M4 and make a hit look like a miss. The flip list and both counts are
  the design's PREDICTED effect, registered before any envelope runs.
- **M2 — the D107 validation re-check:** the 34th/37th/38th measurements' findings
  re-derived under each candidate — a design that silently unwinds a measured-harmless
  softness or re-admits the withdrawn-scout contamination dies at M2.
- **M3 — the interaction analysis (D117's live prior):** for each candidate, the effect
  on rout-reintegration (`morale.ts:361-392`) and steady-massed-fire disengagement
  (`morale.ts:433-437`) stated explicitly — including "none, because the mechanisms
  share a relation but not a predicate," if that is the answer and it can be shown.
- **M4 — the envelope:** only after M1–M3, and only for a candidate that survives them:
  the N=50 envelope under the candidate, judged per D80 against the current stream's
  committed distributions, with the composite read per METHODS §6's low-resolution
  clause. A reseed is NOT triggered (mechanism change, same seeds); stream lineage is
  declared on every figure.

## Kill-branches and bounds

C0 dies if either C1 or C2's M1 flip census shows the current predicate finishing
fragments beside companions that D72's own mechanism would credit as shelter (mechanism
inconsistency, not texture). C1 dies at its registered burden if no mechanism-grounded
account of routed-mass shelter is produced — spatial texture alone is insufficient by
D113's own "not a count" discipline. C2 dies if M3 shows the unification changes D72
disengagement outcomes anywhere its 34 established instances were validated. All three
dying is admissible: the item returns to adjudication with the measurements in hand and
no design, which is a reportable outcome, not a failure. **Nothing in this registration
authorises a byte: the surviving candidate goes to a frozen WO with pre-freeze red
enumeration under the standing law, dispatched per the house workflow.** The −1.6879
residual is not in scope; the order-objective extent item and the queue behind it are
unmoved.

## Reading order, pre-committed

Ledger-search yield first (done, above), then M1, M2, M3 per candidate in candidate
order C0, C1, C2; M4 last and only for survivors; no envelope figure is read before its
candidate's M1–M3 verdicts are written.

## Dated amendment — 2026-08-04, at the M1–M3 adjudication

Measurements: M1 `b6b6668`, M2 `3975c7a`, M3 `97196f9`. **C0: DEAD at its registered
M1 kill-branch** — written threshold-free by its author before the census existed, one
qualifying row of 101 (seed 18760602, mass 73 against 73), and reading one row as de
minimis after seeing it is the reinterpretation this register forbids. Death by
kill-branch, not refutation: **C0's burden argument SURVIVES its candidate and
transfers** — any design widening finishing eligibility must say what a routed
companion DOES to interrupt a melee, given the engine's own `pursuerAccepts` rules such
units incapable of offensive action. **C1: SURVIVED-NOT-PROMOTED** — the D116 status
applied for the first time as a decision rather than a verdict. Its registered branch
did not fire and it is not killed by reinterpretation; but its burden is answered
AGAINST it: M3 shows the companions that would stop a finishing can do nothing else for
the fragment (no reintegration, no massed fire — a durable routed-limbo population up
to 99 rows wide), and the 38th re-derivation shows its eligibility admits shelterers at
ratios from 5%, 43 of 204 below half strength, a two-man minimum. Held; available if
the evaluation-order item changes the picture. **C2: PROCEEDS TO M4**, its reverse
channel carried as a named risk against its own frozen and unamended prediction.
**Amendment 1's finding WIDENS to the five-relation inventory** (M3): finishing
(STEADY presence @650), rout-reintegration (STEADY presence @450), massed-fire pursuit
end (STEADY+SHAKEN strength @450), morale isolation (any-friendly presence @650),
rout-safety targeting (STEADY nearest, unbounded) — five ruled predicates answering
"does a nearby friendly matter," differing on morale filter, presence-versus-strength,
and radius, with no reconciliation anywhere: the item's most durable output regardless
of the candidates' fate. **The evaluation-order question is REGISTERED as its own item
ahead of M4** (`docs/research/EVALUATION-ORDER-ITEM.md`): 99 STEADY shelterer
instances one tick before death against zero after — both candidates change who
counts, neither touches when; every M4 read carries the stated confound caveat. **M4
instrument discipline, ruled: THROWAWAY PROBE PATCH, not a WO** — measurement decides
whether a design freezes, so the design cannot freeze to enable the measurement.
Conditions, registered: the patch lives in the probe, never in committed engine
source, preserved with its output; the engine's committed tree is byte-identical
before and after, VERIFIED not asserted; no reseed — mechanism change, same seeds,
stream lineage declared on every figure; the M4 read is scored against C2's frozen
M1(b) prediction with the overshoot channel read against its named paragraph, not
folded into it; pre-freeze red enumeration does not apply because nothing freezes.
The 19 same-tick finishers remain UNRESOLVED and named; C2's flip census covered 101
of 120 rows.
