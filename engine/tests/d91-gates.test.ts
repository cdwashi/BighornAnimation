import { join } from 'node:path';

import { describe, expect, it } from 'vitest';

import scenarioData from '../../data/scenarios/little-bighorn-1876/scenario.json';
import type { Scenario } from '../../src/schema/scenario-schema.js';
import { TerrainMovementLoader } from '../../src/terrain/movement-loader.js';
import { updateCampDefense } from '../src/camp-defense.js';
import { combatConfig } from '../src/combat-config.js';
import type { SimEvent } from '../src/events.js';
import { createSim } from '../src/index.js';
import { moveUnits } from '../src/movement.js';
import { repathPursuit } from '../src/objectives.js';
import {
  findPath,
  type ChannelSide,
  type MovementSample,
  type TerrainCoverFeature,
} from '../src/pathfind.js';
import { spottingConfig } from '../src/spotting.js';
import { initializeState } from '../src/state.js';
import { cloneScenario, FlatTerrain } from './helpers.js';

const scenario = scenarioData as unknown as Scenario;

class FeatureTerrain extends FlatTerrain {
  constructor(
    private readonly features: readonly TerrainCoverFeature[],
    private readonly channelX?: number,
  ) {
    super();
  }

  coverFeatures(): readonly TerrainCoverFeature[] {
    return this.features;
  }

  channelSideAtMeters(x: number, y: number): ChannelSide {
    void y;
    if (this.channelX === undefined || x === this.channelX) return 'ON_CHANNEL';
    return x < this.channelX ? 'WEST' : 'EAST';
  }
}

class CostTerrain extends FlatTerrain {
  constructor() {
    super(120, 120, 10);
  }

  override movementAtMeters(x: number, y: number): MovementSample {
    const column = Math.max(0, Math.min(
      this.grid.width - 1,
      Math.round((x - this.grid.minX) / this.grid.resolutionMeters),
    ));
    const row = Math.max(0, Math.min(
      this.grid.height - 1,
      Math.round((y - this.grid.minY) / this.grid.resolutionMeters),
    ));
    const index = row * this.grid.width + column;
    const cost = this.grid.costs[index];
    return {
      movementFactor: Number.isFinite(cost) ? 1 : 0,
      cost,
      coverKind: 0,
      cellKey: `cost:${index}`,
    };
  }
}

function markCampWardFordCommitment(
  threat: ReturnType<typeof initializeState>['units'][number],
  camp: ReturnType<typeof initializeState>['units'][number],
): void {
  threat.insideFord = true;
  threat.path = [
    { ...threat.position },
    {
      x: (threat.position.x + camp.position.x) / 2,
      y: (threat.position.y + camp.position.y) / 2,
    },
  ];
  threat.pathIndex = 1;
}

describe('D103 hostile-act alarm and attack-speed response gates', () => {
  function fixture(): {
    synthetic: Scenario;
    terrain: FeatureTerrain;
    state: ReturnType<typeof initializeState>;
    band: ReturnType<typeof initializeState>['units'][number];
    camp: ReturnType<typeof initializeState>['units'][number];
    threat: ReturnType<typeof initializeState>['units'][number];
    events: SimEvent[];
    update: (tick: number) => void;
  } {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'hunkpapa-camp', 'co-a']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const terrain = new FeatureTerrain([
      { id: 'feature-a', points: [{ x: 300, y: 0 }] },
    ]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 100, y: 0 };
    camp.position = { x: 0, y: 0 };
    threat.position = { x: 500, y: 0 };
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];
    const update = (tick: number): void => {
      state.tick = tick;
      updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    };
    return { synthetic, terrain, state, band, camp, threat, events, update };
  }

  it('no-alarm-on-approach: a spotted threat inside the radius but never ford-committed raises no alert', () => {
    const { band, threat, update } = fixture();
    threat.path = [{ ...threat.position }, { x: 400, y: 0 }];
    threat.pathIndex = 1;

    update(0);
    update(1);

    expect(band.campDefenseAlert).toBeUndefined();
    expect(band.campDefense).toBeUndefined();
  });

  it('alarm-on-camp-ward-ford-commitment', () => {
    const { band, camp, threat, update } = fixture();
    markCampWardFordCommitment(threat, camp);

    update(0);

    expect(band.campDefenseAlert).toMatchObject({
      tick: 0,
      campUnitId: 'hunkpapa-camp',
      threatUnitId: 'co-a',
    });
  });

  it('no-alarm-on-outbound-crossing', () => {
    const { band, threat, update } = fixture();
    threat.insideFord = true;
    threat.path = [{ ...threat.position }, { x: 600, y: 0 }];
    threat.pathIndex = 1;

    update(0);
    update(1);

    expect(band.campDefenseAlert).toBeUndefined();
    expect(band.campDefense).toBeUndefined();
  });

  it('gallop-response-speed: activate uses CAVALRY_GALLOP for a mounted responder', () => {
    const { band, camp, threat, update } = fixture();
    markCampWardFordCommitment(threat, camp);

    update(0);
    update(1);

    expect(band.campDefense?.threatUnitId).toBe('co-a');
    expect(band.speedClass).toBe('CAVALRY_GALLOP');
  });
});

