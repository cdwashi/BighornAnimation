# WO-D111 Execution Report — COMPLETED AFTER THREE ADJUDICATED STOPS

## Final outcome

**COMPLETE.** WO-D111 break 1 completed on accepted stream **`8e28552c`** with all 50
registered seeds. Amendment 3's resumed tripwire did not fire: seed 18760627 reproduced the
stopped prefix at Reno killed 135 and completed at the same 135; seeds 18760628–18760649
produced no new ≥100 seed, and only seed 18760627 finished above 60.

- Resume HEAD: `1432fb7`
- Original stream: `ba288f09`
- Accepted stream: **`8e28552c`**
- Completed campaign: **50/50**
- Post-acceptance scenario edits: **zero**
- Commit/push: **none**
- Staging: **untouched and empty**

## Preserved STOP history 1 — editor-time byte locus

The first scenario patch changed
`campDefense.turnoutDelayMinutes.provenance.confidence` instead of the Bench confidence.
Codex stopped rather than self-correct under the original one-break language. Amendment 1
ruled that an unobserved editor-time correction is not an accepted break. The intermediate
`9994ffa6` was discarded without engine execution.

## Preserved STOP history 2 — payload assertion

After stream acceptance, `engine/tests/d91-gates.test.ts` still asserted the obsolete Bench
confidence `MEDIUM`. Codex stopped rather than update a red test without authority.
Amendment 2 classified that single assertion as a payload pin because D101 had ruled `LOW`
before D111. The coordinate and turnout-delay guards remained untouched.

## Preserved STOP history 3 — campaign tripwire

The original campaign halted at seed `18760627`, tick `1515`, minute `757.5`, when Reno
A/G/M killed reached **135**, firing the registered any-≥100 branch. Codex preserved the
partial tree and did not diagnose, rerun, or tune. Amendment 3 adjudicated that fire and
required seed 627 to complete first, followed by 628–649 under a fully re-armed tripwire.

The deterministic rerun reproduced the stopped prefix exactly. Seed 627 completed at **135**,
so no new post-tick-1515 Reno number surfaced.

## Editor-time disclosure

| ordinal | hash | disposition |
|---:|---|---|
| 1 | `9994ffa6` | discarded, never observed; wrong confidence byte locus |
| 2 | `8e28552c` | frozen semantic payload exact; accepted by D110 engine-pin execution |

Two editor-time states; one discarded intermediate.

## Verification

- Frozen semantic payload against HEAD: exact five-edit payload; no other scenario semantic change.
- Scenario: valid JSON, BOM-free, CR-free, 44 `§` characters.
- D110 pins: **GREEN 3/3**; pin (b) exactly `scenario-bench`; pin (c) consumes none of the foothill IDs.
- Repository index-byte gate: **GREEN**.
- D108 lip tests: **GREEN and untouched**.
- Result structure: 50 exact registered seeds, 50 complete outcomes, all stream `8e28552c`,
  seed 627 final 135, no fresh stop, full ground/valley cardinalities.
- Post-campaign pins/gate/lip verification: **GREEN 9/9**.
- Full-suite assertions before campaign: **119/119 passed**; the post-pass Vitest RPC anomaly
  is disclosed under Deviations.

## PR-57..63 — computed results, adjudication reserved

| registration leg | result |
|---|---|
| PR-57 — one accepted break | **HIT** — accepted stream `8e28552c`; one disclosed unobserved intermediate; cause-documented oracle refreshes; stop remained live |
| PR-58(a) — composite median exactly 57.6282% | **HIT** — 57.628205% |
| PR-58(b) — mean 56.15% ±1.02 pp | **HIT** — 56.717949%, inside 55.13–57.17% |
| PR-58(c), C1 median 0.5 | **HIT** — 0.5000 |
| PR-58(c), C2 median 6/9 | **HIT** — 0.6667 |
| PR-58(c), C3 median 5/13 | **HIT** — 0.3846 |
| PR-58(c), C4 median 12/13 | **HIT** — 0.9231 |
| PR-59 — derivation invariance | **HIT** — 85 cells / 260 m / maximum gap 10 m / minimum 51 m / 85 WEST; byte-identical; SHA-256 `d540f257b4518c0db7b3e869588b46fc220d80612ed998ef0f09983364a5379b` |
| PR-60 — landmark inertness | **HIT** — pin (c) green; foothill IDs absent from consumed set |
| PR-61(a) — zero east-side Reno annihilations | **MISS** — one east-side Reno annihilation |
| PR-61(b) — registered stop | **OBSERVED AND ADJUDICATED** — seed 627 reached 135; no fresh resumed tripwire |
| PR-61(c) — watch counters | **OBSERVATION, NO THRESHOLD** — 63 closing / 67 opening / 0 stationary; 213 strandings |
| PR-62 — N=50 re-baselines | **HIT (completion leg)** — envelope, ground-pressure, and valley-range baselines completed |
| PR-63(a) — F4 on envelope | **HIT (evaluation leg)** — 29/50 complete-wing; baseline seed green |
| PR-63(b) — unchanged D80 return | **HIT (execution leg)** — selected seed 18760621; five candidates |
| Amendment 3 — completed envelope worse than partial | **MISS** — both medians 57.628205% |

