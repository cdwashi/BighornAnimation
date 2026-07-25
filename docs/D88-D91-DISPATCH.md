# D88–D91 — Ruled Rows, Frozen Work Order, CC Dispatch

**Date:** 2026-07-24 · **Base commit:** `90eae8c` · **Last ledger row:** D87
**Session origin:** H1 probe → O6-STANDOFF research → backward-walk measurement → five verification probes

Append rows in the order below; they are numbered for that order.

---

## 1. Ledger rows — append verbatim

### D88 — O6 coordinates non-authoritative

```
| D88 | 07-24 | O6-STANDOFF coordinates recorded as NON-AUTHORITATIVE; the scenario frame governs. O6's verdict (TERRAIN — defenders occupied terrain features, not a standoff range), its feature identities (timber/brush, low hill "Bench", W-edge foothills, Ford B riverbank), its turnout delay (10/15/20 min) and its evacuationScreen=false finding are ACCEPTED. Its lat/lon values are NOT transcribed: they diverge from the scenario frame by ~2.6 km at the Hunkpapa circle. Feature coordinates are re-derived in-frame from the terrain cover raster and elevation, per O6's own statement that "feature names are the load-bearing locators; lat/lon carry high positional uncertainty." | Probe 07-24: all six camp units sit on VILLAGE raster cells within 2-6 m (hunkpapa 2, oglala 2, minneconjou 5, sans-arc 5, mixed-north 6, cheyenne 6) — camp units and terrain raster were derived together and are fully self-consistent, so the divergence is O6's. Independent corroboration of the scenario frame: Reno's line centroid sits 227 m from hunkpapa-camp, inside O6's own sourced range for Reno's halt (183-274 m; NPS ~200 yd, RCOI ~274 m), derived from unrelated work. | Ruled |
```

### D89 — Cover vocabulary: layered model, v1 mapping

```
| D89 | 07-24 | Cover vocabulary ruled as TWO LAYERS, not one enum. (a) STATIC SUBSTRATE = the terrain raster (NONE, TIMBER, VILLAGE, RIVER, FORD populated; RAVINE and HISTORICAL_CORRECTION declared but EMPTY, 0 cells each — nothing may be built on them). Immutable, sourced, cacheable. (b) TRANSIENT OVERLAY = simulation-emitted effects with a lifetime and an emitting unit; DUST_SMOKE_ZONE belongs here, NOT in the raster. Cover/concealment queries resolve across layers. V1 MAPPING, scenario CoverKind -> substrate: TIMBER->TIMBER, VILLAGE->VILLAGE, RAVINE->(unavailable, empty), BRUSH->TIMBER (fidelity limit: the terrain pipeline has no brush source; O6's "timber and brush" collapses to TIMBER at v1 and this is recorded as a known loss, not laundered), DUST_SMOKE_ZONE->declared-but-unimplemented, parked for v2. | Ruled against the v2 zoom-in animation target. Unifying the enums would require rewriting a shared immutable raster per tick or special-casing one code through every consumer, would overwrite the substrate an animator must draw beneath the dust, and would mix sourced terrain with simulation output in one array — provenance laundering. The layered model matches the renderer's natural query (substrate, then composite overlays) and lets dust/smoke feed the same concealment path D87 already runs on cover polygons, which is historically apt for both the valley fight and the Custer field. HISTORICAL_CORRECTION purpose is UNKNOWN — 0 cells, no manifest note; no interpretation is asserted. | Ruled |
```

### D90 — Bench identified in-frame

```
| D90 | 07-24 | O6's "low hill / Bench" identified in-frame at 45.51659, -107.38996 (+5.5 m above local valley floor, 218 m from Reno's line, 380 m from hunkpapa-camp). O6's "low round foot-hills, W valley edge" identified as the separate, higher, farther feature set at 45.50579/-107.40259 (+21.1 m), 45.51317/-107.41571 (+31.7 m) and 45.50827/-107.41294 (+33.0 m), 1845-2191 m out — consistent with Varnum's RCOI testimony that fire from the foothills at 800-1200 yd fell short. Confidence MEDIUM. | Derived by terrace search (rise 3-18 m above local floor, <=3.5 m relief across a 60 m neighbourhood, downhill break toward the line), not by local-maximum search: a bench is a terrace, not a summit, and an earlier summit search returned only the foothills. Selected candidate is the only one at a distance consistent with O6's geometry (218 m from a line that itself sits 227 m from the lodges), has the most relief of the terraces, and lies physically between line and village on the west side. CAVEAT RECORDED: "Reno's left flank" is not computable — see D91 rider — so selection rests on absolute geometry, not flank. | Ruled |
```

### D91 — Camp-defence rulings (work order below)

