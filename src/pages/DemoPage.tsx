import { Link } from "react-router-dom";

const scenarios = [
  {
    title: "Natural language",
    query: "I'm on a $35 budget and want the best sushi I can walk to from MIT.",
  },
  {
    title: "Conflicting preferences",
    query: "My girlfriend wants somewhere romantic. I want amazing food. Neither of us wants a tasting menu.",
  },
  {
    title: "Parents in town",
    query: "My parents are visiting Boston. We have $150 total. They want seafood, somewhere that feels special but not touristy.",
  },
  {
    title: "Date night pasta",
    query: "I want somewhere fun for a date tonight. Not insanely expensive. I'd love amazing pasta and somewhere that feels distinctly Boston.",
  },
];

export function DemoPage() {
  return (
    <div className="page max-w-[760px] py-14 lg:py-20">
      <p className="kicker">HackMIT · judging</p>
      <h1 className="font-serif mt-4 text-[clamp(2.4rem,6vw,4.2rem)] leading-[0.95] tracking-[-0.03em]">
        Demo
      </h1>
      <p className="mt-5 max-w-md text-[17px] leading-relaxed text-muted">
        These queries run on the seeded Boston graph. No live API required.
      </p>
      <ol className="mt-12">
        {scenarios.map((s, i) => (
          <li key={s.title} className="border-t border-line py-8">
            <p className="kicker">
              {String(i + 1).padStart(2, "0")} · {s.title}
            </p>
            <p className="font-serif mt-3 text-[1.55rem] leading-snug tracking-tight italic">
              “{s.query}”
            </p>
            <Link
              to={`/search?q=${encodeURIComponent(s.query)}`}
              className="mt-4 inline-block text-[13px] underline decoration-ink/25 underline-offset-4"
            >
              Run this search
            </Link>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-[14px] text-muted">
        Also the{" "}
        <Link to="/chat" className="text-ink underline decoration-ink/25 underline-offset-4">
          indecisive desk
        </Link>
        , the{" "}
        <Link to="/plan?trail=north-end-crawl" className="text-ink underline decoration-ink/25 underline-offset-4">
          North End crawl
        </Link>{" "}
        and the{" "}
        <Link to="/map" className="text-ink underline decoration-ink/25 underline-offset-4">
          food map
        </Link>
        .
      </p>
    </div>
  );
}
