// app/api/coingecko/coin/route.ts
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id"); // e.g. "matic-network", "arbitrum"
  if (!id) {
    return new Response(JSON.stringify({ error: "id required" }), { status: 400 });
  }

  // 只取必需欄位，避免 payload 過大
  const url =
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?` +
    new URLSearchParams({
      localization: "false",
      tickers: "false",
      market_data: "true",
      community_data: "false",
      developer_data: "false",
      sparkline: "false",
    });

  const r = await fetch(url, { next: { revalidate: 30 } }); // 30 秒快取
  if (!r.ok) {
    const text = await r.text();
    return new Response(JSON.stringify({ error: `upstream ${r.status}`, body: text }), { status: r.status });
  }
  const j = await r.json();
  return new Response(JSON.stringify(j), { headers: { "content-type": "application/json" } });
}
