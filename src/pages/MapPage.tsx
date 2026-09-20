import { useState } from "react";
import { Link } from "react-router-dom";
import { BostonMap } from "../components/BostonMap";
import type { Restaurant } from "../types";
import { restaurants, neighborhoods } from "../data/restaurants";
import { FOOD_KINDS, foodKind, type FoodKindId } from "../lib/foodKind";

export function MapPage() {
  const [kind, setKind] = useState<FoodKindId | "all">("all");
  const [active, setActive] = useState<Restaurant | null>(null);

  const visible = restaurants.filter((r) => kind === "all" || foodKind(r).id === kind);

  return (
    <div className="grid min-h-[calc(100svh-3.25rem)] lg:grid-cols-[1fr_320px]">
      <BostonMap
        className="min-h-[480px] lg:h-full"
        height="100%"
        activeIds={visible.map((r) => r.id)}
        selectedId={active?.id}
        onSelect={setActive}
        legend={false}
      />
      <aside className="border-t border-line px-6 py-7 lg:border-t-0 lg:border-l">
        <p className="kicker">Boston</p>
        <h1 className="font-serif mt-2 text-[1.75rem] tracking-tight">Food map</h1>
        <ul className="mt-6 space-y-2 text-[13px]">
          <li>
            <button
              type="button"
              onClick={() => setKind("all")}
              className={kind === "all" ? "text-ink" : "text-muted hover:text-ink"}
            >
              All kitchens
            </button>
          </li>
          {FOOD_KINDS.map((k) => (
            <li key={k.id}>
              <button
                type="button"
                onClick={() => setKind(k.id)}
                className={`flex items-center gap-2.5 ${kind === k.id ? "text-ink" : "text-muted hover:text-ink"}`}
              >
                <span className="inline-block h-2 w-2 rounded-full" style={{ background: k.color }} />
                {k.label}
              </button>
            </li>
          ))}
        </ul>
        {active ? (
          <div className="mt-8 border-t border-line pt-8">
            <img src={active.hero.url} alt="" className="aspect-[4/5] w-full object-cover" />
            <p className="kicker mt-4">{foodKind(active).label}</p>
            <h2 className="font-serif mt-1 text-[1.4rem] tracking-tight">{active.name}</h2>
            <p className="mt-1 text-[13px] text-muted">
              {active.cuisine[0]} · {active.neighborhood} · {active.price}
            </p>
            <p className="mt-3 text-[14px] leading-relaxed">{active.blurb}</p>
            <Link
              to={`/restaurant/${active.id}`}
              className="mt-4 inline-block text-[13px] underline decoration-ink/25 underline-offset-4"
            >
              Profile
            </Link>
          </div>
        ) : (
          <p className="mt-8 text-[13px] leading-relaxed text-muted">
            {neighborhoods.length} neighborhoods. {visible.length} kitchens on this filter. Pins are food types — click one.
          </p>
        )}
      </aside>
    </div>
  );
}
