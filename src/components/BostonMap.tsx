import { useEffect, useMemo } from "react";
import { MapContainer, Marker, TileLayer, Tooltip, useMap } from "react-leaflet";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { restaurants } from "../data/restaurants";
import type { Restaurant } from "../types";
import { FOOD_KINDS, foodKind, pinSvg, type FoodKindId } from "../lib/foodKind";
import "leaflet/dist/leaflet.css";

const BOSTON: L.LatLngExpression = [42.355, -71.07];
const MAX_BOUNDS = L.latLngBounds([42.3, -71.18], [42.42, -71.0]);

const iconCache = new Map<string, L.DivIcon>();

function markerIcon(kindId: FoodKindId, selected: boolean, dim: boolean) {
  const key = `${kindId}-${selected ? "s" : "n"}-${dim ? "d" : "a"}`;
  const hit = iconCache.get(key);
  if (hit) return hit;
  const kind = FOOD_KINDS.find((k) => k.id === kindId)!;
  const icon = L.divIcon({
    className: `food-pin${dim ? " is-dim" : ""}${selected ? " is-on" : ""}`,
    html: pinSvg(kind, selected),
    iconSize: selected ? [34, 44] : [28, 36],
    iconAnchor: selected ? [17, 42] : [14, 34],
    tooltipAnchor: [0, -28],
  });
  iconCache.set(key, icon);
  return icon;
}

function ResizeMap() {
  const map = useMap();
  useEffect(() => {
    const id = window.setTimeout(() => map.invalidateSize(), 80);
    return () => window.clearTimeout(id);
  }, [map]);
  return null;
}

function FlyTo({ restaurant }: { restaurant: Restaurant | null }) {
  const map = useMap();
  useEffect(() => {
    if (!restaurant) return;
    map.flyTo([restaurant.lat, restaurant.lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
  }, [map, restaurant]);
  return null;
}

export function BostonMap({
  height = 560,
  className = "",
  activeIds,
  selectedId,
  onSelect,
  legend = true,
}: {
  height?: number | string;
  className?: string;
  activeIds?: string[];
  selectedId?: string;
  onSelect?: (r: Restaurant) => void;
  legend?: boolean;
}) {
  const navigate = useNavigate();
  const page = Boolean(onSelect);

  const marks = useMemo(
    () =>
      restaurants.map((r) => {
        const kind = foodKind(r);
        const dim = Boolean(activeIds && !activeIds.includes(r.id));
        return { r, kind, dim };
      }),
    [activeIds],
  );

  const selected = selectedId ? (restaurants.find((r) => r.id === selectedId) ?? null) : null;

  return (
    <div className={`relative overflow-hidden ${className}`} style={{ height }}>
      <MapContainer
        key="osm-street"
        center={BOSTON}
        zoom={page ? 13 : 12}
        minZoom={11}
        maxZoom={17}
        maxBounds={MAX_BOUNDS}
        maxBoundsViscosity={0.85}
        scrollWheelZoom={page}
        zoomControl={page}
        className="food-map h-full w-full"
        attributionControl
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ResizeMap />
        <FlyTo restaurant={selected} />
        {marks.map(({ r, kind, dim }) => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={markerIcon(kind.id, r.id === selectedId, dim)}
            title={r.name}
            alt={r.name}
            eventHandlers={{
              click: () => (onSelect ? onSelect(r) : navigate(`/restaurant/${r.id}`)),
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1}>
              <span className="font-serif">{r.name}</span>
              <span className="meta">
                {kind.label} · {r.neighborhood}
              </span>
            </Tooltip>
          </Marker>
        ))}
      </MapContainer>
      {legend ? (
        <ul className="food-legend" aria-label="Food types">
          {FOOD_KINDS.map((k) => (
            <li key={k.id}>
              <span className="swatch" style={{ background: k.color }} />
              {k.label}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
