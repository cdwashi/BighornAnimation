# Q-POP — the population census (268-versus-253, §4; lists, not a verdict)

Data surfaces only: `data/scenarios/little-bighorn-1876/scenario.json`. Read 2026-08-05
under the frozen registration (`dc39dab`). Per §2's adjudication requirement this census
reports the population lists in both directions and no conclusion about which numerator
is correct.

## Side `us-7th-cavalry` — the full roster, 16 units

| unit id | kind | name | strength.best |
|---|---|---|---:|
| co-a | CAVALRY_COMPANY | Company A | 45 |
| co-b | CAVALRY_COMPANY | Company B | 45 |
| co-c | CAVALRY_COMPANY | Company C | 40 |
| co-d | CAVALRY_COMPANY | Company D | 45 |
| co-e | CAVALRY_COMPANY | Company E (Gray Horse) | 40 |
| co-f | CAVALRY_COMPANY | Company F | 40 |
| co-g | CAVALRY_COMPANY | Company G | 45 |
| co-h | CAVALRY_COMPANY | Company H | 45 |
| co-i | CAVALRY_COMPANY | Company I | 40 |
| co-k | CAVALRY_COMPANY | Company K | 42 |
| co-l | CAVALRY_COMPANY | Company L | 40 |
| co-m | CAVALRY_COMPANY | Company M | 45 |
| pack-train | PACK_TRAIN | Pack train | 130 |
| arikara-scouts | SCOUT_DETACHMENT | Arikara (Ree) scouts | 37 |
| crow-scouts | SCOUT_DETACHMENT | Crow scouts | 6 |
| civilians-interpreters | SCOUT_DETACHMENT | Civilians / interpreters | 12 |

Company strength.best sums to 512; the four non-company units sum to 185.

## `calibration.casualties` — the table's keys, 12

Exactly the twelve CAVALRY_COMPANY units: co-a, co-b, co-c, co-d, co-e, co-f, co-g,
co-h, co-i, co-k, co-l, co-m. Verified against the data surface: side-scoped sums
K 234.9999999998 / 252.9999999998 / 284.9999999999, W 44.9999999998 / 52.0 /
59.9999999999 — the register's 235/253/285 and 45/52/60 with the float residue
D110's row recorded (2×10⁻¹⁰ scale), reproduced here from the shelf.

Row texture, reported because the census surfaced it: the five Custer-wing companies
(co-c, co-e, co-f, co-i, co-l) carry integer bands (K 38/40/45 each) and wounded
0/0/0; the seven Reno-Benteen companies carry fractional apportioned bands (killed
best 7.6442307692 for six of them, 7.1346153846 for co-k; wounded best 7.5 for six,
7 for co-k). The entire wounded denominator 52 = 6 × 7.5 + 7 lives on the
Reno-Benteen seven.

## Difference lists, both directions

**In the model's US side but NOT in the calibration table (4 units, 185 personnel at
strength.best):** pack-train (130), arikara-scouts (37), crow-scouts (6),
civilians-interpreters (12). Any casualty these units take exists in the engine's
world and is covered by no calibration row.

**In the table but not the model:** empty. Every table key is a modeled unit.

**Populations the two numerators count (from §1's decomposition, restated against the
roster):** 253 sums the twelve company rows and nothing else. 268 counts the
regiment's dead including staff, scouts, civilians, and the five died-of-wounds
evacuees — populations that map onto the roster as: the four uncovered units above
(scouts, civilians, pack train), plus leader entities (commandingLeaderId — company
officers and staff are modeled as leaders, not units), plus persons with no model
referent at all (evacuated died-of-wounds). No claim is made here about which mapping
is correct; that is the ruling's job, informed by M-COVER and the read.

## Stated for the record

The census answers §2's Q-POP as registered: the modeled side is NEITHER population
exactly — it is the 253-population (twelve companies) PLUS four units totalling 185
best-strength personnel that no casualty row covers. Which numerator — 253, 268, or
a third number — correctly describes the population the split ratio governs is
explicitly NOT concluded here; per the registration, that determination waits on
R1–R3 (which units' casualties the ratio actually touches) and M-COVER (what
casualties those units actually take in the committed world).
