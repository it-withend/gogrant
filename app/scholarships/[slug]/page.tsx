import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, TriangleAlert } from 'lucide-react';
import { BarePhoto, Photo } from '@/components/photo';
import { Chip, CountryMark, CoverageBadge, Field, IncludedRow, SectionMark } from '@/components/ui';
import { getGuides, getScholarship, getScholarships } from '@/lib/data';
import { days, formatDate, windowStatus } from '@/lib/dates';

export const revalidate = 3600;

export async function generateStaticParams() {
  const list = await getScholarships();
  return list.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const s = await getScholarship(slug);
  if (!s) return {};
  return { title: s.name, description: `${s.country}: ${s.coverage_summary}` };
}

export default async function ScholarshipPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const s = await getScholarship(slug);
  if (!s) notFound();

  const allGuides = await getGuides();
  const related = allGuides.filter((g) => s.guide_slugs.includes(g.slug));
  const st = windowStatus(s.windows);
  const upcoming = s.windows[0];
  const history = s.windows.slice(1);

  return (
    <>
      <BarePhoto
        country={s.country_code}
        width={1600}
        priority
        className="h-44 w-full border-b-2 border-ink sm:h-60"
      />

      <header className="border-b-2 border-ink">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <div className="flex flex-wrap items-center gap-3">
            <CountryMark code={s.country_code} />
            <span className="font-mono text-[0.7rem] uppercase tracking-[0.12em] text-ink-soft">{s.country}</span>
            <CoverageBadge coverage={s.coverage} />
          </div>

          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.5rem]">{s.name}</h1>
          {s.name_original && s.name_original !== s.name && (
            <p className="mt-2 font-mono text-sm text-ink-soft">{s.name_original}</p>
          )}
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">{s.coverage_summary}</p>

          <div className="mt-7 flex flex-wrap gap-3">
            <a href={s.portal_url} target="_blank" rel="noreferrer" className="btn">
              <ExternalLink size={16} strokeWidth={1.5} />
              Открыть официальный портал
            </a>
            <Link href={`/budget?country=${s.slug}`} className="btn-quiet">
              Бюджет по этой стране
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0">
            {/* Честно про покрытие */}
            <section>
              <SectionMark n="01" rule={false} />
              <h2 className="mt-3 text-xl font-bold tracking-tight">Что покрывается на самом деле</h2>

              <div className="mt-5 border-l-2 border-seal bg-plate p-5">
                <div className="flex items-center gap-2 text-seal">
                  <TriangleAlert size={16} strokeWidth={1.5} />
                  <span className="font-mono text-[0.68rem] uppercase tracking-[0.12em]">Читать до подачи</span>
                </div>
                <p className="mt-3 text-sm leading-[1.75] text-ink">{s.honest_note}</p>
              </div>

              <ul className="mt-6 border-y border-rule">
                {s.coverage_items.map((item) => (
                  <IncludedRow key={item.label} {...item} />
                ))}
              </ul>
            </section>

            {/* Требования */}
            <section className="mt-14">
              <SectionMark n="02" rule={false} />
              <h2 className="mt-3 text-xl font-bold tracking-tight">Требования</h2>

              <dl className="mt-5 border-y border-rule">
                <Field label="Уровень образования">{s.requirements.education_level}</Field>
                {(s.requirements.age_max || s.requirements.age_min) && (
                  <Field label="Возраст">
                    {s.requirements.age_max ? `до ${s.requirements.age_max} лет на момент подачи` : `от ${s.requirements.age_min} лет`}
                  </Field>
                )}
                <Field label="Средний балл">
                  {s.requirements.gpa_min_5 && (
                    <span className="tabular font-mono">от {s.requirements.gpa_min_5.toFixed(2)} по 5-балльной. </span>
                  )}
                  {s.requirements.gpa_note}
                  <Link href="/gpa" className="ml-1 text-stamp underline underline-offset-4">
                    конвертер оценок
                  </Link>
                </Field>
                <Field label="Языки">
                  <ul className="space-y-2">
                    {s.requirements.languages.map((l) => (
                      <li key={l.lang}>
                        <span className="font-medium">
                          {l.lang}: {l.level}
                        </span>
                        {l.note && <span className="block text-ink-soft">{l.note}</span>}
                      </li>
                    ))}
                  </ul>
                </Field>
                <Field label="Стипендия">{s.stipend_note}</Field>
              </dl>
            </section>

            {/* Документы */}
            <section className="mt-14">
              <SectionMark n="03" rule={false} />
              <h2 className="mt-3 text-xl font-bold tracking-tight">Чек-лист документов</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Список слегка меняется каждый год. Это база, которую можно собирать заранее, не дожидаясь объявления сезона.
              </p>

              <ol className="mt-5 border-y border-rule">
                {s.documents.map((d, i) => (
                  <li key={d} className="flex gap-4 border-b border-rule py-3 last:border-0">
                    <span className="tabular shrink-0 font-mono text-xs text-stamp">{String(i + 1).padStart(2, '0')}</span>
                    <span className="text-sm leading-relaxed text-ink">{d}</span>
                  </li>
                ))}
              </ol>
            </section>

            {/* Процесс */}
            <section className="mt-14">
              <SectionMark n="04" rule={false} />
              <h2 className="mt-3 text-xl font-bold tracking-tight">Как устроена подача</h2>

              <ol className="mt-5 space-y-0">
                {s.steps.map((step, i) => (
                  <li key={step.title} className="border-l border-rule pl-5 pb-7 last:pb-0 sm:pl-7">
                    <div className="relative">
                      <span className="tabular absolute -left-[calc(1.25rem+1px)] top-0.5 flex h-5 w-5 -translate-x-1/2 items-center justify-center border border-ink bg-paper font-mono text-[0.6rem] sm:-left-[calc(1.75rem+1px)]">
                        {i + 1}
                      </span>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                      <p className="mt-1.5 max-w-xl text-sm leading-[1.7] text-ink-soft">{step.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>

            {/* Гайды */}
            {related.length > 0 && (
              <section className="mt-14">
                <SectionMark n="05" rule={false} />
                <h2 className="mt-3 text-xl font-bold tracking-tight">Разборы по этой программе</h2>
                <ul className="mt-5 divide-y divide-rule border-y border-rule">
                  {related.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/guides/${g.slug}`} className="block py-4 hover:text-stamp">
                        <span className="text-sm font-medium">{g.title}</span>
                        <span className="mt-1 block text-sm leading-relaxed text-ink-soft">{g.summary}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Правая колонка */}
          <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
            <div className="plate p-5">
              <p className="label">Ближайшее окно подачи</p>
              <p className="mt-3 tabular font-mono text-2xl leading-none text-ink">
                {formatDate(upcoming.opens)}
              </p>
              <p className="mt-2 font-mono text-xs text-ink-soft">до {formatDate(upcoming.closes)}</p>

              <p className="mt-4 border-t border-rule pt-3 text-sm leading-relaxed">
                {st.kind === 'open' && <span className="text-seal">Приём идёт прямо сейчас, осталось {days(st.daysLeft)}.</span>}
                {st.kind === 'upcoming' && <span className="text-ink-soft">Откроется через {days(st.daysUntil)}.</span>}
                {st.kind === 'closed' && <span className="text-ink-soft">Даты нового сезона пока не объявлены.</span>}
              </p>

              {upcoming.note && <p className="mt-3 text-xs leading-relaxed text-ink-soft">{upcoming.note}</p>}
            </div>

            <div className="plate p-5">
              <p className="label">Даты прошлых лет</p>
              <p className="mt-2 text-xs leading-relaxed text-ink-soft">
                По ним видно закономерность: месяц открытия из года в год почти не меняется.
              </p>
              <ul className="mt-3 border-t border-rule">
                {history.map((w) => (
                  <li key={w.year} className="flex items-baseline justify-between gap-3 border-b border-rule py-2 last:border-0">
                    <span className="tabular font-mono text-xs text-ink-soft">{w.year}</span>
                    <span className="tabular font-mono text-xs text-ink">
                      {formatDate(w.opens).replace(/ \d{4}$/, '')} — {formatDate(w.closes).replace(/ \d{4}$/, '')}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="plate p-5">
              <p className="label">Где подаваться</p>
              <dl className="mt-3 space-y-3">
                {s.contact.map((c) => (
                  <div key={c.label}>
                    <dt className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-soft">{c.label}</dt>
                    <dd className="mt-0.5 text-sm text-ink">{c.value}</dd>
                  </div>
                ))}
              </dl>
              <a
                href={s.portal_url}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 border-b border-stamp pb-0.5 font-mono text-xs text-stamp"
              >
                <ExternalLink size={13} strokeWidth={1.5} />
                {s.portal_url.replace(/^https?:\/\//, '').replace(/\/$/, '')}
              </a>
            </div>

            <div className="plate p-5">
              <p className="label">Деньги на старте</p>
              <dl className="mt-3 space-y-2.5 text-sm">
                {[s.budget.visa, s.budget.flight, s.budget.first_month].map((b) => (
                  <div key={b.label} className="flex items-baseline justify-between gap-3">
                    <dt className="text-ink-soft">{b.label}</dt>
                    <dd className="tabular shrink-0 font-mono text-ink">
                      {b.amount_usd_max === 0 ? '—' : `$${b.amount_usd_min}–${b.amount_usd_max}`}
                    </dd>
                  </div>
                ))}
              </dl>
              <Link href={`/budget?country=${s.slug}`} className="mt-4 block border-t border-rule pt-3 font-mono text-xs text-stamp">
                Разбор по пунктам
              </Link>
            </div>

            <Photo country={s.country_code} ratio="aspect-[4/3]" width={600} />

            <div className="flex flex-wrap gap-1.5">
              {s.quiz.strong_fields.map((f) => (
                <Chip key={f}>{f}</Chip>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
