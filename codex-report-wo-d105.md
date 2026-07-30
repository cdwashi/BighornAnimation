# WO-D105 close-action bout — RE-ARMED STOP report

Execution date: 2026-07-30  
Starting HEAD: `6b4c27133e6eb233eabe0cb6d2b24f44d710924a`  
Registered seed range: `18760600–18760649`  
Completed seeds: `18760600–18760633` (34 full-day runs)  
Partial stop seed: `18760634` through tick 1766 / minute 883  
Unstarted seeds: `18760635–18760649`  
Scenario-content stream: `ba288f09` before and throughout measurement  
Status: **implemented candidate; RE-ARMED STOP fired when one seed reached killed ≥100; no commit or push**

## Summary

WO-D105 is implemented without a new number, configuration field, or `[CAL]`
change:

1. both COMBAT-pursuit movement standoffs consume the existing
   `meleeRangeMeters`;
2. in melee, a COMBAT pursuer can be the shock attacker when there is no
   CHARGE-postured attacker;
3. an additive latch on the serialized engagement descriptor permits one bout
   per contact episode and clears only when range rises above
   `meleeRangeMeters`;
4. break converts the defender's existing wounded to killed without touching
   current/available strength or casualties, repel terminates COMBAT pursuit
   through the existing termination path while retaining `WITHDRAW`, and every
   resolution emits `melee-bout`;
5. cohesion-floor destruction is removed; zero-strength destruction remains.

The five named D105 tests passed 5/5 and the engine compiled before campaign
measurement.

The binding stop then fired. Seed `18760634` reached Reno A/G/M killed **102**
at tick 1766 / minute 883. The campaign stopped on that tick after 34 complete
seeds plus the partial stop seed. No later seed, simulation, quartet command,
score, envelope, probe, or oracle-refresh command ran.

Among the 34 complete seeds, Reno killed has median **48**, mean **48.59**, and
range **27–70**. Three complete seeds exceeded 60: `18760606=63`,
`18760615=70`, and `18760618=68`; the partial seed is the fourth above 60 and
the first to reach 100. All 34 complete seeds retain at least two A/G/M alive
east of the channel. The baseline seed retains all three and the exact F4
roster, but complete-wing destruction occurs in only 4/34 complete seeds.

There were 624 complete-seed bouts (12–28 per seed, median 18) plus 20 in the
partial seed. Every observed outcome was `break`: **644 break, 0 repel,
0 held**. Complete-seed wounded conversions total 463; partial-inclusive total
476. No conversion occurred outside a break event, and killed − fire-killed −
bout-converted is zero for every unit and company in every observed row.

## Frozen-material review

Read in full before implementation:

- `docs/WO-D105.md`;
- the complete WO-D105 PR-31–PR-38 entry, registered observations, and
  RE-ARMED STOP in `docs/PREDICTIONS.md`;
- D91, the D91 RIDER, D92–D99, and D101–D105 in
  `docs/IMPLEMENTATION_HISTORY.md`; D100 remains reserved and has no ruling row.

The frozen work order controlled implementation and stop behavior.

## Implementation

### Arrival and attacker selection

The two existing COMBAT-pursuit standoff consumers in `movement.ts` now read
`meleeRangeMeters` rather than `pursuitCloseRangeMeters`. INITIATIVE pursuit,
CHARGE-at-zero, and the default 150 m standoff are unchanged.

`resolveShock` first retains the existing CHARGE-posture attacker selection. If
that yields no attacker, it selects a unit whose COMBAT pursuit targets the
other engagement party. The D65 shock and defense formula lines, both margin
comparisons, and every multiplier are unchanged.

### Serialized contact-episode latch

`EngagementDescriptor` has one additive optional boolean,
`meleeBoutResolved`. A successful attacker/defender resolution sets it true.
`updateEngagements` clears it only when the pair's range rises above the
unchanged melee range. Remaining continuously at or below melee range cannot
resolve another bout; separation and re-entry can.

There is no timer, cadence, roll, discriminator, or new outcome weight.

### Outcomes and event

- Break: the existing morale and ROUT writes stand, then
  `convertedWounded = defender.wounded`,
  `defender.killed += convertedWounded`, and `defender.wounded = 0`.
  `strengthCurrent`, `strengthAvailable`, and `casualties` are untouched.
- Repel: the existing `WITHDRAW` posture and `WITHDRAWAL` engagement writes
  stand. A COMBAT pursuit is passed through the existing `endPursuit` function
  with reason `repulsed`; `WITHDRAW` is retained after that path.
- Held: the existing `FIREFIGHT` write stands and no accounting changes.

Every resolution is appended to the normal serialized event log as:

```text
{ tick, type: 'melee-bout', unitId, targetUnitId,
  outcome: 'break'|'repel'|'held', convertedWounded, sequence }
```

