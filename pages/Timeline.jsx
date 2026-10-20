import { Clock3, Film, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPoster } from "../src/tmdb";

function formatTime(minutes) {
  if (!minutes) return "—";

  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const h = Math.floor(value / 60);
  const m = value % 60;

  if (h > 0) {
    return m > 0 ? `${h} ч ${m} мин` : `${h} ч`;
  }

  return `${m} мин`;
}

function getTitle(movie) {
  return movie.title || movie.name || "Без названия";
}

function getYear(movie) {
  return (
    movie.release_date?.slice(0, 4) ||
    movie.first_air_date?.slice(0, 4) ||
    movie.year ||
    "—"
  );
}

function getDate(movie) {
  return movie.addedAt
    ? new Date(movie.addedAt)
    : null;
}

function pluralizeMovies(count) {
  const value = Math.abs(Number(count)) % 100;
  const lastDigit = value % 10;

  if (value >= 11 && value <= 14) return `${count} фильмов`;
  if (lastDigit === 1) return `${count} фильм`;
  if (lastDigit >= 2 && lastDigit <= 4) return `${count} фильма`;
  return `${count} фильмов`;
}

function formatDate(movie) {
  const date = getDate(movie);

  if (!date || Number.isNaN(date.getTime())) {
    return "Дата неизвестна";
  }

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function Timeline({ movies }) {
  const navigate = useNavigate();

  const timeline = [...movies].sort((a, b) => {
    const dateA = new Date(a.addedAt || 0).getTime();
    const dateB = new Date(b.addedAt || 0).getTime();

    return dateB - dateA;
  });

  return (
    <div className="cine-page">
      <header className="cine-page-head">
        <div className="cine-page-head__row">
          <div>
            <p className="cine-kicker">
              Личный киноархив / Хронология
            </p>

            <h1 className="cine-page-title">
              Хронология
            </h1>

            <p className="cine-page-subtitle">
              Все фильмы твоего архива в хронологическом порядке.
            </p>
          </div>

          <div className="cine-mono text-[9px] uppercase tracking-[.16em] text-white/25">
            {pluralizeMovies(movies.length)}
          </div>
        </div>
      </header>

      <section className="cine-section">
        {timeline.length ? (
          <div className="relative border-t border-white/[.13]">
            {timeline.map((movie, index) => {
              const rating = Number(movie.personalRating);
              const title = getTitle(movie);

              return (
                <article
                  key={`${movie.id}-${index}`}
                  className="
                    group
                    relative
                    grid
                    grid-cols-[70px_1px_minmax(0,1fr)]
                    gap-5
                    border-b
                    border-white/[.1]
                    py-8
                    md:grid-cols-[130px_1px_minmax(0,1fr)]
                    md:gap-8
                  "
                >
                  {/* DATE */}

                  <div className="pt-1">
                    <div className="cine-mono text-[9px] uppercase tracking-[.12em] text-white/35">
                      {formatDate(movie)}
                    </div>

                    <div className="mt-2 cine-mono text-[8px] text-white/15">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                  </div>

                  {/* TIMELINE LINE */}

                  <div className="relative bg-white/[.12]">
                    <span
                      className="
                        absolute
                        left-1/2
                        top-1
                        h-2
                        w-2
                        -translate-x-1/2
                        bg-[var(--acid)]
                      "
                    />
                  </div>

                  {/* FILM */}

                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/movie/${movie.id}`)
                    }
                    className="
                      grid
                      w-full
                      grid-cols-[82px_minmax(0,1fr)_auto]
                      gap-5
                      text-left
                      md:grid-cols-[100px_minmax(0,1fr)_auto]
                      md:gap-7
                    "
                  >
                    <div className="aspect-[2/3] overflow-hidden bg-[#101310]">
                      {movie.poster_path ? (
                        <img
                          src={getPoster(
                            movie.poster_path,
                            "w185"
                          )}
                          alt={title}
                          loading="lazy"
                          className="
                            h-full
                            w-full
                            object-cover
                            opacity-80
                            transition-all
                            duration-500
                            group-hover:scale-[1.025]
                            group-hover:opacity-100
                          "
                        />
                      ) : movie.poster ? (
                        <img
                          src={movie.poster}
                          alt={title}
                          loading="lazy"
                          className="
                            h-full
                            w-full
                            object-cover
                            opacity-80
                            transition-all
                            duration-500
                            group-hover:scale-[1.025]
                            group-hover:opacity-100
                          "
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Film
                            size={16}
                            strokeWidth={1.4}
                            className="text-white/15"
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 self-center">
                      <h2
                        className="
                          cine-serif
                          text-[26px]
                          leading-[1.02]
                          tracking-[-.035em]
                          text-[var(--paper)]
                          transition-colors
                          duration-200
                          group-hover:text-white
                          md:text-[38px]
                        "
                      >
                        {title}
                      </h2>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2">
                        <span className="cine-mono text-[8px] uppercase tracking-[.12em] text-white/28">
                          {getYear(movie)}
                        </span>

                        {movie.runtime && (
                          <>
                            <span className="h-1 w-1 bg-white/15" />

                            <span className="flex items-center gap-1.5 cine-mono text-[8px] uppercase tracking-[.12em] text-white/25">
                              <Clock3 size={10} />
                              {formatTime(movie.runtime)}
                            </span>
                          </>
                        )}

                        {movie.status && (
                          <>
                            <span className="h-1 w-1 bg-white/15" />

                            <span className="cine-mono text-[8px] uppercase tracking-[.12em] text-white/20">
                              {movie.status ===
                              "watchlist"
                                ? "К просмотру"
                                : "Просмотрено"}
                            </span>
                          </>
                        )}
                      </div>

                      {movie.overview && (
                        <p className="mt-5 hidden max-w-[620px] text-[13px] leading-[1.7] text-white/28 md:block">
                          {movie.overview}
                        </p>
                      )}
                    </div>

                    {/* RATING */}

                    <div className="self-center text-right">
                      {rating > 0 ? (
                        <div className="flex items-center justify-end gap-2">
                          <Star
                            size={12}
                            strokeWidth={1.5}
                            fill="currentColor"
                            className="text-[var(--acid)]"
                          />

                          <span className="cine-mono text-[10px] text-[var(--acid)]">
                            {rating.toFixed(1)}
                          </span>
                        </div>
                      ) : (
                        <span className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/15">
                          —
                        </span>
                      )}
                    </div>
                  </button>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="cine-empty">
            <div className="cine-empty__inner">
              <Clock3
                size={20}
                strokeWidth={1.3}
                className="mx-auto text-white/20"
              />

              <h2 className="cine-empty__title">
                История пока пуста
              </h2>

              <p className="cine-empty__text">
                Добавляй фильмы, чтобы здесь появилась история твоих просмотров.
              </p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}