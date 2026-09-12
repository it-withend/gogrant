'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, Plus, X } from 'lucide-react';

/**
 * Конвертер между шкалами оценок.
 *
 * У каждой шкалы задан максимум и минимальный проходной балл. Дальше есть два
 * способа пересчёта, и оба реально применяются приёмными комиссиями:
 *
 *   по диапазону — учитывается, что нижняя часть шкалы непроходная;
 *   пропорционально — простое отношение к максимуму.
 *
 * Показываются оба результата: разница между ними и есть та неопределённость,
 * из-за которой один и тот же аттестат в двух вузах считают по-разному.
 */

type Scale = {
  id: string;
  label: string;
  short: string;
  /** Минимальный проходной балл: ниже него оценка считается неудовлетворительной. */
  pass: number;
  max: number;
  decimals: number;
  note?: string;
};

const SCALES: Scale[] = [
  { id: 'five', label: '5-балльная', short: '5', pass: 2, max: 5, decimals: 2, note: 'Школы большинства стран СНГ' },
  { id: 'ten', label: '10-балльная', short: '10', pass: 4, max: 10, decimals: 2, note: 'Часть лицеев и вузов' },
  { id: 'twelve', label: '12-балльная', short: '12', pass: 4, max: 12, decimals: 2, note: 'Школы Украины' },
  { id: 'percent', label: '100-балльная (проценты)', short: '%', pass: 40, max: 100, decimals: 1, note: 'Процентные системы оценивания' },
  { id: 'gpa4', label: 'GPA 4.0', short: '4.0', pass: 0, max: 4, decimals: 2, note: 'США, Корея, часть азиатских вузов' },
  { id: 'gpa5', label: 'GPA 5.0', short: '5.0', pass: 0, max: 5, decimals: 2, note: 'Отдельные вузы Азии и Ближнего Востока' },
];

const byId = (id: string) => SCALES.find((s) => s.id === id)!;

/** Доля пройденного пути от проходного минимума до максимума, 0..1. */
const normRange = (v: number, s: Scale) => (v - s.pass) / (s.max - s.pass);

const convertRange = (v: number, from: Scale, to: Scale) => to.pass + normRange(v, from) * (to.max - to.pass);

const convertProportional = (v: number, from: Scale, to: Scale) => (v / from.max) * to.max;

const ECTS = [
  { grade: 'A', label: 'Отлично', from: 0.9167 },
  { grade: 'B', label: 'Очень хорошо', from: 0.8 },
  { grade: 'C', label: 'Хорошо', from: 0.6667 },
  { grade: 'D', label: 'Удовлетворительно', from: 0.5 },
  { grade: 'E', label: 'Посредственно', from: 0.3333 },
  { grade: 'F', label: 'Неудовлетворительно', from: -1 },
];

/** ECTS считается по доле диапазона, поэтому работает для любой исходной шкалы. */
const ectsFor = (ratio: number) => ECTS.find((e) => ratio >= e.from) ?? ECTS[ECTS.length - 1];

type Subject = { id: number; name: string; grade: string };

