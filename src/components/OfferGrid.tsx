import { Link } from "react-router-dom";
import { TIERS, type Tier } from "../lib/offer";
import { SHOW_PRICING } from "../lib/brand";
import { WORK } from "../lib/work";

/**
 * The offer matrix — three productized packages, side by side.
 *
 * Side by side is the point. A buyer deciding between tiers is comparing, and
 * a stacked list makes them hold the first card in memory while they read the
 * third. At narrow widths the grid collapses to one column, where the featured
 * tier is hoisted to the top so the recommendation is still the first thing
 * read rather than the middle thing scrolled past.
 *
 * Every card's button carries its own tier into the lead form through a
 * `?package=` parameter — see routes/Contact.tsx and components/LeadForm.tsx.
 * Asking someone to re-select the thing they just clicked is the cheapest
 * conversion leak there is.
 *
 * Prices render only when SHOW_PRICING is true (lib/brand.ts). Until then the
 * cards do their full job — deliverables, turnaround, who it is for — and the
 * figure reads "Let's talk".
 */

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function TierCard({ tier, order }: { tier: Tier; order: number }) {
  const example = WORK.find((w) => w.slug === tier.exampleSlug);
  const priced = SHOW_PRICING && tier.price !== null;

  return (
    <article
      className={`tier-card${tier.featured ? " is-featured" : ""}`}
      // Source order leads with the featured tier for the single-column phone
      // layout; the wide grid reads this back to restore price order, where
      // the centre position is what marks the recommendation out.
      style={{ "--tier-order": order } as React.CSSProperties}
    >
      {tier.badge && <p className="tier-badge">{tier.badge}</p>}

      <header>
        <h3 className="tier-name">{tier.name}</h3>
        <p className="tier-system">{tier.system}</p>
      </header>

      <p className="tier-price">
        {priced ? (
          <>
            <span className="tier-figure">{money(tier.price!)}</span>
            <span className="tier-note">{tier.priceNote}</span>
          </>
        ) : (
          <>
            <span className="tier-figure">Let's talk</span>
            <span className="tier-note">fixed quote, in writing</span>
          </>
        )}
      </p>

      <p className="tier-summary">{tier.summary}</p>

      {/* The CTA sits above the fold of the card, before the long list. A
          reader who is already convinced should not have to scroll past six
          bullet points to act. */}
      <Link
        to={`/contact?package=${tier.slug}`}
        className={`btn btn-sm w-full ${tier.featured ? "btn-primary" : "btn-ghost"}`}
      >
        {tier.ctaLabel}
      </Link>

      <dl className="tier-meta">
        <div>
          <dt className="mono-label">Turnaround</dt>
          <dd>{tier.turnaroundTime}</dd>
        </div>
        {example && (
          <div>
            <dt className="mono-label">Built already</dt>
            <dd>
              <Link to={`/work/${example.slug}`} className="tier-example">
                {example.name} →
              </Link>
            </dd>
          </div>
        )}
      </dl>

      <div className="tier-section">
        <p className="mono-label">Ideal for</p>
        <ul className="tier-list is-plain">
          {tier.idealFor.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      </div>

      <div className="tier-section">
        <p className="mono-label">What you get</p>
        <ul className="tier-list">
          {tier.deliverables.map((line) => (
            <li key={line}>
              <span aria-hidden="true" className="tier-tick" />
              {line}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}

export default function OfferGrid() {
  /*
   * Featured first in source order, so the single-column phone layout leads
   * with the recommendation instead of burying it between the other two.
   * Each card carries its original index, which the wide grid uses to put
   * them back in price order.
   */
  const ordered = TIERS.map((tier, index) => ({ tier, index })).sort(
    (a, b) => Number(Boolean(b.tier.featured)) - Number(Boolean(a.tier.featured))
  );

  return (
    <div className="offer-grid">
      {ordered.map(({ tier, index }) => (
        <TierCard key={tier.slug} tier={tier} order={index} />
      ))}
    </div>
  );
}
