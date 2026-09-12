import Link from 'next/link';
import { days, formatDate, sortByUrgency, windowStatus } from '@/lib/dates';
import type { Scholarship } from '@/lib/types';

/**
 * Главный визуальный акцент сайта: отрывная лента вроде посадочного талона.
 * Каждый сегмент — программа, между сегментами перфорация, в сегменте —
 * круглая печать обратного отсчёта с лёгким наклоном, как настоящий оттиск.
 *
 * Единственная анимация на всём сайте: печати «впечатываются» по очереди
 * при первой загрузке. Угол наклона у каждой свой, чтобы не читалось шаблоном.
 */

const TILTS = ['-7deg', '5deg', '-4deg', '8deg', '-6deg', '3deg'];

export function DeadlineStrip({ items }: { items: Scholarship[] }) {
  const sorted = sortByUrgency(items);

  return (
    <div className="-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6">
      <ol className="flex min-w-max border border-ink bg-plate">
        {sorted.map((s, i) => {
          const st = windowStatus(s.windows);
          const isOpen = st.kind === 'open';
          const isClosed = st.kind === 'closed';

          const n = isOpen ? st.daysLeft : st.kind === 'upcoming' ? st.daysUntil : 0;
          const caption = isOpen ? `${days(n)} до закрытия` : st.kind === 'upcoming' ? `${days(n)} до открытия` : 'Сезон закрыт';
          const seal = isOpen || isClosed ? 'border-seal text-seal' : 'border-stamp text-stamp';

          return (
            <li key={s.slug} className="relative w-[15.5rem] shrink-0 sm:w-[17rem]">
              {i > 0 && <span className="perforation absolute inset-y-2 left-0 w-px" aria-hidden />}

              <Link href={`/scholarships/${s.slug}`} className="block h-full p-5 transition-colors hover:bg-paper">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft">{s.country}</p>

                <div className="mt-4 flex justify-center">
                  <span
                    className={`flex h-24 w-24 flex-col items-center justify-center rounded-full border-[2.5px] ${seal} animate-stamp`}
                    style={{
                      // @ts-expect-error — кастомное свойство для keyframes
                      '--stamp-rot': TILTS[i % TILTS.length],
                      animationDelay: `${120 + i * 90}ms`,
                    }}
                  >
                    {isClosed ? (
                      <span className="font-mono text-[0.7rem] uppercase tracking-[0.1em]">закрыт</span>
                    ) : (
                      <>
                        <span className="tabular font-mono text-3xl leading-none">{n}</span>
                        <span className="mt-1 font-mono text-[0.55rem] uppercase tracking-[0.1em]">
                          {isOpen ? 'до конца' : 'до старта'}
                        </span>
                      </>
                    )}
                  </span>
                </div>

                <p className="mt-4 text-sm font-semibold leading-snug text-ink">{s.name}</p>
                <p className="mt-1.5 font-mono text-[0.68rem] leading-relaxed text-ink-soft">
                  {caption}
                </p>
                <p className="mt-2 border-t border-rule pt-2 font-mono text-[0.68rem] text-ink-soft">
                  {isOpen
                    ? `до ${formatDate(st.window.closes)}`
                    : st.kind === 'upcoming'
                      ? `с ${formatDate(st.window.opens)}`
                      : `было до ${formatDate(st.window.closes)}`}
                </p>
              </Link>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
