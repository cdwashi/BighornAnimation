# IMPLEMENTATION_HISTORY — Historical Battle Simulator

Authoritative record of design objectives, decisions, and session history.
Maintained across sessions. Newest entries appended at the bottom of each section.

- **Project:** Historical Battle Simulator (working name)
- **First scenario:** Battle of the Little Bighorn, June 25, 1876
- **Stack:** TypeScript. Headless engine + Next.js UI (mirrors the Mah Jongg Simulator architecture)
- **Verification standard:** quartet — typecheck · tests · build · lint (eslint-plugin-react-hooks)
- **Record started:** 2026-07-14

---

## 1. Design Objectives

1. **Primary experiential goal:** let the user "see what Custer saw" — a first-person
   viewshed from any commander's position at any minute, rendering what was and was
   not visible (terrain masking, haze, dust). The Little Bighorn is treated as a
   terrain-visibility story; the LOS model is the thesis of the project, not decoration.
2. **Simulation, not choreography:** an order-driven engine resolves movement, line of
   sight, engagement, morale, and casualties itself. Historical fidelity is achieved by
   feeding historical orders and calibrating parameters — not by scripting positions.
3. **Controllable counterfactuals:** once calibrated, parameters (leader ratings, order
   timings, strengths, variant interpretations) become real knobs. Changing them shows
   a plausible alternate outcome.
4. **Battle-agnostic engine, data-only battles:** a new battle is a new scenario JSON
   file against a fixed schema. No battle-specific code. (Same pattern as the NMJL
   card data feeding the Mah Jongg engine.)
5. **Honest history:** provenance, confidence ratings, and source citations are
   first-class data. Disputed history is never silently blended; competing published
   interpretations are labeled, toggleable variants.
6. **Match the historical timeline** on a simulated clock (Gray local-sun chronology
   for Little Bighorn), with playback controls: scrub, speed, unit inspection.

## 2. Decision Log

