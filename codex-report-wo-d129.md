# WO-D129 HARNESS-REPAIR execution report

Execution date: 2026-08-06  
Starting HEAD: `77c81d7a93fc839f38b232d60f0cb6ac3f6eaf4a`  
Work order: `docs/WO-D129.md`  
Disposition: acceptance complete; no commit or push performed

## Outcome

WO-D129 reproduces the measured reference world. The payload run and all three
confirming full-suite runs returned 22/22 files and 120/120 assertions green, exit 0,
with no unhandled errors. The exact string
`[vitest-worker]: Timeout calling "onTaskUpdate"` occurred zero times across all four
runs, and the broader RPC-family watch found zero members.

Route M's claim remains exact-string scoped: Vitest 4 removes the worker-side birpc
timeout that produced this error, so this named error cannot fire by construction. H2
(the teardown-race hypothesis) remains UNDISCRIMINATED rather than refuted; the upgrade
moots H2 for this exact error without testing it. No different RPC-family error was
observed, so there is no new finding to route.

The assertion and process surfaces both match WO-D129 §4's dry-run 2 reference world.
The exit-1 tolerance therefore retires for this error, and `npm test` exit 0 again has
the quartet's ordinary meaning.

## Declared population route and reason

The payload uses the measured reference world's exclude-flag route:

```text
vitest run --fileParallelism=false --exclude "**/dist/**"
```

Vitest 4 removed `dist/` from its default exclusions. This repository has stale,
gitignored compiled test copies under `dist/`; without an explicit remedy, those copies
expand and corrupt the test population. The declared flag restores the committed
population exactly while keeping the project config-free. The route was declared and
implemented before any acceptance result was observed, and no payload edit was made
afterward.

## Installed version

Both dependency manifests carry the exact pin `vitest: "4.1.10"` (no range). The
installed CLI verification was:

```text
npx vitest --version
vitest/4.1.10 win32-x64 node-v24.15.0
```

`npm ls vitest --depth=0` also resolved `vitest@4.1.10`.

## Population identity

The resolved population was obtained with:

```text
npx vitest list --filesOnly --exclude "**/dist/**"
```

The resolved paths were normalized to repository-relative forward-slash paths and
sorted for the identity comparison. The result is IDENTICAL to §3(a2)'s pinned list:

```text
engine/tests/d102-frontage.test.ts
engine/tests/d104-rout.test.ts
engine/tests/d105-bout.test.ts
engine/tests/d106-pursuit-gate.test.ts
engine/tests/d107-annihilation.test.ts
engine/tests/d108-lip.test.ts
engine/tests/d110-pins.test.ts
engine/tests/d91-gates.test.ts
engine/tests/gates.test.ts
engine/tests/m3a-gates.test.ts
engine/tests/m4a-gates.test.ts
engine/tests/m5a-gates.test.ts
engine/tests/unit.test.ts
engine/tests/variants.test.ts
tests/data-integrity.test.ts
tests/m3b-gates.test.ts
tests/m3c-interactions.test.ts
tests/m3d-interactions.test.ts
tests/m4b-interactions.test.ts
tests/m4c-interactions.test.ts
tests/repository-text-integrity.test.ts
tests/terrain-gates.test.ts
```

Resolved count: 22. Expected count: 22. Identity delta: empty. No `dist/` path was
resolved.

## Oracle identity

The suite's own unchanged pin assertions are the oracle instrument. All 120 assertions
passed in the payload run and in every confirming run. In particular, the committed
combat full-state hash `a72fd7ef` remained green at both assertion sites. The unchanged
no-combat full-state pins also remained green at their committed values:

| Tick | Committed full-state hash |
|---:|---|
| 1 | `7537c54d` |
| 360 | `f70e486f` |
| 1080 | `a6b9ac53` |
| 2160 | `dd71a1f0` |

No engine, scenario, or test file changed, and no oracle value moved or was adopted.

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
      Tests  120 passed (120)
   Start at  17:16:20
   Duration  374.41s (transform 995ms, setup 0ms, import 2.67s, tests 365.12s, environment 4ms)

```

Assertion surface: GREEN — 22/22 files and 120/120 assertions passed, including
`tests/repository-text-integrity.test.ts` and every committed full-state hash pin.

Process surface: GREEN — command exit 0; zero unhandled errors; zero occurrences of the
exact timeout string; zero other RPC-family errors.

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

## Three confirming full-suite runs

These are guards under §3(c), not the evidence for mechanism removal.

| Run | Test files | Assertions | Duration | Exit |
|---|---:|---:|---:|---:|
| Confirming 1 | 22/22 passed | 120/120 passed | 360.63 s | 0 |
| Confirming 2 | 22/22 passed | 120/120 passed | 313.94 s | 0 |
| Confirming 3 | 22/22 passed | 120/120 passed | 319.76 s | 0 |

Every confirming run used the unchanged npm test script shown in the quartet. Every
assertion surface was green, including all committed oracle pins, and every process
surface was empty and exit 0.

## Family watch

The expected count is zero for the exact predicate and for all other unhandled/RPC-family
errors. Each preserved complete transcript was scanned case-insensitively for unhandled
errors and RPC-family markers in addition to an exact-string count.

| Run | Exact `onTaskUpdate` timeout count | Other observed unhandled/RPC-family errors | Exit |
|---|---:|---|---:|
| Payload | 0 | none (0) | 0 |
| Confirming 1 | 0 | none (0) | 0 |
| Confirming 2 | 0 | none (0) | 0 |
| Confirming 3 | 0 | none (0) | 0 |

No family-watch deviation or new finding was observed.

## Files touched

Exactly the WO-authorized working-tree files are touched:

- `package.json` — exact Vitest pin and declared exclude-flag test route
- `package-lock.json` — lockfile resolution for the exact Vitest 4.1.10 pin
- `codex-report-wo-d129.md` — this report

Zero engine, scenario, test, or configuration-file bytes were changed. Nothing is
staged. No commit or push was performed. Acceptance transcripts were retained only in
the OS temporary directory, outside the repository.

## AMBIGUITIES

None. The WO's declared route choice was resolved as the measured exclude-flag route
before acceptance, and no implementation ambiguity remained.

## Deviations

None. No acceptance result prompted a payload edit, repair, or rerun.
