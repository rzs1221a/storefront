import { Link } from "react-router-dom";
import { WORK, TOTALS } from "../lib/work";
import { TIERS } from "../lib/offer";
import { numberWord } from "../lib/format";
import Page from "../components/Page";

/**
 * Work and case studies — the index.
 *
 * This was a phone-only list before, because the desktop rail names every
 * project directly. It is a real destination on every viewport now: "case
 * studies" is a thing buyers look for by name, and a site that sells work
 * should have a page you can send someone to.
 *
 * Each row carries the tier it corresponds to, so browsing the work is also
 * browsing the offer — a visitor who likes Crane Island learns, on the same
 * row, that it is a Community Site.
 */

/** Which package each project is an example of, from lib/offer.ts. */
const TIER_FOR = new Map(TIERS.map((t) => [t.exampleSlug, t]));

export default function Work() {
  return (
    <Page
      eyebrow="Work & case studies"
      title={`${numberWord(TOTALS.projects)} sites. All of them real`}
    >
      <p className="lede">
        Every one of these is the actual site, captured from the live deployment
        or a production build — no mockups and no concepts. {TOTALS.live} are
        public right now and linked; the rest are client sites I can walk you
        through on a call.
      </p>

      <dl className="mt-6 flex items-baseline gap-8 border-y border-(--line) py-4">
        <div>
          <dt className="mono-label">Sites shipped</dt>
          <dd className="mt-1 font-mono text-xl">{TOTALS.projects}</dd>
        </div>
        <div>
          <dt className="mono-label">Lines of source</dt>
          <dd className="mt-1 font-mono text-xl">
            {TOTALS.loc.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="mono-label">Monthly fee</dt>
          <dd className="mt-1 font-mono text-xl">$0</dd>
        </div>
      </dl>

      <ul className="mt-2 divide-y divide-(--line)">
        {WORK.map((item, i) => {
          const tier = TIER_FOR.get(item.slug);
          return (
            <li key={item.slug}>
              <Link to={`/work/${item.slug}`} className="case-row">
                <span className="case-index">{String(i + 1).padStart(2, "0")}</span>

                <span className="min-w-0 flex-1">
                  <span className="case-head">
                    <span className="case-name">{item.name}</span>
                    <span className="case-kind">{item.kind}</span>
                  </span>

                  <span className="case-summary">{item.summary}</span>

                  <span className="case-meta">
                    <span className="font-mono text-[0.6875rem] text-(--color-ink-faint)">
                      {item.loc.toLocaleString("en-US")} lines
                    </span>
                    {tier && (
                      <span className="case-tier">Example of: {tier.name}</span>
                    )}
                    {item.liveUrl && <span className="case-live">Public</span>}
                  </span>
                </span>

                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                  className="mt-1.5 flex-none text-(--color-ink-faint)"
                >
                  <path
                    d="M5 3L9.5 7L5 11"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/packages" className="btn btn-primary btn-sm">
          View packages
        </Link>
        <Link to="/contact" className="btn btn-ghost btn-sm">
          Get a site built like these
        </Link>
      </div>
    </Page>
  );
}