MISS results are report-only. No bisect, diagnosis, probe, tuning, or rerun followed.

PR-61(a)'s row: seed 18760629, tick 1604, unit co-m, destruction position
(8339.68, 11112.11), EAST. No diagnosis is offered.

## Complete envelope distribution

| statistic | composite | C1 | C2 | C3 | C4 |
|---|---:|---:|---:|---:|---:|
| min | 43.5256% | 0.5000 | 0.2222 | 0.1538 | 0.9231 |
| p25 | 54.8504% | 0.5000 | 0.5556 | 0.3846 | 0.9231 |
| median | 57.6282% | 0.5000 | 0.6667 | 0.3846 | 0.9231 |
| p75 | 60.4060% | 0.5000 | 0.7778 | 0.3846 | 0.9231 |
| max | 63.1838% | 0.5000 | 0.8889 | 0.3846 | 0.9231 |
| mean | 56.7179% | 0.5000 | 0.6533 | 0.3615 | 0.9231 |

Pure-reseed deltas from D108: median **0.0000 pp**; mean **+0.5641 pp**; all component
medians **0**. Composite min −3.8462 pp, p25 +1.9231 pp, p75 +2.7778 pp, max 0.0000 pp.

### Per-seed envelope

| seed | composite | C1 | C2 | C3 | C4 | Reno killed | F4 roster |
|---:|---:|---:|---:|---:|---:|---:|---|
| 18760600 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 26 | yes |
| 18760601 | 54.8504% | 0.500000 | 0.555556 | 0.384615 | 0.923077 | 36 | no |
| 18760602 | 49.2949% | 0.500000 | 0.333333 | 0.384615 | 0.923077 | 31 | no |
| 18760603 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 20 | yes |
| 18760604 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 21 | yes |
| 18760605 | 55.7051% | 0.500000 | 0.666667 | 0.307692 | 0.923077 | 43 | no |
| 18760606 | 52.0726% | 0.500000 | 0.444444 | 0.384615 | 0.923077 | 26 | no |
| 18760607 | 52.0726% | 0.500000 | 0.444444 | 0.384615 | 0.923077 | 32 | no |
| 18760608 | 55.7051% | 0.500000 | 0.666667 | 0.307692 | 0.923077 | 26 | no |
| 18760609 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 26 | no |
| 18760610 | 55.7051% | 0.500000 | 0.666667 | 0.307692 | 0.923077 | 30 | no |
| 18760611 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 33 | yes |
| 18760612 | 54.8504% | 0.500000 | 0.555556 | 0.384615 | 0.923077 | 32 | no |
| 18760613 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 36 | yes |
| 18760614 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 27 | yes |
| 18760615 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 23 | yes |
| 18760616 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 33 | yes |
| 18760617 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 36 | yes |
| 18760618 | 52.0726% | 0.500000 | 0.444444 | 0.384615 | 0.923077 | 29 | no |
| 18760619 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 23 | yes |
| 18760620 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 24 | yes |
| 18760621 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 25 | yes |
| 18760622 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 35 | yes |
| 18760623 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 36 | yes |
| 18760624 | 58.4829% | 0.500000 | 0.777778 | 0.307692 | 0.923077 | 39 | no |
| 18760625 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 34 | yes |
| 18760626 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 33 | yes |
| 18760627 | 43.5256% | 0.500000 | 0.333333 | 0.153846 | 0.923077 | 135 | no |
| 18760628 | 58.4829% | 0.500000 | 0.777778 | 0.307692 | 0.923077 | 28 | no |
| 18760629 | 56.5598% | 0.500000 | 0.777778 | 0.230769 | 0.923077 | 54 | yes |
| 18760630 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 27 | yes |
| 18760631 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 31 | yes |
| 18760632 | 61.2607% | 0.500000 | 0.888889 | 0.307692 | 0.923077 | 30 | yes |
| 18760633 | 50.1496% | 0.500000 | 0.444444 | 0.307692 | 0.923077 | 37 | no |
| 18760634 | 63.1838% | 0.500000 | 0.888889 | 0.384615 | 0.923077 | 31 | yes |
| 18760635 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 39 | yes |
| 18760636 | 60.4060% | 0.500000 | 0.777778 | 0.384615 | 0.923077 | 30 | yes |
| 18760637 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 21 | yes |
| 18760638 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 29 | yes |
| 18760639 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 25 | yes |
| 18760640 | 44.5940% | 0.500000 | 0.222222 | 0.307692 | 0.923077 | 37 | no |
| 18760641 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 27 | yes |
| 18760642 | 54.8504% | 0.500000 | 0.555556 | 0.384615 | 0.923077 | 26 | no |
| 18760643 | 54.8504% | 0.500000 | 0.555556 | 0.384615 | 0.923077 | 24 | no |
| 18760644 | 52.0726% | 0.500000 | 0.444444 | 0.384615 | 0.923077 | 30 | no |
| 18760645 | 54.8504% | 0.500000 | 0.555556 | 0.384615 | 0.923077 | 30 | no |
| 18760646 | 55.7051% | 0.500000 | 0.666667 | 0.307692 | 0.923077 | 26 | no |
| 18760647 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 29 | yes |
| 18760648 | 57.6282% | 0.500000 | 0.666667 | 0.384615 | 0.923077 | 28 | yes |
| 18760649 | 52.9274% | 0.500000 | 0.555556 | 0.307692 | 0.923077 | 42 | no |

