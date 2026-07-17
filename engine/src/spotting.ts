import type { Scenario, Unit } from '../../src/schema/scenario-schema.js';
import { raycastTerrain, type RaycastResult } from '../../src/terrain/raycast.js';
import type { EngineTerrain, PointMeters } from './pathfind.js';
import type {
  BelievedContact,
  ObserverContact,
  PositionMeters,
  SimState,
  UnitRuntime,
} from './state.js';

export type SpottingEventKind = 'gained' | 'lost' | 'updated';

export interface SpottingEvent {
  tick: number;
  observerUnitId: string;
  targetUnitId: string;
  pos: PositionMeters;
  kind: SpottingEventKind;
}

export interface SpottingConfig {
  /** [CAL] Global scale applied to angular size. */
  K: number;
  /** [CAL] Gain threshold. */
  spotThreshold: number;
  /** [CAL] Loss threshold. */
  loseThreshold: number;
  /** [CAL] Exposure/eye heights in meters. */
  heightMounted: number;
  heightStanding: number;
  heightProne: number;
  heightCamp: number;
  /** [CAL] Formation dispersion factors. */
  dispersionColumn: number;
  dispersionLine: number;
  dispersionSkirmish: number;
  dispersionDispersed: number;
  dispersionCamp: number;
  /** [CAL] Motion factors. */
  motionStationary: number;
  motionFoot: number;
  motionMounted: number;
  motionMountedDry: number;
  /** [CAL] Perception scaling and clamp. */
  perceptionDivisor: number;
  perceptionMinimum: number;
  perceptionMaximum: number;
  /** [CAL] Sweep and terrain-cache policy. */
  sweepCadenceTicks: number;
  blockedCacheMoveMeters: number;
  /** [CAL] Distance over which a cover polygon applies its declared opacity. */
  attenuationUnitMeters: number;
  /** [CAL] D47 camp-defense trigger radius. */
  campDefenseRadiusMeters: number;
}

export const STARTING_SPOTTING_CONFIG: Readonly<SpottingConfig> = Object.freeze({
  K: 1,
  spotThreshold: 0.008,
  loseThreshold: 0.004,
  heightMounted: 2.4,
  heightStanding: 1.7,
  heightProne: 0.3,
  heightCamp: 3,
  dispersionColumn: 1,
  dispersionLine: 1.3,
  dispersionSkirmish: 0.7,
  dispersionDispersed: 0.8,
  dispersionCamp: 4,
  motionStationary: 1,
  motionFoot: 1.5,
  motionMounted: 2,
  motionMountedDry: 3,
  perceptionDivisor: 50,
  perceptionMinimum: 0.5,
  perceptionMaximum: 2,
  sweepCadenceTicks: 2,
  blockedCacheMoveMeters: 100,
  attenuationUnitMeters: 100,
  campDefenseRadiusMeters: 3_000,
});

/** Audited C4 global tuning result; see reports/c4-observation-exam.md. */
export const D52_SPOTTING_CONFIG: Readonly<SpottingConfig> = Object.freeze({
  ...STARTING_SPOTTING_CONFIG,
  spotThreshold: 0.0013,
  loseThreshold: 0.00065,
});

/** Audited D53/D54 re-tuning result; see reports/c4-observation-exam.md. */
export const DEFAULT_SPOTTING_CONFIG: Readonly<SpottingConfig> = Object.freeze({
  ...D52_SPOTTING_CONFIG,
  attenuationUnitMeters: 210,
});

export function spottingConfig(
  overrides: Readonly<Record<string, number>> = {},
): SpottingConfig {
  const result = { ...DEFAULT_SPOTTING_CONFIG } as SpottingConfig;
  for (const key of Object.keys(DEFAULT_SPOTTING_CONFIG) as Array<keyof SpottingConfig>) {
    const value = overrides[key];
    if (value !== undefined) result[key] = value;
  }
  if (!(result.spotThreshold > result.loseThreshold)) {
    throw new RangeError('spotThreshold must be greater than loseThreshold');
  }
  if (!Number.isInteger(result.sweepCadenceTicks) || result.sweepCadenceTicks <= 0) {
    throw new RangeError('sweepCadenceTicks must be a positive integer');
  }
  if (!(result.attenuationUnitMeters > 0)) {
    throw new RangeError('attenuationUnitMeters must be positive');
  }
  return result;
}

export interface ProjectedCover {
  id: string;
  opacity: number;
  ring: PointMeters[];
}

interface BlockedCacheEntry {
  ray: RaycastResult;
}

