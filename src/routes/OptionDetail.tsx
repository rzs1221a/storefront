import { Link, Navigate, useParams } from "react-router-dom";
import { CATALOG, CATEGORIES, priceLabelFor } from "../lib/catalog";
import { WORK } from "../lib/work";
import { TIERS } from "../lib/offer";
import Page from "../components/Page";
import BrowserFrame from "../components/BrowserFrame";
import ConceptFigure from "../components/ConceptFigure";

/**
 * One offering, as a product page.
 *
 * Same commercial structure as a case study — what it is, the thing itself,
 * what's included, a way to buy — with one difference held absolutely: a
 * concept says so before it says anything else. The banner under the title,
 * the hollow badge, and the schematic-in-place-of-a-screenshot are the same
 * honesty line the map draws with its hollow markers.
 *
 * Shipped offerings show the real screenshot of the project that proves them,
 * captioned as such — never presented as "this offering, built".
 */
export default function OptionDetail() {
  const { slug } = useParams();
  const item = CATALOG.find((o) => o.slug === slug);

  // An unknown slug lands on the shelf rather than the coast — this is a
  // store, and the index is the useful fallback.
  if (!item) return <Navigate to="/options" replace />;

  const category = CATEGORIES.find((c) => c.slug === item.category)!;
  const tier = TIERS.find((t) => t.slug === item.tierSlug)!;
  const proof = item.proofSlug
    ? WORK.find((w) => w.slug === item.proofSlug)
    : undefined;

  // Somewhere to go next, so a sheet is never a dead end: the next offering
  // in the same category, wrapping into the catalog index at the end.
  const siblings = CATALOG.filter((o) => o.category === item.category);
  const at = siblings.findIndex((o) => o.slug === item.slug);
  const next = siblings[at + 1];

  const concept = item.status === "concept";

  return (
    <Page
      eyebrow={category.name}
      title={item.name}
      backTo="/options"
      backLabel="All options"
    >
      <p className="mt-1">
        <span className={`badge ${concept ? "badge-concept" : "badge-shipped"}`}>
          {concept ? "Build-ready concept" : "Shipped pattern"}
        </span>
      </p>

      {/* The honesty banner. Non-negotiable on every concept page. */}
      {concept && (
        <p className="concept-banner">
          Build-ready concept. This is not a shipped client site — it is what I
          will build for the first buyer.
          {proof
            ? " The shipped work that proves the parts is linked below."
            : ""}
        </p>
      )}

      <p className="lede mt-5">{item.pitch}</p>

      {/* ── The visual ───────────────────────────────────────────────── */}
      <div className="mt-7">
        {concept || !proof ? (
          <ConceptFigure name={item.name} hue={item.hue} />
        ) : (
          <>
            <p className="mono-label mb-3">As shipped in {proof.name}</p>
            <BrowserFrame
              url={proof.liveUrl?.replace(/^https:\/\//, "")}
              liveUrl={proof.liveUrl}
            >
              <picture>
                <source media="(max-width: 640px)" srcSet={proof.mobile} />
                <img
                  src={proof.desktop}
                  alt={`The ${proof.name} website, where this pattern runs today`}
                  width={1440}
                  height={900}
                  decoding="async"
                  className="block w-full"
                />
              </picture>
            </BrowserFrame>
          </>
        )}
      </div>

      <p className="mt-6 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
        {item.detail}
      </p>

      {/* ── What's included ──────────────────────────────────────────── */}
      <div className="mt-8 border-t border-(--line) pt-6">
        <p className="mono-label">What's included</p>
        <ul className="mt-3 space-y-2.5">
          {item.includes.map((line) => (
            <li
              key={line}
              className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)"
            >
              <span
                aria-hidden="true"
                className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-(--color-signal)"
              />
              {line}
            </li>
          ))}
        </ul>
      </div>

      {/* ── The proof, when a real project carries it ─────────────────── */}
      {proof && (
        <Link
          to={`/work/${proof.slug}`}
          className="mt-6 block rounded-xl border border-(--line) bg-white/[0.02] p-4 text-sm transition-colors hover:border-(--line-strong)"
        >
          <span className="mono-label">
            {concept ? "The parts are proven in" : "Running today in"}
          </span>
          <span className="mt-1.5 flex items-center justify-between gap-4">
            <span className="text-(--color-ink)">
              {proof.name} — {proof.kind.toLowerCase()}
            </span>
            <span className="text-(--color-ink-soft)">Read the case study →</span>
          </span>
        </Link>
      )}

      {/* ── Call to action ───────────────────────────────────────────── */}
      <div className="case-cta">
        <p className="case-cta-line">
          This is a{" "}
          <strong className="font-medium text-(--color-ink)">{tier.name}</strong>{" "}
          build — {item.timeline.toLowerCase()}, {priceLabelFor(item)}, and you
          own it outright.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to={`/contact?option=${item.slug}`}
            className="btn btn-primary btn-sm"
          >
            {concept ? "Be the first to build this" : "Get this built for you"}
          </Link>
          <Link to="/packages" className="btn btn-ghost btn-sm">
            Compare build sizes →
          </Link>
        </div>
      </div>

      <Link
        to={next ? `/options/${next.slug}` : "/options"}
        className="mt-8 flex items-center justify-between gap-4 border-t border-(--line) pt-6 text-sm transition-colors hover:text-(--color-ink)"
      >
        <span className="mono-label">
          {next ? `Next in ${category.name.toLowerCase()}` : "Back to the catalog"}
        </span>
        <span className="text-(--color-ink-soft)">
          {next ? `${next.name} →` : "Every option →"}
        </span>
      </Link>
    </Page>
  );
}