## Amendment 3 registered prediction

**MISS.** Completed median 57.628205%;
partial median 57.628205%. No diagnosis or rerun.

## Approach-vector table — all annihilations

Derived count: **63 closing,
67 opening,
0 stationary; 130 total**.
Positions are at the destruction tick. No corpse-drift or STEADY-shelter probe was run.

| seed | tick | unit | destruction position (x, y) | channel | belligerent side | nearest eligible friendly | distance (m) | last movement tick | approach |
|---:|---:|---|---|---|---|---|---:|---:|---|
| 18760600 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760600 | 1716 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760601 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760601 | 1720 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760601 | 1784 | co-f | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1755 | opening |
| 18760602 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760603 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760603 | 1766 | co-e | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7631.31 | 1746 | opening |
| 18760604 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760604 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760604 | 1754 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1724 | opening |
| 18760605 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760605 | 1710 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760606 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760607 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760608 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760608 | 1720 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760609 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760609 | 1780 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1760 | opening |
| 18760609 | 1803 | co-f | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1760 | opening |
| 18760610 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760610 | 1710 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760610 | 1785 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1761 | closing |
| 18760611 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760611 | 1716 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760611 | 1766 | co-e | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7631.31 | 1745 | opening |
| 18760612 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760613 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760613 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760613 | 1756 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1724 | opening |
| 18760614 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760614 | 1724 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760614 | 1777 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-d | 661.50 | 1760 | closing |
| 18760614 | 1783 | co-f | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1760 | closing |
| 18760615 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760615 | 1707 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760615 | 1709 | co-e | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1663 | opening |
| 18760615 | 1757 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1723 | opening |
| 18760616 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760616 | 1761 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1727 | opening |
| 18760617 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760617 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760617 | 1756 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1724 | opening |
| 18760618 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760619 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760619 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760620 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760620 | 1716 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760620 | 1763 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1731 | opening |
| 18760620 | 1765 | co-e | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7592.08 | 1745 | opening |
| 18760620 | 1767 | co-f | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7665.12 | 1745 | opening |
| 18760621 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760621 | 1715 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760621 | 1717 | co-e | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1663 | opening |
| 18760621 | 1754 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1730 | opening |
| 18760622 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760622 | 1764 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7551.69 | 1733 | opening |
| 18760623 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760623 | 1759 | co-f | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1738 | opening |
| 18760624 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760624 | 1781 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1760 | opening |
| 18760625 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760625 | 1785 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1761 | opening |
| 18760626 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760626 | 1769 | co-f | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7744.06 | 1746 | opening |
| 18760627 | 1497 | co-m | (6951.47, 10965.34) | WEST | us-7th-cavalry | co-h | 892.60 | 1497 | opening |
| 18760627 | 1510 | co-g | (6672.11, 11129.80) | WEST | us-7th-cavalry | co-h | 813.45 | 1510 | closing |
| 18760627 | 1515 | co-a | (6740.67, 11126.54) | WEST | us-7th-cavalry | co-d | 780.58 | 1515 | closing |
| 18760627 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760627 | 1720 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760628 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760628 | 1720 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760629 | 1604 | co-m | (8339.68, 11112.11) | EAST | us-7th-cavalry | crow-scouts | 1945.95 | 1594 | opening |
| 18760629 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760629 | 1720 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760629 | 1750 | co-e | (6840.05, 13164.49) | EAST | us-7th-cavalry | co-d | 725.16 | 1750 | closing |
| 18760630 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760630 | 1707 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760630 | 1709 | co-e | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1663 | opening |
| 18760630 | 1740 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1723 | opening |
| 18760631 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760631 | 1768 | co-f | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7705.16 | 1746 | opening |
| 18760632 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760632 | 1710 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760632 | 1777 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-d | 661.50 | 1761 | closing |
| 18760632 | 1779 | co-f | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1761 | closing |
| 18760632 | 1821 | co-c | (6970.05, 12758.33) | EAST | us-7th-cavalry | co-h | 749.97 | 1724 | closing |
| 18760633 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760634 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760634 | 1710 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760634 | 1777 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-d | 661.50 | 1760 | closing |
| 18760634 | 1779 | co-f | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1760 | closing |
| 18760635 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760635 | 1716 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760636 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760636 | 1717 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760636 | 1764 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7551.69 | 1732 | opening |
| 18760637 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760637 | 1766 | co-e | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7631.31 | 1746 | opening |
| 18760637 | 1768 | co-f | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7705.16 | 1746 | opening |
| 18760638 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760639 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760639 | 1707 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760639 | 1709 | co-e | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1663 | opening |
| 18760640 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760640 | 1719 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760641 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760641 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760641 | 1758 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1724 | opening |
| 18760642 | 1684 | co-i | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1633 | closing |
| 18760642 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760643 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760643 | 1715 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760643 | 1725 | co-e | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1663 | opening |
| 18760643 | 1727 | co-f | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1659 | opening |
| 18760644 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760645 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760646 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760646 | 1710 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760646 | 1740 | co-f | (5293.40, 15132.22) | EAST | us-7th-cavalry | co-d | 3216.07 | 1740 | closing |
| 18760646 | 1785 | co-d | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1695 | opening |
| 18760647 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760647 | 1708 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760647 | 1758 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7510.07 | 1724 | opening |
| 18760648 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760648 | 1715 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760648 | 1766 | co-c | (6624.08, 20005.57) | EAST | us-7th-cavalry | co-d | 7631.31 | 1730 | opening |
| 18760649 | 1684 | co-l | (5348.70, 15871.71) | EAST | us-7th-cavalry | co-e | 1004.85 | 1637 | closing |
| 18760649 | 1721 | co-i | (4627.86, 16571.80) | EAST | us-7th-cavalry | co-d | 4783.49 | 1692 | opening |
| 18760649 | 1778 | co-e | (7162.15, 12514.80) | EAST | us-7th-cavalry | co-h | 706.99 | 1756 | opening |

