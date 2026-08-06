# WO-D127 execution report — RUN-253

## Outcome

**PASS — the frozen payload and P1–P5 are verified.**

Typecheck, lint, and build exit 0. The full 22-file / 120-test suite has exactly
the two pre-enumerated reds and no others: the assertion surface is 1 failed /
119 passed solely because `tests/repository-text-integrity.test.ts` reports
`spawnSync git ENOBUFS`; the process surface separately reports the intermittent
`[vitest-worker]: Timeout calling "onTaskUpdate"` unhandled error.

- Dispatch HEAD: `aacf426`
- Commit/push: **none**
- Working-tree payload: present, uncommitted
- Frozen prediction tuning: **none**
- Scenario bytes: unchanged

## Payload

The only source/test payload is the three files licensed by WO-D127 §1:

- T1: `engine/src/combat-config.ts` changes the us-7th `best` value from
  `268 / 52` to `253 / 52`.
- T2: `engine/tests/d110-pins.test.ts` changes the simultaneous pin from
  `toBe(268 / 52)` to `toBe(253 / 52)`.
- T3: the range provenance and pin exception comment are rewritten as sourced-value
  history; neither is deleted.
- T4: both `engine/tests/m4a-gates.test.ts` oracle sites change from `a114bb7b`
  to the frozen `a72fd7ef`, with both cause comments naming D122 and D127.

No other engine logic, scenario byte, schema, or seed changed.

## Final comment declarations

### Range provenance string

```text
WO-D127 SOURCED VALUE: 253 is the per-company killed-best sum—the population the engine casualties come from (99.9%, measured at D122); former 268/52 mixed counting frames (monument-plus-evacuees numerator over officers-and-troopers denominator; Scott pairs 268 with 55); changed at D122/D127 on M-FLIP\'s measurement
```

The displayed backslash is the TypeScript string-literal escape for the apostrophe in
`M-FLIP's`; the runtime provenance text contains the apostrophe without a backslash.

### Pin-test sourced-value comment

```text
// WO-D127 SOURCED VALUE: 253 is the per-company killed-best sum—the population the
// engine casualties come from (99.9%, measured at D122). Former 268/52 mixed counting
// frames (monument-plus-evacuees numerator over officers-and-troopers denominator;
// Scott pairs 268 with 55); changed at D122/D127 on M-FLIP's measurement.
```

### Oracle cause comment, identical at both sites

```text
// D122 is the ruling that changed the value; D127 is the WO that measured
// the resulting combat-only behavioral-oracle hash.
```

## Prediction verdicts

### P1 — HIT

The frozen worker-mode campaign ran all 50 committed seeds through every tick `t0..2160`
using `dist/engine/src/index.js` and `dist/src/terrain/movement-loader.js`.

- Scenario content hash observed before the run: `68325eff`.
- Annihilation comparison key: `seed|tick|unit`.
- Committed annihilations: 120.
- Payload annihilations: 120.
- Ordered row-for-row equality: **120/120 exact**.
- Per-seed US fire application counts against committed M-FLIP `perSeed`: **50/50 exact**.

### P2 — HIT

Against `reports/d112-campaign-results.json` at JavaScript numeric equality, without
rounding:

| field | exact seeds |
|---|---:|
| composite | 50/50 |
| C1 | 50/50 |
| C2 | 50/50 |
| C3 | 50/50 |
| C4 | 50/50 |

Thus the composite and every component reproduce the committed envelope at full precision.

### P3 — HIT

Against `.claude/us268-m-flip.json` `perSeed`, every required payload field is exactly equal:

| field | exact seeds |
|---|---:|
| `fireKilled` | 50/50 |
| `fireWounded` | 50/50 |
| `finalKilled` | 50/50 |
| `finalWounded` | 50/50 |

The resulting pooled deltas against the committed 268-world cover are the frozen measured
consequence:

| field | payload minus 268 cover |
|---|---:|
| fire killed | -78 |
| fire wounded | +78 |
| final killed | -48 |
| final wounded | +48 |

### P4 — HIT

Pin (a)(3) before the payload:

```ts
// M5-SPEC hilltop-inclusive figure, sourced outside the scenario: 268/52
// deliberately diverges from the per-company killed-best sum of 253.
expect(usRange.best).toBe(268 / 52);
```

Pin (a)(3) after the payload:

```ts
// WO-D127 SOURCED VALUE: 253 is the per-company killed-best sum—the population the
// engine casualties come from (99.9%, measured at D122). Former 268/52 mixed counting
// frames (monument-plus-evacuees numerator over officers-and-troopers denominator;
// Scott pairs 268 with 55); changed at D122/D127 on M-FLIP's measurement.
expect(usRange.best).toBe(253 / 52);
```

The targeted assertion run reports `engine/tests/d110-pins.test.ts` **4 passed / 4**.
The full-suite assertion surface independently reports the same file **4 passed / 4**.

### P5 — HIT

