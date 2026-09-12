import type { ApplicationWindow, Scholarship } from '@/lib/types';

export type WindowStatus =
  | { kind: 'open'; window: ApplicationWindow; daysLeft: number }
  | { kind: 'upcoming'; window: ApplicationWindow; daysUntil: number }
  | { kind: 'closed'; window: ApplicationWindow };

const DAY = 86_400_000;

/** Полночь UTC — чтобы счётчик дней не зависел от часового пояса читателя. */
function utcMidnight(d: Date | string): number {
  const date = typeof d === 'string' ? new Date(d + 'T00:00:00Z') : d;
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

export function windowStatus(windows: ApplicationWindow[], now = new Date()): WindowStatus {
  const today = utcMidnight(now);
  const sorted = [...windows].sort((a, b) => utcMidnight(a.opens) - utcMidnight(b.opens));

  const open = sorted.find((w) => utcMidnight(w.opens) <= today && today <= utcMidnight(w.closes));
  if (open) {
    return { kind: 'open', window: open, daysLeft: Math.round((utcMidnight(open.closes) - today) / DAY) };
  }

  const next = sorted.find((w) => utcMidnight(w.opens) > today);
  if (next) {
    return { kind: 'upcoming', window: next, daysUntil: Math.round((utcMidnight(next.opens) - today) / DAY) };
  }

  return { kind: 'closed', window: sorted[sorted.length - 1] };
}

const MONTHS = [
  'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
];

export function formatDate(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatShort(iso: string): string {
  const d = new Date(iso + 'T00:00:00Z');
  return `${String(d.getUTCDate()).padStart(2, '0')}.${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
}

/** «47 дней», «1 день», «22 дня» — русские окончания. */
export function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export const days = (n: number) => `${n} ${plural(n, 'день', 'дня', 'дней')}`;

/** Сортировка для трекера: сначала открытые окна, потом ближайшие. */
export function sortByUrgency(list: Scholarship[], now = new Date()): Scholarship[] {
  const weight = (s: Scholarship) => {
    const st = windowStatus(s.windows, now);
    if (st.kind === 'open') return st.daysLeft;
    if (st.kind === 'upcoming') return 1_000 + st.daysUntil;
    return 100_000;
  };
  return [...list].sort((a, b) => weight(a) - weight(b));
}

/** Месяцы года, в которые у программы открыто окно — для годового таймлайна. */
export function monthsCovered(w: ApplicationWindow): { month: number; year: number }[] {
  const start = new Date(w.opens + 'T00:00:00Z');
  const end = new Date(w.closes + 'T00:00:00Z');
  const out: { month: number; year: number }[] = [];
  const cur = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  while (cur <= end) {
    out.push({ month: cur.getUTCMonth(), year: cur.getUTCFullYear() });
    cur.setUTCMonth(cur.getUTCMonth() + 1);
  }
  return out;
}

export const MONTHS_SHORT = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
