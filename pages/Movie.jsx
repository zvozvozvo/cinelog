import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Check,
  Clock3,
  Film,
  Pencil,
  Star,
  Trash2,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { getBackdrop, getMovie, getPoster } from "../src/tmdb";

function formatRuntime(minutes) {
  if (!minutes || Number(minutes) <= 0) return "—";

  const value = Number(minutes);
  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (hours) {
    return `${hours}h${mins ? ` ${mins}m` : ""}`;
  }

  return `${mins}m`;
}

function formatDate(date) {
  if (!date) return "—";

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(date));
  } catch {
    return date;
  }
}

function formatYear(date) {
  if (!date) return "—";
  return String(date).slice(0, 4);
}

export default function Movie({
  movies = [],
  onUpdateMovie,
  onDeleteMovie,
}) {
  const { id } = useParams();
  const navigate = useNavigate();

  const localMovie = useMemo(
    () =>
      movies.find(
        (item) => String(item.id) === String(id)
      ),
    [movies, id]
  );

  const [remoteMovie, setRemoteMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [status, setStatus] = useState(
    localMovie?.status || "watched"
  );

  const [rating, setRating] = useState(
    Number(localMovie?.personalRating) || 8
  );

  useEffect(() => {
    let active = true;

    async function loadMovie() {
      setLoading(true);

      try {
        const data = await getMovie(id);

        if (active) {
          setRemoteMovie(data);
        }
      } catch (error) {
        console.error("Movie details error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadMovie();

    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    setStatus(localMovie?.status || "watched");
    setRating(Number(localMovie?.personalRating) || 8);
  }, [
    localMovie?.id,
    localMovie?.status,
    localMovie?.personalRating,
  ]);

  if (!localMovie && loading) {
    return (
      <div className="cine-empty my-20 min-h-[500px]">
        <div>
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-2 border-white/10 border-t-[var(--acid)]" />
          <p className="mt-5 text-center cine-kicker">
            Loading film
          </p>
        </div>
      </div>
    );
  }

  if (!localMovie) {
    return (
      <div className="cine-empty my-20 min-h-[500px]">
        <div className="cine-empty__inner">
          <Film
            className="mx-auto text-[var(--acid)]"
            size={30}
            strokeWidth={1.4}
          />

          <h1 className="cine-empty__title">
            Film not found.
          </h1>

          <p className="cine-empty__text">
            This film is not in your CineLog archive.
          </p>

          <button
            type="button"
            onClick={() => navigate("/films")}
            className="cine-button cine-button--solid mt-6"
          >
            <ArrowLeft size={14} />
            Back to films
          </button>
        </div>
      </div>
    );
  }

  const title =
    remoteMovie?.title ||
    localMovie.title ||
    localMovie.originalTitle ||
    "Untitled";

  const originalTitle =
    remoteMovie?.original_title ||
    localMovie.originalTitle ||
    "";

  const releaseDate =
    remoteMovie?.release_date ||
    localMovie.releaseDate ||
    "";

  const year =
    formatYear(releaseDate) ||
    localMovie.year ||
    "—";

  const genres =
    remoteMovie?.genres?.map((genre) => genre.name).join(" · ") ||
    localMovie.genre ||
    "Unknown";

  const overview =
    remoteMovie?.overview ||
    localMovie.overview ||
    "No description available.";

  const poster =
    localMovie.poster ||
    getPoster(remoteMovie?.poster_path, "w780");

  const backdrop =
    getBackdrop(remoteMovie?.backdrop_path, "original") ||
    localMovie.backdrop ||
    poster;

  const runtime =
    remoteMovie?.runtime ||
    localMovie.runtime ||
    null;

  const voteAverage =
    remoteMovie?.vote_average ||
    localMovie.voteAverage ||
    0;

  const director =
    localMovie.director ||
    remoteMovie?.credits?.crew?.find(
      (person) => person.job === "Director"
    )?.name ||
    null;

  const cast =
    remoteMovie?.credits?.cast
      ?.slice(0, 5)
      .map((person) => person.name)
      .filter(Boolean) || [];

  const country =
    remoteMovie?.production_countries
      ?.map((countryItem) => countryItem.iso_3166_1)
      .join(" · ") ||
    "";

  function saveEdit() {
    onUpdateMovie?.(localMovie.id, {
      status,
      personalRating:
        status === "watched"
          ? Number(rating)
          : null,
      runtime:
        Number(runtime) ||
        localMovie.runtime ||
        null,
      director,
    });

    setEditing(false);
  }

  function deleteFilm() {
    onDeleteMovie?.(localMovie.id);
    navigate("/films", { replace: true });
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45 }}
      className="pb-24"
    >
      <section className="relative mt-8 overflow-hidden border-y border-[var(--line)]">
        {backdrop && (
          <div className="absolute inset-0">
            <img
              src={backdrop}
              alt=""
              className="h-full w-full object-cover opacity-[0.16]"
            />

            <div className="absolute inset-0 bg-[#080908]/[0.84]" />

            <div className="absolute inset-0 bg-gradient-to-r from-[#080908] via-[#080908]/[0.94] to-[#080908]/[0.72]" />
          </div>
        )}

        <div className="relative">
          <div className="flex items-center justify-between border-b border-white/[0.09] px-5 py-4 md:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="group flex items-center gap-2 cine-mono text-[9px] uppercase tracking-[0.16em] text-white/35 transition-colors hover:text-white"
            >
              <ArrowLeft
                size={14}
                strokeWidth={1.5}
                className="transition-transform group-hover:-translate-x-1"
              />
              Back
            </button>

            <span className="cine-mono text-[8px] uppercase tracking-[0.18em] text-white/20">
              CineLog / Film record
            </span>
          </div>

          <div className="grid grid-cols-1 gap-12 px-5 py-12 md:px-8 lg:grid-cols-[minmax(240px,330px)_minmax(0,1fr)] lg:gap-16 lg:px-12 lg:py-16 xl:grid-cols-[340px_minmax(0,1fr)] xl:gap-20">
            <div className="relative">
              <div className="aspect-[2/3] overflow-hidden bg-[#111411]">
                {poster ? (
                  <img
                    src={poster}
                    alt={title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="grid h-full place-items-center">
                    <Film
                      size={34}
                      strokeWidth={1.2}
                      className="text-white/20"
                    />
                  </div>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <span className="cine-mono text-[8px] uppercase tracking-[0.15em] text-white/25">
                  Archive image
                </span>

                <span className="cine-mono text-[8px] uppercase tracking-[0.15em] text-white/25">
                  {year}
                </span>
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-center">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                <span className="cine-mono text-[9px] font-medium uppercase tracking-[0.17em] text-[var(--acid)]">
                  {localMovie.status === "watched"
                    ? "Watched"
                    : "Watchlist"}
                </span>

                <span className="h-px w-8 bg-white/15" />

                <span className="cine-mono text-[9px] uppercase tracking-[0.15em] text-white/30">
                  {year}
                </span>
              </div>

              <h1 className="mt-6 max-w-[1000px] font-serif text-[clamp(48px,7vw,112px)] leading-[0.86] tracking-[-0.055em] text-[#eeeae0]">
                {title}
              </h1>

              {originalTitle &&
                originalTitle !== title && (
                  <p className="mt-5 cine-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                    {originalTitle}
                  </p>
                )}

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/[0.1] py-4">
                <span className="cine-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
                  {genres}
                </span>

                <span className="h-3 w-px bg-white/10" />

                <span className="flex items-center gap-2 cine-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
                  <Clock3 size={13} strokeWidth={1.4} />
                  {formatRuntime(runtime)}
                </span>

                {country && (
                  <>
                    <span className="h-3 w-px bg-white/10" />
                    <span className="cine-mono text-[9px] uppercase tracking-[0.12em] text-white/45">
                      {country}
                    </span>
                  </>
                )}
              </div>

              <div className="mt-10 grid max-w-[780px] grid-cols-2 gap-x-10 gap-y-8 md:grid-cols-3">
                <div>
                  <p className="cine-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
                    TMDB rating
                  </p>

                  <div className="mt-2 flex items-center gap-2 font-serif text-3xl text-[#eeeae0]">
                    <Star
                      size={17}
                      fill="currentColor"
                      strokeWidth={1.2}
                      className="text-[var(--acid)]"
                    />
                    {Number(voteAverage).toFixed(1)}
                    <span className="cine-mono text-[8px] text-white/20">
                      / 10
                    </span>
                  </div>
                </div>

                <div>
                  <p className="cine-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
                    Your rating
                  </p>

                  {localMovie.personalRating != null ? (
                    <div className="mt-2 font-serif text-3xl text-[#eeeae0]">
                      {Number(
                        localMovie.personalRating
                      ).toFixed(1)}
                      <span className="cine-mono ml-2 text-[8px] text-white/20">
                        / 10
                      </span>
                    </div>
                  ) : (
                    <div className="mt-2 font-serif text-3xl text-white/20">
                      —
                    </div>
                  )}
                </div>

                {director && (
                  <div>
                    <p className="cine-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
                      Director
                    </p>

                    <div className="mt-2 flex items-center gap-2 text-sm text-[#eeeae0]">
                      <UserRound
                        size={14}
                        strokeWidth={1.4}
                        className="text-white/35"
                      />
                      {director}
                    </div>
                  </div>
                )}
              </div>

              <p className="mt-12 max-w-[720px] text-[17px] leading-[1.75] text-white/55">
                {overview}
              </p>

              <div className="mt-10 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="cine-button cine-button--solid"
                >
                  <Pencil size={14} />
                  Edit record
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/films")}
                  className="cine-button"
                >
                  My films
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 border-t border-[var(--line)]">
        <div className="grid grid-cols-2 md:grid-cols-4">
          {[
            {
              label: "Release",
              value: formatDate(releaseDate) || year,
            },
            {
              label: "Runtime",
              value: formatRuntime(runtime),
            },
            {
              label: "Added to archive",
              value: formatDate(localMovie.addedAt),
            },
            {
              label: "Status",
              value:
                localMovie.status === "watched"
                  ? "Watched"
                  : "Watchlist",
            },
          ].map((item, index) => (
            <div
              key={item.label}
              className={`px-5 py-7 md:px-7 ${
                index > 0
                  ? "border-l border-[var(--line)]"
                  : ""
              }`}
            >
              <p className="cine-mono text-[8px] uppercase tracking-[0.16em] text-white/25">
                {item.label}
              </p>

              <p className="mt-3 font-serif text-[21px] leading-tight tracking-[-0.025em] text-[#eeeae0]">
                {item.value}
              </p>
            </div>
          ))}
        </div>
      </section>

      {cast.length > 0 && (
        <section className="mt-20 border-t border-[var(--line)] pt-8">
          <div className="flex items-end justify-between gap-8">
            <div>
              <p className="cine-mono text-[8px] uppercase tracking-[0.18em] text-[var(--acid)]">
                Credits
              </p>

              <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#eeeae0]">
                Cast
              </h2>
            </div>

            <span className="cine-mono text-[8px] uppercase tracking-[0.14em] text-white/20">
              {cast.length} principal names
            </span>
          </div>

          <div className="mt-8 grid grid-cols-2 border-t border-[var(--line)] md:grid-cols-5">
            {cast.map((person, index) => (
              <div
                key={`${person}-${index}`}
                className="border-b border-r border-[var(--line)] px-4 py-5"
              >
                <span className="cine-mono text-[8px] text-white/20">
                  {String(index + 1).padStart(2, "0")}
                </span>

                <p className="mt-5 text-sm leading-5 text-white/60">
                  {person}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mt-20 border-t border-[var(--line)] pt-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="cine-mono text-[8px] uppercase tracking-[0.18em] text-[var(--acid)]">
              Archive record
            </p>

            <h2 className="mt-3 max-w-[700px] font-serif text-4xl leading-[0.95] tracking-[-0.04em] text-[#eeeae0] md:text-5xl">
              One film, one record, kept in your archive.
            </h2>
          </div>

          <button
            type="button"
            onClick={() => setEditing(true)}
            className="cine-button shrink-0"
          >
            <Pencil size={14} />
            Edit record
          </button>
        </div>
      </section>

      {editing && (
        <div
          className="cine-modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setEditing(false);
            }
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="cine-modal max-w-[620px]"
          >
            <div className="cine-modal__head">
              <div>
                <p className="cine-kicker cine-accent">
                  Edit archive record
                </p>

                <h2 className="cine-modal__title mt-2">
                  {title}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setEditing(false)}
                className="cine-close"
              >
                <X size={17} />
              </button>
            </div>

            <div className="cine-modal__body">
              <p className="cine-kicker">
                Status
              </p>

              <div className="detail-choice-grid">
                <button
                  type="button"
                  onClick={() => setStatus("watched")}
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
                    Keep it in your watched history.
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
                    Move it back to your queue.
                  </span>
                </button>
              </div>

              {status === "watched" && (
                <div className="rating-box">
                  <div className="rating-box__top">
                    <div>
                      <p className="cine-kicker cine-accent">
                        Your rating
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
                </div>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="cine-button cine-button--danger mr-auto"
                >
                  <Trash2 size={14} />
                  Delete
                </button>

                <button
                  type="button"
                  onClick={() => setEditing(false)}
                  className="cine-button"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={saveEdit}
                  className="cine-button cine-button--solid"
                >
                  <Check size={14} />
                  Save changes
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {confirmDelete && (
        <div
          className="cine-modal-backdrop"
          style={{ zIndex: 120 }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="cine-modal max-w-[480px]"
          >
            <div className="cine-modal__body">
              <Trash2
                size={26}
                strokeWidth={1.4}
                className="text-[var(--danger)]"
              />

              <h2 className="cine-modal__title mt-5">
                Delete this film?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/35">
                “{title}” will be removed from your
                CineLog archive. This cannot be undone.
              </p>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="cine-button"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={deleteFilm}
                  className="cine-button cine-button--danger"
                >
                  Delete movie
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}