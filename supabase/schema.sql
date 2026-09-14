-- Схема базы для платформы. Выполнить целиком в Supabase → SQL Editor.
-- Идемпотентна: можно прогонять повторно.

-- ---------------------------------------------------------------------------
-- Типы
-- ---------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'coverage_type') then
    create type coverage_type as enum ('full', 'partial', 'tuition_only');
  end if;
end$$;

-- ---------------------------------------------------------------------------
-- Стипендии
-- ---------------------------------------------------------------------------
create table if not exists public.scholarships (
  slug              text primary key,
  country           text not null,
  country_code      text not null,
  name              text not null,
  name_original     text,

  coverage          coverage_type not null,
  coverage_summary  text not null,
  honest_note       text not null,
  renewal_note      text not null default '',
  -- [{ label, included, note }]
  coverage_items    jsonb not null default '[]'::jsonb,
  stipend_note      text not null default '',

  -- { age_max, age_min, gpa_min_5, gpa_hard, gpa_note, languages: [...], education_level }
  requirements      jsonb not null default '{}'::jsonb,
  documents         jsonb not null default '[]'::jsonb,   -- [text]
  steps             jsonb not null default '[]'::jsonb,   -- [{ title, body }]
  -- [{ year, opens: 'YYYY-MM-DD', closes: 'YYYY-MM-DD', note }]
  windows           jsonb not null default '[]'::jsonb,

  portal_url        text not null,
  contact           jsonb not null default '[]'::jsonb,   -- [{ label, value }]
  -- { visa, flight, first_month, blocked_account?, as_of }
  budget            jsonb not null default '{}'::jsonb,
  -- { region, income_sensitive, needs_language_year, strong_fields }
  quiz              jsonb not null default '{}'::jsonb,

  guide_slugs       jsonb not null default '[]'::jsonb,
  photo_query       text not null default '',

  -- Задел под узбекскую версию: интерфейс переводится через messages/*.json,
  -- а контент — вот этими колонками. Читающий слой (lib/data.ts) при
  -- добавлении локали выбирает name_uz, если она заполнена, иначе name.
  name_uz           text,
  coverage_summary_uz text,
  honest_note_uz    text,

  updated_at        timestamptz not null default now()
);

create index if not exists scholarships_country_idx on public.scholarships (country);
create index if not exists scholarships_coverage_idx on public.scholarships (coverage);

-- ---------------------------------------------------------------------------
-- Гайды
-- ---------------------------------------------------------------------------
create table if not exists public.guides (
  slug                 text primary key,
  title                text not null,
  summary              text not null,
  body                 text not null,              -- markdown, включая ![](/guides/*.png)
  reading_minutes      int  not null default 5,
  updated_at           date not null default current_date,
  related_scholarships jsonb not null default '[]'::jsonb,

  title_uz             text,
  summary_uz           text,
  body_uz              text,

  created_at           timestamptz not null default now()
);

create index if not exists guides_updated_idx on public.guides (updated_at desc);

-- ---------------------------------------------------------------------------
-- Просмотры страниц — для приватной аналитики на /admin
-- ---------------------------------------------------------------------------
create table if not exists public.page_views (
  id          bigint generated always as identity primary key,
  path        text not null,
  referrer    text,
  -- случайный id из куки посетителя, не привязан к личности; IP и user-agent
  -- не сохраняются намеренно — для «сколько людей заходило» они не нужны
  session_id  text not null,
  created_at  timestamptz not null default now()
);

create index if not exists page_views_created_idx on public.page_views (created_at desc);
create index if not exists page_views_path_idx on public.page_views (path);

alter table public.page_views enable row level security;

-- Любой посетитель может записать свой просмотр...
drop policy if exists "anyone can log a page view" on public.page_views;
create policy "anyone can log a page view"
  on public.page_views for insert
  to anon, authenticated
  with check (true);

-- ...но прочитать эти данные не может никто, кроме service role (обходит RLS).
-- То есть /admin читает статистику только через сервер с SUPABASE_SERVICE_ROLE_KEY,
-- публичным anon-ключом эти строки не достать вообще.

-- ---------------------------------------------------------------------------
-- Доступ: сайт читает данные анонимно, пишет только service role
-- ---------------------------------------------------------------------------
alter table public.scholarships enable row level security;
alter table public.guides       enable row level security;

drop policy if exists "scholarships are public" on public.scholarships;
create policy "scholarships are public"
  on public.scholarships for select
  to anon, authenticated
  using (true);

drop policy if exists "guides are public" on public.guides;
create policy "guides are public"
  on public.guides for select
  to anon, authenticated
  using (true);

-- Запись остаётся только у service role: он обходит RLS, отдельная политика
-- ему не нужна. Это значит, что с публичным ключом данные изменить нельзя.

-- ---------------------------------------------------------------------------
-- Автообновление updated_at у стипендий
-- ---------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

drop trigger if exists scholarships_touch on public.scholarships;
create trigger scholarships_touch
  before update on public.scholarships
  for each row execute function public.touch_updated_at();
