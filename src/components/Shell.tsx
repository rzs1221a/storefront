import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { destinationFor } from "../lib/destinations";
import { BRAND } from "../lib/brand";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * The app frame, third act: chrome only.
 *
 * The first era was a map that had a storefront; the second, a storefront
 * over a fixed living chart. Now the chart lives in exactly one place — the
 * exhibit on the home page (components/MapExhibit.tsx) — and the shell is
 * what a shell should be: header, outlet, footer. No global WebGL, no
 * camera choreography on navigation, no startup gate. Pages own their own
 * drama.
 */
export default function Shell() {
  const { pathname, hash } = useLocation();

  /* Keep the document title honest — these are real pages. */
  useEffect(() => {
    const dest = destinationFor(pathname);
    document.title =
      dest.path === "/"
        ? `${BRAND.name} — ${dest.title}`
        : `${dest.title} — ${BRAND.name}`;
  }, [pathname]);

  /* New page, top of page — unless the link named a place on it (SPA
     routers do not honour hashes on their own). scroll-margin-top keeps
     the target clear of the masthead. */
  useEffect(() => {
    if (hash) {
      document.querySelector(hash)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="shell-frame">
      <a href="#sheet" className="skip-link btn btn-primary btn-sm">
        Skip to content
      </a>

      <SiteHeader />

      <main className="storefront">
        {/* Null fallback on purpose: routes are tiny split chunks — a
            spinner would be louder than the wait. */}
        <Suspense fallback={null}>
          <Outlet />
        </Suspense>
      </main>

      <SiteFooter />
    </div>
  );
}
