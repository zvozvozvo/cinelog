import { useMemo } from "react";
import { ArrowRight, Bookmark, Film, Plus, Sparkles, Star, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

import MovieCard from "../components/MovieCard";
import MoviePoster from "../components/MoviePoster";
import { getBackdrop } from "../src/tmdb";

function formatTime(totalMinutes) {
  const value = Number(totalMinutes);
  if (!Number.isFinite(value) || value <= 0) return "0 ч";
  const hours = Math.floor(value / 60);
  const days = Math.floor(hours / 24);
  const restHours = hours % 24;
  if (days > 0) return restHours ? `${days} д ${restHours} ч` : `${days} д`;
  return `${hours} ч`;
}

function SectionHeading({ number, title, action, onAction }) {
  return (
    <div className="home-section__heading">
      <div className="home-section__title-wrap">
        <span className="home-section__number">{number}</span>
        <h2>{title}</h2>
      </div>
      {action && (
        <button type="button" className="home-section__action" onClick={onAction}>
          {action}<ArrowRight size={16} strokeWidth={1.8} />
        </button>
      )}
    </div>
  );
}

function EmptyLibrary({ onAddMovie }) {
  return (
    <div className="cine-home-empty">
      <span className="cine-home-empty__icon"><Film size={24} strokeWidth={1.4} /></span>
      <h3>Твоя история начинается с первого фильма</h3>
      <p>Добавь то, что уже посмотрел, или сохрани фильм на потом. Архив постепенно станет отражением твоего вкуса.</p>
      <button type="button" className="cine-button cine-button--solid" onClick={onAddMovie}>
        <Plus size={16} /> Добавить первый фильм
      </button>
    </div>
  );
}

function DiscoveryTile({ icon: Icon, eyebrow, title, description, action, onClick, featured = false }) {
  return (
    <button type="button" className={`cine-discovery-tile ${featured ? "is-featured" : ""}`} onClick={onClick}>
      <span className="cine-discovery-tile__icon"><Icon size={19} strokeWidth={1.7} /></span>
      <span className="cine-discovery-tile__copy">
        <span className="cine-discovery-tile__eyebrow">{eyebrow}</span>
        <strong>{title}</strong>
        <small>{description}</small>
        <span className="cine-discovery-tile__action">{action} <ArrowRight size={14} /></span>
      </span>
    </button>
  );
}

export default function Home({ movies = [], onAddMovie }) {
  const navigate = useNavigate();

  const watched = useMemo(() => movies.filter((movie) => movie.status === "watched"), [movies]);
  const watchlist = useMemo(() => movies.filter((movie) => movie.status === "watchlist"), [movies]);
  const recent = useMemo(() => [...movies].sort((a, b) => new Date(b.addedAt || b.added_at || 0) - new Date(a.addedAt || a.added_at || 0)).slice(0, 6), [movies]);
  const rated = useMemo(() => watched.filter((movie) => Number(movie.personalRating ?? movie.youRating ?? 0) > 0), [watched]);
  const topRated = useMemo(() => [...rated].sort((a, b) => Number(b.personalRating ?? b.youRating ?? 0) - Number(a.personalRating ?? a.youRating ?? 0)).slice(0, 6), [rated]);
  const featured = topRated[0] || watched[0] || null;
  const heroMovie = topRated.find((movie) => movie.backdrop_path || movie.backdrop || movie.backdropUrl)
    || watched.find((movie) => movie.backdrop_path || movie.backdrop || movie.backdropUrl)
    || null;
  const heroBackdropSource = heroMovie?.backdrop_path || heroMovie?.backdrop || heroMovie?.backdropUrl;
  const heroBackdrop = heroBackdropSource
    ? (/^https?:\/\//i.test(String(heroBackdropSource)) ? String(heroBackdropSource) : getBackdrop(String(heroBackdropSource), "original"))
    : null;
  const averageRating = rated.length ? (rated.reduce((sum, movie) => sum + Number(movie.personalRating ?? movie.youRating), 0) / rated.length).toFixed(1) : "—";
  const totalRuntime = watched.reduce((sum, movie) => sum + (Number(movie.runtime) > 0 ? Number(movie.runtime) : 0), 0);

  return (
    <div className="cine-home cine-page-enter">
      <section className="home-dashboard-hero" style={heroBackdrop ? { "--home-hero-image": `url("${heroBackdrop}")` } : undefined}>
        <div className="home-dashboard-hero__content">
          <p className="home-dashboard-hero__eyebrow"><span /> ЛИЧНЫЙ КИНОАРХИВ <span className="home-dashboard-hero__year">2026</span></p>
          <h1>Твоя история<br /><span>кино.</span></h1>
          <p className="home-dashboard-hero__description">Сохраняй. Оценивай. Открывай заново.</p>
          <div className="home-dashboard-hero__actions">
            <button type="button" className="cine-button cine-button--solid" onClick={() => navigate("/films")}>Открыть архив <ArrowRight size={17} /></button>
            <button type="button" className="cine-button cine-button--glass" onClick={onAddMovie}><Plus size={16} /> Добавить фильм</button>
          </div>
        </div>
        <div className="home-dashboard-stats" aria-label="Статистика твоего архива">
          <div className="home-dashboard-stat"><span>Просмотрено</span><strong>{watched.length}</strong><small>фильмов</small></div>
          <div className="home-dashboard-stat"><span>К просмотру</span><strong>{watchlist.length}</strong><small>в списке</small></div>
          <div className="home-dashboard-stat"><span>Средняя оценка</span><strong className="is-accent">{averageRating}</strong><small>из 10</small></div>
          <div className="home-dashboard-stat"><span>Время в кино</span><strong>{formatTime(totalRuntime)}</strong><small>за всё время</small></div>
        </div>
      </section>

      <section className="cine-discovery-row" aria-label="Открыть другие разделы CineLog">
        <DiscoveryTile
          icon={Sparkles}
          eyebrow="ПЕРСОНАЛЬНЫЙ ПОДБОР"
          title="Что посмотреть дальше?"
          description="Фильмы на основе твоих оценок и вкуса."
          action="Подобрать"
          onClick={() => navigate("/recommendations")}
          featured
        />
        <DiscoveryTile
          icon={Users}
          eyebrow="КИНО ВДВОЁМ"
          title="Наше кино"
          description="Сравнивайте оценки и ищите общие фавориты."
          action="Открыть раздел"
          onClick={() => navigate("/together")}
        />
      </section>

      {movies.length === 0 ? (
        <EmptyLibrary onAddMovie={onAddMovie} />
      ) : (
        <>
          <section className="home-section">
            <SectionHeading number="01" title="Недавно добавленные" action="Все фильмы" onAction={() => navigate("/films")} />
            <div className="cine-grid cine-grid--wide cine-grid--editorial">
              {recent.map((movie, index) => <MovieCard key={`${movie.id}-${movie.addedAt || movie.added_at || index}`} movie={movie} index={index} />)}
            </div>
          </section>

          {featured && (
            <section className="home-section">
              <SectionHeading number="02" title="Твой фаворит" action="Открыть карточку" onAction={() => navigate(`/movie/${featured.id}`)} />
              <button type="button" className="cine-featured-film" onClick={() => navigate(`/movie/${featured.id}`)}>
                <div className="cine-featured-film__art relative">
                  <MoviePoster movie={featured} alt={`Постер фильма «${featured.title || featured.name || "Фильм"}»`} size="w500" className="absolute inset-0 h-full w-full object-cover" />
                </div>
                <div className="cine-featured-film__copy">
                  <span className="cine-featured-film__eyebrow">САМЫЙ ВЫСОКИЙ РЕЙТИНГ В АРХИВЕ</span>
                  <h3>{featured.title || featured.name || featured.originalTitle || "Фильм без названия"}</h3>
                  <p>{featured.release_date?.slice(0, 4) || featured.releaseDate?.slice(0, 4) || featured.year || "Год неизвестен"}{featured.genres?.length ? ` · ${featured.genres.map((genre) => typeof genre === "string" ? genre : genre?.name).filter(Boolean).slice(0, 2).join(" · ")}` : ""}</p>
                  {featured.overview && <span className="cine-featured-film__overview">{featured.overview}</span>}
                </div>
                <div className="cine-featured-film__rating"><Star size={15} fill="currentColor" /> {Number(featured.personalRating ?? featured.youRating ?? 0) > 0 ? Number(featured.personalRating ?? featured.youRating).toFixed(1) : "—"}<ArrowRight size={18} /></div>
              </button>
            </section>
          )}

          {watchlist.length > 0 && (
            <section className="home-section">
              <SectionHeading number="03" title="На потом" action="Открыть список" onAction={() => navigate("/watchlist")} />
              <div className="cine-grid cine-grid--wide cine-grid--editorial">
                {watchlist.slice(0, 6).map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} />)}
              </div>
            </section>
          )}

          {topRated.length > 0 && (
            <section className="home-section">
              <SectionHeading number="04" title="Мои оценки" action="Все оценки" onAction={() => navigate("/rated")} />
              <div className="cine-grid cine-grid--wide cine-grid--editorial">
                {topRated.map((movie, index) => <MovieCard key={movie.id} movie={movie} index={index} />)}
              </div>
            </section>
          )}
        </>
      )}

      <section className="cine-home-endnote">
        <span>CINELOG / ЛИЧНЫЙ КИНОАРХИВ</span>
        <span>Каждый фильм оставляет след.</span>
      </section>
    </div>
  );
}