`sequence` and `type` are the normal event-stream fields. The frozen payload
fields are present verbatim.

### Drain interlock removal

The destruction predicate is now only:

```text
unit.strengthCurrent <= config.destructionStrengthFloor
```

`routCohesionDrain` and the rest of rout/rally behavior are unchanged.
`destructionCohesionFloor` remains byte-identical in the protected config table
but is no longer consumed by destruction.

Files changed before this report:

```text
engine/src/combat.ts
engine/src/engagement.ts
engine/src/events.ts
engine/src/morale.ts
engine/src/movement.ts
engine/src/state.ts
engine/tests/d105-bout.test.ts
.claude/d105-campaign.mjs
```

The campaign script is measurement instrumentation. It checks both stop
branches after every tick and records event-time target positions for
positionless `melee-bout` events before the next tick runs.

## Five named tests

Command:

```text
npx vitest run engine/tests/d105-bout.test.ts --fileParallelism=false
```

Verbatim passing output:

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ engine/tests/d105-bout.test.ts (5 tests) 43ms

 Test Files  1 passed (1)
      Tests  5 passed (5)
   Start at  13:14:45
   Duration  988ms (transform 294ms, setup 0ms, collect 393ms, tests 43ms, environment 0ms, prepare 178ms)
```

Names:

- `bout-latch-one-resolution-per-contact`
- `repulse-ends-pursuit`
- `break-converts-wounded-in-bout-only`
- `no-cohesion-floor-destruction`
- `standoff-closes-to-melee`

The pre-campaign `npx tsc -p tsconfig.engine.json` exited 0 with no stdout.

The first focused-test attempt passed 4/5. Its sole failure was the test
fixture's manually constructed engagement id using attacker/defender order
rather than the engine's existing lexical pair id. The fixture id was corrected
without changing engine behavior; the passing run above preceded all campaign
measurement.

## RE-ARMED STOP

Binding rule:

```text
halt if Reno A/G/M killed exceeds 60 in more than 5/50 registered seeds,
or if any registered seed reaches killed >= 100
```

| Branch | Result |
|---|---|
| More than five seeds above 60 | Did not fire before halt; 3 complete seeds plus the partial stop seed were above 60 |
| Any seed killed ≥100 | **FIRED** at seed 18760634, tick 1766 / minute 883, killed 102 |
| Complete above-60 seeds | 18760606=63; 18760615=70; 18760618=68 |
| Partial stop seed | 18760634=102 at the stop tick |
| Later work | Halted; seeds 18760635–18760649 never started |

Seed `18760634` is partial. Its end-of-day survival, coalition losses, wing
outcome, composite, and final killed count are unknown and are excluded from
complete-day aggregates.

No observed result caused a code, parameter, assertion, or content change.

## PR-31–PR-38 verdicts as they fell

| Prediction | Verdict | Evidence available at STOP |
|---|---|---|
| PR-31 — killed median below 45 | **NOT JUDGED; registered over-kill branch observed so far** | Complete N=34 median 48, mean 48.59. With the 15 unstarted seeds placed arbitrarily, the final N=50 median is bounded 44–52.5, so neither direction is locked. The ≥100 stop branch did fire. |
| PR-32 — deaths relocate to contact | **HIT as an implementation/accounting invariant** | Cohesion-floor destruction no longer exists; the named test passes. Across all 35 observed rows, every unit and every cavalry company has killed − fire-killed − bout-converted = 0. |
| PR-33 — at least two A/G/M alive east in ≥45/50 | **NOT JUDGED** | 34/34 complete seeds pass: 33 end with all three alive east and one with two. The partial stop seed has one alive east. At least 11 of 15 unstarted seeds would need to pass. |
| PR-34 — ford choke, neither branch scored | **RECORDED: empty** | Zero fire or bout events within 250 m of Ford A in 34/34 complete seeds and through minute 883 of the partial seed. |
| PR-35(a) — coalition median ≤66 | **MISS, locked before STOP** | Complete N=34 median 77, mean 77.24. Even assigning zero coalition deaths to all 15 unstarted seeds leaves the possible final N=50 median lower bound at 72. |
| PR-35(b) — band-destruction seeds below 16 | **NOT JUDGED** | 3/34 complete seeds, all `lwm-band`; none through the partial stop tick. The unfinished/unstarted rows could still move the final count across 16. |
| PR-36 — conversions exclusive and below registered ceiling order | **Exclusivity HIT; magnitude NOT JUDGED** | 0 exclusivity violations; 463 conversions across 34 complete seeds and 476 including the partial seed, versus the registered 1,012 across 45 baseline-condition seeds. Fifteen seeds were never run. |
| PR-37 — wing roster/frequency | **MISS, locked; baseline leg HIT** | Baseline seed preserves C/E/F/I/L destroyed and co-d alive. Complete wing occurs only 4/34 times; even if the partial seed and all 15 unstarted seeds passed, the maximum is 20/50, below 25. |
| PR-38 — same stream | **HIT** | Every observed simulation reports `ba288f09`; the complete scenario directory is byte-identical to HEAD. |

## Complete and partial primary distribution

Death cells are `killed/fire-killed/bout-converted/other-killed`. Bout outcomes
are `break/repel/held`. Composite is present only for full-day rows.

| Seed | Status | Reno K | Alive east | A deaths | G deaths | M deaths | Bouts | Outcomes | Converted | Coalition K | Destroyed bands | Choke | Wing | Composite |
|---:|---|---:|---:|---|---|---|---:|---|---:|---:|---|---:|---|---:|
| 18760600 | full | 53 | 3 | 12/12/0/0 | 7/7/0/0 | 34/30/4/0 | 14 | 14/0/0 | 16 | 72 | — | 0 | no | 50.15% |
| 18760601 | full | 55 | 3 | 7/7/0/0 | 9/7/2/0 | 39/30/9/0 | 22 | 22/0/0 | 15 | 72 | — | 0 | no | 47.37% |
| 18760602 | full | 27 | 3 | 9/9/0/0 | 8/8/0/0 | 10/10/0/0 | 12 | 12/0/0 | 20 | 56 | — | 0 | no | 54.85% |
| 18760603 | full | 43 | 3 | 5/5/0/0 | 8/8/0/0 | 30/24/6/0 | 19 | 19/0/0 | 17 | 76 | — | 0 | no | 57.63% |
| 18760604 | full | 42 | 3 | 6/6/0/0 | 9/7/2/0 | 27/22/5/0 | 24 | 24/0/0 | 18 | 90 | — | 0 | no | 48.23% |
| 18760605 | full | 57 | 3 | 8/8/0/0 | 13/12/1/0 | 36/29/7/0 | 17 | 17/0/0 | 9 | 83 | — | 0 | no | 47.37% |
| 18760606 | full | 63 | 2 | 9/9/0/0 | 10/10/0/0 | 44/40/4/0 | 14 | 14/0/0 | 15 | 79 | — | 0 | no | 58.48% |
| 18760607 | full | 52 | 3 | 10/7/3/0 | 8/8/0/0 | 34/30/4/0 | 14 | 14/0/0 | 10 | 87 | — | 0 | no | 52.93% |
| 18760608 | full | 52 | 3 | 11/11/0/0 | 16/14/2/0 | 25/18/7/0 | 21 | 21/0/0 | 20 | 60 | — | 0 | no | 51.00% |
| 18760609 | full | 42 | 3 | 4/4/0/0 | 9/8/1/0 | 29/24/5/0 | 15 | 15/0/0 | 14 | 53 | — | 0 | no | 45.45% |
| 18760610 | full | 53 | 3 | 10/9/1/0 | 16/16/0/0 | 27/24/3/0 | 21 | 21/0/0 | 7 | 83 | — | 0 | no | 47.37% |
| 18760611 | full | 45 | 3 | 6/6/0/0 | 8/8/0/0 | 31/28/3/0 | 18 | 18/0/0 | 9 | 85 | — | 0 | no | 54.85% |
| 18760612 | full | 49 | 3 | 6/6/0/0 | 9/9/0/0 | 34/24/10/0 | 20 | 20/0/0 | 26 | 78 | — | 0 | no | 54.85% |
| 18760613 | full | 39 | 3 | 7/7/0/0 | 7/6/1/0 | 25/22/3/0 | 18 | 18/0/0 | 6 | 93 | — | 0 | no | 50.15% |
| 18760614 | full | 48 | 3 | 6/6/0/0 | 10/10/0/0 | 32/28/4/0 | 28 | 28/0/0 | 17 | 75 | lwm-band | 0 | no | 58.48% |
| 18760615 | full | 70 | 3 | 6/6/0/0 | 36/35/1/0 | 28/26/2/0 | 22 | 22/0/0 | 15 | 61 | — | 0 | no | 55.71% |
| 18760616 | full | 45 | 3 | 4/4/0/0 | 12/11/1/0 | 29/24/5/0 | 19 | 19/0/0 | 17 | 68 | — | 0 | no | 51.00% |
| 18760617 | full | 48 | 3 | 7/7/0/0 | 8/7/1/0 | 33/27/6/0 | 19 | 19/0/0 | 11 | 101 | — | 0 | no | 48.23% |
| 18760618 | full | 68 | 3 | 12/10/2/0 | 17/17/0/0 | 39/38/1/0 | 28 | 28/0/0 | 9 | 96 | — | 0 | no | 47.16% |
| 18760619 | full | 40 | 3 | 6/6/0/0 | 7/7/0/0 | 27/22/5/0 | 22 | 22/0/0 | 24 | 72 | — | 0 | no | 51.00% |
| 18760620 | full | 50 | 3 | 7/7/0/0 | 11/11/0/0 | 32/27/5/0 | 17 | 17/0/0 | 6 | 90 | — | 0 | no | 50.15% |
| 18760621 | full | 43 | 3 | 7/7/0/0 | 6/6/0/0 | 30/26/4/0 | 15 | 15/0/0 | 8 | 57 | — | 0 | yes | 58.48% |
| 18760622 | full | 47 | 3 | 5/5/0/0 | 8/8/0/0 | 34/28/6/0 | 12 | 12/0/0 | 10 | 108 | — | 0 | no | 49.29% |
| 18760623 | full | 48 | 3 | 10/10/0/0 | 12/11/1/0 | 26/24/2/0 | 20 | 20/0/0 | 15 | 74 | — | 0 | no | 48.23% |
| 18760624 | full | 39 | 3 | 7/7/0/0 | 7/6/1/0 | 25/22/3/0 | 17 | 17/0/0 | 11 | 27 | — | 0 | no | 39.89% |
| 18760625 | full | 44 | 3 | 7/7/0/0 | 9/9/0/0 | 28/25/3/0 | 17 | 17/0/0 | 7 | 41 | — | 0 | yes | 58.48% |
| 18760626 | full | 46 | 3 | 7/7/0/0 | 9/9/0/0 | 30/27/3/0 | 17 | 17/0/0 | 5 | 75 | — | 0 | no | 47.37% |
| 18760627 | full | 48 | 3 | 6/6/0/0 | 11/10/1/0 | 31/29/2/0 | 19 | 19/0/0 | 10 | 88 | — | 0 | no | 51.00% |
| 18760628 | full | 49 | 3 | 9/9/0/0 | 11/7/4/0 | 29/23/6/0 | 17 | 17/0/0 | 22 | 103 | lwm-band | 0 | no | 51.00% |
| 18760629 | full | 50 | 3 | 8/8/0/0 | 9/9/0/0 | 33/28/5/0 | 17 | 17/0/0 | 15 | 73 | — | 0 | yes | 58.48% |
| 18760630 | full | 41 | 3 | 4/4/0/0 | 11/10/1/0 | 26/24/2/0 | 22 | 22/0/0 | 13 | 102 | — | 0 | no | 48.23% |
| 18760631 | full | 56 | 3 | 11/11/0/0 | 12/12/0/0 | 33/27/6/0 | 18 | 18/0/0 | 12 | 89 | — | 0 | no | 49.29% |
| 18760632 | full | 56 | 3 | 7/7/0/0 | 16/16/0/0 | 33/25/8/0 | 16 | 16/0/0 | 21 | 83 | — | 0 | yes | 60.41% |
| 18760633 | full | 44 | 3 | 10/10/0/0 | 5/4/1/0 | 29/22/7/0 | 13 | 13/0/0 | 13 | 76 | lwm-band | 0 | no | 41.82% |
| 18760634 | partial to 883 | 102 | 1 | 18/16/2/0 | 40/36/4/0 | 44/41/3/0 | 20 | 20/0/0 | 13 | 32 | — | 0 | no | — |

Complete-seed Reno killed sorted distribution:

```text
27,39,39,40,41,42,42,43,43,44,44,45,45,46,47,48,48,48,48,49,49,50,
50,52,52,53,53,55,56,56,57,63,68,70
```

| Distribution | N | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|---:|
| Reno killed | 34 | 27 | 43.25 | 48 | 52.75 | 70 | 48.59 |
| Coalition killed | 34 | 27 | 72 | 77 | 88.75 | 108 | 77.24 |
| Bouts per seed | 34 | 12 | 16.25 | 18 | 20.75 | 28 | 18.35 |
| Conversions per seed | 34 | 5 | 9.25 | 13.5 | 17 | 26 | 13.62 |
| Composite | 34 | 39.89% | 48.23% | 50.58% | 54.85% | 60.41% | 51.31% |

Complete-seed coalition killed sorted distribution:

```text
27,41,53,56,57,60,61,68,72,72,72,73,74,75,75,76,76,78,79,83,83,83,
85,87,88,89,90,90,93,96,101,102,103,108
```

Complete-seed bouts sorted distribution:

```text
12,12,13,14,14,14,15,15,16,17,17,17,17,17,17,17,18,18,18,19,19,19,
19,20,20,21,21,22,22,22,22,24,28,28
```

Complete-seed conversions sorted distribution:

```text
5,6,6,7,7,8,9,9,9,10,10,10,11,11,12,13,13,14,15,15,15,15,15,16,17,
17,17,18,20,20,21,22,24,26
```

## Full per-company death decomposition

Cells remain `killed/fire-killed/bout-converted/other-killed`. Reno A/G/M are
in the primary table above. This table supplies every other cavalry company
for every observed seed. Every final component is zero.

| Seed | H | D | K | C | E | F | I | L | B |
|---:|---|---|---|---|---|---|---|---|---|
| 18760600 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 22/20/2/0 | 32/26/6/0 | 27/27/0/0 | 38/35/3/0 | 34/33/1/0 | 0/0/0/0 |
| 18760601 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 27/27/0/0 | 27/27/0/0 | 25/25/0/0 | 36/35/1/0 | 36/33/3/0 | 0/0/0/0 |
| 18760602 | 0/0/0/0 | 4/4/0/0 | 0/0/0/0 | 28/25/3/0 | 39/33/6/0 | 40/33/7/0 | 37/35/2/0 | 9/7/2/0 | 0/0/0/0 |
| 18760603 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 36/34/2/0 | 38/31/7/0 | 34/34/0/0 | 38/37/1/0 | 28/27/1/0 | 0/0/0/0 |
| 18760604 | 2/2/0/0 | 2/2/0/0 | 3/3/0/0 | 39/34/5/0 | 33/33/0/0 | 35/35/0/0 | 39/33/6/0 | 29/29/0/0 | 0/0/0/0 |
| 18760605 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 24/24/0/0 | 34/34/0/0 | 24/24/0/0 | 27/26/1/0 | 36/36/0/0 | 0/0/0/0 |
| 18760606 | 3/3/0/0 | 0/0/0/0 | 4/4/0/0 | 35/34/1/0 | 35/35/0/0 | 33/33/0/0 | 38/33/5/0 | 29/24/5/0 | 0/0/0/0 |
| 18760607 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 31/30/1/0 | 35/35/0/0 | 35/35/0/0 | 36/34/2/0 | 36/36/0/0 | 0/0/0/0 |
| 18760608 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 29/28/1/0 | 38/36/2/0 | 33/33/0/0 | 38/34/4/0 | 33/29/4/0 | 0/0/0/0 |
| 18760609 | 0/0/0/0 | 3/3/0/0 | 0/0/0/0 | 20/20/0/0 | 20/20/0/0 | 24/24/0/0 | 37/34/3/0 | 33/28/5/0 | 0/0/0/0 |
| 18760610 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 18/18/0/0 | 27/27/0/0 | 24/24/0/0 | 36/35/1/0 | 36/34/2/0 | 0/0/0/0 |
| 18760611 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 33/33/0/0 | 39/34/5/0 | 37/37/0/0 | 34/34/0/0 | 8/7/1/0 | 0/0/0/0 |
| 18760612 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 35/33/2/0 | 39/34/5/0 | 33/33/0/0 | 39/35/4/0 | 28/23/5/0 | 0/0/0/0 |
| 18760613 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 24/23/1/0 | 24/24/0/0 | 23/23/0/0 | 33/33/0/0 | 36/35/1/0 | 0/0/0/0 |
| 18760614 | 0/0/0/0 | 26/22/4/0 | 0/0/0/0 | 29/28/1/0 | 39/37/2/0 | 40/38/2/0 | 37/34/3/0 | 34/33/1/0 | 0/0/0/0 |
| 18760615 | 1/1/0/0 | 0/0/0/0 | 0/0/0/0 | 38/34/4/0 | 34/34/0/0 | 38/34/4/0 | 36/32/4/0 | 10/10/0/0 | 0/0/0/0 |
| 18760616 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 36/34/2/0 | 30/30/0/0 | 40/34/6/0 | 36/34/2/0 | 10/9/1/0 | 0/0/0/0 |
| 18760617 | 6/6/0/0 | 1/1/0/0 | 8/8/0/0 | 30/30/0/0 | 35/35/0/0 | 31/31/0/0 | 38/34/4/0 | 25/25/0/0 | 0/0/0/0 |
| 18760618 | 1/1/0/0 | 3/3/0/0 | 0/0/0/0 | 29/29/0/0 | 38/33/5/0 | 36/36/0/0 | 29/28/1/0 | 35/35/0/0 | 0/0/0/0 |
| 18760619 | 0/0/0/0 | 1/1/0/0 | 0/0/0/0 | 34/32/2/0 | 40/34/6/0 | 31/31/0/0 | 38/33/5/0 | 32/26/6/0 | 0/0/0/0 |
| 18760620 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 22/21/1/0 | 29/29/0/0 | 26/26/0/0 | 34/34/0/0 | 35/35/0/0 | 0/0/0/0 |
| 18760621 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 36/33/3/0 | 33/33/0/0 | 35/35/0/0 | 38/37/1/0 | 34/34/0/0 | 0/0/0/0 |
| 18760622 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 25/25/0/0 | 27/27/0/0 | 25/25/0/0 | 36/35/1/0 | 36/33/3/0 | 0/0/0/0 |
| 18760623 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 22/22/0/0 | 29/24/5/0 | 25/25/0/0 | 38/31/7/0 | 34/34/0/0 | 0/0/0/0 |
| 18760624 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 28/25/3/0 | 25/25/0/0 | 26/26/0/0 | 23/20/3/0 | 8/7/1/0 | 0/0/0/0 |
| 18760625 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 35/33/2/0 | 34/34/0/0 | 33/33/0/0 | 37/35/2/0 | 35/35/0/0 | 0/0/0/0 |
| 18760626 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 24/23/1/0 | 30/30/0/0 | 27/27/0/0 | 34/33/1/0 | 35/35/0/0 | 0/0/0/0 |
| 18760627 | 4/4/0/0 | 0/0/0/0 | 4/4/0/0 | 38/36/2/0 | 39/35/4/0 | 34/34/0/0 | 36/35/1/0 | 8/8/0/0 | 0/0/0/0 |
| 18760628 | 0/0/0/0 | 1/1/0/0 | 0/0/0/0 | 34/33/1/0 | 38/35/3/0 | 40/33/7/0 | 35/34/1/0 | 9/9/0/0 | 0/0/0/0 |
| 18760629 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 36/35/1/0 | 38/31/7/0 | 35/35/0/0 | 34/33/1/0 | 38/37/1/0 | 0/0/0/0 |
| 18760630 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 33/33/0/0 | 39/34/5/0 | 33/33/0/0 | 37/33/4/0 | 28/27/1/0 | 0/0/0/0 |
| 18760631 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 21/21/0/0 | 24/24/0/0 | 24/24/0/0 | 36/35/1/0 | 36/31/5/0 | 0/0/0/0 |
| 18760632 | 1/1/0/0 | 0/0/0/0 | 1/1/0/0 | 36/35/1/0 | 39/37/2/0 | 39/33/6/0 | 38/34/4/0 | 33/33/0/0 | 0/0/0/0 |
| 18760633 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 28/24/4/0 | 1/1/0/0 | 2/2/0/0 | 9/9/0/0 | 10/9/1/0 | 0/0/0/0 |
| 18760634 | 30/30/0/0 | 17/16/1/0 | 31/28/3/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 | 0/0/0/0 |

The accounting audit also covered every non-company unit. There are zero
nonzero `otherKilled` cells in any observed row.

## Bout, conversion, repulse, and choke audits

| Measure | Complete N=34 | Including partial seed | Registered reference |
|---|---:|---:|---:|
| Bouts | 624 | 644 | 610 planning bound per seed |
| Break | 624 | 644 | data |
| Repel | 0 | 0 | data; zero explicitly informative |
| Held | 0 | 0 | data |
| Wounded converted | 463 | 476 | 1,012 across 45 baseline-condition seeds |
| Non-break conversion violations | 0 | 0 | must be zero |
| Fire/bout/other accounting violations | 0 | 0 | must be zero |

Realized bouts per seed are 12–28, median 18, far below the 610-episode
planning bound. Repulse frequency is `0/624` complete and `0/644`
partial-inclusive.

Ford A extraction center is engine-local
`x=7049.939828084724, y=8095.941750567406`; radius is the preserved 250 m.
There are zero qualifying fire or bout events, so there are no event locations
to list. Every observed complete seed still has an A/G/M ford episode
overlapping the preserved 767.5–776.5 window; the partial stop seed does too.

## East survival, wing, and coalition

- East survival: 34/34 complete seeds have at least two A/G/M alive east;
  33 have three and seed `18760606` has two. The partial stop seed has one.
- Baseline seed `18760625`: A/G/M killed 7/9/28; all three alive east.
- Baseline F4 roster: `co-c`, `co-e`, `co-f`, `co-i`, and `co-l` DESTROYED;
  `co-d` alive.
- Complete-wing seeds: `18760621`, `18760625`, `18760629`, `18760632`
  (4/34).
- Coalition killed: median 77, mean 77.24, range 27–108.
- Band-destruction seeds: `18760614`, `18760628`, and `18760633`, each
  destroying only `lwm-band` (3/34). No band was destroyed through the partial
  stop tick.

## PR-3 readings kept separate

Counts over the 34 complete seeds:

| Company | Any first BROKEN | Any routed movement |
|---|---:|---:|
| co-a | 3/34 | 4/34 |
| co-g | 2/34 | 20/34 |
| co-m | 33/34 | 33/34 |

Cells are `first BROKEN / first routed movement` in minutes; `—` means absent.
No numerical “valley window” is invented.

| Seed | co-a | co-g | co-m |
|---:|---:|---:|---:|
| 18760600 | —/— | —/— | 748.5/755 |
| 18760601 | —/— | —/769 | 748.5/755 |
| 18760602 | —/— | —/— | 760.5/— |
| 18760603 | —/— | —/— | 744.5/745.5 |
| 18760604 | —/— | —/769 | 747.5/755 |
| 18760605 | —/— | 767/768 | 748.5/755 |
| 18760606 | —/— | —/— | 745/746.5 |
| 18760607 | —/775.5 | —/— | 746.5/749.5 |
| 18760608 | —/— | —/769 | 746/755 |
| 18760609 | —/— | —/769 | 746.5/751.5 |
| 18760610 | —/775.5 | —/— | 745.5/746.5 |
| 18760611 | —/— | —/— | 744.5/745.5 |
| 18760612 | —/— | —/— | 744.5/745.5 |
| 18760613 | —/— | —/769 | 746.5/755 |
| 18760614 | —/— | —/769 | 747/753 |
| 18760615 | —/— | —/769 | 746/755 |
| 18760616 | —/— | —/769 | 746/755 |
| 18760617 | —/— | —/769 | 747.5/753.5 |
| 18760618 | 924/913 | —/769 | —/745.5 |
| 18760619 | —/— | —/769 | 746/755 |
| 18760620 | —/775.5 | —/— | 747/750 |
| 18760621 | —/— | —/— | 746/748 |
| 18760622 | —/— | —/— | 745.5/746.5 |
| 18760623 | 829/— | 924/769 | 747.5/755 |
| 18760624 | —/— | —/769 | 746/755 |
| 18760625 | —/— | —/— | 746/748 |
| 18760626 | —/— | —/769 | 746/755 |
| 18760627 | —/— | —/769 | 747/753 |
| 18760628 | —/— | —/769 | 746.5/755 |
| 18760629 | —/— | —/769 | 747/751.5 |
| 18760630 | —/— | —/769 | 747.5/755 |
| 18760631 | —/— | —/— | 745.5/746.5 |
| 18760632 | 775.5/— | —/— | 745/746.5 |
| 18760633 | —/— | —/763.5 | 747/753.5 |
| 18760634 partial | 882.5/759 | —/769 | 748/755 |

## Composite and envelope audit

The actual D105 before-state is the WO-D104 candidate. WO-D104's own stop
forbade its after score/envelope, so no legal D104-candidate N=50 composite
envelope exists to use as the D105 “before.” It was not reconstructed after
the D105 stop.

| Instrument | D105 before (WO-D104 candidate) | D105 candidate measured before STOP |
|---|---:|---:|
| Seed 18760625 composite | not available — prior binding stop | 58.48% |
| C1 | not available | 50.00% FAIL |
| C2 | not available | 77.78% FAIL |
| C3 | not available | 30.77% FAIL |
| C4 | not available | 92.31% PASS |
| Envelope median | not available — prior binding stop | 50.58% over 34 complete seeds |
| Envelope mean | not available — prior binding stop | 51.31% over 34 complete seeds |
| Envelope min–max | not available — prior binding stop | 39.89%–60.41% over 34 complete seeds |

For context only, not mislabeled as the D105 before-state, the last fully
measured same-stream D103 reference was seed composite 54.64%, N=50 envelope
median 46.30%, mean 48.56%, range 36.05%–60.19%. D104 changed behavior after
that reference.

Candidate complete-seed composite sorted distribution:

```text
39.89,41.82,45.45,47.16,47.37,47.37,47.37,47.37,48.23,48.23,48.23,
48.23,49.29,49.29,50.15,50.15,50.15,51.00,51.00,51.00,51.00,51.00,
52.93,54.85,54.85,54.85,55.71,57.63,58.48,58.48,58.48,58.48,58.48,
60.41
```

No N=50 after envelope exists because the D105 stop fired at its 35th
registered seed.

## Behavioral oracles

No oracle was refreshed.

The committed combat pins remain:

```text
full-state hash: 4d5ed785
findPath calls: 171
```

WO-D105 intentionally changes combat movement, serialized engagements,
pursuit termination, casualties, and destruction, so the m4a/m3a behavioral
pins were expected to move. The campaign stop preceded the full suite and
therefore prohibited measuring or refreshing them.

No no-combat oracle was run or edited. The candidate's movement substitutions
are inside the `kind === 'COMBAT'` branches and consume the combat config; no
no-combat movement is claimed. Because no no-combat pin was measured after the
candidate, there is no observed no-combat movement to refresh or report as an
ambiguity.

## Quartet — verbatim status

The final quartet did not run. There is no quartet stdout to reproduce.

### `npm run typecheck`

```text
NOT RUN — binding RE-ARMED STOP
```

The narrower pre-stop engine compilation exited 0 as recorded above.

### `npm run lint`

```text
NOT RUN — binding RE-ARMED STOP
```

### `npm test`

```text
NOT RUN — binding RE-ARMED STOP
```

The only pre-stop test command was the five-test D105 focused run reproduced
verbatim above.

### `npm run build`

```text
NOT RUN — binding RE-ARMED STOP
```

`dist/` was compiled pre-stop with `npx tsc -p tsconfig.engine.json`.
`npm run terrain` was never run.

## `[CAL]` and protected-content byte audit

`engine/src/combat-config.ts` remains byte-identical to starting HEAD:

```text
8f8adb5cedc2685708bfae8b9c076c6d1cf7c837
```

The only `movement.ts` diff is the two frozen substitutions
`pursuitCloseRangeMeters` → `meleeRangeMeters`; no numeric literal or `[CAL]`
table line changed. Both shock-margin config values and the D65 shock formula
lines are unchanged. `destructionCohesionFloor` remains 3 in the byte-identical
config table and is only removed from the destruction predicate.

Protected files:

| File | HEAD blob | Working blob | Identical |
|---|---|---|---|
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` | same | yes |
| `engine/src/spotting.ts` | `8c889c2adec0f345c73bf2e7e65b1afbe9614654` | same | yes |
| F4 roster test (`engine/tests/m4a-gates.test.ts`) | `7b90a91c465899a73466a4d1f6482fafe4a2950a` | same | yes |
| Scenario JSON | `11db18bd727ae93a4460b146a7300b3f34909241` | same | yes |
| Scenario README | `dee0cd99f12b1872e0cc23e78387c87500d0c47f` | same | yes |
| `docs/PREDICTIONS.md` | `c1e5be01cd4012dbcc27030037c648025fafa086` | same | yes |
| `codex-report-wo-d102.md` | `3f121804e50deaf974255b8cdcd0d32999fd2cb1` | same | yes |
| `codex-report-wo-d103.md` | `014dae6ab037bebc25a35ea7c7297bbab1f56e7c` | same | yes |
| `codex-report-wo-d104.md` | `92c58545313c071f09627a3dc05399ac599d4565` | same | yes |

