import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { CATALOG_TOTALS } from "../lib/catalog";
import { COMPARISON, TIERS } from "../lib/offer";
import { CAPABILITIES } from "../lib/capabilities";
import { BRAND, CONTACT } from "../lib/brand";
import { numberWord } from "../lib/format";
import { useReveals } from "../lib/useReveal";
import CountUp from "../components/CountUp";
import Conditions from "../components/Conditions";
import MapExhibit from "../components/MapExhibit";
import OfferGrid from "../components/OfferGrid";
import LeadForm from "../components/LeadForm";

/**
 * The storefront as a product stack — Apple's homepage grammar:
 *
 * Full-bleed tiles, each a centered composition: semibold headline, one
 * line of subhead, a pair of accent text links, and the product filling
 * the tile's stage. Tiles alternate dark and white. The flagship's tile
 * holds the LIVE exhibit — The Aerial never appears as a screenshot on
 * this page, because a living map demonstrated by a picture of a map
 * would defeat both.
 *
 * Stat numerals are arithmetic-true or measured, never invented: $0/month
 * is the deal, 100% ownership is the contract, the line count is derived
 * in work.ts, and the Lighthouse score was measured on this page.
 */

const byWorkSlug = (slug: string) => WORK.find((w) => w.slug === slug)!;
const HEYMANN = byWorkSlug("heymann-williams-coastal");
const PAIR = [byWorkSlug("sold-on-amelia-island"), byWorkSlug("crane-island-bhhs")];

