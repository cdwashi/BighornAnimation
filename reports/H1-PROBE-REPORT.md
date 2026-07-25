# H1 PROBE REPORT — where are the warriors standing during the valley-fight window?

- **Date:** 2026-07-24
- **Session:** resumption after break; picks up Memory.md §8 addendum (D79.3 mechanism STOP at round 3, composite 60.41%)
- **Repo state:** fresh clone of `github.com/cdwashi/BighornAnimation`, commit as cloned; scenario hash `be1954da`
- **Seeds:** primary `18760603` (round-3 selected baseline per M5-B); cross-check `18760625`
- **Window:** minute 660–790 (14:00–16:10). Ford A 675, skirmish line 720, timber 750, Reno Hill 765.
- **Change footprint: NONE.** Read-only probe. No [CAL] value, mechanism, scenario datum, or tracked file was modified. Probe scripts are new untracked files, listed in §7.
- **Status:** H1 answered. H2 recommended HELD. Three ruling routes tabled in §5, awaiting Chuck.

---

## 1. Verdict

**H1 (terrain starvation) is CONFIRMED as an outcome and REJECTED as a diagnosis.**

The warrior bands genuinely are not present at the valley fight — that half of H1 is correct and the magnitude is larger than the hypothesis assumed. But the terrain model is not the culprit. The terrain is behaving exactly as specified: the Little Bighorn is impassable except at fords, which is correct. The starvation comes from two implementation defects that jointly freeze **1,260 of 1,707 available warriors** for the entire battle.

Both causes are **structural and seed-invariant** — verified identical on two seeds, and traceable to deterministic code paths (an initialization rule and a single un-retried pathfinding call), not to PRNG draws.

**Headline number: 447 of 1,707 warriors — 26% — ever come within 500 m of Reno's battalion. Seven of ten bands never move at all, all day.**

## 2. The measurement

Contact mass against the nearest live Reno company (co-a / co-g / co-m), seed 18760603:

| min | clock | ≤200 m | ≤500 m | ≤1 km | ≤2 km | ≤4 km | total available |
|---:|---|---:|---:|---:|---:|---:|---:|
| 660 | 14:00 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 670 | 14:10 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 680 | 14:20 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 690 | 14:30 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 700 | 14:40 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 710 | 14:50 | 0 | 457 | 457 | 457 | 1152 | 1717 |
| 720 | 15:00 | 447 | 447 | 447 | 447 | 1142 | 1707 |
| 730 | 15:10 | 0 | 444 | 444 | 444 | 1139 | 1704 |
| 740 | 15:20 | 444 | 444 | 444 | 444 | 1334 | 1704 |
| 750 | 15:30 | 0 | 444 | 444 | 874 | 1494 | 1704 |
| 760 | 15:40 | 0 | 444 | 444 | 444 | 1494 | 1704 |
| 770 | 15:50 | 0 | 444 | 444 | 444 | 1139 | 1704 |
| 780 | 16:00 | 0 | 444 | 444 | 874 | 1494 | 1704 |
| 790 | 16:10 | 0 | 0 | 444 | 874 | 1704 | 1704 |

The ≤500 m column is flat at 444–457 for the whole fight. That figure is exactly the strength of `gall-band` + `crow-king-band` + `hunkpapa-pool` — the three recipients of `gall-response`. **No other band contributes a single man to the valley fight at any minute.**

First-movement audit (whole day through minute 790):

| band | avail | first moved | clock |
|---|---:|---:|---|
| hunkpapa-pool | 224 | 720 | 15:00 |
| gall-band | 147 | 720 | 15:00 |
| crow-king-band | 76 | 720 | 15:00 |
| oglala-pool | 230 | never | — |
| crazy-horse-band | 200 | never | — |
| minneconjou-pool | 265 | never | — |
| sans-arc-pool | 195 | never | — |
| blackfeet-santee-pool | 160 | never | — |
| cheyenne-pool | 150 | never | — |
| lwm-band | 60 | never | — |

