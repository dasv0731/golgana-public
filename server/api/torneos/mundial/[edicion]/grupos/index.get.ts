import type { Grupo } from '~/types/api';
import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Grupo[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'edicion required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ grupos: Array<{ slug: string; data: Grupo }> }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { grupos(edicionSlug: $s) { slug data } }',
      { s: edicion },
    );
    return r.grupos.map((n) => n.data).sort((a, b) => a.letra.localeCompare(b.letra));
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Grupo[]>(`/torneos/mundial/${edicion}/grupos`);
  }

  const dir = resolve(process.cwd(), 'content/torneos/mundial', edicion, 'grupos');
  const files = await readdir(dir);
  const slugs = files.filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''));
  const grupos = await Promise.all(
    slugs.map((slug) => loadContent<Grupo>(`torneos/mundial/${edicion}/grupos/${slug}`)),
  );
  return grupos.sort((a, b) => a.letra.localeCompare(b.letra));
});
