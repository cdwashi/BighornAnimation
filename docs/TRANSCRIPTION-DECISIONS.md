# TRANSCRIPTION-DECISIONS — little-bighorn-1876 (v0.1)

Authoritative judgment calls for assembling `scenario.json`. Codex must treat this
file plus the research document as the complete source of truth: **assemble, do not
invent**. Where this file and the research doc conflict, this file wins (it encodes
approved decisions D11–D15). All coordinates WGS84; all `minute` values are minutes
since 03:00 local sun time (clock start).

STATUS FLAGS:
- [CAL] = engine parameter, LOW confidence by design, expected to move during calibration (M5)
- [REVIEW] = pending Chuck's explicit PR review (leader ratings per D15; warrior decomposition per D14)

## 0. Schema amendments (v0.1 → v0.1.1) — apply before coding
1. `Unit.weaponMix`: each fraction ∈ [0,1]; **no sum constraint** (a trooper carries
   both carbine and revolver). Update the validation test accordingly.
2. `WeaponSpec.class`: add `RIFLE_BREECHLOADER` (for the Sharps .50).
3. `ClockSpec`: single `tickSeconds` retained; D11's coarse/fine phasing is a
   playback-speed concern, not an engine-tick concern. `tickPhases` deferred to v0.2.

## 1. Meta / clock
- id `little-bighorn-1876`; title "Battle of the Little Bighorn"; date `1876-06-25`;
  schemaVersion `0.1.1`.
- timeAnchor: "Local apparent (sun) time per Gray (1991). Officer watch times (RCOI,
  Godfrey) run ~45–70 min ahead of this clock; offsets applied per research doc."
- clock: start `03:00`, end `21:00`, tickSeconds `30`.
- bibliography keys (minimum set): GRAY1991, FOX1993, MICHNO1997, SCOTT1987,
  HEDREN1973, RCOI, TERRY1876 (Ann. Rep. Sec. War 1876 p.462), RENO_RPT, BENTEEN_RPT,
  GODFREY, NPS, HMDB, WIKI, HISTNET, WFHN, WEB_MISC (forum/low-tier sources —
  treasurenet, trackingnana, "subagent" relays — flagged weak per D16).

## 2. Sides
- `us-7th-cavalry`: HIERARCHICAL, color `#1f4e8c`.
- `lakota-cheyenne-coalition`: CONSENSUS_INITIATIVE, color `#8c1f1f`.

## 3. Terrain (data-file portion only; DEM pipeline is O6, not this task)
- dem: source "USGS 3DEP 1/3 arc-second" (placeholder until O6), bounds
  sw {45.47, -107.48} ne {45.60, -107.15}, resolutionMeters 10.
- landmarks: transcribe the research §D landmark table verbatim (all ~21 rows), keep
  APPROX flags in provenance notes. Crow's Nest: confidence LOW, note "published
  marker coordinate is a decoy at the visitor site (O3 open)".
- rivers: `little-bighorn-river` — placeholder path of 4 points along the valley
  (45.49,-107.39 → 45.53,-107.43 → 45.549,-107.412 → 45.56,-107.45), note
  "placeholder pending O6 digitization". Fords: ford-a (45.4947,-107.3931, MEDIUM),
  ford-b (45.5486,-107.4115, MEDIUM), retreat-crossing (~45.525,-107.40, LOW).
  crossingPenaltyMinutes 4.
- cover polygons (placeholder rectangles around noted centers, provenance LOW, note
  "pending O6"): timber-loop (TIMBER, losOpacity 0.8, movementFactor 0.6, coverFactor
  0.5); village-strip S→N along west bank (VILLAGE, 0.5 / 0.7 / 0.3); deep-ravine
  (RAVINE, 0.9 / 0.5 / 0.7). No static dust polygon — dust enters via
  observationEvents' atmosphericFactor only.
- historicalCorrections: one entry `river-1876-channel`: description "1876 channel
  more sinuous; meanders near Ford B and the Garryowen loop differ (NPS GRI 2011,
  1891 overlay)", geometry = placeholder river path, provenance MEDIUM, note "O4
  open — geometry to be replaced".

