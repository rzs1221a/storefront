/**
 * Verification pass over the built site.
 *
 * Checks the things that actually break a marketing page and are easy to miss
 * by eye: horizontal overflow at real breakpoints, images that failed to
 * load, missing alt text, low-contrast body text, unlabeled form controls,
 * and whether the page is still readable with animation disabled.
 *
 * Also writes reference screenshots to scratch for a visual once-over.
 *
 * Run: node scripts/verify.mjs [origin]
 */

import { mkdir, writeFile } from "node:fs/promises";
import { readdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { routeThroughCurl } from "./lib/egress.mjs";

const ORIGIN = process.argv[2] || "http://127.0.0.1:4319";
const OUT = process.env.VERIFY_OUT || "/tmp/storefront-verify";

const VIEWPORTS = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 },
  { name: "wide", width: 1920, height: 1080 },
];

async function resolveChromium() {
  const base = process.env.PLAYWRIGHT_BROWSERS_PATH || "/opt/pw-browsers";
  if (!existsSync(base)) return undefined;
  const entries = await readdir(base);
  const found = entries.find((e) => /^chromium-\d+$/.test(e));
  return found ? path.join(base, found, "chrome-linux", "chrome") : undefined;
}

const problems = [];
const note = (v, msg) => problems.push(`[${v}] ${msg}`);

