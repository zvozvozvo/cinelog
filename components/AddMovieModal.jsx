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
import { supabase } from "../supabase";

function formatRuntime(minutes) {
  if (!minutes || Number(minutes) <= 0) return "Нет данных";

  const value = Number(minutes);
  const hours = Math.floor(value / 60);
  const mins = value % 60;

  if (!hours) return `${mins} мин`;
  if (!mins) return `${hours} ч`;
  return `${hours} ч ${mins} мин`;
}

function getDirector(movie) {
  return (
    movie?.credits?.crew?.find((person) => person.job === "Director")
      ?.name || null
  );
}

export default function AddMovieModal({ onClose, onAdd }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("watched");
  const [rating, setRating] = useState(8);
  const [error, setError] = useState("");

  useEffect(() => {
    const value = query.trim();

    if (!value || selected) {
      setResults([]);
      return undefined;
    }

    let cancelled = false;
    const timer = setTimeout(async () => {
      setSearching(true);
      setError("");

      try {
        const data = await searchMovies(value);
        if (!cancelled) setResults(data.slice(0, 8));
      } catch (searchError) {
        console.error("TMDB search error:", searchError);
        if (!cancelled) {
          setResults([]);
          setError("Не удалось найти фильмы. Проверь подключение к TMDB.");
        }
      } finally {
        if (!cancelled) setSearching(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, selected]);

  const ratingLabel = useMemo(() => {
    if (rating >= 9) return "Шедевр";
    if (rating >= 8) return "Отлично";
    if (rating >= 7) return "Очень хорошо";
    if (rating >= 6) return "Хорошо";
    if (rating >= 5) return "Средне";
    if (rating >= 3) return "Слабо";
    return "Плохо";
  }, [rating]);

  async function chooseMovie(movie) {
    setLoadingDetails(true);
    setError("");

    try {
      setSelected(await getMovie(movie.id));
    } catch (detailsError) {
      console.error("TMDB movie details error:", detailsError);
      setSelected(movie);
      setError(
        "Не удалось загрузить все сведения о фильме. Попробуем сохранить доступные данные."
      );
    } finally {
      setLoadingDetails(false);
    }
  }

  async function addSelected() {
    if (!selected || loadingDetails || saving) return;

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) {
        throw new Error("Сначала войди в свой аккаунт CineLog.");
      }

      const tmdbId = Number(selected.id);
      if (!Number.isFinite(tmdbId) || tmdbId <= 0) {
        throw new Error("У фильма некорректный идентификатор TMDB.");
      }

      const movieData = {
        tmdb_id: tmdbId,
        title: selected.title || selected.original_title || "Без названия",
        original_title: selected.original_title || "",
        release_date: selected.release_date || null,
        poster_path: selected.poster_path || null,
        backdrop_path: selected.backdrop_path || null,
        overview: selected.overview || "",
        runtime: Number(selected.runtime) || null,
        vote_average: Number(selected.vote_average) || 0,
        genres: selected.genres || [],
        director: getDirector(selected),
      };

      // Metadata is shared between users. If another account already added
      // the movie, its row can stay as-is; we still add it to this user's list.
      const { error: movieInsertError } = await supabase
        .from("movies")
        .insert(movieData);

      if (movieInsertError && movieInsertError.code !== "23505") {
        throw movieInsertError;
      }

      // The rating and status belong only to the currently signed-in user.
      const { error: userMovieError } = await supabase
        .from("user_movies")
        .upsert(
          {
            user_id: user.id,
            tmdb_id: tmdbId,
            status,
            rating: status === "watched" ? Number(rating.toFixed(1)) : null,
          },
          { onConflict: "user_id,tmdb_id" }
        );

      if (userMovieError) throw userMovieError;

      const savedMovie = {
        id: tmdbId,
        title: movieData.title,
        originalTitle: movieData.original_title,
        year: movieData.release_date?.slice(0, 4) || "—",
        releaseDate: movieData.release_date || "",
        release_date: movieData.release_date || "",
        genre:
          selected.genres?.map((genre) => genre.name).filter(Boolean).join(", ") ||
          "Неизвестно",
        genres: selected.genres || [],
        overview: movieData.overview,
        poster: getPoster(selected.poster_path, "w500"),
        poster_path: movieData.poster_path,
        backdrop: selected.backdrop_path
          ? `https://image.tmdb.org/t/p/original${selected.backdrop_path}`
          : null,
        backdrop_path: movieData.backdrop_path,
        voteAverage: movieData.vote_average,
        vote_average: movieData.vote_average,
        personalRating: status === "watched" ? Number(rating.toFixed(1)) : null,
        youRating: status === "watched" ? Number(rating.toFixed(1)) : null,
        status,
        addedAt: new Date().toISOString(),
        runtime: movieData.runtime,
        director: movieData.director,
      };

      onAdd(savedMovie);
    } catch (saveError) {
      console.error("Save movie error:", saveError);

      const message = String(saveError?.message || "").toLowerCase();
      setError(
        message.includes("row-level security")
          ? "База данных запретила запись. Проверь политики доступа RLS для таблиц movies и user_movies."
          : message.includes("network") || message.includes("fetch")
          ? "Не удалось связаться с сервером. Проверь интернет и попробуй ещё раз."
          : message.includes("duplicate key") || message.includes("already exists")
          ? "Эта запись уже существует. Обнови список фильмов и попробуй снова."
          : "Не удалось сохранить фильм. Проверь подключение к базе и попробуй ещё раз."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/75 p-4 backdrop-blur-md"
        onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 25, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#111622] shadow-[0_30px_120px_rgba(0,0,0,.7)]"
        >
          <div className="flex items-center justify-between border-b border-white/[.07] px-6 py-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[.25em] text-[#aab5ff]/70">
                Личный киноархив
              </p>
              <h2 className="mt-1 text-2xl font-semibold tracking-[-.04em]">
                Добавить фильм
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              aria-label="Закрыть"
              className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/[.03] text-white/40 hover:text-white disabled:opacity-40"
            >
              <X size={18} />
            </button>
          </div>

          <div className="overflow-y-auto p-6">
            {!selected ? (
              <>
                <div className="relative">
                  <Search
                    size={18}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/25"
                  />
                  <input
                    autoFocus
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Название фильма..."
                    className="h-14 w-full rounded-xl border border-white/10 bg-white/[.035] pl-12 pr-12 text-base text-white outline-none placeholder:text-white/20 focus:border-[#aab5ff]/35"
                  />
                  {searching && (
                    <LoaderCircle
                      size={18}
                      className="absolute right-4 top-1/2 -translate-y-1/2 animate-spin text-[#aab5ff]"
                    />
                  )}
                </div>

                {error && <p className="mt-4 text-sm text-red-300/80">{error}</p>}

                <div className="mt-5 space-y-2">
                  {results.map((movie) => (
                    <button
                      key={movie.id}
                      type="button"
                      onClick={() => chooseMovie(movie)}
                      disabled={loadingDetails}
                      className="group flex w-full cursor-pointer items-center gap-4 rounded-xl border border-transparent p-3 text-left hover:border-white/[.08] hover:bg-white/[.035] disabled:opacity-50"
                    >
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">
                        {movie.poster_path ? (
                          <img
                            src={getPoster(movie.poster_path, "w185")}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-white/15">
                            <Film size={17} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-base font-medium text-white">
                          {movie.title || movie.original_title}
                        </h3>
                        <div className="mt-2 flex gap-3 text-xs text-white/25">
                          <span>{movie.release_date?.slice(0, 4) || "—"}</span>
                          {movie.vote_average > 0 && (
                            <span className="inline-flex items-center gap-1 text-[#aab5ff]/70">
                              <Star size={11} fill="currentColor" />
                              {Number(movie.vote_average).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {!searching && query.trim() && results.length === 0 && !error && (
                  <p className="py-8 text-center text-sm text-white/30">
                    Ничего не найдено.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex gap-5">
                  <div className="h-44 w-28 shrink-0 overflow-hidden rounded-xl bg-white/5">
                    {selected.poster_path ? (
                      <img
                        src={getPoster(selected.poster_path, "w342")}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-white/15">
                        <Film />
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-2xl font-semibold tracking-[-.04em]">
                          {selected.title || selected.original_title}
                        </h3>
                        {selected.original_title && selected.original_title !== selected.title && (
                          <p className="mt-1 text-xs text-white/25">{selected.original_title}</p>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => {
                          setSelected(null);
                          setQuery("");
                          setError("");
                        }}
                        className="cursor-pointer text-xs uppercase tracking-[.12em] text-white/25 hover:text-[#aab5ff] disabled:opacity-40"
                      >
                        Изменить
                      </button>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/35">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays size={13} />
                        {selected.release_date?.slice(0, 4) || "—"}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock3 size={13} />
                        {formatRuntime(selected.runtime)}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-[#aab5ff]/70">
                        <Star size={13} fill="currentColor" />
                        {Number(selected.vote_average || 0).toFixed(1)}
                      </span>
                    </div>
                    {getDirector(selected) && (
                      <p className="mt-3 text-xs text-white/30">
                        Режиссёр: <span className="text-white/55">{getDirector(selected)}</span>
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-8">
                  <p className="mb-3 text-[10px] font-semibold uppercase tracking-[.2em] text-white/30">
                    Статус
                  </p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {[
                      ["watched", "Просмотрен", "Я уже смотрел этот фильм"],
                      ["watchlist", "В планах", "Хочу посмотреть позже"],
                    ].map(([key, label, description]) => (
                      <button
                        key={key}
                        type="button"
                        disabled={saving}
                        onClick={() => setStatus(key)}
                        className={`cursor-pointer rounded-xl border p-4 text-left disabled:opacity-50 ${
                          status === key
                            ? "border-[#aab5ff]/35 bg-[#aab5ff]/[.07]"
                            : "border-white/[.07] bg-white/[.02]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-sm font-semibold ${status === key ? "text-[#aab5ff]" : "text-white/70"}`}>
                            {label}
                          </span>
                          {status === key && (
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#aab5ff] text-black">
                              <Check size={14} />
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-white/25">{description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {status === "watched" && (
                  <div className="mt-8 rounded-2xl border border-[#aab5ff]/15 bg-[#aab5ff]/[.025] p-5">
                    <div className="flex items-end justify-between">
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[.2em] text-[#aab5ff]/70">
                          Твоя оценка
                        </p>
                        <p className="mt-1 text-sm text-white/35">{ratingLabel}</p>
                      </div>
                      <div className="flex items-center gap-2 text-[#aab5ff]">
                        <Star size={20} fill="currentColor" />
                        <span className="text-3xl font-semibold">{rating.toFixed(1)}</span>
                        <span className="text-sm text-white/25">/ 10</span>
                      </div>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="10"
                      step="0.1"
                      value={rating}
                      disabled={saving}
                      onChange={(event) => setRating(Number(event.target.value))}
                      className="rating-slider mt-7 h-2 w-full cursor-pointer appearance-none rounded-full disabled:opacity-50"
                      style={{
                        background: `linear-gradient(to right,#aab5ff ${rating * 10}%,rgba(255,255,255,.08) ${rating * 10}%)`,
                      }}
                    />
                    <div className="mt-3 flex justify-between text-[10px] font-semibold uppercase tracking-[.1em] text-white/20">
                      <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
                    </div>
                  </div>
                )}

                {error && <p className="mt-4 break-words text-xs leading-5 text-red-300/80">{error}</p>}

                <button
                  type="button"
                  onClick={addSelected}
                  disabled={loadingDetails || saving}
                  className="mt-8 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#aab5ff] py-4 text-sm font-bold uppercase tracking-[.12em] text-black hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Check size={17} />
                  )}
                  {saving ? "Сохраняем..." : "Добавить в CineLog"}
                </button>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
