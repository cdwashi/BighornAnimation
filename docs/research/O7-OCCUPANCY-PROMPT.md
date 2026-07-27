# Deep Research Prompt — O7 Ground Occupancy

**Prompt ID:** O7-OCCUPANCY
**Purpose:** a sourced answer to one question — how much ground does a body of fighting men occupy? — for 1870s North American warfare, in the specific regimes below. One downstream ruling derives feature capacity, unit extent, and dispersal from these figures.
**Companion discipline:** the same failure-mode rules as O5-RESOURCE. The success condition is an accurate verdict, not a number in every slot.

---

## THE EXCLUSION CLAUSE — read before anything else, it is what makes this research usable

**Do not source any figure from the Battle of the Little Bighorn.** Not Reno's skirmish line (the "225-yard" / ~206 m figure or any variant of it), not warrior positions or densities there, not any quantity reasoned backward from any Little Bighorn deployment, and not a secondary source's general claim if that claim itself derives from Little Bighorn evidence.

The reason is registered in the project's prediction register before your dispatch: your figures will be used to **predict** a Little Bighorn quantity as a pre-registered out-of-sample check. Any Little Bighorn-derived input voids that check. The project's own prior working figure (2.0 m per man) was derived from Reno's line and is therefore unusable for this purpose — do not "confirm" it by finding its source.

If a candidate source's figure is Little Bighorn-derived, record the row with verdict **EXCLUDED-CIRCULAR**, name the derivation chain, and do not use it. An EXCLUDED-CIRCULAR row is a valuable result.

## Quantities required

Report every figure as **low / best / high with a separate source per bound** (never average competing figures — the spread carries the dispute), with page-level citations, and units stated.

**Q1 — Formed skirmish order, US cavalry, dismounted (1870s): LINEAR ground per man** (meters or yards of front per man on the line). Doctrine prescribes this directly: consult **Upton's Cavalry Tactics (the 1874 revised edition) and the contemporaneous revised regulations** rather than reconstructing intervals from battle narrative. Note what the prescription assumes (interval between men, whether file closers/horse-holders are excluded from the line).

**Q2 — Loose/dispersed Plains warrior fighting: LINEAR spacing where sources support it, and AREA per man (m²) for a body fighting massed under cover or on a terrain feature. Mounted and dismounted SEPARATELY** — a mounted man occupies several times the ground of a dismounted one, and the coalition fought both ways; an average across the two regimes is not usable. Sources: Fox's tactical model and Plains-warfare scholarship; comparative engagements are legal (Powder River, Slim Buttes, Dull Knife, Wolf Mountain) — **Little Bighorn is not.**

**Q3 — AREA per man generally** for a firing line with depth or a massed body (both cultures' regimes as available). Expect drill literature to be largely silent on area; report what actually exists. **If area comes back with no publication-grade support, say so plainly — CONFIRMED-WEAK on area is a real finding that constrains a downstream ruling, and it is a complete answer.**

## Output format

Markdown. One row per quantity-regime pair.

| quantity | regime | linear or area | low / best / high (units) | source per bound (author, work, page) | verdict | notes |
|---|---|---|---|---|---|---|

`verdict` is exactly one of:

- **SOURCED** — publication-grade support (doctrine, scholarly monograph, archaeological or documentary study), consulted directly
- **SOURCED-WEAK** — only low-tier or indirect support exists; state the best available
- **RELAYED** — a promising source exists but was not consulted; name it and where it is held
- **EXCLUDED-CIRCULAR** — the figure derives from Little Bighorn; derivation chain named; not used
- **UNRESOLVED** — could not be determined

Close with:

1. **Bibliography**, each entry marked consulted directly or relayed.
2. **Access register** — sources that would settle open rows but were unavailable, with holding institution.
3. **Closing JSON:** `{ "promptId": "O7-OCCUPANCY", "counts": { "SOURCED": n, "SOURCED-WEAK": n, "RELAYED": n, "EXCLUDED-CIRCULAR": n, "UNRESOLVED": n } }`

## Standing instructions

- Do not average. Do not inflate precision beyond the source ("extended order" is not a number; say so).
- Do not silently drop a quantity you could not source — it gets a row and a verdict.
- Mounted and dismounted figures are never merged.
- A verdict that the literature does not support a number is more valuable than a manufactured one.