describe('D91/D92 camp-defence reconstruction gates', () => {
  it('D92 derives deterministic TIMBER feature clusters and scenario data declares only the Bench', async () => {
    const terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    const features = terrain.coverFeatures();
    expect(features.length).toBeGreaterThan(0);
    expect(features.every((feature, index) =>
      feature.id === `substrate-timber-${String(index + 1).padStart(4, '0')}` &&
      feature.points.length > 0)).toBe(true);
    expect(new Set(features.flatMap((feature) =>
      feature.points.map((point) => terrain.movementAtMeters(point.x, point.y).cellKey))).size)
      .toBe(features.reduce((total, feature) => total + feature.points.length, 0));
    expect(scenario.coverFeatures).toEqual([expect.objectContaining({
      id: 'bench',
      position: { lat: 45.51659, lon: -107.38996 },
      // Amendment 2 payload-pin refresh: D101's LOW byte lands in D111.
      provenance: expect.objectContaining({ confidence: 'LOW' }),
    })]);
    expect(scenario.campDefense?.turnoutDelayMinutes).toMatchObject({
      low: 10,
      best: 15,
      high: 20,
      provenance: { confidence: 'MEDIUM' },
    });
    const state = initializeState(scenario, terrain, 1);
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const bench = scenario.coverFeatures?.find((feature) => feature.id === 'bench');
    if (!camp || !bench) throw new Error('D98 side-classification fixtures missing');
    const [benchX, benchY] = terrain.toLocal(bench.position.lat, bench.position.lon);
    expect(terrain.channelSideAtMeters(camp.position.x, camp.position.y)).toBe('WEST');
    expect(terrain.channelSideAtMeters(benchX, benchY)).toBe('WEST');
  });

  it('D91 delays turnout, commits threat and feature, switches at 250 m, and retries blocked paths at 10 ticks', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'hunkpapa-camp', 'co-a', 'co-g']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    const terrain = new FeatureTerrain([
      { id: 'feature-a', points: [{ x: 900, y: 0 }] },
      { id: 'feature-b', points: [{ x: 600, y: 0 }] },
    ]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const companyA = state.units.find((unit) => unit.id === 'co-a');
    const companyG = state.units.find((unit) => unit.id === 'co-g');
    if (!band || !camp || !companyA || !companyG) throw new Error('synthetic units missing');
    band.position = { x: 50, y: 0 };
    camp.position = { x: 0, y: 0 };
    companyA.position = { x: 1_000, y: 0 };
    companyG.position = { x: 1_100, y: 0 };
    markCampWardFordCommitment(companyA, camp);
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...companyA.position } },
      'co-g': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...companyG.position } },
    };
    const events: SimEvent[] = [];
    const update = (tick: number): void => {
      state.tick = tick;
      updateCampDefense(
        synthetic,
        state,
        terrain,
        spottingConfig(),
        combatConfig(),
        events,
      );
    };

    update(0);
    update(29);
    expect(band.campDefense).toBeUndefined();
    update(30);
    expect(band.campDefense).toMatchObject({
      threatUnitId: 'co-a',
      featureId: 'feature-a',
      lastPathAttemptTick: 30,
    });
    expect(events.filter((event) => event.type === 'camp-defense-activated')).toHaveLength(1);

    state.believedPictures['lakota-cheyenne-coalition']['co-g'].lastSeenPos = { x: 800, y: 0 };
    update(31);
    expect(band.campDefense?.threatUnitId).toBe('co-a');
    state.believedPictures['lakota-cheyenne-coalition']['co-g'].lastSeenPos = { x: 700, y: 0 };
    update(32);
    expect(band.campDefense).toMatchObject({
      threatUnitId: 'co-g',
      featureId: 'feature-b',
      lastPathAttemptTick: 32,
    });

    band.path = [];
    band.pathIndex = 0;
    band.blockedReason = 'synthetic blockage';
    update(41);
    expect(band.path).toHaveLength(0);
    update(42);
    expect(band.path.length).toBeGreaterThan(0);
    expect(band.campDefense?.featureId).toBe('feature-b');
    expect(events.filter((event) => event.type === 'camp-defense-activated')).toHaveLength(1);
  });

  it('D91 recovers an impassable path start and movement refuses an impassable destination cell', () => {
    const terrain = new CostTerrain();
    const blockedIndex = 2;
    terrain.grid.costs[blockedIndex] = Number.POSITIVE_INFINITY;
    const recovered = findPath(terrain.grid, { x: 20, y: 0 }, { x: 40, y: 0 });
    expect(recovered.status).toBe('reachable');
    if (recovered.status !== 'reachable') return;
    expect(recovered.path[0]).toMatchObject({ x: 10, y: 0 });

    const synthetic = cloneScenario(scenario);
    synthetic.orders = [];
    const state = initializeState(synthetic, terrain, 1);
    const unit = state.units[0];
    unit.position = { x: 10, y: 0 };
    unit.path = [{ x: 10, y: 0 }, { x: 20, y: 0 }];
    unit.pathIndex = 1;
    unit.posture = 'MARCH';
    unit.formation = 'COLUMN';
    unit.speedClass = 'ON_FOOT';
    unit.blockedReason = undefined;
    const events: SimEvent[] = [];
    moveUnits(synthetic, { ...state, units: [unit] }, terrain, events, new Map());
    expect(unit.position).toEqual({ x: 10, y: 0 });
    expect(unit.blockedReason).toBe('next terrain cell is impassable');
    expect(Number.isFinite(terrain.movementAtMeters(unit.position.x, unit.position.y).cost)).toBe(true);
  });

  it('D93 releases a commitment when its threat leaves the activation radius', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'hunkpapa-camp', 'co-a']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const terrain = new FeatureTerrain([
      { id: 'feature-a', points: [{ x: 600, y: 0 }] },
    ]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 500, y: 0 };
    camp.position = { x: 0, y: 0 };
    threat.position = { x: 1_000, y: 0 };
    markCampWardFordCommitment(threat, camp);
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];
    const update = (tick: number): void => {
      state.tick = tick;
      updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    };

    update(0);
    update(1);
    expect(band.campDefense?.threatUnitId).toBe('co-a');
    band.posture = 'CHARGE';
    band.pursuit = {
      targetUnitId: 'co-a',
      lastRepathTick: 1,
      lastTargetPosition: { ...threat.position },
      contactEmitted: false,
    };

    state.believedPictures['lakota-cheyenne-coalition']['co-a'].lastSeenPos = {
      x: 3_001,
      y: 0,
    };
    update(2);
    expect(band.campDefense).toBeUndefined();
    expect(band.campDefenseAlert).toBeUndefined();
    expect(band.pursuit).toBeUndefined();
    expect(band.posture).toBe('HOLD');
  });

  it('D96 holds CHARGE after degraded cohesion and bare target-centered local superiority', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'gall-band', 'hunkpapa-camp', 'co-a']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const terrain = new FeatureTerrain([
      { id: 'feature-a', points: [{ x: 600, y: 0 }] },
    ]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const support = state.units.find((unit) => unit.id === 'gall-band');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !support || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 600, y: 0 };
    band.strengthAvailable = 60;
    support.position = { x: 1_400, y: 0 };
    support.strengthAvailable = 100;
    support.moraleState = 'BROKEN';
    camp.position = { x: 0, y: 0 };
    threat.position = { x: 1_000, y: 0 };
    threat.strengthAvailable = 100;
    threat.moraleState = 'SHAKEN';
    markCampWardFordCommitment(threat, camp);
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];
    const update = (tick: number): void => {
      state.tick = tick;
      updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    };

    update(0);
    update(1);
    update(2);
    expect(band.posture).not.toBe('CHARGE');

    support.moraleState = 'STEADY';
    threat.moraleState = 'STEADY';
    update(3);
    expect(band.posture).not.toBe('CHARGE');

    threat.moraleState = 'SHAKEN';
    update(4);
    expect(band.posture).toBe('CHARGE');
    expect(band.speedClass).toBe('CAVALRY_GALLOP');
    expect(band.pursuit).toMatchObject({
      targetUnitId: 'co-a',
      lastRepathTick: 4,
    });
    expect(band.path.at(-1)).toMatchObject(threat.position);

    support.moraleState = 'BROKEN';
    threat.moraleState = 'STEADY';
    update(5);
    expect(band.posture).toBe('CHARGE');
    expect(band.pursuit?.targetUnitId).toBe('co-a');
  });

  it('D91 permanent invariant — no baseline unit occupies a non-finite-cost cell at any full-day tick', async () => {
    const terrain = await TerrainMovementLoader.fromDirectory(join(
      process.cwd(), 'data', 'terrain', 'little-bighorn-1876',
    ));
    const sim = createSim(scenario, { seed: 18760625, terrain });
    for (let tick = 0; tick <= 2160; tick += 1) {
      sim.run(tick);
      for (const unit of sim.state().units) {
        const sample = terrain.movementAtMeters(unit.position.x, unit.position.y);
        expect(Number.isFinite(sample.cost), `${unit.id} at tick ${tick} on ${sample.cellKey}`)
          .toBe(true);
      }
    }
  }, 120_000);

  it('D98 confines feature goals and held closing paths to the defended camp side while order paths still cross', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set([
      'hunkpapa-pool',
      'gall-band',
      'hunkpapa-camp',
      'co-a',
    ]);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const terrain = new FeatureTerrain([
      { id: 'west-feature', points: [{ x: 300, y: 0 }] },
      { id: 'east-feature', points: [{ x: 700, y: 0 }] },
    ], 500);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const support = state.units.find((unit) => unit.id === 'gall-band');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !support || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 200, y: 0 };
    band.strengthAvailable = 100;
    support.position = { x: 800, y: 0 };
    support.strengthAvailable = 100;
    camp.position = { x: 100, y: 0 };
    threat.position = { x: 900, y: 0 };
    threat.strengthAvailable = 10;
    threat.moraleState = 'SHAKEN';
    markCampWardFordCommitment(threat, camp);
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];
    const update = (tick: number): void => {
      state.tick = tick;
      updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    };

    update(0);
    update(1);
    expect(band.campDefense).toMatchObject({
      threatUnitId: 'co-a',
      featureId: 'west-feature',
      goal: { x: 300, y: 0 },
    });
    update(2);
    expect(band.posture).not.toBe('CHARGE');

    threat.position = { x: 400, y: 0 };
    support.position = { x: 300, y: 0 };
    update(3);
    expect(band.posture).toBe('CHARGE');
    expect(band.path.every((point) => terrain.channelSideAtMeters(point.x, point.y) === 'WEST'))
      .toBe(true);

    threat.position = { x: 700, y: 0 };
    state.tick = 13;
    const heldCharge = repathPursuit(synthetic, state, band, terrain, new Map());
    expect(heldCharge.status).toBe('unreachable');
    expect(band.position.x).toBeLessThan(500);

    band.campDefense = undefined;
    if (band.pursuit) band.pursuit.kind = 'ORDER';
    const ordered = repathPursuit(synthetic, state, band, terrain, new Map());
    expect(ordered.status).toBe('reachable');
    if (ordered.status === 'reachable') {
      expect(ordered.path.at(-1)).toMatchObject({ x: 700, y: 0 });
    }
  });

  it('D99 excludes irregular-scout profiles from camp-threat eligibility regardless of unit kind', () => {
    const synthetic = cloneScenario(scenario);
    const ids = new Set(['hunkpapa-pool', 'hunkpapa-camp', 'co-a']);
    synthetic.units = synthetic.units.filter((unit) => ids.has(unit.id));
    synthetic.leaders = [];
    synthetic.orders = [];
    synthetic.checkpoints = [];
    synthetic.observationEvents = [];
    synthetic.variants = [];
    synthetic.coverFeatures = [];
    if (synthetic.campDefense) synthetic.campDefense.turnoutDelayMinutes.best = 0;
    const sourceThreat = synthetic.units.find((unit) => unit.id === 'co-a');
    if (!sourceThreat) throw new Error('synthetic source threat missing');
    const regularProfileId = sourceThreat.tacticsProfileId;
    sourceThreat.tacticsProfileId = 'irregular-scout';
    const terrain = new FeatureTerrain([
      { id: 'feature-a', points: [{ x: 600, y: 0 }] },
    ]);
    const state = initializeState(synthetic, terrain, 1);
    const band = state.units.find((unit) => unit.id === 'hunkpapa-pool');
    const camp = state.units.find((unit) => unit.id === 'hunkpapa-camp');
    const threat = state.units.find((unit) => unit.id === 'co-a');
    if (!band || !camp || !threat) throw new Error('synthetic units missing');
    band.position = { x: 500, y: 0 };
    camp.position = { x: 0, y: 0 };
    threat.position = { x: 1_000, y: 0 };
    markCampWardFordCommitment(threat, camp);
    state.believedPictures['lakota-cheyenne-coalition'] = {
      'co-a': { status: 'spotted', lastSeenTick: 0, lastSeenPos: { ...threat.position } },
    };
    const events: SimEvent[] = [];

    state.tick = 0;
    updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    expect(band.campDefenseAlert).toBeUndefined();
    expect(band.campDefense).toBeUndefined();

    sourceThreat.tacticsProfileId = regularProfileId;
    state.tick = 1;
    updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    state.tick = 2;
    updateCampDefense(synthetic, state, terrain, spottingConfig(), combatConfig(), events);
    expect(band.campDefense?.threatUnitId).toBe('co-a');
  });
});
