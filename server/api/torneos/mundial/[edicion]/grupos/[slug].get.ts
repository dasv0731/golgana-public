import type { Grupo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Grupo> => {
  const edicion = getRouterParam(event, 'edicion');
  const slug = getRouterParam(event, 'slug');
  if (!edicion || !slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'edicion + slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Grupo>(`/torneos/mundial/${edicion}/grupos/${slug}`);
  }
  try {
    return await loadContent<Grupo>(`torneos/mundial/${edicion}/grupos/${slug}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Grupo not found: ${slug}` });
  }
});
