import { useEffect, useRef, useState } from "react";
import { registerCamera, FRAMES } from "../lib/cameraFrames";

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
    /** Timestamp until which a scripted flight owns the camera. */
    let flyingUntil = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const start = async () => {
      try {
        const [{ Map }, { coastStyle }] = await Promise.all([
          import("maplibre-gl"),
          import("../lib/mapStyle"),
        ]);
        if (cancelled) return;

        // The opening frame is the same one the hero section registers, so the
        // camera never jumps when the first observer callback lands.
        const opening = FRAMES.top;

        map = new Map({
          container,
          style: coastStyle,
          center: opening.center,
          zoom: opening.zoom,
          pitch: opening.pitch,
          bearing: opening.bearing,
          interactive: false,
          attributionControl: false,
          // The background is decorative; a crisp 2× plate is not worth the
          // fill rate on a layer sitting under a dark tint.
          pixelRatio: Math.min(window.devicePixelRatio || 1, 1.5),
          antialias: false,
          fadeDuration: 120,
        });

        /*
         * Debug/test handle. The camera flight is this site's signature
         * interaction and is otherwise unobservable from outside the module —
         * MapLibre attaches nothing to the DOM, so scripts/camera-check.mjs
         * would have to assert our own bookkeeping rather than the real camera.
         * A read-only reference to a decorative background map exposes nothing
         * sensitive.
         */
        (window as unknown as { __kedgeMap?: unknown }).__kedgeMap = map;

        map.on("load", () => {
          if (cancelled) return;
          setLoaded(true);

          /*
           * Hand the camera to the frame system. `flyTo` is deliberately
           * `easeTo` rather than MapLibre's `flyTo`: the latter arcs out to a
           * low zoom and back in, which is dramatic between continents and
           * nauseating between two points ten miles apart.
           */
          registerCamera({
            flyTo: (frame, durationMs) => {
              if (!map) return;
              flyingUntil = performance.now() + durationMs;
              map.easeTo({
                center: frame.center,
                zoom: frame.zoom,
                pitch: frame.pitch,
                bearing: frame.bearing,
                duration: durationMs,
                easing: (t) => 1 - Math.pow(1 - t, 3),
              });
            },
            isFlying: () => performance.now() < flyingUntil,
          });

          if (reduced) return;

          // Idle orbit. rotateTo/easeTo would fight each frame, so the bearing
          // is advanced directly against elapsed time — and it yields entirely
          // while a scripted flight owns the camera.
          let last = performance.now();
          const tick = (now: number) => {
            raf = requestAnimationFrame(tick);
            const dt = (now - last) / 1000;
            last = now;
            if (document.hidden || !map) return;
            if (now < flyingUntil) return;
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
      registerCamera(null);
      window.clearTimeout(timeout);
      cancelAnimationFrame(raf);
      const cancelIdle = (
        window as Window & { cancelIdleCallback?: (h: number) => void }
      ).cancelIdleCallback;
      if (idleHandle && cancelIdle) cancelIdle(idleHandle);
      delete (window as unknown as { __kedgeMap?: unknown }).__kedgeMap;
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
