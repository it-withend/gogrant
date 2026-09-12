import type { Metadata } from 'next';
import { BudgetCalculator } from '@/components/budget-calculator';
import { PageHeader } from '@/components/ui';
import { getScholarships } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Калькулятор бюджета',
  description: 'Сколько денег нужно на руках до первой стипендии: виза, билет из Ташкента, первый месяц на месте.',
};

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ country?: string }>;
}) {
  const [scholarships, sp] = await Promise.all([getScholarships(), searchParams]);

  return (
    <>
      <PageHeader
        mark="05"
        title="Сколько нужно денег на старте"
        lead="Грант закрывает учёбу, но не первые недели. Здесь собрано то, за что придётся заплатить до того, как придёт первая стипендия."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <BudgetCalculator scholarships={scholarships} initialSlug={sp.country} />
      </div>
    </>
  );
}
