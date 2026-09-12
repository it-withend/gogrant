import { countryPhoto, photo, type PhotoKey } from '@/lib/photos';

type Common = {
  className?: string;
  ratio?: string;
  width?: number;
  /** Подпись под фото. Без неё выводится только источник. */
  caption?: string;
  priority?: boolean;
};

/**
 * Фото из реестра. Рамка и подпись оформлены как вклеенный в бланк снимок:
 * тонкая линовка, мелкий моноширинный кредит под кадром.
 */
export function Photo({
  name,
  country,
  className = '',
  ratio = 'aspect-[16/9]',
  width = 1200,
  caption,
  priority = false,
}: Common & ({ name: PhotoKey; country?: never } | { country: string; name?: never })) {
  const p = country ? countryPhoto(country, width) : photo(name as PhotoKey, width);

  return (
    <figure className={className}>
      <div className={`relative overflow-hidden border border-rule bg-plate ${ratio}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.url}
          alt={p.alt}
          className="h-full w-full object-cover"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
      </div>
      <figcaption className="mt-1.5 flex flex-wrap items-baseline justify-between gap-2 font-mono text-[0.65rem] text-ink-soft">
        <span>{caption ?? p.alt}</span>
        <a href={p.source} target="_blank" rel="noreferrer" className="shrink-0 underline underline-offset-2">
          Unsplash
        </a>
      </figcaption>
    </figure>
  );
}

/** Фото без подписи — для фоновых и декоративных блоков. */
export function BarePhoto({
  name,
  country,
  className = '',
  width = 1200,
  priority = false,
}: {
  className?: string;
  width?: number;
  priority?: boolean;
} & ({ name: PhotoKey; country?: never } | { country: string; name?: never })) {
  const p = country ? countryPhoto(country, width) : photo(name as PhotoKey, width);

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={p.url}
      alt={p.alt}
      className={className}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : 'auto'}
    />
  );
}
