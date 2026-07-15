# CODEX WORK ORDER — O1b: schema v0.2 + ambiguity burn-down

## Goal
Apply approved rulings D19 (docs/IMPLEMENTATION_HISTORY.md) to close resolvable
TODO-AMBIGUOUS flags, and extend the schema to v0.2 so the four partially-expressed
variants and the coalition casualty aggregate become fully structural. Exit: quartet
green, updated tests green.

## Inputs
docs/TRANSCRIPTION-DECISIONS.md, docs/CODEX-WORKORDER-O1.md (context),
codex-report.md AMBIGUITIES list, and the D19 ruling values in this order's tasks.
Same hard constraints as O1: assemble don't invent; new ambiguities → report, never guess.

## Tasks
1. Schema v0.2 (src/schema/scenario-schema.ts, bump meta.schemaVersion):
   a. Extend Variant.patch with: modifyLeaders {id, changes}[], addUnits Unit[],
      addTacticsProfiles TacticsProfile[], modifyEndStates {unitId, changes}[].
   b. Add CalibrationTargets.sideCasualties?: Record<sideId, {killed: Estimate,
      wounded: Estimate}>.
2. Data updates (scenario.json):
   a. Move the coalition 31/60/300 killed + 100/160/200 wounded aggregate from
      hunkpapa-pool to sideCasualties["lakota-cheyenne-coalition"]; keep provenance.
   b. Complete the four variants structurally: v-organized-last-stand adds profile
      us-cav-laststand (withdrawalDiscipline 80, dispersion 15) + modifyUnits for
      co-c/e/f/i/l + modifyEndStates byMinute 870; v-c-company-split adds co-c-det
      (half of co-c strengths, same fields) + halves co-c; v-benteen-prompt adds
      modifyLeaders benteen orderDelayMinutes 3; v-deep-ravine-ssl adds the SSL
      checkpoint (45.569,-107.424, tol 100 m / 25 min, MEDIUM) via addCheckpoints
      and notes absence of a base checkpoint.
   c. Camp strengths (D19-R3): hunkpapa-camp 1365, oglala-camp 1315, minneconjou-camp
      790, sans-arc-camp 575, mixed-north-camp 575, cheyenne-camp 630 — low/high
      scale ×0.514/×1.429 rounded to 5; provenance MEDIUM, note "lodge-proportional
      distribution per D14 method, D19-R3".
   d. pack-train weaponMix {springfield-1873-carbine: 0.8, colt-saa: 0.8} LOW
      (D19-R4); add bibliography key GRAHAM ("W.A. Graham, The Custer Myth /
      RCOI compilations") and rekey the pack-train ammo source WEB_MISC→GRAHAM.
   e. Scout ammunition (D19-R5): both scout units {springfield: 100, henry: 40,
      muzzleloader: 20, bow: 25} for weapons present in their mix, LOW.
   f. kanipe-msg and martini-msg objective = {targetUnitId: "co-f"} (D19-R6).
   g. blackfeet-santee-pool position 45.549,-107.448, keep LOW (D19-R8).
   h. Remove each TODO-AMBIGUOUS string resolved above; leave all others intact.
3. Tests: update data-integrity.test.ts for v0.2 (sideCasualties reference checks;
   variant addUnits/addTacticsProfiles/modifyLeaders id resolution; camp strengths
   nonzero; report remaining TODO-AMBIGUOUS count as a non-blocking logged metric).

## Proof + output
Same as O1: quartet chain output verbatim in codex-report-o1b.md, with a
resolved-vs-remaining ambiguity table. No commit/push.