import type { Scenario } from '../../src/schema/scenario-schema.js';
import type { EngineTerrain } from './pathfind.js';

export interface TrackSample {
  tick: number;
  x: number;
  y: number;
}

export interface CheckpointScore {
  checkpointId: string;
  unitId: string;
  targetMinute: number;
  nearestMinute: number;
  distanceMeters: number;
  timeDeltaMinutes: number;
  toleranceMeters: number;
  toleranceMinutes: number;
  hit: boolean;
}

function checkpointPosition(
  scenario: Scenario,
  checkpointIndex: number,
  terrain: EngineTerrain,
): [number, number] {
  const position = scenario.checkpoints[checkpointIndex].position;
  if (!('ring' in position)) return terrain.toLocal(position.lat, position.lon);
  const projected = position.ring.map((point) => terrain.toLocal(point.lat, point.lon));
  const total = projected.reduce((sum, [x, y]) => ({ x: sum.x + x, y: sum.y + y }), { x: 0, y: 0 });
  return [total.x / projected.length, total.y / projected.length];
}

export function scoreCheckpoints(
  scenario: Scenario,
  terrain: EngineTerrain,
  tracks: readonly (readonly TrackSample[])[],
): CheckpointScore[] {
  return scenario.checkpoints.map((checkpoint, checkpointIndex) => {
    const unitIndex = scenario.units.findIndex((unit) => unit.id === checkpoint.unitId);
    if (unitIndex < 0) throw new Error(`Checkpoint ${checkpoint.id} references missing unit`);
    const samples = tracks[unitIndex];
    if (!samples || samples.length === 0) throw new Error(`No track for unit ${checkpoint.unitId}`);
    const [targetX, targetY] = checkpointPosition(scenario, checkpointIndex, terrain);
    let nearest = samples[0];
    let distanceMeters = Math.hypot(nearest.x - targetX, nearest.y - targetY);
    for (let index = 1; index < samples.length; index += 1) {
      const sample = samples[index];
      const distance = Math.hypot(sample.x - targetX, sample.y - targetY);
      if (distance < distanceMeters) {
        nearest = sample;
        distanceMeters = distance;
      }
    }
    const nearestMinute = nearest.tick * scenario.clock.tickSeconds / 60;
    const timeDeltaMinutes = nearestMinute - checkpoint.minute;
    return {
      checkpointId: checkpoint.id,
      unitId: checkpoint.unitId,
      targetMinute: checkpoint.minute,
      nearestMinute,
      distanceMeters,
      timeDeltaMinutes,
      toleranceMeters: checkpoint.toleranceMeters,
      toleranceMinutes: checkpoint.toleranceMinutes,
      hit: distanceMeters <= checkpoint.toleranceMeters &&
        Math.abs(timeDeltaMinutes) <= checkpoint.toleranceMinutes,
    };
  });
}

export function formatCheckpointTable(scores: readonly CheckpointScore[]): string {
  const lines = [
    '| Checkpoint | Unit | Target min | Nearest min | Distance m | Delta min | Result |',
    '|---|---|---:|---:|---:|---:|---|',
  ];
  for (const score of scores) {
    lines.push(
      `| ${score.checkpointId} | ${score.unitId} | ${score.targetMinute.toFixed(1)} | ` +
      `${score.nearestMinute.toFixed(1)} | ${score.distanceMeters.toFixed(1)} | ` +
      `${score.timeDeltaMinutes.toFixed(1)} | ${score.hit ? 'HIT' : 'MISS'} |`,
    );
  }
  return lines.join('\n');
}