Scenario JSON SHA-256:

```text
E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8
```

Specific protected results:

- scenario stream remains `ba288f09`;
- `meleeRangeMeters`, `chargeBreakMargin`, `chargeRepelMargin`,
  `routCohesionDrain`, `pursuitRepathCadenceTicks`, movement speeds, formation
  multipliers, and all other `[CAL]` values are unchanged;
- fire economy, ammunition, resupply, rout/rally semantics, and
  `startPursuit` eligibility are unchanged;
- D93/D96/D98/D99/D102/D103/D104 semantics outside the four authorized loci
  are unchanged;
- the F4 roster assertion, scenario content, predictions, and prior codex
  reports have zero diff;
- the byte audit found no scenario or protected-content movement.

## AMBIGUITIES

No implementation ambiguity required a `TODO-AMBIGUOUS` marker or pre-campaign
STOP:

- the latch owner, re-arm condition, attacker fallback, conversion accounting,
  and termination path are all explicit in the frozen work order;
- the bout event deliberately has no position field. For PR-34, the campaign
  instrument captured the target's position from serialized state on the same
  event tick; no later position or invented event field was used;
- no numeric valley-window definition exists for PR-3, so raw first-BROKEN and
  first-routed-movement times are reported without classification.

The incomplete prediction verdicts and missing before/full-after envelope are
not resolved by assumption. They are consequences of the binding stop and are
listed as deviations.

## DEVIATIONS

- **Binding RE-ARMED STOP:** seed `18760634` reached Reno killed 102 at minute
  883. Work stopped at 34 full seeds plus one partial seed.
- Seeds `18760635–18760649` were not run. PR-31, PR-33, PR-35(b), and PR-36's
  ceiling magnitude remain NOT JUDGED.
- The final quartet, full-suite stale-oracle measurement/refresh, no-combat
  oracle verification, post-fix score command, N=50 envelope, and preserved
  probes were not run because each would continue work after the stop.
- The partial stop row is excluded from every complete-day aggregate and has
  no composite.
- WO-D104's stop left no actual D104-candidate score/envelope to serve as the
  D105 before-state. No baseline rerun or post-stop reconstruction was used.
- The first focused-test attempt exposed a test-fixture pair-id ordering error,
  not an engine failure. The corrected named suite passed 5/5 before the
  campaign.
- **Registered other branches/misses were not tuned:** the complete-seed Reno
  median is currently above 45; repulse frequency is zero; the choke is empty;
  coalition median leg PR-35(a) is an irreversible miss; wing-frequency PR-37
  is an irreversible miss despite the baseline roster holding.
- No calibration change, scenario change, F4 assertion edit, result-driven
  tuning, commit, or push occurred.
