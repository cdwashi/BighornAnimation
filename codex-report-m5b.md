# Codex Report — M5-B Calibration Pass

Date: 2026-07-22  
Starting HEAD: `367c9ad`  
Status: **STOP FINDINGS AFTER D84/D85 RESTART — round 2 reverted**

## Outcome

The round-0 STOP remains valid history. D84/D85 lifted that suspension and
authorized the only source-data changes: Reno's MOVE/watering/CHARGE phases and
Bloody Knife's ordinary leader record. Calibration restarted at round 1.

The pass cannot reach G-M5-1/2/4/5 with the current mechanisms:

- Ford A improved from −95.0 to **−69.5 minutes**, still outside ±25; D84 says
  STOP that item only pending a separate Chuck closure ruling.
- Round 2 tested documented/derived global intensity rails. A/G/M routed in
  50/50 seeds, but only through an all-or-none path that annihilated Reno's
  companies, changed Arikara losses from 0 to a median 37 rather than 3, left
  the ford choke empty, produced no Bloody Knife death, worsened C2/C3, and
  moved wing destruction later. The round was reverted.
- This is the D82 mechanism finding required by the work-order rider. No
  per-unit/event/checkpoint values, scripted death, exposure special case,
  tolerance change, or further data edit was made.

The append-only detailed trail is in `reports/calibration-audit.md`.

## Per-round audit

| Round | State/moves | C1 | C2 | C3 | C4 | Composite | Disposition |
|---:|---|---:|---:|---:|---:|---:|---|
| 0 | pre-ruling starting line; no moves | 40.00% | 88.89% | 38.46% | 92.31% | 59.68% | D79.5 STOP |
| 1 | D84/D85 post-ruling measurement; no CAL moves | 40.00% | 77.78% | 38.46% | 92.31% | 56.91% | Ford item STOP; continue |
| 2 | seven global intensity/recovery CAL moves | 40.00% | 55.56% | 15.38% | 92.31% | 45.58% | REVERTED; mechanism STOP |
| Final | round-1 CAL values restored | 40.00% | 77.78% | 38.46% | 92.31% | 56.91% | STOP findings |

Round-2 candidate N=50 median was 48.36%; A/G/M and Arikara routed 50/50;
Arikara killed distribution was 0/0/37/37/37; complete wing destruction was
48/50 at 855.0–965.5 minutes. C4 remained passing, but C2/C3 and the composite
fell sharply. No candidate move was banked.

## D82 verdicts

1. **“(a) A/G/M reach BROKEN on the timber→river leg in a meaningful seed fraction” — RANGE TEST YES, FINAL BASELINE NO.** The round-2 candidate produced all three in 50/50, including seed 18760625 transitions at minutes 731.5–736.5. The candidate was reverted because the same path annihilated the battalion and broke other gates.
2. **“(b) ford-choke dead shift to broken troopers” — NO.** The table remained empty both before and at the legal intensity extreme.
3. **“(c) Bloody Knife death appears in the envelope” — NO.** D85 made the prediction possible without scripting, but ordinary exposure produced 0/50 deaths at baseline and 0/50 at the tested extreme.

## Final CAL values and ranges

Every accumulated family and its unchanged disposition is tabulated in full in
`reports/calibration-audit.md`. The seven moved values were reverted:

| CAL | Final | Cited/derived range |
|---|---:|---|
| combatFrictionFactor | .06 | [.05,.10], M4-A 10–20× historical-total reduction |
| moraleCasualtyDrain | 70 | [50,100], normalized total-loss derivation |
| moraleSuppressionDrain | .08 | [0,1], clamped suppression derivation |
| moraleFlankedDrain | 1.2 | [0,5], binary per-tick derivation |
| moraleLullRecovery | .18 | [0,.18], zero-to-M4-A starting scale |
| moraleFriendlyRecovery | .12 | [0,.12], zero-to-M4-A starting scale |
| moraleLeaderRallyScale | .004 | [0,.004], zero-to-M4-A starting scale |
| US killed:wounded ratio | 5.153846 | [3.916667,6.333333], D81/scenario rails |
| coalition killed:wounded ratio | .375 | [.155,3], D81 DISPUTED rails |

Proposed-flagged values not moved remain UNRANGED rather than receiving
post-STOP invented rails. Spec-given low-ammo fraction .2 and march spacing
150 m remain fixed singleton values.

## G-M5-5 debts

