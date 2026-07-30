import { useEffect, useRef, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { useSheetDrag } from "../lib/useSheetDrag";

/**
 * The glass sheet that carries a destination's content.
 *
 * Desktop: a panel held against the right edge, so the camera keeps the left
 * two-thirds of the coast visible behind it. Mobile: a bottom sheet that
 * dismisses with a downward swipe (see lib/useSheetDrag.ts — the drag only
 * starts when the sheet is already scrolled to its top, so it never fights the
 * sheet's own scrolling).
 *
 * The sheet scrolls internally. The document never scrolls at all, which is
 * the whole point of the redesign.
 *
 * Focus moves into the sheet on open and returns to whatever opened it on
 * close, because on this site a sheet IS the page — losing focus to the body
 * would strand a keyboard visitor on a map they cannot see.
 */
export default function Sheet({
  title,
  eyebrow,
  children,
  /**
   * Widen the sheet on desktop. For the two destinations that compare things
   * side by side — the packages grid and the capability showcase — where a
   * narrow column would force a buyer to hold one card in memory while
   * reading the next. The map still shows through beside it.
   */
  wide = false,
  /**
   * Where Escape and the close control go. Detail sheets pass their index —
   * a case study closes to /work, an option to /options — so Escape rises
   * exactly one level instead of dropping the visitor back on the coast from
   * three levels deep. Index sheets keep the default and close to the coast.
   */
  escapeTo = "/",
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
  wide?: boolean;
  escapeTo?: string;
}) {
  const navigate = useNavigate();
  const headingRef = useRef<HTMLHeadingElement>(null);
  const openerRef = useRef<Element | null>(null);

  const close = () => navigate(escapeTo);

  /*
   * The hook reads `scrollTop` from the element it is attached to and
   * translates that same element, so the sheet root must be the scroller —
   * dragging an inner body would slide the content out from under a header
   * that stayed put. The header is sticky inside it instead.
   */
  const sheetRef = useSheetDrag(true, close);

  useEffect(() => {
    openerRef.current = document.activeElement;
    // Focus the heading rather than the close button: a screen reader then
    // announces what just opened instead of "close".
    headingRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("keydown", onKey);
      const opener = openerRef.current;
      if (opener instanceof HTMLElement && document.contains(opener)) {
        opener.focus();
      }
    };
    // Mount/unmount only — a sheet is replaced wholesale on navigation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <aside
      ref={sheetRef}
      className={`sheet panel${wide ? " is-wide" : ""}`}
      aria-label={title}
    >
      <div className="sheet-grip" aria-hidden="true" />

      <header className="sheet-head">
        <div className="min-w-0">
          {eyebrow && <p className="eyebrow">{eyebrow}</p>}
          <h1
            ref={headingRef}
            tabIndex={-1}
            className="mt-2 text-2xl font-medium tracking-[-0.028em] outline-none sm:text-3xl"
          >
            {title}
          </h1>
        </div>

        <button
          type="button"
          onClick={close}
          className="sheet-close"
          aria-label={
            escapeTo === "/"
              ? "Close and return to the coast"
              : `Close and return to ${escapeTo === "/work" ? "the case studies" : "the catalog"}`
          }
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M4 4L12 12M12 4L4 12"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </header>

      <div className="sheet-body">{children}</div>
    </aside>
  );
}
