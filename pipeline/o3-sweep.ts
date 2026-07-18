import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';

import { TerrainLoader, type TerrainGeoPoint } from '../src/terrain/loader.js';
import { raycastTerrain, type RaycastResult, type TerrainPointMeters } from '../src/terrain/raycast.js';

const TERRAIN_DIRECTORY = join(process.cwd(), 'data', 'terrain', 'little-bighorn-1876');
const SCENARIO_PATH = join(
  process.cwd(),
  'data',
  'scenarios',
  'little-bighorn-1876',
  'scenario.json',
);
const REPORT_PATH = join(process.cwd(), 'reports', 'o3-sweep.md');

const OSM_CANDIDATE: TerrainGeoPoint = { lat: 45.4454, lon: -107.1392 };
const PONY_HERD_BENCH: TerrainGeoPoint = { lat: 45.535, lon: -107.46 };
const SWEEP_RADIUS_METERS = 2_000;
const SWEEP_STEP_METERS = 100;
const OBSERVER_HEIGHT_METERS = 1.7;
const TARGET_HEIGHT_METERS = 1.7;
const REFRACTION_COEFFICIENT = 0.13;
const ELEVATION_BAND_METERS = { min: 1_340, max: 1_360 };
const POCKET_RADIUS_METERS = 300;
const POCKET_DROP_METERS = 20;
const POCKET_SAMPLE_STEP_METERS = 30;
const VALLEY_DISTANCE_MILES = { min: 14, max: 15 };
const METERS_PER_MILE = 1_609.344;

// TODO-AMBIGUOUS(O3-A): the dossier says only "just east." This DEM-only proxy
// searches a 100-800 m east-side strip for a smooth low corridor.
const TRAIL_MIN_EAST_OFFSET_METERS = 100;
const TRAIL_MAX_EAST_OFFSET_METERS = 800;
const TRAIL_COLUMN_STEP_METERS = 100;
const TRAIL_MAX_LATERAL_STEP_METERS = 200;
const TRAIL_LATERAL_PENALTY = 0.05;

interface ScenarioSubset {
  terrain: {
    landmarks: Array<{ id: string; position: TerrainGeoPoint }>;
  };
}

interface PocketResult {
  passes: boolean;
  dropMeters: number;
  lowerCellDistanceMeters: number;
}

interface SweepCell {
  eastOffsetMeters: number;
  northOffsetMeters: number;
  point: TerrainGeoPoint;
  local: TerrainPointMeters;
  elevationMeters: number;
  elevationPasses: boolean;
  elevationDeviationMeters: number;
  ponyRay: RaycastResult;
  villageRay: RaycastResult;
  villageDistanceMiles: number;
  villageDistancePasses: boolean;
  villageDistanceDeviationMiles: number;
  pocket: PocketResult;
  trailDistanceMeters: number;
}

interface TrailVertex extends TerrainPointMeters {
  eastOffsetMeters: number;
  northOffsetMeters: number;
  elevationMeters: number;
}

function offsets(min: number, max: number, step: number): number[] {
  const values: number[] = [];
  for (let value = min; value <= max; value += step) values.push(value);
  return values;
}

function midpoint(a: TerrainGeoPoint, b: TerrainGeoPoint): TerrainGeoPoint {
  return { lat: (a.lat + b.lat) / 2, lon: (a.lon + b.lon) / 2 };
}

function findLandmark(scenario: ScenarioSubset, id: string): TerrainGeoPoint {
  const landmark = scenario.terrain.landmarks.find((candidate) => candidate.id === id);
  if (!landmark) throw new Error(`Missing scenario landmark ${id}`);
  return landmark.position;
}

function distanceToBand(value: number, min: number, max: number): number {
  if (value < min) return min - value;
  if (value > max) return value - max;
  return 0;
}

