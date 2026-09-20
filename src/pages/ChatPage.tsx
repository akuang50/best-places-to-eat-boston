import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRestaurant } from "../data/restaurants";
import { replyToChat, startChat, takeRestaurant, type ChatChoice, type ChatSession } from "../lib/ai/chat";

function Choices({ items, onPick }: { items: ChatChoice[]; onPick: (text: string) => void }) {
  return (
    <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-[13px] text-muted">
      {items.map((c) => (
        <button key={c.label} type="button" className="hover:text-ink" onClick={() => onPick(c.text)}>
          {c.label}
        </button>
      ))}
    </div>
  );
}

function PickCard({ id, onPick }: { id: string; onPick?: () => void }) {
  const r = getRestaurant(id);
  if (!r) return null;
  const body = (
    <>
      <img src={r.hero.url} alt="" className="aspect-[4/5] w-full object-cover" />
      <div className="self-center text-left">
        <p className="kicker">{r.neighborhood}</p>
        <h3 className="font-serif mt-1 text-[1.55rem] leading-[1.05] tracking-tight">{r.name}</h3>
        <p className="mt-1 text-[13px] text-muted">
          {r.cuisine[0]} · {r.price}
        </p>
      </div>
    </>
  );
  const className = "mt-5 grid grid-cols-[104px_1fr] gap-4 sm:grid-cols-[128px_1fr]";
  if (onPick) {
    return (
      <button type="button" className={`${className} w-full`} onClick={onPick}>
        {body}
      </button>
    );
  }
  return (
    <Link to={`/restaurant/${r.id}`} className={className}>
      {body}
    </Link>
  );
}

export function ChatPage() {
  const navigate = useNavigate();
  const [session, setSession] = useState<ChatSession>(() => startChat());
  const [draft, setDraft] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [session.messages.length]);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const result = replyToChat(session, trimmed);
    setSession(result.session);
    setDraft("");
    if (result.goTo) {
      window.setTimeout(() => navigate(result.goTo!), 640);
    }
    inputRef.current?.focus();
  }

  function take(id: string) {
    const result = takeRestaurant(session, id);
    setSession(result.session);
    if (result.goTo) window.setTimeout(() => navigate(result.goTo!), 640);
  }

  const last = session.messages.at(-1);
  const lastChoices = last?.role === "bot" ? last.choices : last?.role === "pick" ? [
    { label: "I'll go", text: "I'll go" },
    { label: "Not that", text: "Not that" },
    { label: "Too expensive", text: "Too expensive" },
    { label: "Closer to MIT", text: "Too far, closer to MIT" },
  ] : undefined;

  return (
    <div className="page flex max-w-[680px] flex-col pt-10 pb-10 lg:pt-14">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="kicker">The indecisive desk</p>
          <h1 className="font-serif mt-3 text-[clamp(2.2rem,6vw,3.6rem)] leading-[0.95] tracking-[-0.03em]">
            You don’t have to know.
          </h1>
        </div>
        <button type="button" className="mb-1 text-[12px] tracking-[0.12em] text-muted uppercase hover:text-ink" onClick={() => setSession(startChat())}>
          Start over
        </button>
      </div>

      <div className="mt-12">
        {session.messages.map((m, i) => {
          const showChoices = m.id === last?.id;
          if (m.role === "you") {
            return (
              <p key={m.id} className={`chat-line max-w-xl text-[16px] leading-relaxed text-muted italic ${i ? "mt-8" : ""}`}>
                “{m.text}”
              </p>
            );
          }
          if (m.role === "pick") {
            return (
              <article key={m.id} className={`chat-line border-t border-line pt-8 ${i ? "mt-10" : ""}`}>
                <p className="font-serif max-w-xl text-[1.45rem] leading-snug tracking-tight">{m.text}</p>
                <PickCard id={m.restaurantId} />
                {showChoices && lastChoices ? <Choices items={lastChoices} onPick={send} /> : null}
              </article>
            );
          }
          if (m.role === "fork") {
            return (
              <article key={m.id} className={`chat-line border-t border-line pt-8 ${i ? "mt-10" : ""}`}>
                <p className="font-serif max-w-xl text-[1.45rem] leading-snug tracking-tight">{m.text}</p>
                <div className="mt-6 grid gap-8 sm:grid-cols-2">
                  <PickCard id={m.leftId} onPick={() => take(m.leftId)} />
                  <PickCard id={m.rightId} onPick={() => take(m.rightId)} />
                </div>
              </article>
            );
          }
          return (
            <div key={m.id} className={`chat-line ${i ? "mt-10" : ""}`}>
              <p className="font-serif max-w-xl text-[1.45rem] leading-snug tracking-tight">{m.text}</p>
              {showChoices && m.choices ? <Choices items={m.choices} onPick={send} /> : null}
            </div>
          );
        })}
        <div ref={endRef} className="h-px scroll-mb-28" />
      </div>

      <form
        className="sticky bottom-0 -mx-4 mt-10 border-t border-line bg-cream/95 px-4 backdrop-blur-[8px] sm:mx-0 sm:px-0"
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
      >
        <div className="flex items-end gap-4 py-3">
          <label className="sr-only" htmlFor="chat-q">
            Tell the desk what you’re feeling
          </label>
          <input
            ref={inputRef}
            id="chat-q"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="I don’t know, I’m hungry, surprise me…"
            className="min-w-0 flex-1 bg-transparent py-2 text-[16px] outline-none placeholder:text-muted/55"
            autoComplete="off"
          />
          <button type="submit" className="mb-2 shrink-0 text-[12px] tracking-[0.14em] text-tomato uppercase">
            Say
          </button>
        </div>
      </form>
    </div>
  );
}
