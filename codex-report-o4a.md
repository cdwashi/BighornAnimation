# Codex report — O4-A Tier A geometry integration

## Status

**PASS.** Approved rulings D41–D44 are integrated. The corrected 297-point in-bounds
channel, three fords, timber and village polygons, Garryowen LOW-confidence flag zone,
timber landmark, and two D44 checkpoints are in `scenario.json`. Terrain was
regenerated from the verified cached DEM; all M1 and M2 gates and the full 30-test
quartet are green. `reports/e5-baseline.md` was regenerated at tick 2160.

The E5 gross-miss stop rule did not trigger. `cp-reno-hill` is spatially exact at
0.0 m but arrives +64.5 minutes late. That is outside the expected ±45-minute shape,
but it is neither a wrong-bank result nor an hours-scale error, so it is recorded
without tuning. `cp-keogh-sector` remains an ordinary miss.

No commit or push was made. The two intentional pre-existing changes were preserved;
Task 5 was skipped because `codex-report-m2a.md` already contains its adjudication
verification note.

## Terrain pipeline excerpt

```text
> bighorn-animation@0.1.0 terrain
> npm run build && node dist/pipeline/fetch-dem.js && node dist/pipeline/build-grids.js && node dist/pipeline/derive.js && node dist/pipeline/rasterize-vectors.js


> bighorn-animation@0.1.0 build
> tsc -b

[fetch] checksum verified USGS_13_n46w108_20241115.tif sha256=71d1d2c42cfa4c456980b27e26ce22ffc4afb3ac271526bd2ce3b2b53c455457
[fetch] cached download is valid; skipping API query and download
[grids] reading USGS_13_n46w108_20241115.tif
[grids] core: sampling 1209x1259 at 10 m
[grids] wrote elevation-core.i16 (3044262 bytes)
[grids] full: sampling 880x693 at 30 m
[grids] wrote elevation-full.i16 (1219680 bytes)
[grids] wrote manifest.json
[derive] wrote slope-core.u8 and hillshade-core.png
[derive] wrote slope-full.u8 and hillshade-full.png
[derive] wrote contours-core.geojson (40 elevation levels)
[derive] updated manifest.json
[rasterize] river burned 2903 cells; fords burned 15 cells
[rasterize] wrote cover-kind-core.u8, movement-cost-core.f32, and manifest.json
[rasterize] warning: cover deep-ravine-cover is a zero-area O4 placeholder; empty burn expected
```

Independent raster inspection found 15 code-255 FORD cells, all with finite movement
cost `4`. The authored cells for `ford-a`, `ford-b`, and `retreat-crossing` are each
code 255 with movement cost 4. River burn increased from 1,287 placeholder-era cells
to 2,903 cells.

## Quartet chain output verbatim

PowerShell 5 cannot parse `&&`, so the exact short-circuit chain was passed through
`cmd /c`:

```text
> bighorn-animation@0.1.0 typecheck
> tsc --noEmit


> bighorn-animation@0.1.0 lint
> eslint .


> bighorn-animation@0.1.0 test
> vitest run


 RUN  v3.2.7 C:/Users/cdwas/Documents/Programming/BighornAnimation

stdout | tests/data-integrity.test.ts
[metric] remaining TODO-AMBIGUOUS count: 37

 ✓ engine/tests/variants.test.ts (3 tests) 24ms
 ✓ tests/data-integrity.test.ts (13 tests) 308ms
 ✓ engine/tests/unit.test.ts (3 tests) 73ms
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

 ✓ tests/terrain-gates.test.ts (5 tests) 422ms
   ✓ M1 terrain validation gates > G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON 312ms
stdout | engine/tests/gates.test.ts > M2 exit gates > E1 Determinism — full-state hashes match at required ticks, including a different unused seed
[gate] E1 hashes {"sameA":{"1":"6b9dca7e","360":"fdfcdd60","1080":"af0c7fa2","2160":"beae641f"},"sameB":{"1":"6b9dca7e","360":"fdfcdd60","1080":"af0c7fa2","2160":"beae641f"},"different":{"1":"6b9dca7e","360":"fdfcdd60","1080":"af0c7fa2","2160":"beae641f"}}

 ✓ engine/tests/gates.test.ts (6 tests) 33287ms
   ✓ M2 exit gates > E5 Movement-only checkpoint report — CLI module generates the informational hit/miss table 4759ms
   ✓ M2 exit gates > E6 Save/replay equivalence — resume and keyframe scrub are bit-identical to straight runs 13850ms

 Test Files  5 passed (5)
      Tests  30 passed (30)
   Start at  11:00:18
   Duration  35.13s (transform 1.13s, setup 0ms, collect 2.25s, tests 34.11s, environment 3ms, prepare 2.21s)


> bighorn-animation@0.1.0 build
> tsc -b
```

