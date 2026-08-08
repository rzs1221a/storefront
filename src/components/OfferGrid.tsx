import { Link, useNavigate } from "react-router-dom";
import { TIERS, type Tier } from "../lib/offer";
import { SHOW_PRICING } from "../lib/brand";
import { WORK } from "../lib/work";
import { CATALOG } from "../lib/catalog";
import { flyToFrame, FRAMES } from "../lib/cameraFrames";

/**
 * The offer matrix — four productized build sizes, side by side.
 *
 * Side by side is the point, and alignment is what makes side-by-side mean
 * anything: every card is a subgrid of row tracks the parent declares, so
 * name, price, CTA and turnaround sit on shared baselines across all four
 * columns and a buyer can compare with one horizontal sweep. The featured
 * card's flag is an in-flow row that EVERY card renders (empty where there
 * is no badge) — position never again carries meaning that alignment has
 * to pay for.
 *
 * The comparison stays above the fold of each card: flag, name, price,
 * one-line summary, CTA, turnaround. The long content — who it's for, the
 * deliverables, what it covers — folds into one native <details> per card:
 * crawlable, keyboard-reachable, zero JS. `/packages` passes `expanded` so
 * the same component renders fully open where detail is the job.
 *
 * Every card's button carries its own tier into the lead form through a
 * `?package=` parameter — see routes/Contact.tsx and components/LeadForm.tsx.
 *
 * Prices render only when SHOW_PRICING is true (lib/brand.ts).
 */

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

function TierCard({
  tier,
  order,
  expanded,
}: {
  tier: Tier;
  order: number;
  expanded: boolean;
}) {
  const example = WORK.find((w) => w.slug === tier.exampleSlug);
  const priced = SHOW_PRICING && tier.price !== null;
  const from = priced && tier.priceNote.startsWith("from");
  const covers = CATALOG.filter(
    (o) => o.kind === "build" && o.tierSlug === tier.slug
  );
  const navigate = useNavigate();

  /* The $12,000 tier stops being an abstraction the moment you can watch
     what it buys. On home, fly the chart to The Aerial inside the demo
     band; anywhere without one, go to the case study, which flies its own
     camera. */
  const seeItFly = () => {
    const demo = document.querySelector(".demo-band");
    if (demo) {
      demo.scrollIntoView({ behavior: "smooth", block: "start" });
      flyToFrame(FRAMES["work-the-aerial"]);
    } else {
      navigate("/work/the-aerial");
    }
  };

  return (
    <article
      className={`tier-card glass-card${tier.featured ? " is-featured" : ""}`}
      // Source order leads with the featured tier for the single-column phone
      // layout; the wide grid reads this back to restore price order.
      style={{ "--tier-order": order } as React.CSSProperties}
    >
      {/* Row 1 — the flag. Rendered by every card so the track exists in
          all four columns; nothing below ever drifts off the shared rows. */}
      <p className="tier-flag" aria-hidden={tier.badge ? undefined : "true"}>
        {tier.badge ?? " "}
      </p>

      <header>
        <h3 className="tier-name">{tier.name}</h3>
        <p className="tier-system">{tier.system}</p>
      </header>

      <p className="tier-price">
        {priced ? (
          <>
            <span className="tier-figure">
              {from && <span className="tier-from">from </span>}
              {money(tier.price!)}
            </span>
            <span className="tier-note">
              {from ? tier.priceNote.replace(/^from,?\s*/, "") : tier.priceNote}
            </span>
          </>
        ) : (
          <>
            <span className="tier-figure">Let's talk</span>
            <span className="tier-note">fixed quote, in writing</span>
          </>
        )}
      </p>

      <p className="tier-summary">{tier.summary}</p>

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
        {tier.slug === "flagship" && (
          <div>
            <dt className="mono-label">Watch it</dt>
            <dd>
              <button type="button" className="tier-example" onClick={seeItFly}>
                See it fly →
              </button>
            </dd>
          </div>
        )}
      </dl>

      {/* Row 7 — the disclosure. Same pattern as the FAQ in Studio.tsx. */}
      <details className="tier-details group" open={expanded || undefined}>
        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
          <span className="mono-label">What's in {tier.name}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="flex-none text-(--color-ink-muted) transition-transform duration-300 group-open:rotate-45"
          >
            <path
              d="M7 2.5V11.5M2.5 7H11.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </summary>

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

        {covers.length > 0 && (
          <div className="tier-section">
            <p className="mono-label">Covers</p>
            <p className="mt-2 text-caption leading-relaxed text-(--color-ink-muted)">
              {covers
                .slice(0, 4)
                .map((o) => o.name)
                .join(", ")}
              {covers.length > 4 && (
                <>
                  {" "}
                  <Link
                    to="/options"
                    className="text-(--color-ink-soft) underline decoration-(--line-strong) underline-offset-4"
                  >
                    and {covers.length - 4} more →
                  </Link>
                </>
              )}
            </p>
          </div>
        )}
      </details>
    </article>
  );
}

export default function OfferGrid({ expanded = false }: { expanded?: boolean }) {
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
    <div>
      {/* Stated once where it can be seen, instead of as the first bullet
          of three of the four cards. */}
      <p className="offer-grid-note mono-label">
        Each tier includes everything in the tier before it, plus —
      </p>
      <div className="offer-grid">
        {ordered.map(({ tier, index }) => (
          <TierCard
            key={tier.slug}
            tier={tier}
            order={index}
            expanded={expanded}
          />
        ))}
      </div>
    </div>
  );
}
