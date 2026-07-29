import { NavLink } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { PRIMARY_NAV, WORK_DESTINATIONS } from "../lib/destinations";
import BrandMark from "./BrandMark";
import Conditions from "./Conditions";
import MagneticButton from "./MagneticButton";
import CommandBar from "./CommandBar";
import TourControl from "./TourControl";

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
      </div>

      <div className="rail-foot">
        <TourControl />

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