- The production observation exam is already the 13-event gateable exam,
  including both promoted Crow's Nest rows: 12/13 = 92.3%, green.
- F6 is already work-metric-primary. Final verification reports calls,
  expanded nodes, allocations, and informational wall time.
- Arikara digit remains STOPPED: withdrawal thresholds cannot turn zero
  baseline exposure into three casualties; the intensity extreme jumps to
  terminal 37 killed.

## AMBIGUITIES

1. `reno-water` issue minute 670 is a D84 reconstruction: Reno's existing
   five-minute delay makes the HOLD effective at sourced minute 675.
2. “Meaningful seed fraction” remains numberless. The tested result was 50/50,
   so no threshold choice affects its adjudication.
3. The D80 rout table records ROUTED events, while D82(a) says BROKEN. The
   round-2 event trail contains both states; no reporting-mechanism change was
   used to manufacture a pass.
4. Ford-choke radius remains the pre-existing proposed 250 m extraction radius.

## Deviations

- D84/D85 changed the deterministic full-state hash from `7f00bd23` to
  `1110335c`; the two pinned prior-gate expectations were updated.
- A stale M5-A envelope sentence claiming Bloody Knife was absent was corrected
  to describe D85. This changes report text only, not simulation behavior.
- No post-ruling calibration value was retained.
- No commit or push was made.

## STOPs

- Ford A item: −69.5-minute residual, pending Chuck closure.
- D82: global legal rails cannot yield a broken-but-surviving Reno battalion,
  ford-choke shift, and emergent Bloody Knife death together.
- D75 Arikara digit: zero-exposure-to-terminal-loss discontinuity requires
  mechanism adjudication, not threshold tuning.
- G-M5-1/G-M5-2 therefore remain red; C1/C2/C3 and four historical-envelope
  checks do not pass.

## Final scorecard in full

# Calibration Scorecard

- Scenario: `little-bighorn-1876`
- Seed: `18760625`
- Variants: `baseline`
- Review tier: **baseline**
- Counterfactual provenance flag: **no**
- Composite: **56.91%**
- Composite gates: **FAIL**

| Component | Weight | Included score | Gate |
|---|---:|---:|---|
| C1 Checkpoints | 0.35 | 40.00% | FAIL â€” HIGH 25.0% â‰¥ 70%; overall 40.0% â‰¥ 50% |
| C2 Casualties | 0.25 | 77.78% | FAIL â€” both killed/wounded side bands and every flagship end-state exact |
| C3 End states | 0.25 | 38.46% | FAIL â€” 100% of HIGH-confidence assertions by their minute |
| C4 Observations | 0.15 | 92.31% | PASS â€” 92.3% â‰¥ 80% of HIGH/MEDIUM events |

> Composite gate status is the conjunction of C1â€“C4; no minimum weighted-number gate is invented.
> TODO-AMBIGUOUS(M5-A): `HOLDING_AT` has no schema tolerance. One global proposed [CAL] radius of 250 m is used.

## C1 â€” Checkpoints

Gate: **FAIL** â€” HIGH 25.0% â‰¥ 70%; overall 40.0% â‰¥ 50%.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| cp-scouts-crows-nest | LOW | included | â‰¤1000 m and Â±40 min | 0.0 m, 0.0 min | PASS |
| cp-reno-ford-a | MEDIUM | included | â‰¤150 m and Â±25 min | 0.0 m, -69.5 min | FAIL |
| cp-reno-skirmish-line | MEDIUM | included | â‰¤300 m and Â±25 min | 515.2 m, 67.5 min | FAIL |
| cp-reno-timber | MEDIUM | included | â‰¤200 m and Â±25 min | 1447.7 m, 37.5 min | FAIL |
| cp-reno-hill | HIGH | included | â‰¤50 m and Â±15 min | 0.0 m, 42.5 min | FAIL |
| cp-yates-ford-b | MEDIUM | included | â‰¤150 m and Â±25 min | 9.3 m, 17.5 min | PASS |
| cp-right-wing-calhoun | HIGH | included | â‰¤50 m and Â±15 min | 0.0 m, 23.5 min | FAIL |
| cp-keogh-sector | HIGH | included | â‰¤75 m and Â±15 min | 415.6 m, -8.5 min | FAIL |
| cp-custer-last-stand | HIGH | included | â‰¤30 m and Â±15 min | 0.0 m, -10.5 min | PASS |
| cp-weir-point | MEDIUM | included | â‰¤100 m and Â±25 min | 0.0 m, -17.5 min | PASS |

