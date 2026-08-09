import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { BEACONS } from "../lib/destinations";
import { FRAMES, flyToFrame } from "../lib/cameraFrames";
import QuickText from "./QuickText";

/**
 * The deck — sailing the chart with a thumb.
 *
 * A horizontal snap carousel of every mark on the chart, twelve of them: six
 * shipped sites and six build-ready concepts, in charted order down the
 * corridor. Swiping does not navigate — it flies the camera to that mark, the
 * way hovering the rail does on desktop. The URL stays home; the deck is a
 * spyglass. Tapping a card commits: real navigation, sheet, the usual.
 *
 * Ported in mechanics from the-aerial's MobileDeck: the scroll handler is
 * debounced and reports the card nearest the row's center; any scroll the
 * component itself issues sets a `programmatic` flag with a timer so the
 * handler never answers our own echo.
 */

/** Camera clearance for the deck + tab bar while spyglassing. */
const DECK_PADDING = { top: 0, right: 0, bottom: 220, left: 0 };

const ITEMS = BEACONS.map((dest) => ({
  path: dest.path,
  frame: dest.frame,
  name: dest.beacon.name,
  label: dest.label,
  kind: dest.beacon.kind,
  light: dest.beacon.light ?? null,
}));

export default function MarkDeck() {
  const navigate = useNavigate();

  const rowRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef(0);
  const programmatic = useRef(false);
  const lastReported = useRef(-1);

  useEffect(() => {
    return () => window.clearTimeout(debounceRef.current);
  }, []);

  const onScroll = () => {
    if (programmatic.current) return;
    window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      const row = rowRef.current;
      if (!row) return;
      const center = row.scrollLeft + row.clientWidth / 2;
      let best = -1;
      let bestDist = Infinity;
      const cards = row.querySelectorAll<HTMLElement>("[data-deck-card]");
      cards.forEach((card, i) => {
        const cardCenter = card.offsetLeft + card.offsetWidth / 2;
        const dist = Math.abs(cardCenter - center);
        if (dist < bestDist) {
          bestDist = dist;
          best = i;
        }
      });
      if (best < 0 || best === lastReported.current) return;
      lastReported.current = best;
      const frame = FRAMES[ITEMS[best].frame];
      // Camera only — the URL stays home. Same contract as hover-fly.
      if (frame) flyToFrame(frame, DECK_PADDING);
    }, 110);
  };

  return (
    <div className="mark-deck" aria-label="The marks on this chart">
      <div className="mark-deck-context">
        <p className="mono-label">{BEACONS.length} marks</p>
        <QuickText className="mark-deck-text btn btn-primary btn-sm" />
      </div>

      <div className="mark-deck-row" ref={rowRef} onScroll={onScroll}>
        {ITEMS.map((item) => (
          <button
            key={item.path}
            type="button"
            data-deck-card
            className="mark-card"
            onClick={() => navigate(item.path)}
          >
            <span className="mark-card-head">
              <span className="mark-card-name">{item.label}</span>
              <span
                className={`badge ${item.kind === "work" ? "badge-shipped" : "badge-concept"}`}
              >
                {item.kind === "work" ? "Shipped" : "Concept"}
              </span>
            </span>
            <span className="mark-card-sub">
              {item.light ? item.light.characteristic : item.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
