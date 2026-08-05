// WO-D126 pre-freeze red enumeration dry-run (2026-08-05), per the standing
// practice (D112) and the adjudicator's binding constraint for the four-WO
// arc: dry-run the frozen payload, enumerate every red, pre-classify.
// SCOPE OF THIS DRY-RUN, declared: T1 (deliverOrders endState guard) and
// T2 (moveUnits endState guard) implemented verbatim; T3 (the checkpoint-
// scan guard) is enumerated ANALYTICALLY in the WO text — its
// implementation route (widen TrackSample / thread destruction ticks /
// truncate tracks) is Codex's declared choice, and pre-implementing one
// here would pre-empt the freedom the WO grants. The deviation from
// "dry-run the frozen payload" in full is FLAGGED in the WO for
// adjudication. Throwaway-patch discipline: EOL-aware anchors with
// exact-count guards, restore + rebuild in finally, byte-identity verified.
// Expected result, registered before the run: ZERO reds — every
// real-scenario suite oracle rides seed 18760625, which carries no re-arm
// (the D121 census's one re-arm is seed 18760647 co-m).
import { readFile, writeFile } from 'node:fs/promises';
import { execSync } from 'node:child_process';
import { join } from 'node:path';
const REPO = process.cwd();

const ORDERS = join(REPO, 'engine/src/orders.ts');
const MOVEMENT = join(REPO, 'engine/src/movement.ts');
const T1_OLD = `    const order = scenario.orders[delivery.orderIndex];
    const unit = state.units[delivery.recipientUnitIndex];
    activateOrder(scenario, state, unit, order, delivery.orderIndex, terrain, events, cache, combat);
    state.deliveredOrders.push({ ...delivery, deliveredTick: state.tick });`;
const T1_NEW = `    const order = scenario.orders[delivery.orderIndex];
    const unit = state.units[delivery.recipientUnitIndex];
    // WO-D126 T1 (dry-run): a scheduled delivery must not activate on a dead recipient.
    if (!unit.endState) activateOrder(scenario, state, unit, order, delivery.orderIndex, terrain, events, cache, combat);
    state.deliveredOrders.push({ ...delivery, deliveredTick: state.tick });`;
const T2_OLD = `  for (const unit of state.units) moveOneUnit(
    scenario, state, unit, terrain, events, cache, combat, memoizeCombatPaths,
  );`;
const T2_NEW = `  for (const unit of state.units) {
    // WO-D126 T2 (dry-run): a destroyed unit does not move.
    if (unit.endState) continue;
    moveOneUnit(scenario, state, unit, terrain, events, cache, combat, memoizeCombatPaths);
  }`;

const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const sh = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'pipe', 'pipe'] }).toString();
const run = (cmd) => execSync(cmd, { cwd: REPO, stdio: ['ignore', 'inherit', 'inherit'] });
const patch = async (path, oldS, newS) => {
  let src = await readFile(path, 'utf8');
  const eol = src.includes('\r\n') ? '\r\n' : '\n';
  const anchor = oldS.split('\n').join(eol);
  const found = src.split(anchor).length - 1;
  if (found !== 1) throw new Error(`anchor found ${found} times (expected 1) in ${path}`);
  await writeFile(path, src.replace(anchor, newS.split('\n').join(eol)), 'utf8');
};
log('=== WO-D126 dry-run: T1+T2 applied, full suite, zero reds expected ===');
try {
  run('git restore engine/src/orders.ts engine/src/movement.ts');
  await patch(ORDERS, T1_OLD, T1_NEW);
  await patch(MOVEMENT, T2_OLD, T2_NEW);
  run('npx tsc -p tsconfig.engine.json');
  log('T1+T2 applied and built; running the full suite...');
  try {
    const out = sh('npx vitest run');
    const tail = out.split('\n').filter((l) => /Test Files|Tests |passed|failed/.test(l)).slice(-6).join('\n');
    log(`suite: GREEN (exit 0)\n${tail}`);
  } catch (error) {
    const out = (error.stdout?.toString() ?? '') + (error.stderr?.toString() ?? '');
    const reds = out.split('\n').filter((l) => /FAIL|×|failed/.test(l)).slice(0, 40).join('\n');
    log(`suite: RED (nonzero exit) — every line below enters the enumeration:\n${reds}`);
  }
} finally {
  run('git restore engine/src/orders.ts engine/src/movement.ts');
  run('npx tsc -p tsconfig.engine.json');
  const post = sh('git status --porcelain');
  const diff = sh('git diff');
  log(`post-run git status --porcelain:\n${post || '(empty)'}`);
  log(`post-run git diff on tracked files: ${diff.trim() === '' ? 'EMPTY - byte-identical, verified' : 'NON-EMPTY - VERIFICATION FAILED:\n' + diff}`);
}
await writeFile(join(REPO, '.claude/wo-d126-dryrun.out.txt'), lines.join('\n') + '\n', 'utf8');
console.error('done');
