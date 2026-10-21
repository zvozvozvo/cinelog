<div align="center">

CineLog

Твоя история кино · Your personal cinema archive

Сохраняй. Оценивай. Открывай заново.
Track what you watch. Rate what stays with you. Build your own history of cinema.

<p>
  <a href="https://cinelog-movie.vercel.app/">
    <img src="https://img.shields.io/badge/ОТКРЫТЬ_САЙТ-cinelog--movie.vercel.app-B9F45A?style=for-the-badge&logo=vercel&logoColor=111111&labelColor=111111" alt="Открыть CineLog">
  </a>
  <a href="https://github.com/zvozvozvo/cinelog">
    <img src="https://img.shields.io/badge/ИСХОДНЫЙ_КОД-GitHub-EDEBE4?style=for-the-badge&logo=github&logoColor=111111&labelColor=111111" alt="Исходный код на GitHub">
  </a>
  <a href="https://github.com/zvozvozvo/cinelog/issues">
    <img src="https://img.shields.io/badge/ИДЕИ_И_ОШИБКИ-ОБСУДИТЬ-222722?style=for-the-badge&logo=github&logoColor=white&labelColor=111111" alt="Идеи и ошибки">
  </a>
</p>

<p>
  <img src="https://img.shields.io/badge/React-19-111111?style=flat-square&logo=react&logoColor=61DAFB" alt="React 19">
  <img src="https://img.shields.io/badge/Vite-8-111111?style=flat-square&logo=vite&logoColor=BD93F9" alt="Vite 8">
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-111111?style=flat-square&logo=tailwindcss&logoColor=38BDF8" alt="Tailwind CSS 4">
  <img src="https://img.shields.io/badge/Supabase-Auth_&_Database-111111?style=flat-square&logo=supabase&logoColor=3ECF8E" alt="Supabase">
  <img src="https://img.shields.io/badge/TMDB-Movie_API-111111?style=flat-square&logo=themoviedatabase&logoColor=01D277" alt="TMDB API">
  <img src="https://img.shields.io/badge/License-Not_specified-111111?style=flat-square" alt="License not specified">
</p>

Навигация: Русская версия · English version · Установка · Installation · Возможности · Application flow

</div>

────────

<a id="russian"></a>

🇷🇺 Русская версия

Содержание

• О проекте
• Попробовать CineLog
• Возможности
• Страницы приложения
• Дизайн и UX
• Технологии
• Как работает приложение
• Установка и локальный запуск
• Настройка Supabase
• Переменные окружения
• Структура репозитория
• Безопасность
• Частые проблемы
• План развития
• TMDB и права на материалы
• Участие в проекте

<a id="about-ru"></a>

О проекте

CineLog — личный киноархив и дневник просмотров. Это место, где можно собирать фильмы в собственную коллекцию, отмечать просмотренное, выставлять личные оценки, сохранять фильмы на потом и постепенно формировать историю своего кинематографического вкуса.

Вместо бесконечного выбора «что посмотреть вечером» CineLog помогает сохранять то, что ты уже посмотрел, помнить впечатления и возвращаться к фильмам, которые заслуживают повторного просмотра. В приложении также предусмотрены профиль пользователя, статистика, рекомендации и раздел для сравнения вкусов с другим человеком.

Проект разрабатывается как веб-приложение с адаптивным интерфейсом. Визуальное направление опирается на эстетику киножурнала и аккуратного цифрового архива: почти чёрный фон, молочная типографика, лаймовый акцент, заметные постеры и сдержанные элементы управления.

<a id="live-ru"></a>

Попробовать CineLog

• Открыть сайт — опубликованная версия приложения.
• Исходный код на GitHub — компоненты, страницы, SQL-скрипты и конфигурация.
• Сообщить об ошибке или предложить функцию — идеи и баг-репорты.

> Для локального запуска и полноценного использования функций аккаунта нужны собственные настройки TMDB и Supabase. Доступность опубликованного сайта также может зависеть от сети и региона.

<a id="features-ru"></a>

Возможности

