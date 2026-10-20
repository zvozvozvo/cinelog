import { useMemo, useState } from "react";
import {
  ArrowDownUp,
  Film as FilmIcon,
  Plus,
  Search,
  X,
} from "lucide-react";

import MovieCard from "../components/MovieCard";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "watched", label: "Watched" },
  { key: "watchlist", label: "Watchlist" },
];

const SORTS = [
  { key: "recent", label: "Recently added" },
  { key: "oldest", label: "Oldest added" },
  { key: "rating", label: "Highest rated" },
  { key: "title", label: "Title A-Z" },
  { key: "year", label: "Release year" },
];

export default function Films({
  movies = [],
  onAddMovie,
}) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("recent");
  const [query, setQuery] = useState("");

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();

    const result = movies.filter((movie) => {
      const filterMatch =
        filter === "all" ||
        movie.status === filter;

      const searchMatch =
        !q ||
        String(movie.title || "")
          .toLowerCase()
          .includes(q) ||
        String(movie.originalTitle || "")
          .toLowerCase()
          .includes(q);

      return filterMatch && searchMatch;
    });

    result.sort((a, b) => {
      if (sort === "oldest") {
        return (
          new Date(a.addedAt || 0) -
          new Date(b.addedAt || 0)
        );
      }

      if (sort === "rating") {
        return (
          (Number(b.personalRating) || 0) -
          (Number(a.personalRating) || 0)
        );
      }

      if (sort === "title") {
        return String(a.title || "").localeCompare(
          String(b.title || ""),
          "ru"
        );
      }

      if (sort === "year") {
        return (
          Number(b.year || 0) -
          Number(a.year || 0)
        );
      }

      return (
        new Date(b.addedAt || 0) -
        new Date(a.addedAt || 0)
      );
    });

    return result;
  }, [movies, filter, sort, query]);

  const counts = {
    all: movies.length,

    watched: movies.filter(
      (movie) => movie.status === "watched"
    ).length,

    watchlist: movies.filter(
      (movie) => movie.status === "watchlist"
    ).length,
  };

  return (
    <div className="cine-page">
      {/* PAGE HEADER */}

      <section className="border-b border-white/[.13] py-14 md:py-16">
        <div className="flex flex-col gap-10 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="cine-kicker cine-accent">
              Personal archive / Library
            </p>

            <h1 className="cine-page-title mt-4">
              Films
            </h1>

            <p className="cine-page-subtitle">
              The complete collection. Search it, sort it,
              filter it, and open any title for its full
              cinematic record.
            </p>
          </div>

          <button
            type="button"
            onClick={onAddMovie}
            className="
              flex
              h-[52px]
              shrink-0
              items-center
              justify-center
              gap-3
              border
              border-[#b7f34a]
              bg-[#b7f34a]
              px-6
              cine-mono
              text-[10px]
              font-bold
              uppercase
              tracking-[.15em]
              text-black
              transition
              duration-200
              hover:border-[#c7ff62]
              hover:bg-[#c7ff62]
              active:translate-y-px
            "
          >
            <Plus
              size={15}
              strokeWidth={2}
            />

            Add film
          </button>
        </div>
      </section>

      {/* TOOLBAR */}

      <section className="border-b border-white/[.13] py-6">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          {/* SEARCH */}

          <div className="relative w-full xl:max-w-[460px]">
            <Search
              size={17}
              strokeWidth={1.6}
              className="
                pointer-events-none
                absolute
                left-0
                top-1/2
                -translate-y-1/2
                text-white/30
              "
            />

            <input
              type="text"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Search your archive..."
              className="
                h-[48px]
                w-full
                border-0
                border-b
                border-white/[.20]
                bg-transparent
                pl-8
                pr-10
                cine-mono
                text-[11px]
                tracking-[.04em]
                text-[#eeeae0]
                outline-none
                placeholder:text-white/25
                transition-colors
                duration-200
                focus:border-[#b7f34a]
              "
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="
                  absolute
                  right-0
                  top-1/2
                  grid
                  h-8
                  w-8
                  -translate-y-1/2
                  place-items-center
                  text-white/30
                  transition-colors
                  hover:text-[#b7f34a]
                "
              >
                <X
                  size={14}
                  strokeWidth={1.8}
                />
              </button>
            )}
          </div>

          {/* FILTERS */}

          <div className="flex items-center gap-7 overflow-x-auto">
            {FILTERS.map((item) => {
              const active = filter === item.key;

              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() =>
                    setFilter(item.key)
                  }
                  className={
                    active
                      ? `
                        relative
                        shrink-0
                        pb-2
                        cine-mono
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[.15em]
                        text-[#b7f34a]
                        transition-colors
                        duration-200
                      `
                      : `
                        relative
                        shrink-0
                        pb-2
                        cine-mono
                        text-[9px]
                        font-medium
                        uppercase
                        tracking-[.15em]
                        text-white/35
                        transition-colors
                        duration-200
                        hover:text-white/70
                      `
                  }
                >
                  {item.label}

                  <span
                    className={
                      active
                        ? "ml-1.5 text-[#b7f34a]/60"
                        : "ml-1.5 text-white/20"
                    }
                  >
                    {counts[item.key]}
                  </span>

                  {active && (
                    <span
                      className="
                        absolute
                        bottom-0
                        left-0
                        h-px
                        w-full
                        bg-[#b7f34a]
                      "
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* SORT */}

          <div className="relative shrink-0">
            <ArrowDownUp
              size={13}
              strokeWidth={1.6}
              className="
                pointer-events-none
                absolute
                left-0
                top-1/2
                -translate-y-1/2
                text-white/30
              "
            />

            <select
              value={sort}
              onChange={(event) =>
                setSort(event.target.value)
              }
              className="
                h-[42px]
                min-w-[170px]
                appearance-none
                border-0
                border-b
                border-white/[.18]
                bg-transparent
                pl-6
                pr-2
                cine-mono
                text-[9px]
                uppercase
                tracking-[.12em]
                text-white/55
                outline-none
                transition-colors
                duration-200
                hover:border-white/[.35]
                focus:border-[#b7f34a]
              "
            >
              {SORTS.map((item) => (
                <option
                  key={item.key}
                  value={item.key}
                  className="bg-[#0c100d] text-[#eeeae0]"
                >
                  {item.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* RESULTS */}

      <section className="pt-10">
        <div className="mb-8 flex flex-col gap-4 border-b border-white/[.13] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="cine-mono text-[9px] uppercase tracking-[.17em] text-white/30">
              {list.length}{" "}
              {list.length === 1
                ? "result"
                : "results"}
            </span>

            <h2 className="mt-2 cine-serif text-4xl tracking-[-.035em] text-[#eeeae0] md:text-5xl">
              {filter === "all"
                ? "Complete archive"
                : filter === "watched"
                ? "Watched films"
                : "Watchlist"}
            </h2>
          </div>

          {query && (
            <span className="cine-mono text-[9px] uppercase tracking-[.13em] text-white/30">
              Search: “{query}”
            </span>
          )}
        </div>

        {list.length ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
            {list.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${movie.status}`}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="border-y border-dashed border-white/[.13] py-28 text-center">
            <FilmIcon
              className="mx-auto text-[#b7f34a]"
              size={26}
              strokeWidth={1.4}
            />

            <h2 className="mt-6 cine-serif text-4xl tracking-[-.035em] text-[#eeeae0]">
              Nothing matches.
            </h2>

            <p className="mx-auto mt-4 max-w-[500px] text-sm leading-6 text-white/35">
              Try another title or switch the archive
              filter. If the collection is empty, add a
              film through TMDB.
            </p>

            <button
              type="button"
              onClick={onAddMovie}
              className="
                mx-auto
                mt-7
                flex
                h-[50px]
                items-center
                justify-center
                gap-3
                border
                border-[#b7f34a]
                bg-[#b7f34a]
                px-6
                cine-mono
                text-[10px]
                font-bold
                uppercase
                tracking-[.15em]
                text-black
                transition
                duration-200
                hover:bg-[#c7ff62]
              "
            >
              <Plus
                size={14}
                strokeWidth={2}
              />

              Add film
            </button>
          </div>
        )}
      </section>
    </div>
  );
}