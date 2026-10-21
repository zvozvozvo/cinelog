import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  Bookmark,
  CalendarDays,
  Check,
  Clapperboard,
  Clock3,
  Film,
  LoaderCircle,
  LogOut,
  Pencil,
  Save,
  Star,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabase";

const GENRES = [
  "Драма",
  "Комедия",
  "Фантастика",
  "Триллер",
  "Криминал",
  "Приключения",
  "Боевик",
  "Детектив",
  "Ужасы",
  "Романтика",
  "Анимация",
  "Документальный",
  "Фэнтези",
  "История",
  "Военный",
  "Семейный",
];

const EMPTY_PROFILE = {
  display_name: "",
  avatar_url: "",
  bio: "",
  favorite_genres: [],
  created_at: null,
};

function getMovieRating(movie) {
  const value = movie?.youRating ?? movie?.personalRating;
  if (value === null || value === undefined || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 10
    ? number
    : null;
}

function getGenreNames(movie) {
  if (Array.isArray(movie?.genres)) {
    return movie.genres
      .map((genre) =>
        typeof genre === "string" ? genre : genre?.name
      )
      .filter(Boolean);
  }

  if (typeof movie?.genre === "string") {
    return movie.genre
      .split(/[·,|]/)
      .map((genre) => genre.trim())
      .filter(Boolean);
  }

  return [];
}

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return new Intl.DateTimeFormat("ru-RU", {
    month: "long",
    year: "numeric",
  }).format(parsed);
}

function formatRuntime(minutes) {
  const value = Number(minutes);
  if (!Number.isFinite(value) || value <= 0) return "—";

  const hours = Math.floor(value / 60);
  const remainder = value % 60;
  if (hours && remainder) return `${hours} ч ${remainder} мин`;
  if (hours) return `${hours} ч`;
  return `${remainder} мин`;
}

