/**
 * Реестр фотографий.
 *
 * Снимки подобраны вручную по смыслу каждой секции и захардкожены по id
 * Unsplash. Так они работают без ключа API и не меняются при пересборке —
 * на сайте про документы и дедлайны случайная картинка выглядела бы странно.
 *
 * Лицензия Unsplash разрешает использование без атрибуции, но ссылка на
 * источник выводится под фото: это честно по отношению к авторам.
 */

export type PhotoKey =
  | 'hero'
  | 'graduation'
  | 'documents'
  | 'passport'
  | 'airport'
  | 'library'
  | 'studying'
  | 'country-hu'
  | 'country-tr'
  | 'country-kr'
  | 'country-ru'
  | 'country-cn';

type Entry = { id: string; alt: string };

const REGISTRY: Record<PhotoKey, Entry> = {
  hero: { id: 'photo-1541339907198-e08756dedf3f', alt: 'Выпускники подбрасывают академические шапочки' },
  graduation: { id: 'photo-1590012314607-cda9d9b699ae', alt: 'Выпускники в мантиях на церемонии вручения дипломов' },
  documents: { id: 'photo-1454496406107-dc34337da8d6', alt: 'Паспорт и бумаги на столе' },
  passport: { id: 'photo-1581553673739-c4906b5d0de8', alt: 'Раскрытый паспорт с визовыми штампами' },
  airport: { id: 'photo-1666185761906-9136613bace8', alt: 'Пассажиры в зале вылета аэропорта' },
  library: { id: 'photo-1683319598210-d70486f2f996', alt: 'Студенты занимаются в университетской библиотеке' },
  studying: { id: 'photo-1514369118554-e20d93546b30', alt: 'Студентка пишет в тетради' },
  'country-hu': { id: 'photo-1616432902940-b7a1acbc60b3', alt: 'Здание венгерского парламента на берегу Дуная, Будапешт' },
  'country-tr': { id: 'photo-1710162518260-1d200de27e1f', alt: 'Историческое здание в Стамбуле' },
  'country-kr': { id: 'photo-1742747215638-0105cbcd2645', alt: 'Учебный корпус, увитый плющом, кампус в Сеуле' },
  'country-ru': { id: 'photo-1523509080324-9183f313dc50', alt: 'Главное здание Московского государственного университета' },
  'country-cn': { id: 'photo-1667659814820-b770554ecae2', alt: 'Здание с традиционной черепичной крышей у воды, Пекин' },
};

export type Photo = { url: string; alt: string; source: string };

/** w — ширина отдаваемого файла: под каждый размер блока своя, чтобы не тянуть лишнее. */
export function photo(key: PhotoKey, w = 1200): Photo {
  const entry = REGISTRY[key];
  return {
    url: `https://images.unsplash.com/${entry.id}?w=${w}&q=75&fm=jpg&fit=crop&auto=format`,
    alt: entry.alt,
    source: 'https://unsplash.com',
  };
}

const COUNTRY_KEYS: Record<string, PhotoKey> = {
  HU: 'country-hu',
  TR: 'country-tr',
  KR: 'country-kr',
  RU: 'country-ru',
  CN: 'country-cn',
};

export function countryPhoto(code: string, w = 1200): Photo {
  return photo(COUNTRY_KEYS[code] ?? 'graduation', w);
}
