import { countryPhoto, photo, type PhotoKey } from '@/lib/photos';

type Tint = 'none' | 'stamp' | 'seal';

const TINT_HEX: Record<Exclude<Tint, 'none'>, string> = {
  stamp: '#1A4FA3',
  seal: '#FF4433',
};

/**
 * Дуотон-обработка вместо честного цветного фото: чб-конверсия плюс цветной
 * слой в режиме blend-mode «color» держит светлые и тёмные участки как есть
 * и подкрашивает только полутона — так печатают рисографом в два прогона.
 * Без цвета (tint="none") получается ровно чёрно-белый снимок с усиленным
 * контрастом — спокойнее для миниатюр в сетке карточек.
 */
function DuotoneLayer({ tint }: { tint: Tint }) {
  if (tint === 'none') return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0"
      style={{ backgroundColor: TINT_HEX[tint], mixBlendMode: 'color', opacity: 0.6 }}
    />
  );
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
      <div className={`relative overflow-hidden border-2 border-ink bg-plate shadow-hard ${ratio}`}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={p.url}
          alt={p.alt}
          className="h-full w-full object-cover grayscale contrast-[1.08]"
          loading={priority ? 'eager' : 'lazy'}
          fetchPriority={priority ? 'high' : 'auto'}
        />
        <DuotoneLayer tint={tint} />
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
        className="absolute inset-0 h-full w-full object-cover grayscale contrast-[1.08]"
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : 'auto'}
      />
      <DuotoneLayer tint={tint} />
    </span>
  );
}
