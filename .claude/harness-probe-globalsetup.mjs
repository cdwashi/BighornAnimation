// HARNESS-REPAIR Route M instrument 2/3 — main-process heartbeat. A 5 s interval logs
// wall-clock liveness of the main vitest process; a GAP much longer than 5 s is a
// main-event-loop blockage window (H1's discriminator). Sync appends so no line is lost
// if a process dies.
import { appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const LOG = join(dirname(fileURLToPath(import.meta.url)), 'harness-fire-time.log');
const line = (event, extra = '') =>
  appendFileSync(LOG, `${Date.now()} ${new Date().toISOString()} main ${event}${extra ? ' ' + extra : ''}\n`);

export default function globalSetup() {
  line('globalSetup-start', `pid=${process.pid}`);
  const beat = setInterval(() => line('heartbeat'), 5000);
  return () => {
    clearInterval(beat);
    line('globalSetup-teardown');
  };
}
