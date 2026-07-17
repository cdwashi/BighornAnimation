# O3 Research Prompt — Crow's Nest Coordinate + Maguire 1876 Map

Copy everything below the line into a new conversation with Research enabled.

---

## Role and objective

You are a research analyst locating a specific geographic point for a
terrain-accurate simulation of the Battle of the Little Bighorn: the **Crow's
Nest** — the Wolf Mountains vantage in Montana from which Lt. Charles Varnum's
scouts (Crow and Arikara, with Mitch Bouyer) observed the Lakota/Cheyenne pony
herd at dawn on June 25, 1876, roughly 15 miles west, and from which Custer
himself, arriving later that morning, could NOT make out the village through
haze. Secondary objective: locate an accessible scan of **Lt. Edward Maguire's
official 1876 map** of the battlefield.

This output feeds a computational adjudication: each candidate coordinate will
be tested with a digital-elevation viewshed model (earth-curvature corrected)
against the documented sightings. So **coordinates and their provenance matter
more than narrative**; report candidates separately, never average or blend
them, and never substitute a "close enough" landmark for the actual point.

## Critical warning — the decoy problem

The National Park Service interpretive marker/sign about the Crow's Nest is
located at or near the Reno-Benteen site for visitor access and is NOT at the
Crow's Nest. Databases (HMDB and similar) list THAT coordinate. Any candidate
within the national monument boundary or near Battlefield Road is the decoy —
report it only to label it as such. The true vantage is in the Wolf Mountains
near the Crow Reservation, on or near private land, roughly 20–25 km ESE of the
battlefield, near the divide between Rosebud Creek / Davis Creek drainage and
the Reno (Ash) Creek drainage.

## Deliverable A — Candidate coordinate table

One row per independent candidate. Columns:
| # | Lat, Lon (WGS84 decimal, 4+ places) | Elevation if stated | Basis (map plate / GNIS / study / GPS account) | Source (author, work, page/plate/URL) | How the coordinate was derived (stated outright vs. measured off a map by you — say which, and describe the map's georeferencing quality) | Confidence (HIGH/MEDIUM/LOW) |

Search these source families exhaustively:
1. **GNIS / USGS**: query the Geographic Names Information System for "Crows
   Nest" / "Crow's Nest" in Big Horn County and Rosebud County, Montana.
   Report the GNIS feature ID and coordinate if it exists; note if it does not.
2. **Time-motion scholarship with maps**: John S. Gray, *Custer's Last
   Campaign* (1991) — his divide-crossing analysis places the Crow's Nest
   relative to the divide and the morning halt; report any map plate that
   locates it and the coordinate you measure from it. Also Michno (*Lakota
   Noon*), Edgar I. Stewart (*Custer's Luck*), and Roger Darling's works on
   the approach march.
3. **The dedicated literature**: there is specialist writing on the Crow's
   Nest location question itself — including work associated with Michael
   Donahue (*Drawing Battle Lines* / park-ranger scholarship) and articles in
   *Greasy Grass* (the CBHMA annual), *Little Big Horn Associates Research
   Review*, and battlefield-guide literature (e.g., Jerome Greene). Several
   authors have visited and photographed the vantage; some accounts include
   GPS readings or precise topo placements. These are the highest-value
   sources — dig for them specifically.
4. **NPS historic resource studies / administrative histories** for Little
   Bighorn Battlefield NM, and the associated Wolf Mountains Battlefield or
   Rosebud Battlefield studies that map the June 1876 approach corridor.
5. **USGS topographic quadrangles**: identify which modern 7.5' quad covers
   the divide area, and whether "Crows Nest" is labeled on it; if yes, the
   labeled coordinate.
6. **Historical testimony for cross-check** (not coordinates, but constraints):
   Varnum's accounts, Godfrey, and the Crow scouts' recollections (White Man
   Runs Him, Goes Ahead, Hairy Moccasin via Camp/Dixon interviews) — anything
   describing the vantage's relation to the divide, the trail, Davis Creek,
   and the distance/bearing to the village. Summarize as a constraints list.

## Deliverable B — Physical description constraints

From all accounts: what should be true of the correct point? (e.g., a pocket or
notch just below/off the divide crest where horses could be hidden; scouts
climbed above it to observe; line of sight to the Little Bighorn valley ~24 km
WNW; the 1876 lodgepole trail up Davis Creek passes nearby.) Table: constraint |
source | confidence. These become secondary scoring criteria for candidates.

## Deliverable C — Maguire 1876 map

Lt. Edward Maguire (Engineer Officer, Department of Dakota) produced the
official map of the battlefield days after the battle; versions accompanied his
July 1876 report and the Reno Court of Inquiry, and derivatives were published
(including in the 1876 Annual Report of the Chief of Engineers).
1. Locate accessible scans: Library of Congress (loc.gov), National Archives
   catalog, the Annual Report of the Chief of Engineers 1876 (often digitized
   on Google Books / HathiTrust / archive.org), and the RCOI exhibit
   reproductions. Give direct URLs and state image resolution/quality.
2. Report which versions exist (there are at least two variants) and how they
   differ.
3. Describe what the map shows for: the river's 1876 course and crossings, the
   timber in the valley (Reno's fight area), the village site extent, and any
   marked trails — with enough specificity that a reader could compare it
   against modern geography.

## Rules

- Report each candidate separately with its own provenance; NEVER average
  candidate coordinates or merge "nearby" candidates into one.
- If you measure a coordinate off a map image yourself, say so explicitly and
  describe the measurement basis; do not present measured coordinates as if
  the source stated them.
- Distinguish the vantage point itself from: the divide crossing, the morning
  halt site, and the NPS interpretive marker (the decoy). If a source
  conflates them, note the conflation.
- End with a reliability summary: which candidate has the strongest paper
  trail, which sources could not be accessed, and what a field visit or FOIA
  request could add that the open literature cannot.
