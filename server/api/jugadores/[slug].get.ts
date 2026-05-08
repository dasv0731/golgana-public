import type { Jugador } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

export default defineEventHandler(async (event): Promise<Jugador> => {
  const slug = getRouterParam(event, 'slug');
  if (!slug) throw createError({ statusCode: 400, statusMessage: 'Bad Request', message: 'slug required' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ jugador: { slug: string; data: Jugador } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { jugador(slug: $s) { slug data } }',
      { s: slug },
    );
    if (!r.jugador) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Jugador not found: ${slug}` });
    return r.jugador.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Jugador>(`/jugadores/${slug}`);
  }
  try {
    return await loadContent<Jugador>(`jugadores/${slug}`);
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: `Jugador not found: ${slug}` });
  }
});
