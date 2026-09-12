# Установка: GitHub, Supabase, Netlify

Пошагово, с нуля. Порядок важен: сначала код на GitHub, потом база, потом
хостинг.

---

## 1. Залить проект на GitHub

Репозиторий уже инициализирован локально, коммит сделан. Осталось создать
пустой репозиторий `gogrant` на GitHub и запушить.

### 1.1. Создать репозиторий

На github.com → **New repository**:

- Repository name: `gogrant`
- Public или Private — на выбор, Netlify работает с обоими
- **Не** ставить галочки на Add README, .gitignore и license: репозиторий
  должен быть пустым, иначе первый push упрётся в конфликт

### 1.2. Запушить

Из папки проекта, подставив свой логин вместо `USERNAME`:

```bash
git remote add origin https://github.com/USERNAME/gogrant.git
git branch -M main
git push -u origin main
```

При запросе пароля вставляется не пароль от аккаунта, а personal access
token. Чтобы не вводить его каждый раз, можно один раз настроить менеджер
учётных данных:

```bash
git config --global credential.helper manager
```

Дальше все коммиты уходят обычным `git push`.

### 1.3. Про токен

Токен, отправленный в переписку, нужно отозвать: **Settings → Developer
settings → Personal access tokens → Revoke**. Токены, попавшие в чаты,
переписку или код, считаются скомпрометированными — GitHub нередко отзывает
такие автоматически, обнаружив их при сканировании.

Для нового токена достаточно прав `repo` (или `Contents: Read and write`
для fine-grained токена). Ещё удобнее вообще обойтись без токена — поставить
[GitHub CLI](https://cli.github.com/) и один раз выполнить `gh auth login`.

---

## 2. Настроить Supabase

База нужна, чтобы редактировать контент без пересборки сайта. Пока её нет,
сайт работает на файлах из `data/` — это рабочий режим, не заглушка.

### 2.1. Создать проект

1. [supabase.com](https://supabase.com) → **New project**.
2. Organization — любая, Name — `gogrant`.
3. **Database Password** сохранить в менеджере паролей: восстановить его
   потом нельзя, только сбросить.
4. Region — ближе к аудитории. Для СНГ это обычно `Central EU (Frankfurt)`.
5. Создание занимает пару минут.

### 2.2. Создать таблицы

1. В проекте → **SQL Editor** → **New query**.
2. Скопировать целиком содержимое файла [`supabase/schema.sql`](supabase/schema.sql).
3. Вставить и нажать **Run**.

Должно появиться `Success. No rows returned`. Проверить результат можно в
**Table Editor**: там появятся пустые таблицы `scholarships` и `guides`.

Скрипт можно запускать повторно — он написан идемпотентно и ничего не ломает
при втором прогоне.

### 2.3. Взять ключи

**Project Settings → API**. Понадобятся три значения:

| Что | Где | Куда |
|---|---|---|
| Project URL | Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon / publishable key | Project API keys | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role key | Project API keys, под кнопкой Reveal | `SUPABASE_SERVICE_ROLE_KEY` |

`anon` ключ публичный — он попадает в браузер, и это нормально: доступ
ограничен политиками RLS из схемы, читать можно, писать нельзя.

`service_role` ключ обходит все проверки доступа. Он нужен только для
загрузки данных с локальной машины. Его нельзя класть в переменные Netlify,
нельзя коммитить и нельзя использовать в коде фронтенда.

### 2.4. Залить начальные данные

В корне проекта создать файл `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

Затем:

```bash
npm run seed
```

В консоли появится `Готово. В базе: 5 стипендий, 5 гайдов.` Скрипт
идемпотентный: повторный запуск обновляет строки по `slug`, дублей не
создаёт.

Файл `.env.local` уже в `.gitignore` и в репозиторий не попадёт.

### 2.5. Как потом править контент

Два способа, оба рабочие:

- **Через Table Editor в Supabase.** Изменения появятся на сайте при
  следующей ревалидации — ISR стоит на час, либо после нового деплоя.
- **Через файлы `data/*.ts` и `npm run seed`.** Так правки остаются в git и
  их видно в истории. Для командной работы этот вариант удобнее.

---

## 3. Задеплоить на Netlify

### 3.1. Подключить репозиторий

1. [app.netlify.com](https://app.netlify.com) → **Add new site → Import an
   existing project**.
2. **Deploy with GitHub**, при первом подключении Netlify попросит доступ к
   репозиториям — можно выдать только на `gogrant`.
3. Выбрать репозиторий `gogrant`.

### 3.2. Проверить настройки сборки

Netlify определяет Next.js автоматически и подставляет:

- Build command: `npm run build`
- Publish directory: `.next`
- Branch to deploy: `main`

В репозитории уже лежит `netlify.toml` с этими настройками и с официальным
плагином `@netlify/plugin-nextjs` — он нужен для серверных маршрутов и ISR,
без него часть страниц работать не будет.

### 3.3. Добавить переменные окружения

**До первого деплоя**: на экране импорта раскрыть **Add environment
variables** (или позже: Site configuration → Environment variables) и
добавить:

```
NEXT_PUBLIC_SUPABASE_URL      = https://xxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGci...
```

`SUPABASE_SERVICE_ROLE_KEY` сюда добавлять не нужно — сборке он не требуется,
а его присутствие на хостинге лишний раз увеличивает риск утечки.

### 3.4. Деплой

**Deploy site**. Первая сборка занимает 2–4 минуты. По готовности сайт
доступен на адресе вида `random-name-123.netlify.app`, переименовать его
можно в Site configuration → Site details → Change site name.

Дальше каждый `git push` в `main` запускает новый деплой автоматически.

### 3.5. Свой домен, если нужен

Domain management → **Add a domain**. Netlify покажет, какие записи прописать
у регистратора, и сам выпустит сертификат Let's Encrypt после того, как DNS
обновится.

---

## Проверка, что всё сошлось

1. Сайт открывается, на главной видны пять программ и лента дедлайнов.
2. В Supabase → Table Editor в `scholarships` пять строк.
3. Правка любого поля в Table Editor появляется на сайте после
   Netlify → Deploys → **Trigger deploy → Clear cache and deploy site**.

Если пункт 3 не срабатывает, а первые два в порядке — на Netlify скорее
всего не проставились переменные окружения, и сайт продолжает отдавать
данные из файлов `data/`. Это видно в логе сборки: при отсутствующих
переменных обращений к Supabase в нём не будет.

---

## Частые проблемы

**`remote: Repository not found` при push.** Репозиторий не создан либо имя
владельца в URL написано с ошибкой. Проверяется через `git remote -v`.

**`Support for password authentication was removed`.** Вместо пароля нужен
personal access token — см. пункт 1.2.

**Сборка на Netlify падает с ошибкой про `@netlify/plugin-nextjs`.** Плагин
подтягивается автоматически; если нет, он ставится вручную через
Site configuration → Build & deploy → Plugins.

**Сайт собрался, но данные старые.** ISR кэширует страницы на час. Немедленно
обновить можно через Trigger deploy → Clear cache and deploy site.

**`permission denied for table scholarships` в логах.** Не выполнен блок с
RLS-политиками из `schema.sql`. Нужно прогнать файл целиком ещё раз.
