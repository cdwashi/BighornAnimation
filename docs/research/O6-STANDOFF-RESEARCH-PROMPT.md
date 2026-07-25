# Deep Research Prompt — Village-Defense Standoff Geometry (Little Bighorn, 25 June 1876)

**Prompt ID:** O6-STANDOFF
**Requested:** 2026-07-24
**Gates:** ledger ruling D88 (camp-defence re-path). Implementation is blocked until this returns.

---

## Role and objective

You are a research analyst compiling a structured historical dataset for a terrain-accurate, minute-by-minute simulation of the Battle of the Little Bighorn. Output will be transcribed into a machine-readable scenario file, so **structure, citation, and honest uncertainty matter more than narrative prose.** Do not write a story of the battle. Fill the deliverable tables.

**The single question:** when warriors moved to defend a threatened village circle against an approaching cavalry force, **where did they establish themselves relative to the lodges** — and is that position describable as a *distance*, or only as *specific terrain features*?

### Why this is being asked (read, then set aside)

The simulation currently sends a defending band to the geometric midpoint between its camp and the approaching threat. That is an acknowledged placeholder with no source behind it, and it is being replaced. You are supplying the replacement.

**Now set that aside.** Do not reason backward from what would be convenient for a simulation. If the record says defenders stood 200 m out, say 200 m. If it says 1,500 m, say 1,500 m. If it says the concept of a standoff distance does not fit the evidence, say that — §D exists for exactly that answer, and returning it is a success, not a failure. A number invented to fill a slot is worse than no number, because it will be scored against history and will silently absorb the error of everything around it.

## Conventions (apply throughout)

- **Positions:** WGS84 decimal degrees to 4 decimal places, **plus** the named terrain feature. Where a position is known only relative to a landmark, say so and give the landmark.
- **Distances:** metres. If a source gives yards, paces, or "about a rifle shot," report the original wording and units alongside your conversion, and note the conversion assumption.
- **Quantities in dispute:** report as **low / best / high**, with a **separate source for each bound**. **Never average competing figures into a single number.** A spread carries the disagreement; an average destroys it.
- **Confidence rating** on every row, exactly this scale:
  - **HIGH** — physical archaeology, or multiple independent primary accounts
  - **MEDIUM** — single credible primary account, or strong scholarly consensus
  - **LOW** — inference or reconstruction
  - **DISPUTED** — competing published interpretations exist → one labelled row per alternative; do not blend
- **Citations:** author + work + page/locus wherever possible. Checkable beats vague. A claim you cannot locate a citation for should appear in §H (negative findings), not in a deliverable table.
- **Measurement basis:** every distance must state what it is measured *from* — the nearest lodge line (camp edge) or the circle's approximate centre. These differ by several hundred metres for the larger circles, and the distinction is load-bearing. Where you can, give both.

## Source hierarchy (weight in this order when accounts conflict)

1. **Archaeological record** — Scott, Fox, Connor, Harmon, *Archaeological Perspectives on the Battle of the Little Bighorn*; Fox, *Archaeology, History, and Custer's Last Battle* (1993); subsequent valley-floor and Reno-fight survey work. Cartridge-case distributions and firearms-identification analysis are physical evidence of who fired from where and override testimony when they conflict.
2. **Time-motion and synthetic scholarship** — Gray, *Custer's Last Campaign* (1991); Fox (1993); Michno, *Lakota Noon* (1997); Donovan; Philbrick; Utley.
3. **Contemporary official records** — 1879 Reno Court of Inquiry transcripts; Reno's and Terry's official reports; Godfrey.
4. **Native eyewitness accounts** — Michno; Hardorff, *Lakota Recollections* and *Cheyenne Memories*; Marquis, *Wooden Leg*. For the defenders' own positioning these are the **primary** record — the cavalry saw the defence from outside it. Note translation and recording caveats.
5. **Later reminiscence and popular accounts** — lowest weight; flag when a widely repeated figure traces only to this tier.

Where modern scholarship has debunked an older claim, say so explicitly rather than omitting it silently.

