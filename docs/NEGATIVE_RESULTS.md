# Negative Results Register

Refuted hypotheses, missed predictions, red gates, and rejected proposals. Maintained because a record containing only successes is a curated record. Append-only; entries are not removed when superseded, only annotated.

Companion to `METHODS.md` §9.

---

## 1. Refuted hypotheses

Raised in good faith during investigation, then killed by measurement. Recorded so they are not re-derived from the same symptoms later.

| # | Hypothesis | Raised by | Refuted by | Outcome |
|---|---|---|---|---|
| 1 | Terrain starvation — the terrain model prevents warriors reaching the valley fight | Session design (H1) | H1 probe, 07-24 | **Half-right, wrongly diagnosed.** The absence was real and larger than supposed (26% participation), but terrain behaved correctly. Causes were a latched pathfinding result and an eligibility rule. |
| 2 | Ford B is missing from the terrain raster | Design review | Native-resolution scan, 07-24 | **Refuted.** A 25 m sampling artifact. At 10 m there are 15 ford cells in three clusters; Ford B sits ~430 m from O6's Medicine Tail position. |
| 3 | `gridForPath` builds a bounding box between endpoints, excluding fords | Design review | Source read, 07-24 | **Refuted.** It returns the entire core or full grid. All fords are always inside the search space. |
| 4 | Path failure is a tier switch — endpoints outside core drop pathing to the coarse full grid | Design review | Tier probe, 07-24 | **Refuted.** Both endpoints inside core; 10 m grid used; all 15 ford cells present; fords are passable. The goal cell was simply river. |
| 5 | `HISTORICAL_CORRECTION` encodes 1876-vs-modern channel migration | Design review | Full-core scan, 07-24 | **Refuted as unsupported.** Zero cells, no manifest note. Purpose unknown; no interpretation asserted. |

| 6 | WO-D93 had been dispatched to Codex and was running ("still in verification") | Conversational assertion, repeated across all three parties without verification | Machine check, 07-25: on-disk Codex session logs contain no trace of the work order; the presumed-running process was identified by command line as the VS Code extension's companion server | **Refuted.** No dispatch ever occurred. The pre-registration commit therefore preceded dispatch itself, not merely results. Corrected in `PREDICTIONS.md` by dated note; the work order was then genuinely frozen (`docs/WO-D93.md`) before first dispatch. |

**Pattern worth noting:** four of five were raised by design-side reasoning ahead of measurement, and each correction cost more than the check would have. Recorded as a methodological lesson, not only as five facts.

**Row 6 is a methods lesson of its own:** a claim asserted in conversation became a documented fact in the audit record without any of three parties verifying it, and it was caught by checking the machine, not by re-reading the document. The error entered the record through the exact channel the record exists to discipline — and the verification culture caught it inside its own audit trail. The correction is dated, the original wording preserved, and the discovered state was better than the asserted one.

## 2. Missed predictions

Pre-registered before implementation; judged as they fell; **nothing was adjusted to rescue them.**

| Prediction | Registered | Result | Disposition |
|---|---|---|---|
| P1 — contact mass >800 warriors before minute 750 | Pre-D91 | **HIT 50/50**, first crossing 718–726 | — |
| P2 — unscripted northward handoff; C3 holds | Pre-D91 | **HIT 50/50** | — |
| P3 — A/G/M reach BROKEN with no lethality-rail change | Pre-D91 | **MISS 0/50** — no seed, no company; ford choke empty | Fell into the slot D92 pre-recorded: bands position but do not close. Requires a separately-ruled closing mechanism. **Explicitly not a knob.** |
| P4 — Reno beaten, not destroyed, inside sourced casualty band | Pre-D91 | **MISS LOW** — 6–20 killed vs band 19.24–26.09 | Under-delivery, not overshoot. Headroom remains; expected to move with P3. |

P3's failure mode was named in D92 **before** the run, together with the required response. This is the intended use of pre-registration: an anticipated miss with a pre-committed answer cannot be quietly reinterpreted afterwards.

## 3. Gates red, and left red

| Gate | State | Reason | Disposition |
|---|---|---|---|
| D82 — valley-fight intensity | Unreachable by calibration | Warrior mass capped at 26% by defect; no legal parameter move could reach it | STOP taken under D79.3; reclassified to mechanism. The escape hatch functioning as designed. |
| F4 — wing destruction | RED | Failure mode is **seed-fragile**: on the as-dispatched stream E/F survive the baseline seed (complete destruction 10/50, minutes 858–914); on the committed bytes all five wing companies die in the baseline seed and **co-d** is the overshoot (complete destruction 8/50, minutes 858–861). Historical target 825–840. | Downstream of a ruled defect fix. Adjudication pending — to be judged on the envelope, not the baseline seed: a gate whose qualitative character flips on a reseed cannot be adjudicated single-seed. |
| F6 — work ceiling | RED | 11.55M expansions vs 11.1M ceiling on the committed bytes (11.80M on the as-dispatched stream; each bit-reproducible within its stream); ~1,260 newly active warriors path against a ceiling set when 26% participated | Resource gate, not fidelity gate. Re-baseline pending, to be tied to participant count with rationale recorded. |
| D80 — typical-seed envelope | Empty selection | Frozen criteria select nothing from the post-D91 distribution | Reported as a finding. Criteria **not** re-derived after seeing results — that would be forking-paths. |

**Envelope median fell 60.41% → 52.07%** following the D91 correctness fix, and the result was committed (`b139b42`). The day became structurally more correct and the score went down.

