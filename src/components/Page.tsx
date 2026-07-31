import { type ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * A storefront page: an opaque glass article over the living map.
 *
 * This replaced the Sheet when the site inverted from "a map with a
 * storefront on it" to "a storefront with a map behind it." The document
 * scrolls now — the article is simply content in flow — and each page opens
 * with a chart window: a tall transparent band above the panel where the map
 * shows through, already flown to this destination's mark by the route
 * effect in Shell. You see the place, then you read about it.
 */
export default function Page({
  title,
  eyebrow,
  datum,
  children,
  /** Back link target and label, e.g. /work — rendered above the title. */
  backTo,
  backLabel,
  /** Wide article for side-by-side content (packages grid, capabilities). */
  wide = false,
  /** Shrink the chart window for pages that are argument, not place. */
  shortWindow = false,
}: {
  title: string;
  eyebrow?: string;
  datum?: ReactNode;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  wide?: boolean;
  shortWindow?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // A new page starts at its top — the browser keeps scroll position on
    // SPA navigations otherwise — and the heading takes focus so a screen
    // reader announces what opened.
    window.scrollTo({ top: 0, behavior: "auto" });
    headingRef.current?.focus();
  }, []);

  return (
    <div className="page" id="sheet">
      <div
        className={`chart-window${shortWindow ? " is-short" : ""}`}
        aria-hidden="true"
      />
      <article className={`page-panel panel${wide ? " is-wide" : ""}`}>
        <header className="page-head">
          {backTo && (
            <Link to={backTo} className="page-back mono-label">
              ← {backLabel ?? "Back"}
            </Link>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-3xl font-medium tracking-[-0.006em] outline-none sm:text-4xl"
          >
            {title}
          </h1>
          {datum}
        </header>
        <div className="page-body">{children}</div>
      </article>
    </div>
  );
}
