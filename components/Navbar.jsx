import { Plus, Clapperboard } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

const links = [
  { name: "Films", path: "/films" },
  { name: "Watchlist", path: "/watchlist" },
  { name: "Timeline", path: "/timeline" },
  { name: "Together", path: "/together" },
  { name: "Statistics", path: "/statistics" },
];

export default function Navbar({ onAddMovie }) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => {
    if (path === "/films") {
      return (
        location.pathname === "/films" ||
        location.pathname.startsWith("/movie/")
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };

  return (
    <header className="relative z-50 border-b border-[var(--line)]">
      <nav className="flex min-h-[92px] items-center justify-between gap-8">
        {/* BRAND */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="group flex shrink-0 items-center gap-4 text-left"
          aria-label="CineLog home"
        >
          <span
            className="
              grid
              h-10
              w-10
              place-items-center
              border
              border-[var(--line-strong)]
              bg-transparent
              text-[var(--acid)]
              transition-colors
              duration-200
              group-hover:border-[var(--acid)]
            "
          >
            <Clapperboard
              size={18}
              strokeWidth={1.5}
            />
          </span>

          <span>
            <span
              className="
                block
                cine-serif
                text-[29px]
                leading-none
                tracking-[-.05em]
                text-white
              "
            >
              CineLog
            </span>

            <span
              className="
                mt-1.5
                block
                cine-mono
                text-[7px]
                uppercase
                tracking-[.2em]
                text-white/28
              "
            >
              Personal cinema archive
            </span>
          </span>
        </button>

        {/* DESKTOP NAVIGATION */}
        <div className="hidden items-center lg:flex">
          {links.map((link, index) => {
            const active = isActive(link.path);

            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                className={`
                  group/nav
                  relative
                  flex
                  min-h-[92px]
                  items-center
                  px-5
                  cine-mono
                  text-[9px]
                  font-medium
                  uppercase
                  tracking-[.15em]
                  transition-colors
                  duration-200
                  ${
                    active
                      ? "text-[var(--acid)]"
                      : "text-white/35 hover:text-white/75"
                  }
                `}
              >
                <span
                  className="
                    mr-2
                    text-[7px]
                    text-white/15
                    transition-colors
                    duration-200
                    group-hover/nav:text-white/30
                  "
                >
                  {String(index + 1).padStart(2, "0")}
                </span>

                {link.name}

                <span
                  className={`
                    absolute
                    bottom-0
                    left-5
                    right-5
                    h-px
                    origin-left
                    bg-[var(--acid)]
                    transition-transform
                    duration-200
                    ${
                      active
                        ? "scale-x-100"
                        : "scale-x-0 group-hover/nav:scale-x-100"
                    }
                  `}
                />
              </button>
            );
          })}
        </div>

        {/* ADD FILM */}
        <button
          type="button"
          onClick={onAddMovie}
          className="
            flex
            h-11
            shrink-0
            items-center
            gap-2.5
            border
            border-[var(--acid)]
            bg-[var(--acid)]
            px-4
            cine-mono
            text-[9px]
            font-bold
            uppercase
            tracking-[.12em]
            text-black
            transition-all
            duration-200
            hover:bg-[#c8ff73]
            active:translate-y-px
          "
        >
          <Plus
            size={15}
            strokeWidth={2.3}
          />

          <span className="hidden sm:inline">
            Add film
          </span>

          <span className="sm:hidden">
            Add
          </span>
        </button>
      </nav>

      {/* MOBILE NAVIGATION */}
      <div className="cine-mobile-nav flex overflow-x-auto border-t border-[var(--line)] lg:hidden">
        {links.map((link, index) => {
          const active = isActive(link.path);

          return (
            <button
              key={link.path}
              type="button"
              onClick={() => navigate(link.path)}
              className={`
                relative
                mr-7
                shrink-0
                py-4
                cine-mono
                text-[8px]
                uppercase
                tracking-[.15em]
                transition-colors
                duration-200
                ${
                  active
                    ? "text-[var(--acid)]"
                    : "text-white/35"
                }
              `}
            >
              <span className="mr-1.5 text-white/15">
                {String(index + 1).padStart(2, "0")}
              </span>

              {link.name}

              {active && (
                <span className="absolute bottom-0 left-0 right-0 h-px bg-[var(--acid)]" />
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
}
