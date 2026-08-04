# Movement-source read log — dated read, 2026-08-04

*Per the frozen plan (`90818a3`). Files opened, exactly the ruled four: `engine/src/movement.ts`,
`engine/src/pathfind.ts`, `engine/src/objectives.ts`, `engine/src/orders.ts`. Selection surface:
`.claude/engine-src-listing.txt`, committed pre-freeze. Boundary crossings: type-and-signature
only — imports from `state.ts`, `combat-config.ts`, `events.ts`, `camp-defense.ts` were read as
the four files' import statements and call-site signatures; no excluded body was opened. One
HALT under Amendment 1, recorded below. Two data-surface reads (open by rule):
`scenario.json` clock and the warband order objectives.*

## Q1 — What determines movement speed? ANSWERED: engine constants, [CAL]-tagged, times terrain

`movement.ts:8-16`: `SPEED_METERS_PER_SECOND`, marked `[CAL] D32` — CAVALRY_WALK 1.8,
CAVALRY_TROT 3.6, CAVALRY_GALLOP 5.4, DISMOUNTED_SKIRMISH 1.1, PACK_TRAIN 1.2, ON_FOOT 1.3
(m/s). `movement.ts:19-25`: formation modifiers (COLUMN 1, LINE 0.8, SKIRMISH 0.7,
DISPERSED 0.9). `movement.ts:30-38, 188-193`: effective speed = base × formation ×
terrain `movementFactor` × (SCREEN 0.8) × `scenario.clock.tickSeconds` = 30
(`scenario.json:102`, data). Speed class is order-driven: ATTACK→TROT, CHARGE→GALLOP,
else WALK (`orders.ts:25-32`). **The registered answer is (a) with a raster channel:**
base rates are engine-owned constants carrying a ledger calibration tag (D32) — D116's
residue finding "no declared speeds anywhere" takes a dated correction to "not declared
on the DATA surface; declared in the engine under [CAL] D32" — and the per-tick variance
(126–136 m/tick) flows through the raster `movementFactors`, which is Amendment 3's
entanglement engaged at the variance channel only, not at Q3.

## Q2 — What computes destinations for un-ordered movement? ANSWERED for the pursuit family; HALT for the rout family

**Units path at ENTITIES.** `state`-level pursuit (`kind: ORDER | COMBAT | INITIATIVE`,
`targetUnitId`) re-paths to the TARGET'S CURRENT POSITION: `objectives.ts:110-155`
(`repathPursuit`), with the path's final point overwritten to the exact target position
(`pathfind.ts:382`; `objectives.ts:137-138`). **The cross-side sharing is fully named:**
a pursuer's terminal IS the pursued unit's position, to the metre; when a routed unit
halts, every pursuer of it computes the identical terminal — the flagship's 493-event
stack and the 22-of-22 pursued-first ordering are this mechanism's signature. Per the
plan's registered meaning for Q2(c): this revives no dead hypothesis — the D116
registration stays dead; the source names what the registration could not.
**HALT (Amendment 1):** nothing in the four ruled files assigns the flight path of a
BROKEN unit (the D114 family: routed co-i to last-stand-hill) or the scout-withdrawal
path (`movement.ts:263-272` consumes a `scoutWithdrawal` flag set elsewhere), and
nothing here assigns the COMBAT/INITIATIVE pursuit kinds. The read halts: **question
Q2-rout; file(s) unknown from within scope, `morale.ts` the likely holder by name and
size (22,256 bytes), possibly `combat.ts`.** Those bodies open only by dated amendment.

## Q3 — What produces terminals at the grid bounds? PARTIAL; the decisive half rides the same HALT

`pathfind.ts:321-322`: goals outside the grid are UNREACHABLE — pathfind clamps nothing.
`pathfind.ts:188-202` with the audited manifest dims: grid cell points top out at
y = minY + (height−1) × 10 = 20005.57 — the core grid's top ROW, which metre-rounds to
20006. A unit standing on that row reads (·, 20006); every pursuer's terminal equals its
position exactly. So the flagship VALUE mechanics are named — but whether the routed
unit's own goal was CHOSEN (a destination at the bound) or TRUNCATED (clamped en route)
is the rout-goal computation: **UNANSWERED-IN-SCOPE, pending the Q2-rout amendment.**
Noted beside it: `movement.ts:110-124` (D91 recovery) relocates stranded units to the
nearest finite-cost cell — a second candidate route onto edge cells, recorded, not ruled.

