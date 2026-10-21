import { Star, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoviePoster from "./MoviePoster";

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();
  const title = movie.title || movie.name || movie.originalTitle || "Без названия";
  const year = movie.release_date?.slice(0, 4) || movie.releaseDate?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || movie.year || "—";
  const ratingValue = Number(movie.youRating ?? movie.personalRating ?? 0);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const status = movie.status === "watchlist" ? "К просмотру" : "Просмотрено";

  function openMovie() {
    navigate(`/movie/${movie.id}`);
  }

  return (
    <article
      className="cine-movie-card group"
      onClick={openMovie}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          openMovie();
        }
      }}
      role="link"
      tabIndex={0}
      aria-label={`Открыть фильм «${title}»`}
    >
      <div className="cine-movie-card__visual">
        <MoviePoster
          movie={movie}
          alt={`Постер фильма «${title}»`}
          size="w500"
          loading={index < 3 ? "eager" : "lazy"}
          className="cine-movie-card__poster absolute inset-0 h-full w-full object-cover"
        />
        <span className="cine-movie-card__index">{String(index + 1).padStart(2, "0")}</span>
        <span className="cine-movie-card__open" aria-hidden="true"><ArrowUpRight size={17} /></span>
        {hasRating && (
          <span className="cine-movie-card__rating"><Star size={12} fill="currentColor" strokeWidth={1.6} />{ratingValue.toFixed(1)}</span>
        )}
      </div>

      <div className="cine-movie-card__body">
        <div className="cine-movie-card__title-row">
          <h3 className="cine-movie-card__title">{title}</h3>
          <span className="cine-movie-card__year">{year}</span>
        </div>
        <div className="cine-movie-card__meta">
          <span>{status}</span>
          <span>{hasRating ? "Твоя оценка" : "TMDB"}</span>
        </div>
      </div>
    </article>
  );
}
