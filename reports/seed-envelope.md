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

- Median composite: **54.85%**
- Eligible no-rare-event candidates: **0** (none)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 44.59% | 53.14% | 54.85% | 57.63% | 60.41% | 55.27% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% |
| C2 | 22.22% | 55.56% | 55.56% | 66.67% | 77.78% | 60.00% |
| C3 | 23.08% | 30.77% | 38.46% | 38.46% | 38.46% | 35.69% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 19 | 38.0% |
| 1 | 20 | 40.0% |
| 2 | 6 | 12.0% |
| 3 | 4 | 8.0% |
| 4 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| gall | 9 | 18.0% |
| sitting-bull | 9 | 18.0% |
| custer | 7 | 14.0% |
| crow-king | 6 | 12.0% |
| keogh | 4 | 8.0% |
| two-moons | 4 | 8.0% |
| yates | 3 | 6.0% |
| calhoun | 2 | 4.0% |
| reno | 2 | 4.0% |
| crazy-horse | 1 | 2.0% |
| french | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| co-e | 50 | 100.0% |
| co-f | 50 | 100.0% |
| co-c | 26 | 52.0% |
| hunkpapa-pool | 20 | 40.0% |
| crow-king-band | 13 | 26.0% |
| co-m | 9 | 18.0% |
| lwm-band | 6 | 12.0% |
| co-l | 2 | 4.0% |
| cheyenne-pool | 1 | 2.0% |
| co-g | 1 | 2.0% |
| gall-band | 1 | 2.0% |

## Wing-destruction distribution

- Complete wing destruction: **9/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 879.00 | 881.50 | 885.50 | 888.00 | 939.00 | 894.56 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | NO | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, french, gall, keogh, reno, sitting-bull, two-moons, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | NO | required=co-a, co-g, co-m; observed=cheyenne-pool, co-c, co-e, co-f, co-g, co-l, co-m, crow-king-band, gall-band, hunkpapa-pool, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=879.0–939.0 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 50.15% | 3: calhoun, sitting-bull, two-moons | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool, lwm-band | not destroyed | none |
| 18760601 | 52.93% | 2: custer, keogh | 0/0/0 | co-c, co-e, co-f, lwm-band | not destroyed | none |
| 18760602 | 60.41% | 2: crow-king, sitting-bull | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1760 | none |
| 18760603 | 55.71% | 1: custer | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760604 | 55.71% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760605 | 52.93% | 1: gall | 0/0/0 | co-c, co-e, co-f, co-m, lwm-band | not destroyed | none |
| 18760606 | 52.93% | 0: none | 0/0/0 | co-c, co-e, co-f, co-m, hunkpapa-pool | not destroyed | none |
| 18760607 | 54.85% | 0: none | 0/0/0 | cheyenne-pool, co-c, co-e, co-f, lwm-band | not destroyed | none |
| 18760608 | 57.63% | 2: crazy-horse, sitting-bull | 0/0/0 | co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760609 | 57.63% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | 1758 | none |
| 18760610 | 57.63% | 1: keogh | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760611 | 52.93% | 3: custer, keogh, sitting-bull | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | not destroyed | none |
| 18760612 | 57.63% | 2: crow-king, custer | 0/0/0 | co-e, co-f, co-m, crow-king-band | not destroyed | none |
| 18760613 | 54.85% | 1: yates | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760614 | 57.63% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760615 | 54.85% | 1: custer | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760616 | 60.41% | 1: yates | 0/0/0 | co-c, co-e, co-f | 1859 | none |
| 18760617 | 55.71% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760618 | 52.07% | 4: crow-king, french, gall, sitting-bull | 0/0/0 | co-c, co-e, co-f, co-m, crow-king-band, gall-band | not destroyed | none |
| 18760619 | 54.85% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760620 | 52.07% | 1: sitting-bull | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760621 | 57.63% | 1: two-moons | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | not destroyed | none |
| 18760622 | 52.93% | 1: gall | 0/0/0 | co-c, co-e, co-f, co-m | not destroyed | none |
| 18760623 | 50.15% | 0: none | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760624 | 57.63% | 1: gall | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760625 | 57.63% | 1: crow-king | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1765 | none |
| 18760626 | 54.85% | 0: none | 0/0/0 | co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760627 | 54.85% | 0: none | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760628 | 57.63% | 1: gall | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760629 | 57.63% | 1: gall | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760630 | 52.93% | 1: calhoun | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760631 | 58.48% | 1: reno | 0/0/0 | co-e, co-f, co-m, crow-king-band | 1772 | none |
| 18760632 | 53.78% | 1: reno | 0/0/0 | co-c, co-e, co-f, co-g, co-m | not destroyed | none |
| 18760633 | 54.85% | 1: gall | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760634 | 54.85% | 3: crow-king, sitting-bull, two-moons | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | not destroyed | none |
| 18760635 | 54.85% | 0: none | 0/0/0 | co-e, co-f, lwm-band | not destroyed | none |
| 18760636 | 52.07% | 0: none | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760637 | 57.63% | 0: none | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | 1763 | none |
| 18760638 | 57.63% | 2: crow-king, gall | 0/0/0 | co-e, co-f, crow-king-band, hunkpapa-pool | not destroyed | none |
| 18760639 | 55.71% | 0: none | 0/0/0 | co-c, co-e, co-f, co-l, co-m, lwm-band | 1878 | none |
| 18760640 | 54.85% | 0: none | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760641 | 57.63% | 0: none | 0/0/0 | co-e, co-f, crow-king-band | 1776 | none |
| 18760642 | 54.85% | 1: two-moons | 0/0/0 | co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760643 | 54.85% | 0: none | 0/0/0 | co-c, co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760644 | 52.93% | 1: custer | 0/0/0 | co-e, co-f | not destroyed | none |
| 18760645 | 57.63% | 3: custer, gall, yates | 0/0/0 | co-c, co-e, co-f | not destroyed | none |
| 18760646 | 55.71% | 0: none | 0/0/0 | co-e, co-f, co-m, crow-king-band | not destroyed | none |
| 18760647 | 44.59% | 0: none | 0/0/0 | co-c, co-e, co-f, co-l | not destroyed | none |
| 18760648 | 54.85% | 1: sitting-bull | 0/0/0 | co-e, co-f, hunkpapa-pool | not destroyed | none |
| 18760649 | 60.41% | 2: keogh, sitting-bull | 0/0/0 | co-c, co-e, co-f, crow-king-band | 1771 | none |
