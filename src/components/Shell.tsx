import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { frameFor, destinationFor } from "../lib/destinations";
import { flyToFrame, type CameraPadding } from "../lib/cameraFrames";
import { getSky } from "../lib/sky";
import { recordVisit } from "../lib/wake";
import { BRAND } from "../lib/brand";
import LiveMap from "./LiveMap";
import Rail from "./Rail";
import Opening from "./Opening";
import { MobileTopBar, TabBar } from "./MobileFrame";

/**
 * The app frame. The map mounts here once and never remounts — navigating
 * flies the camera, it does not reload the plate. Everything else is chrome
 * arranged around it.
 *
 * Nothing in this tree scrolls the document; see `html, body` in index.css.
 * Sheets scroll inside themselves.
 */

/**
 * The real sky, sampled every thirty seconds. One Shell re-render per tick;
 * the map is untouched — the grade div sits beside it, not inside it.
 */
function useSky() {
  const [sky, setSky] = useState(() => getSky());
  useEffect(() => {
    const timer = window.setInterval(() => setSky(getSky()), 30_000);
    return () => window.clearInterval(timer);
  }, []);
  return sky;
}

/**
 * Where the chrome sits, declared to the camera.
 *
 * The sheet occupies the right of the desktop viewport and the bottom of the
 * phone, so a frame centered on the viewport puts its subject *behind* the
 * chrome. Padding moves every subject into the clear ground instead — the
 * frames in cameraFrames.ts stay authored; the chrome declares its own
 * occupancy. Always returns a complete object: MapLibre persists camera
 * padding across moves, so an omitted side would leak the previous flight's.
 */
function paddingFor(pathname: string, mobile: boolean): CameraPadding {
  const sheetOpen = pathname !== "/";
  if (mobile) {
    return {
      top: 0,
      left: 0,
      right: 0,
      // Sheet clearance when reading; deck clearance on the coast.
      bottom: sheetOpen ? Math.min(window.innerHeight * 0.4, 360) : 200,
    };
  }
  return {
    top: 0,
    bottom: 0,
    // Clear of the rail without re-centering behind it.
    left: sheetOpen ? 96 : 0,
    // Capped as a fraction of width — MapLibre misbehaves when padding
    // approaches the viewport size, which matters at the 900px desktop floor.
    right: sheetOpen ? Math.min(480, window.innerWidth * 0.38) : 0,
  };
}

export default function Shell() {
  const { pathname } = useLocation();
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 900
  );
  const sky = useSky();

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Fly to the destination's frame on every navigation, framed beside the
     chrome — and log the mark into the session's wake. */
  useEffect(() => {
    flyToFrame(frameFor(pathname), paddingFor(pathname, mobile));
    recordVisit(pathname);
  }, [pathname, mobile]);

  /* Keep the document title honest — these are real pages. */
  useEffect(() => {
    const dest = destinationFor(pathname);
    document.title =
      dest.path === "/"
        ? `${BRAND.name} — ${dest.title}`
        : `${dest.title} — ${BRAND.name}`;
  }, [pathname]);

  const onCoast = pathname === "/";

  return (
    <div className="shell-frame">
      <a href="#sheet" className="skip-link btn btn-primary btn-sm">
        Skip to content
      </a>

      <LiveMap dimmed={!onCoast} />
      {/* The plate lit by the real sun — soft-light over the imagery, keyed
          to actual solar elevation. Sits below .map-tint so the tint's
          legibility floor still applies over it. */}
      <div
        className="sky-grade"
        style={{ background: sky.gradient }}
        aria-hidden="true"
      />
      <div className="map-tint" aria-hidden="true" />

      {mobile ? <MobileTopBar /> : <Rail />}

      <Outlet />

      {mobile && <TabBar />}

      <Opening />
    </div>
  );
}
