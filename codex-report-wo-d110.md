# WO-D110 Execution Report — STOPPED ON BINDING GATE

## Outcome

**STOP — adjudication required.** The new binding index-byte gate found 17 pre-existing tracked
text blobs with a UTF-8 BOM at offset 0. All 17 are committed under `.claude/`, including the
read-only probe area named by the dispatch. The gate was not weakened, the files were not
excluded, and no existing file was repaired. The staged tree is preserved.

- Dispatch HEAD: `567fee7`
- Commit/push: **none**
- Engine-source changes: **none**
- Scenario-byte changes: **none**
- Scenario content hash after the STOP: **`ba288f09`**

## Verification results — verbatim

### 1. Scenario content hash

```text
scenario hash ba288f09
```

Both working-tree and index diffs for
`data/scenarios/little-bighorn-1876/scenario.json` were empty.

### 2. Three pins

Command: `npx vitest run engine/tests/d110-pins.test.ts --fileParallelism=false`

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ engine/tests/d110-pins.test.ts (3 tests) 9136ms
   ✓ D110 pre-break pins > pin (c) — every engine-consumed landmark id is referenced by committed data  8930ms

 Test Files  1 passed (1)
      Tests  3 passed (3)
   Start at  21:04:58
   Duration  10.27s (transform 446ms, setup 0ms, collect 631ms, tests 9.14s, environment 0ms, prepare 173ms)
```

Result: **GREEN, 3/3**.

### 3. Full existing suite

```text
NOT RUN — D110's mandatory STOP fired at verification item 4a before the full-suite pass.
```

This is not reported green. Before the STOP, `npm run typecheck` and targeted ESLint over the
two new test files were green; they are not substitutes for the unrun full suite.

### 4. Gate test and hook

Command: `npx vitest run tests/repository-text-integrity.test.ts --fileParallelism=false`

```text
 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ❯ tests/repository-text-integrity.test.ts (1 test | 1 failed) 30649ms
   × D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from every tracked text blob in the index 30648ms
     → D110 tracked-text index gate offenses: expected [ …(17) ] to deeply equal []

 Test Files  1 failed (1)
      Tests  1 failed (1)
   Start at  21:05:42
   Duration  31.17s (transform 79ms, setup 0ms, collect 81ms, tests 30.65s, environment 0ms, prepare 154ms)

- Expected
+ Received

