// Dev-only static server for the M3-B static export (no dependencies).
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = join(process.cwd(), 'out');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.geojson': 'application/geo+json',
  '.png': 'image/png',
  '.txt': 'text/plain; charset=utf-8',
  '.gz': 'application/octet-stream',
  '.br': 'application/octet-stream',
  '.i16': 'application/octet-stream',
  '.u8': 'application/octet-stream',
  '.f32': 'application/octet-stream',
};

createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', 'http://localhost');
    let path = normalize(decodeURIComponent(url.pathname)).replace(/^([/\\])+/, '');
    if (path === '' || path === '.') path = 'index.html';
    let file;
    try {
      file = await readFile(join(root, path));
    } catch {
      file = await readFile(join(root, path, 'index.html'));
      path = 'index.html';
    }
    res.writeHead(200, { 'content-type': types[extname(path)] ?? 'application/octet-stream' });
    res.end(file);
  } catch {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
  }
}).listen(4173, () => console.log('static server ready on http://localhost:4173'));