| # | Date | Decision | Rationale | Status |
|---|---|---|---|---|
| D1 | 07-14 | Simulation approach: **order-driven** (option 2 of 3: choreographed / order-driven / fully emergent) | Choreography makes knobs meaningless; fully emergent AI stops being the historical battle. Order-driven gives real simulation constrained by historical orders, calibrated against checkpoints. | Approved |
| D2 | 07-14 | First battle: **Little Bighorn** | User's stated interest (Custer's miscalculation); battle is fundamentally a terrain-visibility story, ideal for the LOS engine; preserved battlefield → modern DEM ≈ 1876 terrain; exceptionally deep scholarship incl. physical archaeology. | Approved |
| D3 | 07-14 | **Provenance is first-class** in the schema: disputed quantities are `Estimate {low, best, high}`; orders/checkpoints/etc. carry `confidence` + `sources` | Averaging contradictory accounts can produce positions nobody was ever at. Weighted reconciliation with archaeology > time-motion scholarship > official records > native testimony > reminiscence. | Approved |
| D4 | 07-14 | **Orders drive, checkpoints score.** Checkpoints are calibration rubric only; the engine never teleports units to them | Keeps it a real simulation; calibration score = weighted checkpoint hits + casualty match + end-state + observation events. | Approved |
| D5 | 07-14 | **Disputes are variants:** labeled overlay patches (add/remove/modify orders, checkpoints, units), mutually-exclusive sets supported; never blended | More honest and more interesting: user can watch competing interpretations play out on the terrain. | Approved |
| D6 | 07-14 | **ObservationEvent** type: documented sightings AND failures-to-sight, weighted in calibration | Validates the LOS model itself against history (Crow's Nest haze; village extent masked from Reno; Custer field terrain-masked from Reno Hill). Core to the experiential goal. | Approved |
| D7 | 07-14 | Per-side **command models**: HIERARCHICAL (7th Cav: courier delays, order friction) vs CONSENSUS_INITIATIVE (coalition: leader influence + individual initiative, per Fox) | The two sides genuinely fought under different command cultures; modeling this is part of explaining the outcome. | Approved |
| D8 | 07-14 | **Weapons as stepwise range-band tables** (+ malfunction estimate), not formulas | Research data (period tests, archaeology) maps directly into bands; tuning is data editing, not code changes. Carries the Springfield extraction debate as an Estimate. | Approved |
| D9 | 07-14 | **TacticsProfile** behavior weights incl. `targetHorses`, `infiltration`, `dispersion`, `withdrawalDiscipline`; horse-holder fraction (1-in-4) modeled | Encodes doctrine (US skirmish drill) vs Fox's warrior tactical model (infiltration, suppression + rushes, horse targeting). | Approved |
| D10 | 07-14 | Research gathered via **Deep Research prompt engineered to the schema** (deliverables A–K map to schema types; hard conventions: Gray sun time, WGS84, low/best/high, 4-level confidence scale, never-average rule) | Research output becomes near-mechanical to transcribe; disputes arrive pre-labeled for `variants`. | Executed — output received 07-14 |
| D11 | 07-14 | **Clock window:** start 03:00 (Crow's Nest approach), end ~21:00 June 25. Coarse ticks for the approach phase, fine ticks from the ~12:00 division onward | Captures the dawn Crow's Nest viewshed moment inside the sim clock rather than as a bolt-on vignette. | Approved by Chuck |
| D12 | 07-14 | **Baseline interpretation = archaeology-weighted (Gray/Fox):** MTC feint (F1), unequal wings / no C-split (F2), tactical disintegration (F3), E Co in Deep Ravine (F4). Traditional readings (serious crossing, organized last stand) + Reno-timber and Weir-initiative disputes ship as named variants | Follows the declared source hierarchy; physical evidence outranks testimony where they conflict. | Approved by Chuck |
| D13 | 07-14 | **Native strength defaults:** warriors 900 / 1,750 / 2,500 (low/best/high); armed fraction ⅓ / 0.40 / ½; repeaters 25–30% of armed | Matches research "best working figure 1,500–2,000"; all sweepable — sets the default run only. | Approved by Chuck |
| D14 | 07-14 | **Warrior unit decomposition:** one defense-pool WARRIOR_BAND per village circle (strength ∝ lodges) + named-leader bands for documented axes (Gall south/Calhoun; Crazy Horse north sweep; Crow King ~80; Lame White Man's charge) drawing from circle pools | The coalition did not fight in discrete units; this is acknowledged model invention. Every such unit marked LOW confidence with rationale in provenance. | Approved by Chuck |
| D15 | 07-14 | **Leader ratings (0–100)** proposed by Claude from documented behavioral evidence, evidence quoted in `ratingsProvenance`; Chuck reviews the numbers explicitly | Research deliberately supplied evidence, not numbers; the numbers are argued opinions and are flagged as such for PR-style review. | Approach approved; numbers pending review |
| D16 | 07-14 | **Weak citations recorded faithfully** (Wikipedia, forum-tier, "subagent" relays) rather than laundered | Honest accounting; flags where re-sourcing is warranted before publication-grade claims. | Approved |

## 3. Artifacts Delivered

| Artifact | Date | Notes |
|---|---|---|
| `scenario-schema.ts` | 07-14 | Battle-agnostic scenario schema (TypeScript). Root: meta, clock, terrain, weapons, tacticsProfiles, sides, leaders, units, orders, checkpoints, observationEvents, variants, calibration. |
| `little-bighorn-research-prompt.md` | 07-14 | Deep Research prompt, deliverables A–K keyed to the schema. |
| Research output (Chuck-supplied) | 07-14 | Full A–K dataset + gaps/reliability report. Received and reviewed; quality strong. |
| `IMPLEMENTATION_HISTORY.md` | 07-14 | This file. |
| `PRD-battle-simulator.md` | 07-14 | Product requirements + reproducible per-battle pipeline. |

## 4. Open Items

| # | Item | Owner | Notes |
|---|---|---|---|
| O1 | Transcribe research → `little-bighorn-1876.json` + validation harness | Claude | Next task. Data-integrity tests: ID references resolve; times within clock; weapon-mix fractions ≤ 1; coords within DEM bounds; every DISPUTED row landed as Estimate or Variant. |
| O2 | Leader rating numbers review | Chuck | Per D15 — review like a PR. |
| O3 | Crow's Nest coordinate | Both | Research warns the published marker coordinate is a decoy at the visitor site; true Wolf Mts overlook on private land. Try GNIS / Gray's maps. Viewshed accuracy for the opening scene depends on it. |
| O4 | 1876 river channel corrections | Claude | Source: NPS Geologic Resources Inventory 2011 (1891-vs-modern channel overlay), esp. Ford B + Garryowen loop. Feeds `terrain.historicalCorrections`. |
| O5 | Re-source weak citations flagged in D16 | Claude | Before any publication-grade use. |
| O6 | DEM acquisition + terrain pipeline (USGS 3DEP 1/3 arc-second) | Claude | Contours via marching squares (d3-contour candidate); slope/movement-cost grid; LOS raycast grid. |

## 5. Conversation / Session History

### Session 1 — 2026-07-14 (claude.ai)

1. **Feasibility.** Chuck asked how hard an animated, controllable historical battle
   simulation would be (contour terrain, troop movement, LOS, weapon effectiveness,
   leadership, tactics, real-battle timeline; reference: YouTube battle-map genre).
   Claude assessed: very doable; decomposed into easy parts (terrain/DEM, LOS raycast,
   tick engine, combat math) and the one hard design decision — the tension between
   "simulation" and "matches history" — resolved by the order-driven approach (D1).
   Scale estimate: Mah Jongg Simulator–class or somewhat larger.
2. **Battle selection.** Chuck chose Little Bighorn, motivated by Custer's
   miscalculation and wanting to "see what he saw." Claude endorsed (D2) — the battle
   is a viewshed problem (Crow's Nest, Reno's partial view, Weir Point) plus an
   expectations problem (Custer feared escape, not defeat → tactics parameter).
3. **Research method.** Chuck proposed using deep Research mode to gather archives and
   synthesize/average contradictory accounts. Claude endorsed Research but pushed back
   on averaging → weighted reconciliation with source tiers; disputes as labeled
   alternatives (D3, D5). Identified the three source tiers (archaeology / time-motion
   scholarship / testimony) and set expectations (published scholarship, not unscanned
   archive boxes).
4. **Deliverables.** Claude authored `scenario-schema.ts` and the deep research prompt
   (D3–D10). Checked the codex-first skill: Claude Code sessions only, and this is
   design work — authored directly.
5. **Research returned.** Chuck ran Research and uploaded the full A–K dataset.
   Claude mapped it to the schema, posed five gating decisions, and flagged O3/O4.
6. **Decisions approved.** Chuck approved D11–D14 and the D15 approach (numbers
   pending review). Requested this implementation history file and a PRD to make the
   process reproducible for future battles — both delivered to close the session.

**State at session end:** schema frozen at v0.1; research data in hand; five gating
decisions resolved; transcription (O1) is the next unit of work. GitHub repo not yet
created — when it is, this file and the PRD move into it and the repo becomes source
of truth per standing practice.
