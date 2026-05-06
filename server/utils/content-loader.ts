import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { getCached, setCached } from './content-cache';

const CONTENT_ROOT = resolve(process.cwd(), 'content');

export async function loadContent<T>(relativePath: string): Promise<T> {
  const cached = getCached<T>(relativePath);
  if (cached !== undefined) return cached;

  const filePath = resolve(CONTENT_ROOT, `${relativePath}.json`);
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
