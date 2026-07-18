# M4-A post-D72 report — third binding STOP

Execution date: 2026-07-18  
Starting HEAD: `4bcb5bf0ddcb621196c9e18dfeb3bca3e6411859`  
Seed: `18760625`

## Outcome

D72 was implemented as one mechanism:

- ROUT or BROKEN-under-contact triggers path-based PURSUIT.
- Pursuit contact persists while the pursuer closes or matches range; fire and
  shock continue.
- Pursuit ends when the pursuer loses reach/morale or encounters steady
  friendly massed fire.
- CONSENSUS_INITIATIVE bands re-target the nearest believed enemy, including
  couriers, inside a proposed 1,500 m initiative radius.
- ROUTED units cannot receive RESUPPLY.

The first run revealed and corrected one direct rider mismatch: pursuit
termination initially required the pursued unit itself to be STEADY. The
corrected predicate uses the surrounding steady friendly mass, allowing a
broken individual to be protected by the consolidated hill defense. No
parameter changed.

The corrected D71+D72 baseline still crosses the binding third-STOP line:

- C, I, and L are DESTROYED.
- E survives 40/40 and F survives 40/40.
- D Company is mechanically DESTROYED after routing.
- A/G/M/H/K/B and the pack train survive; the village is preserved.
- Kanipe and Martini survive and deliver, with no pursuit against either.
- Full day: 27,223.7 ms, failing F6.

The asymmetry therefore does not emerge. No further mechanism or numeric
change was made.

## Quartet (verbatim)

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

The binding STOP occurred before `npm run lint`, `npm test`, or
`npm run build`. There is no quartet-green claim.

## F1–F6

| Gate | Result | Evidence |
|---|---|---|
| F1 seed flip | SUSPENDED BY STOP | Named same-seed/different-seed test and legacy-pin conversion were not completed. |
| F2 conservation | SUSPENDED BY STOP | Measured strengths/casualties were integer and non-negative; the named complete invariant test was not added. |
| F3 combat-off regression | SUSPENDED BY STOP | Explicit combat-off bypass remains, but E5/C4/M2/M3 byte equivalence was not re-proved. |
| F4 baseline | **FAIL — third STOP** | E/F survive and D is destroyed. Village and required couriers survive. |
| F5 | **FAIL — asymmetry incomplete** | Four-column evidence and mechanism trail below. |
| F6 | **FAIL** | 27,223.7 ms. Frequent real-path pursuit repaths dominate the new cost; range pruning/optimization was prohibited after STOP. |

## F5 four-column scorecard

### Checkpoints

Each cell is `nearest minute / distance meters / result`.

| Checkpoint | Movement-only | Unfrictioned STOP | D71 STOP | D71+D72 | Judgment |
|---|---|---|---|---|---|
| cp-scouts-crows-nest | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | unchanged |
| cp-reno-ford-a | 582.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 2 min earlier than movement |
| cp-reno-skirmish-line | 787.5 / 515.2 / MISS | 766.5 / 518.9 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | movement parity |
| cp-reno-timber | 787.5 / 1447.7 / MISS | 766.5 / 1451.0 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | movement parity |
| cp-reno-hill | 807.5 / 0.0 / MISS | 786.5 / 0.0 / MISS | 807.5 / 0.0 / MISS | 807.5 / 0.0 / MISS | movement parity |
| cp-yates-ford-b | 796.0 / 0.0 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | slightly away |
| cp-right-wing-calhoun | 815.0 / 0.0 / MISS | 818.5 / 0.0 / MISS | 818.5 / 0.0 / MISS | 818.5 / 0.0 / MISS | 3.5 min later |
| cp-keogh-sector | 815.0 (-10.0) / 415.6 / MISS | 816.5 (-8.5) / 415.6 / MISS | 849.0 (+24.0) / 65.1 / MISS | 816.5 (-8.5) / 415.6 / MISS | D72 returns to unfrictioned timing/position |
| cp-custer-last-stand | 831.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 2 min early |
| cp-weir-point | 848.0 / 0.0 / HIT | 847.5 / 0.0 / HIT | 847.5 / 0.0 / HIT | 847.5 / 0.0 / HIT | 0.5 min early |

All four runs score 4/10.

### Casualties

| Unit/group | Movement-only | Unfrictioned STOP | D71 STOP | D71+D72 | Judgment |
|---|---:|---:|---:|---:|---|
| Company C | 0 | 40 | 15 | 40 | required destruction emerges |
| Company E | 0 | 40 | 0 | 0 | **gross inversion: untouched** |
| Company F | 0 | 40 | 0 | 0 | **gross inversion: untouched** |
| Company I | 0 | 40 | 13 | 40 | required destruction emerges |
| Company L | 0 | 40 | 13 | 40 | required destruction emerges |
| Company A | 0 | 45 | 5 | 3 | survives |
| Company G | 0 | 45 | 3 | 3 | survives |
| Company M | 0 | 45 | 6 | 5 | survives |
| Company H | 0 | 45 | 0 | 7 | survives |
| Company D | 0 | 24 | 20 | 45 | **hill-defense failure** |
| Company K | 0 | 42 | 0 | 3 | survives |
| Company B | 0 | 0 | 0 | 0 | survives |
| Pack train | 0 | 19 | 0 | 0 | survives |
| Coalition warrior bands | 0 | 1,109 | 291 | 107 | friction + pursuit reduces mutual annihilation |
| Arikara scouts | 0 | 6 | not separately reported | 37 | destroyed, including five ford-cluster casualties |
| Crow scouts | 0 | 0 | not separately reported | 6 | destroyed by initiative convergence |