## Deliverables

### A. The Reno valley fight — primary case

Reno's battalion advanced north down the valley toward the Hunkpapa circle at the village's southern end, halted, dismounted, and formed a skirmish line. Defenders came out to meet it. Establish that geometry.

| item | position (lat, lon) | feature name | distance from Hunkpapa lodge line (m) | distance from Hunkpapa circle centre (m) | how known | positional uncertainty (m) | sources | confidence |
|---|---|---|---|---|---|---|---|---|

Rows required, at minimum:
- Southern extent of the Hunkpapa lodge line (the edge Reno was approaching)
- Approximate centre of the Hunkpapa circle
- Reno's halt point
- Reno's dismounted skirmish line (both ends if the line's extent is documented)
- The timber / brush position Reno subsequently occupied
- **Warrior firing positions facing the skirmish line** — this is the row the whole request exists for. Multiple rows if positions are documented at several points along the line.
- The left-flank warrior movement that turned Reno's open flank, if its position is documented

State plainly whether the warrior positions are known from archaeology, from Native testimony, from cavalry testimony, or by inference from the skirmish line's location.

### B. Ford B / Medicine Tail — second, independent case

Custer's approach toward the Minneconjou and Cheyenne circles at the north end is a second instance of the same behaviour, with different terrain and a different approach axis. Same columns as §A, measured against whichever circle the defenders were covering.

This case matters because it tests whether §A's geometry is a general pattern or an artefact of the southern approach. If the two cases disagree, **report the disagreement rather than reconciling it** — a genuine difference between them is itself a finding, and it may indicate the answer is terrain-driven (§D) rather than distance-driven.

### C. Timing of the defensive turnout

Feeds a separate open question about when defenders begin moving, not just where they stop.

| event | time (HH:MM local sun time, ± uncertainty) | circle / band | description | sources | confidence |
|---|---|---|---|---|---|

Cover: first alarm of Reno's approach; first warriors mounted or moving out; the defence established forward of the lodges; the point at which warrior numbers in the valley substantially exceeded Reno's; the shift of effort northward toward Custer. Anchor times to Gray's chronology and state the offset if a source uses a different clock.

### D. Distance or terrain? — the falsifiable alternative

**Answer this section explicitly. Do not skip it, and do not treat it as a fallback.**

Do the sources describe defenders establishing themselves at a *distance* from the lodges, or at *specific terrain features* that happen to lie at some distance?

| position / feature | described as | evidence it was chosen for cover, LOS, or ground rather than range | coordinates if identifiable | sources | confidence |
|---|---|---|---|---|---|

Candidate features to test against the record: the timber and brush along the Little Bighorn; dry sloughs and old channels on the valley floor; the bench or low ridge east of the river; ravines and coulees entering the valley; the bluff line. Named others as found.

Then give a **direct verdict paragraph**, choosing one:
1. **DISTANCE** — the record supports a characteristic standoff range; §E carries the number.
2. **TERRAIN** — the record describes feature occupation, and any apparent distance is incidental to where the cover happened to be; §E returns null and §D's feature table is the deliverable.
3. **BOTH, PHASED** — an initial screening distance followed by movement onto features as the fight developed, or vice versa. Give each phase separately with its own timing.

Verdict 2 is a fully acceptable outcome and should be returned without hedging if that is what the evidence shows.

### E. Proposed standoff range

Only if §D's verdict is DISTANCE or BOTH. If the verdict is TERRAIN, write "null — see §D" and move on.

| bound | value (m) | measured from (lodge line / centre) | derivation | sources | confidence |
|---|---|---|---|---|---|
| low | | | | | |
| best | | | | | |
| high | | | | | |

Each bound needs its own source. A bound derived by inference from a mapped position is acceptable if the derivation is shown; a bound with no derivation shown is not.

### F. Comparative Plains village-defence practice

Little Bighorn alone may not support a range. Widen the base with other engagements where a village was attacked and defenders came out:

- Washita, November 1868
- Powder River (Reynolds' attack), March 1876
- Slim Buttes, September 1876
- Dull Knife / Red Fork, November 1876
- Wolf Mountains, January 1877
- Others as the literature supports

| engagement | date | attacking force | defending village | where defenders established relative to lodges (m, and feature) | sources | confidence |
|---|---|---|---|---|---|---|

Note explicitly where an engagement's circumstances differ enough that it should **not** be used to bound Little Bighorn — a surprise dawn attack on a sleeping camp is not the same tactical problem as a daylight approach against an alerted village, and treating them as equivalent would import error.

### G. Non-combatant evacuation screen

At Little Bighorn the women, children, and elderly moved north and downstream while the fighting developed. If the defensive position was sized to buy evacuation time rather than to hold a range, that is a different mechanism and needs to be flagged.

| item | finding | sources | confidence |
|---|---|---|---|

Cover: whether sources describe the defence as covering an evacuation; the direction and timing of non-combatant movement; whether warriors deliberately stood far enough out to keep fire off the lodges; any evidence the defensive position moved as the evacuation progressed.

### H. Negative findings

**Required section — treat it as a deliverable, not a courtesy.**

What did you search for and fail to find? Which of the above rows have no supporting source? Which sources would settle the question but are not accessible to you — and where are they held? Which figures in circulation trace only to tier-5 reminiscence and should not be trusted?

A well-documented gap is more useful than a confident guess, because it can be closed later by targeted work. A guess cannot be distinguished from evidence once it is in the file.

---

## Output format

Markdown. Deliverables §A–§H in order, each as specified above, each followed by a short caveats paragraph where needed.

**Bibliography keys.** Cite using these existing keys wherever a source matches, so rows transcribe without a mapping step:

`GRAY1991` `FOX1993` `MICHNO1997` `SCOTT1987` `HEDREN1973` `RCOI` `TERRY1876` `RENO_RPT` `BENTEEN_RPT` `GODFREY` `GRAHAM` `NPS` `HMDB` `WIKI` `HISTNET` `WFHN` `WEB_MISC`

For a source with no existing key, propose one in the form `PROPOSED:KEYNAME` with a full citation in a closing bibliography block. Do not silently reuse `WEB_MISC` for a good source — that key is reserved for weak and low-tier material and carries a standing quality flag.

**Closing JSON block.** End the response with exactly this structure, so the result can be ingested directly:

```json
{
  "promptId": "O6-STANDOFF",
  "verdict": "DISTANCE | TERRAIN | BOTH_PHASED",
  "standoffMeters": {
    "low": null,
    "best": null,
    "high": null,
    "measuredFrom": "LODGE_LINE | CIRCLE_CENTRE",
    "provenance": {
      "confidence": "HIGH | MEDIUM | LOW | DISPUTED",
      "sources": [{ "key": "", "locus": "" }],
      "note": ""
    }
  },
  "terrainFeatures": [
    {
      "name": "",
      "lat": null,
      "lon": null,
      "distanceFromLodgeLineMeters": null,
      "chosenFor": "COVER | LOS | GROUND | UNKNOWN",
      "provenance": { "confidence": "", "sources": [{ "key": "", "locus": "" }] }
    }
  ],
  "turnoutDelayMinutes": {
    "low": null, "best": null, "high": null,
    "provenance": { "confidence": "", "sources": [{ "key": "", "locus": "" }] }
  },
  "evacuationScreen": { "supported": null, "note": "" },
  "openGaps": [""]
}
```

Set `standoffMeters` bounds to `null` if the verdict is TERRAIN. Leave any field null rather than filling it with an estimate — **null is a valid, useful answer here and an invented number is not.** `openGaps` should mirror §H in short form.

---

## Standing instructions

- Do not average competing figures. Ever.
- Do not convert a single account into a range by padding it — if only one figure exists, report one figure at its true confidence and say so in §H.
- Report the disagreement between §A and §B if there is one; do not reconcile it.
- If the honest answer to the central question is "the sources do not support a standoff distance," say so plainly in §D and return nulls in the JSON. That outcome closes the question just as well as a number would, and it will be acted on.
