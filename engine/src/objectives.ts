import type { Order, Scenario } from '../../src/schema/scenario-schema.js';
import { findPath, type EngineTerrain, type PathPoint, type PointMeters } from './pathfind.js';
import type { SimState, UnitRuntime } from './state.js';

export type ObjectiveResult =
  | { status: 'reachable'; path: PathPoint[]; targetUnitId?: string }
  | { status: 'unreachable'; reason: string };

export type PathCache = Map<string, PathPoint[]>;

function objectivePoints(
  scenario: Scenario,
  state: SimState,
  order: Order,
): { points: PointMeters[]; targetUnitId?: string } | undefined {
  const objective = order.objective;
  if (!objective) return undefined;
  if (objective.waypoints && objective.waypoints.length > 0) {
    return { points: objective.waypoints.map((point) => {
      const projected = state.units.length >= 0 ? point : point;
      return { x: projected.lon, y: projected.lat };
    }) };
  }
  if (objective.landmarkId) {
    const landmark = scenario.terrain.landmarks.find((item) => item.id === objective.landmarkId);
    if (!landmark) return undefined;
    return { points: [{ x: landmark.position.lon, y: landmark.position.lat }] };
  }
  if (objective.targetUnitId) {
    const target = state.units.find((unit) => unit.id === objective.targetUnitId);
    if (!target) return undefined;
    return { points: [{ ...target.position }], targetUnitId: target.id };
  }
  return undefined;
}

function cacheKey(gridId: string, start: PointMeters, goal: PointMeters): string {
  const coordinate = (value: number): string => value.toFixed(3);
  return `${gridId}:${coordinate(start.x)},${coordinate(start.y)}:${coordinate(goal.x)},${coordinate(goal.y)}`;
}

export function resolveObjective(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  order: Order,
  terrain: EngineTerrain,
  cache: PathCache,
): ObjectiveResult {
  const resolved = objectivePoints(scenario, state, order);
  if (!resolved) return { status: 'unreachable', reason: 'order has no resolvable objective' };
  const geographic = Boolean(order.objective?.waypoints || order.objective?.landmarkId);
  const goals = geographic
    ? resolved.points.map((point) => {
      const [x, y] = terrain.toLocal(point.y, point.x);
      return { x, y };
    })
    : resolved.points;
  const combined: PathPoint[] = [{ ...unit.position }];
  let start = { ...unit.position };
  for (const goal of goals) {
    const grid = terrain.gridForPath(start, goal);
    const key = cacheKey(grid.id, start, goal);
    let segment = cache.get(key);
    if (!segment) {
      const result = findPath(grid, start, goal);
      if (result.status === 'unreachable') return result;
      segment = result.path;
      cache.set(key, segment.map((point) => ({ ...point })));
    }
    for (let index = 1; index < segment.length; index += 1) combined.push({ ...segment[index] });
    start = { ...goal };
  }
  return { status: 'reachable', path: combined, targetUnitId: resolved.targetUnitId };
}

export function pursuitNeedsRepath(state: SimState, unit: UnitRuntime): boolean {
  const pursuit = unit.pursuit;
  if (!pursuit) return false;
  const target = state.units.find((item) => item.id === pursuit.targetUnitId);
  if (!target) return false;
  return state.tick - pursuit.lastRepathTick >= 10 ||
    Math.hypot(
      target.position.x - pursuit.lastTargetPosition.x,
      target.position.y - pursuit.lastTargetPosition.y,
    ) > 250;
}

export function repathPursuit(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  cache: PathCache,
): ObjectiveResult {
  if (unit.activeOrderIndex === undefined || !unit.pursuit) {
    return { status: 'unreachable', reason: 'unit has no active pursuit' };
  }
  const target = state.units.find((item) => item.id === unit.pursuit?.targetUnitId);
  if (!target) return { status: 'unreachable', reason: 'pursuit target is missing' };
  const result = resolveObjective(
    scenario,
    state,
    unit,
    scenario.orders[unit.activeOrderIndex],
    terrain,
    cache,
  );
  unit.pursuit.lastRepathTick = state.tick;
  unit.pursuit.lastTargetPosition = { ...target.position };
  return result;
}
