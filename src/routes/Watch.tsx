import { Link } from "react-router-dom";
import Page from "../components/Page";
import RadarScope from "../components/RadarScope";
import PassageDiagram from "../components/PassageDiagram";
import {
  CHANNEL_INPUTS,
  CHANNEL_MODEL,
  CHANNEL_RULE,
  WATCH_DRAFT,
  WATCH_PLANS,
} from "../lib/watch";
import { SHOW_PRICING } from "../lib/brand";

/**
 * The Watch — what keeps a light lit after it is built.
 *
 * The builds sell a route. This sells the route staying open: a profile that
 * is attended, forms proven to still reach the CRM, a channel with a meter you
 * can read. Its risk is sounding like every other agency retainer, so the page
 * opens by BEING the service rather than describing it — a scope, a sweep, and
 * eight returns that light as it passes, each labelled with a real thing
 * caught and the real thing done about it.
 *
 * DRAFT. See lib/watch.ts: every plan's price is null, the destination carries
 * `draft: true`, and the prerender stamps noindex and keeps the route out of
 * the sitemap. The commercial terms live in a document this repository has
 * never seen and nothing here invents them.
 */

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });

/**
 * Under sail and under power, as one small diagram.
 *
 * Two identical hulls. One carries a sail and no meter; the other carries a
 * wake and a meter that is running. It is the whole channel argument before a
 * word of the panel is read, and it is drawn rather than written because the
 * distinction an agent needs is not "organic versus paid" — it is "which one
 * keeps costing money after I stop."
 */
