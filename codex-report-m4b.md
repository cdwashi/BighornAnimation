# Codex Report — M4-B

## Status

M4-B is implemented as a UI-only change. The final quartet is green with **65
tests** (57 inherited + 8 M4-B U1 contracts). No file under `engine/src/` or
`src/` changed, no dependency changed, and no commit or push was performed.

## Delivered

- Live strength bars continue to consume serialized `strengthAvailable`; a
  `DESTROYED` unit now remains at its final position as a crossed terminal
  marker with no live strength bar.
- STEADY, SHAKEN, BROKEN, and ROUTED each have a cartographic marker treatment
  and a row in `app/lib/legend-data.ts`. ROUTED adds facing and flight strokes;
  recent `rout-reintegrated` events add a ten-tick double-ring absorb cue at the
  protecting unit.
- Active engagement midpoints render a contact line and hover/tap target.
  Tooltips expose engagement state, named unit pair, range band, numeric range,
  intensity, and a state-specific description. PURSUIT is implemented and
  exercised in both U1 and the Keogh screenshot.
- Position-carrying casualty, leader-death, courier-death, and destruction
  events feed persistent fall markers. Low zoom groups events into unlabeled
  weighted memorial clusters; zoom 4+ deterministically resolves the weight
  into individual small markers. The layer is default ON and toggleable.
- Requested playback speed remains the slider value. While
  `engagementActive`, only effective playback is capped at **8× [CAL]**; the
  ceiling releases after contact and a small status line explains it.
- The scrubber distinguishes loss, engagement start, break, destruction,
  leader-death, and scout-exit marks in addition to inherited order/spotting/
  camp marks.
- Leader deaths become EMERGENT decision-index rows. The required synthetic
  unit test exists; the inherited V6 integration gate was also extended to
  count real leader-death events.
- A bottom-corner scale ruler derives pixels-per-meter from the current map
  transform and the full-tier manifest resolution. It relabels across zoom.
- The collapsible corner panel is labeled `losses`, updates by playback tick,
  shows per-unit and side totals, and contains empty/disabled Killed and
  Wounded columns with the explicit M5-pending note. Mechanical destruction
  uses serialized casualty conservation to close the event ledger; marker
  placement remains sourced from position-carrying events.
- Existing viewshed, belief/reality modes, pan/zoom, real march-order spacing,
  genuine-co-location fan-out, worker progress, and continuous speed selection
  remain intact.

## U1 results

### Automated — 8/8

`tests/m4b-interactions.test.ts` verifies:

1. All encounter tooltip fields and the exact PURSUIT case (`pursuit, 250 m`).
2. Fall-marker default ON, toggle off/on, low-zoom weighting, and zoom-in
   resolution.
3. 8× [CAL] cap engagement, requested-speed preservation, and release.
4. DESTROYED terminal treatment remains visible and drops the live bar.
5. Scale-ruler ground-distance accuracy at zoom 1, 1.75, 3.5, and 8.
6. Tick-live losses and the destruction/conservation fallback.
7. Distinct combat scrubber categories.
8. Synthetic leader-death EMERGENT rows plus reintegration-cue expiry.

Scale assertion details (manifest resolution 30 m):

| Zoom | Ground label basis | Bar px | Recovered ground | Error |
|---:|---:|---:|---:|---:|
| 1.00 | 2,000 m | 82.740 | 2,000 m | 0.000% |
| 1.75 | 1,000 m | 72.398 | 1,000 m | 0.000% |
| 3.50 | 500 m | 72.398 | 500 m | 0.000% |
| 8.00 | 200 m | 66.192 | 200 m | 0.000% |

All four are within the required 2% tolerance. The full browser render reported
80.765625 px against `data-screen-pixels=80.76738609112711` for its 2 km ruler.

### Scripted browser checks — PASS

Static export, dependency-free server on `:4173`, Chrome headless via CDP,
1440×900:

- Pursuit tooltip at tick 1695: `PURSUIT`; `Company L ↔ Northern Cheyenne
  pool`; `CLOSE`; `light · 16%`; `pursuit, 50 m`.
- Fall toggle changed the canvas checksum
  `1052460319 → 2074115069`; toggling back restored `1052460319` exactly.
- With the slider at 120×, tick 1704 displayed `contact · capped at 8×`.
  Seeking out of contact to tick 998 removed the cap indicator while the slider
  and output stayed at 120×.
- Scale labels observed across real wheel zoom were 2 km, 1 km, and 200 m.
- End-of-day losses were 471: 7th Cavalry 217; Lakota-Cheyenne coalition 254.
  The open panel showed all nonzero per-unit rows and blank hatched reserved
  Killed/Wounded cells plus the M5 note.
- All four captures retained `Falls on`; reset/pan/zoom, tooltip interaction,
  and the existing worker progress/full-day metric remained operational.

## Screenshot set

All captures are 1440×900 and were visually inspected:

