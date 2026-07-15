# CODEX WORK ORDER — O1: Scenario transcription + validation harness

## Goal
In this repo (BighornAnimation), scaffold the project and produce
`data/scenarios/little-bighorn-1876/scenario.json` — assembled STRICTLY from two
input documents — plus a data-integrity test suite that validates it. Green
typecheck, lint, tests, and build are the exit criteria.

## Inputs (read all four before writing anything)
- `docs/TRANSCRIPTION-DECISIONS.md` — authoritative judgment calls. WINS on conflict.
- `docs/research/little-bighorn-research.md` — historical dataset (tables A–K).
- `src/schema/scenario-schema.ts` — the data contract. Apply the three v0.1.1
  amendments from TRANSCRIPTION-DECISIONS §0 to this file first.
- `docs/PRD-battle-simulator.md` — context only (§6.4 defines the test suite).

## Hard constraints
- ASSEMBLE, DO NOT INVENT. Every value in scenario.json must trace to one of the two
  input documents. If they are ambiguous or conflict in a way TRANSCRIPTION-DECISIONS
  does not resolve, DO NOT GUESS: record the item in an `AMBIGUITIES` section of your
  final report and leave a `"TODO-AMBIGUOUS"` note string in the affected record's
  provenance. Zero silent inventions.
- Preserve every confidence rating, source key, low/best/high spread, and
  [CAL]/[REVIEW]/counterfactual flag into provenance fields. Never average.
- Do not modify anything under `docs/`.
- Dependencies: typescript, vitest, eslint + @typescript-eslint only. No network
  calls. No other packages.

## Repo layout to create
- `src/schema/scenario-schema.ts` (amended per §0)
- `src/validate.ts` — runtime structural validator (hand-rolled, readable; no ajv)
- `data/scenarios/little-bighorn-1876/scenario.json`
- `data/scenarios/little-bighorn-1876/README.md` — source list + known weaknesses
  (lift from research doc's Gaps & Reliability report)
- `tests/data-integrity.test.ts`
- `engine/`, `app/`, `pipeline/` — empty placeholder dirs with .gitkeep
- `package.json` (scripts: typecheck = tsc --noEmit; lint = eslint .; test = vitest
  run; build = tsc -b), `tsconfig.json` (strict), eslint flat config, `.gitignore`

## Validation suite (each is a named test; all blocking)
1. scenario.json parses and passes the structural validator against the schema.
2. Every ID reference resolves: sideId, commandingLeaderId, attachedToUnitId,
   issuerLeaderId, recipientUnitIds, targetUnitId, landmarkId, weaponMix keys,
   ammunition keys, tacticsProfileId, checkpoint/observation unitIds & leaderIds,
   variant patch target ids, excludesVariantIds, calibration unit keys,
   bibliography keys used by any SourceRef.
3. All minutes ∈ [0, 1080]; clock start 03:00 end 21:00 consistent.
4. Every Estimate satisfies low ≤ best ≤ high.
5. weaponMix fractions each ∈ [0,1] (amended rule — NO sum constraint).
6. All coordinates within DEM bounds.
7. rangeBands strictly ascending by maxRangeMeters; hitProbability ∈ [0,1].
8. Every record with a provenance field has confidence + ≥1 source.
9. Variant exclusion groups are symmetric (if A excludes B, B excludes A).
10. Expected entity counts (fail if off): units 33 (16 US incl. pack-train + 2 scout
    detachments; 10 warrior bands; 7 noncombatant incl. pony-herd), leaders 18,
    weapons 6, tacticsProfiles 3, orders 22, checkpoints 10, observationEvents 9,
    variants 7, landmarks ≥ 20.
11. Counterfactual variants (v-reno-holds-timber, v-benteen-prompt) carry the
    counterfactual note in provenance.

## Proof expected (paste raw output in the report)
`npm run typecheck && npm run lint && npm test && npm run build`

## Output shape
Write `codex-report.md` at repo root: files created (with line counts), entity-count
table (expected vs actual), the four command outputs verbatim, AMBIGUITIES section
(every unresolved item, or "none"), and any deviations from this work order with
one-line justifications. Do not commit or push; leave the working tree for review.