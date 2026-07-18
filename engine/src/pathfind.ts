export interface PointMeters {
  x: number;
  y: number;
}

export interface MovementGrid {
  id: string;
  width: number;
  height: number;
  resolutionMeters: number;
  minX: number;
  minY: number;
  costs: Float32Array;
  coverKinds?: Uint8Array;
  movementFactors?: Float32Array;
  minimumCost: number;
  fordCode?: number;
  riverCode?: number;
  crossingPenaltyMinutes?: number;
}

export interface MovementSample {
  movementFactor: number;
  coverKind: number;
  cellKey: string;
  crossingPenaltyMinutes?: number;
}

export interface EngineTerrain {
  toLocal(lat: number, lon: number): [number, number];
  gridForPath(start: PointMeters, goal: PointMeters): MovementGrid;
  movementAtMeters(x: number, y: number): MovementSample;
  elevationAtMeters(x: number, y: number): number;
  resolutionAtMeters?(x: number, y: number): number;
  minimumResolutionMeters?: number;
}

export interface PathPoint extends PointMeters {
  gridId?: string;
  cellIndex?: number;
  coverKind?: number;
  crossingPenaltyMinutes?: number;
}

export type PathResult =
  | { status: 'reachable'; path: PathPoint[]; totalCost: number; visitedNodes: number }
  | { status: 'unreachable'; reason: string; visitedNodes: number };

const DIRECTIONS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
] as const;

class MinHeap {
  private indices = new Int32Array(1024);
  private scores = new Float64Array(1024);
  private length = 0;

  reset(): void { this.length = 0; }

  private grow(): void {
    const indices = new Int32Array(this.indices.length * 2);
    const scores = new Float64Array(this.scores.length * 2);
    indices.set(this.indices);
    scores.set(this.scores);
    this.indices = indices;
    this.scores = scores;
    pathfindMetrics.heapGrowths += 1;
  }

  push(index: number, score: number): void {
    if (this.length >= this.indices.length) this.grow();
    let child = this.length++;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      const parentScore = this.scores[parent];
      const parentIndex = this.indices[parent];
      if (parentScore < score || (parentScore === score && parentIndex <= index)) break;
      this.indices[child] = parentIndex;
      this.scores[child] = parentScore;
      child = parent;
    }
    this.indices[child] = index;
    this.scores[child] = score;
  }

  pop(): { index: number; score: number } | undefined {
    if (this.length === 0) return undefined;
    const firstIndex = this.indices[0];
    const firstScore = this.scores[0];
    this.length -= 1;
    if (this.length === 0) return { index: firstIndex, score: firstScore };
    const lastIndex = this.indices[this.length];
    const lastScore = this.scores[this.length];
    let parent = 0;
    while (true) {
      const left = parent * 2 + 1;
      if (left >= this.length) break;
      const right = left + 1;
      let child = left;
      if (right < this.length) {
        if (this.scores[right] < this.scores[left] ||
          (this.scores[right] === this.scores[left] && this.indices[right] < this.indices[left])) child = right;
      }
      if (this.scores[child] > lastScore ||
        (this.scores[child] === lastScore && this.indices[child] >= lastIndex)) break;
      this.indices[parent] = this.indices[child];
      this.scores[parent] = this.scores[child];
      parent = child;
    }
    this.indices[parent] = lastIndex;
    this.scores[parent] = lastScore;
    return { index: firstIndex, score: firstScore };
  }
}

interface PathScratch {
  count: number;
  generation: number;
  scores: Float64Array;
  previous: Int32Array;
  seen: Uint32Array;
  closed: Uint32Array;
  heap: MinHeap;
  blockedPoint: PointMeters;
}

const scratchBySize = new Map<number, PathScratch>();
const pathfindMetrics = { calls: 0, expandedNodes: 0, scratchAllocations: 0, heapGrowths: 0 };

export function resetPathfindMetrics(): void {
  pathfindMetrics.calls = 0;
  pathfindMetrics.expandedNodes = 0;
  pathfindMetrics.scratchAllocations = 0;
  pathfindMetrics.heapGrowths = 0;
}

export function getPathfindMetrics(): Readonly<typeof pathfindMetrics> {
  return { ...pathfindMetrics };
}