- []
+ [
+   ".claude/alarm-diagnosis.mjs: UTF-8 BOM at offset 0",
+   ".claude/bench-lip-trace.out.txt: UTF-8 BOM at offset 0",
+   ".claude/bench-ray-profile.out.txt: UTF-8 BOM at offset 0",
+   ".claude/bench-terrace-extent.out.txt: UTF-8 BOM at offset 0",
+   ".claude/d108-verify.out.txt: UTF-8 BOM at offset 0",
+   ".claude/f6-bare-nocombat.mjs: UTF-8 BOM at offset 0",
+   ".claude/frontage-d107-probe.out.txt: UTF-8 BOM at offset 0",
+   ".claude/ground-pressure-census.out.txt: UTF-8 BOM at offset 0",
+   ".claude/isolation-catch-probe.mjs: UTF-8 BOM at offset 0",
+   ".claude/latch-cadence-log.mjs: UTF-8 BOM at offset 0",
+   ".claude/latch-cadence-probe.mjs: UTF-8 BOM at offset 0",
+   ".claude/lip-side-check.out.txt: UTF-8 BOM at offset 0",
+   ".claude/lip-west-subset-check.out.txt: UTF-8 BOM at offset 0",
+   ".claude/occupancy-bounding-pass.out.txt: UTF-8 BOM at offset 0",
+   ".claude/overflow-eligibility-check.out.txt: UTF-8 BOM at offset 0",
+   ".claude/overflow-unreachable-reason.out.txt: UTF-8 BOM at offset 0",
+   ".claude/which-friendly-pass.mjs: UTF-8 BOM at offset 0",
+ ]
```

Result: **RED — mandatory STOP.** These are INDEX blobs read with `git show :path`, not CRLF
working copies. No CR offenses were reported.

Both gate vehicles landed:

- Binding suite vehicle: `tests/repository-text-integrity.test.ts` — **landed, RED on the
  current index for the 17 findings above**.
- Fail-fast courtesy vehicle: `scripts/hooks/pre-commit` — **landed**, staged mode `100755`.

The local activation was applied and confirmed:

```text
git config core.hooksPath scripts/hooks
git config --local --get core.hooksPath
scripts/hooks
```

Activation instruction for another checkout:

```sh
git config core.hooksPath scripts/hooks
```

The hook's current-tree no-rejection check and synthetic-BOM temp-repository self-test were
**NOT RUN**: the combined gate command stopped after 4a failed, and D110 forbids continuing
verification after a STOP finding.

### 5. Report

This report records the halted state. Acceptance verification is incomplete and WO-D110 is not
reported complete.

## Pin implementations chosen

### Pin (a) — ratio duplicate

- Coalition low/best/high are exact conservative cross-products of the sole coalition
  `sideCasualties` record.
- Every `sideCasualties` key is required to exist in the ratio map; identical key sets are not
  asserted.
- US low/high sum only casualty entries whose `unitId` resolves to side
  `us-7th-cavalry`, assert that filtered set non-empty, enforce integer recovery with
  `abs(sum - round(sum)) < 1e-6`, then compare ratios exactly using recovered integers.
- US best is pinned to literal `268/52` with the required M5-SPEC/outside-scenario declared-
  exception comment naming its deliberate divergence from the per-company killed-best sum 253.

### Pin (b) — camp-defence candidate set

The test reconstructs `DefenseFeature`s from the committed scenario and real
`TerrainMovementLoader` fixture using the same scenario mapping, coordinate conversion,
`extractBenchLip` call, substrate merge, and ID sort as `defenseFeatures()`. The
scenario-derived IDs are exactly `['scenario-bench']`.

### Pin (c) — landmark consumption

**Preferred tracking-proxy instrument landed.** A tracking Proxy records successful `.find()`
results and any direct/iterated landmark array entry access. Serialization-only array mapping
and cloning are kept invisible to the instrument. The test runs a deterministic 360-tick sim,
`runObservationExam`, `scoreCalibrationRun`, and envelope outcome extraction, then asserts
consumed IDs are a subset of the scenario-computed reference set and every referenced ID is
declared.

**D111 consequence: NOT TRIGGERED — the preferred proxy instrument landed; no grep fallback
landed.**

## Files touched — exact list

Tracked/worktree files:

- `codex-report-wo-d110.md`
- `docs/METHODS.md`
- `engine/tests/d110-pins.test.ts`
- `scripts/hooks/pre-commit`
- `tests/repository-text-integrity.test.ts`

Local repository metadata:

- `.git/config` — `core.hooksPath = scripts/hooks`

No `.claude/` file was touched.

## METHODS diff — full

```diff
diff --git a/docs/METHODS.md b/docs/METHODS.md
index 2697eb1..228fa48 100644
--- a/docs/METHODS.md
+++ b/docs/METHODS.md
@@ -69,12 +69,14 @@ Implementation, verification, and design are performed by **separate agents**. V
 
 **A gate that goes red on a real finding is reported red.** Defects discovered during work are converted into permanent tests wherever possible, so that a class of error cannot silently return.
 
