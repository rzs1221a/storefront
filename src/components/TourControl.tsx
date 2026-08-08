import { useEffect, useRef, useState } from "react";
import { runTour, FRAMES, type TourStop } from "../lib/cameraFrames";
import { WORK } from "../lib/work";

/**
 * "Take the tour" — flies all five projects in order, banking left and right,
 * with each one's name and a line of copy.
 *
 * This is the direct answer to the one real weakness of a map interface: it
 * cannot be skimmed. A scrolling page shows you everything in ten seconds; a
 * map makes you find it. One control closes that gap.
 *
 * It ends the instant the visitor touches the map — see runTour.
 */

const STOPS: TourStop[] = WORK.map((item) => ({
  frame: FRAMES[`work-${item.slug}`],
  name: item.name,
  line: item.kind,
  path: `/work/${item.slug}`,
}));

export default function TourControl() {
  const [active, setActive] = useState(false);
  const [stop, setStop] = useState<{ stop: TourStop; index: number } | null>(null);
  const cancelRef = useRef<(() => void) | null>(null);

  // Never leave a flight running after the control unmounts.
  useEffect(() => () => cancelRef.current?.(), []);

  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // A guided camera flight is the definition of motion for its own sake, so
  // under reduced motion the control simply is not offered — the rail already
  // lists every project.
  if (reduced) return null;

  const start = () => {
    if (active) {
      cancelRef.current?.();
      return;
    }
    setActive(true);
    cancelRef.current = runTour(STOPS, (next, index) => {
      if (!next) {
        setActive(false);
        setStop(null);
        return;
      }
      setStop({ stop: next, index });
    });
  };

  return (
    <>
      <button
        type="button"
        onClick={start}
        className={`tour-button${active ? " is-active" : ""}`}
      >
        {/* "Shipped work", said explicitly: the tour flies only the five real
            sites, never the concept markers — a guided flight over concepts
            presented like case studies is exactly the confusion to avoid. */}
        {active ? "Stop the tour" : "Tour the shipped work"}
      </button>

      {active && stop && (
        <div className="tour-caption" role="status" aria-live="polite">
          <span className="font-mono text-micro text-(--color-signal)">
            {String(stop.index + 1).padStart(2, "0")} / {String(STOPS.length).padStart(2, "0")}
          </span>
          <span className="tour-caption-name">{stop.stop.name}</span>
          <span className="tour-caption-line">{stop.stop.line}</span>
        </div>
      )}
    </>
  );
}
