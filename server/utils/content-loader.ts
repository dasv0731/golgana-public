import { readFile, readdir } from 'node:fs/promises';
import { resolve, sep, join } from 'node:path';
import { getCached, setCached, hasCached } from './content-cache';

const CONTENT_ROOT = resolve(process.cwd(), 'content');

export async function loadContent<T>(relativePath: string): Promise<T> {
  if (hasCached(relativePath)) {
    return getCached<T>(relativePath) as T;
  }

  const filePath = resolve(CONTENT_ROOT, `${relativePath}.json`);

  // Guard: ensure the resolved path stays inside CONTENT_ROOT (path traversal protection)
  if (!filePath.startsWith(CONTENT_ROOT + sep)) {
    throw new Error(`Invalid content path: ${relativePath}`);
  }

  let raw: string;
  try {
    raw = await readFile(filePath, 'utf-8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      throw new Error(`Content not found: ${relativePath}`);
    }
    throw err;
  }

  const parsed = JSON.parse(raw) as T;
  setCached(relativePath, parsed);
  return parsed;
}

export async function loadDirContent<T>(relativeDir: string): Promise<T[]> {
  const dirPath = resolve(CONTENT_ROOT, relativeDir);
  if (!dirPath.startsWith(CONTENT_ROOT + sep) && dirPath !== CONTENT_ROOT) {
    throw new Error(`Invalid content dir: ${relativeDir}`);
  }
  let entries: string[];
  try {
    entries = await readdir(dirPath);
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return [];
    throw err;
  }
  const out: T[] = [];
  for (const e of entries) {
    if (!e.endsWith('.json')) continue;
    const raw = await readFile(join(dirPath, e), 'utf-8');
    out.push(JSON.parse(raw) as T);
  }
  return out;
}