|Возможность             |Что она даёт                                                                                                      |
|------------------------|------------------------------------------------------------------------------------------------------------------|
|**Личный киноархив**    |Собирай фильмы в едином каталоге и управляй их статусами.                                                         |
|**Поиск через TMDB**    |Находи фильмы по названию и получай метаданные из The Movie Database.                                             |
|**Оценки**              |Ставь личную оценку просмотренному фильму. Пользовательская оценка отделена от рейтинга TMDB.                     |
|**Список «К просмотру»**|Сохраняй фильмы, которые хочешь посмотреть позже.                                                                 |
|**Карточка фильма**     |Просматривай описание, год выхода, жанры, длительность, режиссёра, постер и фон, когда эти данные доступны у TMDB.|
|**История / Timeline**  |Просматривай свою киноисторию в хронологическом формате.                                                          |
|**Статистика**          |Изучай собственные показатели, оценки, жанры и распределение просмотров.                                          |
|**Дневник просмотров**  |Фиксируй дату просмотра или пересмотра, оценку и личную заметку.                                                  |
|**Рекомендации**        |Открывай новые фильмы на основе данных TMDB и вкусовых предпочтений.                                              |
|**Раздел «Вместе»**     |Используй совместные функции и сравнение оценок после настройки подключения с другим пользователем.               |
|**Профиль**             |Настраивай отображаемое имя, аватар, описание и любимые жанры.                                                    |
|**Адаптивный интерфейс**|Пользуйся приложением на широком экране и мобильном устройстве.                                                   |

> Часть пользовательских возможностей зависит от корректной настройки базы Supabase, схемы таблиц и политик доступа. README описывает структуру текущего проекта, но не заменяет проверку конфигурации конкретного развёртывания.

<a id="routes-ru"></a>

Страницы приложения

