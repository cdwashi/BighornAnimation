# WO-D128 GATE-REPAIR execution report

Execution date: 2026-08-06  
Starting HEAD: `3b51da5c13bb6ed4738f55bead1acacbb07726b2`  
Work order: `docs/WO-D128.md`  
Disposition: payload complete; no commit or push performed

## Outcome

WO-D128's single claim, **the BOM/CRLF gate works**, satisfies the frozen exit
criterion. The repaired suite vehicle returned a green verdict inside the full serial
suite; the pre-payload ENOBUFS assertion red is absent. All 22 files and all 120
assertions passed. The sole process-surface red was the enumerated pre-existing
`[vitest-worker]: Timeout calling "onTaskUpdate"`; it did not rob
`repository-text-integrity` of a verdict, so the no-verdict rerun rule did not trigger.

The reference oracle self-check passed on B7, every repaired vehicle reproduced REF
cell-for-cell, and the B5 keystone returned `FAIL(CR)` in both repaired blob vehicles.
Live agreement is zero index offenses across 445 filtered tracked blobs and exactly the
two allowlisted BOM-only messages across 219 reachable commits. Both hooks' self-tests
passed. The scenario content hash remains `68325eff`.

## T1 route declaration

The implemented route is one long-lived `git cat-file --batch` child. The test obtains
the filtered index set with `git ls-files --stage -z`, sends each stage-0 blob OID to
that one batch child, and consumes stdout incrementally with a three-state
header/content/delimiter scanner. It retains only the batch header, the first three blob
bytes, the current remaining-byte count, and a CR-found boolean. It never buffers a blob
and its memory use is bounded independently of the largest blob size. Git failures,
unmerged index entries, malformed/incomplete batch output, shallow history, and absent
allowlisted history all fail loudly. The existing filter and 120 s test budget are
preserved.

At test start, `D110_GATE_REPO_ROOT` is read as the optional repository-root override;
without it, the test defaults to the existing `git rev-parse --show-toplevel` route.
Matrix acceptance used this command:

```text
$env:D110_GATE_REPO_ROOT = Join-Path $env:TEMP 'gate-repair-matrix-repo'
npx vitest run tests/repository-text-integrity.test.ts --fileParallelism=false
```

That command ran the **test itself** against the deterministic probe repository. It did
not reproduce the predicate in an acceptance replica.

The controlled matrix run's red surface differs from §4's live-suite enumeration by
design and is reported, not reconciled: it had one expected failed assertion containing
the seven REF offenses plus two loud partial-history diagnostics because the throwaway
repo does not contain the live allowlist commits. It had no process red and no ENOBUFS.

## Matrix reproduction

`—` means the vehicle does not carry that subject class. Suite verdicts come from the
root-overridden Vitest vehicle; clean cells are those absent from its complete offense
array. Pre-commit results come from the real project hook invoked by the deterministic
matrix probe. Commit-msg results come from real `git commit` commands with the temp
repo's `core.hooksPath` pointed at the project hooks.

| Cell | REF | Repaired suite test | Repaired pre-commit | New commit-msg |
|---|---|---|---|---|
| B1 clean small | PASS | PASS | PASS | — |
| B2 BOM at 0, small | FAIL(BOM) | FAIL(BOM) | FAIL(BOM) | — |
| B3 CR, small | FAIL(CR) | FAIL(CR) | FAIL(CR) | — |
| B4 clean, 1,572,864 B | PASS | PASS | PASS | — |
| **B5 CR past 1 MiB, 1,258,325 B** | **FAIL(CR)** | **FAIL(CR)** | **FAIL(CR)** | — |
| B6 BOM at 0, 1,258,307 B | FAIL(BOM) | FAIL(BOM) | FAIL(BOM) | — |
| **B7 BOM not at 0, oracle self-check** | **PASS** | **PASS** | **PASS** | — |
| M1 clean, default cleanup | PASS | PASS | — | PASS |
| M2 BOM at 0, default cleanup | FAIL(BOM) | FAIL(BOM) | — | FAIL(BOM) |
| M3 CRLF, default cleanup | PASS | PASS | — | PASS |
| M4 CRLF, verbatim cleanup | FAIL(CR) | FAIL(CR) | — | FAIL(CR) |
| M5 interior CR, default cleanup | FAIL(CR) | FAIL(CR) | — | FAIL(CR) |

B7 establishes that the frozen BOM oracle is offset-true rather than
over-triggering. B5 explicitly establishes that both repaired blob vehicles see a CR
past the former 1 MiB failure boundary.

