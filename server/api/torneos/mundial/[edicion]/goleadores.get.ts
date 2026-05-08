import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';
import { createApiClient } from '~/server/utils/api-client';

interface GoleadorRow {
  jugador: { slug: string; nombre: string };
  equipo: { slug: string; nombre: string };
  goles: number;
  partidos: number;
}

export default defineEventHandler(async (event): Promise<GoleadorRow[]> => {
  const edicion = getRouterParam(event, 'edicion');
  if (!edicion) throw createError({ statusCode: 400, statusMessage: 'Bad Request' });

  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ goleadoresByEdicion: GoleadorRow[] }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q($s: ID!) { goleadoresByEdicion(edicionSlug: $s) { jugador equipo goles partidos } }',
      { s: edicion },
    );
    return r.goleadoresByEdicion;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<GoleadorRow[]>(`/torneos/mundial/${edicion}/goleadores`);
  }

  return [];
});
