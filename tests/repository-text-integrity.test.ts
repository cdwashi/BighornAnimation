import { execFileSync, spawn } from 'node:child_process';
import { basename, extname } from 'node:path';

import { describe, expect, it } from 'vitest';

const TEXT_EXTENSIONS = new Set([
  '.css', '.gitignore', '.gitkeep', '.js', '.json', '.md', '.mjs', '.ts', '.tsx', '.txt',
]);

const ALLOWED_MESSAGE_OFFENSES = new Set([
  '94b404528ac0c88eae796a534ee1515e47219ec2',
  '8759dd06311281951c8ea7089a5f05a7daf1e6fe',
]);

interface IndexBlob {
  oid: string;
  path: string;
}

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
    path.startsWith('scripts/hooks/') || basename(path) === '.gitignore';
}

function trackedTextBlobs(root: string): IndexBlob[] {
  const records = git(['ls-files', '--stage', '-z'], root).toString('utf8').split('\0').filter(Boolean);
  return records.map((record) => {
    const separator = record.indexOf('\t');
    const metadata = record.slice(0, separator);
    const path = record.slice(separator + 1);
    const match = /^(\d+) ([0-9a-f]+) ([0-3])$/.exec(metadata);
    if (separator < 0 || !match || match[3] !== '0') {
      throw new Error(`D110 tracked-text index gate cannot resolve index entry: ${record}`);
    }
    return { oid: match[2], path };
  }).filter(({ path }) => isTrackedText(path));
}

function scanIndexBlobs(root: string, blobs: IndexBlob[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['cat-file', '--batch'], {
      cwd: root,
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    const offenses: string[] = [];
    const stderr: Buffer[] = [];
    let failure: Error | undefined;
    let state: 'header' | 'content' | 'delimiter' = 'header';
    let header = Buffer.alloc(0);
    let responseIndex = 0;
    let contentRemaining = 0;
    let firstBytes: number[] = [];
    let hasCr = false;

    const fail = (error: Error) => {
      failure ??= error;
      child.kill();
    };
    const finishContent = () => {
      const blob = blobs[responseIndex];
      if (!blob) {
        fail(new Error('D110 tracked-text index gate received an unexpected Git batch response'));
        return;
      }
      if (firstBytes.length === 3 && firstBytes[0] === 0xef &&
          firstBytes[1] === 0xbb && firstBytes[2] === 0xbf) {
        offenses.push(`${blob.path}: UTF-8 BOM at offset 0`);
      }
      if (hasCr) offenses.push(`${blob.path}: CR byte present`);
      state = 'delimiter';
    };

    child.stderr.on('data', (chunk: Buffer) => stderr.push(chunk));
    child.stdout.on('data', (chunk: Buffer) => {
      if (failure) return;
      try {
        let offset = 0;
        while (offset < chunk.length) {
          if (state === 'header') {
            const newline = chunk.indexOf(0x0a, offset);
            if (newline < 0) {
              header = Buffer.concat([header, chunk.subarray(offset)]);
              if (header.length > 1024) throw new Error('Git batch response header exceeded 1024 bytes');
              break;
            }
            header = Buffer.concat([header, chunk.subarray(offset, newline)]);
            const match = /^([0-9a-f]+) blob (\d+)$/.exec(header.toString('ascii'));
            if (!match) throw new Error(`unexpected Git batch response: ${header.toString('utf8')}`);
            header = Buffer.alloc(0);
            contentRemaining = Number(match[2]);
            firstBytes = [];
            hasCr = false;
            state = 'content';
            offset = newline + 1;
            if (contentRemaining === 0) finishContent();
          } else if (state === 'content') {
            const length = Math.min(contentRemaining, chunk.length - offset);
            const content = chunk.subarray(offset, offset + length);
            for (let index = 0; firstBytes.length < 3 && index < content.length; index += 1) {
              firstBytes.push(content[index]);
            }
            if (content.includes(0x0d)) hasCr = true;
            contentRemaining -= length;
            offset += length;
            if (contentRemaining === 0) finishContent();
          } else {
            if (chunk[offset] !== 0x0a) throw new Error('Git batch response omitted its blob delimiter');
            responseIndex += 1;
            state = 'header';
            offset += 1;
          }
        }
      } catch (error) {
        const detail = error instanceof Error ? error.message : String(error);
        fail(new Error(`D110 tracked-text index gate requires Git repository access: ${detail}`));
      }
    });
    child.on('error', (error) => fail(error));
    child.stdin.on('error', (error) => fail(error));
    child.on('close', (code) => {
      if (failure) {
        reject(new Error(`D110 tracked-text index gate requires Git repository access: ${failure.message}`));
        return;
      }
      if (code !== 0) {
        reject(new Error(`D110 tracked-text index gate requires Git repository access: ${Buffer.concat(stderr).toString('utf8').trim() || `git cat-file exited ${code}`}`));
        return;
      }
      if (responseIndex !== blobs.length || state !== 'header' || header.length !== 0) {
        reject(new Error(`D110 tracked-text index gate requires Git repository access: incomplete Git batch response (${responseIndex}/${blobs.length})`));
        return;
      }
      resolve(offenses);
    });

    child.stdin.end(blobs.map(({ oid }) => oid).join('\n') + (blobs.length ? '\n' : ''));
  });
}

function scanCommitMessages(root: string): string[] {
  const offenses: string[] = [];
  const shallow = git(['rev-parse', '--is-shallow-repository'], root).toString('utf8').trim();
  if (shallow !== 'false') {
    offenses.push(`D110 commit-message gate requires complete history: shallow repository (${shallow})`);
  }

  const hashes = git(['rev-list', 'HEAD'], root).toString('utf8').trim().split('\n').filter(Boolean);
  const reachable = new Set(hashes);
  for (const hash of hashes) {
    const commit = git(['cat-file', 'commit', hash], root);
    const separator = commit.indexOf('\n\n');
    if (separator < 0) throw new Error(`D110 commit-message gate cannot parse commit object ${hash}`);
    const message = commit.subarray(separator + 2);
    const hasBom = message.length >= 3 && message[0] === 0xef &&
      message[1] === 0xbb && message[2] === 0xbf;
    const hasCr = message.includes(0x0d);
    if (ALLOWED_MESSAGE_OFFENSES.has(hash)) {
      if (!hasBom || hasCr) {
        offenses.push(`${hash}: allowlist integrity failure (expected BOM at offset 0 and no CR)`);
      }
    } else {
      if (hasBom) offenses.push(`${hash}: commit message UTF-8 BOM at offset 0`);
      if (hasCr) offenses.push(`${hash}: commit message CR byte present`);
    }
  }

  for (const hash of ALLOWED_MESSAGE_OFFENSES) {
    if (!reachable.has(hash)) {
      offenses.push(`D110 commit-message gate requires complete history: allowlisted commit absent from reachable history: ${hash}`);
    }
  }
  return offenses;
}

describe('D110 tracked-text index gate', () => {
  it('rejects UTF-8 BOM and CR bytes from the tracked index and commit history', async () => {
    const root = process.env.D110_GATE_REPO_ROOT ??
      git(['rev-parse', '--show-toplevel']).toString('utf8').trim();
    expect(root.length).toBeGreaterThan(0);
    const blobOffenses = await scanIndexBlobs(root, trackedTextBlobs(root));
    const messageOffenses = scanCommitMessages(root);
    expect([...blobOffenses, ...messageOffenses], 'D110 tracked-text and commit-message gate offenses').toEqual([]);
  }, 120_000);
});
