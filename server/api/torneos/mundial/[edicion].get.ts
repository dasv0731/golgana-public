import type { Edicion } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Edicion> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'edicion required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ edicion: { slug: string; data: Edicion } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { edicion(slug: $s) { slug data } }',
      { s: edicion },
    );
    if (!r.edicion) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Edicion not found: ${edicion}` });
    return r.edicion.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Edicion>(`/torneos/mundial/${edicion}`);
  }
  try {
    return await loadContent<Edicion>(`torneos/mundial/${edicion}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Edicion not found: ${edicion}` });
  }
});
