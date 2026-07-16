# CODEX WORK ORDER — M2-A: Engine core (clock · movement · pathing · orders · save/replay)

## Goal
Implement the engine core specified in `docs/M2-ENGINE-SPEC.md` (approved D30–D37):
deterministic tick engine, movement + A* pathing on the M1 terrain, order lifecycle
with supersede-on-receipt, save/replay, variant application, a minimal checkpoint
scorer, and a CLI runner. Exit: quartet green including gates E1–E6, plus the E5
baseline report generated.

## Inputs (read all before writing)
- `docs/M2-ENGINE-SPEC.md` — authoritative for everything below; §7 module layout,
  §8 gates. On any conflict between this work order and the spec, THE SPEC WINS.
- `docs/IMPLEMENTATION_HISTORY.md` D30–D37 — decision context.
- `src/terrain/loader.ts` + `raycast.ts`, `data/terrain/.../manifest.json` — the
  injected terrain interface (elevation, movement-cost, projection transforms).
- `data/scenarios/little-bighorn-1876/scenario.json` + `src/schema/` + `src/validate.ts`.

## Hard constraints
- **Zero new dependencies.** Engine is dependency-free; hashing is an in-repo pure
  FNV-1a over a stable (sorted-key) JSON serialization; CLI may use node built-ins.
- **Purity rules (D30) enforced by lint**: add ESLint `no-restricted-properties` /
  `no-restricted-globals` for `Date.now`, `Math.random`, and `performance.now`
  scoped to `engine/src/**`. No React/DOM imports there; terrain access only via
  the injected loader interface.
- Determinism: no key-order-dependent iteration; units/orders processed in declared
  array order; all randomness via `rng.ts` (even though M2 consumes none).
- Ambiguity protocol as in O1/M1-A: never guess silently; `TODO-AMBIGUOUS(M2-A)`
  comment + report entry.
- Do not modify `docs/` except the single scripted edit in Task 10.

## Tasks
1. `src/scenario/apply-variants.ts` — apply Variant patches (all v0.2 operations)
   to a scenario copy; enforce exclusion groups (throw on conflicting enables);
   unit tests incl. v-c-company-split adding co-c-det and v-benteen-prompt leader
   modification. (Lives outside engine/: it's data-layer, shared with the app later.)
2. `engine/src/state.ts` + `clock.ts` — SimState per spec §3; init from scenario:
   WGS84 start positions → local meters via manifest transforms (polygon starts →
   centroid); minute↔tick (×2 at 30 s) ↔ wallClock conversions.
3. `engine/src/rng.ts` — mulberry32, serializable state (D31a).
4. `engine/src/pathfind.ts` — A* per D33 (8-connected, √2 diagonals, cost = step
   distance × mean adjacent cell cost, string-pulling smoothing, unreachable result
   type); core tier with 30 m fallback outside the core box.
5. `engine/src/orders.ts` + `objectives.ts` — lifecycle per D34: delivery queue
   (arrival tick = issue tick + 2×(transmissionMinutes + issuer orderDelayMinutes)),
   supersede-on-receipt with `order-superseded` event; objective resolution
   (waypoints / landmarkId / targetUnitId pursuit: repath every 10 ticks or >250 m
   displacement, park at 150 m standoff, emit `contact-pending`).
6. `engine/src/movement.ts` — D32 speed table as config constants marked [CAL];
   formation modifiers; posture flags (SCREEN slower, WITHDRAW face-to-rear);
   ford-hold mechanics (crossingPenaltyMinutes at ford cells; river otherwise
   impassable); DISMOUNT_SKIRMISH/MOUNT 2-tick state change with holder-fraction
   bookkeeping (available vs. horse-holding strength — bookkept, unused until M4);
   RESUPPLY = movement + proximity event only; DEFEND_CAMP inert (D36).
7. `engine/src/events.ts` + `serialize.ts` + `index.ts` — typed event log (spec §3
   list); save/load per D31 (scenario id + FNV content hash, variant ids, parameter
   overrides, seed, target tick, optional keyframes every 10 ticks); load refuses on
   hash mismatch with a clear error; `createSim(scenario, {variants, seed, terrain})
   → {step, run, save, load, events}`.
8. `engine/src/score.ts` — minimal checkpoint scorer: hit = within toleranceMeters
   AND toleranceMinutes of the unit's track; emits per-checkpoint hit/miss + distance
   /time deltas. (This is deliberately the seed of M5's full calibration scorer —
   keep it self-contained.)
9. CLI: `npm run sim -- --scenario little-bighorn-1876 --to-tick 2160 --report` —
   runs baseline, prints the E5 table, writes `reports/e5-baseline.md` (committed:
   it is the M4 baseline artifact). Include seed and scenario hash in the report
   header.
10. Tests `engine/tests/` — gates E1–E6 exactly as spec §8 defines them, as named
    tests (E5's generation is exercised via the CLI module; its *judgment* is
    human). Plus unit tests for apply-variants, pathfind edge cases (unreachable,
    ford discipline), supersede, and save-hash refusal.
    **E5 escalation rule: if the movement-only run shows a gross miss (unit on the
    wrong side of the river, hours-scale timing error), STOP — do not tune speeds,
    paths, or data to fix it. Record it in the report and escalate.**
11. History file (scripted edit, exact text): append to the artifacts table:
    `| CODEX-WORKORDER-M2A.md | 07-15 | Engine-core work order (D30–D37 frozen). |`
    and `| reports/e5-baseline.md | 07-15 | Movement-only checkpoint baseline (gate E5); the score M4 must beat. |`

## Proof + output
`codex-report-m2a.md`: files + line counts; quartet chain output verbatim; E1 hash
values at ticks {1, 360, 1080, 2160} for two same-seed runs + one different-seed
run; `npm run sim` output excerpt; the full E5 table verbatim; AMBIGUITIES;
deviations. No commit/push; leave the tree for review.
