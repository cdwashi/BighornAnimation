# M5-B Calibration Audit

Date: 2026-07-22  
Starting HEAD: `367c9ad`  
Constitution: D79 (`docs/M5-SPEC.md` section 2)  
Status: **D84–D87 APPLIED; CURRENT D79.3 MECHANISM STOP AFTER REVERTED ROUND 4**

This artifact is append-only across M5-B rounds. The committed M5-A outputs are
the immutable starting line: `reports/calibration-scorecard.md` and
`reports/seed-envelope.md`.

## Round 0 — starting-line diagnosis and mandatory STOP

### Diagnosis

The largest constitutional blocker is already present before the first move.
`cp-reno-ford-a` is spatially exact but **95 minutes early** (`0.0 m, -95.0
min`) against its ±25 minute tolerance. The work order pre-registers this exact
class: “C1 misses tracing to PRE-CONTACT approach legs (Ford A −93 class) are
NOT tunable.” It requires a STOP and identifies the missing historical halts as
a D39-class data-semantics refinement. D79.5 freezes checkpoints and source
data, so calibration is suspended pending Fable's ruling.

### Before/after and gate margins

No value moved. Therefore before equals after for every component and every
`[CAL]` value.

| Component | Before | After | Passing requirement | Margin after | Result |
|---|---:|---:|---|---:|---|
| C1 overall | 40.00% | 40.00% | ≥50% | −10.00 pp | FAIL |
| C1 HIGH | 25.00% | 25.00% | ≥70% | −45.00 pp | FAIL |
| C2 | 88.89% | 88.89% | all K/W side bands + exact flagships | US killed 195 vs low 235: −40 | FAIL |
| C3 | 38.46% | 38.46% | 100% HIGH | −61.54 pp | FAIL |
| C4 | 92.31% | 92.31% | ≥80% | +12.31 pp | PASS |
| Composite | 59.68% | 59.68% | conjunction C1–C4 | C1/C2/C3 fail | FAIL |

Net-loss rider: not exercised; no candidate round was started or banked.

### `[CAL]` disposition at suspension

All values are unchanged from HEAD `367c9ad`. No previously numberless range
was invented because no value was eligible to move before suspension. `fixed`
means a spec-given singleton rail; `UNRANGED` means proposed-flagged and barred
from movement until a sourced or derived-and-documented range exists.

