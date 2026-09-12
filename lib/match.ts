import { plural } from '@/lib/dates';
import type { Scholarship } from '@/lib/types';

/**
 * Rule-based подбор. Никакого ML: прозрачное дерево условий, каждое из которых
 * умеет объяснить себя словами. Объяснение важнее самого процента — по нему
 * видно, что именно решило дело и что можно исправить.
 *
 * Счёт считается как доля набранного от максимально возможного ИМЕННО для
 * этой программы. Если просто складывать бонусы, все полные гранты упираются
 * в потолок и становятся неразличимы; нормировка сохраняет разницу.
 */

export type Answers = {
  age: 16 | 18 | 20 | 22;
  fields: string[];
  english: 'none' | 'basic' | 'b2' | 'ielts';
  otherLanguages: string[]; // 'tr' | 'ko' | 'zh' | 'ru'
  gpa: 'low' | 'mid' | 'good' | 'top';
  familySupport: 0 | 150 | 400 | 401;
  region: 'europe' | 'asia' | 'cis' | 'any';
  languageYear: 'yes' | 'no';
};

export type MatchReason = { kind: 'plus' | 'minus' | 'block'; text: string };

export type MatchResult = {
  scholarship: Scholarship;
  score: number;
  blocked: boolean;
  reasons: MatchReason[];
};

const GPA_VALUE: Record<Answers['gpa'], number> = { low: 3.2, mid: 3.8, good: 4.3, top: 4.8 };
const LANG_CODE: Record<string, string> = { Турецкий: 'tr', Корейский: 'ko', Китайский: 'zh', Русский: 'ru' };

const years = (n: number) => `${n} ${plural(n, 'год', 'года', 'лет')}`;

export function matchScholarships(all: Scholarship[], a: Answers): MatchResult[] {
  return all
    .map((s) => evaluate(s, a))
    .sort((x, y) => {
      if (x.blocked !== y.blocked) return x.blocked ? 1 : -1;
      return y.score - x.score;
    });
}

