import { BLIPS } from "../lib/watch";

/**
 * The radar room — /watch's fold, and the page's whole argument.
 *
 * The Watch is the product most in danger of sounding like every other agency
 * retainer, because "we monitor your site" is what everybody says and nobody
 * can show. So this shows it: a scope, a sweep, and returns that light as the
 * sweep crosses them, each one labelled with something the Watch actually
 * catches and what was done about it. The service is somebody watching this
 * scope so the agent does not have to, and the page opens by being that.
 *
 * Read the log beside it and the arrow is the product. "A review arrived" is
 * monitoring. "A review arrived → answered" is the thing worth paying for —
 * monitoring that ends in a notification is just a to-do list handed back to
 * the person who was trying to buy time.
 *
 * ── Zero JavaScript ──────────────────────────────────────────────────────
 *
 * The sweep is one CSS rotation and each return is one CSS animation whose
 * delay is derived from its own bearing, so a blip lights exactly when the
 * sweep reaches it. No rAF, no state, no effect, nothing to tear down — the
 * scope costs one compositor-driven transform and the log rows cost opacity.
 * It also means the reduced-motion rendering is pure CSS: sweep held as a
 * fixed lit sector, every return lit, every log row at full strength. The
 * designed static state, not a kill switch.
 *
 * The motion doctrine holds here too. This owns /watch's fold alone — the
 * Passage does not play on this page, and nothing else on screen moves while
 * the sweep is running. Two simultaneous performances is a carnival.
 */

const SIZE = 320;
const C = SIZE / 2;
const R = 140;
/** Seconds per revolution. Slow enough to read a log line as it lights. */
const PERIOD = 9;

/** Negative delay so each return peaks the moment the sweep reaches it. */
const delayFor = (bearing: number) => `${-(PERIOD * (1 - bearing / 360))}s`;

function positionOf(bearing: number, range: number) {
  const rad = (bearing * Math.PI) / 180;
  return {
    x: C + R * range * Math.sin(rad),
    y: C - R * range * Math.cos(rad),
  };
}

export default function RadarScope() {
  return (
    <div className="radar">
      <div className="radar-scope">
        <svg
          viewBox={`0 0 ${SIZE} ${SIZE}`}
          role="img"
          aria-label="A radar scope sweeping over eight returns, each one a thing the Watch caught and dealt with."
        >
          <defs>
            <linearGradient id="radar-sweep" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0%" stopColor="var(--color-signal)" stopOpacity="0" />
              <stop offset="100%" stopColor="var(--color-signal)" stopOpacity="0.34" />
            </linearGradient>
          </defs>

          {/* Range rings and bearing lines: the instrument's own furniture. */}
          {[0.33, 0.66, 1].map((ring) => (
            <circle key={ring} className="radar-ring" cx={C} cy={C} r={R * ring} />
          ))}
          {[0, 45, 90, 135].map((angle) => (
            <line
              key={angle}
              className="radar-graticule"
              x1={C - R * Math.cos((angle * Math.PI) / 180)}
              y1={C - R * Math.sin((angle * Math.PI) / 180)}
              x2={C + R * Math.cos((angle * Math.PI) / 180)}
              y2={C + R * Math.sin((angle * Math.PI) / 180)}
            />
          ))}

          {/* The sweep: a quarter-wedge of decaying light, rotating. */}
          <g className="radar-sweep">
            <path
              d={`M ${C} ${C} L ${C} ${C - R} A ${R} ${R} 0 0 1 ${C + R} ${C} Z`}
              fill="url(#radar-sweep)"
            />
            <line className="radar-hand" x1={C} y1={C} x2={C} y2={C - R} />
          </g>

          {BLIPS.map((blip) => {
            const { x, y } = positionOf(blip.bearing, blip.range);
            return (
              <g
                key={blip.event}
                className="radar-blip"
                style={{ animationDelay: delayFor(blip.bearing) }}
              >
                <circle className="radar-blip-halo" cx={x} cy={y} r="9" />
                <circle className="radar-blip-core" cx={x} cy={y} r="3" />
              </g>
            );
          })}
        </svg>
      </div>

      {/*
        The log. Same eight entries, same eight delays — a row brightens as the
        sweep crosses its return, so the scope and the words are one instrument
        rather than a graphic with a caption. It is also the whole content of
        the scope in text: crawlable, announceable, and legible if the SVG
        never paints.
      */}
      <ol className="radar-log">
        {BLIPS.map((blip) => (
          <li key={blip.event} style={{ animationDelay: delayFor(blip.bearing) }}>
            <span className="radar-log-event">{blip.event}</span>
            <span className="radar-log-arrow" aria-hidden="true">
              →
            </span>
            <span className="radar-log-action reading">{blip.action}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