## C2 â€” Casualties

Gate: **FAIL** â€” both killed/wounded side bands and every flagship end-state exact.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| us-7th-cavalry:killed | HIGH | included | 235.0â€“285.0 | 206 | FAIL |
| us-7th-cavalry:wounded | HIGH | included | 45.0â€“60.0 | 39 | FAIL |
| lakota-cheyenne-coalition:killed | DISPUTED | included | 31.0â€“300.0 | 54 | PASS |
| lakota-cheyenne-coalition:wounded | DISPUTED | included | 100.0â€“200.0 | 152 | PASS |
| flagship:co-c | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-e | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-f | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-i | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-l | HIGH | included | DESTROYED exactly | DESTROYED | PASS |

## C3 â€” End states

Gate: **FAIL** â€” 100% of HIGH-confidence assertions by their minute.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| co-c:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-e:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-f:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-i:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-l:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-a:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-g:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-m:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-h:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-d:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-k:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-b:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 3966.1 m from reno-hill | FAIL |
| pack-train:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |

## C4 â€” Observations

Gate: **PASS** â€” 92.3% â‰¥ 80% of HIGH/MEDIUM events.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| obs-scouts-pony-herd | MEDIUM | included | seen | seen | PASS |
| obs-custer-crows-nest-haze | MEDIUM | included | unseen | unseen | PASS |
| obs-warriors-divide-column | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-hunkpapa | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-oglala | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-minneconjou | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-sans-arc | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-mixed-north | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-cheyenne | MEDIUM | included | unseen | unseen | PASS |
| obs-custer-weir-village | DISPUTED | excluded-confidence | seen | unseen | FAIL |
| obs-village-reno-advance | HIGH | included | seen | seen | PASS |
| obs-cheyenne-custer-column | MEDIUM | included | seen | unseen | FAIL |
| obs-reno-hill-volleys | MEDIUM | included | unseen | unseen | PASS |
| obs-weir-custer-field | MEDIUM | included | seen | seen | PASS |

## Final N=50 envelope in full

# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **18760604**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **56.91%**
- Eligible no-rare-event candidates: **11** (18760604, 18760605, 18760607, 18760610, 18760611, 18760625, 18760629, 18760631, 18760636, 18760647, 18760648)
- Rule: composite percentile 0.4â€“0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 45.79% | 56.91% | 56.91% | 56.91% | 59.68% | 56.68% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% |
| C2 | 33.33% | 77.78% | 77.78% | 77.78% | 88.89% | 77.33% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 38.46% | 38.00% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 20 | 40.0% |
| 1 | 20 | 40.0% |
| 2 | 7 | 14.0% |
| 3 | 2 | 4.0% |
| 4 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| lame-white-man | 8 | 16.0% |
| two-moons | 8 | 16.0% |
| keogh | 7 | 14.0% |
| crow-king | 5 | 10.0% |
| yates | 4 | 8.0% |
| crazy-horse | 3 | 6.0% |
| gall | 2 | 4.0% |
| reno | 2 | 4.0% |
| calhoun | 1 | 2.0% |
| custer | 1 | 2.0% |
| french | 1 | 2.0% |
| moylan | 1 | 2.0% |
| weir | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| co-e | 48 | 96.0% |
| co-f | 48 | 96.0% |
| lwm-band | 48 | 96.0% |
| co-d | 9 | 18.0% |
| cheyenne-pool | 1 | 2.0% |

## Wing-destruction distribution

