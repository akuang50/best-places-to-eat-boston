import { Link, useParams, useSearchParams } from "react-router-dom";
import { getRestaurant } from "../data/restaurants";
import { parseIntent } from "../lib/ai/intent";
import { recommend, distanceFromMit } from "../lib/recommendations/engine";

export function RestaurantPage() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const restaurant = id ? getRestaurant(id) : undefined;
  const ranked =
    q && restaurant ? recommend(parseIntent(q), 20).find((r) => r.restaurant.id === restaurant.id) : null;

  if (!restaurant) {
    return (
      <div className="page py-24">
        <p>We don’t have that restaurant in the seed graph.</p>
        <Link to="/" className="mt-4 inline-block text-[13px] tracking-[0.12em] uppercase">
          Back
        </Link>
      </div>
    );
  }

  const reservation =
    restaurant.reservation === true
      ? "Yes"
      : restaurant.reservation === "recommended"
        ? "Recommended"
        : restaurant.reservation === false
          ? "Not needed"
          : "Unknown";

  return (
    <article>
      <figure>
        <img
          src={restaurant.hero.url}
          alt=""
          className="h-[min(72vh,780px)] min-h-[280px] w-full object-cover"
        />
        <figcaption className="page mt-2 text-[11px] text-muted">{restaurant.hero.credit}</figcaption>
      </figure>

      <div className="page pt-8 pb-16 lg:pt-12">
        <p className="kicker">
          {restaurant.cuisine.join(" · ")} · {restaurant.neighborhood} · {restaurant.price}
        </p>
        <h1 className="font-serif mt-3 text-[clamp(2.6rem,7vw,5.2rem)] leading-[0.92] tracking-[-0.03em]">
          {restaurant.name}
        </h1>
        <p className="mt-4 text-[14px] text-muted">
          {restaurant.rating} consensus · {restaurant.reviewCountLabel} reviews ·{" "}
          {distanceFromMit(restaurant).toFixed(1)} mi from MIT
        </p>

        <div className="mt-12 grid gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            {ranked ? (
              <section className="border-t border-line pt-8">
                <p className="kicker">Why this fits</p>
                <p className="font-serif mt-4 text-[1.65rem] leading-snug tracking-tight">
                  {ranked.reasons[0]}
                </p>
                <p className="mt-5 text-[14px] leading-7 text-muted">
                  {restaurant.matchSignals.join("  ·  ")}
                </p>
              </section>
            ) : null}

            <section className="mt-12 border-t border-line pt-8">
              <p className="kicker">Why people go</p>
              <p className="mt-4 max-w-xl text-[18px] leading-[1.55]">{restaurant.blurb}</p>
            </section>

            <section className="mt-12 border-t border-line pt-8">
              <p className="kicker">What people agree on</p>
              <ul className="mt-6 max-w-md space-y-5">
                {restaurant.consensus.map((c) => (
                  <li key={c.theme}>
                    <div className="flex justify-between text-[14px]">
                      <span>{c.theme}</span>
                      <span className="tabular-nums text-muted">{c.positive}%</span>
                    </div>
                    <div className="mt-2 h-px bg-ink/10">
                      <div className="h-px bg-ink" style={{ width: `${c.positive}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              {restaurant.polarizing.length ? (
                <p className="mt-6 text-[13px] text-muted">
                  Mixed on {restaurant.polarizing.join(" · ").toLowerCase()}
                </p>
              ) : null}
            </section>

            <section className="mt-12 border-t border-line pt-8">
              <p className="kicker">Signature dishes</p>
              <p className="mt-4 text-[16px] leading-7">
                {restaurant.signatureDishes.map((d) => d.name).join("  ·  ")}
              </p>
            </section>
          </div>

          <aside className="lg:col-span-5 lg:border-l lg:border-line lg:pl-12">
            <dl className="space-y-4 text-[14px]">
              <div>
                <dt className="kicker">Address</dt>
                <dd className="mt-1">{restaurant.address}</dd>
              </div>
              <div>
                <dt className="kicker">Hours</dt>
                <dd className="mt-1">{restaurant.openNote}</dd>
              </div>
              <div>
                <dt className="kicker">Noise</dt>
                <dd className="mt-1">{restaurant.noise}</dd>
              </div>
              <div>
                <dt className="kicker">Reservations</dt>
                <dd className="mt-1">{reservation}</dd>
              </div>
              <div>
                <dt className="kicker">Verified</dt>
                <dd className="mt-1">{restaurant.lastVerified}</dd>
              </div>
            </dl>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-[13px]">
              {restaurant.website ? (
                <a href={restaurant.website} target="_blank" rel="noreferrer" className="underline decoration-ink/25 underline-offset-4">
                  Website
                </a>
              ) : null}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.address)}`}
                target="_blank"
                rel="noreferrer"
                className="underline decoration-ink/25 underline-offset-4"
              >
                Directions
              </a>
              <Link
                to={`/compare?ids=${restaurant.id},${restaurant.id === "fox-and-the-knife" ? "giulia" : "fox-and-the-knife"}`}
                className="underline decoration-ink/25 underline-offset-4"
              >
                Compare
              </Link>
            </div>

            <div className="mt-10 grid grid-cols-2 gap-3">
              {restaurant.gallery.map((g) => (
                <figure key={g.url}>
                  <img src={g.url} alt="" className="aspect-[4/5] w-full object-cover" />
                  <figcaption className="mt-1.5 text-[10px] leading-snug text-muted">{g.credit}</figcaption>
                </figure>
              ))}
            </div>

            {ranked?.evidence.length ? (
              <section className="mt-12 border-t border-line pt-8">
                <p className="kicker">Evidence</p>
                <ul className="mt-4 space-y-5">
                  {ranked.evidence.map((e) => (
                    <li key={e.claim} className="text-[14px] leading-relaxed">
                      {e.claim}
                      <span className="mt-1 block text-[12px] text-muted">
                        {e.sourceIds
                          .map((sid) => restaurant.sources.find((s) => s.id === sid)?.publisher ?? sid)
                          .join(" · ")}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <section className="mt-12 border-t border-line pt-8">
              <p className="kicker">Sources</p>
              <ul className="mt-4">
                {restaurant.sources.map((s) => (
                  <li key={s.id} className="flex justify-between gap-4 border-b border-line py-2.5 text-[13px]">
                    <span>{s.publisher}</span>
                    <span className="text-muted">{s.type.replace("_", " ")}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-[12px] leading-relaxed text-muted">
                Consensus figures are demo-seed review intelligence, not live quotes. Dishes and hours are not invented.
              </p>
            </section>
          </aside>
        </div>
      </div>
    </article>
  );
}