### Pre-commit matrix/self-test transcript

```text
=== BLOB CELLS (staged in temp index) ===
cell | description | OLD (current gate mechanism) | REF (git-native oracle) | HOOK (pre-commit, real file)
B1 | clean small blob | PASS | PASS | PASS
B2 | BOM at offset 0, small | FAIL(BOM) | FAIL(BOM) | FAIL(BOM)
B3 | CR bytes, small | FAIL(CR) | FAIL(CR) | FAIL(CR)
B4 | clean blob 1572864 B (> 1 MiB default maxBuffer) | ERROR(ENOBUFS) | PASS | PASS
B5 | CR located PAST the 1 MiB boundary (1258325 B) | ERROR(ENOBUFS) | FAIL(CR) | FAIL(CR)
B6 | BOM at offset 0, blob 1258307 B > 1 MiB | ERROR(ENOBUFS) | FAIL(BOM) | FAIL(BOM)
B7 | BOM bytes NOT at offset 0 (false-positive control) | PASS | PASS | PASS
hook exit status over the staged set: 1 (non-zero = rejected commit, expected)
```

### Root-overridden suite-vehicle offense array

```text
AssertionError: D110 tracked-text and commit-message gate offenses: expected [ …(9) ] to deeply equal []
- Expected
+ Received
- []
+ [
+   "b2-bom.md: UTF-8 BOM at offset 0",
+   "b3-cr.md: CR byte present",
+   "b5-big-cr-past-1mib.txt: CR byte present",
+   "b6-big-bom.txt: UTF-8 BOM at offset 0",
+   "77e180f68d2c8cb30891f54ddd454fc858ba17b4: commit message CR byte present",
+   "665745ad123ac57f49efd40759b7f5cd4d12ccc5: commit message CR byte present",
+   "355df13b21c6d86950c504886dee09525405cfbb: commit message UTF-8 BOM at offset 0",
+   "D110 commit-message gate requires complete history: allowlisted commit absent from reachable history:
94b404528ac0c88eae796a534ee1515e47219ec2",
+   "D110 commit-message gate requires complete history: allowlisted commit absent from reachable history:
8759dd06311281951c8ea7089a5f05a7daf1e6fe",
+ ]
```

The dynamic M-cell hashes map in probe order as follows: M2 `355df13b…`, M4
`665745ad…`, M5 `77e180f6…`. M1, M3, B1, B4, and B7 are absent from the complete
offense array, so the suite vehicle returns PASS for those controls. There is no
ENOBUFS entry.

### Commit-msg matrix/self-test transcript

```text
=== M1 commit-msg vehicle ===
[master 8b182f4] M1 clean subject
exit status: 0
=== M2 commit-msg vehicle ===
D128 commit-msg gate: UTF-8 BOM at offset 0
exit status: 1
=== M3 commit-msg vehicle ===
[master b3b601c] M3 crlf subject
exit status: 0
=== M4 commit-msg vehicle ===
D128 commit-msg gate: CR byte present
exit status: 1
=== M5 commit-msg vehicle ===
D128 commit-msg gate: CR byte present
exit status: 1
```

This transcript includes the required clean acceptance, BOM rejection, and interior-CR
rejection. M3 also proves that Git's default cleanup removes its EOL CRs before the hook,
while M4 proves verbatim-preserved EOL CRs are rejected.

## Live repository agreement

The independent reference side used the frozen mappings: BOM from
`git show :path | od -An -tx1 -N3`, CR paths from
`git grep -I --cached -P '\r'`, and message bytes from
`git log -1 --format=%B <sha> | od -An -v -tx1`. Its transcript was:

```text
tracked text blobs: 445
index BOM offenses: 0
index CR offenses: 0
history shallow: false
commits scanned: 219
MESSAGE 94b404528ac0c88eae796a534ee1515e47219ec2 [BOM]
MESSAGE 8759dd06311281951c8ea7089a5f05a7daf1e6fe [BOM]
message offenses: 2
```

The repaired suite vehicle consumed the same live index and reachable history and passed
inside the full suite. Its exact allowlist-integrity rule requires each allowed hash to
be reachable and to contain BOM-at-offset-0 with no CR; because the full assertion is
green, both allowlist-integrity checks are green. The independent transcript agrees:
both hashes are present and BOM-only, with no third message offense.

## Fail-loud-no-git

The actual Vitest vehicle was run with an explicit live root and an empty `PATH`, using
the absolute Node executable. It failed, never skipped or passed:

```text
❯ tests/repository-text-integrity.test.ts (1 test | 1 failed) 22ms
  × D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from the tracked index and commit history 20ms
    → D110 tracked-text index gate requires Git repository access: spawnSync git ENOENT

Test Files  1 failed (1)
     Tests  1 failed (1)
```

## Quartet (verbatim)

### Typecheck

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit
```

Exit status: 0.

### Lint

```text
> bighorn-animation@0.1.0 lint
> eslint .
```

Exit status: 0.

### Test — both surfaces preserved verbatim

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

 ✓ tests/repository-text-integrity.test.ts (1 test) 25057ms
   ✓ D110 tracked-text index gate > rejects UTF-8 BOM and CR bytes from the tracked index and commit history  25055ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"sameB":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"},"different":{"1":"7537c54d","360":"f70e486f","1080":"a6b9ac53","2160":"dd71a1f0"}}

 ✓ engine/tests/gates.test.ts (6 tests) 87208ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table  19367ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs  39715ms
stdout | engine/tests/m4a-gates.test.ts > M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational
[gate] F6 median=18024.9ms timings=17967.6,18024.9,21346.0 pathfind={"calls":140,"expandedNodes":13839389,"scratchAllocations":1,"heapGrowths":3}

 ✓ engine/tests/m4a-gates.test.ts (6 tests) 114605ms
   ✓ M4-A F1-F6 closeout gates > F1 seed flip — identical same-seed run; different seeds flip only at first contact  40237ms
   ✓ M4-A F1-F6 closeout gates > F3 no-combat regression — legacy seeds remain byte-identical with zero draws  16422ms
   ✓ M4-A F1-F6 closeout gates > F6 pooled-A* work metrics are bounded; wall clock is informational  36185ms
stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG
[gate] V1 PASS same/different seeds identical; rng.draws=0

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V2 C4 exam — one global table reproduces at least 80% of gateable events
[gate] V2 PASS 12/14 (85.7%)

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V3 Knowledge invariant — never-spotted enemies are absent from belief and serialization
[gate] V3 PASS no never-spotted target ids in belief or serialized belief

stdout | engine/tests/m3a-gates.test.ts > M3-A exit gates > V7 E5 stability — checkpoint table is identical to the D53a 083e7f2c baseline
[gate] V7 PASS E5 table diff=none

 ✓ engine/tests/m3a-gates.test.ts (6 tests) 78545ms
   ✓ M3-A exit gates > V1 Determinism — same-seed and different-seed full-day states are identical; spotting consumes no RNG  374ms
   ✓ M3-A exit gates > D55 cache equivalence — full-day run with spotting memoization disabled is bit-identical to the cached run  52388ms
stdout | tests/m3b-gates.test.ts > M3-B exit gates > V4 performance — 30 m viewshed and full-day spotting stay within generous CI ceilings
[gate] V4 viewshed=139.22ms baseline=5475.46ms sweep=5664.43ms spottingOverhead=10.07%

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V5 ray parity — 200 deterministic random pairs exactly match engine transmittance verdicts
[gate] V5 PASS exact=200/200

stdout | tests/m3b-gates.test.ts > M3-B exit gates > V6 decision index — orders plus camp activations and M4-B leader deaths
[gate] V6 PASS entries=29 orders=26 activations=3 leaderDeaths=0

 ✓ tests/m3b-gates.test.ts (3 tests) 58510ms
 ✓ engine/tests/d91-gates.test.ts (12 tests) 21928ms
   ✓ D91/D92 camp-defence reconstruction gates > D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick  21586ms
 ✓ engine/tests/d110-pins.test.ts (4 tests) 10680ms
   ✓ D110 pre-break pins > pin (c) — every engine-consumed landmark id is referenced by committed data  10445ms
 ✓ engine/tests/d108-lip.test.ts (5 tests) 429ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 251ms
stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 48

 ✓ tests/data-integrity.test.ts (13 tests) 185ms
 ✓ engine/tests/m5a-gates.test.ts (9 tests) 174ms
 ✓ engine/tests/unit.test.ts (3 tests) 120ms
 ✓ engine/tests/d105-bout.test.ts (5 tests) 49ms
 ✓ engine/tests/d107-annihilation.test.ts (5 tests) 34ms
 ✓ tests/m4b-interactions.test.ts (8 tests) 28ms
 ✓ engine/tests/d104-rout.test.ts (4 tests) 30ms
 ✓ engine/tests/d106-pursuit-gate.test.ts (4 tests) 26ms
 ✓ engine/tests/d102-frontage.test.ts (4 tests) 23ms
 ✓ tests/m3d-interactions.test.ts (5 tests) 23ms
 ✓ engine/tests/variants.test.ts (3 tests) 18ms
 ✓ tests/m3c-interactions.test.ts (7 tests) 8ms
 ✓ tests/m4c-interactions.test.ts (2 tests) 7ms
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


 Test Files  22 passed (22)
      Tests  120 passed (120)
     Errors  1 error
   Start at  14:53:20
   Duration  410.63s (transform 959ms, setup 0ms, collect 2.80s, tests 397.94s, environment 6ms, prepare 3.43s)
```