## Switch-to-nothing stranding frequency

**213 transitions across 48/50 seeds.**

| held feature / threat transition / camp | transitions |
|---|---:|
| `scenario-bench / co-g->co-e / minneconjou-camp` | 126 |
| `scenario-bench / co-a->co-c / minneconjou-camp` | 36 |
| `scenario-bench / co-a->co-e / minneconjou-camp` | 15 |
| `scenario-bench / co-m->co-e / minneconjou-camp` | 15 |
| `scenario-bench / co-a->co-f / minneconjou-camp` | 6 |
| `scenario-bench / co-c->co-e / minneconjou-camp` | 3 |
| `scenario-bench / co-e->co-f / minneconjou-camp` | 3 |
| `scenario-bench / co-h->co-c / cheyenne-camp` | 3 |
| `scenario-bench / co-h->co-c / minneconjou-camp` | 3 |
| `scenario-bench / co-m->co-c / sans-arc-camp` | 3 |

## F4 envelope and D80 return

F4 held in **29/50** seeds. Baseline seed 18760625 remained green:
C/E/F/I/L destroyed and co-d alive.

Unchanged D80 criteria selected **seed 18760621**. Candidates:
`18760621`, `18760631`, `18760638`, `18760647`, `18760648`. Criteria SHA-256:
`507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad`.

