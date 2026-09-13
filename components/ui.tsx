import { Check, Minus } from 'lucide-react';
import type { Coverage } from '@/lib/types';

/** Маркер секции вместо ALL-CAPS-подписи над заголовком. */
export function SectionMark({ n, rule = true }: { n: string; rule?: boolean }) {
  return (
    <div className="flex items-baseline gap-3">
      <span className="font-mono text-xs text-stamp">§ {n}</span>
      {rule && <span className="h-px flex-1 bg-rule" />}
    </div>
  );
}

export function PageHeader({
  mark,
  title,
  lead,
}: {
  mark: string;
  title: string;
  lead?: string;
}) {
  return (
    <header className="border-b-2 border-ink">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <SectionMark n={mark} />
        <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.6rem]">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">{lead}</p>}
      </div>
    </header>
  );
}

/**
 * Страна обозначается кодом на наклонной «наклейке», а не флагом-эмодзи:
 * читается как проштампованный ярлык на посылке, а не аккуратный SaaS-тег,
 * и одинаково выглядит на всех платформах.
 */
export function CountryMark({ code, size = 'md' }: { code: string; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'h-6 w-8 text-[0.65rem]' : 'h-9 w-12 text-xs';
  return (
    <span
      className={`sticker items-center justify-center font-mono font-medium tracking-[0.08em] text-ink ${cls}`}
      style={{ '--tilt': '2deg' } as React.CSSProperties}
      aria-hidden
    >
      {code}
    </span>
  );
}

const COVERAGE_TEXT: Record<Coverage, string> = {
  full: 'Полный грант',
  partial: 'Частичное покрытие',
  tuition_only: 'Только обучение',
};

export function CoverageBadge({ coverage }: { coverage: Coverage }) {
  const dot = coverage === 'full' ? 'bg-stamp' : coverage === 'partial' ? 'bg-amber' : 'bg-seal';

  return (
    <span
      className="sticker items-center gap-1.5 px-2.5 py-1 font-mono text-[0.68rem] uppercase tracking-[0.1em] text-ink"
      style={{ '--tilt': '-1.5deg' } as React.CSSProperties}
    >
      <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden />
      {COVERAGE_TEXT[coverage]}
    </span>
  );
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center border-2 border-rule bg-paper px-2 py-1 font-mono text-[0.68rem] text-ink-soft">
      {children}
    </span>
  );
}

export function IncludedRow({ label, included, note }: { label: string; included: boolean; note?: string }) {
  return (
    <li className="flex gap-3 border-b border-rule py-3 last:border-0">
      <span className={`mt-0.5 shrink-0 ${included ? 'text-stamp' : 'text-seal'}`}>
        {included ? <Check size={16} strokeWidth={2} /> : <Minus size={16} strokeWidth={2} />}
      </span>
      <span>
        <span className="text-sm font-medium text-ink">{label}</span>
        {note && <span className="mt-0.5 block text-sm leading-relaxed text-ink-soft">{note}</span>}
      </span>
    </li>
  );
}

/** Пара «поле → значение», основной способ подачи данных на сайте. */
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-rule py-3 last:border-0 sm:grid sm:grid-cols-[13rem_1fr] sm:gap-4">
      <dt className="label pt-0.5">{label}</dt>
      <dd className="mt-1 text-sm leading-relaxed text-ink sm:mt-0">{children}</dd>
    </div>
  );
}
