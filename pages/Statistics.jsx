import { useMemo } from "react";
import {
  Activity,
  ArrowRight,
  BarChart3,
  CalendarDays,
  Clock3,
  Film,
  Star,
  Trophy,
  TrendingUp,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

function formatTime(minutes) {
  if (!minutes) return "—";

  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  if (hours) {
    return `${hours}h${remaining ? ` ${remaining}m` : ""}`;
  }

  return `${remaining}m`;
}

function StatBlock({ icon, value, label, detail }) {
  return (
    <div className="border border-white/[.10] bg-white/[.025] p-6">
      <div className="flex items-center gap-3 text-[#b7f34a]">
        {icon}

        <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/25">
          {label}
        </span>
      </div>

      <div className="mt-7 cine-serif text-5xl tracking-[-.05em] text-[#eeeae0]">
        {value}
      </div>

      {detail && (
        <p className="mt-3 text-xs leading-5 text-white/25">
          {detail}
        </p>
      )}
    </div>
  );
}

function EmptyChart({ text }) {
  return (
    <div className="flex min-h-[220px] items-center justify-center border border-dashed border-white/[.10] px-6 text-center cine-mono text-[9px] uppercase tracking-[.12em] text-white/20">
      {text}
    </div>
  );
}

export default function Statistics({ movies = [] }) {
  const navigate = useNavigate();

  const watched = useMemo(
    () =>
      movies.filter(
        (movie) => movie.status === "watched"
      ),
    [movies]
  );

  const watchlist = useMemo(
    () =>
      movies.filter(
        (movie) => movie.status === "watchlist"
      ),
    [movies]
  );

  const ratedMovies = useMemo(
    () =>
      watched.filter(
        (movie) =>
          Number(movie.personalRating) > 0
      ),
    [watched]
  );

  const stats = useMemo(() => {
    const totalRuntime = watched.reduce(
      (sum, movie) => {
        const runtime = Number(movie.runtime);

        return (
          sum +
          (Number.isFinite(runtime) && runtime > 0
            ? runtime
            : 0)
        );
      },
      0
    );

    const averageRating =
      ratedMovies.length > 0
        ? ratedMovies.reduce(
            (sum, movie) =>
              sum + Number(movie.personalRating),
            0
          ) / ratedMovies.length
        : 0;

    const highestRated =
      ratedMovies.length > 0
        ? [...ratedMovies].sort(
            (a, b) =>
              Number(b.personalRating) -
              Number(a.personalRating)
          )[0]
        : null;

    const longestMovie =
      watched.length > 0
        ? [...watched]
            .filter(
              (movie) =>
                Number(movie.runtime) > 0
            )
            .sort(
              (a, b) =>
                Number(b.runtime) -
                Number(a.runtime)
            )[0]
        : null;

    return {
      totalRuntime,
      averageRating,
      highestRated,
      longestMovie,
    };
  }, [watched, ratedMovies]);

  const ratingDistribution = useMemo(() => {
    const ranges = [
      { label: "0–2", min: 0, max: 2 },
      { label: "2–4", min: 2, max: 4 },
      { label: "4–6", min: 4, max: 6 },
      { label: "6–8", min: 6, max: 8 },
      { label: "8–10", min: 8, max: 10.01 },
    ];

    return ranges.map((range) => ({
      ...range,
      count: ratedMovies.filter((movie) => {
        const rating = Number(
          movie.personalRating
        );

        return (
          rating >= range.min &&
          rating < range.max
        );
      }).length,
    }));
  }, [ratedMovies]);

  const maxRatingCount = Math.max(
    ...ratingDistribution.map(
      (item) => item.count
    ),
    1
  );

  const genreStats = useMemo(() => {
    const counts = {};

    watched.forEach((movie) => {
      const genres = String(
        movie.genre || ""
      )
        .split(",")
        .map((genre) => genre.trim())
        .filter(Boolean);

      genres.forEach((genre) => {
        counts[genre] =
          (counts[genre] || 0) + 1;
      });
    });

    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({
        name,
        count,
      }));
  }, [watched]);

  const maxGenreCount = Math.max(
    ...genreStats.map(
      (item) => item.count
    ),
    1
  );

  const yearStats = useMemo(() => {
    const counts = {};

    watched.forEach((movie) => {
      const year = String(
        movie.year || ""
      ).trim();

      if (/^\d{4}$/.test(year)) {
        counts[year] =
          (counts[year] || 0) + 1;
      }
    });

    return Object.entries(counts)
      .sort(
        (a, b) =>
          Number(a[0]) - Number(b[0])
      )
      .slice(-8)
      .map(([year, count]) => ({
        year,
        count,
      }));
  }, [watched]);

  const maxYearCount = Math.max(
    ...yearStats.map(
      (item) => item.count
    ),
    1
  );

  const recentActivity = useMemo(
    () =>
      [...movies]
        .sort(
          (a, b) =>
            new Date(
              b.addedAt || 0
            ).getTime() -
            new Date(
              a.addedAt || 0
            ).getTime()
        )
        .slice(0, 5),
    [movies]
  );

  return (
    <div className="cine-page pb-20">
      {/* HEADER */}

      <section className="border-b border-white/[.13] py-14 md:py-16">
        <p className="cine-kicker cine-accent">
          Personal analytics / Archive
        </p>

        <div className="mt-4 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="cine-page-title">
              Statistics
            </h1>

            <p className="cine-page-subtitle">
              A numerical record of what you watch,
              how you rate it and where your taste
              tends to land.
            </p>
          </div>

          <div className="cine-mono text-[9px] uppercase tracking-[.15em] text-white/25">
            {watched.length} watched /{" "}
            {watchlist.length} saved
          </div>
        </div>
      </section>

      {/* OVERVIEW */}

      <section className="border-b border-white/[.13] py-8">
        <div className="grid gap-px border border-white/[.10] bg-white/[.10] sm:grid-cols-2 xl:grid-cols-4">
          <StatBlock
            icon={
              <Film
                size={17}
                strokeWidth={1.5}
              />
            }
            value={watched.length}
            label="Watched films"
            detail={`${watchlist.length} films waiting in the queue`}
          />

          <StatBlock
            icon={
              <Star
                size={17}
                strokeWidth={1.5}
              />
            }
            value={
              stats.averageRating > 0
                ? stats.averageRating.toFixed(1)
                : "—"
            }
            label="Average rating"
            detail={`${ratedMovies.length} rated films`}
          />

          <StatBlock
            icon={
              <Trophy
                size={17}
                strokeWidth={1.5}
              />
            }
            value={
              stats.highestRated
                ? Number(
                    stats.highestRated.personalRating
                  ).toFixed(1)
                : "—"
            }
            label="Highest rating"
            detail={
              stats.highestRated
                ? stats.highestRated.title
                : "No rated films yet"
            }
          />

          <StatBlock
            icon={
              <Clock3
                size={17}
                strokeWidth={1.5}
              />
            }
            value={formatTime(
              stats.totalRuntime
            )}
            label="Time watched"
            detail="Total runtime of your watched films"
          />
        </div>
      </section>

      {/* RATING + GENRES */}

      <section className="mt-16 grid gap-12 lg:grid-cols-2">
        {/* RATINGS */}

        <div>
          <div className="mb-7 flex items-end justify-between border-b border-white/[.13] pb-5">
            <div className="flex items-baseline gap-4">
              <span className="cine-mono text-[9px] tracking-[.12em] text-[var(--acid)]">
                01
              </span>

              <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)]">
                Rating distribution
              </h2>
            </div>

            <BarChart3
              size={17}
              strokeWidth={1.5}
              className="text-white/20"
            />
          </div>

          {ratedMovies.length > 0 ? (
            <div className="space-y-5">
              {ratingDistribution.map(
                (item) => {
                  const width =
                    item.count > 0
                      ? Math.max(
                          (item.count /
                            maxRatingCount) *
                            100,
                          8
                        )
                      : 0;

                  return (
                    <div
                      key={item.label}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="cine-mono text-[9px] uppercase tracking-[.12em] text-white/35">
                          {item.label}
                        </span>

                        <span className="cine-mono text-[9px] text-white/25">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-[3px] overflow-hidden bg-white/[.07]">
                        <div
                          className="h-full bg-[#b7f34a] transition-all duration-700"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <EmptyChart text="Rate some watched films to see your rating distribution." />
          )}
        </div>

        {/* GENRES */}

        <div>
          <div className="mb-7 flex items-end justify-between border-b border-white/[.13] pb-5">
            <div className="flex items-baseline gap-4">
              <span className="cine-mono text-[9px] tracking-[.12em] text-[var(--acid)]">
                02
              </span>

              <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)]">
                What you watch
              </h2>
            </div>

            <TrendingUp
              size={17}
              strokeWidth={1.5}
              className="text-white/20"
            />
          </div>

          {genreStats.length > 0 ? (
            <div className="space-y-5">
              {genreStats.map(
                (item) => {
                  const width =
                    (item.count /
                      maxGenreCount) *
                    100;

                  return (
                    <div
                      key={item.name}
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="cine-mono text-[9px] uppercase tracking-[.12em] text-white/40">
                          {item.name}
                        </span>

                        <span className="cine-mono text-[9px] text-white/25">
                          {item.count}
                        </span>
                      </div>

                      <div className="h-[3px] overflow-hidden bg-white/[.07]">
                        <div
                          className="h-full bg-white/40 transition-all duration-700"
                          style={{
                            width: `${width}%`,
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          ) : (
            <EmptyChart text="Genre statistics will appear after you add watched films." />
          )}
        </div>
      </section>

      {/* RELEASE YEARS */}

      <section className="mt-16">
        <div className="mb-7 flex items-end justify-between border-b border-white/[.13] pb-5">
          <div className="flex items-baseline gap-4">
            <span className="cine-mono text-[9px] tracking-[.12em] text-[var(--acid)]">
              03
            </span>

            <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)] md:text-5xl">
              Films by release year
            </h2>
          </div>

          <CalendarDays
            size={17}
            strokeWidth={1.5}
            className="text-white/20"
          />
        </div>

        {yearStats.length > 0 ? (
          <div className="overflow-x-auto border-y border-white/[.08] py-8">
            <div className="flex min-h-[280px] min-w-max items-end gap-7 px-3">
              {yearStats.map(
                (item) => {
                  const height =
                    Math.max(
                      (item.count /
                        maxYearCount) *
                        100,
                      8
                    );

                  return (
                    <div
                      key={item.year}
                      className="
                        flex
                        w-[72px]
                        min-w-[72px]
                        shrink-0
                        flex-col
                        items-center
                        justify-end
                        gap-3
                      "
                    >
                      <span className="cine-mono text-[9px] text-white/35">
                        {item.count}
                      </span>

                      <div
                        className="
                          relative
                          flex
                          h-[200px]
                          w-[48px]
                          items-end
                          overflow-hidden
                          border
                          border-white/[.06]
                          bg-white/[.025]
                        "
                      >
                        <div
                          className="
                            w-full
                            bg-[#b7f34a]
                            transition-all
                            duration-700
                          "
                          style={{
                            height: `${height}%`,
                          }}
                        />
                      </div>

                      <span className="cine-mono text-[9px] uppercase tracking-[.08em] text-white/30">
                        {item.year}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        ) : (
          <EmptyChart text="Release year statistics will appear after you add watched films." />
        )}
      </section>

      {/* RECORDS */}

      <section className="mt-16 grid gap-12 lg:grid-cols-[.85fr_1.15fr]">
        {/* LONGEST */}

        <div>
          <div className="mb-7 flex items-end justify-between border-b border-white/[.13] pb-5">
            <div className="flex items-baseline gap-4">
              <span className="cine-mono text-[9px] tracking-[.12em] text-[var(--acid)]">
                04
              </span>

              <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)]">
                Longest film
              </h2>
            </div>
          </div>

          {stats.longestMovie ? (
            <button
              type="button"
              onClick={() =>
                navigate(
                  `/movie/${stats.longestMovie.id}`
                )
              }
              className="
                group
                flex
                w-full
                cursor-pointer
                items-center
                gap-5
                border-y
                border-white/[.10]
                py-5
                text-left
                transition-colors
                hover:border-[#b7f34a]/30
              "
            >
              <div className="h-[110px] w-[74px] shrink-0 overflow-hidden bg-white/[.04]">
                {stats.longestMovie.poster ? (
                  <img
                    src={
                      stats.longestMovie.poster
                    }
                    alt={
                      stats.longestMovie.title
                    }
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                ) : (
                  <div className="grid h-full place-items-center text-white/15">
                    <Film
                      size={18}
                      strokeWidth={1.4}
                    />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="cine-serif text-2xl tracking-[-.025em] text-[#eeeae0]">
                  {stats.longestMovie.title}
                </h3>

                <p className="mt-2 cine-mono text-[9px] uppercase tracking-[.12em] text-white/25">
                  {stats.longestMovie.year ||
                    "—"}
                </p>

                <p className="mt-5 cine-mono text-[10px] uppercase tracking-[.12em] text-[#b7f34a]">
                  {formatTime(
                    stats.longestMovie
                      .runtime
                  )}
                </p>
              </div>

              <ArrowRight
                size={15}
                strokeWidth={1.6}
                className="shrink-0 text-white/20 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#b7f34a]"
              />
            </button>
          ) : (
            <div className="border-y border-dashed border-white/[.10] py-16 text-center cine-mono text-[9px] uppercase tracking-[.12em] text-white/20">
              No runtime data available yet.
            </div>
          )}
        </div>

        {/* RECENT ACTIVITY */}

        <div>
          <div className="mb-7 flex items-end justify-between border-b border-white/[.13] pb-5">
            <div className="flex items-baseline gap-4">
              <span className="cine-mono text-[9px] tracking-[.12em] text-[var(--acid)]">
                05
              </span>

              <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)]">
                Recent additions
              </h2>
            </div>

            <Activity
              size={17}
              strokeWidth={1.5}
              className="text-white/20"
            />
          </div>

          {recentActivity.length > 0 ? (
            <div className="divide-y divide-white/[.08]">
              {recentActivity.map(
                (movie) => (
                  <button
                    key={`${movie.id}-${movie.addedAt}`}
                    type="button"
                    onClick={() =>
                      navigate(
                        `/movie/${movie.id}`
                      )
                    }
                    className="
                      group
                      flex
                      w-full
                      cursor-pointer
                      items-center
                      gap-5
                      py-4
                      text-left
                    "
                  >
                    <div className="h-[58px] w-[40px] shrink-0 overflow-hidden bg-white/[.04]">
                      {movie.poster ? (
                        <img
                          src={movie.poster}
                          alt=""
                          className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                        />
                      ) : (
                        <div className="grid h-full place-items-center text-white/15">
                          <Film
                            size={13}
                            strokeWidth={1.4}
                          />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate cine-serif text-lg text-white/65 transition-colors group-hover:text-white">
                        {movie.title}
                      </p>

                      <p className="mt-1 cine-mono text-[8px] uppercase tracking-[.12em] text-white/20">
                        {movie.status ===
                        "watched"
                          ? "Watched"
                          : "Watchlist"}
                      </p>
                    </div>

                    <ArrowRight
                      size={14}
                      strokeWidth={1.5}
                      className="shrink-0 text-white/10 transition-all group-hover:translate-x-1 group-hover:text-[#b7f34a]"
                    />
                  </button>
                )
              )}
            </div>
          ) : (
            <div className="border-y border-dashed border-white/[.10] py-16 text-center cine-mono text-[9px] uppercase tracking-[.12em] text-white/20">
              No activity yet.
            </div>
          )}
        </div>
      </section>

      {/* FOOTER */}

      <section className="mt-20 border-y border-white/[.13] py-8">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-3 cine-mono text-[9px] uppercase tracking-[.14em] text-white/25">
            <span>
              {watched.length} watched
            </span>

            <span>
              {watchlist.length} saved
            </span>

            <span>
              {ratedMovies.length} rated
            </span>

            <span>
              {formatTime(
                stats.totalRuntime
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="
              group
              inline-flex
              items-center
              gap-2
              cine-mono
              text-[9px]
              uppercase
              tracking-[.14em]
              text-white/30
              transition-colors
              hover:text-[#b7f34a]
            "
          >
            Back to home

            <ArrowRight
              size={13}
              strokeWidth={1.6}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>
    </div>
  );
}