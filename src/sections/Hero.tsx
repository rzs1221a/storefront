import { BRAND } from "../lib/brand";
import { WORK, TOTALS } from "../lib/work";
import CountUp from "../components/CountUp";
import BrowserFrame from "../components/BrowserFrame";

/**
 * The opening statement plus immediate visual proof.
 *
 * The flagship screenshot sits above the fold on purpose — for this audience,
 * one look at real work outperforms any headline. The claim is deliberately
 * concrete and checkable rather than adjectival.
 */
export default function Hero() {
  const flagship = WORK[0];

  return (
    <section id="top" className="relative overflow-hidden pt-32 sm:pt-40">
      {/* Ambient wash. Purely decorative, kept subtle enough to read as depth
          rather than decoration. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[46rem]"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(79,214,227,0.09), transparent 70%)",
        }}
      />

      <div className="shell">
        <p className="eyebrow" data-reveal-item>
          Websites for real estate professionals
        </p>

        <h1 className="display mt-6 max-w-[19ch]">
          Your website should be the reason they call you.
        </h1>

        <p className="subhead mt-7 max-w-[54ch]">
          {BRAND.positioning}
        </p>

        <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
          <a href="#contact" className="btn btn-primary">
            Get a quote
          </a>
          <a href="#work" className="btn btn-ghost">
            See the work
          </a>
        </div>

        {/* Measured facts, not adjectives. Every number here is derived from
            the portfolio data rather than typed by hand. */}
        <dl className="mt-14 grid max-w-2xl grid-cols-3 gap-6 border-t border-(--line) pt-8">
          <div>
            <dt className="mono-label">Sites shipped</dt>
            <dd className="mt-1.5 font-mono text-3xl tracking-tight sm:text-4xl">
              <CountUp to={TOTALS.projects} />
            </dd>
          </div>
          <div>
            <dt className="mono-label">Lines written</dt>
            <dd className="mt-1.5 font-mono text-3xl tracking-tight sm:text-4xl">
              <CountUp to={TOTALS.loc} />
            </dd>
          </div>
          <div>
            <dt className="mono-label">Monthly fee</dt>
            <dd className="mt-1.5 font-mono text-3xl tracking-tight sm:text-4xl">
              $0
            </dd>
          </div>
        </dl>
      </div>

      {/* Proof, immediately. */}
      <div className="shell mt-16 sm:mt-20">
        <BrowserFrame url={flagship.liveUrl?.replace(/^https:\/\//, "")}>
          <picture>
            <source media="(max-width: 640px)" srcSet={flagship.mobile} />
            <img
              src={flagship.desktop}
              alt={`${flagship.name} — ${flagship.summary}`}
              width={1440}
              height={900}
              fetchPriority="high"
              decoding="async"
              className="block w-full"
            />
          </picture>
        </BrowserFrame>
        <p className="mono-label mt-4 text-center">
          {flagship.name} — built for a Berkshire Hathaway HomeServices brokerage
        </p>
      </div>
    </section>
  );
}
