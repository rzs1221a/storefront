import { Link, Navigate, useParams } from "react-router-dom";
import { WORK } from "../lib/work";
import { WORK_DESTINATIONS } from "../lib/destinations";
import { TIERS } from "../lib/offer";
import { formatLatLon } from "../lib/format";
import Sheet from "../components/Sheet";
import BrowserFrame from "../components/BrowserFrame";
import QuickText from "../components/QuickText";

/**
 * One project, as a case study and as a destination.
 *
 * The camera has already descended to this project's real coordinate by the
 * time the sheet opens — see Shell and lib/cameraFrames.
 *
 * The structure is commercial rather than chronological: who it was for and
 * what it achieves, then the thing itself running, then what it is made of,
 * then a way to buy one. A visitor reading a case study is asking "could I
 * have this", so the answer has to be on the same screen as the evidence.
 */

/** Which package this project is an example of, from lib/offer.ts. */
const TIER_FOR = new Map(TIERS.map((t) => [t.exampleSlug, t]));

export default function WorkDetail() {
  const { slug } = useParams();
  const item = WORK.find((w) => w.slug === slug);
  const index = WORK.findIndex((w) => w.slug === slug);

  // An unknown slug is a genuine 404 rather than an empty sheet; send it home.
  if (!item) return <Navigate to="/" replace />;

  const next = WORK_DESTINATIONS[(index + 1) % WORK_DESTINATIONS.length];
  const tier = TIER_FOR.get(item.slug);
  const beacon = WORK_DESTINATIONS.find(
    (d) => d.path === `/work/${item.slug}`
  )?.beacon;

  return (
    <Sheet eyebrow={item.kind} title={item.name} escapeTo="/work">
      {/* The datum line: this mark's light characteristic and true position,
          exactly as a chart would record it. The storefront's own reads F —
          fixed — because it is the mark you are standing on. */}
      {beacon && (
        <p className="sheet-datum">
          {item.light.characteristic} · {formatLatLon(beacon.center)}
          {item.slug === "seamark-storefront" && " — the mark you are standing on"}
        </p>
      )}

      {/* ── Client & outcome ─────────────────────────────────────────── */}
      <dl className="case-facts">
        <div>
          <dt className="mono-label">Client</dt>
          <dd>{item.client}</dd>
        </div>
        <div>
          <dt className="mono-label">Outcome</dt>
          <dd>{item.outcome}</dd>
        </div>
      </dl>

      {/* ── Interactive preview ──────────────────────────────────────── */}
      <div className="mt-7">
        <p className="mono-label mb-3">Interactive preview</p>
        <BrowserFrame
          url={item.liveUrl?.replace(/^https:\/\//, "")}
          // Only the publicly reachable projects can run inside the sheet; the
          // other three are client sites and keep their screenshot.
          liveUrl={item.liveUrl}
        >
          <picture>
            <source media="(max-width: 640px)" srcSet={item.mobile} />
            <img
              src={item.desktop}
              alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
              width={1440}
              height={900}
              decoding="async"
              className="block w-full"
            />
          </picture>
        </BrowserFrame>
      </div>

      <p className="lede mt-6">{item.summary}</p>

      <p className="mt-4 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
        {item.detail}
      </p>

      {/* ── Tech stack & modules ─────────────────────────────────────── */}
      <div className="mt-8 border-t border-(--line) pt-6">
        <p className="mono-label">Tech stack</p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {item.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-(--line) bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-(--color-ink-muted)"
            >
              {tech}
            </span>
          ))}
          <span className="font-mono text-[11px] text-(--color-ink-faint)">
            {item.loc.toLocaleString("en-US")} lines of source
          </span>
        </div>

        <p className="mono-label mt-6">Modules included</p>
        <ul className="mt-3 space-y-2.5">
          {item.highlights.map((h) => (
            <li
              key={h}
              className="flex gap-2.5 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)"
            >
              <span
                aria-hidden="true"
                className="mt-[0.55em] h-1 w-1 flex-none rounded-full bg-(--color-signal)"
              />
              {h}
            </li>
          ))}
        </ul>
      </div>

      {/* ── Call to action ───────────────────────────────────────────── */}
      <div className="case-cta">
        <p className="case-cta-line">
          {tier ? (
            <>
              This is a <strong className="font-medium text-(--color-ink)">{tier.name}</strong>{" "}
              build — {tier.turnaroundTime.toLowerCase()}, one fixed fee, and
              you own it.
            </>
          ) : (
            <>Something like this, built for you, on a fixed quote you own outright.</>
          )}
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Link
            to={tier ? `/contact?package=${tier.slug}` : "/contact"}
            className="btn btn-primary btn-sm"
          >
            Get a site built like this
          </Link>
          {item.liveUrl && (
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm"
            >
              Visit the live site
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          )}
          <Link to="/packages" className="btn btn-ghost btn-sm">
            Compare packages →
          </Link>
          <QuickText className="btn btn-ghost btn-sm" />
        </div>
      </div>

      {/* Somewhere to go next, so a sheet is never a dead end. */}
      <Link
        to={next.path}
        className="mt-8 flex items-center justify-between gap-4 border-t border-(--line) pt-6 text-sm transition-colors hover:text-(--color-ink)"
      >
        <span className="mono-label">Next case study</span>
        <span className="text-(--color-ink-soft)">{next.label} →</span>
      </Link>
    </Sheet>
  );
}