function scratchFor(count: number): PathScratch {
  let scratch = scratchBySize.get(count);
  if (!scratch) {
    scratch = {
      count,
      generation: 0,
      scores: new Float64Array(count),
      previous: new Int32Array(count),
      seen: new Uint32Array(count),
      closed: new Uint32Array(count),
      heap: new MinHeap(),
      blockedPoint: { x: 0, y: 0 },
    };
    scratchBySize.set(count, scratch);
    pathfindMetrics.scratchAllocations += 1;
  }
  scratch.generation = (scratch.generation + 1) >>> 0;
  if (scratch.generation === 0) {
    scratch.seen.fill(0);
    scratch.closed.fill(0);
    scratch.generation = 1;
  }
  scratch.heap.reset();
  return scratch;
}

function cellFor(grid: MovementGrid, point: PointMeters): [number, number] | undefined {
  const column = Math.round((point.x - grid.minX) / grid.resolutionMeters);
  const row = Math.round((point.y - grid.minY) / grid.resolutionMeters);
  if (column < 0 || row < 0 || column >= grid.width || row >= grid.height) return undefined;
  return [column, row];
}

function cellPoint(grid: MovementGrid, index: number): PathPoint {
  const column = index % grid.width;
  const row = Math.floor(index / grid.width);
  const coverKind = grid.coverKinds?.[index];
  return {
    x: grid.minX + column * grid.resolutionMeters,
    y: grid.minY + row * grid.resolutionMeters,
    gridId: grid.id,
    cellIndex: index,
    coverKind,
    crossingPenaltyMinutes: coverKind === grid.fordCode
      ? grid.crossingPenaltyMinutes
      : undefined,
  };
}

function canPullStraight(grid: MovementGrid, from: number, to: number): boolean {
  let x0 = from % grid.width;
  let y0 = Math.floor(from / grid.width);
  const x1 = to % grid.width;
  const y1 = Math.floor(to / grid.width);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  let previous = from;
  while (true) {
    if (x0 === x1 && y0 === y1) break;
    const twice = error * 2;
    if (twice > -dy) {
      error -= dy;
      x0 += sx;
    }
    if (twice < dx) {
      error += dx;
      y0 += sy;
    }
    const index = y0 * grid.width + x0;
    const final = x0 === x1 && y0 === y1;
    if (!final && !Number.isFinite(grid.costs[index])) return false;
    if (!final && grid.coverKinds?.[index] === grid.fordCode) return false;
    const previousColumn = previous % grid.width;
    const previousRow = Math.floor(previous / grid.width);
    const column = index % grid.width;
    const row = Math.floor(index / grid.width);
    if (column !== previousColumn && row !== previousRow) {
      const firstCorner = previousRow * grid.width + column;
      const secondCorner = row * grid.width + previousColumn;
      if (!Number.isFinite(grid.costs[firstCorner]) || !Number.isFinite(grid.costs[secondCorner])) {
        return false;
      }
    }
    previous = index;
  }
  return true;
}

export type PathCellBlocked = (point: PointMeters) => boolean;

/** Exact shortcut used only when a caller accepts the existing smoother's straight pull. */
export function findStraightPath(
  grid: MovementGrid,
  start: PointMeters,
  goal: PointMeters,
): PathResult | undefined {
  const startCell = cellFor(grid, start);
  const goalCell = cellFor(grid, goal);
  if (!startCell || !goalCell) return undefined;
  const startIndex = startCell[1] * grid.width + startCell[0];
  const goalIndex = goalCell[1] * grid.width + goalCell[0];
  if (!Number.isFinite(grid.costs[startIndex]) || !Number.isFinite(grid.costs[goalIndex]) ||
    !canPullStraight(grid, startIndex, goalIndex)) return undefined;
  return {
    status: 'reachable',
    path: [
      { ...cellPoint(grid, startIndex), ...start },
      { ...cellPoint(grid, goalIndex), ...goal },
    ],
    totalCost: 0,
    visitedNodes: 2,
  };
}

function smooth(grid: MovementGrid, raw: number[]): number[] {
  if (raw.length < 3) return raw;
  const result = [raw[0]];
  let anchor = 0;
  while (anchor < raw.length - 1) {
    let candidate = raw.length - 1;
    while (candidate > anchor + 1 && !canPullStraight(grid, raw[anchor], raw[candidate])) {
      candidate -= 1;
    }
    result.push(raw[candidate]);
    anchor = candidate;
  }
  return result;
}

