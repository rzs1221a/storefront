import { useEffect, useState } from "react";
import { BRAND, CONTACT } from "../lib/brand";
import BrandMark from "./BrandMark";

/**
 * The arrival, ported from heymann-williams-coastal's StartupGate and pointed
 * at this coast: black → the mark's frame draws itself in light → the line,
 * the caption, a progress sweep — then the gate parts and the chart is
 * already beneath you, the hero glass blooming in over it.
 *
 * It also covers the map's first paint honestly. Without it the visitor's
 * first impression is a half-drawn plate assembling itself. The gate exits
 * the moment the map reports ready (`seamark:map-ready` from LiveMap), or at
 * a hard cap — whichever comes first. It is an introduction, never a gate:
 * any key or pointer skips it instantly.
 *
 * Shown once per session (`seamark:opened`), so a returning visitor lands
 * straight in — scripts/verify.mjs relies on exactly this contract.
 */

const SEEN_KEY = "seamark:opened";

/** Hard cap on the wait — the coast is worth 2.6 s, never more. */
const CAP_MS = 2600;
/** The exit choreography's length; the node leaves after it finishes. */
const EXIT_MS = 1050;
const REDUCED_HOLD_MS = 400;
const REDUCED_FADE_MS = 600;

export default function Opening() {
  const [present, setPresent] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SEEN_KEY) !== "1";
    } catch {
      // Private browsing can throw on sessionStorage; showing the arrival is
      // the safe fallback, never a crash.
      return true;
    }
  });
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (!present) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let exitTimer = 0;
    let done = false;

    const leave = () => {
      if (done) return;
      done = true;
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      setExiting(true);
      if (!reduced) {
        // One-shot bloom so the hero glass settles in as the gate parts.
        document.body.classList.add("route-blooming");
        window.setTimeout(
          () => document.body.classList.remove("route-blooming"),
          620
        );
      }
      exitTimer = window.setTimeout(
        () => setPresent(false),
        reduced ? REDUCED_FADE_MS : EXIT_MS
      );
    };

    const cap = window.setTimeout(leave, reduced ? REDUCED_HOLD_MS : CAP_MS);
    window.addEventListener("seamark:map-ready", leave);
    window.addEventListener("keydown", leave);
    window.addEventListener("pointerdown", leave);

    return () => {
      window.clearTimeout(cap);
      window.clearTimeout(exitTimer);
      window.removeEventListener("seamark:map-ready", leave);
      window.removeEventListener("keydown", leave);
      window.removeEventListener("pointerdown", leave);
      document.body.classList.remove("route-blooming");
    };
  }, [present]);

  if (!present) return null;

  return (
    <div
      className={`startup-gate${exiting ? " startup-gate-exit" : ""}`}
      // Purely an introduction to content that is already in the DOM behind
      // it, so it is not announced and never traps focus.
      aria-hidden="true"
    >
      <span className="startup-blackout" />

      <div className="startup-mark">
        <span className="startup-build-top" />
        <span className="startup-field" />
        <div className="startup-logo">
          <BrandMark size={44} className="text-(--color-ink)" />
        </div>
        <p className="startup-name">{BRAND.name}</p>
        <span className="startup-line" />
        <span className="startup-caption">{CONTACT.location}</span>
        <span className="startup-progress">
          <span className="startup-progress-fill" />
        </span>
      </div>
    </div>
  );
}
