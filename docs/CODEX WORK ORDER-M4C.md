# CODEX WORK ORDER — M4-C: viewshed presentation pass (D77)
UI-only, U3 diff-scope, no new deps, brief unchanged. Tasks: (1) persistent
scrim base when ON; lit-region rendered as the moving element; (2) crossfade
successive viewshed rasters (~300 ms [flagged]), hold-last-until-ready, no
clear-flash on recompute; (3) OFF tears down the overlay completely —
assert no residual compositing. Gates: U1 test for OFF-is-clean + crossfade
presence; before/after capture of a playback sequence (Custer bluff route
15:35–15:45, viewshed ON). codex-report-m4c.md; no commit/push.