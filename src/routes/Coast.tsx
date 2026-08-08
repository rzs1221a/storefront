import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import {
  CATALOG_TOTALS,
  CATEGORIES,
  MODULES,
  offeringsByCategory,
} from "../lib/catalog";
import { TIERS } from "../lib/offer";
import { BRAND, CONTACT } from "../lib/brand";
import { observeFrames, flyOnHover, cancelHoverFly } from "../lib/cameraFrames";
import { numberWord } from "../lib/format";
import BrowserFrame from "../components/BrowserFrame";
import MagneticButton from "../components/MagneticButton";
import CountUp from "../components/CountUp";
import MarkDeck from "../components/MarkDeck";
import TourControl from "../components/TourControl";
import Conditions from "../components/Conditions";
import OfferGrid from "../components/OfferGrid";
import LeadForm from "../components/LeadForm";

/**
 * The storefront. One grand page that scrolls — and as it scrolls, the coast
 * flies beneath it: every section declares a camera frame, and chart windows
 * between sections open the map at full height wherever the argument has
 * just landed.
 *
 * The order is the sales argument: the claim (hero), the evidence (work),
 * the offer (packages, with real prices), the range (catalog), the close
 * (the form itself, not a link to it). Proof before price, price before
 * breadth — a visitor who never leaves this page has still seen the whole
 * pitch in the order it convinces.
 *
 * The scroll-synced camera is observeFrames in lib/cameraFrames.ts — it
 * observes every [data-frame] and flies to whichever owns the most viewport.
 */

const FEATURED = WORK[0];
const ENTRY_PRICE = TIERS[0].price;

/**
 * Phone-only sticky contact bar. The header CTA scrolls away in the long
 * hero, and on a phone the close band is several windows down — this keeps
 * the two actions that make money one thumb away, and hides itself once the
 * real close (with the full form) is on screen.
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

/**
 * The reveal. The hero is an opaque curtain over the live chart: while the
 * visitor reads it, the map engine loads behind it (Shell defers the mount
 * past first paint). As the curtain begins to lift, `data-map-stage` flips
 * from "veiled" to "revealed" and the chart settles from an over-dimmed
 * grade to its resting one — the world opening, not a texture switching on.
 *
 * Driven by the hero's own scroll position through an IntersectionObserver;
 * the page never hijacks input. Under reduced motion the stage is never set
 * and the chart is simply present, already at rest, when the visitor gets
 * there — the reveal is a reward, not a gate.
 */
function useMapReveal(heroRef: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const hero = heroRef.current;
    if (
      !hero ||
      typeof IntersectionObserver === "undefined" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    document.body.dataset.mapStage = "veiled";
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.intersectionRatio < 0.85) {
          document.body.dataset.mapStage = "revealed";
          observer.disconnect();
        }
      },
      { threshold: [0.85] }
    );
    observer.observe(hero);
    return () => {
      observer.disconnect();
      delete document.body.dataset.mapStage;
    };
  }, [heroRef]);
}

