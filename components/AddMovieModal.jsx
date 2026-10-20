import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  CalendarDays,
  Check,
  Clock3,
  Film,
  LoaderCircle,
  Search,
  Star,
  X,
} from "lucide-react";

import { getMovie, getPoster, searchMovies } from "../src/tmdb";

function formatRuntime(minutes) {
  if (!minutes || Number(minutes) <= 0) return "Runtime unknown";

  const value = Number(minutes);
  const h = Math.floor(value / 60);
  const m = value % 60;

  return h ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
}

function directorOf(movie) {
  return (
    movie?.credits?.crew?.find(
      (person) => person.job === "Director"
    )?.name || null
  );
}

export default function AddMovieModal({ onClose, onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const [status, setStatus] = useState("watched");
  const [rating, setRating] = useState(8);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = query.trim();

    if (!value || selected) {
      setResults([]);
      return undefined;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      setError("");

      try {
        const data = await searchMovies(value);
        setResults(data.slice(0, 9));
      } catch (e) {
        console.error(e);
        setResults([]);
        setError(
          "TMDB search failed. Check the token or connection."
        );
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, selected]);

  const ratingLabel = useMemo(() => {
    if (rating >= 9) return "Masterpiece";
    if (rating >= 8) return "Excellent";
    if (rating >= 7) return "Very good";
    if (rating >= 6) return "Good";
    if (rating >= 5) return "Average";
    if (rating >= 3) return "Weak";

    return "Bad";
  }, [rating]);

  async function chooseMovie(movie) {
    setLoadingDetails(true);
    setError("");

    try {
      const details = await getMovie(movie.id);
      setSelected(details);
    } catch (e) {
      console.error(e);
      setSelected(movie);
      setError(
        "Full movie details could not be loaded. Basic data will still be saved."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  function addSelected() {
    if (!selected || loadingDetails) return;

    onAdd({
      id: selected.id,
      title:
        selected.title ||
        selected.original_title ||
        "Untitled",
      originalTitle: selected.original_title || "",
      year: selected.release_date?.slice(0, 4) || "—",
      releaseDate: selected.release_date || "",
      genre:
        selected.genres
          ?.map((genre) => genre.name)
          .join(", ") || "Unknown",
      overview: selected.overview || "",
      poster: getPoster(selected.poster_path, "w500"),
      backdrop: selected.backdrop_path
        ? `https://image.tmdb.org/t/p/original${selected.backdrop_path}`
        : null,
      voteAverage: Number(selected.vote_average) || 0,
      personalRating:
        status === "watched"
          ? Number(rating.toFixed(1))
          : null,
      status,
      addedAt: new Date().toISOString(),
      runtime: Number(selected.runtime) || null,
      director: directorOf(selected),
    });
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="cine-modal-backdrop"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            opacity: 0,
            y: 16,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          className="cine-modal"
        >
          {/* HEADER */}
          <div className="cine-modal__head">
            <div>
              <p className="cine-kicker cine-accent">
                CineLog / Add to archive
              </p>

              <h2 className="cine-modal__title mt-2">
                Add a film
              </h2>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="cine-close"
              aria-label="Close"
            >
              <X size={17} strokeWidth={1.6} />
            </button>
          </div>

          <div className="cine-modal__body">
            {!selected ? (
              <>
                {/* SEARCH */}
                <div className="relative">
                  <Search
                    size={16}
                    strokeWidth={1.5}
                    className="
                      pointer-events-none
                      absolute
                      left-0
                      top-1/2
                      -translate-y-1/2
                      text-white/25
                    "
                  />

                  <input
                    autoFocus
                    value={query}
                    onChange={(event) =>
                      setQuery(event.target.value)
                    }
                    placeholder="Search title, original title..."
                    className="cine-input pl-7 pr-10"
                  />

                  {searching && (
                    <LoaderCircle
                      size={16}
                      strokeWidth={1.5}
                      className="
                        absolute
                        right-0
                        top-1/2
                        -translate-y-1/2
                        animate-spin
                        text-[var(--acid)]
                      "
                    />
                  )}
                </div>

                {error && (
                  <p className="mt-3 text-xs text-red-300/70">
                    {error}
                  </p>
                )}

                {/* SEARCH RESULTS */}
                <div className="search-results">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => chooseMovie(movie)}
                      className="search-result"
                    >
                      <div className="search-result__poster">
                        {movie.poster_path ? (
                          <img
                            src={getPoster(
                              movie.poster_path,
                              "w185"
                            )}
                            alt=""
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-white/15">
                            <Film size={16} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="search-result__title truncate">
                          {movie.title ||
                            movie.original_title}
                        </div>

                        <div className="search-result__meta">
                          {movie.release_date?.slice(0, 4) ||
                            "—"}

                          {movie.original_title &&
                            movie.original_title !==
                              movie.title &&
                            ` · ${movie.original_title}`}
                        </div>
                      </div>

                      {movie.vote_average > 0 && (
                        <div className="search-result__rating">
                          {Number(
                            movie.vote_average
                          ).toFixed(1)}
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                {!searching &&
                  query.trim() &&
                  !results.length &&
                  !error && (
                    <div className="py-12 text-center">
                      <p className="cine-mono text-[9px] uppercase tracking-[.15em] text-white/25">
                        No films found
                      </p>
                    </div>
                  )}

                {!query.trim() && (
                  <div
                    className="
                      mt-6
                      border-t
                      border-[var(--line)]
                      pt-6
                      text-xs
                      leading-6
                      text-white/25
                    "
                  >
                    Search is powered by TMDB. Select a
                    result to pull poster, backdrop, genres,
                    runtime and director automatically.
                  </div>
                )}
              </>
            ) : (
              <>
                {/* SELECTED FILM */}
                <div className="grid gap-7 md:grid-cols-[150px_minmax(0,1fr)]">
                  <div className="overflow-hidden border border-[var(--line)] bg-[#111611]">
                    {selected.poster_path ? (
                      <img
                        src={getPoster(
                          selected.poster_path,
                          "w342"
                        )}
                        alt=""
                        className="aspect-[2/3] w-full object-cover"
                      />
                    ) : (
                      <div className="grid aspect-[2/3] place-items-center text-white/20">
                        <Film size={20} />
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col justify-end">
                    <div className="flex items-start justify-between gap-5">
                      <div className="min-w-0">
                        <p className="cine-kicker cine-accent">
                          Selected film
                        </p>

                        <h3
                          className="
                            mt-2
                            cine-serif
                            text-[clamp(2rem,4vw,3.5rem)]
                            leading-[.94]
                            tracking-[-.045em]
                          "
                        >
                          {selected.title ||
                            selected.original_title}
                        </h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setSelected(null);
                          setQuery("");
                        }}
                        className="
                          shrink-0
                          cine-mono
                          text-[8px]
                          uppercase
                          tracking-[.13em]
                          text-white/30
                          transition-colors
                          hover:text-[var(--acid)]
                        "
                      >
                        Change
                      </button>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-xs text-white/38">
                      <span className="inline-flex items-center gap-2">
                        <CalendarDays size={13} />
                        {selected.release_date?.slice(
                          0,
                          4
                        ) || "—"}
                      </span>

                      <span className="inline-flex items-center gap-2">
                        <Clock3 size={13} />
                        {formatRuntime(
                          selected.runtime
                        )}
                      </span>

                      <span className="inline-flex items-center gap-2 text-[var(--acid)]">
                        <Star
                          size={13}
                          fill="currentColor"
                        />
                        {Number(
                          selected.vote_average || 0
                        ).toFixed(1)}
                      </span>
                    </div>

                    {directorOf(selected) && (
                      <p className="mt-4 text-xs text-white/30">
                        Director{" "}
                        <span className="text-white/65">
                          {directorOf(selected)}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* STATUS */}
                <div className="mt-9">
                  <p className="cine-kicker">
                    Archive status
                  </p>

                  <div className="detail-choice-grid">
                    <button
                      type="button"
                      onClick={() =>
                        setStatus("watched")
                      }
                      className={`detail-choice ${
                        status === "watched"
                          ? "is-active"
                          : ""
                      }`}
                    >
                      <strong>
                        {status === "watched" && (
                          <Check
                            size={13}
                            className="mr-2 inline"
                          />
                        )}
                        Watched
                      </strong>

                      <span>
                        Keep it in the watched archive
                        and rate it.
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setStatus("watchlist")
                      }
                      className={`detail-choice ${
                        status === "watchlist"
                          ? "is-active"
                          : ""
                      }`}
                    >
                      <strong>
                        {status === "watchlist" && (
                          <Check
                            size={13}
                            className="mr-2 inline"
                          />
                        )}
                        Watchlist
                      </strong>

                      <span>
                        Save it for later without a
                        personal rating.
                      </span>
                    </button>
                  </div>
                </div>

                {/* RATING */}
                {status === "watched" && (
                  <div className="rating-box">
                    <div className="rating-box__top">
                      <div>
                        <p className="cine-kicker cine-accent">
                          Your rating
                        </p>

                        <p className="mt-2 text-xs text-white/30">
                          {ratingLabel}
                        </p>
                      </div>

                      <div>
                        <span className="rating-value">
                          {rating.toFixed(1)}
                        </span>

                        <span className="ml-1 text-xs text-white/25">
                          / 10
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={rating}
                      onChange={(event) =>
                        setRating(
                          Number(event.target.value)
                        )
                      }
                      className="rating-range"
                    />

                    <div className="mt-2 flex justify-between cine-mono text-[9px] text-white/20">
                      <span>0</span>
                      <span>2</span>
                      <span>4</span>
                      <span>6</span>
                      <span>8</span>
                      <span>10</span>
                    </div>
                  </div>
                )}

                {error && (
                  <p className="mt-4 text-xs text-white/30">
                    {error}
                  </p>
                )}

                {/* ACTIONS */}
                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={onClose}
                    className="cine-button"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={addSelected}
                    disabled={loadingDetails}
                    className="cine-button cine-button--solid"
                  >
                    {loadingDetails ? (
                      <LoaderCircle
                        size={15}
                        className="animate-spin"
                      />
                    ) : (
                      <Check size={15} />
                    )}

                    Add to CineLog
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}