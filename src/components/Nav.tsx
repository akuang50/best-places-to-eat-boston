import { NavLink } from "react-router-dom";

const links = [
  { to: "/map", label: "Map" },
  { to: "/plan", label: "Trails" },
  { to: "/demo", label: "Demo" },
];

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-cream/92 backdrop-blur-[8px]">
      <div className="page flex h-[3.25rem] items-center justify-between">
        <NavLink to="/" end className="flex items-baseline gap-2.5">
          <span className="font-serif text-[18px] tracking-tight">ForkBoston</span>
          <span className="hidden text-[11px] tracking-[0.14em] text-muted uppercase sm:inline">
            Boston
          </span>
        </NavLink>
        <nav className="flex items-center gap-7 text-[11px] tracking-[0.16em] uppercase">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                isActive ? "text-ink" : "text-muted hover:text-ink"
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
