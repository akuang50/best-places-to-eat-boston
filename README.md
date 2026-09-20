# ForkBoston

Boston food guide. Type what you want; it ranks restaurants by intent.

**Live site:** [https://akuang50.github.io/best-places-to-eat-boston/](https://akuang50.github.io/best-places-to-eat-boston/)

Pushes to `main` publish that URL via GitHub Pages. If GitHub is still serving a blank page, set **Settings → Pages → Source** to **GitHub Actions**, then re-run the *Deploy to GitHub Pages* workflow.

## Start locally

```bash
npm install
npm start
```

That opens [http://localhost:5173](http://localhost:5173). Same thing as `npm run dev`.

## Pages

Each file in `src/pages/` is a screen on the site:

| File | Local | GitHub Pages |
| --- | --- | --- |
| `src/pages/HomePage.tsx` | http://localhost:5173/ | https://akuang50.github.io/best-places-to-eat-boston/ |
| `src/pages/SearchPage.tsx` | http://localhost:5173/search | https://akuang50.github.io/best-places-to-eat-boston/search |
| `src/pages/RestaurantPage.tsx` | http://localhost:5173/restaurant/fox-and-the-knife | https://akuang50.github.io/best-places-to-eat-boston/restaurant/fox-and-the-knife |
| `src/pages/MapPage.tsx` | http://localhost:5173/map | https://akuang50.github.io/best-places-to-eat-boston/map |
| `src/pages/PlanPage.tsx` | http://localhost:5173/plan | https://akuang50.github.io/best-places-to-eat-boston/plan |
| `src/pages/DemoPage.tsx` | http://localhost:5173/demo | https://akuang50.github.io/best-places-to-eat-boston/demo |
| `src/pages/ComparePage.tsx` | http://localhost:5173/compare | https://akuang50.github.io/best-places-to-eat-boston/compare |

Routes are wired in `src/App.tsx`. Restaurant data lives in `src/data/restaurants.ts`.
