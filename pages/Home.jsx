import {
  ArrowRight,
  Bookmark,
  Clock3,
  Film,
  Heart,
  Play,
  Plus,
  Star,
  Trophy,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import MovieCard from "../components/MovieCard";

function SectionHeader({ eyebrow, title, action, onClick }) {
  return (
    <div className="mb-7 flex items-end justify-between gap-5 border-b border-[var(--line)] pb-4">
      <div>
        <p className="cine-kicker cine-accent">{eyebrow}</p>
        <h2 className="mt-3 cine-serif text-3xl tracking-[-.045em] md:text-4xl">
          {title}
        </h2>
      </div>

      {action && (
        <button
          type="button"
          onClick={onClick}
          className="group flex shrink-0 items-center gap-2 cine-mono text-[8px] uppercase tracking-[.14em] text-white/30 transition-colors hover:text-[var(--acid)]"
        >
          {action}
          <ArrowRight
            size={13}
            strokeWidth={1.5}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );
}

function Stat({ index, value, label }) {
  return (
    <div className="border-t border-[var(--line)] py-5 md:py-6">
      <div className="flex items-start justify-between gap-4">
        <span className="cine-mono text-[8px] tracking-[.12em] text-white/15">
          {String(index).padStart(2, "0")}
        </span>
        <span className="cine-mono text-[8px] uppercase tracking-[.13em] text-white/25">
          {label}
        </span>
      </div>

      <div className="mt-7 cine-serif text-4xl tracking-[-.05em] text-white md:text-5xl">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ icon, title, text, action, onClick }) {
  return (
    <div className="border border-dashed border-[var(--line)] px-6 py-16 text-center">
      <div className="mx-auto mb-5 flex h-11 w-11 items-center justify-center border border-[var(--line)] text-white/20">
        {icon}
      </div>

      <h3 className="cine-serif text-2xl tracking-[-.03em] text-white/75">
        {title}
      </h3>

      <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/25">
        {text}
      </p>

      {action && (
        <button
          type="button"
          onClick={onClick}
          className="mt-7 inline-flex h-10 items-center gap-2 border border-[var(--acid)] bg-[var(--acid)] px-4 cine-mono text-[8px] font-bold uppercase tracking-[.13em] text-black transition-colors hover:bg-[#c8ff73]"
        >
          <Plus size={13} strokeWidth={2.2} />
          {action}
        </button>
      )}
    </div>
  );
}

function ActivityRow({ movie, onOpen }) {
  const date = movie.addedAt
    ? new Date(movie.addedAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <button
      type="button"
      onClick={onOpen}
      className="group flex w-full items-center gap-4 border-b border-[var(--line)] py-4 text-left last:border-b-0"
    >
      <div className="h-14 w-10 shrink-0 overflow-hidden bg-[#101310]">
        {movie.poster ? (
          <img
            src={movie.poster}
            alt=""
            className="h-full w-full object-cover opacity-70 transition-opacity duration-200 group-hover:opacity-100"
          />
        ) : (
          <div className="grid h-full place-items-center text-white/15">
            <Film size={14} />
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate cine-serif text-lg tracking-[-.02em] text-white/70 transition-colors group-hover:text-white">
          {movie.title}
        </p>
        <p className="mt-1 cine-mono text-[7px] uppercase tracking-[.13em] text-white/20">
          {movie.status === "watched" ? "Watched" : "Watchlist"}
        </p>
      </div>

      <span className="shrink-0 cine-mono text-[7px] uppercase tracking-[.1em] text-white/18">
        {date}
      </span>
    </button>
  );
}

function formatTimeWatched(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return "—";

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

export default function Home({ movies = [], onAddMovie }) {
  const navigate = useNavigate();

  const watched = movies.filter((movie) => movie.status === "watched");
  const watchlist = movies.filter((movie) => movie.status === "watchlist");

  const recentlyAdded = [...movies]
    .sort(
      (a, b) =>
        new Date(b.addedAt || 0).getTime() -
        new Date(a.addedAt || 0).getTime()
    )
    .slice(0, 6);

  const ratedMovies = watched.filter(
    (movie) => Number(movie.personalRating) > 0
  );

  const topRated = [...ratedMovies]
    .sort(
      (a, b) =>
        Number(b.personalRating) - Number(a.personalRating)
    )
    .slice(0, 6);

  const totalRuntime = watched.reduce((sum, movie) => {
    const runtime = Number(movie.runtime);
    return sum + (Number.isFinite(runtime) && runtime > 0 ? runtime : 0);
  }, 0);

  const averageRating =
    ratedMovies.length > 0
      ? (
          ratedMovies.reduce(
            (sum, movie) => sum + Number(movie.personalRating),
            0
          ) / ratedMovies.length
        ).toFixed(1)
      : "—";

  const togetherMovies = watched.filter(
    (movie) =>
      movie.youRating != null &&
      movie.herRating != null
  );

  const match =
    togetherMovies.length > 0
      ? Math.max(
          0,
          Math.min(
            100,
            100 -
              (togetherMovies.reduce(
                (sum, movie) =>
                  sum +
                  Math.abs(
                    Number(movie.youRating) -
                      Number(movie.herRating)
                  ),
                0
              ) /
                togetherMovies.length) *
                10
          )
        )
      : null;

  return (
    <div className="pb-24">
      {/* HERO */}
      <section className="border-b border-[var(--line)] py-16 md:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_300px] lg:items-end">
          <div>
            <p className="cine-kicker cine-accent">CineLog / Personal archive</p>

            <h1 className="mt-6 max-w-[1000px] cine-serif text-[clamp(56px,9vw,132px)] leading-[.8] tracking-[-.065em]">
              Your cinema.
              <br />
              <span className="text-white/25">Your record.</span>
            </h1>

            <p className="mt-9 max-w-[570px] text-[15px] leading-7 text-white/32">
              Films watched, films waiting, ratings remembered. A private archive built around your own taste.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-5">
              <button
                type="button"
                onClick={() => navigate("/films")}
                className="group flex h-11 items-center gap-3 border border-[var(--acid)] bg-[var(--acid)] px-5 cine-mono text-[9px] font-bold uppercase tracking-[.13em] text-black transition-colors hover:bg-[#c8ff73]"
              >
                Explore archive
                <ArrowRight
                  size={14}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={onAddMovie}
                className="group flex h-11 items-center gap-3 cine-mono text-[9px] font-medium uppercase tracking-[.13em] text-white/35 transition-colors hover:text-white"
              >
                <Plus size={14} />
                Add film
              </button>
            </div>
          </div>

          <div className="border-t border-[var(--line)] pt-5 lg:border-l lg:border-t-0 lg:pl-7 lg:pt-0">
            <p className="cine-kicker">Archive status</p>

            <div className="mt-6 flex items-end gap-3">
              <span className="cine-serif text-6xl leading-none tracking-[-.06em]">
                {movies.length}
              </span>
              <span className="mb-1 cine-mono text-[8px] uppercase tracking-[.13em] text-white/25">
                films logged
              </span>
            </div>

            <div className="mt-7 border-t border-[var(--line)] pt-4">
              <p className="cine-mono text-[8px] uppercase tracking-[.13em] text-white/20">
                {watchlist.length} waiting · {watched.length} watched
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* KEY NUMBERS */}
      <section className="grid grid-cols-2 gap-x-6 md:grid-cols-4 md:gap-x-10">
        <Stat index={1} value={watched.length} label="Watched" />
        <Stat index={2} value={watchlist.length} label="Watchlist" />
        <Stat index={3} value={averageRating} label="Average rating" />
        <Stat
          index={4}
          value={formatTimeWatched(totalRuntime)}
          label="Time watched"
        />
      </section>

      {/* RECENT */}
      <section className="mt-20 md:mt-28">
        <SectionHeader
          eyebrow="01 / Archive"
          title="Recently added"
          action="View all"
          onClick={() => navigate("/films")}
        />

        {recentlyAdded.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {recentlyAdded.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${movie.addedAt || index}`}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Film size={20} />}
            title="The archive is empty."
            text="Add the first film and CineLog will start building your cinema history."
            action="Add first film"
            onClick={onAddMovie}
          />
        )}
      </section>

      {/* TOP + TOGETHER */}
      <section className="mt-20 grid gap-16 border-t border-[var(--line)] pt-16 lg:grid-cols-[1.35fr_.65fr] lg:gap-14 md:mt-28 md:pt-20">
        <div>
          <SectionHeader
            eyebrow="02 / Taste"
            title="Highest rated"
            action="Statistics"
            onClick={() => navigate("/statistics")}
          />

          {topRated.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3">
              {topRated.map((movie, index) => (
                <MovieCard
                  key={`top-${movie.id}`}
                  movie={movie}
                  index={index}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={<Trophy size={20} />}
              title="No ratings yet."
              text="Rate watched films and your personal favourites will collect here."
              action="Open films"
              onClick={() => navigate("/films")}
            />
          )}
        </div>

        <aside className="self-start border-l border-[var(--line)] pl-6 lg:pl-8">
          <p className="cine-kicker cine-accent">03 / Together</p>

          <div className="mt-5 flex items-center gap-3">
            <Users size={15} strokeWidth={1.3} className="text-[var(--acid)]" />
            <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/25">
              Shared cinema
            </span>
          </div>

          <div className="mt-7 flex items-end gap-3">
            <span className="cine-serif text-6xl leading-none tracking-[-.06em]">
              {match == null ? "—" : `${Math.round(match)}%`}
            </span>
            {match != null && (
              <Heart
                size={17}
                strokeWidth={1.2}
                className="mb-2 text-[var(--acid)]"
              />
            )}
          </div>

          <p className="mt-4 max-w-xs text-sm leading-6 text-white/25">
            {togetherMovies.length > 0
              ? `${togetherMovies.length} film${togetherMovies.length === 1 ? "" : "s"} rated by both of you.`
              : "Rate the same films and CineLog will measure how close your taste is."}
          </p>

          <button
            type="button"
            onClick={() => navigate("/together")}
            className="group mt-8 flex items-center gap-2 cine-mono text-[8px] uppercase tracking-[.14em] text-white/30 transition-colors hover:text-[var(--acid)]"
          >
            Open Together
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </aside>
      </section>

      {/* WATCHLIST */}
      <section className="mt-20 md:mt-28">
        <SectionHeader
          eyebrow="04 / Next up"
          title="Watchlist"
          action="Open watchlist"
          onClick={() => navigate("/watchlist")}
        />

        {watchlist.length > 0 ? (
          <div className="grid grid-cols-2 gap-x-5 gap-y-12 sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-6">
            {watchlist.slice(0, 6).map((movie, index) => (
              <MovieCard
                key={`watch-${movie.id}`}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Bookmark size={20} />}
            title="Nothing waiting."
            text="Save films you want to watch later and they will appear here."
            action="Browse films"
            onClick={() => navigate("/films")}
          />
        )}
      </section>

      {/* ACTIVITY / SUMMARY */}
      <section className="mt-20 grid gap-12 border-t border-[var(--line)] pt-16 lg:grid-cols-[1fr_1fr] md:mt-28 md:pt-20">
        <div>
          <div className="mb-6 flex items-end justify-between border-b border-[var(--line)] pb-4">
            <div>
              <p className="cine-kicker">05 / Activity</p>
              <h2 className="mt-3 cine-serif text-3xl tracking-[-.045em]">
                Recent entries
              </h2>
            </div>
            <Play size={15} strokeWidth={1.2} className="text-white/20" />
          </div>

          {recentlyAdded.length > 0 ? (
            <div>
              {recentlyAdded.slice(0, 5).map((movie) => (
                <ActivityRow
                  key={`activity-${movie.id}-${movie.addedAt}`}
                  movie={movie}
                  onOpen={() => navigate(`/movie/${movie.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="py-8 text-sm text-white/20">No activity yet.</p>
          )}
        </div>

        <div>
          <div className="mb-6 flex items-end justify-between border-b border-[var(--line)] pb-4">
            <div>
              <p className="cine-kicker">06 / Overview</p>
              <h2 className="mt-3 cine-serif text-3xl tracking-[-.045em]">
                Collection
              </h2>
            </div>
            <Clock3 size={15} strokeWidth={1.2} className="text-white/20" />
          </div>

          <div className="divide-y divide-[var(--line)] border-y border-[var(--line)]">
            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-white/30">Total films</span>
              <span className="cine-mono text-[10px] text-white/70">{movies.length}</span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-white/30">Watched</span>
              <span className="cine-mono text-[10px] text-white/70">{watched.length}</span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-white/30">Rated</span>
              <span className="cine-mono text-[10px] text-white/70">{ratedMovies.length}</span>
            </div>

            <div className="flex items-center justify-between py-4">
              <span className="text-sm text-white/30">Average</span>
              <span className="flex items-center gap-2 cine-mono text-[10px] text-white/70">
                <Star size={11} fill="currentColor" className="text-[var(--acid)]" />
                {averageRating}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate("/statistics")}
            className="group mt-6 flex w-full items-center justify-between border border-[var(--line)] px-4 py-4 cine-mono text-[8px] uppercase tracking-[.13em] text-white/30 transition-colors hover:border-white/25 hover:text-white"
          >
            Open full statistics
            <ArrowRight
              size={13}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          </button>
        </div>
      </section>

      <section className="mt-24 border-t border-[var(--line)] pt-7">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="cine-kicker cine-accent">CineLog</p>
            <p className="mt-3 max-w-lg text-sm leading-6 text-white/20">
              A personal cinema archive built around your own taste, not engagement metrics.
            </p>
          </div>

          <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/15">
            {movies.length} {movies.length === 1 ? "film" : "films"} in archive
          </span>
        </div>
      </section>
    </div>
  );
}