- Complete wing destruction: **48/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 858.00 | 859.50 | 861.00 | 862.13 | 867.00 | 861.13 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, french, gall, keogh, lame-white-man, moylan, reno, two-moons, weir, yates |
| Arikara killed | NO | historical=3â€“3; observed=0â€“0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-d, co-e, co-f, lwm-band |
| Wing destruction minute | NO | historical=825â€“840; observed=858.0â€“867.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 56.91% | 3: keogh, two-moons, yates | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760601 | 45.79% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760602 | 56.91% | 1: gall | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760603 | 59.68% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1719 | none |
| 18760604 | 56.91% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1722 | none |
| 18760605 | 56.91% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1722 | none |
| 18760606 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760607 | 56.91% | 2: keogh, lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760608 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760609 | 56.91% | 1: gall | 0/0/0 | co-d, co-e, co-f, lwm-band | 1719 | none |
| 18760610 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760611 | 56.91% | 1: two-moons | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760612 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760613 | 54.98% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760614 | 56.91% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760615 | 56.91% | 2: lame-white-man, two-moons | 0/0/0 | cheyenne-pool, co-e, co-f, lwm-band | 1726 | none |
| 18760616 | 56.91% | 1: keogh | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760617 | 54.98% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1719 | none |
| 18760618 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760619 | 56.91% | 1: calhoun | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760620 | 56.91% | 2: crazy-horse, crow-king | 0/0/0 | co-e, co-f, lwm-band | 1726 | none |
| 18760621 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1717 | none |
| 18760622 | 56.91% | 1: custer | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760623 | 59.68% | 1: keogh | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760624 | 56.91% | 1: keogh | 0/0/0 | co-e, co-f, lwm-band | 1729 | none |
| 18760625 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760626 | 56.91% | 1: two-moons | 0/0/0 | co-e, co-f, lwm-band | 1732 | none |
| 18760627 | 56.91% | 1: crazy-horse | 0/0/0 | co-e, co-f, lwm-band | 1722 | none |
| 18760628 | 56.91% | 2: crow-king, keogh | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760629 | 56.91% | 1: two-moons | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760630 | 59.68% | 2: keogh, lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1722 | none |
| 18760631 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760632 | 56.91% | 2: moylan, two-moons | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760633 | 56.91% | 1: yates | 0/0/0 | co-e, co-f, lwm-band | 1722 | none |
| 18760634 | 56.91% | 1: reno | 0/0/0 | co-e, co-f, lwm-band | 1726 | none |
| 18760635 | 59.68% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760636 | 56.91% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760637 | 56.91% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760638 | 56.91% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760639 | 56.91% | 3: crow-king, french, two-moons | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760640 | 59.68% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760641 | 56.91% | 1: yates | 0/0/0 | co-e, co-f, lwm-band | 1716 | none |
| 18760642 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760643 | 45.79% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760644 | 56.91% | 2: crazy-horse, yates | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760645 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1730 | none |
| 18760646 | 57.76% | 4: lame-white-man, reno, two-moons, weir | 0/0/0 | co-d, co-e, co-f, lwm-band | 1719 | none |
| 18760647 | 56.91% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760648 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760649 | 56.91% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1734 | none |

## Final verification

Quartet: **GREEN**.

```text
typecheck: PASS
tests: 13 files passed; 75 tests passed
F6: median=6661.3ms; calls=164; expandedNodes=9733774; scratchAllocations=1; heapGrowths=3
V2: 12/13 (92.3%) PASS
V7: E5 table diff=none
V6: entries=29 orders=25 activations=3 leaderDeaths=1
build: PASS (Next.js static routes generated)
lint: PASS
```

The deterministic D84/D85 full-state hash is `1110335c`. The criteria hash
and generation-order evidence remain in the full envelope above. `git
diff --check` is clean. No commit or push was made.


## D86/D87 restart — rounds 3 and 4

This section supersedes earlier “final” labels while preserving rounds 0–2 as history.

D86 closed Ford A at **5.1 m, +0.5 minute** in the combat scorecard (**+2.5 minutes** movement-only). Order count is 26. D87 infiltration requires CONSENSUS_INITIATIVE command, a formed enemy, sufficient infiltration weight, and physical occupancy of a mapped cover polygon. Open grass gets no discount; per-position cover remains the exposure mechanism.

| Round | C1 | C2 | C3 | C4 | Composite | Disposition |
|---:|---:|---:|---:|---:|---:|---|
| 3 | 50.00% | 77.78% | 38.46% | 92.31% | 60.41% | D86/D87 baseline |
| 4 | 50.00% | 55.56% | 0.00% | 92.31% | 45.24% | REVERTED — gross inversion |
| Final | 50.00% | 77.78% | 38.46% | 92.31% | 60.41% | round 3 restored; STOP |

Round 3 N=50: median 60.41%, selected seed 18760603, wing destruction 44/50 at 857–868. Round 4: median 45.24%, A/G/M routed 50/50, Arikara killed 37/37 in every seed, near-global rout, ford choke empty, Bloody Knife 0/50, wing destruction 47/50 at 864.5–1071. Round 4 was reverted.

### D87 prediction verdicts

