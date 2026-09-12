import type { Metadata } from 'next';
import { ScholarshipCard } from '@/components/scholarship-card';
import { PageHeader } from '@/components/ui';
import { getScholarships } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Стипендии',
  description: 'Программы с полным и частичным покрытием, доступные выпускникам школ стран СНГ.',
};

export default async function ScholarshipsPage() {
  const list = await getScholarships();

  const full = list.filter((s) => s.coverage === 'full');
  const rest = list.filter((s) => s.coverage !== 'full');

  return (
    <>
      <PageHeader
        mark="01"
        title="Стипендии"
        lead="Программы разделены по тому, сколько денег приходится добавлять своих. Это важнее названия программы и рейтинга вуза."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <section>
          <h2 className="text-lg font-bold">Покрывают всё или почти всё</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Обучение, жильё и ежемесячные деньги входят в грант. Расходы на старте всё равно остаются — их считает калькулятор бюджета.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {full.map((s) => (
              <ScholarshipCard key={s.slug} s={s} />
            ))}
          </div>
        </section>

        <section className="mt-14">
          <h2 className="text-lg font-bold">Покрывают частично</h2>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-soft">
            Обучение бесплатное, но проживание оплачивается самостоятельно. Здесь имеет смысл считать не первый год, а все четыре: регулярная сумма из дома на такой срок — отдельное решение для семьи.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((s) => (
              <ScholarshipCard key={s.slug} s={s} />
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
