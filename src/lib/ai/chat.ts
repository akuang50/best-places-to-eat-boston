import type { Intent, RankedRestaurant } from "../../types";
import { recommend } from "../recommendations/engine";
import { emptyIntent, mergeIntent, parseIntent } from "./intent";

export type ChatChoice = { label: string; text: string };

export type ChatMessage =
  | { id: string; role: "bot"; text: string; choices?: ChatChoice[] }
  | { id: string; role: "you"; text: string }
  | { id: string; role: "pick"; text: string; restaurantId: string; reasons: string[] }
  | { id: string; role: "fork"; text: string; leftId: string; rightId: string };

export type ChatSession = {
  n: number;
  messages: ChatMessage[];
  intent: Intent;
  rejected: string[];
  asked: string[];
  currentId: string | null;
};

export type ChatResult = {
  session: ChatSession;
  goTo?: string;
};

const INDECISIVE =
  /\b(idk|idc|wtv|dunno|unsure|whatever|anything|indecisive|no idea|not sure|don'?t know|can'?t decide|doesn'?t matter|you (pick|decide)|just decide|surprise( me)?|i don'?t care|no preference)\b/i;

const SURPRISE = /\b(surprise|you pick|just decide|anything|whatever)\b/i;
const VETO = /\b(not that|something else|nah|nope|skip|next|another|different|wrong|veto|pass)\b/i;
const CHEAPER = /\b(too expensive|cheaper|less expensive|too much|broke|too pricey)\b/i;
const CLOSER = /\b(too far|closer|near me|near mit|walkable|too much travel)\b/i;
const ACCEPT = /^(ok|okay|yes|yeah|yep|sure|fine|perfect|deal|book|down|let'?s go|that one|i'?ll go|love it|this one)\b/i;
const WHY = /\b(why( this)?|explain|how come)\b/i;

const OPENING_CHOICES: ChatChoice[] = [
  { label: "I don't know", text: "I don't know" },
  { label: "Surprise me", text: "Surprise me" },
  { label: "I'm starving", text: "I'm starving and can't decide" },
  { label: "Date night", text: "Date night, I can't decide" },
  { label: "Cheap near MIT", text: "Something cheap I can walk to from MIT" },
];

function signals(intent: Intent) {
  let n = 0;
  if (intent.cuisine.length || intent.dishes.length) n += 1;
  if (intent.budget || intent.budgetMax || intent.student) n += 1;
  if (intent.near || intent.walkable || intent.neighborhoods.length) n += 1;
  if (intent.occasion || intent.atmosphere.length || intent.dietary.length || intent.lateNight) n += 1;
  if (intent.classic) n += 1;
  return n;
}

function fromSpeech(text: string): Intent {
  const q = text.toLowerCase();
  let intent = parseIntent(text);

  if (SURPRISE.test(q) && !intent.cuisine.length && !intent.dishes.length) {
    intent = mergeIntent(intent, { ...emptyIntent(), budget: intent.budget ?? "$$", budgetMax: intent.budgetMax ?? 40 });
  }
  if (/\bstarv|so hungry|famished|dying of hunger\b/.test(q) && !intent.dishes.length) {
    intent = mergeIntent(intent, { ...emptyIntent(), dishes: ["pasta", "dumplings", "pizza"] });
  }
  if (/\bnormal dinner|regular dinner|not a big night\b/.test(q) && !intent.budget) {
    intent = { ...intent, budget: "$$", budgetMax: 40 };
  }
  if (/\bmake it (a little )?nice|treat ourselves|a little nice|spend a bit\b/.test(q) && !intent.budget) {
    intent = { ...intent, budget: "$$$" };
  }
  if (/\b(walk from mit|near mit|on campus|kendall)\b/.test(q)) {
    intent = { ...intent, near: "mit", walkable: true };
  }
  if (/\binto (the )?city|downtown|boston proper|take me into boston\b/.test(q) && !intent.neighborhoods.length) {
    intent = { ...intent, classic: true };
  }
  if (intent.occasion === "date") {
    intent = { ...intent, notTastingMenu: true, budget: intent.budget ?? "$$", budgetMax: intent.budgetMax ?? 40 };
  }
  return intent;
}

function isBakery(item: RankedRestaurant) {
  return item.restaurant.cuisine.some((c) => /bakery|dessert|cafe/i.test(c));
}

function wantsBakery(intent: Intent) {
  return (
    intent.cuisine.some((c) => /bakery|dessert|cafe/i.test(c)) ||
    intent.dishes.some((d) => /cannoli|pastry|bun|dessert/i.test(d))
  );
}

