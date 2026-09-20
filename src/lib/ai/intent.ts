import type { Intent, PriceLevel } from "../../types";

const CUISINES = [
  "italian",
  "seafood",
  "japanese",
  "sushi",
  "omakase",
  "pizza",
  "chinese",
  "taiwanese",
  "tapas",
  "spanish",
  "indian",
  "peruvian",
  "afghan",
  "vegetarian",
  "vegan",
  "bakery",
  "burger",
  "burgers",
];

const DISHES = [
  "pasta",
  "pizza",
  "sushi",
  "ramen",
  "lobster",
  "lobster roll",
  "oyster",
  "oysters",
  "dumpling",
  "dumplings",
  "cannoli",
  "chowder",
  "burger",
  "tacos",
  "noodles",
];

const NEIGHBORHOODS: { match: string[]; value: string }[] = [
  { match: ["north end"], value: "North End" },
  { match: ["back bay", "newbury"], value: "Back Bay" },
  { match: ["south end"], value: "South End" },
  { match: ["southie", "south boston"], value: "South Boston" },
  { match: ["chinatown"], value: "Chinatown" },
  { match: ["seaport"], value: "Seaport" },
  { match: ["fenway"], value: "Fenway" },
  { match: ["cambridge", "kendall", "harvard", "central square"], value: "Cambridge" },
  { match: ["somerville", "union square", "davis"], value: "Somerville" },
  { match: ["beacon hill"], value: "Beacon Hill" },
  { match: ["allston"], value: "Allston" },
];

function includesAny(q: string, terms: string[]) {
  return terms.some((t) => q.includes(t));
}

export function parseIntent(raw: string): Intent {
  const q = raw.toLowerCase();

  const cuisine = CUISINES.filter((c) => q.includes(c)).map((c) =>
    c === "burgers" ? "Burgers" : c[0].toUpperCase() + c.slice(1),
  );
  if (q.includes("pasta") && !cuisine.includes("Italian")) cuisine.push("Italian");
  if ((q.includes("lobster") || q.includes("oyster") || q.includes("chowder")) && !cuisine.includes("Seafood")) {
    cuisine.push("Seafood");
  }

  const dishes = DISHES.filter((d) => q.includes(d));

  const neighborhoods = NEIGHBORHOODS.filter((n) =>
    n.match.some((m) => q.includes(m)),
  ).map((n) => n.value);

  let near: Intent["near"] = null;
  if (includesAny(q, ["mit", "kendall", "walking distance of mit", "walk to from mit"])) near = "mit";
  if (includesAny(q, ["red sox", "fenway park", "before a game"])) near = "fenway";
  if (q.includes("back bay")) near = "back-bay";
  if (q.includes("north end")) near = "north-end";

  let budget: PriceLevel | null = null;
  let budgetMax: number | null = null;
  if (includesAny(q, ["cheap", "under $25", "under 25", "$25", "student"])) {
    budget = "$";
    budgetMax = 25;
  } else if (includesAny(q, ["$30", "under $40", "under 40", "35 budget", "$35", "not insanely expensive", "not ridiculously expensive"])) {
    budget = "$$";
    budgetMax = 40;
  } else if (includesAny(q, ["$100", "150 total", "$150"])) {
    budget = "$$$";
    budgetMax = 80;
  } else if (
    includesAny(q, ["$$$$", "special occasion"]) ||
    (q.includes("omakase") && !includesAny(q, ["not a", "unless", "don't want", "doesn't want"]))
  ) {
    budget = "$$$$";
  }
  if (q.includes("$$") && !budget) budget = "$$";

  let occasion: string | null = null;
  if (includesAny(q, ["date", "girlfriend", "romantic"])) occasion = "date";
  if (includesAny(q, ["parents", "family visiting"])) occasion = "parents";
  if (includesAny(q, ["friends", "with friends"])) occasion = "friends";
  if (includesAny(q, ["birthday"])) occasion = "birthday";
  if (includesAny(q, ["red sox", "game"])) occasion = "red-sox";

  const atmosphere: string[] = [];
  if (includesAny(q, ["romantic", "intimate", "quiet"])) atmosphere.push("romantic");
  if (includesAny(q, ["fun", "lively", "loud"])) atmosphere.push("lively");
  if (includesAny(q, ["quiet", "not loud", "avoid very loud"])) atmosphere.push("quiet");
  if (q.includes("casual")) atmosphere.push("casual");
  if (includesAny(q, ["nice", "special", "polished"])) atmosphere.push("polished");

  const dietary: string[] = [];
  if (q.includes("vegan")) dietary.push("vegan");
  if (q.includes("vegetarian")) dietary.push("vegetarian");

  return {
    raw,
    cuisine,
    dishes,
    neighborhoods,
    near,
    budget,
    budgetMax,
    occasion,
    atmosphere,
    dietary,
    lateNight: includesAny(q, ["late night", "late-night", "after midnight"]),
    group: includesAny(q, ["8 people", "group", "friends", "4 people"]),
    family: includesAny(q, ["family", "parents"]),
    student: includesAny(q, ["student", "mit", "under $25", "cheap"]),
    walkable: includesAny(q, ["walk", "walking", "walkable"]),
    classic: includesAny(q, ["boston classic", "classics", "distinctly boston", "local"]),
    notTouristy: includesAny(q, ["not touristy", "isn't touristy", "local"]),
    notExperimental: includesAny(q, ["not too experimental", "not experimental", "not insanely"]),
    notTastingMenu: includesAny(q, [
      "not a tasting",
      "no tasting",
      "doesn't want a tasting",
      "don't want a tasting",
      "neither of us wants a tasting",
    ]),
  };
}

export const prompts = [
  { label: "Best pizza", query: "Best pizza in Boston that isn't just a tourist line" },
  { label: "Sushi tonight", query: "I want sushi tonight, not a $400 omakase unless that's truly the move" },
  { label: "Boston classics", query: "Give me distinctly Boston food that feels local" },
  { label: "Best under $25", query: "Best under $25 near MIT, student-friendly" },
  { label: "Date night", query: "I want somewhere fun for a date tonight. Not insanely expensive. I'd love amazing pasta and somewhere that feels distinctly Boston." },
  { label: "Late night", query: "Cheap late-night food with friends" },
  { label: "Vegetarian", query: "My friend is vegan and I'm not. Find somewhere we'll both love." },
  { label: "Student-friendly", query: "I'm on a $35 budget and want the best sushi I can walk to from MIT." },
  { label: "Special occasion", query: "Somewhere special for a birthday, not a tasting menu" },
  { label: "Parents in town", query: "I'm taking my parents somewhere nice near Back Bay. They love seafood but don't want anything too experimental." },
];
