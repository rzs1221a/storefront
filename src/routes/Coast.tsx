import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { TIERS } from "../lib/offer";
import { CATALOG_TOTALS } from "../lib/catalog";
import BrowserFrame from "../components/BrowserFrame";
import MagneticButton from "../components/MagneticButton";
import CountUp from "../components/CountUp";

/**
 * Home — the hero, over the live coast.
 *
 * The map is still the interface and still the reason this site does not look
 * like anything else. But a visitor who lands on a beautiful map and cannot
 * tell what is being sold leaves, so the hero states the offer in words, shows
 * one project running, and gives two ways forward: the packages for someone
 * comparing, and a consultation for someone ready.
 *
 * The visual proof is the top project in a browser frame — and because The
 * Aerial is publicly reachable, the frame's "Run it live" control boots the
 * actual application inside the hero. Nothing else on this page is as
 * persuasive as an agent flying a real 3D map before they have spoken to me.
 * It stays click-to-load: mounting a deck.gl app unasked would wreck the page.
 */

const FEATURED = WORK[0];

export default function Coast() {
  return (
    <div className="coast-layer" id="sheet">
      <div className="hero panel">
        <div className="hero-copy">
          <p className="eyebrow">Kedge — Amelia Island, Florida</p>

          <h1 className="hero-title">
            High-converting custom web systems and interactive real estate
            platforms.
          </h1>

          <p className="hero-sub">
            Built once, owned outright, no monthly platform fee. Static-fast
            pages that rank on their own, live map and market data wired in, and
            every lead routed straight into BoldTrail.{" "}
            <Link
              to="/options"
              className="text-(--color-ink-soft) underline decoration-(--line-strong) underline-offset-4 hover:text-(--color-ink)"
            >
              {CATALOG_TOTALS.options} site types, from open-house pages to full
              3D market maps →
            </Link>
          </p>

          <div className="hero-actions">
            <MagneticButton>
              <Link to="/options" className="btn btn-primary">
                See everything I build
              </Link>
            </MagneticButton>
            <Link to="/contact" className="btn btn-ghost">
              Schedule a consultation
            </Link>
          </div>

          <dl className="hero-stats">
            <div>
              <dt className="mono-label">Sites shipped</dt>
              <dd>
                <CountUp to={TOTALS.projects} />
              </dd>
            </div>
            <div>
              <dt className="mono-label">Lines of source</dt>
              <dd>
                <CountUp to={TOTALS.loc} />
              </dd>
            </div>
            <div>
              <dt className="mono-label">Monthly fee</dt>
              <dd>$0</dd>
            </div>
          </dl>
        </div>

        <div className="hero-proof">
          <BrowserFrame
            url={FEATURED.liveUrl?.replace(/^https:\/\//, "")}
            liveUrl={FEATURED.liveUrl}
          >
            <picture>
              <source media="(max-width: 640px)" srcSet={FEATURED.mobile} />
              <img
                src={FEATURED.desktop}
                alt={`The ${FEATURED.name} website — ${FEATURED.kind.toLowerCase()}`}
                width={1440}
                height={900}
                decoding="async"
                className="block w-full"
              />
            </picture>
          </BrowserFrame>

          <p className="hero-proof-caption">
            <Link to={`/work/${FEATURED.slug}`} className="hover:text-(--color-ink)">
              {FEATURED.name} — {FEATURED.kind.toLowerCase()}
            </Link>
            <span className="text-(--color-ink-faint)">
              {" "}
              · one of {TOTALS.projects} shipped along this coast
            </span>
          </p>
        </div>
      </div>

      {/* Phones get the packages as chips: the fastest route to the offer on a
          screen where the hero already fills the panel. The map stays the
          atmosphere and the reward, never the only way through. */}
      <ul className="coast-list">
        <li>
          <Link to="/options" className="coast-chip is-primary">
            Everything I build
          </Link>
        </li>
        <li>
          <Link to="/packages" className="coast-chip">
            Packages
          </Link>
        </li>
        {TIERS.map((tier) => (
          <li key={tier.slug}>
            <Link to={`/contact?package=${tier.slug}`} className="coast-chip">
              {tier.name}
            </Link>
          </li>
        ))}
        <li>
          <Link to="/work" className="coast-chip">
            Case studies
          </Link>
        </li>
      </ul>
    </div>
  );
}
