# CODEX WORK ORDER — M3-A: Spotting engine · believed picture · C4 exam (headless)

## Goal
Implement docs/M3-SPEC.md §2, §5 (approved D46–D51): deterministic spotting,
per-observer event log with side-level believed picture, DEFEND_CAMP activation,
the D51 observation-event data split, and gates V1–V3, V7 plus the C4 exam
harness. No UI (that is M3-B). Exit: quartet green, C4 report generated.

## Inputs
docs/M3-SPEC.md (authoritative; spec wins on conflict), IMPLEMENTATION_HISTORY
D46–D51, existing engine + terrain loader/raycast. House rules as always:
assemble don't invent; ambiguity protocol; STOP-and-escalate on the C4
escalation condition.

## Starting parameter table (engine config, every value [CAL] — expected to move
in the C4 tuning pass; report before/after)
- detectability = K · (√effStrength · dispersionFactor · heightFactor
  / distanceMeters) · transmittance · motionFactor · perceptionFactor
- K = 1.0; T_spot = 0.008; T_lose = 0.004 (hysteresis)
- heightFactor: mounted 2.4 · standing 1.7 · prone 0.3 · NONCOMBATANT_CAMP 3.0
- dispersionFactor by formation: COLUMN 1.0 · LINE 1.3 · SKIRMISH 0.7 ·
  DISPERSED 0.8 · CAMP 4.0
- motionFactor: stationary 1.0 · foot-moving 1.5 · mounted-moving 2.0 ·
  mounted-moving dry/dust 3.0 (v1: conditions always dry)
- perceptionFactor: attached leader's perception/50, clamped [0.5, 2.0];
  units without a leader use 1.0
- transmittance: shared M1 ray core — 0 if terrain-blocked (with D23
  curvature), else ∏(1 − losOpacity) of cover crossed × atmosphericFactor
- Sweep cadence: every 2 ticks; cache terrain-blocked verdicts per pair until
  either endpoint moves ≥ 100 m

## Tasks
1. engine/src/spotting.ts — the model above; per-observer event log
   {tick, observerUnitId, targetUnitId, pos, kind: gained|lost|updated};
   side-level believed picture {status: spotted|lastKnown|never, lastSeenTick,
   lastSeenPos}. Believed picture is part of SimState (serialized, replayed).
2. DEFEND_CAMP (D47): believed-picture enemy within 3,000 m [CAL] of an own
   NONCOMBATANT_CAMP → idle DEFEND_CAMP warrior bands (no scheduled/active
   order) receive an engine-generated interpose objective; released when the
   trigger clears. Emits `camp-defense-activated` events.
3. D51 data split: replace the partial-village observation rows in
   scenario.json with per-target sub-assertions against individual camp units
   (south camps observed=true, north camps observed=false, per the research §J
   descriptions); provenance retained + refinement note; update the
   data-integrity expected observationEvents count accordingly (report the new
   count).
4. C4 exam harness (engine/src/exam.ts + CLI `npm run exam`): run the
   movement-only day; at each gateable event's minute evaluate observer→target
   with the production model; emit reports/c4-observation-exam.md — per-event
   verdict, detectability score vs. threshold, failing factor for mismatches.
   Crow's Nest events excluded (D49) but still evaluated and reported
   informationally (they are the O3 instrument).
5. Tuning pass: you MAY adjust the global table (only) to reach the ≥ 80% gate;
   report every changed value before/after and each event's margin. If ≥ 80% is
   unreachable without per-event special-casing: STOP, report, escalate.
6. Gates as tests: V1 (same-seed AND different-seed identical — spotting
   consumes no RNG; assert + document), V2 (exam ≥ 80% on gateable events),
   V3 (leak test: never-spotted units absent from opposing believed picture and
   its serialization), V7 (E5 table unchanged except itemized DEFEND_CAMP
   drift — expected none).
7. History rows (append verbatim, then add artifact rows for the C4 report and
   this work order, both dated 07-16):

| D46 | 07-16 | Deterministic threshold spotting for v1 (no RNG consumed; M4 combat gets first dice); detectability = angular size × transmittance × motion × perception with gain/lose hysteresis; per-observer event log with side-level believed-picture aggregation (v2 per-commander guard). All params [CAL] in one global table. | Probabilistic spotting would make the C4 exam flaky; per-observer data preserves the v2 upgrade path without schema break. | Approved |
| D47 | 07-16 | DEFEND_CAMP activates: believed enemy within 3 km [CAL] of an own camp → idle pool bands interpose; scheduled orders remain authoritative for named bands. | D36 lifts now that spotting exists; the village's reactive defense becomes emergent, the timed axes stay reconstruction. | Approved |
| D48 | 07-16 | Viewshed = radial-ray raster at display resolution sharing the M1 ray core (curvature + cover + atmospheric), worker-computed, cached per (observer, tick); renderer/engine ray parity enforced by gate V5. | One ray implementation — the overlay must never disagree with the engine. | Approved |
| D49 | 07-16 | C4 exam: Crow's Nest events excluded pending O3 (they are the D24 adjudication instrument); remaining HIGH/MEDIUM events gate at ≥80%; tuning legitimate only via the single global table — per-event fudges are gate-weakening. | The events are LOS ground truth; the ruler cannot also be the thing measured. | Approved |
| D50 | 07-16 | M3 ships the first app shell (map, scrubber, POV overlay, belief-vs-reality toggle, decision index auto-generated from orders — chronological); polish deferred to M6. | A viewshed without a screen is a report, not an experience; decision index costs zero new data. | Approved |
| D51 | 07-16 | Partial-visibility observation rows split into per-target sub-assertions against individual camp units (transcription refinement, D39 precedent, provenance retained). | Makes "Reno saw only the southern edge" mechanically testable. | Approved |

## Proof + output
codex-report-m3a.md: quartet verbatim, full C4 report inline, tuning
before/after table, new observation-event count, V7 E5 diff (or "none"),
AMBIGUITIES, deviations. No commit/push.
