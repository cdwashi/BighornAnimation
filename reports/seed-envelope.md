# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **18760612**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **57.63%**
- Eligible no-rare-event candidates: **7** (18760612, 18760626, 18760627, 18760637, 18760640, 18760642, 18760643)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 44.59% | 56.83% | 57.63% | 60.14% | 63.18% | 57.28% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% |
| C2 | 22.22% | 66.67% | 77.78% | 77.78% | 88.89% | 69.11% |
| C3 | 23.08% | 30.77% | 38.46% | 38.46% | 38.46% | 34.62% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 21 | 42.0% |
| 1 | 21 | 42.0% |
| 2 | 6 | 12.0% |
| 3 | 2 | 4.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| gall | 11 | 22.0% |
| sitting-bull | 7 | 14.0% |
| crow-king | 6 | 12.0% |
| yates | 4 | 8.0% |
| custer | 3 | 6.0% |
| two-moons | 3 | 6.0% |
| reno | 2 | 4.0% |
| french | 1 | 2.0% |
| keogh | 1 | 2.0% |
| lame-white-man | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| co-f | 48 | 96.0% |
| co-e | 35 | 70.0% |
| co-c | 24 | 48.0% |
| hunkpapa-pool | 22 | 44.0% |
| crow-king-band | 20 | 40.0% |
| co-m | 9 | 18.0% |
| lwm-band | 6 | 12.0% |
| co-d | 4 | 8.0% |
| gall-band | 2 | 4.0% |
| cheyenne-pool | 1 | 2.0% |
| co-g | 1 | 2.0% |

## Wing-destruction distribution

