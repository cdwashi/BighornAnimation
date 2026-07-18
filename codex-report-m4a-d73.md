# M4-A post-D73 report — fourth binding STOP

Execution date: 2026-07-18  
Starting HEAD: `4bcb5bf0ddcb621196c9e18dfeb3bca3e6411859`  
Seed: `18760625`

## Outcome

D73 tactical-complex continuity was implemented in two expressions:

1. A ROUTED unit with no remaining combat pursuer can reintegrate within the
   existing friendly radius only when at least one protecting friendly unit is
   explicitly **STEADY**. It reforms SHAKEN, stops routing, and stops cohesion
   drain. SHAKEN protectors are rejected.
2. Complex convergence uses the connected component of the serialized
   engagement graph. Edges are engagements active or updated within a proposed
   120-tick (60-minute) adjacency window. A freed consensus band selects a
   surviving non-ROUTED enemy in that component before returning to general
   believed-picture initiative.

No fire term or existing [CAL] value changed.

The unoptimized D71+D72+D73 baseline triggers the binding fourth STOP:

- C and L are DESTROYED.
- E survives 3/40; F survives 7/40; I survives 21/40.
- Reno–Benteen and packs hold; D survives 41/45 and returns STEADY.
- Arikara scouts remain 37/37 dead versus three named historically.
- Crow scouts remain 6/6 dead.
- Kanipe and Martini survive and deliver without pursuit.
- Village units are untouched.
- Full day measured 55,171.0 ms.

The required asymmetry still does not fully emerge because routed Custer-wing
companies reach and reintegrate into Reno's STEADY mass. No additional
mechanism, parameter, or optimization was applied after the STOP.

## Quartet (verbatim)

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

`npm run lint`, `npm test`, and `npm run build` were not run after the
binding STOP. There is no quartet-green claim.

## F1–F6

| Gate | Result | Evidence |
|---|---|---|
| F1 seed flip | SUSPENDED BY STOP | Named test and legacy identity-pin conversion remain incomplete. |
| F2 conservation | SUSPENDED BY STOP | Measured state remained integer/non-negative, but the named invariant suite was not completed. |
| F3 combat-off regression | SUSPENDED BY STOP | Combat-off bypass remains; complete E5/C4/M2/M3 byte proof was not run. |
| F4 baseline | **FAIL — fourth STOP** | E/F/I survive. Hill, village, packs, Kanipe, and Martini survive. |
| F5 | **FAIL — asymmetry nearly but not fully emerges** | Five-column evidence below. |
| F6 | **FAIL** | 55,171.0 ms. Complex reconstruction plus frequent real-path pursuit repaths dominate. Optimization was suspended by STOP. |

## F5 five-column scorecard

### Checkpoints

Cells are `nearest minute / distance meters / result`.

| Checkpoint | Movement-only | Unfrictioned | D71 | D71+D72 | D71+D72+D73 | Judgment |
|---|---|---|---|---|---|---|
| cp-scouts-crows-nest | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | 0.0 / 0.0 / HIT | unchanged |
| cp-reno-ford-a | 582.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 580.0 / 0.0 / MISS | 2 min early |
| cp-reno-skirmish-line | 787.5 / 515.2 / MISS | 766.5 / 518.9 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | movement parity |
| cp-reno-timber | 787.5 / 1447.7 / MISS | 766.5 / 1451.0 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | movement parity |
| cp-reno-hill | 807.5 / 0.0 / MISS | 786.5 / 0.0 / MISS | 807.5 / 0.0 / MISS | 807.5 / 0.0 / MISS | 807.5 / 0.0 / MISS | movement parity |
| cp-yates-ford-b | 796.0 / 0.0 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | slightly away |
| cp-right-wing-calhoun | 815.0 / 0.0 / MISS | 818.5 / 0.0 / MISS | 818.5 / 0.0 / MISS | 818.5 / 0.0 / MISS | 818.5 / 0.0 / MISS | 3.5 min late |
| cp-keogh-sector | 815.0 (-10.0) / 415.6 / MISS | 816.5 (-8.5) / 415.6 / MISS | 849.0 (+24.0) / 65.1 / MISS | 816.5 (-8.5) / 415.6 / MISS | 848.0 (+23.0) / 84.5 / MISS | spatially toward; temporally away |
| cp-custer-last-stand | 831.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 829.5 / 0.0 / HIT | 2 min early |
| cp-weir-point | 848.0 / 0.0 / HIT | 847.5 / 0.0 / HIT | 847.5 / 0.0 / HIT | 847.5 / 0.0 / HIT | 847.5 / 0.0 / HIT | 0.5 min early |

Every column scores 4/10.

### Casualties

