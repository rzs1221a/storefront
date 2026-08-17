import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { OWNERSHIP } from "../lib/offer";
import { COST_OF_THE_ALTERNATIVE, COST_COUNTERPOINT } from "../lib/cost";
import { BRAND, CONTACT } from "../lib/brand";
import { observeFrames, flyOnHover, cancelHoverFly } from "../lib/cameraFrames";
import { numberWord } from "../lib/format";
import MagneticButton from "../components/MagneticButton";
import MarkDeck from "../components/MarkDeck";
import TourControl from "../components/TourControl";
import Conditions from "../components/Conditions";
import Passage from "../components/Passage";

/**
 * The storefront.
 *
 * ── What changed, and why ────────────────────────────────────────────────
 *
 * This page used to argue in selling order: claim, evidence, offer, range,
 * close. Five bands, everything on one scroll, nothing more than a page-down
 * away. It converted by being complete.
 *
 * It now does one thing four times smaller, because the offer moved. What is
 * for sale is no longer a website — it is the ROUTE a stranger travels from a
 * search box into an agent's CRM, and a page that lists twenty-four options
 * argues for breadth at exactly the moment it needs to argue for a mechanism.
 * A visitor who scrolls past a running demonstration to reach a price grid has
 * been given the wrong thing to think about.
 *
 * So: one demonstration, one wound, one promise, one door.
 *
 *   The Passage      the whole pitch, playing, in eight seconds without reading
 *   The proof strip  five real sites — evidence for the LANDED station
 *   The cost band    what the route costs when somebody else owns it
 *   The cartouche    the ownership contract, and the only CTA on the page
 *
 * Everything the old page carried is still a real, prerendered, crawlable
 * route — packages, the catalog, capabilities, process, questions — reachable
 * from the masthead on every screen. Nothing was deleted; the homepage stopped
 * trying to be all of them at once. A nav that lists everything ranks nothing,
 * and a homepage that says everything closes nobody.
 *
 * The scroll-synced camera is unchanged: observeFrames in lib/cameraFrames.ts
 * flies to whichever [data-frame] owns the viewport.
 */

/**
 * Phone-only sticky contact bar. The masthead CTA scrolls away inside the
 * Passage — which on a phone is the better part of a screen and a half — so
 * this keeps the two actions that make money one thumb away, and hides itself
 * once the real door is on screen.
 */
function MobileCtaBar({
  hideWhenVisible,
}: {
  hideWhenVisible: React.RefObject<HTMLElement | null>;
}) {
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
    <div className={`mobile-cta-bar panel${hidden ? " is-hidden" : ""}`}>
      <a href={`sms:${CONTACT.phone}`} className="btn btn-ghost btn-sm">
        Text {CONTACT.phoneDisplay}
      </a>
      <Link to="/contact" className="btn btn-primary btn-sm">
        Request a pilot →
      </Link>
    </div>
  );
}

