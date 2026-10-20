<div align="center">

<h1>CineLog</h1>

<p><strong>Личный киноархив · Personal cinema archive</strong></p>
<p>Смотри. Оценивай. Запоминай.<br><em>Track what you watch. Rate what stays with you. Build your own history of cinema.</em></p>

<br>

<a href="#russian"><img src="https://img.shields.io/badge/ЧИТАТЬ-НА_РУССКОМ-BAF35A?style=for-the-badge&labelColor=10130F" alt="Русская версия"></a>
<a href="#english"><img src="https://img.shields.io/badge/READ-IN_ENGLISH-EDEBE4?style=for-the-badge&labelColor=10130F" alt="English version"></a>
<a href="https://github.com/zvozvozvo/cinelog"><img src="https://img.shields.io/badge/GITHUB-ИСХОДНЫЙ_КОД-191D19?style=for-the-badge&logo=github&logoColor=white" alt="Исходный код"></a>
<a href="https://github.com/zvozvozvo/cinelog/issues"><img src="https://img.shields.io/badge/ОШИБКИ-И_ИДЕИ-191D19?style=for-the-badge&logo=github" alt="Ошибки и идеи"></a>

<br><br>

<img src="https://img.shields.io/badge/React-19-10130F?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19">
<img src="https://img.shields.io/badge/Vite-8-10130F?style=flat-square&logo=vite&logoColor=BA9BFF" alt="Vite 8">
<img src="https://img.shields.io/badge/Tailwind_CSS-4-10130F?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS 4">
<img src="https://img.shields.io/badge/Supabase-Auth_+_Database-10130F?style=flat-square&logo=supabase&logoColor=3ECF8E" alt="Supabase">
<img src="https://img.shields.io/badge/TMDB-Movie_API-10130F?style=flat-square&logo=themoviedatabase&logoColor=01D277" alt="TMDB">

</div>

---

<a id="russian"></a>

## 🇷🇺 Русская версия

### О CineLog

**CineLog** — личный киноархив для тех, кто хочет не просто выбрать фильм на вечер, а собрать собственную историю кино. Добавляй просмотренные фильмы, ставь оценки, сохраняй фильмы на потом, записывай впечатления и сравнивай вкусы с другим человеком.

Визуальный язык проекта вдохновлён киножурналами и архивами: тёмная тема, выразительная типографика, постеры на первом плане и минимум визуального шума.

<div align="center">
<a href="#setup-ru"><img src="https://img.shields.io/badge/НАЧАТЬ-УСТАНОВКУ-BAF35A?style=for-the-badge&labelColor=10130F" alt="Начать установку"></a>
<a href="#features-ru"><img src="https://img.shields.io/badge/ВОЗМОЖНОСТИ-ПРОЕКТА-EDEBE4?style=for-the-badge&labelColor=10130F" alt="Возможности"></a>
<a href="https://github.com/zvozvozvo/cinelog/issues"><img src="https://img.shields.io/badge/ПРЕДЛОЖИТЬ-ИДЕЮ-191D19?style=for-the-badge&labelColor=10130F" alt="Предложить идею"></a>
</div>

### Возможности

<a id="features-ru"></a>

| Раздел | Описание |
| --- | --- |
| **Личный киноархив** | Поиск фильмов в TMDB, каталог и карточки с метаданными |
| **Оценки** | Личный рейтинг просмотренного фильма от 0 до 10 |
| **К просмотру** | Отдельный список фильмов на потом |
| **Карточка фильма** | Постер, фон, описание, жанры, дата выхода, длительность и режиссёр |
| **История** | Хронология записей в архиве |
| **Статистика** | Средняя оценка, распределение рейтингов, жанры, годы выхода и длительность |
| **Дневник просмотров** | Дата просмотра или пересмотра, отдельная оценка и заметка |
| **Рекомендации** | Подбор фильмов с учётом оценок и жанров; режим для двоих |
| **Вместе** | Приглашение второго аккаунта и сравнение оценок общих фильмов |
| **Профиль** | Имя, аватар по ссылке, описание, любимые жанры и личные показатели |

### Страницы приложения

| Маршрут | Назначение |
| --- | --- |
| <code>/</code> | Главная |
| <code>/auth</code> | Вход и регистрация |
| <code>/films</code> | Полный киноархив |
| <code>/watchlist</code> | Список «К просмотру» |
| <code>/timeline</code> | История |
| <code>/statistics</code> | Статистика |
| <code>/movie/:id</code> | Карточка фильма и дневник просмотров |
| <code>/recommendations</code> | Персональные и совместные рекомендации |
| <code>/together</code> | Приглашения и сравнение оценок |
| <code>/profile</code> | Профиль пользователя |

