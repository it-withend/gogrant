import type { Metadata } from 'next';
import { BarChart3 } from 'lucide-react';
import { getAnalyticsSummary } from '@/lib/analytics';
import { AdminLogoutButton } from '@/components/admin-logout-button';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = { title: 'Аналитика' };

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border-2 border-ink bg-plate p-4">
      <p className="label">{label}</p>
      <p className="tabular mt-1.5 font-mono text-2xl text-ink">{value}</p>
      {sub && <p className="mt-1 font-mono text-[0.68rem] text-ink-soft">{sub}</p>}
    </div>
  );
}

export default async function AdminPage() {
  const stats = await getAnalyticsSummary();

  if (!stats.configured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Аналитика не настроена</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          Нет переменных <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> и{' '}
          <code className="font-mono">SUPABASE_SERVICE_ROLE_KEY</code>. Без Supabase просмотры страниц никуда не
          пишутся, поэтому и показывать нечего — добавь переменные в окружение (см. DEPLOY.md) и выполни{' '}
          <code className="font-mono">supabase/schema.sql</code>, там есть таблица <code className="font-mono">page_views</code>.
        </p>
        <div className="mt-8">
          <AdminLogoutButton />
        </div>
      </div>
    );
  }

  const maxDaily = Math.max(1, ...stats.dailyLast14.map((d) => d.views));

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-ink pb-6">
        <div className="flex items-center gap-2.5">
          <BarChart3 size={20} strokeWidth={1.5} className="text-stamp" />
          <div>
            <p className="label">Видно только тебе</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight">Трафик сайта</h1>
          </div>
        </div>
        <AdminLogoutButton />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="Всего просмотров" value={stats.totalAllTime} sub="за всё время" />
        <StatCard label="За 24 часа" value={stats.last24h.views} sub={`${stats.last24h.visitors} посетителей`} />
        <StatCard label="За 7 дней" value={stats.last7d.views} sub={`${stats.last7d.visitors} посетителей`} />
        <StatCard label="За 30 дней" value={stats.last30d.views} sub={`${stats.last30d.visitors} посетителей`} />
      </div>

      <section className="mt-10">
        <p className="label">Просмотры по дням, последние 14</p>
        <div className="mt-4 flex items-end gap-1.5 border-b border-rule pb-1" style={{ height: '9rem' }}>
          {stats.dailyLast14.map((d) => (
            <div key={d.date} className="group relative flex-1">
              <div
                className="bg-stamp transition-colors group-hover:bg-seal"
                style={{ height: `${Math.max(4, (d.views / maxDaily) * 140)}px` }}
                title={`${d.date}: ${d.views} просмотров, ${d.visitors} посетителей`}
              />
            </div>
          ))}
        </div>
        <div className="mt-1.5 flex gap-1.5 font-mono text-[0.6rem] text-ink-soft">
          {stats.dailyLast14.map((d, i) => (
            <div key={d.date} className="flex-1 text-center">
              {i % 2 === 0 ? d.date.slice(5) : ''}
            </div>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <p className="label">Популярные страницы, 30 дней</p>
          <ol className="mt-3 divide-y divide-rule border-y border-rule">
            {stats.topPaths.length === 0 && <li className="py-3 text-sm text-ink-soft">Пока нет данных</li>}
            {stats.topPaths.map((p, i) => (
              <li key={p.path} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="tabular font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate">{p.path}</span>
                </span>
                <span className="tabular shrink-0 font-mono text-xs text-ink-soft">{p.views}</span>
              </li>
            ))}
          </ol>
        </section>

        <section>
          <p className="label">Откуда приходят, 30 дней</p>
          <ol className="mt-3 divide-y divide-rule border-y border-rule">
            {stats.topReferrers.length === 0 && <li className="py-3 text-sm text-ink-soft">Пока нет данных</li>}
            {stats.topReferrers.map((r, i) => (
              <li key={r.referrer} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                <span className="flex min-w-0 items-center gap-2.5">
                  <span className="tabular font-mono text-xs text-ink-soft">{String(i + 1).padStart(2, '0')}</span>
                  <span className="truncate">{r.referrer}</span>
                </span>
                <span className="tabular shrink-0 font-mono text-xs text-ink-soft">{r.views}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="mt-10 border-t border-rule pt-5 font-mono text-xs leading-relaxed text-ink-soft">
        Считаются просмотры страниц через случайный id в куке первого лица — без IP и без user-agent. Страница за
        паролем и не индексируется поисковиками.
      </p>
    </div>
  );
}
