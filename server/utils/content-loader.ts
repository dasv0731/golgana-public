import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
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
