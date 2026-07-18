# M4-A execution report — STOP escalation

Execution date: 2026-07-18  
Starting HEAD: `4bcb5bf0ddcb621196c9e18dfeb3bca3e6411859`  
Seed: `18760625`

## Outcome

M4-A did **not** reach acceptance. The combat-on baseline crossed the work
order's mandatory F4/F5 stop line after implementation-level conservation and
safety-path defects were corrected:

- Custer's five companies: all mechanically `DESTROYED`.
- Reno–Benteen: A, G, M, H, and K mechanically `DESTROYED`; D survived with
  21/45, B with 45/45, and the pack train with 111/130.
- Coalition warrior-band losses: 1,109.
- Kanipe and Martini both survived and delivered.
- Noncombatant village units were not targetable and were not destroyed.
- Full-day engine time: 11,775.8 ms, over F6's 10,000 ms ceiling.

This is a gross historical inversion / Reno–Benteen collapse, not ordinary
M5 calibration distance. Per the binding instruction, work stopped and no
combat parameter was tuned around the result.

## Quartet (verbatim)

`npm run typecheck` was run before the escalation measurement:

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

`npm run lint`, `npm test`, and `npm run build` were **not run after the
stop condition**. There is therefore no quartet-green claim.

## F1–F6

| Gate | Result | Evidence |
|---|---|---|
| F1 seed flip | NOT ACCEPTED | First engagement was tick 1189 (`co-a` ↔ `hunkpapa-pool`). Combat consumed the serialized PRNG, but the named same-seed/different-seed gate was not completed before STOP. |
| F2 conservation | PARTIAL / NOT GATED | Measured casualties were integer and capped at current strength; unit casualty application maintained `strengthCurrent + casualties = strengthTotal`; ammunition was capped at zero. The named invariant gate was not completed before STOP. |
| F3 no-combat regression | NOT RUN | The explicit `combatEnabled: false` path bypasses M4 initialization, couriers, spacing, combat, morale, resupply, fatigue, and RNG consumption, but the byte-identity gate was not completed before STOP. |
| F4 baseline | **FAIL — STOP** | Five Custer companies destroyed, but A/G/M/H/K also destroyed. Kanipe and Martini delivered. Engagement log contained 311 transitions and 18 unit destructions. |
| F5 directional scorecard | **FAIL — STOP finding** | Checkpoint comparison below; casualty/end-state comparison is a gross inversion. |
| F6 performance | **FAIL** | 11,775.8 ms for ticks 0–2160. Profiling by code-path inspection and run behavior: deterministic spotting remains the dominant inherited cost; combat adds all-pairs engagement scans, repeated engagement lookups/filtering, fire/malfunction resolution, and larger keyframe serialization. Formal sampler profile was not produced before STOP. |

## F5 full directional scorecard

### Checkpoints vs movement-only E5 baseline

| Checkpoint | E5 nearest min | M4-A nearest min | E5 distance m | M4-A distance m | E5 result | M4-A result | Directional judgment |
|---|---:|---:|---:|---:|---|---|---|
| cp-scouts-crows-nest | 0.0 | 0.0 | 0.0 | 0.0 | HIT | HIT | unchanged |
| cp-reno-ford-a | 582.0 | 580.0 | 0.0 | 0.0 | MISS | MISS | away: 2 min earlier |
| cp-reno-skirmish-line | 787.5 | 766.5 | 515.2 | 518.9 | MISS | MISS | mixed: 21 min toward, 3.7 m away |
| cp-reno-timber | 787.5 | 766.5 | 1447.7 | 1451.0 | MISS | MISS | mixed: 21 min toward, 3.3 m away |
| cp-reno-hill | 807.5 | 786.5 | 0.0 | 0.0 | MISS | MISS | toward: lateness 42.5 → 21.5 min |
| cp-yates-ford-b | 796.0 | 797.5 | 0.0 | 9.3 | HIT | HIT | slightly away: +1.5 min, +9.3 m |
| cp-right-wing-calhoun | 815.0 | 818.5 | 0.0 | 0.0 | MISS | MISS | away: +3.5 min |
| cp-keogh-sector (marquee) | 815.0 (-10.0) | 816.5 (-8.5) | 415.6 | 415.6 | MISS | MISS | toward: 1.5 min; 416 m miss unchanged |
| cp-custer-last-stand | 831.5 | 829.5 | 0.0 | 0.0 | HIT | HIT | away: 2 min earlier |
| cp-weir-point | 848.0 | 847.5 | 0.0 | 0.0 | HIT | HIT | slightly away: 0.5 min earlier |

Both runs scored 4/10 checkpoint hits.

### Casualties

Movement-only E5 had zero simulated combat casualties.

