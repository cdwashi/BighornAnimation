# CODEX WORK ORDER — M3-D: viewshed toggle + marker declutter (D58)

## Goal
Two UI-only fixes from continued user review. Same constraints as M3-C:
zero engine/src changes (U3-style diff-scope proof), no new dependencies,
design brief unchanged. Exit: quartet green.

## Tasks
1. Viewshed toggle: an explicit on/off control for the POV shading overlay,
   independent of leader selection — leader stays selected (picker, decision-
   index snapping unchanged) but the light/shadow layer renders only when
   toggled on. Default off for plain playback; decision-index deep-links may
   enable it (belief/split entries keep their preset behavior). Add to legend
   data file.
2. Marker declutter: when 2+ unit markers fall within collision distance at
   the current zoom, fan them out into a compact display-only arrangement
   (deterministic ordering by unit id); a subtle tether/cluster cue makes the
   cosmetic offset legible; hover/tap resolves individual companies via the
   existing tooltips. Registration gate: fan-out never survives into exported
   coordinates or any non-display path.

## Gates
U1-style interaction tests for both; U3 diff-scope (app/** + docs only);
quartet; one screenshot: Reno's battalion at Ford A, zoomed, decluttered.

## Proof
codex-report-m3d.md, house format. No commit/push; tree for Chuck's eyes.