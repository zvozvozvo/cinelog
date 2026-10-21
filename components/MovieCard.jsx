import { Star, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MoviePoster from "./MoviePoster";

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();
  const title = movie.title || movie.name || movie.originalTitle || "Без названия";
  const year = movie.release_date?.slice(0, 4) || movie.releaseDate?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || movie.year || "—";
  const personalRating = [movie.personalRating, movie.youRating]
    .map((value) => value === null || value === undefined || value === "" ? NaN : Number(value))
    .find((value) => Number.isFinite(value) && value > 0) ?? 0;
  const hasPersonalRating = personalRating > 0;
  const tmdbRating = Number(movie.vote_average ?? movie.voteAverage ?? 0);
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
      aria-label={`Открыть фильм «${title}»${hasPersonalRating ? `, твоя оценка ${personalRating.toFixed(1)} из 10` : ""}`}
    >
      <div className="cine-movie-card__visual">
        <MoviePoster
          movie={movie}
          alt={`Постер фильма «${title}»`}
          size="w500"
          loading={index < 3 ? "eager" : "lazy"}
          className="cine-movie-card__poster absolute inset-0 h-full w-full object-cover"
        />
        <span className="cine-movie-card__status">{status}</span>
        <span className="cine-movie-card__open" aria-hidden="true"><ArrowUpRight size={17} /></span>
        {hasPersonalRating && (
          <span className="cine-movie-card__rating" aria-label={`Твоя оценка ${personalRating.toFixed(1)} из 10`}>
            <Star size={13} fill="currentColor" strokeWidth={1.7} />
            <strong>{personalRating.toFixed(1)}</strong>
          </span>
        )}
      </div>

      <div className="cine-movie-card__body">
        <div className="cine-movie-card__title-row">
          <h3 className="cine-movie-card__title">{title}</h3>
          <span className="cine-movie-card__year">{year}</span>
        </div>
        <div className="cine-movie-card__meta">
          <span>{hasPersonalRating ? "Твоя оценка" : status}</span>
          <span>{hasPersonalRating ? <><Star size={11} fill="currentColor" /> {personalRating.toFixed(1)} / 10</> : tmdbRating > 0 ? `TMDB ${tmdbRating.toFixed(1)}` : "Без оценки"}</span>
        </div>
      </div>
    </article>
  );
}