export default function Coast() {
  useEffect(() => observeFrames(), []);
  const closeRef = useRef<HTMLElement | null>(null);
  const heroRef = useRef<HTMLElement | null>(null);
  useMapReveal(heroRef);

  return (
    <div className="storefront-home" id="sheet">
      {/* ── The arrival ─────────────────────────────────────────────── */}
      <section className="hero-band" data-frame="top" ref={heroRef}>
        <div className="hero-panel">
          <p className="eyebrow">
            {BRAND.name} — {CONTACT.location}
          </p>

          {/* Short enough to hold display size; the demoted sentence below
              keeps the exact substring destinations.ts verifies. */}
          <h1 className="hero-title">
            Built once. <em>Owned outright.</em>
          </h1>

          <p className="hero-sub">
            High-converting custom web systems and interactive real estate
            platforms for BHHS agents — no monthly platform fee. Static-fast
            pages that rank on their own, live map and market data wired in,
            and every lead routed straight into BoldTrail.
          </p>

          <div className="hero-actions">
            <MagneticButton>
              <Link to="/packages" className="btn btn-primary">
                See packages &amp; pricing
              </Link>
            </MagneticButton>
            <Link to="/work" className="btn btn-ghost">
              See the shipped work
            </Link>
            <TourControl />
          </div>

          <dl className="hero-stats">
            <div>
              <dt className="mono-label">Sites shipped</dt>
              <dd>
                <CountUp to={TOTALS.projects} />
              </dd>
            </div>
            <div>
              <dt className="mono-label">Builds start at</dt>
              <dd>
                {ENTRY_PRICE != null
                  ? `$${ENTRY_PRICE.toLocaleString("en-US")}`
                  : "A call"}
              </dd>
            </div>
            <div>
              <dt className="mono-label">Monthly fee</dt>
              <dd>$0</dd>
            </div>
          </dl>

          <div className="hero-conditions">
            <Conditions />
          </div>
        </div>

        {/* The chart's own helm: sail the twelve marks without leaving the
            hero. Swiping flies the camera; tapping commits. */}
        <MarkDeck />
      </section>

      {/* ── The proof ───────────────────────────────────────────────── */}
      <div
        className="chart-window"
        data-frame="work-sold-on-amelia-island"
        aria-hidden="true"
      />

      <section className="store-band seam-y" data-frame="top">
        <header className="store-band-head">
          <p className="eyebrow">Selected work</p>
          <h2 className="store-band-title">
            {numberWord(TOTALS.projects)} sites. <em>All of them real.</em>
          </h2>
          <p className="store-band-lede">
            Every one is the actual site, captured from the live deployment or
            a production build — no mockups and no concepts. Hover a row and
            the chart beneath you flies to its mark.
          </p>
        </header>

        <div className="work-feature surface-glass">
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
              · flagship, running live
            </span>
          </p>
        </div>

        <ul className="work-rows surface-glass">
          {WORK.map((item, i) => (
            <li key={item.slug}>
              <Link
                to={`/work/${item.slug}`}
                className="case-row"
                onMouseEnter={() => flyOnHover(`work-${item.slug}`)}
                onMouseLeave={cancelHoverFly}
              >
                <span className="case-index">{String(i + 1).padStart(2, "0")}</span>
                <span className="min-w-0 flex-1">
                  <span className="case-head">
                    <span className="case-name">{item.name}</span>
                    <span className="case-kind">{item.kind}</span>
                  </span>
                  <span className="case-summary">{item.summary}</span>
                  <span className="case-meta">
                    <span className="font-mono text-micro text-(--color-ink-faint)">
                      {item.light.characteristic} ·{" "}
                      {item.loc.toLocaleString("en-US")} lines
                    </span>
                    {item.liveUrl && <span className="case-live">Public</span>}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── The offer ───────────────────────────────────────────────── */}
      <div className="chart-window is-short" data-frame="pricing" aria-hidden="true" />

      <section className="store-band seam-y">
        <header className="store-band-head">
          <p className="eyebrow">Packages</p>
          <h2 className="store-band-title">
            Pay once. <em>Own it forever.</em>
          </h2>
          <p className="store-band-lede">
            {numberWord(TIERS.length)} build sizes, one fee agreed in writing
            before anything starts. After launch you owe nothing — hosting is
            free at the traffic these sites see, and the code is yours.
          </p>
        </header>

        <div className="store-band-grid">
          <OfferGrid />
        </div>

        <p className="modules-strip">
          <span className="mono-label">Add to any build</span>
          <Link to="/options#tools" className="modules-strip-link">
            {numberWord(MODULES.length)} add-on modules from $
            {Math.min(
              ...MODULES.map((m) => m.priceFrom ?? Infinity)
            ).toLocaleString("en-US")}{" "}
            — search, market data, editor, client portal →
          </Link>
        </p>

        <div className="store-band-actions">
          <Link to="/packages" className="btn btn-ghost">
            Compare in detail →
          </Link>
          <Link to="/capabilities" className="btn btn-ghost">
            See the live demo →
          </Link>
        </div>
      </section>

      {/* ── The catalog ─────────────────────────────────────────────── */}
      <div className="chart-window" data-frame="catalog" aria-hidden="true" />

      <section className="store-band seam-y">
        <header className="store-band-head">
          <p className="eyebrow">Everything I build</p>
          <h2 className="store-band-title">
            {CATALOG_TOTALS.options} options. {numberWord(TOTALS.projects)}{" "}
            shipped proofs.
          </h2>
          <p className="store-band-lede">
            Every site type a real estate business needs, as a catalog rather
            than a sales call. {numberWord(CATALOG_TOTALS.shipped)} of these
            patterns run today in shipped work; the rest are marked{" "}
            <span className="badge badge-concept">Concept</span> and say so
            everywhere they appear.
          </p>
        </header>

        <div className="category-grid">
          {CATEGORIES.map((cat) => {
            const offerings = offeringsByCategory(cat.slug);
            return (
              <div key={cat.slug} className="category-card glass-card">
                <h3 className="category-name">{cat.name}</h3>
                <p className="category-blurb">{cat.blurb}</p>
                <ul className="category-list">
                  {offerings.map((o) => (
                    <li key={o.slug}>
                      <Link to={`/options/${o.slug}`}>
                        <span>{o.name}</span>
                        <span
                          className={`badge ${o.status === "shipped" ? "badge-shipped" : "badge-concept"}`}
                        >
                          {o.status === "shipped" ? "Shipped" : "Concept"}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}

          <div className="category-card glass-card is-cta">
            <h3 className="category-name">Not sure which?</h3>
            <p className="category-blurb">
              Describe what you sell and I will point at the closest thing I
              have already built.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <Link to="/options" className="btn btn-primary btn-sm">
                Browse all {CATALOG_TOTALS.options} options
              </Link>
              <Link to="/contact" className="btn btn-ghost btn-sm">
                Just ask →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── The close ───────────────────────────────────────────────── */}
      <div className="chart-window is-short" data-frame="contact" aria-hidden="true" />

      <section className="store-band store-close surface-glass" ref={closeRef}>
        <h2 className="store-band-title">
          Your website should be <em>the reason they call you.</em>
        </h2>
        <p className="store-band-lede">
          Twenty minutes on the phone and you will know whether this is worth
          doing. Or skip the call — tell me what you need right here.
        </p>

        {/* The form itself, not a link to it: every navigation removed from
            the conversion path is a lead that did not leak. */}
        <div className="store-close-form">
          <LeadForm />
        </div>

        <div className="store-band-actions">
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
