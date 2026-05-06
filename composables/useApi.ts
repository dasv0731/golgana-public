export function useApi() {
  return {
    async fetch<T>(path: string, _opts?: { ssr?: boolean }): Promise<T> {
      return $fetch(`/api${path}`) as Promise<T>;
    },
  };
}
