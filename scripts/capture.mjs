/**
 * Portfolio screenshot capture.
 *
 * Drives the preinstalled Chromium over each project and writes desktop +
 * mobile frames into public/work/<slug>/. Output is committed, so the site
 * build never depends on the network or on the sibling repos being checked out.
 *
 * Two sources:
 *   - `url`  — capture the deployed site directly.
 *   - `dir`  — serve a local directory and capture that. Used for projects
 *              whose domains this build environment cannot reach, and for
 *              anything where a controlled viewport beats a live capture.
 *
 * Chromium comes from the environment's provisioned build under
 * /opt/pw-browsers. The npm playwright package pins a browser revision that
 * may not match what is installed here, so we resolve the real binary at
 * runtime and pass it as executablePath rather than running
 * `playwright install` — downloading a second browser is both slow and
 * blocked in some sandboxes.
 *
 * Run: npm run capture
 */

import { createServer } from "node:http";
import { readFile, readdir, mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import sharp from "sharp";
import { routeThroughCurl } from "./lib/egress.mjs";

/**
 * Find the Chromium the environment actually provisioned, whatever revision
 * it happens to be. Prefers the full browser over the headless shell because
 * the headless shell has no GPU path, and The Aerial's map needs WebGL.
 */
async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;

  const entries = await readdir(base);
  const candidates = [
    // Full chromium first — WebGL-capable.
    ...entries
      .filter((e) => /^chromium-\d+$/.test(e))
      .map((e) => path.join(base, e, "chrome-linux", "chrome")),
    // Headless shell as a fallback.
    ...entries
      .filter((e) => /^chromium_headless_shell-\d+$/.test(e))
      .map((e) => path.join(base, e, "chrome-linux", "headless_shell")),
  ];

  return candidates.find((p) => existsSync(p));
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outRoot = path.join(root, "public", "work");
const siblings = path.resolve(root, "..");

const DESKTOP = { width: 1440, height: 900, scale: 2 };
const MOBILE = { width: 390, height: 844, scale: 3 };

/** Screenshot quality/size budget. */
const WEBP = { quality: 80, effort: 6 };

/**
 * Captures are taken at 2x for sharpness, then downsampled to these widths.
 * A card never renders wider than ~820 CSS px, so 1800 still covers 2x on the
 * largest display while keeping every frame comfortably under ~200 kB. A page
 * that sells performance cannot ship half-megabyte screenshots.
 */
const MAX_WIDTH = { desktop: 1800, mobile: 780 };

/** Mean channel standard deviation below this is treated as a blank capture. */
const BLANK_STDEV = 12;

const TARGETS = [
  {
    slug: "the-aerial",
    url: "https://theaerial.netlify.app",
    // The map needs real time to load terrain, imagery, and building
    // extrusions. Screenshotting early yields a black plate.
    settle: 14000,
  },
  {
    slug: "crane-island-bhhs",
    dir: path.join(siblings, "crane-island-bhhs"),
    settle: 3500,
  },
  {
    slug: "heymann-williams-coastal",
    dir: path.join(siblings, "heymann-williams-coastal", "dist"),
    spa: true,
    settle: 9000,
  },
  {
    slug: "sold-on-amelia-island",
    dir: path.join(siblings, "sold-on-amelia-island"),
    settle: 4000,
  },
  {
    slug: "ron-heymann-agent-page",
    dir: path.join(siblings, "ron-heymann-agent-page"),
    settle: 3500,
  },
];

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
};

/** Minimal static file server with optional SPA fallback. */
function serve(dir, { spa = false } = {}) {
  const server = createServer(async (req, res) => {
    try {
      const url = new URL(req.url, "http://localhost");
      let filePath = path.join(dir, decodeURIComponent(url.pathname));

      // Directory request -> index.html
      if (url.pathname.endsWith("/")) filePath = path.join(filePath, "index.html");

      if (!existsSync(filePath)) {
        const withHtml = `${filePath}.html`;
        if (existsSync(withHtml)) {
          filePath = withHtml;
        } else if (spa) {
          filePath = path.join(dir, "index.html");
        } else {
          res.writeHead(404).end("not found");
          return;
        }
      }

      const body = await readFile(filePath);
      res.writeHead(200, {
        "content-type": MIME[path.extname(filePath)] ?? "application/octet-stream",
        "cache-control": "no-store",
      });
      res.end(body);
    } catch (err) {
      res.writeHead(500).end(String(err));
    }
  });

  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () =>
      resolve({ server, origin: `http://127.0.0.1:${server.address().port}` })
    );
  });
}

/**
 * Quiet the page down before the shutter: stop looping animation, drop any
 * fixed cookie/consent bar, and force reduced motion so a mid-transition
 * frame can't be captured.
 */
