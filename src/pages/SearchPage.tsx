import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { parseIntent } from "../lib/ai/intent";
import { recommend, thinkingSteps, distanceFromMit } from "../lib/recommendations/engine";
import { SearchBox } from "../components/SearchBox";

function Signal({ label, n }: { label: string; n: number }) {
  return (
    <div className="mt-3">
      <div className="flex justify-between text-[11px] tracking-[0.04em] text-muted">
        <span>{label}</span>
        <span className="tabular-nums">{n}</span>
      </div>
      <div className="mt-1.5 h-px bg-ink/10">
        <div className="h-px bg-ink" style={{ width: `${n}%` }} />
      </div>
    </div>
  );
}

export function SearchPage() {
  const [params] = useSearchParams();
  const q = params.get("q") ?? "";
  const intent = useMemo(() => parseIntent(q), [q]);
  const results = useMemo(() => recommend(intent, 8), [intent]);
  const steps = useMemo(() => thinkingSteps(intent), [intent]);
  const [ready, setReady] = useState(false);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    setReady(false);
    setShown(0);
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      setShown(steps.length);
      setReady(true);
      return;
    }
    const timers = steps.map((_, i) => window.setTimeout(() => setShown(i + 1), 240 + i * 280));
    timers.push(window.setTimeout(() => setReady(true), 240 + steps.length * 280 + 180));
    return () => timers.forEach(clearTimeout);
  }, [q, steps]);

  return (
    <div className="page py-12 lg:py-16">
      <div className="max-w-2xl">
        <SearchBox key={q} initial={q} />
      </div>
      {q ? (
        <h1 className="font-serif mt-8 max-w-3xl text-[clamp(1.7rem,4vw,2.6rem)] leading-[1.15] tracking-tight">
          <span className="italic">“{q}”</span>
        </h1>
      ) : (
        <h1 className="font-serif mt-8 text-3xl tracking-tight">Search</h1>
      )}

      {!ready ? (
        <ol className="mt-10 min-h-[40vh] max-w-xl space-y-3 text-[15px] text-muted">
          {steps.slice(0, shown).map((s, i) => (
            <li key={s} className="flex gap-4">
              <span className="tabular-nums text-[12px] text-ink/35">{String(i + 1).padStart(2, "0")}</span>
              {s}
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-10">
          <p className="kicker">
            {results.length} matches · ranked by intent, not raw stars
          </p>
          <div className="mt-2">
            {results.map((item, i) => (
              <article key={item.restaurant.id} className="grid gap-8 border-t border-line py-10 md:grid-cols-12">
                <Link
                  to={`/restaurant/${item.restaurant.id}?q=${encodeURIComponent(q)}`}
                  className="md:col-span-4"
                >
                  <img
                    src={item.restaurant.hero.url}
                    alt=""
                    className="aspect-[4/5] w-full object-cover sm:aspect-[4/3]"
                  />
                </Link>
                <div className="md:col-span-5">
                  <p className="text-[12px] tabular-nums text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </p>
                  <h2 className="font-serif mt-2 text-[2rem] leading-[1.05] tracking-tight">
                    <Link to={`/restaurant/${item.restaurant.id}?q=${encodeURIComponent(q)}`}>
                      {item.restaurant.name}
                    </Link>
                  </h2>
                  <p className="mt-2 text-[13px] text-muted">
                    {item.restaurant.cuisine.join(" · ")} · {item.restaurant.neighborhood} ·{" "}
                    {item.restaurant.price} · {distanceFromMit(item.restaurant).toFixed(1)} mi from MIT
                  </p>
                  <p className="mt-5 max-w-md text-[16px] leading-relaxed">{item.reasons[0]}</p>
                  <p className="mt-4 max-w-md text-[13px] leading-6 text-muted">
                    {item.restaurant.matchSignals.slice(0, 5).join("  ·  ")}
                  </p>
                </div>
                <div className="md:col-span-3 md:pt-8">
                  <p className="kicker">Signals</p>
                  <Signal label="Intent" n={item.breakdown.intent} />
                  <Signal label="Food" n={item.breakdown.food} />
                  <Signal label="Atmosphere" n={item.breakdown.atmosphere} />
                  <Signal label="Location" n={item.breakdown.location} />
                  <Signal label="Budget" n={item.breakdown.budget} />
                </div>
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