| Unit/group | Start | M4-A survivors | M4-A casualties | Historical target / directional judgment |
|---|---:|---:|---:|---|
| Company C | 40 | 0 | 40 | toward: historical destruction |
| Company E | 40 | 0 | 40 | toward: historical destruction |
| Company F | 40 | 0 | 40 | toward: historical destruction |
| Company I | 40 | 0 | 40 | toward: historical destruction |
| Company L | 40 | 0 | 40 | toward: historical destruction |
| Company A | 45 | 0 | 45 | grossly away: historical killed best 7.64 plus wounded best 7.5 |
| Company G | 45 | 0 | 45 | grossly away: historical killed best 7.64 plus wounded best 7.5 |
| Company M | 45 | 0 | 45 | grossly away: historical killed best 7.64 plus wounded best 7.5 |
| Company H | 45 | 0 | 45 | grossly away: historical killed best 7.64 plus wounded best 7.5 |
| Company D | 45 | 21 | 24 | away: historical killed best 7.64 plus wounded best 7.5 |
| Company K | 42 | 0 | 42 | grossly away: historical killed best 7.13 plus wounded best 7 |
| Company B | 45 | 45 | 0 | away low, but survived |
| Pack train | 130 | 111 | 19 | away: F4 requires packs holding; no pack casualty target |
| Coalition warrior bands | 1,920 | 811 | 1,109 | grossly away: coalition killed best 60 and wounded best 160 |

### End states

| End-state row | Movement-only E5 | M4-A | Judgment |
|---|---|---|---|
| C/E/F/I/L destroyed | no combat state | all DESTROYED | toward history |
| A/G/M holding Reno Hill | movement positions only | all DESTROYED | **gross inversion / STOP** |
| H/D/K holding Reno Hill | movement positions only | H and K DESTROYED; D 21/45 | **gross inversion / STOP** |
| B holding Reno Hill | movement positions only | survived 45/45 | mechanically alive; position gate not accepted |
| Pack train holding Reno Hill | movement positions only | survived 111/130 | mechanically alive; position gate not accepted |
| Village preserved | no combat state | all noncombatant camps preserved | coherent |
| Kanipe delivery | timer delivery | alive, delivered tick 1396 | coherent |
| Martini delivery | timer delivery | alive, delivered tick 1426 | coherent |

## Combat [CAL] configuration audit

All engine-owned combat numbers live in
`engine/src/combat-config.ts`. Weapon RPM, range bands, and malfunction
Estimates remain scenario-authored inputs and are included below for the full
audit. No value in this table was adjusted after the stop finding.

| Parameter | Value | Provenance |
|---|---:|---|
| fire formula | shooters_effective × rpm·tickFraction × hitProb × exposure × flanking × tacticsModifier × leaderTacticalSkill/50 × fireDiscipline | spec-given |
| casualty rounding | floor + one seeded roll on remainder | spec-given |
| lowAmmoFraction | 0.20 | spec-given |
| marchSpacingMeters | 150 | spec-given (~150 m [CAL]) |
| engagementRangeMeters | 700 | proposed-flagged |
| meleeRangeMeters | 25 | proposed-flagged |
| chargeRangeMeters | 180 | proposed-flagged |
| disengageRangeMeters | 900 | proposed-flagged |
| intensityExpectedHitsScale | 2 | proposed-flagged |
| exposureColumn | 1.00 | proposed-flagged |
| exposureLine | 0.85 | proposed-flagged |
| exposureSkirmish | 0.65 | proposed-flagged |
| exposureDispersed | 0.50 | proposed-flagged |
| exposurePackTrain | 1.25 | proposed-flagged |
| coverFloor | 0.05 | proposed-flagged |
| flankingMultiplier | 1.25 | proposed-flagged |
| flankingAngleRadians | 0.6π | proposed-flagged |
| tacticsBase | 0.75 | proposed-flagged |
| tacticsWeightScale | 200 | proposed-flagged |
| bowIndirectHitProbabilityMultiplier | 0.65 | proposed-flagged |
| clearJamTicks | 4 (2 min) | proposed-flagged |
| lowAmmoDiscipline | 0.65 | proposed-flagged |
| shakenDiscipline | 0.80 | proposed-flagged |
| brokenDiscipline | 0.50 | proposed-flagged |
| moraleSteadyThreshold | 70 | proposed-flagged |
| moraleShakenThreshold | 40 | proposed-flagged |
| moraleBrokenThreshold | 15 | proposed-flagged |
| moraleCasualtyDrain | 70 | proposed-flagged |
| moraleLeaderLossDrain | 22 | proposed-flagged |
| moraleFlankedDrain | 1.2/tick | proposed-flagged |
| moraleIsolationDrain | 0.35/tick | proposed-flagged |
| moraleLowAmmoDrain | 0.25/tick | proposed-flagged |
| moraleSuppressionDrain | 0.08/tick max | proposed-flagged |
| moraleLullRecovery | 0.18/tick | proposed-flagged |
| moraleFriendlyRecovery | 0.12/tick | proposed-flagged |
| moraleLeaderRallyScale | 0.004 × rally/tick | proposed-flagged |
| friendlyRadiusMeters | 450 | proposed-flagged |
| isolationRadiusMeters | 650 | proposed-flagged |
| leaderInfluenceRadiusMeters | 500 | proposed-flagged |
| routRallyMorale | 25 | proposed-flagged |
| destructionStrengthFloor | 0 | proposed-flagged |
| destructionCohesionFloor | 3 | proposed-flagged |
| withdrawalDisciplineThreshold | 60 | proposed-flagged |
| routCohesionDrain | 1/tick | proposed-flagged |
| leaderExposurePerHit | 0.0015 | proposed-flagged |
| leaderMeleeExposureMultiplier | 3 | proposed-flagged |
| leaderTraitExposureMultiplier | 1.75 | proposed-flagged |
| leaderOrderDelayBumpMinutes | 5 | proposed-flagged |
| resupplyRadiusMeters | 250 | proposed-flagged |
| resupplyRoundsPerTick | 240 | proposed-flagged |
| fatigueGallopPerTick | 0.45 | proposed-flagged |
| fatigueMeleePerTick | 0.80 | proposed-flagged |
| fatigueHaltRecoveryPerTick | 0.20 | proposed-flagged |
| fatigueSpeedCapThreshold | 75 | proposed-flagged |
| fatigueCombatPenaltyMaximum | 0.35 | proposed-flagged |
| chargeShockStrengthScale | 1 | proposed-flagged |
| chargeSpeedBonus | 1.2 | proposed-flagged |
| chargeBreakMargin | 1.1 | proposed-flagged |
| chargeRepelMargin | 0.8 | proposed-flagged |
| courierTargetExposure | 0.20 | proposed-flagged |