1. **(a) A/G/M break in 731–736, survive, and US killed returns to band — NO.** Round 3 has 0/50 breaks. Legal extremes break/rout units but do not yield three synchronized survivors; terminal annihilation follows.
2. **(b) Coalition deaths drop toward envelope — PARTIAL YES.** Round-3 lethal output falls and coalition K/W stay inside the broad DISPUTED bands.
3. **(c) Ford choke populates with broken troopers — NO.** Empty in both rounds.
4. **(d) Bloody Knife appears emergently — NO.** 0/50 in both rounds; no script or special case.
5. **(e) Wing fight shifts and stays in envelope — PARTIAL.** Completion improves to 44/50, but timing remains late at 857–868 versus 825–840. The rejected extreme shifts later.

### New CAL values and ranges

| CAL | Final | Range | Derivation |
|---|---:|---:|---|
| infiltrationAdoptionThreshold | 50 | [20,90] | D87; sourced US-to-warrior weights |
| infiltrationKillMultiplier | .35 | [.2,.8] | D87 minority lethal allocation |
| infiltrationSuppressionMultiplier | 5 | [1,10] | ordinary 1× to one-order amplification |
| withdrawalDisciplineThreshold | 60 | [55,70] | D75/D87 sourced doctrine weights |
| moraleSuppressionDrain | .08 | [0,1] | normalized suppression |
| moraleLullRecovery | .18 | [0,.18] | zero-to-M4-A scale |
| moraleFriendlyRecovery | .12 | [0,.12] | zero-to-M4-A scale |
| moraleLeaderRallyScale | .004 | [0,.004] | zero-to-M4-A scale |

All earlier CAL inventory entries remain authoritative; no UNRANGED value moved.

### Additional ambiguities, deviations, and STOP

- D86's “~60 minute” halt is 70 simulated minutes because Reno's five-minute delay and the half-minute lattice require delivery at 605 to interrupt the prior 607.5 arrival.
- “Formed” means any formation except DISPERSED/CAMP, globally.
- No flat infiltration exposure modifier exists.
- Round 4 is fully reverted.
- D87 improves architecture and lethal-output direction, but legal global rails still transition from no break to near-global rout/annihilation. This is a D79.3 mechanism STOP.
- No commit or push was made.

## Post-D86/D87 final scorecard in full

# Calibration Scorecard

- Scenario: `little-bighorn-1876`
- Seed: `18760625`
- Variants: `baseline`
- Review tier: **baseline**
- Counterfactual provenance flag: **no**
- Composite: **60.41%**
- Composite gates: **FAIL**

| Component | Weight | Included score | Gate |
|---|---:|---:|---|
| C1 Checkpoints | 0.35 | 50.00% | FAIL â€” HIGH 25.0% â‰¥ 70%; overall 50.0% â‰¥ 50% |
| C2 Casualties | 0.25 | 77.78% | FAIL â€” both killed/wounded side bands and every flagship end-state exact |
| C3 End states | 0.25 | 38.46% | FAIL â€” 100% of HIGH-confidence assertions by their minute |
| C4 Observations | 0.15 | 92.31% | PASS â€” 92.3% â‰¥ 80% of HIGH/MEDIUM events |

> Composite gate status is the conjunction of C1â€“C4; no minimum weighted-number gate is invented.
> TODO-AMBIGUOUS(M5-A): `HOLDING_AT` has no schema tolerance. One global proposed [CAL] radius of 250 m is used.

## C1 â€” Checkpoints

Gate: **FAIL** â€” HIGH 25.0% â‰¥ 70%; overall 50.0% â‰¥ 50%.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| cp-scouts-crows-nest | LOW | included | â‰¤1000 m and Â±40 min | 0.0 m, 0.0 min | PASS |
| cp-reno-ford-a | MEDIUM | included | â‰¤150 m and Â±25 min | 5.1 m, 0.5 min | PASS |
| cp-reno-skirmish-line | MEDIUM | included | â‰¤300 m and Â±25 min | 515.2 m, 67.5 min | FAIL |
| cp-reno-timber | MEDIUM | included | â‰¤200 m and Â±25 min | 1447.7 m, 37.5 min | FAIL |
| cp-reno-hill | HIGH | included | â‰¤50 m and Â±15 min | 0.0 m, 42.5 min | FAIL |
| cp-yates-ford-b | MEDIUM | included | â‰¤150 m and Â±25 min | 9.3 m, 17.5 min | PASS |
| cp-right-wing-calhoun | HIGH | included | â‰¤50 m and Â±15 min | 0.0 m, 23.5 min | FAIL |
| cp-keogh-sector | HIGH | included | â‰¤75 m and Â±15 min | 415.6 m, -8.5 min | FAIL |
| cp-custer-last-stand | HIGH | included | â‰¤30 m and Â±15 min | 0.0 m, -10.5 min | PASS |
| cp-weir-point | MEDIUM | included | â‰¤100 m and Â±25 min | 0.0 m, -17.5 min | PASS |

