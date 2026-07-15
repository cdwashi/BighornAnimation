# Codex report — M1-A terrain pipeline

## Status

**BLOCKED at G2.** The implementation and processed assets are complete. Typecheck,
lint, and build pass; G1, G3, G4, and G5 pass. `npm test` fails only because the
official USGS DEM at the scenario coordinates places Sharpshooter Ridge 9.25 m below
Reno Hill, contrary to the blocking ordinal required by G2. No coordinate, projection,
datum, elevation, or test constant was altered to force a pass.

The checkout was not committed or pushed. Nothing under `docs/` was modified.

## Source and reproducibility

- TNM product: `USGS 1/3 Arc Second n46w108 20241115`
- Raw cache file: `USGS_13_n46w108_20241115.tif` (417,921,009 bytes)
- SHA-256: `71d1d2c42cfa4c456980b27e26ce22ffc4afb3ac271526bd2ce3b2b53c455457`
- Cache location: `pipeline/cache/` (gitignored)
- Horizontal datum: NAD83; projected with `proj4` to UTM zone 13N
- Vertical datum: NAVD88, meters
- Local origin: WGS84 SW corner `(45.42, -107.48)`; UTM
  `(305972.14441500703, 5032600.677413359)`
- A second full run verified the cached checksum, skipped API/download work, and
  reproduced every processed-asset SHA-256 exactly. A final full run after the ford
  mask refinement also completed successfully; its raster stage then reproduced all
  final processed-asset hashes unchanged.

## Files and line counts

### Modified configuration

| File | Lines | Purpose |
|---|---:|---|
| `.gitignore` | 5 | Ignores `pipeline/cache/` |
| `package.json` | 27 | Adds the four allowed runtime dependencies, two needed external type packages, and `terrain` script |
| `package-lock.json` | 3,245 | Dependency lock update |
| `tsconfig.json` | 14 | Includes `pipeline/**/*.ts` and pipeline declarations while keeping `build = tsc -b` |

### New source and test files

| File | Lines |
|---|---:|
| `pipeline/node-ambient.d.ts` | 39 |
| `pipeline/shared.ts` | 195 |
| `pipeline/fetch-dem.ts` | 140 |
| `pipeline/build-grids.ts` | 168 |
| `pipeline/derive.ts` | 182 |
| `pipeline/rasterize-vectors.ts` | 225 |
| `src/terrain/loader.ts` | 170 |
| `src/terrain/raycast.ts` | 113 |
| `tests/terrain-gates.test.ts` | 189 |
| `codex-report-m1a.md` | 266 |

### Processed terrain assets

| File | Lines | Bytes |
|---|---:|---:|
| `manifest.json` | 147 | 4,048 |
| `contours-core.geojson` | 1,790,735 | 42,975,407 |
| `elevation-core.i16` | binary | 3,044,262 |
| `elevation-core.i16.br` | binary | 1,092,908 |
| `elevation-full.i16` | binary | 1,219,680 |
| `elevation-full.i16.br` | binary | 693,032 |
| `slope-core.u8` | binary | 1,522,131 |
| `slope-core.u8.br` | binary | 447,145 |
| `slope-full.u8` | binary | 609,840 |
| `slope-full.u8.br` | binary | 253,100 |
| `hillshade-core.png` | binary | 1,906,445 |
| `hillshade-full.png` | binary | 1,093,036 |
| `cover-kind-core.u8` | binary | 1,522,131 |
| `cover-kind-core.u8.br` | binary | 861 |
| `movement-cost-core.f32` | binary | 6,088,524 |
| `movement-cost-core.f32.br` | binary | 502,672 |

## Grid dimensions and byte sizes

| Tier | Resolution | Dimensions | Cells | Elevation Int16 | Slope Uint8 | Hillshade PNG |
|---|---:|---:|---:|---:|---:|---:|
| core | 10 m | 1,209 × 1,259 | 1,522,131 | 3,044,262 bytes | 1,522,131 bytes | 1,906,445 bytes |
| full | 30 m | 880 × 693 | 609,840 | 1,219,680 bytes | 609,840 bytes | 1,093,036 bytes |

