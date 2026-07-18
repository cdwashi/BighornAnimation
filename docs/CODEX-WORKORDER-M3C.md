# CODEX WORK ORDER — M3-C: UX round from first user review (D57)

## Goal
Apply the eight D57 fixes from Chuck's first-user evaluation (annotated guide:
docs/PRELIM-USERS-GUIDE-M3B.md — treat the "(Chuck)" annotations as the
requirements source). **UI-only: the engine is untouched**, enforced by a gate.
Exit: quartet green, gates U1–U3.

## Inputs
docs/M3-SPEC.md §3–4, the annotated user's guide, IMPLEMENTATION_HISTORY D57,
existing app/. Design brief unchanged from M3-B (period-map restraint; chrome
stays out of the terrain's way) — every new control must obey it: the legend,
tooltips, and badges are ink-on-parchment, not chrome-on-glass.

## Hard constraints
- **Zero engine changes**: nothing under engine/src/ or src/ may be modified.
  Gate U3 asserts it (git diff scope check in the report; the cache-equivalence
  and determinism suites re-run green untouched).
- Dependency fence as M3-B: no new runtime dependencies. Pan/zoom is
  transform-matrix math on the existing canvas, not a mapping library.
- Ambiguity protocol as always.

## Tasks
1. **Pan/zoom** (the spec-gap fix): pointer-drag pan; wheel + pinch zoom about
   the cursor; double-click/double-tap a unit marker → zoom-to-marker;
   "reset view" control returning to the full-extent framing. Contour/label/
   marker rendering must stay crisp across zoom (scale strokes and font sizes
   appropriately; labels may declutter at low zoom). Viewshed overlay and all
   layers transform together — no misregistration at any zoom.
2. **Unit tooltips**: hover (desktop) / tap (touch) on any marker → name,
   side, current strength, formation, mounted/dismounted, active order label
   (or "holding" / "contact pending"). For ghosts, see Task 4.
3. **In-app legend**: collapsible panel (collapsed by default) carrying the
   guide's §1 formation glyphs and §5 state table — side colors, strength bar,
   ghost, lit/shadow, scrubber ticks. Content lives in one data file so M4+
   additions are edits, not redesigns.
4. **Ghost clarity**: ghosted markers get an unmistakable stale-knowledge
   treatment (dashed outline + reduced opacity + no strength bar), and their
   tooltip reads "Last seen HH:MM at this position — knowledge may be stale."
5. **Decision-index badges**: every entry carries an explicit badge — ORDER
   (reconstruction) vs EMERGENT (engine-generated) — plus a one-line header in
   the panel explaining the distinction; light visual pass on entry density
   (Chuck: "scannable" is the bar).
6. **Inter-tick interpolation** (PRD compliance): during play, unit positions
   interpolate linearly between tick states so movement is smooth at all
   speeds; scrubbing may snap to ticks. No engine change — interpolation is
   render-side between adjacent keyframe/tick states.
7. **Continuous speed slider**: replace the stepped speed control with a
   continuous slider (log-scaled, e.g. 1×–120×), current multiplier displayed.
   (This adds a second type="range" to the app — update the guide note.)
8. **Viewshed contrast pass**: increase lit/shadow separation so the Reno Hill
   16:20 scene reads immediately (Chuck: "shadow/light needs enhancement") —
   stay within the light-and-shadow language, no hard game-overlay edges.
   Deeper artistic treatment remains M6.

## Gates
- **U1 Interaction**: automated where feasible + scripted-manual otherwise:
  pan/zoom round-trip preserves coordinate registration (assert a marker's
  screen position after pan+zoom+reset equals baseline); tooltip renders for a
  normal unit and a ghost with correct fields; legend toggles; badges present
  on all 29 index entries; speed slider drives the clock continuously.
- **U2 Visual regression**: re-capture the three M3-B screenshots at identical
  framing + a fourth (Reno Hill 16:20 viewshed, before/after contrast) — filed
  for Chuck's re-review.
- **U3 Engine untouched**: diff scope = app/** and docs only; full suite green
  (39 tests + any U1 additions) with engine hashes/timings unchanged.
- Quartet, as always.

## History
Append the D57 row (provided by Chuck, status Approved) if not already
present; artifact rows for this work order and the U2 screenshot set (07-17);
guide note update per Task 7.

## Proof + output
codex-report-m3c.md: quartet verbatim, U1 results, U2 screenshot paths, U3
diff-scope proof, AMBIGUITIES, deviations. No commit/push; tree for review —
Chuck's re-review of the U2 set is the real acceptance test.
