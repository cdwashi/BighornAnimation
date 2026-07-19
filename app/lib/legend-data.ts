export const FORMATION_LEGEND = [
  { glyph: '▮', label: 'Column', detail: 'march order' },
  { glyph: '—', label: 'Line', detail: 'formed battle line' },
  { glyph: '··', label: 'Skirmish', detail: 'dismounted firing line' },
  { glyph: '×', label: 'Dispersed', detail: 'loose warrior band' },
  { glyph: '△', label: 'Camp', detail: 'static village' },
] as const;

export const STATE_LEGEND = [
  { symbol: 'blue', label: 'Blue marker', detail: '7th Cavalry unit' },
  { symbol: 'red', label: 'Red marker', detail: 'Lakota/Cheyenne coalition unit' },
  { symbol: 'bar', label: 'Strength bar', detail: 'current effective strength' },
  { symbol: 'morale-steady', label: 'Steady', detail: 'formed; fine cartographic edge' },
  { symbol: 'morale-shaken', label: 'Shaken', detail: 'unsettled; broken edge' },
  { symbol: 'morale-broken', label: 'Broken', detail: 'withdrawing; open double edge' },
  { symbol: 'morale-routed', label: 'Routed', detail: 'flight direction and motion strokes' },
  { symbol: 'fall', label: 'Fall markers', detail: 'cumulative losses; weighted at low zoom' },
  { symbol: 'scale', label: 'Scale ruler', detail: 'ground distance; changes with map zoom' },
  { symbol: 'terminal', label: 'Terminal marker', detail: 'destroyed at this position' },
  { symbol: 'ghost', label: 'Dashed ghost', detail: 'last-known, potentially stale position' },
  { symbol: 'light', label: 'Lit / shadow', detail: 'visible / masked terrain from this POV' },
  { symbol: 'viewshed', label: 'Viewshed switch', detail: 'shows or hides POV light and shadow' },
  { symbol: 'cluster', label: 'Fanned companies', detail: 'display-only offsets; tethers return to recorded positions' },
  { symbol: 'tick', label: 'Scrubber tick', detail: 'order, spotting change, or activation' },
] as const;
