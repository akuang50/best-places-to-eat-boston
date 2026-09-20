import { restaurants } from "../data/restaurants";
import { trails } from "../data/trails";
import { prompts } from "../lib/ai/intent";
import { SearchBox } from "../components/SearchBox";
import { RestaurantCard } from "../components/RestaurantCard";
import { Link } from "react-router-dom";
import { BostonMap } from "../components/BostonMap";

export function HomePage() {
  const featured = restaurants.filter((r) => r.trending || r.classic);
  const lead = featured[0];
  const stacked = featured.slice(1, 4);
  const rest = featured.slice(4, 8);
  const emerging = restaurants.filter((r) => r.emerging);

  return (
    <div>
      <section className="page grid items-start gap-x-14 gap-y-10 pt-10 pb-14 lg:grid-cols-12 lg:pt-14 lg:pb-16">
        <div className="lg:col-span-7 lg:pt-2">
          <p className="kicker">Vol. 01 · Boston</p>
          <h1 className="font-serif mt-5 text-[clamp(3.2rem,8vw,6.4rem)] leading-[0.9] tracking-[-0.035em]">
            Where should
            <br />
            you eat?
          </h1>
          <p className="mt-6 max-w-md text-[17px] leading-[1.5] text-muted">
            Tell us what you’re craving. We’ll match it to evidence — menus, neighborhoods, atmosphere — not whoever has the most stars.
          </p>
          <div className="mt-10 max-w-xl">
            <SearchBox large />
          </div>
          <div className="mt-5 flex flex-wrap gap-x-4 gap-y-1.5 text-[13px] text-muted">
            {prompts.slice(0, 7).map((p) => (
              <Link key={p.label} to={`/search?q=${encodeURIComponent(p.query)}`} className="hover:text-ink">
                {p.label}
              </Link>
            ))}
          </div>
        </div>
        {lead ? (
          <Link to={`/restaurant/${lead.id}`} className="hidden lg:col-span-5 lg:block">
            <img src={lead.hero.url} alt="" className="aspect-[4/3] w-full object-cover" />
            <p className="kicker mt-4">{lead.neighborhood}</p>
            <h2 className="font-serif mt-1 text-[1.85rem] tracking-tight">{lead.name}</h2>
            <p className="mt-1 text-[13px] text-muted">
              {lead.cuisine[0]} · {lead.price}
            </p>
          </Link>
        ) : null}
      </section>

      <section className="border-t border-line">
        <div className="page flex items-end justify-between pt-10 pb-6">
          <div>
            <p className="kicker">01</p>
            <h2 className="font-serif mt-2 text-[1.85rem] tracking-tight">The city, mapped</h2>
          </div>
          <Link to="/map" className="text-[13px] tracking-[0.04em] text-muted hover:text-ink">
            Open map
          </Link>
        </div>
        <BostonMap height={440} />
      </section>

      <section className="page py-16 lg:py-20">
        <p className="kicker">02</p>
        <h2 className="font-serif mt-2 text-[1.85rem] tracking-tight">In the city</h2>
        <div className="mt-10 grid gap-x-8 gap-y-12 lg:grid-cols-12">
          {lead ? (
            <div className="lg:hidden">
              <RestaurantCard restaurant={lead} featured />
            </div>
          ) : null}
          <div className="grid content-start gap-x-8 gap-y-12 sm:grid-cols-2 lg:col-span-12 lg:grid-cols-3">
            {stacked.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        </div>
        <div className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {rest.map((r) => (
            <RestaurantCard key={r.id} restaurant={r} />
          ))}
        </div>
      </section>

      {emerging.length ? (
        <section className="border-t border-line">
          <div className="page py-16 lg:py-20">
            <p className="kicker">03</p>
            <h2 className="font-serif mt-2 text-[1.85rem] tracking-tight">Emerging</h2>
            <p className="mt-3 max-w-md text-[15px] leading-relaxed text-muted">
              High sentiment, lower mainstream noise — not a synonym for highest rating.
            </p>
            <div className="mt-10 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {emerging.map((r) => (
                <RestaurantCard key={r.id} restaurant={r} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section className="border-t border-line">
        <div className="page py-16 lg:py-20">
          <p className="kicker">04</p>
          <h2 className="font-serif mt-2 text-[1.85rem] tracking-tight">Food trails</h2>
          <ol className="mt-10">
            {trails.map((t, i) => (
              <li key={t.id} className="border-t border-line">
                <Link to={`/plan?trail=${t.id}`} className="grid gap-2 py-7 sm:grid-cols-[4rem_1fr_auto] sm:items-baseline sm:gap-8">
                  <span className="text-[13px] tabular-nums text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span>
                    <span className="font-serif text-[1.65rem] tracking-tight">{t.title}</span>
                    <span className="mt-1 block text-[14px] text-muted">{t.subtitle}</span>
                  </span>
                  <span className="text-[13px] text-muted">
                    {t.duration} · {t.total}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}
