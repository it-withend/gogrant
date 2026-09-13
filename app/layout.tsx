import type { Metadata } from 'next';
import { IBM_Plex_Mono, IBM_Plex_Sans, Oswald } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

/**
 * Сжатый плакатный гротеск — заголовки, навигация, кнопки, лейблы. Он же
 * базовый font-sans, применяется по умолчанию на всё, что не переопределено
 * ниже. Условно-жирный и узкий, читается как афиша или бланк, а не как
 * закруглённый SaaS-шрифт.
 */
const oswald = Oswald({
  subsets: ['latin', 'cyrillic'],
  weight: ['500', '600', '700'],
  variable: '--font-oswald',
  display: 'swap',
});

/**
 * Нейтральный гротеск для длинных абзацев — подключается точечно через
 * селектор `p, li, dd` в globals.css, а не как базовый шрифт: сплошной текст
 * плакатной гарнитурой быстро утомляет глаз.
 */
const plexSans = IBM_Plex_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500'],
  variable: '--font-plex-sans',
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
    <html lang="ru" className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
