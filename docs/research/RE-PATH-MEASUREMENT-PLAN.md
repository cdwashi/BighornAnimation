# Re-path measurement plan — FROZEN 2026-08-04 (four amendments applied at adjudication; committed before anything runs)

*Mechanism named by measurement, not by story. The question transferred by D113: what moves
broken units to destinations their orders never declared? The 33 ESCROW rows and the
STEADY-shelter fix decision both resolve behind this item's ruling. This plan is drafted
blind — the drafter has not opened the engine's movement or retreat implementation, and
`combat-config.ts` stays closed until the plan is frozen. The seduction is named in
advance: component mixing is the more interesting story and the seen coordinate
coincidences look like a smoking gun, which is exactly the condition under which this
project was wrong four times in one night. No verdict issues from seen evidence; verdicts
issue only from the registered discriminators on the unseen event log.*

## Hypotheses, registered

- **H-DRIFT (situational drift):** re-path destinations are computed from the tactical
  situation at the event tick — threat geometry, terrain, friendly positions. A behavior,
  possibly intended.
- **H-MIX (component mixing):** destinations are assembled from single coordinate
  components (an x from here, a y from there) belonging to unrelated declared points —
  a defect.
- **H-DECL (declared elsewhere):** destinations are legitimate whole points declared in
  scenario data OUTSIDE the orders array (camp-defense geometry, tactics profiles, rally
  configuration) — the adjudicated-choice class, a documentation gap rather than a defect.

The third hypothesis is registered because a two-way race between a dull story and an
interesting one, judged on a seen smoking gun, is a false dichotomy waiting to happen;
H-DECL is the mundane explanation and it is cheap to test.

## Seen versus unseen, stated

**SEEN (consistency constraints only, predictive of nothing):** the five-coordinate
endpoint scatter (21 of 76 wing-consolidate endpoints at the declared objective); the two
exact component coincidences (x=6624 shared with custer-bluff-route's final waypoint,
twice; y=12030 once); the 4+13 failed re-derivation rows; the emptied paths at
annihilation. **UNSEEN (where every prediction below points):** the full re-path event log
across all 50 seeds of stream `68325eff`, and the scenario-wide coordinate audit.

## Instrument — Probe R1, the re-path event log (black-box; engine source unopened)