| `[CAL]` family | Final value(s) | Permitted range at STOP | Source/status |
|---|---|---|---|
| Movement speeds (m/s) | walk 1.8; trot 3.6; gallop 5.4; dismounted 1.1; pack 1.2; foot 1.3 | UNRANGED | D32 table; no M5-B derivation because STOP preceded tuning |
| Formation movement multipliers | column 1; line .8; skirmish .7; dispersed .9; camp 0 | UNRANGED | D32 table; unchanged |
| Spotting scale/thresholds | K 1; spot .0013; lose .00065 | UNRANGED | D52 audited global table; unchanged |
| Spotting heights | mounted 2.4; standing 1.7; prone .3; camp 3 | UNRANGED | D52 audited global table; unchanged |
| Spotting dispersion | column 1; line 1.3; skirmish .7; dispersed .8; camp 4 | UNRANGED | D52 audited global table; unchanged |
| Spotting motion | stationary 1; foot 1.5; mounted 2; mounted-dry 3 | UNRANGED | D52 audited global table; unchanged |
| Spotting perception | divisor 50; min .5; max 2 | UNRANGED | D52 audited global table; unchanged |
| Spotting sweep/cache/cover/camp | cadence 2; cache 100 m; attenuation 210 m; camp radius 3000 m | UNRANGED | D52/D53/D54 audited table; unchanged |
| Combat ranges | engagement 700; melee 25; charge 180; disengage 900 m | UNRANGED | M4-A proposed-flagged |
| Hit intensity/friction | scale 2; friction .06 | UNRANGED | M4-A proposed-flagged; friction has an anchor but no numeric rail |
| Exposure | column 1; line .85; skirmish .65; dispersed .5; pack 1.25 | UNRANGED | M4-A proposed-flagged |
| Cover/flanking | floor .05; multiplier 1.25; angle .6π | UNRANGED | M4-A proposed-flagged |
| Tactics/bow | base .75; scale 200; bow indirect .65 | UNRANGED | M4-A proposed-flagged |
| Weapon discipline | clear jam 4; low-ammo fraction .2; low-ammo discipline .65; shaken .8; broken .5 | `.2` fixed; others UNRANGED | low-ammo fraction spec-given; remainder proposed-flagged |
| Morale thresholds | steady 70; shaken 40; broken 15 | UNRANGED | M4-A proposed-flagged |
| Morale drains | casualty 70; leader 22; flanked 1.2; isolation .35; low-ammo .25; suppression .08 | UNRANGED | M4-A proposed-flagged |
| Morale recovery/rally | lull .18; friendly .12; leader scale .004 | UNRANGED | M4-A proposed-flagged |
| Morale radii | friendly 450; isolation 650; leader 500 m | UNRANGED | M4-A proposed-flagged |
| Rout/destruction | rally 25; strength floor 0; cohesion floor 3; withdrawal 60; rout drain 1 | UNRANGED | M4-A proposed-flagged |
| Leader exposure | per-hit .0015; melee 3; trait 1.75; delay 5 min | UNRANGED | M4-A proposed-flagged |
| Resupply | radius 250 m; 240 rounds/tick | UNRANGED | M4-A proposed-flagged |
| Fatigue | gallop .45; melee .8; recovery .2; cap 75; penalty .35 | UNRANGED | M4-A proposed-flagged |
| Charge | shock 1; speed 1.2; break 1.1; repel .8 | UNRANGED | M4-A proposed-flagged |
| March spacing | 150 m | `[150,150]` fixed | M4-SPEC spec-given |
| Courier/initiative | exposure .2; radius 1500 m | UNRANGED | M4-A proposed-flagged |
| Pursuit | close 50 m; repath 10 ticks; break 4 ticks; loss tolerance 15 m | UNRANGED | M4-A proposed-flagged |
| Engagement/interdiction | adjacency 120 ticks; interdiction 250 m | UNRANGED | M4-A proposed-flagged |
| US killed:wounded | 5.153846 | `[3.916667,6.333333]` | D81 + scenario rails: 235/60, 268/52, 285/45 |
| Coalition killed:wounded | .375 | `[.155,3]` | D81 + DISPUTED rails: 31/200, 60/160, 300/100 |
| C3 HOLDING_AT radius | 250 m | UNRANGED | TODO-AMBIGUOUS(M5-A); unchanged |
| Envelope ford-choke radius | 250 m | UNRANGED | TODO-AMBIGUOUS(M5-A); extraction-only, unchanged |

### D82 predictions at STOP (verbatim)

1. **“(a) A/G/M reach BROKEN on the timber→river leg in a meaningful seed fraction” — NO.** The M5-A N=50 envelope contains none of `co-a`, `co-g`, or `co-m` in rout composition. Calibration did not proceed far enough to test sourced-range reachability.
2. **“(b) ford-choke dead shift to broken troopers” — NO.** The ford-choke table is empty in all 50 starting-line seeds.
3. **“(c) Bloody Knife death appears in the envelope” — CANNOT OCCUR / DATA WALL.** Bloody Knife is absent from `scenario.leaders`; adding him is a data edit forbidden by D79.5. This independently requires suspension and a Fable ruling.

The 10/50 incomplete-destruction rider remains unadjudicated because no
post-calibration envelope exists.

### STOP

Calibration stops at the round-0 boundary. No score/envelope rerun is claimed
as a calibration round, no spotting refit was attempted, and no Arikara or D82
knob was moved. Restart only after Fable rules on the pre-contact approach
data-semantics finding (and the Bloody Knife data absence).

## D84/D85 adjudication — suspension lifted

D84 and D85 were approved in `docs/IMPLEMENTATION_HISTORY.md` on 2026-07-22.
The authorized data edit changed `reno-advance` from ATTACK to MOVE, inserted
the sourced Ford A watering HOLD and valley CHARGE phases, and added Bloody
Knife as an ordinary Arikara-attached leader. No scripted death or exposure
special case was added. Calibration restarted at round 1.

## Round 1 — post-D84/D85 measurement

No `[CAL]` moved. Full seed `18760625` score and N=50 envelope were rerun.

| Component | Round 0 | Round 1 | Passing requirement | Round-1 margin | Result |
|---|---:|---:|---|---:|---|
| C1 overall | 40.00% | 40.00% | ≥50% | −10.00 pp | FAIL |
| C1 HIGH | 25.00% | 25.00% | ≥70% | −45.00 pp | FAIL |
| C2 | 88.89% | 77.78% | all side K/W bands + flagships | US 206K/39W: −29K/−6W to lows | FAIL |
| C3 | 38.46% | 38.46% | 100% HIGH | −61.54 pp | FAIL |
| C4 | 92.31% | 92.31% | ≥80% | +12.31 pp | PASS |
| Composite | 59.68% | 56.91% | conjunction | C1/C2/C3 fail | FAIL |

