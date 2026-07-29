import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { frameFor, destinationFor } from "../lib/destinations";
import { flyToFrame } from "../lib/cameraFrames";
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
export default function Shell() {
  const { pathname } = useLocation();
  const [mobile, setMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 900
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 899px)");
    const onChange = () => setMobile(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  /* Fly to the destination's frame on every navigation. */
  useEffect(() => {
    flyToFrame(frameFor(pathname));
  }, [pathname]);

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
      <div className="map-tint" aria-hidden="true" />

      {mobile ? <MobileTopBar /> : <Rail />}

      <Outlet />

      {mobile && <TabBar />}

      <Opening />
    </div>
  );
}
