import type { Metadata } from 'next';
import { GpaCalculator } from '@/components/gpa-calculator';
import { PageHeader } from '@/components/ui';

export const metadata: Metadata = {
  title: 'Калькулятор GPA',
  description: 'Перевод узбекского пятибалльного среднего в шкалу 4.0, проценты и ECTS — с честной пометкой о точности.',
};

export default function GpaPage() {
  return (
    <>
      <PageHeader
        mark="06"
        title="Пересчёт среднего балла"
        lead="Вузы просят GPA по шкале 4.0 или процент, а у тебя пятибалльная система. Прямого официального соответствия не существует, поэтому любая конвертация — ориентир."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <GpaCalculator />
      </div>
    </>
  );
}
