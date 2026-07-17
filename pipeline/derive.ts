import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, constants as zlibConstants, gzipSync } from 'node:zlib';

import { contours } from 'd3-contour';
import { PNG } from 'pngjs';

import {
  MANIFEST_PATH,
  OUTPUT_DIR,
  type TerrainManifest,
  type TerrainTierManifest,
  bytesToInt16,
  localToWgs84,
  readJson,
  writeJson,
} from './shared.js';

interface GeoJsonFeature {
  type: 'Feature';
  properties: { elevationMeters: number; indexContour: boolean };
  geometry: { type: 'MultiLineString'; coordinates: number[][][] };
}

function elevationAt(values: Int16Array, tier: TerrainTierManifest, column: number, row: number): number {
  const safeColumn = Math.max(0, Math.min(tier.width - 1, column));
  const safeRow = Math.max(0, Math.min(tier.height - 1, row));
  return values[safeRow * tier.width + safeColumn] * 0.1;
}

function derivatives(
  values: Int16Array,
  tier: TerrainTierManifest,
  column: number,
  row: number,
): [number, number] {
  const z1 = elevationAt(values, tier, column - 1, row + 1);
  const z2 = elevationAt(values, tier, column, row + 1);
  const z3 = elevationAt(values, tier, column + 1, row + 1);
  const z4 = elevationAt(values, tier, column - 1, row);
  const z6 = elevationAt(values, tier, column + 1, row);
  const z7 = elevationAt(values, tier, column - 1, row - 1);
  const z8 = elevationAt(values, tier, column, row - 1);
  const z9 = elevationAt(values, tier, column + 1, row - 1);
  const denominator = 8 * tier.resolutionMeters;
  return [
    ((z3 + 2 * z6 + z9) - (z1 + 2 * z4 + z7)) / denominator,
    ((z1 + 2 * z2 + z3) - (z7 + 2 * z8 + z9)) / denominator,
  ];
}