Ford A residual: **−69.5 minutes** (0.0 m), outside ±25 minutes. Per D84,
this item alone is stopped pending a separate Chuck closure ruling; the pass
continued on other components.

Envelope: median 56.91%; complete wing destruction 48/50; A/G/M rout 0/50;
Arikara killed 0–0; ford choke empty; Bloody Knife deaths 0/50; selected seed
18760604. History remained outside the last four envelope checks.

## Round 2 — D82 global-intensity range test, reverted

Ranges were derived and documented in `engine/src/combat-config.ts` before the
move. Candidate moves:

| `[CAL]` | Before | Candidate | Range | Derivation |
|---|---:|---:|---:|---|
| combatFrictionFactor | .06 | .10 | [.05,.10] | recorded 10–20× historical-total reduction → reciprocal rail |
| moraleCasualtyDrain | 70 | 100 | [50,100] | half-to-full 0–100 morale depletion at total loss |
| moraleSuppressionDrain | .08 | 1 | [0,1] | suppression input is clamped 0–1 |
| moraleFlankedDrain | 1.2 | 5 | [0,5] | binary input, bounded below 10-point order-of-magnitude |
| moraleLullRecovery | .18 | .06 | [0,.18] | zero to audited M4-A starting scale |
| moraleFriendlyRecovery | .12 | .036 | [0,.12] | zero to audited M4-A starting scale |
| moraleLeaderRallyScale | .004 | 0 | [0,.004] | zero to audited M4-A starting scale |

| Component | Before | Candidate | Change | Result |
|---|---:|---:|---:|---|
| C1 | 40.00% | 40.00% | 0.00 pp | FAIL |
| C2 | 77.78% | 55.56% | −22.22 pp | FAIL |
| C3 | 38.46% | 15.38% | −23.08 pp | FAIL |
| C4 | 92.31% | 92.31% | 0.00 pp | PASS retained |
| Composite | 56.91% | 45.58% | −11.33 pp | FAIL |

N=50 candidate envelope: median composite 48.36%; A/G/M routed 50/50;
Arikara routed 50/50 with killed min/P25/median/P75/max = 0/0/37/37/37;
complete wing destruction 48/50 at 855.0–965.5 minutes; ford choke empty;
Bloody Knife death 0/50. The candidate achieved D82(a) only by creating an
all-or-none annihilation path inconsistent with the surviving Reno battalion
and the historical Arikara digit. It also worsened C2 and C3 substantially.

**Disposition: REVERTED, not banked.** All seven values returned to their
round-1 settings. This is the D82 mechanism finding: existing global intensity
knobs transition from no historical rout to destructive pursuit/annihilation;
they do not produce the required broken-but-surviving troopers, ford-choke
composition, Arikara digit, or Bloody Knife exposure within the legal rails.

## Final STOP after restart

- Ford A item STOP: residual −69.5 minutes under D84.
- D82 mechanism STOP: legal global extremes cannot jointly produce predictions
  (a)–(c) without ahistorical annihilation and lower C2/C3.
- D75/Arikara STOP: withdrawal thresholds cannot create three casualties when
  the scouts receive zero exposure at the baseline; intensity extremes jump to
  terminal 37 killed. A threshold move cannot manufacture the missing gradient.
- C1/C3 timing walls remain unreachable by the tested D82 knobs and require
  separate diagnosis/ruling; no per-checkpoint or order edits were made.

## Final verification after revert

- Quartet green: 13 files, 75 tests.
- D84/D85 deterministic state hash: `1110335c`.
- F6 work metrics: calls 164; expanded nodes 9,733,774; scratch allocations 1;
  heap growths 3; wall-clock median 6,661.3 ms informational.
- C4 13-event exam: 12/13 (92.3%), including promoted Crow's Nest rows.
- Final scorecard/envelope are the restored round-1 state; no round-2 CAL move
  remains banked.

## D86/D87 adjudication — restart at round 3

