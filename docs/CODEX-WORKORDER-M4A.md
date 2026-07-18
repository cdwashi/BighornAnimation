# CODEX WORK ORDER — M4-A: Combat engine (per M4-SPEC, ledger rows D62–D70)

## Goal
Implement docs/M4-SPEC.md §1–8 in the engine: first RNG consumption, the
engagement state machine, fire/charge resolution, morale with rout, leader
casualties, ammunition/resupply, fatigue-lite, courier entities, and
march-order column spacing. Exit: quartet green, gates F1–F6. UI is M4-B.

## Numbering note (binding)
M4-SPEC's proposed D60–D68 collided with the O3 arc's ledger rows (D60
coordinate, D61 pony herd). **Ledger is authoritative; the spec's decisions
land as D62–D70** in spec order: D62 first-dice · D63 engagement machine ·
D64 fire resolution · D65 charge/melee · D66 morale · D67 leaders-under-fire
· D68 ammunition/resupply · D69 fatigue-lite · D70 courier entities +
march-order spacing. Append rows derived verbatim from the spec's sections
with these numbers, dated on execution date, each status Approved (Chuck,
07-18, incl. open-question answers below). Add a one-line note row or
footnote in the ledger recording the renumbering so spec↔ledger references
stay traceable.

## Chuck's rulings on the spec's open questions (binding on implementation)
- Q1 **Persistent fall markers**: casualty resolution must emit events
  carrying **position** (where the losses occurred that tick) — M4-B plants
  the markers; the engine's job is that the data exists.
- Q2 **Emergent leader death**: as spec'd (D67); no historical-fates pinning.
- Q3 Speed cap during engagements: M4-B scope; engine exposes an
  `engagementActive` signal per tick for the UI to consume.

## Inputs
docs/M4-SPEC.md (authoritative; spec wins on conflict), IMPLEMENTATION_HISTORY
through D61, engine + scenario at the O3-arc commit. House rules: assemble
don't invent ([CAL] starting values live in one combat config table —
propose values only where the spec gives none, flag every one); ambiguity
protocol; STOP-and-escalate on F4/F5 gross weirdness (a baseline where the
7th Cavalry wins, or the village is destroyed, is an escalation, not a
tuning opportunity).

## Task map (spec section → module)
1. §1 → rng consumption discipline + the E1 flip test (F1).
2. §2 → engine/src/engagement.ts: state machine, typed encounter
   descriptors (the tooltip data), contact graduation from contact-pending.
3. §2 fire → combat.ts: expectation formula verbatim from spec; seeded
   stochastic rounding (integers by construction); malfunction rolls +
   clear-jam delay; weaponMix band participation incl. indirect bows.
4. §2 charge → shock-vs-morale resolution.
5. §3 → morale.ts: continuous pool, four states, drains/recovery per spec,
   withdrawalDiscipline break-shaping, ROUT pathing + rally, DESTRUCTION
   satisfying calibration end-state conditions mechanically.
6. §4 → leader exposure rolls, death effects (morale shock, rally loss,
   orderDelay bump), events carrying leader + position.
7. §5 → ammunition decrement, low-ammo fireDiscipline, RESUPPLY transfer
   capped by pack-train reserve.
8. §6 → fatigue pool; gallop/melee drain, halt recovery, caps.
9. §7 → couriers as 1-man entities on real paths; spottable, killable;
   undelivered orders never arrive; baseline must still deliver Kanipe and
   Martini (assert in F4 — if baseline combat kills them, escalate: that is
   a finding about exposure rates, not a script-around).
10. §8 → march-order along-path offsets by data order (~150 m [CAL]);
    supersedes display fan-out when moving.

## Gates (named tests)
F1 seed-flip (same-seed identical; different-seed identical until first
contact, divergent after — both asserted, flip documented). F2 conservation
(casualties ≤ strength; ammo ≥ 0; integers everywhere; per-unit
strength+casualties invariant). F3 no-combat regression (combat flag off ⇒
E5, C4 exam, all M2/M3 gates byte-identical). F4 baseline completes: full
day, no errors, Custer's five companies DESTROYED, Reno-Benteen + packs
HOLDING at the hill, couriers delivered, engagement log coherent. F5
directional scorecard (informational): checkpoint/casualty/end-state vs the
movement-only baseline — report side-by-side; Keogh's −10 min/416 m is the
marquee number; gross weirdness escalates. F6 perf ≤ 10 s full day, profile
reported. Cache-purity + E6 green with combat on. Quartet.

## Proof + output
codex-report-m4a.md: quartet verbatim, F1–F6 results, the F5 scorecard table
in full, the combat [CAL] config table with per-value provenance
(spec-given vs proposed-flagged), AMBIGUITIES, deviations. No commit/push —
the F5 review is Fable's, and the first simulated fight deserves it.
