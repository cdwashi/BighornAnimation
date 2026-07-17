import type {
  EngineTerrain,
  MovementGrid,
  MovementSample,
  PointMeters,
} from '../../engine/src/pathfind.js';
import { TerrainLoader, type TerrainManifestData, type TerrainTierName } from './loader.js';

interface RasterManifest extends TerrainManifestData {
  tiers: TerrainManifestData['tiers'] & Record<TerrainTierName, TerrainManifestData['tiers']['core'] & {
    slope: { path: string; compressedPath?: string; gzipPath?: string; dataType: 'Uint8'; noData: number };
  }>;
  rasterLayers: {
    tier: 'core';
    coverKind: {
      path: string;
      compressedPath?: string;
      gzipPath?: string;
      dataType: 'Uint8';
      codes: Record<string, number>;
    };
    movementCost: {
      path: string;
      compressedPath?: string;
      gzipPath?: string;
      dataType: 'Float32';
      byteOrder: 'little-endian';
      noData: 'Infinity';
    };
  };
}

function decodeFloat32LittleEndian(bytes: Uint8Array): Float32Array {
  if (bytes.byteLength % 4 !== 0) throw new Error('Float32 movement grid has an invalid byte length');
  const result = new Float32Array(bytes.byteLength / 4);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  result.forEach((_, index) => { result[index] = view.getFloat32(index * 4, true); });
  return result;
}

function slopeCost(degrees: number): number {
  return 1 + Math.tan(degrees * Math.PI / 180);
}

function minimumFinite(values: Float32Array): number {
  let minimum = Number.POSITIVE_INFINITY;
  values.forEach((value) => {
    if (Number.isFinite(value) && value < minimum) minimum = value;
  });
  if (!Number.isFinite(minimum)) throw new Error('Movement grid contains no passable cells');
  return minimum;
}

/** Node-side adapter; engine/src only sees the injected EngineTerrain interface. */
export class TerrainMovementLoader implements EngineTerrain {
  readonly minimumResolutionMeters: number;

  private constructor(
    private readonly terrain: TerrainLoader,
    private readonly manifest: RasterManifest,
    private readonly grids: Record<TerrainTierName, MovementGrid>,
  ) {
    this.minimumResolutionMeters = terrain.minimumResolutionMeters;
  }

  fullBounds(): RasterManifest['tiers']['full']['localBounds'] {
    return this.manifest.tiers.full.localBounds;
  }

  viewshedElevationGrid(): ReturnType<TerrainLoader['elevationGrid']> {
    return this.terrain.elevationGrid('full');
  }