async function main() {
  await mkdir(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: await resolveChromium() });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      deviceScaleFactor: 2,
      isMobile: vp.name === "mobile",
      hasTouch: vp.name === "mobile",
    });
    const page = await context.newPage();
    // Route external requests through curl so the audit sees the real
    // page — satellite background included — rather than a stripped one.
    await routeThroughCurl(page);

    const consoleErrors = [];
    page.on("console", (m) => {
      if (m.type() !== "error") return;
      /*
       * Resource-level failures are covered properly below via `requestfailed`,
       * which reports the URL and the reason. The console version carries
       * neither, so keeping both means every aborted map tile is reported twice
       * with no way to tell it from a real fault.
       */
      if (m.text().startsWith("Failed to load resource")) return;
      consoleErrors.push(m.text());
    });
    page.on("pageerror", (e) => consoleErrors.push(String(e)));

    /*
     * A camera that flies cancels tile requests for viewports it has already
     * left — that is MapLibre working correctly, not a defect, and it produces
     * dozens of ERR_ABORTED entries per scroll. Anything else that fails to
     * load is a genuine problem and still reported.
     */
    const requestFailures = new Set();
    page.on("requestfailed", (req) => {
      const reason = req.failure()?.errorText ?? "unknown";
      if (reason === "net::ERR_ABORTED") return;
      requestFailures.add(`${reason} — ${req.url().slice(0, 90)}`);
    });

    await page.goto(ORIGIN, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(1200);

    /*
     * The site sets `scroll-behavior: smooth`, which animates programmatic
     * scrolls. A stepped scrollTo loop then retargets an in-flight animation
     * on every iteration, so the page never actually reaches most offsets —
     * IntersectionObserver never fires, reveals stay at opacity 0, and the
     * capture comes out full of blank sections that look like a layout bug.
     * Force instant scrolling for the duration of the automated pass. Real
     * users scroll natively and are unaffected.
     */
    await page.addStyleTag({
      content: "html { scroll-behavior: auto !important; }",
    });

    // ── The page must actually scroll to its own bottom ──────────────────
    const scrollCheck = await page.evaluate(async () => {
      const expected =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;
      window.scrollTo({ top: 999999, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 150));
      const reached = Math.round(window.scrollY);
      window.scrollTo({ top: 0, behavior: "instant" });
      return { reached, expected };
    });
    if (scrollCheck.reached < scrollCheck.expected - 8) {
      note(
        vp.name,
        `page does not scroll to the bottom — reached ${scrollCheck.reached}px of ${scrollCheck.expected}px`
      );
    }

    // Scroll the whole page so every lazy image and reveal fires.
    await page.evaluate(async () => {
      const step = window.innerHeight * 0.8;
      for (let y = 0; y < document.documentElement.scrollHeight; y += step) {
        window.scrollTo({ top: y, behavior: "instant" });
        await new Promise((r) => setTimeout(r, 130));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
      await new Promise((r) => setTimeout(r, 400));
    });

    // ── Every reveal must have fired ─────────────────────────────────────
    const stillHidden = await page.evaluate(() =>
      Array.from(document.querySelectorAll("[data-reveal]"))
        .filter((el) => Number(getComputedStyle(el).opacity) < 0.9)
        .map((el) => String(el.className).slice(0, 50) || el.tagName.toLowerCase())
    );
    if (stillHidden.length) {
      note(
        vp.name,
        `${stillHidden.length} section(s) never revealed after a full scroll — content invisible: ${stillHidden.slice(0, 3).join(" / ")}`
      );
    }

    // ── Horizontal overflow ──────────────────────────────────────────────
    const overflow = await page.evaluate(() => {
      const docWidth = document.documentElement.clientWidth;
      if (document.documentElement.scrollWidth <= docWidth + 1) return null;
      // Identify the specific offenders, not just that overflow exists.
      const guilty = [];
      for (const el of document.querySelectorAll("*")) {
        const r = el.getBoundingClientRect();
        if (r.width > 0 && r.right > docWidth + 1) {
          guilty.push(
            `${el.tagName.toLowerCase()}.${String(el.className || "").slice(0, 60)} (right: ${Math.round(r.right)})`
          );
        }
        if (guilty.length >= 5) break;
      }
      return { scrollWidth: document.documentElement.scrollWidth, docWidth, guilty };
    });
    if (overflow) {
      note(
        vp.name,
        `horizontal overflow: ${overflow.scrollWidth}px vs ${overflow.docWidth}px viewport → ${overflow.guilty.join("; ")}`
      );
    }

    // ── Images ───────────────────────────────────────────────────────────
    const images = await page.evaluate(() =>
      Array.from(document.images)
        // Images hidden at this breakpoint are never fetched by design; only
        // audit what the visitor can actually see.
        .filter((img) => img.getBoundingClientRect().width > 0)
        .map((img) => ({
        src: img.currentSrc || img.src,
        ok: img.complete && img.naturalWidth > 0,
        alt: img.getAttribute("alt"),
        sized: Boolean(img.getAttribute("width") && img.getAttribute("height")),
        // An empty alt is the correct markup for a purely decorative image,
        // so only images that are actually exposed to assistive tech need
        // descriptive text.
        decorative: Boolean(
          img.closest("[aria-hidden='true']") ||
            img.getAttribute("role") === "presentation"
        ),
        }))
    );
    for (const img of images) {
      const name = img.src.split("/").slice(-2).join("/");
      if (!img.ok) note(vp.name, `image failed to load: ${name}`);
      if (img.alt === null) note(vp.name, `image has no alt attribute: ${name}`);
      else if (img.alt.trim() === "" && !img.decorative)
        note(vp.name, `non-decorative image has empty alt text: ${name}`);
      if (!img.sized) note(vp.name, `image missing width/height: ${name}`);
    }

    /*
     * ── Text contrast over the live background ─────────────────────────
     *
     * A satellite plate behind the copy means the effective background is no
     * longer a known token — it is whatever the camera is framing, and a
     * bright sandbar drifting under a paragraph is a real regression that no
     * static color audit would catch. Sample the actual rendered pixels
     * behind each text block and compute the true WCAG contrast ratio.
     */
    const contrast = await page.evaluate(async () => {
      const srgb = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };
      const lum = (r, g, b) =>
        0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
      const ratio = (a, b) =>
        (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);

      const parse = (str) => {
        const m = str.match(/rgba?\(([^)]+)\)/);
        if (!m) return null;
        const [r, g, b] = m[1].split(",").map((n) => parseFloat(n));
        return lum(r, g, b);
      };
      void ratio;

      const results = [];
      const targets = document.querySelectorAll(
        "p.lede, p.subhead, .mono-label, h1, h2"
      );

      for (const el of Array.from(targets).slice(0, 24)) {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) continue;
        if (rect.bottom < 0 || rect.top > window.innerHeight) continue;

        const fg = parse(getComputedStyle(el).color);
        if (fg === null) continue;

        results.push({
          text: el.textContent.trim().slice(0, 28),
          fg,
          x: Math.round(rect.left + rect.width / 2),
          y: Math.round(rect.top + rect.height / 2),
        });
      }
      return results;
    });

    if (contrast.length) {
      /*
       * Screenshot with every glyph turned transparent. Sampling a fixed
       * offset below a line of text is unreliable — under a label sits its
       * own value, and you end up measuring cream against cream. Removing
       * only the glyph color leaves panels, borders, and the satellite plate
       * exactly where they are, so the sample point reports the true
       * background behind each text block.
       */
      const mask = await page.addStyleTag({
        content: `*, *::before, *::after {
          color: transparent !important;
          text-shadow: none !important;
          -webkit-text-stroke-color: transparent !important;
        }`,
      });
      const shot = await page.screenshot({ type: "png" });
      await mask.evaluate((node) => node.remove());
      const { default: sharp } = await import("sharp");
      const img = sharp(shot);
      const meta = await img.metadata();
      const scale = meta.width / vp.width;
      const raw = await img.raw().toBuffer();
      const channels = meta.channels;

      const srgb = (c) => {
        const v = c / 255;
        return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
      };

      for (const sample of contrast) {
        // Sample at the text's own centre. With glyphs masked out this is
        // exactly the surface the text renders against.
        const px = Math.round(sample.x * scale);
        const py = Math.round(sample.y * scale);
        let sum = 0;
        let n = 0;
        for (let dy = -6; dy <= 6; dy += 2) {
          for (let dx = -20; dx <= 20; dx += 2) {
            const X = px + dx;
            const Y = py + dy;
            if (X < 0 || Y < 0 || X >= meta.width || Y >= meta.height) continue;
            const i = (Y * meta.width + X) * channels;
            sum +=
              0.2126 * srgb(raw[i]) +
              0.7152 * srgb(raw[i + 1]) +
              0.0722 * srgb(raw[i + 2]);
            n++;
          }
        }
        if (!n) continue;
        const bg = sum / n;
        const cr =
          (Math.max(sample.fg, bg) + 0.05) / (Math.min(sample.fg, bg) + 0.05);
        if (cr < 4.5) {
          note(
            vp.name,
            `text contrast ${cr.toFixed(2)}:1 (needs 4.5) — "${sample.text}"`
          );
        }
      }
    }

    // ── Form labelling ───────────────────────────────────────────────────
    const unlabeled = await page.evaluate(() =>
      Array.from(document.querySelectorAll("input, select, textarea"))
        .filter((el) => el.type !== "hidden")
        .filter((el) => {
          if (el.getAttribute("aria-label")) return false;
          if (el.closest("[aria-hidden='true']")) return false;
          if (el.id && document.querySelector(`label[for="${el.id}"]`)) return false;
          return !el.closest("label");
        })
        .map((el) => `${el.tagName.toLowerCase()}[name=${el.name || "?"}]`)
    );
    unlabeled.forEach((f) => note(vp.name, `form control without a label: ${f}`));

    // ── Tap targets (mobile only) ────────────────────────────────────────
    if (vp.name === "mobile") {
      const small = await page.evaluate(() =>
        Array.from(document.querySelectorAll("a, button"))
          .filter((el) => {
            const r = el.getBoundingClientRect();
            if (r.width === 0 || r.height === 0 || r.height >= 32) return false;

            /*
             * Links sitting inline inside a sentence are exempt from the
             * WCAG 2.5.8 target-size rule, and padding them out would break
             * the line box they live in. Detect them by asking whether the
             * parent holds prose of its own beyond the link's text.
             */
            const parent = el.parentElement;
            if (!parent) return true;
            const parentText = parent.textContent.trim();
            const ownText = el.textContent.trim();
            const isInlineInProse =
              getComputedStyle(el).display.startsWith("inline") &&
              parentText.length > ownText.length + 2;
            return !isInlineInProse;
          })
          .map((el) => `${el.tagName.toLowerCase()}: ${el.textContent.trim().slice(0, 32)}`)
          .slice(0, 8)
      );
      small.forEach((t) => note(vp.name, `tap target under 32px tall — ${t}`));
    }

    consoleErrors.forEach((e) => note(vp.name, `console error: ${e.slice(0, 140)}`));
    requestFailures.forEach((f) => note(vp.name, `request failed: ${f}`));

    await page.screenshot({
      path: path.join(OUT, `${vp.name}.png`),
      fullPage: vp.name !== "wide",
    });
    await context.close();
  }

  // ── Reduced motion: content must be visible without animation ──────────
  const rmContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce",
  });
  const rmPage = await rmContext.newPage();
  await routeThroughCurl(rmPage);
  await rmPage.goto(ORIGIN, { waitUntil: "networkidle" });
  await rmPage.waitForTimeout(900);
  const hidden = await rmPage.evaluate(
    () =>
      Array.from(document.querySelectorAll("[data-reveal], [data-reveal-item]")).filter(
        (el) => Number(getComputedStyle(el).opacity) < 0.9
      ).length
  );
  if (hidden > 0) {
    note("reduced-motion", `${hidden} reveal element(s) still transparent — content hidden`);
  }
  await rmPage.screenshot({ path: path.join(OUT, "reduced-motion.png"), fullPage: true });
  await rmContext.close();

  await browser.close();

  const report = problems.length
    ? problems.map((p) => `  ✗ ${p}`).join("\n")
    : "  ✓ no problems found";
  console.log(`\nVerification — ${ORIGIN}\n${report}\n\nScreenshots: ${OUT}`);
  await writeFile(path.join(OUT, "report.txt"), problems.join("\n") + "\n");

  if (problems.length) process.exitCode = 1;
}

main();