## 4. Weapons [CAL — all hitProbability and rpm values are engine parameters to be calibrated]
| id | class | rpm l/b/h | rangeBands maxRangeMeters:hitProb | indirect | malf/100 l/b/h | conf |
|---|---|---|---|---|---|---|
| springfield-1873-carbine | CARBINE | 5/8/12 | 100:0.35, 200:0.22, 350:0.12, 500:0.05, 700:0.02 | no | 0.2/0.4/2.0 | HIGH (malf: Hedren <0.35%, Scott 3/1625; high bound = fouling anecdotes); LOW (bands) |
| colt-saa | REVOLVER | 8/10/12 | 25:0.30, 50:0.15 | no | 0.3/0.5/1.0 | MEDIUM |
| henry-winchester-44 | RIFLE_REPEATER | 10/14/16 | 50:0.30, 100:0.20, 150:0.10, 250:0.03 | no | 1/2/4 | MEDIUM ("less rugged") |
| sharps-50 | RIFLE_BREECHLOADER | 2/3/4 | 200:0.30, 400:0.18, 600:0.08 | no | 0.5/1/2 | MEDIUM |
| muzzleloader-trade | RIFLE_MUZZLELOADER | 1/1.5/2 | 75:0.25, 150:0.10 | no | 3/5/8 | MEDIUM |
| bow | BOW | 6/8/10 | 40:0.25, 80:0.12, 120:0.05 | **yes** | 0/0/0 | MEDIUM (indirect use LOW-quantified) |

## 5. Tactics profiles [CAL][REVIEW]
| id | standoffFire | infiltration | shockCharge | dispersion | withdrawalDiscipline | targetHorses | dismountHolderFraction |
|---|---|---|---|---|---|---|---|
| us-cav-doctrine-1876 | 65 | 20 | 45 | 25 | 55 | 20 | 0.25 |
| plains-warrior-fox | 55 | 90 | 70 | 90 | 70 | 85 | 0.10 |
| irregular-scout | 50 | 70 | 30 | 80 | 65 | 40 | 0.10 |

Provenance: Fox (1993) tactical model; US cavalry doctrine. Weights are
parameterizations — LOW.

## 6. Leaders [REVIEW — D15: numbers proposed by Claude from research §H evidence]
Format: aggression / tacticalSkill / rally / perception / orderDelayMinutes.
Each leader's `ratingsProvenance.note` must quote the §H behavioral evidence line(s).

**7th Cavalry**
| id | name | ratings | traits | attachedTo |
|---|---|---|---|---|
| custer | Lt. Col. G. A. Custer | 92/65/70/35/0 | fears-enemy-escape, divides-force, attacks-on-contact | co-f |
| reno | Maj. Marcus Reno | 40/40/25/45/5 | first-indian-battle, brittle-under-pressure | co-a |
| benteen | Capt. Frederick Benteen | 35/70/85/60/15 | deliberate-pace, defensive-anchor | co-h |
| keogh | Capt. Myles Keogh | 55/60/55/50/2 | veteran | co-i |
| yates | Capt. George Yates | 55/55/50/50/2 | trusted-subordinate | co-f |
| calhoun | 1Lt James Calhoun | 50/55/60/50/2 | steady | co-l |
| weir | Capt. Thomas Weir | 75/50/50/55/0 | initiative-prone | co-d |
| french | Capt. Thomas French | 55/60/65/50/2 | steady-under-fire | co-m |
| moylan | Capt. Myles Moylan | 50/50/50/50/2 | reliable | co-a |
| mcdougall | Capt. Thomas McDougall | 45/45/50/45/10 | train-escort | co-b |