Step every seed of stream `68325eff` tick by tick. **A re-path event is registered as:**
a unit's path terminal changing between consecutive ticks while its `activeOrderId` is
UNCHANGED, in any of three registered categories — **terminal-moves** (point → point,
displacement ≥100 m, new terminal ≥100 m from the active order's declared objective),
**terminal-appears** (null → point, the appearing terminal ≥100 m from the declared
objective), and **terminal-cleared** (point → null). The null transitions are registered
in both directions because D113 established that every annihilated unit's path was already
empty at death: a terminal appearing is not a terminal moving, and path-clearing on break
is itself a candidate mechanism component — counted, never silently the reason the
instrument sees nothing (Amendment 2: the vacuous-sameEnd failure caught at design time).
**Order-changed re-paths are a NAMED CATEGORY, not an exclusion** (Amendment 3): terminal
changes coinciding with an `activeOrderId` change are counted and reported with their
destinations; if that category is large and its destinations share the stray set's
structure, the mechanism is broader than this definition assumes and the item re-scopes.
Waypoint consumption remains excluded; every excluded and per-category count is reported.
The 100 m threshold is a registered convention chosen before any read; sensitivity at
50 m and 200 m is reported without re-ruling. For each event, record: tick; unit; morale
state; active order; old and new terminals; unit position; nearest enemy (distance,
bearing); nearest STEADY friendly (distance, bearing); and the new terminal's provenance
against the coordinate audit.

**The coordinate audit:** every coordinate-bearing point in `scenario.json` — order
waypoints, landmarks, camp-defense geometry, tactics-profile points, any lat/lon pair —
converted through the same `terrain.toLocal` the D113 probes used, tagged by its declaring
structure. Each event terminal is tested for whole-point match (≤10 m) and for
exact-single-component match (x or y equal to the metre) against every audited point.

## Discriminators, with each hypothesis's expectation stated in advance

- **D1 — cardinality and repetition.** H-MIX: the stray-destination set is SMALL and
  DISCRETE, repeating exactly across seeds and events. H-DECL: the same — D1 CANNOT
  separate MIX from DECL, and is registered as unable to. H-DRIFT: destinations vary
  event-to-event; the distinct count grows with event count; exact repeats across
  different tactical situations are rare. D1 separates DRIFT from the other two.
- **D2 — provenance.** H-DECL: stray destinations match audited points WHOLE (≤10 m),
  declared outside the orders array. H-MIX: no whole-point match, but exact single
  components shared with audited points of unrelated structures, at scale — the full log
  shows the same component structure the seen handful shows. H-DRIFT: neither whole-point
  nor component matches beyond chance — chance quantified in advance WITH ITS
  MULTIPLE-COMPARISON UNIT STATED (Amendment 1): metre-exact component collision between
  independently computed points over a >20 km coordinate span is of order 1e-4 per pair,
  and the correction runs over DISTINCT stray terminals × DISTINCT audited points, never
  over events or seeds — repetition across events and seeds multiplies exposure without
  adding independent tests, and counting it would inflate the null past the signal. The
  audit holds ~993 coordinate-bearing points; at the seen five distinct stray terminals,
  5 × 993 = 4,965 pairs → ~0.50 expected chance collisions against three observed. The
  probe reports its own distinct-terminal count and audit size so the arithmetic can be
  re-run by anyone. The seen coincidences remain constraints, not predictions — DRIFT
  survives D2 only by the full log confining component matches to the already-seen
  handful. D2 separates all three.
- **D3 — situational correlation.** H-DRIFT: stray destination bearings correlate with
  threat geometry at the event tick — registered statistic: the distribution of the angle
  between (unit→new terminal) and (nearest enemy→unit) concentrates away from uniform.
  H-MIX and H-DECL: no correlation for the stray set. D3 separates DRIFT from both.
- **D4 — trigger state.** Record-only, no prediction: which morale states and preceding
  events accompany re-paths. Feeds the mechanism's naming; privileges no hypothesis.
- **D5 — escrow linkage.** No new prediction; the disposition is already ruled at D113 and
  is executed here: each of the 33 ESCROW rows' dying units has its re-path chain traced
  in the log; drift-like provenance legitimises, mix-like kills, declared-elsewhere goes to
  the adjudicated-choice class. The 4+13 failed rows are read the same way.

**Separability check, per the adjudicator's test:** no two hypotheses predict the same
thing everywhere — MIX and DECL agree on D1 and split on D2; DRIFT splits from both on D1,
D2, and D3. The registration is testable.

## Reading order, pre-committed

D1, then D2, then D3, then D4, then D5 — least theory-laden first; the escrow disposition
reads LAST so no verdict is formed with the 33 in view: the 33 are the only rows with an
interest in the answer.

## Kill-branches, registered

Every hypothesis can die. H-MIX dies if the full log shows no exact-component structure
beyond the seen handful and D3 fires. H-DRIFT dies if stray destinations form a small
discrete repeating set with no situational correlation. H-DECL dies if the audit finds no
whole-point declaration for the stray set. **All three dying is an admissible outcome** and
means the mechanism family was not among the named candidates — STOP, report, no
interpretation. Any mixed outcome nothing above predicted (e.g., continuous AND
component-structured destinations) — STOP, report, no interpretation.

## Bound on the ruling

The probe names the mechanism's FAMILY; it repairs nothing. Repair, if a defect, is its
own WO with its own registration against a then-current world. The scale of the STEADY
misaim re-measures only after this item rules. The −1.6879 residual is not in this item's
scope and no finding here retires it.

## Discipline

Probe preserved in `.claude/` with outputs; evidence-first commit; same-seed re-simulation
of stream `68325eff` only, reseed-free; results to adjudication carrying nothing beyond
the registered branches. **The black-box boundary, stated (Amendment 4):** the sim state
and public API — `createSim`, `sim.state()`, unit positions, paths, `activeOrderId`,
morale state — are OPEN; reading state is not reading implementation. The movement,
retreat, and pathfinding implementation stays CLOSED until this plan is frozen by commit,
and the first look at it thereafter is recorded as a read with its date, never silently
folded into interpretation.
