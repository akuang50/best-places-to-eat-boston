import { Link } from "react-router-dom";
import type { RankedRestaurant, Restaurant } from "../types";
import { distanceFromMit } from "../lib/recommendations/engine";

export function priceLabel(p: Restaurant["price"]) {
  return p;
}

export function RestaurantCard({
  ranked,
  restaurant,
  to,
  featured = false,
  compact = false,
}: {
  ranked?: RankedRestaurant;
  restaurant?: Restaurant;
  to?: string;
  featured?: boolean;
  compact?: boolean;
}) {
  const r = ranked?.restaurant ?? restaurant;
  if (!r) return null;
  const href = to ?? `/restaurant/${r.id}`;
  const miles = distanceFromMit(r);
  const blurb = ranked?.reasons[0] ?? r.blurb;
  const tag = r.emerging ? "Emerging" : r.classic ? "Classic" : r.trending ? "In the city" : null;

  if (compact) {
    return (
      <Link to={href} className="group grid grid-cols-[88px_1fr] gap-4">
        <img src={r.hero.url} alt="" className="aspect-[4/5] h-full w-full object-cover" />
        <div className="min-w-0 self-center">
          {tag ? <p className="kicker mb-1">{tag}</p> : null}
          <h3 className="font-serif text-[20px] leading-tight tracking-tight">{r.name}</h3>
          <p className="mt-1 text-[13px] text-muted">
            {r.cuisine[0]} · {r.neighborhood} · {r.price}
          </p>
        </div>
      </Link>
    );
  }

  return (
    <Link to={href} className="group block">
      <div className={`relative overflow-hidden ${featured ? "aspect-[4/5] sm:aspect-[5/6]" : "aspect-[4/5]"}`}>
        <img src={r.hero.url} alt="" className="h-full w-full object-cover" />
      </div>
      <div className={featured ? "pt-5" : "pt-3.5"}>
        <div className="flex items-baseline justify-between gap-3">
          <p className="kicker">{tag ?? r.neighborhood}</p>
          <span className="text-[13px] tabular-nums text-muted">{r.price}</span>
        </div>
        <h3
          className={`font-serif mt-1.5 leading-[1.05] tracking-tight ${
            featured ? "text-[clamp(1.8rem,3vw,2.6rem)]" : "text-[22px]"
          }`}
        >
          {r.name}
        </h3>
        <p className="mt-1.5 text-[13px] text-muted">
          {r.cuisine[0]} · {r.neighborhood}
          {featured ? ` · ${miles.toFixed(1)} mi from MIT` : ""}
        </p>
        <p className={`mt-3 leading-relaxed text-ink/80 ${featured ? "max-w-md text-[15px]" : "line-clamp-2 text-[13.5px]"}`}>
          {blurb}
        </p>
      </div>
    </Link>
  );
}