  static async fromDirectory(directory: string): Promise<TerrainMovementLoader> {
    const [{ readFile }, { join }, { brotliDecompressSync }] = await Promise.all([
      import(/* webpackIgnore: true */ 'node:fs/promises'),
      import(/* webpackIgnore: true */ 'node:path'),
      import(/* webpackIgnore: true */ 'node:zlib'),
    ]);
    // D29: fresh clones contain committed .br variants, not necessarily raw grids.
    const readMaybeBrotli = async (path: string): Promise<Uint8Array> => {
      try {
        return await readFile(path);
      } catch {
        return brotliDecompressSync(await readFile(`${path}.br`));
      }
    };
    const manifest = JSON.parse(
      new TextDecoder().decode(await readMaybeBrotli(join(directory, 'manifest.json'))),
    ) as RasterManifest;
    const terrain = await TerrainLoader.fromDirectory(directory);
    const coreTier = manifest.tiers.core;
    const fullTier = manifest.tiers.full;
    const [movementBytes, coverKinds, coreSlope, fullSlope] = await Promise.all([
      readMaybeBrotli(join(directory, manifest.rasterLayers.movementCost.path)),
      readMaybeBrotli(join(directory, manifest.rasterLayers.coverKind.path)),
      readMaybeBrotli(join(directory, coreTier.slope.path)),
      readMaybeBrotli(join(directory, fullTier.slope.path)),
    ]);
    const coreCosts = decodeFloat32LittleEndian(movementBytes);
    const expectedCore = coreTier.width * coreTier.height;
    const expectedFull = fullTier.width * fullTier.height;
    if (coreCosts.length !== expectedCore || coverKinds.length !== expectedCore ||
      coreSlope.length !== expectedCore || fullSlope.length !== expectedFull) {
      throw new Error('Movement terrain grid length does not match manifest dimensions');
    }
    const coreFactors = new Float32Array(expectedCore);
    for (let index = 0; index < expectedCore; index += 1) {
      const cost = coreCosts[index];
      const slope = slopeCost(coreSlope[index]);
      if (!Number.isFinite(cost)) coreFactors[index] = 0;
      else if (coverKinds[index] === manifest.rasterLayers.coverKind.codes.FORD) coreFactors[index] = 1;
      else coreFactors[index] = (cost / slope) / slope;
    }
    const fullCosts = new Float32Array(expectedFull);
    const fullFactors = new Float32Array(expectedFull);
    for (let index = 0; index < expectedFull; index += 1) {
      fullCosts[index] = slopeCost(fullSlope[index]);
      fullFactors[index] = 1 / fullCosts[index];
    }
    const common = (name: TerrainTierName, costs: Float32Array): Omit<MovementGrid, 'id'> => {
      const tier = manifest.tiers[name];
      return {
        width: tier.width,
        height: tier.height,
        resolutionMeters: tier.resolutionMeters,
        minX: tier.localBounds.minX,
        minY: tier.localBounds.minY,
        costs,
        minimumCost: minimumFinite(costs),
      };
    };
    const grids: Record<TerrainTierName, MovementGrid> = {
      core: {
        id: 'core',
        ...common('core', coreCosts),
        coverKinds: new Uint8Array(coverKinds),
        movementFactors: coreFactors,
        fordCode: manifest.rasterLayers.coverKind.codes.FORD,
        riverCode: manifest.rasterLayers.coverKind.codes.RIVER,
        crossingPenaltyMinutes: 4,
      },
      full: {
        id: 'full',
        ...common('full', fullCosts),
        movementFactors: fullFactors,
      },
    };
    return new TerrainMovementLoader(terrain, manifest, grids);
  }

  static async fromUrl(manifestUrl: string | URL): Promise<TerrainMovementLoader> {
    const response = await fetch(manifestUrl);
    if (!response.ok) throw new Error(`Terrain manifest fetch failed: ${response.status}`);
    const manifest = await response.json() as RasterManifest;
    const base = response.url || String(manifestUrl);
    const readAsset = async (asset: { path: string; gzipPath?: string }): Promise<Uint8Array> => {
      const assetResponse = await fetch(new URL(asset.gzipPath ?? asset.path, base));
      if (!assetResponse.ok) throw new Error(`Terrain asset fetch failed: ${assetResponse.status}`);
      if (!asset.gzipPath) return new Uint8Array(await assetResponse.arrayBuffer());
      if (typeof DecompressionStream === 'undefined' || !assetResponse.body) {
        throw new Error('This browser cannot decode gzip terrain assets');
      }
      const stream = assetResponse.body.pipeThrough(new DecompressionStream('gzip'));
      return new Uint8Array(await new Response(stream).arrayBuffer());
    };
    const terrain = await TerrainLoader.fromUrl(manifestUrl);
    const coreTier = manifest.tiers.core;
    const fullTier = manifest.tiers.full;
    const [movementBytes, coverKinds, coreSlope, fullSlope] = await Promise.all([
      readAsset(manifest.rasterLayers.movementCost),
      readAsset(manifest.rasterLayers.coverKind),
      readAsset(coreTier.slope),
      readAsset(fullTier.slope),
    ]);
    return TerrainMovementLoader.fromDecoded(
      terrain,
      manifest,
      movementBytes,
      coverKinds,
      coreSlope,
      fullSlope,
    );
  }

