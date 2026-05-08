import type { Equipo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Equipo> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ seleccion: { slug: string; data: Equipo } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($slug: ID!) { seleccion(slug: $slug) { slug data } }',
      { slug },
    );
    if (!r.seleccion) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Seleccion not found: ${slug}` });
    return r.seleccion.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Equipo>(`/selecciones/${slug}`);
  }

  try {
    return await loadContent<Equipo>(`selecciones/${slug}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Seleccion not found: ${slug}` });
  }
});
