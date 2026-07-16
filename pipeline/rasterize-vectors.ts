import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, constants as zlibConstants } from 'node:zlib';

import {
  MANIFEST_PATH,
  OUTPUT_DIR,
  SCENARIO_PATH,
  type GeoPoint,
  type TerrainManifest,
  float32ToBytes,
  gridIndex,
  readJson,
  wgs84ToLocal,
  writeJson,
} from './shared.js';

interface ScenarioTerrain {
  terrain: {
    rivers: Array<{
      id: string;
      path: { points: GeoPoint[] };
      fords: Array<{ id: string; position: GeoPoint }>;
      crossingPenaltyMinutes: number;
    }>;
    cover: Array<{
      id: string;
      kind: string;
      area: { ring: GeoPoint[] };
      movementFactor: number;
    }>;
    historicalCorrections: Array<{
      id: string;
      replaces?: string;
      geometry: { points?: GeoPoint[]; ring?: GeoPoint[] };
    }>;
  };
}

const COVER_CODES: Record<string, number> = {
  NONE: 0,
  TIMBER: 1,
  VILLAGE: 2,
  RAVINE: 3,
  HISTORICAL_CORRECTION: 4,
  RIVER: 254,
  FORD: 255,
};

function polygonArea(points: Array<[number, number]>): number {
  let twiceArea = 0;
  points.forEach(([x, y], index) => {
    const [nextX, nextY] = points[(index + 1) % points.length];
    twiceArea += x * nextY - nextX * y;
  });
  return Math.abs(twiceArea) / 2;
}

function pointInPolygon(x: number, y: number, polygon: Array<[number, number]>): boolean {
  let inside = false;
  for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current, current += 1) {
    const [currentX, currentY] = polygon[current];
    const [previousX, previousY] = polygon[previous];
    const crosses = (currentY > y) !== (previousY > y) &&
      x < ((previousX - currentX) * (y - currentY)) / (previousY - currentY) + currentX;
    if (crosses) inside = !inside;
  }
  return inside;
}

