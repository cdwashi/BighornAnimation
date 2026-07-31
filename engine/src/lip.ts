import type { EngineTerrain, PointMeters } from './pathfind.js';

/**
 * D108 convention, as amended by WO-D108 Amendment 1: grid 10 m; shelf membership
 * |elevation - e0| <= 3.5 m; edge cell = shelf cell with any of 8 neighbors
 * at 30 m outward reach whose elevation sits > 3.5 m below e0; segment
 * window: bearings 45-135 degrees from the bench point, within 200 m; the
 * resulting extraction is intersected with WEST channel-side classification.
 * These are ruled structural constants and a ruled classifier, not calibration
 * entries.
 */
const GRID_METERS = 10;
const SHELF_RELIEF_METERS = 3.5;
const OUTWARD_REACH_METERS = 30;
const MIN_BEARING_DEGREES = 45;
const MAX_BEARING_DEGREES = 135;
const MAX_RANGE_METERS = 200;

const NEIGHBORS = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1],
] as const;

function bearingDegrees(eastMeters: number, northMeters: number): number {
  return (Math.atan2(eastMeters, northMeters) * 180 / Math.PI + 360) % 360;
}

/** Pure deterministic D108 lip extraction from terrain and a local bench point. */
export function extractBenchLip(
  terrain: Pick<EngineTerrain, 'elevationAtMeters' | 'channelSideAtMeters'>,
  benchPoint: PointMeters,
): PointMeters[] {
  const centerElevation = terrain.elevationAtMeters(benchPoint.x, benchPoint.y);
  if (!Number.isFinite(centerElevation)) return [];

  const radiusCells = Math.ceil(MAX_RANGE_METERS / GRID_METERS);
  const lip: PointMeters[] = [];
  for (let northIndex = -radiusCells; northIndex <= radiusCells; northIndex += 1) {
    for (let eastIndex = -radiusCells; eastIndex <= radiusCells; eastIndex += 1) {
      const eastMeters = eastIndex * GRID_METERS;
      const northMeters = northIndex * GRID_METERS;
      if (Math.hypot(eastMeters, northMeters) > MAX_RANGE_METERS) continue;
      const bearing = bearingDegrees(eastMeters, northMeters);
      if (bearing < MIN_BEARING_DEGREES || bearing > MAX_BEARING_DEGREES) continue;

      const x = benchPoint.x + eastMeters;
      const y = benchPoint.y + northMeters;
      if (terrain.channelSideAtMeters?.(x, y) !== 'WEST') continue;
      const elevation = terrain.elevationAtMeters(x, y);
      if (!Number.isFinite(elevation) ||
        Math.abs(elevation - centerElevation) > SHELF_RELIEF_METERS) continue;

      const isEdge = NEIGHBORS.some(([eastDirection, northDirection]) => {
        const outwardElevation = terrain.elevationAtMeters(
          x + eastDirection * OUTWARD_REACH_METERS,
          y + northDirection * OUTWARD_REACH_METERS,
        );
        return Number.isFinite(outwardElevation) &&
          outwardElevation < centerElevation - SHELF_RELIEF_METERS;
      });
      if (isEdge) lip.push({ x, y });
    }
  }

  return lip.sort((left, right) => left.y - right.y || left.x - right.x);
}
