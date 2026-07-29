import { WORK, TOTALS } from "../lib/work";
import CountUp from "../components/CountUp";
import BrowserFrame from "../components/BrowserFrame";
import MagneticButton from "../components/MagneticButton";
import Conditions from "../components/Conditions";
import Reveal from "../components/Reveal";

/**
 * The opening statement, plus proof, plus evidence the claims are live.
 *
 * Previously this used about 40% of the viewport — a headline ending at a
 * third of the width with nothing balancing the rest. Now the headline holds
 * the left and the stat rail plus the live conditions line occupy the right on
 * large screens, collapsing to a full-width rail beneath on smaller ones.
 *
 * The flagship screenshot still sits above the fold on purpose: for this
 * audience one look at real work outperforms any headline.
 */
export default function Hero() {
  const flagship = WORK[0];

  return (
    <section id="top" data-frame="top" className="relative pt-32 sm:pt-40">
      <div className="shell">
        <div className="grid gap-x-16 gap-y-12 lg:grid-cols-12 lg:items-end">
          {/* The claim */}
          <Reveal className="lg:col-span-7">
            <p className="eyebrow">Websites for real estate professionals</p>

            <h1 className="display mt-6">
              Your website should be the reason they call you.
            </h1>

            <p className="subhead mt-7 max-w-[46ch]">
              Bespoke, high-performance websites for BHHS agents — built once,
              owned outright, no monthly platform fee.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <MagneticButton>
                <a href="#contact" className="btn btn-primary">
                  Get a quote
                </a>
              </MagneticButton>
              <a href="#work" className="btn btn-ghost">
                See the work
              </a>
            </div>
          </Reveal>

          {/*
            The record: measured facts and live proof, gathered into a single
            glass card. Loose in the column it left a large void above itself
            and read as unfinished; contained, it balances the headline and
            shows the material the rest of the page is built from.

            Every number is derived from the portfolio data, never typed.
          */}
          <Reveal direction="right" delay={140} className="lg:col-span-5 lg:pb-3">
            <div className="panel p-7">
              <p className="mono-label">The record</p>

              <dl className="mt-5 divide-y divide-(--line)">
                <div className="flex items-baseline justify-between pb-4">
                  <dt className="text-[0.9375rem] text-(--color-ink-soft)">
                    Sites shipped
                  </dt>
                  <dd className="font-mono text-2xl tracking-tight">
                    <CountUp to={TOTALS.projects} />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between py-4">
                  <dt className="text-[0.9375rem] text-(--color-ink-soft)">
                    Lines written
                  </dt>
                  <dd className="font-mono text-2xl tracking-tight">
                    <CountUp to={TOTALS.loc} />
                  </dd>
                </div>
                <div className="flex items-baseline justify-between pt-4">
                  <dt className="text-[0.9375rem] text-(--color-ink-soft)">
                    Monthly fee
                  </dt>
                  <dd className="font-mono text-2xl tracking-tight">$0</dd>
                </div>
              </dl>

              {/*
                Live NOAA and NWS data — the page's one piece of proof rather
                than claim. Renders nothing when the endpoints are absent, so
                nothing here may depend on its height.
              */}
              <Conditions className="mt-6 border-t border-(--line) pt-5" />
            </div>
          </Reveal>
        </div>
      </div>

      {/* Proof, immediately — and bleeding past the right edge so the page
          reads as wider than the text column that opened it. */}
      <Reveal delay={220} className="mt-16 sm:mt-20">
        <div className="pl-[var(--gutter)] lg:pr-0 xl:pl-[max(var(--gutter),calc((100vw-90rem)/2+var(--gutter)))]">
          <BrowserFrame
            url={flagship.liveUrl?.replace(/^https:\/\//, "")}
            className="rounded-r-none border-r-0"
          >
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
        </div>
        <p className="mono-label shell mt-4">
          {flagship.name} — built for a Berkshire Hathaway HomeServices brokerage
        </p>
      </Reveal>
    </section>
  );
}