| Unit/group | Movement | Unfrictioned | D71 | D72 | D73 | D73 judgment |
|---|---:|---:|---:|---:|---:|---|
| Company C | 0 | 40 | 15 | 40 | 40 | destroyed |
| Company E | 0 | 40 | 0 | 0 | 37 | strong improvement; **still survives** |
| Company F | 0 | 40 | 0 | 0 | 33 | strong improvement; **still survives** |
| Company I | 0 | 40 | 13 | 40 | 19 | regresses through reintegration; **survives** |
| Company L | 0 | 40 | 13 | 40 | 40 | destroyed |
| Company A | 0 | 45 | 5 | 3 | 3 | survives |
| Company G | 0 | 45 | 3 | 3 | 3 | survives |
| Company M | 0 | 45 | 6 | 5 | 5 | survives |
| Company H | 0 | 45 | 0 | 7 | 12 | survives |
| Company D | 0 | 24 | 20 | 45 | 4 | reintegration/formed defense succeeds |
| Company K | 0 | 42 | 0 | 3 | 9 | survives |
| Company B | 0 | 0 | 0 | 0 | 0 | survives |
| Pack train | 0 | 19 | 0 | 0 | 0 | survives |
| Coalition warrior bands | 0 | 1,109 | 291 | 107 | 111 | no mutual annihilation |
| **Arikara scouts** | **0** | **6** | **6** | **37** | **37** | **NO IMPROVEMENT; 37 vs 3 named historically** |
| Crow scouts | 0 | 0 | 0 | 6 | 6 | destroyed |

The Arikara line is now a separate falsified prediction. Complex scoping does
not pull it toward history; per Chuck's note, no scout behavior fix was
attempted.

### End states

| End-state | Movement | Unfrictioned | D71 | D72 | D73 |
|---|---|---|---|---|---|
| C/E/F/I/L | no combat state | all destroyed | all survive | C/I/L destroyed | C/L destroyed; **E/F/I survive** |
| A/G/M | movement tracks | all destroyed | all survive | all survive | all survive, 124/135 |
| H/D/K | movement tracks | H/K destroyed | all survive | D destroyed | all survive, 107/132 |
| B | movement track | survives | survives | survives | survives 45/45 |
| Packs | movement track | 111/130 | 130/130 | 130/130 | 130/130 |
| Village | no combat state | preserved | preserved | preserved | preserved |
| Kanipe | timer delivery | delivered | delivered | delivered | alive, delivered tick 1396 |
| Martini | timer delivery | delivered | delivered | delivered | alive, delivered tick 1426 |

## Mechanism trails

### Wing death chain and complex convergence

- Complex convergence is behaviorally live. Initiative selects E 16 times and
  F six times; pursuit starts against E 13 times and F 18 times.
- C routes and first reintegrates into STEADY E at tick 1688, but is eventually
  destroyed at tick 1710.
- E becomes SHAKEN at 1726, BROKEN at 1735, and ROUTED at 1736. It
  reintegrates into STEADY A at tick 1779 and finishes STEADY with three men.
- F becomes SHAKEN at 1732, BROKEN at 1737, and ROUTED at 1751. It
  reintegrates into STEADY A at tick 1794 and finishes STEADY with seven men.
- I reintegrates into STEADY A at tick 1734 and finishes STEADY with 21 men.
- L is destroyed at tick 1780.
- No leader dies in this seeded run.
- The complex-first cascade therefore works, but the same reintegration rule
  that correctly saves Reno's force also lets the isolated wing traverse a
  tactically open A* route into Reno's mass.

### Hill hold and the STEADY gate

- D becomes SHAKEN at 1568 and BROKEN at 1596, then reforms SHAKEN at 1626 and
  returns STEADY at 1813. It survives 41/45.
- The protecting-mass gate checks the protector's exact morale state:
  `friend.moraleState === 'STEADY'`. SHAKEN clusters cannot auto-stabilize a
  routed arrival.
- Four reintegration events occur: C→E, I→A, E→A, and F→A. Every named
  protector was STEADY at the event tick.
- A/G/M receive 6,274 / 6,272 / 6,145 Springfield rounds; D receives 2,880.
  Total resupply is 21,571 rounds over 103 events. ROUTED units remain
  ineligible.
- Reno–Benteen's formed mass now produces the intended protection and recovery
  behavior, but it also becomes an ahistorical refuge for Custer survivors.

### Courier trail

- Kanipe and Martini are neither pursued nor killed and deliver at ticks 1396
  and 1426.
- No required courier close-call occurs in this baseline.

### Retreat-crossing trail

Six casualty events fall 10 m from the retreat crossing, all against Arikara
scouts at ticks 1487–1493. No A/G/M casualty clusters there.

The ford choke is geometrically active, but continues to consume scouts rather
than Reno's broken troopers.

### Scout falsification

- Arikara casualties remain 37 after D73, unchanged from D72 and far above the
  three named historically.
- Complex targeting still selects Arikara seven times and starts 11 pursuit
  chains against them.
- This is now its own diagnosis, likely involving the irregular-scout tactical
  behavior noted by Chuck. It was observed, not fixed.

## Fourth-STOP diagnosis

D73 confirms tactical-complex continuity but exposes the next missing
principle: **tactical accessibility is not equivalent to terrain
reachability**.