function matchesFood(item: RankedRestaurant, intent: Intent) {
  const blob = `${item.restaurant.cuisine.join(" ")} ${item.restaurant.tags.join(" ")} ${item.restaurant.signatureDishes.map((d) => d.name).join(" ")}`.toLowerCase();
  const cuisineHit = intent.cuisine.some((c) => blob.includes(c.toLowerCase()));
  const dishHit = intent.dishes.some((d) => blob.includes(d.toLowerCase()));
  return cuisineHit || dishHit;
}

function ranked(session: ChatSession): RankedRestaurant[] {
  const list = recommend(session.intent, 16).filter((item) => {
    if (session.rejected.includes(item.restaurant.id)) return false;
    if (!wantsBakery(session.intent) && isBakery(item)) return false;
    return true;
  });
  if (session.intent.cuisine.length || session.intent.dishes.length) {
    const tight = list.filter((item) => matchesFood(item, session.intent));
    if (tight.length) return tight;
  }
  return list;
}

type DraftMessage = ChatMessage extends infer T ? (T extends { id: string } ? Omit<T, "id"> : never) : never;

function add(session: ChatSession, message: DraftMessage): ChatSession {
  const n = session.n + 1;
  return { ...session, n, messages: [...session.messages, { ...message, id: `m${n}` } as ChatMessage] };
}

function queryOf(intent: Intent) {
  return intent.raw.replace(/ · /g, " ").trim() || "I can't decide what to eat in Boston";
}

function pickCopy(item: RankedRestaurant, exhausted: boolean) {
  const r = item.restaurant;
  const dish = r.signatureDishes[0]?.name;
  const why = item.reasons[0] ?? r.blurb;
  if (exhausted) {
    return `Last one I'm offering: ${r.name}. ${r.neighborhood} ${r.cuisine[0].toLowerCase()}, ${r.price}. ${why}`;
  }
  return `Stop. ${r.name}. ${r.neighborhood} ${r.cuisine[0]}, ${r.price}${
    dish ? ` — ${dish.toLowerCase()}` : ""
  }. ${why} That's dinner unless you veto it.`;
}

function pickChoices(): ChatChoice[] {
  return [
    { label: "I'll go", text: "I'll go" },
    { label: "Not that", text: "Not that" },
    { label: "Too expensive", text: "Too expensive" },
    { label: "Closer to MIT", text: "Too far, closer to MIT" },
  ];
}

function nextQuestion(session: ChatSession): ChatSession {
  const { intent, asked } = session;
  if (!asked.includes("craving") && !intent.cuisine.length && !intent.dishes.length && !intent.classic) {
    return add(
      { ...session, asked: [...asked, "craving"] },
      {
        role: "bot",
        text: "Good. Indecision is a preference. If I put three plates down, which one do you not push away?",
        choices: [
          { label: "Pasta", text: "Pasta" },
          { label: "Seafood", text: "Seafood" },
          { label: "Dumplings", text: "Dumplings" },
          { label: "None of those", text: "None of those, surprise me" },
        ],
      },
    );
  }
  if (!asked.includes("budget") && !intent.budget && !intent.budgetMax && !intent.student) {
    return add(
      { ...session, asked: [...asked, "budget"] },
      {
        role: "bot",
        text: "How much are we pretending not to think about?",
        choices: [
          { label: "Student cheap", text: "Student cheap, under $25" },
          { label: "A normal dinner", text: "A normal dinner" },
          { label: "Make it a little nice", text: "Make it a little nice" },
        ],
      },
    );
  }
  if (!asked.includes("where") && !intent.near && !intent.walkable && !intent.neighborhoods.length) {
    return add(
      { ...session, asked: [...asked, "where"] },
      {
        role: "bot",
        text: "Stay near campus, or is the city fair game?",
        choices: [
          { label: "Walk from MIT", text: "Walk from MIT" },
          { label: "Take me into Boston", text: "Take me into Boston" },
          { label: "Don't care", text: "I don't care where" },
        ],
      },
    );
  }
  return decide({ ...session, asked: [...asked, "forced"] });
}

function decide(session: ChatSession): ChatSession {
  const list = ranked(session);
  if (list.length >= 2 && session.rejected.length >= 2) {
    const [a, b] = list;
    return add(
      { ...session, currentId: null },
      {
        role: "fork",
        text: "You're going to keep doing this. Here are two. Pick one and we can both stop.",
        leftId: a.restaurant.id,
        rightId: b.restaurant.id,
      },
    );
  }
  const item = list[0];
  if (!item) {
    const relaxed = recommend(emptyIntent(session.intent.raw || "Boston dinner"), 8).filter(
      (row) => !session.rejected.includes(row.restaurant.id),
    )[0];
    if (!relaxed) {
      return add(session, {
        role: "bot",
        text: "You've vetoed the whole city. Start over, or go look at the map.",
        choices: [{ label: "Start over", text: "Start over" }],
      });
    }
    return add(
      { ...session, currentId: relaxed.restaurant.id },
      { role: "pick", text: pickCopy(relaxed, true), restaurantId: relaxed.restaurant.id, reasons: relaxed.reasons },
    );
  }
  return add(
    { ...session, currentId: item.restaurant.id },
    {
      role: "pick",
      text: pickCopy(item, session.rejected.length >= 3),
      restaurantId: item.restaurant.id,
      reasons: item.reasons,
    },
  );
}

