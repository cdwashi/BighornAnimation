import type { SimEvent } from '../../engine/src/events';
import type { SpottingEvent } from '../../engine/src/spotting';
import type { SimState } from '../../engine/src/state';

export type WorkerRequest =
  | { type: 'init'; tick: number }
  | { type: 'seek'; tick: number }
  | { type: 'advance'; tick: number }
  | { type: 'viewshed'; leaderId: string; atmosphericFactor: number };

export type WorkerResponse =
  | {
    type: 'ready';
    state: SimState;
    events: SimEvent[];
    spottingEvents: SpottingEvent[];
    runMilliseconds: number;
  }
  | { type: 'state'; state: SimState }
  | {
    type: 'viewshed';
    leaderId: string;
    tick: number;
    width: number;
    height: number;
    values: Uint8ClampedArray;
    milliseconds: number;
  }
  | { type: 'error'; message: string };
