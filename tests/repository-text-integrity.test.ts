import { execFileSync } from 'node:child_process';
import { basename, extname } from 'node:path';

import { describe, expect, it } from 'vitest';

const TEXT_EXTENSIONS = new Set([
  '.css', '.gitignore', '.gitkeep', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.txt',
]);

function git(args: string[], cwd?: string): Buffer {
  try {
    return execFileSync('git', args, { cwd, encoding: 'buffer', stdio: ['ignore', 'pipe', 'pipe'] });
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`D110 tracked-text index gate requires Git repository access: ${detail}`);
  }
}

function isTrackedText(path: string): boolean {
  return TEXT_EXTENSIONS.has(extname(path).toLowerCase()) ||
    path === 'scripts/hooks/pre-commit' || basename(path) === '.gitignore';
}

describe('D110 tracked-text index gate', () => {
  it('rejects UTF-8 BOM and CR bytes from every tracked text blob in the index', () => {
    const root = git(['rev-parse', '--show-toplevel']).toString('utf8').trim();
    expect(root.length).toBeGreaterThan(0);
    const paths = git(['ls-files', '-z'], root).toString('utf8').split('\0').filter(Boolean);
    const offenses: string[] = [];
    for (const path of paths.filter(isTrackedText)) {
      const bytes = git(['show', `:${path}`], root);
      if (bytes.length >= 3 && bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
        offenses.push(`${path}: UTF-8 BOM at offset 0`);
      }
      if (bytes.includes(0x0d)) offenses.push(`${path}: CR byte present`);
    }
    expect(offenses, 'D110 tracked-text index gate offenses').toEqual([]);
  });
});
