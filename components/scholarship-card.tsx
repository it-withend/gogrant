import Link from 'next/link';
import { CalendarClock, Plane, Wallet } from 'lucide-react';
import { BarePhoto } from '@/components/photo';
import { days, formatDate, windowStatus } from '@/lib/dates';
import { Chip, CountryMark, CoverageBadge } from '@/components/ui';
import type { Scholarship } from '@/lib/types';

/** Обычная карточка сетки: фото сверху, данные под ним. */
export function ScholarshipCard({ s }: { s: Scholarship }) {
  const st = windowStatus(s.windows);
  const req = s.requirements;

  return (
    <article className="plate group flex flex-col transition-colors hover:border-ink">
      <div className="relative aspect-[16/10] overflow-hidden border-b border-rule">
        <BarePhoto country={s.country_code} width={600} className="h-full w-full object-cover" />
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <span className="bg-plate">
            <CountryMark code={s.country_code} size="sm" />
          </span>
          <span className="bg-plate/95 px-2 py-1 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink">
            {s.country}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5">
        <CoverageBadge coverage={s.coverage} />

        <h3 className="mt-3 text-lg font-bold leading-snug">
          <Link href={`/scholarships/${s.slug}`} className="group-hover:text-stamp">
            {s.name}
          </Link>
        </h3>

        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.coverage_summary}</p>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {req.age_max && <Chip>до {req.age_max} лет</Chip>}
          {req.gpa_min_5 && <Chip>балл от {req.gpa_min_5.toFixed(2)}</Chip>}
          {req.languages.slice(0, 1).map((l) => (
            <Chip key={l.lang}>
              {l.lang}: {l.level}
            </Chip>
          ))}
        </div>

        <div className="mt-auto flex items-start gap-2 border-t border-rule pt-3">
          <CalendarClock size={14} strokeWidth={1.5} className="mt-0.5 shrink-0 text-ink-soft" />
          <p className="font-mono text-[0.7rem] leading-relaxed">
            {st.kind === 'open' && (
              <span className="text-seal">
                Приём идёт, {days(st.daysLeft)} до {formatDate(st.window.closes)}
              </span>
            )}
            {st.kind === 'upcoming' && (
              <span className="text-ink-soft">
                Откроется {formatDate(st.window.opens)}, через {days(st.daysUntil)}
              </span>
            )}
            {st.kind === 'closed' && <span className="text-ink-soft">Даты нового сезона пока не объявлены</span>}
          </p>
        </div>
      </div>
    </article>
  );
}

/**
 * Широкая карточка для первой программы в списке. Ломает однородную сетку:
 * фото слева на всю высоту, данные справа в две колонки.
 */
export function ScholarshipCardWide({ s }: { s: Scholarship }) {
  const st = windowStatus(s.windows);
  const budget = s.budget;
  const startMin = budget.visa.amount_usd_min + budget.flight.amount_usd_min + budget.first_month.amount_usd_min;
  const startMax = budget.visa.amount_usd_max + budget.flight.amount_usd_max + budget.first_month.amount_usd_max;

  return (
    <article className="plate group grid overflow-hidden transition-colors hover:border-ink md:grid-cols-[minmax(0,17rem)_1fr] lg:grid-cols-[minmax(0,22rem)_1fr]">
      <div className="relative aspect-[16/10] border-b border-rule md:aspect-auto md:border-b-0 md:border-r">
        <BarePhoto country={s.country_code} width={800} className="h-full w-full object-cover" priority />
      </div>

      <div className="p-6 sm:p-7">
        <div className="flex flex-wrap items-center gap-3">
          <CountryMark code={s.country_code} />
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft">{s.country}</span>
          <CoverageBadge coverage={s.coverage} />
        </div>

        <h3 className="mt-4 text-2xl font-bold leading-tight tracking-tight">
          <Link href={`/scholarships/${s.slug}`} className="group-hover:text-stamp">
            {s.name}
          </Link>
        </h3>

        <p className="mt-3 max-w-xl text-[0.95rem] leading-relaxed text-ink-soft">{s.coverage_summary}</p>

        <dl className="mt-6 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          <div className="bg-paper p-3.5">
            <dt className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
              <CalendarClock size={12} strokeWidth={1.5} />
              Приём
            </dt>
            <dd className="tabular mt-1.5 font-mono text-sm text-ink">
              {st.kind === 'open' ? `осталось ${days(st.daysLeft)}` : st.kind === 'upcoming' ? formatDate(st.window.opens).replace(/ \d{4}$/, '') : 'не объявлен'}
            </dd>
          </div>
          <div className="bg-paper p-3.5">
            <dt className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
              <Wallet size={12} strokeWidth={1.5} />
              Стипендия
            </dt>
            <dd className="mt-1.5 text-sm leading-snug text-ink">{s.stipend_note.split(',')[0]}</dd>
          </div>
          <div className="bg-paper p-3.5">
            <dt className="flex items-center gap-1.5 font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
              <Plane size={12} strokeWidth={1.5} />
              Нужно на старте
            </dt>
            <dd className="tabular mt-1.5 font-mono text-sm text-ink">
              ${startMin}–{startMax}
            </dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
