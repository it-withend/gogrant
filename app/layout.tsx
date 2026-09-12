import type { Metadata } from 'next';
import { Golos_Text, IBM_Plex_Mono } from 'next/font/google';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import './globals.css';

const golos = Golos_Text({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-golos',
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
    default: 'Грант — поступление за рубеж на стипендию из Узбекистана',
    template: '%s · Грант',
  },
  description:
    'Стипендии с полным покрытием для выпускников школ Узбекистана: что покрывает грант на самом деле, когда дедлайны, какие документы нужны и сколько денег понадобится на старте.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${golos.variable} ${plexMono.variable}`}>
      <body className="flex min-h-screen flex-col font-sans">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
