import { countryPhoto, photo, type PhotoKey } from '@/lib/photos';

type Tint = 'none' | 'stamp' | 'seal';

const TINT_BORDER: Record<Exclude<Tint, 'none'>, string> = {
  stamp: 'border-stamp',
  seal: 'border-seal',
};

/**
 * Все фото — жёсткий чёрно-белый снимок, без дуотон-заливки. Цвет остаётся
 * только в рамке: акцентная обводка вместо цветного слоя поверх изображения —
 * фото не подкрашивается, оно просто обведено.
 */
function TintFrame({ tint }: { tint: Tint }) {
  if (tint === 'none') return null;
  return <span aria-hidden className={`pointer-events-none absolute inset-0 border-4 ${TINT_BORDER[tint]}`} />;
}

type Common = {
  className?: string;
  ratio?: string;
  width?: number;
  /** Подпись под фото. Без неё выводится только источник. */
  caption?: string;
  priority?: boolean;
  tint?: Tint;
};

/**
 * Фото из реестра, с подписью и жёсткой рамкой-стикером.
 */
export function Photo({
  name,
  country,
  className = '',
  ratio = 'aspect-[16/9]',
  width = 1200,
  caption,
  priority = false,
  tint = 'stamp',
}: Common & ({ name: PhotoKey; country?: never } | { country: string; name?: never })) {
  const p = country ? countryPhoto(country, width) : photo(name as PhotoKey, width);

  return (
    <figure className={className}>
      <div className={`relative overflow-hidden border-2 border-ink bg-plate ${ratio}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.url}
          alt={p.alt}
          className="h-full w-full object-cover grayscale contrast-[1.15]"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
        <TintFrame tint={tint} />
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

/**
 * Фото без подписи, для фоновых и декоративных блоков. Оборачивается в
 * собственный `relative`-контейнер, поэтому дуотон-слой работает независимо
 * от того, задал ли родитель позиционирование — className передаётся именно
 * на этот контейнер (в него же обычно кладут aspect-ratio или h-full/w-full).
 */
export function BarePhoto({
  name,
  country,
  className = '',
  width = 1200,
  priority = false,
  tint = 'none',
}: {
  className?: string;
  width?: number;
  priority?: boolean;
  tint?: Tint;
} & ({ name: PhotoKey; country?: never } | { country: string; name?: never })) {
  const p = country ? countryPhoto(country, width) : photo(name as PhotoKey, width);

  return (
    <span className={`relative block overflow-hidden ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={p.url}
        alt={p.alt}
        className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.15]"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <TintFrame tint={tint} />
    </span>
  );
}
