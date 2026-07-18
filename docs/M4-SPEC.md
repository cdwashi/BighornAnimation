# M4-SPEC — Combat · Morale · Ammunition ("The Fight")

Status: DRAFT for Chuck's review. Proposed decisions D60–D68; open questions
at bottom. Scope per PRD M4 (combat, morale, command friction, resupply; exit:
full baseline run completes) plus the accumulated additions: encounter
tooltips, march-order column spacing, courier entities. This is the milestone
that closes the Keogh miss — the collapse becomes computable.

## 1. The first dice (D60)
M4 consumes the PRNG. Consequences, made explicit:
- E1's "different-seed runs identical" assertion **flips by design** to
  "different-seed runs diverge after first contact (~tick 1440), identical
  before it." The flip is its own named test — M2 planned this moment.
- Per-seed determinism (same seed ⇒ bit-identical) remains absolute; the
  cache-purity gate and E6 replay equivalence must stay green with combat on.
- Randomness enters ONLY through combat resolution and malfunction rolls;
  spotting stays deterministic (D46 unchanged).

## 2. Engagement model (D61)
`contact-pending` graduates into an engagement state machine per contact:
**APPROACH → FIREFIGHT → (CHARGE → MELEE) → one of: WITHDRAWAL / ROUT /
DESTRUCTION / DISENGAGE**. Transitions driven by orders, tactics weights,
morale, and range. Each engagement carries a typed descriptor — unit pair,
state, range band, intensity — which is **the data source for Chuck's
encounter tooltips** (UI shows "dismounted skirmish fire, 250 m" or
"mounted charge — receiving" at the contact point).

### Fire resolution (D62)
Per tick, per firing unit vs. target:
`expectedHits = shooters_effective × rpm(weapon)·tickFraction ×
hitProb(rangeBand) × exposure(target formation/cover/coverFactor) ×
flanking × tacticsModifier × leaderTacticalSkill/50 × fireDiscipline(morale,
ammo)`
- Applied via **deterministic expectation + seeded stochastic rounding**
  (floor + one roll on the remainder): runs stay statistically stable while
  genuinely consuming RNG; casualties are integers by construction (D26).
- `shooters_effective` respects horse-holder bookkeeping (dismounted = 3/4
  firing) and ammunition (empty weapons drop out of the mix).
- Malfunction rolls per weapon table (the Springfield extraction Estimate
  finally does its job); malfunctioned rifles rejoin after a clear-jam delay
  (French on the hilltop).
- Mixed-weapon warrior bands fire by weaponMix fractions per range band —
  bows join only inside their bands, arcing (indirectCapable) ignores
  intervening cover coverFactor at the cost of a hitProb penalty [CAL].

### Charge & melee (D63)
CHARGE closes at gallop; on contact, resolution is **shock-vs-morale**, not
detailed melee: attacker shock score (strength, speed, leader aggression,
tactics shockCharge) vs defender morale state → defender breaks (ROUT), holds
(converts to close FIREFIGHT with melee-band weapons), or repels. Lame White
Man's charge against a shaken C Company is the calibration archetype.

## 3. Morale (D64)
Per-unit continuous morale (0–100, starts baseMorale) with four states:
**STEADY / SHAKEN / BROKEN / ROUTED** at [CAL] thresholds.
- Drains: casualty rate (per-tick fraction lost, not totals), leader loss,
  flanked/enfiladed fire, isolation (no friendly within radius), ammunition
  low, sustained suppression (incoming volume even without hits).
- Recovers: leader rally (rating, within influence radius, only ≤ BROKEN),
  lull time, friendly proximity.
- **withdrawalDiscipline shapes the break** (Fox's thesis as a parameter):
  high = orderly WITHDRAWAL fighting rearward; low = ROUT — uncontrolled
  flight toward safety at best speed, no fire, shedding cohesion. The
  Custer-battalion collapse and Reno's timber exit are both this dial.
- ROUTED units path to nearest safety (friendly mass or defensible terrain);
  rally attempts en route. DESTRUCTION when strength or cohesion floors —
  satisfying the calibration end-states (C3) at last by mechanics, not fiat.

## 4. Leaders under fire (D65)
Leaders are killable: per-tick exposure roll while their attached unit takes
hits (weighted up in MELEE/CHARGE and for leads-by-example traits). Leader
death: morale shock to attached + nearby units, rally lost, orderDelay bump
for the side's affected branch (succession is a delay, not a new leader, in
v1). Bloody Knife's death beside Reno is the archetype — **emergent, not
scripted**: the sim rolls it, history recorded one outcome of that
distribution.

