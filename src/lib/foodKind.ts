import type { Restaurant } from "../types";

export const FOOD_KINDS = [
  { id: "pasta", label: "Pasta", color: "#b42b1a" },
  { id: "pizza", label: "Pizza", color: "#c45c26" },
  { id: "seafood", label: "Seafood", color: "#2c5f73" },
  { id: "sushi", label: "Sushi", color: "#243d48" },
  { id: "chinese", label: "Chinese", color: "#8f321f" },
  { id: "bakery", label: "Bakery", color: "#8a5a32" },
  { id: "veg", label: "Plants", color: "#3d6b4a" },
  { id: "burger", label: "Burgers", color: "#5a3d2b" },
  { id: "other", label: "Other", color: "#3a342e" },
] as const;

export type FoodKindId = (typeof FOOD_KINDS)[number]["id"];

const GLYPH: Record<FoodKindId, string> = {
  pasta:
    '<path d="M8 11c2.2-1.6 4.2-.2 6.2-1.8M8 14.2c2.2-1.6 4.2-.2 6.2-1.8M8 17.4c2.2-1.6 4.2-.2 6.2-1.8" fill="none" stroke="#fff" stroke-width="1.7" stroke-linecap="round"/>',
  pizza:
    '<path d="M14 8.5 8 18.5h12L14 8.5Z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><circle cx="13.2" cy="13.2" r="0.9" fill="#fff"/><circle cx="15.4" cy="15.4" r="0.8" fill="#fff"/>',
  seafood:
    '<path d="M8.5 14.2c2.4-3.4 8.2-3.4 10.6 0-2.4 3.4-8.2 3.4-10.6 0Z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M8.5 14.2 6.4 11.8v4.8L8.5 14.2Z" fill="#fff"/><circle cx="16.6" cy="13.4" r="0.7" fill="#fff"/>',
  sushi:
    '<ellipse cx="14" cy="14.2" rx="6.2" ry="4.1" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M10.2 14.2h7.6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/><path d="M11.4 12.4h5.2M11.4 16h5.2" stroke="#fff" stroke-width="1.1" stroke-linecap="round"/>',
  chinese:
    '<path d="M8.2 15.2c0-3.6 2.5-6.4 5.8-6.4s5.8 2.8 5.8 6.4c0 2.4-2.2 3.6-5.8 3.6s-5.8-1.2-5.8-3.6Z" fill="none" stroke="#fff" stroke-width="1.6"/><path d="M10 14.6h8" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/>',
  bakery:
    '<path d="M9 16.8c.4-4 2.2-7.2 5-7.2s4.6 3.2 5 7.2c-1.6-1-3.2-1.4-5-1.4s-3.4.4-5 1.4Z" fill="none" stroke="#fff" stroke-width="1.6" stroke-linejoin="round"/><path d="M11.4 13.2c.8.4 1.7.6 2.6.6s1.8-.2 2.6-.6" fill="none" stroke="#fff" stroke-width="1.3" stroke-linecap="round"/>',
  veg: '<path d="M14 19.2c0-6 4.6-8.6 6.4-9-1.8 5.2-4.2 7.2-6.4 9Z" fill="#fff"/><path d="M14 19.2c0-6-4.6-8.6-6.4-9 1.8 5.2 4.2 7.2 6.4 9Z" fill="none" stroke="#fff" stroke-width="1.5"/><path d="M14 19.2V9.8" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>',
  burger:
    '<path d="M8.4 12.2h11.2c0-2.4-2.2-3.6-5.6-3.6s-5.6 1.2-5.6 3.6Z" fill="#fff"/><rect x="8.2" y="13.4" width="11.6" height="1.6" rx="0.6" fill="#fff"/><path d="M8.4 16.8h11.2c0 1.8-2.2 2.6-5.6 2.6s-5.6-.8-5.6-2.6Z" fill="#fff"/>',
  other:
    '<path d="M11.2 9.5v9.4M16.8 9.5v9.4M11.2 9.5c0 1.6-1.4 1.6-1.4 3.2M16.8 9.5c1.3.8 1.3 2.4 0 3.2" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
};

export function foodKind(restaurant: Restaurant): (typeof FOOD_KINDS)[number] {
  const blob = `${restaurant.cuisine.join(" ")} ${restaurant.tags.join(" ")}`.toLowerCase();
  const id: FoodKindId = blob.includes("pizza")
    ? "pizza"
    : blob.includes("sushi") || blob.includes("omakase") || blob.includes("japanese")
      ? "sushi"
      : blob.includes("burger")
        ? "burger"
        : blob.includes("bakery") || blob.includes("dessert") || blob.includes("pastry")
          ? "bakery"
          : blob.includes("vegetarian") || blob.includes("vegan")
            ? "veg"
            : blob.includes("chinese") || blob.includes("taiwan")
              ? "chinese"
              : blob.includes("seafood") || blob.includes("oyster") || blob.includes("lobster")
                ? "seafood"
                : blob.includes("italian") || blob.includes("pasta")
                  ? "pasta"
                  : "other";
  return FOOD_KINDS.find((k) => k.id === id)!;
}

export function pinSvg(kind: (typeof FOOD_KINDS)[number], selected = false) {
  const size = selected ? 34 : 28;
  const h = selected ? 44 : 36;
  return `<svg width="${size}" height="${h}" viewBox="0 0 28 36" aria-hidden="true">
    <path d="M14 34.5s11-11.8 11-20.2a11 11 0 1 0-22 0C3 22.7 14 34.5 14 34.5Z" fill="${kind.color}" stroke="#f6f1e8" stroke-width="1.6"/>
    ${GLYPH[kind.id]}
  </svg>`;
}
