# C4 Observation-Event Exam

- Gateable result: **10/11 (90.9%) — PASS**
- Required: at least 80.0% of HIGH/MEDIUM events, excluding the two Crow's Nest/O3 rows.
- Model: production deterministic spotting score; no RNG consumed; event-recorded atmosphericFactor only.

## Global [CAL] tuning audit

| Parameter [CAL] | Before | After | Changed |
|---|---:|---:|---|
| K | 1 | 1 | no |
| spotThreshold | 0.0013 | 0.0013 | no |
| loseThreshold | 0.00065 | 0.00065 | no |
| heightMounted | 2.4 | 2.4 | no |
| heightStanding | 1.7 | 1.7 | no |
| heightProne | 0.3 | 0.3 | no |
| heightCamp | 3 | 3 | no |
| dispersionColumn | 1 | 1 | no |
| dispersionLine | 1.3 | 1.3 | no |
| dispersionSkirmish | 0.7 | 0.7 | no |
| dispersionDispersed | 0.8 | 0.8 | no |
| dispersionCamp | 4 | 4 | no |
| motionStationary | 1 | 1 | no |
| motionFoot | 1.5 | 1.5 | no |
| motionMounted | 2 | 2 | no |
| motionMountedDry | 3 | 3 | no |
| perceptionDivisor | 50 | 50 | no |
| perceptionMinimum | 0.5 | 0.5 | no |
| perceptionMaximum | 2 | 2 | no |
| sweepCadenceTicks | 2 | 2 | no |
| blockedCacheMoveMeters | 100 | 100 | no |
| attenuationUnitMeters | 100 | 210 | yes |
| campDefenseRadiusMeters | 3000 | 3000 | no |

## Gateable events

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-warriors-divide-column | 360 | seen | seen | Infinity | 1.3000e-3 | Infinity | PASS |
| obs-reno-village-hunkpapa | 720 | seen | seen | 4.7228e-2 | 1.3000e-3 | 4.5928e-2 | PASS |
| obs-reno-village-oglala | 720 | seen | seen | 1.6376e-3 | 1.3000e-3 | 3.3761e-4 | PASS |
| obs-reno-village-minneconjou | 720 | unseen | unseen | 4.2793e-5 | 1.3000e-3 | 1.2572e-3 | PASS |
| obs-reno-village-sans-arc | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-mixed-north | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-reno-village-cheyenne | 720 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-village-reno-advance | 720 | seen | seen | 3.3616e-2 | 1.3000e-3 | 3.2316e-2 | PASS |
| obs-cheyenne-custer-column | 780 | seen | unseen | 5.2681e-5 | 1.3000e-3 | -1.2473e-3 | FAIL |
| obs-reno-hill-volleys | 800 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |
| obs-weir-custer-field | 865 | seen | seen | 1.3962e-3 | 1.3000e-3 | 9.6203e-5 | PASS |

### Gateable factor audit

- **obs-warriors-divide-column (PASS):** distance=0.0m; angular=Infinity; terrain=visible; cover=1.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=1.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; no unit/leader, doctrine-average perception; target unit.
- **obs-reno-village-hunkpapa (PASS):** distance=1405.3m; angular=3.1548e-1; terrain=visible; cover=1.4970e-1; coverPath=575.4m; atmosphere=1.0000e+0; transmittance=1.4970e-1; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-oglala (PASS):** distance=1270.9m; angular=3.4239e-1; terrain=visible; cover=4.7829e-3; coverPath=1044.1m; atmosphere=1.0000e+0; transmittance=4.7829e-3; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-minneconjou (PASS):** distance=2350.1m; angular=1.4352e-1; terrain=visible; cover=2.9817e-4; coverPath=2002.0m; atmosphere=1.0000e+0; transmittance=2.9817e-4; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-sans-arc (PASS):** distance=2889.4m; angular=9.9589e-2; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-mixed-north (PASS):** distance=3269.2m; angular=8.8019e-2; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-reno-village-cheyenne (PASS):** distance=3386.8m; angular=8.8934e-2; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-village-reno-advance (PASS):** distance=226.7m; angular=7.1029e-2; terrain=visible; cover=4.7327e-1; coverPath=226.6m; atmosphere=1.0000e+0; transmittance=4.7327e-1; motion=1.0000e+0; perception=1.0000e+0. Resolution: movement-only unit position; target unit.
- **obs-cheyenne-custer-column (FAIL):** distance=2172.7m; angular=6.9863e-3; terrain=visible; cover=2.5136e-3; coverPath=1813.6m; atmosphere=1.0000e+0; transmittance=2.5136e-3; motion=3.0000e+0; perception=1.0000e+0. Resolution: movement-only unit position; target unit. Failing factor: score below T_spot by 1.247e-3.
- **obs-reno-hill-volleys (PASS):** distance=4076.0m; angular=3.7239e-3; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit.
- **obs-weir-custer-field (PASS):** distance=4783.5m; angular=3.1732e-3; terrain=visible; cover=1.0000e+0; coverPath=0.0m; atmosphere=4.0000e-1; transmittance=4.0000e-1; motion=1.0000e+0; perception=1.1000e+0. Resolution: event-recorded observer position; nearest unit to target landmark last-stand-hill.

### Gateable mismatches

- obs-cheyenne-custer-column: score below T_spot by 1.247e-3

## Informational/O3 — Crow's Nest (excluded from gate)

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-scouts-pony-herd | 60 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |
| obs-custer-crows-nest-haze | 300 | unseen | unseen | 0.0000e+0 | 1.3000e-3 | 1.3000e-3 | PASS |

- **obs-scouts-pony-herd (FAIL):** distance=26029.1m; angular=4.6102e-4; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; target unit. Failing factor: terrain-blocked (transmittance 0).
- **obs-custer-crows-nest-haze (PASS):** distance=20507.4m; angular=1.4199e-3; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=5.0000e-1; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; nearest unit to target landmark village-s-end.

## Confidence-excluded events

| Event | Min | Expected | Predicted | Score | T_spot | Margin | Result |
|---|---:|---|---|---:|---:|---:|---|
| obs-custer-weir-village | 760 | seen | unseen | 0.0000e+0 | 1.3000e-3 | -1.3000e-3 | FAIL |

- **obs-custer-weir-village (FAIL):** distance=1832.3m; angular=6.3738e-3; terrain=blocked; cover=0.0000e+0; coverPath=0.0m; atmosphere=1.0000e+0; transmittance=0.0000e+0; motion=1.0000e+0; perception=1.0000e+0. Resolution: event-recorded observer position; nearest unit to target landmark village-s-end. Failing factor: terrain-blocked (transmittance 0).
