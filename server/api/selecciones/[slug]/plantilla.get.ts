import type { Plantilla } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event): Promise<Plantilla> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Plantilla>(`/selecciones/${slug}/plantilla`);
  }
  try {
    return await loadContent<Plantilla>(`selecciones/${slug}/plantilla`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Plantilla not found for: ${slug}` });
  }
});
