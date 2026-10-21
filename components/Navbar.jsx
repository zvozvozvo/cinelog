import { useState } from "react";
import {
  BarChart3,
  Bookmark,
  Clock3,
  Film,
  Home,
  Plus,
  Search,
  Sparkles,
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
      { name: "К просмотру", path: "/watchlist", icon: Bookmark },
      { name: "История", path: "/timeline", icon: Clock3 },
      { name: "Статистика", path: "/statistics", icon: BarChart3 },
    ],
  },
  {
    label: "Вместе интереснее",
    items: [
      { name: "Смотреть вместе", path: "/together", icon: Users },
      { name: "Рекомендации", path: "/recommendations", icon: Sparkles },
      { name: "Профиль", path: "/profile", icon: UserRound },
    ],
  },
];

const mobileLinks = [
  { name: "Главная", path: "/", icon: Home },
  { name: "Фильмы", path: "/films", icon: Film },
  { name: "К просмотру", path: "/watchlist", icon: Bookmark },
  { name: "Статистика", path: "/statistics", icon: BarChart3 },
  { name: "Профиль", path: "/profile", icon: UserRound },
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

function isPathActive(path, pathname) {
  if (path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

export default function Navbar({ onAddMovie }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState("");

  function submitSearch(event) {
    event.preventDefault();
    const query = globalSearch.trim();
    navigate(query ? `/films?q=${encodeURIComponent(query)}` : "/films");
  }

  function renderLink(link, mobile = false) {
    const active = isPathActive(link.path, location.pathname);
    const Icon = link.icon;

    return (
      <button
        key={link.path}
        type="button"
        onClick={() => navigate(link.path)}
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
        <button type="button" onClick={() => navigate("/")} className="cine-brand" aria-label="CineLog — на главную">
          <CineLogMark />
          <span className="cine-brand__word">CineLog<span>.</span></span>
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
        <button type="button" className="cine-mobile-brand" onClick={() => navigate("/")} aria-label="CineLog — на главную">
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
            <button type="button" className="cine-global-search__clear" aria-label="Очистить поиск" onClick={() => setGlobalSearch("")}>
              <X size={15} />
            </button>
          )}
          <kbd>↵</kbd>
        </form>

        <div className="app-topbar__actions">
          <button type="button" onClick={onAddMovie} className="cine-topbar-add" aria-label="Добавить фильм">
            <Plus size={17} />
            <span>Добавить фильм</span>
          </button>
          <button type="button" onClick={() => navigate("/profile")} className={`cine-topbar-avatar ${isPathActive("/profile", location.pathname) ? "is-active" : ""}`} aria-label="Открыть профиль" title="Профиль">
            <UserRound size={19} strokeWidth={1.7} />
          </button>
        </div>
      </header>

      <nav className="cine-mobile-nav" aria-label="Мобильная навигация">
        {mobileLinks.map((link) => renderLink(link, true))}
      </nav>
    </>
  );
}
