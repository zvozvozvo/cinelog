import {
  ArrowRight,
  Bookmark,
  Clock3,
  Film,
  Play,
  Plus,
  Star,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import { getBackdrop, getPoster } from "../src/tmdb";

function SectionHead({ number, title, action, onClick }) {
  return (
    <div className="mb-8 flex items-end justify-between gap-6 border-b border-white/[.13] pb-5">
      <div className="flex items-baseline gap-5">
        <span className="cine-mono text-[9px] font-medium tracking-[.12em] text-[var(--acid)]">
          {number}
        </span>

        <h2 className="cine-serif text-4xl tracking-[-.035em] text-[var(--paper)] md:text-5xl">
          {title}
        </h2>
      </div>

      {action && (
        <button
          type="button"
          onClick={onClick}
          className="
            group
            flex
            min-h-[40px]
            shrink-0
            items-center
            gap-2
            border-b
            border-white/[.18]
            pb-1
            cine-mono
            text-[9px]
            font-medium
            uppercase
            tracking-[.15em]
            text-white/38
            transition-colors
            duration-200
            hover:border-[var(--acid)]
            hover:text-[var(--acid)]
          "
        >
          {action}

          <ArrowRight
            size={13}
            strokeWidth={1.7}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </button>
      )}
    </div>
  );
}

function formatTime(minutes) {
  if (!minutes) return "—";

  const value = Number(minutes);

  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  const hours = Math.floor(value / 60);
  const remaining = value % 60;

  if (hours) {
    return `${hours} ч${remaining ? ` ${remaining} мин` : ""}`;
  }

  return `${remaining} мин`;
}

function getImageUrl(source, type = "backdrop") {
  if (!source) return null;

  const value = String(source).trim();

  if (!value) return null;

  if (
    value.startsWith("http://") ||
    value.startsWith("https://")
  ) {
    return value;
  }

  if (type === "poster") {
    return getPoster(value, "w780");
  }

  return getBackdrop(value, "original");
}

function FeaturedImage({ movie }) {
  const title =
    movie?.title ||
    movie?.name ||
    movie?.originalTitle ||
    "Рекомендуемый фильм";

  const backdropSource =
    movie?.backdrop_path ||
    movie?.backdrop ||
    movie?.backdropUrl;

  const posterSource =
    movie?.poster_path ||
    movie?.poster ||
    movie?.posterUrl;

  const backdropUrl = getImageUrl(
    backdropSource,
    "backdrop"
  );

  const posterUrl = getImageUrl(
    posterSource,
    "poster"
  );

  return (
    <div className="relative min-h-[360px] overflow-hidden bg-[#151815] lg:min-h-[520px]">
      {backdropUrl ? (
        <img
          src={backdropUrl}
          alt={title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-70
            transition
            duration-700
            group-hover:scale-[1.02]
            group-hover:opacity-85
          "
          onError={(event) => {
            if (posterUrl) {
              event.currentTarget.src = posterUrl;
              event.currentTarget.classList.remove(
                "opacity-70"
              );
              event.currentTarget.classList.add(
                "opacity-55"
              );
            } else {
              event.currentTarget.style.display = "none";
            }
          }}
        />
      ) : posterUrl ? (
        <img
          src={posterUrl}
          alt={title}
          className="
            absolute
            inset-0
            h-full
            w-full
            object-cover
            opacity-55
            transition
            duration-700
            group-hover:scale-[1.02]
            group-hover:opacity-70
          "
          onError={(event) => {
            event.currentTarget.style.display = "none";
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-[#151815]">
          <div className="absolute inset-0 grid place-items-center">
            <Film
              size={34}
              strokeWidth={1.1}
              className="text-white/10"
            />
          </div>
        </div>
      )}

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-r
          from-black/5
          via-black/20
          to-[#0d0f0d]
        "
      />

      <div
        className="
          pointer-events-none
          absolute
          inset-0
          bg-gradient-to-t
          from-black/45
          via-transparent
          to-transparent
        "
      />

      <div className="absolute bottom-6 left-6 cine-mono text-[8px] uppercase tracking-[.18em] text-white/42">
        Выбрано из твоего архива
      </div>
    </div>
  );
}

export default function Home({
  movies = [],
  onAddMovie,
}) {
  const navigate = useNavigate();

  const watched = movies.filter(
    (movie) => movie.status === "watched"
  );

  const queue = movies.filter(
    (movie) => movie.status === "watchlist"
  );

  const recent = [...movies]
    .sort(
      (a, b) =>
        new Date(b.addedAt || 0) -
        new Date(a.addedAt || 0)
    )
    .slice(0, 6);

  const rated = watched.filter(
    (movie) => Number(movie.personalRating) > 0
  );

  const top = [...rated]
    .sort(
      (a, b) =>
        Number(b.personalRating) -
        Number(a.personalRating)
    )
    .slice(0, 6);

  const averageRating = rated.length
    ? (
        rated.reduce(
          (sum, movie) =>
            sum + Number(movie.personalRating),
          0
        ) / rated.length
      ).toFixed(1)
    : "—";

  const runtime = watched.reduce(
    (sum, movie) => {
      const value = Number(movie.runtime);

      return (
        sum +
        (Number.isFinite(value) && value > 0
          ? value
          : 0)
      );
    },
    0
  );

  const featured = watched[0];

  return (
    <div className="pb-20">
      {/* =====================================================
          HERO
          ===================================================== */}

      <section className="border-b border-white/[.13] py-16 md:py-20 xl:py-24">
        <div className="grid gap-16 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,.7fr)] xl:items-end xl:gap-24">
          <div>
            <p className="cine-kicker mb-7">
              ЛИЧНЫЙ КИНОАРХИВ / 2026
            </p>

            <h1
              className="
                cine-serif
                max-w-[1080px]
                text-[clamp(4rem,7.5vw,8.5rem)]
                leading-[.84]
                tracking-[-.068em]
                text-[var(--paper)]
              "
            >
              Твои фильмы.
              <br />
              <em className="font-normal text-white/30">
                Твой вкус.
              </em>
            </h1>

            <p className="mt-8 max-w-[610px] text-[15px] leading-7 text-white/43 md:text-[16px]">
              Личная коллекция фильмов, которые ты смотришь, сохраняешь и оцениваешь. Твой архив растёт с каждым фильмом.
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/films")}
                className="
                  group
                  flex
                  h-[54px]
                  items-center
                  justify-center
                  gap-4
                  border
                  border-[var(--acid)]
                  bg-[var(--acid)]
                  px-6
                  cine-mono
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[.16em]
                  text-black
                  transition-colors
                  duration-200
                  hover:bg-[#c7ff62]
                "
              >
                <span>Открыть архив</span>

                <ArrowRight
                  size={16}
                  strokeWidth={2}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </button>

              <button
                type="button"
                onClick={onAddMovie}
                className="
                  flex
                  h-[54px]
                  items-center
                  justify-center
                  gap-3
                  border
                  border-white/[.2]
                  bg-transparent
                  px-6
                  cine-mono
                  text-[9px]
                  font-bold
                  uppercase
                  tracking-[.16em]
                  text-white/65
                  transition-colors
                  duration-200
                  hover:border-white/[.4]
                  hover:text-white
                "
              >
                <Plus size={15} strokeWidth={1.9} />
                <span>Добавить фильм</span>
              </button>
            </div>
          </div>

          {/* СОДЕРЖИМОЕ АРХИВА */}

          <div>
            <div className="mb-7 flex items-center justify-between border-b border-white/[.13] pb-4">
              <span className="cine-mono text-[8px] uppercase tracking-[.18em] text-white/28">
                АРХИВНЫЙ ГОД
              </span>

              <span className="cine-mono text-[8px] uppercase tracking-[.18em] text-[var(--acid)]">
                2026
              </span>
            </div>

            <div>
              <div className="flex items-baseline justify-between border-b border-white/[.1] py-5">
                <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/32">
                  ПРОСМОТРЕНО ФИЛЬМОВ
                </span>

                <span className="cine-serif text-4xl tracking-[-.04em] text-[var(--paper)]">
                  {watched.length}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-white/[.1] py-5">
                <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/32">
                  В СПИСКЕ «К ПРОСМОТРУ»
                </span>

                <span className="cine-serif text-4xl tracking-[-.04em] text-[var(--paper)]">
                  {queue.length}
                </span>
              </div>

              <div className="flex items-baseline justify-between border-b border-white/[.1] py-5">
                <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/32">
                  Средняя оценка
                </span>

                <span className="cine-serif text-4xl tracking-[-.04em] text-[var(--acid)]">
                  {averageRating}
                </span>
              </div>

              <div className="flex items-baseline justify-between py-5">
                <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/32">
                  Время просмотра
                </span>

                <span className="cine-serif text-4xl tracking-[-.04em] text-[var(--paper)]">
                  {formatTime(runtime)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          RECENTLY ADDED
          ===================================================== */}

      <section className="pt-20 md:pt-24">
        <SectionHead
          number="01"
          title="Недавно добавленные"
          action="Все фильмы"
          onClick={() => navigate("/films")}
        />

        {recent.length ? (
          <div className="cine-grid cine-grid--wide">
            {recent.map((movie, index) => (
              <MovieCard
                key={`${movie.id}-${movie.addedAt || index}`}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="border-y border-dashed border-white/[.13] py-24 text-center">
            <Film
              className="mx-auto mb-5 text-white/20"
              size={24}
              strokeWidth={1.4}
            />

            <p className="cine-serif text-3xl text-[var(--paper)]">
              В архиве пока ничего нет.
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
                border-[var(--acid)]
                bg-[var(--acid)]
                px-6
                cine-mono
                text-[9px]
                font-bold
                uppercase
                tracking-[.15em]
                text-black
                transition-colors
                hover:bg-[#c7ff62]
              "
            >
              <Plus size={15} />
              Добавить первый фильм
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          FEATURED FILM
          ===================================================== */}

      {featured && (
        <section className="pt-24 md:pt-32">
          <SectionHead
            number="02"
            title="Рекомендуемый фильм"
            action="Открыть фильм"
            onClick={() =>
              navigate(`/movie/${featured.id}`)
            }
          />

          <button
            type="button"
            onClick={() =>
              navigate(`/movie/${featured.id}`)
            }
            className="
              group
              relative
              block
              w-full
              overflow-hidden
              border
              border-white/[.13]
              bg-[#0d0f0d]
              text-left
            "
          >
            <div className="grid min-h-[520px] lg:grid-cols-[1.45fr_.75fr]">
              {/* IMAGE */}

              <FeaturedImage movie={featured} />

              {/* INFO */}

              <div className="relative flex flex-col justify-between border-t border-white/[.13] p-7 lg:border-l lg:border-t-0 lg:p-10 xl:p-12">
                <div>
                  <div className="mb-8 flex items-center justify-between gap-4">
                    <span className="cine-mono text-[8px] uppercase tracking-[.18em] text-[var(--acid)]">
                      Твой выбор
                    </span>

                    <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/25">
                      02 / 03
                    </span>
                  </div>

                  <h3 className="cine-serif max-w-[560px] text-5xl leading-[.9] tracking-[-.055em] text-[var(--paper)] md:text-6xl xl:text-7xl">
                    {featured.title ||
                      featured.name ||
                      featured.originalTitle ||
                      "Без названия"}
                  </h3>

                  {featured.release_date && (
                    <p className="mt-5 cine-mono text-[9px] uppercase tracking-[.16em] text-white/30">
                      {featured.release_date.slice(0, 4)}
                    </p>
                  )}

                  {featured.year &&
                    !featured.release_date && (
                      <p className="mt-5 cine-mono text-[9px] uppercase tracking-[.16em] text-white/30">
                        {featured.year}
                      </p>
                    )}

                  {featured.overview && (
                    <p className="mt-8 max-w-[520px] text-[13px] leading-6 text-white/40">
                      {featured.overview}
                    </p>
                  )}
                </div>

                <div className="mt-12">
                  <div className="mb-7 flex items-end justify-between border-b border-white/[.12] pb-5">
                    <div>
                      <span className="block cine-mono text-[8px] uppercase tracking-[.16em] text-white/28">
                        Твоя оценка
                      </span>

                      <span className="mt-2 block cine-serif text-5xl tracking-[-.05em] text-[var(--acid)]">
                        {Number(
                          featured.personalRating
                        ) > 0
                          ? Number(
                              featured.personalRating
                            ).toFixed(1)
                          : "—"}
                      </span>
                    </div>

                    <Star
                      size={19}
                      strokeWidth={1.4}
                      className="mb-2 text-[var(--acid)]"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/28">
                      Открыть фильм
                    </span>

                    <span
                      className="
                        grid
                        h-11
                        w-11
                        place-items-center
                        border
                        border-white/[.2]
                        text-white/65
                        transition-colors
                        duration-200
                        group-hover:border-[var(--acid)]
                        group-hover:bg-[var(--acid)]
                        group-hover:text-black
                      "
                    >
                      <ArrowRight
                        size={16}
                        strokeWidth={1.8}
                      />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </section>
      )}

      {/* =====================================================
          HIGHEST ОЦЕНЕНО
          ===================================================== */}

      <section className="pt-24 md:pt-28">
        <SectionHead
          number="03"
          title="С лучшей оценкой"
          action="Статистика"
          onClick={() => navigate("/statistics")}
        />

        {top.length ? (
          <div className="cine-grid cine-grid--wide">
            {top.map((movie, index) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="border-y border-dashed border-white/[.13] py-20 text-center">
            <p className="cine-mono text-[9px] uppercase tracking-[.15em] text-white/25">
              Оцени просмотренные фильмы, чтобы заполнить этот раздел.
            </p>
          </div>
        )}
      </section>

      {/* =====================================================
          ARCHIVE SUMMARY
          ===================================================== */}

      <section className="mt-24 border-y border-white/[.13] py-9">
        <div className="flex flex-wrap items-center gap-x-12 gap-y-4 cine-mono text-[9px] font-medium uppercase tracking-[.15em] text-white/30">
          <span className="inline-flex items-center gap-2">
            <Play size={12} strokeWidth={1.5} />
            {watched.length} просмотрено
          </span>

          <span className="inline-flex items-center gap-2">
            <Bookmark size={12} strokeWidth={1.5} />
            {queue.length} в списке «К просмотру»
          </span>

          <span className="inline-flex items-center gap-2">
            <Star size={12} strokeWidth={1.5} />
            Средняя оценка: {averageRating}
          </span>

          <span className="inline-flex items-center gap-2">
            <Clock3 size={12} strokeWidth={1.5} />
            {formatTime(runtime)}
          </span>
        </div>
      </section>
    </div>
  );
}