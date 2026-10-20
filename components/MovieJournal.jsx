import { useCallback, useEffect, useState } from "react";
import {
  CalendarDays,
  LoaderCircle,
  NotebookPen,
  Plus,
  Star,
  Trash2,
} from "lucide-react";
import { supabase } from "../supabase";

function todayLocal() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDate(value) {
  if (!value) return "Дата не указана";

  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export default function MovieJournal({
  tmdbId,
  movieTitle,
  currentRating,
}) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [watchedOn, setWatchedOn] = useState(todayLocal);
  const [rating, setRating] = useState(
    currentRating == null ? 8 : Number(currentRating)
  );
  const [note, setNote] = useState("");

  const loadEntries = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Сначала войди в аккаунт.");

      const { data, error: queryError } = await supabase
        .from("movie_journal")
        .select("id, user_id, tmdb_id, watched_on, rating, note, created_at")
        .eq("user_id", user.id)
        .eq("tmdb_id", Number(tmdbId))
        .order("watched_on", { ascending: false })
        .order("created_at", { ascending: false });

      if (queryError) throw queryError;
      setEntries(data || []);
    } catch (loadError) {
      console.error("Movie journal load error:", loadError);
      if (loadError?.code === "42P01" || /movie_journal/i.test(loadError?.message || "")) {
        setError("Таблица дневника ещё не создана. Выполни SQL из архива обновления в Supabase.");
      } else {
        setError(loadError?.message || "Не удалось загрузить дневник просмотра.");
      }
    } finally {
      setLoading(false);
    }
  }, [tmdbId]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    setRating(currentRating == null ? 8 : Number(currentRating));
  }, [currentRating]);

  async function addEntry(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Сначала войди в аккаунт.");

      const { error: insertError } = await supabase
        .from("movie_journal")
        .insert({
          user_id: user.id,
          tmdb_id: Number(tmdbId),
          watched_on: watchedOn || todayLocal(),
          rating: Number(Number(rating).toFixed(1)),
          note: note.trim(),
        });

      if (insertError) throw insertError;

      setNote("");
      setWatchedOn(todayLocal());
      setNotice("Просмотр добавлен в дневник.");
      await loadEntries();
    } catch (saveError) {
      console.error("Movie journal save error:", saveError);
      setError(saveError?.message || "Не удалось сохранить просмотр.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEntry(entryId) {
    setDeletingId(entryId);
    setError("");
    setNotice("");

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) throw userError;
      if (!user) throw new Error("Сначала войди в аккаунт.");

      const { error: deleteError } = await supabase
        .from("movie_journal")
        .delete()
        .eq("id", entryId)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;

      setEntries((current) => current.filter((entry) => entry.id !== entryId));
      setNotice("Запись удалена из дневника.");
    } catch (deleteError) {
      console.error("Movie journal delete error:", deleteError);
      setError(deleteError?.message || "Не удалось удалить запись.");
    } finally {
      setDeletingId(null);
    }
  }

  const entryCountLabel = `${entries.length} ${
    entries.length === 1 ? "просмотр" : entries.length >= 2 && entries.length <= 4 ? "просмотра" : "просмотров"
  }`;

  return (
    <section className="mt-20 border-t border-[var(--line)] pt-8">
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <p className="cine-mono text-[8px] uppercase tracking-[0.18em] text-[var(--acid)]">
            Личный дневник
          </p>
          <h2 className="mt-3 font-serif text-4xl tracking-[-0.04em] text-[#eeeae0] md:text-5xl">
            История просмотров
          </h2>
          <p className="mt-3 max-w-[650px] text-sm leading-6 text-white/40">
            Записывай повторные просмотры, ставь оценку каждому сеансу и сохраняй впечатления о фильме «{movieTitle}».
          </p>
        </div>

        <div className="shrink-0 border border-[var(--line)] px-4 py-3">
          <p className="cine-mono text-[8px] uppercase tracking-[0.15em] text-white/25">
            Записей в дневнике
          </p>
          <p className="mt-1 font-serif text-2xl text-[#eeeae0]">
            {entries.length}
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <form
          onSubmit={addEntry}
          className="border border-[var(--line)] bg-white/[0.015] p-5 md:p-7"
        >
          <div className="flex items-center gap-3">
            <NotebookPen size={17} className="text-[var(--acid)]" strokeWidth={1.5} />
            <h3 className="font-serif text-2xl text-[#eeeae0]">
              Записать просмотр
            </h3>
          </div>

          <label className="mt-7 block">
            <span className="cine-mono text-[8px] uppercase tracking-[0.15em] text-white/35">
              Дата просмотра
            </span>
            <span className="relative mt-2 block">
              <CalendarDays size={14} className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="date"
                value={watchedOn}
                max={todayLocal()}
                onChange={(event) => setWatchedOn(event.target.value)}
                required
                className="w-full border-b border-white/15 bg-transparent py-3 pl-6 text-sm text-[#eeeae0] outline-none focus:border-[var(--acid)] [color-scheme:dark]"
              />
            </span>
          </label>

          <div className="mt-7">
            <div className="flex items-end justify-between gap-4">
              <span className="cine-mono text-[8px] uppercase tracking-[0.15em] text-[var(--acid)]">
                Оценка за этот просмотр
              </span>
              <span className="font-serif text-3xl text-[var(--acid)]">
                {Number(rating).toFixed(1)}<span className="ml-1 text-xs text-white/25">/ 10</span>
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="0.1"
              value={rating}
              onChange={(event) => setRating(Number(event.target.value))}
              className="rating-range mt-4"
            />
            <div className="mt-2 flex justify-between cine-mono text-[8px] text-white/20">
              <span>0</span><span>2</span><span>4</span><span>6</span><span>8</span><span>10</span>
            </div>
          </div>

          <label className="mt-7 block">
            <span className="cine-mono text-[8px] uppercase tracking-[0.15em] text-white/35">
              Заметка или рецензия
            </span>
            <textarea
              value={note}
              onChange={(event) => setNote(event.target.value.slice(0, 2000))}
              rows={4}
              maxLength={2000}
              placeholder="Что запомнилось? Что почувствовал? Изменилось ли мнение при пересмотре?"
              className="mt-2 w-full resize-y border border-[var(--line)] bg-transparent px-3 py-3 text-sm leading-6 text-[#eeeae0] outline-none placeholder:text-white/20 focus:border-[var(--acid)]"
            />
            <span className="mt-1 block text-right cine-mono text-[8px] text-white/20">
              {note.length}/2000
            </span>
          </label>

          {error && (
            <p className="mt-4 border border-red-400/20 bg-red-400/[0.06] px-3 py-3 text-xs leading-5 text-red-200/80">
              {error}
            </p>
          )}
          {notice && (
            <p className="mt-4 text-xs leading-5 text-[var(--acid)]">
              {notice}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || !watchedOn}
            className="cine-button cine-button--solid mt-5 w-full justify-center disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? (
              <LoaderCircle size={14} className="animate-spin" />
            ) : (
              <Plus size={14} />
            )}
            {saving ? "Сохраняем просмотр..." : "Добавить в дневник"}
          </button>
          <p className="mt-4 text-xs leading-5 text-white/25">
            Запись личная и не меняет текущую оценку фильма в архиве. Каждый пересмотр сохраняется отдельно.
          </p>
        </form>

        <div>
          <div className="flex items-center justify-between border-b border-[var(--line)] pb-4">
            <h3 className="font-serif text-2xl text-[#eeeae0]">
              Все просмотры
            </h3>
            <span className="cine-mono text-[8px] uppercase tracking-[0.12em] text-white/25">
              {entryCountLabel}
            </span>
          </div>

          {loading ? (
            <div className="flex min-h-[220px] items-center justify-center gap-3 text-white/35">
              <LoaderCircle size={16} className="animate-spin" />
              <span className="cine-mono text-[9px] uppercase tracking-[0.12em]">Загружаем дневник</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center border-b border-dashed border-white/10 px-4 text-center">
              <CalendarDays size={22} className="text-[var(--acid)]/70" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-2xl text-[#eeeae0]">
                Пока нет записей
              </p>
              <p className="mt-2 max-w-[360px] text-xs leading-5 text-white/30">
                Добавь первый просмотр. При следующем пересмотре создай ещё одну запись, чтобы отслеживать историю и оценки.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {entries.map((entry, index) => (
                <article key={entry.id} className="group py-5">
                  <div className="flex items-start justify-between gap-5">
                    <div>
                      <p className="cine-mono text-[8px] uppercase tracking-[0.13em] text-[var(--acid)]">
                        Просмотр {entries.length - index}
                      </p>
                      <p className="mt-2 flex items-center gap-2 text-sm text-white/65">
                        <CalendarDays size={13} className="text-white/30" />
                        {formatDate(entry.watched_on)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 text-[var(--acid)]">
                      <Star size={13} fill="currentColor" strokeWidth={1.3} />
                      <span className="cine-mono text-sm">
                        {entry.rating == null ? "—" : Number(entry.rating).toFixed(1)}
                      </span>
                      <button
                        type="button"
                        onClick={() => deleteEntry(entry.id)}
                        disabled={deletingId === entry.id}
                        aria-label="Удалить запись о просмотре"
                        title="Удалить запись"
                        className="ml-2 p-2 text-white/20 opacity-100 transition-colors hover:text-red-300 disabled:opacity-30 md:opacity-0 md:group-hover:opacity-100"
                      >
                        {deletingId === entry.id ? (
                          <LoaderCircle size={13} className="animate-spin" />
                        ) : (
                          <Trash2 size={13} />
                        )}
                      </button>
                    </div>
                  </div>
                  {entry.note ? (
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-white/55">
                      {entry.note}
                    </p>
                  ) : (
                    <p className="mt-4 text-xs italic text-white/20">
                      Заметка не добавлена.
                    </p>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
