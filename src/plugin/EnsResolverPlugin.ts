import { Web3EthPluginBase, Web3Context } from "web3";
import { CacheInterface } from "../cache/CacheInterface";
import { DefaultCache } from "../cache/DefaultCache";
import { CacheOptions } from "../cache/CacheOptions";
import { ENS } from "web3-eth-ens";

export class EnsResolverCachePlugin extends Web3EthPluginBase {
  public pluginNamespace = "ensResolverCache";

  private ens?: ENS;
  private cache: CacheInterface;

  constructor(cacheOrOptions?: CacheInterface | CacheOptions) {
    super();
    if (
      cacheOrOptions &&
      typeof (cacheOrOptions as CacheInterface).get === "function"
    ) {
      this.cache = cacheOrOptions as CacheInterface;
    } else {
      this.cache = new DefaultCache(cacheOrOptions as CacheOptions);
    }
  }

  public link(parentContext: Web3Context) {
    super.link(parentContext);

    if (!parentContext.provider) {
      throw new Error(
        "ENS Resolver Cache Plugin requires a provider and Web3 instance."
      );
    }

    this.ens = new ENS(undefined, parentContext.provider);
  }

  public async resolveEnsName(name: string): Promise<string | null> {
    if (!this.ens) {
      throw new Error(
        "ENS Resolver not initialized. Ensure the plugin is linked to a valid Web3Context."
      );
    }

    const cachedAddress = this.cache.get(name);

    if (cachedAddress) {
      return cachedAddress;
    }

    try {
      const address = await this.ens.getAddress(name).then((a) => a.toString());

      if (address) {
        this.cache.set(name, address);
      }

      return address;
    } catch (error) {
      console.error(`Failed to resolve ENS name: ${name}`, error);
      return null;
    }
  }
}

declare module "web3" {
  interface Web3Context {
    ensResolverCache: EnsResolverCachePlugin;
  }
}
