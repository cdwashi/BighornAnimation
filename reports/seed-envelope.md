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

- Median composite: **46.30%**
- Eligible no-rare-event candidates: **0** (none)
- Rule: composite percentile 0.4–0.6; interquartile numeric outcomes; categorical occurrence frequency must exceed 10.0%.

## Composite distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Composite | 36.05% | 43.53% | 46.30% | 54.64% | 60.19% | 48.56% |

## Component distributions

| Component | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| C1 | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% | 50.00% |
| C2 | 11.11% | 33.33% | 44.44% | 77.78% | 100.00% | 53.78% |
| C3 | 7.69% | 15.38% | 15.38% | 15.38% | 15.38% | 15.08% |
| C4 | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% | 92.31% |

## Leader-death distribution

| Death count | Seeds | Share |
|---:|---:|---:|
| 0 | 21 | 42.0% |
| 1 | 21 | 42.0% |
| 2 | 6 | 12.0% |
| 3 | 1 | 2.0% |
| 4 | 1 | 2.0% |

| Leader | Seeds killed | Share |
|---|---:|---:|
| reno | 8 | 16.0% |
| lame-white-man | 5 | 10.0% |
| moylan | 5 | 10.0% |
| keogh | 4 | 8.0% |
| two-moons | 4 | 8.0% |
| crow-king | 3 | 6.0% |
| french | 3 | 6.0% |
| calhoun | 2 | 4.0% |
| crazy-horse | 2 | 4.0% |
| yates | 2 | 4.0% |
| custer | 1 | 2.0% |
| gall | 1 | 2.0% |

## Arikara loss distribution

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Killed | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Wounded | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |
| Total losses | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 | 0.00 |

## Rout-composition frequency

| Unit | Seeds routed | Share |
|---|---:|---:|
| crow-scouts | 30 | 60.0% |
| co-e | 17 | 34.0% |
| co-f | 17 | 34.0% |
| lwm-band | 9 | 18.0% |
| co-a | 5 | 10.0% |
| co-d | 2 | 4.0% |
| co-g | 2 | 4.0% |
| co-m | 2 | 4.0% |

## Wing-destruction distribution

- Complete wing destruction: **17/50 seeds**.

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Simulation minute | 866.00 | 869.00 | 870.00 | 871.00 | 873.50 | 869.88 |

## Ford-choke composition (within 250 m of Ford A)

| Unit | Seeds present | Killed | Wounded |
|---|---:|---:|---:|

## Historical-envelope checks

| Outcome | History inside observed envelope? | Comparison |
|---|---|---|
| Modeled documented leader identities | YES | required=custer, yates, keogh, calhoun, lame-white-man; observed=calhoun, crazy-horse, crow-king, custer, french, gall, keogh, lame-white-man, moylan, reno, two-moons, yates |
| Arikara killed | NO | historical=3–3; observed=0–0 |
| Rout composition | YES | required=co-a, co-g, co-m; observed=co-a, co-d, co-e, co-f, co-g, co-m, crow-scouts, lwm-band |
| Wing destruction minute | NO | historical=825–840; observed=866.0–873.5 |
| Ford-choke composition | NO | expected=co-a, co-g, co-m; observed=none |

These checks are adjudicated by D80/G-M5-2 during M5-B.

> D85: Bloody Knife is modeled as an ordinary Arikara-attached leader; any death reported above emerges only from standard leader-exposure rolls.
> TODO-AMBIGUOUS(M5-A): D80/D82 do not specify a ford-choke radius; extraction reuses the 250 m operational radius documented in `codex-report-m4a-d74.md`.

## Per-seed outcomes

