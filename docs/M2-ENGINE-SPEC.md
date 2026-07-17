# M2-ENGINE-SPEC — Engine Core (clock · movement · pathing · orders · save/replay)

Status: DRAFT for Chuck's review. Proposed decisions D30–D37. Open questions at
bottom. Scope per PRD M2: units execute the historical order list over the real
terrain. **No combat, no LOS, no morale** — those are M3/M4; this milestone's exit
is a full-day movement-only run of little-bighorn-1876 that completes cleanly.

## 1. Package & purity rules

**D30 — Engine lives in `engine/src/`, headless and pure.** Rules, enforced by lint
and review: no React, no DOM, no Node-only APIs in the hot path (loader injected);
no `Date.now()`, no `Math.random()` — all randomness through the engine's seeded
PRNG; no iteration over object keys where order affects results (units/orders
processed in declared array order). The engine exports pure functions over an
explicit state value. Existing root tsconfig `tsc -b` picks it up; no workspace
restructuring yet.

- **Cache purity (D55, added 07-16):** all engine memoization must be a pure
  function of current SimState — cache validity may never depend on *when* a
  verdict was computed, only on *what* the state is. History-dependent auxiliary
  state is forbidden (the D31 replay invariant made explicit). Enforced by the
  permanent cache-equivalence gate: a full-day run with caching disabled must be
  bit-identical to the cached run.

## 2. Determinism & RNG

**D31a — PRNG: mulberry32, seeded from scenario + user seed; PRNG state is part of
SimState.** M2 uses almost no randomness (movement is deterministic), but the
substrate is established now so M4's combat rolls serialize/replay identically.
Determinism contract (PRD C5): same scenario + variants + parameters + seed ⇒
bit-identical state at every tick. Enforced by gate E1.

## 3. State model & save/replay

**D31 — Event-sourced canon, snapshot convenience.**
- `SimState`: tick, PRNG state, per-unit runtime (position in meters, facing,
  formation, mounted, posture, active order id, path + path progress, speed class),
  order-delivery queue (in-transit orders with arrival tick), emitted-event cursor.
- Canonical replay = re-run from tick 0 (cheap: a full day is 2,160 ticks over ~33
  units — well under a second). Snapshots are an optimization for UI scrubbing:
  engine can emit keyframe states every N ticks; scrubbing loads nearest keyframe
  and steps forward.
- Save file = scenario id + content hash, enabled variant ids, parameter overrides,
  seed, and target tick (plus optional keyframes). Loading verifies the scenario
  hash — mismatched data refuses to resume (integrity rule inherited from the
  Mah Jongg save system).
- Engine emits typed events (`order-received`, `move-started`, `waypoint-reached`,
  `ford-crossing`, `dismounted`, `order-superseded`, `arrived`) consumed by the UI
  event index and by tests.

## 4. Movement model

**D32 — Speed table as engine config constants, all [CAL]:**

| Mode | m/s (≈) | Notes |
|---|---|---|
| Cavalry column, walk | 1.8 (4 mph) | default march |
| Cavalry, trot | 3.6 (8 mph) | ATTACK/urgent MOVE posture |
| Cavalry, gallop | 5.4 (12 mph) | CHARGE; short-burst only (M4 adds fatigue cost) |
| Dismounted skirmish line | 1.1 (2.5 mph) | includes fighting withdrawal pace |
| Pack train | 1.2 | mules; also caps any escort moving with it |
| Warrior band, mounted | matches cavalry classes | parity assumption [CAL] |
| On foot (led horses / holders) | 1.3 | |

Effective speed = base(mode, formation) × cell movementFactor from the M1 cost grid
(slope factor, cover) × formation modifier (COLUMN 1.0, LINE 0.8, SKIRMISH 0.7,
DISPERSED 0.9). River cells impassable except ford cells (crossingPenaltyMinutes
applied as a hold at the ford, per scenario data). Fatigue: **deferred to M4** —
noted so nobody mistakes its absence for an oversight.

## 5. Pathfinding

**D33 — A\* on the core-tier movement-cost grid, 8-connected,** cost = step distance
× mean adjacent cell cost; diagonal √2. Paths computed per order through its
waypoint list; cached on the unit; recomputed only if an objective is a moving
target (see §6) or a path segment becomes invalid. String-pulling smoothing pass so
columns don't stairstep. Units are points at battalion scale (no collision between
friendly units in M2; unit frontage/occupancy is an M4 concern if ever).
Full-box 30 m tier used when a path leaves the core box (approach march).

## 6. Order lifecycle & command models

**D34 — Lifecycle: issued → in-transit → received → active → done/superseded.**
- In-transit duration = order.transmissionMinutes + issuer.orderDelayMinutes
  (HIERARCHICAL sides). CONSENSUS_INITIATIVE orders apply both as 0 (already the
  data convention).
- **Supersede-on-receipt:** a newly received order replaces the unit's active order.
  No queueing — the historical order list is explicitly timed, and queue semantics
  would silently reorder history. `order-superseded` event emitted for audit.
