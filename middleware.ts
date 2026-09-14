import { NextResponse, type NextRequest } from 'next/server';
import { ADMIN_COOKIE_NAME, isValidSessionToken } from '@/lib/admin-auth';

/**
 * Всё под /admin, кроме самой страницы входа, требует валидную подписанную
 * куку. Middleware — единственная линия защиты (страницы под /admin сами
 * ничего не проверяют), поэтому проверка стоит здесь, а не дублируется.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === '/admin/login') return NextResponse.next();

  const token = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
  if (await isValidSessionToken(token)) return NextResponse.next();

  const url = req.nextUrl.clone();
  url.pathname = '/admin/login';
  url.search = '';
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
