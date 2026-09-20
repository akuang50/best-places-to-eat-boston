import { Link, useSearchParams } from "react-router-dom";
import { getRestaurant, restaurants } from "../data/restaurants";

export function ComparePage() {
  const [params] = useSearchParams();
  const ids = (params.get("ids") ?? "fox-and-the-knife,giulia").split(",").slice(0, 3);
  const cols = ids.map((id) => getRestaurant(id)).filter(Boolean);

  if (cols.length < 2) {
    return (
      <div className="page py-20">
        <p>Pick two restaurants to compare.</p>
      </div>
    );
  }

  const rows = [
    { label: "Price", get: (i: number) => cols[i]!.price },
    { label: "Neighborhood", get: (i: number) => cols[i]!.neighborhood },
    { label: "Cuisine", get: (i: number) => cols[i]!.cuisine.join(", ") },
    { label: "Atmosphere", get: (i: number) => cols[i]!.atmosphere.join(", ") },
    { label: "Noise", get: (i: number) => cols[i]!.noise },
    { label: "Date night", get: (i: number) => (cols[i]!.occasions.includes("date") ? "Yes" : "—") },
    { label: "Public rating", get: (i: number) => String(cols[i]!.rating) },
  ];

  return (
    <div className="page py-14 lg:py-20">
      <p className="kicker">Side by side</p>
      <h1 className="font-serif mt-3 text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.03em]">
        Where should we go?
      </h1>
      <p className="mt-4 max-w-lg text-[16px] text-muted">
        No objective winner — pick the night you actually want.
      </p>
      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-[14px]">
          <thead>
            <tr className="border-b border-line">
              <th className="py-4 pr-6 font-normal text-muted" />
              {cols.map((r) => (
                <th key={r!.id} className="py-4 pr-6 font-normal">
                  <Link to={`/restaurant/${r!.id}`} className="font-serif text-[1.65rem] tracking-tight">
                    {r!.name}
                  </Link>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.label} className="border-b border-line">
                <td className="py-3.5 pr-6 text-muted">{row.label}</td>
                {cols.map((_, i) => (
                  <td key={i} className="py-3.5 pr-6">
                    {row.get(i)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="font-serif mt-12 max-w-xl text-[1.45rem] leading-snug tracking-tight">
        Choose {cols[0]!.name} if you want {cols[0]!.atmosphere[0]}. Choose {cols[1]!.name} if you’re
        prioritizing {cols[1]!.atmosphere[0]}.
      </p>
      <p className="mt-8 text-[13px] text-muted">
        {restaurants.slice(0, 4).map((r) => (
          <Link
            key={r.id}
            to={`/compare?ids=fox-and-the-knife,${r.id}`}
            className="mr-4 underline decoration-ink/20 underline-offset-4 hover:text-ink"
          >
            vs {r.name}
          </Link>
        ))}
      </p>
    </div>
  );
}
