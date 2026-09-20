import { Link, useSearchParams } from "react-router-dom";
import { getTrail, trails } from "../data/trails";
import { getRestaurant } from "../data/restaurants";

export function PlanPage() {
  const [params] = useSearchParams();
  const trail = getTrail(params.get("trail") ?? "") ?? trails[0];

  return (
    <div className="page max-w-[760px] py-14 lg:py-20">
      <p className="kicker">A night in the city</p>
      <h1 className="font-serif mt-4 text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.03em]">
        {trail.title}
      </h1>
      <p className="mt-4 text-[17px] text-muted">{trail.subtitle}</p>
      <p className="mt-2 text-[13px] text-muted">
        {trail.duration} · {trail.total} · {trail.start}
      </p>

      <ol className="mt-14">
        {trail.stops.map((stop, i) => {
          const r = getRestaurant(stop.restaurantId);
          return (
            <li key={`${stop.time}-${i}`} className="grid grid-cols-[5.5rem_1fr] gap-6 border-t border-line py-7">
              <p className="pt-1 text-[13px] tabular-nums text-muted">{stop.time}</p>
              <div>
                <p className="kicker">{stop.course}</p>
                <h2 className="font-serif mt-2 text-[1.75rem] tracking-tight">
                  {r ? <Link to={`/restaurant/${r.id}`}>{r.name}</Link> : stop.restaurantId}
                </h2>
                {r ? (
                  <p className="mt-1 text-[13px] text-muted">
                    {r.neighborhood} · {r.price} · about ${stop.cost}
                  </p>
                ) : null}
                <p className="mt-3 max-w-md text-[15px] leading-relaxed">{stop.note}</p>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-line pt-8">
        <p className="kicker">Other trails</p>
        <ul className="mt-4 space-y-2">
          {trails.map((t) => (
            <li key={t.id}>
              <Link
                to={`/plan?trail=${t.id}`}
                className={t.id === trail.id ? "text-ink" : "text-muted hover:text-ink"}
              >
                {t.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
