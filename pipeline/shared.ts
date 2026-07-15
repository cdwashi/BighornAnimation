import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

import proj4 from 'proj4';

export interface GeoPoint {
  lat: number;
  lon: number;
}

export interface GeoBounds {
  sw: GeoPoint;
  ne: GeoPoint;
}

export interface LocalBounds {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

export interface GridAsset {
  path: string;
  compressedPath?: string;
  dataType: 'Int16' | 'Uint8' | 'Float32';
  byteOrder?: 'little-endian';
  scaleMeters?: number;
  noData?: number | 'Infinity';
}

export interface TerrainTierManifest {
  geographicBounds: GeoBounds;
  localBounds: LocalBounds;
  resolutionMeters: number;
  width: number;
  height: number;
  rowOrder: 'south-to-north';
  elevation: GridAsset;
  slope?: GridAsset;
  hillshade?: { path: string; format: 'PNG'; illumination: string };
}

export interface TerrainManifest {
  schemaVersion: '1.0';
  scenarioId: string;
  source: {
    dataset: string;
    productTitle: string;
    downloadUrl: string;
    sha256: string;
    horizontalDatum: 'NAD83';
    verticalDatum: 'NAVD88';
    elevationUnits: 'meters';
  };
  crs: {
    geographic: 'EPSG:4326';
    projected: 'UTM zone 13N';
    projectedDefinition: string;
    axisUnits: 'meters';
    localOrigin: { easting: number; northing: number; wgs84: GeoPoint };
    forwardTransform: string;
    inverseTransform: string;
  };
  tiers: { core: TerrainTierManifest; full: TerrainTierManifest };
  contours?: {
    path: string;
    compressedPath: string;
    format: 'GeoJSON';
    coordinatePrecision: number;
    intervalMeters: 5;
    indexIntervalMeters: 25;
    sourceTier: 'core';
  };
  rasterLayers?: {
    tier: 'core';
    coverKind: GridAsset & { codes: Record<string, number> };
    movementCost: GridAsset & { semantics: string };
    riverBurnedCellCount: number;
    fordBurnedCellCount: number;
  };
}

export interface DemSourceMetadata {
  apiUrl: string;
  productTitle: string;
  publicationDate: string;
  downloadUrl: string;
  localFile: string;
  sha256: string;
  sizeInBytes: number;
}

export const REPO_ROOT = process.cwd();
export const CACHE_DIR = join(REPO_ROOT, 'pipeline', 'cache');
export const OUTPUT_DIR = join(REPO_ROOT, 'data', 'terrain', 'little-bighorn-1876');
export const SCENARIO_PATH = join(
  REPO_ROOT,
  'data',
  'scenarios',
  'little-bighorn-1876',
  'scenario.json',
);
export const MANIFEST_PATH = join(OUTPUT_DIR, 'manifest.json');
export const SOURCE_METADATA_PATH = join(CACHE_DIR, 'dem-source.json');

export const FULL_BOUNDS: GeoBounds = {
  sw: { lat: 45.42, lon: -107.48 },
  ne: { lat: 45.6, lon: -107.15 },
};
export const CORE_BOUNDS: GeoBounds = {
  sw: { lat: 45.49, lon: -107.48 },
  ne: { lat: 45.6, lon: -107.33 },
};
export const WGS84 = 'EPSG:4326';
export const UTM13N = '+proj=utm +zone=13 +datum=NAD83 +units=m +no_defs +type=crs';
const [originEasting, originNorthing] = proj4(WGS84, UTM13N, [
  FULL_BOUNDS.sw.lon,
  FULL_BOUNDS.sw.lat,
]);
export const LOCAL_ORIGIN = {
  easting: originEasting,
  northing: originNorthing,
  wgs84: FULL_BOUNDS.sw,
};

export function wgs84ToLocal(point: GeoPoint): [number, number] {
  const [easting, northing] = proj4(WGS84, UTM13N, [point.lon, point.lat]);
  return [easting - originEasting, northing - originNorthing];
}

export function localToWgs84(x: number, y: number): GeoPoint {
  const [lon, lat] = proj4(UTM13N, WGS84, [x + originEasting, y + originNorthing]);
  return { lat, lon };
}

export function projectedBounds(bounds: GeoBounds): LocalBounds {
  const corners = [
    bounds.sw,
    bounds.ne,
    { lat: bounds.sw.lat, lon: bounds.ne.lon },
    { lat: bounds.ne.lat, lon: bounds.sw.lon },
  ].map(wgs84ToLocal);
  return {
    minX: Math.min(...corners.map(([x]) => x)),
    minY: Math.min(...corners.map(([, y]) => y)),
    maxX: Math.max(...corners.map(([x]) => x)),
    maxY: Math.max(...corners.map(([, y]) => y)),
  };
}

export function dimensions(bounds: LocalBounds, resolutionMeters: number): [number, number] {
  return [
    Math.ceil((bounds.maxX - bounds.minX) / resolutionMeters) + 1,
    Math.ceil((bounds.maxY - bounds.minY) / resolutionMeters) + 1,
  ];
}

export async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

export async function writeJson(path: string, value: unknown): Promise<void> {
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`);
}

export function int16ToBytes(values: Int16Array): Uint8Array {
  const bytes = new Uint8Array(values.length * 2);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setInt16(index * 2, value, true));
  return bytes;
}

export function float32ToBytes(values: Float32Array): Uint8Array {
  const bytes = new Uint8Array(values.length * 4);
  const view = new DataView(bytes.buffer);
  values.forEach((value, index) => view.setFloat32(index * 4, value, true));
  return bytes;
}

export function bytesToInt16(bytes: Uint8Array): Int16Array {
  const values = new Int16Array(bytes.length / 2);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  values.forEach((_, index) => { values[index] = view.getInt16(index * 2, true); });
  return values;
}

export function gridIndex(
  tier: Pick<TerrainTierManifest, 'localBounds' | 'resolutionMeters' | 'width' | 'height'>,
  x: number,
  y: number,
): [number, number] | undefined {
  const column = Math.round((x - tier.localBounds.minX) / tier.resolutionMeters);
  const row = Math.round((y - tier.localBounds.minY) / tier.resolutionMeters);
  if (column < 0 || row < 0 || column >= tier.width || row >= tier.height) return undefined;
  return [column, row];
}
