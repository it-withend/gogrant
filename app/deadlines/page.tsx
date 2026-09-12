import type { Metadata } from 'next';
import Link from 'next/link';
import { DeadlineStrip } from '@/components/deadline-strip';
import { PageHeader } from '@/components/ui';
import { getScholarships } from '@/lib/data';
import { MONTHS_SHORT, days, formatDate, sortByUrgency, windowStatus } from '@/lib/dates';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Дедлайны',
  description: 'Календарь подачи на все программы сразу: когда открывается приём и сколько дней осталось.',
};

/** Индекс месяца открытия/закрытия для годовой шкалы. */
function monthIndex(iso: string) {
  return new Date(iso + 'T00:00:00Z').getUTCMonth();
}

export default async function DeadlinesPage() {
  const list = sortByUrgency(await getScholarships());

  return (
    <>
      <PageHeader
        mark="03"
        title="Календарь подачи"
        lead="Почти все окна приходятся на ноябрь–апрель. Если наложить их друг на друга, видно, что документы нужно собрать до зимы — иначе будешь бегать с апостилем в разгар сезона."
      />

      <section className="border-b border-rule bg-plate/50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <h2 className="text-lg font-bold">Обратный отсчёт</h2>
          <div className="mt-6">
            <DeadlineStrip items={list} />
          </div>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-lg font-bold">Весь год целиком</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Полоса показывает месяцы, в которые окно обычно открыто. Даты сдвигаются на пару недель год от года, но
            месяцы держатся стабильно.
          </p>

          <div className="mt-8 overflow-x-auto">
            <div className="min-w-[46rem]">
              <div className="grid grid-cols-[11rem_repeat(12,1fr)] border-b border-rule pb-2">
                <span className="label">Программа</span>
                {MONTHS_SHORT.map((m) => (
                  <span key={m} className="text-center font-mono text-[0.65rem] text-ink-soft">
                    {m}
                  </span>
                ))}
              </div>

              {list.map((s) => {
                const w = s.windows[0];
                const start = monthIndex(w.opens);
                const end = monthIndex(w.closes);
                // Окно может переходить через новый год (ноябрь → январь)
                const wraps = end < start;

                const cells = Array.from({ length: 12 }, (_, m) =>
                  wraps ? m >= start || m <= end : m >= start && m <= end,
                );

                return (
                  <div key={s.slug} className="grid grid-cols-[11rem_repeat(12,1fr)] items-center border-b border-rule py-2.5">
                    <Link href={`/scholarships/${s.slug}`} className="pr-3 text-sm hover:text-stamp">
                      <span className="font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
                        {s.country}
                      </span>
                      <span className="block truncate font-medium">{s.name}</span>
                    </Link>

                    {cells.map((active, m) => (
                      <span key={m} className="px-0.5">
                        <span className={`block h-5 border ${active ? 'border-stamp bg-stamp/15' : 'border-transparent bg-paper'}`} />
                      </span>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <h2 className="text-lg font-bold">Даты по программам</h2>

          <div className="mt-6 border-t border-rule">
            {list.map((s) => {
              const st = windowStatus(s.windows);
              return (
                <div key={s.slug} className="border-b border-rule py-5 sm:grid sm:grid-cols-[1fr_14rem_10rem] sm:gap-6">
                  <div>
                    <Link href={`/scholarships/${s.slug}`} className="text-sm font-bold hover:text-stamp">
                      {s.name}
                    </Link>
                    <p className="mt-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink-soft">{s.country}</p>
                    {s.windows[0].note && (
                      <p className="mt-2 max-w-lg text-xs leading-relaxed text-ink-soft">{s.windows[0].note}</p>
                    )}
                  </div>

                  <p className="tabular mt-3 font-mono text-xs text-ink sm:mt-0">
                    {formatDate(s.windows[0].opens)}
                    <span className="block text-ink-soft">до {formatDate(s.windows[0].closes)}</span>
                  </p>

                  <p className="mt-2 font-mono text-xs sm:mt-0 sm:text-right">
                    {st.kind === 'open' && <span className="text-seal">осталось {days(st.daysLeft)}</span>}
                    {st.kind === 'upcoming' && <span className="text-stamp">через {days(st.daysUntil)}</span>}
                    {st.kind === 'closed' && <span className="text-ink-soft">сезон закрыт</span>}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