async function settlePage(page) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
      [class*="cookie" i], [id*="cookie" i],
      [class*="consent" i], [id*="consent" i] { display: none !important; }
    `,
  });

  /*
   * Remove anything that failed to load. Third-party embeds — background
   * video, map frames — are unreachable from this build environment, and an
   * empty iframe renders as a white rectangle while a broken <img> renders
   * as a torn-page glyph. Both look like defects in the client's site rather
   * than limitations of the capture, so they are stripped and the section's
   * own background shows through instead.
   */
  await page.evaluate(() => {
    for (const img of document.querySelectorAll("img")) {
      if (!img.complete || img.naturalWidth === 0) img.style.display = "none";
    }
    for (const frame of document.querySelectorAll("iframe")) {
      let blank = true;
      try {
        // Same-origin frames expose a document; cross-origin ones throw,
        // and those are exactly the embeds that could not load here.
        blank = !frame.contentDocument?.body?.childElementCount;
      } catch {
        blank = false;
      }
      if (blank) frame.style.visibility = "hidden";
    }
  });
  /*
   * Nudge the scroll to trigger IntersectionObserver reveals, then return to
   * the top. `behavior: instant` is essential — several of these sites set
   * `scroll-behavior: smooth`, and an animated scroll-back leaves the page a
   * few dozen pixels down when the shutter fires, clipping the header.
   */
  await page.evaluate(async () => {
    document.documentElement.style.scrollBehavior = "auto";
    window.scrollTo({ top: 700, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 450));
    window.scrollTo({ top: 0, behavior: "instant" });
    await new Promise((r) => setTimeout(r, 450));
  });
}

async function shoot(browser, target, origin, profile, outFile) {
  const context = await browser.newContext({
    viewport: { width: profile.width, height: profile.height },
    deviceScaleFactor: profile.scale,
    isMobile: profile === MOBILE,
    hasTouch: profile === MOBILE,
    reducedMotion: "reduce",
    userAgent:
      profile === MOBILE
        ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1"
        : undefined,
  });
  const page = await context.newPage();
  await routeThroughCurl(page);

  try {
    await page.goto(origin, { waitUntil: "load", timeout: 60000 });
    await page.waitForTimeout(target.settle ?? 4000);
    await settlePage(page);

    const png = await page.screenshot({ type: "png" });

    /*
     * Guard against silently blank captures. If a CDN stylesheet or the map
     * tiles fail to load, the page still screenshots — it just comes out
     * empty, and an empty frame on a portfolio page is worse than none at
     * all. Channel standard deviation is a reliable blankness signal: a flat
     * or near-flat image sits near zero, real content sits well above it.
     */
    const stats = await sharp(png).stats();
    const stdev =
      stats.channels.reduce((sum, c) => sum + c.stdev, 0) / stats.channels.length;

    const label = path.basename(outFile);
    // Check BEFORE writing — a blank file left on disk would be committed and
    // shipped, which is exactly what this guard exists to prevent.
    if (stdev < BLANK_STDEV) {
      throw new Error(
        `${label} looks blank (stdev ${stdev.toFixed(1)}) — assets probably failed to load`
      );
    }

    const { data, info } = await sharp(png)
      .resize({
        width: MAX_WIDTH[profile === MOBILE ? "mobile" : "desktop"],
        withoutEnlargement: true,
      })
      .webp(WEBP)
      .toBuffer({ resolveWithObject: true });
    await writeFile(outFile, data);

    console.log(
      `  ✓ ${label}  ${(info.size / 1024).toFixed(0)} kB  (stdev ${stdev.toFixed(1)})`
    );
  } finally {
    await context.close();
  }
}

async function main() {
  const only = process.argv.slice(2);
  const targets = only.length
    ? TARGETS.filter((t) => only.includes(t.slug))
    : TARGETS;

  const executablePath = await resolveChromium();
  console.log(`chromium: ${executablePath ?? "playwright default"}`);

  /*
   * Outbound HTTPS in this environment goes through a local policy proxy.
   * Chromium does not read HTTPS_PROXY on its own, so without this every
   * remote request fails — including the CDN-hosted Tailwind and webfonts the
   * static projects depend on, which silently yields unstyled screenshots.
   * The proxy's CA is already in the browser NSS store, so TLS verification
   * stays fully on. Localhost is bypassed so the local static servers work.
   */
  const proxyServer = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  if (proxyServer) console.log(`proxy:    ${proxyServer}`);

  const browser = await chromium.launch({
    executablePath,
    proxy: proxyServer
      ? { server: proxyServer, bypass: "127.0.0.1,localhost" }
      : undefined,
    // swiftshader gives a software WebGL implementation, which the map-driven
    // projects need in order to render anything at all in a headless container.
    args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
  });
  const failures = [];

  for (const target of targets) {
    console.log(`\n${target.slug}`);
    let handle = null;
    let origin = target.url;

    try {
      if (target.dir) {
        if (!existsSync(target.dir)) {
          throw new Error(`missing directory: ${target.dir}`);
        }
        handle = await serve(target.dir, { spa: target.spa });
        origin = handle.origin;
      }

      const outDir = path.join(outRoot, target.slug);
      await mkdir(outDir, { recursive: true });

      await shoot(browser, target, origin, DESKTOP, path.join(outDir, "desktop.webp"));
      await shoot(browser, target, origin, MOBILE, path.join(outDir, "mobile.webp"));
    } catch (err) {
      console.error(`  ✗ ${target.slug}: ${err.message}`);
      failures.push({ slug: target.slug, error: err.message });
    } finally {
      handle?.server.close();
    }
  }

  await browser.close();

  // Leave a machine-readable record of what actually got captured, so the
  // build can tell a real screenshot from a missing one.
  await writeFile(
    path.join(outRoot, "manifest.json"),
    JSON.stringify(
      { capturedAt: new Date().toISOString(), failures },
      null,
      2
    ) + "\n"
  );

  if (failures.length) {
    console.error(`\n${failures.length} target(s) failed.`);
    process.exitCode = 1;
  } else {
    console.log(`\nAll ${targets.length} target(s) captured.`);
  }
}

main();
