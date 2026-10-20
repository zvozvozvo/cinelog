import { Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPoster } from "../src/tmdb";

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();

  const title =
    movie.title ||
    movie.name ||
    movie.originalTitle ||
    "Без названия";

  const year =
    movie.release_date?.slice(0, 4) ||
    movie.first_air_date?.slice(0, 4) ||
    movie.year ||
    "—";

  const rating = Number(
    movie.youRating ?? movie.personalRating ?? 0
  );

  const status =
    movie.status === "watchlist"
      ? "К просмотру"
      : "Просмотрено";

  // Поддерживаем оба варианта:
  // TMDB poster_path = "/abc.jpg"
  // сохранённый poster = "https://image.tmdb.org/..."
  const posterUrl =
    movie.poster ||
    movie.posterUrl ||
    (movie.poster_path
      ? getPoster(movie.poster_path, "w500")
      : null);

  function openMovie() {
    navigate(`/movie/${movie.id}`);
  }

  return (
    <article
      className="group cursor-pointer"
      onClick={openMovie}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMovie();
        }
      }}
      role="link"
      tabIndex={0}
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-[#101310]">
        {posterUrl ? (
          <img
            src={posterUrl}
            alt={title}
            loading={index > 5 ? "lazy" : "eager"}
            className="
              h-full
              w-full
              object-cover
              opacity-[.88]
              transition-[transform,opacity,filter]
              duration-500
              ease-out
              group-hover:scale-[1.025]
              group-hover:opacity-100
              group-hover:brightness-[.92]
            "
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center border border-[var(--line)] bg-[#101310]">
            <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/25">
              Нет постера
            </span>
          </div>
        )}

        <span
          className="
            absolute
            left-3
            top-3
            z-10
            cine-mono
            text-[8px]
            tracking-[.12em]
            text-white/55
          "
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {rating > 0 && (
          <div
            className="
              absolute
              bottom-3
              left-3
              z-10
              flex
              items-center
              gap-1.5
              cine-mono
              text-[9px]
              font-medium
              tracking-[.08em]
              text-[var(--acid)]
            "
          >
            <Star
              size={10}
              strokeWidth={1.7}
              fill="currentColor"
            />

            {rating.toFixed(1)}
          </div>
        )}
      </div>

      <div className="pt-4">
        <div className="flex items-start gap-4">
          <h3
            className="
              cine-serif
              min-w-0
              flex-1
              text-[20px]
              leading-[1.04]
              tracking-[-.025em]
              text-[var(--paper)]
              transition-colors
              duration-200
              group-hover:text-white
            "
          >
            {title}
          </h3>

          <span
            className="
              shrink-0
              pt-1
              cine-mono
              text-[8px]
              tracking-[.08em]
              text-white/28
            "
          >
            {year}
          </span>
        </div>

        <div
          className="
            mt-3
            flex
            items-center
            justify-between
            gap-3
            border-t
            border-[var(--line)]
            pt-3
          "
        >
          <span
            className="
              cine-mono
              text-[8px]
              uppercase
              tracking-[.14em]
              text-white/28
            "
          >
            {status}
          </span>

          {rating > 0 ? (
            <span
              className="
                cine-mono
                text-[8px]
                uppercase
                tracking-[.1em]
                text-white/20
              "
            >
              Моя оценка
            </span>
          ) : (
            <span
              className="
                cine-mono
                text-[8px]
                tracking-[.08em]
                text-white/15
              "
            >
              TMDB
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
