# WO-D93 / D96 release symmetry, F6 re-baseline, closing mechanism

Execution date: 2026-07-25  
Starting HEAD: `750b15a14dc49a882e1fa091090a9a69f2be56d1`  
Baseline seed: `18760625`  
Scenario-content stream: `ba288f09` before and after

## Summary

WO-D93 resumed after the prior STOP was upheld and D96 supplied the three
missing closing rulings. The complete D93–D96 round is implemented:

1. a camp-defence commitment releases when its believed threat position leaves
   the same `campDefenseRadiusMeters` predicate used by activation;
2. F6 uses the participant-scaled ceiling
   `ceil(11,100,000 × 964 / 447) = 23,938,256`, with the derivation recorded in
   the gate;
3. a camp-defence band enters a held CHARGE against its committed threat only
   when the threat is SHAKEN or worse and eligible closing-side
   `strengthAvailable` within `friendlyRadiusMeters` of the threat strictly
   exceeds opposing `strengthAvailable`.

No `[CAL]` value or scenario byte moved. No commit or push was made.

The result was not tuned after observation. The quartet is green except for F4:
81/82 tests pass, with co-d destruction retained as the sole red. F6 is green.
PR-5 is not triggered: Reno killed exceeds 26.09 in 0/50 seeds.

## Implementation

### D93 — symmetric release

`engine/src/camp-defense.ts` now tests the current commitment's believed
camp-to-threat distance against `config.campDefenseRadiusMeters` before threat
switching or blocked retry. Release clears the camp-defence latch, alert,
target-following pursuit, path, blockage, and posture. A later tick re-enters
the existing alert/turnout evaluation normally.

Threat switching also clears any held CHARGE against the old commitment before
selecting the new committed threat and feature.

### D94 — participant-derived F6 ceiling

The F6 ceiling is not fitted to the observed 11,938,067-node baseline:

```text
pre-D91 ceiling       = 11,100,000 expanded nodes
pre-D91 participants  = 447
post-D91 participants = 964
new ceiling           = ceil(11,100,000 × 964 / 447)
                      = 23,938,256 expanded nodes
```

The deterministic whole-run oracle honestly moves from 190 to 205 `findPath`
calls because symmetric release and D96 closing add target-following paths.
The state oracle honestly moves from `8e16fefd` to `78e4771e`. Scratch
allocations remain bounded at 3 and measured 1.

### D95/D96 — held closing

The trigger uses no new number:

- cohesion: committed threat is SHAKEN, BROKEN, or ROUTED;
- locality: existing `friendlyRadiusMeters` (450 m), centered on the committed
  runtime threat;
- aggregation: `strengthAvailable` on both sides;
- closing-side exclusions: BROKEN, ROUTED, and DESTROYED units;
- engagement-seam eligibility: noncombatant camps are not combat mass;
- threshold: strict bare superiority, closing mass > opposing mass.

On the first passed trigger, the band takes the existing CHARGE posture and
mounted gallop/foot speed and receives a target-following path to its committed
threat. It is deliberately neither INITIATIVE nor COMBAT pursuit, so the
engagement state reaches existing D65 CHARGE/MELEE shock resolution. The
decision is held until threat switch, symmetric release, or a real order;
subsequent morale or ratio changes do not flap the decision per tick.

## New tests named

- `D93 releases a commitment when its threat leaves the activation radius`
- `D96 holds CHARGE after degraded cohesion and bare target-centered local superiority`

The D96 test proves:

- BROKEN closing-side support is excluded;
- support within 450 m of the threat but outside 450 m of the band is counted;
- bare superiority alone does not close on a STEADY threat;
- SHAKEN plus superiority enters CHARGE;
- loss of the trigger after transition does not cancel the held CHARGE.

