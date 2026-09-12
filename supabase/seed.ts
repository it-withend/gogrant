/**
 * Загрузка начальных данных в Supabase.
 *
 *   1. Прогони supabase/schema.sql в SQL Editor.
 *   2. Положи в .env.local:
 *        NEXT_PUBLIC_SUPABASE_URL=...
 *        SUPABASE_SERVICE_ROLE_KEY=...
 *   3. npm run seed
 *
 * Скрипт идемпотентен: повторный запуск обновляет строки по slug, а не
 * плодит дубли. Служебный ключ используется только здесь и в браузер
 * никогда не попадает.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { scholarships } from '../data/scholarships';
import { guides } from '../data/guides';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Нет NEXT_PUBLIC_SUPABASE_URL или SUPABASE_SERVICE_ROLE_KEY. Проверь .env.local');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

async function main() {
  console.log(`Загружаю ${scholarships.length} стипендий...`);
  const { error: sErr } = await db.from('scholarships').upsert(scholarships, { onConflict: 'slug' });
  if (sErr) throw new Error(`scholarships: ${sErr.message}`);

  console.log(`Загружаю ${guides.length} гайдов...`);
  const { error: gErr } = await db.from('guides').upsert(guides, { onConflict: 'slug' });
  if (gErr) throw new Error(`guides: ${gErr.message}`);

  const [{ count: sCount }, { count: gCount }] = await Promise.all([
    db.from('scholarships').select('*', { count: 'exact', head: true }),
    db.from('guides').select('*', { count: 'exact', head: true }),
  ]);

  console.log(`Готово. В базе: ${sCount} стипендий, ${gCount} гайдов.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
