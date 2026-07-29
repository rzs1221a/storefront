import { TIERS } from "../lib/offer";
import { SHOW_PRICING } from "../lib/brand";
import { WORK } from "../lib/work";
import Reveal from "../components/Reveal";

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

/**
 * Pricing. Every tier names the real project that proves it, so the number is
 * anchored to something the visitor has already scrolled past rather than
 * floating free.
 */
export default function Pricing() {
  return (
    <section id="pricing" className="section">
      <div className="shell">
        <Reveal>
          <p className="eyebrow">Pricing</p>
          <h2 className="headline mt-4 max-w-[18ch]">
            Pay once. Own it forever.
          </h2>
          <p className="lede mt-5">
            One fee, agreed in writing before anything starts. After launch you
            owe me nothing — hosting is free at the traffic these sites see, and
            the code is yours.
          </p>
        </Reveal>

        <Reveal
          stagger={110}
          as="ul"
          className="mt-14 grid gap-5 lg:grid-cols-3 lg:items-start"
        >
          {TIERS.map((tier) => {
            const example = WORK.find((w) => w.slug === tier.exampleSlug);

            return (
              <li
                key={tier.slug}
                data-reveal-item
                className={`panel-flat lift relative flex h-full flex-col p-7 ${
                  tier.featured
                    ? "border-[--color-signal]/35 lg:-mt-4 lg:pb-9 lg:pt-9"
                    : ""
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-2.5 left-7 rounded-full border border-[--color-signal]/40 bg-[--color-plate] px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[--color-signal]">
                    Most agents start here
                  </span>
                )}

                <h3 className="text-lg font-medium tracking-[-0.015em]">
                  {tier.name}
                </h3>
                <p className="mt-1.5 text-[0.875rem] text-[--color-ink-muted]">
                  {tier.audience}
                </p>

                <p className="mt-6 flex items-baseline gap-2">
                  {SHOW_PRICING && tier.price !== null ? (
                    <>
                      <span className="font-mono text-4xl tracking-tight">
                        {money(tier.price)}
                      </span>
                      <span className="text-xs text-[--color-ink-faint]">
                        {tier.priceNote}
                      </span>
                    </>
                  ) : (
                    <span className="font-mono text-3xl tracking-tight">
                      Let's talk
                    </span>
                  )}
                </p>

                <p className="mt-5 text-[0.9375rem] leading-relaxed text-[--color-ink-soft]">
                  {tier.summary}
                </p>

                <ul className="mt-6 flex-1 space-y-2.5 border-t border-[--line] pt-6">
                  {tier.includes.map((line) => (
                    <li
                      key={line}
                      className="flex gap-2.5 text-[0.875rem] leading-relaxed text-[--color-ink-soft]"
                    >
                      <svg
                        width="13"
                        height="13"
                        viewBox="0 0 13 13"
                        fill="none"
                        aria-hidden="true"
                        className="mt-[0.28em] flex-none text-[--color-signal]"
                      >
                        <path
                          d="M2.5 6.8L5 9.3L10.5 3.8"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {line}
                    </li>
                  ))}
                </ul>

                <div className="mt-7 space-y-3 border-t border-[--line] pt-6">
                  <p className="mono-label">
                    Timeline · {tier.timeline}
                  </p>
                  {example && (
                    <p className="text-xs text-[--color-ink-faint]">
                      Example:{" "}
                      <a
                        href="#work"
                        className="text-[--color-ink-muted] underline decoration-[--line-strong] underline-offset-4 transition-colors hover:text-[--color-ink]"
                      >
                        {example.name}
                      </a>
                    </p>
                  )}
                  <a
                    href="#contact"
                    className={`btn w-full ${
                      tier.featured ? "btn-primary" : "btn-ghost"
                    }`}
                  >
                    Start with {tier.name}
                  </a>
                </div>
              </li>
            );
          })}
        </Reveal>

        <Reveal delay={120}>
          <p className="mt-8 text-center text-sm text-[--color-ink-faint]">
            Hosting runs on Netlify's free tier in your own account. Your only
            ongoing cost is the domain — around $15 a year.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