## C2 â€” Casualties

Gate: **FAIL** â€” both killed/wounded side bands and every flagship end-state exact.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| us-7th-cavalry:killed | HIGH | included | 235.0â€“285.0 | 189 | FAIL |
| us-7th-cavalry:wounded | HIGH | included | 45.0â€“60.0 | 39 | FAIL |
| lakota-cheyenne-coalition:killed | DISPUTED | included | 31.0â€“300.0 | 63 | PASS |
| lakota-cheyenne-coalition:wounded | DISPUTED | included | 100.0â€“200.0 | 174 | PASS |
| flagship:co-c | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-e | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-f | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-i | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-l | HIGH | included | DESTROYED exactly | DESTROYED | PASS |

## C3 â€” End states

Gate: **FAIL** â€” 100% of HIGH-confidence assertions by their minute.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| co-c:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-e:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-f:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-i:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-l:DESTROYED:840 | HIGH | included | DESTROYED by minute 840 | not destroyed by deadline | FAIL |
| co-a:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-g:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-m:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-h:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-d:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |
| co-k:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 2032.4 m from reno-hill | FAIL |
| co-b:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 3966.1 m from reno-hill | FAIL |
| pack-train:HOLDING_AT:1080 | HIGH | included | HOLDING_AT by minute 1080 | 0.0 m from reno-hill | PASS |

## C4 â€” Observations

Gate: **PASS** â€” 92.3% â‰¥ 80% of HIGH/MEDIUM events.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| obs-scouts-pony-herd | MEDIUM | included | seen | seen | PASS |
| obs-custer-crows-nest-haze | MEDIUM | included | unseen | unseen | PASS |
| obs-warriors-divide-column | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-hunkpapa | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-oglala | MEDIUM | included | seen | seen | PASS |
| obs-reno-village-minneconjou | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-sans-arc | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-mixed-north | MEDIUM | included | unseen | unseen | PASS |
| obs-reno-village-cheyenne | MEDIUM | included | unseen | unseen | PASS |
| obs-custer-weir-village | DISPUTED | excluded-confidence | seen | unseen | FAIL |
| obs-village-reno-advance | HIGH | included | seen | seen | PASS |
| obs-cheyenne-custer-column | MEDIUM | included | seen | unseen | FAIL |
| obs-reno-hill-volleys | MEDIUM | included | unseen | unseen | PASS |
| obs-weir-custer-field | MEDIUM | included | seen | seen | PASS |

## Post-D86/D87 final N=50 envelope in full

# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **18760603**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **60.41%**
- Eligible no-rare-event candidates: **16** (18760603, 18760616, 18760617, 18760619, 18760620, 18760621, 18760623, 18760625, 18760627, 18760628, 18760631, 18760632, 18760633, 18760634, 18760635, 18760648)
- Rule: composite percentile 0.4â€“0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 49.29% | 60.41% | 60.41% | 60.41% | 63.18% | 59.10% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% |
| C2 | 33.33% | 77.78% | 77.78% | 77.78% | 88.89% | 73.33% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 38.46% | 37.69% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 19 | 38.0% |
| 1 | 21 | 42.0% |
| 2 | 9 | 18.0% |
| 3 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| two-moons | 8 | 16.0% |
| keogh | 7 | 14.0% |
| crow-king | 6 | 12.0% |
| lame-white-man | 5 | 10.0% |
| yates | 5 | 10.0% |
| calhoun | 4 | 8.0% |
| weir | 3 | 6.0% |
| crazy-horse | 2 | 4.0% |
| custer | 2 | 4.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| co-e | 44 | 88.0% |
| co-f | 44 | 88.0% |
| lwm-band | 44 | 88.0% |
| co-d | 8 | 16.0% |
| cheyenne-pool | 2 | 4.0% |

## Wing-destruction distribution

