import type { PointMeters } from '../../engine/src/pathfind.js';
import {
  beerLambertTransmittance,
  coverPathTransmittance,
  pointInPolygon,
  type SpottingRuntime,
} from '../../engine/src/spotting.js';
import { raycastTerrain, type RaycastTerrain } from './raycast.js';

export interface ViewshedBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface ViewshedRequest {
  bounds: ViewshedBounds;
  resolutionMeters: number;
  observer: PointMeters;
  observerHeightMeters: number;
  targetHeightMeters: number;
  atmosphericFactor: number;
}

export interface ViewshedRaster {
  width: number;
  height: number;
  values: Uint8ClampedArray;
}

interface ViewshedTerrain extends RaycastTerrain {
  viewshedElevationGrid?(): {
    values: Int16Array;
    width: number;
    height: number;
    scaleMeters: number;
    noData: number;
  };
}

const opacityRasters = new WeakMap<SpottingRuntime, Map<string, Float32Array>>();

export function prepareViewshedCover(
  runtime: SpottingRuntime,
  bounds: ViewshedBounds,
  resolutionMeters: number,
): Float32Array {
  const width = Math.floor((bounds.maxX - bounds.minX) / resolutionMeters) + 1;
  const height = Math.floor((bounds.maxY - bounds.minY) / resolutionMeters) + 1;
  const key = `${bounds.minX},${bounds.minY},${bounds.maxX},${bounds.maxY},${resolutionMeters}`;
  let cache = opacityRasters.get(runtime);
  if (!cache) {
    cache = new Map();
    opacityRasters.set(runtime, cache);
  }
  const cached = cache.get(key);
  if (cached) return cached;
  const raster = new Float32Array(width * height);
  runtime.projectedCover.forEach((cover) => {
    let ringMinimumX = Number.POSITIVE_INFINITY;
    let ringMaximumX = Number.NEGATIVE_INFINITY;
    let ringMinimumY = Number.POSITIVE_INFINITY;
    let ringMaximumY = Number.NEGATIVE_INFINITY;
    cover.ring.forEach((point) => {
      ringMinimumX = Math.min(ringMinimumX, point.x);
      ringMaximumX = Math.max(ringMaximumX, point.x);
      ringMinimumY = Math.min(ringMinimumY, point.y);
      ringMaximumY = Math.max(ringMaximumY, point.y);
    });
    const minimumX = Math.max(0, Math.floor((ringMinimumX - bounds.minX) / resolutionMeters));
    const maximumX = Math.min(width - 1, Math.ceil((ringMaximumX - bounds.minX) / resolutionMeters));
    const minimumY = Math.max(0, Math.floor((ringMinimumY - bounds.minY) / resolutionMeters));
    const maximumY = Math.min(height - 1, Math.ceil((ringMaximumY - bounds.minY) / resolutionMeters));
    for (let row = minimumY; row <= maximumY; row += 1) {
      for (let column = minimumX; column <= maximumX; column += 1) {
        if (pointInPolygon({
          x: bounds.minX + column * resolutionMeters,
          y: bounds.minY + row * resolutionMeters,
        }, cover.ring)) raster[row * width + column] = cover.opacity;
      }
    }
  });
  cache.set(key, raster);
  return raster;
}

/** V5 exact verdict. Both renderer and engine use the same ray and D54 functions. */
export function rendererVisibility(
  terrain: RaycastTerrain,
  runtime: SpottingRuntime,
  observer: PointMeters,
  target: PointMeters,
  observerHeightMeters: number,
  targetHeightMeters: number,
  atmosphericFactor = 1,
): boolean {
  const ray = raycastTerrain(terrain, observer, target, {
    observerHeightMeters,
    targetHeightMeters,
    curvatureCorrection: true,
    refractionCoefficient: 0.13,
  });
  if (!ray.visible) return false;
  return coverPathTransmittance(runtime, observer, target).transmittance *
    Math.max(0, Math.min(1, atmosphericFactor)) > 0;
}

