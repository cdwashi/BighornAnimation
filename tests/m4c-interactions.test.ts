import { describe, expect, it } from 'vitest';

import {
  VIEWSHED_CROSSFADE_MS,
  advanceViewshedTransition,
  blendedViewshedValue,
  receiveViewshedFrame,
  viewshedLayerPlan,
  type ViewshedFrame,
} from '../app/lib/viewshed-presentation';

function frame(tick: number, values: number[]): ViewshedFrame {
  return {
    leaderId: 'leader-custer',
    tick,
    width: values.length,
    height: 1,
    values: new Uint8ClampedArray(values),
    milliseconds: 4,
  };
}

describe('M4-C viewshed presentation U1', () => {
  it('tears the overlay down completely when viewshed is OFF', () => {
    const transition = receiveViewshedFrame(undefined, frame(1510, [255]), 0);
    expect(viewshedLayerPlan(false, transition)).toEqual({
      renderOverlay: false,
      scrimAlpha: 0,
      previousBeamAlpha: 0,
      currentBeamAlpha: 0,
    });
  });

  it('holds the last raster until ready, then crossfades for the calibrated interval', () => {
    const held = receiveViewshedFrame(undefined, frame(1510, [20, 220]), 700);
    expect(held.mix).toBe(1);
    expect(held.previous).toBeUndefined();

    const incoming = receiveViewshedFrame(held, frame(1512, [220, 20]), 1_000);
    expect(incoming.previous?.tick).toBe(1510);
    expect(incoming.current.tick).toBe(1512);
    expect(incoming.mix).toBe(0);

    const midpoint = advanceViewshedTransition(incoming, 1_000 + VIEWSHED_CROSSFADE_MS / 2);
    expect(midpoint.mix).toBeCloseTo(0.5);
    expect(viewshedLayerPlan(true, midpoint)).toMatchObject({
      renderOverlay: true,
      previousBeamAlpha: 0.5,
      currentBeamAlpha: 0.5,
    });
    expect(blendedViewshedValue(
      midpoint.previous?.values,
      midpoint.current.values,
      0,
      midpoint.mix,
    )).toBe(120);

    const complete = advanceViewshedTransition(incoming, 1_000 + VIEWSHED_CROSSFADE_MS);
    expect(complete).toMatchObject({ current: { tick: 1512 }, mix: 1 });
    expect(complete.previous).toBeUndefined();
  });
});
