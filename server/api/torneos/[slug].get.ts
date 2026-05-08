import type { Torneo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Torneo> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ torneo: { slug: string; data: Torneo } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { torneo(slug: $s) { slug data } }',
      { s: slug },
    );
    if (!r.torneo) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Torneo not found: ${slug}` });
    return r.torneo.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Torneo>(`/torneos/${slug}`);
  }

  try {
    return await loadContent<Torneo>(`torneos/${slug}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Torneo not found: ${slug}` });
  }
});