export interface SpottingRuntime {
  readonly config: SpottingConfig;
  readonly projectedCover: readonly ProjectedCover[];
  readonly blockedRays: Map<string, BlockedCacheEntry>;
  /**
   * D55 cache-purity rule: memoization must be a pure function of current
   * SimState, so disabling it (recomputing every quantized ray) must be
   * bit-identical to running with it. The permanent cache-equivalence gate
   * runs a full day both ways and asserts exactly that.
   */
  readonly memoizationEnabled: boolean;
}

export interface SpottingSignature {
  id: string;
  position: PositionMeters;
  effectiveStrength: number;
  formation: Unit['startFormation'];
  mounted: boolean;
  moving: boolean;
  kind: Unit['kind'];
}

export interface ObserverSignature {
  id: string;
  position: PositionMeters;
  heightMeters: number;
  perceptionFactor: number;
}

export interface DetectabilityFactors {
  distanceMeters: number;
  effectiveStrength: number;
  dispersionFactor: number;
  heightFactor: number;
  angularSize: number;
  terrainVisible: boolean;
  coverTransmittance: number;
  coverPathMeters: number;
  atmosphericFactor: number;
  transmittance: number;
  motionFactor: number;
  perceptionFactor: number;
  raySampleCount: number;
  cachedBlockedRay: boolean;
  quantizedTerrainRay: boolean;
}

export interface DetectabilityResult {
  score: number;
  factors: DetectabilityFactors;
  ray: RaycastResult;
}

function projectedCover(scenario: Scenario, terrain: EngineTerrain): ProjectedCover[] {
  return scenario.terrain.cover.map((cover) => ({
    id: cover.id,
    opacity: cover.losOpacity,
    ring: cover.area.ring.map((point) => {
      const [x, y] = terrain.toLocal(point.lat, point.lon);
      return { x, y };
    }),
  }));
}

export function createSpottingRuntime(
  scenario: Scenario,
  terrain: EngineTerrain,
  overrides: Readonly<Record<string, number>> = {},
  memoizationEnabled = true,
): SpottingRuntime {
  return {
    config: spottingConfig(overrides),
    projectedCover: projectedCover(scenario, terrain),
    blockedRays: new Map(),
    memoizationEnabled,
  };
}

function pointInPolygon(point: PointMeters, ring: readonly PointMeters[]): boolean {
  let inside = false;
  for (let index = 0, previous = ring.length - 1; index < ring.length; previous = index, index += 1) {
    const a = ring[index];
    const b = ring[previous];
    const crosses = (a.y > point.y) !== (b.y > point.y) &&
      point.x < (b.x - a.x) * (point.y - a.y) / (b.y - a.y) + a.x;
    if (crosses) inside = !inside;
  }
  return inside;
}

function segmentIntersectionFraction(
  start: PointMeters,
  end: PointMeters,
  edgeStart: PointMeters,
  edgeEnd: PointMeters,
): number | undefined {
  const rayX = end.x - start.x;
  const rayY = end.y - start.y;
  const edgeX = edgeEnd.x - edgeStart.x;
  const edgeY = edgeEnd.y - edgeStart.y;
  const denominator = rayX * edgeY - rayY * edgeX;
  if (Math.abs(denominator) <= 1e-12) return undefined;
  const offsetX = edgeStart.x - start.x;
  const offsetY = edgeStart.y - start.y;
  const rayFraction = (offsetX * edgeY - offsetY * edgeX) / denominator;
  const edgeFraction = (offsetX * rayY - offsetY * rayX) / denominator;
  return rayFraction >= 0 && rayFraction <= 1 && edgeFraction >= 0 && edgeFraction <= 1
    ? rayFraction
    : undefined;
}

/** Exact deterministic length of a straight ray segment lying inside a polygon. */
export function pathLengthThroughPolygon(
  start: PointMeters,
  end: PointMeters,
  ring: readonly PointMeters[],
): number {
  const distanceMeters = Math.hypot(end.x - start.x, end.y - start.y);
  if (distanceMeters === 0 || ring.length < 3) return 0;
  const fractions = [0, 1];
  for (let index = 0; index < ring.length; index += 1) {
    const fraction = segmentIntersectionFraction(
      start,
      end,
      ring[index],
      ring[(index + 1) % ring.length],
    );
    if (fraction !== undefined) fractions.push(fraction);
  }
  fractions.sort((left, right) => left - right);
  const unique = fractions.filter((fraction, index) =>
    index === 0 || Math.abs(fraction - fractions[index - 1]) > 1e-10);
  let insideFraction = 0;
  for (let index = 1; index < unique.length; index += 1) {
    const from = unique[index - 1];
    const to = unique[index];
    const midpoint = (from + to) / 2;
    if (pointInPolygon({
      x: start.x + (end.x - start.x) * midpoint,
      y: start.y + (end.y - start.y) * midpoint,
    }, ring)) insideFraction += to - from;
  }
  return distanceMeters * insideFraction;
}

