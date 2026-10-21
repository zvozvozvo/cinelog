import { useEffect, useState } from "react";
import {
  BarChart3,
  Bookmark,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Film,
  Home,
  MoreHorizontal,
  Plus,
  Search,
  Sparkles,
  Star,
  UserRound,
  Users,
  X,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const navigationGroups = [
  {
    label: "Обзор",
    items: [{ name: "Главная", path: "/", icon: Home }],
  },
  {
    label: "Моя коллекция",
    items: [
      { name: "Все фильмы", path: "/films", icon: Film },
      { name: "Просмотрено", path: "/watched", icon: CheckCircle2 },
      { name: "Мои оценки", path: "/rated", icon: Star },
      { name: "К просмотру", path: "/watchlist", icon: Bookmark },
      { name: "История", path: "/timeline", icon: Clock3 },
      { name: "Статистика", path: "/statistics", icon: BarChart3 },
    ],
  },
  {
    label: "Кино вдвоём",
    items: [
      { name: "Смотреть вместе", path: "/together", icon: Users },
      { name: "Рекомендации", path: "/recommendations", icon: Sparkles },
      { name: "Профиль", path: "/profile", icon: UserRound },
    ],
  },
];

const mobileMoreLinks = [
  { name: "Мои оценки", description: "Фильмы, которым ты поставил оценку", path: "/rated", icon: Star },
  { name: "Просмотрено", description: "Всё, что ты уже посмотрел", path: "/watched", icon: CheckCircle2 },
  { name: "К просмотру", description: "Список фильмов на потом", path: "/watchlist", icon: Bookmark },
  { name: "История", description: "Хронология твоих записей", path: "/timeline", icon: Clock3 },
  { name: "Статистика", description: "Твой вкус в цифрах", path: "/statistics", icon: BarChart3 },
  { name: "Рекомендации", description: "Что посмотреть дальше", path: "/recommendations", icon: Sparkles },
  { name: "Профиль", description: "Твой профиль и предпочтения", path: "/profile", icon: UserRound },
];

const mobilePrimaryLinks = [
  { name: "Главная", path: "/", icon: Home },
  { name: "Архив", path: "/films", icon: Film },
  { name: "Вместе", path: "/together", icon: Users },
];

function CineLogMark({ compact = false }) {
  return (
    <span className={`cine-mark ${compact ? "cine-mark--compact" : ""}`} aria-hidden="true">
      <span className="cine-mark__corner cine-mark__corner--tl" />
      <span className="cine-mark__corner cine-mark__corner--tr" />
      <span className="cine-mark__corner cine-mark__corner--bl" />
      <span className="cine-mark__corner cine-mark__corner--br" />
      <span className="cine-mark__letter cine-mark__letter--c">C</span>
      <span className="cine-mark__letter cine-mark__letter--l">L</span>
      <span className="cine-mark__pixel" />
    </span>
  );
}

function isArchivePath(pathname) {
  return ["/films", "/watched", "/rated"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

function isPathActive(path, pathname) {
  if (path === "/") return pathname === "/";
  if (path === "/films") return pathname === "/films";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar({ onAddMovie }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState("");
  const [moreOpen, setMoreOpen] = useState(false);

  useEffect(() => {
    setGlobalSearch(new URLSearchParams(location.search).get("q") || "");
    setMoreOpen(false);
  }, [location.pathname, location.search]);

  useEffect(() => {
    if (!moreOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === "Escape") setMoreOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [moreOpen]);

  function goTo(path) {
    setMoreOpen(false);
    navigate(path);
  }

  function submitSearch(event) {
    event.preventDefault();
    const query = globalSearch.trim();
    goTo(query ? `/films?q=${encodeURIComponent(query)}` : "/films");
  }

  function renderLink(link, mobile = false) {
    const active = link.path === "/films"
      ? (mobile ? isArchivePath(location.pathname) : location.pathname === "/films")
      : isPathActive(link.path, location.pathname);
    const Icon = link.icon;

    return (
      <button
        key={link.path}
        type="button"
        onClick={() => goTo(link.path)}
        aria-current={active ? "page" : undefined}
        aria-label={link.name}
        title={mobile ? link.name : undefined}
        className={`cine-nav-link ${active ? "is-active" : ""} ${mobile ? "cine-nav-link--mobile" : ""}`}
      >
        <Icon size={mobile ? 20 : 18} strokeWidth={active ? 2 : 1.7} />
        <span>{link.name}</span>
      </button>
    );
  }

  return (
    <>
      <aside className="app-sidebar">
        <button
          type="button"
          onClick={() => goTo("/")}
          className="cine-brand"
          aria-label="CineLog — на главную"
        >
          <span className="cine-brand__top">
            <CineLogMark />
            <span className="cine-brand__word">CineLog<span>.</span></span>
          </span>
          <span className="cine-brand__tagline">ТВОЯ ИСТОРИЯ КИНО</span>
        </button>

        <div className="cine-sidebar__eyebrow">ТВОЁ КИНОПРОСТРАНСТВО</div>

        <nav className="cine-sidebar__nav" aria-label="Основная навигация">
          {navigationGroups.map((group) => (
            <div className="cine-nav-group" key={group.label}>
              <p className="cine-nav-group__label">{group.label}</p>
              <div className="cine-nav-group__items">
                {group.items.map((link) => renderLink(link))}
              </div>
            </div>
          ))}
        </nav>

        <div className="cine-sidebar__bottom">
          <button type="button" onClick={onAddMovie} className="cine-sidebar__add">
            <Plus size={17} strokeWidth={2} />
            <span>Добавить фильм</span>
          </button>
          <div className="cine-sidebar__signature">
            <span className="cine-sidebar__signature-dot" />
            <span>ЛИЧНЫЙ КИНОАРХИВ</span>
            <span>2026</span>
          </div>
        </div>
      </aside>

      <header className="app-topbar">
        <button
          type="button"
          className="cine-mobile-brand"
          onClick={() => goTo("/")}
          aria-label="CineLog — на главную"
        >
          <CineLogMark compact />
          <span>CineLog<span>.</span></span>
        </button>

        <form className="cine-global-search" onSubmit={submitSearch} role="search">
          <Search size={18} strokeWidth={1.8} aria-hidden="true" />
          <input
            aria-label="Поиск по архиву и фильмам"
            type="search"
            value={globalSearch}
            onChange={(event) => setGlobalSearch(event.target.value)}
            placeholder="Поиск по архиву и фильмам..."
          />
          {globalSearch && (
            <button
              type="button"
              className="cine-global-search__clear"
              aria-label="Очистить поиск"
              onClick={() => setGlobalSearch("")}
            >
              <X size={15} />
            </button>
          )}
          <kbd>↵</kbd>
        </form>

        <div className="app-topbar__actions">
          <button
            type="button"
            onClick={onAddMovie}
            className="cine-topbar-add"
            aria-label="Добавить фильм"
          >
            <Plus size={17} />
            <span>Добавить фильм</span>
          </button>
          <button
            type="button"
            onClick={() => goTo("/profile")}
            className={`cine-topbar-avatar ${isPathActive("/profile", location.pathname) ? "is-active" : ""}`}
            aria-label="Открыть профиль"
            title="Профиль"
          >
            <UserRound size={19} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <nav className="cine-mobile-nav" aria-label="Мобильная навигация">
        {renderLink(mobilePrimaryLinks[0], true)}
        {renderLink(mobilePrimaryLinks[1], true)}
        <button
          type="button"
          className="cine-mobile-nav__add"
          onClick={onAddMovie}
          aria-label="Добавить фильм"
          title="Добавить фильм"
        >
          <Plus size={23} strokeWidth={2.1} />
        </button>
        {renderLink(mobilePrimaryLinks[2], true)}
        <button
          type="button"
          className={`cine-nav-link cine-nav-link--mobile ${moreOpen ? "is-active" : ""} ${mobileMoreLinks.some((item) => isPathActive(item.path, location.pathname)) ? "has-active-child" : ""}`}
          onClick={() => setMoreOpen((value) => !value)}
          aria-expanded={moreOpen}
          aria-controls="cine-mobile-more"
          aria-label="Ещё разделы"
        >
          {moreOpen ? <X size={20} /> : <MoreHorizontal size={20} />}
          <span>Ещё</span>
        </button>
      </nav>

      {moreOpen && (
        <div className="cine-mobile-more-layer">
          <button
            className="cine-mobile-more-backdrop"
            type="button"
            aria-label="Закрыть меню"
            onClick={() => setMoreOpen(false)}
          />
          <section className="cine-mobile-more" id="cine-mobile-more" aria-label="Все разделы CineLog">
            <div className="cine-mobile-more__handle" />
            <div className="cine-mobile-more__heading">
              <div>
                <p>ТВОЁ КИНОПРОСТРАНСТВО</p>
                <h2>Все разделы<span>.</span></h2>
              </div>
              <button type="button" onClick={() => setMoreOpen(false)} aria-label="Закрыть меню">
                <X size={19} />
              </button>
            </div>
            <div className="cine-mobile-more__grid">
              {mobileMoreLinks.map((item) => {
                const Icon = item.icon;
                const active = isPathActive(item.path, location.pathname);
                return (
                  <button
                    type="button"
                    key={item.path}
                    onClick={() => goTo(item.path)}
                    className={`cine-mobile-more__item ${active ? "is-active" : ""}`}
                    aria-current={active ? "page" : undefined}
                  >
                    <span className="cine-mobile-more__icon"><Icon size={19} /></span>
                    <span className="cine-mobile-more__copy">
                      <strong>{item.name}</strong>
                      <small>{item.description}</small>
                    </span>
                    <ChevronRight size={16} className="cine-mobile-more__arrow" />
                  </button>
                );
              })}
            </div>
            <p className="cine-mobile-more__foot"><span /> CineLog · Твоя история кино</p>
          </section>
        </div>
      )}
    </>
  );
}
