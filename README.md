<div align="center">

# CINELOG

### Your personal cinema archive.

Track what you watch. Rate what stays with you. Build your own history of cinema.

<br>

[![React](https://img.shields.io/badge/React-19-111111?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-7-111111?style=for-the-badge&logo=vite&logoColor=646CFF)](https://vite.dev/)
[![TMDB](https://img.shields.io/badge/TMDB-API-111111?style=for-the-badge&logo=themoviedatabase&logoColor=01D277)](https://www.themoviedb.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-111111?style=for-the-badge&logo=tailwindcss&logoColor=06B6D4)](https://tailwindcss.com/)

<br>

<a href="#-overview">Overview</a>
&nbsp;•&nbsp;
<a href="#-features">Features</a>
&nbsp;•&nbsp;
<a href="#-interface">Interface</a>
&nbsp;•&nbsp;
<a href="#-stack">Stack</a>
&nbsp;•&nbsp;
<a href="#-installation">Installation</a>
&nbsp;•&nbsp;
<a href="#-project-structure">Structure</a>

<br><br>

<a href="#-installation"><strong>Get Started →</strong></a>
&nbsp;&nbsp;
<a href="https://github.com/zvozvozvo/cinelog"><strong>View Repository →</strong></a>

</div>

---

## ◼ Overview

**CineLog** is a personal movie tracking application built around a simple idea:

> Your watch history should feel like an archive, not a spreadsheet.

The app combines TMDB-powered movie discovery with a personal library, ratings, watchlist, timeline and statistics.

The interface is intentionally editorial and cinematic: large typography, restrained motion, poster-focused layouts and minimal metadata.

---

## ◼ Features

| Feature | Description |
| --- | --- |
| **Movie Search** | Search the TMDB catalogue and discover films automatically |
| **Personal Library** | Keep a persistent collection of films you've watched |
| **Watchlist** | Save films you want to watch later |
| **Personal Ratings** | Rate films from `0 → 10` |
| **Movie Pages** | Posters, backdrops, director, runtime, genres and metadata |
| **Timeline** | See your viewing history chronologically |
| **Statistics** | Rating distribution, genres, years, runtime and activity |
| **Filters & Sorting** | Quickly organize and explore your archive |
| **Local Persistence** | Personal data survives browser sessions via `localStorage` |
| **Responsive UI** | Designed for desktop, tablet and mobile |

---

## ◼ Interface

CineLog is designed as a **cinema archive**, not a generic SaaS dashboard.

### Home

A cinematic entry point into your personal collection.

### Films

Your complete archive with search, filtering and sorting.

### Watchlist

A focused queue of films waiting to be watched.

### Timeline

A chronological view of your viewing history.

### Statistics

A visual breakdown of your movie habits, ratings and preferences.

### Movie Details

A dedicated film page with artwork and metadata from TMDB.

---

## ◼ Navigation

| Route | Purpose |
| --- | --- |
| `/` | Home / dashboard |
| `/films` | Film archive |
| `/watchlist` | Watchlist |
| `/timeline` | Viewing timeline |
| `/statistics` | Personal statistics |
| `/movie/:id` | Movie details |

---

## ◼ Stack

| Technology | Role |
| :---: | --- |
| **React** | UI architecture |
| **Vite** | Development & production tooling |
| **Tailwind CSS** | Styling system |
| **React Router** | Client-side routing |
| **Lucide React** | Interface icons |
| **Motion** | UI animation |
| **TMDB API** | Movie data & artwork |
| **LocalStorage** | Personal library persistence |

---

## ◼ Installation

### 01 — Clone

```bash
git clone https://github.com/zvozvozvo/cinelog.git
cd cinelog
```

### 02 — Install dependencies

```bash
npm install
```

### 03 — Configure TMDB

Create a `.env` file in the project root:

```env
VITE_TMDB_TOKEN=YOUR_TMDB_BEARER_TOKEN
```

### 04 — Start development

```bash
npm run dev
```

### 05 — Production build

```bash
npm run build
```

Preview it with:

```bash
npm run preview
```

---

## ◼ Environment

CineLog requires a TMDB API Read Access Token for movie search and metadata.

```env
VITE_TMDB_TOKEN=YOUR_TMDB_BEARER_TOKEN
```

> [!IMPORTANT]
> Never commit your real `.env` file or API credentials.

---

## ◼ Project Structure

```text
cinelog/
├── components/       # Reusable interface components
├── pages/            # Application pages
├── public/           # Static assets
├── src/              # App entry, API, storage and styles
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## ◼ Data

CineLog stores personal movie-library data locally in the browser.

- No personal database is required
- Watchlist data persists between sessions
- Personal ratings are stored locally
- Clearing browser storage removes local CineLog data
- TMDB provides movie discovery and metadata

---

## ◼ Design Philosophy

CineLog deliberately avoids the visual language of generic productivity dashboards.

**Less chrome.**  
The movie remains the visual focus.

**Strong typography.**  
Editorial titles replace unnecessary UI decoration.

**Quiet metadata.**  
Secondary information stays visually restrained.

**Controlled motion.**  
Animation supports interaction instead of decorating every pixel.

**Poster-first layouts.**  
Cinema artwork is treated as content, not as a tiny thumbnail.

**Dark archive aesthetic.**  
The visual language draws from film catalogues, editorial publications and physical archives.

---

## ◼ Roadmap

- [x] TMDB integration
- [x] Movie search
- [x] Personal movie library
- [x] Watchlist
- [x] Personal ratings
- [x] Movie detail pages
- [x] Timeline
- [x] Statistics
- [x] Responsive layout
- [ ] Advanced statistics
- [ ] Import / export library
- [ ] Custom lists
- [ ] Richer movie notes
- [ ] Cloud synchronization
- [ ] Public profile / shared cinema archive

---

## ◼ TMDB

CineLog uses the **TMDB API** for movie information, posters and backdrops.

This product uses the TMDB API but is **not endorsed or certified by TMDB**.

---

## ◼ License

No open-source license has been selected yet.

---

<div align="center">

## CINELOG

*Keep your cinema history.*

<br>

<a href="#-overview">↑ Back to top</a>

<br><br>

<sub>Built with React, Vite & a slightly unhealthy amount of movies.</sub>

</div>