function SailAndPower() {
  return (
    <svg
      className="rig-figure"
      viewBox="0 0 420 130"
      role="img"
      aria-label="Two identical vessels: one under sail with no meter running, one under power with a wake and a running meter."
    >
      {[0, 1].map((i) => {
        const x = 40 + i * 210;
        const power = i === 1;
        return (
          <g key={i} className={power ? "rig is-power" : "rig"}>
            {power ? (
              /* A wake, and the meter that comes with it. */
              <>
                <path className="rig-wake" d={`M ${x - 34} 72 q 12 -6 24 0 t 24 0`} />
                <path className="rig-wake" d={`M ${x - 30} 80 q 12 -6 24 0 t 24 0`} />
              </>
            ) : (
              /* A sail. The wind does not send an invoice. */
              <path className="rig-sail" d={`M ${x + 2} 14 L ${x + 2} 58 L ${x + 40} 58 Z`} />
            )}
            <line className="rig-mast" x1={x + 2} y1="12" x2={x + 2} y2="62" />
            <path className="rig-hull" d={`M ${x - 34} 62 L ${x + 44} 62 L ${x + 30} 76 L ${x - 22} 76 Z`} />

            <text className="rig-label" x={x + 4} y="100" textAnchor="middle">
              {power ? "UNDER POWER" : "UNDER SAIL"}
            </text>
            <text className="rig-meter" x={x + 4} y="118" textAnchor="middle">
              {power ? "◉ meter running" : "no meter"}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Watch() {
  return (
    <Page
      wide
      shortWindow
      eyebrow="The Watch"
      title="Somebody has to be looking at the scope"
    >
      <p className="lede">
        A site is not a thing you finish, it is a thing you keep lit. Reviews
        arrive, hours drift, a form quietly stops reaching your CRM, a
        dependency goes stale. The Watch is a person checking, and — this is
        the part every other retainer leaves out — dealing with it.
      </p>

      {/* The service, running, before it is described. */}
      <div className="watch-scope">
        <RadarScope />
      </div>

      {WATCH_DRAFT && (
        <p className="draft-notice" role="note">
          <span className="mono-label">Draft — not yet priced</span>
          The structure below is settled; the monthly figures are not. This page
          is excluded from the sitemap and marked <code>noindex</code> until
          they are, so nothing here can be indexed, quoted back at me, or read
          as an offer.{" "}
          <Link to="/contact">Ask and I will tell you what it would cost</Link>{" "}
          — I would rather quote your situation than publish a number I have not
          finished thinking about.
        </p>
      )}

      {/* ── The three plans ───────────────────────────────────────────── */}
      <div className="watch-grid">
        {WATCH_PLANS.map((plan) => (
          <article key={plan.slug} className="watch-card glass-card">
            {plan.badge && (
              <p
                className={`watch-badge${plan.badgeIsLead ? " is-lead" : ""}`}
                // The one amber badge on the site. It marks the plan pointed at
                // agents who own nothing yet — the only product here sold to
                // someone with no light of their own, which makes them the lead
                // rather than the client. See the colour semantics in index.css.
              >
                {plan.badge}
              </p>
            )}

            <header>
              <h2 className="watch-name">{plan.name}</h2>
              <p className="watch-system">{plan.system}</p>
            </header>

            <p className="watch-price">
              {SHOW_PRICING && plan.price != null ? (
                <>
                  <span className="watch-figure reading">{money(plan.price)}</span>
                  <span className="watch-note">per month</span>
                </>
              ) : (
                <>
                  <span className="watch-figure is-draft reading">TK</span>
                  <span className="watch-note">
                    {WATCH_DRAFT ? "not yet priced" : "fixed monthly, in writing"}
                  </span>
                </>
              )}
            </p>

            <p className="watch-audience">{plan.audience}</p>
            <p className="watch-summary">{plan.summary}</p>

            {/* Which stations of the passage this plan keeps lit — the same
                diagram the tier cards use, answering the other half of the
                question. A build lights the route; a watch keeps it lit. */}
            <PassageDiagram coverage={plan.keeps} caption={`${plan.name} keeps lit`} />

            <div className="tier-section">
              <p className="mono-label">Every month</p>
              <ul className="tier-list">
                {plan.includes.map((line) => (
                  <li key={line}>
                    <span aria-hidden="true" className="tier-tick" />
                    {line}
                  </li>
                ))}
              </ul>
            </div>

            {/* Stated, not omitted. A watch that claims everything watches
                nothing, and the fastest way to lose a client in month two is a
                boundary they discovered instead of being told. */}
            <div className="tier-section">
              <p className="mono-label">Not included</p>
              <ul className="watch-excludes">
                {plan.excludes.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>

            <Link
              to={`/contact?watch=${plan.slug}`}
              className="btn btn-ghost btn-sm mt-6 w-full"
            >
              Ask about {plan.name}
            </Link>
          </article>
        ))}
      </div>

      {/* ── The channel ───────────────────────────────────────────────── */}
      <section className="channel-panel">
        <div className="soundings" aria-hidden="true">
          {[
            [12, 22, 18],
            [31, 74, 29],
            [58, 16, 37],
            [77, 61, 24],
            [90, 33, 44],
            [45, 88, 31],
          ].map(([x, y, v]) => (
            <span key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%` }}>
              {v}
            </span>
          ))}
        </div>

        <p className="eyebrow">Station 01 — the paid channel</p>
        <h2 className="channel-title">The engine, and its meter</h2>
        <p className="channel-rule">{CHANNEL_RULE}</p>

        <SailAndPower />

        {/*
          A fuel gauge, not a pricing table. Every figure on the right is
          computed in lib/watch.ts from the three inputs on the left, so the
          arithmetic on this page cannot drift from the arithmetic in the code
          — and a reader who disagrees with an input can see exactly which
          number to argue with.
        */}
        <div className="gauge">
          <div className="gauge-side">
            <p className="mono-label">Inputs — modelled, not quoted</p>
            <dl className="gauge-rows">
              <div>
                <dt>Monthly floor</dt>
                <dd className="reading">{money(CHANNEL_INPUTS.floor)}</dd>
              </div>
              <div>
                <dt>Cost per click</dt>
                <dd className="reading">{money(CHANNEL_INPUTS.cpc)}</dd>
              </div>
              <div>
                <dt>Click → validated enquiry</dt>
                <dd className="reading">
                  {(CHANNEL_INPUTS.conversionRate * 100).toFixed(2)}%
                </dd>
              </div>
            </dl>
          </div>

          <div className="gauge-side">
            <p className="mono-label">What that buys, per month</p>
            <dl className="gauge-rows">
              <div>
                <dt>Clicks</dt>
                <dd className="reading">
                  {CHANNEL_MODEL.clicks.toLocaleString("en-US")}
                </dd>
              </div>
              <div>
                <dt>Validated enquiries</dt>
                <dd className="reading">{CHANNEL_MODEL.leads}</dd>
              </div>
              <div>
                <dt>Cost per lead</dt>
                {/* Amber: this is money in motion, and it is moving away. */}
                <dd className="reading reading-lead">
                  {money(CHANNEL_MODEL.costPerLead)}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <p className="channel-disclaimer">
          A worked example with stated inputs — not published market data, not a
          quote, and not a forecast. A cost-per-lead figure presented as a fact
          is a promise about an auction nobody controls. Your real numbers
          depend on your market, your season, and who else is bidding, and they
          get quoted in writing before anything runs. Ad spend is paid to the
          platform from your own account, never through me.
        </p>

        <p className="channel-floor">
          The floor is {money(CHANNEL_INPUTS.floor)} a month because below it a
          campaign never gathers enough signal to be steered — you buy noise and
          then pay someone to interpret it. If that is more than the channel is
          worth to you right now, it is the wrong month to run one, and I will
          say so.
        </p>
      </section>

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/contact" className="btn btn-primary btn-sm">
          Twenty minutes, and you'll know
        </Link>
        <Link to="/packages" className="btn btn-ghost btn-sm">
          The builds themselves →
        </Link>
      </div>
    </Page>
  );
}
