# Cross-Chain DeFi Dashboard

A lightweight **Next.js (TypeScript)** dashboard that demonstrates:
- Reading **native balances** across multiple EVM chains using public RPCs (no key needed)
- Fetching **native token USD prices** from **Coingecko** via a small serverless proxy
- Requesting **cross-chain quotes** via **LI.FI** public quote API (serverless proxy included)
- A simple, illustrative **ROI** calculator block suitable for interviews / demos

> Built for showcasing Web3 integration skills for DevRel / BD / Tech roles.  
> Author: **Leon Liu** (General Manager @ BuckChaf Ltd.)

---

## ✨ Features

- **Wallet Connect (MetaMask)**: Requests accounts and reads balances via public RPCs
- **Multi-chain Portfolio**: Ethereum, Polygon, Arbitrum, BSC native balances + USD valuation
- **Cross-Chain Quote (LI.FI)**: From/To chain & token selectors using a minimal token registry
- **Serverless API Proxies**:
  - `GET /api/coingecko/prices?ids=ethereum,polygon-pos,...`
  - `POST /api/lifi/quote` (forwards query params to `https://li.quest/v1/quote`)
- **Zero-config**: No API keys required to try the core demo locally
- **Deploy-ready**: Works on Vercel out of the box

---

## 🧱 Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Ethers v6** for RPC balances
- **Coingecko** Simple Price API (proxied)
- **LI.FI** Quote API (proxied)
- **Zod** (installed for potential input validation; optional)

---

## 🚀 Quick Start

```bash
# 1) Clone
git clone https://github.com/<YOUR_GH_USERNAME>/CrossChain-DeFi-Dashboard.git
cd CrossChain-DeFi-Dashboard

# 2) Install deps
npm i

# 3) Run locally
npm run dev
# Visit http://localhost:3000
```

> MetaMask is optional for viewing the UI, but **required** to fetch your wallet balances.  
> If you do not have MetaMask installed, you can still try the **LI.FI quote** and ROI calculator.

---

## 🔧 Configuration

- **Token Registry**: `lib/token-registry.json` maps a few base tokens for each supported chain.  
  Extend it with more tokens as needed (contract addresses per chain).

- **Chains**: `lib/chains.ts` contains chain IDs, RPC endpoints, and Coingecko IDs.  
  Add more chains as required.

- **Optional API Keys**: `.env.example` lists optional keys if you later add premium providers.  
  For this demo, core features **do not** require keys.

---

## 🧪 How to Demo (Interview Script)

1. **Connect MetaMask** → native balances appear for ETH / MATIC / BNB / Arbitrum ETH
2. **Explain Coingecko proxy** → pricing cached for 60s server-side
3. **Run a LI.FI quote**: pick a from/to chain pair, select tokens, enter an amount (e.g. 0.1 WETH → USDC), press **Get Quote**
4. **Discuss Extensions** (see below) to show roadmap thinking

---

## 🗺️ Roadmap / Extensions (Great for PRs)

- ERC-20 balance reader with a **tokenlist** (decimals + symbols)
- **USD conversion** of LI.FI results (parse decimals)
- **WalletKit** integration (wagmi/rainbowkit) if desired
- **PnL analytics** and **CSV export**
- **Persisted user settings** (localStorage) and address book
- **Bridge fee visualization** (incl. gas, protocol fees)

---

## 📦 Deploy (Vercel)

1. Create a new project from this repository in [Vercel].
2. No special build settings are required (uses `next build` by default).
3. Deploy, then share your live URL in your resume / applications.

---

## 📝 License

MIT © 2025 Leon Liu
