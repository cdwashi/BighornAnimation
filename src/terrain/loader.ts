import proj4 from 'proj4';

export interface TerrainGeoPoint {
  lat: number;
  lon: number;
}

export interface TerrainTierMetadata {
  geographicBounds: { sw: TerrainGeoPoint; ne: TerrainGeoPoint };
  localBounds: { minX: number; minY: number; maxX: number; maxY: number };
  resolutionMeters: number;
  width: number;
  height: number;
  rowOrder: 'south-to-north';
  elevation: {
    path: string;
    dataType: 'Int16';
    byteOrder: 'little-endian';
    scaleMeters: number;
    noData: number;
  };
}

export interface TerrainManifestData {
  schemaVersion: string;
  crs: {
    geographic: string;
    projectedDefinition: string;
    localOrigin: { easting: number; northing: number; wgs84: TerrainGeoPoint };
  };
  tiers: { core: TerrainTierMetadata; full: TerrainTierMetadata };
}

export type TerrainTierName = 'core' | 'full';

function decodeInt16LittleEndian(bytes: Uint8Array): Int16Array {
  if (bytes.byteLength % 2 !== 0) throw new Error('Int16 terrain grid has an odd byte length');
  const values = new Int16Array(bytes.byteLength / 2);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  values.forEach((_, index) => { values[index] = view.getInt16(index * 2, true); });
  return values;
}

function containsLocal(tier: TerrainTierMetadata, x: number, y: number): boolean {
  return x >= tier.localBounds.minX && x <= tier.localBounds.maxX &&
    y >= tier.localBounds.minY && y <= tier.localBounds.maxY;
}

function containsGeo(tier: TerrainTierMetadata, lat: number, lon: number): boolean {
  return lat >= tier.geographicBounds.sw.lat && lat <= tier.geographicBounds.ne.lat &&
    lon >= tier.geographicBounds.sw.lon && lon <= tier.geographicBounds.ne.lon;
}

export class TerrainLoader {
  readonly minimumResolutionMeters: number;

  constructor(
    readonly manifest: TerrainManifestData,
    private readonly elevations: Record<TerrainTierName, Int16Array>,
  ) {
    for (const name of ['core', 'full'] as const) {
      const tier = manifest.tiers[name];
      if (elevations[name].length !== tier.width * tier.height) {
        throw new Error(`${name} elevation grid length does not match manifest dimensions`);
      }
    }
    this.minimumResolutionMeters = Math.min(
      manifest.tiers.core.resolutionMeters,
      manifest.tiers.full.resolutionMeters,
    );
  }

  static async fromDirectory(directory: string): Promise<TerrainLoader> {
    const [{ readFile }, { join }, { brotliDecompressSync }] = await Promise.all([
      import('node:fs/promises'),
      import('node:path'),
      import('node:zlib'),
    ]);
    // D29: raw derived assets >5 MB are gitignored; fall back to the committed
    // .br variant when the raw file is absent (fresh clone without `npm run terrain`).
    const readMaybeBrotli = async (path: string): Promise<Uint8Array> => {
      try {
        return await readFile(path);
      } catch {
        return brotliDecompressSync(await readFile(`${path}.br`));
      }
    };
    const manifest = JSON.parse(
      new TextDecoder().decode(await readMaybeBrotli(join(directory, 'manifest.json'))),
    ) as TerrainManifestData;
    const load = async (name: TerrainTierName): Promise<Int16Array> =>
      decodeInt16LittleEndian(await readMaybeBrotli(join(directory, manifest.tiers[name].elevation.path)));
    const [core, full] = await Promise.all([load('core'), load('full')]);
    return new TerrainLoader(manifest, { core, full });
  }

  static async fromUrl(manifestUrl: string | URL): Promise<TerrainLoader> {
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`Terrain manifest fetch failed: ${response.status}`);
    const manifest = await response.json() as TerrainManifestData;
    const base = response.url || String(manifestUrl);
    const load = async (name: TerrainTierName): Promise<Int16Array> => {
      const assetUrl = new URL(manifest.tiers[name].elevation.path, base);
      const assetResponse = await fetch(assetUrl);
      if (!assetResponse.ok) throw new Error(`Terrain grid fetch failed: ${assetResponse.status}`);
      return decodeInt16LittleEndian(new Uint8Array(await assetResponse.arrayBuffer()));
    };
    const [core, full] = await Promise.all([load('core'), load('full')]);
    return new TerrainLoader(manifest, { core, full });
  }

  toLocal(lat: number, lon: number): [number, number] {
    const [easting, northing] = proj4(
      this.manifest.crs.geographic,
      this.manifest.crs.projectedDefinition,
      [lon, lat],
    );
    return [
      easting - this.manifest.crs.localOrigin.easting,
      northing - this.manifest.crs.localOrigin.northing,
    ];
  }

  toWgs84(x: number, y: number): TerrainGeoPoint {
    const [lon, lat] = proj4(
      this.manifest.crs.projectedDefinition,
      this.manifest.crs.geographic,
      [
        x + this.manifest.crs.localOrigin.easting,
        y + this.manifest.crs.localOrigin.northing,
      ],
    );
    return { lat, lon };
  }

  tierAt(lat: number, lon: number): TerrainTierName {
    if (containsGeo(this.manifest.tiers.core, lat, lon)) return 'core';
    if (containsGeo(this.manifest.tiers.full, lat, lon)) return 'full';
    throw new RangeError(`Coordinate ${lat},${lon} is outside the terrain bounds`);
  }

  tierAtMeters(x: number, y: number): TerrainTierName {
    if (containsLocal(this.manifest.tiers.core, x, y)) return 'core';
    if (containsLocal(this.manifest.tiers.full, x, y)) return 'full';
    throw new RangeError(`Local coordinate ${x},${y} is outside the terrain bounds`);
  }

  resolutionAtMeters(x: number, y: number): number {
    return this.manifest.tiers[this.tierAtMeters(x, y)].resolutionMeters;
  }

  elevationAt(lat: number, lon: number): number {
    const name = this.tierAt(lat, lon);
    const [x, y] = this.toLocal(lat, lon);
    return this.sample(name, x, y);
  }

  elevationAtMeters(x: number, y: number): number {
    return this.sample(this.tierAtMeters(x, y), x, y);
  }

  private sample(name: TerrainTierName, x: number, y: number): number {
    const tier = this.manifest.tiers[name];
    const gridX = (x - tier.localBounds.minX) / tier.resolutionMeters;
    const gridY = (y - tier.localBounds.minY) / tier.resolutionMeters;
    const x0 = Math.max(0, Math.min(tier.width - 1, Math.floor(gridX)));
    const y0 = Math.max(0, Math.min(tier.height - 1, Math.floor(gridY)));
    const x1 = Math.min(tier.width - 1, x0 + 1);
    const y1 = Math.min(tier.height - 1, y0 + 1);
    const tx = Math.max(0, Math.min(1, gridX - x0));
    const ty = Math.max(0, Math.min(1, gridY - y0));
    const values = this.elevations[name];
    const read = (column: number, row: number): number => {
      const value = values[row * tier.width + column];
      if (value === tier.elevation.noData) throw new Error(`No elevation data in ${name} tier`);
      return value * tier.elevation.scaleMeters;
    };
    const south = read(x0, y0) * (1 - tx) + read(x1, y0) * tx;
    const north = read(x0, y1) * (1 - tx) + read(x1, y1) * tx;
    return south * (1 - ty) + north * ty;
  }
}
