/**
 * AppSync GraphQL client (server-side, Nuxt SSR / Lambda).
 *
 * - Auth: API key (via header `x-api-key`). Las queries públicas están autorizadas.
 * - AWSJSON unwrap: AppSync devuelve `data: AWSJSON` como string; lo parseamos.
 *
 * Cuando agreguemos mutations server-side (improbable en lectura del front)
 * habrá que añadir IAM SigV4. Por ahora solo lecturas.
 */

interface GqlResponse<T> {
  data?: T;
  errors?: Array<{ message: string; errorType?: string }>;
}

export interface AppSyncConfig {
  url: string;
  apiKey: string;
}

export function isAppSyncConfigured(c: { appsyncUrl?: string; appsyncApiKey?: string }): boolean {
  return !!(c.appsyncUrl && c.appsyncApiKey);
}

export async function gqlQuery<T>(
  cfg: AppSyncConfig,
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  const res = await $fetch<GqlResponse<T>>(cfg.url, {
    method: 'POST',
    headers: {
      'x-api-key': cfg.apiKey,
      'content-type': 'application/json',
    },
    body: { query, variables: variables ?? {} },
  });
  if (res.errors?.length) {
    throw createError({
      statusCode: 502,
      statusMessage: 'AppSync error',
      message: res.errors.map((e) => e.message).join('; '),
    });
  }
  return parseAwsJsonDeep(res.data) as T;
}

/**
 * AWSJSON arrives as JSON-encoded strings. We auto-parse any string whose
 * first non-whitespace char is `{` or `[` (objects/arrays). Plain string
 * values (titles, slugs, etc.) están seguros porque no empiezan así.
 */
function parseAwsJsonDeep(node: unknown): unknown {
  if (Array.isArray(node)) return node.map(parseAwsJsonDeep);
  if (node && typeof node === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
      out[k] = parseAwsJsonDeep(v);
    }
    return out;
  }
  if (typeof node === 'string') {
    const trimmed = node.trimStart();
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      try { return parseAwsJsonDeep(JSON.parse(node)); } catch { /* not JSON */ }
    }
  }
  return node;
}
