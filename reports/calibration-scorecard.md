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
| C1 Checkpoints | 0.35 | 50.00% | FAIL — HIGH 25.0% ≥ 70%; overall 50.0% ≥ 50% |
| C2 Casualties | 0.25 | 77.78% | FAIL — both killed/wounded side bands and every flagship end-state exact |
| C3 End states | 0.25 | 38.46% | FAIL — 100% of HIGH-confidence assertions by their minute |
| C4 Observations | 0.15 | 92.31% | PASS — 92.3% ≥ 80% of HIGH/MEDIUM events |

> Composite gate status is the conjunction of C1–C4; no minimum weighted-number gate is invented.
> TODO-AMBIGUOUS(M5-A): `HOLDING_AT` has no schema tolerance. One global proposed [CAL] radius of 250 m is used.

## C1 — Checkpoints

Gate: **FAIL** — HIGH 25.0% ≥ 70%; overall 50.0% ≥ 50%.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| cp-scouts-crows-nest | LOW | included | ≤1000 m and ±40 min | 0.0 m, 0.0 min | PASS |
| cp-reno-ford-a | MEDIUM | included | ≤150 m and ±25 min | 5.1 m, 0.5 min | PASS |
| cp-reno-skirmish-line | MEDIUM | included | ≤300 m and ±25 min | 515.2 m, 67.5 min | FAIL |
| cp-reno-timber | MEDIUM | included | ≤200 m and ±25 min | 1447.7 m, 37.5 min | FAIL |
| cp-reno-hill | HIGH | included | ≤50 m and ±15 min | 0.0 m, 42.5 min | FAIL |
| cp-yates-ford-b | MEDIUM | included | ≤150 m and ±25 min | 9.3 m, 17.5 min | PASS |
| cp-right-wing-calhoun | HIGH | included | ≤50 m and ±15 min | 0.0 m, 23.5 min | FAIL |
| cp-keogh-sector | HIGH | included | ≤75 m and ±15 min | 415.6 m, -8.5 min | FAIL |
| cp-custer-last-stand | HIGH | included | ≤30 m and ±15 min | 0.0 m, -10.5 min | PASS |
| cp-weir-point | MEDIUM | included | ≤100 m and ±25 min | 0.0 m, -17.5 min | PASS |

## C2 — Casualties

Gate: **FAIL** — both killed/wounded side bands and every flagship end-state exact.

| Item | Confidence | Scope | Expected | Actual | Result |
|---|---|---|---|---|---|
| us-7th-cavalry:killed | HIGH | included | 235.0–285.0 | 189 | FAIL |
| us-7th-cavalry:wounded | HIGH | included | 45.0–60.0 | 39 | FAIL |
| lakota-cheyenne-coalition:killed | DISPUTED | included | 31.0–300.0 | 63 | PASS |
| lakota-cheyenne-coalition:wounded | DISPUTED | included | 100.0–200.0 | 174 | PASS |
| flagship:co-c | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-e | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-f | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-i | HIGH | included | DESTROYED exactly | DESTROYED | PASS |
| flagship:co-l | HIGH | included | DESTROYED exactly | DESTROYED | PASS |

## C3 — End states

Gate: **FAIL** — 100% of HIGH-confidence assertions by their minute.

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

## C4 — Observations

Gate: **PASS** — 92.3% ≥ 80% of HIGH/MEDIUM events.

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
