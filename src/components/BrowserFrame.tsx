import type { ReactNode } from "react";

/**
 * Wraps a portfolio screenshot in minimal browser chrome. The point is
 * credibility: a bare image reads as a mockup, the same image inside a window
 * with a URL reads as a site that actually shipped.
 *
 * The chrome is decorative and hidden from assistive technology; the meaning
 * lives in the image's alt text and the surrounding copy.
 */
export default function BrowserFrame({
  url,
  children,
  className = "",
}: {
  /** Displayed in the fake address bar. Omit for local-only captures. */
  url?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`browser-frame ${className}`}>
      <div className="browser-bar" aria-hidden="true">
        <span className="browser-dot" />
        <span className="browser-dot" />
        <span className="browser-dot" />
        {url && (
          <span className="ml-3 truncate font-mono text-[11px] text-(--color-ink-faint)">
            {url}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}
