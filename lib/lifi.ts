// /app/lib/lifi.ts
import { createConfig } from '@lifi/sdk';

/**
 * 基礎 SDK 設定
 * - integrator：LI.FI SDK DEMO（例如公司名 / 專案名）
 * - 可以在此加上白名單、抽成費率、RPC、slippage 等 routeOptions
 */
export const lifi = createConfig({
  integrator: 'CrossChain-DeFi-Dashboard',
  // routeOptions: {
  //   slippage: 0.005, // 0.5%
  //   allowChains: [1, 137, 42161, 10, 8453], // 限定支援鏈
  //   fee: { integrator: 'CrossChain-DeFi-Dashboard', fee: 0.0005 }, // 0.05% 抽成
  // },
});
