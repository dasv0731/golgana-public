import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';
import type { Partido } from '~/types/api';

export default defineEventHandler(async (event): Promise<Partido[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ calendarioByEdicion: Array<{ slug: string; data: Partido }> }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { calendarioByEdicion(edicionSlug: $s) { slug data } }',
      { s: edicion },
    );
    return r.calendarioByEdicion.map((n) => n.data);
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Partido[]>(`/torneos/mundial/${edicion}/calendario`);
  }

  const dir = resolve(process.cwd(), 'content/partidos');
  let files: string[];
  try { files = await readdir(dir); }
  catch { return []; }
  const partidos = await Promise.all(
    files.filter((f) => f.endsWith('.json')).map((f) => loadContent<Partido>(`partidos/${f.replace('.json', '')}`)),
  );
  return partidos
    .filter((p) => p.edicion.slug === edicion)
    .sort((a, b) => a.fecha.localeCompare(b.fecha));
});
