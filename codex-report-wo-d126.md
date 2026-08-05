# WO-D126 execution report — corpse-drift guards

## Outcome

**STOP — payload implemented and P1–P5 verified, but final quartet incomplete.**

The full suite produced the one binding pre-classified assertion failure exactly as expected:
`tests/repository-text-integrity.test.ts` failed with `spawnSync git ENOBUFS`; the other
119/120 assertions passed. Vitest additionally emitted an unhandled
`[vitest-worker]: Timeout calling "onTaskUpdate"` error. That error is not enumerated in
WO-D126 §4. Per the owner's fix-nothing rule, no rerun, diagnosis, repair, or build followed.

- Dispatch HEAD: `2ccd9bc5b61336989435eba21cddfff26840706c`
- Commit/push: **none**
- Working-tree payload: present, uncommitted
- Scenario bytes: unchanged
- Frozen prediction tuning: none

## Declarations

### T1 bookkeeping

Skipped deliveries to a recipient with `endState` remain recorded in `deliveredOrders` and
are consumed from `deliveryQueue`, but they perform no activation and emit no
activation-side event. On seed 18760647, co-m's skipped `reno-mount` and `reno-retreat`
deliveries are recorded at t1508 and t1510 respectively.

### T3 route and surface difference

Chosen route: **(b), thread destruction information into the checkpoint scan from the
scorer's existing event input.** `scoreCheckpoints` now requires the simulation event stream,
finds the referenced unit's destruction tick, includes the destruction-tick sample, and
excludes samples whose tick is later. `TrackSample`, the track builder, save/replay, and
serialization are unchanged.

Actual route surface:

- Guard site: `engine/src/score.ts`.
- Existing score caller: `scoreCalibrationRun` in `engine/src/score.ts`.
- Two direct callers threaded with their simulator event streams: `engine/cli.ts` and
  `engine/tests/m3a-gates.test.ts`.

This is the narrow route enumerated analytically in §4. The assertion-red surface did not
differ from §4: only the pre-classified repository-text-integrity assertion failed. The
actual Vitest process surface did differ: an additional unhandled worker RPC timeout was
reported. It is disclosed and was treated as STOP rather than reconciled.

## Payload

- T1, `engine/src/orders.ts:170`: calls `activateOrder` only when `unit.endState` is absent;
  bookkeeping follows the declaration above.
- T2, `engine/src/movement.ts:298`: skips an ended unit at the structural movement loop.
- T3, `engine/src/score.ts:49` and `:54`: derives the unit destruction tick from events and
  prevents selection of later track samples.
- Required route-(b) caller threading only: `engine/cli.ts:36`,
  `engine/tests/m3a-gates.test.ts:63`, and `scoreCalibrationRun` at
  `engine/src/score.ts:513`.

No scenario byte, event schema, RNG site, other `endState` logic, track schema, track builder,
or serialization surface changed.

## Prediction verdicts

### P1 — HIT

The payload campaign used exactly the 50 seeds in `reports/d112-campaign-results.json`.
For every seed, the payload composite and C1/C2/C3/C4 component values were compared with
JavaScript numeric equality at full precision against the committed row: **50/50 exact**.
The same 50 payload score rows were also exact against an independently compiled clean-HEAD
snapshot.

The payload annihilation sequence was reduced to the frozen comparison key
`seed|tick|unit` and compared in array order against all committed rows: **120 committed,
120 payload, row-for-row exact**. Therefore the envelope, every component, and the bout
census are identical.

### P2 — HIT

The affected unit is seed 18760647 / co-m. It is destroyed at t1497 at
`(6951.473881173277, 10965.340825187805)`. Across every tick t1498–2160:

- position changes: **0**;
- `activeOrderId` changes: **0**;
- ticks with a nonempty path: **0**.

Its post-death `activeOrderId` remains `reno-to-timber`, its path remains empty, and the
two later deliveries do not activate.

#### Stillness trace

Every state change in t1490–1560 is shown, plus the two skipped-delivery ticks and periodic
samples through day end.

| tick | x | y | activeOrderId | path | endState |
|---:|---:|---:|---|---:|---|
| 1490 | 7063.5604678678865 | 10903.905371221756 | reno-to-timber | 4 | — |
| 1491 | 7047.090096045835 | 10912.932898954707 | reno-to-timber | 4 | — |
| 1492 | 7030.619724223783 | 10921.960426687658 | reno-to-timber | 4 | — |
| 1493 | 7014.149352401731 | 10930.987954420607 | reno-to-timber | 4 | — |
| 1494 | 6997.67898057968 | 10940.015482153558 | reno-to-timber | 4 | — |
| 1495 | 6981.486567752865 | 10948.89065858775 | reno-to-timber | 4 | — |
| 1496 | 6967.6662940000915 | 10956.465648753612 | reno-to-timber | 4 | — |
| 1497 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1498 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1508 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1510 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1560 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1620 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1740 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1860 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 1980 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 2100 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |
| 2160 | 6951.473881173277 | 10965.340825187805 | reno-to-timber | 0 | DESTROYED |

