import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookmarkPlus,
  Check,
  Clapperboard,
  Heart,
  LoaderCircle,
  RefreshCw,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

import { discoverMovies, getBackdrop, getMovie, getMovieRecommendations, getPoster } from "../src/tmdb";
import { supabase } from "../supabase";

const GENRE_NAMES = {
  28: "Боевик",
  12: "Приключения",
  16: "Мультфильм",
  35: "Комедия",
  80: "Криминал",
  99: "Документальный",
  18: "Драма",
  10751: "Семейный",
  14: "Фэнтези",
  36: "История",
  27: "Ужасы",
  10402: "Музыка",
  9648: "Детектив",
  10749: "Мелодрама",
  878: "Фантастика",
  10770: "Телефильм",
  53: "Триллер",
  10752: "Военный",
  37: "Вестерн",
};

function numberRating(value) {
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function genreIds(movie) {
  const fromIds = Array.isArray(movie?.genre_ids) ? movie.genre_ids : [];
  const fromGenres = Array.isArray(movie?.genres)
    ? movie.genres.map((genre) => (typeof genre === "number" ? genre : genre?.id))
    : [];
  return [...new Set([...fromIds, ...fromGenres].map(Number).filter(Number.isFinite))];
}

function getPreferences(list = []) {
  const totals = new Map();
  const counts = new Map();

  for (const movie of list) {
    if (movie.status !== "watched") continue;
    const rating = numberRating(movie.youRating ?? movie.personalRating ?? movie.rating);
    if (rating === null || rating <= 0) continue;

    const ids = genreIds(movie);
    if (!ids.length) continue;

    // Более высокая личная оценка сильнее влияет на профиль жанров.
    const weight = Math.max(0.2, (rating - 4) / 6);
    for (const id of ids) {
      totals.set(id, (totals.get(id) || 0) + weight);
      counts.set(id, (counts.get(id) || 0) + 1);
    }
  }

  const max = Math.max(0, ...totals.values());
  const scores = new Map();
  for (const [id, value] of totals) {
    const average = value / Math.max(1, counts.get(id) || 1);
    scores.set(id, max ? Math.min(1, (value / max) * 0.7 + (average / 1.5) * 0.3) : 0);
  }

  return scores;
}

function topGenreIds(preferences, limit = 4) {
  return [...preferences.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

function genreAffinity(ids, preferences) {
  if (!preferences.size) return 0.42;
  if (!ids.length) return 0.2;

  const values = ids.map((id) => preferences.get(id) || 0.08);
  const best = Math.max(...values);
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return best * 0.65 + average * 0.35;
}

function directorOf(movie) {
  return movie?.credits?.crew?.find((person) => person.job === "Director")?.name || "";
}

function normalizePartnerMovie(item) {
  const film = item.movies || {};
  return {
    id: item.tmdb_id,
    status: item.status,
    rating: item.rating,
    title: film.title || film.original_title || "Без названия",
    genres: film.genres || [],
    vote_average: film.vote_average ?? 0,
  };
}

function localizeError(error) {
  const message = String(error?.message || "").toLowerCase();
  if (message.includes("row-level security")) {
    return "Supabase запретил доступ к данным. Проверь политики RLS.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Не удалось подключиться к серверу. Проверь интернет.";
  }
  if (message.includes("tmdb")) {
    return "Не удалось загрузить рекомендации из TMDB. Проверь подключение и токен.";
  }
  return error?.message || "Не удалось выполнить действие. Попробуй ещё раз.";
}

export default function Recommendations({ movies = [], onAddMovie }) {
  const [mode, setMode] = useState("me");
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [partnerMovies, setPartnerMovies] = useState([]);
  const [partnerLoadedFor, setPartnerLoadedFor] = useState("");
  const [profileLoading, setProfileLoading] = useState(true);
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [savingId, setSavingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const ownIds = useMemo(() => new Set(movies.map((movie) => String(movie.id))), [movies]);
  const acceptedConnections = useMemo(
    () => connections.filter((connection) => connection.status === "accepted"),
    [connections]
  );

  useEffect(() => {
    let active = true;

    async function loadConnections() {
      setProfileLoading(true);
      setError("");
      try {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
        if (userError) throw userError;
        if (!user) throw new Error("Войди в аккаунт, чтобы пользоваться рекомендациями.");
        if (!active) return;
        setCurrentUser(user);

        const { data: rows, error: connectionsError } = await supabase
          .from("connections")
          .select("id, user_a, user_b, status, created_at")
          .order("created_at", { ascending: false });
        if (connectionsError) throw connectionsError;

        const partnerIds = [...new Set((rows || []).map((row) => row.user_a === user.id ? row.user_b : row.user_a))];
        let profiles = [];
        if (partnerIds.length) {
          const { data, error: profilesError } = await supabase
            .from("profiles")
            .select("id, display_name")
            .in("id", partnerIds);
          if (profilesError) throw profilesError;
          profiles = data || [];
        }

        const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
        const formatted = (rows || []).map((row) => {
          const partnerId = row.user_a === user.id ? row.user_b : row.user_a;
          return {
            ...row,
            partnerId,
            partnerName: profileMap.get(partnerId)?.display_name?.trim() || "Пользователь CineLog",
          };
        });

        if (!active) return;
        setConnections(formatted);
        const accepted = formatted.filter((row) => row.status === "accepted");
        setSelectedPartnerId((previous) =>
          accepted.some((row) => row.partnerId === previous)
            ? previous
            : accepted[0]?.partnerId || ""
        );
      } catch (loadError) {
        console.error("Recommendations profile loading error:", loadError);
        if (active) setError(localizeError(loadError));
      } finally {
        if (active) setProfileLoading(false);
      }
    }

    loadConnections();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    async function loadPartnerMovies() {
      if (!selectedPartnerId) {
        setPartnerMovies([]);
        setPartnerLoadedFor("");
        setPartnerLoading(false);
        return;
      }

      setPartnerLoading(true);
      setPartnerLoadedFor("");
      try {
        const { data, error: partnerError } = await supabase
          .from("user_movies")
          .select(`
            tmdb_id,
            status,
            rating,
            movies (
              tmdb_id,
              title,
              original_title,
              vote_average,
              genres
            )
          `)
          .eq("user_id", selectedPartnerId);

        if (partnerError) throw partnerError;
        if (active) {
          setPartnerMovies((data || []).map(normalizePartnerMovie));
          setPartnerLoadedFor(selectedPartnerId);
        }
      } catch (loadError) {
        console.error("Recommendations partner movie loading error:", loadError);
        if (active) {
          setPartnerMovies([]);
          setError(localizeError(loadError));
          setPartnerLoadedFor(selectedPartnerId);
        }
      } finally {
        if (active) setPartnerLoading(false);
      }
    }

    loadPartnerMovies();
    return () => {
      active = false;
    };
  }, [selectedPartnerId]);

  const generateRecommendations = useCallback(async () => {
    if (profileLoading) return;

    if (mode === "couple" && !selectedPartnerId) {
      setRecommendations([]);
      setError("");
      setGenerating(false);
      return;
    }

    if (mode === "couple" && (partnerLoading || partnerLoadedFor !== selectedPartnerId)) {
      return;
    }

    setGenerating(true);
    setError("");

    try {
      const watchedMine = movies.filter((movie) => movie.status === "watched");
      const watchedPartner = partnerMovies.filter((movie) => movie.status === "watched");
      const myPreferences = getPreferences(watchedMine);
      const partnerPreferences = getPreferences(watchedPartner);

      let seedIds = [];
      if (mode === "me") {
        seedIds = watchedMine
          .filter((movie) => numberRating(movie.youRating ?? movie.personalRating) !== null)
          .sort((a, b) => Number(b.youRating ?? b.personalRating) - Number(a.youRating ?? a.personalRating))
          .slice(0, 4)
          .map((movie) => movie.id);
      } else {
        const partnerById = new Map(watchedPartner.map((movie) => [String(movie.id), movie]));
        const sharedFavourites = watchedMine
          .map((movie) => {
            const partner = partnerById.get(String(movie.id));
            const myRating = numberRating(movie.youRating ?? movie.personalRating);
            const theirRating = numberRating(partner?.rating);
            if (!partner || myRating === null || theirRating === null) return null;
            return { id: movie.id, combined: (myRating + theirRating) / 2, floor: Math.min(myRating, theirRating) };
          })
          .filter(Boolean)
          .sort((a, b) => (b.floor * 0.7 + b.combined * 0.3) - (a.floor * 0.7 + a.combined * 0.3));

        seedIds = sharedFavourites.slice(0, 4).map((movie) => movie.id);
        if (!seedIds.length) {
          const mySeeds = watchedMine
            .filter((movie) => numberRating(movie.youRating ?? movie.personalRating) !== null)
            .sort((a, b) => Number(b.youRating ?? b.personalRating) - Number(a.youRating ?? a.personalRating))
            .slice(0, 2).map((movie) => movie.id);
          const theirSeeds = watchedPartner
            .filter((movie) => numberRating(movie.rating) !== null)
            .sort((a, b) => Number(b.rating) - Number(a.rating))
            .slice(0, 2).map((movie) => movie.id);
          seedIds = [...new Set([...mySeeds, ...theirSeeds])].slice(0, 4);
        }
      }

      const genreIdsForDiscover = mode === "me"
        ? topGenreIds(myPreferences, 4)
        : [...new Set([
            ...topGenreIds(myPreferences, 3),
            ...topGenreIds(partnerPreferences, 3),
          ])].slice(0, 6);

      const discoverParams = {
        sort_by: "popularity.desc",
        "vote_count.gte": 100,
        page: 1,
      };
      if (genreIdsForDiscover.length) {
        // TMDB's pipe separator means match any selected genre.
        discoverParams.with_genres = genreIdsForDiscover.join("|");
      }

      const tasks = [
        discoverMovies(discoverParams),
        discoverMovies({
          ...discoverParams,
          sort_by: "vote_average.desc",
          "vote_count.gte": 250,
          page: 2,
        }),
        ...seedIds.map((seedId) => getMovieRecommendations(seedId)),
      ];

      const results = await Promise.allSettled(tasks);
      const pool = new Map();
      for (const result of results) {
        if (result.status !== "fulfilled") continue;
        const list = Array.isArray(result.value) ? result.value : [];
        for (const item of list) {
          if (!item?.id || !item.title) continue;
          pool.set(String(item.id), item);
        }
      }

      const excludedIds = new Set([
        ...movies.map((movie) => String(movie.id)),
        ...partnerMovies.map((movie) => String(movie.id)),
      ]);

      const ranked = [...pool.values()]
        .filter((candidate) => !excludedIds.has(String(candidate.id)))
        .map((candidate) => {
          const ids = genreIds(candidate);
          const myMatch = genreAffinity(ids, myPreferences);
          const theirMatch = genreAffinity(ids, partnerPreferences);
          const genreMatch = mode === "me"
            ? myMatch
            : myPreferences.size && partnerPreferences.size
              ? Math.min(myMatch, theirMatch) * 0.65 + ((myMatch + theirMatch) / 2) * 0.35
              : (myMatch + theirMatch) / 2;
          const voteScore = Math.min(10, Math.max(0, Number(candidate.vote_average) || 0)) / 10;
          const popularityScore = Math.min(100, Math.max(0, Number(candidate.popularity) || 0)) / 100;
          const score = genreMatch * 0.62 + voteScore * 0.28 + popularityScore * 0.1;
          const matchedGenres = ids
            .filter((id) => mode === "me"
              ? myPreferences.has(id)
              : myPreferences.has(id) || partnerPreferences.has(id))
            .map((id) => GENRE_NAMES[id])
            .filter(Boolean)
            .slice(0, 3);
          const reason = mode === "couple"
            ? myPreferences.size && partnerPreferences.size
              ? "Подборка учитывает вкусы обоих"
              : "Популярный вариант для совместного просмотра"
            : myPreferences.size
              ? "Похоже на жанры, которые ты высоко оценивал"
              : "Популярный фильм с хорошими оценками зрителей";

          return {
            ...candidate,
            personalScore: score,
            matchedGenres,
            reason,
            releaseYear: candidate.release_date?.slice(0, 4) || "Год неизвестен",
          };
        })
        .sort((a, b) => b.personalScore - a.personalScore)
        .slice(0, 18);

      if (!ranked.length) {
        // If genre filtering is too restrictive, make one broad fallback request.
        const fallback = await discoverMovies({
          sort_by: "popularity.desc",
          "vote_count.gte": 80,
          page: 1,
        });
        const fallbackRanked = fallback
          .filter((candidate) => candidate?.id && candidate.title && !excludedIds.has(String(candidate.id)))
          .map((candidate) => ({
            ...candidate,
            personalScore: (Number(candidate.vote_average) || 0) / 10,
            matchedGenres: genreIds(candidate).map((id) => GENRE_NAMES[id]).filter(Boolean).slice(0, 3),
            reason: "Популярный фильм, которого пока нет в ваших списках",
            releaseYear: candidate.release_date?.slice(0, 4) || "Год неизвестен",
          }))
          .slice(0, 18);
        setRecommendations(fallbackRanked);
      } else {
        setRecommendations(ranked);
      }
    } catch (loadError) {
      console.error("Recommendation generation error:", loadError);
      setError(localizeError(loadError));
      setRecommendations([]);
    } finally {
      setGenerating(false);
    }
  }, [mode, movies, partnerMovies, selectedPartnerId, profileLoading, partnerLoading, partnerLoadedFor]);

  useEffect(() => {
    if (profileLoading) return;
    if (mode === "couple" && selectedPartnerId && (partnerLoading || partnerLoadedFor !== selectedPartnerId)) return;
    generateRecommendations();
  }, [generateRecommendations, profileLoading, mode, selectedPartnerId, partnerLoading, partnerLoadedFor, refreshKey]);

  async function addToWatchlist(candidate) {
    if (!currentUser || !candidate?.id) return;

    setSavingId(candidate.id);
    setError("");
    setNotice("");

    try {
      const details = await getMovie(candidate.id);
      const movieData = {
        tmdb_id: details.id,
        title: details.title || details.original_title || "Без названия",
        original_title: details.original_title || "",
        release_date: details.release_date || null,
        poster_path: details.poster_path || null,
        backdrop_path: details.backdrop_path || null,
        overview: details.overview || "",
        runtime: Number(details.runtime) || null,
        vote_average: Number(details.vote_average) || 0,
        genres: details.genres || [],
        director: directorOf(details),
      };

      // `movies` is a shared table and existing rows may belong to another account.
      // Check first instead of upserting, which would require UPDATE permission on that table.
      const { data: existingMovie, error: lookupMovieError } = await supabase
        .from("movies")
        .select("tmdb_id")
        .eq("tmdb_id", details.id)
        .maybeSingle();
      if (lookupMovieError) throw lookupMovieError;

      if (!existingMovie) {
        const { error: insertMovieError } = await supabase
          .from("movies")
          .insert(movieData);

        // Another account can insert the same TMDB movie at the same time.
        // A unique-key conflict means the shared metadata now exists, so continue.
        if (insertMovieError && insertMovieError.code !== "23505") {
          throw insertMovieError;
        }
      }

      const { error: userMovieError } = await supabase
        .from("user_movies")
        .upsert({
          user_id: currentUser.id,
          tmdb_id: details.id,
          status: "watchlist",
          rating: null,
        }, { onConflict: "user_id,tmdb_id" });
      if (userMovieError) throw userMovieError;

      const saved = {
        id: details.id,
        title: details.title || details.original_title || "Без названия",
        originalTitle: details.original_title || "",
        release_date: details.release_date || "",
        releaseDate: details.release_date || "",
        year: details.release_date?.slice(0, 4) || "—",
        poster_path: details.poster_path || null,
        backdrop_path: details.backdrop_path || null,
        poster: getPoster(details.poster_path, "w500"),
        backdrop: getBackdrop(details.backdrop_path, "original"),
        overview: details.overview || "",
        vote_average: Number(details.vote_average) || 0,
        voteAverage: Number(details.vote_average) || 0,
        genres: details.genres || [],
        genre: (details.genres || []).map((genre) => genre.name).filter(Boolean).join(", "),
        runtime: Number(details.runtime) || null,
        director: directorOf(details),
        status: "watchlist",
        personalRating: null,
        youRating: null,
        addedAt: new Date().toISOString(),
      };

      onAddMovie?.(saved);
      setNotice(`«${saved.title}» добавлен в список «К просмотру».`);
      setRecommendations((current) => current.filter((movie) => String(movie.id) !== String(candidate.id)));
    } catch (saveError) {
      console.error("Add recommendation to watchlist error:", saveError);
      setError(localizeError(saveError));
    } finally {
      setSavingId(null);
    }
  }

  const featuredGenres = useMemo(() => {
    const profile = mode === "me"
      ? getPreferences(movies)
      : new Map([
          ...getPreferences(movies).entries(),
          ...getPreferences(partnerMovies).entries(),
        ]);
    return topGenreIds(profile, 5).map((id) => GENRE_NAMES[id]).filter(Boolean);
  }, [mode, movies, partnerMovies]);

  return (
    <div className="cine-page pb-24">
      <section className="border-b border-white/[.13] py-14 md:py-16">
        <div className="flex flex-col gap-8 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <p className="cine-kicker cine-accent">ЛИЧНЫЙ КИНОАРХИВ / ПОДБОРКИ</p>
            <h1 className="cine-page-title mt-4">Что посмотреть?</h1>
            <p className="cine-page-subtitle mt-4 max-w-2xl">
              Персональная подборка на основе твоих оценок и жанров. Или найди фильм, который может понравиться вам обоим.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setRefreshKey((value) => value + 1)}
            disabled={generating || profileLoading || partnerLoading}
            className="cine-button cine-button--solid shrink-0"
          >
            {generating ? <LoaderCircle size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            Обновить подборку
          </button>
        </div>
      </section>

      <section className="border-b border-[var(--line)] py-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setMode("me")}
              className={`flex items-center gap-2 border px-4 py-3 cine-mono text-[9px] uppercase tracking-[.13em] transition-colors ${mode === "me" ? "border-[var(--acid)] bg-[var(--acid)] text-black" : "border-[var(--line)] text-white/45 hover:text-white"}`}
            >
              <Heart size={14} />
              Для меня
            </button>
            <button
              type="button"
              onClick={() => setMode("couple")}
              className={`flex items-center gap-2 border px-4 py-3 cine-mono text-[9px] uppercase tracking-[.13em] transition-colors ${mode === "couple" ? "border-[var(--acid)] bg-[var(--acid)] text-black" : "border-[var(--line)] text-white/45 hover:text-white"}`}
            >
              <Users size={14} />
              Для нас двоих
            </button>
          </div>

          {mode === "couple" && acceptedConnections.length > 0 && (
            <label className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <span className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/35">С кем выбираем</span>
              <select
                value={selectedPartnerId}
                onChange={(event) => setSelectedPartnerId(event.target.value)}
                className="min-w-[220px] border border-[var(--line)] bg-[#101310] px-4 py-3 text-sm text-[var(--paper)] outline-none focus:border-[var(--acid)]"
              >
                {acceptedConnections.map((connection) => (
                  <option key={connection.partnerId} value={connection.partnerId}>
                    {connection.partnerName}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>

        {mode === "couple" && acceptedConnections.length === 0 && !profileLoading && (
          <div className="mt-6 flex flex-col gap-4 border border-[var(--line)] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-[var(--paper)]">Сначала подключи второй аккаунт</p>
              <p className="mt-1 text-xs leading-5 text-white/35">Для совместных рекомендаций нужны оценки обоих пользователей.</p>
            </div>
            <Link to="/together" className="cine-button cine-button--solid shrink-0">
              Открыть «Вместе» <ArrowRight size={14} />
            </Link>
          </div>
        )}

        {featuredGenres.length > 0 && (
          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className="mr-1 cine-mono text-[8px] uppercase tracking-[.15em] text-white/25">Учитываем жанры</span>
            {featuredGenres.map((genre) => (
              <span key={genre} className="border border-[var(--line)] px-2.5 py-1.5 text-[10px] text-white/55">{genre}</span>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="mt-6 border border-red-300/20 bg-red-300/[.04] px-4 py-3 text-sm text-red-200/80">
          {error}
        </div>
      )}
      {notice && (
        <div className="mt-6 flex items-center gap-2 border border-[var(--acid)]/25 bg-[var(--acid)]/[.04] px-4 py-3 text-sm text-[var(--acid)]">
          <Check size={15} /> {notice}
        </div>
      )}

      <section className="pt-10">
        <div className="mb-8 flex items-end justify-between gap-6 border-b border-white/[.13] pb-5">
          <div>
            <p className="cine-kicker cine-accent">ПОДОБРАНО ДЛЯ ТЕБЯ</p>
            <h2 className="cine-serif mt-3 text-4xl tracking-[-.035em] text-[var(--paper)] md:text-5xl">
              {mode === "couple" ? "Ваш следующий фильм" : "Попробуй посмотреть"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/35">
              {mode === "couple"
                ? "Учитываем жанры, которые нравятся обоим, общие любимые фильмы и оценки зрителей. Фильмы, уже добавленные в любой из ваших списков, скрыты."
                : "Учитываем жанры и фильмы, которые ты оценивал высоко. То, что уже есть в твоём архиве или списке просмотра, не показываем."}
            </p>
          </div>
          <span className="hidden shrink-0 cine-mono text-[9px] uppercase tracking-[.14em] text-white/25 sm:block">
            {recommendations.length} фильмов
          </span>
        </div>

        {generating || profileLoading || (mode === "couple" && partnerLoading) ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="aspect-[2/3] bg-white/[.05]" />
                <div className="mt-4 h-4 w-3/4 bg-white/[.05]" />
                <div className="mt-3 h-3 w-1/2 bg-white/[.04]" />
              </div>
            ))}
          </div>
        ) : mode === "couple" && acceptedConnections.length === 0 ? (
          <div className="cine-empty min-h-[220px]">
            <div className="cine-empty__inner">
              <Users size={28} className="mx-auto text-[var(--acid)]" />
              <h3 className="cine-empty__title">Пока выбираем для одного</h3>
              <p className="cine-empty__text">Подключи второго пользователя в разделе «Вместе», чтобы собирать общие рекомендации.</p>
            </div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="cine-empty min-h-[220px]">
            <div className="cine-empty__inner">
              <Sparkles size={28} className="mx-auto text-[var(--acid)]" />
              <h3 className="cine-empty__title">Пока нет рекомендаций</h3>
              <p className="cine-empty__text">Попробуй обновить подборку. Если это повторяется, проверь подключение к TMDB.</p>
              <button type="button" onClick={() => setRefreshKey((value) => value + 1)} className="cine-button cine-button--solid mt-5">
                <RefreshCw size={14} /> Повторить
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {recommendations.map((movie, index) => {
              const poster = getPoster(movie.poster_path, "w500");
              const rating = Number(movie.vote_average) || 0;
              return (
                <motion.article
                  key={movie.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.025, 0.25) }}
                  className="group min-w-0"
                >
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#101310]">
                    {poster ? (
                      <img
                        src={poster}
                        alt={movie.title}
                        loading={index > 5 ? "lazy" : "eager"}
                        className="h-full w-full object-cover opacity-[.9] transition duration-500 group-hover:scale-[1.025] group-hover:opacity-100"
                        onError={(event) => { event.currentTarget.style.display = "none"; }}
                      />
                    ) : (
                      <div className="grid h-full place-items-center text-white/20"><Clapperboard size={22} /></div>
                    )}
                    <span className="absolute left-2.5 top-2.5 bg-[#080908]/80 px-2 py-1 cine-mono text-[8px] text-white/55">
                      {movie.releaseYear}
                    </span>
                    {rating > 0 && (
                      <span className="absolute bottom-2.5 left-2.5 flex items-center gap-1 bg-[#080908]/80 px-2 py-1 cine-mono text-[9px] text-[var(--acid)]">
                        <Star size={10} fill="currentColor" /> {rating.toFixed(1)} TMDB
                      </span>
                    )}
                  </div>

                  <div className="pt-4">
                    <h3 className="cine-serif line-clamp-2 text-[20px] leading-[1.04] tracking-[-.025em] text-[var(--paper)]">
                      {movie.title || "Без названия"}
                    </h3>
                    {movie.matchedGenres?.length > 0 && (
                      <p className="mt-2 line-clamp-1 text-[10px] text-white/30">
                        {movie.matchedGenres.join(" · ")}
                      </p>
                    )}
                    <p className="mt-3 min-h-[32px] text-[10px] leading-4 text-white/35">
                      {movie.reason}
                    </p>
                    <button
                      type="button"
                      onClick={() => addToWatchlist(movie)}
                      disabled={savingId === movie.id || ownIds.has(String(movie.id))}
                      className="mt-4 flex min-h-[38px] w-full items-center justify-center gap-2 border border-[var(--line)] px-2 py-2 cine-mono text-[8px] uppercase tracking-[.1em] text-white/55 transition-colors hover:border-[var(--acid)] hover:text-[var(--acid)] disabled:cursor-not-allowed disabled:opacity-45"
                    >
                      {savingId === movie.id ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : ownIds.has(String(movie.id)) ? (
                        <Check size={13} />
                      ) : (
                        <BookmarkPlus size={13} />
                      )}
                      {savingId === movie.id ? "Сохраняем..." : "В список просмотра"}
                    </button>
                  </div>
                </motion.article>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-20 border-t border-[var(--line)] pt-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-2xl text-xs leading-5 text-white/25">
            Рекомендации основаны на жанрах, личных оценках, популярности и оценках зрителей TMDB. Это подсказки, а не гарантия того, что фильм понравится.
          </p>
          <Link to={mode === "couple" ? "/together" : "/films"} className="cine-mono text-[9px] uppercase tracking-[.13em] text-white/35 transition-colors hover:text-[var(--acid)]">
            {mode === "couple" ? "Перейти в «Вместе»" : "Открыть весь архив"} <ArrowRight size={12} className="ml-1 inline" />
          </Link>
        </div>
      </section>
    </div>
  );
}
