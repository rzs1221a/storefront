import { Link } from "react-router-dom";
import { WORK_DESTINATIONS } from "../lib/destinations";
import { TOTALS } from "../lib/work";
import CountUp from "../components/CountUp";

/**
 * The coast — what you see when no destination is open.
 *
 * Deliberately almost nothing: a short orientation and the way in. The map is
 * the content here, and covering it with a panel would defeat the point of the
 * whole redesign. On a phone the list of projects is the primary way through,
 * since tapping small beacons is harder than tapping rows.
 */
export default function Coast() {
  return (
    <div className="coast-layer" id="sheet">
      <div className="coast-card panel">
        <p className="eyebrow">Start anywhere</p>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
          Every marker on this coast is a site I built and shipped. Open one, or
          take the studio in order from the rail.
        </p>

        <dl className="mt-5 flex items-baseline gap-6 border-t border-(--line) pt-4">
          <div>
            <dt className="mono-label">Sites</dt>
            <dd className="mt-1 font-mono text-xl">
              <CountUp to={TOTALS.projects} />
            </dd>
          </div>
          <div>
            <dt className="mono-label">Lines</dt>
            <dd className="mt-1 font-mono text-xl">
              <CountUp to={TOTALS.loc} />
            </dd>
          </div>
          <div>
            <dt className="mono-label">Monthly fee</dt>
            <dd className="mt-1 font-mono text-xl">$0</dd>
          </div>
        </dl>
      </div>

      {/* Phones get the projects as a list; beacons are a pointer affordance. */}
      <ul className="coast-list">
        {WORK_DESTINATIONS.map((dest, i) => (
          <li key={dest.path}>
            <Link to={dest.path} className="coast-chip">
              <span className="font-mono text-[0.625rem] text-(--color-ink-faint)">
                {String(i + 1).padStart(2, "0")}
              </span>
              {dest.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
