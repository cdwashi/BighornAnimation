# WO-D106 camp-defence command ownership — completed campaign report

Execution date: 2026-07-30  
Starting HEAD: `af38cb2423a0b0d03e897f19aea4c93157fc0d02`  
Registered seed range: `18760600–18760649`  
Completed seeds: `18760600–18760649` (50 full-day runs)  
Scenario-content stream: `ba288f09` before and throughout measurement  
Status: **implemented; N=50 completed; RE-ARMED STOP did not fire; no commit or push**

## Summary

WO-D106 is implemented as the frozen one-gate change. `startPursuit` now
returns `false` immediately when `pursuer.campDefense` is set. It does so
before target lookup, terrain/grid selection, cache work, pathfinding, state
writes, or event emission. No other engine behavior, number, field, config, or
`[CAL]` value changed.

The four named D106 tests pass 4/4. The declined generalized scope remains
absent: an ordered unit without a commitment starts COMBAT pursuit exactly as
before, and release restores normal eligibility.

The registered N=50 campaign completed without a stop:

- Reno A/G/M killed: median **32**, mean **33.04**, range **18–51**;
- zero seeds exceeded 60 and zero reached 100;
- at least two A/G/M ended alive east in **50/50** seeds (49 end with all
  three east; one ends with two);
- coalition killed median **67.5** (upper median 68), inside 36–136;
- complete wing destruction **9/50**; the previewed leg is exactly the
  registered low **5/34**;
- no holder carried COMBAT or INITIATIVE pursuit in **108,450/108,450**
  serialized holder-tick samples;
- hill killed **139**: 20 combat-pursuit, 118 initiative, 1 camp-defence.
  Combat-pursuit share is **14.39%**, below the 60.4% baseline, and initiative
  owns 118/119 of the remaining hill killing.

PR-39, PR-40, PR-41, PR-42, and PR-43 are **HIT**. PR-44 is **HIT** after the
final protected-content audit: the scenario stream remains `ba288f09` and the
scenario directory is byte-identical to starting HEAD.

The thirty-third preview reproduced exactly. An independent run of the frozen
`.claude/ownership-d105-probe.mjs CD` agrees with the campaign on Reno and
coalition killed in every one of the 34 previewed seeds; all 68 deltas are
zero. Its aggregate also reproduces exactly: Reno upper median 34, coalition
median 63, hill 101 at 19/81/1 combat-pursuit/initiative/camp-defence, wing
5147, complete wing 5/34, east 34/34, and 448 bouts.

The reopen-clause instrument found the literal broad signature—commitment
held while a strictly nearer eligible threat had no active engagement—but
every such sample remained inside D92's ruled 250 m hysteresis margin. There
are 483 maximal windows / 7,251 holder-ticks, with a longest window of 142
ticks / 71 minutes, but **zero switch-eligible ticks**. This is reported as
registered data only; no B-variant, tuning, threshold, or semantic change was
made.

## Frozen-material review

Read in full before implementation:

- `docs/WO-D106.md`;
- the complete WO-D106 PR-39–PR-44 entry, registered observations, and
  RE-ARMED STOP in `docs/PREDICTIONS.md`;
- D91, the D91 RIDER, D92–D99, D101–D106 in
  `docs/IMPLEMENTATION_HISTORY.md`; D100 remains reserved and has no ruling
  row.

The frozen work order controlled implementation, measurement, and stop
behavior.

## Implementation

The complete engine diff is:

```diff
 function startPursuit(
   ...
 ): boolean {
+  if (pursuer.campDefense) return false;
   const targetUnit = state.units.find((item) => item.id === targetId);
```

That first statement is the entire behavioral change. It covers COMBAT and
INITIATIVE because both enter through `startPursuit`. D96 closing is not a
D72 pursuit kind and remains owned by camp-defence machinery. `endPursuit`,
pursuit maintenance, D92 switching, D93 release, D96 closing, orders, and all
other consumers are unchanged.

Files added or changed for the work:

```text
engine/src/morale.ts
engine/tests/d106-pursuit-gate.test.ts
engine/tests/m4a-gates.test.ts                  (combat-oracle pins/comments only)
.claude/d106-campaign.mjs                      (measurement)
.claude/d106-oracle-probe.mjs                  (before/after oracle audit)
.claude/d106-report-data.mjs                   (report formatting)
codex-report-wo-d106.md
reports/calibration-scorecard.md               (required generated after-state)
reports/seed-envelope.md                       (required generated after-state)
```

The `.claude/*.stdout.txt` and `.claude/*.stderr.txt` files are verbatim
instrument logs. No scenario, prior codex report, prediction, combat
mechanism, or calibration source was changed.

## Four named tests

Command:

```text
npx vitest run engine/tests/d106-pursuit-gate.test.ts --fileParallelism=false
```