export function startChat(): ChatSession {
  return {
    n: 1,
    messages: [
      {
        id: "m1",
        role: "bot",
        text: "Most people sitting here don't know what they want. That's the job. Say anything — even “I don't know” — and I'll start ruling kitchens out.",
        choices: OPENING_CHOICES,
      },
    ],
    intent: emptyIntent(),
    rejected: [],
    asked: [],
    currentId: null,
  };
}

export function replyToChat(session: ChatSession, raw: string): ChatResult {
  const text = raw.trim();
  if (!text) return { session };

  if (/^start over$/i.test(text)) {
    return { session: startChat() };
  }

  let next = add(session, { role: "you", text });

  const fork = [...session.messages].reverse().find((m) => m.role === "fork");
  if (fork && fork.role === "fork") {
    const low = text.toLowerCase();
    const picked = low.includes("first") || low.includes("left") ? fork.leftId : low.includes("second") || low.includes("right") ? fork.rightId : null;
    // Name match happens in the page via choice text "I'll take {name}"
    if (ACCEPT.test(text) && session.currentId) {
      return { session: add(next, { role: "bot", text: "Go. Don't reopen the tab." }), goTo: `/restaurant/${session.currentId}?q=${encodeURIComponent(queryOf(session.intent))}` };
    }
    if (picked) {
      return { session: add({ ...next, currentId: picked }, { role: "bot", text: "Good. Stop looking." }), goTo: `/restaurant/${picked}?q=${encodeURIComponent(queryOf(session.intent))}` };
    }
  }

  if (WHY.test(text) && session.currentId) {
    const item = ranked(session).find((row) => row.restaurant.id === session.currentId) ?? recommend(session.intent, 16).find((row) => row.restaurant.id === session.currentId);
    const reasons = item?.reasons.slice(0, 3).join(" ") ?? item?.restaurant.blurb ?? "It matched what little you gave me.";
    return { session: add(next, { role: "bot", text: reasons, choices: pickChoices() }) };
  }

  if (ACCEPT.test(text) && session.currentId) {
    return {
      session: add(next, { role: "bot", text: "Go. Don't reopen the tab." }),
      goTo: `/restaurant/${session.currentId}?q=${encodeURIComponent(queryOf(session.intent))}`,
    };
  }

  if (CHEAPER.test(text)) {
    const cheaper = {
      ...next,
      intent: { ...next.intent, budget: "$" as const, budgetMax: 25, student: true },
      rejected: next.currentId ? [...next.rejected, next.currentId] : next.rejected,
      currentId: null,
    };
    return { session: decide(cheaper) };
  }

  if (CLOSER.test(text)) {
    const closer = {
      ...next,
      intent: { ...next.intent, near: "mit" as const, walkable: true },
      rejected: next.currentId ? [...next.rejected, next.currentId] : next.rejected,
      currentId: null,
    };
    return { session: decide(closer) };
  }

  if (VETO.test(text) && (session.currentId || (fork && fork.role === "fork"))) {
    const extra = session.currentId
      ? [session.currentId]
      : fork && fork.role === "fork"
        ? [fork.leftId, fork.rightId]
        : [];
    return { session: decide({ ...next, rejected: [...next.rejected, ...extra], currentId: null }) };
  }

  next = { ...next, intent: mergeIntent(next.intent, fromSpeech(text)) };

  const ready = signals(next.intent) >= 2 || (SURPRISE.test(text) && signals(next.intent) >= 1) || next.asked.includes("forced");
  if (ready) {
    if (INDECISIVE.test(text) && signals(next.intent) < 2 && !next.asked.includes("craving")) {
      return { session: nextQuestion(next) };
    }
    return { session: decide(next) };
  }

  if (INDECISIVE.test(text) || signals(next.intent) >= 1) {
    return { session: nextQuestion(next) };
  }

  return { session: nextQuestion(next) };
}

export function takeRestaurant(session: ChatSession, id: string): ChatResult {
  const withYou = add(session, { role: "you", text: "I'll take that one" });
  return {
    session: add({ ...withYou, currentId: id }, { role: "bot", text: "Good. Stop looking." }),
    goTo: `/restaurant/${id}?q=${encodeURIComponent(queryOf(session.intent))}`,
  };
}
