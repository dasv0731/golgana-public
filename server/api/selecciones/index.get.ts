import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';
import type { Equipo } from '~/types/api';

export default defineEventHandler(async (): Promise<Equipo[]> => {
  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ selecciones: Array<{ slug: string; data: Equipo }> }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q { selecciones { slug data } }',
    );
    return r.selecciones.map((n) => n.data);
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Equipo[]>('/selecciones');
  }

  const dir = resolve(process.cwd(), 'content/selecciones');
  const entries = await readdir(dir, { withFileTypes: true });
  const slugs = entries
    .filter((e) => e.isFile() && e.name.endsWith('.json'))
    .map((e) => e.name.replace('.json', ''));
  return Promise.all(slugs.map((s) => loadContent<Equipo>(`selecciones/${s}`)));
});
