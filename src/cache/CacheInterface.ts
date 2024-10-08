export interface CacheInterface {
  get(key: string): any | undefined;
  set(key: string, value: any, ttl?: number): void;
  delete(key: string): void;
  clear(): void;
}
