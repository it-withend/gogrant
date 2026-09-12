import Link from 'next/link';

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-rule">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <p className="text-sm font-bold">Грант</p>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
            Собрано выпускниками, которые сами проходили через эти дедлайны, апостили и анкеты. Данные обновляются
            вручную, поэтому перед подачей всегда сверяйся с официальным порталом программы.
          </p>
        </div>

        <div>
          <p className="label">Разделы</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/scholarships" className="text-ink-soft hover:text-ink">Стипендии</Link></li>
            <li><Link href="/deadlines" className="text-ink-soft hover:text-ink">Дедлайны</Link></li>
            <li><Link href="/guides" className="text-ink-soft hover:text-ink">Гайды</Link></li>
          </ul>
        </div>

        <div>
          <p className="label">Инструменты</p>
          <ul className="mt-3 space-y-1.5 text-sm">
            <li><Link href="/quiz" className="text-ink-soft hover:text-ink">Подбор стипендии</Link></li>
            <li><Link href="/budget" className="text-ink-soft hover:text-ink">Калькулятор бюджета</Link></li>
            <li><Link href="/gpa" className="text-ink-soft hover:text-ink">Калькулятор GPA</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-rule">
        <p className="mx-auto max-w-6xl px-4 py-4 font-mono text-xs text-ink-soft sm:px-6">
          Суммы и даты — ориентировочные, актуальны на сентябрь 2026. Официальным источником остаётся портал программы.
        </p>
      </div>
    </footer>
  );
}
