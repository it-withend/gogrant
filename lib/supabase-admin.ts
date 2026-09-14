import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Клиент с service role ключом — обходит RLS. Только для серверного кода
 * (route handlers, server components), никогда не импортируется в клиентские
 * компоненты. Используется единственный раз: чтение статистики на /admin.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabaseAdmin(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  cached = url && key ? createClient(url, key, { auth: { persistSession: false } }) : null;
  return cached;
}
