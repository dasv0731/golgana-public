import type { Partido } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Partido> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ partido: { slug: string; data: Partido } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { partido(slug: $s) { slug data } }',
      { s: slug },
    );
    if (!r.partido) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Partido not found: ${slug}` });
    return r.partido.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Partido>(`/partidos/${slug}`);
  }
  try {
    return await loadContent<Partido>(`partidos/${slug}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Partido not found: ${slug}` });
  }
});
