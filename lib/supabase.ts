import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Клиент создаётся только если заданы обе переменные окружения.
 * Если базы нет — весь сайт работает на статических данных из /data.
 * Это сделано намеренно: локально можно запустить проект без Supabase.
 */
let cached: SupabaseClient | null | undefined;

export function getSupabase(): SupabaseClient | null {
  if (cached !== undefined) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  cached = url && key ? createClient(url, key) : null;
  return cached;
}

export const hasSupabase = () => getSupabase() !== null;
