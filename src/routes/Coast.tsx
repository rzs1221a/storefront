import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { CATALOG_TOTALS, CATEGORIES, offeringsByCategory } from "../lib/catalog";
import { COMPARISON, TIERS } from "../lib/offer";
import { CAPABILITIES } from "../lib/capabilities";
import { CONTACT } from "../lib/brand";
import { numberWord } from "../lib/format";
import { useReveals } from "../lib/useReveal";
import { flyToFrame } from "../lib/cameraFrames";
import { frameFor } from "../lib/destinations";
import { getSky } from "../lib/sky";
import { ask } from "../lib/ask";
import { PromptChip, TileLinks } from "../components/Prompt";
import CountUp from "../components/CountUp";
import Conditions from "../components/Conditions";
import TourControl from "../components/TourControl";
import OfferGrid from "../components/OfferGrid";
import LeadForm from "../components/LeadForm";

const LiveMap = lazy(() => import("../components/LiveMap"));

/**
 * Asked & Answered, over the living chart.
 *
 * The coast returns as scenery, never as a control: one non-interactive
 * map fixed behind the page (the layer seals pointer events, so nothing
 * on it can be clicked), and each section flies the camera to its own
 * area of the coast. The dark tiles open APERTURES — soft holes in their
 * shade anchored to different screen edges — so the chart burns through
 * in a different place as you scroll. The shadow itself moves.
 *
 * The page opens pure black. The visitor's doubt types itself out, and
 * then the coast ignites beneath it — the reveal is the moment the site
 * turns out to be alive. Reduced motion: the coast is simply present.
 */

const byWorkSlug = (slug: string) => WORK.find((w) => w.slug === slug)!;
const HEYMANN = byWorkSlug("heymann-williams-coastal");
const PAIR = [byWorkSlug("sold-on-amelia-island"), byWorkSlug("crane-island-bhhs")];

const TEMPLATE_MO = 79;
const TEMPLATE_5YR = TEMPLATE_MO * 60;

const DOUBTS = [
  "why am I paying $99 a month for a template?",
  "can my site answer buyers in plain English?",
  "what does a site I own outright cost?",
];

/** One doubt, typed character by character; remounted per doubt so the
    count initializes at zero. */
function TypedDoubt({ text, reduced }: { text: string; reduced: boolean }) {
  const [chars, setChars] = useState(reduced ? text.length : 0);

  useEffect(() => {
    if (reduced) return;
    const typer = window.setInterval(() => {
      setChars((c) => {
        if (c >= text.length) {
          window.clearInterval(typer);
          return c;
        }
        return c + 1;
      });
    }, 34);
    return () => window.clearInterval(typer);
  }, [text, reduced]);

  return (
    <span className="hero-prompt-q">
      {text.slice(0, chars)}
      {!reduced && <span className="hero-prompt-caret" aria-hidden="true" />}
    </span>
  );
}

/** The hero's prompt: the buyer's doubts, thought aloud. */
function HeroPrompt() {
  const [i, setI] = useState(0);
  const reduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    if (reduced) return;
    const doubt = DOUBTS[i];
    const hold = window.setTimeout(
      () => setI((v) => (v + 1) % DOUBTS.length),
      doubt.length * 34 + 2600
    );
    return () => window.clearTimeout(hold);
  }, [i, reduced]);

  const doubt = DOUBTS[i];

  return (
    <button
      type="button"
      className="hero-prompt"
      onClick={() => ask(doubt)}
      aria-label={`Ask: ${doubt}`}
    >
      <span className="prompt-chip-key" aria-hidden="true">
        /
      </span>
      <TypedDoubt key={i} text={doubt} reduced={reduced} />
    </button>
  );
}

/**
 * The chart backdrop: the one LiveMap mount, fixed behind the page,
 * pointer-events sealed at the layer so the map is scenery. Deferred past
 * first paint (the claim tile is opaque; LCP owes it nothing); the real
 * sky gradient holds the frame until tiles arrive.
 */
function ChartBackdrop() {
  const [mountMap, setMountMap] = useState(false);
  const [poster] = useState(() => getSky());

  useEffect(() => {
    if (mountMap) return;
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (handle: number) => void;
    };
    const w = window as IdleWindow;
    if (w.requestIdleCallback) {
      const handle = w.requestIdleCallback(() => setMountMap(true), {
        timeout: 1500,
      });
      return () => w.cancelIdleCallback?.(handle);
    }
    const handle = window.setTimeout(() => setMountMap(true), 400);
    return () => window.clearTimeout(handle);
  }, [mountMap]);

  return (
    <div className="chart-bg" aria-hidden="true" style={{ background: poster.gradient }}>
      {mountMap && (
        <Suspense fallback={null}>
          <LiveMap dimmed={false} />
        </Suspense>
      )}
    </div>
  );
}