export function GpaCalculator() {
  const [fromId, setFromId] = useState('five');
  const [toId, setToId] = useState('gpa4');
  const [mode, setMode] = useState<'average' | 'subjects'>('average');
  const [average, setAverage] = useState('4.52');
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 1, name: 'Математика', grade: '5' },
    { id: 2, name: 'Физика', grade: '4' },
    { id: 3, name: 'Английский язык', grade: '5' },
  ]);

  const from = byId(fromId);
  const to = byId(toId);

  const value = useMemo(() => {
    if (mode === 'average') {
      const parsed = parseFloat(average.replace(',', '.'));
      return Number.isFinite(parsed) ? parsed : NaN;
    }
    const nums = subjects.map((s) => parseFloat(s.grade.replace(',', '.'))).filter((n) => Number.isFinite(n));
    if (!nums.length) return NaN;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
  }, [mode, average, subjects]);

  const valid = Number.isFinite(value) && value >= 0 && value <= from.max;
  const ratio = valid ? normRange(value, from) : 0;

  const rangeResult = valid ? convertRange(value, from, to) : NaN;
  const propResult = valid ? convertProportional(value, from, to) : NaN;
  const methodsDiffer = valid && Math.abs(rangeResult - propResult) >= 0.01;

  const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(to.decimals) : '—');
  // Подпись единицы: у процентов это знак, у остальных шкал — «из максимума»
  const unit = to.id === 'percent' ? '%' : `из ${to.max}`;

  function swap() {
    setFromId(toId);
    setToId(fromId);
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_19rem]">
      <div>
        {/* Выбор шкал */}
        <div className="border border-rule bg-plate p-5">
          <div className="grid items-end gap-4 sm:grid-cols-[1fr_auto_1fr]">
            <div>
              <label htmlFor="from" className="label">
                Из какой шкалы
              </label>
              <select
                id="from"
                value={fromId}
                onChange={(e) => setFromId(e.target.value)}
                className="mt-2 w-full rounded-sm border border-rule bg-paper px-3 py-2.5 text-sm focus:border-stamp"
              >
                {SCALES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 font-mono text-[0.65rem] text-ink-soft">
                проходной {from.pass}, максимум {from.max}
              </p>
            </div>

            <button
              type="button"
              onClick={swap}
              className="mb-7 hidden h-9 w-9 items-center justify-center border border-rule bg-paper text-ink-soft transition-colors hover:border-ink hover:text-ink sm:flex"
              aria-label="Поменять шкалы местами"
              title="Поменять местами"
            >
              <ArrowRight size={15} strokeWidth={1.5} />
            </button>

            <div>
              <label htmlFor="to" className="label">
                В какую шкалу
              </label>
              <select
                id="to"
                value={toId}
                onChange={(e) => setToId(e.target.value)}
                className="mt-2 w-full rounded-sm border border-rule bg-paper px-3 py-2.5 text-sm focus:border-stamp"
              >
                {SCALES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 font-mono text-[0.65rem] text-ink-soft">
                проходной {to.pass}, максимум {to.max}
              </p>
            </div>
          </div>
        </div>

        {/* Ввод значения */}
        <div className="mt-6 flex gap-px border border-rule bg-rule">
          {(
            [
              ['average', 'Средний балл известен'],
              ['subjects', 'Оценки по предметам'],
            ] as const
          ).map(([v, label]) => (
            <button
              key={v}
              type="button"
              onClick={() => setMode(v)}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                mode === v ? 'bg-stamp text-plate' : 'bg-plate hover:bg-paper'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {mode === 'average' ? (
          <div className="mt-6">
            <label htmlFor="avg" className="label">
              Средний балл по шкале «{from.label}»
            </label>
            <input
              id="avg"
              inputMode="decimal"
              value={average}
              onChange={(e) => setAverage(e.target.value)}
              className="tabular mt-3 w-full max-w-[13rem] rounded-sm border border-rule bg-plate px-4 py-3 font-mono text-2xl text-ink focus:border-stamp"
              placeholder={String(from.max)}
            />
            {!valid && average.trim() !== '' && (
              <p className="mt-2 text-sm text-seal">
                Для этой шкалы допустимы значения от 0 до {from.max}.
              </p>
            )}
          </div>
        ) : (
          <div className="mt-6">
            <p className="label">Оценки по шкале «{from.label}»</p>
            <ul className="mt-3 space-y-px border border-rule bg-rule">
              {subjects.map((s) => (
                <li key={s.id} className="flex items-center gap-3 bg-plate px-3 py-2">
                  <input
                    value={s.name}
                    onChange={(e) => setSubjects((p) => p.map((x) => (x.id === s.id ? { ...x, name: e.target.value } : x)))}
                    placeholder="Предмет"
                    className="min-w-0 flex-1 bg-transparent px-1 py-1.5 text-sm focus:outline-none"
                  />
                  <input
                    value={s.grade}
                    inputMode="decimal"
                    onChange={(e) => setSubjects((p) => p.map((x) => (x.id === s.id ? { ...x, grade: e.target.value } : x)))}
                    className="tabular w-16 rounded-sm border border-rule bg-paper px-2 py-1.5 text-center font-mono text-sm focus:border-stamp"
                  />
                  <button
                    type="button"
                    onClick={() => setSubjects((p) => p.filter((x) => x.id !== s.id))}
                    className="p-1 text-ink-soft hover:text-seal"
                    aria-label={`Удалить ${s.name || 'предмет'}`}
                  >
                    <X size={15} strokeWidth={1.5} />
                  </button>
                </li>
              ))}
            </ul>

            <div className="mt-3 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setSubjects((p) => [...p, { id: Date.now(), name: '', grade: String(from.max) }])}
                className="btn-quiet"
              >
                <Plus size={15} strokeWidth={1.5} />
                Добавить предмет
              </button>
              {valid && (
                <p className="tabular font-mono text-xs text-ink-soft">
                  средний балл: {value.toFixed(2)}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Результаты */}
        <div className="mt-10 grid gap-px border border-rule bg-rule sm:grid-cols-2">
          <div className="bg-plate p-6">
            <p className="label">По проходному диапазону</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink">
              {fmt(rangeResult)}
              <span className="ml-2 align-baseline font-mono text-base text-ink-soft">{unit}</span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              Считается, что оценки ниже {from.pass} непроходные, и диапазон {from.pass}–{from.max} растягивается
              на {to.pass}–{to.max}.
            </p>
          </div>

          <div className="bg-plate p-6">
            <p className="label">Пропорционально</p>
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink">
              {fmt(propResult)}
              <span className="ml-2 align-baseline font-mono text-base text-ink-soft">{unit}</span>
            </p>
            <p className="mt-3 text-xs leading-relaxed text-ink-soft">
              Простое отношение к максимуму шкалы, без учёта проходного минимума.
            </p>
          </div>
        </div>

        {methodsDiffer && (
          <p className="mt-4 border-l-2 border-amber bg-plate px-4 py-3 text-sm leading-relaxed text-ink-soft">
            Два метода дают разный результат: расхождение {Math.abs(rangeResult - propResult).toFixed(to.decimals)}
            {to.id === 'percent' ? '%' : ' балла'}. Какой метод применит конкретный вуз, заранее неизвестно, поэтому
            в расчётах обычно ориентируются на меньшее из двух значений.
          </p>
        )}

        <div className="mt-8 border-l-2 border-amber bg-plate p-5">
          <p className="text-sm font-semibold text-ink">Это приблизительная конвертация, а не официальная</p>
          <p className="mt-2 text-sm leading-[1.7] text-ink-soft">
            Единого официального соответствия между национальными шкалами не существует. Расхождение между методами
            и между вузами доходит до 0.3–0.5 балла GPA. Если у программы есть собственная таблица конвертации, она
            главнее любого калькулятора — на странице приёма её обычно находят по словам grade conversion,
            grading scale или equivalence table.
          </p>
          <p className="mt-3 text-sm leading-[1.7] text-ink-soft">
            В переводе аттестата оценки переносятся как есть. Конвертацию делает приёмная комиссия, а пересчитанные
            цифры в переводе читаются как попытка завысить балл.
          </p>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
        <div className="plate p-5">
          <p className="label">Оценка по ECTS</p>
          {valid ? (
            <>
              <p className="tabular mt-3 font-mono text-4xl leading-none text-stamp">{ectsFor(ratio).grade}</p>
              <p className="mt-2 text-sm text-ink-soft">{ectsFor(ratio).label}</p>
            </>
          ) : (
            <p className="tabular mt-3 font-mono text-4xl leading-none text-ink-soft">—</p>
          )}

          <table className="mt-4 w-full border-collapse border-t border-rule text-sm">
            <tbody>
              {ECTS.map((e) => {
                const active = valid && ectsFor(ratio).grade === e.grade;
                return (
                  <tr key={e.grade} className={`border-b border-rule last:border-0 ${active ? 'text-stamp' : 'text-ink-soft'}`}>
                    <td className="py-2 font-mono font-medium">{e.grade}</td>
                    <td className="py-2">{e.label}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="plate p-5">
          <p className="label">Формулы</p>
          <pre className="mt-3 overflow-x-auto border border-rule bg-paper p-3 font-mono text-[0.7rem] leading-relaxed text-ink">
{`по диапазону
  доля = (балл − ${from.pass}) / ${from.max - from.pass}
  итог = ${to.pass} + доля × ${to.max - to.pass}

пропорционально
  итог = балл / ${from.max} × ${to.max}`}
          </pre>
        </div>

        <div className="plate p-5">
          <p className="label">Шкалы в конвертере</p>
          <ul className="mt-3 space-y-2.5 border-t border-rule pt-3 text-sm">
            {SCALES.map((s) => (
              <li key={s.id}>
                <span className="font-medium text-ink">{s.label}</span>
                {s.note && <span className="mt-0.5 block text-xs leading-relaxed text-ink-soft">{s.note}</span>}
              </li>
            ))}
          </ul>
        </div>
      </aside>
    </div>
  );
}
