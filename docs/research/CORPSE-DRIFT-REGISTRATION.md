# Corpse drift — registration, FROZEN 2026-08-04 (POST-READ; the ledger search ran first; the adjudicator's search expectation scored as a MISS on his own text)

*The D111 dated annotation's defect, recorded with evidence 2026-08-02, unscoped through
eight rulings. The ledger search ran first and returned an adjacent already-owned
mechanism that was REFUSED as a match at the seam the adjudicator pre-flagged: his
registered expectation — that the search would return D119's same-tick cascade — MISSES;
the rows and the ruled reads point at the order-delivery machinery instead. Scored
against his text, in the informative direction. Conduct statement (POST-READ): drafted
from the ruled reads and committed artifacts only; no new file opens under this
registration.*

## §1 — The ledger search and the ruled-read facts

**D111's annotation, verbatim in substance:** seed 18760627, stream `8e28552c` — co-m
destroyed t1497 HOLDS its death position through t1509, then drifts east at ~37.5 m/tick
from t1510, which is co-g's destruction tick; trigger named as "coupled to something
processing the unit list at another unit's destruction"; blast radius UNKNOWN, stated.

**The in-scope facts (files open by ruling; no new reads):** destruction clears the
unit's path (`combat.ts:474-475`, `morale.ts:216-217`) and `moveOneUnit` returns early
on an empty path (`movement.ts:126`) — a corpse cannot drift unless something RE-ARMS
it; `deliverOrders` has NO endState guard (`orders.ts:159-171`) — a scheduled delivery
activates its order on a dead recipient, issuing fresh path, posture, and speed class;
`moveUnits` is also unguarded (`movement.ts:297`). And from the committed Probe R1 log
(semi-seen): co-m receives `reno-retreat` at exactly t1510 in seed 18760600 — a
scheduled, deterministic delivery tick. The drift onset equals the delivery tick, and
the t1510 = co-g's-death coincidence has a rival reading: SCHEDULE, not coupling.

**Stream declaration, binding:** D111's observation and its tick numbers are stream
`8e28552c`; this registration's probe runs the CURRENT stream `68325eff`, where co-m
dies at t1497 in seed 18760647 (committed rederivation), before the t1510-class
delivery. The drift is a STRUCTURAL claim; the tick numbers are stream-specific; every
figure declares its stream.

## §2 — Hypotheses, registered — non-exclusive, with the third outcome explicit

- **H-DELIVERY:** the unguarded `activateOrder` re-arms the dead — drift onset tracks
  the DELIVERY tick, with `activeOrderId` flipping to the delivered order and a fresh
  non-empty path at that tick.
- **H-NEIGHBOUR (D111's original reading):** something in destruction processing
  touches positions or paths — drift onset tracks ANOTHER unit's destruction tick,
  WITHOUT an order change on the corpse.
- **H-BOTH / DELIVERY-PLUS-UNEXAMINED:** the hypotheses are not exclusive; a confirmed
  H-DELIVERY does not refute a second write path. If the probe shows delivery-tracked
  onset AND any post-death movement not explained by an activation, both are live and
  the unexplained component is recorded as its own finding.

## §3 — Probe C1, the trigger discriminator (single seed, current stream)

Seed 18760647: track co-m per tick from t1490 to t1560 — position, `activeOrderId`,
`path.length`, posture — plus every other unit's destruction tick in the window, and
the `unit-destroyed` event's own recorded position for comparison against end-of-tick
position (measuring within-tick drift directly, without opening the tick loop's phase
order). **Predictions:** H-DELIVERY — position holds from t1497 until the reno-retreat
delivery tick, then `activeOrderId` changes, path re-arms, movement begins that tick;
H-NEIGHBOUR — movement begins at a neighbour's destruction tick with NO order change.
Either, neither, or both may fire; a mixed trace is reported per §2's third outcome.

## §4 — Probe C2, the blast-radius census — THE REAL DELIVERABLE, independent of §3

Two legs, both from committed artifacts:
- **C2a — the re-arm population at scale:** for each of the 120 committed annihilation
  rows (seed, unit, death tick), scan the committed Probe R1 event log for ANY event on
  that unit at ticks AFTER its death tick. Every hit is a corpse touched post-mortem,
  sized and listed.
- **C2b — the instrument audit:** every committed probe of this arc classified by WHEN
  it reads unit positions relative to destruction ticks — at-death-tick reads, pre-death
  (end t−1) reads, and any post-death reads — from the probes' own committed source.
  The output is a table naming which committed measurements could have read drifted
  values. **If clean, eight rulings' numbers are confirmed unaffected and the finding
  closes small; if not, the affected measurements are NAMED and their rows take dated
  annotations.**

## §5 — Bound

**NO REPAIR.** Two missing guards is a fix, and a fix is a frozen WO against a
registered prediction — not this item. The item names the mechanism, sizes the blast
radius, and stops. The −1.6879 residual and the three standing findings are untouched.
Reading order: C1, then C2a, then C2b; no verdict before its probe's lines are written.
