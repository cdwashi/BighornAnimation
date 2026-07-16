# O4-CORRECTIONS — Tier A river/timber/village geometry (little-bighorn-1876)

Companion data file: `o4-corrections-data.json` (channel polyline ×298 pts, 3 ford
placements, timber + village polygons, Garryowen flag zone — all with per-item
provenance). Proposed decisions D41–D44; D44 needs an explicit yes/no.

## Sources read this session
- **NPS GRI 2011** (KellerLynn, NRR—2011/407), full text: Martin (2010) finding
  that "the primary meander belt... has occupied the river-right [east] side of
  the valley **since the time of the Battle**"; Timmons & Wheeler (2010) finding
  that 1938–40 road work included "**the re-alignment of Medicine Tail Ford from
  its 1876 channel**"; sinuosity ~3 along the monument boundary; east banks to
  10 m; village on west-side terraces.
- USGS Fabric/NLDI APIs were located but robots-block data paths; superseded by
  the method below, which needs no external data at all.

## Method (D41)
The modern channel was recovered from **our own committed DEM** as the valley
thalweg: a windowed minimum-elevation walk northward through the 10 m core grid,
anchored at the USGS gauge (Ford A). The 10 m banks make the channel unambiguous
at grid resolution. Martin 2010 licenses using it as the 1876 meander-belt proxy;
the two documented 1876 deltas (Garryowen loop, Ford B reach) carry LOW flags.

**Validation:** 0 elevation reversals >1.5 m across 1,192 rows; monotone descent
957.9 → 921.2 m over 25.6 km; sinuosity 2.09 (GRI's ~3 is for the tightest
monument reach; the windowed walk shortcuts the tightest necks — noted in
provenance); trace passes 4 m from the independently-sited USGS gauge.

## Rulings
- **D41 — Channel:** replace the 4-point placeholder with the 298-point DEM
  thalweg, confidence MEDIUM as 1876 proxy; Garryowen + Ford B zones LOW. The
  same polyline becomes `historicalCorrections.river-1876-channel` geometry.
- **D42 — Fords:** `ford-a` 45.49473,−107.39305 (validated, MEDIUM);
  `ford-b` → 45.5468,−107.4164 (snapped to channel; the 1938-realigned marker
  sits 336 m east of the river — GRI documents the realignment; LOW, "1876
  crossing was in this reach, exact point unknown");
  `retreat-crossing` → 45.52081,−107.38558 (channel point nearest Reno Hill,
  461 m from the defense site — matches bluff-base retreat/water-carrier
  accounts; MEDIUM). This dissolves M1-A ambiguity #4 and all three D40
  mechanisms.
- **D43 — Timber & village polygons (Tier A, LOW):** timber = the loop bend at
  45.526–45.534 + 250 m east-bank belt; village = 600 m west-bank strip,
  Garryowen reach → Ford B, on the terraces per GRI. Maguire-map georeferencing
  remains the Tier B upgrade path. The `timber` landmark moves to the loop
  centroid (~45.530,−107.417) with both-coordinates provenance per the D27
  convention.
- **D44 (NEEDS CHUCK'S RULING):** the `cp-reno-skirmish-line` and
  `cp-reno-timber` checkpoints were transcribed from research rows flagged
  APPROX/inference at ~45.53,−107.43 — a point we now know is ~1 km east of the
  actual river/timber. Proposal: relocate those two checkpoint positions to the
  corrected timber geometry (tolerances and times unchanged, provenance records
  both coordinates and why). This is source-geometry correction of LOW-confidence
  ground truth, **not** tuning checkpoints to fit a run — but because our rules
  treat checkpoints as sacred, it gets an explicit human yes/no rather than
  riding along silently. Without it, those two checkpoints will score against a
  point in the middle of open valley floor.

## Expected E5 effect
CC's earlier arithmetic: mounted retreat over real geometry ≈ 30–40 min →
`cp-reno-hill` drops from +95.5 to ordinary-miss territory. The walkaround
becomes impossible (channel now spans the full grid), the retreat ford is on the
cost grid, and the timber objective is off the channel line. Keogh remains the
one honest miss (M4's job). Gross-miss escalation still applies unchanged.