**Coalition** (orderDelayMinutes 0 across — initiative culture)
| id | name | ratings | traits | attachedTo |
|---|---|---|---|---|
| sitting-bull | Sitting Bull | 30/60/90/70/0 | spiritual-authority, noncombatant-protector | hunkpapa-pool |
| gall | Gall | 85/70/75/65/0 | leads-by-example, flanker, family-killed-in-attack | gall-band |
| crazy-horse | Crazy Horse | 90/90/85/80/0 | flanking-sweep, leads-by-example | crazy-horse-band |
| crow-king | Crow King | 75/60/65/55/0 | leads-by-example | crow-king-band |
| two-moons | Two Moons | 70/60/65/60/0 | leads-by-example | cheyenne-pool |
| lame-white-man | Lame White Man | 90/65/85/55/0 | decisive-charge | lwm-band |
| white-bull | White Bull | 85/55/60/55/0 | prominent-warrior | minneconjou-pool |
| hump | Hump | 75/55/60/55/0 | prominent-warrior | minneconjou-pool |

## 7. Units [REVIEW for warrior decomposition (D14)]

**7th Cavalry.** All companies: kind CAVALRY_COMPANY, mounted true, baseMorale 60,
tacticsProfileId us-cav-doctrine-1876, weaponMix {springfield-1873-carbine: 1.0,
colt-saa: 1.0}, ammunition per man {springfield: 90/100/100 (50 on person + 50
saddlebag), colt: 24/24/24}, startFormation COLUMN, provenance HIGH (research §A),
start position: column near the divide ~{45.51, -107.33}. Strengths (low/best/high)
from §A:
- Reno bn: co-a 40/45/50 (moylan), co-g 38/45/50, co-m 40/45/50 (french)
- Benteen bn: co-h 40/45/50 (benteen), co-d 40/45/50 (weir), co-k 38/42/45
- Custer bn: co-c 38/40/45, co-e 38/40/45, co-f 38/40/45 (yates), co-i 38/40/45
  (keogh), co-l 38/40/45 (calhoun)
- co-b 40/45/50 (mcdougall) + pack-train: kind PACK_TRAIN, 120/130/140, mounted true,
  baseMorale 50, COLUMN; ammunition note verbatim "~26,000 rds reserve on mules"
  (model as springfield reserve pool).
- arikara-scouts: SCOUT_DETACHMENT, 35/37/39, irregular-scout, weaponMix
  {springfield-1873-carbine: 0.5, muzzleloader-trade: 0.3, bow: 0.4}, baseMorale 55.
- crow-scouts: SCOUT_DETACHMENT, 6/6/6, irregular-scout, weaponMix
  {springfield-1873-carbine: 0.7, henry-winchester-44: 0.3}, baseMorale 65.

**Coalition warriors.** Master estimate 900/1750/2500 (D13). Best-case decomposition
below; low/high scale by ×0.514 / ×1.429, rounded to nearest 5. All: WARRIOR_BAND,
mounted true, baseMorale 70, plains-warrior-fox, DISPERSED, weaponMix
{henry-winchester-44: 0.11, muzzleloader-trade: 0.20, sharps-50: 0.04, bow: 0.70},
ammunition [CAL] {henry: 40, muzzleloader: 20, sharps: 20, bow: 25}, provenance LOW
with note "unit decomposition is model invention per D14; the coalition did not
fight as discrete units".
| id | best | start position |
|---|---|---|
| hunkpapa-pool | 230 | ~45.520,-107.430 |
| gall-band | 150 | hunkpapa circle |
| crow-king-band | 80 | hunkpapa circle |
| oglala-pool | 230 | ~45.535,-107.440 |
| crazy-horse-band | 200 | oglala circle |
| minneconjou-pool | 265 | ~45.545,-107.445 |
| sans-arc-pool | 195 | ~45.548,-107.447 |
| blackfeet-santee-pool | 160 | north-center (merged Blackfeet+Santee+small circles; note the merge) |
| cheyenne-pool | 150 | ~45.552,-107.450 |
| lwm-band | 60 | cheyenne circle |
Best sum = 1720 vs master 1750 — 30 held as rounding headroom; note it.

