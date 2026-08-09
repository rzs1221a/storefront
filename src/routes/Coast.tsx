import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { CATALOG_TOTALS } from "../lib/catalog";
import { TIERS } from "../lib/offer";
import { BRAND, CONTACT } from "../lib/brand";
import { numberWord } from "../lib/format";
import { useReveals } from "../lib/useReveal";
import BrowserFrame from "../components/BrowserFrame";
import CountUp from "../components/CountUp";
import MapExhibit from "../components/MapExhibit";
import OfferGrid from "../components/OfferGrid";
import LeadForm from "../components/LeadForm";

/**
 * The storefront as a film — five acts, alternating dark and light:
 *
 *   I   The claim   (dark)  one statement, display type, nothing else
 *   II  The proof   (light) the shipped work goes full-bleed on paper
 *   III The engine  (dark)  the framed chart exhibit — the product, driven
 *   IV  The offer   (light) four tiers, comparable, one click to buy
 *   V   The close   (dark)  the form itself; the film ends where it began
 *
 * The alternation is the design: the merchandise gets daylight, the
 * theatre gets the dark. Every act reads from the same token ramps — the
 * light acts simply remap them via [data-act-theme] — so nothing renders
 * in two versions.
 */

const FEATURED = WORK[0];
const SUPPORTING = WORK.slice(1, 3);

/**
 * Phone-only sticky contact bar: the two actions that make money stay one
 * thumb away, and it hides itself once the real close is on screen.
 */
