# M4-A post-D71 report — second binding STOP

Execution date: 2026-07-18  
Starting HEAD: `4bcb5bf0ddcb621196c9e18dfeb3bca3e6411859`  
Seed: `18760625`

## Outcome

D71's sole authorized structural term was implemented:

`expectedHits *= combatFrictionFactor`, with
`combatFrictionFactor = 0.06`.

No scenario weapon RPM, hit band, malfunction Estimate, or other [CAL] value
was changed.

The frictioned baseline preserves Reno–Benteen, the pack train, the village,
Kanipe, and Martini, but **all five Custer companies survive**:

| Custer company | Start | Survivors | Casualties | Final morale |
|---|---:|---:|---:|---|
| C | 40 | 25 | 15 | STEADY, 100 |
| E | 40 | 40 | 0 | STEADY, 100 |
| F | 40 | 40 | 0 | STEADY, 100 |
| I | 40 | 27 | 13 | STEADY, 100 |
| L | 40 | 27 | 13 | STEADY, 100 |
| **Total** | **200** | **159** | **41** | — |

This triggers D71's binding gross-inversion clause. No second knob or
mechanism change was made. The named gates, optimization pass, and quartet
were suspended again.

## Quartet (verbatim)

`npm run typecheck --silent` completed with exit code 0 before the
frictioned baseline.

Because D71 required an immediate STOP when the Custer wing survived,
`npm run lint`, `npm test`, and `npm run build` were not run afterward.
There is no quartet-green claim.

## F1–F6 status

| Gate | Result | Evidence |
|---|---|---|
| F1 seed flip | SUSPENDED BY STOP | The frictioned run consumed 33,047 serialized PRNG draws. The named same-seed/different-seed assertions were not completed. |
| F2 conservation | SUSPENDED BY STOP | Measured strengths/casualties remained non-negative integers and each listed unit conserved start = survivors + casualties. The named full-state invariant test was not completed. |
| F3 no-combat regression | SUSPENDED BY STOP | The explicit combat-off path remains present, but the full E5/C4/M2/M3 byte-equivalence proof was not completed. |
| F4 baseline | **FAIL — STOP** | Hilltop preserved, village preserved, couriers delivered, but C/E/F/I/L all survive. |
| F5 directional scorecard | **FAIL — asymmetry does not emerge** | Three-column evidence below. |
| F6 performance | FAIL / SUSPENDED | Full day measured 10,508.2 ms, 508.2 ms over budget. Range-pruning was not attempted after the binding STOP. |

## F5 full three-column scorecard

### Checkpoints

| Checkpoint | Movement-only E5 | Unfrictioned STOP | D71 frictioned | D71 judgment |
|---|---|---|---|---|
| cp-scouts-crows-nest | 0.0 min / 0.0 m, HIT | 0.0 / 0.0, HIT | 0.0 / 0.0, HIT | unchanged |
| cp-reno-ford-a | 582.0 / 0.0, MISS | 580.0 / 0.0, MISS | 580.0 / 0.0, MISS | 2 min away from E5 |
| cp-reno-skirmish-line | 787.5 / 515.2, MISS | 766.5 / 518.9, MISS | 787.5 / 515.2, MISS | returns exactly to movement baseline |
| cp-reno-timber | 787.5 / 1447.7, MISS | 766.5 / 1451.0, MISS | 787.5 / 1447.7, MISS | returns exactly to movement baseline |
| cp-reno-hill | 807.5 / 0.0, MISS | 786.5 / 0.0, MISS | 807.5 / 0.0, MISS | loses unfrictioned 21-min improvement |
| cp-yates-ford-b | 796.0 / 0.0, HIT | 797.5 / 9.3, HIT | 797.5 / 9.3, HIT | slightly away from E5 |
| cp-right-wing-calhoun | 815.0 / 0.0, MISS | 818.5 / 0.0, MISS | 818.5 / 0.0, MISS | 3.5 min away |
| cp-keogh-sector (marquee) | 815.0 (-10.0) / 415.6 m, MISS | 816.5 (-8.5) / 415.6 m, MISS | 849.0 (+24.0) / 65.1 m, MISS | spatially much closer; temporally 34 min away from target |
| cp-custer-last-stand | 831.5 / 0.0, HIT | 829.5 / 0.0, HIT | 829.5 / 0.0, HIT | 2 min earlier than E5 |
| cp-weir-point | 848.0 / 0.0, HIT | 847.5 / 0.0, HIT | 847.5 / 0.0, HIT | 0.5 min earlier than E5 |

All three runs score 4/10 checkpoint hits.

### Casualties

