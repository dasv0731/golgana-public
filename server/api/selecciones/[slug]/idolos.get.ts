import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';

export default defineEventHandler(async (event) => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();
  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get(`/selecciones/${slug}/idolos`);
  }
  try {
    return await loadContent(`selecciones/${slug}/idolos`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Idolos not found for: ${slug}` });
  }
});