export interface CoverPathResult {
  transmittance: number;
  totalPathMeters: number;
  crossed: Array<{ coverId: string; pathMeters: number; transmittance: number }>;
}

/** D54 Beer-Lambert attenuation, reusable by spotting and the M3-B renderer. */
export function coverPathTransmittance(
  runtime: SpottingRuntime,
  observer: PointMeters,
  target: PointMeters,
): CoverPathResult {
  const distanceMeters = Math.hypot(target.x - observer.x, target.y - observer.y);
  if (distanceMeters === 0) return { transmittance: 1, totalPathMeters: 0, crossed: [] };
  const fractions = [0, 1];
  for (const cover of runtime.projectedCover) {
    for (let index = 0; index < cover.ring.length; index += 1) {
      const fraction = segmentIntersectionFraction(
        observer,
        target,
        cover.ring[index],
        cover.ring[(index + 1) % cover.ring.length],
      );
      if (fraction !== undefined) fractions.push(fraction);
    }
  }
  fractions.sort((left, right) => left - right);
  const unique = fractions.filter((fraction, index) =>
    index === 0 || Math.abs(fraction - fractions[index - 1]) > 1e-10);
  const pathByCover = new Map<number, number>();
  for (let interval = 1; interval < unique.length; interval += 1) {
    const from = unique[interval - 1];
    const to = unique[interval];
    const midpoint = (from + to) / 2;
    const point = {
      x: observer.x + (target.x - observer.x) * midpoint,
      y: observer.y + (target.y - observer.y) * midpoint,
    };
    let selected = -1;
    // Match the committed cover raster's deterministic burn precedence: later
    // scenario polygons replace earlier kinds in overlap cells.
    runtime.projectedCover.forEach((cover, index) => {
      if (pointInPolygon(point, cover.ring)) selected = index;
    });
    if (selected >= 0) {
      pathByCover.set(
        selected,
        (pathByCover.get(selected) ?? 0) + distanceMeters * (to - from),
      );
    }
  }
  let transmittance = 1;
  let totalPathMeters = 0;
  const crossed: CoverPathResult['crossed'] = [];
  for (const [index, pathMeters] of pathByCover) {
    const cover = runtime.projectedCover[index];
    const coverTransmittance = Math.pow(
      1 - cover.opacity,
      pathMeters / runtime.config.attenuationUnitMeters,
    );
    transmittance *= coverTransmittance;
    totalPathMeters += pathMeters;
    crossed.push({ coverId: cover.id, pathMeters, transmittance: coverTransmittance });
  }
  return { transmittance, totalPathMeters, crossed };
}

function dispersionFactor(signature: SpottingSignature, config: SpottingConfig): number {
  switch (signature.formation) {
    case 'COLUMN': return config.dispersionColumn;
    case 'LINE': return config.dispersionLine;
    case 'SKIRMISH': return config.dispersionSkirmish;
    case 'DISPERSED': return config.dispersionDispersed;
    case 'CAMP': return config.dispersionCamp;
  }
}

function heightFactor(signature: SpottingSignature, config: SpottingConfig): number {
  if (signature.kind === 'NONCOMBATANT_CAMP') return config.heightCamp;
  if (signature.mounted) return config.heightMounted;
  // TODO-AMBIGUOUS(M3-A): UnitRuntime has no prone state. Dismounted and other
  // on-foot units therefore use the specified standing height for v1.
  return config.heightStanding;
}

function motionFactor(signature: SpottingSignature, config: SpottingConfig): number {
  if (!signature.moving) return config.motionStationary;
  if (!signature.mounted) return config.motionFoot;
  // D46 v1 conditions are always dry; dust is a detectability bonus, not LOS occlusion.
  return config.motionMountedDry;
}

function quantizedGridCell(
  position: PositionMeters,
  cellMeters: number,
): { cellX: number; cellY: number; point: PositionMeters } {
  const cellX = Math.floor(position.x / cellMeters);
  const cellY = Math.floor(position.y / cellMeters);
  return { cellX, cellY, point: {
    // Quantize toward the terrain origin so edge cells never select a sample
    // beyond the loaded terrain extent.
    x: (cellX < 0 ? cellX + 1 : cellX) * cellMeters,
    y: (cellY < 0 ? cellY + 1 : cellY) * cellMeters,
  } };
}