Both oracle sites are pinned to `a72fd7ef`. The targeted assertion run reports
`engine/tests/m4a-gates.test.ts` **6 passed / 6**, and the full-suite assertion surface
independently reports the same file **6 passed / 6**. No alternate observed hash was
adopted. The targeted run also emitted the pre-enumerated intermittent worker RPC timeout;
that process-surface result did not correspond to an oracle assertion failure.

## Scenario byte-identity gate

| measurement | before payload | after payload | result |
|---|---|---|---|
| Stable scenario content hash | `68325eff` | `68325eff` | identical |
| Scenario file SHA-256 | `e15627df84a9293019001da17734601e502ec799d07b753fa137fde9e13fc908` | `e15627df84a9293019001da17734601e502ec799d07b753fa137fde9e13fc908` | identical |
| `git diff -- data/scenarios/little-bighorn-1876/scenario.json` | empty | empty | identical |

## Red surfaces, reported separately

### Assertion surface

`tests/repository-text-integrity.test.ts` is the sole failed assertion file and reports
verbatim `D110 tracked-text index gate requires Git repository access: spawnSync git ENOBUFS`.
Result: **1 failed / 119 passed assertions; 1 failed / 21 passed files**. This is the
deterministic, expected-pre-existing assertion red enumerated in WO-D127 §3. No other
assertion red occurred.

### Process surface

Vitest separately reports one unhandled error, verbatim
`Error: [vitest-worker]: Timeout calling "onTaskUpdate"`. This is the intermittent,
expected-pre-existing process red enumerated in WO-D127 §3. It fired on this run. No other
process red occurred.

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

### Tests — `npm test` — exit 1, only the two frozen exceptions

```text

> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ❯ tests/repository-text-integrity.test.ts (1 test | 1 failed) 9235ms
   × D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from every tracked text blob in the index 9234ms
     → D110 tracked-text index gate requires Git repository access: spawnSync git ENOBUFS
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"sameB":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"different":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"}}

 ✓ engine/tests/gates.test.ts (6 tests) 60140ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  13551ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  27296ms
stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=13718.3ms timings=13518.3,13718.3,14708.7 pathfind={"calls":140,"expandedNodes":13839389,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 82310ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  26500ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  13413ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  28389ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=89.33ms baseline=4446.88ms sweep=4254.82ms spottingOverhead=0.43%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=29 orders=26 activations=3 leaderDeaths=0

 ✓ tests/m3b-gates.test.ts (3 tests) 38914ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/14 (85.7%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 46196ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  33459ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 15308ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  15097ms
 ✓ engine/tests/d110-pins.test.ts (4 tests) 7635ms
   ✓ D110 pre-break pins > pin (c) — every engine-consumed landmark id is referenced by committed data  7452ms
 ✓ engine/tests/d108-lip.test.ts (5 tests) 339ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 160ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 48

 ✓ tests/data-integrity.test.ts (13 tests) 131ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 126ms
 ✓ engine/tests/unit.test.ts (3 tests) 93ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 35ms
 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 23ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 22ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 19ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 22ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 20ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 19ms
 ✓ engine/tests/variants.test.ts (3 tests) 14ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 5ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 7ms
npm.cmd : 
At line:3 char:1
+ & npm.cmd test 2>&1 | Tee-Object -FilePath $out
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
   Start at  18:18:02
   Duration  269.61s (transform 587ms, setup 0ms, collect 1.82s, tests 260.77s, environment 5ms, prepare 2.39s)


```

### Build — `npm run build` — exit 0

```text

> bighorn-animation@0.1.0 build
> tsc -p tsconfig.engine.json && tsc -b && node scripts/prepare-app-assets.mjs && next build

  ▲ Next.js 14.2.35

   Creating an optimized production build ...
 ✓ Compiled successfully
   Linting and checking validity of types ...
   Collecting page data ...
   Generating static pages (0/4) ...
   Generating static pages (1/4) 
   Generating static pages (2/4) 
   Generating static pages (3/4) 
 ✓ Generating static pages (4/4)
   Finalizing page optimization ...
   Collecting build traces ...

Route (app)                              Size     First Load JS
┌ ○ /                                    81.8 kB         169 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB


○  (Static)  prerendered as static content


```

## AMBIGUITIES

None. No TODO-AMBIGUOUS decision was needed or taken.

## Deviations

None.

## File SHA-256 values

| file | SHA-256 |
|---|---|
| `engine/src/combat-config.ts` | `696209392590bece20b1b26eed78ba5cb3755cbb18ef650ac17886fda364dbf0` |
| `engine/tests/d110-pins.test.ts` | `929834f25a26c821aba85c0ef5c89906f8eff040af68e3bb2ff48e26af737585` |
| `engine/tests/m4a-gates.test.ts` | `463f08221550c0b8849bc7e4b2474a1b2011b54a3e57d91787139ef657c4775b` |
| `data/scenarios/little-bighorn-1876/scenario.json` | `e15627df84a9293019001da17734601e502ec799d07b753fa137fde9e13fc908` |

`codex-report-wo-d127.md` is also touched. Its whole-file SHA cannot be embedded inside
itself without changing that SHA; the handoff provides the final report SHA for independent
verification.

`git diff --check` is green. No commit or push occurred.
