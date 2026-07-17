import type { Scenario } from '../../src/schema/scenario-schema.js';
import type {
  EngineTerrain,
  MovementGrid,
  MovementSample,
} from '../src/pathfind.js';

export class FlatTerrain implements EngineTerrain {
  readonly grid: MovementGrid;
  readonly minimumResolutionMeters: number;

  constructor(width = 120, height = 120, resolutionMeters = 100) {
    this.minimumResolutionMeters = resolutionMeters;
    const costs = new Float32Array(width * height);
    costs.fill(1);
    this.grid = {
      id: 'flat',
      width,
      height,
      resolutionMeters,
      minX: 0,
      minY: 0,
      costs,
      minimumCost: 1,
    };
  }

  toLocal(lat: number, lon: number): [number, number] {
    return [(lon + 108) * 10_000, (lat - 45) * 10_000];
  }

  gridForPath(): MovementGrid {
    return this.grid;
  }

  movementAtMeters(x: number, y: number): MovementSample {
    const column = Math.round(x / this.grid.resolutionMeters);
    const row = Math.round(y / this.grid.resolutionMeters);
    return { movementFactor: 1, coverKind: 0, cellKey: `flat:${row * this.grid.width + column}` };
  }

  elevationAtMeters(x: number, y: number): number {
    void x;
    void y;
    return 0;
  }
}

export function cloneScenario(scenario: Scenario): Scenario {
  return JSON.parse(JSON.stringify(scenario)) as Scenario;
}
