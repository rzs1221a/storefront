import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation } from "react-router-dom";
import { PRIMARY_NAV } from "../lib/destinations";
import BrandMark from "./BrandMark";
import CommandBar from "./CommandBar";

/**
 * The global nav: one slim translucent bar, full width, always present.
 * Logo alone on the left (the mark carries the name), a centered row of
 * small text links, a search control that unfolds a sheet holding the
 * command bar, and the one commercial action on the right.
 *
 * On phones: logo + menu button; the menu is a full-screen sheet with the
 * search on top and the links stacked beneath, each row staggering in.
 */
export default function SiteHeader() {
  const contact = PRIMARY_NAV.find((d) => d.path === "/contact")!;
  const primary = PRIMARY_NAV.filter((d) => d.path !== "/contact");
  const { pathname } = useLocation();

  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement | null>(null);
  /* A question handed up from a prompt chip — seeds the field, and bumps a
     key so a second click of the same chip re-seeds. */
  const [asked, setAsked] = useState<{ q: string; n: number }>({ q: "", n: 0 });

  /* Navigation closes everything — a sheet that survives a route change
     reads as a stuck lid. State is adjusted during render (React's
     documented pattern for reacting to a prop/route change) rather than
     in an effect, so there is no cascading commit. */
  const [prevPath, setPrevPath] = useState(pathname);
  if (prevPath !== pathname) {
    setPrevPath(pathname);
    if (searchOpen) setSearchOpen(false);
    if (menuOpen) setMenuOpen(false);
  }

  /* Esc closes the search sheet; the body scroll locks under the menu. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSearchOpen(false);
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  /* `/` opens the sheet and focuses the field — CommandBar's own listener
     does the focusing; the sheet just has to be open to receive it. */
  useEffect(() => {
    const onSlash = (e: KeyboardEvent) => {
      if (e.key !== "/") return;
      const el = document.activeElement;
      if (
        el instanceof HTMLInputElement ||
        el instanceof HTMLTextAreaElement ||
        (el instanceof HTMLElement && el.isContentEditable)
      ) {
        return;
      }
      setSearchOpen(true);
    };
    window.addEventListener("keydown", onSlash);
    return () => window.removeEventListener("keydown", onSlash);
  }, []);

  /* Focus the search field once the sheet exists. */
  useEffect(() => {
    if (!searchOpen) return;
    const input = searchRef.current?.querySelector("input");
    input?.focus();
  }, [searchOpen, asked]);

  /* The page's question chips ask through here: open the sheet with the
     question already typed, so the visitor watches the site answer the
     thing they were already wondering. */
  useEffect(() => {
    const onAsk = (e: Event) => {
      const q = (e as CustomEvent<string>).detail ?? "";
      setAsked((prev) => ({ q, n: prev.n + 1 }));
      setSearchOpen(true);
    };
    window.addEventListener("seamark:ask", onAsk);
    return () => window.removeEventListener("seamark:ask", onAsk);
  }, []);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `head-link${isActive ? " is-active" : ""}`;

  return (
    <header className="global-nav">
      <div className="global-nav-row">
        <NavLink to="/" className="head-brand" aria-label="Seamark Studio home">
          <BrandMark size={17} className="text-(--color-signal)" />
        </NavLink>

        <nav className="global-nav-links" aria-label="Primary">
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

        <div className="global-nav-actions">
          <button
            type="button"
            className="global-nav-icon"
            aria-label={searchOpen ? "Close search" : "Search"}
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((v) => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
              <circle cx="6.2" cy="6.2" r="4.6" stroke="currentColor" strokeWidth="1.5" />
              <path d="M9.8 9.8 13.4 13.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <Link to={contact.path} className="head-link global-nav-cta">
            Get a quote
          </Link>
          <button
            type="button"
            className="global-nav-icon is-menu"
            aria-label={menuOpen ? "Close menu" : "Menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              {menuOpen ? (
                <path d="M3.5 3.5 12.5 12.5 M12.5 3.5 3.5 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <path d="M2.5 5.5 H13.5 M2.5 10.5 H13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* The search sheet: the command bar, unfolded beneath the bar. */}
      {searchOpen && (
        <div className="global-nav-search" ref={searchRef}>
          <CommandBar key={asked.n} initialValue={asked.q} />
        </div>
      )}

      {/* The phone menu: a full-screen sheet, links staggered. */}
      {menuOpen && (
        <nav className="global-nav-sheet" aria-label="Menu">
          <div className="global-nav-sheet-search">
            <CommandBar />
          </div>
          {[...primary, contact].map((dest, i) => (
            <NavLink
              key={dest.path}
              to={dest.path}
              end={dest.path === "/"}
              className="global-nav-sheet-link"
              style={{ "--sheet-i": i } as React.CSSProperties}
            >
              {dest.path === "/contact" ? "Contact" : dest.label}
            </NavLink>
          ))}
        </nav>
      )}
    </header>
  );
}
