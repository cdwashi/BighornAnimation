import { createHash } from 'node:crypto';
import { mkdir, open, readFile, rename, stat, writeFile } from 'node:fs/promises';
import { basename, join } from 'node:path';

import {
  CACHE_DIR,
  type DemSourceMetadata,
  SOURCE_METADATA_PATH,
  readJson,
  writeJson,
} from './shared.js';

interface TnmProduct {
  title: string;
  publicationDate: string;
  format: string;
  downloadURL: string;
  sizeInBytes: number;
}

interface TnmResponse {
  items: TnmProduct[];
}

const API_URL =
  'https://tnmaccess.nationalmap.gov/api/v1/products' +
  '?datasets=National%20Elevation%20Dataset%20(NED)%201%2F3%20arc-second' +
  '&bbox=-107.48%2C45.42%2C-107.15%2C45.60' +
  '&prodFormats=GeoTIFF&outputFormat=JSON&max=100';
const ALLOWED_HOSTS = new Set([
  'tnmaccess.nationalmap.gov',
  'prd-tnm.s3.amazonaws.com',
  'thor-f5.er.usgs.gov',
]);

async function exists(path: string): Promise<boolean> {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

async function sha256(path: string): Promise<string> {
  const hash = createHash('sha256');
  hash.update(await readFile(path));
  return hash.digest('hex');
}

async function useValidCache(): Promise<boolean> {
  if (!(await exists(SOURCE_METADATA_PATH))) return false;
  const metadata = await readJson<DemSourceMetadata>(SOURCE_METADATA_PATH);
  const localPath = join(CACHE_DIR, metadata.localFile);
  if (!(await exists(localPath))) return false;
  const actual = await sha256(localPath);
  if (actual !== metadata.sha256) {
    throw new Error(`Cached DEM checksum mismatch: expected ${metadata.sha256}, got ${actual}`);
  }
  console.log(`[fetch] checksum verified ${metadata.localFile} sha256=${actual}`);
  console.log('[fetch] cached download is valid; skipping API query and download');
  return true;
}

function assertAllowedUrl(url: string): void {
  const host = new URL(url).hostname;
  if (!ALLOWED_HOSTS.has(host)) throw new Error(`Refusing network access to non-USGS host: ${host}`);
}

async function download(url: string, destination: string): Promise<void> {
  assertAllowedUrl(url);
  const partial = `${destination}.part`;
  const offset = (await exists(partial)) ? (await stat(partial)).size : 0;
  const headers = offset > 0 ? { Range: `bytes=${offset}-` } : undefined;
  const response = await fetch(url, { headers });
  if (!response.ok) throw new Error(`DEM download failed: ${response.status} ${response.statusText}`);
  if (!response.body) throw new Error('DEM download response had no body');

  const resumed = offset > 0 && response.status === 206;
  const handle = await open(partial, resumed ? 'a' : 'w');
  const reader = response.body.getReader();
  let downloaded = resumed ? offset : 0;
  try {
    for (;;) {
      const chunk = await reader.read();
      if (chunk.done) break;
      await handle.write(chunk.value);
      downloaded += chunk.value.byteLength;
      if (downloaded % (64 * 1024 * 1024) < chunk.value.byteLength) {
        console.log(`[fetch] received ${Math.round(downloaded / 1024 / 1024)} MiB`);
      }
    }
  } finally {
    await handle.close();
  }
  await rename(partial, destination);
}

async function main(): Promise<void> {
  await mkdir(CACHE_DIR, { recursive: true });
  if (await useValidCache()) return;

  assertAllowedUrl(API_URL);
  console.log('[fetch] querying USGS TNM Access API');
  const response = await fetch(API_URL);
  if (!response.ok) throw new Error(`TNM query failed: ${response.status} ${response.statusText}`);
  const payload = await response.json() as TnmResponse;
  const products = payload.items
    .filter((item) => /USGS 1\/3 Arc Second n46w108/i.test(item.title))
    .filter((item) => item.format === 'GeoTIFF')
    .sort((a, b) =>
      b.publicationDate.localeCompare(a.publicationDate) || b.title.localeCompare(a.title),
    );
  const selected = products[0];
  if (!selected) throw new Error('TNM returned no n46w108 1/3 arc-second GeoTIFF product');
  assertAllowedUrl(selected.downloadURL);

  const localFile = basename(new URL(selected.downloadURL).pathname);
  const localPath = join(CACHE_DIR, localFile);
  console.log(`[fetch] selected ${selected.title}`);
  await download(selected.downloadURL, localPath);
  const digest = await sha256(localPath);
  await writeFile(`${localPath}.sha256`, `${digest}  ${localFile}\n`);
  const metadata: DemSourceMetadata = {
    apiUrl: API_URL,
    productTitle: selected.title,
    publicationDate: selected.publicationDate,
    downloadUrl: selected.downloadURL,
    localFile,
    sha256: digest,
    sizeInBytes: (await stat(localPath)).size,
  };
  await writeJson(SOURCE_METADATA_PATH, metadata);
  console.log(`[fetch] cached ${localFile} sha256=${digest}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