Verbatim passing output:

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 37ms

 Test Files  1 passed (1)
      Tests  4 passed (4)
   Start at  15:50:00
   Duration  1.20s (transform 325ms, setup 0ms, collect 390ms, tests 37ms, environment 0ms, prepare 239ms)
```

Names and exercised branch:

| Test | Result | Proof |
|---|---|---|
| `gate-blocks-combat-pursuit-on-holder` | pass | No pursuit/event; held camp path remains unchanged |
| `gate-blocks-initiative-on-holder` | pass | No initiative pursuit/event on a holder |
| `gate-inert-for-ordered-units` | pass | Active order with no commitment still begins COMBAT pursuit |
| `release-restores-eligibility` | pass | Same holder is blocked, then pursues after commitment release |

The pre-campaign `npx tsc -p tsconfig.engine.json` exited 0 with no stdout.

## RE-ARMED STOP

Binding rule:

```text
halt if Reno A/G/M killed exceeds 60 in more than 5/50 registered seeds,
or if any registered seed reaches killed >= 100
```

| Branch | Result |
|---|---|
| More than five seeds above 60 | **Did not fire: 0/50** |
| Any seed killed ≥100 | **Did not fire: maximum 51** |
| PR-43 implementation-error halt | **Did not fire: 0 violations** |
| Campaign completion | **50/50 full-day seeds** |

**STOP STATUS: NOT FIRED.** No observed result caused a code, parameter,
assertion, or content change.

## PR-39–PR-44 verdicts

| Prediction | Verdict | N=50 evidence |
|---|---|---|
| PR-39 — gate world holds | **HIT** | Reno killed median 32 < baseline 48; maximum 51; zero ≥100 |
| PR-40 — mode instrument moves and stays moved | **HIT** | Hill combat-pursuit 20/139 = 14.39% < 60.4%; remaining hill kills are 118 initiative, 1 camp-defence |
| PR-41 — valley holds | **HIT** | At least two A/G/M alive east in 50/50, threshold 45/50 |
| PR-42 — coalition stays sourced | **HIT** | Coalition killed median 67.5 (upper median 68), inside 36–136 |
| PR-43 — audit leg | **HIT** | 0 COMBAT/INITIATIVE pursuit samples in 108,450 holder-tick samples across 50/50 seeds |
| PR-44 — same stream | **HIT** | `ba288f09` in 50/50; scenario directory byte-identical to HEAD |

## Full distributions

| Distribution | N | Min | P25 | Median | Upper median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Reno A/G/M killed | 50 | 18 | 29.25 | 32 | 32 | 36.75 | 51 | 33.04 |
| Coalition killed | 50 | 27 | 45.25 | 67.5 | 68 | 84 | 101 | 64.68 |
| Bouts per seed | 50 | 6 | 10 | 12 | 12 | 14 | 21 | 12.68 |
| Composite | 50 | 44.59% | 53.14% | 54.85% | 54.85% | 57.63% | 60.41% | 55.27% |

Reno killed sorted:

```text
18,22,24,24,24,26,26,27,27,27,28,28,29,30,30,30,30,31,31,31,32,32,32,32,32,
32,33,33,33,33,33,34,34,35,36,36,36,37,37,38,39,40,40,40,41,42,43,43,50,51
```

Coalition killed sorted:

```text
27,32,37,37,39,39,40,43,43,44,44,45,45,46,47,48,48,49,49,52,54,62,63,63,67,
68,71,71,71,72,74,75,76,83,83,84,84,84,85,85,86,87,87,90,90,90,91,91,92,101
```

Bouts sorted:

```text
6,8,8,8,8,8,8,9,9,9,10,10,10,10,10,10,11,11,11,11,11,11,12,12,12,12,13,13,
13,13,13,13,13,13,14,14,14,14,15,15,15,17,18,18,19,19,20,21,21,21
```

Previewed and unseen legs are held apart:

| Leg | N | Reno killed min/P25/median/P75/max/mean | Coalition killed min/P25/median/P75/max/mean | Wing | East | Bouts |
|---|---:|---|---|---:|---:|---:|
| Previewed | 34 | 18/31.25/33.5 (upper 34)/38.75/51/34.59 | 32/45.25/63/84/101/64.29 | 5/34 | 34/34 | 448 |
| Never-run | 16 | 24/26.75/30/32/40/29.75 | 27/46.75/71/84.25/92/65.50 | 4/16 | 16/16 | 186 |
| All | 50 | 18/29.25/32/36.75/51/33.04 | 27/45.25/67.5/84/101/64.68 | 9/50 | 50/50 | 634 |

All 634 bouts are break outcomes; repel and held are both zero. This is a
registered observation only. The D105 bout, latch, outcome machinery, drain,
and finishing semantics were not touched.

## Hill and wing mode decomposition — primary instrument

Cells are `events / killed`.

### Hill

| Leg | Order axis | Combat pursuit | Initiative | Camp defence | Unattributed | Total killed | CP share |
|---|---:|---:|---:|---:|---:|---:|---:|
| Previewed 34 | 0/0 | 21/19 | 96/81 | 1/1 | 0/0 | 101 | 18.81% |
| Unseen 16 | 0/0 | 1/1 | 44/37 | 0/0 | 0/0 | 38 | 2.63% |
| N=50 | 0/0 | 22/20 | 140/118 | 1/1 | 0/0 | 139 | **14.39%** |

The frozen preview is exact: `19 combat-pursuit / 81 initiative / 1
camp-defence`. The unseen leg strengthens rather than reverses the registered
direction. After removing combat-pursuit kills, initiative is 118/119
(99.16%) of the remainder.

### Wing

| Leg | Order axis | Combat pursuit | Initiative | Camp defence | Unattributed | Total killed |
|---|---:|---:|---:|---:|---:|---:|
| Previewed 34 | 234/327 | 2055/3969 | 255/849 | 1/2 | 0/0 | 5147 |
| Unseen 16 | 106/153 | 974/1857 | 128/448 | 3/4 | 0/0 | 2462 |
| N=50 | 340/480 | 3029/5826 | 383/1297 | 4/6 | 0/0 | 7609 |

Wing completion remains low, as registered: 5/34 in the preview and 9/50
overall. It was not tuned or treated as D106's deficit.

## Full per-seed primary table

Mode cells are killed in `order-axis/combat-pursuit/initiative/camp-defence/
unattributed` order. Starvation cells are `windows/holder-ticks/longest-ticks`.
Every row is a full-day row.

| Seed | A/G/M | Reno K | East | Coalition K | Wing | Bouts | Hill modes | Wing modes | Holder ticks/viol. | Switches | Starvation | Composite |
|---:|---|---:|---:|---:|---|---:|---|---|---:|---:|---|---:|
| 18760600 | 8/5/22 | 35 | 3 | 91 | no | 15 | 0/0/0/0/0 | 10/114/31/0/0 | 2169/0 | 18 | 9/39/8 | 50.15% |
| 18760601 | 7/5/20 | 32 | 3 | 83 | no | 20 | 0/2/2/0/0 | 8/133/20/2/0 | 2169/0 | 24 | 12/42/8 | 52.93% |
| 18760602 | 4/3/11 | 18 | 3 | 63 | yes | 11 | 0/0/0/0/0 | 9/137/21/0/0 | 2169/0 | 9 | 9/105/28 | 60.41% |
| 18760603 | 5/6/28 | 39 | 3 | 39 | no | 21 | 0/0/0/1/0 | 7/139/9/0/0 | 2169/0 | 12 | 9/450/142 | 55.71% |
| 18760604 | 6/5/22 | 33 | 3 | 48 | no | 17 | 0/0/0/0/0 | 11/107/23/0/0 | 2169/0 | 12 | 9/450/142 | 55.71% |
| 18760605 | 11/9/23 | 43 | 2 | 84 | no | 13 | 0/1/7/0/0 | 10/130/2/0/0 | 2169/0 | 21 | 12/42/6 | 52.93% |
| 18760606 | 8/5/30 | 43 | 3 | 84 | no | 18 | 0/4/5/0/0 | 8/130/24/0/0 | 2169/0 | 27 | 6/27/6 | 52.93% |
| 18760607 | 6/8/19 | 33 | 3 | 83 | no | 9 | 0/0/6/0/0 | 8/118/39/0/0 | 2169/0 | 15 | 12/105/28 | 54.85% |
| 18760608 | 8/9/19 | 36 | 3 | 72 | no | 10 | 0/0/7/0/0 | 9/111/36/0/0 | 2169/0 | 9 | 9/123/32 | 57.63% |
| 18760609 | 3/6/13 | 22 | 3 | 76 | yes | 10 | 0/0/0/0/0 | 8/135/26/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760610 | 7/8/17 | 32 | 3 | 44 | no | 14 | 0/0/0/0/0 | 9/109/34/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760611 | 5/6/30 | 41 | 3 | 46 | no | 21 | 0/0/0/0/0 | 9/97/38/0/0 | 2169/0 | 12 | 9/450/142 | 52.93% |
| 18760612 | 9/11/22 | 42 | 3 | 63 | no | 13 | 0/0/9/0/0 | 9/108/44/0/0 | 2169/0 | 12 | 12/45/6 | 57.63% |
| 18760613 | 7/4/17 | 28 | 3 | 54 | no | 11 | 0/8/0/0/0 | 8/93/33/0/0 | 2169/0 | 15 | 9/111/28 | 54.85% |
| 18760614 | 6/7/17 | 30 | 3 | 37 | no | 11 | 0/0/4/0/0 | 13/113/21/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760615 | 5/8/19 | 32 | 3 | 45 | no | 9 | 0/0/0/0/0 | 10/114/17/0/0 | 2169/0 | 9 | 9/111/28 | 54.85% |
| 18760616 | 4/8/18 | 30 | 3 | 32 | yes | 9 | 0/0/0/0/0 | 9/158/5/0/0 | 2169/0 | 9 | 9/111/28 | 60.41% |
| 18760617 | 7/7/23 | 37 | 3 | 47 | no | 18 | 0/0/0/0/0 | 10/113/23/0/0 | 2169/0 | 12 | 9/450/142 | 55.71% |
| 18760618 | 6/16/29 | 51 | 3 | 91 | no | 15 | 0/2/0/0/0 | 11/123/23/0/0 | 2169/0 | 30 | 9/33/6 | 52.07% |
| 18760619 | 8/7/17 | 32 | 3 | 68 | no | 11 | 0/0/10/0/0 | 10/103/41/0/0 | 2169/0 | 9 | 9/111/28 | 54.85% |
| 18760620 | 10/7/19 | 36 | 3 | 86 | no | 8 | 0/0/0/0/0 | 29/97/10/0/0 | 2169/0 | 9 | 9/99/28 | 52.07% |
| 18760621 | 7/4/18 | 29 | 3 | 90 | no | 11 | 0/0/5/0/0 | 9/115/35/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760622 | 7/6/37 | 50 | 3 | 85 | no | 21 | 0/2/4/0/0 | 8/123/9/0/0 | 2169/0 | 33 | 15/129/28 | 52.93% |
| 18760623 | 8/7/23 | 38 | 3 | 40 | no | 19 | 0/0/0/0/0 | 8/87/32/0/0 | 2169/0 | 12 | 9/450/142 | 50.15% |
| 18760624 | 8/7/18 | 33 | 3 | 37 | no | 12 | 0/0/7/0/0 | 7/120/18/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760625 | 7/6/18 | 31 | 3 | 90 | yes | 10 | 0/0/2/0/0 | 9/139/20/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760626 | 9/6/19 | 34 | 3 | 71 | no | 13 | 0/0/5/0/0 | 9/120/31/0/0 | 2169/0 | 9 | 9/123/32 | 54.85% |
| 18760627 | 8/7/19 | 34 | 3 | 62 | no | 8 | 0/0/6/0/0 | 10/104/27/0/0 | 2169/0 | 9 | 9/123/32 | 54.85% |
| 18760628 | 14/7/15 | 36 | 3 | 87 | no | 10 | 0/0/0/0/0 | 8/110/22/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760629 | 4/6/17 | 27 | 3 | 49 | no | 6 | 0/0/0/0/0 | 9/110/28/0/0 | 2169/0 | 9 | 9/99/28 | 57.63% |
| 18760630 | 3/9/21 | 33 | 3 | 45 | no | 19 | 0/0/0/0/0 | 10/96/31/0/0 | 2169/0 | 12 | 9/450/142 | 52.93% |
| 18760631 | 10/9/21 | 40 | 3 | 49 | yes | 15 | 0/0/0/0/0 | 8/132/29/0/0 | 2169/0 | 9 | 3/48/16 | 58.48% |
| 18760632 | 17/7/16 | 40 | 3 | 44 | no | 12 | 0/0/0/0/0 | 9/107/33/0/0 | 2169/0 | 9 | 15/165/28 | 53.78% |
| 18760633 | 9/4/13 | 26 | 3 | 101 | no | 8 | 0/0/2/0/0 | 8/124/14/0/0 | 2169/0 | 9 | 9/99/28 | 54.85% |
| 18760634 | 8/4/19 | 31 | 3 | 84 | no | 10 | 0/0/6/0/0 | 8/93/52/0/0 | 2169/0 | 9 | 9/111/28 | 54.85% |
| 18760635 | 8/3/13 | 24 | 3 | 39 | no | 13 | 0/0/5/0/0 | 7/106/27/0/0 | 2169/0 | 15 | 15/165/32 | 54.85% |
| 18760636 | 4/4/22 | 30 | 3 | 75 | no | 8 | 0/0/1/0/0 | 29/113/3/0/0 | 2169/0 | 9 | 9/99/28 | 52.07% |
| 18760637 | 7/2/17 | 26 | 3 | 71 | yes | 13 | 0/0/0/0/0 | 8/145/14/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760638 | 7/6/14 | 27 | 3 | 92 | no | 14 | 0/0/0/0/0 | 9/123/29/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760639 | 9/7/21 | 37 | 3 | 74 | yes | 14 | 0/1/1/0/0 | 8/127/30/0/0 | 2169/0 | 12 | 6/30/8 | 55.71% |
| 18760640 | 9/7/16 | 32 | 3 | 87 | no | 8 | 0/0/5/0/0 | 7/114/21/0/0 | 2169/0 | 9 | 9/123/32 | 54.85% |
| 18760641 | 5/7/16 | 28 | 3 | 52 | yes | 13 | 0/0/0/0/0 | 7/141/14/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760642 | 6/4/14 | 24 | 3 | 71 | no | 12 | 0/0/0/0/0 | 9/104/48/0/0 | 2169/0 | 9 | 9/111/28 | 54.85% |
| 18760643 | 14/11/15 | 40 | 3 | 90 | no | 8 | 0/0/3/0/0 | 9/116/21/0/0 | 2169/0 | 9 | 9/111/28 | 54.85% |
| 18760644 | 10/8/15 | 33 | 3 | 85 | no | 14 | 0/0/6/0/0 | 8/111/29/0/0 | 2169/0 | 9 | 15/171/32 | 52.93% |
| 18760645 | 7/6/18 | 31 | 3 | 43 | no | 12 | 0/0/0/0/0 | 10/81/51/0/0 | 2169/0 | 9 | 9/111/28 | 57.63% |
| 18760646 | 5/4/18 | 27 | 3 | 48 | no | 10 | 0/0/3/0/0 | 9/146/12/0/0 | 2169/0 | 9 | 15/165/32 | 55.71% |
| 18760647 | 7/6/17 | 30 | 3 | 27 | no | 13 | 0/0/0/0/0 | 10/104/22/4/0 | 2169/0 | 27 | 12/126/32 | 44.59% |
| 18760648 | 3/6/15 | 24 | 3 | 67 | no | 11 | 0/0/2/0/0 | 7/104/44/0/0 | 2169/0 | 9 | 9/117/32 | 54.85% |
| 18760649 | 9/7/16 | 32 | 3 | 43 | yes | 13 | 0/0/5/0/0 | 8/129/31/0/0 | 2169/0 | 9 | 9/111/28 | 60.41% |

## Previewed-seed implementation audit

The frozen probe and the campaign are independent executions against the same
compiled gate. Every available per-seed preview field is exact:

| Seed | Preview Reno | D106 Reno | Δ | Preview coalition | D106 coalition | Δ |
|---:|---:|---:|---:|---:|---:|---:|
| 18760600 | 35 | 35 | 0 | 91 | 91 | 0 |
| 18760601 | 32 | 32 | 0 | 83 | 83 | 0 |
| 18760602 | 18 | 18 | 0 | 63 | 63 | 0 |
| 18760603 | 39 | 39 | 0 | 39 | 39 | 0 |
| 18760604 | 33 | 33 | 0 | 48 | 48 | 0 |
| 18760605 | 43 | 43 | 0 | 84 | 84 | 0 |
| 18760606 | 43 | 43 | 0 | 84 | 84 | 0 |
| 18760607 | 33 | 33 | 0 | 83 | 83 | 0 |
| 18760608 | 36 | 36 | 0 | 72 | 72 | 0 |
| 18760609 | 22 | 22 | 0 | 76 | 76 | 0 |
| 18760610 | 32 | 32 | 0 | 44 | 44 | 0 |
| 18760611 | 41 | 41 | 0 | 46 | 46 | 0 |
| 18760612 | 42 | 42 | 0 | 63 | 63 | 0 |
| 18760613 | 28 | 28 | 0 | 54 | 54 | 0 |
| 18760614 | 30 | 30 | 0 | 37 | 37 | 0 |
| 18760615 | 32 | 32 | 0 | 45 | 45 | 0 |
| 18760616 | 30 | 30 | 0 | 32 | 32 | 0 |
| 18760617 | 37 | 37 | 0 | 47 | 47 | 0 |
| 18760618 | 51 | 51 | 0 | 91 | 91 | 0 |
| 18760619 | 32 | 32 | 0 | 68 | 68 | 0 |
| 18760620 | 36 | 36 | 0 | 86 | 86 | 0 |
| 18760621 | 29 | 29 | 0 | 90 | 90 | 0 |
| 18760622 | 50 | 50 | 0 | 85 | 85 | 0 |
| 18760623 | 38 | 38 | 0 | 40 | 40 | 0 |
| 18760624 | 33 | 33 | 0 | 37 | 37 | 0 |
| 18760625 | 31 | 31 | 0 | 90 | 90 | 0 |
| 18760626 | 34 | 34 | 0 | 71 | 71 | 0 |
| 18760627 | 34 | 34 | 0 | 62 | 62 | 0 |
| 18760628 | 36 | 36 | 0 | 87 | 87 | 0 |
| 18760629 | 27 | 27 | 0 | 49 | 49 | 0 |
| 18760630 | 33 | 33 | 0 | 45 | 45 | 0 |
| 18760631 | 40 | 40 | 0 | 49 | 49 | 0 |
| 18760632 | 40 | 40 | 0 | 44 | 44 | 0 |
| 18760633 | 26 | 26 | 0 | 101 | 101 | 0 |

The frozen probe's aggregate output was:

```text
===== mode CD, 34 seeds =====
Reno killed: median 34 mean 34.6 range 18-51 | >60: 0 | >=100: 0
coalition killed: median 63 | band destructions (seed-units) 1
complete wing 5/34 | >=2 east 34/34 | bouts total 448
HILL killed 101: order-axis 0 | combat-pursuit 19 | initiative 81 | camp-defence 1 | unattributed 0
WING killed 5147: order-axis 327 | combat-pursuit 3969 | initiative 849 | camp-defence 2 | unattributed 0
```

It matches the campaign's previewed aggregate digit-for-digit.

## Per-tick commitment-holder pursuit audit

| Pool band | Holder-tick samples | COMBAT samples | INITIATIVE samples | Violations |
|---|---:|---:|---:|---:|
| Blackfeet-Santee pool | 36,150 | 0 | 0 | 0 |
| Minneconjou pool | 36,150 | 0 | 0 | 0 |
| Sans Arc pool | 36,150 | 0 | 0 | 0 |
| **Total** | **108,450** | **0** | **0** | **0** |

Each seed contributes 723 commitment ticks per pool band / 2,169 holder-tick
samples total. The serialized audit ran after every simulation tick and
accepted D96's unkinded closing pursuit while rejecting specifically COMBAT
or INITIATIVE, exactly as PR-43 requires.

## D92 switching and reopen-clause data

### Switching

All three defensive pools switch in sync in this scenario:

| Pool band | Switch events |
|---|---:|
| Blackfeet-Santee pool | 203 |
| Minneconjou pool | 203 |
| Sans Arc pool | 203 |
| **Total** | **609** |

Per-seed total switch distribution:

```text
9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,9,
12,12,12,12,12,12,12,12,15,15,15,18,21,24,27,27,30,33
```

Since the pools are synchronized, the per-band value for a seed is one third
of the primary table's `Switches` column.

Full transition counts, pooled across the three bands:

| Transition | Count | Transition | Count |
|---|---:|---|---:|
| co-a→co-c | 27 | co-a→co-e | 6 |
| co-a→co-f | 3 | co-a→co-m | 6 |
| co-c→co-a | 24 | co-c→co-e | 9 |
| co-c→co-m | 3 | co-e→co-a | 9 |
| co-e→co-c | 3 | co-e→co-f | 126 |
| co-e→co-m | 24 | co-f→co-a | 117 |
| co-f→co-c | 3 | co-f→co-g | 6 |
| co-f→co-m | 3 | co-g→co-e | 108 |
| co-g→co-m | 51 | co-m→co-a | 9 |
| co-m→co-c | 6 | co-m→co-d | 18 |
| co-m→co-e | 39 | co-m→co-g | 9 |

### Starvation-signature windows

The instrument mirrors D92 eligibility: a live, spotted, non-scout enemy
within 3,000 m of a defended camp, using believed position. "Nearer" is
strictly lower camp-distance than the held threat; "unengaged" means the
candidate belongs to no active serialized engagement. Maximal contiguous
windows are reported raw. A separate field records whether the alternative
also clears D92's ruled 250 m switch margin.

| Pool band | Windows | Holder-ticks in windows | Longest | Switch-eligible windows/ticks |
|---|---:|---:|---:|---:|
| Blackfeet-Santee pool | 161 | 2,417 | 142 ticks / 71 min | 0 / 0 |
| Minneconjou pool | 161 | 2,417 | 142 ticks / 71 min | 0 / 0 |
| Sans Arc pool | 161 | 2,417 | 142 ticks / 71 min | 0 / 0 |
| **Total** | **483** | **7,251** | **142 ticks / 71 min** | **0 / 0** |

Window-duration distribution in ticks:

| N | Min | P25 | Median | P75 | Max | Total holder-ticks |
|---:|---:|---:|---:|---:|---:|---:|
| 483 | 1 | 3 | 6 | 28 | 142 | 7,251 |

The largest observed closeness advantage is 237.001 m, below 250 m. The
longest pattern is 18 synchronized windows (six seeds × three pools) from
tick 1646 through 1787: commitment on co-m while co-a/co-g/pack-train are
nearer and unengaged, maximum advantage 189.809 m. Other common patterns are
co-f held with co-e nearer for three ticks (105 windows), and co-g held with
co-e/co-f nearer for 28 ticks (81 windows) or 32 ticks (27 windows).

Thus the broad literal signature exists, including long windows, while the
strong D92 switch-eligible signature is absent. The work order registered data
only and supplied no duration adjudication; no threshold is invented and no
B-variant is implemented.

## Composite and envelope

Both states consume the same `ba288f09` stream.

| Instrument | Before (accepted D105) | After D106 | Change |
|---|---:|---:|---:|
| Seed 18760625 composite | 58.48% | 57.63% | -0.85 pp |
| C1 | 50.00% FAIL | 50.00% FAIL | 0 |
| C2 | 77.78% FAIL | 66.67% FAIL | -11.11 pp |
| C3 | 30.77% FAIL | 38.46% FAIL | +7.69 pp |
| C4 | 92.31% PASS | 92.31% PASS | 0 |
| N=50 envelope median | 51.00% | 54.85% | +3.85 pp |
| N=50 envelope mean | 51.06% | 55.27% | +4.21 pp |
| N=50 envelope min–max | 39.89%–60.41% | 44.59%–60.41% | min +4.70 pp; max unchanged |

Both standard `node dist/engine/envelope-cli.js` runs completed 50/50 and
wrote `reports/seed-envelope.md`. Each then exited nonzero on the existing
selection finding:

```text
Error: Baseline criteria selected no typical seed; preserved diagnostic report at
C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\seed-envelope.md
```

That exit occurs after the complete envelope is written and is not a D106
failure.

## Behavioral oracles

The dispatched pins were stale across two accepted-but-stopped rounds:

```text
full-state hash: 4d5ed785
findPath calls: 171
```

Neither WO-D104 nor WO-D105 reached its refresh. A pre-change D105 probe
measured combat hash `430fa88d` and 186 whole-create path calls. D106 then
measured:

| Oracle | D105 before | D106 after | Final gate pin |
|---|---:|---:|---:|
| Full-state hash | `430fa88d` | `38f6ce32` | `38f6ce32` |
| Whole-create path calls | 186 | 155 | n/a |
| M4-A run-only path calls | not separately pinned before | 153 | 153 |

The two-call distinction is protocol, not behavior: the standalone probe
resets before `createSim`; M4-A historically resets immediately after
`createSim`, excluding two initialization calls.

The first post-campaign full suite, before refresh, passed 103/105 assertions.
Its only failures were the two old `4d5ed785` hash assertions. F3 no-combat,
F4's immutable five-destroyed roster, E1, V1, V7, and every other assertion
passed. The first focused M4-A run after the hash refresh reached the path
assertion and measured 153 against the initially transcribed whole-create 155;
the pin was corrected to the gate's unchanged reset protocol.

No-combat before/after is exact:

| Tick | Before hash | After hash |
|---:|---|---|
| 1 | `baadad58` | `baadad58` |
| 360 | `46f01a7a` | `46f01a7a` |
| 1080 | `49bc6012` | `49bc6012` |
| 2160 | `b36d9fa9` | `b36d9fa9` |

Seed 42 also ends at `b36d9fa9` before and after; RNG draws remain zero.
There is no no-combat movement and no no-combat oracle refresh.

## Quartet — verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit 0.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .


C:\Users\cdwas\Documents\Programming\BighornAnimation\.claude\conversion-ceiling-probe.mjs
  24:7  error  'm' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\cdwas\Documents\Programming\BighornAnimation\.claude\core-pursuer-ammo-probe.mjs
  20:7  error  'm' is assigned a value but never used  @typescript-eslint/no-unused-vars

C:\Users\cdwas\Documents\Programming\BighornAnimation\.claude\melee-close-probe.mjs
  31:7  error  'SIDE' is assigned a value but never used  @typescript-eslint/no-unused-vars
  32:7  error  'm' is assigned a value but never used     @typescript-eslint/no-unused-vars

✖ 4 problems (4 errors, 0 warnings)
```

