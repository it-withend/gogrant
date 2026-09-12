import Link from 'next/link';
import {
  Calculator,
  CalendarClock,
  FileCheck2,
  Landmark,
  ListChecks,
  Plane,
  ScrollText,
  Stamp,
  Wallet,
} from 'lucide-react';
import { DeadlineStrip } from '@/components/deadline-strip';
import { ScholarshipCard, ScholarshipCardWide } from '@/components/scholarship-card';
import { BarePhoto, Photo } from '@/components/photo';
import { SectionMark } from '@/components/ui';
import { getGuides, getScholarships } from '@/lib/data';
import { sortByUrgency } from '@/lib/dates';

export const revalidate = 3600;

const TOOLS = [
  {
    href: '/quiz',
    icon: ListChecks,
    title: 'Подбор стипендии',
    body: 'Восемь вопросов про возраст, язык, балл и деньги. На выходе — ранжированный список с разбором, почему программа подходит или не подходит.',
    action: 'Пройти подбор',
  },
  {
    href: '/budget',
    icon: Wallet,
    title: 'Калькулятор бюджета',
    body: 'Сколько денег нужно на руках до того, как придёт первая стипендия: виза, перелёт, первый месяц на месте.',
    action: 'Посчитать бюджет',
  },
  {
    href: '/gpa',
    icon: Calculator,
    title: 'Конвертер оценок',
    body: 'Перевод между 5-, 10-, 12-, 100-балльной шкалами и GPA. Двумя методами сразу, потому что вузы считают по-разному.',
    action: 'Пересчитать балл',
  },
  {
    href: '/guides',
    icon: FileCheck2,
    title: 'Пошаговые гайды',
    body: 'Апостиль аттестата по странам СНГ, разница между треками подачи, мотивационное письмо.',
    action: 'Читать гайды',
  },
];

const PATH = [
  {
    icon: ScrollText,
    title: 'Документы',
    body: 'Аттестат, апостиль, нотариальный перевод. Самая долгая часть: в сезон апостиль идёт до полутора месяцев.',
  },
  {
    icon: FileCheck2,
    title: 'Заявка',
    body: 'Анкета на портале программы, мотивационное письмо, план обучения. У части программ параллельно нужна номинация от своей страны.',
  },
  {
    icon: Landmark,
    title: 'Отбор',
    body: 'Тестирование или интервью в посольстве либо в вузе. Обычно весной, через один-три месяца после закрытия приёма.',
  },
  {
    icon: Plane,
    title: 'Виза и выезд',
    body: 'Письмо о зачислении, консульство, билет. И деньги на первый месяц: стипендия почти нигде не приходит в день прилёта.',
  },
];