function getInitials(name, email) {
  const source = (name || email || "C").trim();
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

function StatCard({ icon, label, value, detail }) {
  return (
    <div className="border border-[var(--line)] bg-white/[.025] p-5 sm:p-6">
      <div className="flex items-center gap-3 text-[var(--acid)]">
        {icon}
        <span className="cine-mono text-[8px] uppercase tracking-[.16em] text-white/35">
          {label}
        </span>
      </div>
      <div className="mt-6 cine-serif text-4xl tracking-[-.045em] text-[var(--paper)] sm:text-5xl">
        {value}
      </div>
      {detail && (
        <p className="mt-2 text-xs leading-5 text-white/30">{detail}</p>
      )}
    </div>
  );
}

export default function Profile({ movies = [] }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(EMPTY_PROFILE);
  const [draft, setDraft] = useState(EMPTY_PROFILE);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [avatarFailed, setAvatarFailed] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const {
          data: { user: currentUser },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) throw userError;
        if (!currentUser) {
          throw new Error("Войди в аккаунт, чтобы открыть профиль.");
        }

        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, display_name, avatar_url, bio, favorite_genres, created_at")
          .eq("id", currentUser.id)
          .maybeSingle();

        if (profileError) throw profileError;

        const loaded = {
          ...EMPTY_PROFILE,
          ...(data || {}),
          display_name:
            data?.display_name ||
            currentUser.user_metadata?.display_name ||
            "",
          avatar_url: data?.avatar_url || "",
          bio: data?.bio || "",
          favorite_genres: Array.isArray(data?.favorite_genres)
            ? data.favorite_genres
            : [],
          created_at: data?.created_at || currentUser.created_at,
        };

        if (active) {
          setUser(currentUser);
          setProfile(loaded);
          setDraft(loaded);
        }
      } catch (loadError) {
        console.error("Profile loading error:", loadError);
        if (active) {
          setError(
            loadError?.message ||
              "Не удалось загрузить профиль. Проверь настройки Supabase."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadProfile();

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const watched = movies.filter((movie) => movie.status === "watched");
    const watchlist = movies.filter((movie) => movie.status === "watchlist");
    const rated = watched
      .map((movie) => ({ movie, rating: getMovieRating(movie) }))
      .filter((item) => item.rating !== null);

    const average = rated.length
      ? rated.reduce((sum, item) => sum + item.rating, 0) / rated.length
      : null;

    const totalRuntime = watched.reduce((sum, movie) => {
      const runtime = Number(movie.runtime);
      return sum + (Number.isFinite(runtime) && runtime > 0 ? runtime : 0);
    }, 0);

    const genreCounts = new Map();
    for (const movie of watched) {
      for (const genre of getGenreNames(movie)) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    }

    const mostWatchedGenres = [...genreCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const highestRated = [...rated].sort(
      (a, b) => b.rating - a.rating
    )[0] || null;

    return {
      watchedCount: watched.length,
      watchlistCount: watchlist.length,
      ratedCount: rated.length,
      average,
      totalRuntime,
      mostWatchedGenres,
      highestRated,
    };
  }, [movies]);

  function updateDraft(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function toggleGenre(genre) {
    setDraft((current) => {
      const selected = new Set(current.favorite_genres || []);
      if (selected.has(genre)) selected.delete(genre);
      else selected.add(genre);
      return { ...current, favorite_genres: [...selected] };
    });
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!user) return;

    setSaving(true);
    setError("");
    setNotice("");

    const displayName = draft.display_name.trim();
    const avatarUrl = draft.avatar_url.trim();

    if (displayName.length > 40) {
      setError("Имя должно содержать не больше 40 символов.");
      setSaving(false);
      return;
    }

    if (draft.bio.trim().length > 240) {
      setError("Описание должно содержать не больше 240 символов.");
      setSaving(false);
      return;
    }

    if (avatarUrl) {
      try {
        const parsed = new URL(avatarUrl);
        if (!['http:', 'https:'].includes(parsed.protocol)) {
          throw new Error("invalid protocol");
        }
      } catch {
        setError("Ссылка на аватар должна начинаться с https:// или http://.");
        setSaving(false);
        return;
      }
    }

    try {
      const payload = {
        id: user.id,
        display_name: displayName || "Киноман",
        avatar_url: avatarUrl || null,
        bio: draft.bio.trim() || null,
        favorite_genres: Array.isArray(draft.favorite_genres)
          ? draft.favorite_genres
          : [],
      };

      const { data, error: saveError } = await supabase
        .from("profiles")
        .upsert(payload, { onConflict: "id" })
        .select("id, display_name, avatar_url, bio, favorite_genres, created_at")
        .single();

      if (saveError) throw saveError;

      const saved = {
        ...EMPTY_PROFILE,
        ...data,
        avatar_url: data.avatar_url || "",
        bio: data.bio || "",
        favorite_genres: Array.isArray(data.favorite_genres)
          ? data.favorite_genres
          : [],
      };

      setProfile(saved);
      setDraft(saved);
      setAvatarFailed(false);
      setEditing(false);
      setNotice("Профиль сохранён.");
    } catch (saveError) {
      console.error("Profile save error:", saveError);
      setError(
        saveError?.message ||
          "Не удалось сохранить профиль. Проверь SQL-настройки профиля в Supabase."
      );
    } finally {
      setSaving(false);
    }
  }

  async function signOut() {
    setError("");
    setNotice("");
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      navigate("/auth", { replace: true });
    } catch (signOutError) {
      console.error("Sign out error:", signOutError);
      setError(signOutError?.message || "Не удалось выйти из аккаунта. Попробуй ещё раз.");
    }
  }

  if (loading) {
    return (
      <div className="cine-empty my-20 min-h-[420px]">
        <div>
          <LoaderCircle className="mx-auto animate-spin text-[var(--acid)]" size={28} />
          <p className="mt-5 text-center cine-kicker">Загружаем профиль</p>
        </div>
      </div>
    );
  }

  const displayName =
    profile.display_name || user?.user_metadata?.display_name || "Киноман";
  const initials = getInitials(displayName, user?.email);
  const avatarUrl = editing ? draft.avatar_url : profile.avatar_url;
  const hasAvatar = Boolean(avatarUrl && !avatarFailed);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="pb-24 pt-10 sm:pt-14"
    >
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-[var(--line)] pb-6">
        <div>
          <p className="cine-mono text-[9px] uppercase tracking-[.18em] text-[var(--acid)]">
            CineLog / Личный профиль
          </p>
          <h1 className="mt-4 cine-serif text-5xl leading-[.95] tracking-[-.05em] text-[var(--paper)] sm:text-7xl">
            Твоя история.
          </h1>
          <p className="mt-4 max-w-[620px] text-sm leading-6 text-white/40">
            Твой вкус, любимые жанры и личная статистика кино в одном месте.
          </p>
        </div>

        <div className="cine-profile-actions">
        {!editing && (
          <button
            type="button"
            onClick={() => {
              setDraft(profile);
              setError("");
              setNotice("");
              setEditing(true);
            }}
            className="cine-button cine-button--solid"
          >
            <Pencil size={14} />
            Изменить профиль
          </button>
        )}
          <button type="button" onClick={signOut} className="cine-button cine-button--quiet cine-signout-button">
            <LogOut size={15} /> Выйти из аккаунта
          </button>
        </div>
      </div>

      {error && !editing && (
        <div className="mt-6 border border-red-400/20 bg-red-400/[.05] px-4 py-3 text-sm text-red-200/80">
          {error}
        </div>
      )}
      {notice && !editing && (
        <div className="mt-6 border border-[var(--acid)]/20 bg-[var(--acid)]/[.05] px-4 py-3 text-sm text-[var(--acid)]">
          {notice}
        </div>
      )}

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(320px,.75fr)]">
        <div className="relative overflow-hidden border border-[var(--line)] bg-white/[.025] p-6 sm:p-8">
          <div className="pointer-events-none absolute -right-16 -top-24 h-64 w-64 rounded-full border border-[var(--acid)]/[.08]" />
          <div className="pointer-events-none absolute -right-6 -top-14 h-44 w-44 rounded-full border border-[var(--acid)]/[.08]" />

          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative grid h-28 w-28 shrink-0 place-items-center overflow-hidden rounded-full border border-[var(--acid)]/30 bg-[#121812] text-[var(--acid)] sm:h-32 sm:w-32">
              {hasAvatar ? (
                <img
                  src={avatarUrl}
                  alt={`Аватар: ${displayName}`}
                  className="h-full w-full object-cover"
                  onError={() => setAvatarFailed(true)}
                />
              ) : (
                <span className="cine-serif text-4xl sm:text-5xl">{initials}</span>
              )}
              <span className="absolute bottom-1.5 right-1.5 grid h-7 w-7 place-items-center rounded-full border border-[#080908] bg-[var(--acid)] text-[#080908]">
                <Clapperboard size={13} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="cine-mono text-[8px] uppercase tracking-[.17em] text-white/30">
                Пользователь CineLog
              </p>
              <h2 className="mt-3 break-words cine-serif text-4xl leading-tight tracking-[-.04em] text-[var(--paper)] sm:text-5xl">
                {displayName}
              </h2>
              <p className="mt-3 break-all text-sm text-white/40">
                {user?.email || "Почта не указана"}
              </p>
              <p className="mt-5 max-w-[520px] whitespace-pre-wrap text-sm leading-6 text-white/55">
                {profile.bio || "Пока без описания. Расскажи немного о своём вкусе в кино."}
              </p>
              <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-[10px] text-white/30">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays size={13} />
                  В CineLog с {formatDate(profile.created_at)}
                </span>
              </div>
            </div>
          </div>

          {editing && (
            <form onSubmit={saveProfile} className="relative mt-8 border-t border-[var(--line)] pt-7">
              <div className="flex items-center justify-between gap-4">
                <h3 className="cine-serif text-2xl tracking-[-.03em]">Настройки профиля</h3>
                <span className="cine-mono text-[8px] uppercase tracking-[.12em] text-white/25">Личные данные</span>
              </div>

              <div className="mt-6 grid gap-5 sm:grid-cols-2">
                <label className="block">
                  <span className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/35">Имя</span>
                  <input
                    value={draft.display_name || ""}
                    onChange={(event) => updateDraft("display_name", event.target.value)}
                    maxLength={40}
                    placeholder="Как тебя называть?"
                    className="mt-2 w-full border-b border-white/15 bg-transparent px-0 py-3 text-sm text-[var(--paper)] outline-none placeholder:text-white/20 focus:border-[var(--acid)]"
                  />
                </label>
                <label className="block">
                  <span className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/35">Ссылка на аватар</span>
                  <input
                    value={draft.avatar_url || ""}
                    onChange={(event) => {
                      updateDraft("avatar_url", event.target.value);
                      setAvatarFailed(false);
                    }}
                    maxLength={500}
                    type="url"
                    placeholder="https://..."
                    className="mt-2 w-full border-b border-white/15 bg-transparent px-0 py-3 text-sm text-[var(--paper)] outline-none placeholder:text-white/20 focus:border-[var(--acid)]"
                  />
                </label>
              </div>

              <label className="mt-5 block">
                <span className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/35">О себе / о кино</span>
                <textarea
                  value={draft.bio || ""}
                  onChange={(event) => updateDraft("bio", event.target.value)}
                  maxLength={240}
                  rows={3}
                  placeholder="Любимые режиссёры, фильмы, жанры..."
                  className="mt-2 w-full resize-y border border-white/10 bg-black/20 px-3 py-3 text-sm leading-6 text-[var(--paper)] outline-none placeholder:text-white/20 focus:border-[var(--acid)]/50"
                />
                <span className="mt-1 block text-right cine-mono text-[8px] text-white/20">{(draft.bio || "").length}/240</span>
              </label>

              <div className="mt-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/35">Любимые жанры</span>
                  <span className="text-[10px] text-white/25">Выбери несколько</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {GENRES.map((genre) => {
                    const selected = (draft.favorite_genres || []).includes(genre);
                    return (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => toggleGenre(genre)}
                        aria-pressed={selected}
                        className={`border px-3 py-2 text-xs transition-colors ${
                          selected
                            ? "border-[var(--acid)]/50 bg-[var(--acid)]/10 text-[var(--acid)]"
                            : "border-white/10 text-white/45 hover:border-white/25 hover:text-white/75"
                        }`}
                      >
                        {selected && <Check size={12} className="mr-1.5 inline" />}
                        {genre}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <p role="alert" className="mt-5 border border-red-400/20 bg-red-400/[.05] px-3 py-3 text-xs leading-5 text-red-200/80">
                  {error}
                </p>
              )}

              <div className="mt-7 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setDraft(profile);
                    setEditing(false);
                    setError("");
                  }}
                  disabled={saving}
                  className="cine-button"
                >
                  <X size={14} /> Отмена
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="cine-button cine-button--solid"
                >
                  {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Сохраняем..." : "Сохранить профиль"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="border border-[var(--line)] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="cine-mono text-[8px] uppercase tracking-[.17em] text-[var(--acid)]">Твой кинопочерк</p>
              <h3 className="mt-3 cine-serif text-3xl tracking-[-.04em]">Любимые жанры</h3>
            </div>
            <Film size={20} className="text-white/25" />
          </div>

          {(profile.favorite_genres || []).length > 0 ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {profile.favorite_genres.map((genre) => (
                <span key={genre} className="border border-[var(--acid)]/25 bg-[var(--acid)]/[.06] px-3 py-2 cine-mono text-[9px] uppercase tracking-[.08em] text-[var(--acid)]">
                  {genre}
                </span>
              ))}
            </div>
          ) : stats.mostWatchedGenres.length > 0 ? (
            <>
              <p className="mt-6 text-xs leading-5 text-white/30">Пока не выбрал жанры вручную. Вот что чаще всего встречается в твоих просмотренных фильмах.</p>
              <div className="mt-5 space-y-4">
                {stats.mostWatchedGenres.map(([genre, count], index) => (
                  <div key={genre}>
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm text-white/65">{genre}</span>
                      <span className="cine-mono text-[9px] text-white/25">{count} {count === 1 ? "фильм" : "фильмов"}</span>
                    </div>
                    <div className="h-1 bg-white/[.07]">
                      <div
                        className="h-full bg-[var(--acid)]/70"
                        style={{ width: `${Math.max(8, (count / stats.mostWatchedGenres[0][1]) * 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="mt-7 border border-dashed border-white/10 p-5">
              <p className="text-sm leading-6 text-white/35">Добавь просмотренные фильмы или укажи любимые жанры в настройках профиля.</p>
              <button type="button" onClick={() => { setDraft(profile); setEditing(true); }} className="mt-4 cine-mono text-[9px] uppercase tracking-[.12em] text-[var(--acid)]">
                Выбрать жанры <ArrowRight size={12} className="ml-1 inline" />
              </button>
            </div>
          )}

          {!editing && (profile.favorite_genres || []).length === 0 && stats.mostWatchedGenres.length > 0 && (
            <button type="button" onClick={() => { setDraft(profile); setEditing(true); }} className="mt-6 cine-mono text-[9px] uppercase tracking-[.12em] text-[var(--acid)]">
              Настроить вручную <ArrowRight size={12} className="ml-1 inline" />
            </button>
          )}
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-5 flex items-end justify-between gap-4 border-b border-[var(--line)] pb-4">
          <div>
            <p className="cine-mono text-[8px] uppercase tracking-[.17em] text-[var(--acid)]">Статистика архива</p>
            <h2 className="mt-2 cine-serif text-3xl tracking-[-.035em] sm:text-4xl">Твоё кино в цифрах</h2>
          </div>
          <button type="button" onClick={() => navigate("/statistics")} className="hidden items-center gap-2 cine-mono text-[9px] uppercase tracking-[.1em] text-white/35 transition-colors hover:text-[var(--acid)] sm:flex">
            Подробная статистика <ArrowRight size={13} />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            icon={<Film size={15} />}
            label="Просмотрено"
            value={stats.watchedCount}
            detail="Фильмы в твоём архиве"
          />
          <StatCard
            icon={<Bookmark size={15} />}
            label="К просмотру"
            value={stats.watchlistCount}
            detail="Фильмы на потом"
          />
          <StatCard
            icon={<Star size={15} />}
            label="Средняя оценка"
            value={stats.average === null ? "—" : stats.average.toFixed(1)}
            detail={`${stats.ratedCount} оценённых фильмов`}
          />
          <StatCard
            icon={<Clock3 size={15} />}
            label="Время просмотра"
            value={formatRuntime(stats.totalRuntime)}
            detail="Суммарная длительность фильмов"
          />
        </div>

        {stats.highestRated && (
          <button
            type="button"
            onClick={() => navigate(`/movie/${stats.highestRated.movie.id}`)}
            className="group mt-5 flex w-full items-center justify-between gap-5 border border-[var(--line)] bg-white/[.02] p-5 text-left transition-colors hover:border-[var(--acid)]/25 sm:p-6"
          >
            <div className="flex min-w-0 items-center gap-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center border border-[var(--acid)]/25 bg-[var(--acid)]/[.06] text-[var(--acid)]">
                <Star size={16} fill="currentColor" />
              </div>
              <div className="min-w-0">
                <p className="cine-mono text-[8px] uppercase tracking-[.15em] text-white/30">Самая высокая оценка</p>
                <p className="mt-1 truncate cine-serif text-xl text-[var(--paper)]">{stats.highestRated.movie.title || stats.highestRated.movie.originalTitle || "Без названия"}</p>
              </div>
            </div>
            <div className="flex shrink-0 items-center gap-3 text-[var(--acid)]">
              <span className="cine-serif text-3xl">{stats.highestRated.rating.toFixed(1)}</span>
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        )}

        <button type="button" onClick={() => navigate("/statistics")} className="mt-5 flex w-full items-center justify-center gap-2 border border-white/10 px-4 py-3 cine-mono text-[9px] uppercase tracking-[.13em] text-white/40 transition-colors hover:border-[var(--acid)]/30 hover:text-[var(--acid)] sm:hidden">
          Подробная статистика <ArrowRight size={13} />
        </button>
      </section>
    </motion.div>
  );
}
