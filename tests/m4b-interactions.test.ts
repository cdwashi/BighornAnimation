import { describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import type { SimEvent } from '../engine/src/events.js';
import type { EngagementDescriptor, SimState, UnitRuntime } from '../engine/src/state.js';
import type { Scenario } from '../src/schema/scenario-schema.js';
import {
  buildCombatTimelineTicks,
  buildEncounterTooltip,
  buildLossSummary,
  buildScaleRuler,
  clusterFallMarkers,
  DEFAULT_FALL_MARKERS_ENABLED,
  effectivePlaybackSpeed,
  ENGAGEMENT_SPEED_CAP,
  nextFallMarkerVisibility,
  positionedLosses,
  recentReintegrations,
  rulerGroundDistance,
  unitMarkerTreatment,
} from '../app/lib/combat-ui.js';
import { buildDecisionIndex } from '../app/lib/decision-index.js';
import { STATE_LEGEND } from '../app/lib/legend-data.js';

const scenario = scenarioData as unknown as Scenario;

function runtimeUnit(index: number, overrides: Partial<UnitRuntime> = {}): UnitRuntime {
  const source = scenario.units[index];
  return {
    id: source.id,
    unitIndex: index,
    position: { x: 100 + index * 100, y: 200 },
    facingRadians: Math.PI / 3,
    formation: source.startFormation,
    mounted: source.mounted,
    posture: 'HOLD',
    path: [],
    pathIndex: 0,
    pathProgressMeters: 0,
    speedClass: source.mounted ? 'CAVALRY_WALK' : 'ON_FOOT',
    distanceMovedOnActiveOrder: 0,
    fordHoldTicks: 0,
    insideFord: false,
    strengthTotal: source.strength.best,
    killed: 0,
    wounded: 0,
    strengthCurrent: source.strength.best,
    casualties: 0,
    strengthAvailable: source.strength.best,
    horseHolderStrength: 0,
    morale: 80,
    moraleState: 'STEADY',
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

function simState(units: UnitRuntime[], overrides: Partial<SimState> = {}): SimState {
  return {
    tick: 100,
    rng: { state: 1, draws: 0 },
    units,
    deliveryQueue: [],
    deliveredOrders: [],
    observerContacts: {},
    believedPictures: {},
    engagements: [],
    engagementActive: false,
    leaders: [],
    couriers: [],
    emittedEventCursor: 0,
    ...overrides,
  };
}

function event(sequence: number, overrides: Partial<SimEvent>): SimEvent {
  return { sequence, tick: 80, type: 'casualty-resolution', unitId: 'attacker', ...overrides };
}

describe('M4-B U1 interaction contracts', () => {
  it('encounter tooltip exposes every D63 field, including pursuit', () => {
    const engagement: EngagementDescriptor = {
      id: `${scenario.units[0].id}\0${scenario.units[1].id}`,
      unitIds: [scenario.units[0].id, scenario.units[1].id],
      state: 'PURSUIT',
      rangeMeters: 247,
      rangeBand: 'MEDIUM',
      intensity: 0.72,
      active: true,
      startedTick: 70,
      updatedTick: 80,
    };
    const tooltip = buildEncounterTooltip(scenario, engagement);
    expect(tooltip.state).toBe('PURSUIT');
    expect(tooltip.unitPair).toContain('↔');
    expect(tooltip.rangeBand).toBe('MEDIUM');
    expect(tooltip.intensity).toBe('heavy · 72%');
    expect(tooltip.description).toBe('pursuit, 250 m');
  });

  it('fall-marker layer defaults on, toggles both ways, clusters low, and resolves high', () => {
    expect(DEFAULT_FALL_MARKERS_ENABLED).toBe(true);
    expect(nextFallMarkerVisibility(DEFAULT_FALL_MARKERS_ENABLED)).toBe(false);
    expect(nextFallMarkerVisibility(false)).toBe(true);
    const state = simState([runtimeUnit(0, { casualties: 3, strengthCurrent: 37 })]);
    const losses = positionedLosses(state, [event(1, {
      targetUnitId: scenario.units[0].id,
      casualties: 3,
      position: { x: 100, y: 100 },
    })]);
    const project = ({ x, y }: { x: number; y: number }) => ({ x, y });
    expect(clusterFallMarkers(losses, project, 1)).toEqual([
      expect.objectContaining({ weight: 3 }),
    ]);
    expect(clusterFallMarkers(losses, project, 4)).toHaveLength(3);
    expect(STATE_LEGEND.some((row) => row.symbol === 'fall')).toBe(true);
  });

  it('speed cap engages at contact, preserves the requested slider speed, and releases', () => {
    const requested = 63.5;
    expect(effectivePlaybackSpeed(requested, true)).toBe(ENGAGEMENT_SPEED_CAP);
    expect(requested).toBe(63.5);
    expect(effectivePlaybackSpeed(requested, false)).toBe(requested);
    expect(effectivePlaybackSpeed(4, true)).toBe(4);
  });

  it('terminal units retain a marker treatment but no live strength bar', () => {
    const destroyed = runtimeUnit(0, {
      endState: 'DESTROYED',
      strengthCurrent: 0,
      strengthAvailable: 0,
      casualties: scenario.units[0].strength.best,
    });
    expect(unitMarkerTreatment(destroyed)).toEqual({
      terminal: true,
      morale: destroyed.moraleState,
      strengthBar: false,
      fleeing: false,
    });
    expect(STATE_LEGEND.some((row) => row.symbol === 'terminal')).toBe(true);
  });

  it('scale ruler converts on-screen length to known ground distance within 2% at many zooms', () => {
    const basePixelsPerMeter = 0.04137;
    const labels = new Set<string>();
    for (const zoom of [1, 1.75, 3.5, 8]) {
      const pixelsPerMeter = basePixelsPerMeter * zoom;
      const ruler = buildScaleRuler(pixelsPerMeter, 30);
      labels.add(ruler.label);
      const measured = rulerGroundDistance(ruler.screenPixels, pixelsPerMeter);
      const error = Math.abs(measured - ruler.groundMeters) / ruler.groundMeters;
      expect(error).toBeLessThanOrEqual(0.02);
    }
    expect(labels.size).toBeGreaterThan(1);
    expect(STATE_LEGEND.some((row) => row.symbol === 'scale')).toBe(true);
  });

  it('loss ledger is live by tick and uses authoritative destruction conservation totals', () => {
    const first = runtimeUnit(0, { casualties: 5, strengthCurrent: 35 });
    const second = runtimeUnit(1, { casualties: 2, strengthCurrent: 38 });
    const state = simState([first, second], { tick: 90 });
    const events = [
      event(1, { targetUnitId: first.id, casualties: 3, position: { x: 1, y: 2 } }),
      event(2, { tick: 95, targetUnitId: second.id, casualties: 7, position: { x: 3, y: 4 } }),
    ];
    const summary = buildLossSummary(scenario, state, events);
    expect(summary.units.find((row) => row.unitId === first.id)?.losses).toBe(5);
    expect(summary.units.find((row) => row.unitId === second.id)?.losses).toBe(2);
    expect(summary.total).toBe(7);
  });

  it('combat scrubber distinguishes starts, breaks, destructions, deaths, and losses', () => {
    const ticks = buildCombatTimelineTicks([
      event(1, { type: 'engagement-state', engagementId: 'a', engagementState: 'APPROACH' }),
      event(2, { type: 'engagement-state', engagementId: 'a', engagementState: 'FIREFIGHT' }),
      event(3, { type: 'morale-state', moraleState: 'ROUTED' }),
      event(4, { type: 'unit-destroyed' }),
      event(5, { type: 'leader-killed', leaderId: scenario.leaders[0].id }),
      event(6, { type: 'casualty-resolution', casualties: 1 }),
    ]);
    expect(ticks.map((tick) => tick.kind)).toEqual([
      'engagement', 'break', 'destruction', 'leader-death', 'loss',
    ]);
  });

  it('leader deaths become EMERGENT decision rows and reintegration cues expire', () => {
    const leaderDeath = event(70, {
      tick: 84,
      type: 'leader-killed',
      leaderId: scenario.leaders[0].id,
      unitId: scenario.leaders[0].attachedToUnitId,
    });
    const reintegration = event(71, {
      tick: 88,
      type: 'rout-reintegrated',
      unitId: scenario.units[0].id,
      targetUnitId: scenario.units[1].id,
    });
    const deathRow = buildDecisionIndex(scenario, [leaderDeath])
      .find((entry) => entry.id === 'leader-death:70');
    expect(deathRow?.kind).toBe('emergent');
    expect(deathRow?.label).toContain('Leader killed');
    expect(recentReintegrations([reintegration], 94)).toHaveLength(1);
    expect(recentReintegrations([reintegration], 99)).toHaveLength(0);
  });
});
