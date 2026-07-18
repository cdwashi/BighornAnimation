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
| D15 | 07-14 | **Leader ratings (0–100)** proposed by Claude from documented behavioral evidence, evidence quoted in `ratingsProvenance`; Chuck reviews the numbers explicitly | Research deliberately supplied evidence, not numbers; the numbers are argued opinions and are flagged as such for PR-style review. | Approved — ratings approved as proposed (Chuck, 07-14); O2 closed |
| D16 | 07-14 | **Weak citations recorded faithfully** (Wikipedia, forum-tier, "subagent" relays) rather than laundered | Honest accounting; flags where re-sourcing is warranted before publication-grade claims. | Approved |
| D17 | 07-14 | **schema v0.1.1** (weaponMix sum rule removed, RIFLE_BREECHLOADER added, tickPhases deferred). | First contact with real data exposed the sum-rule bug. | Approved |
| D18 | 07-14 | **O1 split** Fable froze all judgment into TRANSCRIPTION-DECISIONS, Codex assembles + builds the harness, Fable reviews. | Judgment/typing split per workflow. | Approved |
| D19 | 07-14 | **Post-O1 review rulings R1–R9:** DEM south bound 45.42 ratified; civilians-interpreters kept as 16th US unit (flagged); camp strengths via lodge-proportional method (5,250 across six camps); pack-train mix 0.8/0.8 + GRAHAM source key; scout ammo mirrored from tables; courier orders target co-f; checkpoint representative mappings ratified; blackfeet-santee position interpolated; empty variant exclusions confirmed correct. Full detail: codex-report.md AMBIGUITIES + CODEX-WORKORDER-O1B.md. | Codex ask-don't-guess flags → Fable rulings; most traced to spec bugs owned in-session. | Approved; O1 closed |
| D20 | 07-14 | DEM: USGS 3DEP 1/3 arc-second, TNM API, bounds sw(45.42,−107.48) ne(45.60,−107.15) | Free, seamless, adequate for battalion-scale LOS; preserved battlefield ≈ 1876 surface. 1 m lidar noted as upgrade path. | Approved |
| D20a | 07-14 | Two-tier grid: core battlefield 10 m, full box (approach + Crow's Nest) 30 m | Full 10 m ≈ 10 MB asset; two tiers keep the static app light while serving both phases. | Approved |
| D21 | 07-14 | Project to UTM 13N; engine in local meters, origin SW corner | No degree math in the engine; authoring stays WGS84. | Approved |
| D22 | 07-14 | Contours: 5 m interval, 25 m index | ~100 m total relief; 10 m too sparse to read coulees. | Approved |
| D23 | 07-14 | LOS requires earth-curvature + refraction correction (k=0.13) | Crow's Nest sighting is ~24 km; raw curvature drop ~45 m exceeds village-site relief. Gate G3 proves it live. | Approved |
| D24 | 07-14 | O3 protocol: adjudicate Crow's Nest candidates by viewshed-scoring against documented dawn observations | HIGH-confidence observation events legitimately adjudicate a disputed input coordinate. | Approved |
| D25 | 07-14 | O4 Tier A for v1: river/timber corrections from NPS GRI figures + Maguire 1876 map, LOW–MEDIUM flagged; Tier B (QGIS georeferencing) backlogged | Ships honest corrections now without blocking M1. | Approved |
| D26 | 07-14 | Integer-strength rule: all unit strength Estimates (incl. variant-added/modified) are whole men; splits use parent-keeps-remainder (co-c 19/20/23, co-c-det 19/20/22). Enforced by new data-integrity assertion. | Found via O1b review (22.5-man bug); bug becomes a permanent gate, per house pattern. | Approved |
| D27 | 07-14 | Marker-relocation convention: marker-sourced landmark coords may move to the DEM terrain feature when DEM+EPQS confirm, historical function requires it, and provenance keeps both. Applied: sharpshooter-ridge → 45.5336,−107.3927 (crest, 1039 m), MEDIUM. | HMDB marker sits on the flank (1025 m), below Reno Hill; ridge must command Reno Hill per plunging-fire accounts. Found by gate G2; second instance of the Crow's Nest-decoy pattern. | Approved |
| D28 | 07-14 | Movement-cost slope factor 1+tan(slope), [CAL] placeholder; Tobler's hiking function noted as M5 upgrade candidate. | No formula in spec; monotonic and adequate pending calibration. | Approved |
| D29 | 07-15 | Large derived vector assets: commit compressed (.br) variants only; gitignore raw derived files >5 MB; loader reads .br. Pipeline additionally caps GeoJSON coordinate precision at 5 decimals (~1 m — ample for 5 m contours). | 43 MB raw GeoJSON bloats every future clone; GitHub warns at 50 MB. Raw remains reproducible via `npm run terrain`. | Approved |
| D30 | 07-15 | Engine in `engine/src/`, headless and pure: no React/DOM/Node-only APIs in hot path (terrain loader injected); no `Date.now()`/`Math.random()` — all randomness via seeded PRNG; no key-order-dependent iteration; pure functions over explicit state. Root `tsc -b`, no workspace restructuring. | Determinism and testability; mirrors the Mah Jongg headless-engine pattern. | Approved |
| D31 | 07-15 | State/replay: event-sourced canon (re-run from tick 0 is canonical), keyframe snapshots for UI scrubbing only. Save = scenario id + content hash, variant ids, parameter overrides, seed, target tick; load refuses on scenario-hash mismatch. Typed engine events feed UI index and tests. | Full-day replay is sub-second (2,160 ticks × ~33 units); hash check inherits the Mah Jongg save-integrity rule. | Approved |
| D31a | 07-15 | PRNG: mulberry32, seeded from scenario + user seed; PRNG state serialized in SimState. | Substrate established before M4 needs combat rolls; replay stays bit-identical. | Approved |
| D32 | 07-15 | Speed table as engine config constants, all [CAL]: cav walk 1.8 m/s, trot 3.6, gallop 5.4; dismounted skirmish 1.1; pack train 1.2 (caps co-located escort); warrior mounted = cavalry parity [CAL]; on foot 1.3. Effective = base × cost-grid factor × formation modifier (COLUMN 1.0, LINE 0.8, SKIRMISH 0.7, DISPERSED 0.9). Fords: impassable river except ford cells + crossingPenaltyMinutes hold. Fatigue deferred to M4. | Standard cavalry-manual rates as starting values. **Chuck: approved as-is; tune later against the E5 report if needed.** | Approved |
| D33 | 07-15 | Pathfinding: A* on core-tier movement-cost grid, 8-connected, √2 diagonals, cost = step distance × mean adjacent cell cost; string-pulling smoothing; paths cached per order; 30 m tier when a path exits the core box. Units are points at battalion scale (no friendly collision in M2). | Grid already exists from M1; caching keeps the full-day run trivial. | Approved |
| D34 | 07-15 | Order lifecycle: issued → in-transit (transmissionMinutes + issuer orderDelayMinutes) → received → active → done/superseded. **Supersede-on-receipt: a newly received order replaces the active order; no queueing.** `order-superseded` audit event emitted. Pursuit objectives (targetUnitId): repath every 10 ticks or on >250 m target displacement; park at 150 m standoff emitting `contact-pending` (M4's engagement seam). | Queueing can silently reorder history when transmission delays overlap; supersede keeps the timed order list authoritative and matches how verbal battlefield orders worked. **Chuck: supersede approved.** | Approved |
| D35 | 07-15 | Couriers are delivery-queue timers in M2 (data transmissionMinutes authoritative); queue entries carry route endpoints so M4 can upgrade couriers to killable entities without schema change. | Honors FR4's courier-loss requirement later without blocking M2. | Approved |
| D36 | 07-15 | M2 executes scheduled orders only; DEFEND_CAMP and tactics-profile trigger behaviors dormant until M3 provides spotting. Scheduled coalition orders (gall-response, gall-calhoun, crazy-horse-sweep, ch-strike, lwm-charge) run as movement. | Trigger condition is "enemy spotted," which requires LOS; running them blind would fabricate behavior. | Approved |
| D37 | 07-15 | Movement-only checkpoint pre-score (gate E5) is informational, non-blocking: report emitted via CLI runner (`npm run sim`); misses expected pending M4 combat delays, but gross misses (wrong side of river, hours-scale error) investigated before M2 closes. Keyframe interval for UI scrubbing: every 10 ticks (5 min). | E5 is the baseline M4 must beat; gross-miss clause catches engine bugs hiding behind "combat will fix it." **Chuck: 10-tick keyframe default approved.** | Approved |
| D38 | 07-15 | HOLD with an objective means "proceed to objective, then hold position" (amends M2-ENGINE-SPEC §6, which said stationary). Engine change only; verified safe for all other HOLDs in data and variants (both degenerate to stationary). | E5 gross-miss root cause: right-wing-ridges froze co-c/i/l at Cedar Coulee for 5+ hrs; plain military reading of the order was inexpressible. Found by gate E5 + escalation rule. | Approved |
| D39 | 07-15 | Add MOUNT order: id reno-mount, minute 749, issuer reno, recipients co-a/g/m, transmission 0, historicalText "Mount!" — split from reno-retreat per research §E verbatim commands. 749 (not 750) guarantees the 2-tick state change completes before reno-retreat's WITHDRAW arrives under D34 supersede. Order count 22→23; data-integrity expected-count test updated; TRANSCRIPTION-DECISIONS §8 addendum noted. | E5 gross-miss root cause: the rout ran dismounted (+195 min to Reno Hill). Transcription refinement of recorded commands, not invention. | Approved |
| D40 | 07-15 | M2 closed with Reno Hill +95.5 min documented as a placeholder-river artifact (three mechanisms: southern-endpoint walkaround, retreat-crossing ford ~2 km off channel, timber objective on the channel line — all pre-flagged "pending O4/O6"). Resolution deferred to O4 Tier A; E5 re-baselines via `npm run sim` when real geometry lands. Escalation adjudicated: not engine, not D32. | Engine met every M2 exit gate; miss is known-placeholder data with an approved fix path (D25). Holding M2 open buys no information. D32 speed table survives second contact untuned. | Approved |
| D41 | 07-16 | Tier A channel: 298-point DEM-thalweg trace replaces the 4-point placeholder, and becomes the river-1876-channel correction geometry. Confidence MEDIUM as 1876 meander-belt proxy per Martin (2010) via NPS GRI 2011; Garryowen loop and Ford B reach flagged LOW (documented 1876 deltas). Validation: 0 elevation reversals over 1,192 rows, monotone 957.9→921.2 m descent, sinuosity 2.09, passes 4 m from the USGS gauge. | USGS hydrography APIs robots-blocked; DEM thalweg is self-contained, validated, and uses committed data. Dissolves all three D40 mechanisms. | Approved |
| D42 | 07-16 | Ford relocations: ford-a 45.49473,−107.39305 validated (MEDIUM); ford-b → 45.5468,−107.4164 snapped to channel (LOW — the 1938-realigned marker sits 336 m east; GRI documents realignment from the 1876 channel; exact 1876 point unknown); retreat-crossing → 45.52081,−107.38558, channel point nearest Reno Hill at 461 m (MEDIUM — matches bluff-base retreat and Water Carriers Ravine accounts). | Closes M1-A ambiguity #4. | Approved |
| D43 | 07-16 | Tier A timber polygon (loop bend 45.526–45.534 + 250 m east-bank belt) and village polygon (600 m west-bank strip, Garryowen reach → Ford B) at LOW; timber landmark relocated to loop centroid per D27 convention. Maguire-map georeferencing remains the Tier B upgrade. | Per D25; extent approximated from channel geometry, GRI terrace description, and accounts. | Approved |
| D44 | 07-16 | cp-reno-skirmish-line and cp-reno-timber checkpoint positions relocated to corrected timber geometry; times and tolerances unchanged; provenance records both coordinates. | Source-geometry correction of APPROX-flagged, LOW-confidence checkpoint coordinates that we now know sit ~1 km east of the actual river — not tuning to fit a run. Explicitly human-approved (Chuck, 07-16) because checkpoints are calibration ground truth. | Approved |
| D45 | 07-16 | cp-yates-ford-b checkpoint relocated to the D42 ford-b coordinate (45.5468,−107.4164); tolerance (150 m) and time unchanged; provenance records the 1938 marker coordinate, the GRI-documented realignment, and the Fox-archaeology caveat (finds anchor to the stable coulee-mouth approach; exact 1876 crossing within the reach is LOW). | Checkpoint and its order objective must reference the same physical crossing; the marker is documented as not the 1876 river. Marker-vs-feature convention (D27, D44 lineage). Flips MISS→HIT — hence an explicit human ruling, not a silent edit. | Approved |

| D46 | 07-16 | Deterministic threshold spotting for v1 (no RNG consumed; M4 combat gets first dice); detectability = angular size × transmittance × motion × perception with gain/lose hysteresis; per-observer event log with side-level believed-picture aggregation (v2 per-commander guard). All params [CAL] in one global table. | Probabilistic spotting would make the C4 exam flaky; per-observer data preserves the v2 upgrade path without schema break. | Approved |
| D47 | 07-16 | DEFEND_CAMP activates: believed enemy within 3 km [CAL] of an own camp → idle pool bands interpose; scheduled orders remain authoritative for named bands. | D36 lifts now that spotting exists; the village's reactive defense becomes emergent, the timed axes stay reconstruction. | Approved |
| D48 | 07-16 | Viewshed = radial-ray raster at display resolution sharing the M1 ray core (curvature + cover + atmospheric), worker-computed, cached per (observer, tick); renderer/engine ray parity enforced by gate V5. | One ray implementation — the overlay must never disagree with the engine. | Approved |
| D49 | 07-16 | C4 exam: Crow's Nest events excluded pending O3 (they are the D24 adjudication instrument); remaining HIGH/MEDIUM events gate at ≥80%; tuning legitimate only via the single global table — per-event fudges are gate-weakening. | The events are LOS ground truth; the ruler cannot also be the thing measured. | Approved |
| D50 | 07-16 | M3 ships the first app shell (map, scrubber, POV overlay, belief-vs-reality toggle, decision index auto-generated from orders — chronological); polish deferred to M6. | A viewshed without a screen is a report, not an experience; decision index costs zero new data. | Approved |
| D51 | 07-16 | Partial-visibility observation rows split into per-target sub-assertions against individual camp units (transcription refinement, D39 precedent, provenance retained). | Makes "Reno saw only the southern edge" mechanically testable. | Approved |
| D52 | 07-16 | ObserverPosition for all six D51 sub-assertions refined from Ford A (water level) to the D44-corrected valley skirmish-line coordinate, mounted height, same minute — applied to the full observation moment as one unit; both coordinates in provenance; exam re-run accepting ALL resulting verdicts, including any new failures on the north-camp rows. | Research row "Reno @ Ford A / valley" conflated two positions; the sighting historically belongs to the valley advance (Reno halted because he saw the massing). Source-semantics correction (D44/D45 lineage), ruled after the gate passed 9/11 — refinement, not rescue; D49's repositioning ban binds tuning, not sourced corrections. | Approved |
| D53 | 07-16 | Six camp-unit centers + dependent pool starts relocated into the D43 village strip at researched S→N ordering latitudes; village-s-end and village-n-end landmarks move to the strip ends (order-objective coherence, D45 principle); both coordinates in provenance, LOW. | C4 exam exposed O1's APPROX centers sitting 0.8–1.5 km west on the terrace bench (18 m above valley floor) — outside our own village polygon; the S→N ordering is the firm research fact, the centers never were. D44/D45 lineage. | Approved |
| D54 | 07-16 | Cover transmittance becomes path-length-dependent (Beer–Lambert): ∏(1−losOpacity)^(cellPathMeters/L0), L0=100 m [CAL]; losOpacity redefined as opacity per 100 m of path. Global re-tune under D49; exam re-run with all verdicts accepted as they fall (D52 integrity constraint now standing policy). | Per-polygon attenuation (M3-SPEC §2 — Fable's spec defect, owned) provably admits no global threshold: Weir pass requires T≤1.4e-3 while north-camp masking requires T>9.1e-3. Path-length law makes "bends and timber mask the extent" expressible as physics. | Approved |
| D55 | 07-16 | Engine cache-purity rule: all memoization must be a pure function of current SimState; history-dependent auxiliary state is forbidden (D31 invariant made explicit). Applied: spotting LOS cache re-keyed by 100 m-quantized endpoint cell pairs. New permanent gate: cache-equivalence test — full-day run with caching disabled vs enabled must be bit-identical. Invalidation-semantics change may shift spotting verdicts by a tick; exam/E5 re-run with verdicts accepted per standing policy. | Found by E6 going red after D53a's track change; latent through all prior E6 passes (scrub-point luck). Defect originated in Fable's M3-A work-order cache sentence — owned. Bug becomes rule becomes gate, per house pattern (D26, D29 lineage). | Approved |
| D53a | 07-16 | reno-advance objective changed from raw waypoint {45.52,−107.43} (stale terrace coordinate) to landmarkId village-s-end; sole stale-coordinate order (verified by count). E5 co-a track change accepted as it falls, diff itemized. | Completes D53's order-objective coherence: the raw coordinate is how the staleness occurred; the landmark reference is self-healing against future geometry corrections. Checkpoints untouched — unit track changes are source coherence, not tuning. | Approved |
| D56 | 07-17 | Engine full-day reconstruction re-targeted: ≤ 6 s with worker progress indication (was "<1 s" — an unvalidated D31 movement-only estimate; M2 gate timings already showed ~5 s/day pre-M3-B). Scrubbing unaffected (instant via D37 keyframes). Engine optimization → M6 backlog, revisit after M4 reshapes the profile (A* + spotting dominate today). | Measurement correcting an estimate, not a regression. Codex profiled, attempted, reverted, and declined to game the number. | Approved |
| D57 | 07-17 | M3-C UX round from first user review (Chuck): pan/zoom + zoom-to-marker (spec-gap omission, Fable owned), unit tooltips, in-app legend, ghost-marker clarity, decision-index ORDER/EMERGENT badges, inter-tick position interpolation (PRD compliance), continuous speed slider, viewshed contrast pass. UI-only; engine untouched. Encounter action tooltips deferred to M4 spec (no engine actions exist to describe until combat). | First real-user evaluation; comprehension fixes precede new capability. | Approved |

## 3. Artifacts Delivered

| Artifact | Date | Notes |
|---|---|---|
| `scenario-schema.ts` | 07-14 | Battle-agnostic scenario schema (TypeScript). Root: meta, clock, terrain, weapons, tacticsProfiles, sides, leaders, units, orders, checkpoints, observationEvents, variants, calibration. |
| `little-bighorn-research-prompt.md` | 07-14 | Deep Research prompt, deliverables A–K keyed to the schema. |
| Research output (Chuck-supplied) | 07-14 | Full A–K dataset + gaps/reliability report. Received and reviewed; quality strong. |
| `IMPLEMENTATION_HISTORY.md` | 07-14 | This file. |
| `PRD-battle-simulator.md` | 07-14 | Product requirements + reproducible per-battle pipeline. |
| `TRANSCRIPTION-DECISIONS.md` | 07-14 | Frozen judgment calls for O1 assembly; authoritative on conflicts with research doc. |
| `CODEX-WORKORDER-O1.md` | 07-14 | Work order: scenario transcription + validation harness. |
| `CODEX-WORKORDER-O1B.md` | 07-14 | Work order: schema v0.2 + D19 ambiguity burn-down. |
| `M1-TERRAIN-SPEC.md` | 07-14 | Terrain pipeline spec (D20–D25); §8 gates became the M1-A exit tests. |
| `CODEX-WORKORDER-M1A.md` | 07-14 | Work order: terrain pipeline + loader + validation gates. |
| `scenario.json` v0.2 | 07-14 | Little Bighorn scenario data; 33 units / 18 leaders / 22 orders / 7 variants; 37-flag ambiguity ledger. |
| `codex-report.md`, `codex-report-o1b.md`, `codex-report-m1a.md` | 07-14 | Codex execution reports with verbatim proof output and AMBIGUITIES sections. |
| `data/terrain/little-bighorn-1876/` | 07-14 | Processed terrain assets: two-tier elevation/slope grids, hillshades, 5 m contours, cover + movement-cost layers (D29 .br packaging, 07-15). |
| `M2-ENGINE-SPEC.md` | 07-15 | Engine-core spec (D30–D37); gates E1–E6 define M2 exit. |
| CODEX-WORKORDER-M2A.md | 07-15 | Engine-core work order (D30–D37 frozen). |
| reports/e5-baseline.md | 07-15 | Movement-only checkpoint baseline (gate E5); the score M4 must beat. |
| `O4-CORRECTIONS.md` | 07-16 | Approved O4 Tier A river/timber/village geometry rulings D41–D44. |
| `o4-corrections-data.json` | 07-16 | O4 Tier A channel, ford, timber, village, and Garryowen correction geometry with per-item provenance. |
| `reports/e5-baseline.md` (O4-A regeneration) | 07-16 | Movement-only checkpoint baseline regenerated at tick 2160 after Tier A geometry integration. |
| `reports/c4-observation-exam.md` | 07-16 | M3-A C4 movement-only observation exam with per-event margins, factor audit, O3 informational rows, mismatches, and global tuning audit. |
| `CODEX-WORKORDER-M3A.md` | 07-16 | Headless M3-A work order for spotting, believed picture, DEFEND_CAMP, D51, C4, and gates V1–V3/V7. |
| `CODEX-WORKORDER-M3B.md` | 07-17 | App-shell work order for the map, POV viewshed, belief modes, decision index, and gates V4–V6. |
| `app/` | 07-17 | First static-export UI shell: full-viewport period map, worker-backed timeline, POV viewshed, belief-vs-reality controls, and chronological decision index. |
| `codex-report-m3b.md` | 07-17 | M3-B execution report: V4 timings, V5 exact parity 200/200, V6 counts, gzip weight table, D50 perf finding (→ D56). |
| `docs/screenshots/` (m3b-*) | 07-17 | First rendered proof: full map 15:40, Custer POV at Weir vicinity with belief on, decision index at the Cooke note. |
| `.claude/launch.json` + `.claude/static-server.mjs` | 07-17 | Dev-only static-export preview tooling (dependency-free node server on :4173) used for live UI verification. |
| `CODEX-WORKORDER-M3C.md` | 07-17 | UI-only D57 work order implementing the first-user comprehension and navigation fixes with gates U1–U3. |
| `docs/screenshots/` (m3c-*) | 07-17 | U2 visual proof set: three M3-B frames re-captured at identical viewport framing plus the Reno Hill 16:20 viewshed contrast before/after. |

## 4. Open Items

| # | Item | Owner | Notes |
|---|---|---|---|
| O1 | Transcribe research → `scenario.json` + validation harness | Claude | ✅ Closed — committed (d6b1da2 + 3c2f1f8); D19 rulings; 37-flag ambiguity ledger carried in provenance. |
| O2 | Leader rating numbers review | Chuck | ✅ Closed — ratings approved as proposed (D15, 07-14). |
| O3 | Crow's Nest coordinate | Both | In progress — D24 viewshed-adjudication method road-tested via D27 (neighborhood scan + EPQS); Research run for candidates drafted. |
| O4 | 1876 river channel corrections | Claude | ✅ Closed — Tier A shipped; Tier B georeferencing backlogged. |
| O5 | Re-source weak citations flagged in D16 | Claude | Open — before any publication-grade use. |
| O6 | DEM acquisition + terrain pipeline | Claude | ✅ Closed — M1-A delivered pipeline, loader, raycast, gates G1–G5 (see D20–D23, D29). |

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

### Session 2 — 2026-07-14/15 (claude.ai)

"O1 executed via Codex, reviewed by CC + Fable; D19 rulings; O1b burn-down 57→42 flags; D26 integer rule from review; terrain decisions D20–D25 approved; M1-A queued."

**State at session end:** repo live and source of truth; O1 + O1b committed (schema
v0.2, 42-flag ambiguity ledger); M1-A terrain pipeline complete with all five gates
green incl. G4 terrain-mask; D19–D37 logged; O3/O4 Tier A and the M2 engine
implementation (spec approved, D30–D37) are the open fronts.

M3-B: first UI shipped — map, POV viewshed, belief toggle, decision index.
