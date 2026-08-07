# M6 GAP READ — the product against its own paper (2026-08-07, the post-sponsor resume; date per session environment, house calendar may differ by a day)

*One document, zero probes, drafted by CC on Fable's framing: PRD §9 (M6 scope), §8
(acceptance gates), §10 (the FR1–FR8 fence, R4/R5), §11 (success metrics), and
V2-BACKLOG's three sections, read against current state at `c024d84`. Every claim
carries its committed source. The methodology board is explicitly NOT a source of
candidates here.*

## §1 — M6's three scope items against current state

**M6 (PRD §9): "Playback UI polish, event index, accuracy report card; ship v1."**

**(a) Accuracy report card — NOT BUILT, and every number it needs already exists.**
The app contains no accuracy, calibration, confidence, or report-card surface of any
kind: grepping `app/` for those terms plus "composite" yields exactly three hits, all
of them the canvas API string `globalCompositeOperation`
(`battle-map.tsx:634,674,683`) — rendering plumbing, not a calibration surface.
Engine-side, FR8 is COMPLETE: the scorer emits a per-item
report (`score-cli`, `envelope-cli`), and the committed record holds everything the
card would show — composite median 54.7161 / mean 52.5409 [`68325eff`], per-component
scores with their lattices, calibration bands WITH per-bound provenance and DISPUTED
flags (the sideCasualties block is publication-grade sourcing on its face), C4 at
12/14 = 85.7%, and the three standing findings as honestly statable limits (D118
adjacency; D119/D120 arrival-micro-geometry — "the reproduction depends on geometry
the historical record cannot fix" is a USER-facing sentence, not just a methods-paper
one). **R4's mitigation list names this feature twice ("confidence surfaced in UI;
variants prominent; accuracy report card") and none of the three exists in the app.**
For a historical simulator, "what this is and isn't good for" is a product feature.

**(b) Playback UI polish — last human-reviewed at D77 (M4-C); one unreviewed change
since.** Chuck personally accepted every UI round through the viewshed pass (D57/58,
D76, D77 — the annotated users-guide method). The ONLY app commit since is `6d25c0f`
(WO-D111, 08-03), and its exact UI delta is two lines: three foothill landmark labels
added to the `important` set (`battle-map.tsx:590-594`) and the banner "LOCAL SUN
TIME" → "SCENARIO CLOCK". Both shipped through Codex, verified by diff and tests,
**seen by zero humans**. The one thing in this repo with no verification at all.
V2-BACKLOG's UX section holds Chuck's own "all needs visual enhancements" with
"M6 candidate first" on the split-view/POV pass.

**(c) Event index — EXISTS as the decision index, and its CONTENT has drifted
unreviewed.** The committed M4-era record says 32 entries including 3 emergent leader
deaths (`docs/Memory.md` §1, the 2026-07-18 state-at-break); the current committed V6
gate reports **29 entries, 26 orders, 3 activations, 0 leader deaths**
(`codex-report-wo-d128.md:249` — current through D131, since no engine byte has
changed after D127). The engine evolution from D91 through D127 changed who dies and
what the index shows, correctly and under test — but no human has looked at the index
the app now displays. **And the losses panel still ships RESERVED BLANK columns
labeled "Killed / wounded split pending the M5 model"
(`battle-view.tsx:264,278-279`) — a pending-condition that arrived weeks ago: the M5
model has produced killed/wounded numbers through fifty-seed envelopes.** Same class
as (b) throughout: content drift with zero eyes.

**The full statement of (b)+(c), because it is the whole case for the viewing
session: the UI CODE changed twice unreviewed — but the UI CONTENT, every run the app
displays, has moved under roughly twenty rulings of engine change since D77. Nothing
Chuck would watch tonight is what he accepted then.**

## §2 — A finding the framing didn't predict: M5's exit line is half-unbuilt

**PRD §9, M5: "Calibration pass + variant toggles + parameter panel."** The
calibration pass is the register's last twenty rulings. **The variant toggles and
parameter panel DO NOT EXIST in the app** — no variant string, no parameter panel
anywhere in `app/` (the only "parameter" hits are URL query parsing for map focus and
POV presets). Engine-side FR7 is done (variants apply as patches, exclusion groups
enforced, `variants.test.ts` green, seven variants committed in the scenario —
derived: `scenario.variants.length` = 7). The
milestone's UI half never shipped, and it matters beyond completeness: **§11's third
success metric — "at least two variant pairs (MTC feint↔crossing;
disintegration↔last stand) produce visibly different runs from the same engine" — is
currently UNDEMONSTRABLE IN THE PRODUCT**, because a user has no way to run a variant.

