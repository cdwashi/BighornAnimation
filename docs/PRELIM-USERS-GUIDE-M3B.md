# PRELIM USER'S GUIDE — Battle View (M3-B)

Derived from M3-SPEC §3–4, the M3-B work order, and CC's live verification.
Dual purpose: legend for evaluation, and checklist — anything here that is
absent or behaves differently in the running app is a legitimate review
finding. §6 lists what is deliberately NOT built yet, so absence there is
by design, not a defect.

There are now exactly two type="range" inputs: the timeline scrubber and the
continuous, logarithmic 1×–120× playback-speed control. There are still no
parameter or atmospheric sliders in M3.
Ghost markers — real (five references in battle-map.tsx).
Camp-defense activations — confirmed reaching the decision index: app/lib/decision-index.ts filters camp-defense-activated events into entries, matching V6's 23+6 count.


## 1. The map (always visible)

| Element | What it is / how to read it | (Chuck)can't see full map, no zoom, and can't reposition*
|---|---|
| Hillshade base | Grey-relief terrain, lit from the northwest — ridges cast SE shadows. This IS the visual identity; everything else sits lightly on it. |
| Contour lines | 5 m interval; every 25 m an **index contour** drawn heavier. Tight spacing = steep (the east-bank bluffs read as dense bands). |
| River + fords | The Little Bighorn as a polyline (the 297-point corrected channel). Three ford markers: **Ford A** (Reno's crossing, south), **Ford B / Medicine Tail** (north, at the coulee mouth), **Retreat Crossing** (below Reno Hill). The river is impassable to units except at these. |
| Cover polygons | Subtle fills: **timber** (the loop bend where Reno's valley fight ends), **village strip** (west bank, Garryowen reach → Ford B), **Deep Ravine**. These modify movement, concealment, and line of sight. |
| Landmark labels | Small-caps names at 21 points (Weir Point, Calhoun Hill, Last Stand Hill, Reno Hill, Crow's Nest, etc.). Labels only — no interaction expected in M3. |
| Unit markers | One marker per unit (33). **Side color**: US = blue, coalition = red (the only two accent colors in the app). Marker shows a **formation glyph** + a **strength bar**. |

### Formation glyphs (the marker's shape/arrangement)
COLUMN (march order) · LINE · SKIRMISH (dismounted firing line) · DISPERSED
(warrior bands' loose order) · CAMP (village circles, static). Also encoded:
**mounted vs dismounted** state, and a face-to-rear cue on units executing
WITHDRAW. Camps and the pony herd are static markers — they never march. (Chuck) put in legend on map*

## 2. Timeline (bottom rail)

| Control | Behavior |
|---|---|
| Scrubber | Drag anywhere in 03:00–21:00 (local sun time, Gray chronology). Scrubbing is **instant** (keyframes); the clock readout shows wallClock. |
| Play / Pause | Advances the simulation clock continuously. |
| Speed control | Continuous, logarithmic playback range from 1×–120×; the current multiplier is displayed. |
| Event tick-marks | Small marks along the scrubber at: order issue/receipt, spotting gains/losses, camp-defense activations. Use these to find "when things happen" without hunting. |
| Initial load | One-time ~5 s full-day reconstruction with a progress indication (D56). After that, everything is instant. | (Chuck) works as intended*

Note: **the timeline and playback speed are the only slider-like controls in
M3.** If you find yourself looking for parameter sliders, see §6.

## 3. POV mode ("What He Saw")

| Control | Behavior |
|---|---|
| Leader picker | All 18 leaders, both sides — Gall and Crazy Horse are as first-class as Custer. Selecting snaps the viewshed to that leader's attached unit at the current minute. |
| Viewshed overlay | Rendered as **light and shadow**: lit ground = visible from the leader's position (curvature- and cover-corrected); scrim/shadow = masked. Not a hard-edged game overlay. |
| Belief-vs-reality toggle | Switches the markers to the leader's SIDE's knowledge: **solid** = currently spotted · **ghosted** = last-known, drawn at the last-known position (may be stale — that's the point) · **absent** = never seen (truly absent, not faded). |
| Split view | Optional side-by-side: believed picture next to ground truth. The gap between the panes is the battle's information story. (Chuck) all needs visual enhancements*

## Correction to §3 of the guide:
Belief-vs-reality isn't a toggle plus an optional split — it's a cleaner three-state mode control: Reality | Belief | Split. And decision-index entries can deep-link a preset mode, which is why clicking the Cooke note lands you already in belief view. Adjust your mental checklist accordingly; arguably an improvement over what I spec'd |

Evaluation anchor: stand at **Custer / Weir vicinity / 15:40** with belief on —
the narrow lit wedge with only southern village markers is the project's
thesis frame. (Chuck) works as intended*

## 4. Decision index (side panel)

Chronological list, one entry per decision point: (Chuck) works as intended but needs visual enhancements*
- **23 labeled entries** — the historical orders: wallClock · issuing officer ·
  one-line label · recipients. These are *reconstruction*.
- **6 unlabeled, visually distinct entries** — engine-generated camp-defense
  activations (the village alerting on its own physics, 12:33–12:47). These
  are *emergent*; the visual distinction is deliberate and worth judging.
- **Click any entry** → clock jumps to that minute, POV snaps to the issuer,
  belief mode opens. (The Cooke-note entry at 14:35 is the signature test.)

## 5. What the states mean (quick legend)

| Symbol/state | Meaning | put in legend on map*
|---|---|
| Blue marker | 7th Cavalry unit |
| Red marker | Lakota/Cheyenne coalition unit |
| Strength bar | Current effective strength (no combat yet, so it only changes via horse-holder bookkeeping on dismount) |
| Ghosted marker (POV) | Last-known contact — position frozen at the moment sight was lost |
| Lit / shadowed terrain (POV) | Visible / masked from the selected leader, physics-computed |
| Scrubber tick | An event (order, spotting change, activation) at that minute |

## 6. Deliberately NOT in M3 — do not hunt for these (Chuck) Understood*
- Variant toggles (MTC crossing, organized last stand, counterfactuals) — **M5**
- Parameter panel / sliders (leader ratings, strengths, timing offsets) — **M5**
- Calibration report card — **M5**
- Combat, casualties, morale states, rout visuals — **M4** (strength bars will
  not drop; engagements show as `contact-pending` standoffs at 150 m)
- Sound, tutorial/onboarding, mobile layout — **M6/backlog**
- Atmospheric haze slider — backlog (events carry their own factors internally)

## 7. Suggested evaluation passes
1. **Legibility**: zoomed out, can you tell formation, side, and mounted state
   apart at a glance? Do labels fight the terrain? (Chuck) Side clearbut unit not clear, tool tip?*
2. **The three signature scenes**: Custer/Weir 15:40 (belief on); (Chuck) checked - ok* Reno at the
   valley skirmish line 15:00 (southern camps visible, north masked); (Chuck) checked-ok*any
   leader on Reno Hill 16:20 (Custer field in shadow — audible, not visible,
   though sound itself isn't modeled).(Chuck) checked-shadow/light needs enhancement*
3. **Ghost semantics**: lose a contact (scrub forward past a spotting-loss
   tick) — is it obvious the ghost is stale knowledge, not a live unit? (Chuck) not clear*
4. **Decision index density**: 29 entries — scannable or cluttered? Is the
   reconstruction/emergent distinction legible without explanation? (Chuck) needs clear explanation*
5. **Coalition POV**: does standing in Gall's or Crazy Horse's position feel
   as intentional as Custer's, or like an afterthought? (Chuck) as intentional*
6. **Terrain restraint**: does any UI chrome fight the map? (The brief's core
   rule: chrome stays out of the terrain's way.) (Chuck) need ability repostion whole map and zoom into unit markers*
