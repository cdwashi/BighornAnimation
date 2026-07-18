# Codex Report — O3-A Phase 1

## Status

Phase 1 is complete and stopped. The DEM full-tier east bound is −107.11, the regenerated full tier is 984×696 at 30 m, and all raw/Brotli/gzip full-tier elevation and slope variants were emitted. All 16 core-tier artifacts are byte-identical to their pre-run versions by SHA-256.

The 41×41 sweep evaluated 1,681 cells using the shared `src/terrain/raycast.ts` implementation with curvature correction and `k=0.13`. There were 325 pony-herd CLEAR cells and 1,356 BLOCKED cells. Every village-center ray was BLOCKED. Candidate #1 itself is CLEAR to the pony-herd bench, lies in the 1,340–1,360 m elevation band, passes the operational pocket signature and 14–15 mile village-distance constraint, and ranks first under the documented non-blended lexicographic ordering.

No Crow's Nest landmark coordinate or observation-event `observerPosition` was changed. There was no C4 promotion, no Phase 2 work, and no commit or push.

## Delivered

- `data/scenarios/little-bighorn-1876/scenario.json`: only `terrain.dem.bounds.ne.lon` changed, −107.15 → −107.11.
- `pipeline/shared.ts`: matching full-tier builder bound changed to −107.11 because the current pipeline does not read the scenario bound.
- Regenerated full-tier terrain grids, manifest, hillshade, and raw/Brotli/gzip variants.
- `pipeline/o3-sweep.ts`: dependency-free O3-A sweep using the shared raycast.
- `reports/o3-sweep.md`: top 10, candidate #1 row, MUST-FLIP map/count summary, separate best-vs-OSM comparison, coverage assertion, and operational ambiguities.
- `tests/m3b-gates.test.ts`: two stale literal raster-dimension assertions made manifest-derived; no gate threshold, engine behavior, or UI code changed.

The app needs no code change: `app/battle-map.tsx` obtains full-tier local bounds from the manifest, and the loaders validate/use manifest width and height. The final static export consumed the regenerated manifest/assets and passed.

## Core-tier byte-identity proof

All post-run hashes exactly matched hashes captured before the authorized bound edit and terrain run.

| Artifact | SHA-256 | Result |
|---|---|---|
| `contours-core.geojson` | `0f0b4ff9c22c99ddd084892c7850cca2aa1efa6461868e0b580dd3d94f05ded2` | MATCH |
| `contours-core.geojson.br` | `52c2e5cd0cc7456a2291fd428f1838b1e0d2ae9d5045fa6f28d28d226c4e372d` | MATCH |
| `contours-core.geojson.gz` | `b65aa884cf5f23e78641e408f6c93f237d9e2711fccc67c0622bb7fdfb0f7c2d` | MATCH |
| `cover-kind-core.u8` | `b1a77fa4b966ec4891135cb13a63b87c2880716db39e90988a9d6a99798891e2` | MATCH |
| `cover-kind-core.u8.br` | `5cb7ae79d33ebaa03176dcacec7119c5f2e7362cb0833da6388534fd483f1284` | MATCH |
| `cover-kind-core.u8.gz` | `1408d3b5680d957102277378f708d23185dcd54d21438a18b376902124db602a` | MATCH |
| `elevation-core.i16` | `342c144bbe4ed2bb021d7a6b2a0922beac0793ce056b524a02f493ea2e163f47` | MATCH |
| `elevation-core.i16.br` | `ad5748a20184a7893b71d2baae1f9edbe527daed01eacd97585472dec1749c7f` | MATCH |
| `elevation-core.i16.gz` | `63bfbdcc853c79b273171cad7faf4e169bf338cf465d4d0275ca96634bfd4114` | MATCH |
| `hillshade-core.png` | `47bee743c6dab6ea24cac1791afb96a78ed9d5a7b20e403129cbfd3aae85bf34` | MATCH |
| `movement-cost-core.f32` | `240a42c33631dfe0f4bdf1b141d1e24d36e1251ad047433094caaa4b1e86f96f` | MATCH |
| `movement-cost-core.f32.br` | `729d35c85358d808cfb73d8b06618aab6409437141596221cbf1f8f9fc497637` | MATCH |
| `movement-cost-core.f32.gz` | `f830c591626ad75921690e069c00169288c219e807053bd01430b38facfdc62c` | MATCH |
| `slope-core.u8` | `1be3c7a7a86646495560d96e340d0401403461093b974e26304272bd0cb71161` | MATCH |
| `slope-core.u8.br` | `f76af7f8c90e367272dfe310b93c1d1b74269e968a8fc41735c492d779336f26` | MATCH |
| `slope-core.u8.gz` | `7c26a7f8ba147149231cc68979f0b334b782cd1a2abb794e45668347adb175d7` | MATCH |

Assertion output: `CORE_HASH_ASSERTION PASS 16/16`.

## Terrain regeneration excerpt

