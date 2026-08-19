import { useEffect, useRef } from "react";
import { allListings } from "../lib/listingsSource";
import { HOME_VIEW } from "../lib/geo";

/**
 * The living chart as the site's ground. A fixed, non-interactive satellite
 * plate of the county sits behind the scrolling document; content floats
 * over it in glass. It boots only after the page has painted and gone idle,
 * so ranking pages ship nothing map-shaped in their critical path, and it
 * drifts imperceptibly unless the visitor prefers reduced motion.
 */
export default function BackgroundMap() {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let disposed = false;
    let map: import("maplibre-gl").Map | null = null;
    let drift: number | null = null;

    const boot = async () => {
      if (disposed || !el.current) return;
      try {
        const [{ default: maplibregl }, { coastStyle, armImageryFallback }] = await Promise.all([
          import("maplibre-gl"),
          import("../lib/mapStyle"),
          import("maplibre-gl/dist/maplibre-gl.css"),
        ]);
        if (disposed || !el.current) return;
        map = new maplibregl.Map({
          container: el.current,
          style: coastStyle,
          center: HOME_VIEW.center,
          zoom: HOME_VIEW.zoom - 0.4,
          pitch: 24,
          bearing: 0,
          interactive: false,
          attributionControl: false,
        });
        armImageryFallback(map);
        allListings().forEach((l) => {
          const dot = document.createElement("span");
          dot.className = "ferry-dot";
          new maplibregl.Marker({ element: dot }).setLngLat([l.lon, l.lat]).addTo(map!);
        });

        const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!reduced) {
          const DRIFT_DEG_PER_SEC = 0.18;
          let last = performance.now();
          const turn = (now: number) => {
            if (!map) return;
            const dt = Math.min(now - last, 100);
            last = now;
            if (!document.hidden) map.setBearing(map.getBearing() + (DRIFT_DEG_PER_SEC * dt) / 1000);
            drift = requestAnimationFrame(turn);
          };
          drift = requestAnimationFrame(turn);
        }
      } catch (err) {
        console.warn("[ferrycre/map] background chart unavailable", err);
      }
    };

    // after load + idle — never on the critical path
    const start = () => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(() => boot(), { timeout: 4000 });
      } else {
        setTimeout(boot, 1200);
      }
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });

    return () => {
      disposed = true;
      window.removeEventListener("load", start);
      if (drift) cancelAnimationFrame(drift);
      map?.remove();
      map = null;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-0" aria-hidden="true">
      <div ref={el} className="h-full w-full" />
      {/* scrims keep the document readable over live imagery — light-handed,
          so the chart reads as a place, not a texture */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-paper/70 via-paper/15 to-paper/80" />
    </div>
  );
}
