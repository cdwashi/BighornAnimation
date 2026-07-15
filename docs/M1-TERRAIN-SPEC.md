# M1-TERRAIN-SPEC — Terrain Pipeline (little-bighorn-1876)

Status: DRAFT for Chuck's review. Proposed decisions numbered D20–D25 for the
IMPLEMENTATION_HISTORY log on approval. Open questions for Chuck at the bottom.

## 1. Objective

Produce the terrain data that everything downstream stands on: an elevation grid the
engine can raycast, movement-cost and cover grids, rendered contours/hillshade for the
map, and the 1876 corrections — plus resolution of O3 (Crow's Nest coordinate) and
O4 (1876 river channel). Exit criteria in §8.

## 2. Source data

**D20 — DEM: USGS 3DEP 1/3 arc-second (~10 m posting), GeoTIFF, via the USGS TNM
Access API**, clipped to the ratified bounds sw(45.42, −107.48) → ne(45.60, −107.15).
Rationale: free, seamless coverage, resolution adequate for battalion-scale LOS; the
battlefield is a preserved monument so the modern surface ≈ 1876 minus the river
(handled by O4). 1-meter 3DEP lidar exists for parts of Montana — recorded as an
upgrade path, not v1.

Grid size reality check: the box is ~20 km × 26 km ≈ 5.2 M cells at 10 m. As Int16
decimeters that's ~10 MB raw before compression — heavy for a static-export app.

**D20a — Two-tier grid:** core battlefield box (the valley, bluffs, and Custer field —
roughly 45.49–45.60 lat, −107.48 to −107.33 lon) at 10 m; the full box including the
eastern approach corridor and Crow's Nest at 30 m. The 30 m tier exists for the
approach-phase viewshed (Crow's Nest scene); the 10 m tier serves the battle. Engine
samples the finest tier available at a queried point.

## 3. Projection & units

**D21 — Project to UTM Zone 13N; engine works in local meters** with origin at the
SW corner of the full box. Authoring stays WGS84 (per schema); the pipeline emits the
projected grids plus the forward/inverse transform constants in grid metadata. All
engine distances, speeds, and LOS math are in meters — no degree math anywhere.

## 4. Pipeline stages (become the Codex work-order tasks)

1. **Fetch** — TNM API query for 1/3 arc-second products intersecting the bounds;
   download, mosaic if multiple tiles, clip.
2. **Project & resample** — to UTM 13N at 10 m (core) and 30 m (full); emit typed
   binary grids (Int16 decimeters) + JSON metadata (origin, resolution, dimensions,
   CRS constants, vertical datum).
3. **Derive** — slope grid (degrees, Uint8); hillshade raster (render-time asset);
   contours via marching squares (d3-contour or equivalent) as GeoJSON polylines.
   **D22 — contour interval 5 m with 25 m index contours** (valley-to-ridge relief is
   only ~100 m; 10 m intervals would be too sparse to read the coulees).
4. **Rasterize vectors** — cover polygons, river, fords, and 1876 corrections from
   scenario.json onto the core grid (Uint8 cover-kind layer + movement-cost layer
   combining slope, cover movementFactor, and river/ford rules).
5. **Landmark validation pass** — see §8 gates.
6. **Package** — write to `data/terrain/little-bighorn-1876/` with a manifest;
   gzip/brotli the grids; loader utility in `src/terrain/` with tests.

## 5. LOS technical requirements (engine contract this pipeline must serve)

- Raycast between two grid points sampling elevation at sub-cell steps (bilinear).
- Observer/target heights: mounted ≈ 2.4 m, standing ≈ 1.7 m, prone ≈ 0.3 m
  (constants in engine config, not data).
- **D23 — Earth curvature + atmospheric refraction correction (k ≈ 0.13) is
  REQUIRED**, not optional: the Crow's Nest sighting is ~24 km, where raw curvature
  drop is ~45 m — more than the relief of the village site itself. Without this
  correction the signature observation event of the whole project computes wrongly.
  Standard effective-earth-radius formulation; validated by the §8 gates.
- Cover opacity accumulates along the ray from the rasterized cover layer;
  atmosphericFactor from observation events multiplies in at evaluation time.

## 6. O3 protocol — pinning the Crow's Nest

The published marker coordinate is a decoy at the visitor site; the true overlook is
in the Wolf Mountains on private land. Resolution protocol:

1. Candidate gathering: GNIS feature query; coordinates or map plates from Gray
   (1991) and Michno (1997); NPS historic resource studies.
2. **D24 — Viewshed adjudication:** score each candidate with our own LOS engine
   (with D23 correction) against the documented dawn observations — the village
   bench/pony-herd area (~45.53, −107.44) must be line-of-sight visible at ~24 km,
   and the candidate must sit near the 1876 divide trail. The candidate that best
   reproduces the historical sighting wins; confidence stays MEDIUM at best, note
   retained. (Using the sim to adjudicate its own input is legitimate here because
   the observation is HIGH-confidence ground truth.)
3. Until resolved, the 30 m tier + current APPROX coordinate remain in place; O3 is
   non-blocking for M1 completion but blocks the Crow's Nest scene in M3.

## 7. O4 protocol — 1876 river channel & timber

Sources: NPS Geologic Resources Inventory (2011) for LIBI (1891-vs-modern channel
discussion); the 1891 USGS battlefield survey; **Lt. Edward Maguire's official 1876
map** (timber belt, village extent, fords — a primary source we haven't exploited yet).

**D25 — Tiered approach; Tier A ships with M1:**
- **Tier A (v1):** adjust the channel polyline near Ford B and the Garryowen loop
  from the GRI report's figures and descriptions; digitize the 1876 timber belt
  approximately from the Maguire map image. Confidence LOW–MEDIUM, honestly flagged.
- **Tier B (backlog):** full georeferencing of the 1891 survey and Maguire map in
  QGIS with control points (requires some human-in-the-loop GUI work), tracing
  channel + timber precisely. Upgrades the corrections to MEDIUM–HIGH.

## 8. Validation gates (M1 exit criteria)

1. Contours + hillshade render for the full box; river and fords plot on the channel.
2. **Ordinal elevation checks** (testable without external truth): Last Stand Hill >
   Deep Ravine floor > river at Ford B; Reno Hill > Ford A; Weir Point > river;
   Sharpshooter Ridge > Reno Hill. Any violation fails the pipeline.
3. **Curvature demonstration test:** with D23 off, a synthetic 24 km flat-earth ray
   passes; with D23 on, the same ray drops ~45 m — proves the correction is live.
4. **Terrain-mask gate (pre-M3 smoke test):** from Reno Hill, the Last Stand Hill
   area must compute as NOT visible (per observation event: volleys audible, fight
   unseen). This one gate catches gross projection/datum errors better than any
   unit test.
5. Loader round-trip test: grid → loader → sampled elevations match source raster at
   random points within quantization tolerance.
6. Quartet green, as always.

## 9. Split of work

- **Fable:** this spec; O3 candidate adjudication (§6.2 scoring judgment); Tier A
  correction geometry review; final M1 review.
- **Codex (work order M1-A, to be written after this spec is approved):** pipeline
  scripts (§4), loader + tests, validation gates 1–3 and 5 as automated tests.
- **Chuck:** decisions below; optionally the Tier B QGIS session later.
- **Deep Research (optional, cheap):** one targeted run for O3 candidates — "published
  coordinates or map placements of the Crow's Nest vantage, Wolf Mountains MT, from
  Gray/Michno/NPS studies" — plus locating a scan of the Maguire 1876 map.

## 10. Open questions for Chuck

1. **Two-tier grid (D20a)** — approve, or prefer full-box 10 m (~10 MB asset,
   simpler code)?
2. **Tier A river correction for v1 (D25)** — approve shipping LOW–MEDIUM corrections
   now with Tier B backlogged, or hold M1 for Tier B precision?
3. **Contour interval 5 m (D22)** — any preference for the map's look? (Purely
   cosmetic; grid resolution is unaffected.)
