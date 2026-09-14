import { NextResponse } from 'next/server';
import { ADMIN_COOKIE_MAX_AGE, ADMIN_COOKIE_NAME, checkAdminPassword, createSessionToken } from '@/lib/admin-auth';

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { password?: string } | null;
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!process.env.ADMIN_PASSWORD || !process.env.ADMIN_SESSION_SECRET) {
    return NextResponse.json({ error: 'Админка не настроена: нет ADMIN_PASSWORD или ADMIN_SESSION_SECRET' }, { status: 500 });
  }

  if (!password || !(await checkAdminPassword(password))) {
    return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, await createSessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return res;
}
