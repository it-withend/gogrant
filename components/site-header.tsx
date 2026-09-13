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
 * Шапка на чёрном фоне: у знака свой чёрный квадратный холст, и на тёмной
 * панели он читается без рамки-контейнера — куб как будто плывёт прямо на
 * баре. Полоса-акцент снизу цвета seal (флуоресцентный риск-оранжевый)
 * держит бренд-связку с логотипом и с лентой дедлайнов на главной.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b-4 border-seal bg-ink">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
        <Link href="/" className="flex items-center" onClick={() => setOpen(false)} aria-label="На главную">
          <Image src="/brand-mark.png" alt="Грант" width={40} height={40} priority className="h-10 w-10" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 px-3 py-1.5 text-sm transition-colors ${
                  active ? 'border-seal text-plate' : 'border-transparent text-plate/60 hover:text-plate'
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
          className="border-2 border-plate/30 p-2 text-plate md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <nav className="border-t-2 border-plate/15 bg-ink md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-plate/10 px-4 py-3 text-sm text-plate/85 last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
