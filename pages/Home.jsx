import { useMemo, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Check,
  Film,
  Plus,
  Shuffle,
  Sparkles,
  Star,
  Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import MoviePoster from "../components/MoviePoster";

function titleOf(movie) {
  return movie?.title || movie?.name || movie?.originalTitle || "Без названия";
}

function yearOf(movie) {
  const value = movie?.release_date || movie?.releaseDate || movie?.first_air_date || movie?.year;
  return value ? String(value).slice(0, 4) : "Год неизвестен";
}

function ratingOf(movie) {
  const value = Number(movie?.personalRating ?? movie?.youRating ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function addedTime(movie) {
  const value = movie?.addedAt || movie?.added_at || movie?.created_at || 0;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function formatRuntime(totalMinutes) {
  const value = Number(totalMinutes);
  if (!Number.isFinite(value) || value <= 0) return "—";
  const hours = Math.floor(value / 60);
  const minutes = value % 60;
  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const restHours = hours % 24;
    return restHours ? `${days} д ${restHours} ч` : `${days} д`;
  }
  if (!hours) return `${minutes} мин`;
  return minutes ? `${hours} ч ${minutes} мин` : `${hours} ч`;
}

const MOOD_FILTERS = [
  { key: "all", label: "Всё", genres: [] },
  { key: "laugh", label: "Посмеяться", genres: ["комедия", "семейный", "мультфильм"] },
  { key: "adrenaline", label: "Адреналин", genres: ["боевик", "триллер", "криминал", "ужасы"] },
  { key: "think", label: "Подумать", genres: ["драма", "детектив", "история", "документальный"] },
  { key: "escape", label: "Другой мир", genres: ["фантастика", "фэнтези", "приключения", "анимация"] },
];

function matchesMood(movie, mood) {
  if (!mood || mood.key === "all") return true;
  const values = [
    ...(Array.isArray(movie?.genres) ? movie.genres.map((item) => typeof item === "string" ? item : item?.name) : []),
    ...(typeof movie?.genre === "string" ? movie.genre.split(/[·,|]/) : []),
  ];
  const haystack = values.filter(Boolean).join(" ").toLocaleLowerCase("ru");
  return mood.genres.some((genre) => haystack.includes(genre));
}

function HeroStat({ label, value, detail }) {
  return (
    <div className="home-cinema-stat">
      <span className="home-cinema-stat__label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function ShelfTab({ active, label, count, onClick }) {
  return (
    <button
      type="button"
      className={`home-cinema-tab ${active ? "is-active" : ""}`}
      aria-pressed={active}
      onClick={onClick}
    >
      <span>{label}</span>
      <small>{count}</small>
    </button>
  );
}

function EmptyShelf({ onAddMovie }) {
  return (
    <div className="home-cinema-empty">
      <div className="home-cinema-empty__mark"><Film size={24} strokeWidth={1.5} /></div>
      <div>
        <h3>Здесь пока нет фильмов</h3>
        <p>Добавь просмотренное или собери список на следующий вечер.</p>
      </div>
      <button type="button" className="cine-button cine-button--solid" onClick={onAddMovie}>
        <Plus size={16} /> Добавить фильм
      </button>
    </div>
  );
}

export default function Home({ movies = [], onAddMovie }) {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const [activeShelf, setActiveShelf] = useState("recent");
  const [activeMood, setActiveMood] = useState("all");

  const watched = useMemo(
    () => movies.filter((movie) => movie.status === "watched").sort((a, b) => addedTime(b) - addedTime(a)),
    [movies]
  );
  const watchlist = useMemo(
    () => movies.filter((movie) => movie.status === "watchlist").sort((a, b) => addedTime(b) - addedTime(a)),
    [movies]
  );
  const recent = useMemo(
    () => [...movies].sort((a, b) => addedTime(b) - addedTime(a)),
    [movies]
  );
  const rated = useMemo(() => watched.filter((movie) => ratingOf(movie) > 0), [watched]);
  const averageRating = rated.length
    ? (rated.reduce((sum, movie) => sum + ratingOf(movie), 0) / rated.length).toFixed(1)
    : "—";
  const totalRuntime = watched.reduce(
    (sum, movie) => sum + (Number(movie.runtime) > 0 ? Number(movie.runtime) : 0),
    0
  );

  // Prefer a film saved for later: the hero doubles as a useful "what next?" picker.
  const heroCandidates = watchlist.length ? watchlist : watched.length ? watched : recent;
  const heroPool = heroCandidates.slice(0, 5);
  const heroMovie = heroPool.length ? heroPool[heroIndex % heroPool.length] : null;
  const heroIsWatchlist = heroMovie?.status === "watchlist";
  const shelfSource = activeShelf === "watched"
    ? watched
    : activeShelf === "watchlist"
      ? watchlist
      : recent;
  const selectedMood = MOOD_FILTERS.find((mood) => mood.key === activeMood) || MOOD_FILTERS[0];
  const matchingShelf = shelfSource.filter((movie) => matchesMood(movie, selectedMood));
  const shelfMovies = matchingShelf.slice(0, 10);
  const shelfCount = matchingShelf.length;

  function chooseAnotherMovie() {
    if (heroPool.length > 1) setHeroIndex((current) => (current + 1) % heroPool.length);
  }

  return (
    <div className="cine-home home-cinema-page cine-page-enter">
      <section className={`home-cinema-hero ${heroMovie ? "" : "is-empty"}`} aria-label="Фильм из твоей коллекции">
        <div className="home-cinema-hero__copy">
          <p className="home-cinema-eyebrow">
            <span className="home-cinema-eyebrow__dot" />
            {heroMovie ? (heroIsWatchlist ? "Следующий сеанс" : "Из твоей коллекции") : "Твой личный киноархив"}
          </p>

          <h1 className="home-cinema-hero__title">
            {heroMovie ? titleOf(heroMovie) : "Фильмы, которые хочется помнить"}
          </h1>

          {heroMovie ? (
            <>
              <div className="home-cinema-hero__meta">
                <span>{yearOf(heroMovie)}</span>
                <span className="home-cinema-status">
                  {heroIsWatchlist ? <Bookmark size={13} /> : <Check size={13} />}
                  {heroIsWatchlist ? "К просмотру" : "Просмотрено"}
                </span>
                {ratingOf(heroMovie) > 0 && (
                  <span className="home-cinema-rating"><Star size={13} fill="currentColor" /> {ratingOf(heroMovie).toFixed(1)}</span>
                )}
              </div>
              <p className="home-cinema-hero__description">
                {heroMovie.overview
                  ? `${String(heroMovie.overview).trim().slice(0, 190)}${String(heroMovie.overview).trim().length > 190 ? "…" : ""}`
                  : heroIsWatchlist
                    ? "Фильм уже ждёт в твоём списке. Самое время решить, когда устроить следующий сеанс."
                    : "Часть твоей личной истории кино. Открой карточку, чтобы посмотреть детали и свою оценку."}
              </p>
            </>
          ) : (
            <p className="home-cinema-hero__description">
              Добавляй просмотренное, собирай список на потом и находи, что посмотреть следующим.
            </p>
          )}

          <div className="home-cinema-hero__actions">
            <button
              type="button"
              className="cine-button cine-button--solid"
              onClick={() => heroMovie ? navigate(`/movie/${heroMovie.id}`) : onAddMovie()}
            >
              {heroMovie ? "Открыть фильм" : "Добавить первый фильм"}
              <ArrowRight size={16} />
            </button>
            {heroMovie && heroPool.length > 1 && (
              <button type="button" className="cine-button cine-button--glass" onClick={chooseAnotherMovie}>
                <Shuffle size={15} /> Другой фильм
              </button>
            )}
            {heroMovie && (
              <button type="button" className="home-cinema-add-link" onClick={onAddMovie} aria-label="Добавить ещё один фильм">
                <Plus size={17} />
              </button>
            )}
          </div>
        </div>

        <div className="home-cinema-hero__visual" aria-hidden={!heroMovie}>
          <div className="home-cinema-hero__light" />
          {heroMovie ? (
            <div className="home-cinema-hero__poster-shell" key={String(heroMovie.id)}>
              <MoviePoster
                movie={heroMovie}
                alt={`Постер фильма «${titleOf(heroMovie)}»`}
                size="w500"
                loading="eager"
                className="home-cinema-hero__poster"
              />
              <span className="home-cinema-hero__poster-caption">CINELOG / КОЛЛЕКЦИЯ</span>
            </div>
          ) : (
            <div className="home-cinema-hero__empty-art">
              <span className="home-cinema-hero__film-icon"><Film size={44} strokeWidth={1.1} /></span>
              <span>Твоя следующая история начинается здесь</span>
            </div>
          )}

          {heroMovie && heroPool.length > 1 && (
            <div className="home-cinema-hero__picker" aria-label="Выбор фильма">
              {heroPool.map((movie, index) => (
                <button
                  key={movie.id}
                  type="button"
                  aria-label={`Выбрать фильм «${titleOf(movie)}»`}
                  aria-pressed={String(movie.id) === String(heroMovie.id)}
                  className={`home-cinema-picker-dot ${String(movie.id) === String(heroMovie.id) ? "is-active" : ""}`}
                  onClick={() => setHeroIndex(index)}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="home-cinema-stats" aria-label="Статистика киноархива">
        <HeroStat label="Просмотрено" value={watched.length} detail="фильмов" />
        <HeroStat label="В планах" value={watchlist.length} detail="на следующий вечер" />
        <HeroStat label="Средняя оценка" value={averageRating} detail={rated.length ? `по ${rated.length} оценкам` : "пока нет оценок"} />
        <HeroStat label="Время в кино" value={formatRuntime(totalRuntime)} detail="за всё время" />
      </section>

      <section className="home-cinema-collection">
        <div className="home-cinema-section-head">
          <div>
            <p className="home-cinema-section-kicker">Твоя полка</p>
            <h2>Фильмы</h2>
          </div>
          <button type="button" className="home-cinema-text-link" onClick={() => navigate("/films")}>
            Весь архив <ArrowRight size={16} />
          </button>
        </div>

        <div className="home-cinema-shelf-toolbar">
          <div className="home-cinema-tabs" role="group" aria-label="Фильтры коллекции">
            <ShelfTab active={activeShelf === "recent"} label="Недавно добавлены" count={movies.length} onClick={() => setActiveShelf("recent")} />
            <ShelfTab active={activeShelf === "watched"} label="Просмотрено" count={watched.length} onClick={() => setActiveShelf("watched")} />
            <ShelfTab active={activeShelf === "watchlist"} label="К просмотру" count={watchlist.length} onClick={() => setActiveShelf("watchlist")} />
          </div>
          <button type="button" className="home-cinema-add-inline" onClick={onAddMovie}><Plus size={15} /> Добавить фильм</button>
        </div>

        <div className="home-cinema-mood-bar" role="group" aria-label="Фильтровать фильмы по настроению">
          <span className="home-cinema-mood-bar__label">Настроение</span>
          {MOOD_FILTERS.map((mood) => (
            <button
              key={mood.key}
              type="button"
              className={`home-cinema-mood-chip ${activeMood === mood.key ? "is-active" : ""}`}
              aria-pressed={activeMood === mood.key}
              onClick={() => setActiveMood(mood.key)}
            >
              {mood.label}
            </button>
          ))}
        </div>

        {shelfMovies.length ? (
          <div className="home-cinema-rail" aria-label={`Фильмы: ${activeShelf}`}>
            {shelfMovies.map((movie, index) => (
              <div className="home-cinema-rail__item" key={`${movie.id}-${movie.status || "movie"}`}>
                <MovieCard movie={movie} index={index} />
              </div>
            ))}
          </div>
        ) : shelfSource.length > 0 && activeMood !== "all" ? (
          <div className="home-cinema-mood-empty">
            <Sparkles size={19} />
            <p>В этой полке нет фильмов под выбранное настроение.</p>
            <button type="button" onClick={() => setActiveMood("all")}>Показать все фильмы</button>
          </div>
        ) : (
          <EmptyShelf onAddMovie={onAddMovie} />
        )}

        {shelfCount > shelfMovies.length && (
          <div className="home-cinema-rail-footer">
            <span>Показано {shelfMovies.length} из {shelfCount}</span>
            <button type="button" className="home-cinema-text-link" onClick={() => navigate(activeShelf === "watched" ? "/watched" : activeShelf === "watchlist" ? "/watchlist" : "/films")}>
              Открыть список <ArrowRight size={15} />
            </button>
          </div>
        )}
      </section>

      <section className="home-cinema-discovery" aria-label="Другие возможности">
        <button type="button" className="home-cinema-discovery__item" onClick={() => navigate("/recommendations")}>
          <span className="home-cinema-discovery__icon"><Sparkles size={19} strokeWidth={1.6} /></span>
          <span className="home-cinema-discovery__copy">
            <span>Подбор для тебя</span>
            <strong>Найди следующий любимый фильм</strong>
          </span>
          <ArrowRight className="home-cinema-discovery__arrow" size={18} />
        </button>
        <button type="button" className="home-cinema-discovery__item" onClick={() => navigate("/together")}>
          <span className="home-cinema-discovery__icon"><Users size={19} strokeWidth={1.6} /></span>
          <span className="home-cinema-discovery__copy">
            <span>Смотреть вместе</span>
            <strong>Сравнивайте вкусы и ищите совпадения</strong>
          </span>
          <ArrowRight className="home-cinema-discovery__arrow" size={18} />
        </button>
      </section>
    </div>
  );
}
