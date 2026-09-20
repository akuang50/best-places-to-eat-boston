import { useNavigate } from "react-router-dom";
import { useState } from "react";

export function SearchBox({
  large = false,
  initial = "",
}: {
  large?: boolean;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  const navigate = useNavigate();

  function submit(q: string) {
    const query = q.trim();
    if (!query) return;
    navigate(`/search?q=${encodeURIComponent(query)}`);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(value);
      }}
      className={`flex items-end gap-4 border-b border-ink/20 ${large ? "pb-3" : "pb-2"}`}
    >
      <label className="sr-only" htmlFor="food-q">
        What are you craving
      </label>
      <input
        id="food-q"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Tell us what you’re craving…"
        className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-muted/55 ${
          large ? "py-2 text-[18px] sm:text-[20px]" : "py-1.5 text-[16px]"
        }`}
      />
      <button
        type="submit"
        className="mb-1.5 shrink-0 text-[12px] tracking-[0.14em] text-tomato uppercase"
      >
        Search
      </button>
    </form>
  );
}
