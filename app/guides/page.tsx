import type { Metadata } from 'next';
import Link from 'next/link';
import { Clock3 } from 'lucide-react';
import { BarePhoto } from '@/components/photo';
import { PageHeader } from '@/components/ui';
import { getGuides } from '@/lib/data';
import { guideCover } from '@/lib/guide-covers';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Гайды',
  description: 'Пошаговые разборы: апостиль аттестата по странам СНГ, треки подачи, конвертация оценок, мотивационное письмо.',
};

export default async function GuidesPage() {
  const guides = await getGuides();
  const [lead, ...rest] = guides;

  return (
    <>
      <PageHeader
        mark="02"
        title="Пошаговые гайды"
        lead="Разборы процессов, на которых чаще всего застревают: в каком порядке всё делается, сколько занимает и где обычно возникают ошибки."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {guides.length === 0 ? (
          <p className="text-sm text-ink-soft">Гайдов пока нет. Первые появятся вместе с сезоном подачи.</p>
        ) : (
          <>
            {/* Первый разбор — крупной плашкой */}
            <Link
              href={`/guides/${lead.slug}`}
              className="plate group grid overflow-hidden transition-colors hover:border-ink md:grid-cols-[1fr_1.1fr]"
            >
              <div className="relative aspect-[16/10] border-b border-rule md:aspect-auto md:border-b-0 md:border-r">
                <BarePhoto name={guideCover(lead.slug)} width={900} className="h-full w-full object-cover" priority />
              </div>
              <div className="p-6 sm:p-8">
                <span className="label">Начинают обычно отсюда</span>
                <h2 className="mt-3 text-2xl font-bold leading-tight tracking-tight group-hover:text-stamp">
                  {lead.title}
                </h2>
                <p className="mt-3 text-[0.95rem] leading-relaxed text-ink-soft">{lead.summary}</p>
                <p className="mt-5 flex items-center gap-1.5 font-mono text-[0.7rem] text-ink-soft">
                  <Clock3 size={13} strokeWidth={1.5} />
                  {lead.reading_minutes} мин чтения
                </p>
              </div>
            </Link>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {rest.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="plate group flex flex-col overflow-hidden transition-colors hover:border-ink"
                >
                  <div className="relative aspect-[16/10] border-b border-rule">
                    <BarePhoto name={guideCover(g.slug)} width={500} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold leading-snug group-hover:text-stamp">{g.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-soft">{g.summary}</p>
                    <p className="mt-4 flex items-center gap-1.5 border-t border-rule pt-3 font-mono text-[0.7rem] text-ink-soft">
                      <Clock3 size={12} strokeWidth={1.5} />
                      {g.reading_minutes} мин
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
