import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  Clock3,
  Link2,
  LoaderCircle,
  Mail,
  RefreshCw,
  Send,
  Star,
  Users,
  X,
} from "lucide-react";
import { getPoster } from "../src/tmdb";
import { supabase } from "../supabase";

function displayRating(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(1) : "—";
}

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function localizeTogetherError(error, fallback) {
  const message = String(error?.message || "").toLowerCase();

  if (message.includes("row-level security")) {
    return "База данных запретила операцию. Проверь политики доступа RLS в Supabase.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Не удалось связаться с сервером. Проверь интернет и попробуй ещё раз.";
  }
  if (message.includes("already pending") || message.includes("duplicate")) {
    return "Приглашение этому пользователю уже отправлено.";
  }
  if (message.includes("cannot invite yourself") || message.includes("same user")) {
    return "Нельзя отправить приглашение самому себе.";
  }

  return fallback;
}

export default function Together({ movies = [] }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [connections, setConnections] = useState([]);
  const [partnerMovies, setPartnerMovies] = useState([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState("");
  const [partnerRefreshKey, setPartnerRefreshKey] = useState(0);
  const [sortMode, setSortMode] = useState("most-different");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [connectionAction, setConnectionAction] = useState("");
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadConnections = useCallback(async (showLoader = true) => {
    if (showLoader) setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Войди в аккаунт, чтобы пользоваться разделом «Вместе».");

      setCurrentUser(user);

      const { data: rows, error: connectionsError } = await supabase
        .from("connections")
        .select("id, user_a, user_b, status, created_at")
        .order("created_at", { ascending: false });

      if (connectionsError) throw connectionsError;

      const partnerIds = [...new Set(
        (rows || []).map((row) =>
          row.user_a === user.id ? row.user_b : row.user_a
        )
      )];

      let profiles = [];

      if (partnerIds.length) {
        const { data, error: profilesError } = await supabase
          .from("profiles")
          .select("id, display_name")
          .in("id", partnerIds);

        if (profilesError) throw profilesError;
        profiles = data || [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      const formattedConnections = (rows || []).map((row) => {
        const partnerId = row.user_a === user.id ? row.user_b : row.user_a;
        const profile = profileMap.get(partnerId);
        const isIncoming = row.status === "pending" && row.user_b === user.id;
        const isOutgoing = row.status === "pending" && row.user_a === user.id;

        return {
          ...row,
          partnerId,
          partnerName: profile?.display_name?.trim() || "Пользователь CineLog",
          isIncoming,
          isOutgoing,
        };
      });

      setConnections(formattedConnections);
    } catch (loadError) {
      console.error("Together connection loading error:", loadError);
      setError(localizeTogetherError(loadError, "Не удалось загрузить подключения. Проверь настройки доступа в Supabase."));
    } finally {
      if (showLoader) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConnections();
  }, [loadConnections]);

  const acceptedConnections = useMemo(
    () => connections.filter((connection) => connection.status === "accepted"),
    [connections]
  );

  useEffect(() => {
    const selectedStillExists = acceptedConnections.some(
      (connection) => connection.partnerId === selectedPartnerId
    );

    if (!selectedStillExists) {
      setSelectedPartnerId(acceptedConnections[0]?.partnerId || "");
    }
  }, [acceptedConnections, selectedPartnerId]);

  useEffect(() => {
    let active = true;

    async function loadPartnerMovies() {
      if (!selectedPartnerId) {
        setPartnerMovies([]);
        setPartnerLoading(false);
        return;
      }

      setPartnerLoading(true);

      try {
        const { data, error: moviesError } = await supabase
          .from("user_movies")
          .select(`
            tmdb_id,
            status,
            rating,
            added_at,
            movies (
              tmdb_id,
              title,
              original_title,
              release_date,
              poster_path,
              vote_average,
              genres
            )
          `)
          .eq("user_id", selectedPartnerId)
          .eq("status", "watched")
          .order("added_at", { ascending: false });

        if (moviesError) throw moviesError;

        if (active) {
          setPartnerMovies((data || []).map((item) => ({
            id: item.tmdb_id,
            status: item.status,
            rating: item.rating,
            addedAt: item.added_at,
            title: item.movies?.title || item.movies?.original_title || "Без названия",
            originalTitle: item.movies?.original_title || "",
            releaseDate: item.movies?.release_date || "",
            posterPath: item.movies?.poster_path || null,
            voteAverage: item.movies?.vote_average ?? 0,
            genres: item.movies?.genres || [],
          })));
        }
      } catch (loadError) {
        console.error("Together partner movies error:", loadError);

        if (active) {
          setPartnerMovies([]);
          setError(
            localizeTogetherError(
              loadError,
              "Не удалось загрузить фильмы партнёра. Проверь политики RLS в Supabase."
            )
          );
        }
      } finally {
        if (active) setPartnerLoading(false);
      }
    }

    loadPartnerMovies();

    return () => {
      active = false;
    };
  }, [selectedPartnerId, partnerRefreshKey]);

  const comparison = useMemo(() => {
    const myWatched = movies.filter((movie) => movie.status === "watched");
    const myMap = new Map(
      myWatched.map((movie) => [String(movie.id), movie])
    );

    const common = partnerMovies
      .map((partnerMovie) => {
        const myMovie = myMap.get(String(partnerMovie.id));
        if (!myMovie) return null;

        const myRatingValue = myMovie.youRating ?? myMovie.personalRating ?? null;
        const partnerRatingValue = partnerMovie.rating ?? null;
        const myRating = myRatingValue == null ? null : Number(myRatingValue);
        const partnerRating = partnerRatingValue == null ? null : Number(partnerRatingValue);
        const bothRated =
          myRating !== null &&
          partnerRating !== null &&
          Number.isFinite(myRating) &&
          Number.isFinite(partnerRating);

        return {
          ...partnerMovie,
          myMovie,
          myRating,
          partnerRating,
          bothRated,
          difference: bothRated ? myRating - partnerRating : null,
        };
      })
      .filter(Boolean);

    const ratedCommon = common.filter((movie) => movie.bothRated);
    const averageGap = ratedCommon.length
      ? ratedCommon.reduce(
          (total, movie) => total + Math.abs(movie.difference),
          0
        ) / ratedCommon.length
      : null;

    const higherRatedByMe = ratedCommon.filter((movie) => movie.difference > 0).length;
    const higherRatedByPartner = ratedCommon.filter((movie) => movie.difference < 0).length;
    const equalRated = ratedCommon.filter((movie) => movie.difference === 0).length;
    const alignedCount = ratedCommon.filter(
      (movie) => Math.abs(movie.difference) <= 1
    ).length;
    const tasteMatch = ratedCommon.length
      ? Math.round((alignedCount / ratedCommon.length) * 100)
      : null;
    const biggestDifference = ratedCommon.reduce((largest, movie) => {
      if (!largest || Math.abs(movie.difference) > Math.abs(largest.difference)) {
        return movie;
      }
      return largest;
    }, null);

    return {
      common,
      ratedCount: ratedCommon.length,
      averageGap,
      higherRatedByMe,
      higherRatedByPartner,
      equalRated,
      tasteMatch,
      biggestDifference,
    };
  }, [movies, partnerMovies]);

  const selectedPartner = acceptedConnections.find(
    (connection) => connection.partnerId === selectedPartnerId
  );

  const sortedCommon = useMemo(() => {
    const result = [...comparison.common];

    result.sort((a, b) => {
      if (sortMode === "title") {
        return a.title.localeCompare(b.title);
      }

      if (a.bothRated !== b.bothRated) {
        return a.bothRated ? -1 : 1;
      }

      if (!a.bothRated || !b.bothRated) {
        return a.title.localeCompare(b.title);
      }

      const aGap = Math.abs(a.difference);
      const bGap = Math.abs(b.difference);

      return sortMode === "closest"
        ? aGap - bGap
        : bGap - aGap;
    });

    return result;
  }, [comparison.common, sortMode]);

  const sharedGenreStats = useMemo(() => {
    const genres = new Map();

    comparison.common.forEach((movie) => {
      const names = Array.isArray(movie.genres)
        ? movie.genres
            .map((genre) =>
              typeof genre === "string" ? genre : genre?.name
            )
            .filter(Boolean)
        : [];

      [...new Set(names)].forEach((name) => {
        const current = genres.get(name) || {
          name,
          films: 0,
          ratedFilms: 0,
          totalGap: 0,
        };

        current.films += 1;

        if (movie.bothRated) {
          current.ratedFilms += 1;
          current.totalGap += Math.abs(movie.difference);
        }

        genres.set(name, current);
      });
    });

    return [...genres.values()]
      .map((genre) => ({
        ...genre,
        averageGap: genre.ratedFilms
          ? genre.totalGap / genre.ratedFilms
          : null,
      }))
      .sort((a, b) =>
        b.films - a.films ||
        (a.averageGap ?? Infinity) - (b.averageGap ?? Infinity) ||
        a.name.localeCompare(b.name)
      )
      .slice(0, 5);
  }, [comparison.common]);

  async function refreshAll() {
    await loadConnections();
    setPartnerRefreshKey((value) => value + 1);
  }

  async function sendRequest(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) return;

    setSending(true);
    setError("");
    setNotice("");

    try {
      const { error: requestError } = await supabase.rpc(
        "send_connection_request",
        { target_email: normalizedEmail }
      );

      if (requestError) throw requestError;

      setEmail("");
      setNotice("Приглашение отправлено. Второму пользователю нужно принять запрос.");
      await loadConnections(false);
    } catch (requestError) {
      console.error("Send connection request error:", requestError);
      setError(
        localizeTogetherError(
          requestError,
          "Не удалось отправить приглашение. Проверь адрес аккаунта и SQL-функции Supabase."
        )
      );
    } finally {
      setSending(false);
    }
  }

  async function respondToRequest(connectionId, accept) {
    setConnectionAction(connectionId);
    setError("");
    setNotice("");

    try {
      const { error: responseError } = await supabase.rpc(
        "respond_to_connection_request",
        {
          request_id: connectionId,
          accept_request: accept,
        }
      );

      if (responseError) throw responseError;

      setNotice(
        accept
          ? "Подключение подтверждено. Теперь можно сравнивать просмотренные фильмы."
          : "Запрос отклонён."
      );

      await loadConnections(false);
    } catch (responseError) {
      console.error("Respond to connection request error:", responseError);
      setError(
        localizeTogetherError(responseError, "Не удалось обработать приглашение. Попробуй ещё раз.")
      );
    } finally {
      setConnectionAction("");
    }
  }

  const incomingRequests = connections.filter(
    (connection) => connection.isIncoming && connection.status === "pending"
  );

  const outgoingRequests = connections.filter(
    (connection) => connection.isOutgoing && connection.status === "pending"
  );

  if (loading) {
    return (
      <div className="cine-empty my-20 min-h-[420px]">
        <div>
          <LoaderCircle className="mx-auto animate-spin text-[var(--acid)]" size={30} />
          <p className="mt-5 text-center cine-kicker">Загрузка раздела «Вместе»</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="pb-24"
    >
      <section className="border-b border-[var(--line)] py-12 md:py-16">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div>
            <p className="cine-mono text-[9px] uppercase tracking-[.18em] text-[var(--acid)]">
              CineLog / Общий киноархив
            </p>
            <h1 className="mt-5 max-w-[900px] font-serif text-[clamp(48px,8vw,104px)] leading-[.88] tracking-[-.055em] text-[var(--paper)]">
              Два взгляда.
              <br />
              <span className="text-white/35">Одно кино.</span>
            </h1>
            <p className="mt-6 max-w-[600px] text-sm leading-7 text-white/40">
              Подключи второй аккаунт, сравнивай оценки и находи фильмы,
              которые вы оба смотрели. Каждый ставит оценку только от своего имени.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAll}
            className="cine-button shrink-0 self-start md:self-auto"
          >
            <RefreshCw size={14} />
            Обновить
          </button>
        </div>
      </section>

      {(error || notice) && (
        <div className={`mt-6 border px-4 py-3 text-xs leading-6 ${error ? "border-red-300/20 text-red-200/80" : "border-[var(--acid)]/20 text-[var(--acid)]/80"}`}>
          {error || notice}
        </div>
      )}

      <section className="mt-12 grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(320px,.82fr)]">
        <div className="border border-[var(--line)] p-6 md:p-8">
          <p className="cine-mono text-[8px] uppercase tracking-[.17em] text-white/30">
            Подключение
          </p>
          <h2 className="mt-3 font-serif text-3xl tracking-[-.035em] text-[var(--paper)]">
            Пригласить человека
          </h2>
          <p className="mt-3 max-w-[480px] text-sm leading-6 text-white/35">
            Введи адрес электронной почты, с которым зарегистрирован второй аккаунт CineLog.
            Приглашение появится у него в разделе «Вместе».
          </p>

          <form onSubmit={sendRequest} className="mt-7">
            <label className="cine-mono mb-3 block text-[8px] uppercase tracking-[.15em] text-white/30" htmlFor="together-email">
              Почта аккаунта
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative min-w-0 flex-1">
                <Mail size={15} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/25" />
                <input
                  id="together-email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="почта@example.ru"
                  className="w-full border-b border-white/15 bg-transparent py-3 pl-7 pr-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[var(--acid)]"
                />
              </div>
              <button
                type="submit"
                disabled={sending}
                className="cine-button cine-button--solid shrink-0 disabled:opacity-40"
              >
                {sending ? <LoaderCircle size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? "Отправляем..." : "Отправить приглашение"}
              </button>
            </div>
          </form>

          <div className="mt-7 border-t border-[var(--line)] pt-5 text-xs leading-6 text-white/30">
            Подключение заработает после принятия приглашения. Адрес электронной почты используется только для поиска аккаунта и не показывается при сравнении фильмов.
          </div>
        </div>

        <div className="border border-[var(--line)] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="cine-mono text-[8px] uppercase tracking-[.17em] text-white/30">
                Запросы
              </p>
              <h2 className="mt-3 font-serif text-3xl tracking-[-.035em] text-[var(--paper)]">
                Подключения
              </h2>
            </div>
            <Users size={21} strokeWidth={1.3} className="text-[var(--acid)]" />
          </div>

          {incomingRequests.length > 0 && (
            <div className="mt-7">
              <p className="cine-mono mb-3 text-[8px] uppercase tracking-[.15em] text-[var(--acid)]">
                Входящие приглашения
              </p>
              <div className="space-y-3">
                {incomingRequests.map((connection) => (
                  <div key={connection.id} className="border border-[var(--line)] p-4">
                    <p className="text-sm text-[var(--paper)]">{connection.partnerName}</p>
                    <p className="mt-1 text-[11px] text-white/30">Отправлено {formatDate(connection.created_at)}</p>
                    <div className="mt-4 flex gap-2">
                      <button
                        type="button"
                        disabled={connectionAction === connection.id}
                        onClick={() => respondToRequest(connection.id, true)}
                        className="cine-button cine-button--solid disabled:opacity-40"
                      >
                        {connectionAction === connection.id ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
                        Принять
                      </button>
                      <button
                        type="button"
                        disabled={connectionAction === connection.id}
                        onClick={() => respondToRequest(connection.id, false)}
                        className="cine-button disabled:opacity-40"
                      >
                        <X size={13} />
                        Отклонить
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {outgoingRequests.length > 0 && (
            <div className="mt-7">
              <p className="cine-mono mb-3 text-[8px] uppercase tracking-[.15em] text-white/30">
                Ожидают ответа
              </p>
              <div className="space-y-3">
                {outgoingRequests.map((connection) => (
                  <div key={connection.id} className="flex items-center justify-between gap-4 border border-[var(--line)] p-4">
                    <div>
                      <p className="text-sm text-[var(--paper)]">{connection.partnerName}</p>
                      <p className="mt-1 text-[11px] text-white/30">Отправлено {formatDate(connection.created_at)}</p>
                    </div>
                    <span className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/25">Ожидает ответа</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {acceptedConnections.length > 0 && (
            <div className="mt-7">
              <p className="cine-mono mb-3 text-[8px] uppercase tracking-[.15em] text-[var(--acid)]">
                Подключённые аккаунты
              </p>
              <div className="space-y-2">
                {acceptedConnections.map((connection) => (
                  <button
                    key={connection.id}
                    type="button"
                    onClick={() => setSelectedPartnerId(connection.partnerId)}
                    className={`flex w-full items-center justify-between gap-4 border p-4 text-left transition-colors ${selectedPartnerId === connection.partnerId ? "border-[var(--acid)]/50 bg-[var(--acid)]/[.04]" : "border-[var(--line)] hover:border-white/25"}`}
                  >
                    <span>
                      <span className="block text-sm text-[var(--paper)]">{connection.partnerName}</span>
                      <span className="mt-1 block text-[11px] text-white/30">Подключено {formatDate(connection.created_at)}</span>
                    </span>
                    {selectedPartnerId === connection.partnerId ? <Check size={15} className="text-[var(--acid)]" /> : <Link2 size={15} className="text-white/25" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {connections.length === 0 && (
            <div className="mt-8 border-t border-[var(--line)] pt-6 text-sm leading-6 text-white/30">
              Пока нет запросов или подключённых аккаунтов. Отправь приглашение по электронной почте, чтобы начать.
            </div>
          )}
        </div>
      </section>

      <section className="mt-16 border-t border-[var(--line)] pt-8">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <p className="cine-mono text-[8px] uppercase tracking-[.18em] text-[var(--acid)]">
              Сравнение оценок
            </p>
            <h2 className="mt-3 font-serif text-4xl tracking-[-.04em] text-[var(--paper)] md:text-5xl">
              Что вас объединяет.
            </h2>
            <p className="mt-3 max-w-[600px] text-sm leading-6 text-white/35">
              Сравниваются только фильмы со статусом «Просмотрено» у обоих аккаунтов.
              Рейтинги остаются личными и не изменяют оценки друг друга.
            </p>
          </div>

          {acceptedConnections.length > 1 && (
            <label className="min-w-[220px]">
              <span className="cine-mono mb-2 block text-[8px] uppercase tracking-[.14em] text-white/30">
                Сравнить с
              </span>
              <select
                value={selectedPartnerId}
                onChange={(event) => setSelectedPartnerId(event.target.value)}
                className="w-full border border-[var(--line)] bg-[#101310] px-3 py-3 text-sm text-[var(--paper)] outline-none focus:border-[var(--acid)]"
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

        {!selectedPartnerId ? (
          <div className="mt-8 border-y border-[var(--line)] py-12 text-center">
            <Users size={24} strokeWidth={1.2} className="mx-auto text-white/20" />
            <p className="mt-4 cine-mono text-[9px] uppercase tracking-[.15em] text-white/30">
              Подключи аккаунт, чтобы сравнивать оценки
            </p>
          </div>
        ) : (
          <>
            <p className="mt-6 cine-mono text-[9px] uppercase tracking-[.12em] text-white/30">
              Ты и {selectedPartner?.partnerName || "партнёр"}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-3 xl:grid-cols-5">
              <div className="bg-[var(--bg)] p-5 md:p-7">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Общие фильмы</p>
                <p className="mt-4 font-serif text-4xl text-[var(--paper)]">{comparison.common.length}</p>
              </div>
              <div className="bg-[var(--bg)] p-5 md:p-7">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Оценили оба</p>
                <p className="mt-4 font-serif text-4xl text-[var(--paper)]">{comparison.ratedCount}</p>
              </div>
              <div className="bg-[var(--bg)] p-5 md:p-7">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Средняя разница оценок</p>
                <p className="mt-4 font-serif text-4xl text-[var(--paper)]">
                  {comparison.averageGap == null ? "—" : comparison.averageGap.toFixed(1)}
                </p>
              </div>
              <div className="bg-[var(--bg)] p-5 md:p-7">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Одинаковые оценки</p>
                <p className="mt-4 font-serif text-4xl text-[var(--paper)]">{comparison.equalRated}</p>
              </div>
              <div className="bg-[var(--bg)] p-5 md:p-7">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Совпадение вкусов</p>
                <p className="mt-4 font-serif text-4xl text-[var(--paper)]">
                  {comparison.tasteMatch == null ? "—" : `${comparison.tasteMatch}%`}
                </p>
                <p className="mt-2 text-[10px] leading-4 text-white/25">Разница оценок не больше 1 балла</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 cine-mono text-[8px] uppercase tracking-[.1em] text-white/30">
              <span className="inline-flex items-center gap-2">
                <ArrowUpRight size={12} className="text-[var(--acid)]" />
                Ты оценил выше: {comparison.higherRatedByMe}
              </span>
              <span className="inline-flex items-center gap-2">
                <ArrowDownRight size={12} className="text-white/45" />
                Партнёр оценил выше: {comparison.higherRatedByPartner}
              </span>
            </div>

            {!partnerLoading && comparison.common.length > 0 && (
              <div className="mt-8 grid gap-px border border-[var(--line)] bg-[var(--line)] md:grid-cols-2">
                <div className="bg-[var(--bg)] p-5 md:p-7">
                  <p className="cine-mono text-[8px] uppercase tracking-[.16em] text-[var(--acid)]">
                    Общие жанры
                  </p>
                  <h3 className="mt-3 font-serif text-2xl tracking-[-.03em] text-[var(--paper)]">
                    Что вы смотрите вместе
                  </h3>

                  {sharedGenreStats.length === 0 ? (
                    <p className="mt-5 text-sm leading-6 text-white/30">
                      Жанры пока не указаны в данных общих фильмов.
                    </p>
                  ) : (
                    <div className="mt-6 space-y-5">
                      {sharedGenreStats.map((genre) => (
                        <div key={genre.name}>
                          <div className="flex items-center justify-between gap-4">
                            <span className="text-sm text-white/70">{genre.name}</span>
                            <span className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/35">
                              {genre.films} {genre.films === 1 ? "фильм" : genre.films % 10 >= 2 && genre.films % 10 <= 4 && (genre.films % 100 < 12 || genre.films % 100 > 14) ? "фильма" : "фильмов"}
                              {genre.averageGap != null ? ` · средняя разница ${genre.averageGap.toFixed(1)}` : ""}
                            </span>
                          </div>
                          <div className="mt-2 h-px bg-white/10">
                            <div
                              className="h-px bg-[var(--acid)]"
                              style={{
                                width: `${Math.max(6, (genre.films / sharedGenreStats[0].films) * 100)}%`,
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <p className="mt-6 text-[10px] leading-5 text-white/20">
                    Жанры отсортированы по числу общих просмотренных фильмов. Указана средняя разница между вашими оценками в каждом жанре.
                  </p>
                </div>

                <div className="bg-[var(--bg)] p-5 md:p-7">
                  <p className="cine-mono text-[8px] uppercase tracking-[.16em] text-[var(--acid)]">
                    Самое большое расхождение
                  </p>
                  <h3 className="mt-3 font-serif text-2xl tracking-[-.03em] text-[var(--paper)]">
                    Один фильм, два мнения
                  </h3>

                  {comparison.biggestDifference ? (
                    <div className="mt-6 flex items-start gap-4">
                      <div className="w-16 shrink-0 overflow-hidden bg-[#101310]">
                        {comparison.biggestDifference.posterPath ? (
                          <img
                            src={getPoster(comparison.biggestDifference.posterPath, "w185")}
                            alt=""
                            loading="lazy"
                            className="aspect-[2/3] w-full object-cover"
                          />
                        ) : (
                          <div className="grid aspect-[2/3] place-items-center text-white/20">
                            <Star size={15} />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-xl leading-tight text-[var(--paper)]">
                          {comparison.biggestDifference.title}
                        </p>
                        <div className="mt-4 flex flex-wrap gap-5">
                          <div>
                            <p className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/30">Твоя оценка</p>
                            <p className="mt-1 font-serif text-3xl text-[var(--paper)]">
                              {displayRating(comparison.biggestDifference.myRating)}
                            </p>
                          </div>
                          <div>
                            <p className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/30">Оценка партнёра</p>
                            <p className="mt-1 font-serif text-3xl text-[var(--paper)]">
                              {displayRating(comparison.biggestDifference.partnerRating)}
                            </p>
                          </div>
                          <div>
                            <p className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/30">Разница</p>
                            <p className="mt-1 font-serif text-3xl text-[var(--acid)]">
                              {Math.abs(comparison.biggestDifference.difference).toFixed(1)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="mt-5 text-sm leading-6 text-white/30">
                      Поставьте оценки хотя бы одному общему фильму, и здесь появится самое большое расхождение.
                    </p>
                  )}
                </div>
              </div>
            )}

            {partnerLoading ? (
              <div className="py-14 text-center">
                <LoaderCircle size={22} className="mx-auto animate-spin text-[var(--acid)]" />
                <p className="mt-4 cine-mono text-[9px] uppercase tracking-[.15em] text-white/30">Загружаем общие фильмы</p>
              </div>
            ) : comparison.common.length === 0 ? (
              <div className="mt-8 border-y border-[var(--line)] py-12 text-center">
                <Clock3 size={23} strokeWidth={1.2} className="mx-auto text-white/20" />
                <p className="mt-4 cine-mono text-[9px] uppercase tracking-[.15em] text-white/30">
                  Пока нет общих просмотренных фильмов
                </p>
                <p className="mt-3 text-sm text-white/25">
                  Когда вы оба добавите один и тот же фильм в просмотренные, он появится здесь.
                </p>
              </div>
            ) : (
              <>
                <div className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="cine-mono text-[8px] uppercase tracking-[.14em] text-white/30">
                      Общий архив
                    </p>
                    <h3 className="mt-2 font-serif text-2xl tracking-[-.03em] text-[var(--paper)]">
                      Общие фильмы
                    </h3>
                  </div>
                  <label className="flex items-center gap-3">
                    <span className="cine-mono text-[8px] uppercase tracking-[.12em] text-white/30">
                      Сортировка
                    </span>
                    <select
                      value={sortMode}
                      onChange={(event) => setSortMode(event.target.value)}
                      className="min-w-[190px] border border-[var(--line)] bg-[#101310] px-3 py-2.5 text-xs text-[var(--paper)] outline-none focus:border-[var(--acid)]"
                    >
                      <option value="most-different">Самое большое расхождение</option>
                      <option value="closest">Самые близкие оценки</option>
                      <option value="title">Название: А–Я</option>
                    </select>
                  </label>
                </div>

                <div className="border-t border-[var(--line)]">
                {sortedCommon.map((movie, index) => {
                  const diff = movie.difference;
                  const diffLabel = diff == null
                    ? "Пока не оценили оба"
                    : diff === 0
                    ? "Одинаковые оценки"
                    : diff > 0
                    ? `Ты выше на ${diff.toFixed(1)}`
                    : `Партнёр выше на ${Math.abs(diff).toFixed(1)}`;

                  return (
                    <div
                      key={movie.id}
                      className="grid grid-cols-[42px_54px_minmax(0,1fr)] gap-4 border-b border-[var(--line)] py-4 md:grid-cols-[42px_64px_minmax(0,1fr)_100px_100px_130px] md:items-center md:gap-5"
                    >
                      <span className="cine-mono pt-1 text-[8px] text-white/20">
                        {String(index + 1).padStart(2, "0")}
                      </span>

                      <div className="aspect-[2/3] overflow-hidden bg-[#101310]">
                        {movie.posterPath ? (
                          <img
                            src={getPoster(movie.posterPath, "w185")}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="grid h-full place-items-center text-white/15">
                            <Star size={14} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 py-1">
                        <p className="truncate font-serif text-xl leading-tight tracking-[-.025em] text-[var(--paper)]">
                          {movie.title}
                        </p>
                        <p className="mt-2 cine-mono text-[8px] uppercase tracking-[.12em] text-white/25">
                          {movie.releaseDate?.slice(0, 4) || "—"}
                          {movie.genres?.length
                            ? ` · ${movie.genres.map((genre) => typeof genre === "string" ? genre : genre?.name).filter(Boolean).slice(0, 2).join(", ")}`
                            : ""}
                        </p>
                      </div>

                      <div className="col-start-2 row-start-2 md:col-start-auto md:row-start-auto">
                        <p className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/25">Твоя оценка</p>
                        <p className="mt-1 font-serif text-2xl text-[var(--paper)]">{displayRating(movie.myRating)}</p>
                      </div>

                      <div className="col-start-3 row-start-2 md:col-start-auto md:row-start-auto">
                        <p className="cine-mono text-[8px] uppercase tracking-[.1em] text-white/25">Оценка партнёра</p>
                        <p className="mt-1 font-serif text-2xl text-[var(--paper)]">{displayRating(movie.partnerRating)}</p>
                      </div>

                      <div className="col-span-2 col-start-2 row-start-3 md:col-span-1 md:col-start-auto md:row-start-auto md:text-right">
                        <span className={`cine-mono text-[8px] uppercase tracking-[.1em] ${diff === 0 ? "text-[var(--acid)]" : "text-white/30"}`}>
                          {diffLabel}
                        </span>
                      </div>
                    </div>
                  );
                })}
                </div>
              </>
            )}
          </>
        )}
      </section>

      <p className="mt-8 text-xs leading-6 text-white/20">
        В сравнении используются только общие просмотренные фильмы. Оценка одного пользователя не копируется и не изменяет оценку другого.
      </p>
    </motion.div>
  );
}
