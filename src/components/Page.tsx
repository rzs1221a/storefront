import { type ReactNode, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

/**
 * A detail page, in daylight.
 *
 * The home page is the film — dark theatre, one exhibit. Detail routes are
 * the reading room: paper register by default ([data-act-theme="light"]),
 * a generous head, one measured column. No chart window, no glass — the
 * drama budget was spent on the home page on purpose, so that a visitor
 * who has arrived at a case study or the pricing table gets stillness and
 * legibility instead of another performance.
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
}: {
  title: string;
  eyebrow?: string;
  datum?: ReactNode;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  wide?: boolean;
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    // The heading takes focus so a screen reader announces what opened.
    // (Shell resets scroll position on navigation.)
    headingRef.current?.focus();
  }, []);

  return (
    <div className="page" id="sheet" data-act-theme="light">
      <article className={`page-panel${wide ? " is-wide" : ""}`}>
        <header className="page-head">
          {backTo && (
            <Link to={backTo} className="page-back mono-label">
              ← {backLabel ?? "Back"}
            </Link>
          )}
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1 ref={headingRef} tabIndex={-1} className="page-title outline-none">
            {title}
          </h1>
          {datum}
        </header>
        <div className="page-body">{children}</div>
      </article>
    </div>
  );
}