## Q4 — What computes ORDER destinations that vary by seed? ANSWERED: objectives are entities, by design

`objectives.ts:36-40`: an order objective may be `targetUnitId`, resolving to the target
unit's CURRENT POSITION at activation; `orders.ts:130-141` then installs ORDER-kind
pursuit. The warband orders do exactly this (`scenario.json:9076-9185`, data):
gall-calhoun → co-l, ch-strike → co-i, lwm-charge → co-c. Seed-varying order
destinations are the schema's entity-objective feature working as designed. D116's
widened documentation gap NARROWS to a documentation item: the feature exists and is
sound; no document names it.

## Q5 — What triggers path recomputation? ANSWERED, and the arithmetic closes

`objectives.ts:91-108`: repath fires on a tick cadence (default 10; COMBAT/INITIATIVE
kinds use the configured `pursuitRepathCadenceTicks`) OR when the target has moved more
than **250 m** from its last-repath position (`objectives.ts:104-107`). At the observed
~126–136 m/tick target displacement, 250 m is crossed in two ticks, sometimes three —
**the 2-vs-3-tick rung cadence is the displacement trigger, and the rung spacing is the
target's displacement between repaths.** The ladder is the pursued unit's track, sampled.

## UNREGISTERED FINDINGS (verbatim scope, no interpretation)

- `orders.ts:106-129`: same-order cavalry recipients are staggered behind the lead
  recipient by `marchSpacingMeters`; two recipients of one order pursuing one target
  repath in lockstep — the ×2 pairing's mechanism-shaped neighborhood, recorded here
  because no registered question asked it.
- `objectives.ts:19-28`: D53a — waypoints and landmarkId COMPOSE, route first, landmark
  as final goal.
- `orders.ts:101-103`: D38 — an objective HOLD enters its proceed phase only if the
  objective is not already satisfied.
- `movement.ts:28, 146-148, 194-208`: pursuit standoff (150 m; melee range for COMBAT
  kind; 0 for CHARGE posture) — pursuers stop short of their terminals; a terminal is
  not a resting position.
- Pursuit kinds COMBAT and INITIATIVE are consumed here but assigned in excluded files.

## Amendment read — 2026-08-04, `morale.ts` opened by the dated amendment (`35ab384`)