### End states

| End-state | Movement-only | Unfrictioned STOP | D71 STOP | D71+D72 |
|---|---|---|---|---|
| C/E/F/I/L | no combat state | all DESTROYED | all survive | C/I/L destroyed; **E/F survive** |
| A/G/M | movement tracks | all DESTROYED | all survive | all survive, 123/135 |
| H/D/K | movement tracks | H/K destroyed, D survives | all survive | H/K survive; **D destroyed** |
| B | movement track | survives | survives | survives 45/45 |
| Packs | movement track | 111/130 | 130/130 | 130/130 |
| Village | no combat state | preserved | preserved | preserved |
| Kanipe | timer delivery | delivered | delivered | alive, delivered tick 1396 |
| Martini | timer delivery | delivered | delivered | alive, delivered tick 1426 |

## Mechanism trail

### Custer wing: partial mechanism success

- Pursuit/convergence destroys C, I, and L together at tick 1780.
- Coalition bands start 24 pursuit chains against C. C absorbs the close-range
  convergence; I and L collapse through routed cohesion while the same contact
  complex remains active.
- Custer-wing resupply is now zero. The D72 corollary prevents the prior
  routed-wing transfer of 5,274 pack rounds.
- No leader dies in this seeded run.
- E and F never break, so PURSUIT never activates against them. Initiative
  selects E only once and F twice, producing no casualties. Bands instead
  converge repeatedly on believed scouts, C, D, H/K, and a courier.
- The missing wing-level cascade is therefore explicit: nearest-contact
  initiative plus individual morale does not propagate C/I/L's collapse into
  steady E/F.

### Hill: pursuit breaks, but routed D still cohesion-destroys

- The steady-massed-fire predicate ends 45 pursuits. This is the expected
  siege-transition signal and saves B Company after the rider correction.
- D takes 20 fire casualties through tick 1757, becomes SHAKEN at 1735,
  BROKEN at 1751, and ROUTED at 1756.
- Cheyenne and Lame White Man pursuit chains end at tick 1766 specifically
  because of `steady-massed-fire`. D takes no later casualty-resolution
  losses.
- Nevertheless D remains in uncontrolled rout, continues shedding cohesion,
  and mechanically becomes DESTROYED at tick 1852. Destruction converts its
  remaining 25 men into the unit casualty total without corresponding
  casualty-resolution events.
- Thus the hill is not ground down by continuing pursuer fire after
  consolidation; it fails because pursuit termination does not reintegrate a
  routed unit into the protecting mass, and rout cohesion attrition continues
  after pressure has broken off.
- A/G/M receive 13,500 Springfield rounds total (4,500 each). ROUTED D
  receives none, proving the resupply corollary is active.

### Courier trail

- Kanipe and Martini are neither pursued nor killed; both deliver at ticks
  1396 and 1426.
- Initiative retargeting selects the Weir-recall courier twice, demonstrating
  that 1-man couriers participate in the normal believed-target pool. No
  historical-fate pin or courier exclusion was added.

### Retreat-crossing validation

Pursuit plus ford geometry does produce a real casualty cluster at the
retreat crossing, but not the expected Reno-trooper cluster:

- Five Arikara-scout casualties fall 10 m from the retreat crossing at ticks
  1487–1493.
- One Crow King band casualty falls there at tick 1496.
- No A/G/M casualty falls within 300 m of the crossing.

The choke mechanism is therefore spatially live, but initiative/pursuit target
selection sends scouts—not Reno's broken companies—through its killing
pressure in this baseline.

## Third-STOP diagnosis

The remaining failure is not a pursuit lethality parameter:

1. **Protected-rout reintegration is absent.** Steady massed fire correctly
   terminates pursuit, but the routed unit keeps fleeing and losing cohesion
   instead of consolidating into the mass that protected it.
2. **Collapse propagation is unit-local.** E/F remain STEADY and are rarely
   selected by initiative after adjacent C/I/L collapse, so the five-company
   wing never becomes one converging tactical problem.
3. **Initiative target competition is informative.** Scouts and a courier are
   legitimate believed targets and draw convergence away from E/F. Changing
   weights/radius after observing this would be prohibited tuning.

These findings require a new mechanism ruling. No knob was changed.

## Updated [CAL] table

All engine-owned combat values remain in
`engine/src/combat-config.ts`. D72 adds only the flagged pursuit/initiative
values shown in bold.

