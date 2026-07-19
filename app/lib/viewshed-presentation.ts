/** [CAL] D77 light-beam transition duration. */
export const VIEWSHED_CROSSFADE_MS = 300;
export const VIEWSHED_SCRIM_ALPHA = 0.64;

export interface ViewshedFrame {
  leaderId: string;
  tick: number;
  width: number;
  height: number;
  values: Uint8ClampedArray;
  milliseconds: number;
}

export interface ViewshedTransition {
  previous?: ViewshedFrame;
  current: ViewshedFrame;
  startedAt?: number;
  mix: number;
}

export function receiveViewshedFrame(
  transition: ViewshedTransition | undefined,
  next: ViewshedFrame,
  now: number,
): ViewshedTransition {
  if (!transition || transition.current.leaderId !== next.leaderId) {
    return { current: next, mix: 1 };
  }
  return {
    previous: transition.current,
    current: next,
    startedAt: now,
    mix: 0,
  };
}

export function viewshedCrossfadeProgress(
  startedAt: number,
  now: number,
  duration = VIEWSHED_CROSSFADE_MS,
): number {
  return Math.max(0, Math.min(1, (now - startedAt) / duration));
}

export function advanceViewshedTransition(
  transition: ViewshedTransition,
  now: number,
): ViewshedTransition {
  if (!transition.previous || transition.startedAt === undefined) return transition;
  const mix = viewshedCrossfadeProgress(transition.startedAt, now);
  return mix >= 1
    ? { current: transition.current, mix: 1 }
    : { ...transition, mix };
}

export interface ViewshedLayerPlan {
  renderOverlay: boolean;
  scrimAlpha: number;
  previousBeamAlpha: number;
  currentBeamAlpha: number;
}

export function viewshedLayerPlan(
  enabled: boolean,
  transition?: ViewshedTransition,
): ViewshedLayerPlan {
  if (!enabled) {
    return {
      renderOverlay: false,
      scrimAlpha: 0,
      previousBeamAlpha: 0,
      currentBeamAlpha: 0,
    };
  }
  return {
    renderOverlay: true,
    scrimAlpha: VIEWSHED_SCRIM_ALPHA,
    previousBeamAlpha: transition?.previous ? 1 - transition.mix : 0,
    currentBeamAlpha: transition ? transition.previous ? transition.mix : 1 : 0,
  };
}

export function blendedViewshedValue(
  previous: Uint8ClampedArray | undefined,
  current: Uint8ClampedArray,
  index: number,
  mix: number,
): number {
  const currentValue = current[index] ?? 0;
  if (!previous) return currentValue;
  return Math.round((previous[index] ?? 0) * (1 - mix) + currentValue * mix);
}