async function main(): Promise<void> {
  const manifest = await readJson<TerrainManifest>(MANIFEST_PATH);
  const scenario = await readJson<ScenarioTerrain>(SCENARIO_PATH);
  const tier = manifest.tiers.core;
  const cellCount = tier.width * tier.height;
  const coverKind = new Uint8Array(cellCount);
  const slope = await readFile(join(OUTPUT_DIR, tier.slope?.path ?? 'slope-core.u8'));
  if (slope.byteLength !== cellCount) throw new Error('Core slope grid size does not match manifest');
  const movementCost = new Float32Array(cellCount);
  // [CAL] D28: 1 + tan(slope) is the approved placeholder slope factor; Tobler's
  // hiking function is the M5 calibration-era upgrade candidate.
  slope.forEach((degrees, index) => {
    movementCost[index] = 1 + Math.tan(degrees * Math.PI / 180);
  });

  for (const cover of scenario.terrain.cover) {
    const polygon = cover.area.ring.map(wgs84ToLocal);
    if (polygon.length < 3 || polygonArea(polygon) < 0.01) {
      console.warn(`[rasterize] warning: cover ${cover.id} is a zero-area O4 placeholder; empty burn expected`);
      continue;
    }
    const minX = Math.min(...polygon.map(([x]) => x));
    const maxX = Math.max(...polygon.map(([x]) => x));
    const minY = Math.min(...polygon.map(([, y]) => y));
    const maxY = Math.max(...polygon.map(([, y]) => y));
    const start = gridIndex(tier, minX, minY) ?? [0, 0];
    const end = gridIndex(tier, maxX, maxY) ?? [tier.width - 1, tier.height - 1];
    let burned = 0;
    for (let row = Math.max(0, start[1] - 1); row <= Math.min(tier.height - 1, end[1] + 1); row += 1) {
      const y = tier.localBounds.minY + row * tier.resolutionMeters;
      for (let column = Math.max(0, start[0] - 1); column <= Math.min(tier.width - 1, end[0] + 1); column += 1) {
        const x = tier.localBounds.minX + column * tier.resolutionMeters;
        if (!pointInPolygon(x, y, polygon)) continue;
        const index = row * tier.width + column;
        coverKind[index] = COVER_CODES[cover.kind] ?? COVER_CODES.HISTORICAL_CORRECTION;
        // TODO-AMBIGUOUS(M1-A): the schema calls this a movement factor while the work
        // order prescribes multiplication; preserve that literal contract here.
        movementCost[index] *= cover.movementFactor;
        burned += 1;
      }
    }
    if (burned === 0) console.warn(`[rasterize] warning: cover ${cover.id} burned no cells`);
  }

  const river = scenario.terrain.rivers[0];
  if (!river) throw new Error('Scenario has no river to rasterize');
  const correction = scenario.terrain.historicalCorrections.find(
    (item) => item.replaces === river.id && item.geometry.points,
  );
  const effectiveRiver = correction?.geometry.points ?? river.path.points;
  const riverCells = new Set<number>();
  for (let segment = 1; segment < effectiveRiver.length; segment += 1) {
    const [startX, startY] = wgs84ToLocal(effectiveRiver[segment - 1]);
    const [endX, endY] = wgs84ToLocal(effectiveRiver[segment]);
    const distance = Math.hypot(endX - startX, endY - startY);
    const steps = Math.max(1, Math.ceil(distance / (tier.resolutionMeters / 2)));
    for (let step = 0; step <= steps; step += 1) {
      const fraction = step / steps;
      const cell = gridIndex(
        tier,
        startX + (endX - startX) * fraction,
        startY + (endY - startY) * fraction,
      );
      if (!cell) continue;
      riverCells.add(cell[1] * tier.width + cell[0]);
    }
  }
  if (riverCells.size === 0) throw new Error('River rasterization produced an empty burn');
  riverCells.forEach((index) => {
    coverKind[index] = COVER_CODES.RIVER;
    movementCost[index] = Number.POSITIVE_INFINITY;
  });

  const fordCells = new Set<number>();
  river.fords.forEach((ford) => {
    const cell = gridIndex(tier, ...wgs84ToLocal(ford.position));
    if (!cell) return;
    // D42 places all authored fords on the corrected channel. Keep the nearest-channel
    // cell plus one-cell-radius marker so every ford robustly opens the rasterized mask.
    let nearestRiverIndex: number | undefined;
    let nearestDistanceSquared = Number.POSITIVE_INFINITY;
    riverCells.forEach((riverIndex) => {
      const riverColumn = riverIndex % tier.width;
      const riverRow = Math.floor(riverIndex / tier.width);
      const distanceSquared = (riverColumn - cell[0]) ** 2 + (riverRow - cell[1]) ** 2;
      if (distanceSquared < nearestDistanceSquared) {
        nearestDistanceSquared = distanceSquared;
        nearestRiverIndex = riverIndex;
      }
    });
    if (nearestRiverIndex !== undefined) fordCells.add(nearestRiverIndex);
    for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
      for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
        if (columnOffset * columnOffset + rowOffset * rowOffset > 1) continue;
        const column = cell[0] + columnOffset;
        const row = cell[1] + rowOffset;
        if (column < 0 || row < 0 || column >= tier.width || row >= tier.height) continue;
        const index = row * tier.width + column;
        fordCells.add(index);
        coverKind[index] = COVER_CODES.FORD;
        // TODO-AMBIGUOUS(M1-A): no unit conversion is specified between multiplicative
        // movement cost and crossing minutes, so ford cells carry the stated penalty.
        movementCost[index] = river.crossingPenaltyMinutes;
      }
    }
  });
  fordCells.forEach((index) => {
    coverKind[index] = COVER_CODES.FORD;
    movementCost[index] = river.crossingPenaltyMinutes;
  });

  const coverFilename = 'cover-kind-core.u8';
  const movementFilename = 'movement-cost-core.f32';
  const movementBytes = float32ToBytes(movementCost);
  await writeFile(join(OUTPUT_DIR, coverFilename), coverKind);
  await writeFile(join(OUTPUT_DIR, movementFilename), movementBytes);
  await writeFile(
    join(OUTPUT_DIR, `${coverFilename}.br`),
    brotliCompressSync(coverKind, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
  await writeFile(
    join(OUTPUT_DIR, `${movementFilename}.br`),
    brotliCompressSync(movementBytes, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
  manifest.rasterLayers = {
    tier: 'core',
    coverKind: {
      path: coverFilename,
      compressedPath: `${coverFilename}.br`,
      dataType: 'Uint8',
      codes: COVER_CODES,
    },
    movementCost: {
      path: movementFilename,
      compressedPath: `${movementFilename}.br`,
      dataType: 'Float32',
      byteOrder: 'little-endian',
      noData: 'Infinity',
      semantics: 'slope factor multiplied by cover movementFactor; river Infinity; ford crossingPenaltyMinutes',
    },
    riverBurnedCellCount: riverCells.size,
    fordBurnedCellCount: fordCells.size,
  };
  await writeJson(MANIFEST_PATH, manifest);
  console.log(`[rasterize] river burned ${riverCells.size} cells; fords burned ${fordCells.size} cells`);
  console.log(`[rasterize] wrote ${coverFilename}, ${movementFilename}, and manifest.json`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
