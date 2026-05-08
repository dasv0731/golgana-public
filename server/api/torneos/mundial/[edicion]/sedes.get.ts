import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';
import type { Edicion, Sede } from '~/types/api';

export default defineEventHandler(async (event): Promise<Sede[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ sedesByEdicion: Sede[] | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { sedesByEdicion(edicionSlug: $s) }',
      { s: edicion },
    );
    return r.sedesByEdicion ?? [];
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Sede[]>(`/torneos/mundial/${edicion}/sedes`);
  }

  const ed = await loadContent<Edicion>(`torneos/mundial/${edicion}`);
  return ed.sedes ?? [];
});
