# VIEWING GUIDE — the M6 re-baseline sitting (prepared 2026-08-07)

*For Chuck, before the first human look at the product since D77. This is a
RE-BASELINE, not a review: the UI code changed twice since your last acceptance
(both changes flagged below), and the UI content — every run the app displays — has
moved under roughly twenty rulings of engine change. Nothing on screen tonight is
what you accepted then. Annotate inline as before — "(Chuck): ..." under any
section — and the annotated copy becomes the requirements record for the polish
round, the method that produced D57/D58 and the M4 rounds.*

**Launch:** `npm run dev` → http://localhost:3000. The app runs the committed
baseline scenario (stream `68325eff`) at **seed 18760600 — the D80 typical seed, the
envelope's MEDIAN member (composite 54.7161, exactly the 26th order statistic of 50;
components C1 0.5, C2 6/9, C3 4/13, C4 6/7; every figure derived from
`reports/d112-campaign-results.json`).** The run you're watching has a committed
campaign row: renoKilled 37, coalitionKilled 55, coalitionWounded 150, complete wing
destroyed. So the sitting's question sharpens from "does this look right" to "does
this look like THAT" — the reference numbers are on this page beside your
annotations. Same seed = same run: anything odd is reproducible; note the clock time
and it can be found again exactly.

**One rule for tonight: the last section lists what is UNBUILT BY FINDING. Don't
hunt for those — they are not bugs, they are the ruled queue.**

## 1. The map — two changes no human has seen

- **Three new landmark labels: foothills-1/2/3** joined the `important` set at
  WO-D111 (the D100 foothill features). Do they read well at your usual zoom? Do
  they crowd anything?
- **The banner now reads "JUNE 25, 1876 · SCENARIO CLOCK"** (was "LOCAL SUN TIME" —
  changed at D111 because the clock is scenario time, not solar time). Right call
  on screen?
- Everything else here (pan/zoom, ruler, contours, hillshade, legend, marker
  declutter) is as you accepted it — but look with fresh eyes anyway; that
  acceptance is three engine-eras old.

(Chuck):

## 2. The run itself — the deepest drift

The battle you'll watch derives from the post-D127 engine: the 253/52 sourced
ratio, the corpse-drift guards, and every mechanism ruling since D91. The register
knows this world's numbers (composite median 54.7161; the Calhoun collapse as a
sequential cascade — the mechanism D119 proved load-bearing; co-m surviving
near-band on some seeds). What no one knows is HOW IT READS as a spectacle: pacing,
legibility of the collapse, whether the valley phase and the hill defense read as
the events they reproduce.

(Chuck) — first-pass findings from the live sitting, 2026-08-07, transcribed by CC
from Chuck's real-time report; proper second-pass annotations may follow:

- Full watch-through completed. Overall the run reads OK; nothing I expected to see
  marked was absent on this pass (the absence-watch, partially answered — I'll keep
  looking on the focused passes).
- **END-OF-DAY LOCATIONS, the first-pass flag: I question the final end-of-day
  positions of companies A, H, and K, and especially of company C.** Locations, not
  casualties — the casualty numbers seem in line with history. Recorded as noticed,
  not diagnosed, per the sitting's rule.
  - *CC context for the adjudication, kept separate from the observation:* A/H/K
    (hill companies) are fresh ground — no one has examined their rendered
    end-positions, and C1 sits at exactly 50% with its misses unexamined through
    the UI. co-c's terminal position sits in ruled territory (D120's
    computed-destination majority, design; the D113/D114 released-escrow class —
    Calhoun HOLD units dying elsewhere via re-path) — but "reads wrong to a user"
    is a NEW product-level finding the register has never had. If any marker sits
    somewhere other than where the unit was watched dying, that is the
    corpse-drift class (guarded at D126) and escalates from observation to
    possible bug.

## 3. The decision index — drifted content, correct under test

You accepted it at 32 entries including 3 emergent leader deaths. It now shows
**29 entries: 26 orders, 3 camp-defense activations, 0 leader deaths** — the
rebalanced combat model no longer kills those leaders. Known and gate-verified;
the question for tonight is whether the index at 29 still tells the story (and
whether EMERGENT entries earn their place with leader deaths gone).

(Chuck):