Exit 1. All four errors pre-exist at starting HEAD in three untouched preserved
measurement probes. They are not relabeled green and were not modified outside
the frozen one-gate scope.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=15044.2ms timings=14586.5,15044.2,17049.1 pathfind={"calls":153,"expandedNodes":12633827,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 95606ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  32748ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  15586ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  29829ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"},"sameB":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"},"different":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"b36d9fa9"}}

 ✓ engine/tests/gates.test.ts (6 tests) 71030ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  17334ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  29698ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 59210ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  42597ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=165.20ms baseline=6116.98ms sweep=5938.88ms spottingOverhead=-2.91%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=30 orders=26 activations=3 leaderDeaths=1

 ✓ tests/m3b-gates.test.ts (3 tests) 48713ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 16652ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  16398ms
stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON
[gate] G1 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":939.2357514637081,"renoHill":1034.959347093062,"fordA":957.904810237618,"weirPoint":1041.7486488377403,"sharpshooterRidge":1038.9672878067122}
[gate] G2 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target
[gate] G4 PASS blockedAt=489.77m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance
[gate] G5 PASS samples=100 tolerance=0.05m

 ✓ tests/terrain-gates.test.ts (5 tests) 194ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

 ✓ tests/data-integrity.test.ts (13 tests) 159ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 180ms
 ✓ engine/tests/unit.test.ts (3 tests) 132ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 39ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 23ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 26ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 24ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 21ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 20ms
 ✓ engine/tests/variants.test.ts (3 tests) 15ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 8ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 6ms

 Test Files  18 passed (18)
      Tests  105 passed (105)
     Errors  1 error
   Start at  16:53:12
   Duration  301.02s (transform 727ms, setup 0ms, collect 1.91s, tests 292.06s, environment 4ms, prepare 2.20s)

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯
```

Exit 1 after **18/18 files and 105/105 assertions passed**, because Vitest
reported the known worker-RPC `onTaskUpdate` timeout after the serial run. The
assertion result is green; the process exit is not relabeled green.

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -p tsconfig.engine.json && tsc -b && node scripts/prepare-app-assets.mjs && next build

  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/4) ...
   Generating static pages (1/4)
   Generating static pages (2/4)
   Generating static pages (3/4)
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    76 kB           163 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB


○  (Static)  prerendered as static content
```

