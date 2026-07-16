# Codex Report — M2-A

## FINAL STATUS — ESCALATION ADJUDICATED; M2 CLOSED (D40)

Owner adjudication (Fable trace, Chuck ruling D40): the residual `cp-reno-hill`
+95.5 min miss is a **placeholder-river artifact, not an engine or D32 defect**.
Three mechanisms, one root cause, all pre-flagged "pending O4/O6" in provenance:
(1) the 4-point placeholder river polyline ends at lat 45.49, so A* legally
routes around its southern endpoint (~45 min detour away from Reno Hill);
(2) the retreat-crossing ford marker sits ~2 km off the placeholder channel
(M1-A ambiguity #4), removing the direct historical crossing from the cost grid;
(3) the timber objective lies on the placeholder channel line (14 min
`endpoint is impassable` block; also the unmoved 1,111 m timber-checkpoint
distance). Resolution deferred to O4 Tier A (D25); E5 re-baselines via
`npm run sim` when real 1876 geometry lands. Full quartet verified green after
D38/D39 (30 tests, gates E1–E6). The D32 speed table survives second contact
untuned.

## STATUS AT SECOND STOP (superseded by adjudication above) — D38/D39 APPLIED; SECOND E5 ESCALATION STOP

Owner review resolved the first escalation through approved D38 and D39. Both
rulings were implemented, their authorized documentation changes were made, E3
was completed, and the E5 artifact was regenerated. The second E5 run still
triggered the mandatory gross-miss stop. No speed, path, or additional scenario
data tuning was performed after observing the result.

Gross misses requiring owner review:

- `cp-reno-hill`: nearest arrival is **+95.5 minutes** late after D39. This is
  still an hours-scale miss and is outside the owner-provided expected shape.

D38 resolved the right-wing gross miss: Calhoun is now an ordinary +20 minute
miss at 0 m, and Keogh is an ordinary -10 minute / 415.6 m miss. The two exact
history artifact rows were appended. M2-A is still not represented as complete,
and the final quartet was not run after the second E5 stop.

## Files and line counts

| File | Lines |
|---|---:|
| `src/scenario/apply-variants.ts` | 106 |
| `src/terrain/movement-loader.ts` | 163 |
| `engine/cli.ts` | 74 |
| `engine/src/clock.ts` | 37 |
| `engine/src/events.ts` | 32 |
| `engine/src/index.ts` | 161 |
| `engine/src/movement.ts` | 244 |
| `engine/src/objectives.ts` | 112 |
| `engine/src/orders.ts` | 140 |
| `engine/src/pathfind.ts` | 263 |
| `engine/src/rng.ts` | 30 |
| `engine/src/score.ts` | 85 |
| `engine/src/serialize.ts` | 68 |
| `engine/src/state.ts` | 173 |
| `engine/tests/gates.test.ts` | 251 |
| `engine/tests/helpers.ts` | 43 |
| `engine/tests/unit.test.ts` | 46 |
| `engine/tests/variants.test.ts` | 35 |
| `reports/e5-baseline.md` | 19 |
| `data/scenarios/little-bighorn-1876/scenario.json` | 449 |
| `docs/IMPLEMENTATION_HISTORY.md` | 150 |
| `docs/TRANSCRIPTION-DECISIONS.md` | 222 |
| `tests/data-integrity.test.ts` | 278 |
| `eslint.config.js` | 26 |
| `package.json` | 28 |
| `pipeline/node-ambient.d.ts` | 41 |
| `tsconfig.json` | 14 |
| `codex-report-m2a.md` | 134 |

## Quartet chain output verbatim

The requested final chain was intentionally **not run after the second E5 escalation**.
There is no final quartet-chain output to report without violating the stop rule.

**Post-adjudication verification (closes the trail):** after the D40 ruling, the
full quartet was run green in the working tree (Fable, 30/30 tests, gates E1–E6),
and independently reproduced from fresh public clone, 30/30, quartet exit 0,
2026-07-15 (Chuck) — confirming the committed state, including the D29 .br-only
assets, is good as pushed.

The last completed typecheck before the E5 run was:

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

The D38/D39 targeted suite completed before the E5 re-check:

```text
Test Files  4 passed (4)
Tests       25 passed (25)
Duration    17.87s
```

It included all E1–E6 gates, the direct eight-tick ford hold assertion,
division-halt immobility, data integrity, variant application, and unit tests.
This is not substituted for the explicitly requested final quartet chain.

## E1 hashes

The full-state FNV-1a values at required ticks were identical for both same-seed
runs and the different-seed run (M2 consumes no randomness):

| Tick | Same seed A (`18760625`) | Same seed B (`18760625`) | Different seed (`42`) |
|---:|---|---|---|
| 1 | `85d7423c` | `85d7423c` | `85d7423c` |
| 360 | `364beaca` | `364beaca` | `364beaca` |
| 1080 | `c16553d8` | `c16553d8` | `c16553d8` |
| 2160 | `048e48d7` | `048e48d7` | `048e48d7` |

## `npm run sim` output excerpt

```text
> bighorn-animation@0.1.0 sim
> npm run build --silent && node dist/engine/cli.js --scenario little-bighorn-1876 --to-tick 2160 --report

[sim] scenario=little-bighorn-1876 seed=18760625 hash=23403d8d ticks=0..2160
[sim] E5 checkpoints=10 hits=4 misses=6
[sim] wrote C:\Users\cdwas\Documents\Programming\BighornAnimation\reports\e5-baseline.md
```

## Full E5 table verbatim

| Checkpoint | Unit | Target min | Nearest min | Distance m | Delta min | Result |
|---|---|---:|---:|---:|---:|---|
| cp-scouts-crows-nest | crow-scouts | 0.0 | 0.0 | 0.0 | 0.0 | HIT |
| cp-reno-ford-a | co-a | 675.0 | 582.0 | 0.0 | -93.0 | MISS |
| cp-reno-skirmish-line | co-a | 720.0 | 611.0 | 1111.5 | -109.0 | MISS |
| cp-reno-timber | co-a | 750.0 | 611.0 | 1111.5 | -139.0 | MISS |
| cp-reno-hill | co-a | 765.0 | 860.5 | 0.0 | 95.5 | MISS |
| cp-yates-ford-b | co-f | 780.0 | 795.0 | 0.0 | 15.0 | HIT |
| cp-right-wing-calhoun | co-l | 795.0 | 815.0 | 0.0 | 20.0 | MISS |
| cp-keogh-sector | co-i | 825.0 | 815.0 | 415.6 | -10.0 | MISS |
| cp-custer-last-stand | co-f | 840.0 | 831.0 | 0.0 | -9.0 | HIT |
| cp-weir-point | co-d | 865.0 | 848.0 | 0.0 | -17.0 | HIT |

## AMBIGUITIES

1. `TODO-AMBIGUOUS(M2-A)` in `engine/src/rng.ts`: D31a requires scenario + user
   seed in serialized PRNG state, while E1 requires full-state hashes to remain
   identical across different seeds before M2 consumes randomness. User-seed
   mixing is deferred until the first draw so E1 remains exact and later random
   draws still diverge by seed.
2. Inherited M1/D29 raster ambiguity: scenario ford marker coordinates are not
   always on the coarse burned river channel. E3 locates the actual
   channel-adjacent `FORD` cell and uses it as an explicit waypoint before Reno
   Hill. No terrain data was changed.

## Deviations / incomplete work caused by escalation

- D38 and D39 were implemented exactly as approved, including the two authorized
  docs changes and both history artifact rows.
- E3 now directly asserts eight stationary held ticks and movement on tick nine.
- The final quartet chain was not run after the second escalation.
- No commit or push was performed.
