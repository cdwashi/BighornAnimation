# CODEX WORK ORDER — M1-A: Terrain pipeline + loader + validation gates

## Goal
Implement the terrain pipeline specified in `docs/M1-TERRAIN-SPEC.md` (approved
decisions D20–D25): fetch and process the DEM, derive grids and contours, rasterize
scenario vectors, and ship a tested loader plus a minimal raycast utility. Exit:
quartet green including the new validation-gate tests.

## Inputs (read first)
- `docs/M1-TERRAIN-SPEC.md` — authoritative. Sections §2–§5 and §8 define this task.
- `data/scenarios/little-bighorn-1876/scenario.json` — DEM bounds, landmarks, river,
  fords, cover polygons.
- `docs/CODEX-WORKORDER-O1.md` — house rules context (constraints style carries over).

## Scope boundaries
- IN: pipeline scripts, grids, contours, hillshade, loader, raycast utility, gate
  tests 1–5.
- OUT: O3 Crow's Nest adjudication, O4 Tier A correction geometry (arrive later as
  data), any engine/UI work, any modification under `docs/`.

## Constraints
- New dependencies allowed, exactly: `geotiff`, `proj4`, `d3-contour`, `pngjs`
  (+ their types). Nothing else without recording it as a deviation.
- Raw DEM downloads go to `pipeline/cache/` (gitignored). Processed outputs are
  committed assets.
- Network use is limited to USGS TNM/staging endpoints for DEM tiles.
- Ambiguity protocol as in O1: never guess silently; record in the report and flag
  in code comments.

## Tasks
1. `pipeline/fetch-dem.ts` — query the USGS TNM Access API for 1/3 arc-second 3DEP
   GeoTIFF product(s) intersecting bounds sw(45.42,−107.48) ne(45.60,−107.15) (likely
   a single 1° tile, n46w108); download to cache with checksum + resume-safe skip.
2. `pipeline/build-grids.ts` — read GeoTIFF; project to UTM 13N (proj4); resample:
   - core tier: lat 45.49–45.60, lon −107.48–−107.33 at 10 m
   - full tier: complete bounds at 30 m
   Emit Int16 decimeter binary grids + `manifest.json` (origin, resolution, dims,
   CRS constants incl. inverse transform, vertical datum, tier extents).
3. `pipeline/derive.ts` — slope grid (Uint8 degrees) per tier; hillshade PNG (Horn's
   method, NW illumination) per tier; contours from the core tier at 5 m interval
   with 25 m index flag (d3-contour), exported GeoJSON in WGS84.
4. `pipeline/rasterize-vectors.ts` — burn scenario.json river (+ crossing rules,
   fords passable), cover polygons, and historicalCorrections into a core-tier Uint8
   cover-kind layer and a Float32 movement-cost layer (slope factor × cover
   movementFactor; river cells impassable except ford cells with penalty).
   NOTE: O1 cover polygons are intentionally zero-area placeholders pending O4 —
   rasterizing them to empty layers is EXPECTED; log a warning, do not fail, and
   assert the river polyline itself burns non-empty.
5. `src/terrain/loader.ts` — load manifest + grids in Node and browser contexts;
   `elevationAt(lat,lon)` and `elevationAtMeters(x,y)` with bilinear sampling and
   automatic finest-tier selection.
6. `src/terrain/raycast.ts` — minimal standalone LOS: sample along ray at ≤half-cell
   steps, observer/target height params, **earth curvature + refraction correction
   (k=0.13, effective-radius method) per D23**, returns visible/blocked + blocking
   sample. (Engine wraps this later; keep it dependency-free.)
7. `tests/terrain-gates.test.ts` — the M1 exit gates as named tests:
   - G1: pipeline outputs exist, manifest coherent, contours non-empty GeoJSON.
   - G2 ordinal elevations (sample via loader at scenario landmark coords):
     Last Stand Hill > Deep Ravine > river@Ford B; Reno Hill > Ford A;
     Weir Point > river; Sharpshooter Ridge > Reno Hill. Blocking.
   - G3 curvature demo: synthetic flat terrain, 24 km ray — passes with correction
     off, drops ~45 m (assert 40–50 m) with correction on. Blocking.
   - G4 terrain-mask smoke test: raycast Reno Hill → Last Stand Hill (standing
     observer/target) must return BLOCKED. Blocking — if it fails, do NOT tune
     constants to force a pass; record as a projection/datum defect and stop (this
     escalates to Fable).
   - G5 loader round-trip: 100 random points, loader elevation ≈ source raster
     within quantization tolerance.
8. Wire `npm run terrain` to execute stages 1–4 in order, idempotently.

## Proof + output
`codex-report-m1a.md`: files + line counts, grid dimensions and byte sizes per tier,
the four quartet command outputs verbatim plus a `npm run terrain` log excerpt,
G1–G5 results, AMBIGUITIES, deviations. No commit/push; leave tree for review.