export interface DetectabilityOptions {
  /** Sweep-only terrain precheck. Direct/exam evaluations remain exact by default. */
  quantizeTerrainRay?: boolean;
}

export function evaluateDetectability(
  terrain: EngineTerrain,
  runtime: SpottingRuntime,
  observer: ObserverSignature,
  target: SpottingSignature,
  atmosphericFactor = 1,
  options: DetectabilityOptions = {},
): DetectabilityResult {
  const config = runtime.config;
  const distanceMeters = Math.hypot(
    target.position.x - observer.position.x,
    target.position.y - observer.position.y,
  );
  const targetHeight = heightFactor(target, config);
  const quantizedTerrainRay = options.quantizeTerrainRay === true;
  const observerCell = quantizedGridCell(observer.position, config.blockedCacheMoveMeters);
  const targetCell = quantizedGridCell(target.position, config.blockedCacheMoveMeters);
  const rayObserver = quantizedTerrainRay ? observerCell.point : observer.position;
  const rayTarget = quantizedTerrainRay ? targetCell.point : target.position;
  // D55 cache-purity rule: cache validity must never depend on WHEN a verdict
  // was computed, only on WHAT the current state is. Grid cells and ray heights
  // fully determine the sweep precheck, so restored/keyframe and continuous
  // runs select one ray, and cache-off runs are bit-identical by construction.
  const pairKey = quantizedTerrainRay
    ? `${observer.id}\u0000${target.id}\u0000${observerCell.cellX},${observerCell.cellY}` +
      `\u0000${targetCell.cellX},${targetCell.cellY}\u0000${observer.heightMeters},${targetHeight}`
    : '';
  const cached = runtime.memoizationEnabled ? runtime.blockedRays.get(pairKey) : undefined;
  const canUseBlockedCache = quantizedTerrainRay && cached !== undefined;
  const ray = canUseBlockedCache
    ? cached.ray
    : raycastTerrain(terrain, rayObserver, rayTarget, {
      observerHeightMeters: observer.heightMeters,
      targetHeightMeters: targetHeight,
      curvatureCorrection: true,
      refractionCoefficient: 0.13,
    });
  if (quantizedTerrainRay && !canUseBlockedCache && runtime.memoizationEnabled) {
    if (ray.visible) runtime.blockedRays.delete(pairKey);
    else runtime.blockedRays.set(pairKey, { ray });
  }
  const coverPath = ray.visible
    ? coverPathTransmittance(runtime, observer.position, target.position)
    : { transmittance: 0, totalPathMeters: 0, crossed: [] };
  const coverTransmittance = coverPath.transmittance;
  const atmosphere = Math.max(0, Math.min(1, atmosphericFactor));
  const transmittance = coverTransmittance * atmosphere;
  const dispersion = dispersionFactor(target, config);
  const height = targetHeight;
  const angularSize = distanceMeters <= 0
    ? Number.POSITIVE_INFINITY
    : Math.sqrt(Math.max(0, target.effectiveStrength)) * dispersion * height / distanceMeters;
  const motion = motionFactor(target, config);
  const score = config.K * angularSize * transmittance * motion * observer.perceptionFactor;
  return {
    score,
    factors: {
      distanceMeters,
      effectiveStrength: target.effectiveStrength,
      dispersionFactor: dispersion,
      heightFactor: height,
      angularSize,
      terrainVisible: ray.visible,
      coverTransmittance,
      coverPathMeters: coverPath.totalPathMeters,
      atmosphericFactor: atmosphere,
      transmittance,
      motionFactor: motion,
      perceptionFactor: observer.perceptionFactor,
      raySampleCount: ray.sampleCount,
      cachedBlockedRay: canUseBlockedCache,
      quantizedTerrainRay,
    },
    ray,
  };
}

export function observerSignature(
  scenario: Scenario,
  unit: UnitRuntime,
  config: SpottingConfig,
  position: PositionMeters = unit.position,
): ObserverSignature {
  const perceptions = scenario.leaders
    .filter((leader) => leader.attachedToUnitId === unit.id)
    .map((leader) => leader.ratings.perception);
  const best = perceptions.length > 0 ? Math.max(...perceptions) : config.perceptionDivisor;
  return {
    id: unit.id,
    position: { ...position },
    heightMeters: scenario.units[unit.unitIndex].kind === 'NONCOMBATANT_CAMP'
      ? config.heightCamp
      : unit.mounted ? config.heightMounted : config.heightStanding,
    perceptionFactor: Math.max(
      config.perceptionMinimum,
      Math.min(config.perceptionMaximum, best / config.perceptionDivisor),
    ),
  };
}