### P3 — HIT

C1 is exactly `0.5` at full precision on every payload seed and exactly equals the committed
C1 value on every row.

| seed | payload C1 | committed C1 | exact |
|---:|---:|---:|---|
| 18760600 | 0.5 | 0.5 | yes |
| 18760601 | 0.5 | 0.5 | yes |
| 18760602 | 0.5 | 0.5 | yes |
| 18760603 | 0.5 | 0.5 | yes |
| 18760604 | 0.5 | 0.5 | yes |
| 18760605 | 0.5 | 0.5 | yes |
| 18760606 | 0.5 | 0.5 | yes |
| 18760607 | 0.5 | 0.5 | yes |
| 18760608 | 0.5 | 0.5 | yes |
| 18760609 | 0.5 | 0.5 | yes |
| 18760610 | 0.5 | 0.5 | yes |
| 18760611 | 0.5 | 0.5 | yes |
| 18760612 | 0.5 | 0.5 | yes |
| 18760613 | 0.5 | 0.5 | yes |
| 18760614 | 0.5 | 0.5 | yes |
| 18760615 | 0.5 | 0.5 | yes |
| 18760616 | 0.5 | 0.5 | yes |
| 18760617 | 0.5 | 0.5 | yes |
| 18760618 | 0.5 | 0.5 | yes |
| 18760619 | 0.5 | 0.5 | yes |
| 18760620 | 0.5 | 0.5 | yes |
| 18760621 | 0.5 | 0.5 | yes |
| 18760622 | 0.5 | 0.5 | yes |
| 18760623 | 0.5 | 0.5 | yes |
| 18760624 | 0.5 | 0.5 | yes |
| 18760625 | 0.5 | 0.5 | yes |
| 18760626 | 0.5 | 0.5 | yes |
| 18760627 | 0.5 | 0.5 | yes |
| 18760628 | 0.5 | 0.5 | yes |
| 18760629 | 0.5 | 0.5 | yes |
| 18760630 | 0.5 | 0.5 | yes |
| 18760631 | 0.5 | 0.5 | yes |
| 18760632 | 0.5 | 0.5 | yes |
| 18760633 | 0.5 | 0.5 | yes |
| 18760634 | 0.5 | 0.5 | yes |
| 18760635 | 0.5 | 0.5 | yes |
| 18760636 | 0.5 | 0.5 | yes |
| 18760637 | 0.5 | 0.5 | yes |
| 18760638 | 0.5 | 0.5 | yes |
| 18760639 | 0.5 | 0.5 | yes |
| 18760640 | 0.5 | 0.5 | yes |
| 18760641 | 0.5 | 0.5 | yes |
| 18760642 | 0.5 | 0.5 | yes |
| 18760643 | 0.5 | 0.5 | yes |
| 18760644 | 0.5 | 0.5 | yes |
| 18760645 | 0.5 | 0.5 | yes |
| 18760646 | 0.5 | 0.5 | yes |
| 18760647 | 0.5 | 0.5 | yes |
| 18760648 | 0.5 | 0.5 | yes |
| 18760649 | 0.5 | 0.5 | yes |

### P4 — HIT

For P4, event `sequence` fields were removed before comparison because deleting events
necessarily renumbers subsequent sequence ordinals. After that normalization, every payload
event stream is exactly the clean-HEAD stream with deletions only. Forty-nine seeds have zero
deletions. Seed 18760647 has 8,825 clean-HEAD events and 8,811 payload events: exactly the
following 14 post-death co-m activation/movement events were removed, with zero unmatched
payload events.

| tick | type | order/details |
|---:|---|---|
| 1508 | order-received | reno-mount |
| 1508 | order-superseded | reno-mount; superseded reno-to-timber |
| 1509 | mounted | reno-mount |
| 1510 | order-received | reno-retreat |
| 1510 | order-superseded | reno-retreat; superseded reno-mount |
| 1510 | move-started | reno-retreat |
| 1530 | waypoint-reached | reno-retreat; waypoint 1 |
| 1530 | waypoint-reached | reno-retreat; waypoint 2 |
| 1531 | ford-crossing | reno-retreat |
| 1539 | waypoint-reached | reno-retreat; waypoint 3 |
| 1541 | waypoint-reached | reno-retreat; waypoint 4 |
| 1563 | waypoint-reached | reno-retreat; waypoint 5 |
| 1602 | waypoint-reached | reno-retreat; waypoint 6 |
| 1602 | arrived | reno-retreat |