## 4. The losses panel — known-blank columns, now past due

The killed/wounded split columns are RESERVED-BLANK by design, labeled "pending
the M5 model." **Not a bug tonight** — but the condition arrived weeks ago (the M5
model produces killed/wounded through fifty-seed envelopes), so this is a
candidate for the polish list: say whether you want the split populated, and
whether per-side or per-unit.

(Chuck):

## 5. POV and the viewshed — §11's three signature moments, as a user

The PRD's success metric names three moments. Check each as an experience, not a
test:

- **Crow's Nest, early:** the scouts see the herd/village signs; Custer does not.
- **Reno's valley position:** the village EXTENT is masked — he cannot see how big
  it is.
- **Reno Hill, late afternoon:** the Custer field is terrain-masked — the fight is
  unseen from the hill that heard the volleys.

The flashlight model (scrim + crossfaded beam) is as accepted at D77; the terrain
and engine under it are not.

(Chuck) — the §11 pass/fail, from the live sitting, 2026-08-07, transcribed by CC:

- **Moment 1 (Crow's Nest): FAIL, both halves.** I cannot see either view — not
  from Bloody Knife's POV at 04:00, not from Custer's at 08:00. And I don't see
  the scout units moving into any position where they could see the pony herd at
  those timestamps.
  - *CC diagnosis, verified against committed data and kept separate from the
    observation:* the finding is a PRODUCT GAP, not a broken model, and Chuck's
    "scouts never move into position" matches the bytes exactly. Both events carry
    an `observerPosition` override pinned at the Crow's Nest (45.4454, −107.1392,
    placed by the D60 ruling); the C4 exam raycasts from that pinned position
    (scouts `observed: true`; Custer `observed: false` under a 0.5 haze factor —
    his pass IS not-seeing). No order in the scenario takes any unit to the
    Crow's Nest; the app's POV mode reads the leader's LIVE marker position; and
    the Nest (~20 km east of the battlefield bounds, not in the map's `important`
    label set) plus the herd ("~15 mi W") are off the rendered map. **The
    acceptance test passes engine-side while the §11 metric it stands for is
    undemonstrable on screen — the gap read's engine-versus-app theme, caught a
    third time, by the sitting's only pass/fail item.** Fix options (scripted
    scout movement, a POV position override at those clock times, or re-scoping
    the metric) are the adjudicator's to rule; none attempted tonight.
- **Moment 2 (village extent masked from Reno's valley position, 15:00): PASS,
  no problem.**
- **Moment 3 (Custer field masked from Reno Hill, 16:20): PASS, no problem.**
- **Bonus 1 (15:40, Custer POV, the Weir Point village view — #133): PASS.** I can
  see the village view, and a little of the battle going on near the timber.
- **Bonus 2 (17:25, Weir POV, the Custer field): PASS.** I can barely see up north
  to where Custer is — *(CC note: at that distance and with the field's smoke,
  "barely" is plausibly the correct rendering, not a defect).*
- **Polish suggestion for the list: a POV location halo.** Every time I choose a
  different leader's point of view, a little circle or halo should appear around
  the company symbol where that leader is located — it would make these viewpoint
  checks much easier. *(CC: cheap, map-side only; would have sped this very
  diagnosis; candidate for the polish round.)*

## 6. The fight on screen — M4's surfaces on today's engine

Morale cues, encounter tooltips, fall markers, casualty ticks, engagement speed
cap, Reality/Belief/Split mode control. All accepted at M4-B/C; all now displaying
different content. Do the cues still land during the Calhoun cascade — is the
sequential collapse legible as a sequence?

(Chuck):

## 7. UNBUILT BY FINDING — do not hunt for these

- **Variant toggles + parameter panel** (M5's unshipped half — next after this
  sitting, ruled).
- **Accuracy report card** (after variants; its gate re-statement lands as a
  ruling first).
- Anything in V2-BACKLOG (belief states, first-person terrain, vignettes...).

If something you see tonight makes one of these more urgent than its ruled slot,
say so in the annotation and Fable re-ranks.

(Chuck):

## 8. Anything else

The catch-all your first-user review used to best effect ("all needs visual
enhancements" came from here). Whatever bothered you that no section asked about.

(Chuck):
