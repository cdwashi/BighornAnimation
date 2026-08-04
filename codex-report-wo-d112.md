# WO-D112 Execution Report — STOPPED AT TASK 2 FREEZE BRANCH

## Outcome

**STOP.** The mandatory source read exposed an O5 verdict implying a confidence change
outside WO-D112's adjudicated set. Per Task 2, implementation halted before Task 0, before
any payload edit, and before any engine execution.

- HEAD: `9a594d2`
- Starting accepted stream: `8e28552c`
- New stream id: **not created**
- Engine executions: **zero**
- Campaign: **not started (0/50)**
- Commit/push: **none**
- Payload/editor states: **none**

## Task 2 STOP branch

Claim: `terrain.landmarks.divide` (Appendix-A claim #1; current confidence `LOW`).

O5 verdict text, verbatim:

> **CLUSTER A-LANDMARKS (#1–15) — MIXED: UPGRADED for GNIS-official features; CONFIRMED-WEAK for inference/marker-derived points.**
>
> GNIS-official named features (Reno Hill #3, Weir Point #4, Calhoun Hill #8, Deep Ravine #11, Last Stand Hill #10, and the Divide #1) upgrade to USGS GNIS coordinates.

`terrain.landmarks.divide` is outside the confidence-edit set adjudicated by WO-D112. The
work order forbids both silently retaining its existing tier and applying an unadjudicated
confidence change, so no judgment was made and no transcription was attempted.

## Editor-state disclosure

No scenario editor-time state was created. The D111 stream remains `8e28552c`; there is no
D112 semantic payload or hash to accept or compare. The only file added is this STOP report.

## PR-64..71 — adjudication reserved

| registration | result |
|---|---|
| PR-64 — one accepted break | **NOT RUN** — no engine execution and no accepted D112 break |
| PR-65 — pin (a) firing/re-pin | **NOT RUN** |
| PR-66 — wounded/killed movement and ceiling | **NOT COMPUTED** |
| PR-67 — C3 thirteen no-ops | **NOT COMPUTED** |
| PR-68 — C1 and gate line | **NOT COMPUTED** |
| PR-69 — C4 hinge/double denominator | **NOT COMPUTED** |
| PR-70 — pin (d) before/after invariant | **NOT RUN** |
| PR-71 — campaign forms | **NOT RUN** |

No HIT/MISS adjudication is possible because the registered payload was not assembled or
accepted and the campaign did not begin.

## Required measurements not reached

- us-7th bypass measurement: **not performed**.
- C4 double-denominator series (`x/14` and `12/13` lineage): **not produced**.
- Pins (a)–(d), gate, lip, and suite: **not run**.
- Oracles: **not refreshed**.
- `reports/d112-*` artifacts: **not created**.

## Files touched

- `codex-report-wo-d112.md` — this STOP report only.

No scenario, engine source, test, oracle, campaign instrument, or campaign artifact file was
changed.

## AMBIGUITIES

None resolved or invented. The controlling ambiguity is intentionally returned for
adjudication: the O5 `UPGRADED` verdict for claim #1 conflicts with the WO's closed confidence
edit set.

## Deviations

None. Tasks 0–6 were not continued because the Task 2 freeze amendment requires an immediate
STOP on this condition. The behind-the-break STEADY-shelter and corpse-drift subjects were not
probed, scoped, or touched.

---

## Resume under Amendment 1 — SECOND STOP

The claim-#1 STOP above remains intact. Adjudication commit `1ad6422` narrowed the branch and
authorized the complete tier map. Work resumed through acceptance, then halted on an
unsanctioned verification failure before either oracle was edited.

### Resume outcome

**STOP.** The first post-acceptance M4-A oracle run also exercised the unchanged F4 baseline
assertion. At registered baseline seed `18760625`, `co-c` had no `DESTROYED` endState, while
the untouched assertion requires `DESTROYED`. This is not one of WO-D112's two sanctioned
payload-pin updates or its cause-documented combat/no-combat hash refreshes. The work order
says any verification failure is a STOP and to fix nothing.

- Resume HEAD: `1ad6422`
- Starting stream: `8e28552c`
- Accepted D112 stream: **`68325eff`**
- Accepted breaks: **one**
- Post-acceptance scenario edits: **zero**
- Campaign: **not started (0/50)**
- Commit/push: **none**
- Oracle edits: **none**

No diagnosis, probe, rerun, tuning, oracle edit, gate run, full-suite continuation, or campaign
followed the F4 failure. STEADY-shelter and corpse drift remained behind the fence.

### Editor-state disclosure

| ordinal | hash | disposition |
|---:|---|---|
| 1 | `68325eff` | complete Tasks 1–2 semantic payload; accepted by the first full D110-pin execution |

The semantic payload was compared with HEAD before any simulation. Its confidence deltas were
exactly the six tier-map changes plus the separately ruled pony-strength LOW and coalition-
wounded MEDIUM changes. Numeric deltas were exactly the pony 15000/15000/25000 payload and
coalition killed 36/60/136 plus wounded 160/160/160. The 28-claim live set had no tier delta.
The calibration-exclusion note paths remained exactly the ruled three.

### Completed pre-acceptance instruments

- Pin (d) before payload: **GREEN**, exactly three ruled paths.
- Payload-pin enumeration: exactly pin (a) and `m3a-gates.test.ts:94`; no additional payload
  assertion found.
- Pin (a) registered firing: **OBSERVED** — old code returned `0.155` where the new payload
  required `0.225`.
- Simultaneous pin-(a)/combat-config re-pin: 0.225 / 0.375 / 0.85 with D112 cause.
- #133 gate-count pin: 13 → 14 with ruling cause.
- Pins (a)–(d) after payload: **GREEN 4/4**; this run accepted stream `68325eff`.

### us-7th bypass measurement

The current `score.ts:203–222` synthesis produces killed 235/253/285 and wounded 45/52/60;
scoring consumes only each band's low/high bounds. A hypothetical explicit us-7th
`sideCasualties` entry carrying those synthesis values therefore leaves both us-7th C2 legs
numerically identical for every D111 state: **structural choice**. Replacing killed-best 253
with the hilltop-inclusive 268 also changes no C2 leg because `sideBand` does not consume
`best`. No entry was added.

### Verification STOP evidence

The accepted-stream M4-A run returned:

- Combat state hash: observed `a114bb7b`, old oracle `338eda95` (expected refresh not applied).
- No-combat tick-1 hash: observed `7537c54d`, old oracle `d7ea5758` (expected refresh not
  applied; later hashes were not consumed after the first assertion stopped the loop).
- F4: `co-c` observed with no `DESTROYED` endState; unchanged assertion expected `DESTROYED`.
- F2 conservation and F5 informational checks passed before the STOP was reported.

### PR-64..71 — partial computation, adjudication reserved

| registration | result |
|---|---|
| PR-64 — one accepted break | **HIT through STOP** — `8e28552c` → `68325eff`, exactly one accepted break |
| PR-65 — pin (a) fires and re-pins | **HIT** — registered red observed, then green at 0.225/0.375/0.85 |
| PR-66 — C2 movement/ceiling | **NOT COMPUTED** — campaign not started |
| PR-67 — thirteen C3 no-ops | **PAYLOAD CONFIRMED; CAMPAIGN NOT COMPUTED** — all 13 remain HIGH |
| PR-68 — C1/gate line | **PAYLOAD CONFIRMED; CAMPAIGN NOT COMPUTED** — only cp-weir-point rose |
| PR-69 — C4 hinge/double denominator | **PAYLOAD CONFIRMED; SERIES NOT PRODUCED** — #133 rose to MEDIUM |
| PR-70 — flag invariant | **HIT** — pin (d) green before and after with identical membership |
| PR-71 — standing forms | **STOPPED BEFORE CAMPAIGN** |

No campaign HIT/MISS legs, C4 double-denominator series, sanctuary frequencies, approach-
vector table, F4 envelope result, D80 selection, or `reports/d112-*` artifacts exist.

### Resume files touched

- `data/scenarios/little-bighorn-1876/scenario.json` — Tasks 1–2 value payload and 180-claim
  O5 transcription under the ruled tier map.
- `engine/src/combat-config.ts` — sanctioned simultaneous coalition ratio re-pin.
- `engine/tests/d110-pins.test.ts` — pin (d) and D112 pin-(a) cause comment.
- `engine/tests/m3a-gates.test.ts` — sanctioned #133 gateable-count update.
- `codex-report-wo-d112.md` — preserved first STOP plus this resume STOP.

### Resume AMBIGUITIES

- O5 supplies no claim-level external replacement source for the nine held observation-event
  terrain-mask claims while the standing self-citation refusal forbids DEM/viewshed
  self-citation. Their existing testimony/relay sources were retained and each note records
  the under-specification as TODO-AMBIGUOUS.
- O5's leader-biography verdict is cluster-level and page-level RELAYED; the notes identify
  that the biography may be upgraded while numeric ratings remain structurally ineligible.
- The ruled open items remain untouched: Arikara ~40 versus encoded 35–39, and GNIS record
  verification for #1/#4/#11 plus #6's contested citation.

### Resume deviations

None. The scenario file was mechanically reserialized while applying the 180 enumerated
provenance edits; semantic comparison, not textual layout, established the frozen payload.
The campaign and oracle refreshes remain incomplete because continuing after the F4 red would
violate the work order's STOP discipline.

---

## Second resume under Amendment 2 — THIRD STOP

Both prior STOP histories above remain intact. Amendment 2 (`77b9cc4`) authorized the
baseline-character class, and the authorized values were measured before refresh. The
corrected full-suite run then exposed two failures outside that class, so Task 6 did not
start.

### Third STOP outcome

**STOP.** Full suite: **117/120 passed; 3 failed**. The M4-A F6 failure belongs to the newly
authorized baseline-character class, but two M5-A scorer tests do not. Amendment 2 expressly
excludes stream-independent properties from refresh, and the resume dispatch says anything
else red is a STOP.

Out-of-class failures, preserved verbatim by locus:

- `engine/tests/m5a-gates.test.ts:68`, “C1 enforces both HIGH-confidence and overall
  checkpoint thresholds”: expected `scoreCheckpointComponent(...).passed` to be `true`,
  observed `false`.
- `engine/tests/m5a-gates.test.ts:110`, “C4 uses the 80% HIGH/MEDIUM observation rule”:
  expected `scoreObservationComponent(...).passed` to be `true`, observed `false`.

No assertion edit, fixture edit, diagnosis, probe, rerun, tuning, or campaign followed these
failures.

### Baseline-character refresh values

| pin | old | measured accepted-stream value | worktree state |
|---|---|---|---|
| F1 combat hash | `338eda95` | `a114bb7b` | refreshed with Amendment-2 cause |
| F3 no-combat tick 1 | `d7ea5758` | `7537c54d` | refreshed with Amendment-2 cause |
| F3 no-combat tick 360 | `de16f482` | `f70e486f` | refreshed with Amendment-2 cause |
| F3 no-combat tick 1080 | `9bc200f2` | `a6b9ac53` | refreshed with Amendment-2 cause |
| F3 no-combat tick 2160 | `62b224ca` | `dd71a1f0` | refreshed with Amendment-2 cause |
| F4 roster | C/E/F/I/L destroyed; D alive | C/E alive; F/I/L destroyed; D alive | refreshed with Amendment-2 cause |
| F4 camp casualties | zero | zero | unchanged |
| F4 couriers | all alive/delivered | all alive/delivered | unchanged |
| F6 run-only path calls | `124` | `140` | **worktree incorrectly says `223`; not repaired after STOP** |
| V7 E5 checkpoint table | D53a table | byte-identical | unchanged |

The disposable measurement combined a combat run and a later no-combat run before reading
the global pathfinding counter, producing `223`. The actual M4-A protocol resets after combat
simulation construction and reported `140` in the full suite. This is a measurement-protocol
deviation, not a second scenario stream: accepted scenario hash remains `68325eff`, with zero
post-acceptance scenario edits.

### Full-suite evidence before STOP

- D110 pins (a)–(d): **GREEN 4/4**.
- D108 lip tests: **GREEN 5/5**.
- M3-A V2: **GREEN**, 12/14 = 85.7%.
- M3-A V7: **GREEN**, E5 table byte-identical.
- M4-A F1/F2/F3/F4/F5: **GREEN** after the authorized refresh.
- M4-A F6: red only on the baseline-character call-count value described above.
- M5-A: the two out-of-class failures above; its other seven tests passed.
- Aggregate: 22 files, 120 tests; 20 files green, 2 files red; 117 tests passed.
- Vitest also emitted a post-run worker `onTaskUpdate` timeout; it did not replace or obscure
  the three concrete assertion failures.

### Task 6 status

- Campaign: **not started (0/50)**.
- Registered stop: never armed because no campaign tick ran.
- `reports/d112-*`: not created.
- PR-66/67/68/69/71 campaign legs: not computed.
- C4 double-denominator series, sanctuary legs, approach-vector table, stranding count, F4
  envelope, and D80 selection: not produced.

### Additional file touched on second resume

- `engine/tests/m4a-gates.test.ts` — Amendment-2 baseline-character refreshes; F6 currently
  preserves the incorrect pre-suite `223` measurement and is explicitly not presented as
  green.

No scenario, engine source, m5a test, lip test, V7 baseline, campaign script, or campaign
artifact was changed on this resume. No commit or push occurred.

### Second-resume AMBIGUITIES

- The work order does not classify the two M5-A synthetic scorer assertions as payload pins;
  Amendment 2 instead excludes stream-independent properties, and the dispatch says any
  other red is a STOP. They are returned for adjudication without reinterpretation.
- The F6 probe's global-counter scope was under-specified in the disposable measurement;
  the existing M4-A source documents the run-only reset protocol and the suite supplied its
  actual value. No repair was made after the out-of-class STOP.

### Second-resume deviations

- First full-suite command supplied `--fileParallelism=false` twice because the npm script
  already contains it; Vitest rejected the invocation before collecting tests. The corrected
  `npm test` run produced the results above.
- The disposable F6 measurement read a global counter after both combat and no-combat runs,
  yielding `223` instead of the test protocol's `140`. The erroneous worktree assertion is
  preserved rather than repaired after the suite exposed out-of-class failures.

---

## Third resume under Amendment 3 — COMPLETION

All three STOP histories above remain intact. Amendment 3 (`24fb3ee`) sanctioned exactly
three test updates; all 120 assertions then passed, and the registered N=50 campaign completed
on accepted stream `68325eff` without firing its stop.

### Final outcome

**COMPLETE.**

- HEAD governing the third resume: `24fb3ee`
- Parent accepted stream: `8e28552c`
- Accepted D112 stream: **`68325eff`**
- Stream lineage: one scenario editor state, one accepted break, zero post-acceptance scenario edits
- Campaign: **50/50**, seeds 18760600–18760649
- Registered stop: **not fired** — 3/50 seeds above 60 Reno killed; none at or above 100
- Commit/push: **none**

### Amendment-3 sanctioned updates

| assertion | old | new | cause/result |
|---|---:|---:|---|
| M5-A C4 passing fixture | 11 rows | 12 rows | #133 makes 14 gateable; 12/14 = 85.7% clears 80% |
| M5-A C4 failing fixture | 10 rows | 11 rows | 11/14 = 78.6% does not clear 80% |
| M5-A C1 passing HIGH subset | 3/5 | 4/5 | adjudicated choice: minimal HIGH subset clearing 70%; 4/5 = 80% |
| M5-A C1 failing HIGH subset | 2/5 | 2/5 | untouched; deliberately comfortable failure at 40%, not minimal |
| M4-A F6 run-only path calls | erroneous 223 | 140 | Amendment-2 class correction under the per-run protocol |

C1 enforces both thresholds. With `slice(0,4)`, the passing fixture has **4/5 HIGH = 80%**
and its union with the first five checkpoint rows passes **7/10 overall = 70%**. Both clear
their respective 70% HIGH and 50% overall thresholds.

F6 was independently re-measured on `68325eff`: construct one simulator, reset the global
path counter immediately before `run(2160)`, and read immediately afterward; construct and
measure combat and no-combat separately. Result: **140 combat calls, 81 no-combat calls**.
The combat pin is 140. This protocol is in the source comment.

### Final verification

- Full suite assertions: **GREEN 120/120**, 22/22 test files.
- D110 pins: **GREEN 4/4**.
- M3-A gate: **GREEN**, including V2 12/14 = 85.7% and byte-identical V7 E5 table.
- D108 lip: **GREEN 5/5** and byte-identical in the campaign artifact.
- M4-A baseline-character set: **GREEN** at combat hash `a114bb7b`, no-combat hashes
  `7537c54d` / `f70e486f` / `a6b9ac53` / `dd71a1f0`, C/E alive with F/I/L destroyed and D
  alive, and 140 run-only path calls.
- TypeScript build: **GREEN**.

Vitest emitted the previously observed worker `onTaskUpdate` timeout after reporting all 120
assertions passed. It is disclosed as a post-pass RPC anomaly, not an assertion red.

### PR-64..71 — computed results, adjudication reserved

| registration leg | result |
|---|---|
| PR-64 — one accepted break | **HIT** — `8e28552c` → `68325eff`; one accepted break and zero later scenario edits |
| PR-65 — pin (a) fires and re-pins | **HIT** — registered red observed, then green at 0.225/0.375/0.85; us-7th assertions untouched |
| PR-66 — declared C2 ceiling/equality encoding | **HIT (structural)** — wounded passes only at exactly 160; no seed landed at 160; exclusion was not used; theoretical ceiling remains 8/9 |
| PR-66 — killed zero-flip leg | **MISS** — 3/50 status flips between old 31–300 and new 36–136, at killed values 35, 33, 33 (seeds 622, 630, 631) |
| PR-66 — wounded flip estimate | **OBSERVATION (approximate registration, no band)** — 24/50 versus the 29/50 D111-stream estimate |
| PR-66 amendment — mean 55.11% ±1.16 pp | **MISS** — 52.5409%, below the 53.95–56.27% band |
| PR-66 amendment — median in [54.8504%, 57.6282%] | **MISS** — 54.7161%, 0.1343 pp below the lower bound |
| PR-67 — C3 thirteen no-ops, median 5/13 | **HIT** — median 5/13 = 0.384615; denominator unchanged |
| PR-68 — C1 median 0.5 | **HIT** — 0.5000 on all 50 seeds; HIGH gate set grew by the ruled cp-weir-point only |
| PR-69 — #133 hinge and double denominator | **HIT** — #133 is MEDIUM; every seed reports 12/14 current beside 12/13 lineage |
| PR-70 — calibration-exclusion invariant | **HIT** — pin (d) green before and after with exactly the ruled three paths |
| PR-71(a) — zero east-side Reno annihilations | **MISS** — 3: co-m seed 617, co-g seed 626, co-a seed 635 |
| PR-71(a) — ~1-in-50 sanctuary frequency referent | **OBSERVATION, NO THRESHOLD** — 3/50 |
| PR-71(b) — registered stop | **HIT (instrument)** — only seeds 626/635/647 exceeded 60, maximum 81; no ≥100 and no sixth >60 seed |
| PR-71(c) — lip/pins | **HIT** — 85 cells, 260 m span, 10 m max gap, 51 m minimum distance, 85 WEST, SHA-256 `d540f257b4518c0db7b3e869588b46fc220d80612ed998ef0f09983364a5379b` |
| PR-71(d) — F4 on envelope | **RESULT** — complete-wing outcome in 25/50 seeds; baseline seed 625 correctly treated only as character |
| PR-71(d) — D80 unchanged criteria | **HIT (execution leg)** — selected seed 18760600 from candidates 18760600 and 18760605; criteria hash unchanged |

MISSES are report-only. No bisect, diagnosis, rerun in response to a result, or tuning followed.

### Envelope distribution

| statistic | composite | C1 | C2 | C3 | C4 current |
|---|---:|---:|---:|---:|---:|
| min | 43.6050% | 0.5000 | 0.2222 | 0.1538 | 0.8571 |
| p25 | 48.3059% | 0.5000 | 0.3333 | 0.3077 | 0.8571 |
| median | 54.7161% | 0.5000 | 0.6667 | 0.3846 | 0.8571 |
| p75 | 56.6392% | 0.5000 | 0.6667 | 0.3846 | 0.8571 |
| max | 59.4170% | 0.5000 | 0.7778 | 0.3846 | 0.8571 |
| mean | 52.5409% | 0.5000 | 0.5489 | 0.3385 | 0.8571 |

### Coalition wounded and flip count

Coalition wounded: **min 71, p25 134, median 192, p75 211, max 258, mean 178.46**.
No seed produced exactly 160. The old 100–200 band passed 24/50; the new equality passed
0/50; therefore **24/50 flipped**. Per-seed wounded values and old/new status are in the first
table of [reports/d112-campaign-tables.md](reports/d112-campaign-tables.md).

### C4 double-denominator series

Every one of the 50 comparisons is **12/14 = 0.857143 current** alongside the D111 lineage
**12/13 = 0.923077**. The per-seed series is recorded explicitly in both
`d112-campaign-results.json` and [reports/d112-campaign-tables.md](reports/d112-campaign-tables.md).

### Sanctuary, approach vectors, strandings, F4, and D80

The hard sanctuary invariant missed three times:

| seed | tick | unit | channel | approach |
|---:|---:|---|---|---|
| 18760617 | 1628 | co-m | EAST | closing |
| 18760626 | 1833 | co-g | EAST | opening |
| 18760635 | 1649 | co-a | EAST | closing |

The Amendment-1 three-valued approach table contains all 120 annihilations: **60 closing,
60 opening, 0 stationary**. There were **165 strandings across 40/50 seeds**. The complete
120-row approach-vector table, with destruction-tick positions and nearest-friendly fields,
is the second table in [reports/d112-campaign-tables.md](reports/d112-campaign-tables.md).

F4 complete-wing count: **25/50**. The unchanged D80 criteria selected **18760600**, with
18760600 and 18760605 as the two candidates.

### us-7th bypass measurement, carried forward

The `:211–222` synthesis yields killed 235/253/285 and wounded 45/52/60. An explicit us-7th
entry carrying those bands leaves every C2 leg identical: the choice is structural for
scoring. An entry with killed-best 268 also changes no C2 leg because `sideBand` consumes only
low/high. Amendment 2's precision stands: the 268/253 divergence is scoring-inert but reaches
engine behavior through `combat-config.ts:231`; that behavioral question remains open.

### D112 re-baseline artifacts

- `reports/d112-campaign-results.json` — canonical 50-seed result, envelope, selection,
  annihilations, strandings, lip identity, wounded and C4 series.
- `reports/d112-campaign-progress.json` — final per-seed progress mirror.
- `reports/d112-campaign-tables.md` — per-seed wounded/C4 table and full approach-vector table.
- `reports/d112-ground-pressure-census.json` / `.md` — ground-pressure re-baseline.
- `reports/d112-valley-range.json` / `.md` — valley-range re-baseline.

### Final files touched

- `data/scenarios/little-bighorn-1876/scenario.json`
- `engine/src/combat-config.ts`
- `engine/tests/d110-pins.test.ts`
- `engine/tests/m3a-gates.test.ts`
- `engine/tests/m4a-gates.test.ts`
- `engine/tests/m5a-gates.test.ts`
- `scripts/d111-campaign.mjs`
- `scripts/d112-campaign.mjs`
- `codex-report-wo-d112.md`
- the seven `reports/d112-*` artifacts enumerated above

No engine mechanism source, lip implementation/test, V7 baseline, STEADY-shelter subject, or
corpse-drift subject was changed. No commit or push occurred.

### Final AMBIGUITIES

All earlier ambiguity sections remain in force. No campaign-result ambiguity was resolved by
tuning. The source-level unresolved items remain: external replacements for the nine held
observation-event terrain-mask relays, Arikara ~40 versus encoded 35–39, and GNIS verification
for #1/#4/#11 plus #6's contested citation.

### Final deviations

- The first campaign shell wrapper used a short command timeout. Its child completed seeds
  600 and 601, then was terminated during a progress-file rewrite, leaving a zero-length
  progress file. Because no valid resumable artifact survived and the registered stop had not
  fired, the fixed instrument restarted from seed 600 under an extended process lifetime.
  The duplicated first two seeds are disclosed; this operational rerun was not triggered by
  a result, miss, or tuning decision.
- The full suite reported 120/120 assertions green and then emitted the recurring Vitest
  worker RPC timeout, so the npm process exit code was 1 despite zero failed assertions.
- The scenario file was mechanically reserialized during the 180-claim transcription; the
  accepted payload was frozen by semantic comparison and its stable scenario hash.