```text
[fetch] checksum verified USGS_13_n46w108_20241115.tif sha256=71d1d2c42cfa4c456980b27e26ce22ffc4afb3ac271526bd2ce3b2b53c455457
[fetch] cached download is valid; skipping API query and download
[grids] reading USGS_13_n46w108_20241115.tif
[grids] core: sampling 1209x1259 at 10 m
[grids] wrote elevation-core.i16 (3044262 bytes)
[grids] full: sampling 984x696 at 30 m
[grids] wrote elevation-full.i16 (1369728 bytes)
[grids] wrote manifest.json
[derive] wrote slope-core.u8 and hillshade-core.png
[derive] wrote slope-full.u8 and hillshade-full.png
[derive] wrote contours-core.geojson (40 elevation levels)
[derive] updated manifest.json
[rasterize] river burned 2903 cells; fords burned 15 cells
[rasterize] wrote cover-kind-core.u8, movement-cost-core.f32, and manifest.json
[rasterize] warning: cover deep-ravine-cover is a zero-area O4 placeholder; empty burn expected
```

## Sweep excerpt

```text
[o3] cells=1681 pony CLEAR=325 BLOCKED=1356
[o3] candidate 45.445400, -107.139200 elev=1353.7m pony=CLEAR village=BLOCKED pocket=PASS trail=600m
[o3] best 45.445400, -107.139200 distance-from-OSM=0m
[o3] coverage PASS samples=5728796 max-step=15m
[o3] wrote reports/o3-sweep.md
```

The full scored table, map, independent criterion counts, and separate best-vs-OSM comparison are in `reports/o3-sweep.md`.

## AMBIGUITIES

- TODO-AMBIGUOUS(O3-A): the dossier fixes a hollow within 300 m but not the relief threshold or sampling lattice. The sweep uses a ≥20 m drop on a 30 m lattice.
- TODO-AMBIGUOUS(O3-A): the dossier does not provide trail vertices or a numeric meaning for “just east.” The sweep uses a documented 100–800 m east-side DEM low-corridor proxy with continuity constraints.
- TODO-AMBIGUOUS(O3-A): “village center” is not a scenario landmark. The target is the arithmetic midpoint of the two D53 village-end landmarks; both target heights are 1.7 m because the work order fixes only observer height.
- TODO-AMBIGUOUS(O3-A): the work order prohibits blended scoring but does not prescribe secondary tie-breaking. A documented lexicographic order supplies deterministic ranking without averaging or weighting criteria.

## Deviations and findings

- `npm run terrain` invokes `npm run build`, but this repository's `tsconfig.json` has `noEmit: true`; the first prescribed run therefore used stale `dist/pipeline/shared.js` and reproduced the old 880×693 grid. No stale result was retained. Running `npx tsc --noEmit false --incremental false` emitted the current pipeline, after which the prescribed `npm run terrain` produced the correct 984×696 full tier. Build configuration was not patched outside this work order.
- The untouched first test run exposed stale V4 setup literals `880` and `693`; the raster correctly returned 984×696. The app had no hard-code. To meet the mandatory green quartet without patching UI or changing gate semantics, the two V4 setup assertions now compare against `terrain.viewshedElevationGrid().width/height`. This is a mechanical fixture update and a deviation from the note that E/V suites should be untouched; all gate thresholds and expected historical verdicts remain unchanged.
- Windows PowerShell 5 does not parse `&&`, so the literal chained quartet command could not run. The same four commands were run separately in order; their verbatim outputs follow.
- D59 was already present as the intentional working-tree change and was not re-appended.
- No app/UI source was patched. No landmark/event coordinate, C4 gate, E5 baseline, observation exam, or other Phase 2 artifact was changed.

## Final exit quartet output verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 39

✓ tests/m3c-interactions.test.ts (7 tests) 14ms
✓ engine/tests/variants.test.ts (3 tests) 28ms
✓ tests/m3d-interactions.test.ts (5 tests) 45ms
✓ tests/data-integrity.test.ts (13 tests) 298ms
stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON
[gate] G1 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":939.2357514637081,"renoHill":1034.959347093062,"fordA":957.904810237618,"weirPoint":1041.7486488377403,"sharpshooterRidge":1038.9672878067122}
[gate] G2 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target
[gate] G4 PASS blockedAt=489.77m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance
[gate] G5 PASS samples=100 tolerance=0.05m

✓ tests/terrain-gates.test.ts (5 tests) 377ms
✓ engine/tests/unit.test.ts (3 tests) 167ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 10/11 (90.9%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=132.57ms baseline=4554.33ms sweep=4684.33ms spottingOverhead=2.85%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — one entry per 23 orders plus each camp-defense activation
[gate] V6 PASS entries=29 orders=23 activations=6

✓ tests/m3b-gates.test.ts (3 tests) 18206ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"6b6291fb","360":"a91025cf","1080":"2a5a15f1","2160":"628e4176"},"sameB":{"1":"6b6291fb","360":"a91025cf","1080":"2a5a15f1","2160":"628e4176"},"different":{"1":"6b6291fb","360":"a91025cf","1080":"2a5a15f1","2160":"628e4176"}}

✓ engine/tests/m3a-gates.test.ts (6 tests) 45404ms
  ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run 28135ms
✓ engine/tests/gates.test.ts (6 tests) 50944ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 6930ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 18487ms

Test Files  9 passed (9)
Tests       51 passed (51)
Start at    11:54:55
Duration    53.00s (transform 2.57s, setup 0ms, collect 5.66s, tests 115.48s, environment 4ms, prepare 3.24s)
```

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -b && node scripts/prepare-app-assets.mjs && next build

  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/4) ...
   Generating static pages (1/4)
   Generating static pages (2/4)
   Generating static pages (3/4)
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    69.7 kB         157 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

No commit or push was performed.
