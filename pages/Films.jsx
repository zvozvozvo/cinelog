import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownUp,
  Bookmark,
  CheckCircle2,
  Film,
  Plus,
  Search,
  Star,
  X,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";

const SORTS = [
  { key: "recent", label: "Сначала новые" },
  { key: "oldest", label: "Сначала старые" },
  { key: "rating", label: "С лучшей оценкой" },
  { key: "title", label: "По названию" },
  { key: "year", label: "По году выхода" },
];

const VIEW_TABS = [
  { key: "all", path: "/films", label: "Все фильмы" },
  { key: "watched", path: "/watched", label: "Просмотрено" },
  { key: "rated", path: "/rated", label: "С оценкой" },
  { key: "watchlist", path: "/watchlist", label: "К просмотру" },
];

function ratingOf(movie) {
  const value = Number(movie.personalRating ?? movie.youRating ?? movie.rating ?? 0);
  return Number.isFinite(value) ? value : 0;
}

function getViewConfig(mode) {
  if (mode === "watched") {
    return {
      kicker: "ТВОЯ ИСТОРИЯ / ПРОСМОТРЕНО",
      title: "Уже посмотрел",
      subtitle: "Фильмы, которые ты посмотрел. Личная оценка не обязательна.",
      emptyTitle: "Пока нет просмотренных фильмов",
      emptyText: "Добавляй просмотренное в архив, чтобы собрать личную историю кино.",
      emptyIcon: CheckCircle2,
    };
  }
  if (mode === "rated") {
    return {
      kicker: "КИНОАРХИВ / С ОЦЕНКОЙ",
      title: "С оценкой",
      subtitle: "Фильмы, которым ты поставил личную оценку. Это фильтр внутри архива, а не отдельный раздел.",
      emptyTitle: "Нет фильмов с оценкой",
      emptyText: "Отметь фильм как просмотренный и поставь ему личную оценку.",
      emptyIcon: Star,
    };
  }
  return {
    kicker: "ТВОЯ КОЛЛЕКЦИЯ",
    title: "Киноархив",
    subtitle: "Все фильмы, которые ты уже посмотрел или сохранил на потом.",
    emptyTitle: "Архив пока пуст",
    emptyText: "Добавь фильм, чтобы начать собирать собственную историю кино.",
    emptyIcon: Film,
  };
}

