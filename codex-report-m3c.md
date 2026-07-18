# Codex Report — M3-C

## Status

All eight D57 UI fixes are implemented. The final quartet is green with **46
tests** (39 inherited + 7 U1 additions). No file under `engine/src/` or `src/`
changed, no runtime dependency changed, and no commit or push was performed.

## Delivered

- Pointer-drag pan, cursor-centered wheel zoom, two-pointer pinch zoom,
  double-click/double-tap zoom-to-marker, and exact full-extent reset.
- One transform is applied to hillshade, cover, river, contours, viewshed,
  units, and labels; strokes, glyphs, and label sizes remain screen-crisp.
- Desktop hover and touch tap unit tooltips with name, side, strength,
  formation, mounted state, and active order/holding/contact-pending.
- Ghost markers use a dashed outline, 40% opacity, no strength bar, and the
  required stale-knowledge tooltip sentence.
- A collapsed-by-default ink-on-parchment legend generated entirely from
  `app/lib/legend-data.ts` (five formation rows and six state rows).
- Explicit ORDER / EMERGENT badges on all 29 decision rows plus the explanatory
  header and a denser, scannable row layout.
- Render-only linear interpolation between adjacent states. Large playback
  jumps use the existing D37 keyframe-plus-step path in the worker; engine code
  remains untouched.
- Continuous logarithmic 1×–120× speed range with live multiplier display.
- Stronger neutral viewshed scrim (`0.48` → `0.64`) while retaining soft
  light-and-shadow boundaries.
- The authorized guide range-input note and two authorized 07-17 artifact rows.
  D57 was already present and was not re-appended.

## U1 interaction results

### Automated — 7/7

`tests/m3c-interactions.test.ts` verifies:

1. Pan + zoom + reset restores a marker's exact screen coordinates.
2. Zoom-to-marker centers the marker exactly.
3. Render-side position and clock interpolation are linear and non-mutating.
4. Speed mapping is continuous, monotonic, logarithmic, and spans 1×–120×.
5. Normal and ghost tooltip fields, including the exact stale sentence.
6. The single legend dataset contains every guide formation/state row.
7. Decision kinds map explicitly to ORDER / EMERGENT.

### Scripted browser checks — PASS

Static export served by `node .claude/static-server.mjs` at 1440×900:

- Desktop drag + wheel changed the canvas checksum from `798259151` to
  `3598825432`; Reset View restored exactly `798259151`.
- Two-touch pinch changed `798259151` to `2340211821`; reset again restored
  exactly `798259151`.
- Double-click and double-tap on the detected Company C marker at `(470, 282)`
  both changed the view to the marker-focused framing.
- Normal tooltip rendered: Company C; 7th Cavalry; 40 / 40; Column; Mounted;
  Custer Bluff Route.
- Ghost tooltip rendered for Oglala pool with no marker strength bar and:
  `Last seen 13:26 at this position — knowledge may be stale.`
- Legend began with `aria-expanded="false"`, opened successfully, and rendered
  five formation rows plus six state rows.
- Decision index rendered exactly 29 badges: 23 ORDER and 6 EMERGENT, with the
  explanatory header present.
- Exactly two range inputs rendered. At 120×, playback produced intermediate
  clock readings (`15:46`, `16:40`, `17:40`, `18:40`) rather than a single
  snapped end state.

Scripted-manual acceptance steps for re-checking without automation:

1. Drag the map, wheel/pinch around a marker, then press Reset View; the full
   terrain extent and every layer should return together.
2. Double-click or double-tap any unit; it should center at a closer scale.
3. Hover/tap a solid marker and a dashed ghost in Custer belief view; compare
   tooltip fields and confirm the ghost has no strength bar.
4. Open Legend and Decision Index; verify the collapsed default, 5+6 legend
   rows, explanatory sentence, and ORDER/EMERGENT badge on every visible row.
5. Set speed between labeled values, press Play, and watch the clock and units
   interpolate; scrubbing remains tick-snapped.

## U2 screenshot set