Positions are unchanged from their scenario start coordinates for all seven — this is standing still, not slow movement.

## 3. Cause 1 — a latched pathfinding failure (620 warriors)

`minneconjou-pool`, `sans-arc-pool`, `blackfeet-santee-pool` are the only three bands running DEFEND_CAMP (see §4 for why). All three activated camp defense at **tick 1174 = minute 587 = 12:47** — 88 minutes *before* Reno reaches Ford A — and all three received `unreachable / endpoint is impassable`.

`camp-defense.ts:activate()` sets the goal to the geometric midpoint of (camp position, threat position), the D47 "interpose" reconstruction, already carrying a TODO-AMBIGUOUS note about the missing standoff distance. At tick 1174 that midpoint fell at:

**45.50935, −107.38010 — local (8110, 9690) — coverKind 254 = RIVER, movementFactor 0.**

A 9×9 sample at 25 m spacing around that point (movementFactor, coverKind in parentheses; rows north-to-south):

```
 +100  1.00(0) 0.97(0) 0.93(0) 0.90(0) 0.93(0) 0.98(0) 0.89(0) 0.00(254) 0.59(0)
  +75  0.90(0) 0.92(0) 0.95(0) 0.98(0) 0.92(0) 0.93(0) 0.89(0) 0.00(254) 0.49(0)
  +50  0.95(0) 0.95(0) 0.92(0) 0.89(0) 0.98(0) 0.90(0) 0.93(0) 0.90(0)  0.46(0)
  +25  0.97(0) 0.97(0) 0.95(0) 0.93(0) 0.90(0) 0.97(0) 0.90(0) 0.00(254) 0.48(0)
    0  0.98(0) 0.97(0) 0.00(254) 0.00(254) 0.00(254) 0.00(254) 0.98(0) 0.90(0) 0.46(0)
  −25  0.98(0) 0.98(0) 0.97(0) 0.97(0) 0.93(0) 0.89(0) 0.88(0) 0.67(0) 0.55(0)
  −50  0.98(0) 1.00(0) 1.00(0) 0.98(0) 0.97(0) 0.92(0) 0.84(0) 0.66(0) 0.67(0)
  −75  0.98(0) 0.98(0) 0.98(0) 0.98(0) 0.98(0) 0.97(0) 0.93(0) 0.63(0) 0.73(0)
 −100  0.97(0) 0.97(0) 0.97(0) 0.97(0) 0.97(0) 0.97(0) 0.97(0) 0.66(0) 0.70(0)
```

This is a ~25 m ribbon — the river line — not a barrier. Passable ground at factor 0.88–1.00 lies within 50 m in nearly every direction.

The decisive line is in `updateCampDefense`:

```
if (!unit.campDefense) activate(state, unit, threat, terrain, events);
```

`activate()` runs **exactly once per unit, ever.** `blockedReason` is latched at that instant and never recomputed. There is no re-path, no retry, and no recovery from an unreachable activation. `release()` clears it only when the threat stops being spotted or a real order arrives — neither happens for these three during the battle.

Re-testing the same goal at minute 720 confirms the injury is entirely historical: the goal cell is now passable (cost 0.70) and a straight-line passability profile from band to goal returns **thirteen passable samples out of thirteen**. The path was available the whole time. Nothing ever re-asked.

**620 warriors sat out June 25 because a geometric midpoint touched a 25-metre river cell at 12:47.**

## 4. Cause 2 — the DEFEND_CAMP eligibility rule (1,087 warriors)

`state.ts:241`:

```
defaultBehavior: unit.kind === 'WARRIOR_BAND' && !scheduledUnitIds.has(unit.id)
  ? 'DEFEND_CAMP'
  : undefined,
```

`scheduledUnitIds` is every unit named as a recipient of **any order anywhere in the scenario**, regardless of when that order fires. Consequence, for the four bands that have late orders:

