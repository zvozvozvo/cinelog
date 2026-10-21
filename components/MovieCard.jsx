import { useState } from "react";
import { Film, Star, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { getPoster } from "../src/tmdb";

function resolvePoster(movie) {
  const candidate = movie.poster_path || movie.poster || movie.posterUrl;
  if (!candidate || typeof candidate !== "string") return null;
  const value = candidate.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("/")) return getPoster(value, "w500");
  if (value.startsWith("image.tmdb.org/")) return `https://${value}`;
  return null;
}

export default function MovieCard({ movie, index = 0 }) {
  const navigate = useNavigate();
  const [imageFailed, setImageFailed] = useState(false);

  const title = movie.title || movie.name || movie.originalTitle || "Без названия";
  const year = movie.release_date?.slice(0, 4) || movie.first_air_date?.slice(0, 4) || movie.year || "—";
  const ratingValue = Number(movie.youRating ?? movie.personalRating ?? 0);
  const hasRating = Number.isFinite(ratingValue) && ratingValue > 0;
  const status = movie.status === "watchlist" ? "К просмотру" : "Просмотрено";
  const posterUrl = resolvePoster(movie);

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
        {posterUrl && !imageFailed ? (
          <img
            src={posterUrl}
            alt={`Постер фильма «${title}»`}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            className="cine-movie-card__poster"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className="cine-poster-fallback" aria-label="Постер недоступен">
            <span className="cine-poster-fallback__frame"><Film size={28} strokeWidth={1.25} /></span>
            <span className="cine-poster-fallback__title">{title}</span>
            <span className="cine-poster-fallback__caption">CINELOG / АРХИВ</span>
          </div>
        )}
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
