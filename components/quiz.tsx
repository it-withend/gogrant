'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Check, RotateCcw } from 'lucide-react';
import { matchScholarships, type Answers } from '@/lib/match';
import { CountryMark, CoverageBadge } from '@/components/ui';
import type { Scholarship } from '@/lib/types';

const STORAGE_KEY = 'grant-uz:quiz:v1';

type Step = {
  key: keyof Answers;
  question: string;
  hint?: string;
  multi?: boolean;
  options: { value: string | number; label: string; note?: string }[];
};

const FIELDS = [
  'IT', 'инженерия', 'медицина', 'бизнес', 'дизайн', 'международные отношения',
  'естественные науки', 'архитектура', 'педагогика', 'сельское хозяйство',
];

const STEPS: Step[] = [
  {
    key: 'age',
    question: 'Сколько тебе будет на момент подачи?',
    hint: 'Возраст — самое жёсткое ограничение: если не проходишь, заявку отклонят автоматически.',
    options: [
      { value: 16, label: '16–17' },
      { value: 18, label: '18–19' },
      { value: 20, label: '20–21' },
      { value: 22, label: '22 и старше' },
    ],
  },
  {
    key: 'fields',
    question: 'Куда собираешься поступать?',
    hint: 'Можно выбрать несколько. Если не определился — пропусти, на результат это влияет умеренно.',
    multi: true,
    options: FIELDS.map((f) => ({ value: f, label: f })),
  },
  {
    key: 'english',
    question: 'Какой у тебя английский?',
    options: [
      { value: 'none', label: 'Почти никакой' },
      { value: 'basic', label: 'Понимаю и объясняюсь', note: 'примерно A2–B1' },
      { value: 'b2', label: 'Свободно, но без сертификата', note: 'примерно B2' },
      { value: 'ielts', label: 'Есть сертификат', note: 'IELTS, TOEFL или Duolingo' },
    ],
  },
  {
    key: 'otherLanguages',
    question: 'Какие ещё языки знаешь хотя бы на бытовом уровне?',
    hint: 'Не обязательно свободно. Даже базовый уровень — плюс на отборе.',
    multi: true,
    options: [
      { value: 'ru', label: 'Русский' },
      { value: 'tr', label: 'Турецкий' },
      { value: 'ko', label: 'Корейский' },
      { value: 'zh', label: 'Китайский' },
    ],
  },
  {
    key: 'gpa',
    question: 'Какой у тебя средний балл по пятибалльной?',
    hint: 'Если не считал — открой калькулятор GPA, он рядом.',
    options: [
      { value: 'low', label: 'Ниже 3.5' },
      { value: 'mid', label: '3.5 – 4.0' },
      { value: 'good', label: '4.0 – 4.5' },
      { value: 'top', label: 'Выше 4.5' },
    ],
  },
  {
    key: 'familySupport',
    question: 'Сколько семья сможет присылать каждый месяц?',
    hint: 'Отвечай честно. От этого зависит, подойдёт ли программа, которая покрывает только обучение.',
    options: [
      { value: 0, label: 'Нисколько', note: 'нужен грант, который закрывает всё' },
      { value: 150, label: 'До 150 долларов' },
      { value: 400, label: '150 – 400 долларов' },
      { value: 401, label: 'Больше 400 долларов' },
    ],
  },
  {
    key: 'region',
    question: 'Куда хочешь больше?',
    options: [
      { value: 'europe', label: 'Европа' },
      { value: 'asia', label: 'Азия' },
      { value: 'cis', label: 'СНГ' },
      { value: 'any', label: 'Всё равно, лишь бы грант' },
    ],
  },
  {
    key: 'languageYear',
    question: 'Готов потратить год на языковую подготовку до основной учёбы?',
    hint: 'В Турции, Корее и Китае этот год чаще всего обязателен и оплачивается грантом.',
    options: [
      { value: 'yes', label: 'Да, год не жалко' },
      { value: 'no', label: 'Нет, хочу сразу на программу' },
    ],
  },
];

type Draft = Partial<Record<keyof Answers, unknown>>;

