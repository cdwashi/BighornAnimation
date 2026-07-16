export const DEFAULT_TICK_SECONDS = 30;

export function minuteToTick(minute: number, tickSeconds = DEFAULT_TICK_SECONDS): number {
  const ticks = minute * 60 / tickSeconds;
  if (!Number.isInteger(ticks)) throw new RangeError(`Minute ${minute} is not aligned to ${tickSeconds}s ticks`);
  return ticks;
}

export function tickToMinute(tick: number, tickSeconds = DEFAULT_TICK_SECONDS): number {
  return tick * tickSeconds / 60;
}

function parseWallClock(value: string): number {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new RangeError(`Invalid wall clock ${value}`);
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) throw new RangeError(`Invalid wall clock ${value}`);
  return hours * 60 + minutes;
}

export function minuteToWallClock(start: string, minute: number): string {
  const total = ((parseWallClock(start) + minute) % 1440 + 1440) % 1440;
  const hours = Math.floor(total / 60);
  const minutes = Math.floor(total % 60);
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function tickToWallClock(start: string, tick: number, tickSeconds = DEFAULT_TICK_SECONDS): string {
  return minuteToWallClock(start, tickToMinute(tick, tickSeconds));
}

export function wallClockToMinute(start: string, wallClock: string): number {
  const startMinute = parseWallClock(start);
  const targetMinute = parseWallClock(wallClock);
  return targetMinute >= startMinute ? targetMinute - startMinute : targetMinute + 1440 - startMinute;
}
