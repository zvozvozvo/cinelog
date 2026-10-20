import { Clapperboard, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { number: "01", name: "Фильмы", path: "/films" },
  { number: "02", name: "К просмотру", path: "/watchlist" },
  { number: "03", name: "История", path: "/timeline" },
  { number: "04", name: "Статистика", path: "/statistics" },
  { number: "05", name: "Вместе", path: "/together" },
  { number: "06", name: "Рекомендации", path: "/recommendations" },
  { number: "07", name: "Профиль", path: "/profile" },
];

export default function Navbar({ onAddMovie }) {
  const navigate = useNavigate();
  const location = useLocation();

  function isActive(path) {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  return (
    <header className="relative z-50 border-b border-[var(--line)]">
      <nav className="flex min-h-[82px] items-center justify-between gap-6">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group flex shrink-0 items-center gap-3 text-left"
          aria-label="На главную CineLog"
        >
          <span className="grid h-9 w-9 place-items-center border border-[var(--line-strong)] bg-[#0a0d0a] text-[var(--acid)] transition-colors group-hover:border-[var(--acid)]/50">
            <Clapperboard size={16} strokeWidth={1.7} />
          </span>

          <span>
            <span className="block cine-serif text-[28px] leading-none tracking-[-.05em] text-[var(--paper)]">
              CineLog
            </span>
            <span className="mt-1.5 hidden cine-mono text-[7px] uppercase tracking-[.17em] text-white/25 sm:block">
              Личный киноархив
            </span>
          </span>
        </button>

        <div className="hidden items-center gap-5 xl:flex 2xl:gap-7">
          {links.map((link) => {
            const active = isActive(link.path);

            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                aria-current={active ? "page" : undefined}
                className={`relative flex items-center gap-2 py-3 cine-mono text-[10px] uppercase tracking-[.15em] transition-colors ${
                  active
                    ? "text-[var(--acid)]"
                    : "text-white/35 hover:text-white/80"
                }`}
              >
                <span className="text-[7px] text-white/20">
                  {link.number}
                </span>
                {link.name}
                {active && (
                  <span className="absolute -bottom-px left-0 h-px w-full bg-[var(--acid)]" />
                )}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onAddMovie}
          className="cine-button cine-button--solid min-h-[40px] shrink-0 border-0 px-4 sm:px-5"
        >
          <Plus size={14} strokeWidth={1.8} />
          <span className="hidden sm:inline">Добавить фильм</span>
          <span className="sm:hidden">Добавить</span>
        </button>
      </nav>

      <div className="-mx-0 flex gap-6 overflow-x-auto border-t border-[var(--line)] xl:hidden">
        {links.map((link) => {
          const active = isActive(link.path);

          return (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 py-3 cine-mono text-[9px] uppercase tracking-[.13em] transition-colors ${
                active
                  ? "text-[var(--acid)]"
                  : "text-white/35 hover:text-white/75"
              }`}
            >
              <span className="mr-1.5 text-[7px] text-white/20">
                {link.number}
              </span>
              {link.name}
            </button>
          );
        })}
      </div>
    </header>
  );
}
