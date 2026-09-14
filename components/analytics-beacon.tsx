'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Отправляет одно событие просмотра при каждой смене маршрута. Ничего не
 * рендерит, ни на что не блокирует отрисовку страницы — при сбое запроса
 * просто молчит.
 */
export function AnalyticsBeacon() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const query = searchParams.toString();
    const path = query ? `${pathname}?${query}` : pathname;

    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path, referrer: document.referrer || null }),
      keepalive: true,
    }).catch(() => {
      /* аналитика необязательна — сайт не должен зависеть от её доступности */
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams]);

  return null;
}
