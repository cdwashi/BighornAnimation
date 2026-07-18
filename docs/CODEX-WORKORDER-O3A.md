# CODEX WORK ORDER — O3-A: Bounds extension + Crow's Nest candidate sweep

## Goal
Extend the DEM full tier to cover the O3 research candidate, run the D24
viewshed sensitivity sweep, and produce the scored candidate table. **Two
phases with a hard STOP between them** — Phase 2 runs only after Fable rules
on Phase 1's table.

## Context
Research candidate #1 (OSM "Traditional Crows Nest?", 45.4454, −107.1392,
1,353 m, MEDIUM-LOW provenance) sits ~850 m east of the current DEM clip.
Fable's provisional ray test (from the existing grid, foreground gap
unchecked) already shows the historically-correct differential: pony-herd
bench CLEAR at 27 km, village BLOCKED by the east bluffs, old APPROX
coordinate blocked at 0 km. The sweep refines the point and closes the
foreground caveat. Full dossier: docs/O3-RESEARCH-* (research output).

## D59 (append verbatim, status Approved)
| D59 | 07-17 | DEM full-tier east bound extended −107.15 → −107.11 (covers candidate #1 + 2 km sweep radius; still within the cached n46w108 tile; core tier unchanged). Pipeline re-run; grids/manifest regenerate. Sweep authorized per D24: candidates scored by must-flip criterion (pony-herd ray CLEAR, curvature-corrected) + Deliverable-B morphology constraints; winner applied only after Fable's Phase-2 ruling. | Candidate sits outside the clip; the battle's opening scene depends on this point. | Approved |

## Phase 1 — extend, sweep, STOP
1. scenario.json dem bounds ne.lon → −107.11; `npm run terrain` (cached tile
   skips download; full tier regenerates, core tier byte-identical — assert
   it). All existing gates re-run green (terrain-mask G4 especially).
2. Sweep script (pipeline/ or scripts/): grid ±2 km around candidate #1 at
   100 m spacing (~41×41). Per cell, observer at DEM ground + 1.7 m:
   - MUST-FLIP: curvature-corrected ray (k=0.13, shared raycast) to the
     pony-herd bench (45.535, −107.460) — CLEAR required.
   - Score components (report all, no blending): village-center ray verdict
     (historically hazy/incomplete — BLOCKED or marginal is *consistent*,
     not disqualifying); cell elevation (constraint ~1,340–1,360 m band);
     "pocket" morphology — a concealable hollow within 300 m below the
     observation point (local relief signature per Deliverable B); distance
     to the Davis Creek divide trail line.
   - No unsampled-gap allowed: every ray fully inside the extended grid.
3. Emit reports/o3-sweep.md: top-10 cells table (coord, elevation, per-
   criterion results), the candidate-#1 cell's own row, a pass/fail map
   summary, and — separately, never merged — the best-scoring cell vs. the
   OSM-stated point with the distance between them.
4. **STOP.** No coordinate is written anywhere. codex-report-o3a-phase1.md
   with quartet + sweep report. Fable rules on the winner.

## Phase 2 — apply + promote (only after the ruling, in the ruling's terms)
5. Write the ruled coordinate to the crows-nest landmark (confidence MEDIUM
   ceiling per the research provenance inversion; both old APPROX and OSM
   coordinates retained in provenance) and to the two Crow's Nest observation
   events' observerPosition.
6. Promote those two events into the C4 gate (D49 promotion clause); re-run
   the exam accepting all verdicts per standing policy; expected 12/13
   gateable — but the exam decides.
7. E5 asserted unchanged; history rows (D59 done in Phase 1; the coordinate
   ruling row provided with the ruling); artifact rows; quartet.

## Proof
Phase-tagged codex reports, house format. No commit/push until Phase 2 review.
