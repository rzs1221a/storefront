import { useState, type ReactNode } from "react";

/**
 * A portfolio screenshot in minimal browser chrome — and, where the site
 * allows framing, the actual running site.
 *
 * This is the most persuasive thing the storefront can do. An agent does not
 * read that The Aerial is a living 3D map; they press a button and fly it,
 * inside the case study, without leaving.
 *
 * Click-to-load, never automatic. The Aerial is a full deck.gl application and
 * mounting several unasked would wreck the page. The screenshot stays as the
 * poster until asked, so the sheet is complete either way.
 *
 * Only sites verified to permit framing get the control — neither public
 * project sets X-Frame-Options or a CSP frame-ancestors. If either ever does,
 * the iframe will refuse to paint; `onError` and the retained poster mean that
 * degrades to the screenshot rather than to a broken white box.
 */
export default function BrowserFrame({
  url,
  /** Full URL to run inside the frame. Omit and no live control appears. */
  liveUrl,
  children,
  className = "",
}: {
  url?: string;
  liveUrl?: string;
  children: ReactNode;
  className?: string;
}) {
  const [live, setLive] = useState(false);
  const [failed, setFailed] = useState(false);
  const showLive = live && !failed;

  return (
    <figure className={`browser-frame ${className}`}>
      <div className="browser-bar">
        <span className="browser-dot" aria-hidden="true" />
        <span className="browser-dot" aria-hidden="true" />
        <span className="browser-dot" aria-hidden="true" />
        {url && (
          <span className="ml-3 truncate font-mono text-micro text-(--color-ink-faint)">
            {url}
          </span>
        )}

        {liveUrl && !failed && (
          <button
            type="button"
            onClick={() => setLive((v) => !v)}
            className="browser-live"
          >
            {showLive ? (
              "Show the still"
            ) : (
              <>
                <span className="live-dot" aria-hidden="true" />
                Run it live
              </>
            )}
          </button>
        )}
      </div>

      {showLive ? (
        <div className="browser-live-stage">
          <iframe
            src={liveUrl}
            title={`${url ?? "Live site"} — running`}
            loading="lazy"
            referrerPolicy="no-referrer"
            // Enough to run the site, nothing more. No top-navigation, so an
            // embedded page cannot redirect the storefront out from under the
            // visitor; no downloads, no popups.
            sandbox="allow-scripts allow-same-origin allow-forms"
            onError={() => setFailed(true)}
            className="browser-iframe"
          />
        </div>
      ) : (
        children
      )}
    </figure>
  );
}
