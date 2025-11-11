'use client';

import { useEffect, useMemo, useState } from 'react';
import { ethers } from 'ethers';
import { CHAINS, findChain } from '@/lib/chains';
import { fmt } from '@/lib/format';
import tokenRegistry from '@/lib/token-registry.json';

type QuoteReq = {
  fromChain: number;
  toChain: number;
  fromToken: string;
  toToken: string;
  fromAmount: string; // in wei
};

type QuoteRes = {
  estimate?: {
    feeCosts?: { amount: string; token?: { symbol?: string } }[];
    toAmount?: string;
  };
  error?: string;
};

export default function Home() {
  const [account, setAccount] = useState<string | null>(null);
  const [nativePrices, setNativePrices] = useState<Record<number, number>>({});
  const [balances, setBalances] = useState<Record<number, number>>({}); // in ETH/BNB/MATIC units
  const [quote, setQuote] = useState<QuoteRes | null>(null);

  const [fromChainId, setFromChainId] = useState(1);
  const [toChainId, setToChainId] = useState(137);
  const [fromSymbol, setFromSymbol] = useState('WETH');
  const [toSymbol, setToSymbol] = useState('USDC');
  const [amount, setAmount] = useState('0.1');

  const fromToken = (tokenRegistry as any)[fromChainId]?.[fromSymbol];
  const toToken = (tokenRegistry as any)[toChainId]?.[toSymbol];

  // Connect wallet (MetaMask) client-side
  const connect = async () => {
    const { ethereum } = window as any;
    if (!ethereum) {
      alert('MetaMask not detected. Install it to enable wallet features.');
      return;
    }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    setAccount(accounts[0]);
  };

  // Fetch native prices via /api/coingecko
  useEffect(() => {
    const ids = CHAINS.map(c => c.coingeckoId).join(',');
    fetch(`/api/coingecko/prices?ids=${ids}`)
      .then(r => r.json())
      .then((data) => {
        const map: Record<number, number> = {};
        CHAINS.forEach(c => {
          const usd = data[c.coingeckoId]?.usd ?? 0;
          map[c.id] = usd;
        });
        setNativePrices(map);
      })
      .catch(() => {});
  }, []);

  // Read native balances from public RPCs
  useEffect(() => {
    (async () => {
      if (!account) return;
      const results: Record<number, number> = {};
      for (const chain of CHAINS) {
        try {
          const provider = new ethers.JsonRpcProvider(chain.rpc);
          const balWei = await provider.getBalance(account);
          const bal = Number(ethers.formatEther(balWei));
          results[chain.id] = bal;
        } catch (e) {
          results[chain.id] = 0;
        }
      }
      setBalances(results);
    })();
  }, [account]);

  const portfolioRows = useMemo(() => {
    return CHAINS.map(c => {
      const bal = balances[c.id] ?? 0;
      const price = nativePrices[c.id] ?? 0;
      const usd = bal * price;
      return { chain: c.name, symbol: c.nativeSymbol, bal, price, usd };
    });
  }, [balances, nativePrices]);

  const totalUsd = portfolioRows.reduce((acc, r) => acc + r.usd, 0);

  const requestQuote = async () => {
    if (!fromToken || !toToken) {
      alert('Token not found in registry');
      return;
    }
    const req: QuoteReq = {
      fromChain: fromChainId,
      toChain: toChainId,
      fromToken,
      toToken,
      fromAmount: ethers.parseUnits(amount, 18).toString()
    };
    const r = await fetch('/api/lifi/quote', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(req)
    });
    const data = await r.json();
    setQuote(data);
  };

  return (
    <div className="grid" style={{ gap: 24 }}>
      <header className="grid grid-2" style={{ alignItems: 'center' }}>
        <div>
          <h1>Cross-Chain DeFi Dashboard</h1>
          <div className="label">Portfolio overview • Cross-chain quote • Simple ROI</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          {account ? (
            <div className="badge">
              Connected: <small className="mono">{account.slice(0, 6)}…{account.slice(-4)}</small>
            </div>
          ) : (
            <button className="btn" onClick={connect}>Connect MetaMask</button>
          )}
        </div>
      </header>

      <section className="card">
        <h2>Portfolio (Native Balances)</h2>
        {!account && <div className="label">Connect wallet to fetch balances from public RPCs.</div>}
        <table className="table">
          <thead>
            <tr><th>Chain</th><th>Balance</th><th>Price (USD)</th><th>Value (USD)</th></tr>
          </thead>
          <tbody>
            {portfolioRows.map((r) => (
              <tr key={r.chain}>
                <td>{r.chain} <span className="badge">{r.symbol}</span></td>
                <td>{fmt(r.bal)}</td>
                <td>${fmt(r.price, 2)}</td>
                <td>${fmt(r.usd, 2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <th>Total</th><th></th><th></th><th>${fmt(totalUsd, 2)}</th>
            </tr>
          </tfoot>
        </table>
        <small className="label">Tip: Add your own token balance readers using ERC-20 ABI for deeper portfolio analytics.</small>
      </section>

      <section className="card">
        <h2>Cross-Chain Quote (LI.FI)</h2>
        <div className="grid grid-2">
          <div>
            <label className="label">From Chain</label>
            <select className="select" value={fromChainId} onChange={e => setFromChainId(Number(e.target.value))}>
              {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">To Chain</label>
            <select className="select" value={toChainId} onChange={e => setToChainId(Number(e.target.value))}>
              {CHAINS.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div>
            <label className="label">From Token (symbol)</label>
            <select className="select" value={fromSymbol} onChange={e => setFromSymbol(e.target.value)}>
              {Object.keys((tokenRegistry as any)[fromChainId] || {}).map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">To Token (symbol)</label>
            <select className="select" value={toSymbol} onChange={e => setToSymbol(e.target.value)}>
              {Object.keys((tokenRegistry as any)[toChainId] || {}).map(sym => (
                <option key={sym} value={sym}>{sym}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-2" style={{ marginTop: 12 }}>
          <div>
            <label className="label">From Amount</label>
            <input className="input" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}>
            <button className="btn" onClick={requestQuote}>Get Quote</button>
          </div>
        </div>

        {quote && (
          <div style={{ marginTop: 12 }}>
            {quote.error ? (
              <div className="label">Error: {quote.error}</div>
            ) : (
              <div>
                <div className="label">Estimated Fees</div>
                <ul>
                  {quote.estimate?.feeCosts?.map((f, i) => (
                    <li key={i}>
                      {f.amount} {f.token?.symbol ?? ""}
                    </li>
                  ))}
                </ul>
                <div className="label">To Amount (approx.)</div>
                <div className="badge">{quote.estimate?.toAmount}</div>
                <small className="label">Values are raw on-chain units; convert using token decimals for display.</small>
              </div>
            )}
          </div>
        )}
      </section>

      <section className="card">
        <h2>Simple ROI (Illustrative)</h2>
        <p className="label">Enter hypothetical initial capital and current value to compute ROI.</p>
        <RoiCard />
      </section>

      <footer>
        Built by Leon Liu • Next.js + Ethers + LI.FI + Coingecko • MIT
      </footer>
    </div>
  );
}

function RoiCard() {
  const [initial, setInitial] = useState('1000');
  const [current, setCurrent] = useState('1200');
  const roi = useMemo(() => {
    const a = Number(initial || 0);
    const b = Number(current || 0);
    if (a <= 0) return 0;
    return ((b - a) / a) * 100;
  }, [initial, current]);
  return (
    <div className="grid grid-2">
      <div>
        <label className="label">Initial (USD)</label>
        <input className="input" value={initial} onChange={e => setInitial(e.target.value)} />
      </div>
      <div>
        <label className="label">Current (USD)</label>
        <input className="input" value={current} onChange={e => setCurrent(e.target.value)} />
      </div>
      <div style={{ gridColumn: '1 / -1', marginTop: 8 }}>
        <div className="badge">ROI: {roi.toFixed(2)}%</div>
      </div>
    </div>
  );
}
