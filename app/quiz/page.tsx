import type { Metadata } from 'next';
import { Quiz } from '@/components/quiz';
import { PageHeader } from '@/components/ui';
import { getScholarships } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Подбор стипендии',
  description: 'Восемь вопросов — и ранжированный список программ с объяснением, почему подходит именно эта.',
};

export default async function QuizPage() {
  const scholarships = await getScholarships();

  return (
    <>
      <PageHeader
        mark="04"
        title="Какая программа тебе подходит"
        lead="Восемь вопросов про возраст, язык, балл и деньги. Ответы сохраняются прямо в браузере, регистрироваться не нужно."
      />

      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        <Quiz scholarships={scholarships} />
      </div>
    </>
  );
}
