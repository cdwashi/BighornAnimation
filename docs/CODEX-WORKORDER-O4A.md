# CODEX WORK ORDER — O4-A: Integrate Tier A river/timber/village corrections

## Goal
Apply the approved O4 Tier A geometry (docs/o4-corrections-data.json, rulings
D41–D44 in docs/O4-CORRECTIONS.md and IMPLEMENTATION_HISTORY) to the scenario,
rerun the terrain pipeline, and regenerate the E5 baseline. Exit: quartet green,
all gates green, new reports/e5-baseline.md.

## Inputs
- `docs/O4-CORRECTIONS.md` — authoritative rulings. Skip Task 3 if D44 is not
  marked Approved in IMPLEMENTATION_HISTORY.
- `docs/o4-corrections-data.json` — the geometry. ASSEMBLE, DO NOT INVENT; every
  provenance/confidence note in it transfers into scenario.json verbatim.
- Same house rules as O1/M1-A/M2-A (ambiguity protocol, no silent tuning,
  gross-miss escalation stop on E5).

## Tasks
1. scenario.json updates:
   a. `rivers[0].path.points` ← the 298-point channel (convert [lat,lon] arrays
      to {lat,lon} objects). Update river provenance per D41.
   b. Ford positions + provenance per D42 (ford-a, ford-b, retreat-crossing).
   c. `cover` polygons: replace `timber-loop` ring with the timber polygon;
      replace `village-strip` ring with the village polygon; keep kind
      parameters (losOpacity etc.) unchanged; provenance per D43.
   d. `historicalCorrections.river-1876-channel` geometry ← the channel
      polyline; add a second correction entry `garryowen-1876-flag-zone`
      (points + LOW note from the data file).
   e. `timber` landmark → loop centroid ~45.530,−107.417 per D27 convention
      (both coordinates in provenance); resolve its TODO-AMBIGUOUS flag.
2. Terrain pipeline: `npm run terrain` (cached DEM will skip; rasterize burns
   the real channel; movement-cost regenerates). Confirm the river layer burns
   non-empty and ford cells are FORD-passable.
3. **Only if D44 Approved:** move `cp-reno-skirmish-line` and `cp-reno-timber`
   positions to the corrected timber geometry (skirmish line at the polygon's
   south edge, timber inside the loop), times/tolerances unchanged, provenance
   records old + new coordinates + D44.
4. Quartet; then `npm run sim -- --scenario little-bighorn-1876 --to-tick 2160
   --report` to regenerate reports/e5-baseline.md. E5 escalation rule: expected
   shape is cp-reno-hill within ±45 min at 0 m; any gross miss → STOP, report,
   no tuning.
5. Carry-over fix: in codex-report-m2a.md, the "Quartet chain output verbatim"
   section still says the final chain was "intentionally not run" while the
   FINAL STATUS above it claims verified green — append to that section:
   "Post-adjudication verification: full quartet re-run green (30 tests) by
   Claude Code on 07-15 and independently reproduced from a fresh public clone
   by Fable (30/30, exit 0, 07-16)."
6. History file: append rows D41–D44 exactly as provided by Chuck/Fable, add
   artifact rows for O4-CORRECTIONS.md, o4-corrections-data.json, and the
   regenerated e5-baseline.md (dated 07-16), and mark Open Item O4 → closed
   (Tier A shipped; Tier B backlogged), O1 ambiguity ledger count updated.

## Proof + output
`codex-report-o4a.md`: quartet chain verbatim, `npm run terrain` excerpt, full
new E5 table, before/after TODO-AMBIGUOUS count, AMBIGUITIES, deviations.
No commit/push; tree left for review.
