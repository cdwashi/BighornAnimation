# O3-A Crow's Nest sensitivity sweep

## Scope and method

Phase 1 only. This report does not select or apply a Crow's Nest coordinate. It sweeps 1,681 cells on a 41×41 local-UTM grid, ±2,000 m from OSM candidate #1 at 100 m spacing. Each observer is DEM ground + 1.7 m. Both sight lines call the shared `src/terrain/raycast.ts` implementation with curvature enabled and refraction `k=0.13`.

The MUST-FLIP target is the pony-herd bench at 45.535000, -107.460000. The informational village target is the arithmetic midpoint of the D53 `village-s-end` and `village-n-end` landmarks, 45.537165, -107.417650. Village `BLOCKED` is historically consistent and is not disqualifying.

There is no weighted or blended score. Ranking is lexicographic and preserves separate results in this order: pony ray CLEAR (required), elevation-band pass, pocket-signature pass, 14–15 mile village-distance pass, then distance to the trail proxy. Remaining deviations and pocket relief break ties deterministically. The village ray verdict is reported but does not rank cells.

### Operationalized secondary criteria

- Elevation: PASS at 1,340–1,360 m.
- Pocket morphology: PASS when a 30 m-spaced sample within 300 m is at least 20 m lower than the observation cell; the table reports the maximum observed drop and its distance.
- Davis Creek divide trail: a DEM-only smooth low-corridor proxy through rows 100 m apart in a strip 100–800 m east of candidate #1. Adjacent proxy vertices may shift at most 200 m laterally; the path cost is row-relative elevation plus 0.05 m per lateral meter. Proxy endpoints are 45.427577, -107.129578 and 45.463581, -107.129655; closest approach to the OSM point is 600 m.
- Valley distance: PASS when straight-line distance to the village-center target is 14–15 miles. This is separate from the village ray verdict.

### Coverage assertion

PASS. Before every shared raycast, the entire observer-to-target segment was sampled at no more than 15 m (half the 30 m full-tier resolution), including both endpoints, and every one of 5,728,796 coverage samples returned finite DEM elevation inside the extended grid. The full tier is 984×696, east bound -107.11; no ray has an unsampled foreground gap.

## Top 10 cells

| Rank | Coordinate (WGS84) | Elevation band | Pony-herd MUST-FLIP | Village verdict + 14–15 mi | Pocket morphology | Trail distance |
|---:|---|---|---|---|---|---:|
| 1 | 45.445400, -107.139200 | 1353.7 m (PASS) | CLEAR; 26.98 km | BLOCKED; 24.04 km / 14.94 mi (PASS) | PASS; 91.8 m lower @ 300 m | 600 m |
| 2 | 45.445376, -107.140478 | 1342.7 m (PASS) | CLEAR; 26.89 km | BLOCKED; 23.95 km / 14.88 mi (PASS) | PASS; 66.3 m lower @ 277 m | 700 m |
| 3 | 45.435386, -107.145214 | 1351.3 m (PASS) | CLEAR; 26.99 km | BLOCKED; 24.12 km / 14.98 mi (PASS) | PASS; 65.2 m lower @ 300 m | 1300 m |
| 4 | 45.428070, -107.151329 | 1344.9 m (PASS) | CLEAR; 26.90 km | BLOCKED; 24.09 km / 14.97 mi (PASS) | PASS; 52.9 m lower @ 297 m | 1700 m |
| 5 | 45.438371, -107.129984 | 1353.5 m (PASS) | CLEAR; 27.95 km | BLOCKED; 25.03 km / 15.55 mi (FAIL) | PASS; 77.5 m lower @ 300 m | 100 m |
| 6 | 45.440099, -107.133885 | 1343.6 m (PASS) | CLEAR; 27.59 km | BLOCKED; 24.67 km / 15.33 mi (FAIL) | PASS; 63.8 m lower @ 295 m | 300 m |
| 7 | 45.439199, -107.133851 | 1344.9 m (PASS) | CLEAR; 27.63 km | BLOCKED; 24.71 km / 15.36 mi (FAIL) | PASS; 59.7 m lower @ 300 m | 316 m |
| 8 | 45.438300, -107.133817 | 1354.8 m (PASS) | CLEAR; 27.67 km | BLOCKED; 24.76 km / 15.39 mi (FAIL) | PASS; 59.4 m lower @ 297 m | 361 m |
| 9 | 45.438276, -107.135095 | 1354.6 m (PASS) | CLEAR; 27.58 km | BLOCKED; 24.67 km / 15.33 mi (FAIL) | PASS; 57.0 m lower @ 300 m | 447 m |
| 10 | 45.443625, -107.137854 | 1346.0 m (PASS) | CLEAR; 27.15 km | BLOCKED; 24.22 km / 15.05 mi (FAIL) | PASS; 69.8 m lower @ 297 m | 510 m |

