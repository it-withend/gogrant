import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-24 sm:px-6">
      <p className="font-mono text-xs text-stamp">§ 404</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tight">Такой страницы нет</h1>
      <p className="mt-3 text-[0.98rem] leading-relaxed text-ink-soft">
        Либо ссылка устарела, либо программу переименовали. Начни со списка стипендий — там всё, что сейчас есть.
      </p>
      <div className="mt-7 flex flex-wrap gap-3">
        <Link href="/scholarships" className="btn">
          К списку стипендий
        </Link>
        <Link href="/" className="btn-quiet">
          На главную
        </Link>
      </div>
    </div>
  );
}
