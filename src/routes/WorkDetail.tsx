import { Link, Navigate, useParams } from "react-router-dom";
import { WORK } from "../lib/work";
import { WORK_DESTINATIONS } from "../lib/destinations";
import Sheet from "../components/Sheet";
import BrowserFrame from "../components/BrowserFrame";

/**
 * One project, as a destination. The camera has already descended to this
 * project's real coordinate by the time the sheet opens — see Shell and
 * lib/cameraFrames.
 *
 * All copy here is unchanged from the scrolling build; it was accurate and
 * specific, and none of it needed rewriting to fit a new frame.
 */
export default function WorkDetail() {
  const { slug } = useParams();
  const item = WORK.find((w) => w.slug === slug);
  const index = WORK.findIndex((w) => w.slug === slug);

  // An unknown slug is a genuine 404 rather than an empty sheet; send it home.
  if (!item) return <Navigate to="/" replace />;

  const next = WORK_DESTINATIONS[(index + 1) % WORK_DESTINATIONS.length];

  return (
    <Sheet eyebrow={item.kind} title={item.name}>
      <BrowserFrame url={item.liveUrl?.replace(/^https:\/\//, "")}>
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

      <p className="lede mt-6">{item.summary}</p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {item.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-full border border-(--line) bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-(--color-ink-muted)"
          >
            {tech}
          </span>
        ))}
      </div>

      <p className="mt-4 font-mono text-xs text-(--color-ink-faint)">
        {item.loc.toLocaleString("en-US")} lines of source
      </p>

      <p className="mt-6 text-[0.9375rem] leading-relaxed text-(--color-ink-soft)">
        {item.detail}
      </p>

      <ul className="mt-6 space-y-2.5 border-t border-(--line) pt-6">
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

      <div className="mt-8 flex flex-wrap items-center gap-3 border-t border-(--line) pt-6">
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
        <Link to="/contact" className="btn btn-primary btn-sm">
          Get something like this
        </Link>
      </div>

      {/* Somewhere to go next, so a sheet is never a dead end. */}
      <Link
        to={next.path}
        className="mt-8 flex items-center justify-between gap-4 border-t border-(--line) pt-6 text-sm transition-colors hover:text-(--color-ink)"
      >
        <span className="mono-label">Next</span>
        <span className="text-(--color-ink-soft)">{next.label} →</span>
      </Link>
    </Sheet>
  );
}
