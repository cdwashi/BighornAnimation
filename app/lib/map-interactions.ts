import type { Scenario } from '../../src/schema/scenario-schema';
import type { SimState, UnitRuntime } from '../../engine/src/state';
import { tickToWallClock } from '../../engine/src/clock';

export interface ScreenPoint { x: number; y: number }
export interface MapView { scale: number; translateX: number; translateY: number }

export const RESET_MAP_VIEW: Readonly<MapView> = Object.freeze({
  scale: 1,
  translateX: 0,
  translateY: 0,
});

export function transformPoint(point: ScreenPoint, view: MapView): ScreenPoint {
  return {
    x: point.x * view.scale + view.translateX,
    y: point.y * view.scale + view.translateY,
  };
}

export function panMapView(view: MapView, deltaX: number, deltaY: number): MapView {
  return { ...view, translateX: view.translateX + deltaX, translateY: view.translateY + deltaY };
}

export function zoomMapView(
  view: MapView,
  factor: number,
  anchor: ScreenPoint,
  minimum = 1,
  maximum = 8,
): MapView {
  const scale = Math.max(minimum, Math.min(maximum, view.scale * factor));
  const ratio = scale / view.scale;
  return {
    scale,
    translateX: anchor.x - (anchor.x - view.translateX) * ratio,
    translateY: anchor.y - (anchor.y - view.translateY) * ratio,
  };
}

export function focusMapView(
  point: ScreenPoint,
  viewport: { width: number; height: number },
  scale = 3.5,
): MapView {
  return {
    scale,
    translateX: viewport.width / 2 - point.x * scale,
    translateY: viewport.height / 2 - point.y * scale,
  };
}

export function resetMapView(): MapView {
  return { ...RESET_MAP_VIEW };
}

export function interpolateState(
  from: SimState,
  to: SimState,
  fraction: number,
): SimState {
  const amount = Math.max(0, Math.min(1, fraction));
  return {
    ...to,
    tick: from.tick + (to.tick - from.tick) * amount,
    units: to.units.map((unit, index) => {
      const previous = from.units[index];
      if (!previous || previous.id !== unit.id) return unit;
      return {
        ...unit,
        position: {
          x: previous.position.x + (unit.position.x - previous.position.x) * amount,
          y: previous.position.y + (unit.position.y - previous.position.y) * amount,
        },
      };
    }),
  };
}

export function speedFromSlider(value: number): number {
  const normalized = Math.max(0, Math.min(1000, value)) / 1000;
  return Math.exp(Math.log(120) * normalized);
}

export function sliderFromSpeed(speed: number): number {
  return Math.log(Math.max(1, Math.min(120, speed))) / Math.log(120) * 1000;
}

export interface UnitTooltipContent {
  title: string;
  side: string;
  strength: string;
  formation: string;
  mounted: string;
  order: string;
  stale?: string;
}

export function buildUnitTooltip(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  ghostLastSeenTick?: number,
): UnitTooltipContent {
  const source = scenario.units[unit.unitIndex];
  const side = scenario.sides.find((candidate) => candidate.id === source.sideId);
  const activeOrder = unit.activeOrderId
    ? scenario.orders.find((order) => order.id === unit.activeOrderId)
    : undefined;
  const contactPending = unit.pursuit?.contactEmitted === true;
  const order = contactPending
    ? 'Contact pending'
    : activeOrder
      ? activeOrder.historicalText && !activeOrder.historicalText.startsWith('BASELINE')
        ? activeOrder.historicalText
        : activeOrder.id.replaceAll('-', ' ')
      : 'Holding';
  return {
    title: source.name,
    side: side?.name ?? source.sideId,
    strength: `${Math.round(unit.strengthAvailable)} / ${Math.round(unit.strengthTotal)}`,
    formation: unit.formation.toLowerCase(),
    mounted: unit.mounted ? 'Mounted' : 'Dismounted',
    order,
    stale: ghostLastSeenTick === undefined
      ? undefined
      : `Last seen ${tickToWallClock(
        scenario.clock.start,
        ghostLastSeenTick,
        scenario.clock.tickSeconds,
      )} at this position — knowledge may be stale.`,
  };
}
