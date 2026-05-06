export function useApi() {
  return {
    async fetch<T>(path: string): Promise<T> {
      return $fetch(`/api${path}`) as Promise<T>;
    },
  };
}