### Технологии

- **React 19** — компоненты интерфейса.
- **Vite 8** — разработка и production-сборка.
- **Tailwind CSS 4** — стили и адаптивная вёрстка.
- **React Router 7** — маршрутизация.
- **Supabase** — авторизация, база данных и политики доступа.
- **TMDB API** — поиск фильмов, метаданные, постеры и фоны.
- **Motion** — анимации.
- **Lucide React** — иконки.

### Как хранятся данные

| Таблица Supabase | Назначение |
| --- | --- |
| <code>movies</code> | Общие метаданные фильмов |
| <code>user_movies</code> | Статус фильма и отдельная личная оценка каждого пользователя |
| <code>profiles</code> | Имя, аватар, описание и любимые жанры |
| <code>connections</code> | Приглашения и подключения пользователей |
| <code>movie_journal</code> | Личные записи о просмотрах и пересмотрах |

Оценки разных пользователей хранятся отдельно. Политики Row Level Security (RLS) должны ограничивать доступ к личным записям владельцем; общая запись фильма не является чьей-либо оценкой.

<a id="setup-ru"></a>

### Установка и запуск

**1. Склонируй репозиторий**

~~~bash
git clone https://github.com/zvozvozvo/cinelog.git
cd cinelog
~~~

**2. Установи зависимости**

~~~bash
npm install
~~~

**3. Создай файл окружения**

В корне проекта создай <code>.env</code>:

~~~env
VITE_TMDB_TOKEN=YOUR_TMDB_READ_ACCESS_TOKEN
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
~~~

Замени примеры своими значениями. Не загружай настоящий файл окружения в GitHub.

**4. Подготовь Supabase**

Приложение ожидает таблицы <code>movies</code>, <code>user_movies</code>, <code>profiles</code> и <code>connections</code> с настроенными политиками RLS. SQL-файлы в <code>sql/</code> расширяют существующую схему:

- <code>add_profile_fields.sql</code> — поля профиля и политика создания собственного профиля.
- <code>create_movie_journal.sql</code> — таблица дневника просмотров и политики доступа.

Открой **Supabase → SQL Editor**, проверь нужный скрипт и выполни его один раз. Эти миграции не создают всю базу с нуля.

В **Authentication → URL Configuration** разреши локальный адрес, обычно <code>http://localhost:5173/**</code>. Если Vite использует другой порт, укажи адрес из терминала.

**5. Запусти приложение**

~~~bash
npm run dev
~~~

Сборка и предпросмотр production-версии:

~~~bash
npm run build
npm run preview
~~~

Проверка линтером:

~~~bash
npm run lint
~~~

### Переменные окружения и безопасность

| Переменная | Назначение |
| --- | --- |
| <code>VITE_TMDB_TOKEN</code> | TMDB API Read Access Token |
| <code>VITE_SUPABASE_URL</code> | URL проекта Supabase |
| <code>VITE_SUPABASE_ANON_KEY</code> | Публичный publishable/anon-ключ Supabase |

> [!WARNING]
> **Никогда не коммить настоящий файл <code>.env</code>.** Значения с префиксом <code>VITE_</code> включаются в браузерную сборку и не должны содержать серверные секреты. Не используй Supabase <code>service_role</code> или Secret Key в клиентском приложении. Для защиты личных данных настрой корректные политики RLS.

### Структура проекта

~~~text
cinelog/
├── components/           # Общие компоненты
│   ├── AddMovieModal.jsx
│   ├── MovieCard.jsx
│   ├── MovieJournal.jsx
│   └── Navbar.jsx
├── pages/                # Страницы приложения
│   ├── Auth.jsx
│   ├── Films.jsx
│   ├── Home.jsx
│   ├── Movie.jsx
│   ├── Profile.jsx
│   ├── Recommendations.jsx
│   ├── Statistics.jsx
│   ├── Timeline.jsx
│   ├── Together.jsx
│   └── Watchlist.jsx
├── sql/                  # SQL-миграции Supabase
├── src/
│   ├── App.jsx
│   ├── supabaseMovies.js
│   └── tmdb.js
├── supabase.js
├── index.html
├── package.json
└── README.md
~~~