export function Quiz({ scholarships }: { scholarships: Scholarship[] }) {
  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>({});
  const [done, setDone] = useState(false);
  const [restored, setRestored] = useState(false);

  // Прогресс живёт в localStorage — регистрация для MVP не нужна
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { draft: Draft; done: boolean };
        if (saved.draft && Object.keys(saved.draft).length) {
          setDraft(saved.draft);
          setDone(Boolean(saved.done));
          setRestored(true);
        }
      }
    } catch {
      /* приватный режим браузера — просто начинаем заново */
    }
  }, []);

  useEffect(() => {
    if (!Object.keys(draft).length) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ draft, done }));
    } catch {
      /* нет доступа к хранилищу — не критично */
    }
  }, [draft, done]);

  const current = STEPS[step];

  const results = useMemo(() => {
    if (!done) return [];
    return matchScholarships(scholarships, {
      age: (draft.age as Answers['age']) ?? 18,
      fields: (draft.fields as string[]) ?? [],
      english: (draft.english as Answers['english']) ?? 'basic',
      otherLanguages: (draft.otherLanguages as string[]) ?? [],
      gpa: (draft.gpa as Answers['gpa']) ?? 'mid',
      familySupport: (draft.familySupport as Answers['familySupport']) ?? 150,
      region: (draft.region as Answers['region']) ?? 'any',
      languageYear: (draft.languageYear as Answers['languageYear']) ?? 'yes',
    });
  }, [done, draft, scholarships]);

  function choose(value: string | number) {
    if (current.multi) {
      const prev = (draft[current.key] as (string | number)[]) ?? [];
      const next = prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value];
      setDraft({ ...draft, [current.key]: next });
      return;
    }
    setDraft({ ...draft, [current.key]: value });
    if (step + 1 < STEPS.length) setStep(step + 1);
    else setDone(true);
  }

  function reset() {
    setDraft({});
    setStep(0);
    setDone(false);
    setRestored(false);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* нет доступа к хранилищу */
    }
  }

  if (done) {
    return (
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-rule pb-4">
          <p className="font-mono text-xs text-ink-soft">Результат по твоим ответам</p>
          <button type="button" onClick={reset} className="btn-quiet">
            <RotateCcw size={15} strokeWidth={1.5} />
            Пройти заново
          </button>
        </div>

        <ol className="mt-8 space-y-5">
          {results.map((r, i) => (
            <li key={r.scholarship.slug} className={`plate p-5 ${r.blocked ? 'opacity-70' : ''}`}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                  <span className="tabular mt-1 font-mono text-xs text-stamp">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <CountryMark code={r.scholarship.country_code} size="sm" />
                      <CoverageBadge coverage={r.scholarship.coverage} />
                    </div>
                    <h3 className="mt-2.5 text-lg font-bold leading-snug">
                      <Link href={`/scholarships/${r.scholarship.slug}`} className="hover:text-stamp">
                        {r.scholarship.name}
                      </Link>
                    </h3>
                  </div>
                </div>

                <div className="text-right">
                  {r.blocked ? (
                    <span className="font-mono text-xs uppercase tracking-[0.1em] text-seal">не подходит</span>
                  ) : (
                    <>
                      <span className="tabular block font-mono text-3xl leading-none text-stamp">{r.score}%</span>
                      <span className="mt-1 block font-mono text-[0.62rem] uppercase tracking-[0.1em] text-ink-soft">
                        совпадение
                      </span>
                    </>
                  )}
                </div>
              </div>

              <ul className="mt-5 space-y-2 border-t border-rule pt-4">
                {r.reasons.map((reason, j) => (
                  <li key={j} className="flex gap-2.5 text-sm leading-relaxed">
                    <span
                      className={`mt-[0.55em] h-px w-3 shrink-0 ${
                        reason.kind === 'plus' ? 'bg-stamp' : reason.kind === 'minus' ? 'bg-amber' : 'bg-seal'
                      }`}
                    />
                    <span className={reason.kind === 'block' ? 'text-seal' : 'text-ink-soft'}>{reason.text}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>

        <p className="mt-8 border-t border-rule pt-5 text-sm leading-relaxed text-ink-soft">
          Процент — это вес твоих ответов по правилам подбора, а не вероятность поступления. Он нужен, чтобы понять,
          с какой программы начать разбираться. Дальше открывай карточку и сверяй требования на официальном портале.
        </p>
      </div>
    );
  }

  const selected = draft[current.key];
  const multiSelected = (selected as (string | number)[]) ?? [];

  return (
    <div>
      {restored && step === 0 && (
        <p className="mb-6 border border-rule bg-plate px-4 py-3 text-sm text-ink-soft">
          Нашлись твои прошлые ответы, они подставлены. Можно пройти заново —{' '}
          <button type="button" onClick={reset} className="text-stamp underline underline-offset-4">
            очистить
          </button>
          .
        </p>
      )}

      <div className="flex items-center gap-3">
        <span className="tabular font-mono text-xs text-ink-soft">
          {String(step + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
        </span>
        <span className="flex flex-1 gap-1">
          {STEPS.map((_, i) => (
            <span key={i} className={`h-1 flex-1 ${i <= step ? 'bg-stamp' : 'bg-rule'}`} />
          ))}
        </span>
      </div>

      <h2 className="mt-8 max-w-2xl text-2xl font-bold leading-snug tracking-tight">{current.question}</h2>
      {current.hint && <p className="mt-3 max-w-xl text-sm leading-relaxed text-ink-soft">{current.hint}</p>}

      <div className={`mt-7 grid gap-px border border-rule bg-rule ${current.multi ? 'sm:grid-cols-2' : ''}`}>
        {current.options.map((opt) => {
          const active = current.multi ? multiSelected.includes(opt.value) : selected === opt.value;
          return (
            <button
              key={String(opt.value)}
              type="button"
              onClick={() => choose(opt.value)}
              className={`flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors ${
                active ? 'bg-stamp text-plate' : 'bg-plate hover:bg-paper'
              }`}
            >
              <span>
                <span className="block text-sm font-medium">{opt.label}</span>
                {opt.note && (
                  <span className={`mt-0.5 block font-mono text-xs ${active ? 'text-plate/80' : 'text-ink-soft'}`}>
                    {opt.note}
                  </span>
                )}
              </span>
              {active && <Check size={16} strokeWidth={2} className="shrink-0" />}
            </button>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="btn-quiet disabled:opacity-40"
        >
          <ArrowLeft size={15} strokeWidth={1.5} />
          Назад
        </button>

        {current.multi && (
          <button
            type="button"
            onClick={() => (step + 1 < STEPS.length ? setStep(step + 1) : setDone(true))}
            className="btn"
          >
            {step + 1 < STEPS.length ? 'Дальше' : 'Показать результат'}
          </button>
        )}
      </div>
    </div>
  );
}
