// R1 — the full-surface audit (2026-08-04), per the FROZEN plan at
// docs/research/X6624-RESIDUE-MEASUREMENT-PLAN.md (committed d376d3a BEFORE
// any terrain file was read). First read of the terrain data surface by
// either party; the movement IMPLEMENTATION stays closed. Targets and
// predictions are the plan's; this probe reports matches, it rules nothing.
import { readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
const REPO = process.cwd();
const TDIR = join(REPO, 'data/terrain/little-bighorn-1876');
const WHOLE = [[6624, 20006], [6624, 19148], [6624, 15124], [240, 12030]];
const COMPONENTS = [20006, 19148, 15124, 240, 6624, 12030];
const OFFSETS = [7976, 7118, 3094, 6384];
const TARGETS = [...new Set([...COMPONENTS, ...OFFSETS])];
const STRUCT_KEY = /width|height|rows|cols|cell|size|bound|extent|origin|min|max|dim/i;
const lines = [];
const log = (s) => { lines.push(s); console.log(s); };
const hits = new Map(); // target -> [paths]
const structs = []; // {path, value}
const record = (v, path) => {
  if (typeof v !== 'number' || !Number.isFinite(v)) return;
  for (const t of TARGETS) if (Math.abs(v - t) <= 1) {
    if (!hits.has(t)) hits.set(t, []);
    const a = hits.get(t); if (a.length < 12) a.push(`${path}=${v}`); else a.push('…'); }
};
const walk = (node, path, fname) => {
  if (Array.isArray(node)) { node.forEach((v, i) => walk(v, `${path}[${i}]`, fname)); return; }
  if (node && typeof node === 'object') {
    for (const [k, v] of Object.entries(node)) {
      if (typeof v === 'number' && STRUCT_KEY.test(k)) structs.push({ path: `${fname}:${path}.${k}`, value: v });
      walk(v, `${path}.${k}`, fname);
    }
    return;
  }
  record(node, `${fname}:${path}`);
};
log('=== R1 full-surface audit ===');
const files = await readdir(TDIR);
log(`terrain directory files: ${files.length}`);
for (const f of files.sort()) {
  const st = await stat(join(TDIR, f));
  if (f.endsWith('.json')) {
    const j = JSON.parse(await readFile(join(TDIR, f), 'utf8'));
    walk(j, '$', `terrain/${f}`);
    log(`  parsed terrain/${f} (${st.size} bytes)`);
  } else {
    log(`  UNPARSED surface: terrain/${f} (${st.size} bytes) — reported, not silently skipped`);
  }
}
const scenario = JSON.parse(await readFile(join(REPO, 'data/scenarios/little-bighorn-1876/scenario.json'), 'utf8'));
walk(scenario, '$', 'scenario.json');
log('');
log('--- target value matches (exact ±1), with declaring paths ---');
for (const t of TARGETS.sort((a, b) => a - b)) {
  const a = hits.get(t) ?? [];
  log(`  ${t}: ${a.length === 0 ? 'NOT FOUND anywhere on the data surface' : a.join(' | ')}`);
}
log('');
log(`--- structural scalars (${structs.length}) ---`);
for (const s of structs) log(`  ${s.path} = ${s.value}`);
log('');
log('--- products and complements of structural scalars vs targets {20006, 19148, 15124, 240} ---');
const KEY_TARGETS = [20006, 19148, 15124, 240];
let productHits = 0;
for (let i = 0; i < structs.length; i += 1) for (let j = 0; j < structs.length; j += 1) {
  if (i === j) continue;
  const p = structs[i].value * structs[j].value;
  for (const t of KEY_TARGETS) {
    if (Math.abs(p - t) <= 1) { log(`  ${structs[i].path} × ${structs[j].path} = ${p} ≈ ${t}`); productHits += 1; }
    for (const s of structs) {
      const c = p - s.value;
      if (Math.abs(c - t) <= 1) { log(`  ${structs[i].path} × ${structs[j].path} − ${s.path} = ${c} ≈ ${t}`); productHits += 1; }
    }
  }
}
if (!productHits) log('  none within ±1');
log('');
log('--- single structural scalars vs all targets (±1) ---');
let single = 0;
for (const s of structs) for (const t of TARGETS) if (Math.abs(s.value - t) <= 1) { log(`  ${s.path} = ${s.value} ≈ ${t}`); single += 1; }
if (!single) log('  none within ±1');
await import('node:fs/promises').then(({ writeFile }) => writeFile(join(REPO, '.claude/x6624-audit.out.txt'), lines.join('\n') + '\n', 'utf8'));
console.error('done');
