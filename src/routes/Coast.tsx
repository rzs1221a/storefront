import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { CATALOG_TOTALS } from "../lib/catalog";
import { TIERS } from "../lib/offer";
import { BRAND, CONTACT } from "../lib/brand";
import { observeFrames } from "../lib/cameraFrames";
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
 * The storefront — five sections, each with one job, in the order that
 * convinces:
 *
 *   1. The claim         — the offer in one breath, on an opaque curtain
 *      ⟶ the reveal: the curtain lifts and the live coast arrives ⟵
 *   2. The proof         — one artifact ends "can he actually build?"
 *   3. The demonstration — the visitor drives the product (the map, bare)
 *   4. The offer         — four tiers, comparable, one click to buy
 *   5. The close         — the form itself; the page's single inversion
 *
 * Nothing renders here that has a detail route, unless it is the single
 * best instance of that thing: the proof shows one site and links to five
 * more; the catalog is one sentence pointing at /options. The old page was
 * an index of the whole site — 9.4 screens; this is an argument.
 *
 * The scroll-synced camera is observeFrames in lib/cameraFrames.ts — it
 * observes every [data-frame] and flies to whichever owns the most viewport.
 */

const FEATURED = WORK[0];

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
      {/* ── 1 · The claim ───────────────────────────────────────────── */}
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
          </div>
        </div>

        <p className="hero-cue mono-label" aria-hidden="true">
          The coast is loading behind this page ↓
        </p>
      </section>

      {/* ⟶ the reveal happens here: the curtain lifts off the live chart ⟵ */}

      {/* ── 2 · The proof ───────────────────────────────────────────── */}
      <section className="store-band seam-y" data-frame="work-sold-on-amelia-island">
        <header className="store-band-head">
          <p className="eyebrow">Selected work</p>
          <h2 className="store-band-title">
            {numberWord(TOTALS.projects)} sites. <em>All of them real.</em>
          </h2>
          <p className="store-band-lede">
            Every one is the actual site, captured from the live deployment or
            a production build — no mockups and no concepts. This is the
            flagship; the chart behind you is it, running.
          </p>
        </header>

        <div className="work-feature is-wide surface-glass">
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

        {/* The stats moved here from the hero: they are captions on
            evidence, not claims before it. */}
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

        <div className="store-band-actions">
          <Link to="/work" className="btn btn-ghost">
            {numberWord(TOTALS.projects - 1)} more, all real →
          </Link>
        </div>
      </section>

      {/* ── 3 · The demonstration ───────────────────────────────────── */}
      {/* The one place the scrim lifts entirely: the chart, bare, with its
          instruments. Phase 7 adds the plain-English helm. */}
      <section className="demo-band" data-frame="catalog">
        <div className="demo-head">
          <p className="eyebrow">Live demonstration</p>
          <h2 className="store-band-title">This is the engine.</h2>
        </div>

        <div className="demo-helm surface-glass">
          <TourControl />
          <Conditions />
        </div>

        {/* The twelve marks, one swipe each — the phone's way to fly. */}
        <MarkDeck />
      </section>

      {/* ── 4 · The offer ───────────────────────────────────────────── */}
      <section className="store-band seam-y" data-frame="pricing">
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

        {/* The whole catalog is one sentence here — 24 inline links was an
            index, and /options already is one. */}
        <p className="modules-strip">
          <span className="mono-label">The full range</span>
          <Link to="/options" className="modules-strip-link">
            {CATALOG_TOTALS.options} site types across five categories, from a
            one-week agent page to a full 3D market platform →
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

      {/* ── 5 · The close ───────────────────────────────────────────── */}
      {/* The page's single inversion — in a monochrome system, the loudest
          available signal, spent at the only moment that converts. */}
      <section className="store-band store-close" data-frame="contact" ref={closeRef}>
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
