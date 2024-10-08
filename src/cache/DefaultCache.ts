import { CacheInterface } from "./CacheInterface";
import { CacheOptions } from "./CacheOptions";

export class DefaultCache implements CacheInterface {
  private cache: Map<string, { value: string; expiry: number }>;
  private max: number;
  private maxAge: number;

  constructor(options?: CacheOptions) {
    this.cache = new Map();
    this.max = options?.max || 100;
    this.maxAge = options?.maxAge || 1000 * 60 * 60 * 24; // Default to 24 hours
  }

  get(key: string): string | null {
    const cachedItem = this.cache.get(key);

    if (!cachedItem) {
      return null;
    }

    if (Date.now() > cachedItem.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cachedItem.value;
  }

  set(key: string, value: string): void {
    if (this.cache.size >= this.max) {
      const oldestKey = this.cache.keys().next().value;

      oldestKey && this.cache.delete(oldestKey);
    }

    const expiry = Date.now() + this.maxAge;
    this.cache.set(key, { value, expiry });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}