async function deriveTier(
  name: 'core' | 'full',
  tier: TerrainTierManifest,
): Promise<Int16Array> {
  const elevationBytes = await readFile(join(OUTPUT_DIR, tier.elevation.path));
  const elevations = bytesToInt16(elevationBytes);
  const slope = new Uint8Array(elevations.length);
  const png = new PNG({ width: tier.width, height: tier.height });
  const sunAzimuth = 315 * Math.PI / 180;
  const sunAltitude = 45 * Math.PI / 180;
  const sunX = Math.sin(sunAzimuth) * Math.cos(sunAltitude);
  const sunY = Math.cos(sunAzimuth) * Math.cos(sunAltitude);
  const sunZ = Math.sin(sunAltitude);

  for (let row = 0; row < tier.height; row += 1) {
    for (let column = 0; column < tier.width; column += 1) {
      const [dzdx, dzdy] = derivatives(elevations, tier, column, row);
      slope[row * tier.width + column] = Math.min(
        90,
        Math.round(Math.atan(Math.hypot(dzdx, dzdy)) * 180 / Math.PI),
      );
      const normalLength = Math.hypot(dzdx, dzdy, 1);
      const illumination = Math.max(
        0,
        ((-dzdx * sunX) + (-dzdy * sunY) + sunZ) / normalLength,
      );
      const northRow = tier.height - 1 - row;
      const shade = Math.round(illumination * 255);
      const pngIndex = (northRow * tier.width + column) * 4;
      png.data[pngIndex] = shade;
      png.data[pngIndex + 1] = shade;
      png.data[pngIndex + 2] = shade;
      png.data[pngIndex + 3] = 255;
    }
  }

  const slopeFilename = `slope-${name}.u8`;
  const hillshadeFilename = `hillshade-${name}.png`;
  await writeFile(join(OUTPUT_DIR, slopeFilename), slope);
  await writeFile(
    join(OUTPUT_DIR, `${slopeFilename}.br`),
    brotliCompressSync(slope, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
  await writeFile(join(OUTPUT_DIR, `${slopeFilename}.gz`), gzipSync(slope, { level: 9 }));
  await writeFile(join(OUTPUT_DIR, hillshadeFilename), PNG.sync.write(png));
  tier.slope = {
    path: slopeFilename,
    compressedPath: `${slopeFilename}.br`,
    gzipPath: `${slopeFilename}.gz`,
    dataType: 'Uint8',
    noData: 255,
  };
  tier.hillshade = {
    path: hillshadeFilename,
    format: 'PNG',
    illumination: 'Horn method; azimuth 315 degrees NW; altitude 45 degrees',
  };
  console.log(`[derive] wrote ${slopeFilename} and ${hillshadeFilename}`);
  return elevations;
}

function buildContours(elevations: Int16Array, tier: TerrainTierManifest): GeoJsonFeature[] {
  const northFirst = new Array<number>(elevations.length);
  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let northRow = 0; northRow < tier.height; northRow += 1) {
    const sourceRow = tier.height - 1 - northRow;
    for (let column = 0; column < tier.width; column += 1) {
      const value = elevations[sourceRow * tier.width + column] * 0.1;
      northFirst[northRow * tier.width + column] = value;
      min = Math.min(min, value);
      max = Math.max(max, value);
    }
  }
  const thresholds: number[] = [];
  for (let threshold = Math.ceil(min / 5) * 5; threshold <= Math.floor(max / 5) * 5; threshold += 5) {
    thresholds.push(threshold);
  }
  const generated = contours()
    .size([tier.width, tier.height])
    .thresholds(thresholds)(northFirst);

  return generated.map((contour) => {
    const lines: number[][][] = [];
    contour.coordinates.forEach((polygon) => polygon.forEach((ring) => {
      lines.push(ring.map(([gridX, gridY]) => {
        const x = tier.localBounds.minX + (gridX - 0.5) * tier.resolutionMeters;
        const y = tier.localBounds.maxY - (gridY - 0.5) * tier.resolutionMeters;
        const point = localToWgs84(x, y);
        // D29: cap at 5 decimals (~1 m) — ample for 5 m contours, shrinks the GeoJSON.
        return [Math.round(point.lon * 1e5) / 1e5, Math.round(point.lat * 1e5) / 1e5];
      }));
    }));
    const elevationMeters = Number(contour.value);
    return {
      type: 'Feature',
      properties: {
        elevationMeters,
        indexContour: elevationMeters % 25 === 0,
      },
      geometry: { type: 'MultiLineString', coordinates: lines },
    };
  });
}

async function main(): Promise<void> {
  const manifest = await readJson<TerrainManifest>(MANIFEST_PATH);
  const coreElevations = await deriveTier('core', manifest.tiers.core);
  await deriveTier('full', manifest.tiers.full);
  const features = buildContours(coreElevations, manifest.tiers.core);
  if (features.length === 0) throw new Error('Contour generation produced no features');
  const contourFilename = 'contours-core.geojson';
  // D29: compact JSON + committed .br variant; the raw file is gitignored (>5 MB)
  // and reproducible via `npm run terrain`.
  const contourJson = JSON.stringify({ type: 'FeatureCollection', features });
  await writeFile(join(OUTPUT_DIR, contourFilename), `${contourJson}\n`);
  await writeFile(
    join(OUTPUT_DIR, `${contourFilename}.br`),
    brotliCompressSync(new TextEncoder().encode(`${contourJson}\n`), {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
  await writeFile(
    join(OUTPUT_DIR, `${contourFilename}.gz`),
    gzipSync(new TextEncoder().encode(`${contourJson}\n`), { level: 9 }),
  );
  manifest.contours = {
    path: contourFilename,
    compressedPath: `${contourFilename}.br`,
    gzipPath: `${contourFilename}.gz`,
    format: 'GeoJSON',
    coordinatePrecision: 5,
    intervalMeters: 5,
    indexIntervalMeters: 25,
    sourceTier: 'core',
  };
  await writeJson(MANIFEST_PATH, manifest);
  console.log(`[derive] wrote ${contourFilename} (${features.length} elevation levels)`);
  console.log('[derive] updated manifest.json');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
