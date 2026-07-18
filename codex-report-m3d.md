# Codex Report — M3-D

## Status

M3-D is complete. The viewshed is independently switchable and defaults off,
company-marker collisions fan out only in display space, and the final quartet
is green with **51 tests**. No file under `engine/src/` or `src/` changed, no
dependency changed, and no commit or push was performed.

## Delivered

- Added an ink-on-parchment viewshed switch. Plain playback, leader selection,
  and the Ford A capture preset start with shading off; belief/split, Cooke-note,
  and Reno 16:20 deep links retain their shading presets.
- Leader selection and decision-index snapping remain independent of overlay
  visibility. Selecting a decision opens the prescribed belief view and shading.
- Added both the viewshed switch and fanned-company cue to the single legend
  dataset in `app/lib/legend-data.ts`.
- Added deterministic, unit-id-ordered collision grouping and compact radial
  fan-out at the current screen scale. Groups dissolve automatically when zoom
  separates their markers.
- Kept simulation/geographic points intact. Rendering and hit-testing use a
  separate `displayPoint`; zoom-to-marker retains the recorded base point.
- Added thin neutral tethers and origin dots. Fanned markers retain individual
  company tooltips; tooltip copy identifies the fan as cosmetic and leaves true
  march-order spacing to the engine's later M4 work.
- Added the two authorized 07-17 artifact rows. D58 was read but not re-appended.

## U1-style gate results

### Automated — 5/5 new M3-D assertions

`tests/m3d-interactions.test.ts` verifies:

1. Viewshed defaults off for plain playback, leader links, and the Ford A scene.
2. Belief/split and prescribed decision scenes enable shading, and both new
   legend entries exist.
3. A three-company collision fans deterministically by unit id to unique display
   points.
4. The same source points stop fanning when zoom separates them; a singleton is
   unchanged.
5. Source/export coordinates remain exact and unmutated through fan-out.

The inherited M3-C registration round-trip assertion also remains green.

### Production-export interaction checks — PASS

Static export served by `node .claude/static-server.mjs` at 1440×900:

- `?scene=ford-a` settled at 14:20 with Reno selected and viewshed
  `aria-checked="false"`.
- Switching viewshed on produced `aria-checked="true"`; Reno remained selected.
- Switching it off restored `aria-checked="false"`; Reno and 14:20 remained.
- A wheel zoom around Ford A exposed the separated company markers while their
  recorded-position tethers remained visible.

## Screenshot

Visually inspected at 1440×900, 14:20, Reno selected, viewshed off:

`docs/screenshots/m3d-reno-battalion-ford-a-1420-decluttered.png`

## Diff-scope proof

M3-D baseline: `1d59bc6` (the committed M3-C round). The work-order note named
`e5062ec`, but actual HEAD at start was `1d59bc6`; the combined comparison against
`e5062ec` is also confined to the authorized application, documentation, and
test areas.

`git diff --name-only 1d59bc6 -- engine/src src package.json package-lock.json`
produced no output. The same prohibited-path command against `e5062ec` also
produced no output.

M3-D per-file changes:

- `app/battle-view.tsx` — switch state, presets, request/render gating, decision behavior.
- `app/battle-map.tsx` — display projections, tethers, individual hit targets, D58 tooltip copy.
- `app/lib/map-interactions.ts` — pure deterministic fan-out helper.
- `app/lib/pov-controls.ts` — pure URL preset policy.
- `app/lib/legend-data.ts` — viewshed and fanned-company legend rows.
- `app/styles.css` — restrained toggle and legend cue styles.
- `tests/m3d-interactions.test.ts` — five new M3-D interaction assertions.
- `tests/m3c-interactions.test.ts` — inherited legend-count expectation only.
- `docs/IMPLEMENTATION_HISTORY.md` — two authorized artifact rows; its pre-existing
  D58 row was preserved.
- `docs/screenshots/m3d-reno-battalion-ford-a-1420-decluttered.png` — acceptance capture.
- `codex-report-m3d.md` — this report.

The supplied untracked `docs/CODEX WORK ORDER-M3D.md` was read-only and remains
unmodified. No runtime or development dependency was added.

## AMBIGUITIES

No `TODO-AMBIGUOUS(M3-B)` or M3-D ambiguity item was needed.

- The user requested history artifact dates of 07-17 even though execution was
  on 2026-07-18; the explicitly authorized 07-17 date was used.
- “Exported coordinates” has no current UI export command. The registration
  gate therefore proves the stronger underlying invariant: fan-out returns
  distinct `displayPoint` values while preserving and not mutating every source
  `point`, and all simulation state remains outside that helper.

## Deviations

- The installed in-app Browser bridge again failed to initialize because the
  host rejected its sandbox metadata (`missing field sandboxPolicy`). Production
  interaction checks and capture used installed Chrome headless through the
  DevTools protocol plus the repository's dependency-free static server. No
  package was added.

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

 ✓ tests/m3c-interactions.test.ts (7 tests) 12ms
 ✓ engine/tests/variants.test.ts (3 tests) 25ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 29ms
 ✓ tests/data-integrity.test.ts (13 tests) 229ms
 ✓ engine/tests/unit.test.ts (3 tests) 174ms
 ✓ tests/terrain-gates.test.ts (5 tests) 401ms
 ✓ tests/m3b-gates.test.ts (3 tests) 18924ms
 ✓ engine/tests/m3a-gates.test.ts (6 tests) 53159ms
 ✓ engine/tests/gates.test.ts (6 tests) 60431ms

 Test Files  9 passed (9)
      Tests  51 passed (51)
   Duration  62.00s
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
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    69.7 kB         157 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB

○  (Static)  prerendered as static content
```
