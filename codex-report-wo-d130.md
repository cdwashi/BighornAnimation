# WO-D130 PIN (e) + FILTER-POPULATION RIDER execution report

Execution date: 2026-08-06  
Starting HEAD: `03f87d6df2004832ac801ead8b3035660143ab06`  
Work order: `docs/WO-D130.md`  
Disposition: acceptance complete; no commit or push performed

## Outcome

### Claim 1 — pin (e)

GREEN. The new pin walks the committed scenario with the broad predicate: every object
whose own `confidence` is exactly `DISPUTED`, regardless of the object's key. It then
classifies those paths against the five frozen gated prefixes and asserts this exact set:

```text
calibration.sideCasualties.lakota-cheyenne-coalition.killed.provenance
```

The assertion names pin (e) and the D125 row. It passed inside the full suite, whose
assertion count rose from the D129 reference world's 120 to 121 without any existing
assertion changing.

### Claim 2 — filter-population rider

GREEN. Both population predicates now include every `scripts/hooks/` path. B8, an
extensionless BOM-bearing synthetic hook at
`scripts/hooks/b8-synthetic-hook`, returned `FAIL(BOM)` under both required vehicles:
the actual root-overridden Vitest suite test and the real `scripts/hooks/pre-commit`.
Every D128 B1–B7 and M1–M5 verdict was unchanged.

The live-index gate passed. Under the exact Node `extname` predicate, acceptance-time
HEAD has 459 tracked text blobs under the extended filter. The former filter has 458;
the delta is exactly one path:

```text
scripts/hooks/commit-msg
```

WO-D130 §1's 455 → 456 figure reproduces exactly at its measurement commit `e5d4716`.
The acceptance-time 458 → 459 population drift is disclosed under Deviations.

## Acceptance surfaces

Assertion surface: GREEN — the full `npm test` run passed 22/22 test files and 121/121
assertions, including pin (e) and the live repository text-integrity gate. The
root-overridden matrix run had exactly its constructed red surface: B2, B3, B5, B6,
B8, M2, M4, M5, and the two D128 loud partial-history diagnostics. It contained no
ENOBUFS entry.

Process surface: GREEN/EMPTY — `npm test` exited 0. The complete transcript contains
zero occurrences of `onTaskUpdate`, `vitest-worker`, `Unhandled`/`unhandled`,
`RPC`/`rpc`, or `Error`/`error`. No new RPC-family member fired.

## Pin (e) inside the suite

The full-suite transcript was:

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false --exclude "**/dist/**"


 RUN  v4.1.10 C:/Users/cdwas/Documents/Programming/BighornAnimation


 Test Files  22 passed (22)
      Tests  121 passed (121)
   Start at  19:03:54
   Duration  354.42s (transform 973ms, setup 0ms, import 2.76s, tests 344.73s, environment 3ms)
```

Vitest's redirected green default reporter prints only the aggregate. A supplemental
JSON-reporter run of the unchanged `d110-pins` file preserved the named assertion:

```text
PIN_TITLE=pin (e) — gated DISPUTED-confidence membership is exactly the D125 ruled set
PIN_FULL_NAME=D110 pre-break pins pin (e) — gated DISPUTED-confidence membership is exactly the D125 ruled set
PIN_STATUS=passed
PIN_JSON_EXIT=0
```

The supplemental run is naming evidence only; the 22-file, 121-assertion run above is
the required full-suite acceptance surface.

## Matrix reproduction

The probe rebuilt its OS-temp repository from scratch and regenerated
`.claude/gate-repair-matrix-probe.out.txt` using the required `cmd` redirection. `—`
means the vehicle does not carry that subject class. The OLD column is the probe's
direct D128 diagnostic mechanism; repaired-suite verdicts come from the actual test run
with `D110_GATE_REPO_ROOT` pointed at the rebuilt matrix repository.

| Cell | OLD | REF | Repaired suite test | Repaired pre-commit | Commit-msg |
|---|---|---|---|---|---|
| B1 clean small | PASS | PASS | PASS | PASS | — |
| B2 BOM at 0, small | FAIL(BOM) | FAIL(BOM) | FAIL(BOM) | FAIL(BOM) | — |
| B3 CR, small | FAIL(CR) | FAIL(CR) | FAIL(CR) | FAIL(CR) | — |
| B4 clean, 1,572,864 B | ERROR(ENOBUFS) | PASS | PASS | PASS | — |
| **B5 CR past 1 MiB, 1,258,325 B** | **ERROR(ENOBUFS)** | **FAIL(CR)** | **FAIL(CR)** | **FAIL(CR)** | — |
| B6 BOM at 0, 1,258,307 B | ERROR(ENOBUFS) | FAIL(BOM) | FAIL(BOM) | FAIL(BOM) | — |
| **B7 BOM not at 0, oracle control** | **PASS** | **PASS** | **PASS** | **PASS** | — |
| **B8 extensionless `scripts/hooks/` BOM** | **FAIL(BOM)** | **FAIL(BOM)** | **FAIL(BOM)** | **FAIL(BOM)** | — |
| M1 clean, default cleanup | NO-COVERAGE | PASS | PASS | — | PASS |
| M2 BOM at 0, default cleanup | NO-COVERAGE | FAIL(BOM) | FAIL(BOM) | — | FAIL(BOM) |
| M3 CRLF, default cleanup | NO-COVERAGE | PASS | PASS | — | PASS |
| M4 CRLF, verbatim cleanup | NO-COVERAGE | FAIL(CR) | FAIL(CR) | — | FAIL(CR) |
| M5 interior CR, default cleanup | NO-COVERAGE | FAIL(CR) | FAIL(CR) | — | FAIL(CR) |

The B8 lines from the regenerated probe are:

```text
B8 | BOM at offset 0, extensionless scripts/hooks path | FAIL(BOM) | FAIL(BOM) | FAIL(BOM)
hook exit status over the staged set: 1 (non-zero = rejected commit, expected)
```

The root-overridden suite vehicle exited 1 as required and included:

```text
+   "scripts/hooks/b8-synthetic-hook: UTF-8 BOM at offset 0",
```

Its complete received offense array contained the expected B2/B3/B5/B6/B8 and
M2/M4/M5 offenses plus the two expected D128 partial-history diagnostics. B1, B4, B7,
M1, and M3 were absent, and there was no ENOBUFS entry. The real commit-msg vehicle
returned M1 `0`, M2 `1`, M3 `0`, M4 `1`, M5 `1`, preserving all D128 message-cell
verdicts.

## Live-index gate and population

The actual live suite vehicle was also run directly and passed:

```text
 RUN  v4.1.10 C:/Users/cdwas/Documents/Programming/BighornAnimation

 Test Files  1 passed (1)
      Tests  1 passed (1)
   Duration  19.10s (transform 38ms, setup 0ms, import 61ms, tests 18.78s, environment 0ms)

