'use client';

import { useMemo, useState } from 'react';
import { getRoutes, executeRoute } from '@lifi/sdk';
import { lifi } from '@/app/lib/lifi';

type ChainOption = { id: number; label: string };

const CHAINS: ChainOption[] = [
  { id: 1, label: 'Ethereum' },
  { id: 137, label: 'Polygon' },
  { id: 42161, label: 'Arbitrum' },
  { id: 10, label: 'Optimism' },
  { id: 8453, label: 'Base' },
];

const ETH_ZERO = '0x0000000000000000000000000000000000000000';
const USDC_POLYGON = '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174';

// 把 0.1 類似字串轉成 wei（簡化版）
function toWeiDecimal(amount: string, decimals = 18): string {
  const [i, f = ''] = amount.split('.');
  const fi = BigInt(i || '0');
  const ff = BigInt((f.padEnd(decimals, '0').slice(0, decimals) || '0'));
  return (fi * (10n ** BigInt(decimals)) + ff).toString();
}

function formatUSD(n?: number) {
  if (n == null) return '-';
  try { return '$' + n.toLocaleString(); } catch { return `$${n}`; }
}

export default function BridgePage() {
  const [fromChain, setFromChain] = useState<number>(1);
  const [toChain, setToChain] = useState<number>(137);
  const [fromToken, setFromToken] = useState<string>(ETH_ZERO);
  const [toToken, setToToken] = useState<string>(USDC_POLYGON);
  const [amount, setAmount] = useState<string>('0.1');

  const [loading, setLoading] = useState(false);
  const [routes, setRoutes] = useState<any[]>([]);
  const [log, setLog] = useState<string>('Ready');
  const [error, setError] = useState<string | null>(null);

  const valid = useMemo(() => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return false;
    return !!fromChain && !!toChain && !!fromToken && !!toToken;
  }, [amount, fromChain, toChain, fromToken, toToken]);

  async function fetchRoutes() {
    if (!valid) return;
    setLoading(true);
    setError(null);
    setRoutes([]);
    setLog('Fetching routes from LI.FI ...');
    try {
      const fromAmount = toWeiDecimal(amount, 18);
      const res = await getRoutes({
        fromChainId: fromChain,
        toChainId: toChain,
        fromTokenAddress: fromToken,
        toTokenAddress: toToken,
        fromAmount,
      });
      setRoutes(res.routes || []);
      setLog(`Found ${res.routes?.length || 0} routes.`);
    } catch (e: any) {
      setError(e?.message || 'Failed to get routes');
      setLog('Failed to get routes');
    } finally {
      setLoading(false);
    }
  }

  async function ensureWallet(chainId: number) {
    const eth = (window as any).ethereum;
    if (!eth) throw new Error('No wallet found (MetaMask/Rabby)');
    await eth.request({ method: 'eth_requestAccounts' });
    const hex = '0x' + chainId.toString(16);
    try {
      await eth.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: hex }] });
    } catch {
      throw new Error('Please switch to correct chain manually.');
    }
    return eth;
  }

  async function run(idx: number) {
    setLoading(true);
    setError(null);
    setLog('Executing route...');
    try {
      const route = routes[idx];
      if (!route) throw new Error('No route selected');
      await ensureWallet(fromChain);
      await executeRoute({ route });
      setLog('Route executed! Check your wallet or explorer.');
    } catch (e: any) {
      setError(e?.message || 'Execution failed');
      setLog('Execution failed.');
    } finally {
      setLoading(false);
    }
  }

  function jumperPrefillURL() {
    const amt = amount || '0';
    const ft = fromToken === ETH_ZERO ? 'ETH' : fromToken;
    const tt = toToken;
    return `https://jumper.exchange/swap/${ft}:${fromChain}-${tt}:${toChain}?fromAmount=${encodeURIComponent(amt)}`;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">LI.FI Cross-Chain Swap / Bridge</h1>
      <p className="text-sm text-gray-400">
        範例：輸入金額、選擇鏈與代幣 → LI.FI SDK 會回傳最佳路由供執行。
        若執行失敗，可用 Jumper（官方）備援。
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <label className="space-y-1">
          <div className="text-sm text-gray-400">From Chain</div>
          <select
            className="w-full px-3 py-2 rounded-xl bg-gray-900 ring-1 ring-white/10"
            value={fromChain}
            onChange={(e) => setFromChain(Number(e.target.value))}
          >
            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="space-y-1">
          <div className="text-sm text-gray-400">To Chain</div>
          <select
            className="w-full px-3 py-2 rounded-xl bg-gray-900 ring-1 ring-white/10"
            value={toChain}
            onChange={(e) => setToChain(Number(e.target.value))}
          >
            {CHAINS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="space-y-1 sm:col-span-2">
          <div className="text-sm text-gray-400">Amount (From Token)</div>
          <input
            className="w-full px-3 py-2 rounded-xl bg-gray-900 ring-1 ring-white/10"
            placeholder="0.1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={fetchRoutes}
          disabled={!valid || loading}
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-50"
        >
          {loading ? 'Loading...' : 'Get Routes'}
        </button>

        <a
          href={jumperPrefillURL()}
          target="_blank"
          rel="noreferrer"
          className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20"
        >
          Open in Jumper
        </a>
      </div>

      {!!routes.length && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Found Routes</h2>
          <ul className="space-y-3">
            {routes.map((r, i) => {
              const gasUSD = r.gasCostUSD ?? r.fees?.totalFeesInUsd;
              const fromUSD = r.fromAmountUSD ?? r.estimate?.fromAmountUSD;
              const toUSD = r.toAmountUSD ?? r.estimate?.toAmountUSD;
              const duration = r.estimate?.executionDuration ?? 0;

              return (
                <li key={i} className="p-3 rounded-2xl bg-gray-900 ring-1 ring-white/10">
                  <div className="text-sm text-gray-400">Steps: {r.steps?.length || 0}</div>
                  <div className="text-sm">From ≈ {formatUSD(Number(fromUSD))} → To ≈ {formatUSD(Number(toUSD))}</div>
                  <div className="text-sm">Gas: {formatUSD(Number(gasUSD))} · Est. {duration}s</div>
                  <button
                    className="mt-2 px-3 py-1 text-sm rounded bg-white/10 hover:bg-white/20"
                    onClick={() => run(i)}
                    disabled={loading}
                  >
                    Execute with SDK
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <div className="text-xs text-gray-400 whitespace-pre-wrap">{log}</div>
      {error && <div className="text-xs text-red-400">Error: {error}</div>}
    </div>
  );
}
