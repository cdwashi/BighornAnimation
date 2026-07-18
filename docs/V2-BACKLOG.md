# V2-BACKLOG — Historical Battle Simulator

Ideas deferred beyond v1, each with its milestone-era origin and an honest
assessment. Nothing here is scheduled; entries graduate into milestone specs by
explicit ruling. The R4 test applies throughout: the product must never visually
assert more than the simulation knows.

## Strong v2 candidates

| Idea | Origin | Assessment |
|---|---|---|
| **Per-commander belief states** | M3 design (D46 guard) | Knowledge propagates by courier at horse speed; Benteen doesn't know what Reno knows. The tragedy as information-flow. Spotting events are already per-observer — re-aggregation, not schema break. The flagship v2 feature. |
| **First-person terrain view** | Chuck, post-M3-C | Three.js mesh from our own DEM, camera at leader eye height, curvature-corrected horizon; spotted units as map-style markers, masked units absent (FR3 in first person). "What Custer Saw" as a navigable scene — Crow's Nest at dawn, Weir Point at 15:40. Terrain-true and buildable from committed data. NOT character animation (see v3). |
| **Edge-of-treeline transmittance rule** | M3-A escalation (CC) | Observer inside cover shouldn't eat own-canopy attenuation looking out. Global, battle-agnostic; revisit at M5 with the full scorer. |
| **Engine performance pass** | D56 | A* + spotting dominate ~5 s/day; revisit after M4 reshapes the profile. |
| **Tier B geometry: Maguire georeferencing** | D25/O3 dossier | Northwestern IIIF full-res scan + the Scott/Donahue Oxbow-study method (documented ~120–145 m RMS per Maguire variant) = pre-written recipe for upgrading river/timber/village to MEDIUM-HIGH. |
| **Spotting-table recalibration** | M3-A finding 2 | Current table fit to 11 events; threshold overfit to the sparsest row (0.0001 margin); skirmish-line anchor drifted to ~6 km visibility. Redo at M5 with full scorer + post-O3 Crow's Nest promotions. |

## v2 visual/UX (from Chuck's first-user review, beyond the D57 fixes)

| Idea | Notes |
|---|---|
| Split-view and POV visual enhancement pass | "All needs visual enhancements" — deeper artistic treatment than the M3-C contrast fix; M6 candidate first. |
| Encounter vignettes (stylized) | If M4's encounter tooltips want emotional texture: clearly-stylized period-art illustrations (lithograph / Red Horse-pictograph aesthetic), unmistakably labeled as artist's impression, keyed to encounter type. The honest alternative to generated video. |
| (Chuck's further rendering suggestions) | Placeholder — to be itemized when delivered. |

## v3 / speculative (significant reservations recorded)

| Idea | Origin | Reservation |
|---|---|---|
| **3D character cutscenes** (Unity-style, 3rd/1st person animated figures) | Chuck | Art-asset production pipeline (models, rigs, choreography) — a different discipline; and R4 false-authority risk: rendered figures assert individual details (who stood where, fell how) the data does not contain. If ever pursued: framed hard as illustration, never as simulation output. |
| **Generated video on hover/zoom** (Genie-class) | Chuck | Triple problem: (1) R4 at maximum — fabricated visuals that *look* documentary; (2) latency/cost rules out live generation, so pre-rendered clips anyway; (3) AI-generated depictions of real historical figures and of violence against Native people is ethically fraught ground for a history product. The stylized-vignette entry above is the honest substitute for the underlying itch. |
| Dust-plume LOS occlusion | M3 spec | v1 models dust as detectability bonus only; plume as moving occluder is a real model addition. |
| Audio-range events | M3 spec | "Volleys heard" as a modeled channel (the 16:20 row's other half). |
| Time-of-day ambient haze model | M3 spec | Global atmospheric curve vs. per-event factors. |
| Multi-day clock, weather, emergent commander AI, scenario editor, run-to-video export, additional battles | PRD §12 | Carried from the original backlog. |
