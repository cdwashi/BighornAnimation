# WO-D97 no-crossing camp defence, scout exclusion — PR-5 STOP

Execution date: 2026-07-26  
Starting HEAD: `c472de494a885c5453a4323fa454bfcd9ed7ca8f`  
Baseline seed: `18760625`  
Scenario-content stream: `ba288f09` before and after  
Status: **STOPPED; no commit or push**

## Summary

D98 and D99 were implemented in the working tree, but the frozen PR-5 stop
triggered during the registered N=50 audit. The first seven completed registered
seeds all put Reno A/G/M killed above 26.09:

| Seed | Reno A/G/M killed |
|---:|---:|
| 18760600 | 110 |
| 18760601 | 112 |
| 18760602 | 114 |
| 18760603 | 108 |
| 18760604 | 110 |
| 18760605 | 110 |
| 18760606 | 116 |

That is already **7/50**, so PR-5's “more than 5/50” threshold is
mathematically met even if every unrun seed were safe. Both active N=50 runs
were terminated immediately. Nothing was tuned or changed after observing the
sixth overshoot. The remaining proof was not continued.

The implementation is left uncommitted for adjudication:

1. the terrain loader reads all 298 points directly from
   `docs/o4-corrections-data.json`, projects them at load, and classifies bank
   side with the frozen probe's nearest-segment cross-product convention;
2. camp-defence feature points, feature paths, and D96 target-following paths
   are restricted to the defended camp's bank;
3. an on-channel point is neither bank and is ineligible/blocked;
4. a band starting away from its camp bank may path home;
5. a held CHARGE whose target crosses away remains held but receives no
   cross-river path; order pursuit uses no camp blocker;
6. camp threats whose source tactics profile is `irregular-scout` are excluded,
   including validation of an already-held commitment.

No `[CAL]` value, scenario byte, `state.ts:241`, prediction, or prior report was
changed.

## Implementation

### D98 — camp defence does not cross the river

`TerrainMovementLoader` now loads the authoritative corrections document in
both Node and browser paths. The app asset preparation copies that existing
document beside the terrain manifest; no channel or bank value was added to
scenario JSON.

The classifier mirrors `.claude/d98-crossing-test.mjs`:

- the channel is ordered south-to-north;
- the nearest polyline segment supplies the cross product;
- positive is west, negative is east, and exact zero is on-channel;
- exact grid-cell results are memoized as a representation optimization.

Camp feature selection retains only points on the defended camp's side before
applying D92's nearest-to-threat selection. Camp-only A* calls receive a side
blocker. Identical constrained path requests are cached within one simulation;
the final single-run work measurement was 17,174,914 expanded nodes, below
D94's participant-scaled ceiling of 23,938,256.

Order paths are untouched. The blocker exists only while
`unit.campDefense` is present.

### D99 — scout exclusion

Camp-threat eligibility now rejects source units whose `tacticsProfileId` is
`irregular-scout`. The predicate is profile-scoped, not unit-kind-scoped. It is
used both for new spotted candidates and for validation of an existing
commitment, so a loaded/held scout commitment switches to an eligible
alternative or releases.

## New tests named

- `D98 confines feature goals and held closing paths to the defended camp side while order paths still cross`
- `D99 excludes irregular-scout profiles from camp-threat eligibility regardless of unit kind`

The existing D92 terrain-derivation gate also gained assertions that
`hunkpapa-camp` and the D90 Bench classify west.

The focused D91/D99 file passed **8/8** before the PR-5 audit. The final
path-cache-only revision was not rerun after the STOP.

## Quartet — STOP-limited record

There is no final-tree quartet: PR-5 halted execution before it could be
repeated after the final route-preserving cache revision. The following
commands ran earlier in the round and are recorded verbatim, but are not
represented as final-tree proof.

### `npm run typecheck`

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit 0. A later direct `npx tsc --noEmit` also exited 0 on the final source
revision before PR-5 triggered.

### `npm run lint`

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit 0 before the final cache revision; not rerun after STOP.

### `npm test`

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false

Test Files  1 failed | 13 passed (14)
     Tests  2 failed | 82 passed (84)
