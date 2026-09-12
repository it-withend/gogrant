import Link from 'next/link';
import { days, formatDate, windowStatus } from '@/lib/dates';
import { Chip, CountryMark, CoverageBadge } from '@/components/ui';
import type { Scholarship } from '@/lib/types';

export function ScholarshipCard({ s }: { s: Scholarship }) {
  const st = windowStatus(s.windows);
  const req = s.requirements;

  return (
    <article className="plate flex flex-col p-5 transition-colors hover:border-ink">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <CountryMark code={s.country_code} />
          <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft">{s.country}</span>
        </div>
        <CoverageBadge coverage={s.coverage} />
      </div>

      <h3 className="mt-4 text-lg font-bold leading-snug">
        <Link href={`/scholarships/${s.slug}`} className="hover:text-stamp">
          {s.name}
        </Link>
      </h3>

      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{s.coverage_summary}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {req.age_max && <Chip>до {req.age_max} лет</Chip>}
        {req.gpa_min_5 && <Chip>GPA от {req.gpa_min_5.toFixed(2)}</Chip>}
        {req.languages.slice(0, 2).map((l) => (
          <Chip key={l.lang}>
            {l.lang}: {l.level}
          </Chip>
        ))}
      </div>

      <div className="mt-auto border-t border-rule pt-3">
        <p className="font-mono text-[0.7rem] text-ink-soft">
          {st.kind === 'open' && (
            <span className="text-seal">Приём открыт, {days(st.daysLeft)} до {formatDate(st.window.closes)}</span>
          )}
          {st.kind === 'upcoming' && (
            <span>
              Откроется {formatDate(st.window.opens)}, через {days(st.daysUntil)}
            </span>
          )}
          {st.kind === 'closed' && <span>Даты следующего сезона пока не объявлены</span>}
        </p>
      </div>
    </article>
  );
}
