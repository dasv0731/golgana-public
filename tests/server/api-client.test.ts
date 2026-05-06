import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createApiClient } from '~/server/utils/api-client';

describe('api-client', () => {
  beforeEach(() => { vi.restoreAllMocks(); });

  it('GETs with auth header when API key set', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true })));
    vi.stubGlobal('fetch', fetchMock);
    const client = createApiClient({ baseUrl: 'https://cms.test', apiKey: 'k' });
    await client.get('/torneos/mundial');
    expect(fetchMock).toHaveBeenCalledWith(
      'https://cms.test/torneos/mundial',
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer k' }) }),
    );
  });

  it('throws on non-2xx response', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('boom', { status: 500 })));
    const client = createApiClient({ baseUrl: 'https://cms.test', apiKey: '' });
    await expect(client.get('/x')).rejects.toThrow(/500/);
  });
});
