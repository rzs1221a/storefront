import { useEffect, useRef } from "react";
import type { CommercialListing } from "../lib/commercial";

/**
 * The light map on /listings — a locator, not the instrument (/explore is the
 * instrument). maplibre-gl is imported dynamically so it never rides in the
 * main bundle and only loads when this panel actually mounts.
 */
export default function MiniMap({
  listings,
  onOpen,
}: {
  listings: CommercialListing[];
  onOpen: (slug: string) => void;
}) {
  const el = useRef<HTMLDivElement>(null);
  const onOpenRef = useRef(onOpen);
  useEffect(() => {
    onOpenRef.current = onOpen;
  }, [onOpen]);

  useEffect(() => {
    let disposed = false;
    let map: import("maplibre-gl").Map | null = null;
    (async () => {
      const [{ default: maplibregl }, { coastStyle }] = await Promise.all([
        import("maplibre-gl"),
        import("../lib/mapStyle"),
        // the stylesheet rides with the lazy chunk, not the critical path
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (disposed || !el.current) return;
      const bounds = new maplibregl.LngLatBounds();
      listings.forEach((l) => bounds.extend([l.lon, l.lat]));
      map = new maplibregl.Map({
        container: el.current,
        style: coastStyle,
        bounds,
        fitBoundsOptions: { padding: 60, maxZoom: 12 },
        attributionControl: { compact: true },
        cooperativeGestures: true,
      });
      listings.forEach((l) => {
        const pin = document.createElement("button");
        pin.className = "ferry-pin";
        pin.setAttribute("aria-label", l.address);
        pin.addEventListener("click", () => onOpenRef.current(l.slug));
        new maplibregl.Marker({ element: pin }).setLngLat([l.lon, l.lat]).addTo(map!);
      });
    })();
    return () => {
      disposed = true;
      map?.remove();
    };
  }, [listings]);

  return (
    <div className="glass overflow-hidden">
      <div ref={el} className="h-[380px] w-full bg-raise" role="region" aria-label="Listing locations map" />
    </div>
  );
}