## D111 baseline — ground pressure

| ground | global peak | peak unassigned | peak min/median/max | mean | seeds >0 | nonzero ticks |
|---|---:|---:|---|---:|---:|---:|
| bench-r30 | 160 | 0 | 158/160/160 | 159.72 | 50/50 | 59 |
| bench-r60 | 160 | 159 | 158/160/160 | 159.72 | 50/50 | 87 |
| substrate-timber-0001 | 0 | 0 | 0/0/0 | 0.00 | 0/50 | 0 |
| substrate-timber-0002 | 0 | 0 | 0/0/0 | 0.00 | 0/50 | 0 |
| substrate-timber-0003 | 0 | 0 | 0/0/0 | 0.00 | 0/50 | 0 |

D108 comparable bench-r30: median 160, mean 159.72, maximum 160. D111 bench-r30:
median 160, mean 159.72,
maximum 160. Timber stayed zero. The r60 unassigned peak
159 is part of the new baseline.

## D111 baseline — valley range

Values are min/p25/median/p75/max metres; each band has 150 observations.

| band | open n | open distribution | first-fire n | first-fire distribution |
|---|---:|---|---:|---|
| blackfeet-santee-pool | 150 | 677/677/681/683/683 | 150 | 563/563/569/572/572 |
| crow-king-band | 150 | 613/613/620/623/623 | 150 | 457/457/463/467/467 |
| gall-band | 150 | 613/613/620/623/623 | 150 | 457/457/463/467/467 |
| hunkpapa-pool | 150 | 613/613/620/623/623 | 150 | 457/457/463/467/467 |
| minneconjou-pool | 150 | 667/667/668/670/670 | 150 | 551/551/560/563/563 |
| sans-arc-pool | 150 | 642/642/644/652/652 | 150 | 532/532/537/542/542 |

Pooled first-fire: n=900, min=456.98 m,
p25=463.13 m, median=466.63 m,
p75=560.03 m, max=572.24 m.
Engagement-open minute median: 710.5.

Promoted completed baselines:

- `reports/d111-ground-pressure-census.json`
- `reports/d111-ground-pressure-census.md`
- `reports/d111-valley-range.json`
- `reports/d111-valley-range.md`

## Files touched — exact

- `data/scenarios/little-bighorn-1876/scenario.json`
- `app/battle-map.tsx`
- `engine/tests/d91-gates.test.ts`
- `engine/tests/m4a-gates.test.ts`
- `scripts/d111-campaign.mjs`
- `scripts/d111-campaign-resume.mjs`
- `reports/d111-campaign-progress.json`
- `reports/d111-campaign-results.json`
- `reports/d111-ground-pressure-census.json`
- `reports/d111-ground-pressure-census.md`
- `reports/d111-valley-range.json`
- `reports/d111-valley-range.md`
- `codex-report-wo-d111.md`

No engine-source file, scenario byte after acceptance, test byte during Amendment 3, history
row, prediction row, hook, historical result, or prior report changed. `dist/` is ignored.

## AMBIGUITIES

None. Amendments 1–3 resolve the editor-time break, approach predicate/schema/scope,
payload-pin class, gate staging, artifact naming, hash-pin scope, stop adjudication, resume
order, and resumed tripwire.

## Deviations

- Initial full-suite execution exceeded its five-minute outer timeout. Later runs reported
  119/119 assertions passed, but Vitest twice emitted an `onTaskUpdate` RPC timeout after all
  assertions were green. No assertion was red and no test changed in response.
- Task 3's first visible failures masked later values in the same F3/F6 stream-specific oracle
  surfaces. Those pins refreshed once with the required D31a cause; behavioral ceilings stayed
  untouched.
- Amendment 3 required a resume-only instrument because the stopped result lacked raw
  ground/valley samples for seeds 600–626. Their campaign rows were preserved; only their
  frozen ground/valley instruments were deterministically reconstructed after 627–649.
- No commit and no push were performed.

