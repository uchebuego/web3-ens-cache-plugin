# ENS Resolver Caching Plugin for web3.js

## Overview

The **ENS Resolver Caching Plugin** provides a caching mechanism for resolving Ethereum Name Service (ENS) names. This plugin allows users to implement custom caching strategies, including configurable expiration times and a default caching behavior using a built-in implementation.

## Features

- Caching support for ENS resolutions.
- Default caching implementation using a `Map`.
- Custom cache interface for users to implement their own caching logic.
- Option to pass configuration options for the default cache.
- Platform-agnostic, does not rely on local storage.

## Installation

Install the plugin via npm:

```bash
npm install web3
npm install web3-plugin-ens-cache
```

## Usage

### Basic Usage with Default Cache

You can quickly use the default cache implementation without needing to create a custom cache:

```javascript
import Web3 from "web3";
import { EnsResolverCachePlugin } from "your-plugin-path";

const web3 = new Web3("https://mainnet.infura.io/v3/YOUR_INFURA_PROJECT_ID");

web3.registerPlugin(new EnsResolverCachePlugin());

(async () => {
  try {
    const address = await web3.eth.ensResolverCache.resolveEnsName(
      "vitalik.eth"
    );
    console.log("Resolved address:", address);
  } catch (error) {
    console.error("Error resolving ENS name:", error);
  }
})();
```

### Usage with Custom Cache Options

You can customize the default cache behavior by passing options when registering the plugin:

```javascript
const cacheOptions = {
  max: 200, // Maximum number of items to cache
  maxAge: 1000 * 60 * 10, // 10 minutes expiration
};

web3.registerPlugin(new EnsResolverCachePlugin(cacheOptions));
```

### Using Custom Cache Implementation

If you prefer to implement your own caching logic, create a class that adheres to the `CacheInterface` and inject it into the plugin:

```javascript
import { CustomCache } from "./custom_cache"; // Your custom cache implementation

const customCache = new CustomCache();
web3.registerPlugin(new EnsResolverCachePlugin(customCache));
```

## Cache Interface

The plugin defines a `CacheInterface` that any caching implementation must adhere to:

```typescript
interface CacheInterface {
  get(key: string): string | null;
  set(key: string, value: string): void;
  delete(key: string): void;
  clear(): void;
}
```

## Default Cache Implementation

The `DefaultCache` class provides a simple caching implementation using a `Map`. It supports the following:

- **Automatic Expiration:** Cached items can expire after a specified duration.
- **Maximum Cache Size:** Limits the number of items stored in the cache.

### DefaultCache Methods

- `get(key: string): string | null`: Retrieves a cached value by key.
- `set(key: string, value: string): void`: Stores a value in the cache with a set expiry.
- `delete(key: string): void`: Removes a value from the cache by key.
- `clear(): void`: Clears all entries in the cache.

### Example of DefaultCache Usage

```javascript
import { DefaultCache } from "./cache/DefaultCache";

const cache = new DefaultCache({ max: 100, maxAge: 1000 * 60 * 10 }); // 10 minutes maxAge
cache.set("example.eth", "0x123...");
const value = cache.get("example.eth"); // Returns '0x123...'
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please submit a pull request or open an issue for discussion.

## Acknowledgments

- [Ethereum Name Service (ENS)](https://ens.domains/)
- [web3.js](https://github.com/ChainSafe/web3.js)
