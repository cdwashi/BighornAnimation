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

## Amendment read — 2026-08-04, `engagement.ts` opened and `combat.ts` extended by the evaluation-order plan's file-scope ruling (`67d5bc1`)

**E2's answer — the order's origin:** `state.engagements` is append-only
(`engagement.ts:120`, descriptors pushed at first contact, never re-sorted, deactivated
in place), so bout resolution order = **engagement CREATION order = first-contact
chronology**, with same-tick contact ties broken by declared-unit order via the
`entities()` double loop (`engagement.ts:95-98`, D30's determinism contract). This is
a temporal warrant AT DESCRIPTOR GRANULARITY — longest-standing contact resolves first
— which is chronology of CONTACT, not chronology of the current tick's tactical
events; whether that warrant suffices is the adjudication's question, reported here
without a verdict.

**The fire/shock asymmetry is ARCHITECTURAL, not incidental:** `resolveCombat` computes
all fire into a `pending` buffer and applies it AFTER the engagement loop
(`combat.ts:528, 574-576`) — simultaneity implemented as compute-then-apply — while
`resolveShock` mutates in place inside the loop (`combat.ts:544`). Someone built fire
WITH a deferral buffer and shock WITHOUT one. Amendment 3's required report: **D64's
row covers fire only** — the fire buffer's simultaneity is attested by both structure
and ruling scope; whether that intent extends to melee remains UNRULED, exactly as the
amendment's constraint provided: H-ARTIFACT's warrant premise is not strengthened.

**Scope-internal texture, reported without interpretation:** the within-tick semantics
are a THREE-WAY mixture — fire DIRECTIONS snapshot pre-loop (`combat.ts:530-533`),
fire COMPUTATION reads live mid-loop state, fire APPLICATION deferred post-loop; shock
is fully live. A defender routed by an early bout still fires this tick only per the
pre-loop direction snapshot's eligibility. Recorded for the item's evidence base.

**E3 dice-path disclosure, registered before the probes run:** any reordering of the
engagement loop reshuffles the seeded RNG draw sequence, so an E3 delta conflates
order-semantics with dice-path noise — which is WHY Amendment 1's randomized arm reads
a DISTRIBUTION against the measured reseed noise floor (~0.5 pp on means) rather than
a single number against zero.

Scope held: `engagement.ts` read whole (the file is the creation/ordering machinery);
`combat.ts` read `:513-577` (the resolution loop); no other file opened.

## Amendment read — 2026-08-04, `score.ts` opened by the corpse-drift audit amendment (`f6bfce9`), scoped to one question

**The question: does any calibration leg read unit positions, and does it filter on
`endState`? The answer: YES, and the filtering is SPLIT.** The HOLDING_AT end-state leg
samples the unit's track at the assertion minute and is DESTRUCTION-GUARDED —
`passed: !destroyed && distance <= radius` (`score.ts:320-323`); a corpse's position
cannot flip it. The DESTROYED/ROUTED/WITHDRAWN conditions are event-based
(`score.ts:292-311`), pre-drift by construction. **But `scoreCheckpoints`
(`score.ts:38-73`) scans the unit's ENTIRE track for the nearest sample to each
checkpoint with NO destruction filter** (`score.ts:48-57`) — a structural exposure: a
drifting corpse passing nearer a checkpoint than the living unit ever did replaces the
nearest-sample and its wrong-minute timestamp can flip the verdict either way.
**Quantified against the committed world's single re-arm** (`corpse-drift-c1-check`):
co-m carries NO checkpoints — the unfiltered scan has nothing to read from the drift.
The exposure is structural, not realized; committed figures across D113–D120 are
CONFIRMED unaffected through every scoring path. Scope held: positional-read regions
and the checkpoint scan only; the rest of `score.ts` remains unread.

## Amendment read — 2026-08-05, `combat-config.ts` and `combat.ts` (split region) opened by the 268-versus-253 registration's §3 two-region ruling (frozen `dc39dab`)

**Scope as ruled:** (i) `combat-config.ts`, the `KILLED_TO_WOUNDED_RATIO_RANGES`
declaration and every within-file consumer of the range (read `:140-265`, plus the
`:81-82` type field); (ii) `combat.ts`, the casualty-split consumption — `applyResult`
(`:350-394`) and its split routine `splitCasualties` (`:98-111`, located by exhaustive
identifier grep from the `:368` call). Transitive halt honoured: the annihilation
branch, shock resolution, and probe-runner plumbing were not opened here.

**R1 — call sites, exhaustive (identifier grep over `engine/`):** ONE behavioral
consumer. `DEFAULT_COMBAT_CONFIG.killedToWoundedRatioBySide` is built as
sideId → `range.best` (`combat-config.ts:232-234`) and read at exactly one engine
site: `combat.ts:366` in `applyResult`, the FIRE-result application path, which
passes it to `splitCasualties` (`:368`) — itself called from exactly that one site.
Non-behavioral consumers: the provenance table (`combat-config.ts:241`,
'sourced-range' label), two test files (`d110-pins.test.ts`, `m5a-gates.test.ts`,
consuming the RANGES export for assertions), and `combatConfig(overrides)`'s copy
machinery. **LINE-DRIFT NOTE for the record: the ruled rows' `combat-config.ts:231`
now sits at `:232-234`** — line 231 is `infiltrationSuppressionMultiplier` in the
current tree; the D112 coalition re-pin comment added lines above it. The
consumption the rows describe is real and singular; the number aged.

**R2 — the split arithmetic: SHARE-FORM, PER-EVENT.** `splitCasualties`
(`combat.ts:98-111`): `killedExpectation = casualties × R/(R+1)`; killed =
`min(casualties, floor(expectation) + one seeded Bernoulli on the fractional
remainder)` (the source's own comment: "D26/D81: floor plus exactly one seeded roll
on the fractional remainder"); wounded = the integer complement. Integer casualties
enforced by RangeError; non-negative ratio guarded at `:367` (missing side throws).
**The §5 conditional's premise HOLDS as written — the mechanism is share-form** —
so the conditional direction is live: killed share 0.83750 → 0.82951 under 253/52.
**Measurement-relevant texture:** `stochasticInteger` (`:92-96`) consumes its draw
UNCONDITIONALLY, so a ratio change alters NO draw counts — under M-FLIP the RNG
sequence stays in lockstep with the committed world; deltas are split-threshold
effects plus their behavioral downstream, not dice-path reshuffles (the E3
disclosure's conflation does not arise here).

**R3 — other consumers: NONE.** No other engine site reads `best`, low/high, the
range, or the map. By the one-call-site fact, the melee/annihilation terminal
accounting (`combat.ts:464-479`, prior scoped read `60ef41e`) does NOT flow through
the ratio: the ratio governs fire-application casualties only. How much of the
committed world's US casualty production flows through the fire path versus
terminal accounting is M-COVER's question, measured not asserted.

**Config-surface finding (within R1's remit):** `combatConfig(overrides)` exposes a
per-side override channel, key `killedToWoundedRatio.<sideId>`
(`combat-config.ts:259-263`, documented at `:81`) — a byte-free route to a 253/52
world IF probe plumbing reaches it. Whether M-FLIP uses it instead of the frozen
throwaway patch is a question for the bands amendment, not this log.

## Conduct statement

From this read forward, no hypothesis in this project is drafted from a blind position;
subsequent registrations carry POST-READ where it matters. The scope bound held: five
file bodies opened, every one by ruling — four at the freeze, `morale.ts` by dated
amendment after a HALT taken rather than reasoned across; `combat.ts` remains unopened
and unneeded; every other boundary crossing was signature-only. The blind era closed at
D116 with its evidential weight intact.