Command: `cmd /c "npm run typecheck && npm run lint && npm test && npm run build"`

Exit code: 0.

## Full E5 baseline

- Seed: `18760625`
- Scenario FNV-1a: `943f80b8`
- Target tick: `2160`
- Result: `3/10 checkpoints hit`

| Checkpoint | Unit | Target min | Nearest min | Distance m | Delta min | Result |
|---|---|---:|---:|---:|---:|---|
| cp-scouts-crows-nest | crow-scouts | 0.0 | 0.0 | 0.0 | 0.0 | HIT |
| cp-reno-ford-a | co-a | 675.0 | 582.0 | 0.0 | -93.0 | MISS |
| cp-reno-skirmish-line | co-a | 720.0 | 769.0 | 156.9 | 49.0 | MISS |
| cp-reno-timber | co-a | 750.0 | 757.0 | 276.5 | 7.0 | MISS |
| cp-reno-hill | co-a | 765.0 | 829.5 | 0.0 | 64.5 | MISS |
| cp-yates-ford-b | co-f | 780.0 | 793.5 | 386.2 | 13.5 | MISS |
| cp-right-wing-calhoun | co-l | 795.0 | 815.0 | 0.0 | 20.0 | MISS |
| cp-keogh-sector | co-i | 825.0 | 815.0 | 415.6 | -10.0 | MISS |
| cp-custer-last-stand | co-f | 840.0 | 831.5 | 0.0 | -8.5 | HIT |
| cp-weir-point | co-d | 865.0 | 848.0 | 0.0 | -17.0 | HIT |

## TODO-AMBIGUOUS ledger

| Scope | Before | After | Resolved |
|---|---:|---:|---:|
| `scenario.json` | 41 | 37 | 4 |

The four resolved scenario flags were the timber landmark, retreat-crossing landmark,
zero-area timber cover, and zero-area village cover. The M1-A coarse-placeholder ford
comment was also removed from `pipeline/rasterize-vectors.ts` because D42 places all
three authored fords on the corrected channel; this code comment is outside the
scenario-count metric.

## AMBIGUITIES

1. The 37 pre-existing unresolved scenario provenance flags remain. O4-A does not
   authorize resolving unrelated representative-unit, coordinate, formation, camp,
   or engine-input ambiguities.
2. The `cp-reno-skirmish-line` and `cp-reno-timber` representative-unit TODO notes
   remain because D44 corrects geometry only; both notes now also carry the D44 old
   and new coordinates.
3. Tier A remains LOW in the timber/village extents and in the Garryowen and Ford B
   local zones exactly as sourced. Tier B georeferencing is backlogged rather than
   silently promoted.
4. Reno Hill's +64.5-minute ordinary miss is outside the expected ±45-minute shape.
   It is documented as the new baseline and was not tuned because it does not meet
   the explicit wrong-bank/hours-scale gross-miss threshold.

## Deviations

1. **DEM-edge truncation:** the source channel contained 298 points. The final point,
   `(45.60034, -107.45511)`, exceeds the DEM north bound `45.60`; it was dropped as a
   trailing point. Zero leading points and one trailing point were dropped. The new
   final point is `(45.59999, -107.45497)`. Bounds were not changed and no point was
   clamped or moved.
2. **D44 point selection:** `cp-reno-skirmish-line` uses the timber polygon's exact
   southern-edge vertex `(45.52577, -107.4064)`; `cp-reno-timber` uses the approved
   inside-loop/landmark coordinate `(45.53, -107.417)`. Times and tolerances are
   unchanged.
3. **River provenance schema:** `RiverSpec.provenance` and its structural validation
   were added because Task 1a requires D41 provenance on the base river and the
   existing schema had no river-provenance field.
4. **Terrain wrapper timeout:** the first terrain invocation was stopped by a
   60-second command-wrapper timeout. The complete rerun used a longer allowance and
   exited 0 after 156.2 seconds.
5. **Quartet shell wrapper:** PowerShell 5 rejected `&&` before running any project
   command. The exact chain was then run via `cmd /c` and exited 0.
6. **Expected E5 shape:** Reno Hill produced 0.0 m / +64.5 minutes rather than the
   anticipated ±45 minutes. This was not a gross miss under the unchanged escalation
   rule, so work continued without tuning.
7. No placeholder-era gate assertion required an update. Task 5 was not repeated,
   and no unauthorized file under `docs/` was modified.