## Candidate #1 own cell

Candidate #1 is retained as its own row and is not merged with the sweep winner.

| Cell | Coordinate (WGS84) | Elevation band | Pony-herd MUST-FLIP | Village verdict + 14–15 mi | Pocket morphology | Trail distance |
|---|---|---|---|---|---|---:|
| OSM #1 | 45.445400, -107.139200 | 1353.7 m (PASS) | CLEAR; 26.98 km | BLOCKED; 24.04 km / 14.94 mi (PASS) | PASS; 91.8 m lower @ 300 m | 600 m |

## Pass/fail map summary

MUST-FLIP only: 325 CLEAR, 1356 BLOCKED. North is up; west is left. `C` = CLEAR, `x` = BLOCKED, `O/o` = OSM cell clear/blocked, `B` = best-ranked cell, and `*` would mean the OSM and best cells coincide. Each character is one 100 m cell.

```text
north | west → east
 2000 | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1900 | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1800 | xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1700 | xxxxxxxxxxCCxCCxxxxxxxxxxxxxxxxxxxxxxxxxx
 1600 | xxxxxxxxCCCCxCCxxxxxxxxxxxxxxxxxxxxxxxxxx
 1500 | xxxxxxxxxCCCCCCxxxxxxxxxxxxxxxxxxxxxxxxxx
 1400 | xxxxxxxxxxCCCxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1300 | xxxxxxxxxxCCCxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1200 | xxxxxxxxxCCCCxxxxxxxxxxxxxxxxxxxxxxxxxxxx
 1100 | xxxxxxxxxCCCxxxxxxxxxxxxxxxxxxxxCxxxxxxxx
 1000 | xxxxxxCCCCCCxxxxxxxxxxxxxxxxxxxxCxxxxxxxx
  900 | xxxxxxxxCCCxxxxCxxxxxxCxxxxxxxxCxxxxxxxxx
  800 | xxxxxxxxCCCxxxxCCCCCxCCxxxxxxxxCCxxxxxxxC
  700 | xxxxxxxxCCxxxxxCCCxxCCCxxxxxxxCxCxxxxxxCx
  600 | xxxxxxxxCCxxxxxCCCxxxCCxxxxxxxCCCxxxxxxxx
  500 | xxxxxxxxxCxxxxxxCCxxxCxxxxxxxxxCxxxxxxxxx
  400 | xxxxxxxxxxCxxxxxxCxxCCxxxxxxxxxxCxxxxxxxx
  300 | xxxxxxxxxxCxxxxxxCCxCxxxxxxxxxxxxxxxxxxxx
  200 | xxxxxxxxxxCxxxxCCCCCxxxxxxxxxxxxxxxxxxxxx
  100 | xxxxxxxxCCxxxxCCCCxCxxxxxxxxxxxxxxxxxxxxx
    0 | xxxxxxxxCxxxxxxCCCCC*xxxxxxxxxxxxxxxxxxxx
 -100 | xxxxxxxxCxxxxxxxCCCxCxxxxxxxxxxxxxxxCCxCx
 -200 | xxxxxxxCCxxxxxxxxCxCCCxxxxxxxxxxxxxxxxCxx
 -300 | xxxxCCCCCxxxCxxxxxCCCxxxxxxxxxxxxxxxxxxCx
 -400 | xxxCCCCCxxxxCCxxCxxxxCxxxxxxxxxxxxxxxxxCC
 -500 | xxxxCCCCxxxxCCxxCxxCCCCCCxxxxxxxxxxxxxxCC
 -600 | xxxxCCCxxxxxCCxxCxxCxxxCCxxxxxxxxxxxxxxxC
 -700 | xxxxCCCxxxxCxCCxxxxxxxCCCxxxxxxxxxxxxxxxx
 -800 | xxxxxxCxCxxxxCCCxxxxxCCCCxxCxxxxxxxxxxxxx
 -900 | xxxxxCCCCxxxxxxCCxxxxCCCCxCxxxxxxxxxxxxxx
-1000 | xxxxxCCCCxxCCCCxCCxxxCCCxxxxxxxxxxxxxxxxx
-1100 | xxxxxCCCCxxxCCCCxCxxCCCxxxxxxxxxxxxxxxxCC
-1200 | xxxxxCCCxxxxCCCCxxxCCCCxxxxxxxxxxxxxxxCCC
-1300 | xxxxxxCCxxxxxCCCxCxCCCxxxxxxxxxxxxxxxxxCC
-1400 | CCxxxxCCxxxxxxxCCxxCxxxxxxxxxxxxxxxxxxxxx
-1500 | CCxxxxCxxxxxxxxxxxxxxxCxxxxxxxxxxxxxxxxxx
-1600 | CxxxxxCxxxxxxxxxCCCCCCCxxxxxxxxxxxxxxxxxx
-1700 | CCxxxCxxxxxCCCxxxCCCCCCCxxxxxxxxxxxxxxxxx
-1800 | CCxxxxxCxxCCCxxxxCCCCCCCxxxxxxxxxxxxxxxxx
-1900 | CCCxxxxxxCCCCxxxxCCCCCCxxxxxxxxxxxxxxxxxx
-2000 | CCCxxxCxxxCCxxxxxCCCCCCxxxxxxxxxxxxxxxxxx
```