  private static fromDecoded(
    terrain: TerrainLoader,
    manifest: RasterManifest,
    movementBytes: Uint8Array,
    coverKinds: Uint8Array,
    coreSlope: Uint8Array,
    fullSlope: Uint8Array,
  ): TerrainMovementLoader {
    const coreTier = manifest.tiers.core;
    const fullTier = manifest.tiers.full;
    const coreCosts = decodeFloat32LittleEndian(movementBytes);
    const expectedCore = coreTier.width * coreTier.height;
    const expectedFull = fullTier.width * fullTier.height;
    if (coreCosts.length !== expectedCore || coverKinds.length !== expectedCore ||
      coreSlope.length !== expectedCore || fullSlope.length !== expectedFull) {
      throw new Error('Movement terrain grid length does not match manifest dimensions');
    }
    const coreFactors = new Float32Array(expectedCore);
    for (let index = 0; index < expectedCore; index += 1) {
      const cost = coreCosts[index];
      const slope = slopeCost(coreSlope[index]);
      if (!Number.isFinite(cost)) coreFactors[index] = 0;
      else if (coverKinds[index] === manifest.rasterLayers.coverKind.codes.FORD) coreFactors[index] = 1;
      else coreFactors[index] = (cost / slope) / slope;
    }
    const fullCosts = new Float32Array(expectedFull);
    const fullFactors = new Float32Array(expectedFull);
    for (let index = 0; index < expectedFull; index += 1) {
      fullCosts[index] = slopeCost(fullSlope[index]);
      fullFactors[index] = 1 / fullCosts[index];
    }
    const common = (name: TerrainTierName, costs: Float32Array): Omit<MovementGrid, 'id'> => {
      const tier = manifest.tiers[name];
      return {
        width: tier.width,
        height: tier.height,
        resolutionMeters: tier.resolutionMeters,
        minX: tier.localBounds.minX,
        minY: tier.localBounds.minY,
        costs,
        minimumCost: minimumFinite(costs),
      };
    };
    const grids: Record<TerrainTierName, MovementGrid> = {
      core: {
        id: 'core', ...common('core', coreCosts), coverKinds: new Uint8Array(coverKinds),
        movementFactors: coreFactors, fordCode: manifest.rasterLayers.coverKind.codes.FORD,
        riverCode: manifest.rasterLayers.coverKind.codes.RIVER, crossingPenaltyMinutes: 4,
      },
      full: { id: 'full', ...common('full', fullCosts), movementFactors: fullFactors },
    };
    return new TerrainMovementLoader(terrain, manifest, grids);
  }

  toLocal(lat: number, lon: number): [number, number] {
    return this.terrain.toLocal(lat, lon);
  }

  elevationAtMeters(x: number, y: number): number {
    return this.terrain.elevationAtMeters(x, y);
  }

  resolutionAtMeters(x: number, y: number): number {
    return this.terrain.resolutionAtMeters(x, y);
  }

  gridForPath(start: PointMeters, goal: PointMeters): MovementGrid {
    const core = this.manifest.tiers.core.localBounds;
    const inside = (point: PointMeters): boolean =>
      point.x >= core.minX && point.x <= core.maxX && point.y >= core.minY && point.y <= core.maxY;
    return inside(start) && inside(goal) ? this.grids.core : this.grids.full;
  }

  movementAtMeters(x: number, y: number): MovementSample {
    const name = this.terrain.tierAtMeters(x, y);
    const grid = this.grids[name];
    const column = Math.max(0, Math.min(grid.width - 1, Math.round((x - grid.minX) / grid.resolutionMeters)));
    const row = Math.max(0, Math.min(grid.height - 1, Math.round((y - grid.minY) / grid.resolutionMeters)));
    const index = row * grid.width + column;
    const coverKind = grid.coverKinds?.[index] ?? 0;
    return {
      movementFactor: grid.movementFactors?.[index] ?? 1,
      coverKind,
      cellKey: `${name}:${index}`,
      crossingPenaltyMinutes: coverKind === grid.fordCode ? grid.crossingPenaltyMinutes : undefined,
    };
  }
}
