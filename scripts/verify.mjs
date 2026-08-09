/**
 * Verification pass over the built site.
 *
 * The site is a storefront over a living map, so this checks what that shape
 * can get wrong: horizontal overflow (the document scrolls vertically by
 * design, never sideways), a route that renders nothing, prerendered HTML
 * that lost its content, text that stops being legible when the camera moves
 * under it, and chrome that cannot be reached from a keyboard.
 *
 * Run: tsx scripts/verify.mjs [origin] [--quick]
 *
 * --quick runs every route at mobile + desktop only, with the full viewport
 * matrix on a representative sample. The default remains exhaustive — use
 * quick for iteration, exhaustive before shipping.
 */

import { mkdir, writeFile, readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { routeThroughCurl } from "./lib/egress.mjs";
import { DESTINATIONS } from "../src/lib/destinations.ts";
import { BRAND } from "../src/lib/brand.ts";

const args = process.argv.slice(2).filter((a) => a !== "--quick");
const QUICK = process.argv.includes("--quick");
const ORIGIN = args[0] || "http://127.0.0.1:4319";
const OUT = process.env.VERIFY_OUT || "/tmp/storefront-verify";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

/**
 * Every route, with a phrase that must appear once it has rendered — derived
 * from the route table itself, so a destination added there is verified here
 * without anyone remembering to update a second list. The phrase lives on the
 * destination (`verifyPhrase`), falling back to its title.
 */
const ROUTES = DESTINATIONS.map((d) => ({
  path: d.path,
  expect: d.verifyPhrase ?? d.title,
}));

/** The quick sample: home, one shipped case study, and one of each group. */
const QUICK_SAMPLE = new Set(
  [
    "/",
    DESTINATIONS.find((d) => d.group === "work")?.path,
    DESTINATIONS.find((d) => d.group === "catalog")?.path,
    "/packages",
  ].filter(Boolean)
);

const problems = [];
const note = (scope, msg) => problems.push(`[${scope}] ${msg}`);

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

/** Dismiss the opening overlay so it never covers what is being measured. */
async function skipOpening(page) {
  await page.evaluate(() => {
    try {
      sessionStorage.setItem("seamark:opened", "1");
    } catch {
      /* ignore */
    }
  });
}

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: await resolveChromium(),
    args: ["--use-gl=swiftshader", "--enable-unsafe-swiftshader"],
  });

  /* ── Every route renders, at every breakpoint ───────────────────────── */
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.name === "mobile",
      hasTouch: vp.name === "mobile",
    });
    const page = await context.newPage();
    await routeThroughCurl(page);

    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      if (m.text().startsWith("Failed to load resource")) return;
      consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    const requestFailures = new Set();
    page.on("requestfailed", (req) => {
      const reason = req.failure()?.errorText ?? "unknown";
      // A camera that flies cancels tiles for viewports it has left; that is
      // MapLibre working correctly, not a fault.
      if (reason === "net::ERR_ABORTED") return;
      requestFailures.add(`${reason} — ${req.url().slice(0, 90)}`);
    });

    await page.goto(ORIGIN, { waitUntil: "domcontentloaded", timeout: 45000 });
    await skipOpening(page);

    // Quick mode keeps the full route list on the two viewports that matter
    // most and samples the rest of the matrix.
    const routes =
      QUICK && vp.name !== "mobile" && vp.name !== "desktop"
        ? ROUTES.filter((r) => QUICK_SAMPLE.has(r.path))
        : ROUTES;

    for (const route of routes) {
      await page.goto(`${ORIGIN}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      await page.waitForTimeout(900);

      const state = await page.evaluate((phrase) => {
        const doc = document.documentElement;
        return {
          // Vertical scroll is the design now; sideways scroll is still a bug.
          hScroll: doc.scrollWidth > doc.clientWidth + 1,
          hasPhrase: document.body.innerText.includes(phrase),
          // Every route must actually have content in flow — a page whose
          // body is shorter than half the viewport almost certainly failed
          // to mount its article.
          hasFlow: doc.scrollHeight > doc.clientHeight * 0.5,
        };
      }, route.expect);

      const scope = `${vp.name} ${route.path}`;
      if (state.hScroll) note(scope, "horizontal overflow");
      if (!state.hasPhrase) {
        note(scope, `route did not render its content (looked for "${route.expect}")`);
      }
      if (!state.hasFlow) note(scope, "page rendered almost no content in flow");
    }

    /* Screenshot two representative routes per breakpoint. */
    for (const p of ["/", "/work/crane-island-bhhs"]) {
      await page.goto(`${ORIGIN}${p}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(vp.name === "mobile" ? 2500 : 4000);
      const name = p === "/" ? "coast" : "work";
      await page.screenshot({ path: path.join(OUT, `${vp.name}-${name}.png`) });
    }

    consoleErrors.forEach((e) => note(vp.name, `console error: ${e.slice(0, 140)}`));
    requestFailures.forEach((f) => note(vp.name, `request failed: ${f}`));
    await context.close();
  }

  /* ── Text contrast over the live camera ────────────────────────────── */
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    await routeThroughCurl(page);
    await page.goto(ORIGIN, { waitUntil: "domcontentloaded" });
    await skipOpening(page);

    // Several camera positions: the background is whatever the map is framing,
    // so one sample proves nothing. Scrolled passes cover the states the top
    // of a page never shows — the demonstration band with its thinned tint,
    // and the inverted close.
    const CONTRAST_PASSES = [
      { route: "/" },
      { route: "/", scrollTo: '[data-act="proof"]' },
      { route: "/", scrollTo: '[data-act="engine"]' },
      { route: "/", scrollTo: '[data-act="offer"]' },
      { route: "/", scrollTo: '[data-act="close"]' },
      { route: "/work/crane-island-bhhs" },
      { route: "/packages" },
      { route: "/contact" },
    ];
    for (const pass of CONTRAST_PASSES) {
      const route = pass.route;
      await page.goto(`${ORIGIN}${route}`, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(4500);
      if (pass.scrollTo) {
        await page.evaluate((sel) => {
          document
            .querySelector(sel)
            ?.scrollIntoView({ behavior: "instant", block: "start" });
        }, pass.scrollTo);
        // Let the tint transition and any stage observers settle.
        await page.waitForTimeout(1600);
      }

      const samples = await page.evaluate(() => {
        const srgb = (c) => {
          const v = c / 255;
          return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        };
        const lum = (r, g, b) =>
          0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
        const parse = (str) => {
          const m = str.match(/rgba?\(([^)]+)\)/);
          if (!m) return null;
          const [r, g, b] = m[1].split(",").map(Number);
          return lum(r, g, b);
        };

        // Text scrolled out of its own container (the rail and the sheets
        // scroll internally) is not visible — sampling the map behind it
        // measures nothing a visitor can see.
        const clippedByScroller = (el, r) => {
          for (let a = el.parentElement; a; a = a.parentElement) {
            const s = getComputedStyle(a);
            if (s.overflowY !== "auto" && s.overflowY !== "scroll") continue;
            const box = a.getBoundingClientRect();
            const cy = r.top + r.height / 2;
            if (cy < box.top || cy > box.bottom) return true;
          }
          return false;
        };

        const out = [];
        for (const el of document.querySelectorAll(
          "p.lede, .mono-label, .head-link, .act-lede, .store-band-lede, h1, h2, .category-name, .tier-name, .hero-sub, .stage-caption"
        )) {
          const r = el.getBoundingClientRect();
          if (r.width < 8 || r.height < 8) continue;
          if (r.bottom < 0 || r.top > window.innerHeight) continue;
          if (clippedByScroller(el, r)) continue;
          // Closed <details> content keeps geometry under Chrome's
          // content-visibility implementation but is never painted —
          // checkVisibility is the only honest test.
          if (typeof el.checkVisibility === "function" && !el.checkVisibility())
            continue;
          const fg = parse(getComputedStyle(el).color);
          if (fg === null) continue;
          out.push({
            text: el.textContent.trim().slice(0, 26),
            fg,
            x: Math.round(r.left + r.width / 2),
            y: Math.round(r.top + r.height / 2),
          });
        }
        return out.slice(0, 26);
      });

      // A sampler that silently finds nothing is worse than no sampler: a
      // renamed class would pass every pass forever. Each pass must land a
      // real minimum of measurements or the run fails.
      if (samples.length < 5) {
        note(
          `contrast ${route}${pass.scrollTo ? ` @ ${pass.scrollTo}` : ""}`,
          `only ${samples.length} sample(s) — selectors have drifted from the markup`
        );
        continue;
      }

      // Mask every glyph, so the sample reads the true surface behind the text
      // rather than a neighbouring letterform.
      const mask = await page.addStyleTag({
        content: `*, *::before, *::after {
          color: transparent !important;
          text-shadow: none !important;
        }`,
      });
      const shot = await page.screenshot({ type: "png" });
      await mask.evaluate((n) => n.remove());

      const { default: sharp } = await import("sharp");
      const img = sharp(shot);
      const meta = await img.metadata();
      const raw = await img.raw().toBuffer();
      const scale = meta.width / 1440;
      const ch = meta.channels;
      const srgb = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };

      for (const s of samples) {
        const px = Math.round(s.x * scale);
        const py = Math.round(s.y * scale);
        let sum = 0;
        let n = 0;
        for (let dy = -5; dy <= 5; dy += 2) {
          for (let dx = -16; dx <= 16; dx += 2) {
            const X = px + dx;
            const Y = py + dy;
            if (X < 0 || Y < 0 || X >= meta.width || Y >= meta.height) continue;
            const i = (Y * meta.width + X) * ch;
            sum +=
              0.2126 * srgb(raw[i]) +
              0.7152 * srgb(raw[i + 1]) +
              0.0722 * srgb(raw[i + 2]);
            n++;
          }
        }
        if (!n) continue;
        const bg = sum / n;
        const cr = (Math.max(s.fg, bg) + 0.05) / (Math.min(s.fg, bg) + 0.05);
        if (cr < 4.5) {
          note(
            `contrast ${route}${pass.scrollTo ? ` @ ${pass.scrollTo}` : ""}`,
            `${cr.toFixed(2)}:1 (needs 4.5) — "${s.text}"`
          );
        }
      }
    }
    await context.close();
  }

  /* ── Prerendered HTML carries real content ─────────────────────────── */
  {
    // JavaScript disabled: this is exactly what a crawler without a renderer
    // sees, and it is what protects the lead flow.
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await routeThroughCurl(page);

    for (const route of ROUTES) {
      await page.goto(`${ORIGIN}${route.path}`, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
      });
      const text = await page.evaluate(() => document.body.innerText);
      const title = await page.title();

      if (text.trim().length < 120) {
        note("no-js", `${route.path} has almost no crawlable text`);
      }
      if (!title || title === BRAND.name) {
        note("no-js", `${route.path} has no page-specific <title> (got "${title}")`);
      }
      const canonical = await page.getAttribute('link[rel="canonical"]', "href");
      if (!canonical || !canonical.endsWith(route.path.replace(/\/$/, "") || "/")) {
        note("no-js", `${route.path} canonical is wrong or missing (${canonical})`);
      }
    }
    await context.close();
  }

  /* ── Keyboard reachability ─────────────────────────────────────────── */
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await routeThroughCurl(page);
    await page.goto(`${ORIGIN}/packages`, { waitUntil: "domcontentloaded" });
    await skipOpening(page);
    await page.goto(`${ORIGIN}/packages`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1200);

    // Tab through and confirm the masthead navigation is reachable.
    const reached = new Set();
    for (let i = 0; i < 40; i++) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el) return null;
        return el.getAttribute("aria-label") || el.textContent?.trim().slice(0, 30);
      });
      if (info) reached.add(info);
    }
    if (![...reached].some((r) => r === "Packages" || r === "Work & case studies")) {
      note("keyboard", "masthead destinations are not reachable by Tab");
    }
    if (![...reached].some((r) => r?.includes("consultation"))) {
      note("keyboard", "the consultation CTA is not reachable by Tab");
    }
    await context.close();
  }

  /* ── Reduced motion ────────────────────────────────────────────────── */
  {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      reducedMotion: "reduce",
    });
    const page = await context.newPage();
    await routeThroughCurl(page);
    await page.goto(`${ORIGIN}/capabilities`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(1500);
    const visible = await page.evaluate(() => {
      const s = document.querySelector(".page-panel, .storefront-home");
      return s ? Number(getComputedStyle(s).opacity) : 0;
    });
    if (visible < 0.9) {
      note("reduced-motion", "page content is not fully visible with animation disabled");
    }
    await page.screenshot({ path: path.join(OUT, "reduced-motion.png") });
    await context.close();
  }

  await browser.close();

  const report = problems.length
    ? problems.map((p) => `  ✗ ${p}`).join("\n")
    : "  ✓ no problems found";
  console.log(`\nVerification — ${ORIGIN}\n${report}\n\nScreenshots: ${OUT}`);
  await writeFile(path.join(OUT, "report.txt"), problems.join("\n") + "\n");

  if (problems.length) process.exitCode = 1;
}

main();