function MobileCtaBar({ hideWhenVisible }: { hideWhenVisible: React.RefObject<HTMLElement | null> }) {
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const target = hideWhenVisible.current;
    if (!target || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setHidden(entry.isIntersecting),
      { threshold: 0.15 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [hideWhenVisible]);

  return (
    <div className={`mobile-cta-bar surface-glass${hidden ? " is-hidden" : ""}`}>
      <a href={`sms:${CONTACT.phone}`} className="btn btn-ghost btn-sm">
        Text {CONTACT.phoneDisplay}
      </a>
      <Link to="/contact" className="btn btn-primary btn-sm">
        Start a project →
      </Link>
    </div>
  );
}

export default function Coast() {
  const closeRef = useRef<HTMLElement | null>(null);
  // One observer for every [data-reveal] on the page.
  const revealRoot = useReveals<HTMLDivElement>();

  return (
    <div className="storefront-home" id="sheet" ref={revealRoot}>
      {/* ── Act I · The claim ───────────────────────────────────────── */}
      <section className="act act-claim" data-act="claim" data-act-theme="dark">
        <div className="act-claim-copy" data-reveal>
          <p className="eyebrow" data-reveal-child>
            {BRAND.name} — {CONTACT.location}
          </p>
          <h1 className="hero-title" data-reveal-child>
            Built once. <em>Owned outright.</em>
          </h1>
          <p className="hero-sub" data-reveal-child>
            High-converting custom web systems and interactive real estate
            platforms for BHHS agents — no monthly platform fee. Static-fast
            pages that rank on their own, live map and market data wired in,
            and every lead routed straight into BoldTrail.
          </p>
          <div className="act-actions">
            <Link to="/packages" className="btn btn-primary">
              See packages &amp; pricing
            </Link>
            <Link to="/work" className="btn btn-ghost">
              See the shipped work
            </Link>
          </div>
        </div>
      </section>

      {/* ── Act II · The proof ──────────────────────────────────────── */}
      <section className="act act-proof" data-act="proof" data-act-theme="light">
        <header className="act-head" data-reveal>
          <p className="eyebrow">The work</p>
          <h2 className="act-title">The work is the pitch.</h2>
          <p className="act-lede">
            {numberWord(TOTALS.projects)} real sites, captured from live
            deployments and production builds — no mockups, no concepts
            dressed as clients. If the craft here does not sell it, the words
            should not either.
          </p>
        </header>

        {/* The flagship, full-bleed: the single best thing gets the most
            light. Click-to-run keeps it evidence rather than a picture. */}
        <figure className="stage is-feature" data-reveal="scale">
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
                loading="lazy"
                decoding="async"
                className="block w-full"
              />
            </picture>
          </BrowserFrame>
          <figcaption className="stage-caption">
            <Link to={`/work/${FEATURED.slug}`} className="hover:text-(--color-ink)">
              {FEATURED.name} — {FEATURED.kind.toLowerCase()}
            </Link>
            <span className="text-(--color-ink-faint)"> · running live</span>
          </figcaption>
        </figure>

        <div className="stage-pair">
          {SUPPORTING.map((item) => (
            <figure key={item.slug} className="stage" data-reveal="scale">
              <Link to={`/work/${item.slug}`} className="stage-media">
                <img
                  src={item.desktop}
                  alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
                  width={1440}
                  height={900}
                  loading="lazy"
                  decoding="async"
                  className="block w-full"
                />
              </Link>
              <figcaption className="stage-caption">
                <Link to={`/work/${item.slug}`} className="hover:text-(--color-ink)">
                  {item.name} — {item.kind.toLowerCase()}
                </Link>
              </figcaption>
            </figure>
          ))}
        </div>

        <dl className="proof-rail">
          <div>
            <dt className="mono-label">Sites shipped</dt>
            <dd>
              <CountUp to={TOTALS.projects} />
            </dd>
          </div>
          <div>
            <dt className="mono-label">Lines of source</dt>
            <dd>{TOTALS.loc.toLocaleString("en-US")}</dd>
          </div>
          <div>
            <dt className="mono-label">Monthly fee</dt>
            <dd>$0</dd>
          </div>
        </dl>

        <div className="act-actions">
          <Link to="/work" className="btn btn-ghost">
            All {numberWord(TOTALS.projects)}, with case studies →
          </Link>
        </div>
      </section>

      {/* ── Act III · The engine ────────────────────────────────────── */}
      <section
        className="act act-engine"
        data-act="engine"
        data-act-theme="dark"
        id="exhibit"
      >
        <header className="act-head" data-reveal>
          <p className="eyebrow">Live demonstration</p>
          <h2 className="act-title">This is the engine.</h2>
          <p className="act-lede">
            The same mapping engine an agent buys, running here. Type where
            you want to go — it answers in plain English. Every mark is a
            site I shipped, at its true coordinate.
          </p>
        </header>

        <MapExhibit />
      </section>

      {/* ── Act IV · The offer ──────────────────────────────────────── */}
      <section className="act act-offer" data-act="offer" data-act-theme="light">
        <header className="act-head" data-reveal>
          <p className="eyebrow">Packages</p>
          <h2 className="act-title">
            Pay once. <em>Own it forever.</em>
          </h2>
          <p className="act-lede">
            {numberWord(TIERS.length)} build sizes, one fee agreed in writing
            before anything starts. After launch you owe nothing — hosting is
            free at the traffic these sites see, and the code is yours.
          </p>
        </header>

        <div className="act-grid">
          <OfferGrid />
        </div>

        <p className="modules-strip">
          <span className="mono-label">The full range</span>
          <Link to="/options" className="modules-strip-link">
            {CATALOG_TOTALS.options} site types across five categories, from a
            one-week agent page to a full 3D market platform →
          </Link>
        </p>

        <div className="act-actions">
          <Link to="/packages" className="btn btn-ghost">
            Compare in detail →
          </Link>
          <Link to="/capabilities" className="btn btn-ghost">
            What a template cannot do →
          </Link>
        </div>
      </section>

      {/* ── Act V · The close ───────────────────────────────────────── */}
      <section
        className="act act-close"
        data-act="close"
        data-act-theme="dark"
        ref={closeRef}
      >
        <div className="act-head" data-reveal>
          <h2 className="act-title">
            Your website should be <em>the reason they call you.</em>
          </h2>
          <p className="act-lede">
            Twenty minutes on the phone and you will know whether this is
            worth doing. Or skip the call — tell me what you need right here.
          </p>
        </div>

        <div className="act-close-form">
          <LeadForm />
        </div>

        <div className="act-actions">
          <a href={`sms:${CONTACT.phone}`} className="btn btn-ghost">
            Text {CONTACT.phoneDisplay}
          </a>
          <a href={`tel:${CONTACT.phone}`} className="btn btn-ghost">
            Call {CONTACT.phoneDisplay}
          </a>
        </div>
      </section>

      <MobileCtaBar hideWhenVisible={closeRef} />
    </div>
  );
}
