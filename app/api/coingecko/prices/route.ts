import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const ids = searchParams.get('ids') || 'ethereum';
  const url = `https://api.coingecko.com/api/v3/simple/price?vs_currencies=usd&ids=${encodeURIComponent(ids)}`;

  try {
    const r = await fetch(url, { next: { revalidate: 60 } });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
