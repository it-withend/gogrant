export type Coverage = 'full' | 'partial' | 'tuition_only';

export type CoverageItem = {
  label: string;
  included: boolean;
  note?: string;
};

export type Requirements = {
  age_max?: number;
  age_min?: number;
  gpa_min_5?: number;
  /** true — формальный проходной порог, ниже которого заявку не рассматривают;
   *  без флага порог справочный, конкурс идёт не строго по нему. */
  gpa_hard?: boolean;
  gpa_note?: string;
  languages: { lang: string; level: string; note?: string }[];
  education_level: string;
};

export type ApplicationWindow = {
  year: number;
  opens: string; // ISO
  closes: string; // ISO
  note?: string;
};

export type BudgetItem = {
  label: string;
  amount_usd_min: number;
  amount_usd_max: number;
  note?: string;
};

export type Budget = {
  visa: BudgetItem;
  flight: BudgetItem;
  first_month: BudgetItem;
  blocked_account?: BudgetItem;
  as_of: string;
};

export type QuizProfile = {
  region: 'europe' | 'asia' | 'cis';
  income_sensitive: boolean; // грант реально закрывает жизнь без денег из дома
  needs_language_year: boolean; // есть подготовительный год языка
  strong_fields: string[];
};

export type Scholarship = {
  slug: string;
  country: string;
  country_code: string;
  name: string;
  name_original?: string;
  coverage: Coverage;
  coverage_summary: string;
  honest_note: string;
  /** Условия, при которых грант можно потерять на второй и следующие годы —
   *  порог по успеваемости, посещаемость, продление визы и т.д. */
  renewal_note: string;
  coverage_items: CoverageItem[];
  stipend_note: string;
  requirements: Requirements;
  documents: string[];
  steps: { title: string; body: string }[];
  windows: ApplicationWindow[];
  portal_url: string;
  contact: { label: string; value: string }[];
  budget: Budget;
  quiz: QuizProfile;
  guide_slugs: string[];
};

export type Guide = {
  slug: string;
  title: string;
  summary: string;
  reading_minutes: number;
  updated_at: string;
  related_scholarships: string[];
  body: string; // markdown
};
