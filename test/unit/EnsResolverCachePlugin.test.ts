import { Web3, Web3Eth, Web3Context } from "web3";
import { ENS } from "web3-eth-ens";
import { CacheInterface, EnsResolverCachePlugin } from "../../src";

describe("EnsResolverCachePlugin Tests", () => {
  test("should register EnsResolverCachePlugin on Web3Context instance", () => {
    const web3Context = new Web3Context("http://127.0.0.1:8545");
    web3Context.registerPlugin(new EnsResolverCachePlugin());
    expect(web3Context.ensResolverCache).toBeDefined();
  });

  test("should register EnsResolverCachePlugin on Web3Eth instance", () => {
    const web3Eth = new Web3Eth("http://127.0.0.1:8545");
    web3Eth.registerPlugin(new EnsResolverCachePlugin());
    expect(web3Eth.ensResolverCache).toBeDefined();
  });

  describe("EnsResolverCachePlugin method tests", () => {
    let web3: Web3;
    let mockCache: CacheInterface;
    let mockEns: ENS;
    const requestManagerSendSpy = jest.fn();

    beforeEach(() => {
      mockCache = {
        get: jest.fn(),
        set: jest.fn(),
        delete: jest.fn(),
        clear: jest.fn(),
      };

      mockEns = {
        getAddress: jest.fn(),
      } as any;

      web3 = new Web3("http://127.0.0.1:8545");
      const plugin = new EnsResolverCachePlugin(mockCache);
      web3.registerPlugin(plugin);

      plugin["ens"] = mockEns;
      web3.eth.requestManager.send = requestManagerSendSpy;
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    test("should return a cached address if it exists", async () => {
      (mockCache.get as jest.Mock).mockReturnValue("0x1234567890abcdef");

      const result = await web3.ensResolverCache.resolveEnsName("example.eth");

      expect(mockCache.get).toHaveBeenCalledWith("example.eth");
      expect(result).toBe("0x1234567890abcdef");
      expect(mockEns.getAddress).not.toHaveBeenCalled();
    });

    test("should resolve and cache the ENS name if not cached", async () => {
      (mockCache.get as jest.Mock).mockReturnValue(null);
      (mockEns.getAddress as jest.Mock).mockResolvedValue("0xabcdef1234567890");

      const result = await web3.ensResolverCache.resolveEnsName("example.eth");

      expect(mockCache.get).toHaveBeenCalledWith("example.eth");
      expect(mockEns.getAddress).toHaveBeenCalledWith("example.eth");
      expect(mockCache.set).toHaveBeenCalledWith(
        "example.eth",
        "0xabcdef1234567890"
      );
      expect(result).toBe("0xabcdef1234567890");
    });

    test("should return null if ENS resolution fails", async () => {
      (mockEns.getAddress as jest.Mock).mockRejectedValue(
        new Error("Resolution failed")
      );

      const result = await web3.ensResolverCache.resolveEnsName("example.eth");

      expect(mockCache.get).toHaveBeenCalledWith("example.eth");
      expect(mockEns.getAddress).toHaveBeenCalledWith("example.eth");
      expect(result).toBeNull();
      expect(mockCache.set).not.toHaveBeenCalled();
    });
  });
});
