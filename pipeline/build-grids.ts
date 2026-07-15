import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliCompressSync, constants as zlibConstants } from 'node:zlib';

import { fromFile } from 'geotiff';

import {
  CACHE_DIR,
  CORE_BOUNDS,
  type DemSourceMetadata,
  FULL_BOUNDS,
  LOCAL_ORIGIN,
  MANIFEST_PATH,
  OUTPUT_DIR,
  SOURCE_METADATA_PATH,
  type TerrainManifest,
  type TerrainTierManifest,
  UTM13N,
  dimensions,
  int16ToBytes,
  localToWgs84,
  projectedBounds,
  readJson,
  writeJson,
} from './shared.js';

interface SourceRaster {
  values: ArrayLike<number>;
  width: number;
  height: number;
  minLon: number;
  minLat: number;
  maxLon: number;
  maxLat: number;
  noData?: number;
}

function sourceElevation(source: SourceRaster, lon: number, lat: number): number {
  const x = ((lon - source.minLon) / (source.maxLon - source.minLon)) * source.width - 0.5;
  const y = ((source.maxLat - lat) / (source.maxLat - source.minLat)) * source.height - 0.5;
  const x0 = Math.max(0, Math.min(source.width - 1, Math.floor(x)));
  const y0 = Math.max(0, Math.min(source.height - 1, Math.floor(y)));
  const x1 = Math.min(source.width - 1, x0 + 1);
  const y1 = Math.min(source.height - 1, y0 + 1);
  const tx = Math.max(0, Math.min(1, x - x0));
  const ty = Math.max(0, Math.min(1, y - y0));
  const at = (column: number, row: number): number => source.values[row * source.width + column];
  const samples = [at(x0, y0), at(x1, y0), at(x0, y1), at(x1, y1)];
  if (samples.some((value) => !Number.isFinite(value) || value === source.noData)) {
    throw new Error(`DEM contains no-data near lon=${lon}, lat=${lat}`);
  }
  const north = samples[0] * (1 - tx) + samples[1] * tx;
  const south = samples[2] * (1 - tx) + samples[3] * tx;
  return north * (1 - ty) + south * ty;
}

async function buildTier(
  name: 'core' | 'full',
  geographicBounds: typeof CORE_BOUNDS,
  resolutionMeters: number,
  source: SourceRaster,
): Promise<TerrainTierManifest> {
  const projected = projectedBounds(geographicBounds);
  const [width, height] = dimensions(projected, resolutionMeters);
  const values = new Int16Array(width * height);
  console.log(`[grids] ${name}: sampling ${width}x${height} at ${resolutionMeters} m`);
  for (let row = 0; row < height; row += 1) {
    const y = projected.minY + row * resolutionMeters;
    for (let column = 0; column < width; column += 1) {
      const x = projected.minX + column * resolutionMeters;
      const point = localToWgs84(x, y);
      const elevation = sourceElevation(source, point.lon, point.lat);
      const decimeters = Math.round(elevation * 10);
      if (decimeters <= -32768 || decimeters > 32767) {
        throw new Error(`Elevation ${elevation} m does not fit Int16 decimeters`);
      }
      values[row * width + column] = decimeters;
    }
  }

  const filename = `elevation-${name}.i16`;
  const bytes = int16ToBytes(values);
  await writeFile(join(OUTPUT_DIR, filename), bytes);
  await writeFile(
    join(OUTPUT_DIR, `${filename}.br`),
    brotliCompressSync(bytes, {
      params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 11 },
    }),
  );
  console.log(`[grids] wrote ${filename} (${bytes.byteLength} bytes)`);
  return {
    geographicBounds,
    localBounds: {
      minX: projected.minX,
      minY: projected.minY,
      maxX: projected.minX + (width - 1) * resolutionMeters,
      maxY: projected.minY + (height - 1) * resolutionMeters,
    },
    resolutionMeters,
    width,
    height,
    rowOrder: 'south-to-north',
    elevation: {
      path: filename,
      compressedPath: `${filename}.br`,
      dataType: 'Int16',
      byteOrder: 'little-endian',
      scaleMeters: 0.1,
      noData: -32768,
    },
  };
}

async function main(): Promise<void> {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const sourceMetadata = await readJson<DemSourceMetadata>(SOURCE_METADATA_PATH);
  const sourcePath = join(CACHE_DIR, sourceMetadata.localFile);
  console.log(`[grids] reading ${sourceMetadata.localFile}`);
  const tiff = await fromFile(sourcePath);
  const image = await tiff.getImage();
  const raster = await image.readRasters({ samples: [0], interleave: true });
  const [minLon, minLat, maxLon, maxLat] = image.getBoundingBox();
  const noDataText = image.getGDALNoData();
  const source: SourceRaster = {
    values: raster,
    width: image.getWidth(),
    height: image.getHeight(),
    minLon,
    minLat,
    maxLon,
    maxLat,
    noData: noDataText === null ? undefined : Number(noDataText),
  };

  const core = await buildTier('core', CORE_BOUNDS, 10, source);
  const full = await buildTier('full', FULL_BOUNDS, 30, source);
  await tiff.close();
  const manifest: TerrainManifest = {
    schemaVersion: '1.0',
    scenarioId: 'little-bighorn-1876',
    source: {
      dataset: 'USGS 3DEP 1/3 arc-second',
      productTitle: sourceMetadata.productTitle,
      downloadUrl: sourceMetadata.downloadUrl,
      sha256: sourceMetadata.sha256,
      horizontalDatum: 'NAD83',
      verticalDatum: 'NAVD88',
      elevationUnits: 'meters',
    },
    crs: {
      geographic: 'EPSG:4326',
      projected: 'UTM zone 13N',
      projectedDefinition: UTM13N,
      axisUnits: 'meters',
      localOrigin: LOCAL_ORIGIN,
      forwardTransform: 'proj4(EPSG:4326, UTM13N) minus localOrigin',
      inverseTransform: 'proj4(UTM13N, EPSG:4326) after adding localOrigin',
    },
    tiers: { core, full },
  };
  await writeJson(MANIFEST_PATH, manifest);
  console.log('[grids] wrote manifest.json');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