```
| D91 | 07-24 | Camp-defence reconstruction ruled, defect class, D79.3 unaffected (no [CAL] value is touched). FOUR coupled changes, one work order: (1) LATCH — re-path while campDefense is active and blocked, replacing the single-shot `if (!unit.campDefense) activate(...)`; (2) STRANDED UNIT — movement may not place a unit on an impassable cell, and a unit already on one must be recoverable; findPath rejects an impassable START, so a unit that walks into the river can never path out; (3) GOAL — the D47 geometric midpoint is RETIRED and replaced by feature-based positioning from scenario data (D88/D89/D90); no standoff number, no ratchet; (4) THREAT COMMITMENT — nearest-threat re-selection is ruled correct in principle but requires a switching margin; unhysteretic per-tick re-selection produced target thrashing. Turnout delay 10/15/20 min (O6, MEDIUM) replaces activation-on-spotting. | H1 probe 07-24: 447 of 1707 warriors (26%) ever come within 500 m of Reno; seven of ten bands never move all day. Backward-walk measurement (scratch build, seed 18760603): naive continuous re-path against the midpoint goal produced 3652 m of backward travel against 6642 m forward (sans-arc), 3641/6813 (blackfeet-santee) — the artifact O6's TERRAIN verdict removes by construction, since a static feature goal cannot recede. Stranded-unit defect VERIFIED not inferred: minneconjou-pool at 45.52194/-107.39808, cover=RIVER, movementFactor 0.00, gridCost Infinity, start not passable, while its two companions 350 m away path normally. This defect is MASKED by the latch in the baseline and is UNMASKED by fix (1) — the two must ship together. | Ruled |
```

**Rider to D91, recorded not ruled:** units are dimensionless points and Reno's co-a, co-g and co-m occupy the *identical* position (45.51833, −107.38873). O6 documents a ~206 m frontage. There is therefore no skirmish line and no left flank in the simulation. This is a modelling choice surfacing, not a defect, but it bears directly on a valley phase that historically turned on an unanchored left. Flagged for separate adjudication; **not** in scope for D91.

---

## 2. Frozen work order — WO-D91 (for Codex, via CC)

**Self-contained. Assume zero prior context.**

### Context
Camp defence currently freezes 1,260 of 1,707 coalition warriors for the entire battle. Two causes: a pathfinding result latched once at tick 1174 and never retried, and an eligibility rule that excludes any band holding an order anywhere in the day. Consequence: the valley fight runs at 26% of available warrior mass, which is why composite gate D82 proved unreachable by calibration in M5-B rounds 3–4.

### Scope — four changes, all in `engine/src/camp-defense.ts` unless noted

1. **Re-path.** Replace the single-shot activation with per-cadence re-evaluation while `campDefense` is active. Emit `camp-defense-activated` only on first activation, not per tick.
2. **Stranded-unit guard** (movement module). Movement must not place a unit on a cell with non-finite cost. A unit already on one must be able to path out — nearest-passable recovery. **Plus a permanent invariant test (gate):** across a full-day baseline run, no unit occupies a cell with non-finite movement cost at any tick — asserted in the test suite, bug-becomes-gate per the D26/D29/D55 pattern.
3. **Feature goal.** Retire the `(camp + threat) / 2` midpoint. Goal is selected from scenario-supplied cover features per D89's substrate mapping. Bench coordinates per D90.
4. **Threat commitment.** `nearestCampThreat` gains a switching margin; a committed threat is held until an alternative is nearer by that margin, or the current threat is destroyed or withdraws.

Plus: turnout delay 10/15/20 replaces activation-on-spotting.

### Out of scope — do not touch
Any `[CAL]` value. Global lethality rails. The DEFEND_CAMP eligibility rule at `state.ts:241` (separate ruling, not yet made). Unit frontage. The empty RAVINE and HISTORICAL_CORRECTION raster codes. `DUST_SMOKE_ZONE` implementation.

### Pre-registered predictions — per D52, judged as distributions per D80, N=50
1. ≤500 m contact mass against Reno exceeds 800 warriors before minute 750 (baseline: flat 444).
2. Unordered bands hand off northward to a Custer company unscripted; Reno-Benteen hold still passes C3.
3. A/G/M reach BROKEN during the valley fight with **no** change to any global lethality rail; the ford choke repopulates.
4. Reno's losses stay inside their sourced band — beaten, not destroyed. Annihilation is the overshoot signal and halts any follow-on eligibility ruling.

Verdicts accepted as they fall. A red gate is reported red.

### Proof required
Verification quartet — typecheck · lint · tests · build — plus a before/after composite audit and the four probe scripts re-run against the new build.

---

## 3. CC dispatch — paste in order

**Opener.** Clone `cdwashi/BighornAnimation`. Read `docs/IMPLEMENTATION_HISTORY.md` and `docs/Memory.md` in full. Confirm HEAD is `90eae8c` and report the last ledger D-number. Change nothing until I confirm your state report. *(Expected: D87.)*

**Task A — docs only.** Append rows D88–D91 verbatim. Add the D88 header note to `docs/research/O6 Standoff Research.md`. Add the four probe scripts to `.claude/` as preserved verification tooling. Run the quartet. *Expected: green, composite unchanged at 60.41%. If the composite moves at all, STOP — a docs-only change cannot move it.*

**Task B — code.** Dispatch WO-D91 to Codex. On return, run the quartet plus the composite audit, re-run the four probes, and report each pre-registered prediction as hit or missed.

**Hard rules for the whole session.** Do not transcribe any lat/lon from the O6 research file. Do not touch any `[CAL]` value — D79.3 remains in force and this work order is defect-class only. Do not fix anything opportunistically outside WO-D91. If a gate goes red, report it red.

---

## 4. Open items after this dispatch

| item | status |
|---|---|
| DEFEND_CAMP eligibility (`state.ts:241`) | Ruled *not yet*; sequenced after D91 so attribution stays clean |
| Unit frontage / coincident companies | Recorded, needs adjudication |
| RAVINE + HISTORICAL_CORRECTION empty | TODO, nothing may be built on them |
| O5 publication-grade sourcing | v1-blocking, unchanged |
