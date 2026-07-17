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
  private readonly nodes: Array<{ index: number; score: number }> = [];

  push(index: number, score: number): void {
    const item = { index, score };
    this.nodes.push(item);
    let child = this.nodes.length - 1;
    while (child > 0) {
      const parent = Math.floor((child - 1) / 2);
      const parentNode = this.nodes[parent];
      if (parentNode.score < score || (parentNode.score === score && parentNode.index <= index)) break;
      this.nodes[child] = parentNode;
      child = parent;
    }
    this.nodes[child] = item;
  }

  pop(): { index: number; score: number } | undefined {
    const first = this.nodes[0];
    const last = this.nodes.pop();
    if (!first || !last || this.nodes.length === 0) return first;
    let parent = 0;
    while (true) {
      const left = parent * 2 + 1;
      if (left >= this.nodes.length) break;
      const right = left + 1;
      let child = left;
      if (right < this.nodes.length) {
        const leftNode = this.nodes[left];
        const rightNode = this.nodes[right];
        if (rightNode.score < leftNode.score ||
          (rightNode.score === leftNode.score && rightNode.index < leftNode.index)) child = right;
      }
      const childNode = this.nodes[child];
      if (childNode.score > last.score ||
        (childNode.score === last.score && childNode.index >= last.index)) break;
      this.nodes[parent] = childNode;
      parent = child;
    }
    this.nodes[parent] = last;
    return first;
  }
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

function cellsOnLine(grid: MovementGrid, from: number, to: number): number[] {
  let x0 = from % grid.width;
  let y0 = Math.floor(from / grid.width);
  const x1 = to % grid.width;
  const y1 = Math.floor(to / grid.width);
  const dx = Math.abs(x1 - x0);
  const dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let error = dx - dy;
  const cells: number[] = [];
  while (true) {
    cells.push(y0 * grid.width + x0);
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
  }
  return cells;
}

function canPullStraight(grid: MovementGrid, from: number, to: number): boolean {
  const cells = cellsOnLine(grid, from, to);
  for (let offset = 1; offset < cells.length; offset += 1) {
    const index = cells[offset];
    if (offset < cells.length - 1 && !Number.isFinite(grid.costs[index])) return false;
    if (offset < cells.length - 1 && grid.coverKinds?.[index] === grid.fordCode) return false;
    const previous = cells[offset - 1];
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
  }
  return true;
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
): PathResult {
  const startCell = cellFor(grid, start);
  const goalCell = cellFor(grid, goal);
  if (!startCell || !goalCell) {
    return { status: 'unreachable', reason: 'endpoint outside selected terrain tier', visitedNodes: 0 };
  }
  const startIndex = startCell[1] * grid.width + startCell[0];
  const goalIndex = goalCell[1] * grid.width + goalCell[0];
  if (!Number.isFinite(grid.costs[startIndex]) || !Number.isFinite(grid.costs[goalIndex])) {
    return { status: 'unreachable', reason: 'endpoint is impassable', visitedNodes: 0 };
  }
  if (startIndex === goalIndex) {
    return { status: 'reachable', path: [{ ...start }, { ...goal }], totalCost: 0, visitedNodes: 1 };
  }

  const count = grid.width * grid.height;
  const scores = new Float64Array(count);
  scores.fill(Number.POSITIVE_INFINITY);
  const previous = new Int32Array(count);
  previous.fill(-1);
  const closed = new Uint8Array(count);
  const heap = new MinHeap();
  scores[startIndex] = 0;
  const heuristic = (column: number, row: number): number =>
    Math.hypot(goalCell[0] - column, goalCell[1] - row) *
      grid.resolutionMeters * grid.minimumCost;
  heap.push(startIndex, heuristic(startCell[0], startCell[1]));
  let visitedNodes = 0;

  while (true) {
    const next = heap.pop();
    if (!next) break;
    const current = next.index;
    if (closed[current]) continue;
    closed[current] = 1;
    visitedNodes += 1;
    if (current === goalIndex) {
      const raw: number[] = [];
      let cursor = current;
      while (cursor >= 0) {
        raw.push(cursor);
        cursor = previous[cursor];
      }
      raw.reverse();
      const pulled = smooth(grid, raw);
      const path = pulled.map((index) => cellPoint(grid, index));
      path[0] = { ...path[0], ...start };
      path[path.length - 1] = { ...path[path.length - 1], ...goal };
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
      if (closed[neighbor] || !Number.isFinite(grid.costs[neighbor])) continue;
      if (columnOffset !== 0 && rowOffset !== 0) {
        const horizontal = row * grid.width + neighborColumn;
        const vertical = neighborRow * grid.width + column;
        if (!Number.isFinite(grid.costs[horizontal]) || !Number.isFinite(grid.costs[vertical])) continue;
      }
      const stepDistance = grid.resolutionMeters *
        (columnOffset !== 0 && rowOffset !== 0 ? Math.SQRT2 : 1);
      const tentative = scores[current] + stepDistance *
        ((grid.costs[current] + grid.costs[neighbor]) / 2);
      if (tentative >= scores[neighbor]) continue;
      scores[neighbor] = tentative;
      previous[neighbor] = current;
      heap.push(neighbor, tentative + heuristic(neighborColumn, neighborRow));
    }
  }
  return { status: 'unreachable', reason: 'no passable route', visitedNodes };
}