1. `docs/screenshots/m4b-reno-rout-retreat-crossing-fall-markers.png`
2. `docs/screenshots/m4b-keogh-collapse-morale-pursuit-tooltip.png`
3. `docs/screenshots/m4b-full-map-end-of-day-fall-markers.png`
4. `docs/screenshots/m4b-end-of-day-losses-panel-fall-markers.png`

## U3 diff-scope proof

Baseline: `004f0845d4c1d1ff86a63289d90e2a46c3ee5ed4`.

`git diff --name-only 004f084 -- engine/src src` produced no output.

`git diff 004f084 -- package.json package-lock.json` produced no output.

`git diff --check` produced no output.

Tracked implementation files are confined to `app/**`, `docs/**`, and tests;
untracked implementation artifacts are `app/lib/combat-ui.ts`, the four
`docs/screenshots/m4b-*` PNGs, `tests/m4b-interactions.test.ts`, and this
required root report. The user-supplied work order remains unchanged.

## AMBIGUITIES

- The dispatch note says the baseline seed has zero leader deaths. At the
  specified HEAD (`004f084`) the full-day worker and headless run both emit
  **three**: Calhoun tick 1695, Two Moons tick 1781, and Lame White Man tick
  1803. No engine code was changed. The decision type is proven synthetically
  as requested and the integration gate honestly reports all three real rows.
- Screenshot (a) calls for “Reno's rout.” At this HEAD, Companies A/G/M execute
  the `reno-retreat` order and WITHDRAWAL engagements around the crossing, but
  emit no `ROUTED` morale event (all remain STEADY). The capture therefore
  depicts the historical rout/retreat movement at 15:30 with its first fall
  markers; it does not fabricate a ROUTED state.
- No `rout-reintegrated` event occurs in the baseline run at this HEAD. The UI
  cue consumes the exposed event/target fields and is covered with a synthetic
  event timing test rather than inventing a baseline occurrence.
- “About 8×” was resolved as exactly **8× [CAL]**. This is UI-only and does not
  alter simulation ticks, engine configuration, or the requested slider value.
- No required engine datum was missing. Destruction can set a unit's casualty
  conservation total beyond the preceding fire-event sum; the panel reads the
  serialized unit total for that closing balance and uses the position-carrying
  `unit-destroyed` event for the residual fall-marker weight.

## Deviations

- The installed in-app Browser bridge could not initialize because the host
  rejected its sandbox metadata (`missing field sandboxPolicy`). Following the
  repository's established path and the work order, verification and captures
  used installed Chrome headless through the DevTools protocol and
  `.claude/static-server.mjs`. No package was added.
- Screenshot (a) is labeled for the historically named Reno rout but, as noted
  above, accurately renders the engine's WITHDRAWAL/STEADY state rather than a
  nonexistent ROUTED event.

## Final exit quartet output verbatim

ANSI color escapes and the unrelated local PowerShell-profile warning are not
included below; command output text is otherwise reproduced verbatim.

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=172.93ms baseline=4581.21ms sweep=4763.20ms spottingOverhead=-1.06%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=32 orders=23 activations=6 leaderDeaths=3

✓ tests/m3b-gates.test.ts (3 tests) 34607ms
stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 bare full-day median-of-three completes within 10 seconds with pooled A*
[gate] F6 median=8285.2ms timings=7089.6,8285.2,8301.5 pathfind={"calls":158,"expandedNodes":11084487,"scratchAllocations":1,"heapGrowths":3}

✓ engine/tests/m4a-gates.test.ts (6 tests) 51492ms
  ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact 19353ms
  ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws 7995ms
  ✓ M4-A F1-F6 closeout gates > F6 bare full-day median-of-three completes within 10 seconds with pooled A* 15536ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"},"sameB":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"},"different":{"1":"85065bac","360":"d1646b78","1080":"5dda2c34","2160":"cc65fa54"}}

✓ engine/tests/gates.test.ts (6 tests) 37129ms
  ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 7712ms
  ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 16762ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

✓ engine/tests/m3a-gates.test.ts (6 tests) 31281ms
  ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run 22675ms
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

✓ tests/terrain-gates.test.ts (5 tests) 165ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

✓ tests/data-integrity.test.ts (13 tests) 148ms
✓ engine/tests/unit.test.ts (3 tests) 93ms
✓ tests/m4b-interactions.test.ts (8 tests) 23ms
✓ tests/m3d-interactions.test.ts (5 tests) 19ms
✓ engine/tests/variants.test.ts (3 tests) 13ms
✓ tests/m3c-interactions.test.ts (7 tests) 7ms

Test Files  11 passed (11)
Tests       65 passed (65)
Start at    18:04:01
Duration    160.12s (transform 470ms, setup 0ms, collect 1.12s, tests 154.98s, environment 2ms, prepare 1.11s)
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
┌ ○ /                                    74.1 kB         162 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

No commit or push was performed.