Separate full-grid criterion counts (not a composite score):

| Criterion | PASS/CLEAR | FAIL/BLOCKED |
|---|---:|---:|
| Pony-herd MUST-FLIP | 325 | 1356 |
| Village ray (informational) | 0 CLEAR | 1681 BLOCKED |
| Elevation 1,340–1,360 m | 81 | 1600 |
| Pocket signature | 1210 | 471 |
| Village distance 14–15 mi | 683 | 998 |

## Best-scoring cell vs. OSM point — separate comparison

The lexicographically best cell is 45.445400, -107.139200. The OSM-stated point is 45.445400, -107.139200. Their local-UTM separation is 0 m. These coordinates are reported separately; neither is written to scenario landmarks or observation events in Phase 1.

## AMBIGUITIES

- TODO-AMBIGUOUS(O3-A): the dossier fixes a hollow within 300 m but not the relief threshold or sampling lattice. This sweep uses a ≥20 m drop on a 30 m lattice as a reproducible concealable-relief signature.
- TODO-AMBIGUOUS(O3-A): the dossier does not supply trail vertices or a numeric meaning for “just east.” The 100–800 m east-side DEM low-corridor proxy and its continuity parameters are an operationalization, not a claimed 1876 trail reconstruction.
- TODO-AMBIGUOUS(O3-A): “village center” is not a scenario landmark. The target is the arithmetic midpoint of the two D53 village-end landmarks; both target heights are 1.7 m because the work order fixes only observer height.
- TODO-AMBIGUOUS(O3-A): the work order forbids blending but does not prescribe tie-breaking among secondary constraints. The documented lexicographic order supplies a deterministic ranking without averaging or weighting criteria.