| Unit/group | Movement-only | Unfrictioned STOP | D71 frictioned | D71 judgment |
|---|---:|---:|---:|---|
| Company C | 0 | 40 | 15 | away from required destruction |
| Company E | 0 | 40 | 0 | gross inversion: untouched |
| Company F | 0 | 40 | 0 | gross inversion: untouched |
| Company I | 0 | 40 | 13 | away from required destruction |
| Company L | 0 | 40 | 13 | away from required destruction |
| Company A | 0 | 45 | 5 | near historical killed range; survives |
| Company G | 0 | 45 | 3 | survives |
| Company M | 0 | 45 | 6 | near historical killed range; survives |
| Company H | 0 | 45 | 0 | survives |
| Company D | 0 | 24 | 20 | survives, but casualties remain high |
| Company K | 0 | 42 | 0 | survives |
| Company B | 0 | 0 | 0 | survives |
| Pack train | 0 | 19 | 0 | survives intact |
| Coalition warrior bands | 0 | 1,109 | 291 | within the calibration high bound for killed alone, but aggregate simulated losses remain far above best killed total |

### End states

| End-state | Movement-only | Unfrictioned STOP | D71 frictioned |
|---|---|---|---|
| C/E/F/I/L | no combat state | all DESTROYED | **all survive** |
| A/G/M | movement tracks only | all DESTROYED | all survive, 121/135 combined |
| H/D/K | movement tracks only | H/K destroyed; D 21/45 | all survive, 112/132 combined |
| B | movement tracks only | survives 45/45 | survives 45/45 |
| Pack train | movement tracks only | survives 111/130 | survives 130/130 |
| Village | no combat state | preserved | preserved |
| Kanipe | timer delivery | alive, delivered tick 1396 | alive, delivered tick 1396 |
| Martini | timer delivery | alive, delivered tick 1426 | alive, delivered tick 1426 |

## D71 asymmetry judgment

The single friction term successfully prevents mutual annihilation, but the
required differential does **not** emerge.

### What saved the hill

- A/G/M broke contact through 18 recorded DISENGAGE transitions between ticks
  1566 and 1608. They finished with only 5/3/6 casualties.
- H/D/K generated a further eight disengagement transitions at ticks
  1760–1778. Only D became SHAKEN (tick 1753); it recovered to STEADY at tick
  1882. No hill unit routed.
- Hill casualties ended at tick 1800. A/G/M/H/D/K/B plus packs retained
  371/397 men.
- Automatic pack proximity transfer issued 75 resupply events totaling
  16,336 Springfield rounds to hill-group companies between ticks 1738 and
  1773.
- The hill trail is therefore mechanically legible: withdrawal/disengagement,
  retained cohesion, morale recovery, and abundant nearby ammunition.

### Why the Custer wing did not die

- C/I/L did enter the intended collapse vocabulary: 12 CHARGE transitions,
  eight MELEE transitions, and 38 ROUT transitions were recorded.
- C became BROKEN at tick 1735 and ROUTED at 1751; I became BROKEN at 1723 and
  ROUTED at 1750; L became BROKEN at 1724 and ROUTED at 1748.
- Those routs did not compound. L returned SHAKEN at 1803 and STEADY at 1880;
  I returned SHAKEN at 1804 and STEADY at 1901; C returned SHAKEN at 1813 and
  STEADY at 1910.
- Custer casualties occurred only from ticks 1682–1773. E and F took no
  casualties at all. No Custer engagement reached DESTRUCTION.
- Forty Custer-wing DISENGAGE transitions occurred. At day end, several
  nominally active contacts remain at 150 m in WITHDRAWAL with intensity 0.
  The fire phase has no continuing pressure once ammunition/range
  participation drops out.
- Most importantly, the supposedly isolated wing received 5,274 Springfield
  rounds from the pack train between ticks 1762 and 1773. Routed units use a
  simple nearest-stable-friendly A* safety path; that lets Custer companies
  escape toward the Reno–Benteen/pack mass and obtain the same resupply and
  recovery benefits that correctly save the hill.

### Diagnosis for the next mechanism ruling

The asymmetry failure is not another global lethality digit. It lies at the
intersection of:

1. **Isolation/encirclement-aware rout safety:** current rout pathing treats a
   reachable friendly mass as safe without enemy interdiction, encirclement,
   or a requirement that the escape corridor remain open.
2. **Collapse persistence:** routed C/I/L recover to STEADY despite recent
   melee, continued nearby contacts, and no historically plausible escape
   corridor.
3. **Resupply eligibility:** proximity alone lets the isolated Custer wing
   draw thousands of pack rounds; RESUPPLY is not limited by command
   relationship, defensive position, or an open supply route.
4. **E/F engagement continuity:** E and F repeatedly disengage and never take
   a casualty, so the state machine does not transfer close-range collapse
   pressure across the five-company wing.

Per D71, these are findings for a new mechanism ruling. None was changed.

## Updated combat [CAL] configuration

All engine-owned values remain in `engine/src/combat-config.ts`.

