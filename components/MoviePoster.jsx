import { useEffect, useRef, useState } from "react";
import { Film } from "lucide-react";
import { getMovie, getPoster } from "../src/tmdb";

function toPosterUrl(source, size) {
  if (!source || typeof source !== "string") return null;
  const value = source.trim();
  if (!value) return null;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("image.tmdb.org/")) return `https://${value}`;
  return getPoster(value.startsWith("/") ? value : `/${value}`, size);
}

function cachedPoster(id) {
  if (!id || typeof window === "undefined") return "";
  try {
    return window.sessionStorage.getItem(`cinelog:poster:${id}`) || "";
  } catch {
    return "";
  }
}

export default function MoviePoster({
  movie,
  alt,
  className = "h-full w-full object-cover",
  size = "w500",
  loading = "lazy",
}) {
  const movieId = movie?.id || movie?.tmdb_id;
  const initialSource = movie?.poster || movie?.posterUrl || movie?.poster_path;
  const initialUrl = toPosterUrl(initialSource, size);
  const [recoveredPath, setRecoveredPath] = useState(() => cachedPoster(movieId));
  const [imageFailed, setImageFailed] = useState(false);
  const recoveryStarted = useRef(false);
  const source = toPosterUrl(recoveredPath, size) || initialUrl;
  const title = alt || movie?.title || movie?.name || movie?.originalTitle || "Фильм";

  useEffect(() => {
    if ((source && !imageFailed) || recoveryStarted.current || !movieId) return undefined;
    recoveryStarted.current = true;
    let cancelled = false;

    getMovie(movieId)
      .then((details) => {
        if (cancelled) return;
        const path = details?.poster_path;
        const recoveredUrl = toPosterUrl(path, size);
        if (path && recoveredUrl && recoveredUrl !== source) {
          setRecoveredPath(path);
          setImageFailed(false);
          try {
            window.sessionStorage.setItem(`cinelog:poster:${movieId}`, path);
          } catch {
            // Storage can be disabled; poster recovery still works in memory.
          }
        } else {
          setImageFailed(true);
        }
      })
      .catch(() => {
        if (!cancelled) setImageFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [source, imageFailed, movieId, size]);

  if (source && !imageFailed) {
    return (
      <img
        src={source}
        alt={title}
        loading={loading}
        decoding="async"
        className={className}
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className={`cine-poster-fallback ${className}`} role="img" aria-label={`Постер фильма «${title}» недоступен`}>
      <span className="cine-poster-fallback__frame"><Film size={24} strokeWidth={1.25} /></span>
      <span className="cine-poster-fallback__title">{title}</span>
      <span className="cine-poster-fallback__caption">CINELOG / АРХИВ</span>
    </div>
  );
}