/**
 * Section camera: each tile declares the destination whose area it shows
 * (data-frame = a route path), and whichever tile owns the viewport flies
 * the camera there. Reduced motion holds the opening frame.
 */
function useSectionCamera(root: React.RefObject<HTMLElement | null>) {
  useEffect(() => {
    const el = root.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ratios = new Map<string, number>();
    let active: string | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.frame;
          if (!key) continue;
          ratios.set(key, entry.isIntersecting ? entry.intersectionRatio : 0);
        }
        let best: string | null = null;
        let bestRatio = 0;
        for (const [key, ratio] of ratios) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = key;
          }
        }
        if (best && best !== active) {
          active = best;
          flyToFrame(frameFor(best));
        }
      },
      { threshold: [0, 0.2, 0.4, 0.6, 0.8] }
    );

    el.querySelectorAll<HTMLElement>("[data-frame]").forEach((t) => observer.observe(t));
    return () => observer.disconnect();
  }, [root]);
}

/** Phone-only sticky contact bar. */
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
        Get a quote →
      </Link>
    </div>
  );
}

/** The range ribbon. */
function Ribbon() {
  const rowRef = useRef<HTMLDivElement | null>(null);

  const page = (dir: 1 | -1) => {
    const row = rowRef.current;
    if (!row) return;
    row.scrollBy({ left: dir * row.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="ribbon" data-reveal>
      <div className="ribbon-row" ref={rowRef}>
        {CATEGORIES.map((cat) => {
          const offerings = offeringsByCategory(cat.slug);
          return (
            <Link key={cat.slug} to={`/options#${cat.slug}`} className="ribbon-card">
              <p className="eyebrow">{offerings.length} options</p>
              <h3 className="ribbon-card-title">{cat.name}</h3>
              <p className="ribbon-card-body">{cat.blurb}</p>
              <p className="ribbon-card-link">Browse ›</p>
            </Link>
          );
        })}
        <Link to="/contact" className="ribbon-card is-cta">
          <h3 className="ribbon-card-title">Not sure which?</h3>
          <p className="ribbon-card-body">
            Describe what you sell and I will point at the closest thing I
            have already built — and quote it in writing.
          </p>
          <p className="ribbon-card-link">Just ask ›</p>
        </Link>
      </div>
      <div className="ribbon-arrows" aria-hidden="true">
        <button type="button" onClick={() => page(-1)} aria-label="Previous">
          ‹
        </button>
        <button type="button" onClick={() => page(1)} aria-label="Next">
          ›
        </button>
      </div>
    </div>
  );
}

export default function Coast() {
  const closeRef = useRef<HTMLElement | null>(null);
  const revealRoot = useReveals<HTMLDivElement>();
  useSectionCamera(revealRoot);

  return (
    <div className="storefront-home" id="sheet" ref={revealRoot}>
      <ChartBackdrop />

      {/* ── 1 · The claim ── opens pure black; the coast ignites beneath
          the typed doubt. */}
      <section
        className="tile is-claim"
        data-tile="claim"
        data-frame="/"
        data-aperture="ignite"
        data-act-theme="dark"
      >
        <div className="tile-copy">
          <HeroPrompt />
          <h1 className="hero-title">Stop renting your website.</h1>
          <p className="hero-sub tile-sub">
            Template platforms charge you monthly for a site that looks like
            every other agent's — and they keep your leads. I build BHHS
            agents one-of-one sites you own outright: built once, $0 a
            month, every lead wired straight into BoldTrail.
          </p>
          <TileLinks>
            <Link to="/work">See six live sites ›</Link>
            <Link to="/packages">Pricing — from $1,500 ›</Link>
          </TileLinks>
        </div>
      </section>

      {/* ── 2 · The flagship ── the camera is already over The Aerial's
          water; the aperture opens wide beneath the stats. */}
      <section
        className="tile is-aerial"
        data-tile="aerial"
        data-frame="/work/the-aerial"
        data-aperture="stage"
        data-act-theme="dark"
        id="exhibit"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="what am I actually buying?" />
          <h2 className="tile-title">
            The site nobody in your market can copy.
          </h2>
          <p className="tile-sub">
            The Aerial — a living 3D map of this coast that IS the website.
            It is flying beneath this page right now. Imagine your name on
            it.
          </p>
          <TileLinks>
            <Link to="/work/the-aerial">Case study ›</Link>
            <Link to="/contact?package=flagship">Order the flagship ›</Link>
          </TileLinks>
        </div>

        <dl className="stat-strip" data-reveal>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={TEMPLATE_5YR} format={(n) => `$${n.toLocaleString("en-US")}`} />
            </dd>
            <dt className="stat-caption">
              what a typical ${TEMPLATE_MO}/month template costs you over
              five years — and you still own nothing.
            </dt>
          </div>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={0} format={(n) => `$${n}`} />
            </dd>
            <dt className="stat-caption">
              what this costs after launch. Forever. The code is yours.
            </dt>
          </div>
          <div data-reveal-child>
            <dd className="stat-figure">
              <CountUp to={TOTALS.loc} />
            </dd>
            <dt className="stat-caption">
              lines of production source already shipped for this coast.
            </dt>
          </div>
        </dl>

        {/* The open water: the aperture region — nothing here but the
            coast, and the controls that fly it. */}
        <div className="aperture-stage" aria-hidden="false">
          <div className="aperture-deck">
            <TourControl />
            <Conditions />
          </div>
        </div>
      </section>

      {/* ── 3 · The brokerage site ── */}
      <section
        className="tile is-work"
        data-tile="work"
        data-frame="/work/heymann-williams-coastal"
        data-act-theme="light"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="will it actually win me listings?" />
          <h2 className="tile-title">
            Listings follow the best-looking site in town.
          </h2>
          <p className="tile-sub">
            {HEYMANN.name}: seventeen routes and twenty-six neighborhood
            pages, each one built to rank — this is what buyers find when
            they search the island.
          </p>
          <TileLinks>
            {HEYMANN.liveUrl && (
              <a href={HEYMANN.liveUrl} target="_blank" rel="noreferrer">
                Visit live ›
              </a>
            )}
            <Link to={`/work/${HEYMANN.slug}`}>Case study ›</Link>
          </TileLinks>
          <p className="mono-label mt-3">
            {HEYMANN.light.anim && (
              <span className={`sig-dot ${HEYMANN.light.anim}`} aria-hidden="true" />
            )}
            {HEYMANN.light.characteristic} · its beacon is on the chart below
          </p>
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

      {/* ── 4 · Two more ── */}
      <section
        className="tile is-grid is-gray"
        data-tile="pair"
        data-frame="/work/sold-on-amelia-island"
        data-act-theme="light"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="what if I'm a solo agent?" />
          <h2 className="tile-title">Solo agents get the same craft.</h2>
        </div>
        <div className="tile-grid-2">
          {PAIR.map((item) => (
            <article key={item.slug} className="half-tile" data-reveal>
              <p className="eyebrow">
                {item.light.anim && (
                  <span className={`sig-dot ${item.light.anim}`} aria-hidden="true" />
                )}
                {item.kind}
              </p>
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

      {/* ── 5 · The offer ── */}
      <section
        className="tile is-compare"
        data-tile="compare"
        data-frame="/packages"
        data-act-theme="light"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="what does it cost?" />
          <h2 className="tile-title">
            One price. In writing. Before anything starts.
          </h2>
          <p className="tile-sub">
            {numberWord(TIERS.length)} build sizes from $1,500. You approve a
            fixed quote before I write a line — and after launch you owe me
            nothing, forever.
          </p>
        </div>

        <div className="act-grid tile-wide">
          <OfferGrid />
        </div>

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
          <Link to="/capabilities">What a template cannot do ›</Link>
        </TileLinks>
      </section>

      {/* ── 5b · The range ribbon ── */}
      <section
        className="tile is-ribbon is-gray"
        data-tile="ribbon"
        data-frame="/options"
        data-act-theme="light"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="do you build my kind of site?" />
          <h2 className="tile-title">
            {CATALOG_TOTALS.options} site types. Yours is in here.
          </h2>
        </div>
        <Ribbon />
      </section>

      {/* ── 6 · Capabilities bento ── the aperture leans left; the coast
          keeps pace on the right of your eye. */}
      <section
        className="tile is-bento"
        data-tile="bento"
        data-frame="/capabilities"
        data-aperture="left"
        data-act-theme="dark"
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="why can't my template do this?" />
          <h2 className="tile-title">Because templates can't.</h2>
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
            <h3 className="bento-title">The chart beneath this page ↑</h3>
            <p className="bento-body">
              Every mark on it is a site I shipped, at its true coordinate.
            </p>
          </a>
        </div>
        <TileLinks>
          <Link to="/capabilities">The full list ›</Link>
        </TileLinks>
      </section>

      {/* ── 7 · The close ── */}
      <section
        className="tile is-close is-gray"
        data-tile="close"
        data-frame="/contact"
        data-act-theme="light"
        ref={closeRef}
      >
        <div className="tile-copy" data-reveal>
          <PromptChip question="ok — what happens if I reach out?" />
          <h2 className="tile-title">
            Twenty minutes. A straight answer. A number in writing.
          </h2>
          <p className="tile-sub">
            Tell me what you sell and where. If it's worth doing you get a
            fixed quote; if it's not a fit, I'll say so and you've lost
            nothing.
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