|Маршрут                                 |Назначение                                    |
|----------------------------------------|----------------------------------------------|
|[`/`](https://cinelog-movie.vercel.app/)|Главная страница                              |
|`/auth`                                 |Вход и регистрация                            |
|`/films`                                |Киноархив                                     |
|`/watchlist`                            |Список «К просмотру»                          |
|`/timeline`                             |Хронология киноистории                        |
|`/statistics`                           |Статистика просмотров и оценок                |
|`/movie/:id`                            |Подробная страница фильма и дневник просмотров|
|`/recommendations`                      |Рекомендации                                  |
|`/together`                             |Совместный раздел и сравнение вкусов          |
|`/profile`                              |Профиль пользователя                          |

<a id="design-ru"></a>

Дизайн и UX

CineLog придерживается редакционного подхода к интерфейсу: визуальная иерархия строится вокруг фильмов, постеров и личных записей, а не вокруг декоративных панелей.

• Палитра: чёрный и графитовый фон, молочный текст, лаймовый цвет для важных акцентов.
• Постеры на первом плане: визуальный образ фильма помогает быстрее ориентироваться в архиве.
• Типографика: крупные заголовки сочетаются с компактными подписями и метаданными.
• Сдержанные разделители: тонкие линии структурируют страницы, не превращая их в сетку из тяжёлых карточек.
• Мобильная адаптация: секции, карточки и навигация должны оставаться читаемыми на небольших экранах.
• Постепенное развитие визуального стиля: концепт фирменного знака CineLog — монограмма CL в рамке кадра с лаймовым акцентом. Детали дизайна могут меняться по мере развития интерфейса.

<a id="stack-ru"></a>

Технологический стек

|Технология        |Роль в проекте                                |Ссылка                                                   |
|------------------|----------------------------------------------|---------------------------------------------------------|
|**React 19**      |Компоненты и состояние интерфейса             |[Документация](https://react.dev/)                       |
|**Vite 8**        |Dev-сервер и production-сборка                |[Документация](https://vite.dev/)                        |
|**Tailwind CSS 4**|Утилитарные стили                             |[Документация](https://tailwindcss.com/)                 |
|**React Router 7**|Маршрутизация между страницами                |[Документация](https://reactrouter.com/)                 |
|**Supabase**      |Авторизация и хранение пользовательских данных|[Документация](https://supabase.com/docs)                |
|**TMDB API**      |Поиск фильмов, метаданные, постеры и фоны     |[Документация API](https://developer.themoviedb.org/docs)|
|**Motion**        |Анимации интерфейса                           |[Документация](https://motion.dev/)                      |
|**Lucide React**  |Иконки интерфейса                             |[Каталог и документация](https://lucide.dev/)            |

<a id="flow-ru"></a>

Как работает приложение

flowchart TD
    A[Пользователь в браузере] --> B[React UI]
    B --> C[Страницы и компоненты]
    C --> D[TMDB API]
    C --> E[Supabase Auth]
    E --> F[Supabase Database]
    D --> G[Поиск и метаданные фильмов]
    F --> H[Личный архив и записи пользователя]
    G --> C
    H --> C

• TMDB предоставляет каталог, описания и пути к изображениям. CineLog строит интерфейс вокруг этих данных.
• Supabase Auth отвечает за сессию и вход пользователя.
• Supabase Database хранит личные статусы, оценки, профиль и записи дневника в соответствии с настроенной схемой.
• React соединяет эти данные с UI, а React Router управляет переходами между разделами.

<a id="setup-ru"></a>

Установка и локальный запуск

Требования

• Node.js и npm в версиях, совместимых с Vite 8.
• Git.
• Проект в Supabase для авторизации и данных.
• Учётная запись и API Read Access Token в TMDB.

1. Клонировать репозиторий

git clone https://github.com/zvozvozvo/cinelog.git
cd cinelog

2. Установить зависимости

npm install

3. Настроить переменные окружения

Создай файл .env в корне проекта:

VITE_TMDB_TOKEN=YOUR_TMDB_READ_ACCESS_TOKEN
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

Замени все примеры своими значениями. Подробнее — в разделе «Переменные окружения».

4. Подготовить Supabase

Приложение ожидает базовую схему с таблицами movies, user_movies, profiles и connections. SQL-файлы в sql/ добавляют отдельные части схемы, но не создают всю базу с нуля:

• sql/add_profile_fields.sql — дополнительные поля профиля и политика доступа.
• sql/create_movie_journal.sql — дневник просмотров и политики доступа.

Открой Supabase → SQL Editor, изучи соответствующий скрипт и выполни его один раз для своей базы. Перед запуском SQL в существующем проекте проверь, какие таблицы и политики уже созданы.

5. Запустить локально

npm run dev

Vite выведет локальный адрес в терминале, обычно http://localhost:5173.

6. Собрать production-версию

npm run build
npm run preview

Проверить проект линтером:

npm run lint

<a id="supabase-ru"></a>

Настройка Supabase

1. Создай проект в Supabase Dashboard.
2. В настройках проекта скопируй Project URL и публичный publishable/anon key.
3. Добавь значения в локальный .env и в Environment Variables проекта Vercel.
4. Убедись, что существующая схема БД содержит необходимые таблицы и связи, используемые кодом.
5. Настрой политики Row Level Security (RLS) так, чтобы личные данные и оценки были доступны только их владельцу, а доступ к совместным функциям был явно разрешён ожидаемым участникам.
6. В Authentication → URL Configuration добавь адреса редиректа.

Пример адресов для локальной разработки и текущего развёртывания:

http://localhost:5173/**
https://cinelog-movie.vercel.app/**

В качестве Site URL для production используй https://cinelog-movie.vercel.app, если именно этот адрес является основным для твоего развёртывания. Если домен меняется, обнови его и в Supabase.

Документация: Supabase Auth Redirect URLs.

<a id="env-ru"></a>

Переменные окружения

|Переменная              |Обязательна|Назначение                                            |
|------------------------|:---------:|------------------------------------------------------|
|`VITE_TMDB_TOKEN`       |Да         |TMDB API Read Access Token для запросов к API фильмов.|
|`VITE_SUPABASE_URL`     |Да         |URL проекта Supabase.                                 |
|`VITE_SUPABASE_ANON_KEY`|Да         |Публичный ключ клиента Supabase (publishable/anon).   |

Где получить значения

• TMDB: зарегистрируйся и получи API Read Access Token в настройках API. Не вставляй сюда пароль от аккаунта TMDB.
• Supabase URL и ключ: найди в настройках своего проекта в разделе API / Project settings.

Важно для Vercel

После добавления или изменения переменных в Vercel нужно запустить новое развёртывание, чтобы значения попали в сборку. Проверь, что переменные заданы для нужных сред — обычно Production, а при необходимости также Preview и Development.

<a id="structure-ru"></a>

Структура репозитория

cinelog/
├── components/                 # Повторно используемые UI-компоненты
│   ├── AddMovieModal.jsx       # Модальное окно добавления фильма
│   ├── MovieCard.jsx           # Карточка фильма
│   ├── MovieJournal.jsx        # Дневник просмотров
│   ├── Navbar.jsx              # Навигация
│   └── Stat.jsx                # Компонент показателя статистики
├── pages/                      # Страницы приложения
│   ├── Auth.jsx                # Вход и регистрация
│   ├── Home.jsx                # Главная
│   ├── Films.jsx                # Каталог
│   ├── Watchlist.jsx            # Список «К просмотру»
│   ├── Movie.jsx                # Страница фильма
│   ├── Timeline.jsx             # Хронология
│   ├── Statistics.jsx           # Статистика
│   ├── Recommendations.jsx      # Рекомендации
│   ├── Together.jsx              # Совместный раздел
│   └── Profile.jsx               # Профиль
├── public/                      # Публичные статические ресурсы
├── sql/                         # SQL-скрипты/миграции Supabase
├── src/
│   ├── App.jsx                  # Основная логика маршрутов и состояния
│   ├── main.jsx                 # Точка входа React
│   ├── tmdb.js                  # Запросы к TMDB API
│   ├── supabaseMovies.js        # Работа с данными архива
│   ├── storage.js               # Вспомогательная работа с хранилищем
│   ├── index.css                # Базовые стили и дизайн-токены
│   └── App.css                  # Стили компонентов и страниц
├── supabase.js                  # Создание Supabase-клиента
├── index.html                   # HTML-шаблон
├── vite.config.js               # Конфигурация Vite
├── package.json                 # Скрипты и зависимости
├── package-lock.json            # Зафиксированные версии npm-пакетов
└── README.md                    # Документация проекта

<a id="security-ru"></a>

Безопасность и приватность

> [!CAUTION]
> **Не добавляй настоящий `.env` в GitHub. Не публикуй административные ключи.** Любая переменная с префиксом `VITE_` доступна клиентскому JavaScript после сборки.

• Никогда не помещай Supabase service_role или Secret Key во фронтенд.
• Для VITE_SUPABASE_ANON_KEY используй только публичный ключ, предназначенный для клиента.
• Считай TMDB token клиентским значением в этой архитектуре: он используется браузером и не должен рассматриваться как скрытый серверный секрет.
• Включи и проверь RLS для таблиц с личными записями. Сам факт использования Supabase не защищает таблицы автоматически.
• Не коммить пользовательские данные, токены, ключи или локальные файлы окружения.
• Если значение ключа случайно попало в публичный репозиторий, отзови или перевыпусти его у провайдера.

<a id="faq-ru"></a>

Частые проблемы

<details>
<summary><strong>Сайт открылся пустым экраном</strong></summary>

1. Открой DevTools → Console и посмотри первую красную ошибку.
2. Проверь Network: загружаются ли JavaScript-файлы, CSS и запросы к API.
3. Убедись, что Vercel завершил deployment со статусом Ready.
4. Проверь vite.config.js: для публикации в корне домена обычно нужен base: '/'.
5. После исправления конфигурации сделай новую сборку и жёсткую перезагрузку страницы.

</details>

<details>
<summary><strong>Поиск фильмов не работает</strong></summary>

• Проверь VITE_TMDB_TOKEN в локальном .env или настройках Vercel.
• После изменения .env перезапусти Vite; после изменения переменных в Vercel запусти новый deployment.
• Проверь запросы в DevTools → Network и ответы TMDB. Не публикуй токен в скриншотах или логах.

</details>

<details>
<summary><strong>Вход, регистрация или редиректы не работают</strong></summary>

• Проверь VITE_SUPABASE_URL и VITE_SUPABASE_ANON_KEY.
• Проверь Authentication → URL Configuration в Supabase.
• Убедись, что текущий домен разрешён в Redirect URLs.
• Проверь логи браузера и настройки подтверждения электронной почты в Supabase Auth.

</details>

<details>
<summary><strong>Постеры или изображения не отображаются</strong></summary>

• Проверь poster_path / backdrop_path в ответе TMDB.
• Убедись, что запросы к image.tmdb.org не блокируются сетью или расширениями браузера.
• Если у фильма действительно нет постера, интерфейс должен показывать аккуратную заглушку, а не ломать карточку.

</details>

<details>
<summary><strong>Можно ли смотреть фильмы прямо на CineLog?</strong></summary>

Нет. CineLog — каталог, личный архив и дневник просмотров. Он не размещает и не транслирует фильмы.

</details>

<a id="roadmap-ru"></a>

План развития

Уже реализовано в проекте

☑ Поиск и метаданные фильмов через TMDB
☑ Личный архив и статусы фильмов
☑ Личные оценки и список «К просмотру»
☑ Карточки фильмов
☑ Авторизация через Supabase
☑ Профиль пользователя
☑ История и статистика
☑ Рекомендации
☑ Совместный раздел
☑ Дневник просмотров и пересмотров

Возможные следующие улучшения

☐ Импорт и экспорт личного архива
☐ Пользовательские коллекции и списки
☐ Итоги года на основе реальных данных пользователя
☐ Улучшение мобильной навигации и состояний загрузки
☐ Дополнительная обработка отсутствующих постеров и ошибок API
☐ Расширенная доступность: клавиатурная навигация, контраст и доступные подписи

План может меняться по мере тестирования и развития проекта. Отметка в списке функций не заменяет проверку конкретного deployment.

<a id="credits-ru"></a>

TMDB и права на материалы

CineLog использует TMDB API для поиска фильмов и получения метаданных, включая изображения, где они доступны. CineLog — независимый проект и не одобрен и не сертифицирован TMDB.

TMDB: сайт · документация API · настройки API.

Названия фильмов, постеры, фоны и связанные данные принадлежат соответствующим правообладателям и предоставляются согласно условиям источника.

<a id="contributing-ru"></a>

Участие в проекте

Нашёл ошибку или есть идея? Создай Issue в GitHub и опиши:

1. Что ты ожидал увидеть.
2. Что произошло на самом деле.
3. Шаги для повторения проблемы.
4. Браузер и устройство, если проблема связана с интерфейсом.
5. Скриншот ошибки, скрыв личные данные и ключи.

Если хочешь предложить код, создай fork и pull request с кратким описанием изменений. Перед крупным изменением интерфейса полезно сначала обсудить идею в Issue.

Лицензия

На момент написания README в репозитории не указан файл LICENSE. Пока лицензия не добавлена, не следует считать код свободно лицензированным для произвольного повторного использования. Если планируется открытое использование проекта, сначала нужно выбрать и добавить лицензию.

────────

<a id="english"></a>

🇬🇧 English version

Table of contents

• About the project
• Live demo and source
• Features
• Application routes
• Design direction
• Technology stack
• Application flow
• Local installation
• Supabase setup
• Environment variables
• Repository structure
• Security and privacy
• FAQ and troubleshooting
• Roadmap
• TMDB attribution
• Contributing

<a id="about-en"></a>

About the project

CineLog is a personal movie archive and viewing journal. It helps you build a collection of films, mark what you have watched, add your own ratings, save titles for later and gradually create a record of your cinematic taste.

Instead of repeatedly asking “What should I watch tonight?”, CineLog gives you a place to remember what you watched, keep notes and return to films worth revisiting. The application also includes a user profile, viewing statistics, recommendations and a shared area for comparing taste with another person.

CineLog is a web application built with an adaptive interface. Its visual direction takes inspiration from editorial film journals and curated digital archives: near-black backgrounds, warm ivory typography, a vivid lime accent, prominent movie artwork and restrained UI controls.

<a id="live-en"></a>

Live demo and source code

• Open CineLog — the currently published application.
• Source code on GitHub — pages, components, SQL scripts and configuration.
• Report a bug or suggest a feature — issues and ideas.

> Running the project locally and using account-based features requires your own TMDB and Supabase configuration. Reachability of the hosted site may depend on network conditions and region.

<a id="features-en"></a>

Features

|Feature                   |Description                                                                                            |
|--------------------------|-------------------------------------------------------------------------------------------------------|
|**Personal movie library**|Keep films in one catalogue and manage their statuses.                                                 |
|**TMDB search**           |Search movie titles and retrieve metadata from The Movie Database.                                     |
|**Personal ratings**      |Rate watched films independently of their public TMDB rating.                                          |
|**Watchlist**             |Save films you plan to watch later.                                                                    |
|**Movie details**         |Browse overview, release year, genres, runtime, director, poster and backdrop when available from TMDB.|
|**Timeline**              |Explore your cinema history chronologically.                                                           |
|**Statistics**            |Review personal metrics, ratings, genres and viewing patterns.                                         |
|**Viewing journal**       |Record a watch or rewatch with a date, rating and personal note.                                       |
|**Recommendations**       |Discover films using TMDB data and taste-related preferences.                                          |
|**Together**              |Use shared features and compare ratings after another user connection is configured.                   |
|**Profile**               |Manage display name, avatar, bio and favorite genres.                                                  |
|**Responsive UI**         |Use the interface on desktop and mobile devices.                                                       |

> Some user features depend on a correctly configured Supabase database schema and access policies. This README documents the current codebase; it does not guarantee that every deployment has identical configuration.

<a id="routes-en"></a>

Application routes

|Route                                   |Purpose                          |
|----------------------------------------|---------------------------------|
|[`/`](https://cinelog-movie.vercel.app/)|Home                             |
|`/auth`                                 |Sign in and registration         |
|`/films`                                |Movie library                    |
|`/watchlist`                            |Watchlist                        |
|`/timeline`                             |Viewing timeline                 |
|`/statistics`                           |Viewing and rating statistics    |
|`/movie/:id`                            |Movie details and viewing journal|
|`/recommendations`                      |Recommendations                  |
|`/together`                             |Shared area and taste comparison |
|`/profile`                              |User profile                     |

<a id="design-en"></a>

Design direction

CineLog follows an editorial approach to interface design: films, posters and personal records are the focus, while decoration stays quiet.

• Palette: black and charcoal surfaces, warm ivory text and a vivid lime accent.
• Artwork first: posters provide a fast visual way to browse the archive.
• Typography: expressive headings paired with compact labels and metadata.
• Fine dividers: thin lines organise content without overwhelming it with heavy cards.
• Responsive layouts: sections, cards and navigation should remain readable on narrow screens.
• Evolving identity: the CineLog logo concept is a CL monogram inside a viewfinder-like frame with a lime accent. Design details may evolve as the interface develops.

<a id="stack-en"></a>

Technology stack

|Technology        |Role                                   |Link                                                      |
|------------------|---------------------------------------|----------------------------------------------------------|
|**React 19**      |UI components and state                |[Documentation](https://react.dev/)                       |
|**Vite 8**        |Dev server and production builds       |[Documentation](https://vite.dev/)                        |
|**Tailwind CSS 4**|Utility-first styling                  |[Documentation](https://tailwindcss.com/)                 |
|**React Router 7**|Client-side routing                    |[Documentation](https://reactrouter.com/)                 |
|**Supabase**      |Authentication and user data           |[Documentation](https://supabase.com/docs)                |
|**TMDB API**      |Search, metadata, posters and backdrops|[API documentation](https://developer.themoviedb.org/docs)|
|**Motion**        |UI animation                           |[Documentation](https://motion.dev/)                      |
|**Lucide React**  |UI icons                               |[Icons and documentation](https://lucide.dev/)            |

<a id="flow-en"></a>

Application flow

flowchart TD
    A[Browser user] --> B[React UI]
    B --> C[Pages and components]
    C --> D[TMDB API]
    C --> E[Supabase Auth]
    E --> F[Supabase Database]
    D --> G[Movie search and metadata]
    F --> H[Personal library and user records]
    G --> C
    H --> C

• TMDB provides the movie catalogue, descriptions and image paths.
• Supabase Auth manages sessions and sign-in.
• Supabase Database stores personal statuses, ratings, profiles and journal entries according to the configured schema.
• React connects this data to the UI, while React Router handles navigation between sections.

<a id="setup-en"></a>

Local installation

Requirements

• Node.js and npm versions compatible with Vite 8.
• Git.
• A Supabase project for authentication and data.
• A TMDB account and API Read Access Token from TMDB API settings.

1. Clone the repository

git clone https://github.com/zvozvozvo/cinelog.git
cd cinelog

2. Install dependencies

npm install

3. Configure environment variables

Create a .env file in the project root:

VITE_TMDB_TOKEN=YOUR_TMDB_READ_ACCESS_TOKEN
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY

Replace the placeholders with your own values. See Environment variables.

4. Prepare Supabase

The app expects a base schema with movies, user_movies, profiles and connections tables. SQL files in sql/ add specific schema features but do not create the entire database from scratch:

• sql/add_profile_fields.sql — additional profile fields and an access policy.
• sql/create_movie_journal.sql — viewing journal and access policies.

Open Supabase → SQL Editor, review the relevant script and run it once for your database. Before executing SQL against an existing project, check which tables and policies are already present.

5. Start the development server

npm run dev

Vite prints a local URL in the terminal, usually http://localhost:5173.

6. Build and preview production

npm run build
npm run preview

Run ESLint:

npm run lint

<a id="supabase-en"></a>

Supabase setup

1. Create a project in the Supabase Dashboard.
2. Copy the Project URL and public publishable/anon key from the project settings.
3. Add these values to your local .env and to the Vercel project’s Environment Variables.
4. Make sure the database has the tables and relations queried by the application.
5. Configure Row Level Security (RLS) so personal records and ratings are only available to their owners, and shared features grant access only to intended participants.
6. Configure authentication redirect URLs.

Example URLs for local development and the current deployment:

http://localhost:5173/**
https://cinelog-movie.vercel.app/**

Use https://cinelog-movie.vercel.app as the production Site URL if this is the canonical address for your deployment. Update the setting if your primary domain changes.

Documentation: Supabase Auth Redirect URLs.

<a id="env-en"></a>

Environment variables

|Variable                |Required|Purpose                                       |
|------------------------|:------:|----------------------------------------------|
|`VITE_TMDB_TOKEN`       |Yes     |TMDB API Read Access Token for movie requests.|
|`VITE_SUPABASE_URL`     |Yes     |Supabase project URL.                         |
|`VITE_SUPABASE_ANON_KEY`|Yes     |Public Supabase client key (publishable/anon).|

Where to get them

• TMDB: create an account and generate an API Read Access Token in API settings. Do not use your TMDB account password.
• Supabase URL and key: open your Supabase project dashboard and find the project API settings.

Vercel deployment

After adding or changing environment variables in Vercel, trigger a new deployment so the values are included in the build. Check that the variables are set for the appropriate environments — usually Production, and optionally Preview and Development.

<a id="structure-en"></a>

Repository structure

cinelog/
├── components/                 # Reusable UI components
│   ├── AddMovieModal.jsx       # Add-movie modal
│   ├── MovieCard.jsx           # Movie card
│   ├── MovieJournal.jsx        # Viewing journal
│   ├── Navbar.jsx              # Navigation
│   └── Stat.jsx                # Statistic component
├── pages/                      # Application pages
│   ├── Auth.jsx                # Sign in and registration
│   ├── Home.jsx                # Home
│   ├── Films.jsx               # Movie library
│   ├── Watchlist.jsx            # Watchlist
│   ├── Movie.jsx                # Movie details
│   ├── Timeline.jsx             # Timeline
│   ├── Statistics.jsx           # Statistics
│   ├── Recommendations.jsx      # Recommendations
│   ├── Together.jsx              # Shared features
│   └── Profile.jsx               # User profile
├── public/                      # Static assets
├── sql/                         # Supabase SQL scripts/migrations
├── src/
│   ├── App.jsx                  # Main routes and app state
│   ├── main.jsx                 # React entry point
│   ├── tmdb.js                  # TMDB API helpers
│   ├── supabaseMovies.js        # Movie-library data access
│   ├── storage.js               # Storage helpers
│   ├── index.css                # Base styles and design tokens
│   └── App.css                  # Page and component styles
├── supabase.js                  # Supabase client
├── index.html                   # HTML entry template
├── vite.config.js               # Vite configuration
├── package.json                # Scripts and dependencies
├── package-lock.json            # Locked npm dependency tree
└── README.md                    # Project documentation

<a id="security-en"></a>

Security and privacy

> [!CAUTION]
> **Do not commit your real `.env` file or publish administrative keys.** Every variable prefixed with `VITE_` is available to client-side JavaScript after the build.

• Never put the Supabase service_role or Secret Key in the frontend.
• Use only the public client key intended for VITE_SUPABASE_ANON_KEY.
• Treat the TMDB token as a client-exposed value in this architecture: browser requests use it, so it is not a hidden server-side secret.
• Enable and verify RLS on tables containing personal data. Using Supabase alone does not automatically secure every table.
• Never commit personal records, tokens, keys or local environment files.
• If a key is accidentally committed to a public repository, revoke or rotate it with the provider.

<a id="faq-en"></a>

FAQ and troubleshooting

<details>
<summary><strong>The site loads a blank screen</strong></summary>

1. Open DevTools → Console and inspect the first red error.
2. Check Network to see whether JavaScript, CSS and API requests load successfully.
3. Verify that Vercel’s deployment status is Ready.
4. Check vite.config.js: for a site deployed at a domain root, base: '/' is usually appropriate.
5. Rebuild after configuration changes and hard-refresh the page.

</details>

<details>
<summary><strong>Movie search does not work</strong></summary>

• Check VITE_TMDB_TOKEN in .env or in Vercel settings.
• Restart Vite after changing .env; trigger a new Vercel deployment after changing hosted environment variables.
• Inspect API requests and responses in DevTools → Network. Do not share your token in screenshots or logs.

</details>

<details>
<summary><strong>Sign-in, registration or redirects fail</strong></summary>

• Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
• Check Authentication → URL Configuration in Supabase.
• Make sure the current domain is allowed under Redirect URLs.
• Inspect browser errors and email-confirmation settings in Supabase Auth.

</details>

<details>
<summary><strong>Posters or images are missing</strong></summary>

• Check poster_path and backdrop_path in the TMDB response.
• Make sure requests to image.tmdb.org are not blocked by the network or browser extensions.
• When an image genuinely does not exist, the interface should display a graceful fallback instead of breaking the card.

</details>

<details>
<summary><strong>Can I stream movies on CineLog?</strong></summary>

No. CineLog is a catalogue, personal archive and viewing journal. It does not host or stream films.

</details>

<a id="roadmap-en"></a>

Roadmap

Currently implemented in the project

☑ TMDB search and movie metadata
☑ Personal archive and film statuses
☑ Personal ratings and watchlist
☑ Movie detail pages
☑ Supabase authentication
☑ User profile
☑ Timeline and statistics
☑ Recommendations
☑ Shared area
☑ Viewing journal and rewatches

Potential improvements

☐ Personal archive import and export
☐ Custom collections and lists
☐ Yearly recap based on actual user data
☐ Better mobile navigation and loading states
☐ More robust fallback states for missing posters and API errors
☐ Improved accessibility: keyboard navigation, contrast and accessible labels

The roadmap can change as the project is tested and developed. A feature checklist does not replace testing a specific deployment.

<a id="credits-en"></a>

TMDB attribution and content rights

CineLog uses the TMDB API for movie search and metadata, including image assets when available. CineLog is an independent project and is not endorsed or certified by TMDB.

TMDB: website · API documentation · API settings.

Movie titles, posters, backdrops and related data remain the property of their respective rights holders and are provided under the source’s terms.

<a id="contributing-en"></a>

Contributing

Found a bug or have an idea? Open a GitHub Issue and include:

1. What you expected to happen.
2. What happened instead.
3. Steps to reproduce the issue.
4. Browser and device details, if the issue is UI-related.
5. A screenshot, with personal data and keys hidden.

To contribute code, create a fork and open a pull request with a brief explanation of the change. For large UI changes, discussing the idea in an Issue first is helpful.

License

At the time this README was written, the repository does not include a LICENSE file. Until a license is added, the code should not be assumed to be freely available for unrestricted reuse. If open reuse is intended, choose and add a license first.

────────

<div align="center">

CineLog

Твоя история кино начинается с одного фильма.
Your cinema history starts with one film.

<p>
  <a href="https://cinelog-movie.vercel.app/">
    <img src="https://img.shields.io/badge/ПОПРОБОВАТЬ-CineLog-B9F45A?style=for-the-badge&logo=vercel&logoColor=111111&labelColor=111111" alt="Попробовать CineLog">
  </a>
  <a href="https://github.com/zvozvozvo/cinelog">
    <img src="https://img.shields.io/badge/STAR-THIS_REPOSITORY-EDEBE4?style=for-the-badge&logo=github&logoColor=111111&labelColor=111111" alt="Star this repository">
  </a>
  <a href="https://github.com/zvozvozvo/cinelog/issues">
    <img src="https://img.shields.io/badge/IDEAS_&_BUGS-OPEN_AN_ISSUE-222722?style=for-the-badge&logo=github&logoColor=white&labelColor=111111" alt="Open an issue">
  </a>
</p>

<sub>Made for people who remember how a film made them feel.</sub>

</div>