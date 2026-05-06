import { describe, it, expect, beforeEach } from 'vitest';
import { loadContent } from '~/server/utils/content-loader';
import { clearCache } from '~/server/utils/content-cache';

describe('content-loader', () => {
  beforeEach(() => {
    clearCache();
  });

  it('loads JSON from content/ directory by relative path', async () => {
    const torneo = await loadContent<{ slug: string; nombre: string }>('torneos/mundial');
    expect(torneo.slug).toBe('mundial');
    expect(torneo.nombre).toBe('Copa Mundial FIFA');
  });

  it('throws clear error if path not found', async () => {
    await expect(loadContent('torneos/no-existe')).rejects.toThrow(/not found/i);
  });

  it('caches results in memory after first read', async () => {
    const first = await loadContent('torneos/mundial');
    const second = await loadContent('torneos/mundial');
    expect(first).toBe(second);
  });

  it('rejects path traversal attempts (../)', async () => {
    await expect(loadContent('../../etc/passwd')).rejects.toThrow(/invalid content path/i);
  });

  it('clearCache forces re-read on next loadContent', async () => {
    const first = await loadContent<{ slug: string }>('torneos/mundial');
    clearCache();
    const second = await loadContent<{ slug: string }>('torneos/mundial');
    expect(first).not.toBe(second);  // different object refs after cache clear
    expect(second.slug).toBe(first.slug);  // but same content
  });
});
