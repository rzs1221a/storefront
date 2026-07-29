import { useId, useState } from "react";
import type { WorkItem } from "../lib/work";
import BrowserFrame from "./BrowserFrame";

/**
 * One portfolio case study. The screenshot leads, the claim follows, and the
 * technical detail is available but folded away — an agent skimming should get
 * the point from the image and the one-liner alone.
 */
export default function WorkCard({
  item,
  index,
}: {
  item: WorkItem;
  index: number;
}) {
  const [open, setOpen] = useState(false);
  const detailId = useId();

  // Alternate the image side on desktop so the grid does not read as a list.
  const flip = index % 2 === 1;

  return (
    <article
      data-reveal-item
      className="grid items-center gap-8 lg:grid-cols-12 lg:gap-14"
    >
      {/* Screenshot. The phone frame overlapping the corner is not decoration
          — every one of these sites gets most of its traffic on mobile, and
          showing both captures proves the responsive work in one glance. */}
      <div className={`relative lg:col-span-7 ${flip ? "lg:order-2" : ""}`}>
        <BrowserFrame url={item.liveUrl?.replace(/^https:\/\//, "")}>
          <picture>
            {/* Phones get the phone capture — a desktop screenshot scaled to
                360px is unreadable, which would undercut the whole section. */}
            <source media="(max-width: 640px)" srcSet={item.mobile} />
            <img
              src={item.desktop}
              alt={`The ${item.name} website — ${item.kind.toLowerCase()}`}
              width={1440}
              height={900}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="block w-full"
            />
          </picture>
        </BrowserFrame>

        <div
          aria-hidden="true"
          className="absolute -bottom-6 right-5 hidden w-[104px] overflow-hidden rounded-[16px] border border-[--line-strong] bg-[--color-plate-high] shadow-[var(--shadow-deep)] lg:block"
        >
          <img
            src={item.mobile}
            alt=""
            width={390}
            height={844}
            loading="lazy"
            decoding="async"
            className="block w-full"
          />
        </div>
      </div>

      {/* Copy */}
      <div className={`lg:col-span-5 ${flip ? "lg:order-1" : ""}`}>
        <div className="flex flex-wrap items-center gap-3">
          <span className="mono-label">{item.kind}</span>
          {item.liveUrl && (
            <span className="flex items-center gap-1.5">
              <span className="live-dot" />
              <span className="font-mono text-[11px] uppercase tracking-[0.1em] text-[--color-signal]">
                Live
              </span>
            </span>
          )}
        </div>

        <h3 className="headline mt-3">{item.name}</h3>

        <p className="lede mt-4">{item.summary}</p>

        {/* Stack + scale. Mono type marks these as measured facts. */}
        <div className="mt-6 flex flex-wrap items-center gap-x-2 gap-y-2">
          {item.stack.map((tech) => (
            <span
              key={tech}
              className="rounded-full border border-[--line] bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-[--color-ink-muted]"
            >
              {tech}
            </span>
          ))}
        </div>

        <p className="mt-5 font-mono text-xs text-[--color-ink-faint]">
          {item.loc.toLocaleString("en-US")} lines of source
        </p>

        {/* Expandable detail */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={detailId}
          className="btn btn-ghost btn-sm mt-6"
        >
          {open ? "Less detail" : "What it does"}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
            className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>

        <div
          id={detailId}
          hidden={!open}
          className="mt-5 border-l border-[--line-strong] pl-5"
        >
          <p className="text-[0.9375rem] leading-relaxed text-[--color-ink-soft]">
            {item.detail}
          </p>
          <ul className="mt-4 space-y-2">
            {item.highlights.map((h) => (
              <li
                key={h}
                className="flex gap-2.5 text-[0.875rem] leading-relaxed text-[--color-ink-soft]"
              >
                <span
                  aria-hidden="true"
                  className="mt-[0.5em] h-1 w-1 flex-none rounded-full bg-[--color-signal]"
                />
                {h}
              </li>
            ))}
          </ul>
        </div>

        {item.liveUrl && (
          <p className="mt-6">
            <a
              href={item.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[32px] items-center gap-1.5 text-sm text-[--color-ink] underline decoration-[--line-strong] underline-offset-4 transition-colors hover:decoration-[--color-signal]"
            >
              Visit the live site
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M3.5 8.5L8.5 3.5M8.5 3.5H4.5M8.5 3.5V7.5"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </p>
        )}
      </div>
    </article>
  );
}
