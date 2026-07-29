import { NavLink } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { WORK_DESTINATIONS, STUDIO_DESTINATIONS } from "../lib/destinations";
import BrandMark from "./BrandMark";
import Conditions from "./Conditions";
import MagneticButton from "./MagneticButton";

/**
 * The desktop rail. On a pointer device this is a real app frame: a floating
 * glass column carrying the brand, every destination by name, the live coastal
 * conditions, and the one action that makes money. The map owns everything else.
 *
 * Every destination is spelled out in words. A map interface is already harder
 * to skim than a scrolling page, and the audience is agents rather than
 * designers — so there is no icon-only navigation here and nothing to discover.
 */
export default function Rail() {
  const contact = STUDIO_DESTINATIONS.find((d) => d.path === "/contact")!;
  const studio = STUDIO_DESTINATIONS.filter((d) => d.path !== "/contact");

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

      <div className="rail-scroll">
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

        <p className="mono-label rail-group">The studio</p>
        <ul>
          {studio.map((dest) => (
            <li key={dest.path}>
              <NavLink to={dest.path} className={linkClass}>
                <span className="rail-index" aria-hidden="true" />
                <span className="truncate">{dest.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </div>

      <div className="rail-foot">
        {/* The instrument, not a flourish: the same role The Aerial's dateline
            plays. Renders nothing when the endpoints are unreachable. */}
        <Conditions className="rail-conditions" />

        <MagneticButton className="block">
          <NavLink to={contact.path} className="btn btn-primary w-full">
            Get a quote
          </NavLink>
        </MagneticButton>

        <a href={`tel:${CONTACT.phone}`} className="rail-phone">
          {CONTACT.phoneDisplay}
        </a>
      </div>
    </nav>
  );
}
