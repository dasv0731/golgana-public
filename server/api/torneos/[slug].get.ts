import type { Torneo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Torneo> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, message: 'slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Torneo>(`/torneos/${slug}`);
  }

  try {
    return await loadContent<Torneo>(`torneos/${slug}`);
  } catch {
    throw createError({ statusCode: 404, message: `Torneo not found: ${slug}` });
  }
});
