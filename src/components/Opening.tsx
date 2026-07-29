import { useEffect, useState } from "react";

/**
 * The orienting moment.
 *
 * A map you land on cold is thrilling if you build websites and disorienting
 * if you sell houses. This holds the claim still for a few seconds, then
 * dissolves into the live interface — enough to say what this is and where you
 * are before anything moves.
 *
 * It also covers the map's first paint honestly. Without it the visitor's
 * first impression is a half-drawn plate assembling itself.
 *
 * Shown once per session, so a returning visitor lands straight in. Dismissible
 * immediately by click, key, or the button — it must never feel like a gate.
 */

const SEEN_KEY = "kedge:opened";
const HOLD_MS = 2600;

export default function Opening() {
  const [present, setPresent] = useState(() => {
    if (typeof window === "undefined") return false;
    try {
      return sessionStorage.getItem(SEEN_KEY) !== "1";
    } catch {
      // Private browsing can throw on sessionStorage; showing the opening is
      // the safe fallback, never a crash.
      return true;
    }
  });
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (!present) return;

    const dismiss = () => {
      setLeaving(true);
      try {
        sessionStorage.setItem(SEEN_KEY, "1");
      } catch {
        /* ignore */
      }
      // Match the CSS fade so the node leaves after it has finished fading.
      window.setTimeout(() => setPresent(false), 900);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(dismiss, reduced ? 400 : HOLD_MS);

    const onKey = () => dismiss();
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onKey);

    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onKey);
    };
  }, [present]);

  if (!present) return null;

  return (
    <div
      className="opening"
      data-leaving={leaving ? "true" : "false"}
      // Purely an introduction to content that is already in the DOM behind it,
      // so it is not announced and never traps focus.
      aria-hidden="true"
    >
      <div className="opening-inner">
        <p className="eyebrow">Kedge — Amelia Island, Florida</p>
        <p className="opening-claim">
          Your website should be the reason they call you.
        </p>
        <p className="opening-sub">
          Five sites, along this coast. Open one.
        </p>
      </div>
    </div>
  );
}