**Noncombatant camps** (NONCOMBATANT_CAMP, strength = population share of ~7000 minus
warriors, mounted false, CAMP, baseMorale 40, no weapons): hunkpapa-camp,
oglala-camp, minneconjou-camp, sans-arc-camp, mixed-north-camp, cheyenne-camp
(polygons around circle centers) + pony-herd (strength 1, ~45.535,-107.460, note
"herd size LOW; 'tens of thousands' claimed").

## 8. Orders
Minute conversions: 12:00→540, 12:07→547, 12:15→555, 14:15→675, 14:20→680,
14:35→695, 15:00→720, 15:15→735, 15:30→750, 15:45→765, 16:00→780, 16:20→800,
16:45→825, 17:00→840, 17:25→865, 17:45→885.

| id | min | issuer | recipients | type | objective | transMin | historicalText | conf |
|---|---|---|---|---|---|---|---|---|
| approach-march | 0 | custer | all US units | MOVE | waypoint: the divide | 0 | — | MEDIUM |
| division-halt | 540 | custer | all US | HOLD | at divide | 0 | — | HIGH |
| benteen-oblique | 547 | custer | co-h, co-d, co-k | SCREEN | waypoints: SW bluffs sweep | 2 | verbal summary: "pitch into anything," send word | HIGH |
| reno-advance | 555 | custer | co-a, co-g, co-m, arikara-scouts | ATTACK | ford-a → village S end | 2 | "move forward at as rapid a gait as he thought prudent, and charge the village afterwards, and the whole outfit would support him" | HIGH |
| custer-bluff-route | 555 | custer | co-c, co-e, co-f, co-i, co-l, crow-scouts | MOVE | waypoints: Sharpshooter Ridge → Weir vicinity → Cedar Coulee | 0 | — | MEDIUM |
| packs-follow | 555 | custer | co-b, pack-train | MOVE | trail waypoints | 5 | — | HIGH |
| kanipe-msg | 680 | custer | co-h (Benteen bn) | MOVE | toward Custer w/ packs | 25 | verbal: hurry the pack train / come on | MEDIUM |
| martini-msg | 695 | custer | co-h (Benteen bn) | MOVE | to Custer's position, bring packs | 25 | "Benteen. Come on. Big Village. Be quick. Bring Packs. W. W. Cooke. P.S. Bring Packs." | HIGH |
| reno-skirmish | 720 | reno | co-a, co-g, co-m | DISMOUNT_SKIRMISH | valley line | 0 | "Dismount!" | HIGH |
| reno-to-timber | 735 | reno | co-a, co-g, co-m | WITHDRAW | timber loop | 0 | — | HIGH |
| reno-retreat | 750 | reno | co-a, co-g, co-m | WITHDRAW | reno-hill via retreat-crossing | 0 | "Mount!" — charge to the rear (execution became a rout) | HIGH |
| yates-ford-b-probe | 765 | custer | co-e, co-f | SCREEN | ford-b | 0 | BASELINE = feint per D12/F1 | DISPUTED→baseline |
| right-wing-ridges | 765 | custer | co-c, co-i, co-l | HOLD | Nye-Cartwright → Calhoun Hill | 0 | — | MEDIUM |
| hare-ammo | 780 | benteen | pack-train | RESUPPLY | ammo mules forward to Reno Hill | 10 | — | HIGH |
| wing-consolidate | 800 | custer | co-e, co-f | MOVE | Battle Ridge / Last Stand Hill | 0 | — | LOW (inference) |
| weir-advance | 840 | weir | co-d | MOVE | weir-point | 0 | BASELINE = Weir's own initiative; variant flips issuer | DISPUTED→baseline |
| weir-recall | 865 | benteen | co-d | WITHDRAW | reno-hill | 5 | — | MEDIUM |
| gall-response | 720 | gall | gall-band, crow-king-band, hunkpapa-pool | ATTACK | targetUnit co-m | 0 | initiative-culture reconstruction | MEDIUM |
| gall-calhoun | 800 | gall | gall-band, crow-king-band | ATTACK | targetUnit co-l | 0 | — | MEDIUM |
| crazy-horse-sweep | 780 | crazy-horse | crazy-horse-band, oglala-pool | MOVE | waypoints: downstream crossing → N flank Battle Ridge | 0 | — | MEDIUM |
| ch-strike | 825 | crazy-horse | crazy-horse-band, oglala-pool | ATTACK | targetUnit co-i | 0 | — | MEDIUM |
| lwm-charge | 825 | lame-white-man | lwm-band, cheyenne-pool | CHARGE | targetUnit co-c | 0 | — | MEDIUM |

