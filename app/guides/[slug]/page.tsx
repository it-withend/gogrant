import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BarePhoto } from '@/components/photo';
import { guideCover } from '@/lib/guide-covers';
import { Markdown } from '@/lib/markdown';
import { SectionMark } from '@/components/ui';
import { getGuide, getGuides, getScholarships } from '@/lib/data';
import { formatDate } from '@/lib/dates';

export const revalidate = 3600;

export async function generateStaticParams() {
  const guides = await getGuides();
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const g = await getGuide(slug);
  if (!g) return {};
  return { title: g.title, description: g.summary };
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const guide = await getGuide(slug);
  if (!guide) notFound();

  const all = await getScholarships();
  const related = all.filter((s) => guide.related_scholarships.includes(s.slug));

  return (
    <>
      <div className="relative h-40 overflow-hidden border-b border-rule sm:h-56">
        <BarePhoto name={guideCover(guide.slug)} width={1600} className="h-full w-full object-cover" priority />
      </div>

      <header className="border-b border-rule">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-12">
          <SectionMark n="02" rule={false} />
          <h1 className="mt-4 max-w-3xl text-3xl font-bold leading-[1.15] tracking-tight sm:text-[2.4rem]">
            {guide.title}
          </h1>
          <p className="mt-4 max-w-2xl text-[0.98rem] leading-relaxed text-ink-soft">{guide.summary}</p>
          <p className="mt-5 font-mono text-xs text-ink-soft">
            {guide.reading_minutes} мин чтения · обновлено {formatDate(guide.updated_at)}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[1fr_16rem]">
          <article className="min-w-0">
            <Markdown source={guide.body} />

            <p className="mt-12 border-t border-rule pt-5 text-sm leading-relaxed text-ink-soft">
              Требования и формы обновляются каждый сезон. Этот разбор — про логику процесса, а актуальный список
              документов всегда смотри в гайдлайне текущего года на портале программы.
            </p>
          </article>

          <aside className="lg:sticky lg:top-20 lg:self-start">
            {related.length > 0 && (
              <div className="plate p-5">
                <p className="label">К каким программам относится</p>
                <ul className="mt-3 divide-y divide-rule border-t border-rule">
                  {related.map((s) => (
                    <li key={s.slug}>
                      <Link href={`/scholarships/${s.slug}`} className="block py-2.5 text-sm hover:text-stamp">
                        <span className="font-mono text-[0.65rem] uppercase tracking-[0.1em] text-ink-soft">
                          {s.country}
                        </span>
                        <span className="mt-0.5 block font-medium">{s.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Link href="/guides" className="mt-5 inline-block font-mono text-xs text-stamp">
              Все гайды
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}
