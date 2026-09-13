'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';

const NAV = [
  { href: '/scholarships', label: 'Стипендии' },
  { href: '/deadlines', label: 'Дедлайны' },
  { href: '/guides', label: 'Гайды' },
  { href: '/quiz', label: 'Подбор' },
  { href: '/budget', label: 'Бюджет' },
  { href: '/gpa', label: 'GPA' },
];

/**
 * Шапка на чёрном фоне без градиентов и мягких переходов: три плашки-полосы
 * снизу (синяя/жёлтая/красная) вместо одной акцентной линии — открытая
 * плакатная триада вместо приглушённого брендового акцента. Знак — в белой
 * квадратной рамке, а не «плывёт» на фоне без контейнера.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link
          href="/"
          className="flex items-center border-2 border-paper p-1"
          onClick={() => setOpen(false)}
          aria-label="На главную"
        >
          <Image src="/brand-mark.png" alt="Грант" width={36} height={36} priority className="h-9 w-9" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 font-sans text-sm uppercase tracking-[0.04em] transition-colors ${
                  active ? 'bg-paper text-ink' : 'text-paper/70 hover:text-paper'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="border-2 border-paper p-2 text-paper md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <nav className="border-t-2 border-paper/20 bg-ink md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-paper/10 px-4 py-3 font-sans text-sm uppercase tracking-[0.04em] text-paper/85 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="flex h-1.5">
        <span className="flex-1 bg-stamp" />
        <span className="flex-1 bg-amber" />
        <span className="flex-1 bg-seal" />
      </div>
    </header>
  );
}