/** Deterministic 8-connected A* with mean-adjacent traversal cost. */
export function findPath(
  grid: MovementGrid,
  start: PointMeters,
  goal: PointMeters,
  blocked?: PathCellBlocked,
): PathResult {
  pathfindMetrics.calls += 1;
  const startCell = cellFor(grid, start);
  const goalCell = cellFor(grid, goal);
  if (!startCell || !goalCell) {
    return { status: 'unreachable', reason: 'endpoint outside selected terrain tier', visitedNodes: 0 };
  }
  const startIndex = startCell[1] * grid.width + startCell[0];
  const goalIndex = goalCell[1] * grid.width + goalCell[0];
  if (!Number.isFinite(grid.costs[startIndex]) || !Number.isFinite(grid.costs[goalIndex]) ||
    blocked?.(cellPoint(grid, startIndex)) || blocked?.(cellPoint(grid, goalIndex))) {
    return { status: 'unreachable', reason: 'endpoint is impassable', visitedNodes: 0 };
  }
  if (startIndex === goalIndex) {
    return { status: 'reachable', path: [{ ...start }, { ...goal }], totalCost: 0, visitedNodes: 1 };
  }

  const count = grid.width * grid.height;
  const scratch = scratchFor(count);
  const { scores, previous, seen, closed, heap } = scratch;
  const generation = scratch.generation;
  scores[startIndex] = 0;
  seen[startIndex] = generation;
  previous[startIndex] = -1;
  const heuristic = (column: number, row: number): number =>
    Math.hypot(goalCell[0] - column, goalCell[1] - row) *
      grid.resolutionMeters * grid.minimumCost;
  heap.push(startIndex, heuristic(startCell[0], startCell[1]));
  let visitedNodes = 0;

  while (true) {
    const next = heap.pop();
    if (!next) break;
    const current = next.index;
    if (closed[current] === generation) continue;
    closed[current] = generation;
    visitedNodes += 1;
    if (current === goalIndex) {
      const raw: number[] = [];
      let cursor = current;
      while (cursor >= 0) {
        raw.push(cursor);
        cursor = previous[cursor];
      }
      raw.reverse();
      // Interdiction paths retain their cell-by-cell route: smoothing across a
      // blocked disk would reintroduce the forbidden corridor geometrically.
      const pulled = blocked ? raw : smooth(grid, raw);
      const path = pulled.map((index) => cellPoint(grid, index));
      path[0] = { ...path[0], ...start };
      path[path.length - 1] = { ...path[path.length - 1], ...goal };
      pathfindMetrics.expandedNodes += visitedNodes;
      return { status: 'reachable', path, totalCost: scores[current], visitedNodes };
    }
    const column = current % grid.width;
    const row = Math.floor(current / grid.width);
    for (const [columnOffset, rowOffset] of DIRECTIONS) {
      const neighborColumn = column + columnOffset;
      const neighborRow = row + rowOffset;
      if (neighborColumn < 0 || neighborRow < 0 ||
        neighborColumn >= grid.width || neighborRow >= grid.height) continue;
      const neighbor = neighborRow * grid.width + neighborColumn;
      if (closed[neighbor] === generation || !Number.isFinite(grid.costs[neighbor])) continue;
      if (blocked) {
        scratch.blockedPoint.x = grid.minX + neighborColumn * grid.resolutionMeters;
        scratch.blockedPoint.y = grid.minY + neighborRow * grid.resolutionMeters;
        if (blocked(scratch.blockedPoint)) continue;
      }
      if (columnOffset !== 0 && rowOffset !== 0) {
        const horizontal = row * grid.width + neighborColumn;
        const vertical = neighborRow * grid.width + column;
        if (!Number.isFinite(grid.costs[horizontal]) || !Number.isFinite(grid.costs[vertical]) ||
          blocked?.(cellPoint(grid, horizontal)) || blocked?.(cellPoint(grid, vertical))) continue;
      }
      const stepDistance = grid.resolutionMeters *
        (columnOffset !== 0 && rowOffset !== 0 ? Math.SQRT2 : 1);
      const tentative = scores[current] + stepDistance *
        ((grid.costs[current] + grid.costs[neighbor]) / 2);
      if (seen[neighbor] === generation && tentative >= scores[neighbor]) continue;
      scores[neighbor] = tentative;
      seen[neighbor] = generation;
      previous[neighbor] = current;
      heap.push(neighbor, tentative + heuristic(neighborColumn, neighborRow));
    }
  }
  pathfindMetrics.expandedNodes += visitedNodes;
  return { status: 'unreachable', reason: 'no passable route', visitedNodes };
}
