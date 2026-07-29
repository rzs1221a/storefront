import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { BRAND } from "../lib/brand";
import { WORK_DESTINATIONS, STUDIO_DESTINATIONS } from "../lib/destinations";
import BrandMark from "./BrandMark";
import Conditions from "./Conditions";

/**
 * The phone profile — a real app frame rather than the desktop rail squeezed
 * into a narrow column, which is the mistake most map interfaces make.
 *
 * A tab bar at the bottom where a thumb reaches, a minimal wordmark at the
 * top, and the sheets doing the rest. Modeled on The Aerial's mobile profile.
 */

const TABS = [
  { path: "/", label: "Coast" },
  { path: "/work", label: "Work" },
  { path: "/studio", label: "Studio" },
  { path: "/contact", label: "Contact" },
];

/** The Work and Studio tabs open an index rather than a single destination. */
export function MobileIndex({ group }: { group: "work" | "studio" }) {
  const items = group === "work" ? WORK_DESTINATIONS : STUDIO_DESTINATIONS;
  const navigate = useNavigate();

  return (
    <ul className="divide-y divide-(--line)">
      {items.map((dest, i) => (
        <li key={dest.path}>
          <button
            type="button"
            onClick={() => navigate(dest.path)}
            className="flex w-full items-start gap-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
          >
            <span className="mt-1 font-mono text-[0.6875rem] text-(--color-ink-faint)">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[1.0625rem] font-medium tracking-[-0.015em]">
                {dest.label}
              </span>
              <span className="mt-1 block text-[0.875rem] leading-relaxed text-(--color-ink-soft)">
                {dest.blurb}
              </span>
            </span>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              aria-hidden="true"
              className="mt-1.5 flex-none text-(--color-ink-faint)"
            >
              <path
                d="M5 3L9.5 7L5 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </li>
      ))}
    </ul>
  );
}

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

  /** A project route keeps the Work tab lit; a studio route keeps Studio lit. */
  const activeFor = (tabPath: string) => {
    if (tabPath === "/") return pathname === "/";
    if (tabPath === "/work") return pathname.startsWith("/work");
    if (tabPath === "/contact") return pathname === "/contact";
    return STUDIO_DESTINATIONS.some(
      (d) => d.path === pathname && d.path !== "/contact"
    ) || pathname === "/studio";
  };

  return (
    <nav className="tab-bar" aria-label="Primary">
      {TABS.map((tab) => {
        const active = activeFor(tab.path);
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
