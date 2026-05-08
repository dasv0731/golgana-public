import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

const SUB = 'idolos';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ subSeleccion: { equipoSlug: string; sub: string; data: unknown } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!, $k: String!) { subSeleccion(equipoSlug: $s, sub: $k) { equipoSlug sub data } }',
      { s: slug, k: SUB },
    );
    if (!r.subSeleccion) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `${SUB} not found for: ${slug}` });
    return r.subSeleccion.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get(`/selecciones/${slug}/${SUB}`);
  }
  try {
    return await loadContent(`selecciones/${slug}/${SUB}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `${SUB} not found for: ${slug}` });
  }
});