export default function Coast() {
  useEffect(() => observeFrames(), []);
  const closeRef = useRef<HTMLElement | null>(null);

  return (
    <div className="storefront-home" id="sheet">
      {/* ── The Passage ─────────────────────────────────────────────── */}
      <section className="hero-band passage-band" data-frame="top">
        {/*
         * Source order is the phone's order, and CSS reorders it for the
         * desktop reading the design vision describes ("under it, the only
         * headline the page needs").
         *
         * On a phone the claim has to come first anyway. The vertical Passage
         * is most of a screen and a half — a headline underneath it would be a
         * lead-generation page whose proposition sits below the fold, which no
         * amount of showmanship pays for. The visitor reads the claim, then
         * scrolls, and their own thumb drives the vessel down the route.
         */}
        <div className="passage-claim panel">
          <p className="eyebrow">
            {BRAND.name} — {CONTACT.location}
          </p>

          <h1 className="passage-headline">
            Get found. Get the lead. <em>Own the whole route.</em>
          </h1>

          <p className="passage-sub">
            This is the passage every client travels — a stranger's search, your
            light catching them, your page, your CRM. I build all of it, in your
            name, for one fee.
          </p>

          <div className="hero-actions">
            <MagneticButton>
              <Link to="/contact" className="btn btn-primary">
                {OWNERSHIP.cta}
              </Link>
            </MagneticButton>
            <Link to="/packages" className="btn btn-ghost">
              What it costs
            </Link>
            <TourControl />
          </div>

          <div className="hero-conditions">
            <Conditions />
          </div>
        </div>

        <div className="passage-stage panel">
          <Passage />
        </div>

        {/* The chart's own helm: sail the twelve marks without leaving the
            hero. Swiping flies the camera; tapping commits. */}
        <MarkDeck />
      </section>

      {/* ── The proof ───────────────────────────────────────────────── */}
      <div
        className="chart-window is-short"
        data-frame="work-sold-on-amelia-island"
        aria-hidden="true"
      />

      <section className="store-band seam-y" data-frame="top">
        <header className="store-band-head">
          <p className="eyebrow">Station 03 — Landed</p>
          <h2 className="store-band-title">
            {numberWord(TOTALS.projects)} real sites on this coast.{" "}
            <em>Click any of them.</em>
          </h2>
          <p className="store-band-lede">
            Evidence for one station of the passage: the page a lead actually
            arrives on. Every frame below is the real site, captured from the
            live deployment or a production build — no mockups, no concepts —
            and each mark blinks its own light characteristic, the way a lighted
            seamark identifies itself. Hover one and the chart flies to it.
          </p>
        </header>

        <ul className="proof-strip">
          {WORK.map((item) => (
            <li key={item.slug}>
              <Link
                to={`/work/${item.slug}`}
                className="proof-card glass-card"
                onMouseEnter={() => flyOnHover(`work-${item.slug}`)}
                onMouseLeave={cancelHoverFly}
              >
                <span className="proof-shot">
                  <picture>
                    <source media="(max-width: 640px)" srcSet={item.mobile} />
                    <img
                      src={item.desktop}
                      alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
                      width={1440}
                      height={900}
                      loading="lazy"
                      decoding="async"
                    />
                  </picture>
                </span>
                <span className="proof-meta">
                  <span className="proof-name">{item.name}</span>
                  <span className="proof-kind">{item.kind}</span>
                </span>
                <span className="proof-light">
                  <span
                    aria-hidden="true"
                    className={`beacon-dot${item.light.anim ? ` ${item.light.anim}` : ""}`}
                  />
                  <span className="reading">{item.light.characteristic}</span>
                  {item.liveUrl && <span className="case-live">Public</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="store-band-actions">
          <Link to="/work" className="btn btn-ghost">
            Read the case studies →
          </Link>
          <Link to="/capabilities" className="btn btn-ghost">
            Fire the capture demo yourself →
          </Link>
        </div>
      </section>

      {/* ── The cost of the alternative ─────────────────────────────── */}
      <div className="chart-window is-short" data-frame="pricing" aria-hidden="true" />

      <section className="store-band seam-y cost-band">
        <header className="store-band-head">
          <p className="eyebrow">The alternative</p>
          <h2 className="store-band-title">
            Someone already owns this route. <em>They rent it back to you.</em>
          </h2>
          <p className="store-band-lede">
            Every figure below is somebody else's published number, with its
            source and the date it was last checked printed under it. None of
            it is a fee I charge — it is what the same passage costs when the
            light, the page, and the lead all belong to a platform.
          </p>
        </header>

        {/*
         * The one band on this site where amber outweighs white, deliberately.
         * Cyan-versus-amber became white-versus-amber (see the colour
         * semantics at the top of index.css), and the rule is unchanged: white
         * is what you own, amber is value in motion. A whole band of amber is
         * therefore a picture of value moving the wrong way — out of the agent
         * and up the pipe. It is the only place on the site that reads that
         * way, and it is meant to be uncomfortable.
         */}
        <ul className="cost-grid">
          {COST_OF_THE_ALTERNATIVE.map((item) => (
            <li key={item.label} className="cost-tile glass-card">
              <p className="cost-figure reading reading-lead">{item.figure}</p>
              <p className="cost-label">{item.label}</p>
              <p className="cost-detail">{item.detail}</p>
              <p className="source-line">
                Source: {item.source}. Checked{" "}
                <time dateTime={item.checked}>{item.checked}</time>.
                {item.assumption && ` ${item.assumption}`}
              </p>
            </li>
          ))}
        </ul>

        <p className="cost-counterpoint">{COST_COUNTERPOINT}</p>
      </section>

      {/* ── The ownership contract, and the one door ────────────────── */}
      <div className="chart-window is-short" data-frame="contact" aria-hidden="true" />

      <section className="store-band store-close" ref={closeRef}>
        {/*
         * A chart's title block: the panel where the sheet declares its datum
         * and its authority, double-ruled the way the real thing is drawn. It
         * is the one place a chart speaks about itself, which makes it the
         * only correct home for the ownership contract.
         */}
        <div className="cartouche panel">
          <div className="soundings" aria-hidden="true">
            {SOUNDINGS.map((s) => (
              <span key={`${s.x}-${s.y}`} style={{ left: `${s.x}%`, top: `${s.y}%` }}>
                {s.v}
              </span>
            ))}
          </div>

          <p className="mono-label">{OWNERSHIP.datum}</p>
          <h2 className="cartouche-title">{OWNERSHIP.title}</h2>

          <ul className="cartouche-clauses">
            {OWNERSHIP.clauses.map((clause) => (
              <li key={clause}>{clause}</li>
            ))}
          </ul>

          <div className="cartouche-close">
            <MagneticButton>
              <Link to="/contact" className="btn btn-primary">
                {OWNERSHIP.cta}
              </Link>
            </MagneticButton>
            <a href={`tel:${CONTACT.phone}`} className="btn btn-ghost">
              Call {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </section>

      <MobileCtaBar hideWhenVisible={closeRef} />
    </div>
  );
}

/**
 * Depth soundings — the scattered numerals that fill open water on a real
 * chart. Authored rather than random so the layout is stable across renders
 * and can never wander behind a line of text. Held at 5.5% opacity by
 * `.soundings`; if you can read one of these without looking for it, it is
 * too strong.
 */
const SOUNDINGS = [
  { x: 8, y: 18, v: 27 },
  { x: 22, y: 61, v: 34 },
  { x: 37, y: 12, v: 19 },
  { x: 49, y: 78, v: 41 },
  { x: 63, y: 33, v: 23 },
  { x: 71, y: 88, v: 52 },
  { x: 84, y: 24, v: 36 },
  { x: 92, y: 67, v: 48 },
  { x: 15, y: 92, v: 31 },
  { x: 57, y: 47, v: 26 },
];