| Seed | Composite | Leader deaths | Arikara K/W/L | Routed units | Wing destruction tick | Ford choke |
|---:|---:|---|---|---|---:|---|
| 18760600 | 49.08% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760601 | 54.64% | 1: reno | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1741 | none |
| 18760602 | 49.08% | 1: french | 0/0/0 | crow-scouts | not destroyed | none |
| 18760603 | 54.64% | 0: none | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1742 | none |
| 18760604 | 46.30% | 1: keogh | 0/0/0 | none | not destroyed | none |
| 18760605 | 46.30% | 1: reno | 0/0/0 | none | not destroyed | none |
| 18760606 | 43.53% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760607 | 46.30% | 1: reno | 0/0/0 | crow-scouts | not destroyed | none |
| 18760608 | 46.30% | 1: moylan | 0/0/0 | crow-scouts | not destroyed | none |
| 18760609 | 57.41% | 1: yates | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1739 | none |
| 18760610 | 43.53% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760611 | 46.30% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760612 | 36.05% | 0: none | 0/0/0 | co-d, crow-scouts | not destroyed | none |
| 18760613 | 43.53% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760614 | 54.64% | 1: moylan | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1742 | none |
| 18760615 | 57.41% | 1: gall | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1742 | none |
| 18760616 | 54.64% | 0: none | 0/0/0 | co-e, co-f, crow-scouts | 1737 | none |
| 18760617 | 46.30% | 2: crazy-horse, moylan | 0/0/0 | crow-scouts | not destroyed | none |
| 18760618 | 43.53% | 1: reno | 0/0/0 | none | not destroyed | none |
| 18760619 | 43.53% | 1: calhoun | 0/0/0 | none | not destroyed | none |
| 18760620 | 46.30% | 1: keogh | 0/0/0 | co-a | not destroyed | none |
| 18760621 | 49.08% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760622 | 54.64% | 0: none | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1738 | none |
| 18760623 | 46.30% | 2: keogh, lame-white-man | 0/0/0 | none | not destroyed | none |
| 18760624 | 43.53% | 1: reno | 0/0/0 | none | not destroyed | none |
| 18760625 | 54.64% | 0: none | 0/0/0 | co-e, co-f | 1747 | none |
| 18760626 | 43.53% | 1: lame-white-man | 0/0/0 | co-a | not destroyed | none |
| 18760627 | 43.53% | 1: lame-white-man | 0/0/0 | co-a | not destroyed | none |
| 18760628 | 43.53% | 1: french | 0/0/0 | co-a, co-g, co-m, crow-scouts | not destroyed | none |
| 18760629 | 57.41% | 2: custer, yates | 0/0/0 | co-e, co-f, crow-scouts | 1743 | none |
| 18760630 | 60.19% | 0: none | 0/0/0 | co-e, co-f, crow-scouts | 1743 | none |
| 18760631 | 51.86% | 0: none | 0/0/0 | co-e, co-f | 1733 | none |
| 18760632 | 46.30% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760633 | 38.82% | 3: crow-king, lame-white-man, moylan | 0/0/0 | co-d, crow-scouts | not destroyed | none |
| 18760634 | 43.53% | 4: crow-king, french, moylan, two-moons | 0/0/0 | co-a, co-g, co-m, crow-scouts | not destroyed | none |
| 18760635 | 43.53% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760636 | 46.30% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760637 | 46.30% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760638 | 51.86% | 2: lame-white-man, two-moons | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1740 | none |
| 18760639 | 40.75% | 1: reno | 0/0/0 | crow-scouts | not destroyed | none |
| 18760640 | 57.41% | 1: keogh | 0/0/0 | co-e, co-f, crow-scouts | 1735 | none |
| 18760641 | 57.41% | 1: two-moons | 0/0/0 | co-e, co-f, lwm-band | 1739 | none |
| 18760642 | 46.30% | 2: crow-king, reno | 0/0/0 | crow-scouts | not destroyed | none |
| 18760643 | 46.30% | 0: none | 0/0/0 | none | not destroyed | none |
| 18760644 | 46.30% | 0: none | 0/0/0 | crow-scouts | not destroyed | none |
| 18760645 | 54.64% | 0: none | 0/0/0 | co-e, co-f, crow-scouts, lwm-band | 1740 | none |
| 18760646 | 60.19% | 2: calhoun, two-moons | 0/0/0 | co-e, co-f, crow-scouts | 1743 | none |
| 18760647 | 54.64% | 0: none | 0/0/0 | co-e, co-f, crow-scouts | 1732 | none |
| 18760648 | 46.30% | 1: crazy-horse | 0/0/0 | none | not destroyed | none |
| 18760649 | 43.53% | 1: reno | 0/0/0 | none | not destroyed | none |
