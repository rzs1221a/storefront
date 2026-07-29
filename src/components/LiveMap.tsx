import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerCamera, registerTourMap, FRAMES, APPROACH } from "../lib/cameraFrames";
import { BEACONS } from "../lib/destinations";
import StarSky from "./StarSky";

/**
 * The living coast — and now the interface itself, not a backdrop.
 *
 * One MapLibre instance mounted once for the life of the session. It must
 * never remount on navigation: the entire effect depends on the camera flying
 * between destinations rather than the plate reloading under you.
 *
 * Real Esri imagery of Amelia Island and the Nassau County coast, dark-graded.
 * Each project carries a beacon at its true coordinate; clicking one navigates
 * to that project, which is what makes the map navigation rather than
 * decoration.
 *
 * If WebGL is unavailable or tiles never arrive, the gradient beneath stays
 * and every destination is still reachable from the rail. The map is the best
 * way through this site, never the only one.
 */

/** Degrees of bearing per second while idle. Slow enough to notice only if you wait. */
const ORBIT_SPEED = 0.4;

/** How long the arrival takes. Matches the opening card's hold. */
const ARRIVAL_MS = 7000;

export default function LiveMap({ dimmed }: { dimmed: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);
  // The star field has to know where the camera is looking to place the sky
  // correctly; throttled to whole degrees so it is not a per-frame re-render.
  const [camera, setCamera] = useState({ bearing: 0, pitch: 0 });
  const navigate = useNavigate();
  /*
   * Markers are created once and live for the session, so their click handlers
   * cannot close over `navigate` directly — they would capture the first one
   * forever. They read it through a ref instead, which is kept current in an
   * effect rather than during render: React may discard a render, and a ref
   * mutated in the render body would then hold a value that never happened.
   */
  const navRef = useRef(navigate);
  useEffect(() => {
    navRef.current = navigate;
  }, [navigate]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let map: import("maplibre-gl").Map | null = null;
    let raf = 0;
    let cancelled = false;
    let flyingUntil = 0;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarse = window.matchMedia("(pointer: coarse)").matches;

    const start = async () => {
      try {
        const [{ Map, Marker }, { coastStyle }] = await Promise.all([
          import("maplibre-gl"),
          import("../lib/mapStyle"),
        ]);
        if (cancelled) return;

        /*
         * The arrival: the map opens far out over the corridor and flat, then
         * descends into Amelia Island — the way you would actually approach
         * this coast, rather than cutting to it. Under reduced motion it just
         * starts where it is going.
         */
        const opening = reduced ? FRAMES.top : APPROACH;

        map = new Map({
          container,
          style: coastStyle,
          center: opening.center,
          zoom: opening.zoom,
          pitch: opening.pitch,
          bearing: opening.bearing,
          // The map is navigable but never scroll-zooms — the page has no
          // scroll, and hijacking the wheel on a marketing site is hostile.
          interactive: true,
          scrollZoom: false,
          dragRotate: !coarse,
          attributionControl: false,
          pixelRatio: Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2),
          antialias: !coarse,
          fadeDuration: 140,
        });

        (window as unknown as { __kedgeMap?: unknown }).__kedgeMap = map;

        map.on("load", () => {
          if (cancelled || !map) return;
          setLoaded(true);

          // Hand the raw map to the tour, which needs flyTo's arc rather than
          // easeTo's straight interpolation.
          registerTourMap(map);

          /* Begin the descent once tiles are actually on screen. */
          if (!reduced) {
            const home = FRAMES.top;
            flyingUntil = performance.now() + ARRIVAL_MS;
            map.easeTo({
              center: home.center,
              zoom: home.zoom,
              pitch: home.pitch,
              bearing: home.bearing,
              duration: ARRIVAL_MS,
              // A long settling tail, so it lands rather than stops.
              easing: (t) => 1 - Math.pow(1 - t, 4),
            });
          }

          /* Beacons. Built once, kept for the life of the map. */
          for (const dest of BEACONS) {
            const el = document.createElement("button");
            el.type = "button";
            el.className = "beacon";
            el.setAttribute("aria-label", `${dest.beacon.name} — open this project`);
            el.innerHTML = `<span class="beacon-dot"></span><span class="beacon-name">${dest.beacon.name}</span>`;
            el.addEventListener("click", (event) => {
              event.stopPropagation();
              navRef.current(dest.path);
            });
            new Marker({ element: el, anchor: "center" })
              .setLngLat(dest.beacon.center)
              .addTo(map);
          }

          /*
           * Below this altitude the five beacons are close enough together
           * that their labels overlap into an illegible stack, so they drop to
           * dots and the rail carries the names. The dots stay clickable.
           */
          const LABEL_MIN_ZOOM = 10.6;
          const syncLabels = () => {
            if (!map) return;
            container.dataset.labels =
              map.getZoom() >= LABEL_MIN_ZOOM ? "on" : "off";
          };
          syncLabels();
          map.on("zoom", syncLabels);

          // Feed the sky. Rounded to whole degrees so a slow orbit does not
          // re-render React sixty times a second for sub-pixel movement.
          const syncCamera = () => {
            if (!map) return;
            const b = Math.round(map.getBearing());
            const p = Math.round(map.getPitch());
            setCamera((prev) =>
              prev.bearing === b && prev.pitch === p ? prev : { bearing: b, pitch: p }
            );
          };
          syncCamera();
          map.on("move", syncCamera);

          registerCamera({
            flyTo: (frame, durationMs) => {
              if (!map) return;

              /*
               * Reduced motion removes the animation, not the navigation.
               *
               * When the map was a decorative backdrop, honouring the
               * preference meant holding the camera still. Now the camera
               * position IS the destination — refusing to move would leave
               * someone on /work/crane-island looking at open ocean. So the
               * camera still arrives, it simply arrives without the flight.
               */
              if (reduced) {
                map.jumpTo({
                  center: frame.center,
                  zoom: frame.zoom,
                  pitch: frame.pitch,
                  bearing: frame.bearing,
                });
                return;
              }

              flyingUntil = performance.now() + durationMs;
              map.easeTo({
                center: frame.center,
                zoom: frame.zoom,
                pitch: frame.pitch,
                bearing: frame.bearing,
                duration: durationMs,
                easing: (t) => 1 - Math.pow(1 - t, 4),
              });
            },
            isFlying: () => performance.now() < flyingUntil,
          });

          if (reduced) return;

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

        map.on("error", () => {});
      } catch {
        /* No map. The rail still reaches every destination. */
      }
    };

    void start();

    return () => {
      cancelled = true;
      registerCamera(null);
      cancelAnimationFrame(raf);
      delete (window as unknown as { __kedgeMap?: unknown }).__kedgeMap;
      map?.remove();
    };
  }, []);

  return (
    <>
      <div
        ref={containerRef}
        className="live-map"
        data-loaded={loaded ? "true" : "false"}
        data-dimmed={dimmed ? "true" : "false"}
      />
      {/* The real sky, above the plate and below the chrome. Draws nothing
          while the sun is up. */}
      <StarSky bearing={camera.bearing} pitch={camera.pitch} />
    </>
  );
}