Command exit status: 1, caused solely by the enumerated process-surface timeout.

Assertion surface: **GREEN** — 22/22 files and 120/120 assertions passed;
`repository-text-integrity` returned PASS in 25.055 s; ENOBUFS is absent.

Process surface: exactly one red,
`[vitest-worker]: Timeout calling "onTaskUpdate"`, classified by WO-D128 §4 as
EXPECTED-PRE-EXISTING. It did not prevent the gate test from returning a verdict. Its
presence is not credited to the payload and its absence was not required; no full-suite
rerun was authorized by the no-verdict rule.

### Build

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

Exit status: 0.

## T4 exact diff

`scripts/hooks/pre-commit` has exactly this one-line replacement and no other diff:

```diff
-  if grep "$(printf '\r')" "$blob_file" >/dev/null 2>&1; then
+  if od -An -v -t x1 "$blob_file" | tr ' ' '\n' | grep -q '^0d$'; then
```

The BOM leg and every other pre-commit line are unchanged.

## Untouched-byte declaration

No scenario, engine source, RNG, schema, reseed, or other out-of-scope payload byte was
changed. The built engine's `hashScenario` returned:

```text
scenario content hash: 68325eff
scenario diff bytes:
scenario index/worktree blob ids:
6fc4fd51077cceb026123a04ebe13f114dbae142
6fc4fd51077cceb026123a04ebe13f114dbae142
```

Every stream-tagged figure under `68325eff` therefore remains valid.

## Files touched

Exactly the four work-order paths are present in the final working tree:

- `tests/repository-text-integrity.test.ts` — T1/T2
- `scripts/hooks/commit-msg` — T3, new
- `scripts/hooks/pre-commit` — T4, one line
- `codex-report-wo-d128.md` — this report

Nothing is staged. No commit or push was performed. The temporary matrix repository and
transcripts were created only under the OS temp directory; the temporary oracle script
was deleted after use.

## AMBIGUITIES

None. No `TODO-AMBIGUOUS` implementation choice was required. The matrix repo's expected
partial-history diagnostics are explicitly reported under the T1 declaration rather
than silently treated as matrix cells.

## Deviations

- The first commit-msg transcript was semantically complete, but Windows PowerShell
  rendered native stderr after the per-cell status lines. The unchanged test was repeated
  through `cmd.exe` solely to preserve ordered verbatim output.
- An attempted Git-`sh` function wrapper for that repeat had a quoting syntax error
  before any hook ran. It produced no vehicle verdict and was replaced by the direct
  `cmd.exe` invocations above.
- Two inline PowerShell-to-`sh -c` transports for the live oracle lost shell structure
  (one split multiline arguments; one converted environment newlines to spaces). Both
  failed at shell parsing before an oracle command returned a verdict.
- The first temporary-file oracle wrapper added `pipefail`, which treated the frozen
  `git show | od -N3` oracle's intentional early close as upstream SIGPIPE and exited 10
  before a verdict. The extra wrapper option was removed; the frozen oracle command was
  not changed.
- The first correctly transported live-oracle run exceeded the wrapper's 180 s timeout
  before aggregate output. The identical oracle script completed under a 15-minute
  ceiling in 320.2 s and produced the live agreement transcript above.
- Git printed advisory warnings during diff inspection that LF would be converted to
  CRLF if Git later rewrites two working-copy files. No such rewrite occurred; the index
  oracle remained zero-CR, the working-tree diff remained restricted to the authorized
  paths, and the hook predicates were exercised against staged/temp-repo bytes.
- The full-suite command exited 1 solely for the enumerated pre-existing worker RPC
  timeout. This is retained verbatim and classified separately above; the assertion
  surface was fully green and the gate verdict was conclusive.

No payload edit occurred after the first acceptance result. No divergence was tuned
toward the target.
