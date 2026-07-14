# PRD — Historical Battle Simulator

- **Version:** 0.1 (2026-07-14)
- **Owner:** Chuck
- **Status:** Approved for build. First scenario: Little Bighorn (1876-06-25).
- **Companion docs:** `IMPLEMENTATION_HISTORY.md` (decision log), `scenario-schema.ts` (data contract)

---

## 1. Vision

An interactive, terrain-accurate simulation of historical battles. The engine resolves
movement, line of sight, engagement, morale, and casualties minute-by-minute from the
*historical orders*, on real elevation data, against a historical clock. Users watch
the battle unfold, scrub the timeline, stand in any commander's boots to see exactly
what was — and was not — visible, toggle competing scholarly interpretations, and turn
the knobs (leadership, timing, strength) to explore counterfactuals.

Differentiator vs. the animated-map documentary genre: those are choreography. This is
a calibrated simulation, so the controls are real.

## 2. Goals / Non-Goals

**Goals**
- G1. Faithful default run: with baseline parameters, the sim tracks the historical
  timeline within defined tolerances (§8) — troop tracks, casualties, end state.
- G2. Commander viewshed ("see what he saw"): first-person visibility rendering from
  any leader position at any minute, including atmospheric factors (haze, dust).
- G3. Counterfactual control: user-adjustable leader ratings, order timings, strengths,
  and variant toggles produce plausible divergent outcomes.
- G4. Battle-agnostic engine: adding a battle requires only a new scenario JSON + DEM
  tile + terrain corrections. Zero battle-specific code.
- G5. Scholarly honesty: every historical datum carries confidence + sources; disputes
  ship as labeled variants, never blends.

**Non-Goals (v1)**
- NG1. Fully emergent AI commanders fighting free-form (variant of the engine later).
- NG2. Multiplayer, 3D/first-person rendering, photoreal graphics. Top-down contour
  map with clean unit iconography is the v1 aesthetic.
- NG3. Battles without adequate scholarship. Data quality is a battle-selection
  criterion (§6.1), not a problem the engine solves.
- NG4. Mobile-first UI (desktop-first; responsive later, per Mah Jongg precedent).

## 3. Users

- U1. History enthusiasts exploring "why did it happen this way" (primary: Chuck).
- U2. Educators demonstrating terrain/visibility/command dynamics.
- U3. Wargamers/modelers interested in parameter sensitivity.

## 4. Product Description

### 4.1 Map & terrain
- Contour terrain rendered from DEM (contour lines + hillshade), rivers with fords,
  cover polygons (timber, ravines, village), landmark labels.
- 1876-vs-modern corrections applied at load (historical river channel, timber extent).

### 4.2 Playback
- Timeline scrubber across the scenario clock (wall-clock display in local sun time),
  play/pause, speed controls (incl. coarse→fine tick phases), jump-to-event index
  (orders, engagements, observation events).

### 4.3 Units & engagement
- Unit markers with formation state, strength/morale bars, mounted/dismounted state,
  ammunition state; engagement visuals (fire arcs, casualties); rout/rally states.

### 4.4 Viewshed / POV mode
- Select any leader → shaded visibility overlay from their position at current minute
  (DEM raycast + cover opacity + atmospheric factor). Side-by-side option: what the
  leader saw vs. actual unit positions ("the gap between belief and reality").

### 4.5 Variants & knobs
- Variant toggles (mutually-exclusive groups enforced) with plain-language descriptions
  and proponents. Parameter panel: leader ratings, strength Estimates (low↔high sweep),
  order timing offsets. "Reset to baseline" always available.

### 4.6 Calibration view (builder-facing, ships hidden behind a flag)
- Run scored against checkpoints, casualties, end states, observation events; per-item
  hit/miss with tolerances; composite score. Used to tune defaults; also a fun
  "accuracy report card" for advanced users.

## 5. Architecture

- **Engine:** headless TypeScript package. Deterministic, seeded RNG, fixed-tick.
  No React imports. Fully unit-tested. (Mah Jongg engine pattern.)
