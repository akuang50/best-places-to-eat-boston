import type { Trail } from "../types";

export const trails: Trail[] = [
  {
    id: "north-end-crawl",
    title: "The North End food crawl",
    subtitle: "Espresso energy, pasta, cannoli — on foot.",
    duration: "3.5 hours",
    total: "about $70",
    start: "Hanover Street",
    stops: [
      { time: "5:30 PM", restaurantId: "modern-pastry", course: "Espresso + a bite", note: "Start sweet, skip the longer Mike's line if you want local-feeling.", cost: 8 },
      { time: "6:15 PM", restaurantId: "carmelinasi", course: "Pasta", note: "Handmade plates, Hanover upstairs, distinctly North End.", cost: 32 },
      { time: "8:00 PM", restaurantId: "neptune-oyster", course: "If you still have room", note: "Only if the wait is human. Otherwise stay for dessert.", cost: 28 },
      { time: "8:45 PM", restaurantId: "modern-pastry", course: "Cannoli to walk with", note: "The string-box walk is the point.", cost: 6 },
    ],
  },
  {
    id: "boston-three-bites",
    title: "Boston in 3 bites",
    subtitle: "Chowder, lobster roll, cannoli.",
    duration: "4 hours",
    total: "about $85",
    start: "Back Bay → Fenway → North End",
    stops: [
      { time: "5:00 PM", restaurantId: "select-oyster", course: "Chowder / oysters", note: "Polished Back Bay seafood that isn't a harbor trap.", cost: 28 },
      { time: "6:30 PM", restaurantId: "eventide-fenway", course: "Lobster roll", note: "Brown butter, Fenway, less tourist-harbor energy.", cost: 32 },
      { time: "8:15 PM", restaurantId: "modern-pastry", course: "Cannoli", note: "End in the North End like you're supposed to.", cost: 8 },
    ],
  },
  {
    id: "mit-under-100",
    title: "Four hours from MIT",
    subtitle: "Start at Kendall. Stay under $100.",
    duration: "4 hours",
    total: "about $67",
    start: "MIT / Kendall",
    stops: [
      { time: "5:00 PM", restaurantId: "life-alive", course: "A light start", note: "Walk from campus. Bowls if anyone wants plants.", cost: 16 },
      { time: "6:15 PM", restaurantId: "helmand", course: "Dinner", note: "Warm Afghan room near Kendall — special without $$$$ .", cost: 34 },
      { time: "8:00 PM", restaurantId: "flour-fort-point", course: "Sticky bun if still open", note: "Otherwise grab pastry earlier. Daytime bakery.", cost: 8 },
    ],
  },
];

export function getTrail(id: string) {
  return trails.find((t) => t.id === id);
}
