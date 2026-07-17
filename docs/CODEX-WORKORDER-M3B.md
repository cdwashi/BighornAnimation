# CODEX WORK ORDER — M3-B: App shell · viewshed renderer · decision index (UI)

## Prerequisite
M3-A merged and green. **Before writing any UI code, read the frontend-design
skill** — this is the project's first user-facing surface and it should not look
like a default template. Aesthetic intent: period-map restraint (hillshade +
contours ARE the visual identity; UI chrome stays out of the terrain's way).

## Goal
Implement docs/M3-SPEC.md §3, §4 (D48, D50): Next.js 14 static-export app with
the live map, timeline, POV viewshed, belief-vs-reality toggle, and decision
index. Exit: quartet green including app lint/build, gates V4–V6.

## Inputs
docs/M3-SPEC.md (authoritative), M3-A's spotting/believed-picture APIs, terrain
assets + loader, engine (runs in a Web Worker in-browser).

## Browser asset note (small pipeline addendum, do first)
Browsers can't natively decode .br static files; native DecompressionStream
supports gzip. Extend pipeline/derive packaging to ALSO emit .gz variants of
the compressed assets (committed, gitignore rules extended to match raws per
D29); browser loader path uses fetch + DecompressionStream('gzip'); Node path
keeps .br. No new dependencies. Report the added repo weight (expect ~15–20%
over .br).

## Tasks
1. App shell (`app/`): static export config; single-page battle view. Layers:
   hillshade base, contour lines (index contours heavier), river + fords,
   cover polygons (subtle fills), landmark labels, unit markers (side colors
   from scenario, formation glyph, strength bar). Engine in a worker; keyframes
   per D37 for scrubbing; live stepping for play.
2. Timeline: scrubber across the clock window with wallClock display,
   play/pause, speed multipliers, and event tick-marks (orders, spotting
   gains/losses, camp-defense activations) sourced from the engine event log.
3. POV mode (D48): leader picker (all 18, both sides) → viewshed worker
   computes the radial-ray raster (30 m display grid, curvature + cover +
   atmosphericFactor) from the leader's attached-unit position at the current
   minute; render as visible/masked shading. Belief-vs-reality toggle per spec:
   solid = spotted, ghosted = last-known at last-known position, absent =
   never seen; split-view option showing ground truth beside belief.
4. Decision index (D50): auto-generated chronological panel from the order
   list — wallClock, issuer, one-line label, recipients; selecting jumps the
   clock, snaps POV to the issuer, opens belief-vs-reality. Include the
   engine-generated camp-defense activations as unlabeled index entries
   (visually distinct: reconstruction vs. emergent).
5. Gates as tests: V4 (viewshed ≤ 100 ms at display res on the dev box;
   spotting sweep ≤ +20% full-day runtime — measure and report), V5 (ray
   parity: 200 random observer/target pairs, renderer visibility ==
   engine transmittance>0, exact), V6 (static export builds; quartet green
   with app/ under eslint incl. react-hooks; decision index yields exactly one
   entry per order + one per activation).
6. History: artifact rows for this work order and the app shell (07-16);
   Session log line: "M3-B: first UI shipped — map, POV viewshed, belief
   toggle, decision index."

## Explicitly out of scope
Variant toggles and parameter panel (M5), calibration report card (M5), mobile
layout, sound, onboarding/tutorial (M6 or backlog). Resist scope creep even
where it would be easy.

## Proof + output
codex-report-m3b.md: quartet verbatim, V4 timings, V5 parity result, screenshot
paths of (a) full-map 15:40, (b) Custer POV at Weir vicinity 15:40 with belief
toggle on, (c) the decision index open on the Cooke note entry. No commit/push.