export function targetSignature(scenario: Scenario, unit: UnitRuntime): SpottingSignature {
  const source = scenario.units[unit.unitIndex];
  return {
    id: unit.id,
    position: { ...unit.position },
    effectiveStrength: unit.strengthAvailable,
    formation: unit.formation,
    mounted: unit.mounted,
    moving: unit.lastMovedTick === unit.lastSpottingSweepTick,
    kind: source.kind,
  };
}

function contactKey(observerUnitId: string, targetUnitId: string): string {
  return `${observerUnitId}\u0000${targetUnitId}`;
}

function recordContact(
  state: SimState,
  observer: UnitRuntime,
  observerSideId: string,
  target: UnitRuntime,
  kind: SpottingEventKind,
  events: SpottingEvent[],
): void {
  const key = contactKey(observer.id, target.id);
  const existing = state.observerContacts[key];
  const contact: ObserverContact = {
    observerUnitId: observer.id,
    observerSideId,
    targetUnitId: target.id,
    status: kind === 'lost' ? 'lastKnown' : 'spotted',
    lastSeenTick: kind === 'lost' && existing ? existing.lastSeenTick : state.tick,
    lastSeenPos: kind === 'lost' && existing ? { ...existing.lastSeenPos } : { ...target.position },
  };
  state.observerContacts[key] = contact;
  events.push({
    tick: state.tick,
    observerUnitId: observer.id,
    targetUnitId: target.id,
    pos: { ...contact.lastSeenPos },
    kind,
  });
}

function aggregateBelievedPictures(scenario: Scenario, state: SimState): void {
  for (const side of scenario.sides) {
    const picture = state.believedPictures[side.id] ?? (state.believedPictures[side.id] = {});
    for (const contact of Object.values(picture)) contact.status = 'lastKnown';
  }
  for (const contact of Object.values(state.observerContacts)) {
    const picture = state.believedPictures[contact.observerSideId] ??
      (state.believedPictures[contact.observerSideId] = {});
    const existing = picture[contact.targetUnitId];
    if (!existing || contact.lastSeenTick > existing.lastSeenTick ||
      contact.lastSeenTick === existing.lastSeenTick && contact.status === 'spotted') {
      picture[contact.targetUnitId] = {
        status: contact.status,
        lastSeenTick: contact.lastSeenTick,
        lastSeenPos: { ...contact.lastSeenPos },
      };
    } else if (contact.status === 'spotted' && contact.lastSeenTick === existing.lastSeenTick) {
      existing.status = 'spotted';
    }
  }
}

export function performSpottingSweep(
  scenario: Scenario,
  state: SimState,
  terrain: EngineTerrain,
  runtime: SpottingRuntime,
  events: SpottingEvent[],
): void {
  if (state.tick % runtime.config.sweepCadenceTicks !== 0) return;
  for (const unit of state.units) unit.lastSpottingSweepTick = state.tick;
  for (const observer of state.units) {
    const observerSource = scenario.units[observer.unitIndex];
    const observerView = observerSignature(scenario, observer, runtime.config);
    for (const target of state.units) {
      const targetSource = scenario.units[target.unitIndex];
      if (observerSource.sideId === targetSource.sideId) continue;
      const key = contactKey(observer.id, target.id);
      const existing = state.observerContacts[key];
      const result = evaluateDetectability(
        terrain,
        runtime,
        observerView,
        targetSignature(scenario, target),
        1,
        { quantizeTerrainRay: true },
      );
      if (!existing || existing.status !== 'spotted') {
        if (result.score >= runtime.config.spotThreshold) {
          recordContact(state, observer, observerSource.sideId, target, 'gained', events);
        }
      } else if (result.score <= runtime.config.loseThreshold) {
        recordContact(state, observer, observerSource.sideId, target, 'lost', events);
      } else {
        recordContact(state, observer, observerSource.sideId, target, 'updated', events);
      }
    }
  }
  aggregateBelievedPictures(scenario, state);
}

export function serializedBelievedPicture(
  state: SimState,
  sideId: string,
): string {
  return JSON.stringify(state.believedPictures[sideId] ?? {});
}

export function believedContact(
  state: SimState,
  sideId: string,
  targetUnitId: string,
): BelievedContact | undefined {
  return state.believedPictures[sideId]?.[targetUnitId];
}
