export interface ApiClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface ApiClient {
  get<T>(path: string): Promise<T>;
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  return {
    async get<T>(path: string): Promise<T> {
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (config.apiKey) headers.Authorization = `Bearer ${config.apiKey}`;
      const res = await fetch(`${config.baseUrl}${path}`, { headers });
      if (!res.ok) throw new Error(`API ${res.status}: ${res.statusText}`);
      return (await res.json()) as T;
    },
  };
}