## Quartet — verbatim

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit 0.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit 0.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=8403.0ms timings=8144.0,8403.0,8542.6 pathfind={"calls":205,"expandedNodes":11938067,"scratchAllocations":1,"heapGrowths":3}

 ❯ engine/tests/m4a-gates.test.ts (6 tests | 1 failed) 56591ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  22137ms
   ✓ M4-A F1-F6 closeout gates > F2 conservation — integer casualties/strength/ammo and conserved strength 6ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  8881ms
   × M4-A F1-F6 closeout gates > F4 full-stack baseline — wing dies, hill and village hold, couriers deliver 6ms
     → expected 'DESTROYED' to be undefined
   ✓ M4-A F1-F6 closeout gates > F5 informational scorecard is coherent — scout doctrine and D74 predictions hold 0ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  16835ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"6a7e608e"},"sameB":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"6a7e608e"},"different":{"1":"baadad58","360":"46f01a7a","1080":"49bc6012","2160":"6a7e608e"}}

 ✓ engine/tests/gates.test.ts (6 tests) 39083ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  8153ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  18610ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=93.18ms baseline=4622.09ms sweep=4514.96ms spottingOverhead=1.32%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=29 orders=26 activations=3 leaderDeaths=0

 ✓ tests/m3b-gates.test.ts (3 tests) 32345ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/13 (92.3%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 31218ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  22779ms
 ✓ engine/tests/d91-gates.test.ts (6 tests) 9718ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  9538ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 174ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 38

 ✓ tests/data-integrity.test.ts (13 tests) 132ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 115ms
 ✓ engine/tests/unit.test.ts (3 tests) 89ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 22ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 21ms
 ✓ engine/tests/variants.test.ts (3 tests) 13ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 9ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 5ms

 Test Files  1 failed | 13 passed (14)
      Tests  1 failed | 81 passed (82)
   Start at  20:44:37
   Duration  175.35s (transform 528ms, setup 0ms, collect 1.34s, tests 169.53s, environment 3ms, prepare 1.37s)

 FAIL  engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F4 full-stack baseline — wing dies, hill and village hold, couriers deliver
AssertionError: expected 'DESTROYED' to be undefined

- Expected:
undefined

+ Received:
"DESTROYED"

 ❯ engine/tests/m4a-gates.test.ts:91:81
     89|       expect(baseline.state().units.find((unit) => unit.id === id)?.en…
     90|     }
     91|     expect(baseline.state().units.find((unit) => unit.id === 'co-d')?.…
       |                                                                                 ^
     92|     expect(baseline.state().units.filter((unit) =>
     93|       scenario.units[unit.unitIndex].kind === 'NONCOMBATANT_CAMP' && u…
```

Exit 1: F4 red; F6 green.

### `npm run build`

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
┌ ○ /                                    76 kB           163 kB
└ ○ /_not-found                          873 B          88.3 kB
+ First Load JS shared by all            87.4 kB
  ├ chunks/117-91cdea3069596308.js       31.8 kB
  ├ chunks/fd9d1056-e3d373074663785d.js  53.6 kB
  └ other shared chunks (total)          1.92 kB

○  (Static)  prerendered as static content
```

Exit 0.

## Composite audit

Both baseline-seed figures are seed `18760625` on the unchanged scenario
content stream `ba288f09`.

| Instrument | Before | After | Change |
|---|---:|---:|---:|
| Baseline-seed composite | 55.71% | 58.48% | +2.77 pp |
| Envelope median, N=50 | 52.07% | 52.07% | 0.00 pp |
| Envelope mean, N=50 | 52.71% | 54.40% | +1.69 pp |

After baseline-seed components:

```text
[score] scenario=little-bighorn-1876 seed=18760625 variants=baseline tier=baseline
[score] composite=58.48% gates=FAIL
[score] C1=50.00% FAIL
[score] C2=77.78% FAIL
[score] C3=30.77% FAIL
[score] C4=92.31% PASS
```

`npm run envelope` generated all 50 outcomes and wrote the diagnostic report,
then exited 1 because the frozen typical-seed criteria again selected no member.
Its ordering evidence remained criteria SHA-256
`507e4d1c1fb8dc1adfc63dbc819b448d47ae36b5602cd7f93c923f67c577f9ad`
before generation.

## Four preserved probes

All four were run from repo root against the newly built `dist/`; all exited 0.

### `.claude/h1-probe.mjs`

- seed `18760603`, scenario hash `ba288f09`;
- max tabled contact mass within 500 m of Reno: 985 available warriors at
  minute 720;
- 18 Reno/warrior engagement pairs opened;
- Reno A/G/M remained STEADY throughout the 660–790 valley window;
- terminal valley-window losses shown by the probe at minute 790:
  A 1K/0W, G 2K/0W, M 6K/2W.

### `.claude/h1-diag.mjs`

- the three inspected D91 bands were active against co-g at minute 720;
- the probe's preserved hypothetical midpoint was finite terrain
  (`cost=0.699999988079071`, cover kind 2);
- Cheyenne/LWM were outside the camp radius; Oglala was inside but not active
  at that sampled moment.

### `.claude/h1-diag2.mjs`

```text
| band | tick | minute | clock | camp | threat | goal lat,lon | path result | reason |
|---|---:|---:|---|---|---|---|---|---|
| minneconjou-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
| sans-arc-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
| blackfeet-santee-pool | 1204 | 602 | 13:02 | hunkpapa-camp | co-a | 45.50749, -107.38956 | reachable | — |
```

### `.claude/h1-diag3.mjs`

The preserved static terrain probe still identifies the historical blocked
midpoint at local `(8110,9690)` as movement factor 0, cover kind 254, elevation
951.7466492949291 m. This probe is intentionally a terrain-cell diagnostic,
not a statement that D93/D96 selected that point.

## PR-1–PR-8 verdicts

All distributions use seeds 18760600–18760649, N=50.

### PR-1 — MISS

Complete wing destruction occurs in **17/50**, not more than 25/50.

Completion-minute distribution among the 17 completed seeds:

| Min | P25 | Median | P75 | Max | Mean |
|---:|---:|---:|---:|---:|---:|
| 653.5 | 697.5 | 697.5 | 859.5 | 862.0 | 765.29 |

The timing direction is earlier than the 858-minute baseline, but the frequency
criterion misses. Nine completed seeds are earlier than 858; zero land in the
historical 825–840 window. No response candidate was implemented.

### PR-2 — HIT

The Reno A/G/M hilltop hold survives in **50/50** seeds using the existing
250 m C3 operational check; none of A/G/M is destroyed at the terminal check.

### PR-3 — MISS

A/G/M reach BROKEN or ROUTED during the minute 660–790 valley window in
**0/50** seeds:

| Unit | Seeds BROKEN/ROUTED |
|---|---:|
| co-a | 0 |
| co-g | 0 |
| co-m | 0 |

Ford-choke composition is empty in **50/50** seeds. As D96 recorded in advance,
Reno's cohesion never degrades enough to enable its closing trigger; the
finding remains in the suppression/cohesion half. The mechanism does close on
other degraded committed threats: minneconjou, sans-arc, and
blackfeet-santee each enter held CHARGE in 46/50 seeds, confirming that the
implemented transition is live rather than dead code.

### PR-4 — MISS LOW

Reno means A/G/M combined.

| Metric | Min | P25 | Median | P75 | Max | Mean | Seeds inside 19.24–26.09 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Killed | 0 | 9.25 | 11 | 14 | 23 | 10.78 | 1/50 |
| Wounded | 0 | 1 | 2 | 4 | 6 | 2.36 | 0/50 |

The killed median remains below the sourced band. Nothing was tuned upward.

### PR-5 — HIT; stop not triggered

Reno killed exceeds 26.09 in **0/50** seeds, below the stop threshold of more
than 5/50. Maximum Reno killed is 23. No tuning occurred.

### PR-6 — MISS

Coalition casualty distributions against sourced bands K 31–300 and W 100–200:

| Metric | Min | P25 | Median | P75 | Max | Mean | Seeds inside band |
|---|---:|---:|---:|---:|---:|---:|---:|
| Killed | 18 | 27 | 31 | 66.75 | 90 | 44.62 | 26/50 |
| Wounded | 54 | 70 | 85.5 | 183 | 237 | 118.56 | 14/50 |

Both bands hold simultaneously in **14/50** seeds, not a great majority.

### PR-7 — HIT

The participant-scaled F6 ceiling is exceeded in **0/50** seeds (0%, below
5%).

| Metric | Min | P25 | Median | P75 | Max | Mean |
|---|---:|---:|---:|---:|---:|---:|
| Max available warrior mass within 500 m of Reno | 958 | 981.25 | 989 | 994.75 | 1045 | 990.88 |
| Expanded nodes | 5,445,145 | 11,713,720.75 | 12,052,804 | 12,061,344 | 13,560,030 | 11,293,902.48 |
| `findPath` calls | 162 | 177 | 191.5 | 218.25 | 525 | 228.14 |

Ceiling: 23,938,256. The baseline-seed deterministic measurement is 11,938,067
expanded nodes, 205 calls, and 1 scratch allocation.

### PR-8 — observation only

co-d terminal end state:

| End state | Seeds |
|---|---:|
| DESTROYED | 9/50 |
| Survives | 41/50 |

No directional verdict is assigned.

## Protected-content audit

- `docs/PREDICTIONS.md` SHA-256 before/after:
  `F9ADCF88907A63857C0FD8D09551FB786B70F1B9FDEFA93229C87E9E6E614E7D`.
- Scenario JSON SHA-256 before/after:
  `E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8`.
- Engine scenario-content FNV-1a before/after: `ba288f09`.
- `engine/src/state.ts` Git blob before/after:
  `b70e51eb03adf79109caa682398919985201fea8`; the protected location was
  untouched.
- Canonical `[CAL]` source blobs are unchanged:
  - `engine/src/combat-config.ts`:
    `729d481fb437910cda45cc5c33e637e945fdcbf9`
  - `engine/src/spotting.ts`:
    `8c889c2adec0f345c73bf2e7e65b1afbe9614654`
  - `engine/src/movement.ts`:
    `c4550a476e51e70abe6dddb9ead9b35f42fac508`
  - scenario JSON Git blob:
    `11db18bd727ae93a4460b146a7300b3f34909241`
- Preserved STOP report `codex-report-wo-d93.md` SHA-256:
  `294BFD800AD576CC4E374BFEB437EEF5B52C962335A03E59033209018C935698`.
- Both WO-D91 reports remain byte-identical:
  `D96D17F00ABE022129FE1843C72AB0AA4929905D1FDFB78DADB89F97880BA103`
  and
  `D34CBD050D11454634CE6F19F9DE8E61298C004F421D5DC60BEE64A2BE73BBEF`.

`git diff --check` reports no whitespace error; only the repository's Windows
LF→CRLF advisory.

## AMBIGUITIES

None. D96 supplied every value and rule needed for D95. Combat-entity
eligibility supplies the noncombatant-camp exclusion at the engagement seam;
no new behavioral number was introduced.

## DEVIATIONS

- F4 remains red because co-d is destroyed on the baseline seed. This is
  reported rather than weakened or tuned; PR-8 registered the observation
  without a directional prediction.
- `npm run envelope` exits 1 after writing `reports/seed-envelope.md` because
  the frozen typical-seed criteria select no seed. This is the known diagnostic
  outcome stated in the work order, not an implementation failure.
- PR-1, PR-3, PR-4, and PR-6 miss. No pre-committed response candidate was
  implemented and no result-driven tuning occurred.
- No other deviation.