export default function Films({ movies = [], onAddMovie, mode = "all" }) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sort, setSort] = useState(mode === "rated" ? "rating" : "recent");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  useEffect(() => {
    setSort(mode === "rated" ? "rating" : "recent");
  }, [mode]);

  const counts = useMemo(() => {
    const watched = movies.filter((movie) => movie.status === "watched");
    return {
      all: movies.length,
      watched: watched.length,
      rated: watched.filter((movie) => ratingOf(movie) > 0).length,
      watchlist: movies.filter((movie) => movie.status === "watchlist").length,
    };
  }, [movies]);

  const list = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    const result = movies.filter((movie) => {
      const rating = ratingOf(movie);
      const matchesMode =
        mode === "watched"
          ? movie.status === "watched"
          : mode === "rated"
            ? movie.status === "watched" && rating > 0
            : true;
      const title = `${movie.title || ""} ${movie.originalTitle || ""} ${movie.name || ""}`.toLocaleLowerCase("ru");
      return matchesMode && (!normalizedQuery || title.includes(normalizedQuery));
    });

    result.sort((a, b) => {
      if (sort === "oldest") return new Date(a.addedAt || a.added_at || 0) - new Date(b.addedAt || b.added_at || 0);
      if (sort === "rating") return ratingOf(b) - ratingOf(a);
      if (sort === "title") return String(a.title || a.originalTitle || "").localeCompare(String(b.title || b.originalTitle || ""), "ru");
      if (sort === "year") return String(b.release_date || b.releaseDate || b.year || "").localeCompare(String(a.release_date || a.releaseDate || a.year || ""));
      return new Date(b.addedAt || b.added_at || 0) - new Date(a.addedAt || a.added_at || 0);
    });
    return result;
  }, [movies, mode, sort, query]);

  const config = getViewConfig(mode);
  const EmptyIcon = config.emptyIcon;

  function syncSearch(nextQuery) {
    const next = {};
    if (nextQuery.trim()) next.q = nextQuery.trim();
    setSearchParams(next, { replace: true });
  }

  function clearSearch() {
    setQuery("");
    setSearchParams({}, { replace: true });
  }

  return (
    <div className="cine-page cine-films-page cine-page-enter">
      <section className="cine-page-head">
        <div className="cine-page-head__row">
          <div>
            <p className="cine-kicker">{config.kicker} <span className="cine-count-dot">/</span> {list.length} {list.length === 1 ? "ФИЛЬМ" : "ФИЛЬМОВ"}</p>
            <h1 className="cine-page-title">{config.title}<span className="cine-title-dot">.</span></h1>
            <p className="cine-page-subtitle">{config.subtitle}</p>
          </div>
          <button type="button" className="cine-button cine-button--solid cine-add-top" onClick={onAddMovie}>
            <Plus size={16} /> Добавить фильм
          </button>
        </div>
      </section>

      <nav className="cine-archive-tabs" aria-label="Фильтры киноархива">
        {VIEW_TABS.map((tab) => {
          const active = tab.key === mode;
          const Icon = tab.key === "rated" ? Star : tab.key === "watched" ? CheckCircle2 : tab.key === "watchlist" ? Bookmark : Film;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => navigate(tab.key === "watchlist" ? tab.path : query.trim() ? `${tab.path}?q=${encodeURIComponent(query.trim())}` : tab.path)}
              className={`cine-archive-tab ${active ? "is-active" : ""}`}
              aria-current={active ? "page" : undefined}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              <small>{counts[tab.key]}</small>
            </button>
          );
        })}
      </nav>

      <section className="cine-library-toolbar" aria-label="Поиск и сортировка">
        <form className="cine-archive-search" role="search" onSubmit={(event) => { event.preventDefault(); syncSearch(query); }}>
          <Search size={19} strokeWidth={1.8} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={mode === "rated" ? "Найти фильм с оценкой..." : "Найти фильм по названию..."}
            aria-label="Найти фильм в архиве"
          />
          {query && <button type="button" onClick={clearSearch} aria-label="Очистить поиск"><X size={16} /></button>}
        </form>
        <label className="cine-sort-control">
          <ArrowDownUp size={16} />
          <span>Сортировка</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка фильмов">
            {SORTS.map((option) => <option value={option.key} key={option.key}>{option.label}</option>)}
          </select>
        </label>
      </section>

      <div className="cine-results-line">
        <span>{query ? `Результаты поиска: ${list.length}` : `В этой подборке: ${list.length}`}</span>
        {query && <button type="button" onClick={clearSearch}>Сбросить поиск <X size={13} /></button>}
      </div>

      {list.length > 0 ? (
        <div className="cine-grid cine-grid--wide cine-grid--editorial">
          {list.map((movie, index) => (
            <MovieCard key={`${movie.id}-${movie.status}`} movie={movie} index={index} />
          ))}
        </div>
      ) : (
        <div className="cine-empty cine-empty--refresh cine-empty--editorial">
          <div className="cine-empty__inner">
            <span className="cine-empty__icon"><EmptyIcon size={25} strokeWidth={1.4} /></span>
            <h2 className="cine-empty__title">{query ? "По этому запросу пока пусто" : config.emptyTitle}</h2>
            <p className="cine-empty__text">{query ? "Попробуй другое название или очисти поиск." : config.emptyText}</p>
            {query
              ? <button type="button" className="cine-button cine-button--glass" onClick={clearSearch}>Очистить поиск</button>
              : <button type="button" className="cine-button cine-button--solid" onClick={onAddMovie}><Plus size={16} /> Добавить фильм</button>}
          </div>
        </div>
      )}
    </div>
  );
}