- **UI:** Next.js 14 static-export app consuming the engine. Canvas/WebGL map layer.
- **Data:** scenario JSON validated against `scenario-schema.ts`; DEM tiles +
  derived grids (elevation, slope, cover) preprocessed by a terrain pipeline script.
- **Repo layout:** `engine/`, `app/`, `data/scenarios/<battle-id>/`, `pipeline/`.
- **Verification standard:** quartet (typecheck · tests · build · lint) + scenario
  data-integrity suite + calibration score gate (§8).

## 6. The Reproducible Per-Battle Pipeline

This section is the recipe. Executing it for a new battle is the entire cost of a new
battle.

### 6.1 Phase 0 — Battle selection (gate)
A candidate battle qualifies if:
- S1. Scholarship supports a timestamped order/movement reconstruction (time-motion
  study or equivalent exists).
- S2. Terrain is recoverable: DEM available and 1876/period corrections documented,
  or terrain substantially unchanged (preserved battlefield ideal).
- S3. Order of battle and casualties documented to MEDIUM+ confidence.
- S4. Single-day to few-day duration (v1 clock model).
- Bonus: physical archaeology exists (hard-constrains positions).

### 6.2 Phase 1 — Research
- Instantiate the deep-research prompt template (deliverables A–K keyed to the schema;
  conventions: declared time anchor, WGS84, low/best/high, 4-level confidence,
  never-average rule, source hierarchy with archaeology on top).
- Run in Research mode; re-run thin deliverables individually (timeline and disputes
  usually deserve second passes).
- Output must end with a gaps-and-reliability report; weak citations are recorded, not
  laundered.

### 6.3 Phase 2 — Gating decisions (human)
Before transcription, the owner decides:
- Clock window + tick phasing.
- Baseline interpretation per dispute (default: archaeology-weighted), alternates as
  variants.
- Default `best` values for contested Estimates.
- Unit decomposition where history lacks discrete units (marked LOW confidence).
- Leader-rating methodology (numbers proposed from evidence; owner reviews as PR).

### 6.4 Phase 3 — Transcription + validation
- Author `data/scenarios/<battle-id>/scenario.json` section-by-section from research
  deliverables (A/B→units, E→orders, C+D→checkpoints, F→variants, G→weapons,
  H→leaders, I→terrain, J→observationEvents, K→calibration).
- Data-integrity test suite (blocking): schema typecheck; all ID references resolve;
  all times within clock window; weapon-mix fractions sum ≤ 1; coordinates within DEM
  bounds; every DISPUTED research row exists as an Estimate or Variant; every record
  carries provenance; variant exclusion groups are consistent.
- Owner reviews the JSON like a PR, with judgment-call sites flagged.

### 6.5 Phase 4 — Terrain pipeline
- Acquire DEM (USGS 3DEP / SRTM / Copernicus), clip to bounds, derive elevation +
  slope + movement-cost grids; digitize cover polygons and corrections; generate
  contours; validate fords/landmarks against the grid.

### 6.6 Phase 5 — Calibration
- Run baseline; score (§8); tune within Estimate ranges and rating bounds only —
  never by editing checkpoints to match the run. Record final parameter set and score
  in the scenario folder. Sweep variants to confirm they produce materially different,
  plausible runs.

### 6.7 Phase 6 — Ship
- Quartet green; data-integrity green; calibration gate met; implementation history
  updated; scenario README with source list and known weaknesses.

## 7. Functional Requirements (engine highlights)

- FR1. Fixed-tick deterministic loop (tickSeconds from scenario), seeded RNG,
  serializable state (save/replay).
- FR2. Movement: terrain-cost pathing along order waypoints; formation and
  mounted/dismounted speed modifiers; river crossing only at fords (penalty applied).
- FR3. LOS: DEM raycast + cover opacity + atmospheric factor; drives spotting,
  engagement eligibility, and the viewshed renderer. Unspotted units are hidden from
  the opposing side's "believed" picture (and from POV mode).
