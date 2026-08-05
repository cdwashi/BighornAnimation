# The GNIS lookups — L1–L4, complete (registration `965b229`; Crow's Nest discipline throughout)

**Provenance, per the ruled boundary and the fifth practice:** all queries ran
2026-08-05 against `carto.nationalmap.gov/arcgis/rest/services/geonames/MapServer`
— USGS's first-party `.gov` service, self-described in its own service metadata as
"The National Map Gazetteer as the Federal and national standard (ANSI INCITS
446-2008) for geographic nomenclature based on the Geographic Names Information
System (GNIS)." One precision flagged rather than assumed: the §3 ruling named "the
authoritative USGS `.gov` endpoint"; the interactive search application
(`edits.nationalmap.gov/apps/gaz-domestic`) is a JavaScript shell that returns no
data to a fetch, so the queries ran against USGS's data service of the same
database — same publisher, same `.gov`, the National Map's serving layer. Whether
that satisfies "authoritative endpoint" is the adjudication's one-line call; the
verifier's opinion is yes (first-party USGS infrastructure is not a third-party
mirror; TopoZone/HometownLocator remain the relays the ruling named). Coordinates
below are converted from the service's Web Mercator (EPSG:3857) to WGS84;
conversion arithmetic in the session record; distances are great-circle to the
encoded scenario positions (data surface).

## L2 — Weir Point (#4): FOUND, 49 m

| field | value |
|---|---|
| gaz_name | Weir Point |
| gaz_id | 778173 |
| feature class | Summit |
| county / state | Big Horn / MT |
| GNIS position (WGS84) | 45.53414, -107.39295 |
| encoded position | 45.5345, -107.3933 |
| **distance** | **49 m** |

False-hit control surfaced by the query itself: "Weir Peak" (gaz_id 792926,
Lincoln County, ~500 km away) — excluded on coordinates, exactly the FID 770355
shape. **The D112 grant condition is satisfied for #4 as written: feature name,
ID, coordinates opened and recorded, on the battlefield, 49 m from the encoded
point.**

## L3 — Deep Ravine (#11): FOUND, linear feature, 496 m / 1,168 m

| field | value |
|---|---|
| gaz_name | Deep Ravine |
| gaz_id | 1956270 |
| feature class | Valley |
| county / state | Big Horn / MT |
| GNIS positions (WGS84, multipoint) | 45.56509, -107.42360 and 45.56032, -107.43349 |
| encoded position | 45.5693, -107.4257 |
| **distances** | **496 m and 1,168 m** |

The GNIS record is MULTIPOINT — a valley is a linear feature and the two points
sample its course; the encoded position sits north of both, toward the ravine's
river end. Both GNIS points are on the battlefield in Big Horn County adjacent to
the Last Stand Hill sector: the false-hit test passes cleanly; the sub-kilometre
offsets are feature-extent geometry, not identity doubt. Whether 496 m on a linear
feature satisfies the grant condition is the adjudication's call; the record
fields the condition names are all present.

## L4 — Nye-Cartwright Ridge (#6): FOUND — the encoded citation is VINDICATED

| field | value |
|---|---|
| gaz_name | Nye-Cartwright Ridge |
| gaz_id | 1956431 |
| feature class | Ridge |
| county / state | Big Horn / MT |
| GNIS position (WGS84) | 45.56152, -107.38915 |
| encoded position | 45.5561, -107.3967 |
| **distance** | **842 m** |

**The record EXISTS, under that exact name, on the battlefield.** #6's tension —
the encoded citation claiming USGS GNIS while the O5 verdict listed the claim
inference-derived — resolves in the CITATION'S favor: whoever encoded the
citation was right about what the database holds. A ridge is linear; the single
GNIS point sits 842 m from the encoded point along the same feature complex. Note
for the record: D112 held #1/#4/#11 partly because #6 "shows that designation is
not uniformly reliable" — the lookup shows the unreliability ran the other way:
the VERDICT, not the citation, was wrong about GNIS at #6.

## L1 — the divide (#1): NO RECORD — the upgrade dies

Queried as name-contains-"Divide", Landforms layer, Big Horn County AND Rosebud
County (the divide sits on their line): **zero features both times.** "The divide
(Reno Creek / Ash Creek)" is battlefield-literature nomenclature with no GNIS
feature behind it. **Per the frozen outcome: NO-RECORD is a result — the O5
verdict's "inference-derived" reading is vindicated for #1, and the upgrade is
killed permanently.** The encoded landmark itself is untouched (its LOW tier was
never the question; only the upgrade dies).

## The evidence state for the ruling

Four lookups, four different endings, every one a registered outcome: #4 clean
grant-condition satisfaction at 49 m; #11 satisfied at record level with the
linear-feature distances stated for the adjudication; #6 resolved FOR the encoded
citation — the O5 verdict takes the correction; #1 dead by no-record, verdict
vindicated. Granted tiers QUEUE-TO-RIDE the next natural break as inert-class
payload per §2 (pin (c) the instrument); zero scenario bytes move now; the
docs-side record is this report. Verdict lines are the adjudication's.
