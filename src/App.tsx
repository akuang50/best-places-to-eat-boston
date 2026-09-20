import { Nav } from "./components/Nav";
import { HomePage } from "./pages/HomePage";
import { SearchPage } from "./pages/SearchPage";
import { RestaurantPage } from "./pages/RestaurantPage";
import { MapPage } from "./pages/MapPage";
import { PlanPage } from "./pages/PlanPage";
import { DemoPage } from "./pages/DemoPage";
import { ComparePage } from "./pages/ComparePage";
import { Navigate, Route, Routes, useLocation, Link } from "react-router-dom";

function Footer() {
  const { pathname } = useLocation();
  if (pathname === "/map") return null;

  return (
    <footer className="border-t border-line">
      <div className="page grid gap-8 py-12 sm:grid-cols-3">
        <div>
          <p className="font-serif text-[18px] tracking-tight">ForkBoston</p>
          <p className="mt-2 max-w-xs text-[13px] leading-relaxed text-muted">
            An evidence-backed map of where to eat — built for HackMIT 2026.
          </p>
        </div>
        <div className="text-[13px] leading-7">
          <Link to="/map" className="block hover:text-muted">
            Map
          </Link>
          <Link to="/plan" className="block hover:text-muted">
            Trails
          </Link>
          <Link to="/demo" className="block hover:text-muted">
            Demo
          </Link>
        </div>
        <p className="text-[12px] leading-relaxed text-muted">
          Photos are Unsplash cuisine photography, not restaurant interiors. Ratings are public-consensus estimates for the demo, not live API pulls.
        </p>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <div className="min-h-svh bg-cream text-ink">
      <Nav />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/restaurant/:id" element={<RestaurantPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route path="/plan" element={<PlanPage />} />
        <Route path="/demo" element={<DemoPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </div>
  );
}
