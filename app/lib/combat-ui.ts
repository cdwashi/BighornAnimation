import type { SimEvent } from '../../engine/src/events';
import type {
  EngagementDescriptor,
  MoraleState,
  SimState,
  UnitRuntime,
} from '../../engine/src/state';
import type { Scenario } from '../../src/schema/scenario-schema';
import type { ScreenPoint } from './map-interactions';

/** [CAL] M4-B watchability ceiling; this does not alter simulation time. */
export const ENGAGEMENT_SPEED_CAP = 8;
export const DEFAULT_FALL_MARKERS_ENABLED = true;

export function nextFallMarkerVisibility(enabled: boolean): boolean {
  return !enabled;
}

export function effectivePlaybackSpeed(
  requestedSpeed: number,
  engagementActive: boolean,
  cap = ENGAGEMENT_SPEED_CAP,
): number {
  return engagementActive ? Math.min(requestedSpeed, cap) : requestedSpeed;
}

export interface ScaleRuler {
  groundMeters: number;
  screenPixels: number;
  label: string;
}

function scaleLabel(meters: number): string {
  if (meters < 1000) return `${meters} m`;
  const kilometers = meters / 1000;
  return `${Number.isInteger(kilometers) ? kilometers : kilometers.toFixed(1)} km`;
}

export function buildScaleRuler(
  pixelsPerMeter: number,
  resolutionMeters: number,
  targetPixels = 96,
): ScaleRuler {
  if (!(pixelsPerMeter > 0) || !(resolutionMeters > 0)) {
    return { groundMeters: 0, screenPixels: 0, label: '' };
  }
  const desiredMeters = targetPixels / pixelsPerMeter;
  const power = 10 ** Math.floor(Math.log10(desiredMeters));
  const multiplier = [1, 2, 5, 10].reduce((best, candidate) =>
    Math.abs(Math.log(candidate * power / desiredMeters)) <
      Math.abs(Math.log(best * power / desiredMeters)) ? candidate : best, 1);
  const niceMeters = Math.max(resolutionMeters, multiplier * power);
  // The manifest resolution bounds the smallest honest ruler; map meters stay continuous.
  const groundMeters = Math.max(resolutionMeters, niceMeters);
  return {
    groundMeters,
    screenPixels: groundMeters * pixelsPerMeter,
    label: scaleLabel(groundMeters),
  };
}

export function rulerGroundDistance(screenPixels: number, pixelsPerMeter: number): number {
  return screenPixels / pixelsPerMeter;
}

export interface UnitMarkerTreatment {
  terminal: boolean;
  morale: MoraleState;
  strengthBar: boolean;
  fleeing: boolean;
}

export function unitMarkerTreatment(unit: UnitRuntime): UnitMarkerTreatment {
  const terminal = unit.endState === 'DESTROYED';
  return {
    terminal,
    morale: unit.moraleState,
    strengthBar: !terminal,
    fleeing: !terminal && unit.moraleState === 'ROUTED',
  };
}

function displayEntityName(scenario: Scenario, id: string): string {
  return scenario.units.find((unit) => unit.id === id)?.name ??
    id.replace(/^courier:/, '').replaceAll('-', ' ');
}

function intensityLabel(intensity: number): string {
  if (intensity >= 0.66) return 'heavy';
  if (intensity >= 0.25) return 'sustained';
  return 'light';
}

function encounterDescription(engagement: EngagementDescriptor): string {
  const range = `${Math.max(0, Math.round(engagement.rangeMeters / 10) * 10)} m`;
  switch (engagement.state) {
    case 'FIREFIGHT': return `dismounted skirmish fire, ${range}`;
    case 'CHARGE': return `mounted charge — receiving, ${range}`;
    case 'MELEE': return `close shock, ${range}`;
    case 'PURSUIT': return `pursuit, ${range}`;
    case 'WITHDRAWAL': return `withdrawal under fire, ${range}`;
    case 'ROUT': return `rout under pressure, ${range}`;
    case 'DESTRUCTION': return `position overrun, ${range}`;
    case 'DISENGAGE': return `contact broken, ${range}`;
    case 'APPROACH': return `approach to contact, ${range}`;
  }
}

export interface EncounterTooltipContent {
  title: string;
  state: string;
  unitPair: string;
  rangeBand: string;
  intensity: string;
  description: string;
}

export function buildEncounterTooltip(
  scenario: Scenario,
  engagement: EngagementDescriptor,
): EncounterTooltipContent {
  return {
    title: 'Active contact',
    state: engagement.state,
    unitPair: engagement.unitIds.map((id) => displayEntityName(scenario, id)).join(' ↔ '),
    rangeBand: engagement.rangeBand.replaceAll('_', ' '),
    intensity: `${intensityLabel(engagement.intensity)} · ${Math.round(engagement.intensity * 100)}%`,
    description: encounterDescription(engagement),
  };
}

export interface LossRow {
  unitId: string;
  unitName: string;
  sideId: string;
  losses: number;
}

export interface LossSideTotal {
  sideId: string;
  sideName: string;
  losses: number;
}

export interface LossSummary {
  units: LossRow[];
  sides: LossSideTotal[];
  total: number;
}

