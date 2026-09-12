import { scholarships as localScholarships } from '@/data/scholarships';
import { guides as localGuides } from '@/data/guides';
import { getSupabase } from '@/lib/supabase';
import type { Guide, Scholarship } from '@/lib/types';

/**
 * Единая точка доступа к данным.
 *
 * Если Supabase подключён — читаем оттуда. Если нет или запрос упал —
 * молча откатываемся на файлы в /data, чтобы сайт не падал целиком из-за
 * недоступной базы. Ошибку при этом пишем в лог сервера.
 */

export async function getScholarships(): Promise<Scholarship[]> {
  const db = getSupabase();
  if (!db) return localScholarships;

  const { data, error } = await db.from('scholarships').select('*').order('country');

  if (error || !data?.length) {
    if (error) console.error('[supabase] scholarships:', error.message);
    return localScholarships;
  }
  return data as Scholarship[];
}

export async function getScholarship(slug: string): Promise<Scholarship | null> {
  const all = await getScholarships();
  return all.find((s) => s.slug === slug) ?? null;
}

export async function getGuides(): Promise<Guide[]> {
  const db = getSupabase();
  if (!db) return localGuides;

  const { data, error } = await db.from('guides').select('*').order('updated_at', { ascending: false });

  if (error || !data?.length) {
    if (error) console.error('[supabase] guides:', error.message);
    return localGuides;
  }
  return data as Guide[];
}

export async function getGuide(slug: string): Promise<Guide | null> {
  const all = await getGuides();
  return all.find((g) => g.slug === slug) ?? null;
}
