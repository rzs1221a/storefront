import { Link } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { PRIMARY_NAV, WORK_DESTINATIONS } from "../lib/destinations";
import { CATEGORIES } from "../lib/catalog";
import Conditions from "./Conditions";
import BrandMark from "./BrandMark";
import QuickText from "./QuickText";

/**
 * The storefront's foot: the chart instruments, the live conditions, the
 * full directory, and the disclaimers. The instruments moved here from the
 * old rail — a footer is where a chart keeps its legend.
 */

export default function SiteFooter() {
  return (
    <footer className="site-foot surface-glass">
      <div className="site-foot-grid">
        <div>
          <p className="head-brand">
            <BrandMark size={16} className="text-(--color-signal)" />
            <span>{BRAND.name}</span>
          </p>
          <p className="mt-3 max-w-[36ch] text-body-sm leading-relaxed text-(--color-ink-muted)">
            {BRAND.tagline} Based on {CONTACT.location}.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <QuickText className="btn btn-primary btn-sm" />
            <a href={`tel:${CONTACT.phone}`} className="btn btn-ghost btn-sm">
              Call {CONTACT.phoneDisplay}
            </a>
          </div>
          <div className="mt-6">
            <Conditions />
          </div>
        </div>

        <nav aria-label="Pages" className="site-foot-nav">
          <div>
            <p className="mono-label mb-3">Storefront</p>
            <ul>
              {PRIMARY_NAV.map((d) => (
                <li key={d.path}>
                  <Link to={d.path}>{d.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/process">How it goes</Link>
              </li>
              <li>
                <Link to="/questions">Questions</Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mono-label mb-3">Shipped work</p>
            <ul>
              {WORK_DESTINATIONS.map((d) => (
                <li key={d.path}>
                  <Link to={d.path}>{d.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mono-label mb-3">What I build</p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/options#${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </div>

      <p className="site-foot-legal">
        {BRAND.short} is an independent studio — not affiliated with, endorsed
        by, or acting on behalf of Berkshire Hathaway HomeServices. All
        trademarks belong to their respective owners. Background imagery ©
        Esri, Maxar, Earthstar Geographics. Building data © OpenStreetMap
        contributors.
      </p>
    </footer>
  );
}