Core raster extras: cover-kind 1,522,131 bytes; movement-cost 6,088,524 bytes.
The full hillshade was visually inspected and has coherent, correctly oriented NW-lit
relief. Contours contain 40 elevation levels at 5 m intervals with 25 m index flags.

## `npm run terrain` log excerpt

```text
> bighorn-animation@0.1.0 terrain
> npm run build && node dist/pipeline/fetch-dem.js && node dist/pipeline/build-grids.js && node dist/pipeline/derive.js && node dist/pipeline/rasterize-vectors.js


> bighorn-animation@0.1.0 build
> tsc -b

[fetch] checksum verified USGS_13_n46w108_20241115.tif sha256=71d1d2c42cfa4c456980b27e26ce22ffc4afb3ac271526bd2ce3b2b53c455457
[fetch] cached download is valid; skipping API query and download
[grids] reading USGS_13_n46w108_20241115.tif
[grids] core: sampling 1209x1259 at 10 m
[grids] wrote elevation-core.i16 (3044262 bytes)
[grids] full: sampling 880x693 at 30 m
[grids] wrote elevation-full.i16 (1219680 bytes)
[grids] wrote manifest.json
[derive] wrote slope-core.u8 and hillshade-core.png
[derive] wrote slope-full.u8 and hillshade-full.png
[derive] wrote contours-core.geojson (40 elevation levels)
[derive] updated manifest.json
[rasterize] river burned 1287 cells; fords burned 18 cells
[rasterize] wrote cover-kind-core.u8, movement-cost-core.f32, and manifest.json
[rasterize] warning: cover timber-loop is a zero-area O4 placeholder; empty burn expected
[rasterize] warning: cover village-strip is a zero-area O4 placeholder; empty burn expected
[rasterize] warning: cover deep-ravine-cover is a zero-area O4 placeholder; empty burn expected
```

## G1–G5 results

| Gate | Result | Evidence |
|---|---|---|
| G1 | PASS | Manifest/assets coherent; both hillshades non-empty; 40 contour levels; river 1,287 cells; fords 18 cells |
| G2 | **FAIL — blocking** | All ordinals pass except Sharpshooter Ridge `1025.7129 m >` Reno Hill `1034.9593 m`; actual relation is lower by `9.2464 m` |
| G3 | PASS, with numerical ambiguity noted below | 24 km flat ray visible with correction off and blocked with correction on; raw earth drop `45.20 m`; k=0.13 effective-radius drop `39.33 m` |
| G4 | PASS | Reno Hill → Last Stand Hill is blocked; first blocker about `489.77 m` along a `6,601.95 m` ray, standing heights 1.7 m |
| G5 | PASS | 100 deterministic core-grid samples round-trip within 0.05 m quantization tolerance |

G2 sampled elevations (meters):

| Landmark | Elevation |
|---|---:|
| Last Stand Hill | 1006.6592 |
| Deep Ravine | 1004.6885 |
| Ford B | 945.2581 |
| Reno Hill | 1034.9593 |
| Ford A | 957.9127 |
| Weir Point | 1041.7486 |
| Sharpshooter Ridge | 1025.7129 |

The four available official TNM `n46w108` 1/3-arc-second revisions (`20210607`,
`20211122`, `20240325`, `20241115`) were range-read directly at Reno Hill and
Sharpshooter Ridge. Each returned the same nearest-pixel values (`1034.9626 m` and
`1025.7921 m`, respectively), so selecting an older product cannot resolve G2.

## Quartet command outputs (verbatim)

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit code: 0.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit code: 0.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 42

 ✓ tests/data-integrity.test.ts (13 tests) 116ms
stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON
[gate] G1 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":945.2581490379806,"renoHill":1034.959347093062,"fordA":957.9127058576502,"weirPoint":1041.7486488377403,"sharpshooterRidge":1025.7129037167515}

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target
[gate] G4 PASS blockedAt=489.77m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance
[gate] G5 PASS samples=100 tolerance=0.05m

 ❯ tests/terrain-gates.test.ts (5 tests | 1 failed) 329ms
   ✓ M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON 263ms
   × M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships 12ms
     → expected 1025.7129037167515 to be greater than 1034.959347093062
   ✓ M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction 2ms
   ✓ M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target 1ms
   ✓ M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance 7ms

⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
AssertionError: expected 1025.7129037167515 to be greater than 1034.959347093062
 ❯ tests/terrain-gates.test.ts:113:38
    111|     expect(values.renoHill).toBeGreaterThan(values.fordA);
    112|     expect(values.weirPoint).toBeGreaterThan(values.fordB);
    113|     expect(values.sharpshooterRidge).toBeGreaterThan(values.renoHill);
       |                                      ^
    114|     console.info('[gate] G2 PASS');
    115|   });

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯


 Test Files  1 failed | 1 passed (2)
      Tests  1 failed | 17 passed (18)
   Start at  21:22:23
   Duration  1.53s (transform 378ms, setup 0ms, collect 529ms, tests 445ms, environment 1ms, prepare 573ms)
```

Exit code: 1.

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -b
```

Exit code: 0.

## AMBIGUITIES

1. **G2 source/spec conflict (blocking):** the required Sharpshooter Ridge > Reno
   Hill ordinal is contradicted by every available TNM revision at the scenario's
   authored coordinates. Resolving this requires owner review of the landmark
   coordinate or the gate; the pipeline does not have authority to change either.
2. **D23 numerical wording:** a 24 km raw-earth drop is 45.20 m, but the required
   standard `k=0.13` effective-radius method produces 39.33 m. The implementation
   uses the standard effective radius for obstruction geometry, exposes both values,
   asserts the work order's 40–50 m band against raw earth drop, and separately
   asserts the corrected 39.3 m value.
3. **Movement-cost semantics:** no slope-factor formula or unit bridge from a
   multiplicative cost to `crossingPenaltyMinutes` is supplied. The implementation
   uses `1 + tan(slope)` and then literally multiplies by cover `movementFactor` as
   ordered; river is `Infinity`; ford cells contain the stated penalty minutes. Both
   assumptions are flagged with `TODO-AMBIGUOUS(M1-A)` comments.
4. **Ford footprint/channel mismatch:** no ford-cell radius is specified, and the
   coarse placeholder river does not put every authored ford point on the burned
   channel. The implementation burns a one-cell-radius marker plus the nearest river
   cell, ensuring each ford opens the impassable river mask. This is flagged in code.
5. **Historical correction geometry:** `river-1876-channel` currently duplicates the
   base river and says O4 is open. It is nevertheless honored as the replacement
   geometry; the zero-area cover burns remain warnings, as required.
6. **Repo-state note mismatch:** the work order says HEAD is `3c2f1f8`, but the clean
   checkout started at `2d3a34b`; `3c2f1f8` is its immediate parent. Work proceeded
   on the supplied clean `2d3a34b` tree without changing history.

## Deviations

- **Exit criteria not met:** `npm test` is red solely at blocking G2 for the verified
  source/spec conflict above. The failing gate was retained rather than weakened.
- **G3 assertion interpretation:** because the simultaneously mandated `k=0.13`
  effective-radius result is 39.33 m, the requested 40–50 m assertion is applied to
  the exposed raw-earth drop (45.20 m), while the actual effective correction is
  separately asserted. This preserves the standard D23 math and records the conflict.
- No extra runtime dependency or TypeScript runner was added. `geotiff` and `proj4`
  ship their own declarations; only `@types/d3-contour` and `@types/pngjs` were needed.