> ADDENDUM (D39, 07-15): reno-mount (749, MOUNT, co-a/g/m, 'Mount!') split out of reno-retreat's historicalText; see IMPLEMENTATION_HISTORY D39.

Remaining coalition pools have no orders: DEFEND_CAMP trigger behavior from the
tactics profile governs them.

## 9. Checkpoints
Transcribe the research §D checkpoint table verbatim (10 rows), converting times per
§8 (e.g., 14:15→675 Ford A, 15:45→765 Reno Hill, 16:00→780 Ford B, 16:15→795 Calhoun
Hill, 16:45→825 Keogh sector, 17:00→840 Last Stand Hill, 17:25→865 Weir Point).
toleranceMeters = the table's uncertainty column. toleranceMinutes: 15 (HIGH rows),
25 (MEDIUM), 40 (LOW).

## 10. Observation events
Transcribe research §J verbatim (9 rows). Minutes: dawn→60, 08:00→300, morning→360,
15:00→720, 15:40→760, afternoon→780, 16:20→800, 17:25→865. atmosphericFactor: 0.5 on
the Crow's Nest haze row; 0.4 on the Weir Point dust row; omit elsewhere. The 16:20
row (volleys heard, fight unseen from Reno Hill) is observed=false with note
"audible, not visible — terrain mask".

## 11. Variants (exclusion groups in braces)
| id | label | patch summary |
|---|---|---|
| v-mtc-crossing {mtc} | Medicine Tail: serious crossing attempt | modify yates-ford-b-probe → type CHARGE across ford-b; add E/F checkpoint at ford ~780 (tol 150 m); proponents: Utley (older view) |
| v-organized-last-stand {collapse} | Organized last stand | add profile us-cav-laststand (withdrawalDiscipline 80, dispersion 15); apply to co-c/e/f/i/l; extend Custer end-state byMinute 840→870; proponents: traditional accounts |
| v-c-company-split {wings} | C Company divided between wings | halve co-c strength + add co-c-det (half strength) to Yates-wing orders; proponents: pre-Fox theory |
| v-deep-ravine-ssl {ravine} | South Skirmish Line markers valid (Michno) | move E-company terminal checkpoint from Deep Ravine floor to SSL line ~45.569,-107.424 |
| v-weir-ordered {weir} | Weir advance ordered | modify weir-advance issuer → reno, transmissionMinutes 5 |
| v-reno-holds-timber {reno-timber} | COUNTERFACTUAL: Reno holds the timber | remove reno-retreat; add HOLD in timber; remove Reno-Hill checkpoints; provenance note `counterfactual: excluded from calibration scoring` |
| v-benteen-prompt {benteen} | COUNTERFACTUAL: Benteen comes quick | benteen orderDelayMinutes 15→3; kanipe/martini transmissionMinutes 25→15; counterfactual note as above |

## 12. Calibration targets
- casualties: co-c/e/f/i/l — killed = full strength (annihilated, no survivors);
  Reno/Benteen aggregate killed 45/53/60 and wounded 45/52/60, distributed per §K
  where itemized, else proportionally (note the method); coalition killed 31/60/300
  (best = 60 per Red Horse pictographs; DISPUTED), wounded 100/160/200 (Red Horse
  1877/1881; DISPUTED).
- endState: (1) co-c, co-e, co-f, co-i, co-l each DESTROYED byMinute 840
  (v-organized-last-stand extends to 870); (2) all Reno/Benteen companies + pack-train
  HOLDING_AT reno-hill byMinute 1080.
- scoring weights: checkpoint 0.35, casualty 0.25, endState 0.25, observation 0.15.