| band | avail | first order | issued | behaviour during valley fight |
|---|---:|---|---:|---|
| oglala-pool | 230 | crazy-horse-sweep | 780 | HOLD, no camp defence |
| crazy-horse-band | 200 | crazy-horse-sweep | 780 | HOLD, no camp defence |
| cheyenne-pool | 150 | lwm-charge | 825 | HOLD, no camp defence |
| lwm-band | 60 | lwm-charge | 825 | HOLD, no camp defence |

All four are excluded from camp defence **all day** because an order exists hours later. They stand in HOLD while the village is attacked. The `gall-response` trio (447) are excluded on the same rule but are rescued by their order actually firing at 720.

Note the arithmetic: the exclusion rule is what makes Cause 1 matter. If the rule were "defend until your own order arrives," the seven excluded bands would have attempted camp defence too — and, given the same midpoint geometry, most would likely have latched the same impassable goal. The two causes compound rather than merely coexist.

Secondary finding, just outside the window: `crazy-horse-sweep` fires at 780 and immediately reports `order has no resolvable objective`. The scenario documents this honestly in its own provenance note ("downstream crossing and north-flank Battle Ridge waypoints are not numerically specified, so objective geometry is omitted"). Crazy Horse's 430 warriors therefore remain inert from 780 until `ch-strike` at 825 — a third, independent starvation. Not in scope for H1; logged here so it is not rediscovered later.

## 5. Consequence for D82 and round 3/4

The coalition has exactly **one** order in the entire valley-fight window: `gall-response`, issued at **minute 720 — the same minute Reno's skirmish line forms** — to 447 warriors starting from a standstill at the Hunkpapa camp.

This closes the round-3/round-4 question. D82 asked whether Reno's withdrawal could be made *capable* of breaking into history's rout, in scope as calibration. It cannot:

- Breaking three companies with 447 warriors requires making 447 warriors extraordinarily lethal.
- Every rail available to do that is global (D49: global tables only).
- Round 4 did exactly this and produced near-global rout, Arikara annihilation in 37/37 seeds, and an empty ford choke — the observed failure.

**D82 is unreachable inside sourced ranges because the warrior mass is capped at 26% by defect, not by any knob.** Under D79.3 this is the escape hatch working as designed: STOP, documented finding, mechanism adjudication required. The instrument was right to refuse.

**Recommendation: HOLD H2 (relent-timing → D73 coupling).** Relent timing cannot be honestly diagnosed against an engagement that never carried its historical mass; any D73 conclusion drawn now would be fitted to a 26%-strength fight and would need re-deriving after H1 is ruled. H1 gated H2 for exactly this reason, and the gate should hold.

## 6. Three routes — for Chuck's ruling

These are not equivalent, and the choice outlives M5.

**Route A — defect class (no source required).** Re-path camp defence on a cadence while `campDefense` is active and `blockedReason` is set; snap an impassable goal to the nearest passable cell within a bounded radius. Argument for treating this as a bug rather than a mechanism change: D47's stated intent is "interpose between threat and camp," and the current code fails to deliver the stated intent when a single cell happens to be wet. Nothing new is claimed about history. If accepted as defect-class, it is legal *during* calibration under D79.3, which forbids mechanism changes but not correctness fixes.

**Route B — mechanism ruling (source required).** A band camp-defends until *its own* scheduled order arrives, instead of being excluded all day by a future one. This is the initiative-culture claim in engine form: warriors responded to an attack on the camp without waiting for an order. The record supports it strongly, and the project already leans this way — `gall-response` is labelled "initiative-culture reconstruction" in its own historicalText, and D87 established CONSENSUS_INITIATIVE behaviour for these bands. But it changes behaviour for seven units and therefore needs a sourced ruling and a pre-registered prediction, not a quiet edit.