## §3 — §8 gates and §11 metrics, engine-side status (committed figures only)

- **C4 (the LOS exam): MET** — 12/14 = 85.7% ≥ 80%, on every committed run.
- **C5 (determinism): MET AND SUITE-GATED** — E1/E6/F1/F3 green, 121/121, exit 0.
- **C2 (casualty bands): the model OVER-wounds** against the sole sourced 160 (median
  192, band 71–258); flagship annihilation reproduces (F4 complete-wing 25/50 at
  envelope level). The 8/9 C2 ceiling is ruled STRUCTURAL until a width-bearing
  wounded source is located.
- **C1/C3: the PRD's gate language and the register's envelope law have diverged.**
  §8 is written for a single baseline run ("baseline run hits ≥70% of
  HIGH-confidence checkpoints"); the register judges distributions (D80), and C1
  sits at exactly 50.0000 across three streams — the n/2n lattice, an instrument
  property now three-streams-confirmed. **The gap: nobody has re-stated §8's gates
  in envelope terms and ruled them met/unmet. RULED AT ADJUDICATION: the
  re-statement is a RULING, not report-card content — §8 is the PRD's acceptance
  section, and a card displaying envelope-framed gates nobody ruled would be the
  product asserting an acceptance standard on its own authority (the same shape as
  an oracle adopting a hash it computed). The gate re-statement lands in the ledger
  FIRST; the card then displays a ruled standard.**
- **§11's POV metric** (three signature visibility moments): the exam covers the
  observation events; whether the PRODUCT demonstrates the three moments as a user
  experience was last seen by a human at the D77 viewshed acceptance, on a pre-D91
  engine. Ties to the viewing session below.
- **§11's second-battle metric**: post-v1 by construction (§6.0–6.3), untouched.

## §3a — Two backlog entries whose revisit condition has arrived (the closure claim
requires saying so)

V2-BACKLOG's strong-candidates section holds two entries whose own text names the
present moment: **the edge-of-treeline transmittance rule** ("revisit at M5 with the
full scorer") and **the spotting-table recalibration** ("redo at M5 with full scorer +
post-O3 Crow's Nest promotions"). The full scorer exists and the M5 calibration arc
just closed — both are PAST DUE by their own conditions. Both are engine-side model
work, so they rank below the §5 candidates on product value-per-cost, but the read
covers the backlog's three sections and these two name the current moment:
disposition is the adjudicator's.

## §4 — The fence, applied to ourselves

§10 R5: "v1 model is exactly FR1–FR8; anything else goes to the backlog." All
candidates below are FR-fence-clean: the report card is FR8's display, variant
toggles are M5's own line, the viewing session is zero code. And Fable's honest risk
belongs on this page in the product's own words: the standing-open methodology items
(adjacency, the rider's unit-extent half, O5 reads) are real and none of them makes
the simulator better for a user — **the methodology board is not a candidate source
for the next work.**

## §5 — Candidates, RANKED AS RULED (adjudicated 2026-08-07; the 52nd catch, the
adjudicator's, recorded with the ruling: he read §9's milestone list, took M6 as the
unshipped one, and never checked M5's exit in the PRODUCT — the engine-versus-app
confusion the read names as its theme, committed by the person who ordered the read
to look for it; consequence: M5 IS NOT CLOSED and M6 WAS NEVER THE FRONTIER)

1. **Chuck's viewing session — first, and framed as a RE-BASELINE, not a review:**
   nothing on screen tonight is what was accepted at D77. CC prepares the annotated
   guide BEFORE the sitting, with the drift explicitly flagged: what changed since
   D77, what the decision index used to say, which panels are known-blank so nobody
   hunts for bugs that are unbuilt features. Zero code; produces the polish list by
   the method that has worked twice.
2. **Variant toggles + minimal parameter panel — PROMOTED (ruled): it closes M5
   rather than opening M6** (the milestone sequence stops being fictional), it makes
   a stated success metric demonstrable (a hole in the project's own acceptance),
   and the report card is more useful after variants are runnable — a card that can
   only describe one baseline is a static page.
3. **The accuracy report card**, with the §8 envelope-terms gate re-statement RULED
   FIRST (see §3) so the card displays a ruled standard.
4. **Playback polish round** from whatever the session finds (V2-BACKLOG's "M6
   candidate first" split-view/POV pass is the standing member).

**The two past-due backlog entries (§3a): RECORDED AS DUE, NOT QUEUED** — engine-side,
below all four product candidates, held out of the product days by the §10 fence and
this read's own §4 — unless the viewing session independently surfaces them as
visible defects (a unit doing something wrong at a treeline changes this).
