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

/**
 * How long the claim holds before dissolving.
 *
 * Deliberately short. With the 700ms fade that follows, a visitor is looking
 * at the value proposition and both calls to action inside two seconds — well
 * under the three-second window where a cold visitor decides whether to stay.
 * An opening that costs a conversion is not worth the atmosphere.
 */
const HOLD_MS = 1300;
const FADE_MS = 700;

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
      window.setTimeout(() => setPresent(false), FADE_MS);
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
        {/* Says out loud that this is not a gate. Any key or click dismisses
            it, and it never blocks the interface behind it. */}
        <p className="opening-skip">Click anywhere to skip</p>
      </div>
    </div>
  );
}