**Route C — data route, O4 Tier B.** Add sourced valley-response orders for the northern bands with issue minutes derived from the record (Cheyenne and Oglala arrival timing in the valley). Keeps the engine untouched; puts the burden on transcription and provenance.

**The design question underneath.** Orders are a US-army instrument. Route C models the coalition with the other side's command apparatus — every warrior movement becomes a scheduled order from a named leader, which is close to the opposite of what the sources describe. Routes A and B move the coalition onto initiative and default behaviour, which is closer to the record and closer to D87's own logic, at the cost of more engine surface. My reading is that A+B together are the honest pair and C is a patch that would need undoing at v2 when per-commander belief states arrive — but this is a judgement about how the project represents its subject, and it belongs to you.

Open question that comes with any route: **what standoff distance replaces the geometric midpoint?** D47's TODO-AMBIGUOUS has been outstanding since M3-A. Whatever is ruled, the midpoint should stop being the answer — it is what put the goal in the river.

## 7. Draft ledger rows (NOT appended — awaiting ruling)

Next free D-number is **D88** (ledger through D87). Rows are drafted in house format for CC to append verbatim once ruled. Dates left as 07-24 per the midnight rule; adjust if the ruling lands later.

**If Route A is ruled:**

```
| D88 | 07-24 | Camp-defence path re-evaluation (defect class, not mechanism — D79.3 unaffected): while `campDefense` is active and `blockedReason` is set, re-attempt the interpose path on a [CAL] cadence rather than latching the first result forever; an impassable goal snaps to the nearest passable cell within a bounded radius before the attempt. D47's stated intent is interposition between threat and camp; the single-shot `if (!unit.campDefense) activate(...)` failed to deliver that intent whenever one cell happened to be wet. No historical claim is added. | H1 probe 07-24: minneconjou-pool, sans-arc-pool and blackfeet-santee-pool (620 warriors) latched `endpoint is impassable` at tick 1174 (12:47) on a midpoint at 45.50935/−107.38010, coverKind 254 RIVER, and never moved again all day. Re-test at minute 720 shows the same goal passable (cost 0.70) with 13/13 passable samples band→goal — the path was available the entire time and was never re-asked. Identical on seeds 18760603 and 18760625: structural, not stochastic. | Proposed — pending Chuck |
```

**If Route B is ruled:**

```
| D89 | 07-24 | DEFEND_CAMP eligibility narrowed from schedule-lifetime to order-arrival: a WARRIOR_BAND carries `defaultBehavior: DEFEND_CAMP` until its own first order is delivered, instead of being excluded for the whole day by the mere existence of a later order. Initiative-culture claim in engine form, continuous with D87 (CONSENSUS_INITIATIVE) and with `gall-response`'s own "initiative-culture reconstruction" historicalText — warriors responded to an attack on the camp without waiting to be ordered. PRE-REGISTERED PREDICTIONS: (a) ≤500 m contact mass against Reno exceeds 800 warriors before minute 750; (b) A/G/M reach BROKEN during the valley fight without any change to global lethality rails; (c) the ford choke repopulates with broken troopers; (d) coalition casualties stay inside their sourced band. Verdicts accepted as they fall (D52). | H1 probe 07-24: state.ts:241 excludes any band named in any order at any hour; oglala-pool and crazy-horse-band (430 men, first order 780) and cheyenne-pool and lwm-band (210 men, first order 825) therefore stand in HOLD through the entire valley fight, never moving all day. Combined with D88's latch, 1,260 of 1,707 warriors are frozen and contact mass is capped at 26%, which is why D82 proved unreachable inside sourced ranges at rounds 3–4. | Proposed — pending Chuck |
```

**Standing finding row (recommended regardless of route):**

