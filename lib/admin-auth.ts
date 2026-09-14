/**
 * Сессия админки без базы и без пользовательской системы аутентификации:
 * подписанный токен `expiresAt.signature` в httpOnly-куке. Секрет —
 * ADMIN_SESSION_SECRET, задаётся отдельно от пароля входа, чтобы смена
 * пароля не аннулировала уже выданные сессии сама по себе.
 *
 * Подпись — через Web Crypto (`crypto.subtle`), а не через модуль Node
 * `crypto`: этот файл импортируется и в middleware (edge-совместимый рантайм),
 * и в route handler (Node), а subtle-crypto работает одинаково в обоих.
 */
const COOKIE_NAME = 'admin_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 14; // 14 дней

async function hmac(key: string, payload: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-256' }, false, [
    'sign',
  ]);
  const sig = await crypto.subtle.sign('HMAC', cryptoKey, enc.encode(payload));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** Сравнение за постоянное время: длина проверяется отдельно, дальше — без ранних выходов. */
function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function createSessionToken(): Promise<string> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('ADMIN_SESSION_SECRET не задан');

  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);
  return `${payload}.${await hmac(secret, payload)}`;
}

export async function isValidSessionToken(token: string | undefined | null): Promise<boolean> {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!token || !secret) return false;

  const [payload, sig] = token.split('.');
  if (!payload || !sig) return false;

  const expected = await hmac(secret, payload);
  if (!timingSafeEqualStr(sig, expected)) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}

export async function checkAdminPassword(input: string): Promise<boolean> {
  const real = process.env.ADMIN_PASSWORD;
  if (!real) return false;
  return timingSafeEqualStr(input, real);
}

export const ADMIN_COOKIE_NAME = COOKIE_NAME;
export const ADMIN_COOKIE_MAX_AGE = MAX_AGE_SECONDS;