- Complete wing destruction: **44/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 857.00 | 859.00 | 860.25 | 862.00 | 868.00 | 860.77 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, keogh, lame-white-man, two-moons, weir, yates |
| Arikara killed | NO | historical=3â€“3; observed=0â€“0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-d, co-e, co-f, lwm-band |
| Wing destruction minute | NO | historical=825â€“840; observed=857.0â€“868.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 60.41% | 2: keogh, lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760601 | 63.18% | 2: calhoun, two-moons | 0/0/0 | cheyenne-pool, co-e, co-f, lwm-band | 1723 | none |
| 18760602 | 49.29% | 1: two-moons | 0/0/0 | none | not destroyed | none |
| 18760603 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760604 | 60.41% | 1: weir | 0/0/0 | co-d, co-e, co-f, lwm-band | 1718 | none |
| 18760605 | 49.29% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760606 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1727 | none |
| 18760607 | 49.29% | 1: two-moons | 0/0/0 | none | not destroyed | none |
| 18760608 | 60.41% | 1: calhoun | 0/0/0 | co-e, co-f, lwm-band | 1722 | none |
| 18760609 | 63.18% | 1: two-moons | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760610 | 60.41% | 2: calhoun, yates | 0/0/0 | co-e, co-f, lwm-band | 1714 | none |
| 18760611 | 60.41% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760612 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1730 | none |
| 18760613 | 49.29% | 2: keogh, lame-white-man | 0/0/0 | none | not destroyed | none |
| 18760614 | 60.41% | 1: yates | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760615 | 60.41% | 2: custer, yates | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760616 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760617 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760618 | 58.48% | 2: keogh, two-moons | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760619 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760620 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760621 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1720 | none |
| 18760622 | 60.41% | 1: keogh | 0/0/0 | co-e, co-f, lwm-band | 1725 | none |
| 18760623 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760624 | 60.41% | 1: lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1729 | none |
| 18760625 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760626 | 61.26% | 1: weir | 0/0/0 | co-d, co-e, co-f, lwm-band | 1719 | none |
| 18760627 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760628 | 60.41% | 1: keogh | 0/0/0 | co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760629 | 58.48% | 1: custer | 0/0/0 | co-d, co-e, co-f, lwm-band | 1717 | none |
| 18760630 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1736 | none |
| 18760631 | 60.41% | 1: two-moons | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760632 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760633 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760634 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1719 | none |
| 18760635 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760636 | 60.41% | 1: crazy-horse | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760637 | 60.41% | 3: crow-king, keogh, yates | 0/0/0 | co-e, co-f, lwm-band | 1724 | none |
| 18760638 | 60.41% | 1: crazy-horse | 0/0/0 | co-e, co-f, lwm-band | 1726 | none |
| 18760639 | 60.41% | 1: calhoun | 0/0/0 | co-e, co-f, lwm-band | 1718 | none |
| 18760640 | 49.29% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760641 | 60.41% | 2: keogh, lame-white-man | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760642 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1728 | none |
| 18760643 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, lwm-band | 1727 | none |
| 18760644 | 60.41% | 2: two-moons, yates | 0/0/0 | co-e, co-f, lwm-band | 1723 | none |
| 18760645 | 58.48% | 2: two-moons, weir | 0/0/0 | cheyenne-pool, co-d, co-e, co-f, lwm-band | 1718 | none |
| 18760646 | 61.26% | 0: none | 0/0/0 | co-d, co-e, co-f, lwm-band | 1718 | none |
| 18760647 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1726 | none |
| 18760648 | 60.41% | 0: none | 0/0/0 | co-e, co-f, lwm-band | 1721 | none |
| 18760649 | 49.29% | 0: none | 0/0/0 | none | not destroyed | none |

## Post-D86/D87 verification

Quartet: **GREEN** — 13 files, 76 tests. D87's cover-occupancy architecture
test is included.

```text
F6 median=6413.0ms
pathfind={"calls":164,"expandedNodes":9553977,"scratchAllocations":1,"heapGrowths":3}
V1 PASS; D55 PASS; E6 PASS; F3 PASS; F1 PASS
V2 12/13 (92.3%) PASS
V7 E5 table diff=none
V6 entries=29 orders=26 activations=3 leaderDeaths=0
build PASS; lint PASS
```

Final D86/D87 full-state hash: `80ccd48a`. Scenario hash: `be1954da`.
No commit or push was made.
