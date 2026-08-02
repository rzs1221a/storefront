import { useEffect, useRef, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { frameFor, destinationFor } from "../lib/destinations";
import { flyToFrame, type CameraPadding } from "../lib/cameraFrames";
import { getSky } from "../lib/sky";
import { recordVisit } from "../lib/wake";
import { BRAND } from "../lib/brand";
import { prefersReducedMotion, setRenderMotionIntent } from "../lib/renderMotion";
import LiveMap from "./LiveMap";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";
import Opening from "./Opening";

/**
 * The app frame, inverted: a storefront that has a map, not a map that has a
 * storefront. The document scrolls now — content flows over a fixed living
 * chart, showing it through full-height windows between sections — and the
 * map still mounts exactly once, still flies on every navigation, still
 * carries the light signatures and the wake. The chart stopped being the
 * frame and became the sky.
 */

/** The real sky, sampled every thirty seconds. */
function useSky() {
  const [sky, setSky] = useState(() => getSky());
  useEffect(() => {
    const timer = window.setInterval(() => setSky(getSky()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return sky;
}

/**
 * Detail pages open with a chart window above the article, so the camera
 * frames its subject in that upper band rather than centered behind the
 * panel. The home page manages its own camera through observeFrames.
 */
function paddingFor(pathname: string): CameraPadding {
  if (pathname === "/") return { top: 0, right: 0, bottom: 0, left: 0 };
  return {
    top: 0,
    right: 0,
    bottom: Math.round(window.innerHeight * 0.35),
    left: 0,
  };
}

export default function Shell() {
  const { pathname } = useLocation();
  const sky = useSky();

  /* Fly to the destination's frame on every navigation, framed into the
     page's chart window — and log the mark into the session's wake. */
  useEffect(() => {
    flyToFrame(frameFor(pathname), paddingFor(pathname));
    recordVisit(pathname);
  }, [pathname]);

  /* Route bloom, ported from heymann-williams-coastal's Layout: each
     client-side navigation re-arms `body.route-blooming` (remove → forced
     reflow → add) so the incoming page's glass blooms in over the flying
     chart. Skipped on first mount — the arrival gate owns that moment — and
     under reduced motion. */
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      return;
    }
    if (prefersReducedMotion()) return;
    setRenderMotionIntent("route", 760);
    document.body.classList.remove("route-blooming");
    void document.body.offsetWidth;
    document.body.classList.add("route-blooming");
    const timer = window.setTimeout(() => {
      document.body.classList.remove("route-blooming");
    }, 620);
    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("route-blooming");
    };
  }, [pathname]);

  /* Keep the document title honest — these are real pages. */
  useEffect(() => {
    const dest = destinationFor(pathname);
    document.title =
      dest.path === "/"
        ? `${BRAND.name} — ${dest.title}`
        : `${dest.title} — ${BRAND.name}`;
  }, [pathname]);

  return (
    <div className="shell-frame">
      <a href="#sheet" className="skip-link btn btn-primary btn-sm">
        Skip to content
      </a>

      {/* The sky: map, sun grade, and legibility tint, all fixed behind the
          scrolling storefront. */}
      <div className="map-fix" aria-hidden="false">
        <LiveMap dimmed={false} />
        <div
          className="sky-grade"
          style={{ background: sky.gradient }}
          aria-hidden="true"
        />
        <div className="map-tint" aria-hidden="true" />
      </div>

      <SiteHeader />

      <main className="storefront">
        <Outlet />
      </main>

      <SiteFooter />

      <Opening />
    </div>
  );
}