```

That intermediate run failed only stale F1/F6 state pins before their
intentional D98 oracle update. Subsequent affected-file runs established the
new state and work oracles, but the final full suite was not run after STOP.
No final pass count is asserted.

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

Exit 0 before the final cache revision; not rerun after STOP.

## Composite audit — incomplete by required STOP

The dispatch baselines were:

| Instrument | Before | After |
|---|---:|---:|
| Baseline seed 18760625 composite | 58.48% | not run — STOP |
| Envelope median, N=50 | 52.07% | not completed — STOP |
| Envelope mean, N=50 | 54.40% | not completed — STOP |

The stopped envelope completed 15 registered seeds, 18760600–18760614:
partial median **46.30%**, partial mean **47.84%**, range
**36.05%–57.41%**. These are reported only as partial data and are not an
envelope-to-envelope verdict.

`npm run envelope` was terminated before report emission because PR-5 had
already triggered. Its usual known exit-1 finding was therefore not reached.

## Preserved probes — STOP-limited record

The four `h1-*` probes and the cohesion-asymmetry probe all exited 0 against an
intermediate built revision. A later path representation was rejected because
it changed outcomes; those five probes were not rerun after the final
route-preserving revision because PR-5 halted work. Their output is not claimed
as final-tree proof.

The D98 crossing probe was run on both required seeds after adopting the exact
nearest-segment classifier:

- seed `18760643`: **zero camp-defence crossings**;
- seed `18760625`: **zero camp-defence crossings**;
- order-driven crossings remained present for `gall-calhoun`, `ch-strike`, and
  `lwm-charge`.

The final revision changed only constrained-path memoization after those
crossing runs, but the probes were not rerun after STOP; this is disclosed
rather than promoted to final proof.

## PR-9–PR-13 verdicts

No PR-9–PR-13 verdict is assigned. The binding judging method is N=50, and
PR-5 stopped the audit after seven detailed seeds and fifteen score-envelope
seeds.

| Prediction / observation | Verdict | Available data |
|---|---|---|
| PR-9 first-casualty ordering | NOT JUDGED | N=50 audit stopped before summary emission |
| PR-10 completions before 800 | NOT JUDGED | N=50 audit stopped before summary emission |
| PR-11 completion count/minute | NOT JUDGED | N=50 audit stopped before summary emission |
| PR-12 coalition wounded / both bands | NOT JUDGED | N=50 audit stopped before summary emission |
| PR-13 scout commitments | NOT JUDGED | focused profile-scoping test passed; distribution incomplete |
| Registered P3 count | NOT JUDGED | distribution incomplete |
| Registered destruction count | NOT JUDGED | distribution incomplete |
| Registered both-bands count | NOT JUDGED | distribution incomplete |
| PR-5 Reno overshoot stop | **TRIGGERED** | 7/50 registered seeds already over 26.09; partial min 108, median 110, max 116, mean 111.43 |

No pre-committed response was implemented.

## Protected-content audit

- Scenario-content FNV-1a: `ba288f09`, unchanged.
- Scenario JSON SHA-256:
  `E7CFF7774B2CB6CD0108BEEFD93EFBD00A9A5C4A7BD360F7ABB4A972B140B2F8`.
- Scenario JSON Git blob:
  `11db18bd727ae93a4460b146a7300b3f34909241`.
- `docs/PREDICTIONS.md` SHA-256:
  `4A27D1DCE891281513BE2FBCCE535A307050FE407139DA5EEBC45A8110083ABF`.
- `docs/o4-corrections-data.json` SHA-256:
  `FDD389B5DA261488F045F3A53B1EEA0924FE1F6E65CE89572A1BAC5B47A5D4DA`.
- `engine/src/state.ts` Git blob:
  `b70e51eb03adf79109caa682398919985201fea8`; `state.ts:241` was untouched.
- Canonical `[CAL]` source blobs are byte-identical:
  - `engine/src/combat-config.ts`:
    `729d481fb437910cda45cc5c33e637e945fdcbf9`
  - `engine/src/spotting.ts`:
    `8c889c2adec0f345c73bf2e7e65b1afbe9614654`
  - `engine/src/movement.ts`:
    `c4550a476e51e70abe6dddb9ead9b35f42fac508`
  - scenario JSON:
    `11db18bd727ae93a4460b146a7300b3f34909241`

`docs/PREDICTIONS.md`, all prior codex reports, and all scenario data have zero
diff. `git diff --check` reported no whitespace error before the STOP.

## AMBIGUITIES

No unresolved `TODO-AMBIGUOUS` was required.

- Representation: the work order expressly allowed a runtime polyline test; the
  implementation projects the authoritative points at load and uses the frozen
  probe's nearest-segment convention.
- On-channel/ford treatment: on-channel is neither camp side, so it cannot be a
  feature goal or a camp-defence path cell. This follows “confined to the
  defended camp's side.”
- Held CHARGE target crossing away: D92 keeps the commitment and D98 denies the
  path. The unit therefore holds CHARGE blocked at its bank until an existing
  release/switch condition applies; no new release rule was invented.
- Coming home: the blocker is disabled while the band itself is away from the
  defended side, implementing the explicit “always permitted” clause.

## DEVIATIONS

- **Mandatory PR-5 STOP:** Reno killed was 108–116 in each of the first seven
  registered seeds. This is the controlling deviation.
- The final quartet, baseline-seed after score, full N=50 envelope, final probe
  rerun, PR-9–PR-13 distributions, and registered P3/destruction/both-bands
  counts are absent because continuing after the sixth overshoot would violate
  the frozen work order.
- The stopped envelope produced only N=15 partial composite data; it is not
  substituted for N=50.
- Intermediate probe/quartet outputs invalidated by later implementation
  refinement are disclosed but not claimed as final proof.
- No tuning, calibration, weakening of a red, commit, or push occurred.
