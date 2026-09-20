import { copyFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";

const index = "dist/index.html";
const routes = [
  "404.html",
  "chat/index.html",
  "search/index.html",
  "map/index.html",
  "plan/index.html",
  "demo/index.html",
  "compare/index.html",
  "restaurant/fox-and-the-knife/index.html",
];

for (const route of routes) {
  const dest = join("dist", route);
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(index, dest);
}
