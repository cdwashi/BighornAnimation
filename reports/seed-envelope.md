# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **18760602**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **56.91%**
- Eligible no-rare-event candidates: **16** (18760602, 18760604, 18760606, 18760612, 18760616, 18760617, 18760618, 18760629, 18760630, 18760633, 18760634, 18760635, 18760639, 18760641, 18760643, 18760649)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 45.79% | 54.34% | 56.91% | 56.91% | 59.68% | 54.60% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% | 40.00% |
| C2 | 33.33% | 69.44% | 77.78% | 77.78% | 88.89% | 69.33% |
| C3 | 30.77% | 38.46% | 38.46% | 38.46% | 38.46% | 37.69% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 18 | 36.0% |
| 1 | 21 | 42.0% |
| 2 | 10 | 20.0% |
| 3 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| two-moons | 9 | 18.0% |
| keogh | 8 | 16.0% |
| lame-white-man | 8 | 16.0% |
| calhoun | 4 | 8.0% |
| gall | 4 | 8.0% |
| crazy-horse | 3 | 6.0% |
| sitting-bull | 2 | 4.0% |
| weir | 2 | 4.0% |
| yates | 2 | 4.0% |
| crow-king | 1 | 2.0% |
| custer | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| arikara-scouts | 50 | 100.0% |
| co-e | 40 | 80.0% |
| co-f | 40 | 80.0% |
| lwm-band | 40 | 80.0% |
| co-d | 6 | 12.0% |
| cheyenne-pool | 5 | 10.0% |

## Wing-destruction distribution

- Complete wing destruction: **40/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 857.00 | 860.50 | 862.25 | 864.00 | 867.00 | 862.44 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, gall, keogh, lame-white-man, sitting-bull, two-moons, weir, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=arikara-scouts, cheyenne-pool, co-d, co-e, co-f, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=857.0–867.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are informational in M5-A; G-M5-1/G-M5-2 calibration gates begin in M5-B.

> TODO-AMBIGUOUS(M5-A): Bloody Knife is named by D82 but is absent from `scenario.leaders`; this envelope cannot produce or adjudicate his death without a separately ruled data change.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 45.79% | 2: calhoun, two-moons | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760601 | 45.79% | 1: gall | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760602 | 56.91% | 2: keogh, lame-white-man | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1721 | none |
| 18760603 | 45.79% | 1: calhoun | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760604 | 56.91% | 1: lame-white-man | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1723 | none |
| 18760605 | 54.98% | 1: lame-white-man | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1718 | none |
| 18760606 | 56.91% | 1: keogh | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1724 | none |
| 18760607 | 56.91% | 1: sitting-bull | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1726 | none |
| 18760608 | 45.79% | 2: crow-king, gall | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760609 | 45.79% | 0: none | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760610 | 45.79% | 0: none | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760611 | 56.91% | 2: lame-white-man, sitting-bull | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1727 | none |
| 18760612 | 56.91% | 1: two-moons | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1721 | none |
| 18760613 | 56.91% | 1: two-moons | 0/0/0 | arikara-scouts, cheyenne-pool, co-e, co-f, lwm-band | 1728 | none |
| 18760614 | 56.91% | 1: yates | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1714 | none |
| 18760615 | 45.79% | 1: keogh | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760616 | 56.91% | 1: keogh | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1728 | none |
| 18760617 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1726 | none |
| 18760618 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1724 | none |
| 18760619 | 54.13% | 1: calhoun | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1726 | none |
| 18760620 | 56.91% | 2: keogh, two-moons | 0/0/0 | arikara-scouts, cheyenne-pool, co-e, co-f, lwm-band | 1728 | none |
| 18760621 | 56.91% | 1: two-moons | 0/0/0 | arikara-scouts, cheyenne-pool, co-e, co-f, lwm-band | 1734 | none |
| 18760622 | 59.68% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1730 | none |
| 18760623 | 54.13% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1732 | none |
| 18760624 | 59.68% | 1: crazy-horse | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1731 | none |
| 18760625 | 59.68% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1722 | none |
| 18760626 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760627 | 57.76% | 0: none | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1721 | none |
| 18760628 | 56.91% | 2: crazy-horse, two-moons | 0/0/0 | arikara-scouts, cheyenne-pool, co-e, co-f, lwm-band | 1725 | none |
| 18760629 | 56.91% | 1: keogh | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1728 | none |
| 18760630 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1727 | none |
| 18760631 | 54.98% | 2: two-moons, yates | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1720 | none |
| 18760632 | 54.13% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1733 | none |
| 18760633 | 56.91% | 2: keogh, lame-white-man | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1721 | none |
| 18760634 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1721 | none |
| 18760635 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1723 | none |
| 18760636 | 45.79% | 0: none | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760637 | 45.79% | 0: none | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760638 | 57.76% | 1: weir | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1723 | none |
| 18760639 | 56.91% | 1: lame-white-man | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1724 | none |
| 18760640 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1718 | none |
| 18760641 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1724 | none |
| 18760642 | 56.91% | 0: none | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1730 | none |
| 18760643 | 56.91% | 1: two-moons | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1726 | none |
| 18760644 | 56.91% | 1: calhoun | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1731 | none |
| 18760645 | 45.79% | 1: two-moons | 0/0/0 | arikara-scouts | not destroyed | none |
| 18760646 | 54.98% | 3: gall, lame-white-man, weir | 0/0/0 | arikara-scouts, co-d, co-e, co-f, lwm-band | 1723 | none |
| 18760647 | 56.91% | 2: custer, gall | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1721 | none |
| 18760648 | 56.91% | 2: crazy-horse, lame-white-man | 0/0/0 | arikara-scouts, cheyenne-pool, co-e, co-f, lwm-band | 1728 | none |
| 18760649 | 56.91% | 1: keogh | 0/0/0 | arikara-scouts, co-e, co-f, lwm-band | 1725 | none |
