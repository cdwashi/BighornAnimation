import { describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../src/schema/scenario-schema.js';
import type { SimState, UnitRuntime } from '../engine/src/state.js';
import { decisionKindLabel } from '../app/lib/decision-index.js';
import { FORMATION_LEGEND, STATE_LEGEND } from '../app/lib/legend-data.js';
import {
  buildUnitTooltip,
  focusMapView,
  interpolateState,
  panMapView,
  resetMapView,
  sliderFromSpeed,
  speedFromSlider,
  transformPoint,
  zoomMapView,
} from '../app/lib/map-interactions.js';

const scenario = scenarioData as unknown as Scenario;

function runtimeUnit(overrides: Partial<UnitRuntime> = {}): UnitRuntime {
  return {
    id: scenario.units[0].id,
    unitIndex: 0,
    position: { x: 100, y: 200 },
    facingRadians: 0,
    formation: 'COLUMN',
    mounted: true,
    posture: 'HOLD',
    path: [],
    pathIndex: 0,
    pathProgressMeters: 0,
    speedClass: 'CAVALRY_WALK',
    distanceMovedOnActiveOrder: 0,
    fordHoldTicks: 0,
    insideFord: false,
    strengthTotal: 100,
    strengthCurrent: 100,
    casualties: 0,
    strengthAvailable: 84,
    horseHolderStrength: 0,
    morale: 60,
    moraleState: 'SHAKEN',
    cohesion: 100,
    fatigue: 0,
    ammunition: {},
    initialAmmunition: {},
    jammedWeapons: {},
    suppression: 0,
    flankedThisTick: false,
    casualtiesThisTick: 0,
    ...overrides,
  };
}

function simState(unit: UnitRuntime, tick = 1520): SimState {
  return {
    tick,
    rng: { state: 1, draws: 0 },
    units: [unit],
    deliveryQueue: [],
    deliveredOrders: [],
    observerContacts: {},
    believedPictures: {},
    engagements: [],
    engagementActive: false,
    leaders: [],
    couriers: [],
    emittedEventCursor: 0,
  };
}

describe('M3-C U1 interaction contracts', () => {
  it('pan + zoom + reset returns a marker to its exact baseline screen position', () => {
    const marker = { x: 413.25, y: 278.5 };
    const baseline = transformPoint(marker, resetMapView());
    const panned = panMapView(resetMapView(), -137.5, 84.25);
    const zoomed = zoomMapView(panned, 3.2, { x: 621, y: 344 });
    expect(transformPoint(marker, zoomed)).not.toEqual(baseline);
    expect(transformPoint(marker, resetMapView())).toEqual(baseline);
  });

  it('zoom-to-marker centers the marker exactly', () => {
    const marker = { x: 120.5, y: 240.25 };
    const view = focusMapView(marker, { width: 1440, height: 842 });
    expect(transformPoint(marker, view)).toEqual({ x: 720, y: 421 });
  });

  it('render-side interpolation advances tick and unit positions linearly', () => {
    const fromUnit = runtimeUnit({ position: { x: 100, y: 200 } });
    const toUnit = runtimeUnit({ position: { x: 180, y: 240 } });
    const from = simState(fromUnit, 100);
    const to = simState(toUnit, 104);
    const middle = interpolateState(from, to, 0.5);
    expect(middle.tick).toBe(102);
    expect(middle.units[0].position).toEqual({ x: 140, y: 220 });
    expect(from.units[0].position).toEqual({ x: 100, y: 200 });
  });

  it('log speed slider is continuous, monotonic, and spans 1x to 120x', () => {
    expect(speedFromSlider(0)).toBe(1);
    expect(speedFromSlider(1000)).toBeCloseTo(120, 10);
    expect(speedFromSlider(501)).toBeGreaterThan(speedFromSlider(500));
    for (const speed of [1, 2.5, 12, 47.25, 120]) {
      expect(speedFromSlider(sliderFromSpeed(speed))).toBeCloseTo(speed, 10);
    }
  });

  it('normal and ghost tooltips expose the required unit fields and stale warning', () => {
    const unit = runtimeUnit({ activeOrderId: scenario.orders[0].id });
    const state = simState(unit);
    const normal = buildUnitTooltip(scenario, state, unit);
    expect(normal.title).toBe(scenario.units[0].name);
    expect(normal.strength).toBe('84 / 100');
    expect(normal.formation).toBe('column');
    expect(normal.mounted).toBe('Mounted');
    expect(normal.order).not.toBe('Holding');
    expect(normal.stale).toBeUndefined();
    const ghost = buildUnitTooltip(scenario, state, unit, 1520);
    expect(ghost.stale).toBe(
      'Last seen 15:40 at this position — knowledge may be stale.',
    );
  });

  it('one legend data source contains every guide formation and state row', () => {
    expect(FORMATION_LEGEND.map((item) => item.label)).toEqual([
      'Column', 'Line', 'Skirmish', 'Dispersed', 'Camp',
    ]);
    expect(STATE_LEGEND.length).toBeGreaterThanOrEqual(8);
    expect(STATE_LEGEND.some((item) => item.symbol === 'ghost')).toBe(true);
  });

  it('decision entries receive explicit reconstruction/emergent badge labels', () => {
    expect(decisionKindLabel('order')).toBe('ORDER');
    expect(decisionKindLabel('emergent')).toBe('EMERGENT');
  });
});
