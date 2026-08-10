import { useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CATALOG_TOTALS,
  CATEGORIES,
  offeringsByCategory,
  priceLabelFor,
} from "../lib/catalog";
import { TIERS } from "../lib/offer";
import { TOTALS, WORK } from "../lib/work";
import { numberWord } from "../lib/format";
import Page from "../components/Page";
import { PromptChip } from "../components/Prompt";

/** Each category opens in the buyer's voice — questions chosen to land in
    the resolver's vocabulary, so clicking one gets a real answer. */
const CATEGORY_QUESTIONS: Record<string, string> = {
  "individual-agents": "I'm one agent — what do I need?",
  "teams-brokerages": "we're a team — can you handle a roster?",
  "communities-developments": "can one community get its own site?",
  "listings-campaigns": "can a single listing have its own address?",
  "tools-modules": "can you add search to the site I have?",
};

/**
 * The catalog index — the store shelf.
 *
 * Five categories, every option on one sheet, and the honesty line drawn on
 * every row: Shipped means the pattern runs today in a project you can open;
 * Concept means build-ready and clearly said so. The map behind this sheet has
 * pulled out to the whole corridor, where the six concept markers hang along
 * the coast — the catalog is the one place the site shows its whole reach at
 * once.
 */

const TIER_NAME = new Map(TIERS.map((t) => [t.slug, t.name]));
const WORK_NAME = new Map(WORK.map((w) => [w.slug, w.name]));

export default function Options() {
  const { hash } = useLocation();

  // /options#communities scrolls to its section *inside the sheet* — the
  // document itself never scrolls on this site, so the browser's native hash
  // jump does nothing and the sheet has to do it.
  useEffect(() => {
    if (!hash) return;
    const el = document.getElementById(hash.slice(1));
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "start", behavior: reduced ? "auto" : "smooth" });
  }, [hash]);

  return (
    <Page
      wide
      eyebrow="Everything I build"
      title={`${CATALOG_TOTALS.options} options. ${numberWord(TOTALS.projects)} shipped proofs`}
    >
      <p className="lede">
        Every site type a real estate business needs, as a catalog rather than
        a sales call. {numberWord(CATALOG_TOTALS.shipped)} of these patterns are
        running today in shipped work and say which project proves them. The
        rest are marked{" "}
        <span className="badge badge-concept">Concept</span> — build-ready,
        priced, and honestly not yet anyone's live site. Nothing here pretends
        otherwise.
      </p>

      {CATEGORIES.map((cat) => {
        const offerings = offeringsByCategory(cat.slug);
        return (
          <section key={cat.slug} id={cat.slug} className="mt-10">
            {CATEGORY_QUESTIONS[cat.slug] && (
              <PromptChip question={CATEGORY_QUESTIONS[cat.slug]} />
            )}
            <h2 className="mt-2 text-title font-medium">
              {cat.name}
            </h2>
            <p className="mt-1 text-body-sm text-(--color-ink-muted)">
              {cat.blurb}
            </p>

            <ul className="mt-4 divide-y divide-(--line)">
              {offerings.map((o, i) => (
                <li key={o.slug}>
                  <Link to={`/options/${o.slug}`} className="case-row">
                    <span className="case-index">
                      {String(i + 1).padStart(2, "0")}
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="case-head">
                        <span className="case-name">{o.name}</span>
                        <span
                          className={`badge ${o.status === "shipped" ? "badge-shipped" : "badge-concept"}`}
                        >
                          {o.status === "shipped" ? "Shipped" : "Concept"}
                        </span>
                        {o.kind === "module" && (
                          <span className="badge badge-module">Module</span>
                        )}
                      </span>

                      <span className="case-summary">{o.pitch}</span>

                      <span className="case-meta">
                        <span className="case-tier">
                          {o.kind === "module"
                            ? `${priceLabelFor(o)} · ${o.timeline.toLowerCase()}`
                            : `${TIER_NAME.get(o.tierSlug!)} build · ${o.timeline.toLowerCase()}`}
                        </span>
                        {o.proofSlug && (
                          <span className="font-mono text-micro text-(--color-ink-faint)">
                            Proof: {WORK_NAME.get(o.proofSlug)}
                          </span>
                        )}
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
                  {/* Found it? Order it — the slug rides into the lead form
                      so nobody re-selects the thing they just chose. */}
                  <Link
                    to={`/contact?option=${o.slug}`}
                    className="case-order"
                  >
                    {o.status === "shipped" ? "Order this ›" : "Be first ›"}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <div className="mt-10 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
        <Link to="/packages" className="btn btn-primary btn-sm">
          View build sizes
        </Link>
        <Link to="/work" className="btn btn-ghost btn-sm">
          See the shipped work →
        </Link>
        <Link to="/capabilities" className="btn btn-ghost btn-sm">
          See the live demo →
        </Link>
      </div>
    </Page>
  );
}