function assertRayCoverage(
  terrain: TerrainLoader,
  observer: TerrainPointMeters,
  target: TerrainPointMeters,
  label: string,
): number {
  const full = terrain.manifest.tiers.full;
  const distance = Math.hypot(target.x - observer.x, target.y - observer.y);
  const coverageStep = full.resolutionMeters / 2;
  const segments = Math.max(1, Math.ceil(distance / coverageStep));
  for (let index = 0; index <= segments; index += 1) {
    const fraction = index / segments;
    const x = observer.x + (target.x - observer.x) * fraction;
    const y = observer.y + (target.y - observer.y) * fraction;
    if (
      x < full.localBounds.minX || x > full.localBounds.maxX ||
      y < full.localBounds.minY || y > full.localBounds.maxY
    ) {
      throw new Error(`${label} leaves the extended full-tier grid at sample ${index}/${segments}`);
    }
    const elevation = terrain.elevationAtMeters(x, y);
    if (!Number.isFinite(elevation)) {
      throw new Error(`${label} encountered an unsampled DEM gap at sample ${index}/${segments}`);
    }
  }
  return segments + 1;
}

function pocketSignature(
  terrain: TerrainLoader,
  observer: TerrainPointMeters,
  observerElevationMeters: number,
): PocketResult {
  let bestDrop = Number.NEGATIVE_INFINITY;
  let bestDistance = 0;
  for (
    let north = -POCKET_RADIUS_METERS;
    north <= POCKET_RADIUS_METERS;
    north += POCKET_SAMPLE_STEP_METERS
  ) {
    for (
      let east = -POCKET_RADIUS_METERS;
      east <= POCKET_RADIUS_METERS;
      east += POCKET_SAMPLE_STEP_METERS
    ) {
      const distance = Math.hypot(east, north);
      if (distance === 0 || distance > POCKET_RADIUS_METERS) continue;
      const nearbyElevation = terrain.elevationAtMeters(observer.x + east, observer.y + north);
      const drop = observerElevationMeters - nearbyElevation;
      if (drop > bestDrop) {
        bestDrop = drop;
        bestDistance = distance;
      }
    }
  }
  return {
    passes: bestDrop >= POCKET_DROP_METERS,
    dropMeters: bestDrop,
    lowerCellDistanceMeters: bestDistance,
  };
}

function deriveTrailProxy(
  terrain: TerrainLoader,
  center: TerrainPointMeters,
  northOffsets: number[],
): TrailVertex[] {
  const eastOffsets = offsets(
    TRAIL_MIN_EAST_OFFSET_METERS,
    TRAIL_MAX_EAST_OFFSET_METERS,
    TRAIL_COLUMN_STEP_METERS,
  );
  const elevations = northOffsets.map((north) => eastOffsets.map((east) =>
    terrain.elevationAtMeters(center.x + east, center.y + north)));
  const costs = elevations.map((row) => {
    const rowMinimum = Math.min(...row);
    return row.map((elevation) => elevation - rowMinimum);
  });
  const accumulated = costs.map((row) => row.map(() => Number.POSITIVE_INFINITY));
  const previous = costs.map((row) => row.map(() => -1));
  accumulated[0] = [...costs[0]];

  for (let row = 1; row < northOffsets.length; row += 1) {
    for (let column = 0; column < eastOffsets.length; column += 1) {
      for (let priorColumn = 0; priorColumn < eastOffsets.length; priorColumn += 1) {
        const lateralChange = Math.abs(eastOffsets[column] - eastOffsets[priorColumn]);
        if (lateralChange > TRAIL_MAX_LATERAL_STEP_METERS) continue;
        const candidateCost = accumulated[row - 1][priorColumn] + costs[row][column] +
          lateralChange * TRAIL_LATERAL_PENALTY;
        if (candidateCost < accumulated[row][column]) {
          accumulated[row][column] = candidateCost;
          previous[row][column] = priorColumn;
        }
      }
    }
  }

  let column = accumulated.at(-1)?.reduce(
    (best, value, index, row) => value < row[best] ? index : best,
    0,
  ) ?? 0;
  const selectedColumns = new Array<number>(northOffsets.length);
  for (let row = northOffsets.length - 1; row >= 0; row -= 1) {
    selectedColumns[row] = column;
    if (row > 0) column = previous[row][column];
  }
  return northOffsets.map((north, row) => {
    const east = eastOffsets[selectedColumns[row]];
    return {
      x: center.x + east,
      y: center.y + north,
      eastOffsetMeters: east,
      northOffsetMeters: north,
      elevationMeters: elevations[row][selectedColumns[row]],
    };
  });
}