| Parameter | Value | Provenance |
|---|---:|---|
| combatFrictionFactor | **0.06** | **anchored by historical-totals arithmetic (268 US / 53 Reno-Benteen / <=300 coalition imply 10-20x reduction from unfrictioned rates); M5 calibrates the digit.** |
| engagementRangeMeters | 700 | proposed-flagged |
| meleeRangeMeters | 25 | proposed-flagged |
| chargeRangeMeters | 180 | proposed-flagged |
| disengageRangeMeters | 900 | proposed-flagged |
| intensityExpectedHitsScale | 2 | proposed-flagged |
| exposureColumn / Line / Skirmish / Dispersed | 1 / 0.85 / 0.65 / 0.50 | proposed-flagged |
| exposurePackTrain | 1.25 | proposed-flagged |
| coverFloor | 0.05 | proposed-flagged |
| flankingMultiplier / angle | 1.25 / 0.6π | proposed-flagged |
| tacticsBase / tacticsWeightScale | 0.75 / 200 | proposed-flagged |
| bowIndirectHitProbabilityMultiplier | 0.65 | proposed-flagged |
| clearJamTicks | 4 | proposed-flagged |
| lowAmmoFraction | 0.20 | spec-given |
| lowAmmoDiscipline | 0.65 | proposed-flagged |
| shakenDiscipline / brokenDiscipline | 0.80 / 0.50 | proposed-flagged |
| morale thresholds STEADY / SHAKEN / BROKEN | 70 / 40 / 15 | proposed-flagged |
| moraleCasualtyDrain | 70 | proposed-flagged |
| moraleLeaderLossDrain | 22 | proposed-flagged |
| moraleFlanked / Isolation / LowAmmo drain | 1.2 / 0.35 / 0.25 per tick | proposed-flagged |
| moraleSuppressionDrain | 0.08/tick max | proposed-flagged |
| moraleLull / Friendly recovery | 0.18 / 0.12 per tick | proposed-flagged |
| moraleLeaderRallyScale | 0.004 × rating/tick | proposed-flagged |
| friendlyRadiusMeters / isolationRadiusMeters | 450 / 650 | proposed-flagged |
| leaderInfluenceRadiusMeters | 500 | proposed-flagged |
| routRallyMorale | 25 | proposed-flagged |
| destructionStrength / Cohesion floor | 0 / 3 | proposed-flagged |
| withdrawalDisciplineThreshold | 60 | proposed-flagged |
| routCohesionDrain | 1/tick | proposed-flagged |
| leaderExposurePerHit | 0.0015 | proposed-flagged |
| leader melee / trait exposure multipliers | 3 / 1.75 | proposed-flagged |
| leaderOrderDelayBumpMinutes | 5 | proposed-flagged |
| resupplyRadiusMeters / roundsPerTick | 250 / 240 | proposed-flagged |
| fatigue gallop / melee / halt recovery | 0.45 / 0.80 / 0.20 per tick | proposed-flagged |
| fatigueSpeedCapThreshold | 75 | proposed-flagged |
| fatigueCombatPenaltyMaximum | 0.35 | proposed-flagged |
| chargeShockStrengthScale / speedBonus | 1 / 1.2 | proposed-flagged |
| charge break / repel margin | 1.1 / 0.8 | proposed-flagged |
| marchSpacingMeters | 150 | spec-given (~150 m [CAL]) |
| courierTargetExposure | 0.20 | proposed-flagged |

Scenario-authored weapon values remain unchanged:

| Weapon | Best RPM | Hit bands | Malfunction/100 |
|---|---:|---|---:|
| Springfield M1873 | 8 | 100m .35; 200m .22; 350m .12; 500m .05; 700m .02 | .4 |
| Colt SAA | 10 | 25m .30; 50m .15 | .5 |
| Henry/Winchester | 14 | 50m .30; 100m .20; 150m .10; 250m .03 | 2 |
| Sharps .50 | 3 | 200m .30; 400m .18; 600m .08 | 1 |
| Muzzleloader | 1.5 | 75m .25; 150m .10 | 5 |
| Bow | 8 | 40m .25; 80m .12; 120m .05 | 0 |

## AMBIGUITIES

- The next correction requires an explicit ruling about open escape/supply
  corridors, encirclement, rout recovery under continued contact, or resupply
  eligibility. D71 does not authorize choosing among them.
- “Nearest safety” remains geometrically reachable friendly mass, not
  tactically reachable safety.
- The pack train's proximity transfer has no branch, order, or open-route
  eligibility requirement.
- Active engagements can remain serialized with intensity zero after all
  participating weapons are exhausted/out of band.
- F6's 10.5-second measurement varies with host load; it is nonetheless above
  the binding ceiling and no optimization proof was completed.

## Deviations caused by the binding STOP

- F1–F6 named tests were not completed.
- Old M2/M3 different-seed pins were not converted.
- D55 cache equivalence and E6 combat-on replay were not re-proved.
- Range pruning and formal profiling were not performed.
- Full quartet and report regeneration gates were not completed.
- No UI files were intentionally changed.
- No commit or push was made.
