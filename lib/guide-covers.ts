import type { PhotoKey } from '@/lib/photos';

/**
 * Обложка гайда. Держится отдельно от контента, потому что сами гайды
 * редактируются в Supabase, а подбор картинки — вопрос вёрстки.
 */
const COVERS: Record<string, PhotoKey> = {
  'apostille-attestat': 'documents',
  'gks-embassy-vs-university': 'passport',
  'csc-type-a-vs-b': 'library',
  'gpa-conversion': 'studying',
  'motivation-letter': 'graduation',
};

export const guideCover = (slug: string): PhotoKey => COVERS[slug] ?? 'documents';
