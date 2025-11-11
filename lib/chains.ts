export type ChainInfo = { id: number; name: string; rpc: string; nativeSymbol: string; coingeckoId: string };
export const CHAINS: ChainInfo[] = [
  { id: 1, name: "Ethereum", rpc: "https://cloudflare-eth.com", nativeSymbol: "ETH", coingeckoId: "ethereum" },
  { id: 137, name: "Polygon", rpc: "https://polygon-rpc.com", nativeSymbol: "MATIC", coingeckoId: "polygon-pos" },
  { id: 42161, name: "Arbitrum", rpc: "https://arb1.arbitrum.io/rpc", nativeSymbol: "ETH", coingeckoId: "arbitrum-one" },
  { id: 56, name: "BSC", rpc: "https://bsc-dataseed.binance.org", nativeSymbol: "BNB", coingeckoId: "binancecoin" }
];
export const findChain = (id: number) => CHAINS.find(c => c.id === id);
