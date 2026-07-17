# Codex Report — M3-B

## Status

M3-B is implemented: the Next.js 14 static-export app, browser gzip terrain path,
worker-backed reconstruction and scrubbing, 30 m POV viewshed, belief/reality/split
rendering, and chronological decision index are present. V4–V6 pass and the final
quartet is green with 39 tests.

One authoritative performance condition remains unmet and is not concealed:
M3-SPEC §4's `full day < 1 s` target. An isolated production simulation measured
4,878.3 ms in Node; the three required Chromium captures reported 5,219–5,699 ms
in the worker. Profiling identified A* route/re-route searches and production
spotting as the dominant costs. A state-equivalent scratch-array experiment did
not materially improve the result and was completely reverted. No historical
state or calibration was weakened to manufacture a passing number.

## Delivered

- Static-export Next.js 14 app using raw canvas and typed arrays; no component,
  canvas, or state-management library.
- Full-viewport hillshade/contour map with river, fords, cover, landmarks, and
  cartographic side-colored unit symbols with strength bars.
- Engine execution in a Web Worker, D37 keyframe scrubbing, live stepping,
  wall-clock timeline, speed controls, and order/spotting/camp event marks.
- All 18 leader POVs; 30 m radial viewshed with curvature, atmospheric factor,
  and shared D54 cover attenuation. Masked terrain receives a neutral scrim.
- Reality, belief, and split modes. In POV belief mode, never-seen enemies are
  absent, last-known enemies are dashed at their last-known position at 40%
  opacity, and currently spotted enemies are solid.
- Chronological decision index with 23 order entries and six visually distinct
  emergent camp-defense activations. Selection seeks to wall clock, selects the
  issuer POV, opens belief, and scrolls the chosen row into view.
- Browser loader uses `fetch` plus `DecompressionStream('gzip')`; Node retains
  the `.br` fallback through `node:zlib`.
- V5 imports the same `src/terrain/raycast.ts` core and the same exported D54
  `coverPathTransmittance`/Beer–Lambert implementation used by spotting; there
  is no renderer reimplementation.

## Browser gzip addendum and repo weight

Seven committed `.gz` assets add **5,819,465 bytes (5.55 MiB)**. Their seven
`.br` counterparts total 3,872,952 bytes, so gzip is **1,946,513 bytes / 50.26%**
larger than Brotli. This exceeds the work order's 15–20% estimate; the largest
delta is the 1,908,537-byte contour GeoJSON gzip. No new compression dependency
was added and no new raw file over 5 MB was introduced.

| Asset | Added bytes |
|---|---:|
| `contours-core.geojson.gz` | 1,908,537 |
| `cover-kind-core.u8.gz` | 4,452 |
| `elevation-core.i16.gz` | 1,576,230 |
| `elevation-full.i16.gz` | 919,065 |
| `movement-cost-core.f32.gz` | 659,171 |
| `slope-core.u8.gz` | 486,284 |
| `slope-full.u8.gz` | 265,726 |

## V4–V6 results

- **V4:** 30 m display-grid viewshed (880×693) = **95.85 ms** in the final full
  test run. The controlled full-day benchmark was baseline **4,360.97 ms** and
  sweep **4,260.27 ms**, raw overhead **-2.31%** (timing noise; effectively 0%).
  The control uses `K=0` on both runs to isolate recurring sweep scheduling and
  pair-loop overhead from D47's emergent pathfinding. Generous CI ceilings are
  750 ms / 35%; the authoritative dev-box/report targets remain 100 ms / 20%.
- **V5:** **PASS, exact 200/200** deterministic random observer/target pairs.
- **V6:** **PASS, 29 entries = 23 orders + 6 activations**; React hooks lint is
  enabled for `app/**`; the static export builds.
- Existing integrity gates remain green: D55 cached/uncached full-day state is
  bit-identical, V2 is 10/11 (90.9%), and V7 reports no E5 table diff.

## Screenshots

1. Full map at 15:40: `docs/screenshots/m3b-full-map-1540.png`
2. Custer POV at the Weir vicinity, 15:40, belief on:
   `docs/screenshots/m3b-custer-pov-weir-1540-belief.png`
3. Decision index open with the selected Cooke note visible:
   `docs/screenshots/m3b-decision-index-cooke-note.png`

All three were visually inspected at 1440×900.

## AMBIGUITIES

No new `TODO-AMBIGUOUS(M3-B)` item was required. The work order's history date
said 07-16, while the controlling user instruction required today's actual date;
the two authorized artifact rows use **07-17**. The sub-one-second D50 result is
a measured failure, not an ambiguity.

## Deviations

- The requested frontend-design skill was unavailable. The user-supplied design
  brief explicitly replaced it and was applied as binding direction.
- The installed in-app Browser and Windows computer-use bridges both failed to
  bootstrap with `codex/sandbox-state-meta: missing field sandboxPolicy`.
  Screenshots were therefore produced with the already-installed Chrome in
  headless mode through its DevTools protocol. No package was added.
- Gzip repo weight is 50.26% over the Brotli set rather than the estimated
  15–20%; exact byte counts are reported above.
- No screenshot dependency, dev-only or otherwise, was added.

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

✓ engine/tests/variants.test.ts (3 tests) 22ms
✓ tests/data-integrity.test.ts (13 tests) 229ms
✓ engine/tests/unit.test.ts (3 tests) 145ms
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

✓ tests/terrain-gates.test.ts (5 tests) 326ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 10/11 (90.9%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=95.85ms baseline=4360.97ms sweep=4260.27ms spottingOverhead=-2.31%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — one entry per 23 orders plus each camp-defense activation
[gate] V6 PASS entries=29 orders=23 activations=6

✓ tests/m3b-gates.test.ts (3 tests) 17837ms
✓ engine/tests/m3a-gates.test.ts (6 tests) 40052ms
  ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run 24581ms
✓ engine/tests/gates.test.ts (6 tests) 43651ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 6452ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 13825ms

Test Files  7 passed (7)
Tests       39 passed (39)
Start at    02:03:38
Duration    45.18s (transform 1.62s, setup 0ms, collect 3.38s, tests 102.26s, environment 3ms, prepare 2.45s)
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
┌ ○ /                                    66.3 kB         154 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-cd0425b907acbd67.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

No commit or push was performed.