### Scenario weapon table (best Estimates)

| Weapon | RPM | Range band hit probabilities | Malfunction / 100 rounds | Provenance |
|---|---:|---|---:|---|
| Springfield M1873 carbine | 8 | 100m .35; 200m .22; 350m .12; 500m .05; 700m .02 | 0.4 | scenario-authored, spec requires verbatim use |
| Colt M1873 SAA | 10 | 25m .30; 50m .15 | 0.5 | scenario-authored, spec requires verbatim use |
| Henry / Winchester .44 | 14 | 50m .30; 100m .20; 150m .10; 250m .03 | 2 | scenario-authored, spec requires verbatim use |
| Sharps .50 | 3 | 200m .30; 400m .18; 600m .08 | 1 | scenario-authored, spec requires verbatim use |
| Muzzleloader / trade gun | 1.5 | 75m .25; 150m .10 | 5 | scenario-authored, spec requires verbatim use |
| Bow | 8 | 40m .25; 80m .12; 120m .05 | 0 | scenario-authored, spec requires verbatim use; indirect penalty proposed above |

## AMBIGUITIES

- “Nearest safety” has no scoring rule. The implementation rejects routed or
  actively engaged friendly units as a safety mass, then chooses the nearest
  steady/shaken friendly. Even with that mechanical correction, Reno–Benteen
  collapsed.
- “Affected branch” after leader death has no explicit command-tree schema.
  The implementation bumps future deliveries issued by that leader, rather
  than applying a side-wide delay.
- Cover polygons are projected once and use the scenario's exact
  `coverFactor`; overlapping polygons retain scenario order precedence.
- Courier identity is not in scenario data. Kanipe and Martini names are
  derived from the two historical order IDs; other courier names are
  deterministic order-ID labels.
- Orders with positive `transmissionMinutes` on the hierarchical side create
  courier entities; zero-transmission/in-person orders retain direct delivery.
- Strength destruction is currently at zero strength; cohesion destruction is
  at the proposed floor. Raising either after this run would be prohibited
  tuning under the stop instruction.

## Deviations / incomplete work caused by STOP

- Named F1–F6 tests were not added or accepted.
- Existing M2/M3 identity pins were not fully converted to the F1/F3 split.
- Quartet was not run to completion.
- F6 profiling and optimization were not continued.
- Cache-equivalence and E6 combat-on replay were not re-proved.
- No UI files were intentionally changed.
- No commit or push was made.

## Working-tree note

The working tree contains an uncommitted, compile-clean but **not
acceptance-ready** partial M4-A implementation plus this report and D62–D70
ledger rows. Review should treat the combat outcome as the requested finding,
not as a calibrated baseline.