- Objective resolution: waypoints → path; landmarkId → its coordinate;
  **targetUnitId → pursue: path to target's current position, repath every 10 ticks
  (5 min) or when target displaces > 250 m.** In M2, reaching a target unit just
  parks the pursuer at standoff distance (150 m) and emits `contact-pending` — the
  hook M4's engagement system replaces.
- Order-type semantics in M2 (movement dimension only): MOVE/SCREEN/WITHDRAW are
  pathed movement with posture flags (screen = slower + wider spacing; withdraw =
  face-to-rear flag for the UI); ATTACK = trot toward objective; CHARGE = gallop;
  HOLD = stationary; DISMOUNT_SKIRMISH/MOUNT = state change with a 2-tick cost and
  holder fraction bookkeeping (strength available vs. holding horses — bookkept now,
  consumed by M4); RESUPPLY = pack-train movement to recipient + proximity event
  (ammo transfer itself is M4); DEFEND_CAMP = **inert in M2** (D36) — its trigger is
  "enemy spotted," which requires M3's LOS.

**D35 — Couriers are timers in M2, entities in M4.** The data's transmissionMinutes
is authoritative for delay. The delivery-queue entry carries enough info (route
endpoints) that M4 can upgrade couriers to killable entities without schema change.

**D36 — M2 runs scheduled orders only.** Coalition trigger behaviors (DEFEND_CAMP,
tactics-profile-driven initiative) stay dormant until spotting exists (M3). The
explicitly scheduled coalition orders (gall-response, crazy-horse-sweep, ch-strike,
lwm-charge, gall-calhoun) execute normally as movement.

## 7. Engine module layout

```
engine/src/
  index.ts        // createSim(scenario, options) → { step, run, save, load, events }
  state.ts        // SimState types + init from scenario
  rng.ts          // mulberry32 + serializable state
  clock.ts        // tick ↔ minute ↔ wallClock
  orders.ts       // lifecycle, delivery queue, supersede
  objectives.ts   // waypoint/landmark/pursuit resolution
  movement.ts     // speed model, formation/posture modifiers, ford holds
  pathfind.ts     // A* + smoothing on cost grid
  events.ts       // typed event emitter/log
  serialize.ts    // save/load, scenario hashing, keyframes
engine/tests/     // unit + gate tests (vitest, same root config)
```

Terrain access via the M1 loader interface, injected at `createSim` (keeps the
engine environment-agnostic and lets tests stub terrain).

## 8. M2 exit gates

- **E1 Determinism:** two runs, same seed, hash of full state at ticks {1, 360,
  1080, 2160} — identical. Third run with different seed — identical too in M2
  (no randomness consumed yet); the test asserts and *documents* this so M4's first
  divergence is a conscious event.
- **E2 Speed truth:** synthetic flat terrain — each speed class covers expected
  meters per tick within 1%; slope/cover factors bite as configured.
- **E3 Ford discipline:** a path from west of the river to Reno Hill crosses at a
  ford cell (never mid-river) and pays crossingPenaltyMinutes; a pathological
  no-ford route returns unreachable rather than swimming.
- **E4 Full-day historical run:** little-bighorn-1876 baseline, tick 0→2160, no
  thrown errors, no NaN positions, no stuck unit (every unit with an active MOVE
  advances or reports blocked), every scheduled order delivered and activated at the
  correct tick (±0).
- **E5 Movement-only checkpoint report (informational, non-blocking):** run the
  checkpoint scorer against the E4 run and emit the hit/miss table. Misses are
  expected (no combat delays exist yet); the report is the baseline M4 must improve
  on — and any *gross* miss (unit on the wrong side of the river, hours-scale error)
  is investigated before M2 closes.
- **E6 Save/replay equivalence:** state at tick N via (run to N/2, save, load,
  resume to N) is bit-identical to a straight run to N; keyframe-scrub path agrees.
- Quartet green; engine purity lint rules active.

## 9. Split of work

- **Fable:** this spec; review of the E5 movement-only report (that's where judgment
  lives — does the day "look right" before combat exists?); final M2 review.
- **Codex (work order M2-A after approval):** everything in §7 + gates E1–E6 as
  tests + a tiny CLI runner (`npm run sim -- --scenario little-bighorn-1876
  --to-tick 2160 --report`) so the E5 table is reproducible on demand.
- **Chuck:** the open questions; eyeball the E5 report with me.

## 10. Open questions for Chuck

1. **Supersede-on-receipt (D34)** — approve? (Alternative is order queueing, which I
   recommend against: it can silently reorder history when transmission delays
   overlap.)
2. **Speed table (D32)** — the values are standard cavalry manual rates and all
   [CAL]; any you want changed before first run, or tune later against the E5
   report?
3. **Keyframe interval** for UI scrubbing — every 10 ticks (5 min) is my default;
   preference?