```
| D90 | 07-24 | D82 recorded as unreachable-by-calibration and reclassified to mechanism: the valley fight's warrior mass is capped at 26% of available strength by two implementation defects (D88 latch, D89 eligibility), not by any [CAL] inside a sourced range. Round 4's near-global rout is hereby explained as the arithmetic consequence of forcing three companies to break against 447 warriors using global rails. H2 (relent-timing → D73 coupling) remains HELD until D88/D89 land and the composite is re-baselined — a relent conclusion fitted to a 26%-strength engagement would have to be re-derived. | H1 probe 07-24, §2 and §5. The D79.3 escape hatch functioning as designed: the gate refused to be reached by tuning, and the refusal was correct. | Proposed — pending Chuck |
```

## 8. Artifacts

Four probe scripts, all read-only, all run from the repo root with `node <script>` after `npx tsc -p tsconfig.engine.json`:

| script | purpose |
|---|---|
| `h1-probe.mjs [seed]` | main probe: contact mass, per-band positions with lat/lon at 10-minute samples, first-movement audit, engagement-open table |
| `h1-diag.mjs` | camp-defence goal cells at minute 720; passability profile band→goal; radius check for non-activated bands |
| `h1-diag2.mjs` | activation-tick hunt: when camp defence latched and what the path returned at that instant |
| `h1-diag3.mjs` | terrain characterisation at the blocked midpoint; 9×9 movementFactor/coverKind sample |

Suggest these live under `.claude/` with the other verification tooling per the ledger-discipline precedent (STOP reports and verification tooling preserved as part of the record), rather than being discarded — D88/D89 will want re-running against them as before/after proof.

Full probe output for seed 18760603 follows as Appendix A.

---

## Appendix A — full probe output, seed 18760603

## A. Contact mass vs Reno battalion (warriors within radius of nearest live Reno company)

| min | clock | ≤200 m | ≤500 m | ≤1 km | ≤2 km | ≤4 km | total avail |
|---:|---|---:|---:|---:|---:|---:|---:|
| 660 | 14:00 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 670 | 14:10 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 680 | 14:20 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 690 | 14:30 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 700 | 14:40 | 0 | 0 | 0 | 0 | 460 | 1720 |
| 710 | 14:50 | 0 | 457 | 457 | 457 | 1152 | 1717 |
| 720 | 15:00 | 447 | 447 | 447 | 447 | 1142 | 1707 |
| 730 | 15:10 | 0 | 444 | 444 | 444 | 1139 | 1704 |
| 740 | 15:20 | 444 | 444 | 444 | 444 | 1334 | 1704 |
| 750 | 15:30 | 0 | 444 | 444 | 874 | 1494 | 1704 |
| 760 | 15:40 | 0 | 444 | 444 | 444 | 1494 | 1704 |
| 770 | 15:50 | 0 | 444 | 444 | 444 | 1139 | 1704 |
| 780 | 16:00 | 0 | 444 | 444 | 874 | 1494 | 1704 |
| 790 | 16:10 | 0 | 0 | 444 | 874 | 1704 | 1704 |

## B. Where each band is standing

### minute 660 (14:00)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 150 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 80 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 4852 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 4852 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 5969 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 6475 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 6646 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 6973 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 6973 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/HOLD @ 45.49470,-107.39213 · co-g 45 men (0k/0w) STEADY/HOLD @ 45.49486,-107.39016 · co-m 45 men (0k/0w) STEADY/HOLD @ 45.49503,-107.38803

### minute 670 (14:10)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 150 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 80 | 2782 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 4852 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 4852 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 5969 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 6475 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 6646 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 6973 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 6973 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/HOLD @ 45.49470,-107.39213 · co-g 45 men (0k/0w) STEADY/HOLD @ 45.49486,-107.39016 · co-m 45 men (0k/0w) STEADY/HOLD @ 45.49503,-107.38803

### minute 680 (14:20)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 150 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 80 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 4822 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 4822 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 5941 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 6443 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 6613 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 6941 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 6941 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305 · co-g 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305 · co-m 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305

