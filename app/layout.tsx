import type { Metadata } from 'next';
import { IBM_Plex_Mono, PT_Serif, Unbounded } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

/**
 * Дисплейный гротеск с крупными геометричными счётчиками — заголовки,
 * навигация, кнопки, лейблы. Он же базовый font-sans, применяется по
 * умолчанию на всё, что не переопределено ниже.
 */
const unbounded = Unbounded({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-unbounded',
  display: 'swap',
});

/**
 * Тёплая редакционная антиква для длинных абзацев — подключается точечно
 * через селектор `p, li, dd` в globals.css, а не как базовый шрифт: дисплейный
 * гротеск на сплошном тексте быстро утомляет глаз.
 */
const ptSerif = PT_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '700'],
  variable: '--font-pt-serif',
  display: 'swap',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Грант — поступление за рубеж на стипендию из стран СНГ',
    template: '%s · Грант',
  },
  description:
    'Стипендии с полным и частичным покрытием для выпускников школ стран СНГ: что грант покрывает на самом деле, когда дедлайны, какие документы нужны и сколько денег понадобится на старте.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${unbounded.variable} ${ptSerif.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
