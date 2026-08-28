import { useEffect, useRef, useState } from "react";
import type { CommercialListing } from "../lib/commercial";

/**
 * The light map — a locator, not the instrument (/explore is the instrument).
 * maplibre-gl is imported dynamically and only once the panel actually
 * scrolls into view, so it never rides in the main bundle and never touches
 * first paint on a ranking page.
 */
export default function MiniMap({
  listings,
  onOpen,
  view,
  heightClass = "h-[380px]",
  interactive = true,
}: {
  listings: CommercialListing[];
  onOpen: (slug: string) => void;
  /** Fixed framing (market pages); omitted → fit bounds of the pins. */
  view?: { lat: number; lon: number; zoom: number };
  heightClass?: string;
  interactive?: boolean;
}) {
  const el = useRef<HTMLDivElement>(null);
  const onOpenRef = useRef(onOpen);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  // defer everything until the panel is near the viewport
  useEffect(() => {
    const node = el.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px" }
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    let disposed = false;
    let map: import("maplibre-gl").Map | null = null;
    (async () => {
      try {
      const [{ default: maplibregl }, { coastStyle, armImageryFallback }] = await Promise.all([
        import("maplibre-gl"),
        import("../lib/mapStyle"),
        // the stylesheet rides with the lazy chunk, not the critical path
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (disposed || !el.current) return;
      const base = {
        container: el.current,
        style: coastStyle,
        attributionControl: { compact: true } as const,
        cooperativeGestures: true,
        interactive,
      };
      if (view) {
        map = new maplibregl.Map({ ...base, center: [view.lon, view.lat], zoom: view.zoom });
      } else {
        const bounds = new maplibregl.LngLatBounds();
        listings.forEach((l) => bounds.extend([l.lon, l.lat]));
        map = new maplibregl.Map({ ...base, bounds, fitBoundsOptions: { padding: 60, maxZoom: 12 } });
      }
      map.on("error", (e) => console.warn("[ferrycre/map]", e.error ?? e));
      armImageryFallback(map);
      listings.forEach((l) => {
        const pin = document.createElement("button");
        pin.className = "ferry-pin";
        pin.setAttribute("aria-label", l.address);
        pin.addEventListener("click", () => onOpenRef.current(l.slug));
        new maplibregl.Marker({ element: pin }).setLngLat([l.lon, l.lat]).addTo(map!);
      });
      } catch (err) {
        console.error("[ferrycre/map] boot failed", err);
      }
    })();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [visible, listings, view, interactive]);

  return (
    <div className="glass overflow-hidden">
      <div ref={el} className={`${heightClass} w-full bg-raise`} role="region" aria-label="Property locations map" />
    </div>
  );
}