### minute 690 (14:30)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 150 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 80 | 2816 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 4822 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 4822 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 5941 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 6443 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 6613 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 6941 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 6941 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305 · co-g 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305 · co-m 45 men (0k/0w) STEADY/HOLD @ 45.49473,-107.39305

### minute 700 (14:40)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 2805 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 150 | 2805 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 80 | 2805 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 4814 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 4814 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 5933 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 6435 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 6606 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 6933 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 6933 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/CHARGE @ 45.49473,-107.39305 · co-g 45 men (0k/0w) STEADY/CHARGE @ 45.49483,-107.39298 · co-m 45 men (0k/0w) STEADY/CHARGE @ 45.49361,-107.39380

### minute 710 (14:50)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 230 | 227 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| gall-band | 149 | 227 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| crow-king-band | 78 | 227 | HOLD | STEADY | — | 0 | — | 45.52000 | -107.39040 |
| oglala-pool | 230 | 2824 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2824 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3787 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 4377 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 4573 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4862 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4862 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/CHARGE @ 45.51303,-107.38903 · co-g 45 men (0k/0w) STEADY/CHARGE @ 45.51833,-107.38873 · co-m 44 men (0k/1w) STEADY/CHARGE @ 45.51833,-107.38873

### minute 720 (15:00)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 224 | 160 | ATTACK | STEADY | gall-response | 1 | — | 45.51951 | -107.38990 |
| gall-band | 147 | 160 | ATTACK | STEADY | gall-response | 1 | — | 45.51951 | -107.38990 |
| crow-king-band | 76 | 160 | ATTACK | STEADY | gall-response | 1 | — | 45.51951 | -107.38990 |
| oglala-pool | 230 | 2824 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2824 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3787 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 4377 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 4573 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4862 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4862 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/CHARGE @ 45.51833,-107.38873 · co-g 44 men (1k/0w) STEADY/CHARGE @ 45.51833,-107.38873 · co-m 44 men (0k/1w) STEADY/CHARGE @ 45.51833,-107.38873

### minute 730 (15:10)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 340 | ATTACK | STEADY | gall-response | 2 | — | 45.52072 | -107.38557 |
| gall-band | 147 | 340 | ATTACK | STEADY | gall-response | 2 | — | 45.52072 | -107.38557 |
| crow-king-band | 74 | 340 | ATTACK | STEADY | gall-response | 2 | — | 45.52072 | -107.38557 |
| oglala-pool | 230 | 2680 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2680 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3656 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 4242 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 4437 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4729 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4729 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/MARCH @ 45.51884,-107.39054 · co-g 44 men (1k/0w) STEADY/MARCH @ 45.51846,-107.38920 · co-m 44 men (0k/1w) STEADY/MARCH @ 45.51800,-107.38755

### minute 740 (15:20)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 150 | ATTACK | STEADY | gall-response | 1 | — | 45.51869 | -107.39000 |
| gall-band | 147 | 150 | ATTACK | STEADY | gall-response | 1 | — | 45.51869 | -107.39000 |
| crow-king-band | 74 | 150 | ATTACK | STEADY | gall-response | 1 | — | 45.51869 | -107.39000 |
| oglala-pool | 230 | 2377 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2377 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3379 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 3956 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 4149 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4447 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4447 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.51995,-107.39439 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.51957,-107.39306 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.51921,-107.39178

### minute 750 (15:30)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 372 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| gall-band | 147 | 372 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| crow-king-band | 74 | 372 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| oglala-pool | 230 | 1951 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 1951 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 2988 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 3551 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 3741 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4045 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4045 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.52186,-107.39944 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.52121,-107.39750 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.52073,-107.39603

### minute 760 (15:40)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 207 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| gall-band | 147 | 207 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| crow-king-band | 74 | 207 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| oglala-pool | 230 | 2172 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2172 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3171 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 3748 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 3942 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4239 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4239 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.52148,-107.39593 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.52149,-107.39433 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.52106,-107.39216

