import { type ReactNode, useEffect, useRef, useState } from "react";
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
  /** The local nav's action; defaults to starting a project. */
  cta = { label: "Start a project", to: "/contact" },
}: {
  title: string;
  eyebrow?: string;
  datum?: ReactNode;
  children: ReactNode;
  backTo?: string;
  backLabel?: string;
  wide?: boolean;
  cta?: { label: string; to: string };
}) {
  const headingRef = useRef<HTMLHeadingElement>(null);
  const headRef = useRef<HTMLElement | null>(null);
  const [pastHead, setPastHead] = useState(false);

  useEffect(() => {
    // The heading takes focus so a screen reader announces what opened.
    // (Shell resets scroll position on navigation.)
    headingRef.current?.focus();
  }, []);

  /* The local nav pins once the page head has scrolled away — the
     product sub-nav pattern: name on the left, one action on the right. */
  useEffect(() => {
    const head = headRef.current;
    if (!head || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      ([entry]) => setPastHead(!entry.isIntersecting),
      { rootMargin: "-48px 0px 0px 0px" }
    );
    observer.observe(head);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="page" id="sheet" data-act-theme="light">
      <div className={`local-nav${pastHead ? " is-pinned" : ""}`} aria-hidden={!pastHead}>
        <p className="local-nav-title">{title}</p>
        <Link to={cta.to} className="btn btn-primary local-nav-cta" tabIndex={pastHead ? 0 : -1}>
          {cta.label}
        </Link>
      </div>

      <article className={`page-panel${wide ? " is-wide" : ""}`}>
        <header className="page-head" ref={headRef}>
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
