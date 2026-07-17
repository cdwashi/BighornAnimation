import { cp, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const source = join(process.cwd(), 'data', 'terrain', 'little-bighorn-1876');
const target = join(process.cwd(), 'public', 'terrain');
const assets = [
  'manifest.json',
  'hillshade-full.png',
  'elevation-core.i16.gz',
  'elevation-full.i16.gz',
  'slope-core.u8.gz',
  'slope-full.u8.gz',
  'cover-kind-core.u8.gz',
  'movement-cost-core.f32.gz',
  'contours-core.geojson.gz',
];

await mkdir(target, { recursive: true });
await Promise.all(assets.map((asset) => cp(join(source, asset), join(target, asset))));
