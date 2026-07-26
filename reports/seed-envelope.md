# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **NONE — criteria produced no eligible member**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **52.07%**
- Eligible no-rare-event candidates: **0** (none)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 49.29% | 49.29% | 52.07% | 59.93% | 66.52% | 54.40% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 40.00% | 50.00% | 50.00% | 50.00% | 50.00% | 47.60% |
| C2 | 33.33% | 33.33% | 44.44% | 75.00% | 88.89% | 51.56% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 76.92% | 44.00% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 30 | 60.0% |
| 1 | 15 | 30.0% |
| 2 | 4 | 8.0% |
| 3 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| calhoun | 6 | 12.0% |
| crow-king | 3 | 6.0% |
| gall | 3 | 6.0% |
| keogh | 3 | 6.0% |
| french | 2 | 4.0% |
| hump | 2 | 4.0% |
| white-bull | 2 | 4.0% |
| crazy-horse | 1 | 2.0% |
| custer | 1 | 2.0% |
| lame-white-man | 1 | 2.0% |
| weir | 1 | 2.0% |
| yates | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| crow-scouts | 50 | 100.0% |
| co-d | 10 | 20.0% |
| crow-king-band | 9 | 18.0% |
| co-e | 8 | 16.0% |
| co-f | 8 | 16.0% |
| lwm-band | 8 | 16.0% |
| co-h | 1 | 2.0% |
| co-k | 1 | 2.0% |
| gall-band | 1 | 2.0% |

## Wing-destruction distribution

- Complete wing destruction: **17/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 653.50 | 697.50 | 697.50 | 859.50 | 862.00 | 765.29 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, french, gall, hump, keogh, lame-white-man, weir, white-bull, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=co-d, co-e, co-f, co-h, co-k, crow-king-band, crow-scouts, gall-band, lwm-band |
| Wing destruction minute | YES | historical=825–840; observed=653.5–862.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 55.71% | 1: calhoun | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1722 | none |
| 18760601 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760602 | 52.93% | 1: gall | 0/0/0 | co-d, co-h, co-k, crow-scouts | not destroyed | none |
| 18760603 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760604 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760605 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760606 | 52.07% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760607 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760608 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760609 | 52.07% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760610 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760611 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760612 | 66.52% | 0: none | 0/0/0 | crow-king-band, crow-scouts | 1395 | none |
| 18760613 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760614 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760615 | 63.18% | 0: none | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1717 | none |
| 18760616 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760617 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760618 | 52.21% | 1: crazy-horse | 0/0/0 | co-d, crow-scouts | not destroyed | none |
| 18760619 | 66.52% | 2: calhoun, custer | 0/0/0 | crow-king-band, crow-scouts | 1395 | none |
| 18760620 | 49.29% | 1: calhoun | 0/0/0 | crow-scouts | not destroyed | none |
| 18760621 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760622 | 63.74% | 2: crow-king, hump | 0/0/0 | crow-king-band, crow-scouts | 1351 | none |
| 18760623 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760624 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760625 | 58.48% | 0: none | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1718 | none |
| 18760626 | 52.07% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760627 | 60.41% | 1: crow-king | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1724 | none |
| 18760628 | 55.71% | 1: white-bull | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1722 | none |
| 18760629 | 49.29% | 3: calhoun, crow-king, white-bull | 0/0/0 | crow-scouts | not destroyed | none |
| 18760630 | 49.29% | 1: keogh | 0/0/0 | crow-scouts | not destroyed | none |
| 18760631 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760632 | 49.29% | 1: hump | 0/0/0 | crow-scouts | not destroyed | none |
| 18760633 | 49.29% | 1: french | 0/0/0 | crow-scouts | not destroyed | none |
| 18760634 | 52.21% | 0: none | 0/0/0 | co-d, crow-scouts | not destroyed | none |
| 18760635 | 52.21% | 1: weir | 0/0/0 | co-d, crow-scouts | not destroyed | none |
| 18760636 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760637 | 66.52% | 1: keogh | 0/0/0 | crow-king-band, crow-scouts | 1395 | none |
| 18760638 | 52.07% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760639 | 66.52% | 1: gall | 0/0/0 | crow-king-band, crow-scouts, gall-band | 1313 | none |
| 18760640 | 49.29% | 2: calhoun, french | 0/0/0 | crow-scouts | not destroyed | none |
| 18760641 | 49.29% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760642 | 66.52% | 0: none | 0/0/0 | crow-king-band, crow-scouts | 1312 | none |
| 18760643 | 63.74% | 0: none | 0/0/0 | crow-king-band, crow-scouts | 1307 | none |
| 18760644 | 61.26% | 1: calhoun | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1717 | none |
| 18760645 | 58.48% | 2: lame-white-man, yates | 0/0/0 | co-d, co-e, co-f, crow-scouts, lwm-band | 1719 | none |
| 18760646 | 52.07% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760647 | 60.41% | 0: none | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1723 | none |
| 18760648 | 66.52% | 1: gall | 0/0/0 | crow-king-band, crow-scouts | 1395 | none |
| 18760649 | 66.52% | 1: keogh | 0/0/0 | crow-king-band, crow-scouts | 1395 | none |
