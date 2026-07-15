export interface TerrainPointMeters {
  x: number;
  y: number;
}

export interface RaycastTerrain {
  elevationAtMeters(x: number, y: number): number;
  resolutionAtMeters?(x: number, y: number): number;
  minimumResolutionMeters?: number;
}

export interface RaycastOptions {
  observerHeightMeters: number;
  targetHeightMeters: number;
  curvatureCorrection?: boolean;
  refractionCoefficient?: number;
  earthRadiusMeters?: number;
  maxStepMeters?: number;
}

export interface BlockingSample {
  x: number;
  y: number;
  distanceMeters: number;
  terrainElevationMeters: number;
  rayElevationMeters: number;
  curvatureBulgeMeters: number;
}

export interface RaycastResult {
  visible: boolean;
  blockingSample?: BlockingSample;
  distanceMeters: number;
  sampleCount: number;
  earthCurvatureDropMeters: number;
  effectiveCurvatureDropMeters: number;
}

const DEFAULT_EARTH_RADIUS_METERS = 6_371_008.8;
const DEFAULT_REFRACTION_COEFFICIENT = 0.13;

export function raycastTerrain(
  terrain: RaycastTerrain,
  observer: TerrainPointMeters,
  target: TerrainPointMeters,
  options: RaycastOptions,
): RaycastResult {
  const dx = target.x - observer.x;
  const dy = target.y - observer.y;
  const distanceMeters = Math.hypot(dx, dy);
  const earthRadius = options.earthRadiusMeters ?? DEFAULT_EARTH_RADIUS_METERS;
  const k = options.refractionCoefficient ?? DEFAULT_REFRACTION_COEFFICIENT;
  if (k < 0 || k >= 1) throw new RangeError('refractionCoefficient must be in [0,1)');
  const earthCurvatureDropMeters = distanceMeters ** 2 / (2 * earthRadius);
  const effectiveRadius = earthRadius / (1 - k);
  const effectiveCurvatureDropMeters = options.curvatureCorrection === false
    ? 0
    : distanceMeters ** 2 / (2 * effectiveRadius);
  if (distanceMeters === 0) {
    return {
      visible: true,
      distanceMeters,
      sampleCount: 0,
      earthCurvatureDropMeters,
      effectiveCurvatureDropMeters,
    };
  }

  const inferredResolution = terrain.minimumResolutionMeters ??
    terrain.resolutionAtMeters?.(observer.x, observer.y) ?? 1;
  const maxStep = options.maxStepMeters ?? inferredResolution / 2;
  if (!(maxStep > 0)) throw new RangeError('maxStepMeters must be positive');
  const segments = Math.max(1, Math.ceil(distanceMeters / maxStep));
  const observerEye = terrain.elevationAtMeters(observer.x, observer.y) + options.observerHeightMeters;
  const targetEye = terrain.elevationAtMeters(target.x, target.y) + options.targetHeightMeters;

  for (let sample = 1; sample < segments; sample += 1) {
    const fraction = sample / segments;
    const x = observer.x + dx * fraction;
    const y = observer.y + dy * fraction;
    const distanceFromObserver = distanceMeters * fraction;
    const rayElevationMeters = observerEye + (targetEye - observerEye) * fraction;
    const curvatureBulgeMeters = options.curvatureCorrection === false
      ? 0
      : distanceFromObserver * (distanceMeters - distanceFromObserver) / (2 * effectiveRadius);
    const terrainElevationMeters = terrain.elevationAtMeters(x, y) + curvatureBulgeMeters;
    if (terrainElevationMeters > rayElevationMeters) {
      return {
        visible: false,
        blockingSample: {
          x,
          y,
          distanceMeters: distanceFromObserver,
          terrainElevationMeters,
          rayElevationMeters,
          curvatureBulgeMeters,
        },
        distanceMeters,
        sampleCount: sample,
        earthCurvatureDropMeters,
        effectiveCurvatureDropMeters,
      };
    }
  }

  return {
    visible: true,
    distanceMeters,
    sampleCount: Math.max(0, segments - 1),
    earthCurvatureDropMeters,
    effectiveCurvatureDropMeters,
  };
}
