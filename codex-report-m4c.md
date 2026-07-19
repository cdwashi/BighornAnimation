# Codex Report — M4-C

## Status

M4-C is implemented as a UI-only D77 presentation change. The final quartet is
green with **67 tests** (65 inherited + 2 M4-C U1 contracts). No file under
`engine/src/` or `src/` changed, no dependency changed, and no commit or push
was performed.

## Delivered

- Viewshed ON mounts a dedicated overlay canvas with a persistent ink-dark
  scrim. New worker requests do not clear that canvas or remove the held raster.
- The illuminated region is punched through the stable scrim as the moving
  element. Successive typed-array rasters crossfade for **300 ms [CAL]**.
- The previous raster remains current until its successor arrives. The
  transition begins only in the worker result handler, preventing pending-work
  or scrub flashes.
- Viewshed OFF synchronously removes the overlay canvas. Stale worker results
  are ignored while OFF and no scrim, raster, or compositing state remains.
- The viewshed layer is independent of the terrain/unit canvas, so its temporal
  updates do not redraw or clear the underlying period map.

## U1 results

### Automated — 2/2

`tests/m4c-interactions.test.ts` verifies:

1. OFF returns a zero-compositing plan: no overlay, no scrim alpha, and no beam
   alpha even when a raster transition exists.
2. The last raster is held, a successor begins at mix 0, both rasters are
   present at the 150 ms midpoint, their values blend correctly, and the old
   raster is released at the 300 ms [CAL] boundary.

### Scripted browser checks — PASS

Static export, dependency-free server on `:4173`, installed Chrome headless via
CDP, 1600×1000:

- A real seek exposed `data-crossfade=true`, previous tick `1530`, current tick
  `1528`, and initial mix `0`; there was no intermediate overlay removal.
- Clicking Viewshed OFF produced `aria-checked=false` and
  `document.querySelectorAll('.viewshed-overlay').length === 0` on the next
  animation frame.
- Evidence frames resolved their requested raster before capture: 15:35/tick
  1510, 15:40/tick 1520, and 15:45/tick 1530.

## Screenshot set

All captures are 1600×1000 and were visually inspected:

1. `docs/screenshots/m4c-custer-bluff-viewshed-1535.png`
2. `docs/screenshots/m4c-custer-bluff-viewshed-1540.png`
3. `docs/screenshots/m4c-custer-bluff-viewshed-1545.png`

## U3 diff-scope proof

Requested historical baseline: `004f0845d4c1d1ff86a63289d90e2a46c3ee5ed4`.
Actual start-of-work HEAD: `040318b600ee187c0f6ed875bdad9d781c8f802e`
(the approved M4-B commit).

`git diff --name-only 040318b -- engine/src src` produced no output.

`git diff --name-only 004f084 -- engine/src src` produced no output, proving the
combined M4-B + M4-C surface did not alter either protected source tree.

`git diff --check` produced no errors. Tracked M4-C implementation changes are
confined to `app/**` and the two authorized history rows in `docs/**`; untracked
M4-C artifacts are the supplied work order, `app/lib/viewshed-presentation.ts`,
`tests/m4c-interactions.test.ts`, three `docs/screenshots/m4c-*` PNGs, and this
required root report. `package.json` and `package-lock.json` are unchanged.

## AMBIGUITIES

- The dispatch described M4-B as uncommitted, but the repository supplied to
  this run had M4-B committed at HEAD `040318b`. I built directly on that state;
  there was therefore no uncommitted M4-B per-file delta to separate. The
  broader proof against `004f084` is also clean for `engine/src/` and `src/`.
- “~300 ms” was resolved as exactly **300 ms [CAL]**. It is isolated in
  `VIEWSHED_CROSSFADE_MS` for later calibration.

## Deviations

- The in-app Browser capability exposed no callable browser-control bridge in
  this environment. Following the repository-established capture route, live
  checks and screenshots used installed Chrome headless through CDP and
  `.claude/static-server.mjs`; no dependency or permanent helper was added.
- The first full-suite attempt suffered local resource contention after capture
  and F6 measured 15.25 s. After capture processes were torn down, isolated F6
  passed at 8.20 s median and the final full quartet run passed at 8.36 s median.
  No engine or performance code was changed.

## Final exit quartet output verbatim

ANSI color escapes and the unrelated local PowerShell-profile warning are not
included below; command output text is otherwise reproduced verbatim.

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
> vitest run --fileParallelism=false

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

[gate] E1 hashes {"sameA":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"},"sameB":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"},"different":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"}}
✓ engine/tests/gates.test.ts (6 tests) 41618ms
[gate] V4 viewshed=96.53ms baseline=4649.12ms sweep=4352.90ms spottingOverhead=-0.38%
[gate] V5 PASS exact=200/200
[gate] V6 PASS entries=32 orders=23 activations=6 leaderDeaths=3
✓ tests/m3b-gates.test.ts (3 tests) 33073ms
[gate] V1 PASS same/different seeds identical; rng.draws=0
[gate] V2 PASS 12/13 (92.3%)
[gate] V3 PASS no never-spotted target ids in belief or serialized belief
[gate] V7 PASS E5 table diff=none
✓ engine/tests/m3a-gates.test.ts (6 tests) 34118ms
[gate] F6 median=8358.4ms timings=7169.1,8358.4,9039.7 pathfind={"calls":158,"expandedNodes":11084487,"scratchAllocations":1,"heapGrowths":3}
✓ engine/tests/m4a-gates.test.ts (6 tests) 52701ms
[gate] G1 PASS
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":939.2357514637081,"renoHill":1034.959347093062,"fordA":957.904810237618,"weirPoint":1041.7486488377403,"sharpshooterRidge":1038.9672878067122}
[gate] G2 PASS
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m
[gate] G4 PASS blockedAt=489.77m
[gate] G5 PASS samples=100 tolerance=0.05m
✓ tests/terrain-gates.test.ts (5 tests) 173ms
[metric] remaining TODO-AMBIGUOUS count: 38
✓ tests/data-integrity.test.ts (13 tests) 122ms
✓ engine/tests/unit.test.ts (3 tests) 85ms
✓ tests/m4b-interactions.test.ts (8 tests) 22ms
✓ tests/m3d-interactions.test.ts (5 tests) 20ms
✓ engine/tests/variants.test.ts (3 tests) 14ms
✓ tests/m4c-interactions.test.ts (2 tests) 5ms
✓ tests/m3c-interactions.test.ts (7 tests) 7ms

Test Files  12 passed (12)
Tests       67 passed (67)
Duration    167.40s (transform 534ms, setup 0ms, collect 1.26s, tests 161.96s, environment 3ms, prepare 1.27s)
```

### `npm run build`

```text
> bighorn-animation@0.1.0 build
> tsc -p tsconfig.engine.json && tsc -b && node scripts/prepare-app-assets.mjs && next build

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
┌ ○ /                                    74.9 kB         162 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```
