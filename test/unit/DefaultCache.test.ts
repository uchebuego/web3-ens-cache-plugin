import { CacheOptions } from "../../src/cache/CacheOptions";
import { DefaultCache } from "../../src/cache/DefaultCache";

describe("DefaultCache", () => {
  let cache: DefaultCache;

  beforeEach(() => {
    cache = new DefaultCache();
  });

  test("should retrieve null for non-existent keys", () => {
    expect(cache.get("nonExistentKey")).toBeNull();
  });

  test("should set and get a value", () => {
    cache.set("testKey", "testValue");
    expect(cache.get("testKey")).toBe("testValue");
  });

  test("should return null if value is expired", () => {
    const options: CacheOptions = { maxAge: 1 }; // Set expiry time to 1 ms
    const cacheWithExpiry = new DefaultCache(options);

    cacheWithExpiry.set("testKey", "testValue");
    setTimeout(() => {
      expect(cacheWithExpiry.get("testKey")).toBeNull();
    }, 2); // Wait for 2 ms to ensure the value expires
  });

  test("should remove the oldest item if cache exceeds max size", () => {
    const options: CacheOptions = { max: 2 }; // Set max size to 2
    const cacheWithLimit = new DefaultCache(options);

    cacheWithLimit.set("key1", "value1");
    cacheWithLimit.set("key2", "value2");
    cacheWithLimit.set("key3", "value3"); // This should remove 'key1'

    expect(cacheWithLimit.get("key1")).toBeNull(); // 'key1' should have been deleted
    expect(cacheWithLimit.get("key2")).toBe("value2");
    expect(cacheWithLimit.get("key3")).toBe("value3");
  });

  test("should delete a specific key", () => {
    cache.set("keyToDelete", "value");
    cache.delete("keyToDelete");
    expect(cache.get("keyToDelete")).toBeNull();
  });

  test("should clear all cache items", () => {
    cache.set("key1", "value1");
    cache.set("key2", "value2");

    cache.clear();

    expect(cache.get("key1")).toBeNull();
    expect(cache.get("key2")).toBeNull();
  });

  test("should not exceed max size of cache", () => {
    const options: CacheOptions = { max: 3 };
    const limitedCache = new DefaultCache(options);

    limitedCache.set("key1", "value1");
    limitedCache.set("key2", "value2");
    limitedCache.set("key3", "value3");
    limitedCache.set("key4", "value4"); // This should remove 'key1'

    expect(limitedCache.get("key1")).toBeNull(); // 'key1' should have been removed
    expect(limitedCache.get("key2")).toBe("value2");
    expect(limitedCache.get("key3")).toBe("value3");
    expect(limitedCache.get("key4")).toBe("value4");
  });

  test("should expire the cached value based on maxAge", () => {
    const options: CacheOptions = { maxAge: 100 }; // Expire in 100ms
    const cacheWithExpiry = new DefaultCache(options);

    cacheWithExpiry.set("expiringKey", "expiringValue");

    // Check immediately, value should still be there
    expect(cacheWithExpiry.get("expiringKey")).toBe("expiringValue");

    // After 150ms, value should expire
    setTimeout(() => {
      expect(cacheWithExpiry.get("expiringKey")).toBeNull();
    }, 150);
  });
});
