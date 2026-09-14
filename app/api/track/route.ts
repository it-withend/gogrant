import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { getSupabase } from '@/lib/supabase';

const SESSION_COOKIE = 'av_sid';

/**
 * Приём одного события «просмотр страницы». Никогда не должен ронять сайт:
 * при отсутствии Supabase или ошибке записи просто отвечает 204, без деталей
 * наружу. Идентификатор посетителя — случайный id в куке первого лица, без
 * IP и user-agent: для счётчика «сколько людей заходило» этого достаточно.
 */
export async function POST(req: Request) {
  try {
    const db = getSupabase();
    if (!db) return new NextResponse(null, { status: 204 });

    const body = (await req.json().catch(() => null)) as { path?: string; referrer?: string } | null;
    const path = typeof body?.path === 'string' ? body.path.slice(0, 512) : '/';
    const referrer = typeof body?.referrer === 'string' ? body.referrer.slice(0, 512) || null : null;

    const existing = req.headers.get('cookie')?.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`))?.[1];
    const sessionId = existing || randomUUID();

    await db.from('page_views').insert({ path, referrer, session_id: sessionId });

    const res = new NextResponse(null, { status: 204 });
    if (!existing) {
      res.cookies.set(SESSION_COOKIE, sessionId, {
        maxAge: 60 * 60 * 24 * 365,
        sameSite: 'lax',
        path: '/',
      });
    }
    return res;
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
