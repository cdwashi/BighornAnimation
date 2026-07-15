# Codex report — O1b schema v0.2 + ambiguity burn-down

## Result

Schema and scenario metadata are now v0.2. All inline D19 values in the O1b work
order are structural, the six camp best strengths sum to 5,250, and the required
quartet chain exits successfully.

## Files changed

| File | Lines | Change |
|---|---:|---|
| `src/schema/scenario-schema.ts` | 410 | Added v0.2 variant operations and side casualties; updated version comments |
| `src/validate.ts` | 365 | Added structural validation for all v0.2 fields |
| `data/scenarios/little-bighorn-1876/scenario.json` | 448 | Applied D19 data rulings and schemaVersion 0.2 |
| `tests/data-integrity.test.ts` | 264 | Added v0.2 reference checks, camp checks, and the non-blocking TODO metric |
| `codex-report-o1b.md` | 86 | Added this report |

No dependency or package file changed. O1b did not modify any file under `docs/`;
pre-existing docs worktree changes remain untouched.

## Resolved vs. remaining ambiguities

The O1 scenario had 57 `TODO-AMBIGUOUS` occurrences. O1b removes 15 fully resolved
occurrences. Three combined records were narrowed to their still-unresolved portion,
so their marker remains. The final scenario contains **42** occurrences.

| Ambiguity category | O1 markers | O1b disposition | Remaining markers |
|---|---:|---|---:|
| Six camp strength sentinels | 6 | Resolved by D19-R3 ranges; best sum = 5,250 | 0 |
| Pack-train weapon mix + tactics | 1 | Weapon mix resolved by D19-R4; unsourced tactics profile remains | 1 |
| Scout ammunition + formation | 2 | Ammunition resolved by D19-R5; unsourced formations remain | 2 |
| Kanipe/Martini moving target | 2 | Resolved to `targetUnitId: co-f` by D19-R6 | 0 |
| Blackfeet-Santee north-center position | 1 | Resolved to 45.549, -107.448 by D19-R8 | 0 |
| Four schema-limited variants | 4 | Fully structural through v0.2 patch operations | 0 |
| Coalition casualty aggregate | 2 | Moved to coalition `sideCasualties` | 0 |
| O1 ambiguities outside O1b scope | 39 | Left verbatim | 39 |
| **Total** | **57** | **15 removed** | **42** |

No new ambiguity was introduced.

## Quartet chain output

Command:

`npm run typecheck && npm run lint && npm test && npm run build`

Raw output:

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit


> bighorn-animation@0.1.0 lint
> eslint .


> bighorn-animation@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 42

 ✓ tests/data-integrity.test.ts (12 tests) 114ms

 Test Files  1 passed (1)
      Tests  12 passed (12)
   Start at  20:20:26
   Duration  1.06s (transform 213ms, setup 0ms, collect 227ms, tests 114ms, environment 0ms, prepare 278ms)


> bighorn-animation@0.1.0 build
> tsc -b
```

Exit code: 0.

## Deviations

None.

No commit or push was performed.
