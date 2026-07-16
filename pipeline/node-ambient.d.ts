declare const process: {
  cwd(): string;
  argv: string[];
  exitCode?: number;
};

declare module 'node:crypto' {
  interface Hash {
    update(data: Uint8Array): Hash;
    digest(encoding: 'hex'): string;
  }
  export function createHash(algorithm: 'sha256'): Hash;
}

declare module 'node:fs/promises' {
  interface FileHandle {
    write(data: Uint8Array): Promise<{ bytesWritten: number }>;
    close(): Promise<void>;
  }
  export function mkdir(path: string, options?: { recursive?: boolean }): Promise<string | undefined>;
  export function open(path: string, flags: 'a' | 'w'): Promise<FileHandle>;
  export function readFile(path: string): Promise<Uint8Array>;
  export function readFile(path: string, encoding: 'utf8'): Promise<string>;
  export function rename(oldPath: string, newPath: string): Promise<void>;
  export function stat(path: string): Promise<{ size: number }>;
  export function writeFile(path: string, data: string | Uint8Array): Promise<void>;
}

declare module 'node:path' {
  export function basename(path: string): string;
  export function join(...paths: string[]): string;
}

declare module 'node:zlib' {
  export const constants: { BROTLI_PARAM_QUALITY: number };
  export function brotliCompressSync(
    data: Uint8Array,
    options: { params: Record<number, number> },
  ): Uint8Array;
  export function brotliDecompressSync(data: Uint8Array): Uint8Array;
}