## 5. Ammunition & resupply (D66)
Per-man rounds by weapon tracked (already in state); expenditure per fire
tick; low-ammo (< 20%) degrades fireDiscipline; empty = weapon leaves the
mix. RESUPPLY: pack-train proximity transfer at [CAL] rate, capped by the
26,000-round reserve — Benteen's hilltop lifeline becomes mechanical.
Scavenging from the fallen: backlog (noted for the hilltop wrong-weapon
cases evidence).

## 6. Fatigue-lite (D67)
The D32 deferral lands, minimal: a 0–100 fatigue pool per unit; gallop and
MELEE drain it, halts recover it; high fatigue caps speed class and shaves
combat effectiveness [CAL]. Enough to make gallop a spend, not a free gear.

## 7. Couriers become entities (D35 upgrade, D68)
In-transit orders now ride a courier entity moving issuer→recipient at
gallop along a real path; couriers can be spotted and killed (they're a
1-man unit for targeting). Baseline history is preserved — Kanipe and
Martini got through — but under variants and combat chance they can fail,
and an undelivered order simply never arrives. The information layer gets
its casualty model.

## 8. March-order column spacing (Chuck's request, engine side)
Companies sharing a battalion order receive a deterministic along-path
offset by march seniority (data order), spacing [CAL] ~150 m column gaps:
Reno's advance becomes a visibly strung three-company column with distinct
per-company tracks. Supersedes M3-D's cosmetic fan-out whenever units are
actually moving; the fan-out remains for genuinely co-located halts.

## 9. UI additions (small, riding the milestone)
Strength bars drop live; morale state as a marker cue (legend data file
gains rows); encounter tooltips at contact points from the D61 descriptors;
rout rendered as motion + state, not decoration; casualty event ticks on
the scrubber. Deeper visuals stay M6.

## 10. Exit gates
- **F1 Seed flip**: same-seed bit-identical end-to-end; different-seed
  identical until first contact, divergent after — both asserted.
- **F2 Conservation**: casualties never exceed strength; ammunition ≥ 0;
  strength+casualties invariant per unit; all integers (D26).
- **F3 No-combat regression**: with combat disabled (flag), E5, the C4 exam,
  and all M2/M3 gates reproduce byte-identically.
- **F4 Baseline completes**: full day with combat, no errors; Custer's five
  companies reach DESTROYED; Reno-Benteen holds the hill; the engagement
  log is coherent (no state-machine dead ends).
- **F5 Directional scorecard (informational)**: checkpoint + casualty +
  end-state score vs the movement-only baseline — must move toward history;
  formal C1–C4 composite gating is M5's calibration, not M4's. Keogh's
  −10 min/416 m miss is the marquee number to watch.
- **F6 Performance**: full day ≤ 10 s (D56 budget + combat headroom);
  profile reported.
- Quartet; cache-purity and E6 green with combat on.

## 11. Split of work
Fable: this spec; F5 scorecard review (the first look at a simulated
*fight*); M4 final review. Codex M4-A (engine) then M4-B (UI additions).
Chuck: open questions; then watch the Keogh sector at 16:45.

## 12. Open questions for Chuck
1. **Casualty visualization**: where men fall, leave a persistent small
   marker on the map (echoing the battlefield's marble markers) — or keep
   casualties numeric-only in bars/tooltips? Historically resonant vs.
   possibly somber; your call on taste.
2. **Leader-death emergence**: per D65, Custer can die early, late, or (in
   counterfactual runs) survive — the baseline seed will be chosen in M5
   calibration to match history's outcome envelope, but any single run may
   vary. Comfortable with that, or want a "historical fates" toggle that
   pins leader deaths to documented times in baseline mode?
3. **Default speed slider ceiling** with combat on — keep 120× or cap lower
   so fights are watchable by default? (Cosmetic.)