| Parameter | Value | Provenance |
|---|---:|---|
| combatFrictionFactor | 0.06 | anchored by historical-totals arithmetic (268 US / 53 Reno-Benteen / <=300 coalition imply 10-20x reduction from unfrictioned rates); M5 calibrates the digit |
| **initiativeRadiusMeters** | **1,500** | **proposed-flagged** |
| **pursuitCloseRangeMeters** | **50** | **proposed-flagged** |
| **pursuitRepathCadenceTicks** | **2** | **proposed-flagged** |
| **pursuitBreakTicks** | **4** | **proposed-flagged** |
| **pursuitRangeLossToleranceMeters** | **15** | **proposed-flagged** |
| engagement / charge / melee / disengage range m | 700 / 180 / 25 / 900 | proposed-flagged |
| intensityExpectedHitsScale | 2 | proposed-flagged |
| exposure Column / Line / Skirmish / Dispersed / Pack | 1 / .85 / .65 / .50 / 1.25 | proposed-flagged |
| coverFloor | .05 | proposed-flagged |
| flanking multiplier / angle | 1.25 / .6π | proposed-flagged |
| tactics base / scale | .75 / 200 | proposed-flagged |
| bowIndirectHitProbabilityMultiplier | .65 | proposed-flagged |
| clearJamTicks | 4 | proposed-flagged |
| lowAmmoFraction | .20 | spec-given |
| lowAmmo / shaken / broken discipline | .65 / .80 / .50 | proposed-flagged |
| morale STEADY / SHAKEN / BROKEN thresholds | 70 / 40 / 15 | proposed-flagged |
| casualty / leader-loss morale drain | 70 / 22 | proposed-flagged |
| flank / isolation / low-ammo drain | 1.2 / .35 / .25 per tick | proposed-flagged |
| suppression drain max | .08/tick | proposed-flagged |
| lull / friendly recovery | .18 / .12 per tick | proposed-flagged |
| leader rally scale | .004 × rating/tick | proposed-flagged |
| friendly / isolation / leader radii m | 450 / 650 / 500 | proposed-flagged |
| rout rally morale | 25 | proposed-flagged |
| destruction strength / cohesion floor | 0 / 3 | proposed-flagged |
| withdrawal discipline threshold | 60 | proposed-flagged |
| rout cohesion drain | 1/tick | proposed-flagged |
| leader exposure per hit / melee / trait multipliers | .0015 / 3 / 1.75 | proposed-flagged |
| leader order-delay bump | 5 min | proposed-flagged |
| resupply radius / rounds per tick | 250 / 240 | proposed-flagged |
| fatigue gallop / melee / recovery | .45 / .80 / .20 per tick | proposed-flagged |
| fatigue speed cap / max combat penalty | 75 / .35 | proposed-flagged |
| charge shock scale / speed bonus / break / repel | 1 / 1.2 / 1.1 / .8 | proposed-flagged |
| marchSpacingMeters | 150 | spec-given (~150 m [CAL]) |
| courierTargetExposure | .20 | proposed-flagged |

Scenario weapon RPM, hit bands, and malfunction Estimates remain byte-untouched:

| Weapon | RPM | Hit bands | Malfunction/100 |
|---|---:|---|---:|
| Springfield | 8 | 100m .35; 200m .22; 350m .12; 500m .05; 700m .02 | .4 |
| Colt SAA | 10 | 25m .30; 50m .15 | .5 |
| Henry/Winchester | 14 | 50m .30; 100m .20; 150m .10; 250m .03 | 2 |
| Sharps .50 | 3 | 200m .30; 400m .18; 600m .08 | 1 |
| Muzzleloader | 1.5 | 75m .25; 150m .10 | 5 |
| Bow | 8 | 40m .25; 80m .12; 120m .05 | 0 |

## AMBIGUITIES

- D72 says pursuit respects existing steady-massed-fire disengagement rules,
  but no explicit pre-D72 function existed. The implementation reuses current
  STEADY/SHAKEN states, current strength, and `friendlyRadiusMeters`;
  no new mass threshold was introduced.
- Whether pursuit termination should immediately attach a routed unit to the
  protecting formation is not specified. This is now outcome-critical and was
  not assumed.
- Initiative radius and pursuit cadence/range-loss controls are proposed
  [CAL] values authorized by D72; none was adjusted after observing the run.
- An initiative band can choose scouts or couriers over a cavalry company when
  they are the nearest believed enemy. This is intentional under Chuck's
  courier rider.
- Unit destruction from cohesion sets casualties to full starting strength.
  Those final losses do not emit casualty-resolution positions, because no
  fire/melee casualty occurred that tick.

## Deviations caused by third STOP

- F1–F6 named tests and legacy seed-pin conversion remain incomplete.
- D55 cache equivalence and E6 combat-on replay were not re-proved.
- F6 range pruning and pathfinding optimization were not performed.
- Full quartet and generated reports were not completed.
- No UI work was performed.
- No commit or push was made.