Exit 0.

`npm run terrain` was never run.

## `[CAL]` and protected-content byte audit

The expected working changes are the one-line engine gate, the named test,
the documented combat-pin refresh, generated score/envelope reports,
measurement artifacts, and this report. Every protected file below has the
same Git blob at HEAD and in the working tree:

| Protected file | HEAD/current blob |
|---|---|
| `engine/src/combat-config.ts` | `8f8adb5cedc2685708bfae8b9c076c6d1cf7c837` |
| `engine/src/combat.ts` | `4c4b4e0498e70cc2f47a209d98dafcd95cea0d01` |
| `engine/src/engagement.ts` | `6fabf5fe3021fbac908090116791a7c86cb92c39` |
| `engine/src/events.ts` | `3827cde43da6b32a186ef5ea1b8230ab8d1eadbb` |
| `engine/src/movement.ts` | `9bd486b6e40df1e762a63401e3d5d923eb35e3ae` |
| `engine/src/state.ts` | `bbd11435bf4c01a54b654ee3f9701bb300b15c09` |
| `engine/src/camp-defense.ts` | `86aaf9d0d2d4c5f7726a7ff011dc53b6f99621dc` |
| `engine/src/ammunition.ts` | `1e62981b9fc53ecb4ec181d45bc32b2383819555` |
| `engine/src/spotting.ts` | `8c889c2adec0f345c73bf2e7e65b1afbe9614654` |
| Scenario JSON | `11db18bd727ae93a4460b146a7300b3f34909241` |
| Scenario README | `dee0cd99f12b1872e0cc23e78387c87500d0c47f` |
| `docs/PREDICTIONS.md` | `d083af760f4072c77044c2c151fa992ea6e3420b` |
| `codex-report-wo-d102.md` | `3f121804e50deaf974255b8cdcd0d32999fd2cb1` |
| `codex-report-wo-d103.md` | `014dae6ab037bebc25a35ea7c7297bbab1f56e7c` |
| `codex-report-wo-d104.md` | `92c58545313c071f09627a3dc05399ac599d4565` |
| `codex-report-wo-d105.md` | `298d4ecde1eb277fbc1f2a07dcda159d03549d93` |