D86 and D87 were approved on 2026-07-22. D86 added one LOW reconstruction
halt. Its required provenance is recorded verbatim in scenario data:
“acknowledged model-invention: documented time, reconstructed placement.” The
first placement was delivered after the pre-ruling Ford arrival and measured
the unchanged −69.5-minute residual; relocating the same authorized order to
interrupt the descent at minute 605 produced the final Ford result: **5.1 m,
+0.5 minute, PASS**.

D87 added terrain-gated infiltration fire. Adoption requires all of:
CONSENSUS_INITIATIVE command, tactics infiltration weight at/above the global
threshold, a formed enemy, and the attacker's physical position inside a real
scenario cover polygon. Open ground receives `{kill:1,suppression:1}` with no
discount. Existing per-position target cover remains the sole exposure
reduction. Infiltration changes output allocation only.

New D87 `[CAL]` rails were derived before use:

| `[CAL]` | Round-3 value | Range | Derivation |
|---|---:|---:|---|
| infiltrationAdoptionThreshold | 50 | [20,90] | sourced profile weights: US 20 through warrior 90; 50 doctrine midpoint |
| infiltrationKillMultiplier | .35 | [.2,.8] | suppression posture retains minority 20–80% lethal output |
| infiltrationSuppressionMultiplier | 5 | [1,10] | ordinary 1× floor; 0–100 tactics scale bounds amplification to one order of magnitude |
| withdrawalDisciplineThreshold | 60 | [55,70] | sourced profile weights: formed US 55, scout 65, warrior 70 |

## Round 3 — D86/D87 default mechanism baseline

| Component | Round 1 | Round 3 | Change | Gate/margin |
|---|---:|---:|---:|---|
| C1 | 40.00% | 50.00% | +10.00 pp | overall at threshold; HIGH 25%, −45 pp, FAIL |
| C2 | 77.78% | 77.78% | 0 | FAIL |
| C3 | 38.46% | 38.46% | 0 | −61.54 pp, FAIL |
| C4 | 92.31% | 92.31% | 0 | +12.31 pp, PASS |
| Composite | 56.91% | 60.41% | +3.50 pp | conjunction FAIL |

N=50: median 60.41%; selected seed 18760603; complete wing destruction
44/50 at 857–868 minutes; A/G/M breaks 0/50; Arikara killed 0–0; ford choke
empty; Bloody Knife 0/50. Coalition lethal output fell and wing completion
improved from 40/50 M5-A and 48/50 round 1, but history remained outside four
envelope checks.

## Round 4 — legal suppression extreme, reverted

Candidate moves: infiltration suppression 5→10 [1,10]; morale suppression
drain .08→1 [0,1]; lull recovery .18→0 [0,.18]; friendly recovery .12→0
[0,.12]; leader rally .004→0 [0,.004]; withdrawal threshold 60→55 [55,70].

| Component | Before | Candidate | Change | Result |
|---|---:|---:|---:|---|
| C1 | 50.00% | 50.00% | 0 | HIGH subgate FAIL |
| C2 | 77.78% | 55.56% | −22.22 pp | FAIL |
| C3 | 38.46% | 0.00% | −38.46 pp | FAIL |
| C4 | 92.31% | 92.31% | 0 | PASS retained |
| Composite | 60.41% | 45.24% | −15.17 pp | FAIL |

N=50 candidate: median 45.24%; A/G/M routed 50/50 but the rout composition
expanded to nearly the whole modeled army; Arikara killed 37/37 in every seed;
ford choke empty; Bloody Knife 0/50; complete wing destruction 47/50 but shifted
to 864.5–1071 minutes. This is a gross systemic inversion, not the ruled
broken-but-surviving valley outcome.

**Disposition: REVERTED.** Round-3 values restored. D87 establishes the
terrain-derived posture and improves lethal-output direction, but the existing
continuous morale/rout/pursuit coupling has no legal global setting that both
breaks A/G/M in 731–736 and preserves their survival/perimeter arrival. The
range transition remains zero break → global rout/annihilation.

## Post-D86/D87 final verification

- Quartet green: 13 test files, 76 tests.
- D87 architecture gate: mapped cover required; open-ground and dispersed
  targets receive ordinary `{kill:1,suppression:1}` output.
- Full-state hash: `80ccd48a`; F6 calls 164, expanded nodes 9,553,977,
  scratch allocations 1, heap growths 3; 6,413.0 ms median informational.
- V1/D55/E6/F3/F1 green; C4 remains 12/13; E5 diff none.
- Final artifacts are restored round 3; round 4 remains audit-only evidence.