- FR4. Command: HIERARCHICAL sides deliver orders with transmission + leader delay;
  CONSENSUS_INITIATIVE sides trigger behavior from tactics profiles + leader
  influence radius. Orders can be lost with courier death (unit carries the message).
- FR5. Combat: per-tick exchange from weapon range-band tables × exposure × cover ×
  flanking × tactics weights × leader tacticalSkill; ammunition tracked; malfunction
  rolls; horse-holder fraction on dismount; RESUPPLY from pack-train units.
- FR6. Morale: casualties, leader loss, flanking, isolation, fatigue → states
  steady/shaken/broken/routed; rally via leader rating within radius;
  withdrawalDiscipline shapes breaking behavior.
- FR7. Variants applied as patches at load; exclusion groups enforced.
- FR8. Calibration scorer implements §8 and emits a per-item report.

## 8. Calibration Tolerances & Acceptance (v1 defaults, per-scenario overridable)

- C1. Checkpoints: hit = within `toleranceMeters` and `toleranceMinutes`; baseline run
  hits ≥ 70% of HIGH-confidence checkpoints, ≥ 50% overall.
- C2. Casualties: per-side totals within the historical low–high band; flagship units
  (e.g., annihilated commands) reproduce their end state.
- C3. End states: 100% of HIGH-confidence end-state assertions met by `byMinute`.
- C4. Observation events: ≥ 80% of HIGH/MEDIUM events reproduced (seen when seen,
  masked when masked) — this is the LOS model's exam.
- C5. Determinism: same seed + same scenario + same parameters = identical run.

## 9. Milestones

- M0. Repo scaffold; schema package; data-integrity test harness. (Exit: quartet green
  on empty scenario.)
- M1. Terrain pipeline + map render (contours, hillshade, rivers, cover, landmarks)
  for Little Bighorn bounds.
- M2. Engine core: clock, movement, pathing, orders, save/replay. (Exit: units follow
  the historical order list over real terrain; no combat yet.)
- M3. LOS + spotting + POV viewshed renderer. (Exit: observation-event validation
  ≥ C4 on a movement-only run.)
- M4. Combat, morale, command friction, resupply. (Exit: full baseline run completes.)
- M5. Calibration pass + variant toggles + parameter panel. (Exit: §8 gates met;
  variants produce distinct plausible runs.)
- M6. Playback UI polish, event index, accuracy report card; ship v1.

## 10. Risks

- R1. **Calibration infeasibility** — order-driven runs may not fit history within
  tolerances without over-tuning. Mitigation: tune only within sourced Estimate
  ranges; where impossible, document as a finding (that itself is interesting history)
  and loosen per-scenario tolerance with rationale.
- R2. **Model invention creep** (e.g., warrior-band decomposition). Mitigation: LOW
  confidence flags + rationale in provenance; owner PR review.
- R3. **Terrain correction quality** (1876 river channel, timber). Mitigation: treat
  corrections as first-class sourced data; validate fords/LOS against observation
  events before trusting.
- R4. **False authority** — a polished sim can make one interpretation look like fact.
  Mitigation: confidence surfaced in UI; variants prominent; accuracy report card.
- R5. **Scope** — engine features (weather, night, supply) can sprawl. Mitigation:
  v1 model is exactly FR1–FR8; anything else goes to the backlog.

## 11. Success Metrics (v1)

- Little Bighorn baseline meets §8 gates with quartet + data-integrity green.
- POV mode reproduces the three signature visibility moments: Crow's Nest (scouts see
  herd / Custer does not), village extent masked from Reno's valley position, Custer
  field terrain-masked from Reno Hill (volleys audible, fight unseen).
- At least two variant pairs (MTC feint↔crossing; disintegration↔last stand) produce
  visibly different runs from the same engine.
- A second battle can be scoped by executing §6.0–6.3 with zero engine changes.

## 12. Backlog (post-v1 candidates)

Multi-day clock with night phases; weather model; supply/fatigue depth; emergent
commander AI mode (NG1); mobile layout; scenario editor UI; export runs as video;
additional battles per §6.1 gate.