Scenario SHA-256 values:

```text
scenario.json E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8
README.md     10B53B4AB47261B7389E15F87A0C7C41308C66E8F027C90545ED0CA724092B46
```

The F4 assertion block has identical before/after SHA-256
`29e682b4f5d0c79b9c5ddc1eee9b6a5a24f3d73df8b244468347217ca22fefa2`.
Only the separate F1/F6 combat pins and their cause comments changed in that
test file.

`git diff --name-only` across scenario, predictions, prior reports, and the
protected engine mechanisms is empty. The source/config audit likewise finds
no changed numeric/config source other than the authorized `morale.ts` gate
and combat-pin test. Therefore all `[CAL]` values and tags are byte-identical.

Protected results already established by the campaign:

- scenario stream `ba288f09` in 50/50 rows;
- no scenario or terrain generation command ran;
- no `[CAL]` number, config field, or tagged value was edited;
- the F4 assertion remains C/E/F/I/L destroyed and co-d alive; the baseline
  passes it;
- `docs/PREDICTIONS.md`, prior codex reports, and D93–D105 mechanism sources
  have no diff.

## AMBIGUITIES

No implementation ambiguity required a `TODO-AMBIGUOUS` marker or stop. The
gate subject, placement, pursuit kinds, release behavior, and declined ordered
scope are explicit in the frozen work order.

The reopen clause does not supply a numeric definition of "sustained." No
classification or behavioral decision was required to execute the work order:
the instrument reports every maximal contiguous window, its exact duration,
closeness advantage, and whether it crosses the ruled D92 switch margin. This
preserves the evidence for adjudication without inventing a threshold.

## DEVIATIONS

- The frozen preview is not merely near-digit-exact; every preserved per-seed
  Reno/coalition value and every aggregate is exact.
- The registered broad starvation signature is present: 483 windows, longest
  71 minutes. The stronger D92 switch-eligible signature is absent at 0 ticks.
  This is reported, not repaired.
- The first focused M4-A refresh used the standalone probe's 155 whole-create
  count. The historical gate excludes two initialization calls and measured
  153; the pin was corrected to that unchanged protocol. No engine behavior
  changed.
- The standard before/after envelope commands exit nonzero only after writing
  complete N=50 reports because the existing criteria select no typical seed.
- Wing completion remains low (9/50), bouts remain all-break (634/634), and
  the empty outcome branches were not tuned.
- No calibration change, scenario change, F4 roster edit, result-driven
  tuning, commit, or push occurred.
