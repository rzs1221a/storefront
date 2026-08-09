import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { flyToFrame } from "../lib/cameraFrames";
import { frameFor } from "../lib/destinations";
import { getSky } from "../lib/sky";
import CommandBar from "./CommandBar";
import TourControl from "./TourControl";
import Conditions from "./Conditions";
import MarkDeck from "./MarkDeck";

const LiveMap = lazy(() => import("./LiveMap"));

/**
 * The exhibit — the only place on the site the live chart exists.
 *
 * The map used to be the wallpaper behind everything; now it is a framed
 * instrument shown once, mid-film, in a dark room. Scarcity is the point:
 * a thing that is always there is a background, and this is the product.
 *
 * The engine and its tiles are paid for only by visitors who approach the
 * frame: an IntersectionObserver with a generous rootMargin mounts the map
 * a viewport early, so by the time the exhibit is on screen the coast is
 * already lit. Until then — and forever, for no-WebGL visitors — the frame
 * holds the real sky gradient for this hour at this latitude, which is the
 * site's designed fallback rather than a spinner.
 *
 * The control deck is the demonstration: type plain English and the camera
 * answers (CommandBar onResolve → flyToFrame, no navigation), tour the six
 * shipped marks, read the live tide. On phones the swipe deck is the way in.
 */

/** Phrases the deck suggests — every one resolves; the honest shrug is
    reserved for genuinely unknown input, never for our own examples. */
const DECK_EXAMPLES = [
  "show me the brokerage site",
  "where's the flagship",
  "crane island",
  "I sell waterfront",
];

export default function MapExhibit() {
  const frameRef = useRef<HTMLDivElement | null>(null);
  // No observer available (ancient embedder, some crawlers): mount eagerly
  // rather than never. Decided at first render, not inside the effect.
  const [mountMap, setMountMap] = useState(
    () => typeof IntersectionObserver === "undefined"
  );
  // The sky poster is sampled once at render; it only backs the loading
  // moment, so it does not need the 30-second re-sample loop.
  const [poster] = useState(() => getSky());

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || mountMap) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setMountMap(true);
          observer.disconnect();
        }
      },
      // A full viewport of head start: the chunk and the first tiles load
      // while the visitor is still reading the act above.
      { rootMargin: "800px 0px" }
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, [mountMap]);

  return (
    <div className="exhibit">
      <div
        ref={frameRef}
        className="exhibit-frame"
        style={{ background: poster.gradient }}
      >
        {mountMap && (
          <Suspense fallback={null}>
            <LiveMap dimmed={false} />
          </Suspense>
        )}
      </div>

      <div className="exhibit-deck">
        <CommandBar
          examples={DECK_EXAMPLES}
          onResolve={(hit) => {
            flyToFrame(frameFor(hit.destination.path));
            return true;
          }}
        />
        <div className="exhibit-deck-row">
          <TourControl />
          <Conditions />
        </div>
      </div>

      {/* The twelve marks, one swipe each — the phone's control row. */}
      <MarkDeck />
    </div>
  );
}
