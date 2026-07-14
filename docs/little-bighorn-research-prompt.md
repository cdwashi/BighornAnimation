# Deep Research Prompt — Little Bighorn Simulation Dataset


## Role and objective

You are a research analyst compiling a structured historical dataset for a terrain-accurate, minute-by-minute simulation of the Battle of the Little Bighorn, **June 25, 1876**. The output will be transcribed into a machine-readable scenario file, so **structure, citation, and honest uncertainty matter more than narrative prose**. Do not write a story of the battle. Fill the deliverable tables.

## Conventions (apply throughout)

- **Time**: Express all times in local sun time on the battlefield, anchored to John S. Gray's time-motion chronology (*Custer's Last Campaign*, 1991). If a source uses a different clock (e.g., Chicago railroad time, or a witness's watch), state the offset you applied. Every timeline row shows time as HH:MM.
- **Positions**: WGS84 decimal degrees (lat, lon) to 4 decimal places, **plus** the named terrain feature (e.g., "Weir Point", "Ford B / Medicine Tail ford"). Where a position is only known relative to a landmark, say so.
- **Quantities in dispute**: Report as **low / best / high** with the source for each bound. **Never average competing figures into a single number.**
- **Confidence rating** on every row, using exactly this scale:
  - **HIGH** — supported by physical archaeology or multiple independent primary accounts
  - **MEDIUM** — single credible primary account or strong scholarly consensus
  - **LOW** — inference or reconstruction
  - **DISPUTED** — competing published interpretations exist → report each alternative as a labeled row; do not blend
- **Citations**: Every row cites author + work + page/locus where possible. Prefer checkable citations over vague attributions.

## Source hierarchy (weight in this order when accounts conflict)

1. **Archaeological record** — the 1984–85 battlefield excavations and successors: Douglas Scott, Richard Fox, Melissa Connor, Dick Harmon (*Archaeological Perspectives on the Battle of the Little Bighorn*; Fox, *Archaeology, History, and Custer's Last Battle*, 1993). Cartridge-case distributions and firearms-identification analysis are physical evidence of who fired what from where; they override testimony when they conflict.
2. **Time-motion and synthetic scholarship** — Gray (*Custer's Last Campaign*, 1991); Fox (1993); Gregory Michno (*Lakota Noon*, 1997); James Donovan (*A Terrible Glory*); Nathaniel Philbrick (*The Last Stand*); Robert Utley.
3. **Contemporary official records** — the 1879 Reno Court of Inquiry transcripts; Reno's and Terry's official reports; Godfrey's account.
4. **Native eyewitness accounts** — as compiled by Michno, Richard Hardorff (*Lakota Recollections*, *Cheyenne Memories*), Thomas Marquis (*Wooden Leg*), and others. These are the **only eyewitness record of the Custer battalion's final phase** — no one in that battalion survived — so for Deliverables covering Custer's five companies after ~15:30, treat them as primary, noting translation and recording caveats.
5. **Later reminiscence and popular accounts** — lowest weight; flag when a widely repeated "fact" traces only to this tier.

Where modern scholarship has debunked an older claim, say so explicitly rather than omitting it silently.

## Deliverables

Produce each as a markdown table (columns specified below), followed by a short "caveats" paragraph if needed.

### A. 7th Cavalry order of battle
One row per company (A–M) plus scouts and pack train. Columns: company | battalion assignment on June 25 (Custer: C,E,F,I,L / Reno: A,G,M / Benteen: H,D,K / McDougall: B + packs — verify) | commanding officer(s) | effective strength that day (low/best/high) | weapons and ammunition carried per man (carbine rounds on person vs. in saddlebags; revolver rounds) | horse condition notes | sources | confidence.
Include the Crow and Arikara scout detachments (strength, names of key scouts, armament) and civilian personnel.

### B. Native coalition
1. One row per village circle (Hunkpapa, Oglala, Minneconjou, Sans Arc, Blackfeet Lakota, Two Kettle, Brulé if present, Northern Cheyenne, any Arapaho): estimated lodges | population | fighting-strength contribution (low/best/high) | position within the village layout (order along the river, with coordinates for each circle's approximate center) | sources | confidence.
2. Total fighting strength: give the published range with each figure's author (this is the heart of Custer's miscalculation — document what contemporary Army intelligence estimated vs. reality).
3. Key war leaders: Sitting Bull (role that day), Gall, Crazy Horse, Crow King, Two Moons, Lame White Man, White Bull, Rain-in-the-Face, others with documented battlefield roles. For each: band | documented actions and axis of attack | sources | confidence.
4. Weapons mix: archaeology-derived estimates of repeating rifles (Henry, Winchester 1866/1873), other firearms, muzzleloaders, and bows among the warriors — cite the firearms-identification counts from the Scott/Fox excavation analyses and the published extrapolations to total weapons. Report as fractions of fighting strength (low/best/high).

### C. Master timeline, June 25 (~03:00–21:00)
The core deliverable. One row per event. Columns: time (HH:MM, with ± uncertainty) | actor (unit/leader) | event | location (coords + feature name) | sources | confidence.
Cover at minimum: the night march and Crow's Nest observations; the divide crossing and battalion division (~12:00); the lone tepee; Reno's advance, valley fight, timber position, and retreat to the bluffs; Benteen's left oblique and return; the pack train's progress; Custer's route along the bluffs (Sharpshooter Ridge, 3411, Weir Point vicinity), Cedar Coulee, Medicine Tail Coulee; the Cooke/Martini message; movements onto Nye-Cartwright Ridge, Calhoun Hill, the Keogh sector, Last Stand Hill, Deep Ravine; warrior response timing on each axis (Gall from the south/east, Crazy Horse's northern sweep, Lame White Man's charge); the Reno-Benteen hilltop consolidation and Weir Point advance/withdrawal; onset of the hilltop siege.
Add a brief appendix row-set for June 26–27 (siege continuation, village departure, Terry/Gibbon relief) — summary level only.

### D. Position checkpoints
For calibration scoring. One row per (unit, time) pair where a position is documented. Columns: time | unit | position (coords + feature) | how known (testimony / archaeology / marker stones) | positional uncertainty in meters | sources | confidence.
Include coordinates for these landmarks as their own table: Crow's Nest, the divide, lone tepee site, Reno's crossing (Ford A), Reno's valley skirmish line, the timber, Reno's retreat crossing, Reno Hill, Weir Point, Cedar Coulee, Medicine Tail Coulee mouth (Ford B), Nye-Cartwright Ridge, Luce Ridge, Calhoun Hill, Calhoun Coulee, the Keogh sector, Last Stand Hill, Deep Ravine, and the approximate 1876 village extent (north and south ends).

### E. Orders and communications
Every known order or message that day. Columns: time issued | from | to | verbatim text if recorded (e.g., the Cooke note carried by Martini: quote it exactly) | transmission method and estimated delivery delay | whether/when executed | sources | confidence.
Include Terry's written instructions to Custer of June 22 (text and the discretion question), all orders at the noon division of the regiment, Custer's orders to Reno and to Benteen, the two messages to Benteen, Reno's orders during the valley fight and retreat, Benteen's decisions on receipt of the Martini message, Weir's advance (ordered or on initiative — mark DISPUTED as appropriate), and any documented coordination on the native side (recognizing their command culture was initiative-based — document what leaders actually did rather than forcing an order-based frame).

### F. Disputed interpretations (report alternatives — never blend)
For each dispute below (add others you find material): a labeled row per interpretation with its principal proponents, supporting evidence, and what it implies for unit movements/timing. These become toggleable variants in the simulation.
1. Medicine Tail Coulee: serious attempted crossing at Ford B vs. feint/reconnaissance repulsed — and which companies approached the ford.
2. Custer's wing structure after MTC: left wing (E, F) / right wing (C, I, L) split, routes of each.
3. Sequence and character of the collapse: Fox's "tactical disintegration" model vs. an organized last stand; duration of the final phase.
4. Deep Ravine: did Company E's remnant die there; the missing-bodies problem.
5. Reno's decision to leave the timber: tenability of the position, the death of Bloody Knife, orderly withdrawal vs. panic rout.
6. Benteen's pace returning with the packs: reasonable vs. dilatory (RCOI treatment vs. later scholarship).
7. Village size and whether Custer was outnumbered to the degree tradition holds.
8. Reliability of Curley's accounts of the Custer fight.
9. The "Custer shot early at the ford" claims.
10. Timing offsets: where Gray, Fox, and Michno chronologies materially disagree, tabulate the differences.

### G. Weapons and effectiveness data
One row per weapon system: Springfield Model 1873 carbine (.45-55), Colt 1873 SAA, Henry and Winchester repeaters, common muzzleloaders, bows (note their indirect/arcing use from dead ground). Columns: effective aimed rate of fire under combat conditions | effective range bands with hit expectations vs. exposed targets (cite period tests or scholarship where available; mark inferences LOW) | ammunition standard load | reliability issues — for the Springfield, quantify the extraction-failure debate using the archaeological pry-mark evidence (what fraction of recovered cases show extraction problems) | sources | confidence.

### H. Leadership and tactics profiles
Purpose: parameterize leaders (0–100 scales for aggression, tactical skill, rally ability, perception) and side doctrine. Do NOT invent numbers — provide the documented behavioral evidence from which numbers can be argued. One row per leader (Custer, Reno, Benteen, Keogh, Yates, Calhoun, Weir, French, Moylan, Gall, Crazy Horse, Two Moons, Lame White Man, Crow King, White Bull): documented behaviors that day and prior record | scholarly characterizations | sources | confidence.
Specifically document: Custer's operating assumption that the danger was the village **escaping**, not defeating him (Washita template, refusal of Gatling guns and the 2nd Cavalry offer, the June 25 decision to attack without full reconnaissance once he believed the command had been spotted); Reno's inexperience against Plains warriors; Benteen's documented defensive competence on the hilltop.
For native tactics, summarize Fox's model: infiltration through dead ground, individual initiative, suppression + short rushes, targeting of horse-holders, and how quickly resistance transitioned once cavalry cohesion broke.

### I. Terrain and environment, 1876 vs. today
- Little Bighorn River: 1876 channel vs. modern channel (documented meander changes, especially near Ford B and the Garryowen loop); ford locations and depths.
- Valley floor: timber and brush extent in 1876 (Reno's timber position) vs. now.
- Village: physical extent (length along the river, width), lodge counts, pony-herd location and size, and the dust/smoke conditions during the fight.
- Weather and visibility that day: temperature, haze (the Crow's Nest morning), dust.
- Grass/vegetation height on the ridges (affects prone concealment).
Columns: feature | 1876 state | modern state | evidence | sources | confidence.

### J. Observation events (line-of-sight ground truth)
Documented sightings and **failures to sight** — used to validate the simulation's visibility model. One row each. Columns: time | observer + position | target + its position | seen or not seen | limiting factor (terrain mask, haze, dust, distance) | sources | confidence.
Must include: Crow's Nest (scouts discern the pony herd ~15 miles off; Custer, arriving later, cannot); the Sioux sightings of the regiment's approach (the lost hardtack box incident, warriors observed near the divide); what Reno could and could not see of the village from Ford A and from the valley; what Custer could see from the bluff stops (the commonly cited waving-hat moment at/near Weir Point) — and, critically, from which points the full village extent was and was not visible; when the village first sighted Reno's advance and Custer's column on the bluffs; visibility between Reno Hill and the Custer field (what the hilltop command could see/hear of the Custer fight, including the volleys heard).

### K. Casualties and outcome
- 7th Cavalry: killed and wounded **per company**, plus scouts and civilians; officer losses by name; horses lost.
- Native losses: the published range low/best/high with each figure's provenance (this is genuinely disputed — treat accordingly).
- Ammunition expenditure evidence (archaeological case counts by sector, per-man loads remaining on the hilltop).
Columns as appropriate | sources | confidence.

## Final section: gaps and reliability report

Close with a candid list of (1) what could not be established at MEDIUM confidence or better, (2) which deliverable rows rest on a single source, and (3) the three areas where the dataset is weakest for simulation purposes.

## What NOT to do

- Do not average competing accounts into single numbers or positions.
- Do not fill gaps with plausible invention; mark them as gaps.
- Do not privilege the traditional heroic narrative or the revisionist one — follow the evidence tiering above.
- Do not omit a claim merely because it is disputed; report it under Deliverable F with its status.
