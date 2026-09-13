import Link from 'next/link';
import { days, formatDate, sortByUrgency, windowStatus } from '@/lib/dates';
import type { Scholarship } from '@/lib/types';

/**
 * Главный визуальный акцент сайта: лента как табло на вокзале. Каждый
 * сегмент — программа, число дней залито сплошным цветом на весь блок —
 * никаких кругов и наклона, только жёсткий прямоугольник и крупная цифра.
 *
 * Единственная анимация на всём сайте: блоки «включаются» по очереди при
 * первой загрузке, как лампы табло.
 */

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
          const block = isClosed ? 'border-2 border-rule text-ink-soft' : isOpen ? 'bg-seal text-paper' : 'bg-ink text-paper';

          return (
            <li key={s.slug} className="relative w-[15.5rem] shrink-0 sm:w-[17rem]">
              {i > 0 && <span className="perforation absolute inset-y-2 left-0 w-px" aria-hidden />}

              <Link href={`/scholarships/${s.slug}`} className="block h-full p-5 transition-colors hover:bg-paper">
                <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft">{s.country}</p>

                <div className="mt-4 flex justify-center">
                  <span
                    className={`flex h-24 w-24 flex-col items-center justify-center animate-stamp ${block}`}
                    style={{ animationDelay: `${120 + i * 90}ms` }}
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
