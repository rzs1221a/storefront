import { Link } from "react-router-dom";
import { COMPARISON } from "../lib/offer";
import Sheet from "../components/Sheet";
import OfferGrid from "../components/OfferGrid";

/**
 * The store. Three productized packages, side by side, each with its own way
 * into the lead form carrying its own name.
 *
 * The ownership comparison sits underneath rather than above: it is an
 * objection-handler, and a buyer who is already sold should reach a button
 * before they reach an argument.
 */
export default function Packages() {
  return (
    <Sheet wide eyebrow="Packages" title="Three packages. Pay once, own it forever">
      <p className="lede">
        One fee, agreed in writing before anything starts. After launch you owe
        me nothing — hosting is free at the traffic these sites see, the code
        lives in a repository in your name, and the domain is registered to you.
      </p>

      <div className="mt-8">
        <OfferGrid />
      </div>

      <p className="mt-6 text-xs text-(--color-ink-faint)">
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

      {/* The ownership argument, which is the real objection-handler. */}
      <h2 className="mt-12 border-t border-(--line) pt-8 text-lg font-medium tracking-[-0.015em]">
        {COMPARISON.headline}
      </h2>
      <p className="mt-3 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
        Platform sites typically run a setup fee plus a few hundred dollars a
        month, for as long as you want the site to stay up. That is a reasonable
        business — it is just worth being clear about what you get and what you
        are renting.
      </p>

      <dl className="mt-6 space-y-4">
        {COMPARISON.rows.map((row) => (
          <div key={row.question} className="border-t border-(--line) pt-4">
            <dt className="text-[0.9375rem] font-medium">{row.question}</dt>
            <dd className="mt-2 text-[0.875rem] leading-relaxed text-(--color-ink-muted)">
              <span className="mono-label">A platform</span> {row.platform}
            </dd>
            <dd className="mt-1.5 text-[0.875rem] leading-relaxed text-(--color-ink-soft)">
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-(--color-signal)">
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
    </Sheet>
  );
}
