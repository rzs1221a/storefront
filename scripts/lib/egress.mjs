/**
 * Shared egress shim for the headless-browser scripts.
 *
 * This environment's proxy only accepts CONNECT-tunnelled traffic. Chromium
 * does not negotiate it, so every external request comes back
 * ERR_CONNECTION_RESET — and it fails *silently*: CDN stylesheets never
 * arrive, map tiles never arrive, and you get a plausible-looking blank page.
 *
 * curl traverses the proxy correctly, so requests are intercepted and served
 * through it. TLS verification stays on throughout — curl uses the CA bundle
 * the environment already configured.
 *
 * Used by both capture.mjs (portfolio screenshots) and verify.mjs (so the
 * audit sees the same page a real visitor would, satellite background included).
 */

import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

/** Hosts never fetched — telemetry only slows these runs down. */
const BLOCKED = [
  /google-analytics\.com/,
  /googletagmanager\.com/,
  /doubleclick\.net/,
  /clients2\.google\.com/,
  /facebook\.(com|net)/,
  /hotjar\.com/,
];

const cache = new Map();

/** Fetch through curl, returning status, content type, and body. Cached. */
async function curlFetch(url) {
  if (cache.has(url)) return cache.get(url);

  const promise = (async () => {
    const { stdout } = await execFileAsync(
      "curl",
      [
        "-sSL",
        "--max-time", "25",
        "--write-out", "\\n__META__%{http_code}\\t%{content_type}",
        "--output", "-",
        url,
      ],
      { maxBuffer: 64 * 1024 * 1024, encoding: "buffer" }
    );

    const buf = Buffer.from(stdout);
    const marker = Buffer.from("\n__META__");
    const at = buf.lastIndexOf(marker);
    if (at === -1) return { status: 200, contentType: "", body: buf };

    const [status, contentType = ""] = buf
      .subarray(at + marker.length)
      .toString("utf8")
      .split("\t");

    return {
      status: Number(status) || 200,
      contentType: contentType.trim(),
      body: buf.subarray(0, at),
    };
  })();

  cache.set(url, promise);
  return promise;
}

/** Install the curl-backed router on a page. Localhost passes straight through. */
export async function routeThroughCurl(page) {
  await page.route("**/*", async (route) => {
    const url = route.request().url();

    if (url.startsWith("http://127.0.0.1") || url.startsWith("http://localhost")) {
      return route.continue();
    }
    if (!/^https?:\/\//.test(url) || BLOCKED.some((re) => re.test(url))) {
      return route.abort();
    }

    try {
      const { status, contentType, body } = await curlFetch(url);

      /*
       * Never fulfill an error response. These pages embed third-party
       * iframes; when one returns a 403 or a bot-challenge page, the iframe
       * happily renders that HTML — which is how "We couldn't verify the
       * security of your connection" ended up printed across a portfolio
       * screenshot. Aborting leaves the frame blank instead.
       */
      if (status >= 400) return route.abort();

      await route.fulfill({
        status,
        contentType: contentType || undefined,
        body,
        headers: { "access-control-allow-origin": "*" },
      });
    } catch {
      // One failed asset should never abort a whole run; the blankness guard
      // downstream catches the case where it actually mattered.
      await route.abort();
    }
  });
}