**Q2-rout — ANSWERED: routed units flee to the nearest unengaged STEADY friendly's
POSITION.** `morale.ts:101-157` (`routeToSafety`, carrying the ledger's own D74 tag):
a ROUTED unit paths to the nearest STEADY friendly not in an active engagement, sorted
by distance then strength, with an interdiction blocker over enemy-controlled corridor
cells; posture WITHDRAW, speed GALLOP if mounted (5.4 m/s × 30 s × raster factor ≈
126–136 m/tick — the ladder target's arithmetic closes at the source). **The D114
family's "declared destinations" were never landmark selections: they are FRIEND
POSITIONS that coincided with landmarks** — routed co-i flees to co-e/co-f, who are
standing at last-stand-hill because their order put them there. The destination is an
entity position, computed once (`routSafetyPath`), not tracked. If no non-interdicted
corridor exists: `blockedReason = 'no non-interdicted corridor to steady friendly
mass'` (`morale.ts:139-148`).

**Q3 — ANSWERED: CHOSEN. The adjudicator's amendment prediction MISSES as registered.**
`morale.ts:49-99` (`startScoutWithdrawals`, carrying the ledger's D75 tag): scouts under
pressure path to the FIELD EDGE — the four candidate goals are axis-projected, clamped
edge points (`{minX, clamp(y)}, {maxX, clamp(y)}, {clamp(x), minY}, {clamp(x), maxY}`,
`morale.ts:75-79`), scored by the away-from-enemies dot product. **One coordinate
preserved (the unit's own, clamped), the other replaced by the bound — the exact
preserved/replaced frame the x=6624 plan registered at its Amendment 2.** The bound
terminals are DESTINATIONS — a doctrine-designed exit route — not truncation artifacts.
Per the amendment's registered branch: the co-locations are stable under repair and the
STEADY fix's scale holds at 82/120. The flagship's full cascade is now named end to
end: scout exits north at his own clamped x (D75) → routed units flee to the scout,
their nearest unengaged STEADY friendly (D74/D66) → pursuers path at the routed
(entity pursuit) — three documented mechanisms composing at one point.

**Bonus closure within the amendment's questions:** the COMBAT/INITIATIVE pursuit
assignment also lives here — `morale.ts:227-282` (`startPursuit`), D72(a) break-under-
contact pursuit and D72(b) consensus-initiative retargeting (`morale.ts:394-497`).
`combat.ts` was never needed, exactly as the amendment's held-back clause provided.

**The traceability finding, stated for the ruling:** `routeToSafety`, the scout
withdrawal, the pursuit machinery, and the morale pipeline carry the ledger's OWN
D-numbers in their comments — D66, D72, D74, D75, D91. The mechanisms this arc spent
three items failing to name from outside were ruled and documented in this register's
M-era. The documentation gap D114 named is a TRACEABILITY gap — the rows exist; the
path from observed phenomenon to owning row did not.

**UNREGISTERED FINDINGS from the amendment read (verbatim, queued, uninterpreted):**
- `morale.ts:361-392` (`reintegrateProtectedRouts`): a ROUTED unit near a STEADY
  friendly, with no live COMBAT pursuit, reintegrates to SHAKEN — a shelter mechanic
  adjacent to the STEADY-shelter predicate's subject.
- `morale.ts:433-437`: COMBAT pursuit ENDS when the target's steady-friendly mass
  meets or exceeds the pursuer's strength (`'steady-massed-fire'`) — a second shelter
  mechanic in the same neighborhood.
- `morale.ts:440-447`: pursuit breaks after `pursuitBreakTicks` of losing ground
  (`'beyond-pursuit-reach'`).

## Amendment read — 2026-08-04, `combat.ts` opened by the dated amendment (`05637f3`), scoped to the close-action finishing region

**For M4's patch, and answered exactly to its needs:** the finishing predicate is
`nearestShelter` in `resolveShock` (`combat.ts:429-443`) — for a defender ALREADY
ROUTED at bout start: nearest same-side combat unit, STEADY, not destroyed, not
withdrawn, within `config.isolationRadiusMeters`; the annihilation branch
(`combat.ts:464-479`) fires on break when `defenderAlreadyRouted && !nearestShelter`,
with D81 terminal accounting. The shelter result also feeds the `melee-bout` event's
`shelteredBy` payload (`combat.ts:502-508`) — the patch must keep that surface
coherent. The adjudicator's registered expectation — a straightforward eligibility
filter — HOLDS for the predicate itself.

**UNREGISTERED FINDING (surprise clause; logged verbatim, not interpreted, queued —
and NOT absorbed into M4):** `resolveShock` sets the defender's `moraleState` to
ROUTED directly, mid-resolution (`combat.ts:457-458`), before the tick's
`updateMorale` runs. Same-tick melee bouts therefore resolve in sequence against a
mutating morale field: a later bout's shelter check sees companions already broken by
earlier bouts of the same tick. This is a mechanism surface for the registered
evaluation-order item — the M2 timing fact's 99-versus-0 has a candidate locus here —
and per the amendment it queues for that item; nothing about it enters M4's read.

Scope held: lines 395–518 read (the finishing region and its immediate resolution
context); the rest of `combat.ts` remains unread; no other file opened.

## Conduct statement

From this read forward, no hypothesis in this project is drafted from a blind position;
subsequent registrations carry POST-READ where it matters. The scope bound held: five
file bodies opened, every one by ruling — four at the freeze, `morale.ts` by dated
amendment after a HALT taken rather than reasoned across; `combat.ts` remains unopened
and unneeded; every other boundary crossing was signature-only. The blind era closed at
D116 with its evidential weight intact.