LIVE_GATE_EXIT=0
```

Exact-predicate population census:

| Revision | Former filter | Extended filter | Added by rider |
|---|---:|---:|---|
| `e5d4716` (§1 measurement) | 455 | 456 | `scripts/hooks/commit-msg` |
| `03f87d6` (acceptance HEAD) | 458 | 459 | `scripts/hooks/commit-msg` |

The three eligible files joining between those revisions are
`.claude/pin-e-probe.mjs`, `.claude/pin-e-probe.out.txt`, and `docs/WO-D130.md`.

## Quartet — verbatim

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

### Test — `npm test` — exit 0

```text
> bighorn-animation@0.1.0 test
> vitest run --fileParallelism=false --exclude "**/dist/**"


 RUN  v4.1.10 C:/Users/cdwas/Documents/Programming/BighornAnimation


 Test Files  22 passed (22)
      Tests  121 passed (121)
   Start at  19:03:54
   Duration  354.42s (transform 973ms, setup 0ms, import 2.76s, tests 344.73s, environment 3ms)
```

Assertion surface: GREEN — 22/22 files and 121/121 assertions passed.  
Process surface: GREEN/EMPTY — exit 0, zero unhandled errors, zero exact timeout
occurrences, and zero other RPC-family errors.

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

## Untouched-byte declaration

No scenario, engine source, RNG, schema, manifest, or other out-of-scope payload byte
changed. The scenario file's index and worktree blob IDs are identical:

```text
6fc4fd51077cceb026123a04ebe13f114dbae142
6fc4fd51077cceb026123a04ebe13f114dbae142
```

`git diff --numstat` for the scenario is empty. The built engine's `hashScenario`
returned:

```text
scenario content hash: 68325eff
```

## Files touched

Exactly the six dispatch-authorized paths are present in the final working tree:

- `engine/tests/d110-pins.test.ts` — T1, pin (e)
- `tests/repository-text-integrity.test.ts` — T2(a), suite population
- `scripts/hooks/pre-commit` — T2(b), hook population
- `.claude/gate-repair-matrix-probe.mjs` — T2(c), B8
- `.claude/gate-repair-matrix-probe.out.txt` — required regenerated matrix output
- `codex-report-wo-d130.md` — this report

Nothing is staged. No commit or push was performed. The matrix repository and
supplemental reporter artifacts exist only under the OS temp directory.

## AMBIGUITIES

None in the payload. The broad predicate, gated-prefix classification, B8 shape, and
population extensions were all frozen explicitly.

## Deviations

- WO-D130 §1 froze 455 → 456 from `e5d4716`, but acceptance runs at frozen dispatch
  HEAD `03f87d6`, whose three newly tracked eligible freeze artifacts make the live
  figure 458 → 459. The exact sets were enumerated; no payload or reference set was
  changed in response.
- PowerShell emitted the three expected commit-msg hook diagnostics after the per-cell
  status lines during the M1–M5 reproduction. The exit sequence remained unambiguous:
  `0, 1, 0, 1, 1`; it was recorded without changing or rerunning a vehicle.
- The first supplemental named-pin reporter command exited 0 but its `cmd` transport
  produced only the aggregate and did not create the requested JSON file. The unchanged
  pin suite was rerun by direct PowerShell argument transport; it exited 0 and produced
  the named `PIN_STATUS=passed` record. No payload edit followed any acceptance result.