All captures are 1440×900 and were visually inspected. The final four M3-C
comparison scenes reproduce the M3-B geographic crop using the app's real zoom
control; Reset View itself returns to the new full-extent framing. The Reno
before/after pair therefore isolates contrast at matching geography.

1. `docs/screenshots/m3c-full-map-1540.png`
2. `docs/screenshots/m3c-custer-pov-weir-1540-belief.png`
3. `docs/screenshots/m3c-decision-index-cooke-note.png`
4. Reno Hill 16:20 contrast pair:
   - `docs/screenshots/m3c-reno-hill-1620-before.png`
   - `docs/screenshots/m3c-reno-hill-1620-after.png`

The fourth deliverable is two files because the work order explicitly requests
the Reno scene **before/after**.

## U3 diff-scope proof

Baseline: `e5062ec`.

`git diff --name-only e5062ec -- engine/src src` produced no output.
`git diff e5062ec -- package.json package-lock.json` also produced no output.
The engine suites re-ran unchanged: E1 hashes remain
`e4f5aceb / a1c20b24 / c20057a6 / d9d06e72`; D55 cache equivalence, E6 replay,
V1–V3, and V7 all pass.

Tracked `git diff --stat e5062ec` proof before this report was written:

```text
 app/battle-map.tsx             | 593 +++++++++++++++++++++++++++++------------
 app/battle-view.tsx            | 101 +++++--
 app/lib/decision-index.ts      |   4 +
 app/sim-worker.ts              |   4 +
 app/styles.css                 | 125 ++++++++-
 docs/IMPLEMENTATION_HISTORY.md |   3 +
 6 files changed, 628 insertions(+), 202 deletions(-)
```

Task-created untracked files are scoped to `app/lib/`, `tests/`, `docs/`, the
required root report, and the supplied untracked work-order/guide inputs. The
concurrently created untracked `docs/V2-BACKLOG.md` was not created, read as a
requirement, or modified by this work.

## AMBIGUITIES

No `TODO-AMBIGUOUS(M3-C)` item was needed.

- “The fourth (Reno Hill 16:20 viewshed, before/after contrast)” was interpreted
  as a before/after pair, hence five PNG files for four visual targets.
- “Identical framing” was treated as identical 1440×900 viewport, scenario
  state, and M3-B geographic crop. The new Reset View behavior is separately
  proved to restore the full terrain extent exactly.

## Deviations

- The installed in-app Browser bridge could not initialize because the host
  rejected its sandbox metadata (`missing field sandboxPolicy`). Interaction
  checks and captures used installed Chrome headless through the DevTools
  protocol and the repository's dependency-free static server. No package was
  added.
- U2's fourth target is represented by two PNGs so Chuck receives an actual
  before/after comparison rather than a composite that changes image framing.

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

✓ engine/tests/variants.test.ts (3 tests) 26ms
✓ tests/m3c-interactions.test.ts (7 tests) 16ms
✓ tests/data-integrity.test.ts (13 tests) 262ms
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

✓ tests/terrain-gates.test.ts (5 tests) 399ms
  ✓ M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON 312ms
✓ engine/tests/unit.test.ts (3 tests) 213ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 10/11 (90.9%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=115.31ms baseline=4778.14ms sweep=4167.92ms spottingOverhead=-12.77%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — one entry per 23 orders plus each camp-defense activation
[gate] V6 PASS entries=29 orders=23 activations=6

✓ tests/m3b-gates.test.ts (3 tests) 17425ms
✓ engine/tests/m3a-gates.test.ts (6 tests) 45585ms
  ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run 28419ms
✓ engine/tests/gates.test.ts (6 tests) 49266ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 7033ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 15848ms

Test Files  8 passed (8)
Tests       46 passed (46)
Start at    21:49:35
Duration    50.99s (transform 1.46s, setup 0ms, collect 4.01s, tests 113.19s, environment 3ms, prepare 3.05s)
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
┌ ○ /                                    68.8 kB         156 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

No commit or push was performed.
