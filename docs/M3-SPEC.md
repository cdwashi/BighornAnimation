# M3-SPEC — LOS · Spotting · Viewshed ("What Custer Saw")

Status: DRAFT for Chuck's review. Proposed decisions D46–D51; open questions at
bottom. Scope per PRD M3, expanded per the approved v1 additions: spotting
engine + believed picture, the observation-event exam (PRD gate C4), the POV
viewshed renderer, the **first app shell**, and the **decision index**.
Combat/morale remain M4.

## 1. What M3 must prove
The project's thesis is that Little Bighorn is a visibility story. M3 makes that
testable: the engine must reproduce the documented sightings AND
failures-to-sight of June 25 from a movement-only run, and the UI must let a
person stand in any commander's position at any minute and see exactly what he
could see — and, side-by-side, what was actually there.

## 2. Spotting model (engine)

**D46 — Deterministic threshold spotting for v1; the PRNG stays unconsumed.**
Randomness in spotting would make the C4 exam flaky and would spend M2's
"first seed divergence is a conscious event" budget on the wrong feature.
Combat (M4) gets that honor. Spotting is a deterministic score with hysteresis:

- `detectability(observer, target) = angularSize × transmittance × motionFactor
  × perceptionFactor`
  - `angularSize` ∝ effectiveStrength^0.5 × dispersionFactor × exposureHeight /
    distance (a 5,000-person village at 10 km can outscore a skirmish line at
    2 km — this is the model doing its historical job)
  - `transmittance` = LOS ray result: terrain-blocked = 0; else product of
    cover opacities crossed × atmosphericFactor (haze/dust context)
  - `motionFactor`: moving mounted units in dry conditions are conspicuous
    (dust) — bonus [CAL]; stationary dispersed units in cover are hard
  - `perceptionFactor` = observing side's best local leader perception / 50
- Hysteresis: score ≥ T_spot → contact gained; ≤ T_lose (< T_spot) → contact
  degrades to last-known. All parameters [CAL]; **starting values live in one
  engine config table** so the C4 tuning pass (below) is data-editing.
- Cadence: full spotting sweep every 2 ticks (1 min); cheap because pairs with
  terrain-blocked cached rays skip early.
- **Per-observer event log, side-level aggregation (the v2 guard):** every
  gain/loss/update is recorded as {tick, observerUnitId, targetUnitId, pos,
  kind}. V1 folds these into one believed picture per side; v2's
  per-commander belief states (BACKLOG, logged) will re-aggregate the same
  events per officer with courier-borne propagation — no schema break.
- Believed picture per side: targetUnitId → {status: spotted | lastKnown |
  never, lastSeenTick, lastSeenPos}. PRD FR3 invariant: never-spotted units do
  not exist in the opposing side's picture, in POV mode, or in any serialized
  view of that side's knowledge.

**D47 — DEFEND_CAMP activates (D36 lifts).** Trigger: own side's believed
picture contains an enemy unit within R = 3 km [CAL] of any own
NONCOMBATANT_CAMP → warrior-band units whose current behavior is DEFEND_CAMP
and who have no scheduled order receive an engine-generated interpose objective
(between threat and nearest camp). Scheduled coalition orders remain
authoritative for the named bands; pools are the responders. Historically this
is the village's reactive defense; the *timed* axes stay reconstruction.

## 3. Viewshed renderer (engine + UI)

**D48 — Radial-ray viewshed sharing the M1 ray core.** From an observer point:
rays to the display-grid perimeter (Bresenham), sampling elevation +
curvature/refraction (D23) + cover opacity, producing a visibility raster at
display resolution (30 m default). Computed in a Web Worker, cached per
(observer, tick, atmosphericFactor). Renderer and spotting engine MUST share
the same ray implementation — divergence between "what the overlay shows" and
"what the engine spots" would be a lie; gate V5 enforces parity by sampling.

POV mode UI: pick any leader (any side — Gall's and Crazy Horse's viewsheds are
first-class) → shaded visible/masked overlay from his attached unit's position
at the current minute; toggle **belief vs. reality**: solid markers = currently
spotted, ghosted = last-known (at last-known position), absent = never seen;
optional split view with ground truth.

## 4. First app shell

**D50 — M3 ships the first UI; polish stays M6.** Next.js 14 static export in
`app/`: canvas map (hillshade + contours + river/cover + landmarks), unit
markers driven by the engine running live in a worker (full day < 1 s; keyframes
per D37 for scrub), timeline scrubber + play/pause/speed, leader picker + POV
overlay, and:

**Decision index (approved v1 addition):** auto-generated from the order list —
one entry per order: wallClock, issuer, one-line label, recipients. Selecting an
entry jumps the clock to the issue minute, snaps POV to the issuer, and opens
belief-vs-reality. Zero new data; the orders already are the decision points.
"Benteen, 16:00, receives the Cooke note — this is what he could see."

The M3-B work order must direct Codex/CC to read the frontend-design skill
before building any UI.

## 5. Observation-event exam (PRD gate C4)

**D49 — Exam scoping and the anti-fudge rule.**
- The two Crow's Nest events are **excluded from the gate until O3 resolves**:
  with the APPROX coordinate they are the O3 adjudication *instrument* (D24),
  not the exam. O3 resolution promotes them into the gate.
- All remaining HIGH/MEDIUM events gate at **≥ 80% reproduced** from the
  movement-only run: at each event's minute, evaluate observer→target with the
  production spotting model; match the recorded observed/not-observed flag.
  Every mismatch itemized in the report with its failing factor.
- **Global-threshold rule:** tuning to pass the exam is legitimate — these
  events are exactly the calibration ground truth for LOS — but only via the
  single global [CAL] table. Per-event special cases, per-event atmospheric
  fudges beyond the event's own recorded factor, or observer repositioning are
  forbidden and treated as gate-weakening.
- The 16:20 "volleys audible, fight unseen" row gates on the *unseen* half
  (G4's mask, now via the production model); audio is out of scope (backlog).

**D51 — Data refinement (small, in-scope):** the partial-visibility rows
("Reno sees only the southern village edge") are split into per-target
sub-assertions against the individual camp units (south camps observed=true,
north camps observed=false at that minute/position), provenance retained,
flagged as transcription refinement of research §J — the same one-row-to-many
split precedent as D39. This is what makes "partial" mechanically testable.

## 6. M3 exit gates
- **V1 Determinism:** same-seed identical; different-seed still identical
  (spotting consumes no RNG — asserted and documented, per D46).
- **V2 The C4 exam:** ≥ 80% of gateable observation events reproduced with one
  global parameter set; mismatches itemized. Escalation: if the model cannot
  reach 80% without per-event fudges, STOP and report — that is a finding about
  the model, and it comes to Fable.
- **V3 Knowledge invariant:** never-spotted units absent from the opposing
  believed picture, POV render, and its serialization (leak test).
- **V4 Perf:** viewshed ≤ 100 ms at display resolution on the dev box; spotting
  sweep adds ≤ 20% to full-day runtime.
- **V5 Ray parity:** N=200 random observer/target pairs — renderer visibility
  == engine transmittance>0 verdict, exactly.
- **V6 App:** static export builds; quartet green with `app/` under lint
  (eslint-plugin-react-hooks now guarding real React, per the standard's
  origin story); decision index generates one entry per order.
- **V7 E5 stability:** the movement-only checkpoint table is unchanged by M3
  except any drift from DEFEND_CAMP pool movement — expected none (pools carry
  no checkpoints); any change is itemized.

## 7. Split of work
- **Fable:** this spec; C4 mismatch review; O3 adjudication when candidates
  land (unblocks the Crow's Nest events + the opening scene); M3 final review.
- **Codex M3-A (headless):** spotting model + believed picture + DEFEND_CAMP +
  D51 data split + gates V1–V3, V7.
- **Codex M3-B (UI; read frontend-design skill first):** app shell, viewshed
  worker + POV overlay, belief toggle, decision index + gates V4–V6.
- **Chuck:** open questions; then the good part — first person to stand on the
  bluffs at 15:40 and see how much village isn't there.

## 8. Backlog entries this spec creates
Per-commander belief states with courier-borne knowledge propagation (v2;
schema guard already in D46). Dust-plume LOS occlusion (v1 has dust as
detectability bonus only). Audio-range events. Time-of-day ambient haze model.

## 9. Open questions for Chuck
1. **UI-in-M3 scope (D50)** — approve shipping the first app shell here, or
   keep M3 headless and move all UI to a dedicated M3-B/M6? (I recommend as
   spec'd: the viewshed without a screen to see it on is a report, not an
   experience.)
2. **DEFEND_CAMP radius** 3 km default [CAL] — fine to start?
3. **Decision index ordering** — chronological list (default) or grouped by
   officer? (Cosmetic; changeable later.)
