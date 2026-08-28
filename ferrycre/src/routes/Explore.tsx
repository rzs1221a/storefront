import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import type { Map as MLMap } from "maplibre-gl";
import {
  priceLine,
  sizeLine,
  TRANSACTION_LABEL,
  USE_TYPE_LABEL,
  type CommercialListing,
} from "../lib/commercial";
import { aadt, miles, minutes } from "../lib/format";
import { ANCHORS, CORRIDORS, HOME_VIEW, MAX_BOUNDS, ZOOM_RANGE, milesBetween } from "../lib/geo";
import { allListings } from "../lib/listingsSource";
import { record } from "../lib/attunement";
import { useCanonical, useDocumentTitle } from "../lib/seo";

/**
 * The instrument. A commercial buyer reads a map for answers a residential
 * buyer never asks: what is the traffic on that frontage, where is the
 * ingress, who are the neighbors, how far to the interchange. This surface is
 * lazy-loaded behind its own route boundary — the prerender never touches it
 * and it never slows a ranking page. maplibre and the deck.gl photoreal stack
 * load only here.
 */

const silk = (t: number) => 1 - Math.pow(1 - t, 3);

export default function Explore() {
  useDocumentTitle(
    "Explore the County · Ferry CRE",
    "Walk Nassau County's commercial corridors: listings, traffic counts, frontage, and drive distances on a living map."
  );
  useCanonical("/explore");

  const [params] = useSearchParams();
  const shell = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MLMap | null>(null);
  const walkDrift = useRef<number | null>(null);
  const reduced = useRef(false);
  const [ready, setReady] = useState(false);
  const [mapTrouble, setMapTrouble] = useState<string | null>(null);
  const [walking, setWalking] = useState(false);
  const [photoreal, setPhotoreal] = useState(false);
  const [selected, setSelected] = useState<CommercialListing | null>(null);
  const listings = allListings();

  useEffect(() => {
    record({ t: "explore_open", id: params.get("listing") });
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [params]);

  /* boot the scene */
  useEffect(() => {
    let disposed = false;
    (async () => {
      try {
      const [{ default: maplibregl }, { coastStyle, armImageryFallback }] = await Promise.all([
        import("maplibre-gl"),
        import("../lib/mapStyle"),
        import("maplibre-gl/dist/maplibre-gl.css"),
      ]);
      if (disposed || !shell.current) return;

      const focusSlug = params.get("listing");
      const focus = focusSlug ? listings.find((l) => l.slug === focusSlug) : null;

      const map = new maplibregl.Map({
        container: shell.current,
        style: coastStyle,
        center: focus ? [focus.lon, focus.lat] : HOME_VIEW.center,
        zoom: focus ? 14.4 : HOME_VIEW.zoom,
        pitch: reduced.current ? 0 : focus ? 52 : HOME_VIEW.pitch,
        bearing: HOME_VIEW.bearing,
        maxBounds: MAX_BOUNDS,
        minZoom: ZOOM_RANGE.minZoom,
        maxZoom: ZOOM_RANGE.maxZoom,
        attributionControl: { compact: true },
      });
      mapRef.current = map;
      // re-measure once layout settles — insurance against any late size change
      requestAnimationFrame(() => {
        if (!disposed) map.resize();
      });
      armImageryFallback(map, (msg) => {
        if (!disposed) setMapTrouble(msg);
      });

      // listing beacons
      listings.forEach((l) => {
        const pin = document.createElement("button");
        pin.className = "ferry-pin ferry-pin-lg";
        pin.setAttribute("aria-label", `${l.address} — open details`);
        pin.addEventListener("click", () => setSelected(l));
        new maplibregl.Marker({ element: pin }).setLngLat([l.lon, l.lat]).addTo(map);
      });

      // corridor + anchor labels as DOM marks (no glyph server needed)
      const label = (text: string, lat: number, lon: number, cls: string, minZoom = 0) => {
        const el = document.createElement("span");
        el.className = cls;
        el.textContent = text;
        const marker = new maplibregl.Marker({ element: el }).setLngLat([lon, lat]).addTo(map);
        if (minZoom > 0) {
          const sync = () => {
            el.style.display = map.getZoom() >= minZoom ? "" : "none";
          };
          map.on("zoom", sync);
          sync();
        }
        return marker;
      };
      CORRIDORS.forEach((c) => label(c.name, c.lat, c.lon, "plate-label", c.minZoom ?? 0));
      ANCHORS.forEach((a) => label(a.name, a.lat, a.lon, "plate-anchor", 9.4));

      // lift the veil on load — or after a beat if a tile host stalls, so the
      // chrome, rail, and instrument panel are never held hostage by imagery
      const lift = () => {
        if (!disposed) setReady(true);
      };
      map.on("load", lift);
      map.once("error", lift);
      setTimeout(lift, 4000);

      // if something upstream breaks (tile host, style, GPU), say so on
      // screen instead of leaving a silent black plate
      map.on("error", (e) => {
        console.warn("[ferrycre/map]", e.error ?? e);
      });
      setTimeout(() => {
        if (disposed) return;
        try {
          if (!map.areTilesLoaded() || !map.isStyleLoaded()) {
            setMapTrouble(
              (prev) => prev ?? "Imagery is slow or unavailable — check the browser console for [ferrycre/map] lines."
            );
          }
        } catch {
          /* map gone */
        }
      }, 8000);
      // a slow network is not a broken one: clear the slowness notice (and
      // only that one) once the plate actually finishes
      map.on("idle", () => {
        if (disposed) return;
        setMapTrouble((prev) => (prev?.startsWith("Imagery is slow") ? null : prev));
      });

      // photoreal at street level, with hysteresis so the overlay doesn't
      // flap while the camera hovers around the threshold (the walk manages
      // its own attach and is left alone here)
      const PHOTOREAL_ON = 16.6;
      const PHOTOREAL_OFF = 15.9;
      map.on("zoomend", async () => {
        if (disposed || walkDrift.current) return;
        const z = map.getZoom();
        const { attachPhotoreal, detachPhotoreal, photorealActive, photorealAvailable } = await import(
          "../lib/photoreal"
        );
        if (!photorealAvailable()) return;
        if (z >= PHOTOREAL_ON && !photorealActive()) {
          attachPhotoreal(map).then((ok) => {
            if (!disposed) setPhotoreal(ok && map.getZoom() >= PHOTOREAL_OFF);
          });
        } else if (z < PHOTOREAL_OFF && photorealActive()) {
          detachPhotoreal();
          if (!disposed) setPhotoreal(false);
        }
      });
      if (focus) setSelected(focus);
      } catch (err) {
        console.error("[ferrycre/map] boot failed", err);
        if (!disposed) {
          setMapTrouble(`The map engine could not start: ${err instanceof Error ? err.message : String(err)}`);
          setReady(true);
        }
      }
    })();
    return () => {
      disposed = true;
      if (walkDrift.current) cancelAnimationFrame(walkDrift.current);
      mapRef.current?.remove();
      mapRef.current = null;
    };
    // the scene mounts once; focus comes from the initial URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const flyTo = useCallback((l: CommercialListing) => {
    setSelected(l);
    mapRef.current?.flyTo({
      center: [l.lon, l.lat],
      zoom: 15.2,
      pitch: reduced.current ? 0 : 54,
      speed: 0.9,
      curve: 1.4,
      essential: true,
    });
  }, []);

  /* the walk — dive to street level among the buildings and drift slowly */
  const endWalk = useCallback(async () => {
    if (walkDrift.current) cancelAnimationFrame(walkDrift.current);
    walkDrift.current = null;
    setWalking(false);
    const { detachPhotoreal } = await import("../lib/photoreal");
    detachPhotoreal();
    setPhotoreal(false);
    const map = mapRef.current;
    if (map)
      map.easeTo({ zoom: 14.2, pitch: reduced.current ? 0 : 46, bearing: 0, duration: 1100, easing: silk });
  }, []);

  const startWalk = useCallback(async (l: CommercialListing) => {
    const map = mapRef.current;
    if (!map) return;
    setWalking(true);
    const { attachPhotoreal, photorealAvailable } = await import("../lib/photoreal");
    if (photorealAvailable()) attachPhotoreal(map).then((ok) => setPhotoreal(ok));
    map.flyTo({
      center: [l.lon, l.lat],
      zoom: 17.3,
      pitch: 68,
      bearing: map.getBearing() + 30,
      speed: 0.8,
      curve: 1.5,
      essential: true,
    });
    if (reduced.current) return; // no drift under reduced motion
    map.once("moveend", () => {
      const DRIFT_DEG_PER_SEC = 1.2;
      let last = performance.now();
      const drift = (now: number) => {
        if (!walkDrift.current) return;
        const dt = Math.min(now - last, 100);
        last = now;
        map.setBearing(map.getBearing() + (DRIFT_DEG_PER_SEC * dt) / 1000);
        walkDrift.current = requestAnimationFrame(drift);
      };
      walkDrift.current = requestAnimationFrame(drift);
      const stop = () => {
        if (walkDrift.current) {
          cancelAnimationFrame(walkDrift.current);
          walkDrift.current = null;
        }
      };
      ["pointerdown", "wheel", "touchstart"].forEach((ev) =>
        map.getCanvas().addEventListener(ev, stop, { once: true, passive: true })
      );
    });
  }, []);

  const sel = selected;

  return (
    <div className="fixed inset-0 bg-paper">
      {/* explicit height, not absolute+inset: maplibre's own stylesheet forces
          position:relative on this element, which collapses an inset-sized box
          to zero height (the "black map" bug) */}
      <div ref={shell} className="h-full w-full" role="application" aria-label="Nassau County commercial map" />

      {/* top chrome */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-start justify-between p-4">
        <Link to="/" className="glass pointer-events-auto flex items-baseline gap-2 px-4 py-2">
          <span className="font-display text-base font-semibold">FERRY</span>
          <span className="text-base font-light tracking-widest text-signal-soft">CRE</span>
        </Link>
        <div className="pointer-events-auto flex gap-2">
          {walking && (
            <button type="button" onClick={endWalk} className="btn-signal px-4 py-2 text-sm">
              End walk
            </button>
          )}
          <Link to="/listings" className="btn-ghost px-4 py-2 text-sm">
            List view
          </Link>
        </div>
      </div>

      {!ready && (
        <div className="absolute inset-0 z-20 grid place-items-center bg-paper">
          <p className="text-sm text-faint">Preparing the county…</p>
        </div>
      )}

      {mapTrouble && (
        <p className="glass pointer-events-none absolute left-1/2 top-16 z-10 max-w-md -translate-x-1/2 px-4 py-2 text-center text-xs text-stone">
          {mapTrouble}
        </p>
      )}

      {/* attribution while photoreal renders (required by Google's terms) */}
      {photoreal && (
        <span className="absolute bottom-1 left-1 z-10 rounded bg-paper/70 px-1.5 py-0.5 text-[10px] text-stone">
          © Google
        </span>
      )}

      {/* the listing rail — steps aside on mobile while the sheet is up */}
      <div
        className={`absolute inset-x-0 bottom-0 z-10 gap-2 overflow-x-auto p-4 sm:inset-x-auto sm:left-4 sm:top-20 sm:bottom-auto sm:w-72 sm:flex-col sm:overflow-visible sm:p-0 ${
          sel ? "hidden sm:flex" : "flex"
        }`}
      >
        {listings.map((l) => (
          <button
            key={l.id}
            type="button"
            onClick={() => flyTo(l)}
            className={`glass min-w-[220px] shrink-0 p-3.5 text-left transition-colors sm:min-w-0 ${
              sel?.id === l.id ? "outline outline-1 outline-signal" : ""
            }`}
          >
            <p className="text-xs text-faint">
              {USE_TYPE_LABEL[l.useType]} · {TRANSACTION_LABEL[l.transaction]}
            </p>
            <p className="mt-0.5 truncate text-sm font-medium text-bone">{l.address}</p>
            <p className="mt-0.5 text-xs text-stone">{priceLine(l)}</p>
          </button>
        ))}
      </div>

      {/* the position instrument — right panel on desktop, bottom sheet on mobile */}
      {sel && (
        <aside className="glass-deep absolute z-10 overflow-y-auto p-5 max-sm:inset-x-2 max-sm:bottom-2 max-sm:max-h-[62vh] sm:right-4 sm:top-20 sm:max-h-[calc(100vh-7rem)] sm:w-96 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="eyebrow">
                {USE_TYPE_LABEL[sel.useType]} · {TRANSACTION_LABEL[sel.transaction]}
              </p>
              <h2 className="mt-1.5 text-lg font-medium leading-snug">{sel.address}</h2>
              <p className="text-sm text-stone">
                {sel.city} · {priceLine(sel)} · {sizeLine(sel)}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close panel"
              className="btn-ghost h-8 w-8 shrink-0 text-sm"
            >
              ✕
            </button>
          </div>

          <dl className="mt-4">
            {sel.frontageFt && (
              <div className="spec-row">
                <dt>Frontage</dt>
                <dd>
                  {sel.frontageFt} ft on {sel.frontageOn}
                </dd>
              </div>
            )}
            {sel.trafficCount && (
              <div className="spec-row">
                <dt>Traffic</dt>
                <dd>
                  {aadt(sel.trafficCount)} ({sel.trafficCountYear})
                </dd>
              </div>
            )}
            {sel.ingress && (
              <div className="spec-row">
                <dt>Ingress</dt>
                <dd className="max-w-[12rem]">{sel.ingress}</dd>
              </div>
            )}
            {sel.zoning && (
              <div className="spec-row">
                <dt>Zoning</dt>
                <dd>{sel.zoning}</dd>
              </div>
            )}
          </dl>

          <h3 className="eyebrow mb-2 mt-5">Straight-line distances</h3>
          <dl>
            {ANCHORS.slice(0, 5).map((a) => (
              <div className="spec-row" key={a.key}>
                <dt>{a.name}</dt>
                <dd>{miles(milesBetween(sel.lat, sel.lon, a.lat, a.lon))}</dd>
              </div>
            ))}
          </dl>

          {(sel.driveTimes ?? []).length > 0 && (
            <>
              <h3 className="eyebrow mb-2 mt-5">Drive times</h3>
              <dl>
                {sel.driveTimes!.map((d) => (
                  <div className="spec-row" key={d.label}>
                    <dt>{d.label}</dt>
                    <dd>{minutes(d.minutes)}</dd>
                  </div>
                ))}
              </dl>
            </>
          )}

          {sel.trafficCount && (
            <p className="mt-3 text-[11px] leading-relaxed text-faint">Traffic source: {sel.trafficCountSource}.</p>
          )}

          <div className="mt-5 flex gap-2">
            <button type="button" onClick={() => startWalk(sel)} className="btn-signal flex-1 px-4 py-2.5 text-sm">
              Walk the street
            </button>
            <Link to={`/listings/${sel.slug}`} className="btn-ghost flex-1 px-4 py-2.5 text-sm">
              Full listing
            </Link>
          </div>
        </aside>
      )}
    </div>
  );
}
