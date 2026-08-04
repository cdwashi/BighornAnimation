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

## Conduct statement

From this read forward, no hypothesis in this project is drafted from a blind position;
subsequent registrations carry POST-READ where it matters. The scope bound held: four
file bodies opened, all ruled; every boundary crossing was signature-only; the HALT was
taken rather than reasoned across. The blind era closed at D116 with its evidential
weight intact.
