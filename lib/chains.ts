// app/lib/chains.ts
export type ChainKey =
  | "ethereum"
  | "binance-smart-chain"
  | "polygon-pos"
  | "arbitrum-one"
  | "optimistic-ethereum";

export const CHAINS: {
  key: ChainKey;
  label: string;
  platformId: string;     // CoinGecko platform id (for contract tokens)
  nativeCoinId: string;   // CoinGecko coin id (for native tokens)
}[] = [
  { key: "ethereum",            label: "Ethereum",        platformId: "ethereum",            nativeCoinId: "ethereum" },
  { key: "binance-smart-chain", label: "BNB Smart Chain", platformId: "binance-smart-chain", nativeCoinId: "binancecoin" },
  { key: "polygon-pos",         label: "Polygon",         platformId: "polygon-pos",         nativeCoinId: "matic-network" },
  { key: "arbitrum-one",        label: "Arbitrum One",    platformId: "arbitrum-one",        nativeCoinId: "arbitrum" },
  { key: "optimistic-ethereum", label: "Optimism",        platformId: "optimistic-ethereum", nativeCoinId: "optimism" },
];