-**Measure before freezing is standing practice.** A predicate, premise, or design intended for a ruling is tested against the running model before the ruling freezes, using preserved read-only probes, and the measurement enters the ruling's evidence column. The practice has killed or reshaped four designs before they entered the record: a closing-threat ratchet (the approach march set new minimum believed approaches and would have qualified the passing column it was meant to exclude); an anticipated fallback clause (0 of 96 samples lost their last eligible feature — the clause was never needed); a phase work order's premise (the fight already opened at ~435 m; the assumed 218 m was the collapse endpoint, not the opening); and a declaration-only fix (eligible but never selected, 21 of 21). A design killed before freezing is a success of the method, not a failure of the designer.
+**Measure before freezing is standing practice.** A predicate, premise, or design intended for a ruling is tested against the running model before the ruling freezes, using preserved read-only probes, and the measurement enters the ruling's evidence column. The practice has killed or reshaped four designs before they entered the record: a closing-threat ratchet (the approach march set new minimum believed approaches and would have qualified the passing column it was meant to exclude); an anticipated fallback clause (`NEGATIVE_RESULTS` §4, “Anticipated fallback clause for camp-defence feature loss (D98 draft)”); a phase work order's premise (the fight already opened at ~435 m; the assumed 218 m was the collapse endpoint, not the opening); and a declaration-only fix (eligible but never selected, 21 of 21). A design killed before freezing is a success of the method, not a failure of the designer.
 
 **Ask "which one, specifically?" of any predicate that sorts correctly.** A classifier that produces the expected split has demonstrated a correlation, not expressed a concept; the follow-up question — which entity, exactly, satisfies the predicate in each case — is cheap and has twice caught things the aggregate could not. In one instance (2026-07-30) a discriminator's caution aimed at distinguishing a garrison from an incidental rallied fragment instead exposed an instrument bug: the isolation scan filtered destroyed units but not withdrawn ones, so off-field Crow scouts' frozen field-edge positions were counting as steady friendlies, and 56 of 61 "sheltered" classifications were artifacts. The aggregate percentages looked plausible in both the contaminated and corrected runs; only the per-entity answer ("sheltered by *whom*?") was diagnostic. The practice pairs with measure-before-freezing: the first tests whether a predicate sorts, the second tests whether it sorts *for the stated reason* — and a predicate passing for an unstated reason is the same defect class as a mechanism working by accident.
 
 **Open the source before citing it for a number.** The most basic check in the hierarchy, written down precisely because it looks too obvious to state — and because it is the one that broke (2026-07-31, the fifteenth pre-freeze design death, `NEGATIVE_RESULTS` §4). An adjudication directed that a feature's ground extent be taken as "the source's described ground" — ~2,827 m², read off a prior ruling's "~60 m neighbourhood" — while ruling in the same breath that extent must be sourced rather than chosen. Nobody opened the ruling's text before citing it. The 60 m was the terrace-search criterion (≤3.5 m relief across a 60 m window — a search parameter), and the source beneath it supplies existence and location only; extent appears nowhere in the chain. The figure then propagated through two committed measurements as their arithmetic anchor before a drafting-stage read killed it. The failure was available to both roles — the adjudicator citing, the instrument-carrier propagating — and the catch was cheaper than either practice above: no probe, no campaign, one read. It stands as the zeroth step of the pair: measure-before-freezing tests a design against the model, which-one-specifically tests a predicate against its entities, and this tests a citation against its page. The page is an instrument too, and it is read, not remembered.
 
+five catches in one session arrived through unintended channels — a probe answering a different question, a gate killing its author's own reading, a provenance question, an executed reference, a fresh clone — and zero through the check aimed at them; the practices' yield has been dominated by incidental catches, and their value is that they put people in positions where incidental catches happen: the incidence is manufactured by running them.
+
 **The composite is a low-resolution instrument, and a flat median is not evidence of model stability.** Each component is a ratio of small integer counts (38.46% is 5/13 end-states, 92.31% is 12/13 observations, 44.44% is 4/9 casualty legs, 50.00% is n/2n checkpoints), so the weighted composite can only take a coarse lattice of values. The envelope median landing on the identical value across successive model versions — as it has, three times at 52.07% — is therefore expected behaviour of the instrument, not a claim about the model; the same quantization produced a pre-D91 distribution whose entire interquartile range sat on one value. Two consequences bind reporting: small genuine improvements can be invisible to the composite while large ones jump discontinuously, so absence of movement is not absence of change; and cross-round comparisons should read the component counts and the underlying continuous variates (casualty spans, event timings, occurrence frequencies), not the headline percentage alone. Relatedly, the composite rose 55.71% → 58.48% in a round where four of seven directional predictions missed — the composite is not the target; the criteria are.
```

## AMBIGUITIES

- `TODO-AMBIGUOUS(D110-GATE-ALLOWLIST)`: Task 4 requires an extension allowlist but does not
  enumerate it. The implementation chose every text extension present in the tracked tree
  (`.css`, `.gitignore`, `.gitkeep`, `.js`, `.json`, `.md`, `.mjs`, `.ts`, `.tsx`, `.txt`)
  plus the extensionless hook. The committed `.claude/*.mjs` and `.claude/*.out.txt` files are
  therefore in scope; they were not excluded after the gate observed them.
- `TODO-AMBIGUOUS(D110-CHECKPOINT-LANDMARK)`: The WO includes checkpoint `landmarkId` in the
  reference-set recipe, but the current `Checkpoint` schema has no `landmarkId` member. The
  test performs a defensive optional read so a future data/schema addition is included; today
  it contributes no IDs.
- `TODO-AMBIGUOUS(D110-SHORT-RUN)`: “A few hundred ticks” does not name a count. The preferred
  instrument uses 360 deterministic ticks, then also runs the mandated exam and scorer.

## DEVIATIONS

No discretionary deviation was taken. Verification stopped exactly when the binding gate went
red, as required. Consequently the full suite, hook no-rejection check, and hook synthetic-BOM
self-test remain unrun, and WO-D110 is not accepted. No threshold or allowlist was changed after
observation; no engine source, scenario byte, existing test, or `.claude/` probe was modified.
