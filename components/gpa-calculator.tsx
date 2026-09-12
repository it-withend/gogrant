'use client';

import { useMemo, useState } from 'react';
import { Plus, X } from 'lucide-react';

/**
 * Линейная конвертация: диапазон 2–5 растягивается на 0–4.
 * Это приближение, и оно подписано как приближение в самом интерфейсе —
 * официальная таблица вуза всегда главнее.
 */
function toGpa4(avg: number) {
  return Math.max(0, Math.min(4, ((avg - 2) / 3) * 4));
}

function toPercent(avg: number) {
  return Math.max(0, Math.min(100, (avg / 5) * 100));
}

const ECTS = [
  { grade: 'A', label: 'Отлично', from: 4.75, to: 5.0 },
  { grade: 'B', label: 'Очень хорошо', from: 4.4, to: 4.74 },
  { grade: 'C', label: 'Хорошо', from: 4.0, to: 4.39 },
  { grade: 'D', label: 'Удовлетворительно', from: 3.5, to: 3.99 },
  { grade: 'E', label: 'Посредственно', from: 3.0, to: 3.49 },
  { grade: 'F', label: 'Неудовлетворительно', from: 0, to: 2.99 },
];

function ectsFor(avg: number) {
  return ECTS.find((e) => avg >= e.from && avg <= e.to) ?? ECTS[ECTS.length - 1];
}

type Subject = { id: number; name: string; grade: string };

export function GpaCalculator() {
  const [mode, setMode] = useState<'average' | 'subjects'>('average');
  const [average, setAverage] = useState('4.52');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Математика', grade: '5' },
    { id: 2, name: 'Физика', grade: '4' },
    { id: 3, name: 'Английский язык', grade: '5' },
  ]);

  const avg = useMemo(() => {
    if (mode === 'average') {
      const parsed = parseFloat(average.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    const nums = subjects.map((s) => parseFloat(s.grade.replace(',', '.'))).filter((n) => Number.isFinite(n) && n > 0);
    if (!nums.length) return NaN;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }, [mode, average, subjects]);

  const valid = Number.isFinite(avg) && avg >= 1 && avg <= 5;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
      <div>
        <div className="flex gap-px border border-rule bg-rule">
          {(
            [
              ['average', 'Знаю средний балл'],
              ['subjects', 'Введу оценки по предметам'],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === value ? 'bg-stamp text-plate' : 'bg-plate hover:bg-paper'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'average' ? (
          <div className="mt-8">
            <label htmlFor="avg" className="label">
              Средний балл аттестата по 5-балльной
            </label>
            <input
              id="avg"
              inputMode="decimal"
              value={average}
              onChange={(e) => setAverage(e.target.value)}
              className="tabular mt-3 w-full max-w-[12rem] rounded-sm border border-rule bg-plate px-4 py-3 font-mono text-2xl text-ink focus:border-stamp"
              placeholder="4.52"
            />
            {!valid && average.trim() !== '' && (
              <p className="mt-2 text-sm text-seal">Введи число от 1 до 5, например 4.52.</p>
            )}
          </div>
        ) : (
          <div className="mt-8">
            <p className="label">Оценки по предметам</p>
            <ul className="mt-3 space-y-px border border-rule bg-rule">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center gap-3 bg-plate px-3 py-2">
                  <input
                    value={s.name}
                    onChange={(e) =>
                      setSubjects((prev) => prev.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))
                    }
                    placeholder="Предмет"
                    className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm focus:outline-none"
                  />
                  <input
                    value={s.grade}
                    inputMode="decimal"
                    onChange={(e) =>
                      setSubjects((prev) => prev.map((x) => (x.id === s.id ? { ...x, grade: e.target.value } : x)))
                    }
                    className="tabular w-14 rounded-sm border border-rule bg-paper px-2 py-1.5 text-center font-mono text-sm focus:border-stamp"
                  />
                  <button
                    type="button"
                    onClick={() => setSubjects((prev) => prev.filter((x) => x.id !== s.id))}
                    className="p-1 text-ink-soft hover:text-seal"
                    aria-label={`Удалить ${s.name || 'предмет'}`}
                  >
                    <X size={15} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => setSubjects((prev) => [...prev, { id: Date.now(), name: '', grade: '5' }])}
              className="btn-quiet mt-3"
            >
              <Plus size={15} strokeWidth={1.5} />
              Добавить предмет
            </button>
          </div>
        )}

        <div className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-3">
          <div className="bg-plate p-5">
            <p className="label">GPA по шкале 4.0</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink">{valid ? toGpa4(avg).toFixed(2) : '—'}</p>
          </div>
          <div className="bg-plate p-5">
            <p className="label">Процент</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink">
              {valid ? `${toPercent(avg).toFixed(1)}%` : '—'}
            </p>
          </div>
          <div className="bg-plate p-5">
            <p className="label">ECTS</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink">{valid ? ectsFor(avg).grade : '—'}</p>
            {valid && <p className="mt-2 text-xs text-ink-soft">{ectsFor(avg).label}</p>}
          </div>
        </div>

        {valid && mode === 'subjects' && (
          <p className="mt-4 font-mono text-xs text-ink-soft">
            Средний балл по введённым предметам: {avg.toFixed(2)}
          </p>
        )}

        <div className="mt-8 border-l-2 border-amber bg-plate p-5">
          <p className="text-sm font-semibold text-ink">Это приблизительная конвертация, а не официальная</p>
          <p className="mt-2 text-sm leading-[1.7] text-ink-soft">
            Формула растягивает диапазон 2–5 на шкалу 0–4. Разные вузы считают по-разному, и расхождение доходит до
            0.3–0.5 балла. Если у твоей программы есть своя таблица конвертации, она главнее этого калькулятора —
            ищи на странице приёма слова grade conversion или equivalence table.
          </p>
          <p className="mt-3 text-sm leading-[1.7] text-ink-soft">
            И не пересчитывай оценки сам в переводе аттестата. Переводчик переносит их как есть, конвертацию делает
            приёмная комиссия.
          </p>
        </div>
      </div>

      <aside className="lg:sticky lg:top-20 lg:self-start">
        <div className="plate p-5">
          <p className="label">Шкала ECTS</p>
          <table className="mt-3 w-full border-collapse text-sm">
            <tbody>
              {ECTS.map((e) => {
                const active = valid && ectsFor(avg).grade === e.grade;
                return (
                  <tr key={e.grade} className={`border-b border-rule last:border-0 ${active ? 'text-stamp' : 'text-ink-soft'}`}>
                    <td className="py-2 font-mono font-medium">{e.grade}</td>
                    <td className="py-2">{e.label}</td>
                    <td className="tabular py-2 text-right font-mono text-xs">
                      {e.from === 0 ? '< 3.00' : `${e.from.toFixed(2)}–${e.to.toFixed(2)}`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="plate mt-5 p-5">
          <p className="label">Формулы</p>
          <pre className="mt-3 overflow-x-auto border border-rule bg-paper p-3 font-mono text-xs leading-relaxed text-ink">
{`GPA  = (балл − 2) / 3 × 4
%    = балл / 5 × 100`}
          </pre>
        </div>
      </aside>
    </div>
  );
}
