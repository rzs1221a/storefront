import { NavLink, Link } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { PRIMARY_NAV } from "../lib/destinations";
import BrandMark from "./BrandMark";
import CommandBar from "./CommandBar";

/**
 * The storefront's masthead. Sticky glass over the map: the mark, the
 * commercial navigation, the command bar, and the one action that makes
 * money. On phones the nav row collapses to a horizontal scroller — a
 * storefront's departments should be visible, not folded into a burger.
 */
export default function SiteHeader() {
  const contact = PRIMARY_NAV.find((d) => d.path === "/contact")!;
  const primary = PRIMARY_NAV.filter((d) => d.path !== "/contact");

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `head-link${isActive ? " is-active" : ""}`;

  return (
    <header className="site-head glass">
      <div className="site-head-row">
        <NavLink to="/" className="head-brand chromatic-text">
          <BrandMark size={18} className="text-(--color-signal)" />
          <span>{BRAND.name}</span>
        </NavLink>

        <div className="site-head-command">
          <CommandBar />
        </div>

        <div className="site-head-actions">
          <a href={`tel:${CONTACT.phone}`} className="head-phone mono-label">
            {CONTACT.phoneDisplay}
          </a>
          <Link to={contact.path} className="btn btn-primary btn-sm">
            Schedule a consultation
          </Link>
        </div>
      </div>

      <nav className="site-head-nav" aria-label="Primary">
        {primary.map((dest) => (
          <NavLink
            key={dest.path}
            to={dest.path}
            end={dest.path === "/"}
            className={linkClass}
          >
            {dest.label}
          </NavLink>
        ))}
        <NavLink to="/contact" className={linkClass}>
          Contact
        </NavLink>
      </nav>
    </header>
  );
}
