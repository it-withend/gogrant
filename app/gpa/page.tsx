import type { Metadata } from 'next';
import { GpaCalculator } from '@/components/gpa-calculator';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Конвертер оценок',
  description: 'Перевод между 5-, 10-, 12-, 100-балльной шкалами и GPA. Два метода расчёта и оценка по ECTS.',
};

export default function GpaPage() {
  return (
    <>
      <PageHeader
        mark="06"
        title="Конвертер систем оценок"
        lead="Пятибалльная, десятибалльная, стобалльная, GPA — перевод в любую сторону. Официального соответствия между национальными шкалами не существует, поэтому результат считается двумя методами сразу: расхождение между ними и есть реальная погрешность."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <GpaCalculator />
      </div>
    </>
  );
}
