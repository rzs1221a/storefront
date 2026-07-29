import { useEffect, useRef, useState } from "react";

/**
 * The living coast, behind everything.
 *
 * One MapLibre instance mounted once, fixed, non-interactive, at the lowest
 * layer — the same idea as `heymann-williams-coastal/src/components/
 * BackgroundMap.tsx`, reduced to what a single-page site needs. Real Esri
 * satellite imagery of Amelia Island and the Nassau County coast: the actual
 * ground all five portfolio projects cover, so the page answers "where am I"
 * before a word is read.
 *
 * Everything about how it loads is deliberate:
 *
 *  - maplibre-gl is a ~200 kB gzipped dependency, so it is imported
 *    dynamically after first paint and during idle time. It never blocks the
 *    hero, and a visitor who bounces immediately pays nothing for it.
 *  - If WebGL is unavailable, the import fails, or tiles never arrive, the
 *    gradient beneath simply stays visible. There is no error state to see
 *    because there is nothing to break — the page is designed to look right
 *    without the map and better with it.
 *  - The idle orbit is suspended when the tab is hidden and never starts at
 *    all under `prefers-reduced-motion`.
 */

/** Degrees of bearing per second. Slow enough to notice only if you wait. */
const ORBIT_SPEED = 0.42;

export default function BackgroundMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: import("maplibre-gl").Map | null = null;
    let raf = 0;
    let cancelled = false;
    let idleHandle = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = async () => {
      try {
        const [{ Map }, { coastStyle, HOME_VIEW }] = await Promise.all([
          import("maplibre-gl"),
          import("../lib/mapStyle"),
        ]);
        if (cancelled) return;

        map = new Map({
          container,
          style: coastStyle,
          center: HOME_VIEW.center,
          zoom: HOME_VIEW.zoom,
          pitch: HOME_VIEW.pitch,
          bearing: HOME_VIEW.bearing,
          interactive: false,
          attributionControl: false,
          // The background is decorative; a crisp 2× plate is not worth the
          // fill rate on a layer sitting under a dark tint.
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
          antialias: false,
          fadeDuration: 120,
        });

        map.on("load", () => {
          if (cancelled) return;
          setLoaded(true);
          if (reduced) return;

          // Idle orbit. rotateTo/easeTo would fight each frame, so the bearing
          // is advanced directly against elapsed time.
          let last = performance.now();
          const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const dt = (now - last) / 1000;
            last = now;
            if (document.hidden || !map) return;
            map.setBearing(map.getBearing() + ORBIT_SPEED * dt);
          };
          raf = requestAnimationFrame(tick);
        });

        // A tile failure is not worth a console full of noise; the gradient
        // underneath is a perfectly good outcome.
        map.on("error", () => {});
      } catch {
        /* No map. The page still reads correctly without one. */
      }
    };

    // Wait for first paint, then for the browser to be idle.
    const timeout = window.setTimeout(() => {
      const idle = (
        window as Window & {
          requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
        }
      ).requestIdleCallback;
      if (idle) idleHandle = idle(() => void start(), { timeout: 1200 });
      else void start();
    }, 260);

    return () => {
      cancelled = true;
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
      const cancelIdle = (
        window as Window & { cancelIdleCallback?: (h: number) => void }
      ).cancelIdleCallback;
      if (idleHandle && cancelIdle) cancelIdle(idleHandle);
      map?.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="atmosphere-map"
      data-loaded={loaded ? "true" : "false"}
    />
  );
}
