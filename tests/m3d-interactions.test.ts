import { describe, expect, it } from 'vitest';

import { STATE_LEGEND } from '../app/lib/legend-data.js';
import {
  fanOutMarkerProjections,
  transformPoint,
  type MarkerProjection,
} from '../app/lib/map-interactions.js';
import { viewshedPresetEnabled } from '../app/lib/pov-controls.js';

describe('M3-D U1 interaction contracts', () => {
  it('viewshed defaults off for playback and leader selection', () => {
    expect(viewshedPresetEnabled(new URLSearchParams())).toBe(false);
    expect(viewshedPresetEnabled(new URLSearchParams('leader=reno'))).toBe(false);
    expect(viewshedPresetEnabled(new URLSearchParams('scene=ford-a'))).toBe(false);
  });

  it('belief/split and decision-index presets enable viewshed shading', () => {
    expect(viewshedPresetEnabled(new URLSearchParams('leader=custer&mode=belief'))).toBe(true);
    expect(viewshedPresetEnabled(new URLSearchParams('leader=custer&mode=split'))).toBe(true);
    expect(viewshedPresetEnabled(new URLSearchParams('index=cooke'))).toBe(true);
    expect(viewshedPresetEnabled(new URLSearchParams('scene=reno-1620'))).toBe(true);
    expect(STATE_LEGEND.some((entry) => entry.symbol === 'viewshed')).toBe(true);
    expect(STATE_LEGEND.some((entry) => entry.symbol === 'cluster')).toBe(true);
  });

  it('fans colliding markers deterministically by unit id', () => {
    const projections: MarkerProjection[] = [
      { id: 'co-m', point: { x: 102, y: 101 } },
      { id: 'co-a', point: { x: 100, y: 100 } },
      { id: 'co-g', point: { x: 101, y: 99 } },
    ];
    const forward = fanOutMarkerProjections(projections);
    const reverse = fanOutMarkerProjections([...projections].reverse());
    expect(forward).toEqual(reverse);
    expect(forward.map((marker) => marker.id)).toEqual(['co-a', 'co-g', 'co-m']);
    expect(new Set(forward.map((marker) =>
      `${marker.displayPoint.x.toFixed(6)},${marker.displayPoint.y.toFixed(6)}`))).toHaveLength(3);
    expect(forward.every((marker) => marker.clusterSize === 3)).toBe(true);
  });

  it('does not fan isolated markers and naturally separates a cluster at higher zoom', () => {
    const base = [
      { id: 'co-a', point: { x: 100, y: 100 } },
      { id: 'co-g', point: { x: 110, y: 100 } },
    ];
    expect(fanOutMarkerProjections(base).every((marker) => marker.clusterSize === 2)).toBe(true);
    const zoomed = base.map((marker) => ({
      ...marker,
      point: transformPoint(marker.point, { scale: 3, translateX: 0, translateY: 0 }),
    }));
    const layout = fanOutMarkerProjections(zoomed);
    expect(layout.every((marker) => marker.clusterSize === 1)).toBe(true);
    expect(layout.every((marker) => marker.displayPoint.x === marker.point.x &&
      marker.displayPoint.y === marker.point.y)).toBe(true);
  });

  it('keeps fan-out display-only and preserves source registration exactly', () => {
    const source: MarkerProjection[] = [
      { id: 'co-a', point: { x: 413.25, y: 278.5 } },
      { id: 'co-g', point: { x: 414.25, y: 278.5 } },
    ];
    const snapshot = structuredClone(source);
    const layout = fanOutMarkerProjections(source);
    expect(source).toEqual(snapshot);
    for (const marker of layout) {
      expect(marker.point).toEqual(snapshot.find((item) => item.id === marker.id)?.point);
      expect(marker.displayPoint).not.toEqual(marker.point);
    }
  });
});