function pointToSegmentDistance(
  point: TerrainPointMeters,
  start: TerrainPointMeters,
  end: TerrainPointMeters,
): number {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return Math.hypot(point.x - start.x, point.y - start.y);
  const fraction = Math.max(0, Math.min(1,
    ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return Math.hypot(point.x - (start.x + fraction * dx), point.y - (start.y + fraction * dy));
}

function distanceToTrail(point: TerrainPointMeters, trail: TrailVertex[]): number {
  let distance = Number.POSITIVE_INFINITY;
  for (let index = 1; index < trail.length; index += 1) {
    distance = Math.min(distance, pointToSegmentDistance(point, trail[index - 1], trail[index]));
  }
  return distance;
}

function compareCells(a: SweepCell, b: SweepCell): number {
  // No weighted/composite score: MUST-FLIP and each dossier constraint remain
  // separate in this documented lexicographic ordering.
  const booleans: Array<[boolean, boolean]> = [
    [a.ponyRay.visible, b.ponyRay.visible],
    [a.elevationPasses, b.elevationPasses],
    [a.pocket.passes, b.pocket.passes],
    [a.villageDistancePasses, b.villageDistancePasses],
  ];
  for (const [left, right] of booleans) {
    if (left !== right) return left ? -1 : 1;
  }
  return a.trailDistanceMeters - b.trailDistanceMeters ||
    a.elevationDeviationMeters - b.elevationDeviationMeters ||
    a.villageDistanceDeviationMiles - b.villageDistanceDeviationMiles ||
    b.pocket.dropMeters - a.pocket.dropMeters ||
    Math.hypot(a.eastOffsetMeters, a.northOffsetMeters) -
      Math.hypot(b.eastOffsetMeters, b.northOffsetMeters) ||
    b.northOffsetMeters - a.northOffsetMeters ||
    a.eastOffsetMeters - b.eastOffsetMeters;
}

function rayLabel(ray: RaycastResult): string {
  return ray.visible ? 'CLEAR' : 'BLOCKED';
}

function passLabel(value: boolean): string {
  return value ? 'PASS' : 'FAIL';
}

function coordinate(point: TerrainGeoPoint): string {
  return `${point.lat.toFixed(6)}, ${point.lon.toFixed(6)}`;
}

function cellTableRow(cell: SweepCell, label: string): string {
  return `| ${label} | ${coordinate(cell.point)} | ${cell.elevationMeters.toFixed(1)} m (${passLabel(cell.elevationPasses)}) | ${rayLabel(cell.ponyRay)}; ${(cell.ponyRay.distanceMeters / 1_000).toFixed(2)} km | ${rayLabel(cell.villageRay)}; ${(cell.villageRay.distanceMeters / 1_000).toFixed(2)} km / ${cell.villageDistanceMiles.toFixed(2)} mi (${passLabel(cell.villageDistancePasses)}) | ${passLabel(cell.pocket.passes)}; ${cell.pocket.dropMeters.toFixed(1)} m lower @ ${cell.pocket.lowerCellDistanceMeters.toFixed(0)} m | ${cell.trailDistanceMeters.toFixed(0)} m |`;
}

function count(cells: SweepCell[], predicate: (cell: SweepCell) => boolean): number {
  return cells.filter(predicate).length;
}

function buildMustFlipMap(
  cells: SweepCell[],
  candidate: SweepCell,
  best: SweepCell,
  northOffsets: number[],
  eastOffsets: number[],
): string {
  const keyed = new Map(cells.map((cell) => [
    `${cell.eastOffsetMeters},${cell.northOffsetMeters}`,
    cell,
  ]));
  const rows: string[] = [];
  for (const north of [...northOffsets].reverse()) {
    let row = '';
    for (const east of eastOffsets) {
      const cell = keyed.get(`${east},${north}`);
      if (!cell) throw new Error(`Missing sweep cell ${east},${north}`);
      let symbol = cell.ponyRay.visible ? 'C' : 'x';
      if (cell === candidate) symbol = cell.ponyRay.visible ? 'O' : 'o';
      if (cell === best) symbol = cell === candidate ? '*' : 'B';
      row += symbol;
    }
    rows.push(`${String(north).padStart(5)} | ${row}`);
  }
  return rows.join('\n');
}

async function main(): Promise<void> {
  const [terrain, scenarioText] = await Promise.all([
    TerrainLoader.fromDirectory(TERRAIN_DIRECTORY),
    readFile(SCENARIO_PATH, 'utf8'),
  ]);
  const scenario = JSON.parse(scenarioText) as ScenarioSubset;
  const full = terrain.manifest.tiers.full;
  if (full.geographicBounds.ne.lon !== -107.11) {
    throw new Error(`O3-A requires full-tier east bound -107.11; found ${full.geographicBounds.ne.lon}`);
  }
  const villageCenter = midpoint(
    findLandmark(scenario, 'village-s-end'),
    findLandmark(scenario, 'village-n-end'),
  );
  const [centerX, centerY] = terrain.toLocal(OSM_CANDIDATE.lat, OSM_CANDIDATE.lon);
  const center = { x: centerX, y: centerY };
  const [ponyX, ponyY] = terrain.toLocal(PONY_HERD_BENCH.lat, PONY_HERD_BENCH.lon);
  const ponyTarget = { x: ponyX, y: ponyY };
  const [villageX, villageY] = terrain.toLocal(villageCenter.lat, villageCenter.lon);
  const villageTarget = { x: villageX, y: villageY };
  const eastOffsets = offsets(-SWEEP_RADIUS_METERS, SWEEP_RADIUS_METERS, SWEEP_STEP_METERS);
  const northOffsets = offsets(-SWEEP_RADIUS_METERS, SWEEP_RADIUS_METERS, SWEEP_STEP_METERS);
  const trail = deriveTrailProxy(terrain, center, northOffsets);
  const cells: SweepCell[] = [];
  let coverageSamples = 0;

  for (const northOffsetMeters of northOffsets) {
    for (const eastOffsetMeters of eastOffsets) {
      const local = { x: center.x + eastOffsetMeters, y: center.y + northOffsetMeters };
      const point = terrain.toWgs84(local.x, local.y);
      const elevationMeters = terrain.elevationAtMeters(local.x, local.y);
      coverageSamples += assertRayCoverage(terrain, local, ponyTarget, 'pony-herd ray');
      coverageSamples += assertRayCoverage(terrain, local, villageTarget, 'village-center ray');
      const ponyRay = raycastTerrain(terrain, local, ponyTarget, {
        observerHeightMeters: OBSERVER_HEIGHT_METERS,
        targetHeightMeters: TARGET_HEIGHT_METERS,
        curvatureCorrection: true,
        refractionCoefficient: REFRACTION_COEFFICIENT,
      });
      const villageRay = raycastTerrain(terrain, local, villageTarget, {
        observerHeightMeters: OBSERVER_HEIGHT_METERS,
        targetHeightMeters: TARGET_HEIGHT_METERS,
        curvatureCorrection: true,
        refractionCoefficient: REFRACTION_COEFFICIENT,
      });
      const villageDistanceMiles = villageRay.distanceMeters / METERS_PER_MILE;
      cells.push({
        eastOffsetMeters,
        northOffsetMeters,
        point,
        local,
        elevationMeters,
        elevationPasses: elevationMeters >= ELEVATION_BAND_METERS.min &&
          elevationMeters <= ELEVATION_BAND_METERS.max,
        elevationDeviationMeters: distanceToBand(
          elevationMeters,
          ELEVATION_BAND_METERS.min,
          ELEVATION_BAND_METERS.max,
        ),
        ponyRay,
        villageRay,
        villageDistanceMiles,
        villageDistancePasses: villageDistanceMiles >= VALLEY_DISTANCE_MILES.min &&
          villageDistanceMiles <= VALLEY_DISTANCE_MILES.max,
        villageDistanceDeviationMiles: distanceToBand(
          villageDistanceMiles,
          VALLEY_DISTANCE_MILES.min,
          VALLEY_DISTANCE_MILES.max,
        ),
        pocket: pocketSignature(terrain, local, elevationMeters),
        trailDistanceMeters: distanceToTrail(local, trail),
      });
    }
  }

  if (cells.length !== 41 * 41) throw new Error(`Expected 1681 cells; found ${cells.length}`);
  const candidate = cells.find((cell) =>
    cell.eastOffsetMeters === 0 && cell.northOffsetMeters === 0);
  if (!candidate) throw new Error('Candidate #1 center cell is missing');
  const ranked = [...cells].sort(compareCells);
  const best = ranked[0];
  if (!best.ponyRay.visible) throw new Error('No sweep cell satisfies the MUST-FLIP criterion');
  const bestDistanceFromOsm = Math.hypot(
    best.local.x - center.x,
    best.local.y - center.y,
  );
  const clearCount = count(cells, (cell) => cell.ponyRay.visible);
  const villageClearCount = count(cells, (cell) => cell.villageRay.visible);
  const elevationPassCount = count(cells, (cell) => cell.elevationPasses);
  const pocketPassCount = count(cells, (cell) => cell.pocket.passes);
  const distancePassCount = count(cells, (cell) => cell.villageDistancePasses);
  const trailAtCandidate = distanceToTrail(center, trail);
  const trailStart = terrain.toWgs84(trail[0].x, trail[0].y);
  const trailEnd = terrain.toWgs84(trail.at(-1)?.x ?? 0, trail.at(-1)?.y ?? 0);
  const map = buildMustFlipMap(cells, candidate, best, northOffsets, eastOffsets);
  const topRows = ranked.slice(0, 10).map((cell, index) => cellTableRow(cell, String(index + 1)));

  const report = `# O3-A Crow's Nest sensitivity sweep

## Scope and method

Phase 1 only. This report does not select or apply a Crow's Nest coordinate. It sweeps 1,681 cells on a 41×41 local-UTM grid, ±2,000 m from OSM candidate #1 at 100 m spacing. Each observer is DEM ground + 1.7 m. Both sight lines call the shared \`src/terrain/raycast.ts\` implementation with curvature enabled and refraction \`k=0.13\`.

The MUST-FLIP target is the pony-herd bench at ${coordinate(PONY_HERD_BENCH)}. The informational village target is the arithmetic midpoint of the D53 \`village-s-end\` and \`village-n-end\` landmarks, ${coordinate(villageCenter)}. Village \`BLOCKED\` is historically consistent and is not disqualifying.

There is no weighted or blended score. Ranking is lexicographic and preserves separate results in this order: pony ray CLEAR (required), elevation-band pass, pocket-signature pass, 14–15 mile village-distance pass, then distance to the trail proxy. Remaining deviations and pocket relief break ties deterministically. The village ray verdict is reported but does not rank cells.

### Operationalized secondary criteria

- Elevation: PASS at 1,340–1,360 m.
- Pocket morphology: PASS when a 30 m-spaced sample within 300 m is at least 20 m lower than the observation cell; the table reports the maximum observed drop and its distance.
- Davis Creek divide trail: a DEM-only smooth low-corridor proxy through rows 100 m apart in a strip 100–800 m east of candidate #1. Adjacent proxy vertices may shift at most 200 m laterally; the path cost is row-relative elevation plus 0.05 m per lateral meter. Proxy endpoints are ${coordinate(trailStart)} and ${coordinate(trailEnd)}; closest approach to the OSM point is ${trailAtCandidate.toFixed(0)} m.
- Valley distance: PASS when straight-line distance to the village-center target is 14–15 miles. This is separate from the village ray verdict.

### Coverage assertion

PASS. Before every shared raycast, the entire observer-to-target segment was sampled at no more than 15 m (half the 30 m full-tier resolution), including both endpoints, and every one of ${coverageSamples.toLocaleString('en-US')} coverage samples returned finite DEM elevation inside the extended grid. The full tier is ${full.width}×${full.height}, east bound ${full.geographicBounds.ne.lon}; no ray has an unsampled foreground gap.

## Top 10 cells

| Rank | Coordinate (WGS84) | Elevation band | Pony-herd MUST-FLIP | Village verdict + 14–15 mi | Pocket morphology | Trail distance |
|---:|---|---|---|---|---|---:|
${topRows.join('\n')}

## Candidate #1 own cell

Candidate #1 is retained as its own row and is not merged with the sweep winner.

| Cell | Coordinate (WGS84) | Elevation band | Pony-herd MUST-FLIP | Village verdict + 14–15 mi | Pocket morphology | Trail distance |
|---|---|---|---|---|---|---:|
${cellTableRow(candidate, 'OSM #1')}

## Pass/fail map summary

MUST-FLIP only: ${clearCount} CLEAR, ${cells.length - clearCount} BLOCKED. North is up; west is left. \`C\` = CLEAR, \`x\` = BLOCKED, \`O/o\` = OSM cell clear/blocked, \`B\` = best-ranked cell, and \`*\` would mean the OSM and best cells coincide. Each character is one 100 m cell.

\`\`\`text
north | west → east
${map}
\`\`\`

Separate full-grid criterion counts (not a composite score):

| Criterion | PASS/CLEAR | FAIL/BLOCKED |
|---|---:|---:|
| Pony-herd MUST-FLIP | ${clearCount} | ${cells.length - clearCount} |
| Village ray (informational) | ${villageClearCount} CLEAR | ${cells.length - villageClearCount} BLOCKED |
| Elevation 1,340–1,360 m | ${elevationPassCount} | ${cells.length - elevationPassCount} |
| Pocket signature | ${pocketPassCount} | ${cells.length - pocketPassCount} |
| Village distance 14–15 mi | ${distancePassCount} | ${cells.length - distancePassCount} |

## Best-scoring cell vs. OSM point — separate comparison

The lexicographically best cell is ${coordinate(best.point)}. The OSM-stated point is ${coordinate(OSM_CANDIDATE)}. Their local-UTM separation is ${bestDistanceFromOsm.toFixed(0)} m. These coordinates are reported separately; neither is written to scenario landmarks or observation events in Phase 1.

## AMBIGUITIES

- TODO-AMBIGUOUS(O3-A): the dossier fixes a hollow within 300 m but not the relief threshold or sampling lattice. This sweep uses a ≥20 m drop on a 30 m lattice as a reproducible concealable-relief signature.
- TODO-AMBIGUOUS(O3-A): the dossier does not supply trail vertices or a numeric meaning for “just east.” The 100–800 m east-side DEM low-corridor proxy and its continuity parameters are an operationalization, not a claimed 1876 trail reconstruction.
- TODO-AMBIGUOUS(O3-A): “village center” is not a scenario landmark. The target is the arithmetic midpoint of the two D53 village-end landmarks; both target heights are 1.7 m because the work order fixes only observer height.
- TODO-AMBIGUOUS(O3-A): the work order forbids blending but does not prescribe tie-breaking among secondary constraints. The documented lexicographic order supplies a deterministic ranking without averaging or weighting criteria.
`;

  await mkdir(dirname(REPORT_PATH), { recursive: true });
  await writeFile(REPORT_PATH, report);
  console.log(`[o3] cells=${cells.length} pony CLEAR=${clearCount} BLOCKED=${cells.length - clearCount}`);
  console.log(`[o3] candidate ${coordinate(candidate.point)} elev=${candidate.elevationMeters.toFixed(1)}m pony=${rayLabel(candidate.ponyRay)} village=${rayLabel(candidate.villageRay)} pocket=${passLabel(candidate.pocket.passes)} trail=${candidate.trailDistanceMeters.toFixed(0)}m`);
  console.log(`[o3] best ${coordinate(best.point)} distance-from-OSM=${bestDistanceFromOsm.toFixed(0)}m`);
  console.log(`[o3] coverage PASS samples=${coverageSamples} max-step=15m`);
  console.log('[o3] wrote reports/o3-sweep.md');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
