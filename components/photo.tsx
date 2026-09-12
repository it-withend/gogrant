import { findPhoto } from '@/lib/photos';

/**
 * Фото из Unsplash. Без ключа API рисуем не градиентный blob, а типографскую
 * плашку в стилистике бланка: линовка и подпись поля.
 */
export async function Photo({
  query,
  alt,
  className = '',
  ratio = 'aspect-[16/9]',
}: {
  query: string;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  const photo = await findPhoto(query, alt);

  if (!photo) {
    return (
      <div className={`relative overflow-hidden border border-rule bg-plate ${ratio} ${className}`}>
        <div
          className="absolute inset-0 opacity-70"
          style={{
            backgroundImage: 'repeating-linear-gradient(180deg, transparent 0 23px, #C6C8C0 23px 24px)',
          }}
        />
        <div className="absolute inset-x-0 bottom-0 border-t border-rule bg-plate px-3 py-2">
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.12em] text-ink-soft">Фото не подключено</p>
          <p className="mt-0.5 truncate font-mono text-[0.65rem] text-ink-soft">{query}</p>
        </div>
      </div>
    );
  }

  return (
    <figure className={className}>
      <div className={`relative overflow-hidden border border-rule bg-plate ${ratio}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photo.url} alt={photo.alt} className="h-full w-full object-cover" loading="lazy" />
      </div>
      <figcaption className="mt-1.5 font-mono text-[0.65rem] text-ink-soft">
        Фото:{' '}
        <a href={photo.authorUrl} target="_blank" rel="noreferrer" className="underline underline-offset-2">
          {photo.authorName}
        </a>
        {' / Unsplash'}
      </figcaption>
    </figure>
  );
}
