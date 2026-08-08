import { Link } from "react-router-dom";
import { COMPARISON, TIERS } from "../lib/offer";
import { MODULES, includedInLabel } from "../lib/catalog";
import { SHOW_PRICING } from "../lib/brand";
import { numberWord } from "../lib/format";
import Page from "../components/Page";
import OfferGrid from "../components/OfferGrid";

/**
 * The store. Four build sizes side by side, then the six modules that attach
 * to any of them — the two axes of the offer on one sheet, each with its own
 * way into the lead form carrying its own name.
 *
 * The ownership comparison sits underneath rather than above: it is an
 * objection-handler, and a buyer who is already sold should reach a button
 * before they reach an argument.
 */
export default function Packages() {
  return (
    <Page
      wide
      shortWindow
      eyebrow="Packages"
      title={`${numberWord(TIERS.length)} build sizes. Pay once, own it forever`}
    >
      <p className="lede">
        One fee, agreed in writing before anything starts. After launch you owe
        me nothing — hosting is free at the traffic these sites see, the code
        lives in a repository in your name, and the domain is registered to you.
      </p>

      <div className="mt-8">
        <OfferGrid expanded />
      </div>

      <p className="mt-6 text-caption text-(--color-ink-faint)">
        Hosting runs on Netlify's free tier in your own account. Your only
        ongoing cost is the domain — around $15 a year. Not sure which tier
        fits?{" "}
        <Link
          to="/contact"
          className="text-(--color-ink-muted) underline decoration-(--line-strong) underline-offset-4"
        >
          Describe what you sell and I will tell you.
        </Link>
      </p>

      {/* ── The second axis: modules ──────────────────────────────────── */}
      <h2 className="mt-12 border-t border-(--line) pt-8 text-title font-medium">
        Add to any build
      </h2>
      <p className="mt-3 text-body-sm leading-relaxed text-(--color-ink-soft)">
        {numberWord(MODULES.length)} modules that attach to any build size —
        or retrofit into the site you already have. Each is priced on its own,
        and the larger builds include some outright.
      </p>

      <ul className="mt-6 divide-y divide-(--line)">
        {MODULES.map((m) => (
          <li key={m.slug}>
            <Link to={`/options/${m.slug}`} className="module-row">
              <span className="min-w-0 flex-1">
                <span className="case-head">
                  <span className="case-name">{m.name}</span>
                  {m.status === "shipped" && (
                    <span className="badge badge-shipped">Shipped</span>
                  )}
                </span>
                <span className="case-summary">{m.pitch}</span>
                {includedInLabel(m) && (
                  <span className="mono-label mt-1.5 block">
                    {includedInLabel(m)}
                  </span>
                )}
              </span>
              <span className="module-price">
                {SHOW_PRICING && m.priceFrom != null
                  ? `from $${m.priceFrom.toLocaleString("en-US")}`
                  : "Let's talk"}
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* The ownership argument, which is the real objection-handler. */}
      <h2 className="mt-12 border-t border-(--line) pt-8 text-title font-medium">
        {COMPARISON.headline}
      </h2>
      <p className="mt-3 text-body-sm leading-relaxed text-(--color-ink-soft)">
        Platform sites typically run a setup fee plus a few hundred dollars a
        month, for as long as you want the site to stay up. That is a reasonable
        business — it is just worth being clear about what you get and what you
        are renting.
      </p>

      <dl className="mt-6 space-y-4">
        {COMPARISON.rows.map((row) => (
          <div key={row.question} className="border-t border-(--line) pt-4">
            <dt className="text-body-sm font-medium">{row.question}</dt>
            <dd className="mt-2 text-body-sm leading-relaxed text-(--color-ink-muted)">
              <span className="mono-label">A platform</span> {row.platform}
            </dd>
            <dd className="mt-1.5 text-body-sm leading-relaxed text-(--color-ink-soft)">
              <span className="font-mono text-micro uppercase tracking-[0.1em] text-(--color-signal)">
                Built by me
              </span>{" "}
              {row.us}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/contact" className="btn btn-primary btn-sm">
          Schedule a consultation
        </Link>
        <Link to="/process" className="btn btn-ghost btn-sm">
          How a project runs →
        </Link>
        <Link to="/questions" className="btn btn-ghost btn-sm">
          Common questions →
        </Link>
      </div>
    </Page>
  );
}