export default async function HomePage() {
  const [scholarships, guides] = await Promise.all([getScholarships(), getGuides()]);
  // Крупной карточкой показывается программа с ближайшим дедлайном, а не
  // первая по списку: так это читается как «горит сейчас», а не как совет.
  const featured = sortByUrgency(scholarships)[0];
  const rest = scholarships.filter((s) => s.slug !== featured.slug);
  const fullCount = scholarships.filter((s) => s.coverage === 'full').length;

  return (
    <>
      {/* Hero: текст слева, фото справа */}
      <section className="border-b border-rule">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-[1.15fr_1fr] lg:items-center">
          <div>
            <SectionMark n="01" />
            <h1 className="mt-5 max-w-2xl text-3xl font-bold leading-[1.12] tracking-tight sm:text-[3rem]">
              Программы, по которым из стран СНГ уезжают учиться бесплатно
            </h1>
            <p className="mt-5 max-w-xl text-[1.02rem] leading-relaxed text-ink-soft">
              Справочник по стипендиям с полным и частичным покрытием: что грант закрывает на самом деле, когда
              открывается приём, какие документы понадобятся и сколько денег нужно на старте. Без рекламы программ и
              без обещаний, что всё просто.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/quiz" className="btn">
                <ListChecks size={16} strokeWidth={1.5} />
                Подобрать программу
              </Link>
              <Link href="/scholarships" className="btn-quiet">
                Смотреть все стипендии
              </Link>
            </div>

            <dl className="mt-10 grid max-w-lg grid-cols-3 gap-px border border-rule bg-rule">
              <div className="bg-plate p-4">
                <dt className="label">Программ</dt>
                <dd className="tabular mt-1.5 font-mono text-2xl text-ink">{scholarships.length}</dd>
              </div>
              <div className="bg-plate p-4">
                <dt className="label">Полных грантов</dt>
                <dd className="tabular mt-1.5 font-mono text-2xl text-ink">{fullCount}</dd>
              </div>
              <div className="bg-plate p-4">
                <dt className="label">Разборов</dt>
                <dd className="tabular mt-1.5 font-mono text-2xl text-ink">{guides.length}</dd>
              </div>
            </dl>
          </div>

          <Photo
            name="hero"
            ratio="aspect-[4/5] sm:aspect-[3/2] lg:aspect-[4/5]"
            width={900}
            priority
            caption="Выпуск — то, ради чего всё это затевается"
          />
        </div>
      </section>

      {/* Трекер дедлайнов */}
      <section className="border-b border-rule bg-plate/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <SectionMark n="02" rule={false} />
              <h2 className="mt-3 flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                <Stamp size={22} strokeWidth={1.5} className="text-stamp" />
                Что закрывается ближайшим
              </h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-ink-soft">
                Отсчёт идёт до даты текущего сезона. Если сезон ещё не объявлен официально, показана дата по
                закономерности прошлых лет — в карточке программы это подписано.
              </p>
            </div>
            <Link href="/deadlines" className="btn-quiet">
              <CalendarClock size={15} strokeWidth={1.5} />
              Календарь года
            </Link>
          </div>

          <div className="mt-8">
            <DeadlineStrip items={scholarships} />
          </div>
        </div>
      </section>

      {/* Программы */}
      <section className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionMark n="03" rule={false} />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Программы</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Метка покрытия важнее названия программы и рейтинга вуза: между «полным грантом» и «только обучением»
            разница в несколько тысяч долларов в год из собственного кармана.
          </p>

          <div className="mt-8">
            <ScholarshipCardWide s={featured} />
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rest.map((s) => (
              <ScholarshipCard key={s.slug} s={s} />
            ))}
          </div>
        </div>
      </section>

      {/* Тёмная полоса: путь целиком. Ломает светлую монотонность страницы */}
      <section className="border-b border-rule bg-ink text-plate">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr] lg:items-start">
            <div>
              <span className="font-mono text-xs text-plate/60">§ 04</span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight">Как выглядит путь целиком</h2>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-plate/70">
                От первой справки из школы до посадки в самолёт проходит от девяти месяцев до полутора лет.
                Большая часть этого срока — ожидание чужих решений, и только первый этап зависит целиком от кандидата.
              </p>

              <div className="mt-8 overflow-hidden border border-plate/20">
                <BarePhoto name="airport" width={800} className="aspect-[16/10] w-full object-cover opacity-90" />
              </div>
            </div>

            <ol className="grid gap-px bg-plate/15 sm:grid-cols-2">
              {PATH.map((step, i) => (
                <li key={step.title} className="bg-ink p-5">
                  <div className="flex items-center justify-between">
                    <step.icon size={20} strokeWidth={1.5} className="text-plate/70" />
                    <span className="tabular font-mono text-xs text-plate/40">{String(i + 1).padStart(2, '0')}</span>
                  </div>
                  <h3 className="mt-4 text-base font-bold">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-plate/70">{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* Инструменты */}
      <section className="border-b border-rule bg-plate/60">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionMark n="05" rule={false} />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">Инструменты</h2>

          <div className="mt-8 grid gap-px border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-4">
            {TOOLS.map((tool) => (
              <Link key={tool.href} href={tool.href} className="group flex flex-col bg-plate p-6 transition-colors hover:bg-paper">
                <tool.icon size={22} strokeWidth={1.5} className="text-stamp" />
                <h3 className="mt-4 text-base font-bold">{tool.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{tool.body}</p>
                <p className="mt-5 font-mono text-[0.7rem] uppercase tracking-[0.12em] text-stamp">{tool.action}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Гайды */}
      <section>
        <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <SectionMark n="06" rule={false} />
          <h2 className="mt-3 text-2xl font-bold tracking-tight">С чего обычно начинают</h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Документы готовятся дольше, чем кажется. Апостиль на аттестат в сезон делается до полутора месяцев — это
            единственная часть процесса, которую нельзя ускорить.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
            <ul className="divide-y divide-rule border-y border-rule">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link href={`/guides/${g.slug}`} className="group flex items-start gap-5 py-5">
                    <span className="hidden h-16 w-24 shrink-0 overflow-hidden border border-rule sm:block">
                      <BarePhoto name="documents" width={300} className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-bold leading-snug group-hover:text-stamp">{g.title}</span>
                      <span className="mt-1.5 block text-sm leading-relaxed text-ink-soft">{g.summary}</span>
                    </span>
                    <span className="shrink-0 font-mono text-[0.7rem] text-ink-soft">{g.reading_minutes} мин</span>
                  </Link>
                </li>
              ))}
            </ul>

            <aside className="space-y-5">
              <Photo name="library" ratio="aspect-[4/3]" width={600} caption="Библиотека кампуса" />
              <div className="plate p-5">
                <p className="label">Про данные на сайте</p>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                  Суммы и даты — ориентировочные, собраны вручную и актуальны на сентябрь 2026. Требования и формы
                  меняются каждый сезон, поэтому единственным источником истины остаётся официальный портал программы.
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