The post-death-delivery census contains exactly two scheduled deliveries, both on the one
ruled pair: 18760647/co-m at t1508 and t1510 after death t1497. **No second re-arm pair was
found.** Under the declared bookkeeping choice these deliveries remain bookkeeping records,
not activations.

### P5 — HIT

- Final RNG state and draw count: **exact clean-HEAD equality on 50/50 seeds**.
- Every unit track except 18760647/co-m after t1497: **sample-for-sample exact on 50/50
  seeds**.
- The affected track at or before t1497: **zero differences**.
- The affected track after t1497: **651 clean-HEAD/payload sample differences**, exactly the
  licensed corpse-track change.

No RNG site was touched and no draw was added or removed.

## Scenario byte-identity gate

| measurement | before payload | after payload | result |
|---|---|---|---|
| Scenario stable content hash | `68325eff` | `68325eff` | identical |
| Scenario file SHA-256 | `e15627df84a9293019001da17734601e502ec799d07b753fa137fde9e13fc908` | `e15627df84a9293019001da17734601e502ec799d07b753fa137fde9e13fc908` | identical |
| `git diff -- data/scenarios/little-bighorn-1876/scenario.json` | empty | empty | identical |

## §4 red enumeration and payload result

| surface | §4 classification | payload run |
|---|---|---|
| `tests/repository-text-integrity.test.ts` / `spawnSync git ENOBUFS` | EXPECTED-PRE-EXISTING; do not fix | observed verbatim; sole failed assertion |
| Remaining assertions | 119/119 green under T1+T2; T3 analytically expected zero additional reds | 119/119 green |
| T3 assertion-red difference | none expected | none observed |
| Other process error | not enumerated | unhandled `[vitest-worker]: Timeout calling "onTaskUpdate"`; **STOP** |

## Quartet output — verbatim

### Typecheck — `npm run typecheck` — exit 0

```text

> bighorn-animation@0.1.0 typecheck
> tsc --noEmit

```

### Lint — `npm run lint` — exit 0

```text

> bighorn-animation@0.1.0 lint
> eslint .

```

### Tests — `npm test` — exit 1

```text

> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ❯ tests/repository-text-integrity.test.ts (1 test | 1 failed) 11513ms
   × D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from every tracked text blob in the index 11511ms
     → D110 tracked-text index gate requires Git repository access: spawnSync git ENOBUFS
stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=17355.1ms timings=14626.5,17355.1,17470.4 pathfind={"calls":140,"expandedNodes":13839389,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 93749ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  30054ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  13675ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  32274ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"sameB":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"different":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"}}

 ✓ engine/tests/gates.test.ts (6 tests) 66101ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  14851ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  30248ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/14 (85.7%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 51844ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  37017ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=99.92ms baseline=4865.47ms sweep=4994.41ms spottingOverhead=2.65%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=29 orders=26 activations=3 leaderDeaths=0

 ✓ tests/m3b-gates.test.ts (3 tests) 43523ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 16057ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  15828ms
 ✓ engine/tests/d110-pins.test.ts (4 tests) 8338ms
   ✓ D110 pre-break pins > pin (c) — every engine-consumed landmark id is referenced by committed data  8148ms
 ✓ engine/tests/d108-lip.test.ts (5 tests) 361ms
stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON
[gate] G1 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G2 — landmark elevations satisfy all required ordinal relationships
[gate] G2 elevations {"lastStandHill":1006.6591586542488,"deepRavine":1004.6884803025237,"fordB":939.2357514637081,"renoHill":1034.959347093062,"fordA":957.904810237618,"weirPoint":1041.7486488377403,"sharpshooterRidge":1038.9672878067122}
[gate] G2 PASS

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G3 — curvature toggle demonstrates the 24 km earth-drop correction
[gate] G3 PASS rawDrop=45.20m effectiveDrop=39.33m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target
[gate] G4 PASS blockedAt=489.77m

stdout | tests/terrain-gates.test.ts > M1 terrain validation gates > G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance
[gate] G5 PASS samples=100 tolerance=0.05m

 ✓ tests/terrain-gates.test.ts (5 tests) 173ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 133ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 48

 ✓ tests/data-integrity.test.ts (13 tests) 141ms
 ✓ engine/tests/unit.test.ts (3 tests) 96ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 37ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 22ms
 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 26ms
 ✓ engine/tests/variants.test.ts (3 tests) 15ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 25ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 23ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 25ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 20ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 8ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 5ms
npm.cmd : 
At line:3 char:1
+ & npm.cmd test *>&1 | Tee-Object -FilePath $out
+ ~~~~~~~~~~~~~~~~~~~
    + CategoryInfo          : NotSpecified: (:String) [], RemoteException
    + FullyQualifiedErrorId : NativeCommandError
 
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯

 FAIL  tests/repository-text-integrity.test.ts > D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from 
every tracked text blob in the index
Error: D110 tracked-text index gate requires Git repository access: spawnSync git ENOBUFS
 ❯ git tests/repository-text-integrity.test.ts:15:11
     13|   } catch (error) {
     14|     const detail = error instanceof Error ? error.message : String(err…
     15|     throw new Error(`D110 tracked-text index gate requires Git reposit…
       |           ^
     16|   }
     17| }
 ❯ tests/repository-text-integrity.test.ts:31:21

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯[1/1]⎯

