import Link from 'next/link';
import { Calculator, FileCheck2, ListChecks, Wallet } from 'lucide-react';
import { DeadlineStrip } from '@/components/deadline-strip';
import { ScholarshipCard } from '@/components/scholarship-card';
import { Photo } from '@/components/photo';
import { SectionMark } from '@/components/ui';
import { getGuides, getScholarships } from '@/lib/data';

export const revalidate = 3600;

const TOOLS = [
  {
    href: '/quiz',
    icon: ListChecks,
    title: 'Подбор стипендии',
    body: 'Восемь вопросов про возраст, язык, деньги и регион. На выходе — ранжированный список с объяснением, почему подходит именно это.',
    action: 'Пройти подбор',
  },
  {
    href: '/budget',
    icon: Wallet,
    title: 'Калькулятор бюджета',
    body: 'Сколько нужно на руках до того, как придёт первая стипендия: виза, билет из Ташкента, первый месяц на месте.',
    action: 'Посчитать бюджет',
  },
  {
    href: '/gpa',
    icon: Calculator,
    title: 'Калькулятор GPA',
    body: 'Пересчёт пятибалльного среднего в шкалу 4.0, проценты и ECTS. С пометкой, где этой цифре верить нельзя.',
    action: 'Пересчитать балл',
  },
  {
    href: '/guides',
    icon: FileCheck2,
    title: 'Пошаговые гайды',
    body: 'Апостиль аттестата, разница между треками подачи, мотивационное письмо. Разборы с конкретными действиями.',
    action: 'Читать гайды',
  },
];

export default async function HomePage() {
  const [scholarships, guides] = await Promise.all([getScholarships(), getGuides()]);

  return (
    <>
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
          <SectionMark n="01" />
          <h1 className="mt-5 max-w-3xl text-3xl font-bold leading-[1.12] tracking-tight sm:text-[3.1rem]">
            Пять программ, по которым из Узбекистана реально уехать учиться бесплатно
          </h1>
          <p className="mt-5 max-w-2xl text-[1.02rem] leading-relaxed text-ink-soft">
            Здесь собрано то, что обычно приходится вылавливать по частям: что грант покрывает на самом деле, когда
            открывается приём, какие документы готовить и сколько денег нужно на руках в первый месяц. Без рекламы
            программ и без обещаний, что всё легко.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/quiz" className="btn">
              Подобрать программу
            </Link>
            <Link href="/scholarships" className="btn-quiet">
              Смотреть все стипендии
            </Link>
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-plate/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionMark n="02" rule={false} />
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Что закрывается ближайшим</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Отсчёт идёт до даты этого сезона. Если сезон ещё не объявлен официально, показана дата по
                закономерности прошлых лет, и в карточке программы это подписано.
              </p>
            </div>
            <Link href="/deadlines" className="btn-quiet">
              Весь календарь года
            </Link>
          </div>

          <div className="mt-8">
            <DeadlineStrip items={scholarships} />
          </div>
        </div>
      </section>

      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionMark n="03" rule={false} />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Программы</h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
            Обрати внимание на метку покрытия: «полный грант» и «только обучение» — это разница в несколько тысяч
            долларов в год из твоего кармана.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {scholarships.map((s) => (
              <ScholarshipCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-rule bg-plate/50">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionMark n="04" rule={false} />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Инструменты</h2>

          <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2">
            {TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group bg-plate p-6 transition-colors hover:bg-paper">
                <tool.icon size={22} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-4 text-base font-bold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{tool.body}</p>
                <p className="mt-4 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-stamp">{tool.action}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
            <div>
              <SectionMark n="05" rule={false} />
              <h2 className="mt-3 text-2xl font-bold tracking-tight">С чего начинают почти все</h2>
              <p className="mt-2 max-w-lg text-sm leading-relaxed text-ink-soft">
                Документы готовятся дольше, чем кажется. Апостиль на аттестат в сезон делается до полутора месяцев —
                это единственная вещь, которую точно нельзя оставлять на последнюю неделю.
              </p>

              <ul className="mt-6 divide-y divide-rule border-y border-rule">
                {guides.slice(0, 4).map((g) => (
                  <li key={g.slug}>
                    <Link href={`/guides/${g.slug}`} className="flex items-baseline justify-between gap-4 py-4 hover:text-stamp">
                      <span className="text-sm font-medium">{g.title}</span>
                      <span className="shrink-0 font-mono text-[0.7rem] text-ink-soft">{g.reading_minutes} мин</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <Photo
              query="students studying documents desk"
              alt="Студенты разбирают документы за столом"
              ratio="aspect-[4/3]"
              className="lg:mt-10"
            />
          </div>
        </div>
      </section>
    </>
  );
}
