import type { Order, Scenario } from '../../src/schema/scenario-schema.js';
import { findPath, findStraightPath, type EngineTerrain, type PathPoint, type PointMeters } from './pathfind.js';
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
  // D53a: waypoints and landmarkId compose — route waypoints first, landmark as
  // the final goal — so orders can pin a historical route while referencing a
  // landmark that stays self-healing against geometry corrections.
  if (objective.waypoints && objective.waypoints.length > 0) {
    const points = objective.waypoints.map((point) => ({ x: point.lon, y: point.lat }));
    if (objective.landmarkId) {
      const landmark = scenario.terrain.landmarks.find((item) => item.id === objective.landmarkId);
      if (!landmark) return undefined;
      points.push({ x: landmark.position.lon, y: landmark.position.lat });
    }
    return { points };
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

function pursuitTarget(state: SimState, targetId: string): PointMeters | undefined {
  const unit = state.units.find((item) => item.id === targetId);
  if (unit) return unit.position;
  const courier = state.couriers.find((item) => item.id === targetId && item.active && item.alive);
  return courier?.position;
}

export function pursuitNeedsRepath(
  state: SimState,
  unit: UnitRuntime,
  combatCadenceTicks = 10,
): boolean {
  const pursuit = unit.pursuit;
  if (!pursuit) return false;
  const target = pursuitTarget(state, pursuit.targetUnitId);
  if (!target) return false;
  const cadence = pursuit.kind === 'COMBAT' || pursuit.kind === 'INITIATIVE'
    ? combatCadenceTicks
    : 10;
  return state.tick - pursuit.lastRepathTick >= cadence ||
    Math.hypot(
      target.x - pursuit.lastTargetPosition.x,
      target.y - pursuit.lastTargetPosition.y,
    ) > 250;
}

export function repathPursuit(
  scenario: Scenario,
  state: SimState,
  unit: UnitRuntime,
  terrain: EngineTerrain,
  cache: PathCache,
  memoizeCombat = true,
): ObjectiveResult {
  if (!unit.pursuit) {
    return { status: 'unreachable', reason: 'unit has no active pursuit' };
  }
  const target = pursuitTarget(state, unit.pursuit.targetUnitId);
  if (!target) return { status: 'unreachable', reason: 'pursuit target is missing' };
  const targetUnit = state.units.find((item) => item.id === unit.pursuit?.targetUnitId);
  const result = targetUnit && unit.activeOrderIndex !== undefined && unit.pursuit.kind === 'ORDER' ? resolveObjective(
    scenario, state, unit,
    { ...scenario.orders[unit.activeOrderIndex], objective: { targetUnitId: targetUnit.id } },
    terrain, cache,
  ) : (() => {
    const grid = terrain.gridForPath(unit.position, target);
    const cell = (point: PointMeters): string => `${Math.round((point.x - grid.minX) / grid.resolutionMeters)},${
      Math.round((point.y - grid.minY) / grid.resolutionMeters)}`;
    const key = `combat:${grid.id}:${cell(unit.position)}:${cell(target)}`;
    const cached = memoizeCombat ? cache.get(key) : undefined;
    const cachedPath = cached?.map((point) => ({ ...point }));
    if (cachedPath) {
      cachedPath[0] = { ...cachedPath[0], ...unit.position };
      cachedPath[cachedPath.length - 1] = { ...cachedPath[cachedPath.length - 1], ...target };
    }
    const path = cachedPath
      ? { status: 'reachable' as const, path: cachedPath }
      : findStraightPath(grid, unit.position, target) ?? findPath(grid, unit.position, target);
    if (memoizeCombat && !cached && path.status === 'reachable') {
      cache.set(key, path.path.map((point) => ({ ...point })));
    }
    return path.status === 'reachable'
      ? { status: 'reachable' as const, path: path.path, targetUnitId: unit.pursuit?.targetUnitId }
      : path;
  })();
  unit.pursuit.lastRepathTick = state.tick;
  unit.pursuit.lastTargetPosition = { ...target };
  return result;
}
