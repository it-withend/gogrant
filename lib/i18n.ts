import ru from '@/messages/ru.json';

/**
 * Лёгкий словарный слой. Узбекского перевода пока нет — по брифу его не надо,
 * но архитектура не должна его блокировать.
 *
 * Как добавить узбекский позже:
 *  1. Скопировать messages/ru.json в messages/uz.json и перевести значения.
 *  2. Добавить 'uz' в LOCALES и в DICTIONARIES ниже.
 *  3. Обернуть app/ в сегмент app/[locale]/ и брать локаль из params,
 *     либо подключить next-intl — ключи и структура словаря уже совместимы
 *     с его форматом, переписывать вызовы t() не придётся.
 *
 * Тексты контента (стипендии, гайды) переводятся не здесь, а колонками
 * name_uz / summary_uz в Supabase — см. комментарий в supabase/schema.sql.
 */

export const LOCALES = ['ru'] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'ru';

const DICTIONARIES: Record<Locale, unknown> = { ru };

type Dict = Record<string, string>;

function flat(obj: unknown, prefix = '', out: Dict = {}): Dict {
  for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object') flat(v, key, out);
    else out[key] = String(v);
  }
  return out;
}

const FLAT: Record<Locale, Dict> = {
  ru: flat(DICTIONARIES.ru),
};

export function getTranslations(locale: Locale = DEFAULT_LOCALE) {
  const dict = FLAT[locale] ?? FLAT[DEFAULT_LOCALE];
  return (key: string, vars?: Record<string, string | number>): string => {
    let value = dict[key] ?? key;
    if (vars) {
      for (const [k, v] of Object.entries(vars)) value = value.replaceAll(`{${k}}`, String(v));
    }
    return value;
  };
}

export const t = getTranslations();
