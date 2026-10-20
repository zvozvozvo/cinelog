import { useMemo, useState } from "react";
import { ArrowRight, Bookmark, Film, Plus, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

import MovieCard from "../components/MovieCard";

export default function Watchlist({ movies = [], onAddMovie }) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  const watchlist = useMemo(() => {
    const q = query.trim().toLowerCase();

    return movies
      .filter((movie) => movie.status === "watchlist")
      .filter((movie) => {
        if (!q) return true;

        return (
          String(movie.title || "")
            .toLowerCase()
            .includes(q) ||
          String(movie.originalTitle || "")
            .toLowerCase()
            .includes(q)
        );
      })
      .sort(
        (a, b) =>
          new Date(b.addedAt || 0) -
          new Date(a.addedAt || 0)
      );
  }, [movies, query]);

  const watched = movies.filter(
    (movie) => movie.status === "watched"
  ).length;

  return (
    <div className="cine-page">

      <section className="border-b border-white/[.13] py-14 md:py-16">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">

          <div>
            <p className="cine-kicker cine-accent">
              Отложено на потом / Список
            </p>

            <div className="mt-4 flex items-center gap-5">
              <span className="grid h-12 w-12 shrink-0 place-items-center border border-white/[.14] bg-[#0d110e] text-[#b7f34a]">
                <Bookmark size={20} strokeWidth={1.5} />
              </span>

              <h1 className="cine-page-title">
                К просмотру
              </h1>
            </div>

            <p className="cine-page-subtitle">
              Фильмы, просмотр которых ты отложил. Аккуратный список того, что ты когда-нибудь обязательно посмотришь.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddMovie}
            className="flex h-[52px] shrink-0 items-center justify-center gap-3 border border-[#b7f34a] bg-[#b7f34a] px-6 cine-mono text-[10px] font-bold uppercase tracking-[.15em] text-black transition duration-200 hover:bg-[#c7ff62]"
          >
            <Plus size={15} strokeWidth={2} />
            Добавить фильм
          </button>

        </div>
      </section>

      <section className="border-b border-white/[.13] py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

          <div className="relative w-full md:max-w-[460px]">
            <Search
              size={17}
              strokeWidth={1.6}
              className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/30"
            />

            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск в списке «К просмотру»..."
              className="h-[48px] w-full border-0 border-b border-white/[.20] bg-transparent pl-8 pr-10 cine-mono text-[11px] tracking-[.04em] text-[#eeeae0] outline-none placeholder:text-white/25 focus:border-[#b7f34a]"
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Очистить поиск"
                className="absolute right-0 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center text-white/30 hover:text-[#b7f34a]"
              >
                <X size={14} strokeWidth={1.8} />
              </button>
            )}
          </div>

          <div className="flex items-center gap-8">

            <div>
              <span className="cine-mono text-[9px] uppercase tracking-[.15em] text-white/25">
                В списке
              </span>

              <span className="ml-2 cine-mono text-[10px] uppercase tracking-[.1em] text-[#b7f34a]">
                {watchlist.length}
              </span>
            </div>

            <span className="h-3 w-px bg-white/[.15]" />

            <div>
              <span className="cine-mono text-[9px] uppercase tracking-[.15em] text-white/25">
                Просмотрено
              </span>

              <span className="ml-2 cine-mono text-[10px] uppercase tracking-[.1em] text-white/45">
                {watched}
              </span>
            </div>

          </div>

        </div>
      </section>

      <section className="pt-10">

        <div className="mb-8 flex flex-col gap-4 border-b border-white/[.13] pb-5 sm:flex-row sm:items-end sm:justify-between">

          <div>
            <span className="cine-mono text-[9px] uppercase tracking-[.17em] text-white/30">
              Твой список
            </span>

            <h2 className="mt-2 cine-serif text-4xl tracking-[-.035em] text-[#eeeae0] md:text-5xl">
              {watchlist.length}{" "}
              {watchlist.length % 10 === 1 && watchlist.length % 100 !== 11
                ? "фильм"
                : watchlist.length % 10 >= 2 && watchlist.length % 10 <= 4 && (watchlist.length % 100 < 12 || watchlist.length % 100 > 14)
                ? "фильма"
                : "фильмов"}
            </h2>
          </div>

          {query && (
            <span className="cine-mono text-[9px] uppercase tracking-[.13em] text-white/30">
              Поиск: «{query}»
            </span>
          )}

        </div>

        {watchlist.length > 0 ? (

          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {watchlist.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
              />
            ))}
          </div>

        ) : (

          <div className="border-y border-dashed border-white/[.13] py-28">
            <div className="mx-auto max-w-[620px] text-center">

              <Bookmark
                className="mx-auto text-[#b7f34a]"
                size={28}
                strokeWidth={1.3}
              />

              <h2 className="mt-6 cine-serif text-4xl tracking-[-.035em] text-[#eeeae0] md:text-5xl">
                Список пока пуст.
              </h2>

              <p className="mx-auto mt-5 max-w-[500px] text-sm leading-6 text-white/35">
                Найди интересный фильм в архиве и добавь его сюда, чтобы посмотреть позже.
              </p>

              <div className="mt-8 flex flex-wrap justify-center gap-3">

                <button
                  type="button"
                  onClick={() => navigate("/films")}
                  className="flex h-[50px] items-center justify-center gap-3 border border-white/[.20] px-6 cine-mono text-[10px] font-bold uppercase tracking-[.15em] text-white/65 transition hover:border-white/[.40] hover:text-white"
                >
                  Найти фильмы
                  <ArrowRight size={14} strokeWidth={1.8} />
                </button>

                <button
                  type="button"
                  onClick={onAddMovie}
                  className="flex h-[50px] items-center justify-center gap-3 border border-[#b7f34a] bg-[#b7f34a] px-6 cine-mono text-[10px] font-bold uppercase tracking-[.15em] text-black transition hover:bg-[#c7ff62]"
                >
                  <Plus size={14} strokeWidth={2} />
                  Добавить фильм
                </button>

              </div>
            </div>
          </div>

        )}

      </section>

      <section className="mt-20 border-y border-white/[.13] py-8">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">

          <div className="flex items-center gap-7">

            <span className="inline-flex items-center gap-2 cine-mono text-[9px] uppercase tracking-[.15em] text-white/30">
              <Bookmark size={12} strokeWidth={1.6} />
              {watchlist.length} в списке
            </span>

            <span className="inline-flex items-center gap-2 cine-mono text-[9px] uppercase tracking-[.15em] text-white/30">
              <Film size={12} strokeWidth={1.6} />
              {watched} просмотрено
            </span>

          </div>

          <button
            type="button"
            onClick={() => navigate("/films")}
            className="group inline-flex items-center gap-3 cine-mono text-[9px] font-medium uppercase tracking-[.15em] text-white/35 transition-colors hover:text-[#b7f34a]"
          >
            Найти другой фильм

            <ArrowRight
              size={14}
              strokeWidth={1.7}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>

        </div>
      </section>

    </div>
  );
}