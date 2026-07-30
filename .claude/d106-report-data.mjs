import { readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const result = JSON.parse(await readFile(
  join(tmpdir(), 'bighorn-wo-d106-campaign-results.json'),
  'utf8',
));
const previewText = await readFile(
  join(process.cwd(), '.claude', 'd106-preview-probe.stdout.txt'),
  'utf8',
);
const preview = new Map([...previewText.matchAll(
  /^(187606\d{2}): reno (\d+) coalition (\d+)$/gm,
)].map((match) => [Number(match[1]), {
  renoKilled: Number(match[2]),
  coalitionKilled: Number(match[3]),
}]));
const modeCell = (table) => [
  table['order-axis'].killed,
  table['combat-pursuit'].killed,
  table.initiative.killed,
  table['camp-defence'].killed,
  table.unattributed.killed,
].join('/');
const formatPercent = (value) => `${(value * 100).toFixed(2)}%`;
const section = process.argv[2] ?? 'all';

if (section === 'all' || section === 'primary') {
  console.log('## PRIMARY');
  console.log('| Seed | A/G/M | Reno K | East | Coalition K | Wing | Bouts | ' +
    'Hill OA/CP/I/CD/U | Wing OA/CP/I/CD/U | Holder ticks/viol. | Switches | ' +
    'Starve windows/ticks/max | Composite |');
  console.log('|---:|---|---:|---:|---:|---|---:|---|---|---:|---:|---|---:|');
  for (const row of result.rows) {
    const starvationTicks = row.starvationWindows.reduce(
      (sum, window) => sum + window.durationTicks,
      0,
    );
    const starvationMax = row.starvationWindows.reduce(
      (max, window) => Math.max(max, window.durationTicks),
      0,
    );
    const holderTicks = Object.values(row.holderSamplesByUnit)
      .reduce((sum, count) => sum + count, 0);
    console.log(`| ${row.seed} | ${row.renoKilledByUnit['co-a']}/` +
      `${row.renoKilledByUnit['co-g']}/${row.renoKilledByUnit['co-m']} | ` +
      `${row.renoKilled} | ${row.eastAliveCount} | ${row.coalitionKilled} | ` +
      `${row.completeWing ? 'yes' : 'no'} | ${row.boutCount} | ` +
      `${modeCell(row.hillModes)} | ${modeCell(row.wingModes)} | ` +
      `${holderTicks}/${row.holderPursuitViolations.length} | ${row.switchEvents.length} | ` +
      `${row.starvationWindows.length}/${starvationTicks}/${starvationMax} | ` +
      `${formatPercent(row.composite)} |`);
  }
}

if (section === 'all' || section === 'preview') {
  console.log('## PREVIEW');
  console.log('| Seed | Preview Reno | D106 Reno | Δ | Preview coalition | D106 coalition | Δ |');
  console.log('|---:|---:|---:|---:|---:|---:|---:|');
  for (const row of result.rows.filter((item) => item.previewed)) {
    const expected = preview.get(row.seed);
    console.log(`| ${row.seed} | ${expected?.renoKilled ?? 'missing'} | ${row.renoKilled} | ` +
      `${expected ? row.renoKilled - expected.renoKilled : '—'} | ` +
      `${expected?.coalitionKilled ?? 'missing'} | ${row.coalitionKilled} | ` +
      `${expected ? row.coalitionKilled - expected.coalitionKilled : '—'} |`);
  }
}

if (section === 'all' || section === 'switches') {
  console.log('## SWITCHES');
  console.log('| Seed | Blackfeet-Santee | Minneconjou | Sans Arc | Total |');
  console.log('|---:|---:|---:|---:|---:|');
  for (const row of result.rows) {
    const counts = Object.fromEntries(row.poolIds.map((id) => [
      id,
      row.switchEvents.filter((event) => event.unitId === id).length,
    ]));
    console.log(`| ${row.seed} | ${counts['blackfeet-santee-pool']} | ` +
      `${counts['minneconjou-pool']} | ${counts['sans-arc-pool']} | ` +
      `${row.switchEvents.length} |`);
  }
}

if (section === 'all' || section === 'starvation') {
  console.log('## STARVATION');
  console.log('| Seed | Windows | Holder-ticks in windows | Longest ticks/min | ' +
    'Switch-eligible ticks |');
  console.log('|---:|---:|---:|---:|---:|');
  for (const row of result.rows) {
    const ticks = row.starvationWindows.reduce((sum, window) => sum + window.durationTicks, 0);
    const max = row.starvationWindows.reduce(
      (value, window) => Math.max(value, window.durationTicks),
      0,
    );
    const maxMinutes = row.starvationWindows.reduce(
      (value, window) => Math.max(value, window.durationMinutes),
      0,
    );
    const switchEligible = row.starvationWindows.reduce(
      (sum, window) => sum + window.switchEligibleTicks,
      0,
    );
    console.log(`| ${row.seed} | ${row.starvationWindows.length} | ${ticks} | ` +
      `${max}/${maxMinutes.toFixed(1)} | ${switchEligible} |`);
  }
}