export function buildLossSummary(
  scenario: Scenario,
  state: SimState,
  events: readonly SimEvent[],
): LossSummary {
  const eventLosses = new Map<string, number>();
  for (const event of events) {
    if (event.tick > state.tick || event.type !== 'casualty-resolution' ||
      !event.targetUnitId || !event.casualties) continue;
    eventLosses.set(event.targetUnitId,
      (eventLosses.get(event.targetUnitId) ?? 0) + event.casualties);
  }
  const units = state.units.map((unit): LossRow => {
    const source = scenario.units[unit.unitIndex];
    return {
      unitId: unit.id,
      unitName: source.name,
      sideId: source.sideId,
      // Destruction can close the conservation ledger after the last fire event.
      losses: Math.max(eventLosses.get(unit.id) ?? 0, unit.casualties),
    };
  }).filter((row) => row.losses > 0)
    .sort((left, right) => left.sideId.localeCompare(right.sideId) ||
      right.losses - left.losses || left.unitName.localeCompare(right.unitName));
  const sides = scenario.sides.map((side): LossSideTotal => ({
    sideId: side.id,
    sideName: side.name,
    losses: units.filter((row) => row.sideId === side.id)
      .reduce((sum, row) => sum + row.losses, 0),
  }));
  return { units, sides, total: sides.reduce((sum, side) => sum + side.losses, 0) };
}

export interface PositionedLoss {
  id: string;
  x: number;
  y: number;
  weight: number;
}

export function positionedLosses(
  state: SimState,
  events: readonly SimEvent[],
): PositionedLoss[] {
  const result: PositionedLoss[] = [];
  const resolvedByUnit = new Map<string, number>();
  for (const event of events) {
    if (event.tick > state.tick || !event.position) continue;
    if (event.type === 'casualty-resolution' && event.casualties && event.targetUnitId) {
      result.push({
        id: `loss:${event.sequence}`,
        x: event.position.x,
        y: event.position.y,
        weight: event.casualties,
      });
      resolvedByUnit.set(event.targetUnitId,
        (resolvedByUnit.get(event.targetUnitId) ?? 0) + event.casualties);
    } else if ((event.type === 'leader-killed' || event.type === 'courier-killed') &&
      event.casualties) {
      result.push({
        id: `loss:${event.sequence}`,
        x: event.position.x,
        y: event.position.y,
        weight: event.casualties,
      });
    }
  }
  for (const event of events) {
    if (event.tick > state.tick || event.type !== 'unit-destroyed' || !event.position) continue;
    const unit = state.units.find((candidate) => candidate.id === event.unitId);
    const residual = Math.max(0, (unit?.casualties ?? 0) - (resolvedByUnit.get(event.unitId) ?? 0));
    if (residual > 0) result.push({
      id: `terminal-loss:${event.sequence}`,
      x: event.position.x,
      y: event.position.y,
      weight: residual,
    });
  }
  return result;
}

export interface FallMarkerCluster extends ScreenPoint {
  id: string;
  weight: number;
}

function scatterLoss(loss: PositionedLoss): Array<{ id: string; x: number; y: number }> {
  return Array.from({ length: loss.weight }, (_, index) => {
    const angle = (index * 2.399963229728653) + loss.x * 0.001 + loss.y * 0.0007;
    const radius = index === 0 ? 0 : Math.min(34, 2.2 * Math.sqrt(index));
    return {
      id: `${loss.id}:${index}`,
      x: loss.x + Math.cos(angle) * radius,
      y: loss.y + Math.sin(angle) * radius,
    };
  });
}

export function clusterFallMarkers(
  losses: readonly PositionedLoss[],
  project: (point: { x: number; y: number }) => ScreenPoint,
  zoom: number,
): FallMarkerCluster[] {
  if (zoom >= 4) {
    return losses.flatMap(scatterLoss).map((loss) => ({
      id: loss.id,
      ...project(loss),
      weight: 1,
    }));
  }
  const cellSize = zoom < 2 ? 18 : 12;
  const cells = new Map<string, FallMarkerCluster>();
  for (const loss of losses) {
    const point = project(loss);
    const key = `${Math.floor(point.x / cellSize)}:${Math.floor(point.y / cellSize)}`;
    const existing = cells.get(key);
    if (existing) {
      const total = existing.weight + loss.weight;
      existing.x = (existing.x * existing.weight + point.x * loss.weight) / total;
      existing.y = (existing.y * existing.weight + point.y * loss.weight) / total;
      existing.weight = total;
    } else cells.set(key, { id: `fall-cluster:${key}`, ...point, weight: loss.weight });
  }
  return [...cells.values()].sort((left, right) => left.id.localeCompare(right.id));
}

export type CombatTimelineKind =
  'loss' | 'engagement' | 'break' | 'destruction' | 'leader-death' | 'scout-exit';

export interface CombatTimelineTick {
  id: string;
  tick: number;
  kind: CombatTimelineKind;
}

export function buildCombatTimelineTicks(events: readonly SimEvent[]): CombatTimelineTick[] {
  const firstEngagement = new Set<string>();
  const result: CombatTimelineTick[] = [];
  for (const event of events) {
    let kind: CombatTimelineKind | undefined;
    if (event.type === 'casualty-resolution') kind = 'loss';
    else if (event.type === 'engagement-state' && event.engagementId &&
      !firstEngagement.has(event.engagementId)) {
      firstEngagement.add(event.engagementId);
      kind = 'engagement';
    } else if (event.type === 'morale-state' &&
      (event.moraleState === 'BROKEN' || event.moraleState === 'ROUTED')) kind = 'break';
    else if (event.type === 'unit-destroyed') kind = 'destruction';
    else if (event.type === 'leader-killed') kind = 'leader-death';
    else if (event.type === 'scout-withdrew-off-field') kind = 'scout-exit';
    if (kind) result.push({ id: `${kind}:${event.sequence}`, tick: event.tick, kind });
  }
  return result;
}

export function recentReintegrations(
  events: readonly SimEvent[],
  tick: number,
  durationTicks = 10,
): SimEvent[] {
  return events.filter((event) => event.type === 'rout-reintegrated' &&
    event.tick <= tick && tick - event.tick <= durationTicks);
}
