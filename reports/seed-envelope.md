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
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

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
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-d, co-e, co-f, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=857.0–868.0 |
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
