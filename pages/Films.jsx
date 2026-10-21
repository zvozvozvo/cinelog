import { useEffect, useMemo, useState } from "react";
import { ArrowDownUp, Film, Plus, Search, X } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import MovieCard from "../components/MovieCard";

const FILTERS = [
  { key: "all", label: "Все фильмы" },
  { key: "watched", label: "Просмотрено" },
  { key: "watchlist", label: "К просмотру" },
];

const SORTS = [
  { key: "recent", label: "Сначала новые" },
  { key: "oldest", label: "Сначала старые" },
  { key: "rating", label: "С лучшей оценкой" },
  { key: "title", label: "По названию" },
  { key: "year", label: "По году выхода" },
];

export default function Films({ movies = [], onAddMovie }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState(() => searchParams.get("q") || "");

  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const counts = useMemo(() => ({
    all: movies.length,
    watched: movies.filter((movie) => movie.status === "watched").length,
    watchlist: movies.filter((movie) => movie.status === "watchlist").length,
  }), [movies]);

  const list = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("ru");
    const result = movies.filter((movie) => {
      const matchesFilter = filter === "all" || movie.status === filter;
      const title = `${movie.title || ""} ${movie.originalTitle || ""} ${movie.name || ""}`.toLocaleLowerCase("ru");
      return matchesFilter && (!normalizedQuery || title.includes(normalizedQuery));
    });

    result.sort((a, b) => {
      if (sort === "oldest") return new Date(a.addedAt || a.added_at || 0) - new Date(b.addedAt || b.added_at || 0);
      if (sort === "rating") return Number(b.personalRating ?? b.youRating ?? 0) - Number(a.personalRating ?? a.youRating ?? 0);
      if (sort === "title") return String(a.title || a.originalTitle || "").localeCompare(String(b.title || b.originalTitle || ""), "ru");
      if (sort === "year") return String(b.release_date || b.year || "").localeCompare(String(a.release_date || a.year || ""));
      return new Date(b.addedAt || b.added_at || 0) - new Date(a.addedAt || a.added_at || 0);
    });
    return result;
  }, [movies, filter, sort, query]);

  function clearSearch() {
    setQuery("");
    setSearchParams({});
  }

  return (
    <div className="cine-page cine-films-page">
      <section className="cine-page-head">
        <div className="cine-page-head__row">
          <div>
            <p className="cine-kicker">ТВОЯ КОЛЛЕКЦИЯ / {movies.length} {movies.length === 1 ? "ФИЛЬМ" : "ФИЛЬМОВ"}</p>
            <h1 className="cine-page-title">Киноархив<span className="cine-title-dot">.</span></h1>
            <p className="cine-page-subtitle">Все фильмы, которые ты уже посмотрел или ещё только собираешься открыть.</p>
          </div>
          <button type="button" className="cine-button cine-button--solid" onClick={onAddMovie}><Plus size={16} /> Добавить фильм</button>
        </div>
      </section>

      <section className="cine-library-toolbar" aria-label="Поиск и фильтры архива">
        <form className="cine-archive-search" role="search" onSubmit={(event) => { event.preventDefault(); setSearchParams(query.trim() ? { q: query.trim() } : {}); }}>
          <Search size={19} strokeWidth={1.8} />
          <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Найти фильм в архиве..." aria-label="Найти фильм в архиве" />
          {query && <button type="button" onClick={clearSearch} aria-label="Очистить поиск"><X size={16} /></button>}
        </form>
        <label className="cine-sort-control"><ArrowDownUp size={16} /><span>Сортировка</span>
          <select value={sort} onChange={(event) => setSort(event.target.value)} aria-label="Сортировка фильмов">
            {SORTS.map((option) => <option value={option.key} key={option.key}>{option.label}</option>)}
          </select>
        </label>
      </section>

      <div className="cine-filter-tabs" role="group" aria-label="Фильтр по статусу">
        {FILTERS.map((item) => (
          <button key={item.key} type="button" onClick={() => setFilter(item.key)} className={filter === item.key ? "is-active" : ""} aria-pressed={filter === item.key}>
            {item.label}<span>{counts[item.key]}</span>
          </button>
        ))}
      </div>

      <div className="cine-results-line">
        <span>{list.length === 0 ? "Ничего не найдено" : `Найдено: ${list.length}`}</span>
        {query && <button type="button" onClick={clearSearch}>Сбросить поиск <X size={13} /></button>}
      </div>

      {list.length > 0 ? (
        <div className="cine-grid cine-grid--wide">
          {list.map((movie, index) => <MovieCard key={`${movie.id}-${movie.status}`} movie={movie} index={index} />)}
        </div>
      ) : (
        <div className="cine-empty cine-empty--refresh">
          <div className="cine-empty__inner">
            <span className="cine-empty__icon"><Film size={25} strokeWidth={1.4} /></span>
            <h2 className="cine-empty__title">{query ? "По этому запросу пока пусто" : filter === "watchlist" ? "Список ожидания пуст" : filter === "watched" ? "Ещё нет просмотренных фильмов" : "Архив пока пуст"}</h2>
            <p className="cine-empty__text">{query ? "Попробуй другое название или очисти поиск." : "Добавь фильм, чтобы начать собирать собственную историю кино."}</p>
            {query ? <button type="button" className="cine-button cine-button--glass" onClick={clearSearch}>Очистить поиск</button> : <button type="button" className="cine-button cine-button--solid" onClick={onAddMovie}><Plus size={16} /> Добавить фильм</button>}
          </div>
        </div>
      )}
    </div>
  );
}