/**
 * D48 30 m radial-ray raster. Terrain horizon sampling follows perimeter
 * Bresenham rays; cover attenuation calls D54's shared Beer-Lambert function.
 */
export function computeViewshedRaster(
  terrain: ViewshedTerrain,
  runtime: SpottingRuntime,
  request: ViewshedRequest,
): ViewshedRaster {
  const { bounds, resolutionMeters, observer } = request;
  const width = Math.floor((bounds.maxX - bounds.minX) / resolutionMeters) + 1;
  const height = Math.floor((bounds.maxY - bounds.minY) / resolutionMeters) + 1;
  const values = new Uint8ClampedArray(width * height);
  const observerColumn = Math.max(0, Math.min(width - 1,
    Math.round((observer.x - bounds.minX) / resolutionMeters)));
  const observerRow = Math.max(0, Math.min(height - 1,
    Math.round((observer.y - bounds.minY) / resolutionMeters)));
  const sourceGrid = terrain.viewshedElevationGrid?.();
  const elevationAtCell = sourceGrid && sourceGrid.width === width && sourceGrid.height === height
    ? (column: number, row: number): number => {
      const value = sourceGrid.values[row * width + column];
      if (value === sourceGrid.noData) return terrain.elevationAtMeters(
        bounds.minX + column * resolutionMeters,
        bounds.minY + row * resolutionMeters,
      );
      return value * sourceGrid.scaleMeters;
    }
    : (column: number, row: number): number => terrain.elevationAtMeters(
      bounds.minX + column * resolutionMeters,
      bounds.minY + row * resolutionMeters,
    );
  const observerElevation = terrain.elevationAtMeters(observer.x, observer.y) + request.observerHeightMeters;
  const effectiveRadius = 6_371_008.8 / (1 - 0.13);
  const atmosphere = Math.max(0, Math.min(1, request.atmosphericFactor));
  const opacityCache = prepareViewshedCover(runtime, bounds, resolutionMeters);

  const cast = (edgeColumn: number, edgeRow: number): void => {
    let horizon = Number.NEGATIVE_INFINITY;
    let transmittance = atmosphere;
    let previousColumn = observerColumn;
    let previousRow = observerRow;
    const dx = Math.abs(edgeColumn - observerColumn);
    const sx = observerColumn < edgeColumn ? 1 : -1;
    const dy = -Math.abs(edgeRow - observerRow);
    const sy = observerRow < edgeRow ? 1 : -1;
    let error = dx + dy;
    let column = observerColumn;
    let row = observerRow;
    for (;;) {
      const index = row * width + column;
      if (column === observerColumn && row === observerRow) {
        values[index] = 255;
      } else {
        const x = bounds.minX + column * resolutionMeters;
        const y = bounds.minY + row * resolutionMeters;
        const distance = Math.hypot(x - observer.x, y - observer.y);
        const curvatureDrop = distance * distance / (2 * effectiveRadius);
        const ground = elevationAtCell(column, row) - curvatureDrop;
        const targetSlope = (ground + request.targetHeightMeters - observerElevation) / distance;
        if (targetSlope >= horizon) {
          values[index] = Math.max(values[index], Math.round(255 * transmittance));
        }
        horizon = Math.max(horizon, (ground - observerElevation) / distance);
        const stepMeters = Math.hypot(column - previousColumn, row - previousRow) * resolutionMeters;
        const opacity = opacityCache[index];
        if (opacity > 0) {
          transmittance *= beerLambertTransmittance(
            opacity,
            stepMeters,
            runtime.config.attenuationUnitMeters,
          );
        }
        previousColumn = column;
        previousRow = row;
      }
      if (column === edgeColumn && row === edgeRow) break;
      const doubled = error * 2;
      if (doubled >= dy) { error += dy; column += sx; }
      if (doubled <= dx) { error += dx; row += sy; }
    }
  };

  for (let column = 0; column < width; column += 1) {
    cast(column, 0);
    if (height > 1) cast(column, height - 1);
  }
  for (let row = 1; row < height - 1; row += 1) {
    cast(0, row);
    if (width > 1) cast(width - 1, row);
  }
  return { width, height, values };
}
