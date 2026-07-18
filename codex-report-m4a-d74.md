# M4-A post-D74/D75 closeout report

Execution date: 2026-07-18  
Starting HEAD: `4bcb5bf0ddcb621196c9e18dfeb3bca3e6411859`  
Seed: `18760625`

## Outcome

D74 enemy interdiction and D75 scout withdrawal doctrine produce the required
asymmetry from the same combat physics. All five Custer companies are destroyed
in place; no survivor reaches Reno. Reno-Benteen, Company D, the pack train,
and every village unit survive. Every courier, including Kanipe and Martini,
delivers alive. Arikara casualties fall from 37 to 0 and the detachment leaves
the field. No historical-fate scripting was added.

## Quartet (verbatim)

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit

> bighorn-animation@0.1.0 lint
> eslint .

> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

Test Files  10 passed (10)
Tests       57 passed (57)
F6 median   8,547.2 ms (8,144.7 / 8,547.2 / 8,599.1 ms)
F6 work     158 calls; 11,084,487 expansions; 1 scratch allocation; 3 heap growths

> bighorn-animation@0.1.0 build
> tsc -b && node scripts/prepare-app-assets.mjs && next build

✓ Compiled successfully
✓ Generating static pages (4/4)
```

All four commands exited 0. C4 is 12/13, E5 legacy stability is unchanged,
D55 cache equivalence is green, and E6 save/replay equivalence is green with
combat enabled.

## F1-F6

| Gate | Result | Evidence |
|---|---|---|
| F1 seed flip | PASS | Same-seed full-day hashes match. Different seeds remain identical through zero draws and diverge on the first fire-resolution tick. The flip is the planned conscious M2 budget event. |
| F2 conservation | PASS | Integer strength, casualties and ammunition; casualties never exceed strength total; `strengthCurrent + casualties = strengthTotal`; ammunition never negative. |
| F3 no-combat regression | PASS | `combatEnabled:false` preserves E5, C4 12/13, M2/M3 behavior and different-seed identity; RNG draws remain zero. |
| F4 full-stack baseline | PASS | Wing destroyed; hill and village hold; all couriers alive and delivered; Arikara withdraw. |
| F5 scorecard | PASS/informational | Six-column table below is coherent. D74 and D75 predictions are judged explicitly. |
| F6 performance | PASS after follow-up | Fable's authoritative dev-box pre-fix median was ~41 s combat-on versus ~5.9 s combat-off. Allocation-free pooled A* reduces fresh-process sandbox runs to 7.303 / 7.871 / 9.081 s (median 7.871 s). The named gate uses a bare median-of-three and a 10 s ceiling. Dev-box remeasurement remains authoritative. |

## F5 six-column checkpoint scorecard

Cells are `nearest minute / distance m / result`.

| Checkpoint | Movement-only | Unfrictioned | D71 | D71+D72 | D71+D72+D73 | Full D71-D75 | Judgment |
|---|---|---|---|---|---|---|---|
| Scouts/Crow's Nest | 0.0 / 0 / HIT | 0.0 / 0 / HIT | 0.0 / 0 / HIT | 0.0 / 0 / HIT | 0.0 / 0 / HIT | 0.0 / 0 / HIT | unchanged |
| Reno/Ford A | 582.0 / 0 / MISS | 580.0 / 0 / MISS | 580.0 / 0 / MISS | 580.0 / 0 / MISS | 580.0 / 0 / MISS | 580.0 / 0 / MISS | 2 min earlier than movement |
| Reno/skirmish line | 787.5 / 515.2 / MISS | 766.5 / 518.9 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | 787.5 / 515.2 / MISS | movement parity |
| Reno/timber | 787.5 / 1447.7 / MISS | 766.5 / 1451.0 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | 787.5 / 1447.7 / MISS | movement parity |
| Reno/hill | 807.5 / 0 / MISS | 786.5 / 0 / MISS | 807.5 / 0 / MISS | 807.5 / 0 / MISS | 807.5 / 0 / MISS | 807.5 / 0 / MISS | hill holds, timing unchanged |
| Yates/Ford B | 796.0 / 0 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | 797.5 / 9.3 / HIT | slight movement departure |
| Calhoun/right wing | 815.0 / 0 / MISS | 818.5 / 0 / MISS | 818.5 / 0 / MISS | 818.5 / 0 / MISS | 818.5 / 0 / MISS | 818.5 / 0 / MISS | 3.5 min later |
| Keogh sector | 815.0 / 415.6 / MISS | 816.5 / 415.6 / MISS | 849.0 / 65.1 / MISS | 816.5 / 415.6 / MISS | 848.0 / 84.5 / MISS | 816.5 / 415.6 / MISS | cadence F5 reread returns timing toward movement; wing still dies |
| Custer/Last Stand | 831.5 / 0 / HIT | 829.5 / 0 / HIT | 829.5 / 0 / HIT | 829.5 / 0 / HIT | 829.5 / 0 / HIT | 829.5 / 0 / HIT | 2 min early |
| Weir Point | 848.0 / 0 / HIT | 847.5 / 0 / HIT | 847.5 / 0 / HIT | 847.5 / 0 / HIT | 847.5 / 0 / HIT | 847.5 / 0 / HIT | 0.5 min early |

### Casualties and end states

| Row | Movement | Unfrictioned | D71 | D72 | D73 | Full stack | Judgment |
|---|---:|---:|---:|---:|---:|---:|---|
| Custer C/E/F/I/L | 0 | 200 | 200 | C/I/L destroyed; E/F survive | C/L destroyed; E/F/I survive | 200; all destroyed | D74 prediction met: zero reach Reno |
| Reno-Benteen A/G/M/H/D/K | 0 | destroyed | 46 | 50 | 36 | 48 | hill holds; ordinary calibration distance |
| Arikara scouts | 0 | 6 | not isolated | 37 | 37 | 0, withdrawn off-field | prediction 1 strongly met; below three named rather than tuned to it |
| Crow scouts | 0 | 0 | not isolated | 6 | 6 | 0, survive on field | no Curley departure event because organized-band pressure condition did not arise |
| Coalition warrior bands | 0 | 1,109 | 291 | 107 | 111 | 271 | higher after cadence F5 reread but below gross inversion bounds |
| Village/noncombatants | 0 | 0 | 0 | 0 | 0 | 0 | preserved |
| Couriers | none | n/a | alive | alive | alive | all alive/delivered | F4 met; no courier pursuit close-call in baseline |

## Mechanism trails

### Wing destruction and corridor denial

The C/I/L complex collapses first under continued contact, pursuit and
complex-scoped convergence. D74 evaluates safety with actual positions of
non-routed enemy combat units. Their 250 m interdiction disks leave no A* route
to a STEADY protecting mass, so the routed companies remain in the fight-space
and are destroyed together. E/F then collapse under the same complex pressure.
No Custer unit produces a rout-reintegration event or reaches the hill.

Actual positions are authoritative for interdiction because corridor denial is
a physical constraint, not a command-belief decision.

### Hill hold and Company D

Reno-Benteen remains organized around the hill and packs. Pursuers repeatedly
break against the existing steady-massed-fire rule rather than grinding down
the position. Pack resupply continues and D remains STEADY with the adjacent
mass. D74 does not divert or isolate D; its trivially open adjacent corridor is
unaffected. D does not require a ROUT reintegration event in this seed—the
stronger result is that it never routes.

### Scout doctrine and crossing

The Arikara `irregular-scout` profile detects organized WARRIOR_BAND pressure,
starts withdrawal at tick 1197, and exits at tick 1218 while remaining a normal
spottable/targetable unit en route. It loses 0/37. The civilians-interpreters
unit is excluded by exact ID and its scenario provenance explains why.

Prediction 2 is not observed: no Reno-company casualty cluster emerges within
250 m of Ford A. The former scout choke cluster disappears, but it does not
redirect to Reno's broken companies in this run. This remains information, not
a tuning target. Crow scouts never meet the doctrine trigger, so no Curley/Crow
off-field departure emerges.

## Combat [CAL] configuration

All engine-owned combat values remain in `DEFAULT_COMBAT_CONFIG`. Values not
given by the spec are explicitly proposed-flagged.

| Parameter | Value | Provenance |
|---|---:|---|
| engagementRangeMeters / meleeRangeMeters / chargeRangeMeters / disengageRangeMeters | 700 / 25 / 180 / 900 | proposed-flagged |
| intensityExpectedHitsScale | 2 | proposed-flagged |
| combatFrictionFactor | 0.06 | proposed-flagged; anchored by historical-totals arithmetic (268 US / 53 Reno-Benteen / <=300 coalition imply 10-20x reduction from unfrictioned rates); M5 calibrates the digit |
| exposureColumn / Line / Skirmish / Dispersed / PackTrain | 1 / 0.85 / 0.65 / 0.5 / 1.25 | proposed-flagged |
| coverFloor / flankingMultiplier / flankingAngleRadians | 0.05 / 1.25 / `0.6π` | proposed-flagged |
| tacticsBase / tacticsWeightScale / bowIndirectHitProbabilityMultiplier | 0.75 / 200 / 0.65 | proposed-flagged |
| clearJamTicks | 4 | proposed-flagged |
| lowAmmoFraction | 0.2 | spec-given |
| lowAmmoDiscipline / shakenDiscipline / brokenDiscipline | 0.65 / 0.8 / 0.5 | proposed-flagged |
| morale STEADY / SHAKEN / BROKEN thresholds | 70 / 40 / 15 | proposed-flagged |
| morale casualty / leader / flanked / isolation / low-ammo / suppression drains | 70 / 22 / 1.2 / 0.35 / 0.25 / 0.08 | proposed-flagged |
| morale lull / friendly recovery / leader rally scale | 0.18 / 0.12 / 0.004 | proposed-flagged |
| friendly / isolation / leader influence radii m | 450 / 650 / 500 | proposed-flagged |
| rout rally morale / destruction strength / cohesion floors | 25 / 0 / 3 | proposed-flagged |
| withdrawalDisciplineThreshold / routCohesionDrain | 60 / 1 | proposed-flagged |
| leader exposure / melee multiplier / trait multiplier / delay bump min | 0.0015 / 3 / 1.75 / 5 | proposed-flagged |
| resupply radius m / rounds per tick | 250 / 240 | proposed-flagged |
| fatigue gallop / melee / recovery / cap / max penalty | 0.45 / 0.8 / 0.2 / 75 / 0.35 | proposed-flagged |
| charge shock scale / speed bonus / break / repel margins | 1 / 1.2 / 1.1 / 0.8 | proposed-flagged |
| marchSpacingMeters | 150 | spec-given |
| courierTargetExposure | 0.2 | proposed-flagged |
| initiativeRadiusMeters | 1500 | proposed-flagged |
| pursuit close range m / break ticks / loss tolerance m | 50 / 4 / 15 | proposed-flagged |
| pursuitRepathCadenceTicks | 10 | proposed-flagged behavioral optimization; changed from 2 under F6 rider and F5 reread above |
| engagementComplexAdjacencyTicks | 120 | proposed-flagged |
| enemyInterdictionRadiusMeters | 250 | proposed-flagged; D74 new parameter |
| organized band pressure | enemy scenario unit kind exactly `WARRIOR_BAND` in active engagement or pursuit | proposed-flagged operationalization |

## Performance and optimization classification

### F6 dev-box discrepancy and pure follow-up

Fable measured combat-off at 5,855/5,991 ms and combat-on at
41,185/40,090/41,808 ms on Node 24.15.0. V8 attributed 59.9% of non-library
ticks to `findPath`, with native/ntdll and GC dominance. The prior sandbox
5.48 s therefore did not satisfy D56; the dev-box numbers are authoritative.

Each core-grid A* call previously allocated a 1,522,131-cell `Float64Array`,
`Int32Array`, and `Uint8Array` plus heap-node objects. For the final deterministic
run's 158 calls, typed scratch alone was approximately 3.1 GB of allocation
traffic. The follow-up uses generation-stamped pooled score/came-from/seen/closed
arrays, parallel typed heap arrays, and an allocation-free line walker.

Post-fix objective metrics, identical in all three fresh processes:

| Metric | Before | After |
|---|---:|---:|
| `findPath` calls | 158 | 158 |
| expanded nodes | 11,084,487 | 11,084,487 |
| full-grid typed scratch allocations | 158 sets (~3.1 GB traffic) | 1 pooled set |
| steady-state full-grid scratch allocations | 3 arrays/call | 0/call |
| heap entries | object allocation per push | reused parallel typed arrays |
| heap growths | dynamic JS-array/object growth | 3 one-time typed growths |

Paths and outcomes are bit-identical: the full-state hash remains `59e2a98a`.
Because pure allocation removal is sufficient, bounded-window A* was not
implemented and no new behavioral [CAL] parameter was introduced.

Fresh emitted-dist sandbox measurement (`node .claude/f6-median.mjs`):
7,303.0 / 7,871.1 / 9,080.5 ms; median 7,871.1 ms. These are
environment-relative supporting numbers, not a substitute for the dev-box gate.
The final quartet's in-gate median was 8,547.2 ms.

- Pure: engagement/direction maps replace quadratic rescans.
- Pure: pursuit path memo keys exact terrain cells and is a function of current
  serialized positions plus immutable terrain. Cached/uncached full-day hashes
  were both `285e72cf` before the cadence trial.
- Pure: pursuit-only straight-line pruning uses the same corner, ford and
  passability test as the existing path smoother. Same-seed hash before/after
  was `59e2a98a`.
- Behavioral: pursuit repath cadence changed 2 -> 10. It is flagged above and
  received a complete F5 reread. Required asymmetry and courier/scout outcomes
  remain intact. This was not classified as pure.
- Profile: before the follow-up, A* consumed 59.9% of dev-box non-library ticks
  and allocation/GC dominated native samples. The follow-up removes steady-state
  full-grid allocation while preserving all 11,084,487 node expansions.

## Backlog

- Morale contagion when routed troops reach a SHAKEN cluster remains backlog;
  no implementation was added.
- Arikara result now undershoots the three named deaths (0 versus 3); M5 may
  calibrate exposure, but D75 is not tuned here.
- Ford-A casualty clustering for Reno's broken companies remains absent.
- A distinct Curley departure cannot be represented while Crow scouts are one
  aggregate unit and do not meet organized-band pressure.

## AMBIGUITIES

- “Field edge/rear” is operationalized as the reachable terrain-grid edge with
  maximum dot product away from the pressure centroid, deterministic ties by
  coordinate.
- D74 uses actual enemy positions, not believed contacts, for the physical
  corridor rationale stated above.
- Interdiction is fixed for a rout-safety planning episode; a no-corridor result
  remains no safety until rally/reintegration resets the episode.

## Deviations

- No UI work was performed.
- The authorized scenario edit is limited to the civilians-interpreters D75
  exclusion provenance note.
- Test files run sequentially to make F6 an isolated wall-clock gate.
- `tsconfig.engine.json` explicitly emits current engine/source code to `dist`;
  the prior main tsconfig has `noEmit`, which could leave the dev helper stale.
- Historical reports from all four STOPs remain untouched.
- No commit or push was performed.
