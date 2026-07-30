import { useSyncExternalStore } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { PRIMARY_NAV, WORK_DESTINATIONS, destinationFor } from "../lib/destinations";
import { CATEGORIES } from "../lib/catalog";
import { subscribe, getSnapshot, previousMark, TOTAL_MARKS } from "../lib/wake";
import { legBetween } from "../lib/chart";
import BrandMark from "./BrandMark";
import Conditions from "./Conditions";
import MagneticButton from "./MagneticButton";
import CommandBar from "./CommandBar";
import TourControl from "./TourControl";

/**
 * The chart block: how much of the offer this visitor has actually seen, and
 * the leg they just sailed — distance and course between the last two marks,
 * in nautical miles, because this is a chart. Straight lines over water, not
 * routes. Quiet by design: two mono lines, no bars, no badges.
 */
function ChartLine() {
  const { pathname } = useLocation();
  const wake = useSyncExternalStore(subscribe, getSnapshot);

  const here = destinationFor(pathname);
  const prev = previousMark();
  const leg =
    here.beacon && prev && prev.path !== here.path
      ? legBetween(prev.beacon.center, here.beacon.center)
      : null;

  if (wake.charted === 0) return null;

  return (
    <div className="rail-chart">
      <p className="mono-label">
        {wake.charted} of {TOTAL_MARKS} marks charted
      </p>
      {leg && leg.nm > 0 && (
        <p className="mono-label">
          {leg.nm} nm {leg.compass} from {prev!.beacon.name}
        </p>
      )}
    </div>
  );
}

/**
 * The desktop rail. On a pointer device this is a real app frame: a floating
 * glass column carrying the brand, the commercial navigation, every project by
 * name, the live coastal conditions, and the one action that makes money. The
 * map owns everything else.
 *
 * It leads with the five things a buyer looks for by name — Home, Packages,
 * Work, Capabilities, Contact — and lists the projects beneath. A map
 * interface is already harder to skim than a scrolling page, and the audience
 * is agents rather than designers, so there is no icon-only navigation here
 * and nothing to discover.
 */
export default function Rail() {
  const contact = PRIMARY_NAV.find((d) => d.path === "/contact")!;
  const primary = PRIMARY_NAV.filter((d) => d.path !== "/contact");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `rail-link${isActive ? " is-active" : ""}`;

  return (
    <nav className="rail panel" aria-label="Primary">
      <NavLink to="/" className="rail-brand">
        <BrandMark size={18} className="text-(--color-signal)" />
        <span>{BRAND.name}</span>
      </NavLink>

      <p className="rail-claim">
        Websites for real estate professionals, along this coast.
      </p>

      <CommandBar />

      <div className="rail-scroll">
        <ul className="rail-primary">
          {primary.map((dest) => (
            <li key={dest.path}>
              <NavLink
                to={dest.path}
                end={dest.path === "/"}
                className={linkClass}
              >
                <span className="rail-index" aria-hidden="true" />
                <span className="truncate">{dest.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        <p className="mono-label rail-group">Selected work</p>
        <ul>
          {WORK_DESTINATIONS.map((dest, i) => (
            <li key={dest.path}>
              <NavLink to={dest.path} className={linkClass}>
                <span className="rail-index">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="truncate">{dest.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>

        {/* The catalog, by category rather than all 24 options — the rail must
            stay skimmable. Each link lands on that section of the shelf. */}
        <p className="mono-label rail-group">What I can build</p>
        <ul>
          {CATEGORIES.map((cat) => (
            <li key={cat.slug}>
              <Link to={`/options#${cat.slug}`} className="rail-link">
                <span className="rail-index" aria-hidden="true" />
                <span className="truncate">{cat.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-foot">
        <TourControl />

        <ChartLine />

        {/* The instrument, not a flourish: the same role The Aerial's dateline
            plays. Renders nothing when the endpoints are unreachable. */}
        <Conditions className="rail-conditions" />

        <MagneticButton className="block">
          <NavLink to={contact.path} className="btn btn-primary w-full">
            Schedule a consultation
          </NavLink>
        </MagneticButton>

        <a href={`tel:${CONTACT.phone}`} className="rail-phone">
          {CONTACT.phoneDisplay}
        </a>
      </div>
    </nav>
  );
}