### Принципы проекта

- **Сначала фильм.** Постер и название важнее декора.
- **Личные оценки остаются личными.** У каждого пользователя собственный рейтинг.
- **Метаданные отделены от пользовательских данных.** Один фильм может быть в архивах нескольких людей.
- **Только реальные показатели.** Статистика строится на существующих записях.
- **Минимум визуального шума.** Типографика и анимация поддерживают содержание.

### Дальнейшие планы

- [x] Поиск TMDB и карточки фильмов
- [x] Личный архив, список просмотра и оценки
- [x] История и статистика
- [x] Авторизация и пользовательские записи в Supabase
- [x] Профиль и любимые жанры
- [x] Совместный раздел и сравнение оценок
- [x] Рекомендации
- [x] Дневник просмотров и пересмотров
- [ ] Импорт и экспорт архива
- [ ] Пользовательские списки
- [ ] Годовые итоги на основе реальных данных

### Атрибуция TMDB

CineLog использует TMDB API для поиска фильмов, метаданных, постеров и фонов. **CineLog не одобрен и не сертифицирован TMDB.** Данные и изображения принадлежат соответствующим правообладателям.

---

<a id="english"></a>

## 🇬🇧 English version

### About

**CineLog** is a personal cinema archive for people who want more than a quick answer to “What should I watch tonight?”. Add watched films, rate them, keep a watchlist, record impressions and compare your taste with another person.

The visual direction takes inspiration from editorial film journals and curated archives: a dark canvas, expressive typography, poster-first layouts and restrained interface details.

<div align="center">
<a href="#setup-en"><img src="https://img.shields.io/badge/GET_STARTED-INSTALLATION-BAF35A?style=for-the-badge&labelColor=10130F" alt="Get started"></a>
<a href="#features-en"><img src="https://img.shields.io/badge/EXPLORE-FEATURES-EDEBE4?style=for-the-badge&labelColor=10130F" alt="Explore features"></a>
<a href="https://github.com/zvozvozvo/cinelog"><img src="https://img.shields.io/badge/SOURCE-ON_GITHUB-191D19?style=for-the-badge&logo=github&logoColor=white" alt="Source on GitHub"></a>
</div>

### Features

<a id="features-en"></a>

| Area | Description |
| --- | --- |
| **Personal library** | Search TMDB, add films and maintain an archive |
| **Ratings** | Give each watched film a personal score from 0 to 10 |
| **Watchlist** | Save titles for later |
| **Movie details** | Posters, backdrops, overview, genres, release date, runtime and director |
| **Timeline** | Browse archive entries chronologically |
| **Statistics** | Rating distribution, genres, release years and runtime |
| **Viewing journal** | Record a watch or rewatch with a date, rating and personal note |
| **Recommendations** | Discover films using ratings, genre preferences and TMDB |
| **Together** | Invite another registered user and compare ratings |
| **Profile** | Manage display name, avatar URL, bio, favorite genres and personal statistics |

### Application routes

| Route | Purpose |
| --- | --- |
| <code>/</code> | Home |
| <code>/auth</code> | Sign in and registration |
| <code>/films</code> | Film archive |
| <code>/watchlist</code> | Watchlist |
| <code>/timeline</code> | Timeline |
| <code>/statistics</code> | Personal statistics |
| <code>/movie/:id</code> | Movie details and viewing journal |
| <code>/recommendations</code> | Personal and shared recommendations |
| <code>/together</code> | Invitations and rating comparison |
| <code>/profile</code> | User profile |

### Technology stack

- **React 19** — UI components.
- **Vite 8** — development and production builds.
- **Tailwind CSS 4** — styling and responsive layouts.
- **React Router 7** — routing.
- **Supabase** — authentication, database and access policies.
- **TMDB API** — movie search, metadata, posters and backdrops.
- **Motion** — animations.
- **Lucide React** — icons.

### Data model

| Supabase table | Purpose |
| --- | --- |
| <code>movies</code> | Shared movie metadata |
| <code>user_movies</code> | Per-user status and personal rating |
| <code>profiles</code> | Display name, avatar, bio and favorite genres |
| <code>connections</code> | User invitations and connections |
| <code>movie_journal</code> | Personal watch and rewatch entries |

Ratings are stored per user. Row Level Security (RLS) should restrict personal records to their owner; shared movie metadata is not a personal rating.

<a id="setup-en"></a>

### Installation