Stated on the envelope deliberately. Single-seed composites are stream-specific under D31a content-hash seeding: the pre-commit schema correction — a one-character `schemaVersion` bump, zero mechanism change — re-rolled every die and moved the baseline-seed composite 52.07% → 55.71% (3.64 pp), while the envelope median held at exactly 52.07% and the mean moved 0.03 pp. Any before/after crossing a scenario-content change is therefore made median-to-median; the pre-D91 committed envelope's median was 60.41% (its baseline seed was median-selected, which is why the same figure appears in both roles). A single-seed drop quoted across a content change would carry a noise floor of at least ~3.6 pp; the envelope comparison does not.

## 4. Proposals considered and rejected

| Proposal | Rejected because | Ruling |
|---|---|---|
| Camp-side constraint on defensive feature selection | O6 §B records Cheyenne guards posted on the **east** bank — the attacker's side, zero standoff — so the constraint forbids documented behaviour. It also reintroduces the backward-walk artifact stepwise as the eligible set shrinks toward the camp. | D92 |
| Ratchet on the interpose goal (monotone advance) | Made unnecessary by O6's TERRAIN verdict. A static feature goal cannot recede, so the artifact is removed by construction rather than patched. | D91 |
| Standoff distance as a tunable parameter | O6 returned TERRAIN with `standoffMeters: null`. Introducing a number here would have repeated the error the placeholder made. | D88 |
| Adding valley-response orders as scenario data (O6 Route C) | Structurally per-event: issue minutes chosen by the author directly determine the score. Also deepens modelling a consensus-initiative society with the opposing army's command apparatus. | Route A/B taken instead |
| Unifying the cover vocabularies into one enum | Would place a transient, simulation-emitted class in a static sourced raster — provenance laundering — and would overwrite substrate an animator must draw beneath. | D89 |
| Evacuation-screen mechanism | O6 §G: `evacuationScreen: false`. Custer interpreted the sortie as a screen; no primary source frames it that way, and Reno's fire reached the lodges. | D88 |
| Re-cite C4 observation events to the project's own DEM/viewshed analysis (O5 report recommendation) | Would make C4's ground truth derive from the thing C4 grades — the gate would measure the model's agreement with itself and could never fail for the reason it exists to detect. The events' historical facts stay testimony-sourced, honestly labeled weak where they are weak; the project's terrain analysis explains them and cannot source them. Principle recorded in METHODS §2; applies across the full 180-claim transcription pass. | Declined 07-28 |
| Nearest-to-band feature selection (dispersal candidate B) | Measured before any ruling existed, five seeds, two windows. Three failures: (1) it clusters — all three pool bands unanimously select the same feature from their home circles, which sit too close together to discriminate; (2) it locks in permanently — an occupied feature is 0 m from its occupant and beats every alternative forever, so a band could never react to a threat that walked away; (3) it sends the pool bands 1,336–4,531 m from the valley fight into the northern timber — **reintroducing through selection the participation defect D91 fixed**. Rejected designs that would have reintroduced a fixed defect are the most useful kind to have on the record. Fifth design killed by measurement before freezing (METHODS §6). | Never ruled — killed pre-freeze, no D-number |

## 5. Data rejected while its source was accepted

**O6-STANDOFF coordinates.** The research's verdict, feature identities, turnout delay and evacuation finding were accepted; its lat/lon were rejected, diverging ~2.6 km at the Hunkpapa circle. Grounds: all six camp units sit on VILLAGE raster cells within 2–6 m, and Reno's line centroid sits 227 m from the Hunkpapa camp — inside O6's own sourced 183–274 m range for Reno's halt, derived from unrelated work. O6 itself stated that feature names were load-bearing and its coordinates were not.

Recorded because accepting a deliverable wholesale is not the same as evaluating it.

## 6. Known-empty and unavailable

| Item | State |
|---|---|
| `RAVINE` cover class | Declared, 0 cells. Nothing may be built on it. |
| `HISTORICAL_CORRECTION` cover class | Declared, 0 cells, no manifest note, purpose unknown. |
| `BRUSH` | In scenario schema, no raster representation. O6's "timber and brush" collapses to TIMBER at v1 — recorded as a fidelity loss. |
| Valley-floor archaeology | The Reno valley skirmish ground was surveyed privately on private land; no published cartridge-distribution map placing warriors relative to the line is accessible. This is where HIGH-confidence evidence for defensive positions would come from. |
| Several primary loci | Cited but unread at the primary level; reach the project through secondary relay. Tracked as O5, v1-blocking. |
| The D90 Bench, post-D98 | **Load-bearing exposure increased, flagged before the O5 verdict.** D98 confines camp defence to the west bank, and the substrate timber is nearly all channel-east (timber-0001: 0 of 984 points west) — so the valley defence now stands largely on one feature: the D90 Bench (MEDIUM, terrace-search derivation, selected on absolute geometry because no flank is computable per the D91 rider). O5's B3 is still out on whether Michno p.105 supports the term. A CONTRADICTED verdict there now reaches the whole valley phase, further than it would have before D98. *Annotation 07-28: the exposure landed* — O5 returned B3 RELAYED/likely-misattributed ("bench" absent from the book's index and frequent-terms list; p.105 most plausibly outside the valley-fight chapter) and B2 a modern gloss, downgrading both pillars of the identification. D90 superseded in confidence by D101; the terrain is real, the attribution is weak, the feature stays declared at LOW. Flagged 07-26, landed 07-28 — in that order. |
