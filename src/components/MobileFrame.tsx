import { NavLink, useLocation } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { PRIMARY_NAV } from "../lib/destinations";
import BrandMark from "./BrandMark";
import Conditions from "./Conditions";

/**
 * The phone profile — a real app frame rather than the desktop rail squeezed
 * into a narrow column, which is the mistake most map interfaces make.
 *
 * A tab bar at the bottom where a thumb reaches, a minimal wordmark at the
 * top, and the sheets doing the rest. Modeled on The Aerial's mobile profile.
 */

/**
 * The commercial destinations that fit a thumb bar, derived from the route
 * table: any primary-nav destination carrying a `mobileTab` label earns a tab.
 * Capabilities deliberately does not — six tabs do not fit a thumb, and the
 * demo stays reachable through the command bar and in-sheet links. The tab's
 * path doubles as the prefix that keeps it lit, so a visitor two levels deep
 * still knows where they are.
 */
const TABS = PRIMARY_NAV.filter((d) => d.mobileTab).map((d) => ({
  path: d.path,
  label: d.mobileTab!,
  match: d.path,
}));

export function MobileTopBar() {
  return (
    <header className="mobile-top">
      <NavLink to="/" className="flex items-center gap-2 text-[0.9375rem] font-medium">
        <BrandMark size={16} className="text-(--color-signal)" />
        {BRAND.name}
      </NavLink>
      <Conditions className="mobile-conditions" compact />
    </header>
  );
}

export function TabBar() {
  const { pathname } = useLocation();

  const activeFor = (match: string) =>
    match === "/" ? pathname === "/" : pathname.startsWith(match);

  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((tab) => {
        const active = activeFor(tab.match);
        return (
          <NavLink
            key={tab.path}
            to={tab.path}
            aria-current={active ? "page" : undefined}
            className={`tab${active ? " is-active" : ""}`}
          >
            {tab.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
