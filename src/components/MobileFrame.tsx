import { NavLink, useLocation } from "react-router-dom";
import { BRAND } from "../lib/brand";
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
 * The five commercial destinations, with labels short enough to sit in a tab.
 * `match` is the path prefix that keeps a tab lit — a project route keeps Work
 * lit, so a visitor two levels deep still knows where they are.
 */
const TABS = [
  { path: "/", label: "Home", match: "/" },
  { path: "/packages", label: "Packages", match: "/packages" },
  { path: "/work", label: "Work", match: "/work" },
  { path: "/capabilities", label: "Demo", match: "/capabilities" },
  { path: "/contact", label: "Contact", match: "/contact" },
];

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
