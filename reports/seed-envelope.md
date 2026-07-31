# D80 Seed Envelope

- Scenario: `little-bighorn-1876`
- Seeds: **50** (criteria-declared N=50)
- Selected typical baseline seed: **18760616**

## G-M5-2 ordering evidence

| Order | Event | Evidence |
|---:|---|---|
| 1 | Criteria bytes read and hashed | SHA-256 `507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad` |
| 2 | Per-seed report generation began | declared seeds `18760600..18760649` |

The implementation records order 1 before creating the first simulation; the same hash is carried into this byte-deterministic report.

## Selection result

- Median composite: **57.63%**
- Eligible no-rare-event candidates: **6** (18760616, 18760630, 18760634, 18760639, 18760643, 18760648)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 47.37% | 52.93% | 57.63% | 57.63% | 63.18% | 56.15% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% |
| C2 | 33.33% | 55.56% | 66.67% | 75.00% | 88.89% | 64.00% |
| C3 | 23.08% | 30.77% | 38.46% | 38.46% | 38.46% | 35.23% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 27 | 54.0% |
| 1 | 16 | 32.0% |
| 2 | 6 | 12.0% |
| 3 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| gall | 7 | 14.0% |
| sitting-bull | 5 | 10.0% |
| two-moons | 4 | 8.0% |
| custer | 3 | 6.0% |
| lame-white-man | 3 | 6.0% |
| yates | 3 | 6.0% |
| crow-king | 2 | 4.0% |
| keogh | 2 | 4.0% |
| reno | 1 | 2.0% |
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
| co-f | 47 | 94.0% |
| co-e | 46 | 92.0% |
| co-c | 30 | 60.0% |
| hunkpapa-pool | 17 | 34.0% |
| crow-king-band | 15 | 30.0% |
| lwm-band | 7 | 14.0% |
| co-m | 4 | 8.0% |
| gall-band | 3 | 6.0% |
| cheyenne-pool | 2 | 4.0% |
| co-d | 2 | 4.0% |

## Wing-destruction distribution

- Complete wing destruction: **29/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 868.00 | 882.50 | 883.50 | 888.00 | 898.00 | 883.55 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | NO | required=custer, yates, keogh, calhoun, lame-white-man; observed=crow-king, custer, gall, keogh, lame-white-man, reno, sitting-bull, two-moons, weir, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-c, co-d, co-e, co-f, co-m, crow-king-band, gall-band, hunkpapa-pool, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=868.0–898.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 61.26% | 0: none | 0/0/0 | co-e, co-f | 1736 | none |
| 18760601 | 47.37% | 1: lame-white-man | 0/0/0 | co-c, co-e, co-f, crow-king-band | not destroyed | none |
| 18760602 | 57.63% | 1: sitting-bull | 0/0/0 | cheyenne-pool, co-c, co-e, lwm-band | 1785 | none |
| 18760603 | 60.41% | 0: none | 0/0/0 | co-c, co-e, co-f | 1766 | none |
| 18760604 | 55.71% | 1: two-moons | 0/0/0 | co-c, co-d, co-e, co-f, crow-king-band | not destroyed | none |
| 18760605 | 55.71% | 0: none | 0/0/0 | co-c, co-e, co-f, co-m | not destroyed | none |
| 18760606 | 58.48% | 0: none | 0/0/0 | co-e, co-f, co-m | 1756 | none |
| 18760607 | 57.63% | 1: sitting-bull | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | 1768 | none |
| 18760608 | 52.93% | 0: none | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760609 | 60.41% | 1: yates | 0/0/0 | co-c, co-e, co-f | 1778 | none |
| 18760610 | 60.41% | 0: none | 0/0/0 | co-c, co-e, co-f | 1793 | none |
| 18760611 | 52.93% | 1: gall | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760612 | 57.63% | 1: gall | 0/0/0 | co-c, co-e, co-f, crow-king-band, gall-band, hunkpapa-pool | 1766 | none |
| 18760613 | 57.63% | 1: crow-king | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1765 | none |
| 18760614 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760615 | 61.26% | 0: none | 0/0/0 | co-c, co-f, co-m | 1780 | none |
| 18760616 | 57.63% | 0: none | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1767 | none |
| 18760617 | 57.63% | 1: gall | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1740 | none |
| 18760618 | 52.93% | 0: none | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760619 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760620 | 57.63% | 2: gall, two-moons | 0/0/0 | co-c, co-e, co-f, crow-king-band, hunkpapa-pool | 1776 | none |
| 18760621 | 57.63% | 3: gall, sitting-bull, two-moons | 0/0/0 | co-c, co-e, co-f, crow-king-band, gall-band, hunkpapa-pool | 1769 | none |
| 18760622 | 52.07% | 1: two-moons | 0/0/0 | cheyenne-pool, co-c, co-e, co-f | not destroyed | none |
| 18760623 | 56.56% | 2: reno, sitting-bull | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool, lwm-band | 1781 | none |
| 18760624 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760625 | 63.18% | 1: crow-king | 0/0/0 | co-f | 1796 | none |
| 18760626 | 60.41% | 0: none | 0/0/0 | co-c, co-e, co-f, crow-king-band | 1769 | none |
| 18760627 | 57.63% | 1: keogh | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1766 | none |
| 18760628 | 50.15% | 2: custer, lame-white-man | 0/0/0 | co-c, co-e, co-f, crow-king-band, gall-band | not destroyed | none |
| 18760629 | 57.63% | 1: keogh | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1767 | none |
| 18760630 | 57.63% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | 1767 | none |
| 18760631 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760632 | 58.48% | 0: none | 0/0/0 | co-f, co-m, crow-king-band, hunkpapa-pool | 1740 | none |
| 18760633 | 58.48% | 0: none | 0/0/0 | co-c, co-e, co-f, lwm-band | not destroyed | none |
| 18760634 | 57.63% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | 1765 | none |
| 18760635 | 52.93% | 0: none | 0/0/0 | lwm-band | not destroyed | none |
| 18760636 | 52.07% | 2: custer, gall | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760637 | 50.15% | 2: gall, lame-white-man | 0/0/0 | co-c, co-e, co-f, lwm-band | not destroyed | none |
| 18760638 | 57.63% | 1: custer | 0/0/0 | co-e, co-f, hunkpapa-pool | 1756 | none |
| 18760639 | 57.63% | 0: none | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | 1767 | none |
| 18760640 | 55.71% | 1: weir | 0/0/0 | co-c, co-d, co-e, co-f | not destroyed | none |
| 18760641 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760642 | 60.41% | 0: none | 0/0/0 | co-c, co-e, co-f | 1767 | none |
| 18760643 | 57.63% | 0: none | 0/0/0 | co-e, co-f | 1766 | none |
| 18760644 | 57.63% | 0: none | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1740 | none |
| 18760645 | 61.26% | 0: none | 0/0/0 | co-c, co-e, co-f, lwm-band | 1788 | none |
| 18760646 | 50.15% | 2: sitting-bull, yates | 0/0/0 | co-c, co-e, co-f, crow-king-band, lwm-band | not destroyed | none |
| 18760647 | 52.93% | 0: none | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760648 | 57.63% | 0: none | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | 1766 | none |
| 18760649 | 52.93% | 1: yates | 0/0/0 | co-c, co-e | not destroyed | none |
