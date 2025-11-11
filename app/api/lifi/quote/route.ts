import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    const url = new URL('https://li.quest/v1/quote');
    Object.entries(payload).forEach(([k, v]) => {
      if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
    });
    const r = await fetch(url.toString(), { cache: 'no-store' });
    const data = await r.json();
    return NextResponse.json(data);
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || 'failed' }, { status: 500 });
  }
}
