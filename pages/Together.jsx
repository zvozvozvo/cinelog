import { useMemo } from "react";
import { Heart, Star, Users, Film } from "lucide-react";
import { useNavigate } from "react-router-dom";

function Rating({ value }) {
  if (value == null) {
    return (
      <span className="cine-mono text-[8px] text-white/20">
        —
      </span>
    );
  }

  return (
    <span className="flex items-center gap-1.5 cine-mono text-[9px] text-[var(--acid)]">
      <Star size={10} fill="currentColor" />
      {Number(value).toFixed(1)}
    </span>
  );
}

export default function Together({ movies = [] }) {
  const navigate = useNavigate();

  /*
   * Пока данные локальные.
   * Позже эти поля будут приходить из Supabase:
   *
   * youRating
   * herRating
   *
   * А сам фильм останется общей сущностью.
   */

  const togetherMovies = useMemo(() => {
    return movies
      .filter(
        (movie) =>
          movie.status === "watched" &&
          movie.youRating != null &&
          movie.herRating != null
      )
      .map((movie) => ({
        ...movie,
        average:
          (Number(movie.youRating) +
            Number(movie.herRating)) /
          2,
        difference: Math.abs(
          Number(movie.youRating) -
            Number(movie.herRating)
        ),
      }));
  }, [movies]);

  const match = useMemo(() => {
    if (!togetherMovies.length) {
      return null;
    }

    const totalDifference = togetherMovies.reduce(
      (sum, movie) => sum + movie.difference,
      0
    );

    const averageDifference =
      totalDifference / togetherMovies.length;

    return Math.max(
      0,
      Math.min(100, 100 - averageDifference * 10)
    );
  }, [togetherMovies]);

  const commonFavorites = useMemo(() => {
    return [...togetherMovies]
      .sort((a, b) => b.average - a.average)
      .slice(0, 5);
  }, [togetherMovies]);

  const disagreements = useMemo(() => {
    return [...togetherMovies]
      .sort((a, b) => b.difference - a.difference)
      .slice(0, 5);
  }, [togetherMovies]);

  return (
    <div className="pb-24">
      {/* HEADER */}

      <section className="border-b border-[var(--line)] py-14 md:py-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_320px] lg:items-end">
          <div>
            <p className="cine-kicker cine-accent">
              CineLog / Together
            </p>

            <h1 className="mt-5 max-w-[900px] cine-serif text-[clamp(52px,8vw,112px)] leading-[.82] tracking-[-.06em]">
              Our cinema.
            </h1>

            <p className="mt-7 max-w-[620px] text-[15px] leading-7 text-white/35">
              A shared cinema archive for two people.
              Compare ratings, find common favorites, and see where your tastes diverge.
            </p>
          </div>

          <div className="border-t border-[var(--line)] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <div className="flex items-center gap-3">
              <Users
                size={16}
                strokeWidth={1.3}
                className="text-[var(--acid)]"
              />

              <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/30">
                Shared archive
              </span>
            </div>

            <p className="mt-4 cine-serif text-4xl tracking-[-.04em]">
              {togetherMovies.length}
            </p>

            <p className="mt-2 cine-mono text-[8px] uppercase tracking-[.13em] text-white/20">
              films rated together
            </p>
          </div>
        </div>
      </section>

      {/* MATCH */}

      <section className="border-b border-[var(--line)]">
        <div className="grid md:grid-cols-[1fr_1fr]">
          <div className="border-b border-[var(--line)] px-1 py-10 md:border-b-0 md:border-r md:py-14">
            <p className="cine-kicker">
              Taste compatibility
            </p>

            <div className="mt-5 flex items-end gap-4">
              <span className="cine-serif text-[clamp(64px,9vw,120px)] leading-none tracking-[-.07em]">
                {match == null
                  ? "—"
                  : `${Math.round(match)}%`}
              </span>

              {match != null && (
                <Heart
                  size={25}
                  strokeWidth={1.2}
                  className="mb-3 text-[var(--acid)]"
                />
              )}
            </div>

            <p className="mt-5 max-w-[420px] text-sm leading-6 text-white/30">
              Calculated from the difference between your
              personal ratings. The closer you rate films,
              the higher the match.
            </p>
          </div>

          <div className="px-1 py-10 md:py-14 md:pl-10">
            <p className="cine-kicker">
              The idea
            </p>

            <h2 className="mt-5 max-w-[560px] cine-serif text-4xl leading-[.95] tracking-[-.045em] md:text-5xl">
              One film.
              <br />
              Two opinions.
            </h2>

            <div className="mt-8 flex items-center gap-6">
              <div>
                <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/20">
                  You
                </span>

                <p className="mt-2 cine-serif text-2xl">
                  ★
                </p>
              </div>

              <span className="h-px w-10 bg-white/15" />

              <div>
                <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/20">
                  Her
                </span>

                <p className="mt-2 cine-serif text-2xl">
                  ★
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMON FAVORITES */}

      <section className="mt-16">
        <div className="flex items-end justify-between gap-6 border-b border-[var(--line)] pb-5">
          <div>
            <p className="cine-kicker cine-accent">
              01 / Shared taste
            </p>

            <h2 className="mt-3 cine-serif text-4xl tracking-[-.045em]">
              Common favorites
            </h2>
          </div>

          <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/20">
            Top rated together
          </span>
        </div>

        {commonFavorites.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 pt-8 md:grid-cols-3 lg:grid-cols-5">
            {commonFavorites.map((movie, index) => (
              <article
                key={movie.id}
                className="group cursor-pointer"
                onClick={() =>
                  navigate(`/movie/${movie.id}`)
                }
              >
                <div className="relative aspect-[2/3] overflow-hidden bg-[#101310]">
                  {movie.poster ? (
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                    />
                  ) : (
                    <div className="grid h-full place-items-center">
                      <Film
                        size={22}
                        className="text-white/15"
                      />
                    </div>
                  )}

                  <span className="absolute left-3 top-3 cine-mono text-[8px] text-white/45">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="absolute bottom-3 left-3 flex items-center gap-1.5 cine-mono text-[9px] text-[var(--acid)]">
                    <Star size={10} fill="currentColor" />
                    {movie.average.toFixed(1)}
                  </span>
                </div>

                <h3 className="mt-4 cine-serif text-xl leading-none tracking-[-.025em]">
                  {movie.title}
                </h3>

                <div className="mt-3 flex justify-between border-t border-[var(--line)] pt-3">
                  <Rating value={movie.youRating} />
                  <Rating value={movie.herRating} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="cine-empty mt-8">
            <div className="cine-empty__inner">
              <Heart
                size={26}
                className="mx-auto text-[var(--acid)]"
              />

              <h3 className="cine-empty__title">
                Nothing shared yet.
              </h3>

              <p className="cine-empty__text">
                Once both of you rate the same films,
                they will appear here.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* DISAGREEMENTS */}

      {disagreements.length > 0 && (
        <section className="mt-20">
          <div className="border-b border-[var(--line)] pb-5">
            <p className="cine-kicker cine-accent">
              02 / The arguments
            </p>

            <h2 className="mt-3 cine-serif text-4xl tracking-[-.045em]">
              Biggest disagreements
            </h2>
          </div>

          <div className="divide-y divide-[var(--line)] border-b border-[var(--line)]">
            {disagreements.map((movie, index) => (
              <button
                key={movie.id}
                type="button"
                onClick={() =>
                  navigate(`/movie/${movie.id}`)
                }
                className="group grid w-full grid-cols-[40px_1fr_auto] items-center gap-5 py-5 text-left transition-colors hover:bg-white/[.025] md:grid-cols-[60px_1fr_120px_120px_80px]"
              >
                <span className="cine-mono text-[8px] text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <span className="cine-serif text-xl tracking-[-.025em] text-white/75 transition-colors group-hover:text-white">
                  {movie.title}
                </span>

                <span className="hidden md:block">
                  <Rating value={movie.youRating} />
                </span>

                <span className="hidden md:block">
                  <Rating value={movie.herRating} />
                </span>

                <span className="cine-mono text-[8px] text-white/30">
                  Δ {movie.difference.toFixed(1)}
                </span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* EMPTY FUTURE */}

      {movies.length === 0 && (
        <section className="mt-20 border-t border-[var(--line)] pt-8">
          <div className="flex items-center gap-3 text-white/20">
            <Users size={15} />
            <span className="cine-mono text-[8px] uppercase tracking-[.15em]">
              Shared cinema mode ready
            </span>
          </div>
        </section>
      )}
    </div>
  );
}
