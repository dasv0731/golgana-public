import type { Torneo } from '~/types/api';
import { loadContent } from '~/server/utils/content-loader';
import { createApiClient } from '~/server/utils/api-client';
import { gqlQuery, isAppSyncConfigured } from '~/server/utils/appsync-client';

// This handler exists because the `mundial/` directory shadows the `[slug].get.ts`
// handler one level up: Nitro picks the directory before falling back to the
// dynamic param, so a literal `/api/torneos/mundial` request would otherwise 404.
export default defineEventHandler(async (): Promise<Torneo> => {
  const config = useRuntimeConfig();

  if (isAppSyncConfigured(config)) {
    const r = await gqlQuery<{ torneo: { slug: string; data: Torneo } | null }>(
      { url: config.appsyncUrl, apiKey: config.appsyncApiKey },
      'query Q { torneo(slug: "mundial") { slug data } }',
    );
    if (!r.torneo) throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Torneo not found: mundial' });
    return r.torneo.data;
  }

  if (config.useBackend && config.cmsApiUrl) {
    const client = createApiClient({ baseUrl: config.cmsApiUrl, apiKey: config.cmsApiKey });
    return client.get<Torneo>('/torneos/mundial');
  }

  try {
    return await loadContent<Torneo>('torneos/mundial');
  } catch {
    throw createError({ statusCode: 404, statusMessage: 'Not Found', message: 'Torneo not found: mundial' });
  }
});