/** The Apple link pair: accent text links with the › that means "go". */
function TileLinks({ children }: { children: ReactNode }) {
  return <p className="tile-links">{children}</p>;
}

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
  const revealRoot = useReveals<HTMLDivElement>();

  return (
    <div className="storefront-home" id="sheet" ref={revealRoot}>
      {/* ── 1 · The claim ───────────────────────────────────────────── */}
      <section className="tile is-claim" data-tile="claim" data-act-theme="dark">
        <div className="tile-copy">
          <p className="eyebrow">
            {BRAND.name} — {CONTACT.location}
          </p>
          <h1 className="hero-title">
            Built once.
            <br />
            Owned outright.
          </h1>
          <p className="hero-sub tile-sub">
            High-converting custom web systems and interactive real estate
            platforms for BHHS agents — no monthly platform fee, and every
            lead routed straight into BoldTrail.
          </p>
          <TileLinks>
            <Link to="/packages">See packages &amp; pricing ›</Link>
            <Link to="/work">See the shipped work ›</Link>
          </TileLinks>
        </div>
      </section>

      {/* ── 2 · The flagship ────────────────────────────────────────── */}
      <section className="tile is-aerial" data-tile="aerial" data-act-theme="dark" id="exhibit">
        <div className="tile-copy" data-reveal>
          <p className="eyebrow">The flagship</p>
          <h2 className="tile-title">The Aerial.</h2>
          <p className="tile-sub">
            A living 3D map of your whole market — the site nobody else can
            copy. This is not a screenshot. It is running, right here.
          </p>
          <TileLinks>
            <Link to="/work/the-aerial">Case study ›</Link>
            <Link to="/packages">Get one like it ›</Link>
          </TileLinks>
        </div>

        {/* The numbers on the way to the product — measured, not asserted. */}
        <dl className="stat-strip" data-reveal>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={0} format={(n) => `$${n}`} />
            </dd>
            <dt className="stat-caption">
              owed monthly after launch. A template charges you forever.
            </dt>
          </div>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={100} format={(n) => `${n}%`} />
            </dd>
            <dt className="stat-caption">
              of the source code owned by you. A template licenses you
              nothing.
            </dt>
          </div>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={TOTALS.loc} />
            </dd>
            <dt className="stat-caption">
              lines of production source shipped along this coast.
            </dt>
          </div>
        </dl>

        <div className="tile-stage" data-reveal="scale">
          <MapExhibit />
        </div>
      </section>

      {/* ── 3 · The brokerage site ──────────────────────────────────── */}
      <section className="tile is-work" data-tile="work" data-act-theme="light">
        <div className="tile-copy" data-reveal>
          <p className="eyebrow">{HEYMANN.kind}</p>
          <h2 className="tile-title">{HEYMANN.name}.</h2>
          <p className="tile-sub">{HEYMANN.summary}</p>
          <TileLinks>
            {HEYMANN.liveUrl && (
              <a href={HEYMANN.liveUrl} target="_blank" rel="noreferrer">
                Visit live ›
              </a>
            )}
            <Link to={`/work/${HEYMANN.slug}`}>Case study ›</Link>
          </TileLinks>
        </div>
        <div className="tile-stage is-bleed" data-reveal="scale">
          <img
            src={HEYMANN.desktop}
            alt={`The ${HEYMANN.name} website — ${HEYMANN.kind.toLowerCase()}`}
            width={1440}
            height={900}
            loading="lazy"
            decoding="async"
          />
        </div>
      </section>

      {/* ── 4 · Two more, side by side ──────────────────────────────── */}
      <section className="tile is-grid" data-tile="pair" data-act-theme="light">
        <div className="tile-grid-2">
          {PAIR.map((item) => (
            <article key={item.slug} className="half-tile" data-reveal>
              <p className="eyebrow">{item.kind}</p>
              <h2 className="half-tile-title">{item.name}.</h2>
              <TileLinks>
                {item.liveUrl && (
                  <a href={item.liveUrl} target="_blank" rel="noreferrer">
                    Visit live ›
                  </a>
                )}
                <Link to={`/work/${item.slug}`}>Case study ›</Link>
              </TileLinks>
              <Link to={`/work/${item.slug}`} className="half-tile-stage">
                <img
                  src={item.desktop}
                  alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
                  width={1440}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
            </article>
          ))}
        </div>
        <TileLinks>
          <Link to="/work">
            All {numberWord(TOTALS.projects)} sites, with case studies ›
          </Link>
        </TileLinks>
      </section>

      {/* ── 5 · The offer ───────────────────────────────────────────── */}
      <section className="tile is-compare" data-tile="compare" data-act-theme="light">
        <div className="tile-copy" data-reveal>
          <p className="eyebrow">Packages</p>
          <h2 className="tile-title">
            Pay once. Own it forever.
          </h2>
          <p className="tile-sub">
            {numberWord(TIERS.length)} build sizes, one fee agreed in writing
            before anything starts. After launch you owe nothing — and the
            code is yours.
          </p>
        </div>

        <div className="act-grid tile-wide">
          <OfferGrid />
        </div>

        {/* Them and us — the rows a platform hopes you never line up. */}
        <div className="versus" data-reveal>
          {COMPARISON.rows.slice(0, 3).map((row) => (
            <div key={row.question} className="versus-row" data-reveal-child>
              <p className="mono-label">{row.question}</p>
              <p className="versus-them">{row.platform}</p>
              <p className="versus-us">{row.us}</p>
            </div>
          ))}
        </div>

        <TileLinks>
          <Link to="/packages">Compare in detail ›</Link>
          <Link to="/options">
            All {CATALOG_TOTALS.options} site types ›
          </Link>
        </TileLinks>
      </section>

      {/* ── 6 · Capabilities bento ──────────────────────────────────── */}
      <section className="tile is-bento" data-tile="bento" data-act-theme="dark">
        <div className="tile-copy" data-reveal>
          <p className="eyebrow">Capabilities</p>
          <h2 className="tile-title">Things a template cannot do.</h2>
        </div>
        <div className="bento tile-wide" data-reveal>
          {CAPABILITIES.slice(0, 4).map((cap) => (
            <Link
              key={cap.title}
              to={cap.proofPath ?? "/capabilities"}
              className="bento-cell"
              data-reveal-child
            >
              <h3 className="bento-title">{cap.title}</h3>
              <p className="bento-body">{cap.matters}</p>
            </Link>
          ))}
          <div className="bento-cell is-live">
            <p className="mono-label">Live from the coast</p>
            <Conditions className="mt-3" />
            <p className="bento-body mt-3">
              A real NOAA gauge and the NWS forecast, fetched when you
              arrived — the same feeds your site would carry.
            </p>
          </div>
          <a href="#exhibit" className="bento-cell">
            <h3 className="bento-title">The engine, above ↑</h3>
            <p className="bento-body">
              Type where you want to go. Every mark is a shipped site.
            </p>
          </a>
        </div>
        <TileLinks>
          <Link to="/capabilities">The full list ›</Link>
        </TileLinks>
      </section>

      {/* ── 7 · The close ───────────────────────────────────────────── */}
      <section className="tile is-close" data-tile="close" data-act-theme="light" ref={closeRef}>
        <div className="tile-copy" data-reveal>
          <h2 className="tile-title">
            Your website should be the reason they call you.
          </h2>
          <p className="tile-sub">
            Twenty minutes on the phone and you will know whether this is
            worth doing. Or skip the call — tell me what you need right here.
          </p>
        </div>
        <div className="tile-form">
          <LeadForm />
        </div>
        <TileLinks>
          <a href={`sms:${CONTACT.phone}`}>Text {CONTACT.phoneDisplay} ›</a>
          <a href={`tel:${CONTACT.phone}`}>Call {CONTACT.phoneDisplay} ›</a>
        </TileLinks>
      </section>

      <MobileCtaBar hideWhenVisible={closeRef} />
    </div>
  );
}
