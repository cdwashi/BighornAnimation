import { readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { brotliDecompressSync } from 'node:zlib';

import { beforeAll, describe, expect, it } from 'vitest';

import scenarioData from '../data/scenarios/little-bighorn-1876/scenario.json';
import { TerrainLoader, type TerrainManifestData } from '../src/terrain/loader.js';
import { raycastTerrain } from '../src/terrain/raycast.js';

const terrainDirectory = join(
  process.cwd(),
  'data',
  'terrain',
  'little-bighorn-1876',
);

interface ContourCollection {
  type: 'FeatureCollection';
  features: Array<{
    properties: { elevationMeters: number; indexContour: boolean };
    geometry: { type: string; coordinates: unknown[] };
  }>;
}

// D29: raw derived assets >5 MB are gitignored; tests fall back to the committed
// .br variant so a fresh clone passes without running `npm run terrain`.
const readMaybeBrotli = async (path: string): Promise<Uint8Array> => {
  try {
    return await readFile(path);
  } catch {
    return brotliDecompressSync(await readFile(`${path}.br`));
  }
};

const landmarks = new Map(
  scenarioData.terrain.landmarks.map((landmark) => [landmark.id, landmark.position]),
);

describe('M1 terrain validation gates', () => {
  let loader: TerrainLoader;
  let manifest: TerrainManifestData & {
    contours: { path: string; compressedPath: string; coordinatePrecision: number; intervalMeters: number; indexIntervalMeters: number };
    rasterLayers: {
      coverKind: { path: string; codes: Record<string, number> };
      movementCost: { path: string };
      riverBurnedCellCount: number;
      fordBurnedCellCount: number;
    };
  };

  beforeAll(async () => {
    loader = await TerrainLoader.fromDirectory(terrainDirectory);
    manifest = JSON.parse(
      await readFile(join(terrainDirectory, 'manifest.json'), 'utf8'),
    ) as typeof manifest;
  });

  it('G1 — pipeline outputs exist, manifest is coherent, and contours are non-empty GeoJSON', async () => {
    expect(manifest.schemaVersion).toBe('1.0');
    expect(manifest.crs.geographic).toBe('EPSG:4326');
    expect(manifest.crs.projectedDefinition).toContain('+zone=13');
    expect(manifest.crs.localOrigin.wgs84).toEqual({ lat: 45.42, lon: -107.48 });
    expect(manifest.tiers.core.resolutionMeters).toBe(10);
    expect(manifest.tiers.full.resolutionMeters).toBe(30);

    for (const name of ['core', 'full'] as const) {
      const tier = manifest.tiers[name];
      expect(tier.width).toBeGreaterThan(0);
      expect(tier.height).toBeGreaterThan(0);
      expect((await stat(join(terrainDirectory, tier.elevation.path))).size)
        .toBe(tier.width * tier.height * 2);
      const derived = tier as typeof tier & {
        slope: { path: string };
        hillshade: { path: string };
      };
      expect((await stat(join(terrainDirectory, derived.slope.path))).size)
        .toBe(tier.width * tier.height);
      expect((await stat(join(terrainDirectory, derived.hillshade.path))).size)
        .toBeGreaterThan(0);
    }

    expect((await stat(join(terrainDirectory, manifest.contours.compressedPath))).size)
      .toBeGreaterThan(0);
    expect(manifest.contours.coordinatePrecision).toBe(5);
    const contours = JSON.parse(
      new TextDecoder().decode(await readMaybeBrotli(join(terrainDirectory, manifest.contours.path))),
    ) as ContourCollection;
    expect(contours.type).toBe('FeatureCollection');
    expect(contours.features.length).toBeGreaterThan(0);
    expect(contours.features.every((feature) => feature.geometry.type === 'MultiLineString'))
      .toBe(true);
    expect(contours.features.some((feature) => feature.properties.indexContour)).toBe(true);
    expect(manifest.contours.intervalMeters).toBe(5);
    expect(manifest.contours.indexIntervalMeters).toBe(25);

    expect(manifest.rasterLayers.riverBurnedCellCount).toBeGreaterThan(0);
    expect(manifest.rasterLayers.fordBurnedCellCount).toBeGreaterThan(0);
    const cover = await readMaybeBrotli(join(terrainDirectory, manifest.rasterLayers.coverKind.path));
    expect(cover.includes(manifest.rasterLayers.coverKind.codes.RIVER)).toBe(true);
    expect(cover.includes(manifest.rasterLayers.coverKind.codes.FORD)).toBe(true);
    expect((await readMaybeBrotli(join(terrainDirectory, manifest.rasterLayers.movementCost.path))).byteLength)
      .toBe(manifest.tiers.core.width * manifest.tiers.core.height * 4);
    console.info('[gate] G1 PASS');
  });

  it('G2 — landmark elevations satisfy all required ordinal relationships', () => {
    const elevation = (id: string): number => {
      const point = landmarks.get(id);
      if (!point) throw new Error(`Missing landmark ${id}`);
      return loader.elevationAt(point.lat, point.lon);
    };
    const values = {
      lastStandHill: elevation('last-stand-hill'),
      deepRavine: elevation('deep-ravine'),
      fordB: elevation('ford-b'),
      renoHill: elevation('reno-hill'),
      fordA: elevation('ford-a'),
      weirPoint: elevation('weir-point'),
      sharpshooterRidge: elevation('sharpshooter-ridge'),
    };
    console.info(`[gate] G2 elevations ${JSON.stringify(values)}`);
    expect(values.lastStandHill).toBeGreaterThan(values.deepRavine);
    expect(values.deepRavine).toBeGreaterThan(values.fordB);
    expect(values.renoHill).toBeGreaterThan(values.fordA);
    expect(values.weirPoint).toBeGreaterThan(values.fordB);
    expect(values.sharpshooterRidge).toBeGreaterThan(values.renoHill);
    console.info('[gate] G2 PASS');
  });

  it('G3 — curvature toggle demonstrates the 24 km earth-drop correction', () => {
    const flatTerrain = {
      minimumResolutionMeters: 100,
      elevationAtMeters: (): number => 0,
    };
    const observer = { x: 0, y: 0 };
    const target = { x: 24_000, y: 0 };
    const common = { observerHeightMeters: 1.7, targetHeightMeters: 1.7 };
    const withoutCorrection = raycastTerrain(flatTerrain, observer, target, {
      ...common,
      curvatureCorrection: false,
    });
    const withCorrection = raycastTerrain(flatTerrain, observer, target, {
      ...common,
      curvatureCorrection: true,
      refractionCoefficient: 0.13,
    });
    expect(withoutCorrection.visible).toBe(true);
    expect(withoutCorrection.effectiveCurvatureDropMeters).toBe(0);
    expect(withCorrection.visible).toBe(false);
    expect(withCorrection.earthCurvatureDropMeters).toBeGreaterThanOrEqual(40);
    expect(withCorrection.earthCurvatureDropMeters).toBeLessThanOrEqual(50);
    // D27-era tightening: the corrected band pins the k=0.13 refraction factor
    // itself, so a regression in k cannot slip through while raw stays in band.
    expect(withCorrection.effectiveCurvatureDropMeters).toBeGreaterThanOrEqual(35);
    expect(withCorrection.effectiveCurvatureDropMeters).toBeLessThanOrEqual(45);
    expect(withCorrection.effectiveCurvatureDropMeters).toBeCloseTo(39.3, 1);
    console.info(
      `[gate] G3 PASS rawDrop=${withCorrection.earthCurvatureDropMeters.toFixed(2)}m ` +
      `effectiveDrop=${withCorrection.effectiveCurvatureDropMeters.toFixed(2)}m`,
    );
  });

  it('G4 — Reno Hill to Last Stand Hill is blocked for standing observer and target', () => {
    const reno = landmarks.get('reno-hill');
    const lastStand = landmarks.get('last-stand-hill');
    if (!reno || !lastStand) throw new Error('G4 landmarks are missing');
    const [observerX, observerY] = loader.toLocal(reno.lat, reno.lon);
    const [targetX, targetY] = loader.toLocal(lastStand.lat, lastStand.lon);
    const result = raycastTerrain(
      loader,
      { x: observerX, y: observerY },
      { x: targetX, y: targetY },
      {
        observerHeightMeters: 1.7,
        targetHeightMeters: 1.7,
        curvatureCorrection: true,
        refractionCoefficient: 0.13,
      },
    );
    expect(result.visible).toBe(false);
    expect(result.blockingSample).toBeDefined();
    console.info(
      `[gate] G4 PASS blockedAt=${result.blockingSample?.distanceMeters.toFixed(2)}m`,
    );
  });

  it('G5 — loader round-trips 100 deterministic source-grid points within quantization tolerance', async () => {
    const tier = manifest.tiers.core;
    const source = await readFile(join(terrainDirectory, tier.elevation.path));
    const view = new DataView(source.buffer, source.byteOffset, source.byteLength);
    let state = 0x18760625;
    const random = (): number => {
      state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
      return state / 0x1_0000_0000;
    };
    for (let sample = 0; sample < 100; sample += 1) {
      const column = 1 + Math.floor(random() * (tier.width - 2));
      const row = 1 + Math.floor(random() * (tier.height - 2));
      const expected = view.getInt16((row * tier.width + column) * 2, true) * 0.1;
      const x = tier.localBounds.minX + column * tier.resolutionMeters;
      const y = tier.localBounds.minY + row * tier.resolutionMeters;
      expect(Math.abs(loader.elevationAtMeters(x, y) - expected)).toBeLessThanOrEqual(0.05);
    }
    console.info('[gate] G5 PASS samples=100 tolerance=0.05m');
  });
});
