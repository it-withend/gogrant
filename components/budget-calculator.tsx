'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CountryMark, CoverageBadge } from '@/components/ui';
import type { BudgetItem, Scholarship } from '@/lib/types';

export function BudgetCalculator({ scholarships, initialSlug }: { scholarships: Scholarship[]; initialSlug?: string }) {
  const [slug, setSlug] = useState(
    initialSlug && scholarships.some((s) => s.slug === initialSlug) ? initialSlug : scholarships[0]?.slug,
  );
  const [buffer, setBuffer] = useState(true);

  const s = scholarships.find((x) => x.slug === slug);
  if (!s) return <p className="text-sm text-ink-soft">Программы пока не загружены.</p>;

  const items: BudgetItem[] = [s.budget.visa, s.budget.flight, s.budget.first_month];
  if (s.budget.blocked_account) items.push(s.budget.blocked_account);

  const min = items.reduce((sum, i) => sum + i.amount_usd_min, 0);
  const max = items.reduce((sum, i) => sum + i.amount_usd_max, 0);
  const bufferAmount = buffer ? Math.round(max * 0.15) : 0;

  return (
    <div>
      <div className="flex flex-wrap gap-px border border-rule bg-rule">
        {scholarships.map((item) => (
          <button
            key={item.slug}
            type="button"
            onClick={() => setSlug(item.slug)}
            className={`flex-1 px-4 py-3 text-left text-sm transition-colors ${
              item.slug === slug ? 'bg-stamp text-plate' : 'bg-plate hover:bg-paper'
            }`}
          >
            <span className={`block font-mono text-[0.62rem] uppercase tracking-[0.1em] ${item.slug === slug ? 'text-plate/80' : 'text-ink-soft'}`}>
              {item.country_code}
            </span>
            <span className="mt-0.5 block font-medium">{item.country}</span>
          </button>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_18rem]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <CountryMark code={s.country_code} />
            <h2 className="text-lg font-bold">{s.name}</h2>
            <CoverageBadge coverage={s.coverage} />
          </div>

          <dl className="mt-6 border-y border-rule">
            {items.map((item) => (
              <div key={item.label} className="border-b border-rule py-4 last:border-0 sm:grid sm:grid-cols-[1fr_9rem] sm:gap-4">
                <div>
                  <dt className="text-sm font-medium text-ink">{item.label}</dt>
                  {item.note && <p className="mt-1 max-w-lg text-sm leading-relaxed text-ink-soft">{item.note}</p>}
                </div>
                <dd className="tabular mt-2 font-mono text-sm text-ink sm:mt-0 sm:text-right">
                  {item.amount_usd_max === 0 ? (
                    <span className="text-ink-soft">не нужна</span>
                  ) : (
                    `$${item.amount_usd_min} – ${item.amount_usd_max}`
                  )}
                </dd>
              </div>
            ))}
          </dl>

          <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={buffer}
              onChange={(e) => setBuffer(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#1428FF]"
            />
            <span className="text-ink-soft">
              Добавить запас 15% на непредвиденное. Он почти всегда уходит: доплата за багаж, повторный перевод
              документа, задержка первой стипендии.
            </span>
          </label>

          <div className="mt-8 border-2 border-ink bg-plate p-6">
            <p className="label">Нужно на руках до первой стипендии</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink sm:text-5xl">
              ${min + bufferAmount} – {max + bufferAmount}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {s.coverage === 'full'
                ? 'Дальше грант закрывает жильё и ежемесячные расходы, но первые недели ты живёшь на свои.'
                : 'Это только старт. Дальше к этой сумме добавляется ежемесячная разница между стипендией и реальной стоимостью жизни.'}
            </p>
          </div>

          <div className="mt-6 border-l-2 border-amber bg-plate p-5">
            <p className="text-sm leading-relaxed text-ink">{s.honest_note}</p>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
          <div className="plate p-5">
            <p className="label">Что входит в грант</p>
            <ul className="mt-3 space-y-2 border-t border-rule pt-3 text-sm">
              {s.coverage_items.map((c) => (
                <li key={c.label} className="flex items-baseline justify-between gap-3">
                  <span className={c.included ? 'text-ink' : 'text-ink-soft line-through decoration-seal/50'}>{c.label}</span>
                  <span className={`shrink-0 font-mono text-[0.65rem] uppercase ${c.included ? 'text-stamp' : 'text-seal'}`}>
                    {c.included ? 'есть' : 'нет'}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="plate p-5">
            <p className="label">Стипендия</p>
            <p className="mt-2 text-sm leading-relaxed text-ink">{s.stipend_note}</p>
          </div>

          <p className="font-mono text-xs leading-relaxed text-ink-soft">
            Цены ориентировочные, собраны на {s.budget.as_of.replace('-', '.')}. Билеты и консульские сборы меняются,
            перед подачей проверь актуальные суммы.
          </p>

          <Link href={`/scholarships/${s.slug}`} className="btn-quiet w-full justify-center">
            Открыть карточку программы
          </Link>
        </aside>
      </div>
    </div>
  );
}
