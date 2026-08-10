import { Link } from "react-router-dom";
import { BRAND, CONTACT } from "../lib/brand";
import { PRIMARY_NAV, WORK_DESTINATIONS } from "../lib/destinations";
import { CATEGORIES } from "../lib/catalog";
import Conditions from "./Conditions";

/**
 * The footer, in the global-footer anatomy: a gray band of dense small-text
 * link columns over hairlines, then the legal fine print, then the identity
 * line. One live instrument survives from the chart era — the NOAA
 * conditions readout, because a footer is where a site keeps its legend.
 */
export default function SiteFooter() {
  return (
    <footer className="site-foot" data-act-theme="light">
      <div className="site-foot-inner">
        <nav aria-label="Pages" className="site-foot-nav">
          <div>
            <p className="site-foot-heading">Storefront</p>
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
            <p className="site-foot-heading">Shipped work</p>
            <ul>
              {WORK_DESTINATIONS.map((d) => (
                <li key={d.path}>
                  <Link to={d.path}>{d.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="site-foot-heading">What I build</p>
            <ul>
              {CATEGORIES.map((c) => (
                <li key={c.slug}>
                  <Link to={`/options#${c.slug}`}>{c.name}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="site-foot-heading">Reach me</p>
            <ul>
              <li>
                <a href={`sms:${CONTACT.phone}`}>Text {CONTACT.phoneDisplay}</a>
              </li>
              <li>
                <a href={`tel:${CONTACT.phone}`}>Call {CONTACT.phoneDisplay}</a>
              </li>
              <li>
                <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
              </li>
              <li>
                <Link to="/contact">Start a project</Link>
              </li>
            </ul>
          </div>
        </nav>

        <div className="site-foot-live">
          <Conditions />
        </div>

        <p className="site-foot-legal">
          {BRAND.short} is an independent studio — not affiliated with,
          endorsed by, or acting on behalf of Berkshire Hathaway HomeServices.
          All trademarks belong to their respective owners. Background imagery
          © Esri, Maxar, Earthstar Geographics. Building data © OpenStreetMap
          contributors.
        </p>

        <div className="site-foot-identity">
          <p>
            Designed by {BRAND.name} on {CONTACT.location}.
          </p>
          <p>© {new Date().getFullYear()} {BRAND.name}</p>
        </div>
      </div>
    </footer>
  );
}
