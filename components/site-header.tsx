'use client';

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

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-paper/95 backdrop-blur-[2px]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2.5" onClick={() => setOpen(false)}>
          <span className="text-lg font-bold tracking-tight">Грант</span>
          <span className="hidden font-mono text-[0.65rem] uppercase tracking-[0.14em] text-ink-soft sm:inline">
            СНГ
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`border-b-2 px-3 py-1.5 text-sm transition-colors ${
                  active ? 'border-stamp text-ink' : 'border-transparent text-ink-soft hover:text-ink'
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
          className="border border-rule p-2 md:hidden"
          aria-label={open ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={open}
        >
          {open ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-rule bg-plate md:hidden">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="block border-b border-rule px-4 py-3 text-sm last:border-0"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
