// HARNESS-REPAIR Route M instrument 3/3 — worker-side fire-time capture. The RPC
// timeout error is THROWN IN THE WORKER by birpc's onTimeoutError (dated read
// 2026-08-06, node_modules/vitest/dist/chunks/rpc.-pEldfrD.js:48-53) from a timer
// callback, so it surfaces as an uncaughtException/unhandledRejection in the worker.
// Prepended listeners observe WITH timestamps and never swallow — vitest's own handlers
// run after. Per-file start/end stamps localize the fire against the test phase
// (H1: fire inside a long file's window; H2: fire after the last file's end).
import { appendFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, afterAll } from 'vitest';

const LOG = join(dirname(fileURLToPath(import.meta.url)), 'harness-fire-time.log');
const line = (event, extra = '') =>
  appendFileSync(LOG, `${Date.now()} ${new Date().toISOString()} worker ${event}${extra ? ' ' + extra : ''}\n`);

const FLAG = '__harness_probe_installed__';
if (!globalThis[FLAG]) {
  globalThis[FLAG] = true;
  line('worker-boot', `pid=${process.pid}`);
  process.prependListener('uncaughtException', (err) => {
    line('uncaughtException', JSON.stringify(String(err && err.message || err).slice(0, 200)));
  });
  process.prependListener('unhandledRejection', (reason) => {
    line('unhandledRejection', JSON.stringify(String(reason && reason.message || reason).slice(0, 200)));
  });
}

beforeAll((suite) => {
  line('file-start', suite?.file?.name ?? 'unknown');
});
afterAll((suite) => {
  line('file-end', suite?.file?.name ?? 'unknown');
});
