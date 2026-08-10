import { Suspense, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { destinationFor } from "../lib/destinations";
import { getSky } from "../lib/sky";
import { BRAND } from "../lib/brand";
import SiteHeader from "./SiteHeader";
import SiteFooter from "./SiteFooter";

/**
 * The living light. The site is lit by the real sky over Amelia Island:
 * solar altitude resolves to a light phase (night/dawn/morning/midday/
 * golden/dusk), stamped on <html> every thirty seconds, and the CSS grades
 * the dark tiles with a barely-there cast to match — cool at night, warm
 * at golden hour. State, not motion: reduced-motion visitors get the same
 * sky everyone on the island does.
 */
function useSkylight() {
  useEffect(() => {
    const stamp = () => {
      document.documentElement.dataset.sky = getSky().light;
    };
    stamp();
    const timer = window.setInterval(stamp, 30_000);
    return () => {
      window.clearInterval(timer);
      delete document.documentElement.dataset.sky;
    };
  }, []);
}

/**
 * The beam. On fine-pointer devices the cursor carries a soft searchlight
 * across the dark tiles — the visitor sweeps the coast the way a light
 * sweeps water. One fixed element, transform-only, rAF-throttled, faded
 * out after two idle seconds. Decoration tied to presence: skipped
 * entirely under reduced motion, invisible to the keyboard and to
 * screen readers.
 */
function Beam() {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let idleTimer = 0;
    let x = 0;
    let y = 0;

    const paint = () => {
      raf = 0;
      el.style.transform = `translate3d(${x - 300}px, ${y - 300}px, 0)`;
    };
    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is-lit");
      if (!raf) raf = requestAnimationFrame(paint);
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(() => el.classList.remove("is-lit"), 2000);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
      window.clearTimeout(idleTimer);
    };
  }, []);

  return <div ref={ref} className="beam" aria-hidden="true" />;
}

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
  useSkylight();

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

      <Beam />
    </div>
  );
}