function evaluate(s: Scholarship, a: Answers): MatchResult {
  const reasons: MatchReason[] = [];
  let blocked = false;

  // earned — что набрано, possible — сколько можно было набрать по тем же
  // правилам при идеальных ответах. Отношение и даёт процент.
  let earned = 0;
  let possible = 0;

  const rule = (points: number, max: number, reason?: MatchReason) => {
    earned += points;
    possible += max;
    if (reason) reasons.push(reason);
  };

  // --- Возраст: единственное жёсткое ограничение
  if (s.requirements.age_max) {
    const limit = s.requirements.age_max;
    if (a.age > limit) {
      blocked = true;
      reasons.push({
        kind: 'block',
        text: `Верхняя граница возраста — ${years(limit)}, а ты уже старше. Это формальное требование, обойти его нельзя.`,
      });
    } else if (limit - a.age <= 1) {
      rule(6, 12, {
        kind: 'minus',
        text: `По возрасту проходишь впритык: предел — ${years(limit)}. Подавайся в ближайший сезон, следующего для тебя может не быть.`,
      });
    } else {
      rule(12, 12, { kind: 'plus', text: `По возрасту проходишь с запасом, предел — ${years(limit)}.` });
    }
  } else {
    rule(12, 12, { kind: 'plus', text: 'Верхней границы возраста нет вообще.' });
  }

  // --- Средний балл
  const gpa = GPA_VALUE[a.gpa];
  if (s.requirements.gpa_min_5) {
    const need = s.requirements.gpa_min_5;
    if (gpa >= need + 0.3) {
      rule(18, 18, { kind: 'plus', text: `Твой средний балл уверенно выше порога ${need.toFixed(2)}.` });
    } else if (gpa >= need) {
      rule(11, 18, {
        kind: 'plus',
        text: `Средний балл проходит порог ${need.toFixed(2)}, но без запаса — конкурс тут идёт как раз по баллам.`,
      });
    } else {
      rule(0, 18, {
        kind: 'minus',
        text: `Заявленный порог — ${need.toFixed(2)}, у тебя ниже. Шанс остаётся, но придётся компенсировать языком и мотивационным письмом.`,
      });
    }
  } else {
    rule(18, 18, { kind: 'plus', text: 'Формального порога по среднему баллу нет — решают вступительные испытания.' });
  }

  // --- Деньги: для программ с неполным покрытием это решающий фактор
  if (s.coverage !== 'full') {
    if (a.familySupport === 0) {
      rule(0, 26, {
        kind: 'minus',
        text: 'Грант не покрывает проживание, а помощи из дома не будет. Это главный риск: учёба бесплатная, но жить не на что.',
      });
    } else if (a.familySupport === 150) {
      rule(10, 26, {
        kind: 'minus',
        text: 'До 150 долларов в месяц для этой программы впритык. Считай бюджет заранее и закладывай подработку.',
      });
    } else {
      rule(24, 26, { kind: 'plus', text: 'Твоей поддержки из дома хватает, чтобы закрыть непокрытую часть расходов.' });
    }
  } else {
    if (a.familySupport === 0) {
      rule(26, 26, {
        kind: 'plus',
        text: 'Грант полный: обучение, жильё и ежемесячные деньги входят, верхнего порога по доходу семьи нет.',
      });
    } else {
      rule(24, 26, { kind: 'plus', text: 'Полное покрытие — деньги из дома понадобятся только на старте.' });
    }
  }

  // --- Языки
  const known = new Set(a.otherLanguages);
  const localLang = s.requirements.languages.find((l) => LANG_CODE[l.lang] && known.has(LANG_CODE[l.lang]));
  const englishReq = s.requirements.languages.find((l) => l.lang === 'Английский');

  if (s.requirements.languages.some((l) => LANG_CODE[l.lang])) {
    if (localLang) {
      rule(14, 14, {
        kind: 'plus',
        text: `Ты уже знаешь ${localLang.lang.toLowerCase()} — это заметное преимущество на отборе.`,
      });
    } else {
      rule(4, 14, {
        kind: 'minus',
        text: 'Местного языка пока нет. Не блокирует, но учить придётся с нуля и параллельно с учёбой.',
      });
    }
  }

  if (englishReq) {
    if (a.english === 'ielts') {
      rule(16, 16, { kind: 'plus', text: 'Есть сертификат по английскому — требование закрыто документально.' });
    } else if (a.english === 'b2') {
      rule(11, 16, { kind: 'plus', text: 'Уровень английского подходит, но сертификат всё равно придётся сдать.' });
    } else if (a.english === 'basic') {
      rule(4, 16, {
        kind: 'minus',
        text: `Нужен английский уровня ${englishReq.level}, у тебя пока ниже. Время подтянуть есть, но начинать надо сейчас.`,
      });
    } else {
      rule(localLang ? 6 : 0, 16, {
        kind: 'minus',
        text: localLang
          ? 'Английского нет, но местный язык частично это компенсирует — ищи программы на нём.'
          : 'Ни английского, ни местного языка. Для этой программы это почти закрытая дверь.',
      });
    }
  }

  // --- Языковой год
  if (s.quiz.needs_language_year) {
    if (a.languageYear === 'yes') {
      rule(10, 10, { kind: 'plus', text: 'Обязательный языковой год тебя устраивает — здесь он встроен в программу.' });
    } else {
      rule(0, 10, {
        kind: 'minus',
        text: 'Тут почти всегда есть обязательный год языка, то есть учёба растянется на год дольше. Ты отметил, что этого не хочешь.',
      });
    }
  } else {
    rule(a.languageYear === 'no' ? 10 : 8, 10, {
      kind: 'plus',
      text: 'Языковой подготовки не требуется — заходишь сразу на основную программу.',
    });
  }

  // --- Регион
  if (a.region !== 'any') {
    if (s.quiz.region === a.region) {
      rule(14, 14, { kind: 'plus', text: 'Регион совпадает с тем, что ты выбрал.' });
    } else {
      rule(2, 14, {
        kind: 'minus',
        text: 'Регион не тот, который ты предпочёл. Всё остальное при этом может подходить.',
      });
    }
  }

  // --- Направление
  if (a.fields.length) {
    const hit = a.fields.filter((f) => s.quiz.strong_fields.includes(f));
    if (hit.length) {
      rule(12, 12, { kind: 'plus', text: `Твоё направление (${hit.join(', ')}) — одно из сильных мест этой программы.` });
    } else {
      rule(4, 12, {
        kind: 'minus',
        text: 'Твоего направления нет среди типичных для этой программы. Загляни в каталог вузов — оно может там найтись.',
      });
    }
  }

  const score = possible === 0 ? 0 : Math.max(5, Math.min(99, Math.round((earned / possible) * 100)));

  return { scholarship: s, blocked, score: blocked ? 0 : score, reasons };
}