⎯⎯⎯⎯⎯⎯ Unhandled Errors ⎯⎯⎯⎯⎯⎯

Vitest caught 1 unhandled error during the test run.
This might cause false positive tests. Resolve unhandled errors to make sure your tests are not affected.

⎯⎯⎯⎯⎯⎯ Unhandled Error ⎯⎯⎯⎯⎯⎯⎯
Error: [vitest-worker]: Timeout calling "onTaskUpdate"
 ❯ Object.onTimeoutError node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:53:10
 ❯ Timeout._onTimeout node_modules/vitest/dist/chunks/index.B521nVV-.js:59:62
 ❯ listOnTimeout node:internal/timers:605:17
 ❯ processTimers node:internal/timers:541:7

⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯⎯


 Test Files  1 failed | 21 passed (22)
      Tests  1 failed | 119 passed (120)
     Errors  1 error
   Start at  17:12:59
   Duration  302.06s (transform 747ms, setup 0ms, collect 2.05s, tests 292.24s, environment 5ms, prepare 2.66s)

```

### Build — not run

No build output exists. The unenumerated Vitest worker error triggered the binding STOP before
`npm run build`.

## File SHA-256 values

| touched file | SHA-256 |
|---|---|
| `engine/src/orders.ts` | `531843463b8053f277f63ed631667cbfb63a63eca15b7302f6fd1c4f1e33f04d` |
| `engine/src/movement.ts` | `c8bdfaf8f0a810913314f1c0d978be56079d39ef4130d4fdb6c7f50f0d7252d7` |
| `engine/src/score.ts` | `5d472c64cb68e814ed09736dd79022adcc36cfdc0997045485866c7852716798` |
| `engine/cli.ts` | `ed9b89c180eb7446a59f700324a7ecc3b3affda12eb09cffd321d49dda17eaa0` |
| `engine/tests/m3a-gates.test.ts` | `e87334d84caa7ce7a66ea51a6d0ec545bb1c4e66a3ec45a58b33997a6183523e` |

`codex-report-wo-d126.md` is also touched. Its final whole-file SHA cannot be embedded inside
itself without changing that SHA; the handoff supplies the final SHA for independent checking.

`git diff --check` is green. The final payload is exactly the five source/caller files above
plus this report.

## AMBIGUITIES

None blocking. The WO's two explicit freedoms are resolved in the declarations above. No new
`TODO-AMBIGUOUS` was introduced.

## Deviations

- The first baseline-vs-payload campaign attempt was sequential. It was terminated before
  any seed result was emitted when its runtime proved impractical. The identical frozen
  comparisons were then partitioned into five fixed ten-seed workers.
- The temporary partitioned verifier mistakenly required the affected seed's post-death
  track divergence in every chunk. Chunks 600–609, 610–619, 620–629, and 630–639 therefore
  returned one false instrument failure each: `affected corpse post-death track did not
  differ from clean HEAD`. Each chunk's actual predicates were green (10/10 score rows,
  exact bout subset, 10/10 RNG, 10/10 unaffected tracks, no event difference). The 640–649
  chunk containing seed 18760647 passed outright. The already-produced evidence was
  aggregated without rerunning or changing any predicate or payload.
- Vitest emitted the unenumerated worker RPC timeout after reporting 119/120 assertions with
  only the pre-classified ENOBUFS assertion red. This triggered STOP. Build was not run, so
  the requested green quartet/exit criterion was not achieved.

No deviation caused a payload edit after any prediction result was observed.
