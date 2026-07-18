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
  { symbol: 'ghost', label: 'Dashed ghost', detail: 'last-known, potentially stale position' },
  { symbol: 'light', label: 'Lit / shadow', detail: 'visible / masked terrain from this POV' },
  { symbol: 'viewshed', label: 'Viewshed switch', detail: 'shows or hides POV light and shadow' },
  { symbol: 'cluster', label: 'Fanned companies', detail: 'display-only offsets; tethers return to recorded positions' },
  { symbol: 'tick', label: 'Scrubber tick', detail: 'order, spotting change, or activation' },
] as const;
