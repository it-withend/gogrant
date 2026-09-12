import Link from 'next/link';
import type { ReactNode } from 'react';

/**
 * Компактный рендер markdown в React-элементы. Взят вместо библиотеки,
 * потому что гайдам нужен ровно этот набор: заголовки, списки, таблицы,
 * картинки-скриншоты, код, жирный шрифт и ссылки — и ноль innerHTML.
 */

type Block =
  | { t: 'h2' | 'h3'; text: string }
  | { t: 'p'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'pre'; text: string }
  | { t: 'table'; head: string[]; rows: string[][] }
  | { t: 'img'; alt: string; src: string };

function parse(md: string): Block[] {
  const lines = md.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let i = 0;

  const isTableRow = (l: string) => l.trim().startsWith('|') && l.trim().endsWith('|');
  const cells = (l: string) =>
    l.trim().slice(1, -1).split('|').map((c) => c.trim());

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) { i++; continue; }

    const img = line.trim().match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
    if (img) { blocks.push({ t: 'img', alt: img[1], src: img[2] }); i++; continue; }

    const h = line.match(/^(#{2,3})\s+(.*)$/);
    if (h) { blocks.push({ t: h[1].length === 2 ? 'h2' : 'h3', text: h[2] }); i++; continue; }

    if (isTableRow(line) && isTableRow(lines[i + 1] ?? '') && /^[\s|:-]+$/.test(lines[i + 1])) {
      const head = cells(line);
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && isTableRow(lines[i])) { rows.push(cells(lines[i])); i++; }
      blocks.push({ t: 'table', head, rows });
      continue;
    }

    if (/^\s{4}\S/.test(line)) {
      const buf: string[] = [];
      while (i < lines.length && (/^\s{4}/.test(lines[i]) || !lines[i].trim())) {
        if (!lines[i].trim() && !/^\s{4}/.test(lines[i + 1] ?? '')) break;
        buf.push(lines[i].replace(/^\s{4}/, ''));
        i++;
      }
      blocks.push({ t: 'pre', text: buf.join('\n').trim() });
      continue;
    }

    const bullet = line.match(/^\s*[-*]\s+(.*)$/);
    const numbered = line.match(/^\s*\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      const ordered = Boolean(numbered);
      const items: string[] = [];
      while (i < lines.length) {
        const m = ordered ? lines[i].match(/^\s*\d+\.\s+(.*)$/) : lines[i].match(/^\s*[-*]\s+(.*)$/);
        if (m) { items.push(m[1]); i++; continue; }
        // продолжение пункта с отступом
        if (/^\s{2,}\S/.test(lines[i]) && items.length) { items[items.length - 1] += ' ' + lines[i].trim(); i++; continue; }
        break;
      }
      blocks.push({ t: ordered ? 'ol' : 'ul', items });
      continue;
    }

    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|\s*[-*]\s|\s*\d+\.\s|\|)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    blocks.push({ t: 'p', text: buf.join(' ') });
  }

  return blocks;
}

/** Инлайновая разметка: **жирный**, `код`, [ссылка](url). */
function inline(text: string, keyBase: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*)|(`[^`]+`)|(\[[^\]]+\]\([^)]+\))/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let n = 0;

  while ((m = re.exec(text))) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const token = m[0];
    const key = `${keyBase}-${n++}`;

    if (token.startsWith('**')) {
      out.push(<strong key={key} className="font-semibold text-ink">{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      out.push(<code key={key} className="bg-paper border border-rule px-1 py-0.5 font-mono text-[0.9em]">{token.slice(1, -1)}</code>);
    } else {
      const link = token.match(/^\[([^\]]+)\]\(([^)]+)\)$/)!;
      const href = link[2];
      const external = /^https?:/.test(href);
      out.push(
        external ? (
          <a key={key} href={href} target="_blank" rel="noreferrer" className="text-stamp underline underline-offset-4">
            {link[1]}
          </a>
        ) : (
          <Link key={key} href={href} className="text-stamp underline underline-offset-4">{link[1]}</Link>
        ),
      );
    }
    last = m.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function Markdown({ source }: { source: string }) {
  const blocks = parse(source);

  return (
    <div className="max-w-[68ch]">
      {blocks.map((b, idx) => {
        const k = `b${idx}`;
        switch (b.t) {
          case 'h2':
            return (
              <h2 key={k} className="mt-12 mb-4 border-t border-rule pt-5 text-[1.35rem] font-bold leading-snug text-ink">
                {b.text}
              </h2>
            );
          case 'h3':
            return <h3 key={k} className="mt-8 mb-3 text-[1.05rem] font-bold text-ink">{b.text}</h3>;
          case 'p':
            return <p key={k} className="mb-4 leading-[1.75] text-ink-soft">{inline(b.text, k)}</p>;
          case 'ul':
            return (
              <ul key={k} className="mb-5 space-y-2">
                {b.items.map((it, j) => (
                  <li key={j} className="relative pl-5 leading-[1.7] text-ink-soft before:absolute before:left-0 before:top-[0.65em] before:h-px before:w-3 before:bg-stamp">
                    {inline(it, `${k}-${j}`)}
                  </li>
                ))}
              </ul>
            );
          case 'ol':
            return (
              <ol key={k} className="mb-5 space-y-3">
                {b.items.map((it, j) => (
                  <li key={j} className="relative pl-8 leading-[1.7] text-ink-soft">
                    <span className="absolute left-0 top-[0.15em] font-mono text-xs text-stamp">{String(j + 1).padStart(2, '0')}</span>
                    {inline(it, `${k}-${j}`)}
                  </li>
                ))}
              </ol>
            );
          case 'pre':
            return (
              <pre key={k} className="mb-5 overflow-x-auto border border-rule bg-plate p-4 font-mono text-sm text-ink">
                {b.text}
              </pre>
            );
          case 'img':
            // eslint-disable-next-line @next/next/no-img-element
            return (
              <figure key={k} className="mb-6 border border-rule bg-plate p-2">
                <img src={b.src} alt={b.alt} className="w-full" />
                {b.alt && <figcaption className="mt-2 px-1 font-mono text-xs text-ink-soft">{b.alt}</figcaption>}
              </figure>
            );
          case 'table':
            return (
              <div key={k} className="mb-6 overflow-x-auto border border-rule">
                <table className="w-full border-collapse bg-plate text-sm">
                  <thead>
                    <tr>
                      {b.head.map((h, j) => (
                        <th key={j} className="border-b border-rule px-3 py-2 text-left font-mono text-xs font-medium uppercase tracking-wide text-ink-soft">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {b.rows.map((row, j) => (
                      <tr key={j} className="border-b border-rule last:border-0">
                        {row.map((c, cj) => (
                          <td key={cj} className="px-3 py-2 align-top leading-relaxed text-ink-soft">
                            {inline(c, `${k}-${j}-${cj}`)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
        }
      })}
    </div>
  );
}
