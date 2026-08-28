import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import BackgroundMap from "./BackgroundMap";
import { NAV, SITE, telHref, mailHref } from "../lib/site";
import { SAMPLE_DATA } from "../lib/listingsSource";
import { markets } from "../lib/markets";

function SampleNotice() {
  if (!SAMPLE_DATA) return null;
  return (
    <div className="bg-signal-deep/60 px-4 py-1.5 text-center text-xs text-bone/90">
      Preview build — sample inventory shown while live listings are being loaded.
    </div>
  );
}

function Header() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className="fixed inset-x-0 top-0 z-40">
      <SampleNotice />
      <div className="glass mx-auto mt-3 flex max-w-6xl items-center justify-between rounded-2xl px-4 py-2.5 sm:px-6">
        <Link to="/" className="flex items-baseline gap-2" aria-label="Ferry CRE home">
          <span className="font-display text-lg font-semibold tracking-tight">FERRY</span>
          <span className="text-lg font-light tracking-widest text-signal-soft">CRE</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              className={({ isActive }) =>
                `rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  isActive ? "bg-white/10 text-bone" : "text-stone hover:text-bone"
                }`
              }
            >
              {n.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a href={telHref} className="btn-signal hidden px-4 py-1.5 text-sm sm:inline-flex">
            {SITE.phone}
          </a>
          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            className="btn-ghost h-9 w-9 md:hidden"
            onClick={() => setOpen((v) => !v)}
          >
            <span aria-hidden>{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>
      {open && (
        <nav className="glass-deep mx-3 mt-2 flex flex-col gap-1 p-3 md:hidden" aria-label="Mobile">
          {NAV.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              onClick={close}
              className="rounded-xl px-4 py-3 text-base text-bone hover:bg-white/10"
            >
              {n.label}
            </NavLink>
          ))}
          <a href={telHref} onClick={close} className="btn-signal mt-1 px-4 py-3 text-base">
            Call {SITE.phone}
          </a>
        </nav>
      )}
    </header>
  );
}

function Footer() {
  return (
    <footer className="hairline mt-24 bg-paper/80 px-5 pb-10 pt-12 backdrop-blur-xl">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <p className="font-display text-lg font-semibold">
            FERRY <span className="font-light text-signal-soft">CRE</span>
          </p>
          <p className="mt-2 text-sm text-stone">
            {SITE.name} · {SITE.title}
            <br />
            {SITE.brokerage}
          </p>
          <p className="mt-3 text-sm text-stone">
            <a href={telHref} className="hover:text-bone">
              {SITE.phone}
            </a>
            <br />
            <a href={mailHref} className="hover:text-bone">
              {SITE.email}
            </a>
          </p>
        </div>
        <div>
          <p className="eyebrow mb-3">Markets</p>
          <ul className="space-y-1.5 text-sm text-stone">
            {markets.map((m) => (
              <li key={m.slug}>
                <Link to={`/${m.slug}`} className="hover:text-bone">
                  {m.name} commercial real estate
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow mb-3">Office</p>
          <img
            src="/brand/hw-commercial-lockup-cream.svg"
            alt="Berkshire Hathaway HomeServices Heymann Williams Realty — Commercial Division"
            width={874}
            height={302}
            loading="lazy"
            className="mb-4 h-16 w-auto opacity-90"
          />
          <p className="text-sm text-stone">
            {SITE.officeAddress}
            <br />
            Office {SITE.officePhone}
          </p>
          <p className="mt-3 text-sm text-stone">
            <a href={SITE.corporatePage} rel="noopener" className="hover:text-bone">
              Corporate profile ↗
            </a>
          </p>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-white/10 pt-6 text-xs leading-relaxed text-faint">
        <p>
          {SITE.name}, {SITE.licenseNumber}. {SITE.brokerage}, {SITE.officeAddress}, {SITE.officePhone}.
        </p>
        <p className="mt-2">{SITE.franchiseDisclosure}</p>
        <p className="mt-2">
          Property information is provided by the listing agent and deemed reliable but not guaranteed; buyers and
          tenants should verify all figures, including square footage, zoning, and traffic counts, independently.
          Traffic counts cite FDOT published AADT with station and year where shown.
        </p>
      </div>
    </footer>
  );
}

export default function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);
  return (
    <div className="relative min-h-screen bg-paper">
      {/* the living chart under everything; content floats over it in glass */}
      <BackgroundMap />
      <div className="relative z-10">
        <Header />
        <main>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
