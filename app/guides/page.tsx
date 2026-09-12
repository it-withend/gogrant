import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/ui';
import { getGuides } from '@/lib/data';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Гайды',
  description: 'Пошаговые разборы: апостиль аттестата, треки подачи, конвертация GPA, мотивационное письмо.',
};

export default async function GuidesPage() {
  const guides = await getGuides();

  return (
    <>
      <PageHeader
        mark="02"
        title="Пошаговые гайды"
        lead="Каждый разбор написан как инструкция к действию: что сделать, в каком порядке и где обычно ошибаются."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {guides.length === 0 ? (
          <p className="text-sm text-ink-soft">Гайдов пока нет. Первые появятся вместе с сезоном подачи.</p>
        ) : (
          <ul className="border-t border-rule">
            {guides.map((g, i) => (
              <li key={g.slug} className="border-b border-rule">
                <Link href={`/guides/${g.slug}`} className="group block py-6 sm:grid sm:grid-cols-[3rem_1fr_7rem] sm:gap-6">
                  <span className="tabular hidden font-mono text-xs text-stamp sm:block sm:pt-1">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="block">
                    <span className="block text-lg font-bold leading-snug group-hover:text-stamp">{g.title}</span>
                    <span className="mt-2 block max-w-2xl text-sm leading-relaxed text-ink-soft">{g.summary}</span>
                  </span>
                  <span className="mt-3 block font-mono text-[0.7rem] text-ink-soft sm:mt-1 sm:text-right">
                    {g.reading_minutes} мин чтения
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