**1. Clone the repository**

~~~bash
git clone https://github.com/zvozvozvo/cinelog.git
cd cinelog
~~~

**2. Install dependencies**

~~~bash
npm install
~~~

**3. Configure environment variables**

Create a <code>.env</code> file in the project root:

~~~env
VITE_TMDB_TOKEN=YOUR_TMDB_READ_ACCESS_TOKEN
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
~~~

Replace the placeholders with your own values. Never commit the real environment file.

**4. Configure Supabase**

The app expects the <code>movies</code>, <code>user_movies</code>, <code>profiles</code> and <code>connections</code> tables with RLS policies configured. The SQL files in <code>sql/</code> extend the existing schema:

- <code>add_profile_fields.sql</code> — profile fields and a policy for creating one's own profile.
- <code>create_movie_journal.sql</code> — the viewing-journal table and access policies.

Open **Supabase → SQL Editor**, review the relevant migration and run it once. These migrations do not create the entire database from scratch.

In **Authentication → URL Configuration**, allow your local redirect URL, usually <code>http://localhost:5173/**</code>. Use the actual URL if Vite chooses a different port.

**5. Start the app**

~~~bash
npm run dev
~~~

Build and preview the production version:

~~~bash
npm run build
npm run preview
~~~

Run the linter:

~~~bash
npm run lint
~~~

### Environment and security

| Variable | Purpose |
| --- | --- |
| <code>VITE_TMDB_TOKEN</code> | TMDB API Read Access Token |
| <code>VITE_SUPABASE_URL</code> | Supabase project URL |
| <code>VITE_SUPABASE_ANON_KEY</code> | Supabase publishable/anon key |

> [!WARNING]
> **Never commit your real <code>.env</code> file.** Variables prefixed with <code>VITE_</code> are included in the browser bundle and must not contain server-side secrets. Never use a Supabase <code>service_role</code> or Secret Key in the client app. Protect personal data with correct RLS policies.

### Project structure

~~~text
cinelog/
├── components/           # Shared UI components
│   ├── AddMovieModal.jsx
│   ├── MovieCard.jsx
│   ├── MovieJournal.jsx
│   └── Navbar.jsx
├── pages/                # Application pages
│   ├── Auth.jsx
│   ├── Films.jsx
│   ├── Home.jsx
│   ├── Movie.jsx
│   ├── Profile.jsx
│   ├── Recommendations.jsx
│   ├── Statistics.jsx
│   ├── Timeline.jsx
│   ├── Together.jsx
│   └── Watchlist.jsx
├── sql/                  # Supabase migrations
├── src/
│   ├── App.jsx
│   ├── supabaseMovies.js
│   └── tmdb.js
├── supabase.js
├── index.html
├── package.json
└── README.md
~~~

### Design principles

- **Film first.** Artwork and titles come before decoration.
- **Ratings stay personal.** Each user owns their own rating.
- **Metadata is separate from user data.** A film can exist in multiple personal archives.
- **Real data only.** Statistics reflect records that actually exist.
- **Quiet interface.** Typography and motion support the content.

### Roadmap

- [x] TMDB search and movie details
- [x] Personal library, watchlist and ratings
- [x] Timeline and statistics
- [x] Supabase authentication and user-owned records
- [x] Profile and favorite genres
- [x] Shared cinema and rating comparison
- [x] Recommendations
- [x] Viewing journal and rewatches
- [ ] Library import / export
- [ ] Custom lists
- [ ] Yearly recap based on real user data

### TMDB attribution

CineLog uses the TMDB API for movie search, metadata, posters and backdrops. **CineLog is not endorsed or certified by TMDB.** Related data and artwork remain the property of their respective owners.

---

<div align="center">

**CineLog — твоя история кино начинается с одного фильма.**<br>
**CineLog — your cinema history starts with one film.**

<br>

<a href="https://github.com/zvozvozvo/cinelog"><img src="https://img.shields.io/badge/STAR-THIS_REPOSITORY-BAF35A?style=for-the-badge&logo=github&logoColor=10130F&labelColor=10130F" alt="Star this repository"></a>
<a href="https://github.com/zvozvozvo/cinelog/issues"><img src="https://img.shields.io/badge/IDEAS_&_BUGS-OPEN_AN_ISSUE-EDEBE4?style=for-the-badge&labelColor=10130F" alt="Open an issue"></a>

<sub>Made for people who remember how a film made them feel.</sub>

</div>