The engine's real-path A* can find a geometric route from routed Custer
companies to Reno's STEADY mass, so reintegration legally fires. It has no
representation of an enemy-controlled escape corridor or encirclement that
would make that protecting mass tactically unreachable. Consequently the same
correct recovery rule saves both the hill defenders and the historically
isolated wing.

The independent Arikara distortion also survives D73, as Chuck's falsifiable
prediction anticipated might happen. That result should not be folded into an
escape-corridor fix; it is a separate scout-behavior diagnosis.

No value or behavior was changed after these findings.

## Updated [CAL] table

All engine-owned combat parameters remain in
`engine/src/combat-config.ts`. D73 adds one flagged adjacency parameter.

| Parameter | Value | Provenance |
|---|---:|---|
| combatFrictionFactor | .06 | anchored by historical-totals arithmetic (268 US / 53 Reno-Benteen / <=300 coalition imply 10-20x reduction from unfrictioned rates); M5 calibrates the digit |
| initiativeRadiusMeters | 1,500 | proposed-flagged |
| pursuitCloseRangeMeters | 50 | proposed-flagged |
| pursuitRepathCadenceTicks | 2 | proposed-flagged |
| pursuitBreakTicks | 4 | proposed-flagged |
| pursuitRangeLossToleranceMeters | 15 | proposed-flagged |
| **engagementComplexAdjacencyTicks** | **120 (60 min)** | **proposed-flagged** |
| engagement / charge / melee / disengage range m | 700 / 180 / 25 / 900 | proposed-flagged |
| intensityExpectedHitsScale | 2 | proposed-flagged |
| exposure Column / Line / Skirmish / Dispersed / Pack | 1 / .85 / .65 / .50 / 1.25 | proposed-flagged |
| coverFloor | .05 | proposed-flagged |
| flanking multiplier / angle | 1.25 / .6π | proposed-flagged |
| tactics base / scale | .75 / 200 | proposed-flagged |
| bow indirect multiplier | .65 | proposed-flagged |
| clearJamTicks | 4 | proposed-flagged |
| lowAmmoFraction | .20 | spec-given |
| lowAmmo / shaken / broken discipline | .65 / .80 / .50 | proposed-flagged |
| morale STEADY / SHAKEN / BROKEN | 70 / 40 / 15 | proposed-flagged |
| casualty / leader-loss morale drain | 70 / 22 | proposed-flagged |
| flank / isolation / low-ammo drain | 1.2 / .35 / .25 per tick | proposed-flagged |
| suppression max drain | .08/tick | proposed-flagged |
| lull / friendly recovery | .18 / .12 per tick | proposed-flagged |
| leader rally scale | .004 × rating/tick | proposed-flagged |
| friendly / isolation / leader radii m | 450 / 650 / 500 | proposed-flagged |
| rout rally morale | 25 | proposed-flagged |
| destruction strength / cohesion floor | 0 / 3 | proposed-flagged |
| withdrawal threshold / cohesion drain | 60 / 1 per tick | proposed-flagged |
| leader exposure / melee / trait | .0015 / 3 / 1.75 | proposed-flagged |
| leader delay bump | 5 min | proposed-flagged |
| resupply radius / rounds per tick | 250 / 240 | proposed-flagged |
| fatigue gallop / melee / recovery | .45 / .80 / .20 | proposed-flagged |
| fatigue speed cap / max penalty | 75 / .35 | proposed-flagged |
| charge scale / speed / break / repel | 1 / 1.2 / 1.1 / .8 | proposed-flagged |
| marchSpacingMeters | 150 | spec-given (~150 m [CAL]) |
| courierTargetExposure | .20 | proposed-flagged |

Scenario-authored weapon RPM, hit bands, and malfunction Estimates remain
unchanged.

## Backlog

- **Morale contagion on arrival:** a routed unit reaching a SHAKEN cluster
  might spread panic into that cluster. Chuck explicitly placed this in
  backlog; D73 implements no contagion.
- **Scout tactical behavior:** Arikara pony-herd raid/withdrawal behavior now
  has a falsified casualty prediction (37 vs 3 named historically).
- **Tactical route accessibility / encirclement:** terrain reachability does
  not express whether a routed corridor through enemy control is open.

## AMBIGUITIES

- “Engagement complex” has no supplied time window. The implementation uses a
  proposed 120-tick adjacency window and graph connectivity through shared
  engagement nodes.
- Complex-organized means non-destroyed and non-ROUTED. BROKEN units remain
  organized enough to be a complex-first target.
- Complex-first candidates are not radius-limited; graph membership supplies
  continuity. General initiative remains limited to 1,500 m.
- Protecting mass currently means any distinct STEADY friendly within the
  existing 450 m friendly radius. It does not check whether the path into that
  radius crossed enemy control.
- Reintegration does not restore cohesion numerically; it stops further rout
  drain and reforms morale SHAKEN.

## Deviations caused by fourth STOP

- F1–F6 named tests and legacy seed-pin conversion remain incomplete.
- D55 cache and E6 replay equivalence were not re-proved.
- Pre/post optimization bit identity and F6 optimization were not performed.
- Full quartet and generated report gates were not completed.
- No UI work was performed.
- No commit or push was made.