### minute 770 (15:50)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 445 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| gall-band | 147 | 445 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| crow-king-band | 74 | 445 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| oglala-pool | 230 | 2799 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 2799 | HOLD | STEADY | — | 0 | — | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 3701 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 4303 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 4503 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4779 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4779 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.52071,-107.38650 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.52081,-107.38558 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.52081,-107.38558

### minute 780 (16:00)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 396 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| gall-band | 147 | 396 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| crow-king-band | 74 | 396 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| oglala-pool | 230 | 1969 | MARCH | STEADY | crazy-horse-sweep | 0 | order has no resolvable objective | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 1969 | MARCH | STEADY | crazy-horse-sweep | 0 | order has no resolvable objective | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 2927 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 3515 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 3710 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 4000 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 4000 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.52265,-107.39049 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.52329,-107.39306 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.52406,-107.39619

### minute 790 (16:10)

| band | avail | dist to Reno (m) | posture | morale | order | path left | blocked | lat | lon |
|---|---:|---:|---|---|---|---:|---|---:|---:|
| hunkpapa-pool | 223 | 521 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| gall-band | 147 | 521 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| crow-king-band | 74 | 521 | ATTACK | STEADY | gall-response | 0 | — | 45.51921 | -107.39178 |
| oglala-pool | 230 | 1896 | MARCH | STEADY | crazy-horse-sweep | 0 | order has no resolvable objective | 45.53500 | -107.41600 |
| crazy-horse-band | 200 | 1896 | MARCH | STEADY | crazy-horse-sweep | 0 | order has no resolvable objective | 45.53500 | -107.41600 |
| minneconjou-pool | 265 | 2852 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54500 | -107.41891 |
| sans-arc-pool | 195 | 3439 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54800 | -107.42558 |
| blackfeet-santee-pool | 160 | 3635 | MARCH | STEADY | — | 0 | endpoint is impassable | 45.54900 | -107.42776 |
| cheyenne-pool | 150 | 3925 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |
| lwm-band | 60 | 3925 | HOLD | STEADY | — | 0 | — | 45.55200 | -107.42847 |

Reno: co-a 45 men (0k/0w) STEADY/WITHDRAW @ 45.52460,-107.39678 · co-g 44 men (1k/0w) STEADY/WITHDRAW @ 45.52427,-107.39420 · co-m 44 men (0k/1w) STEADY/WITHDRAW @ 45.52386,-107.39091

## C. First movement tick per band (whole day up to minute 790)

| band | first moved (min) | clock |
|---|---:|---|
| hunkpapa-pool | 720 | 15:00 |
| gall-band | 720 | 15:00 |
| crow-king-band | 720 | 15:00 |
| oglala-pool | never | — |
| crazy-horse-band | never | — |
| minneconjou-pool | never | — |
| sans-arc-pool | never | — |
| blackfeet-santee-pool | never | — |
| cheyenne-pool | never | — |
| lwm-band | never | — |

## D. Reno-vs-warrior engagements opened (first appearance)

| pair | first min | clock | state at open | range (m) |
|---|---:|---|---|---:|
| co-g|hunkpapa-pool | 707 | 14:47 | APPROACH | 620 |
| co-g|gall-band | 707 | 14:47 | APPROACH | 620 |
| co-g|crow-king-band | 707 | 14:47 | APPROACH | 620 |
| co-m|hunkpapa-pool | 707.5 | 14:47.5 | APPROACH | 613 |
| co-m|gall-band | 707.5 | 14:47.5 | APPROACH | 613 |
| co-m|crow-king-band | 707.5 | 14:47.5 | APPROACH | 613 |
| co-a|hunkpapa-pool | 710.5 | 14:50.5 | APPROACH | 623 |
| co-a|gall-band | 710.5 | 14:50.5 | APPROACH | 623 |
| co-a|crow-king-band | 710.5 | 14:50.5 | APPROACH | 623 |

