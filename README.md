# ForkBoston

Boston food guide. Type what you want; it ranks restaurants by intent.

## Start the website

From this repo:

```bash
npm install
npm start
```

That opens [http://localhost:5173](http://localhost:5173). Same thing as `npm run dev`.

## Pages in this repo

Each file in `src/pages/` is a screen on the site:

| File | URL |
| --- | --- |
| `src/pages/HomePage.tsx` | http://localhost:5173/ |
| `src/pages/SearchPage.tsx` | http://localhost:5173/search |
| `src/pages/RestaurantPage.tsx` | http://localhost:5173/restaurant/fox-and-the-knife |
| `src/pages/MapPage.tsx` | http://localhost:5173/map |
| `src/pages/PlanPage.tsx` | http://localhost:5173/plan |
| `src/pages/DemoPage.tsx` | http://localhost:5173/demo |
| `src/pages/ComparePage.tsx` | http://localhost:5173/compare |

Routes are wired in `src/App.tsx`. Restaurant data lives in `src/data/restaurants.ts`.
