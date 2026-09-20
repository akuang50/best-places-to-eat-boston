import { restaurants } from "../../data/restaurants";
import type { Intent, MatchBreakdown, RankedRestaurant, Restaurant } from "../../types";

const MIT = { lat: 42.3601, lng: -71.0942 };
const FENWAY = { lat: 42.3467, lng: -71.0972 };

export function haversineMiles(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
) {
  const R = 3958.8;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) *
      Math.cos((b.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
}

export function distanceFromMit(r: Restaurant) {
  return haversineMiles(MIT, { lat: r.lat, lng: r.lng });
}

function priceRank(p: Restaurant["price"]) {
  return { $: 1, $$: 2, $$$: 3, $$$$: 4 }[p];
}

function overlap(a: string[], b: string[]) {
  const low = b.map((x) => x.toLowerCase());
  return a.filter((x) => low.some((y) => y.includes(x.toLowerCase()) || x.toLowerCase().includes(y))).length;
}

function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function recommend(intent: Intent, limit = 8): RankedRestaurant[] {
  const origin =
    intent.near === "fenway" ? FENWAY : intent.near === "mit" || intent.walkable ? MIT : null;

  const ranked = restaurants.map((restaurant) => {
    const dist = origin
      ? haversineMiles(origin, { lat: restaurant.lat, lng: restaurant.lng })
      : distanceFromMit(restaurant);

    let intentScore = 40;
    const reasons: string[] = [];
    const evidence: { claim: string; sourceIds: string[] }[] = [];

    if (intent.cuisine.length) {
      const hit = overlap(intent.cuisine, restaurant.cuisine);
      intentScore += hit ? 25 : -15;
      if (hit) reasons.push(`${restaurant.cuisine.join(" / ")} matches what you asked for`);
    }
    if (intent.dishes.length) {
      const names = restaurant.signatureDishes.map((d) => d.name.toLowerCase());
      const tags = restaurant.tags.join(" ");
      const hit = intent.dishes.some((d) => names.some((n) => n.includes(d)) || tags.includes(d));
      intentScore += hit ? 20 : -10;
      if (hit) {
        const dish = restaurant.signatureDishes.find((d) =>
          intent.dishes.some((x) => d.name.toLowerCase().includes(x)),
        );
        reasons.push(`${dish?.name ?? "A signature dish"} shows up in the public record`);
        if (dish) evidence.push({ claim: dish.name, sourceIds: dish.sourceIds });
      }
    }
    if (intent.occasion === "date") {
      const ok = restaurant.occasions.includes("date") || restaurant.atmosphere.includes("date-night");
      intentScore += ok ? 18 : -8;
      if (ok) reasons.push("Public coverage treats this as date-night energy");
    }
    if (intent.occasion === "parents") {
      const ok =
        restaurant.occasions.includes("parents") ||
        restaurant.atmosphere.includes("polished") ||
        restaurant.atmosphere.includes("warm");
      const noisy = restaurant.noise === "high";
      intentScore += ok ? 16 : 0;
      intentScore += noisy ? -12 : 6;
      if (ok) reasons.push("A calmer, more composed room for visiting family");
    }
    if (intent.lateNight) {
      const ok = restaurant.tags.includes("late night") || restaurant.atmosphere.includes("late-night");
      intentScore += ok ? 22 : -20;
    }
    if (intent.student || intent.budget === "$") {
      intentScore += priceRank(restaurant.price) <= 2 ? 12 : -14;
    }
    if (intent.classic) {
      intentScore += restaurant.classic ? 14 : 0;
    }
    if (intent.notTouristy && restaurant.tags.includes("tourist")) intentScore -= 18;
    if (intent.notExperimental) {
      intentScore += restaurant.tags.includes("omakase") || restaurant.price === "$$$$" ? -16 : 8;
    }
    if (intent.notTastingMenu && (restaurant.cuisine.includes("Omakase") || restaurant.price === "$$$$")) {
      intentScore -= 24;
    }
    if (intent.dietary.includes("vegan")) {
      intentScore += restaurant.dietary.vegan === true ? 22 : -20;
    } else if (intent.dietary.includes("vegetarian")) {
      intentScore += restaurant.dietary.vegetarian === true ? 16 : -8;
    }
    if (intent.atmosphere.includes("lively")) {
      intentScore += restaurant.atmosphere.includes("lively") ? 12 : -6;
    }
    if (intent.atmosphere.includes("romantic") || intent.atmosphere.includes("quiet")) {
      intentScore += restaurant.noise.startsWith("low") || restaurant.atmosphere.includes("intimate") ? 14 : -8;
    }
    if (intent.group) {
      intentScore += restaurant.occasions.includes("group") || restaurant.occasions.includes("friends") ? 10 : 0;
    }

    const foodTheme = restaurant.consensus.find((c) =>
      /pasta|food|pizza|seafood|sushi|dumpling|lobster/i.test(c.theme),
    );
    const food = clamp(foodTheme ? foodTheme.positive : restaurant.rating * 20);

    const atmosphere = clamp(
      50 +
        (intent.atmosphere.length
          ? overlap(intent.atmosphere, restaurant.atmosphere) * 20
          : restaurant.atmosphere.includes("lively")
            ? 10
            : 8),
    );

    let location = 70;
    if (intent.neighborhoods.length) {
      location = intent.neighborhoods.includes(restaurant.neighborhood) ? 96 : 35;
    } else if (origin) {
      if (dist < 0.8) location = 97;
      else if (dist < 1.5) location = 86;
      else if (dist < 2.5) location = 70;
      else location = 42;
    }
    if (intent.walkable && dist > 1.2) location -= 25;

    let budget = 80;
    if (intent.budgetMax && intent.budgetMax <= 25) budget = priceRank(restaurant.price) === 1 ? 94 : priceRank(restaurant.price) === 2 ? 70 : 30;
    else if (intent.budget === "$$" || (intent.budgetMax && intent.budgetMax <= 40)) {
      budget = priceRank(restaurant.price) <= 2 ? 92 : priceRank(restaurant.price) === 3 ? 72 : 40;
    } else if (intent.budget === "$$$$") {
      budget = priceRank(restaurant.price) >= 3 ? 90 : 60;
    }

    const breakdown: MatchBreakdown = {
      intent: clamp(intentScore),
      food: clamp(food),
      atmosphere: clamp(atmosphere),
      location: clamp(location),
      budget: clamp(budget),
    };

    const score =
      0.3 * breakdown.intent +
      0.2 * breakdown.food +
      0.15 * breakdown.atmosphere +
      0.15 * breakdown.location +
      0.1 * breakdown.budget +
      0.05 * (restaurant.trending ? 90 : 70) +
      0.05 * 80;

    if (!reasons.length) {
      reasons.push(restaurant.blurb);
    } else {
      const vibe = [
        intent.occasion === "date" ? "date-night" : null,
        intent.atmosphere.includes("lively") ? "lively" : null,
        intent.dishes[0] ? intent.dishes[0] : null,
      ].filter(Boolean);
      reasons.unshift(
        `You asked for ${vibe.length ? vibe.join(", ") : "a specific kind of night"}${
          intent.budgetMax && intent.budgetMax <= 40 ? " without going fully fine dining" : ""
        }. ${restaurant.name} is ${restaurant.atmosphere.slice(0, 2).join(", ")} ${restaurant.cuisine[0]} in ${restaurant.neighborhood}.`,
      );
    }
    evidence.push({
      claim: restaurant.blurb,
      sourceIds: restaurant.sources.map((s) => s.id),
    });

    return {
      restaurant,
      score: clamp(score),
      breakdown,
      reasons: reasons.slice(0, 4),
      evidence,
    };
  });

  return ranked.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function thinkingSteps(intent: Intent, total = restaurants.length) {
  const steps = [`Found ${total} Boston-area restaurants in the seed graph`];
  if (intent.cuisine.length) steps.push(`Narrowed by ${intent.cuisine.join(", ")}`);
  if (intent.near === "mit") steps.push("Weighted walkability from MIT / Kendall");
  if (intent.near === "fenway") steps.push("Checked Fenway / game-day geography");
  if (intent.atmosphere.length) steps.push("Compared atmosphere signals from public coverage");
  if (intent.budget || intent.budgetMax) steps.push("Filtered price against your budget language");
  if (intent.dishes.length) steps.push("Looked for dish mentions in menus and consensus");
  steps.push("Ranked by intent match, not raw star rating");
  return steps;
}
