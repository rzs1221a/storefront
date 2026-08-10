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
 * row, that it is a Beacon build.
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
          <dd className="mt-1 font-mono text-title">{TOTALS.projects}</dd>
        </div>
        <div>
          <dt className="mono-label">Lines of source</dt>
          <dd className="mt-1 font-mono text-title">
            {TOTALS.loc.toLocaleString("en-US")}
          </dd>
        </div>
        <div>
          <dt className="mono-label">Monthly fee</dt>
          <dd className="mt-1 font-mono text-title">$0</dd>
        </div>
      </dl>

      <ul className="mt-6 grid gap-8">
        {WORK.map((item) => {
          const tier = TIER_FOR.get(item.slug);
          return (
            <li key={item.slug} className="work-showcase">
              <Link to={`/work/${item.slug}`} className="work-showcase-stage">
                <img
                  src={item.desktop}
                  alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
                  width={1440}
                  height={900}
                  loading="lazy"
                  decoding="async"
                />
              </Link>
              <div className="work-showcase-copy">
                <p className="eyebrow">
                  {item.light.anim && (
                    <span className={`sig-dot ${item.light.anim}`} aria-hidden="true" />
                  )}
                  {item.kind}
                </p>
                <h2 className="work-showcase-name">{item.name}</h2>
                <p className="mt-1 text-body-sm leading-relaxed text-(--color-ink-soft)">
                  {item.summary}
                </p>
                <p className="mono-label mt-2">
                  {item.loc.toLocaleString("en-US")} lines
                  {tier && ` · a ${tier.name} build`}
                  {item.liveUrl && " · public"}
                </p>
                <p className="tile-links mt-3 !justify-start">
                  <Link to={`/work/${item.slug}`}>Case study ›</Link>
                  {item.liveUrl && (
                    <a href={item.liveUrl} target="_blank" rel="noreferrer">
                      Visit live ›
                    </a>
                  )}
                  {tier && (
                    <Link to={`/contact?package=${tier.slug}`}>
                      Order one like it ›
                    </Link>
                  )}
                </p>
              </div>
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