- Complete wing destruction: **38/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 870.00 | 878.50 | 883.00 | 884.38 | 938.50 | 885.91 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | NO | required=custer, yates, keogh, calhoun, lame-white-man; observed=crow-king, custer, french, gall, keogh, lame-white-man, reno, sitting-bull, two-moons, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-c, co-d, co-e, co-f, co-g, co-m, crow-king-band, gall-band, hunkpapa-pool, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=870.0–938.5 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 53.78% | 1: gall | 0/0/0 | co-c, co-d, co-e, co-f, hunkpapa-pool, lwm-band | not destroyed | none |
| 18760601 | 56.56% | 2: sitting-bull, yates | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool, lwm-band | 1850 | none |
| 18760602 | 60.41% | 2: crow-king, sitting-bull | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1757 | none |
| 18760603 | 56.56% | 1: two-moons | 0/0/0 | co-c, co-e, co-f | 1782 | none |
| 18760604 | 56.56% | 0: none | 0/0/0 | co-c, co-f | 1789 | none |
| 18760605 | 59.34% | 0: none | 0/0/0 | co-c, co-d, co-e, co-f, co-m | 1877 | none |
| 18760606 | 58.48% | 1: sitting-bull | 0/0/0 | co-c, co-e, co-f, co-m, hunkpapa-pool | 1808 | none |
| 18760607 | 54.85% | 1: custer | 0/0/0 | co-c, co-e, co-f, lwm-band | not destroyed | none |
| 18760608 | 57.63% | 2: gall, yates | 0/0/0 | co-e, co-f, crow-king-band, gall-band, hunkpapa-pool | 1758 | none |
| 18760609 | 60.41% | 0: none | 0/0/0 | co-f, hunkpapa-pool | 1740 | none |
| 18760610 | 63.18% | 0: none | 0/0/0 | co-e, co-f | 1766 | none |
| 18760611 | 58.48% | 1: gall | 0/0/0 | co-c, co-f, crow-king-band | not destroyed | none |
| 18760612 | 57.63% | 1: crow-king | 0/0/0 | co-c, co-e, co-f, co-m, crow-king-band | 1768 | none |
| 18760613 | 52.93% | 0: none | 0/0/0 | co-d, co-e, co-f, crow-king-band, hunkpapa-pool | not destroyed | none |
| 18760614 | 60.41% | 0: none | 0/0/0 | co-e, co-f | 1766 | none |
| 18760615 | 60.41% | 1: crow-king | 0/0/0 | co-c, co-e, co-f, crow-king-band | 1768 | none |
| 18760616 | 60.41% | 0: none | 0/0/0 | co-f | 1749 | none |
| 18760617 | 58.48% | 0: none | 0/0/0 | co-c, co-f, crow-king-band | not destroyed | none |
| 18760618 | 46.52% | 3: crow-king, french, two-moons | 0/0/0 | cheyenne-pool, co-m, crow-king-band, lwm-band | not destroyed | none |
| 18760619 | 57.63% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | 1754 | none |
| 18760620 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760621 | 60.41% | 0: none | 0/0/0 | co-f, hunkpapa-pool | 1740 | none |
| 18760622 | 58.48% | 0: none | 0/0/0 | co-c, co-f, co-m | 1805 | none |
| 18760623 | 58.48% | 1: gall | 0/0/0 | co-c, co-f, crow-king-band | 1789 | none |
| 18760624 | 60.41% | 1: gall | 0/0/0 | co-e, co-f | 1768 | none |
| 18760625 | 57.63% | 1: crow-king | 0/0/0 | co-f, crow-king-band, hunkpapa-pool | 1740 | none |
| 18760626 | 57.63% | 0: none | 0/0/0 | co-f, crow-king-band, hunkpapa-pool | 1766 | none |
| 18760627 | 57.63% | 1: sitting-bull | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1765 | none |
| 18760628 | 60.41% | 3: gall, two-moons, yates | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | 1764 | none |
| 18760629 | 54.85% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760630 | 53.78% | 1: gall | 0/0/0 | co-c, co-d, co-f | not destroyed | none |
| 18760631 | 58.48% | 1: reno | 0/0/0 | co-e, co-f, co-m, crow-king-band | 1757 | none |
| 18760632 | 59.34% | 2: custer, reno | 0/0/0 | co-e, co-f, co-g, co-m | 1766 | none |
| 18760633 | 57.63% | 1: gall | 0/0/0 | co-c, co-e, co-f, crow-king-band, hunkpapa-pool | 1769 | none |
| 18760634 | 57.63% | 1: crow-king | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1756 | none |
| 18760635 | 60.41% | 1: yates | 0/0/0 | co-c, co-f, lwm-band | 1779 | none |
| 18760636 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760637 | 57.63% | 1: sitting-bull | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1757 | none |
| 18760638 | 57.63% | 2: gall, lame-white-man | 0/0/0 | co-f, crow-king-band, hunkpapa-pool | 1740 | none |
| 18760639 | 47.37% | 0: none | 0/0/0 | co-m, lwm-band | not destroyed | none |
| 18760640 | 57.63% | 1: sitting-bull | 0/0/0 | co-c, co-e, co-f, crow-king-band, hunkpapa-pool | 1766 | none |
| 18760641 | 60.41% | 1: custer | 0/0/0 | co-e, co-f | 1765 | none |
| 18760642 | 57.63% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | 1757 | none |
| 18760643 | 57.63% | 0: none | 0/0/0 | co-c, co-e, co-f, crow-king-band, hunkpapa-pool | 1766 | none |
| 18760644 | 58.48% | 1: keogh | 0/0/0 | co-e, co-f, hunkpapa-pool | 1834 | none |
| 18760645 | 60.41% | 1: gall | 0/0/0 | co-c, co-e, co-f | 1768 | none |
| 18760646 | 58.48% | 0: none | 0/0/0 | co-e, co-f, co-m | 1755 | none |
| 18760647 | 44.59% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760648 | 57.63% | 2: gall, sitting-bull | 0/0/0 | co-e, co-f, gall-band, hunkpapa-pool | 1758 | none |
| 18760649 | 60.41% | 0: none | 0/0/0 | co-e, co-f, crow-king-band | 1767 | none |
