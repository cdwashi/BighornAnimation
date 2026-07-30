# Deep Research Prompt — O8 Close-Action Lethality

**Prompt ID:** O8-MELEE
**Purpose:** a sourced answer to one question — **how do men kill at contact in this class of engagement?** — for Plains warfare against US cavalry, 1860s–1877. One downstream ruling will give a simulation's hand-to-hand contact a casualty mechanism; today it has none, and that absence is measured, not assumed.
**Companion discipline:** the same failure-mode rules as O5-RESOURCE and O7-OCCUPANCY. The success condition is an accurate verdict, not a number in every slot.

---

## THE CIRCULARITY GUARD — read before anything else; it replaces O7's exclusion clause

Unlike O7, **the Battle of the Little Bighorn is a legal and indeed primary evidence source here** — close action at the retreat crossing and on Custer's field is among the best-documented hand-to-hand fighting of the Plains wars, and the 1984–85 battlefield excavations bear on it directly.

The guard is against a different failure: **do not derive a rate from the outcome the simulation is graded on.** Your figures will parameterize the mechanism that produces close-action deaths in a model whose fidelity is judged against the battle's aggregate casualty totals. A figure obtained by dividing battle-level or battalion-level killed totals (either side) by an assumed time-in-contact or number-of-contacts is circular for this purpose — the mechanism would be fed its own grading key.

**Usable evidence classes:**
- **per-mechanism evidence** — wound and trauma typology, weapon-attribution archaeology, osteology (gunshot vs. arrow vs. blunt-force vs. edged);
- **per-incident evidence** — a named episode with its own local count and duration, attested independently of battle-aggregate reconstruction;
- **comparative engagements** — Fetterman (1866) especially, where close-action predominance is well attested; also Powder River, Slim Buttes, Dull Knife, Wolf Mountain as available.

If a candidate figure's derivation chain passes through Little Bighorn battle-aggregate casualty totals, record the row with verdict **EXCLUDED-CIRCULAR**, name the chain, and do not use it. An EXCLUDED-CIRCULAR row is a valuable result.

## Quantities required

Report every figure as **low / best / high with a separate source per bound** (never average competing figures — the spread carries the dispute), with page-level citations, and units stated.

**Q1 — Casualty production in hand-to-hand contact**, warriors against cavalry, this period and theater. In whatever units the sources natively support (casualties per man per minute in contact; casualties per closing event; proportion of a contacted body killed per bout). Mounted and dismounted contact separately where the record distinguishes them; warrior-on-trooper and trooper-on-warrior separately where it does. **Expect this to come back weak as a rate** — say so plainly if it does; CONFIRMED-WEAK on the rate with a strong Q2/Q3 is a complete and useful answer.

**Q2 — The native shape of the evidence.** Is close-action lethality in this record better characterized as **a rate over time-in-contact**, or as **the resolution of a closing event** — a rush/overrun that resolves in a single short bout with an outcome distribution (annihilation of the contacted fragment, its flight, or repulse)? Do not force a rate onto event-shaped evidence or vice versa. This is a modelling-form question and the sources' own shape is the answer; support it with how the episodes are actually described (the retreat crossing, Deep Ravine, Keogh's position, the Fetterman ridge).

**Q3 — The archaeological proportion.** What do the 1984–85 Custer battlefield excavations and subsequent analyses (Scott, Fox, Connor, Harmon; later osteological work) establish about the **proportion of deaths attributable to close action versus gunfire**? Report the proportion with its evidentiary basis (number of individuals analyzed, trauma categories, attribution method), the authors' own stated confidence, and the known biases (recovery rate, taphonomy, perimortem-vs-postmortem trauma ambiguity — state how the analysts themselves handle mutilation-vs-cause-of-death). Comparative archaeology (Fetterman if excavated/analyzed) welcome. **Expect this to be the strongest evidence class; treat it as the anchor and the others as shape.**

## Output format

Markdown. One row per quantity-regime pair.

| quantity | regime | native form (rate / event / proportion) | low / best / high (units) | source per bound (author, work, page) | verdict | notes |
|---|---|---|---|---|---|---|

`verdict` is exactly one of:

- **SOURCED** — publication-grade support (scholarly monograph, archaeological or documentary study), consulted directly
- **SOURCED-WEAK** — only low-tier or indirect support exists; state the best available
- **RELAYED** — a promising source exists but was not consulted; name it and where it is held
- **EXCLUDED-CIRCULAR** — the figure derives from Little Bighorn battle-aggregate casualty totals; derivation chain named; not used
- **UNRESOLVED** — could not be determined

Close with:

1. **Bibliography**, each entry marked consulted directly or relayed.
2. **Access register** — sources that would settle open rows but were unavailable, with holding institution.
3. **Closing JSON:** `{ "promptId": "O8-MELEE", "counts": { "SOURCED": n, "SOURCED-WEAK": n, "RELAYED": n, "EXCLUDED-CIRCULAR": n, "UNRESOLVED": n } }`

## Standing instructions

- Do not average. Do not inflate precision beyond the source ("the fighting was hand-to-hand" is not a rate; say so).
- Do not silently drop a quantity you could not source — it gets a row and a verdict.
- Mounted and dismounted contact are never merged; the two kill directions are never merged where the record distinguishes them.
- Testimony from both sides is in scope; where warrior accounts and cavalry accounts conflict, report both — the spread carries the dispute.
- A verdict that the literature supports an event-shape but no rate is more valuable than a manufactured rate.
