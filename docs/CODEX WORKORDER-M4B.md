# CODEX WORK ORDER — M4-B: The fight on screen (UI for D62–D75)

## Prerequisite
M4-A committed. Design brief unchanged (period-map restraint). UI-only:
U3-style diff-scope proof (app/** + docs), no new dependencies, quartet green.

## Tasks
1. **Live strength bars**: drop with casualties; DESTROYED units transition
   to a terminal marker state (not removal — the dead hold their ground).
2. **Morale cues**: STEADY/SHAKEN/BROKEN/ROUTED as a marker treatment
   (subtle for STEADY, unmistakable for ROUTED — motion + state per spec §9,
   not decoration). Legend data file gains the four states.
3. **Encounter tooltips** (Chuck's request, D63 descriptors): hover/tap an
   active contact → engagement state, unit pair, range band, intensity
   ("dismounted skirmish fire, 250 m" / "mounted charge — receiving" /
   "pursuit"). Anchored at the contact midpoint.
4. **Fall markers** (Chuck Q1): persistent small markers where casualty
   events occurred, from the position-carrying events — visual language
   echoing the battlefield's marble markers: quiet, unlabeled, cumulative.
   Density-managed at low zoom (cluster to a weight, resolve on zoom-in).
   Toggleable layer, default ON. Legend row.
5. **Speed cap on engagement** (Chuck Q3): while `engagementActive`, the
   effective playback ceiling drops to a watchable multiplier [choose ~8×,
   flagged]; slider position preserved, cap released when contact ends; a
   subtle indicator explains the cap while active.
6. **Casualty/engagement scrubber ticks**: engagement starts, unit breaks,
   destructions, leader deaths — distinct tick treatment; decision index
   gains leader-death entries (EMERGENT badge).
7. **Rout rendering**: routed units visibly *flee* (facing, motion cue);
   reintegration shows the absorb (brief cue at the protecting mass).
8. **Scale ruler**: dynamic scale bar (bottom corner, brief-compliant),
   re-labeling across zoom from the map transform + manifest resolution;
   correct at every zoom level (assert in U1: on-screen bar length vs known
   ground distance within 2%). Legend row.
9. **Casualty panel**: collapsible, brief-compliant; per-unit losses and
   side totals, live during playback, from the position-carrying casualty
   events. Label as "losses" — the engine does not yet split killed/wounded
   (that is an M5 model addition; panel layout includes the reserved split
   columns so M5 is an edit). Screenshot (d): panel open at end-of-day
   beside the fall-marker landscape.

## Gates
U1-style interaction tests (tooltip fields incl. pursuit; fall-marker
layer toggle; speed-cap engage/release; terminal-state markers); U3 diff
scope; screenshots: (a) Reno's rout at the retreat crossing with fall
markers, (b) Keogh sector at collapse with morale cues + an encounter
tooltip, (c) the full map at end-of-day — the fall-marker landscape.
Chuck's eyes are the acceptance test.

## Proof
codex-report-m4b.md, house format. No commit/push; tree for review.