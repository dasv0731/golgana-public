import { describe, it, expect } from 'vitest';
import { loadContent } from '~/server/utils/content-loader';

describe('content-loader', () => {
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
});
