/**
 * Фотографии берутся из Unsplash по официальному API на этапе рендера
 * (ISR, сутки кэша). Ключ кладётся в UNSPLASH_ACCESS_KEY.
 *
 * Если ключа нет — возвращаем null, и компонент <Photo> рисует вместо
 * фотографии типографскую плашку. Никаких градиентных заглушек.
 *
 * Лицензия Unsplash не требует атрибуции, но она считается хорошим тоном и
 * прямо рекомендуется гайдлайнами API, поэтому имя автора и ссылка с
 * обязательным utm-параметром возвращаются и выводятся под фото.
 */

export type Photo = {
  url: string;
  alt: string;
  authorName: string;
  authorUrl: string;
};

const UTM = 'utm_source=grant_uz&utm_medium=referral';

export async function findPhoto(query: string, alt: string): Promise<Photo | null> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&content_filter=high`,
      {
        headers: { Authorization: `Client-ID ${key}`, 'Accept-Version': 'v1' },
        next: { revalidate: 86_400 },
      },
    );
    if (!res.ok) return null;

    const json = (await res.json()) as {
      results?: { urls: { raw: string }; user: { name: string; links: { html: string } }; alt_description?: string }[];
    };
    const hit = json.results?.[0];
    if (!hit) return null;

    return {
      url: `${hit.urls.raw}&w=1200&q=75&fm=jpg&fit=crop`,
      alt: alt || hit.alt_description || query,
      authorName: hit.user.name,
      authorUrl: `${hit.user.links.html}?${UTM}`,
    };
  } catch {
    return null;
  }
}
