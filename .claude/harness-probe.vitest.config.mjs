// HARNESS-REPAIR Route M instrument 1/3 — measurement config. Replicates the committed
// suite's bare-default world (`npm test` uses no config file: vitest defaults + CLI
// --fileParallelism=false) and adds OBSERVATION hooks only: a main-process heartbeat
// (globalSetup) and worker-side fire-time listeners (setupFiles). Observer effect: one
// 5 s interval and a few prepended listeners — negligible against a 60 s RPC timeout
// (birpc DEFAULT_TIMEOUT = 6e4; dated read 2026-08-06,
// node_modules/vitest/dist/chunks/index.B521nVV-.js:3,21).
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

export default defineConfig({
  root: repoRoot,
  test: {
    fileParallelism: false,
    globalSetup: ['./.claude/harness-probe-globalsetup.mjs'],
    setupFiles: ['./.claude/harness-probe-worker-setup.mjs'],
  },
});
